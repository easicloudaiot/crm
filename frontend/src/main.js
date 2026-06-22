import './index.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createDialog } from './utils/dialogs'
import { initSocket } from './socket'
import router from './router'
import translationPlugin from './translation'
import App from './App.vue'
import { showWelcomeWizard } from '@/composables/modals'

import {
  FrappeUI,
  Button,
  Input,
  TextInput,
  FormControl,
  ErrorMessage,
  Dialog,
  Alert,
  Badge,
  setConfig,
  frappeRequest,
  FeatherIcon,
} from 'frappe-ui'

import { telemetryPlugin } from 'frappe-ui/frappe'

// --- Per-tenant brand accent (Tier A) ---
// Custom Branding sets crm_brand_color (a per-site default) -> boot -> window.sysdefaults.
// Remap frappe-ui's accent (blue) family at runtime; blank -> frappe-ui default. No rebuild.
function _shade(hex, pct) {
  const m = /^#?([0-9a-f]{6})$/i.exec((hex || '').trim())
  if (!m) return hex
  const n = parseInt(m[1], 16)
  let r = (n >> 16) & 255,
    g = (n >> 8) & 255,
    b = n & 255
  const t = pct < 0 ? 0 : 255,
    f = Math.min(Math.abs(pct), 100) / 100
  r = Math.round((t - r) * f + r)
  g = Math.round((t - g) * f + g)
  b = Math.round((t - b) * f + b)
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
}
function applyBrandTheme() {
  const sd = window.sysdefaults || {}
  const primary = sd.crm_brand_color
  if (!primary) return // blank -> frappe-ui default blue
  const hover = sd.crm_brand_color_hover || _shade(primary, -10)
  const s = document.documentElement.style
  s.setProperty('--blue-500', primary)
  s.setProperty('--blue-600', _shade(primary, -8))
  s.setProperty('--blue-700', _shade(primary, -16))
  s.setProperty('--surface-blue-2', _shade(primary, 88))
  s.setProperty('--surface-blue-3', hover)
  s.setProperty('--ink-blue-2', primary)
  s.setProperty('--ink-blue-3', _shade(primary, -10))
  s.setProperty('--outline-blue-1', _shade(primary, 70))
}
applyBrandTheme() // prod: window.sysdefaults is set by the inline boot before this module

let globalComponents = {
  Button,
  TextInput,
  Input,
  FormControl,
  ErrorMessage,
  Dialog,
  Alert,
  Badge,
  FeatherIcon,
}

// create a pinia instance
let pinia = createPinia()

let app = createApp(App)

setConfig('resourceFetcher', frappeRequest)
app.use(FrappeUI)
app.use(pinia)
app.use(router)
app.use(translationPlugin)
for (let key in globalComponents) {
  app.component(key, globalComponents[key])
}
app.use(telemetryPlugin, { app_name: 'crm' })

app.config.globalProperties.$dialog = createDialog

// Invited users land here from the accept link with ?setup-password=1. The link
// is single-use, so prompt them to set a password right away (router drops the
// query on its '/' redirect, so read it from the URL before mount, then strip it).
if (new URLSearchParams(window.location.search).has('setup-password')) {
  showWelcomeWizard.value = true
  const _u = new URL(window.location.href)
  _u.searchParams.delete('setup-password')
  window.history.replaceState({}, '', _u)
}

let socket
if (import.meta.env.DEV) {
  frappeRequest({ url: '/api/method/crm.www.crm.get_context_for_dev' }).then(
    (values) => {
      for (let key in values) {
        window[key] = values[key]
      }
      applyBrandTheme()
      socket = initSocket()
      app.config.globalProperties.$socket = socket
      app.mount('#app')
    },
  )
} else {
  socket = initSocket()
  app.config.globalProperties.$socket = socket
  app.mount('#app')
}

if (import.meta.env.DEV) {
  window.$dialog = createDialog
}
