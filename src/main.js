import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import twemojiPlugin from './plugins/twemoji'
import './assets/main.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(twemojiPlugin)
app.mount('#app')
