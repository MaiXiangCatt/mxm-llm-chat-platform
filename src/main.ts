import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistate from 'pinia-plugin-persistedstate'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from './App.vue'
import './theme/main.scss'

const app = createApp(App)
const pinia = createPinia()
pinia.use(piniaPluginPersistate)

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(pinia)
app.mount('#app')
