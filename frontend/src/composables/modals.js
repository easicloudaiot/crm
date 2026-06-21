import { ref } from 'vue'

export const showQuickEntryModal = ref(false)
export const quickEntryProps = ref({})

export const showAboutModal = ref(false)

export const showChangePasswordModal = ref(false)

// Pulse onboarding: 2-step welcome wizard (password -> profile) on first login
export const showWelcomeWizard = ref(false)
