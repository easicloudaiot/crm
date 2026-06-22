<template>
  <Dialog v-model="show" :options="{ title: __('Enroll in Cadence'), size: 'sm' }">
    <template #body-content>
      <div class="flex flex-col gap-3">
        <p class="text-p-sm text-ink-gray-6">
          {{ __('Enroll {0} lead(s) into a cadence. Each email sends from the lead\'s owner.', [docs.length]) }}
        </p>
        <FormControl
          type="select"
          :label="__('Cadence')"
          v-model="cadence"
          :options="cadenceOptions"
          :placeholder="__('Select a cadence')"
        />
      </div>
    </template>
    <template #actions>
      <Button
        variant="solid"
        :label="__('Enroll')"
        :loading="enrolling"
        :disabled="!cadence"
        @click="doEnroll"
      />
    </template>
  </Dialog>
</template>

<script setup>
import { Dialog, Button, FormControl, call, toast, createResource } from 'frappe-ui'
import { ref, computed } from 'vue'

const props = defineProps({
  docs: { type: Array, default: () => [] },
})
const show = defineModel()
const emit = defineEmits(['reload'])

const cadence = ref('')
const enrolling = ref(false)

const cadences = createResource({
  url: 'easicloud_crm.cadence.get_active_cadences',
  makeParams: () => (props.docs.length === 1 ? { lead: props.docs[0] } : {}),
  auto: true,
})

const cadenceOptions = computed(() =>
  (cadences.data || []).map((c) => ({ label: c.title || c.name, value: c.name })),
)

function doEnroll() {
  if (!cadence.value) return
  enrolling.value = true
  call('easicloud_crm.cadence.enroll', {
    leads: JSON.stringify(props.docs),
    cadence: cadence.value,
  })
    .then((res) => {
      const rows = res || []
      const enrolled = rows.filter((r) => r.result === 'enrolled').length
      const skipped = rows.length - enrolled
      toast.success(
        __('Enrolled {0} lead(s)', [enrolled]) +
          (skipped ? __(' — {0} skipped', [skipped]) : ''),
      )
      show.value = false
      emit('reload')
    })
    .catch((e) => {
      toast.error(e.messages?.[0] || __('Could not enroll'))
    })
    .finally(() => {
      enrolling.value = false
    })
}
</script>
