<template>
  <Dialog
    v-model="show"
    :options="{ title: __('Welcome to {0}', [brand.name || 'CRM']) }"
  >
    <template #body-content>
      <!-- Stepper -->
      <div class="flex items-center mb-6">
        <template v-for="(s, i) in steps" :key="s.key">
          <div class="flex items-center gap-2">
            <div
              class="flex items-center justify-center h-6 w-6 rounded-full text-xs font-medium"
              :class="
                step >= i + 1
                  ? 'bg-surface-gray-7 text-ink-white'
                  : 'bg-surface-gray-3 text-ink-gray-5'
              "
            >
              <span v-if="step > i + 1">&#10003;</span>
              <span v-else>{{ i + 1 }}</span>
            </div>
            <span
              class="text-sm font-medium"
              :class="step === i + 1 ? 'text-ink-gray-8' : 'text-ink-gray-5'"
            >
              {{ s.label }}
            </span>
          </div>
          <div
            v-if="i < steps.length - 1"
            class="flex-1 h-px mx-3"
            :class="step > i + 1 ? 'bg-surface-gray-7' : 'bg-surface-gray-3'"
          />
        </template>
      </div>

      <!-- Step 1: Password -->
      <div v-if="step === 1" class="flex flex-col gap-4">
        <p class="text-p-sm text-ink-gray-6">
          {{ __('Set a password to secure your account.') }}
        </p>
        <Password
          v-model="newPassword"
          :placeholder="__('New Password')"
          maxLength="50"
        >
          <template #prefix>
            <LockKeyhole class="size-4 text-ink-gray-4" />
          </template>
        </Password>
        <Password
          v-model="confirmPassword"
          :placeholder="__('Confirm Password')"
          maxLength="50"
        >
          <template #prefix>
            <LockKeyhole class="size-4 text-ink-gray-4" />
          </template>
        </Password>
        <p
          v-if="passwordMessage"
          class="text-sm"
          :class="
            passwordMessage === __('Passwords match')
              ? 'text-ink-green-3'
              : 'text-ink-red-3'
          "
        >
          {{ passwordMessage }}
        </p>
      </div>

      <!-- Step 2: Profile -->
      <div v-if="step === 2" class="flex flex-col gap-4">
        <p class="text-p-sm text-ink-gray-6">
          {{ __('Tell us a bit about you — this appears on your emails and records.') }}
        </p>
        <div class="grid grid-cols-3 gap-3">
          <FormControl
            v-model="firstName"
            :label="__('First Name')"
            :placeholder="__('First Name')"
          />
          <FormControl
            v-model="middleName"
            :label="__('Middle Name')"
            :placeholder="__('Middle Name')"
          />
          <FormControl
            v-model="lastName"
            :label="__('Last Name')"
            :placeholder="__('Last Name')"
          />
        </div>
        <FormControl
          v-model="jobTitle"
          :label="__('Job Title')"
          :placeholder="__('e.g. Account Executive')"
        />
        <PhoneInput
          v-model="phone"
          :label="__('Phone')"
          @update:valid="phoneValid = $event"
        />
      </div>
    </template>

    <template #actions>
      <div class="flex justify-end gap-2">
        <Button
          v-if="step === 1"
          variant="solid"
          :label="__('Next')"
          :disabled="!canNext"
          :loading="setPassword.loading"
          @click="goNext()"
        />
        <Button
          v-if="step === 2"
          variant="solid"
          :label="__('Finish')"
          :disabled="!firstName || !phoneValid"
          :loading="saveProfile.loading"
          @click="finish()"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import LockKeyhole from '~icons/lucide/lock-keyhole'
import {
  Dialog,
  Button,
  FormControl,
  Password,
  createResource,
  toast,
} from 'frappe-ui'
import PhoneInput from '@/components/PhoneInput.vue'
import { getSettings } from '@/stores/settings'
import { ref, computed, watch } from 'vue'

const { brand } = getSettings()
const show = defineModel({ type: Boolean })

const step = ref(1)
const steps = [
  { key: 'password', label: __('Password') },
  { key: 'profile', label: __('Your Profile') },
]

const newPassword = ref('')
const confirmPassword = ref('')
const passwordMessage = ref('')

const firstName = ref('')
const middleName = ref('')
const lastName = ref('')
const jobTitle = ref('')
const phone = ref('')
const phoneValid = ref(true)

function isStrongPassword(p) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d\s]).{8,}$/.test(p)
}

const canNext = computed(
  () =>
    !!newPassword.value &&
    !!confirmPassword.value &&
    newPassword.value === confirmPassword.value &&
    isStrongPassword(newPassword.value),
)

watch([newPassword, confirmPassword], () => {
  passwordMessage.value = ''
  if (newPassword.value && newPassword.value.length < 8) {
    passwordMessage.value = __('Password must be at least 8 characters')
  } else if (newPassword.value && !isStrongPassword(newPassword.value)) {
    passwordMessage.value = __(
      'Password must contain lowercase, uppercase, number, and symbol',
    )
  } else if (confirmPassword.value && newPassword.value !== confirmPassword.value) {
    passwordMessage.value = __('Passwords do not match')
  } else if (newPassword.value && newPassword.value === confirmPassword.value) {
    passwordMessage.value = __('Passwords match')
  }
})

const setPassword = createResource({
  url: 'crm.api.user.set_initial_password',
  makeParams: () => ({ new_password: newPassword.value }),
  onSuccess: () => {
    step.value = 2
  },
  onError: (err) =>
    toast.error(err.messages?.[0] || __('Could not set password')),
})

const saveProfile = createResource({
  url: 'crm.api.user.set_initial_profile',
  makeParams: () => ({
    first_name: firstName.value,
    middle_name: middleName.value,
    last_name: lastName.value,
    mobile_no: phone.value,
    job_title: jobTitle.value,
  }),
  onSuccess: () => {
    toast.success(__('Welcome aboard!'))
    show.value = false
    // reload so the new name shows in the sidebar / on records right away
    window.location.reload()
  },
  onError: (err) =>
    toast.error(err.messages?.[0] || __('Could not save profile')),
})

function goNext() {
  if (canNext.value) setPassword.submit()
}
function isValidPhone(p) {
  return !p || /^[+]?[\d\s().-]{7,20}$/.test(p)
}

function finish() {
  if (!firstName.value) return
  if (!isValidPhone(phone.value)) {
    toast.error(__('Please enter a valid phone number'))
    return
  }
  saveProfile.submit()
}
</script>
