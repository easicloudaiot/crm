<template>
  <LayoutHeader>
    <template #left-header>
      <ViewBreadcrumbs v-model="viewControls" routeName="EmailTemplates" />
    </template>
  </LayoutHeader>
  <ViewControls
    ref="viewControls"
    v-model="templates"
    v-model:loadMore="loadMore"
    v-model:resizeColumn="triggerResize"
    v-model:updatedPageCount="updatedPageCount"
    doctype="Email Template"
    :options="{ allowedViews: ['list', 'group_by'] }"
  />
  <EmailTemplatesListView
    v-if="templates.data && rows.length"
    ref="templatesListView"
    v-model="templates.data.page_length_count"
    v-model:list="templates"
    :rows="rows"
    :columns="columns"
    :options="{
      showTooltip: false,
      resizeColumn: true,
      rowCount: templates.data.row_count,
      totalCount: templates.data.total_count,
    }"
    @loadMore="() => loadMore++"
    @columnWidthUpdated="() => triggerResize++"
    @updatePageCount="(count) => (updatedPageCount = count)"
    @applyFilter="(data) => viewControls.applyFilter(data)"
  />
  <EmptyState
    v-else-if="templates.data && !rows.length"
    name="Email Templates"
    :icon="LucideMailCheck"
  />
</template>

<script setup>
import ViewBreadcrumbs from '@/components/ViewBreadcrumbs.vue'
import LayoutHeader from '@/components/LayoutHeader.vue'
import EmailTemplatesListView from '@/components/ListViews/EmailTemplatesListView.vue'
import EmptyState from '@/components/ListViews/EmptyState.vue'
import ViewControls from '@/components/ViewControls.vue'
import LucideMailCheck from '~icons/lucide/mail-check'
import { formatDate, timeAgo } from '@/utils'
import { ref, computed } from 'vue'

const templatesListView = ref(null)

// templates data is loaded in the ViewControls component
const templates = ref({})
const loadMore = ref(1)
const triggerResize = ref(1)
const updatedPageCount = ref(20)
const viewControls = ref(null)

function parseRows(list) {
  return list.map((template) => {
    let _rows = {}
    templates.value?.data.rows.forEach((row) => {
      _rows[row] = template[row]
      if (['modified', 'creation'].includes(row)) {
        _rows[row] = {
          label: formatDate(template[row]),
          timeAgo: __(timeAgo(template[row])),
        }
      }
    })
    return _rows
  })
}

function getGroupedByRows(listRows, groupByField) {
  let groupedRows = []
  groupByField.options?.forEach((option) => {
    let filteredRows = option
      ? listRows.filter((row) => row[groupByField.fieldname] == option)
      : listRows.filter((row) => !row[groupByField.fieldname])
    groupedRows.push({
      label: groupByField.label,
      group: option || __(' '),
      collapsed: false,
      rows: parseRows(filteredRows),
    })
  })
  return groupedRows
}

const rows = computed(() => {
  const d = templates.value?.data
  if (!d?.data) return []
  if (d.view_type === 'group_by') {
    if (!d.group_by_field?.fieldname) return []
    return getGroupedByRows(d.data, d.group_by_field)
  }
  if (!['list', 'group_by'].includes(d.view_type)) return []
  return parseRows(d.data)
})

const columns = computed(() => {
  let _columns = templates.value?.data?.columns || []
  if (_columns.length) {
    _columns = _columns.map((col, index) => {
      if (index === _columns.length - 1) {
        return { ...col, align: 'right' }
      }
      return col
    })
  }
  return _columns
})
</script>
