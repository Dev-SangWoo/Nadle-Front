import twemoji from 'twemoji'

const TWEMOJI_OPTIONS = {
  folder: 'svg',
  ext: '.svg',
  base: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/',
  className: 'twemoji',
}

function parseEl(el) {
  if (!el || el.nodeType !== 1) return
  twemoji.parse(el, TWEMOJI_OPTIONS)
}

export default {
  install(app) {
    // 마운트 후 전체 문서에 한 번 적용
    app.mixin({
      mounted() {
        // 루트 컴포넌트에서만 MutationObserver 등록
        if (this.$.type === app._component) {
          const root = document.getElementById('app') ?? document.body
          parseEl(root)

          const observer = new MutationObserver((mutations) => {
            for (const m of mutations) {
              for (const node of m.addedNodes) {
                if (node.nodeType === 1) parseEl(node)
              }
              // 텍스트 노드가 직접 바뀌는 경우 부모를 다시 파싱
              if (m.type === 'characterData' && m.target.parentElement) {
                parseEl(m.target.parentElement)
              }
            }
          })

          observer.observe(root, {
            childList: true,
            subtree: true,
            characterData: true,
          })

          // 앱 언마운트 시 옵저버 해제
          app.unmount = ((origUnmount) => () => {
            observer.disconnect()
            origUnmount?.()
          })(app.unmount)
        }
      },
      updated() {
        if (this.$el && this.$el.nodeType === 1) {
          parseEl(this.$el)
        }
      },
    })
  },
}
