<template>
  <SettingsLayoutBase
    v-if="user.doc"
    :title="__('Profile')"
    :description="__('Manage your profile & login information.')"
  >
    <template #content>
      <div class="flex items-center justify-between gap-2 pt-1.5 pb-8">
        <FileUploader
          :validateFile="validateIsImageFile"
          @success="(file) => updateImage(file.file_url)"
        >
          <template #default="{ openFileSelector, error: _error, uploading }">
            <div class="flex items-center justify-center gap-2">
              <div class="group relative !size-14">
                <Avatar
                  class="!size-14"
                  :image="user.doc.user_image"
                  :label="fullName"
                />
                <Tooltip
                  :hoverDelay="0"
                  placement="bottom"
                  :text="profileTooltipText"
                >
                  <div
                    class="z-1 absolute top-0 left-0 flex h-9 cursor-pointer items-center justify-center rounded-full !size-14"
                    @click.stop="openFileSelector"
                  />
                  <div
                    v-if="user.doc.user_image"
                    class="z-1 size-4 absolute -top-1 -right-1 flex cursor-pointer items-center justify-center rounded-full bg-surface-white opacity-0 duration-300 ease-in-out group-hover:opacity-100 hover:bg-surface-gray-2 outline outline-black-overlay-50"
                    @click.stop="updateImage()"
                    @mouseenter="isHoveringRemove = true"
                    @mouseleave="isHoveringRemove = false"
                  >
                    <FeatherIcon
                      name="x"
                      class="size-3.5 cursor-pointer text-ink-gray-4"
                    />
                  </div>
                </Tooltip>
                <div
                  v-if="uploading"
                  class="w-full h-full top-0 left-0 absolute bg-black bg-opacity-20 rounded-full flex items-center justify-center"
                >
                  <LoadingIndicator class="size-4" />
                </div>
              </div>
              <div class="flex flex-col gap-1">
                <div class="flex flex-col gap-1">
                  <span
                    class="text-lg sm:text-xl !font-semibold text-ink-gray-8"
                  >
                    {{ fullName || __('Complete your profile below') }}
                  </span>
                  <span class="text-p-sm text-ink-gray-6">
                    {{ user.doc.email }}
                  </span>
                </div>
                <ErrorMessage :message="__(_error)" />
              </div>
            </div>
          </template>
        </FileUploader>
      </div>
      <!-- Details: name parts + job title + phone. Email above stays read-only. -->
      <div class="flex flex-col gap-4 pb-8">
        <div class="grid grid-cols-3 gap-3">
          <FormControl
            v-model="user.doc.first_name"
            :label="__('First Name')"
            :placeholder="__('First Name')"
          />
          <FormControl
            v-model="user.doc.middle_name"
            :label="__('Middle Name')"
            :placeholder="__('Middle Name')"
          />
          <FormControl
            v-model="user.doc.last_name"
            :label="__('Last Name')"
            :placeholder="__('Last Name')"
          />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <FormControl
            v-model="user.doc.crm_job_title"
            :label="__('Job Title')"
            :placeholder="__('e.g. Account Executive')"
          />
          <PhoneInput
            v-model="user.doc.mobile_no"
            :label="__('Phone')"
            @update:valid="phoneValid = $event"
          />
        </div>
        <div v-if="isDirty">
          <Button
            variant="solid"
            :label="__('Save')"
            :disabled="!phoneValid"
            @click="save"
          />
        </div>
      </div>
      <div>
        <div class="text-base font-semibold text-ink-gray-9">
          {{ __('Account Info & Security') }}
        </div>
        <div class="flex items-center justify-between mt-6">
          <div class="flex flex-col gap-1">
            <span class="text-base font-medium text-ink-gray-8">
              {{ __('Emails & Signature') }}
            </span>
            <span class="text-p-sm text-ink-gray-6">
              {{
                __(
                  'Manage your account emails and email signature for communication.',
                )
              }}
            </span>
          </div>
          <Button
            :label="__('Configure')"
            @click="emit('updateStep', 'user-email-settings')"
          />
        </div>
        <div class="flex items-center justify-between mt-6">
          <div class="flex flex-col gap-1">
            <span class="text-base font-medium text-ink-gray-8">
              {{ __('Password') }}
            </span>
            <span class="text-p-sm text-ink-gray-6">
              {{ __('Change your account password for security.') }}
            </span>
          </div>
          <Button
            :label="__('Change Password')"
            @click="showChangePasswordModal = true"
          />
        </div>
      </div>
    </template>
  </SettingsLayoutBase>
  <ChangePasswordModal
    v-if="showChangePasswordModal"
    v-model="showChangePasswordModal"
  />
</template>

<script setup>
import PhoneInput from '@/components/PhoneInput.vue'
import SettingsLayoutBase from '@/components/Layouts/SettingsLayoutBase.vue'
import ChangePasswordModal from '@/components/Modals/ChangePasswordModal.vue'
import { useKeyboardShortcuts } from '@/composables/useKeyboardShortcuts'
import { validateIsImageFile } from '@/utils'
import {
  Avatar,
  FileUploader,
  LoadingIndicator,
  toast,
  Tooltip,
  createDocumentResource,
  useOnboarding,
} from 'frappe-ui'
import { ref, computed, inject } from 'vue'

const emit = defineEmits(['updateStep'])

const { user: sessionUser } = inject('session')
const user = createDocumentResource({ doctype: 'User', name: sessionUser })
const { updateOnboardingStep } = useOnboarding('frappecrm')

const showChangePasswordModal = ref(false)
const phoneValid = ref(true)
const isHoveringRemove = ref(false)

const profileTooltipText = computed(() => {
  if (isHoveringRemove.value) return __('Remove Photo')
  return user.doc.user_image ? __('Change Photo') : __('Upload Photo')
})

const fullName = computed(() =>
  [user.doc.first_name, user.doc.middle_name, user.doc.last_name]
    .filter(Boolean)
    .join(' '),
)

const isDirty = computed(() => {
  return JSON.stringify(user.doc) !== JSON.stringify(user.originalDoc)
})

function isValidPhone(p) {
  if (!p) return true
  return /^[+]?[\d\s().-]{7,20}$/.test(p)
}

function save() {
  if (!isDirty.value) {
    return
  }
  if (!isValidPhone(user.doc.mobile_no)) {
    toast.error(__('Please enter a valid phone number'))
    return
  }

  user.save.submit(null, {
    onSuccess: () => {
      toast.success(__('Profile Updated Successfully'))
      const d = user.doc
      if (d.first_name && d.last_name && d.crm_job_title && d.mobile_no) {
        updateOnboardingStep('complete_your_profile')
      }
    },
    onError: (err) => {
      toast.error(err.message + ': ' + err.messages[0])
    },
  })
}

function updateImage(fileUrl = '') {
  isHoveringRemove.value = false
  user.doc.user_image = fileUrl
  save()
}

useKeyboardShortcuts({
  ignoreTyping: false,
  shortcuts: [
    {
      match: (e) => (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's',
      action: () => {
        if (isDirty.value) {
          save()
        }
      },
    },
  ],
})
</script>
