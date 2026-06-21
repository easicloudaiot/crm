import { createDocumentResource } from 'frappe-ui'
import { reactive, ref } from 'vue'

const settings = ref({})
const brand = reactive({})

const _settings = createDocumentResource({
  doctype: 'FCRM Settings',
  name: 'FCRM Settings',
  onSuccess: (data) => {
    settings.value = data
    getSettings().setupBrand()
    return data
  },
})

export function getSettings() {
  function setupBrand() {
    brand.name = settings.value?.brand_name
    brand.logo = settings.value?.brand_logo
    brand.favicon = settings.value?.favicon
    brand.docsUrl = settings.value?.brand_docs_url || settings.value?.brand_website || ''
  }

  return {
    _settings,
    settings,
    brand,
    setupBrand,
  }
}
