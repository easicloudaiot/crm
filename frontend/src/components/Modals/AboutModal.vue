<template>
  <Dialog v-model="show" :options="{ size: 'sm' }">
    <template #body>
      <div class="p-4 pt-5">
        <div class="flex justify-center">
          <div class="flex flex-col items-center">
            <img v-if="about.logo" :src="about.logo" class="mb-3 size-12 object-contain" alt="logo" />
            <h3 class="font-semibold text-xl text-ink-gray-9">{{ about.product || 'CRM' }}</h3>
            <p v-if="about.version" class="text-sm text-ink-gray-6 mt-1">{{ about.version }}</p>
            <p v-if="about.platform" class="text-xs text-ink-gray-5 mt-0.5">
              {{ __('Platform') }} {{ about.platform }}<template v-if="about.build"> · {{ about.build }}</template>
            </p>
          </div>
        </div>
        <hr class="border-t my-3 mx-2" />
        <div>
          <a
            v-for="link in links"
            :key="link.label"
            class="flex py-2 px-2 hover:bg-surface-gray-1 rounded cursor-pointer"
            target="_blank"
            :href="link.url"
          >
            <component
              :is="link.icon"
              v-if="link.icon"
              class="size-4 mr-2 text-ink-gray-7"
            />
            <span class="text-base text-ink-gray-8">{{ link.label }}</span>
          </a>
        </div>
        <hr class="border-t my-3 mx-2" />
        <p v-if="about.copyright" class="text-sm text-ink-gray-6 px-2 mt-2">
          {{ about.copyright }}
        </p>
      </div>
    </template>
  </Dialog>
</template>

<script setup>
// About content + version come from the private easicloud_crm app (easicloud_crm.api.get_about);
// no EASICloud link details or platform info live in this (public fork) file.
import LucideGlobe from '~icons/lucide/globe'
import LucideHeadset from '~icons/lucide/headset'
import LucideBookOpen from '~icons/lucide/book-open'
import { call } from 'frappe-ui'
import { ref, computed, watch } from 'vue'

let show = defineModel({ type: Boolean })
const about = ref({})

async function loadAbout() {
  if (Object.keys(about.value).length) return
  try {
    about.value = await call('easicloud_crm.api.get_about')
  } catch (e) {
    about.value = {}
  }
}

watch(show, (visible) => { if (visible) loadAbout() }, { immediate: true })

const links = computed(() => {
  const a = about.value
  const out = []
  if (a.website) out.push({ label: __('Website'), url: a.website, icon: LucideGlobe })
  if (a.docs_url) out.push({ label: __('Documentation'), url: a.docs_url, icon: LucideBookOpen })
  if (a.support_email)
    out.push({ label: __('Contact Support'), url: 'mailto:' + a.support_email, icon: LucideHeadset })
  return out
})
</script>
