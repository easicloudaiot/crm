<template>
  <Dialog v-model="show" :options="{ title: __('Next Cadence Email'), size: 'xl' }">
    <template #body-content>
      <div v-if="preview.loading" class="text-p-sm text-ink-gray-5">
        {{ __('Rendering…') }}
      </div>
      <div v-else-if="d && d.enrolled === false" class="text-p-sm text-ink-gray-6">
        {{ __('This lead is not in an active cadence.') }}
      </div>
      <div v-else-if="d && d.done" class="text-p-sm text-ink-gray-6">
        {{ __('The cadence has completed — no more emails queued.') }}
      </div>
      <div v-else-if="d && d.no_email" class="text-p-sm text-ink-gray-6">
        {{ __('The next step is not an email.') }}
      </div>
      <div v-else-if="d && d.subject" class="flex flex-col gap-3">
        <div class="text-p-sm text-ink-gray-6">
          {{ __('Sends {0} on {1}, from {2}', [d.template, d.send_on, d.sender]) }}
        </div>
        <div class="rounded-md border border-outline-gray-2 p-4 bg-surface-white">
          <div class="font-semibold text-ink-gray-9 mb-3 pb-2 border-b border-outline-gray-1">
            {{ d.subject }}
          </div>
          <div class="prose prose-sm max-w-none text-ink-gray-8" v-html="d.message" />
        </div>
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import { Dialog, createResource } from 'frappe-ui'
import { computed } from 'vue'

const props = defineProps({ lead: { type: String, default: '' } })
const show = defineModel()

// the modal is v-if-mounted when opened, so auto-fetch on mount (a watch on
// `show` never fires because show is already true at mount).
const preview = createResource({
  url: 'easicloud_crm.cadence.preview_next_email',
  makeParams: () => ({ lead: props.lead }),
  auto: true,
})
const d = computed(() => preview.data)
</script>
