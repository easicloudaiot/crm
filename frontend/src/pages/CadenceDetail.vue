<template>
  <LayoutHeader>
    <template #left-header>
      <Breadcrumbs
        :items="[
          { label: __('Cadences'), route: { name: 'Cadences' } },
          { label: detail.data?.title || cadenceId },
        ]"
      />
    </template>
  </LayoutHeader>
  <div class="flex flex-col gap-4 overflow-y-auto p-6">
    <div v-if="detail.loading" class="text-base text-ink-gray-5">
      {{ __('Loading…') }}
    </div>
    <ErrorMessage v-else-if="detail.error" :message="__('Cadence not available')" />
    <div v-else-if="detail.data" class="flex flex-col gap-4">
      <div class="flex flex-wrap items-center gap-2 text-p-sm text-ink-gray-6">
        <Badge
          v-if="detail.data.status"
          variant="subtle"
          :theme="statusTheme(detail.data.status)"
          :label="__(detail.data.status)"
        />
        <span>{{ __('Solution') }}: <b>{{ detail.data.solution || __('Any') }}</b></span>
        <span>· {{ __('Sends ~') }}<b>{{ hourLabel(detail.data.send_hour) }}</b></span>
        <span>· {{ detail.data.stop_on_reply ? __('Stops on reply') : __('No reply-stop') }}</span>
      </div>
      <div class="overflow-hidden rounded-lg border border-outline-gray-2">
        <table class="w-full text-base">
          <thead class="bg-surface-gray-2 text-left text-ink-gray-6">
            <tr>
              <th class="px-3 py-2 font-medium">#</th>
              <th class="px-3 py-2 font-medium">{{ __('Email') }}</th>
              <th class="px-3 py-2 font-medium">{{ __('Subject') }}</th>
              <th class="px-3 py-2 font-medium">{{ __('Wait (days)') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(s, i) in detail.data.steps"
              :key="i"
              class="border-t border-outline-gray-1"
            >
              <td class="px-3 py-2 text-ink-gray-7">{{ i + 1 }}</td>
              <td class="px-3 py-2 text-ink-gray-7">
                {{ s.email_template || s.step_label || s.step_type }}
              </td>
              <td class="px-3 py-2 text-ink-gray-8">{{ s.subject || '—' }}</td>
              <td class="px-3 py-2 text-ink-gray-7">{{ s.wait_days }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import LayoutHeader from '@/components/LayoutHeader.vue'
import { Badge, Breadcrumbs, ErrorMessage, createResource } from 'frappe-ui'

const props = defineProps({
  cadenceId: { type: String, required: true },
})

const detail = createResource({
  url: 'easicloud_crm.cadence.get_cadence_detail',
  params: { cadence: props.cadenceId },
  auto: true,
})

function hourLabel(h) {
  const n = h === undefined || h === null || h === '' ? 12 : h
  return String(n).padStart(2, '0') + ':00'
}

function statusTheme(status) {
  return (
    {
      Published: 'green',
      'Pending Approval': 'orange',
      Draft: 'gray',
      Archived: 'red',
    }[status] || 'gray'
  )
}
</script>
