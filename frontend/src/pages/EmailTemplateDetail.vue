<template>
  <LayoutHeader>
    <template #left-header>
      <Breadcrumbs
        :items="[
          { label: __('Email Templates'), route: { name: 'EmailTemplates' } },
          { label: preview.data?.name || templateId },
        ]"
      />
    </template>
  </LayoutHeader>
  <div class="flex flex-col gap-4 overflow-y-auto p-6">
    <div v-if="preview.loading" class="text-base text-ink-gray-5">
      {{ __('Loading…') }}
    </div>
    <ErrorMessage
      v-else-if="preview.error"
      :message="__('Template not available')"
    />
    <div v-else-if="preview.data" class="flex flex-col gap-3">
      <div class="flex flex-wrap items-center gap-2 text-p-sm text-ink-gray-6">
        <Badge
          v-if="preview.data.status"
          variant="subtle"
          :theme="statusTheme(preview.data.status)"
          :label="__(preview.data.status)"
        />
        <span v-if="preview.data.solution"
          >{{ __('Solution') }}: <b>{{ preview.data.solution }}</b></span
        >
      </div>
      <div class="text-p-sm text-ink-gray-6">
        {{ __('Subject') }}: <b>{{ preview.data.subject }}</b>
      </div>
      <div
        class="rounded-md border border-outline-gray-2 p-4 text-base text-ink-gray-8"
        v-html="preview.data.body"
      />
      <p class="text-p-sm text-ink-gray-4">
        {{ __('Preview uses sample values; the first name and organization fill in per lead.') }}
      </p>
    </div>
  </div>
</template>

<script setup>
import LayoutHeader from '@/components/LayoutHeader.vue'
import { Badge, Breadcrumbs, ErrorMessage, createResource } from 'frappe-ui'

const props = defineProps({
  templateId: { type: String, required: true },
})

const preview = createResource({
  url: 'easicloud_crm.email_library.get_email_template_preview',
  params: { template: props.templateId },
  auto: true,
})

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
