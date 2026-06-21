import { createDocumentResource } from 'frappe-ui'
import { reactive, ref } from 'vue'

const settings = ref({})
const brand = reactive({})

function setupBrand() {
  brand.name = settings.value?.brand_name
  brand.logo = settings.value?.brand_logo
  brand.favicon = settings.value?.favicon
  brand.docsUrl = settings.value?.brand_docs_url || settings.value?.brand_website || ''
}

const _settings = createDocumentResource({
  doctype: 'FCRM Settings',
  name: 'FCRM Settings',
  // Do NOT auto-fetch at module eval: this module can land in the boot chunk and
  // fire before frappe-ui's API base / session is configured, which returns the
  // SPA HTML (not JSON) and leaves the brand blank. We fetch lazily instead.
  auto: false,
  onSuccess: (data) => {
    settings.value = data
    setupBrand()
    return data
  },
})

let _started = false

export function getSettings() {
  // First call happens at component setup() — i.e. post-config — so the fetch
  // uses the correct API base and an authenticated session.
  if (!_started) {
    _started = true
    _settings.reload()
  }
  return {
    _settings,
    settings,
    brand,
    setupBrand,
  }
}
