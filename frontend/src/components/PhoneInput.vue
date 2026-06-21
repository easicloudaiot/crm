<template>
  <div class="flex flex-col gap-1.5">
    <label v-if="label" class="block text-xs text-ink-gray-5">{{ label }}</label>
    <div class="flex gap-2">
      <FormControl
        type="select"
        class="w-28 shrink-0"
        :options="countryOptions"
        :modelValue="countryCode"
        @update:modelValue="onCountryChange"
      />
      <FormControl
        type="text"
        class="flex-1"
        :placeholder="placeholder || __('Phone number')"
        :modelValue="local"
        @update:modelValue="onLocalInput"
        @blur="formatLocal"
      />
    </div>
    <p v-if="errorMsg" class="text-sm text-ink-red-3">{{ errorMsg }}</p>
  </div>
</template>

<script setup>
import { FormControl } from 'frappe-ui'
import { ref, computed, watch, onMounted, nextTick } from 'vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
  label: { type: String, default: '' },
  placeholder: { type: String, default: '' },
})
const emit = defineEmits(['update:modelValue', 'update:valid'])

const COUNTRIES = [
  { code: '+1', label: '+1 · US/CA' },
  { code: '+44', label: '+44 · UK' },
  { code: '+61', label: '+61 · AU' },
  { code: '+33', label: '+33 · FR' },
  { code: '+49', label: '+49 · DE' },
  { code: '+91', label: '+91 · IN' },
]
const countryOptions = COUNTRIES.map((c) => ({ label: c.label, value: c.code }))

const countryCode = ref('+1')
const local = ref('')

function digitsOf(s) {
  return (s || '').replace(/\D/g, '')
}
function formatNA(d) {
  d = d.slice(0, 10)
  if (d.length <= 3) return d
  if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`
}

const isValid = computed(() => {
  const d = digitsOf(local.value)
  if (!d) return true // optional
  if (countryCode.value === '+1') return d.length === 10
  return d.length >= 6 && d.length <= 14
})

const errorMsg = computed(() => {
  const d = digitsOf(local.value)
  if (!d) return ''
  if (countryCode.value === '+1' && d.length !== 10)
    return __('Enter a 10-digit number, e.g. (416) 902-5678')
  if (countryCode.value !== '+1' && (d.length < 6 || d.length > 14))
    return __('Enter a valid phone number')
  return ''
})

function combined() {
  const d = digitsOf(local.value)
  if (!d) return ''
  return `${countryCode.value} ${local.value}`.trim()
}

let internalUpdate = false
function emitAll() {
  internalUpdate = true
  emit('update:modelValue', combined())
  emit('update:valid', isValid.value)
  nextTick(() => {
    internalUpdate = false
  })
}

function onLocalInput(val) {
  local.value = val
  emitAll()
}
function formatLocal() {
  if (countryCode.value === '+1') local.value = formatNA(digitsOf(local.value))
  emitAll()
}
function onCountryChange(val) {
  countryCode.value = val
  formatLocal()
}

function parse(val) {
  val = (val || '').trim()
  if (!val) {
    countryCode.value = '+1'
    local.value = ''
    return
  }
  const m = COUNTRIES.find((c) => val.startsWith(c.code))
  if (m) {
    countryCode.value = m.code
    local.value = val.slice(m.code.length).trim()
  } else {
    countryCode.value = '+1'
    local.value = val
  }
  if (countryCode.value === '+1') local.value = formatNA(digitsOf(local.value))
}

watch(
  () => props.modelValue,
  (val) => {
    if (internalUpdate) return
    parse(val)
  },
)

onMounted(() => {
  parse(props.modelValue)
  emit('update:valid', isValid.value)
})
</script>
