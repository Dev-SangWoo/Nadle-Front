/**
 * 백엔드 HTTP 클라이언트
 * 베이스 URL: .env 의 VITE_API_BASE_URL (미설정 시 Render 기본값)
 */

const DEFAULT_BASE = 'https://nadle-backend.onrender.com'

function normalizeBase(url) {
  const trimmed = String(url ?? '').trim().replace(/\/+$/, '')
  return trimmed || DEFAULT_BASE
}

/**
 * 개발(DEV): 빈 문자열 → `/api/...` 같은 상대 경로로 요청 → Vite 프록시가 백엔드로 전달 (CORS 회피)
 * 프로덕션: VITE_API_BASE_URL (백엔드에서 실제 배포 도메인 CORS 허용 필요)
 */
function resolveApiBase() {
  if (import.meta.env.DEV) {
    return ''
  }
  return normalizeBase(import.meta.env.VITE_API_BASE_URL)
}

/** 근거 URL. DEV 에서는 '' (상대 경로). */
export const API_BASE_URL = resolveApiBase()

/**
 * @param {string} path '/api/v1/foo' 또는 'api/v1/foo'
 * @returns {string} 절대 URL 또는 동일 출처 상대 경로
 */
export function apiUrl(path) {
  const p = path.startsWith('/') ? path : `/${path}`
  const base = API_BASE_URL
  if (!base) return p
  return `${base}${p}`
}

function shouldStringifyJsonBody(body) {
  return (
    body != null &&
    typeof body === 'object' &&
    !(body instanceof FormData) &&
    !(body instanceof Blob) &&
    !(body instanceof ArrayBuffer)
  )
}

/**
 * fetch 래퍼 — 상대 경로면 API_BASE_URL 을 붙임. 절대 URL(http…)이면 그대로 사용.
 * body 가 일반 객체이면 JSON 직렬화 및 Content-Type 설정.
 *
 * @param {string} pathOrUrl
 * @param {RequestInit & { body?: object }} [init]
 * @returns {Promise<Response>}
 */
export async function apiFetch(pathOrUrl, init = {}) {
  const url = /^https?:\/\//i.test(pathOrUrl) ? pathOrUrl : apiUrl(pathOrUrl)
  const { body, headers: initHeaders, ...rest } = init
  const headers = new Headers(initHeaders || {})

  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json')
  }

  let finalBody = body
  if (shouldStringifyJsonBody(body)) {
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json')
    }
    finalBody = JSON.stringify(body)
  }

  return fetch(url, {
    ...rest,
    headers,
    body: finalBody
  })
}
