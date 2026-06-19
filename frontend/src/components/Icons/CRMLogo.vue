<template>
  <img
    v-if="brand.logo"
    :class="$attrs.class"
    :style="$attrs.style"
    :src="brand.logo"
    alt="logo"
  />
  <!-- Neutral placeholder shown only when a site hasn't set a brand logo yet.
       White-label: no client-specific mark is hardcoded in the fork. -->
  <svg
    v-else
    :class="$attrs.class"
    :style="$attrs.style"
    viewBox="0 0 24 24"
    fill="none"
    aria-label="logo"
  >
    <rect x="2" y="2" width="20" height="20" rx="5" fill="currentColor" opacity="0.15" />
  </svg>
</template>

<script setup>
import { getSettings } from '@/stores/settings'

const { brand } = getSettings()
</script>
