<template>
  <LayoutHeader>
    <template #left-header>
      <div class="flex items-center gap-2 font-semibold text-ink-gray-9">
        <LucideCalendarClock class="h-4 w-4" />
        {{ __('Follow-ups Due') }}
      </div>
    </template>
  </LayoutHeader>
  <div class="flex flex-col gap-4 overflow-y-auto p-6">
    <p class="text-p-sm text-ink-gray-5">
      {{ __('Cadence follow-ups going out tomorrow. If a lead has already replied, Pause or Remove it so it stops receiving emails.') }}
    </p>
    <div v-if="due.loading" class="text-base text-ink-gray-5">{{ __('Loading…') }}</div>
    <div v-else-if="!due.data || !due.data.length" class="text-base text-ink-gray-5">
      {{ __('Nothing due tomorrow. 🎉') }}
    </div>
    <div v-else class="overflow-hidden rounded-lg border border-outline-gray-2">
      <table class="w-full text-base">
        <thead class="bg-surface-gray-2 text-left text-ink-gray-6">
          <tr>
            <th class="px-4 py-2.5 font-medium">{{ __('Lead') }}</th>
            <th class="px-4 py-2.5 font-medium">{{ __('Organization') }}</th>
            <th class="px-4 py-2.5 font-medium">{{ __('Cadence') }}</th>
            <th class="px-4 py-2.5 font-medium">{{ __('Next Email') }}</th>
            <th class="px-4 py-2.5 text-right font-medium">{{ __('Action') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in due.data" :key="r.lead" class="border-t border-outline-gray-1">
            <td class="px-4 py-2.5 font-medium text-ink-gray-8">
              <router-link :to="{ name: 'Lead', params: { leadId: r.lead } }" class="hover:underline">
                {{ r.lead_name }}
              </router-link>
            </td>
            <td class="px-4 py-2.5 text-ink-gray-7">{{ r.organization || '—' }}</td>
            <td class="px-4 py-2.5 text-ink-gray-7">{{ r.cadence }}</td>
            <td class="px-4 py-2.5 text-ink-gray-7">{{ r.next_email || '—' }}</td>
            <td class="px-4 py-2.5">
              <div class="flex justify-end gap-2">
                <Button :label="__('Pause')" :loading="busy === r.lead" @click="act('pause', r.lead)" />
                <Button :label="__('Remove')" theme="red" :loading="busy === r.lead" @click="act('unenroll', r.lead)" />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import LayoutHeader from '@/components/LayoutHeader.vue'
import LucideCalendarClock from '~icons/lucide/calendar-clock'
import { Button, call, toast, createResource } from 'frappe-ui'
import { ref } from 'vue'

const busy = ref('')
const due = createResource({
  url: 'easicloud_crm.cadence.get_followups_due',
  auto: true,
})
function act(action, lead) {
  busy.value = lead
  call('easicloud_crm.cadence.' + action, { leads: JSON.stringify([lead]) })
    .then(() => {
      toast.success(__('Done'))
      due.reload()
    })
    .catch((e) => toast.error(e.messages?.[0] || __('Action failed')))
    .finally(() => {
      busy.value = ''
    })
}
</script>
