<template>
  <LayoutHeader>
    <template #left-header>
      <div class="flex items-center gap-2 font-semibold text-ink-gray-9">
        <LucideMailCheck class="h-4 w-4" />
        {{ __('Email Templates') }}
      </div>
    </template>
  </LayoutHeader>
  <div class="flex flex-col gap-4 overflow-y-auto p-6">
    <p class="text-p-sm text-ink-gray-5">
      {{ __('Published email templates available for cadences and outreach, grouped by solution. Click a template to preview it. New templates are created by your admin (rep-proposed templates with approval are coming).') }}
    </p>
    <div v-if="templates.loading" class="text-base text-ink-gray-5">{{ __('Loading…') }}</div>
    <div v-else-if="!grouped.length" class="text-base text-ink-gray-5">
      {{ __('No published templates yet.') }}
    </div>
    <div v-else class="flex flex-col gap-5">
      <div v-for="g in grouped" :key="g.solution">
        <div class="mb-2 text-base font-semibold text-ink-gray-8">{{ g.solution }}</div>
        <div class="overflow-hidden rounded-lg border border-outline-gray-2">
          <table class="w-full text-base">
            <tbody>
              <tr
                v-for="t in g.items"
                :key="t.name"
                class="cursor-pointer border-t border-outline-gray-1 first:border-t-0 hover:bg-surface-gray-1"
                @click="openPreview(t.name)"
              >
                <td class="px-4 py-2.5 font-medium text-ink-gray-8">{{ t.name }}</td>
                <td class="px-4 py-2.5 text-ink-gray-7">{{ t.subject }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>

  <Dialog v-model="showPreview" :options="{ title: (preview.data && preview.data.name) || __('Preview'), size: 'lg' }">
    <template #body-content>
      <div v-if="preview.loading" class="text-base text-ink-gray-5">{{ __('Loading…') }}</div>
      <div v-else-if="preview.data" class="flex flex-col gap-3">
        <div class="text-p-sm text-ink-gray-6">{{ __('Subject') }}: <b>{{ preview.data.subject }}</b></div>
        <div class="rounded-md border border-outline-gray-2 p-4 text-base text-ink-gray-8" v-html="preview.data.body" />
        <p class="text-p-sm text-ink-gray-4">
          {{ __('Preview uses sample values; the first name and organization fill in per lead.') }}
        </p>
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import LayoutHeader from '@/components/LayoutHeader.vue'
import LucideMailCheck from '~icons/lucide/mail-check'
import { Dialog, createResource } from 'frappe-ui'
import { ref, computed } from 'vue'

const templates = createResource({
  url: 'easicloud_crm.email_library.get_email_templates',
  auto: true,
})

const grouped = computed(() => {
  const rows = templates.data || []
  const map = {}
  for (const r of rows) {
    const s = r.solution || 'Other'
    ;(map[s] = map[s] || []).push(r)
  }
  return Object.keys(map).map((solution) => ({ solution, items: map[solution] }))
})

const current = ref('')
const showPreview = ref(false)
const preview = createResource({
  url: 'easicloud_crm.email_library.get_email_template_preview',
  makeParams: () => ({ template: current.value }),
})
function openPreview(name) {
  current.value = name
  preview.fetch()
  showPreview.value = true
}
</script>
