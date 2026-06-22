<template>
  <LayoutHeader>
    <template #left-header>
      <div class="flex items-center gap-2 font-semibold text-ink-gray-9">
        <LucideMegaphone class="h-4 w-4" />
        {{ __('Cadences') }}
      </div>
    </template>
  </LayoutHeader>
  <div class="flex flex-col gap-4 overflow-y-auto p-6">
    <p class="text-p-sm text-ink-gray-5">
      {{ __('Published cadences you can enroll leads into — from a lead, or in bulk from the Leads list. Click a cadence to see its steps. New cadences are created by your admin (rep-proposed cadences with approval are coming).') }}
    </p>
    <div v-if="cadences.loading" class="text-base text-ink-gray-5">{{ __('Loading…') }}</div>
    <div v-else-if="!cadences.data || !cadences.data.length" class="text-base text-ink-gray-5">
      {{ __('No published cadences yet.') }}
    </div>
    <div v-else class="overflow-hidden rounded-lg border border-outline-gray-2">
      <table class="w-full text-base">
        <thead class="bg-surface-gray-2 text-left text-ink-gray-6">
          <tr>
            <th class="px-4 py-2.5 font-medium">{{ __('Cadence') }}</th>
            <th class="px-4 py-2.5 font-medium">{{ __('Solution') }}</th>
            <th class="px-4 py-2.5 font-medium">{{ __('Steps') }}</th>
            <th class="px-4 py-2.5 font-medium">{{ __('Enrolled') }}</th>
            <th class="px-4 py-2.5 font-medium">{{ __('Status') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="c in cadences.data"
            :key="c.name"
            class="cursor-pointer border-t border-outline-gray-1 hover:bg-surface-gray-1"
            @click="openDetail(c.name)"
          >
            <td class="px-4 py-2.5 font-medium text-ink-gray-8">{{ c.title || c.name }}</td>
            <td class="px-4 py-2.5 text-ink-gray-7">{{ c.solution || '—' }}</td>
            <td class="px-4 py-2.5 text-ink-gray-7">{{ c.steps }}</td>
            <td class="px-4 py-2.5 text-ink-gray-7">
              {{ c.active_enrollments || 0 }} {{ __('active') }}
              <span
                v-if="(c.total_enrollments || 0) > (c.active_enrollments || 0)"
                class="text-ink-gray-4"
              >· {{ c.total_enrollments }} {{ __('total') }}</span>
            </td>
            <td class="px-4 py-2.5">
              <Badge variant="subtle" theme="green" :label="__('Published')" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <Dialog v-model="showDetail" :options="{ title: detail.data && detail.data.title || __('Cadence'), size: 'lg' }">
    <template #body-content>
      <div v-if="detail.loading" class="text-base text-ink-gray-5">{{ __('Loading…') }}</div>
      <div v-else-if="detail.data" class="flex flex-col gap-3">
        <div class="text-p-sm text-ink-gray-6">
          {{ __('Solution') }}: <b>{{ detail.data.solution || __('Any') }}</b>
          · {{ __('Sends ~') }}<b>{{ hourLabel(detail.data.send_hour) }}</b>
          · {{ detail.data.stop_on_reply ? __('Stops on reply') : __('No reply-stop') }}
        </div>
        <div class="overflow-hidden rounded-md border border-outline-gray-2">
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
              <tr v-for="(s, i) in detail.data.steps" :key="i" class="border-t border-outline-gray-1">
                <td class="px-3 py-2 text-ink-gray-7">{{ i + 1 }}</td>
                <td class="px-3 py-2 text-ink-gray-7">{{ s.email_template || s.step_type }}</td>
                <td class="px-3 py-2 text-ink-gray-8">{{ s.subject || '—' }}</td>
                <td class="px-3 py-2 text-ink-gray-7">{{ s.wait_days }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import LayoutHeader from '@/components/LayoutHeader.vue'
import LucideMegaphone from '~icons/lucide/megaphone'
import { Badge, Dialog, createResource } from 'frappe-ui'
import { ref } from 'vue'

const cadences = createResource({
  url: 'easicloud_crm.cadence.get_published_cadences',
  auto: true,
})

const current = ref('')
const showDetail = ref(false)
const detail = createResource({
  url: 'easicloud_crm.cadence.get_cadence_detail',
  makeParams: () => ({ cadence: current.value }),
})
function hourLabel(h) {
  const n = h === undefined || h === null ? 12 : h
  return String(n).padStart(2, '0') + ':00'
}
function openDetail(name) {
  current.value = name
  detail.fetch()
  showDetail.value = true
}
</script>
