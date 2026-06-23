<template>
  <LayoutHeader>
    <template #left-header>
      <ViewBreadcrumbs v-model="viewControls" routeName="Followups" />
    </template>
  </LayoutHeader>
  <ViewControls
    ref="viewControls"
    v-model="enrollments"
    v-model:loadMore="loadMore"
    v-model:resizeColumn="triggerResize"
    v-model:updatedPageCount="updatedPageCount"
    doctype="CRM Cadence Enrollment"
    :filters="{ status: 'Active' }"
    :options="{ allowedViews: ['list', 'group_by'] }"
  />
  <EnrollmentsListView
    v-if="enrollments.data && rows.length"
    ref="enrollmentsListView"
    v-model="enrollments.data.page_length_count"
    v-model:list="enrollments"
    :rows="rows"
    :columns="columns"
    :options="{
      selectable: true,
      showTooltip: false,
      resizeColumn: true,
      rowCount: enrollments.data.row_count,
      totalCount: enrollments.data.total_count,
    }"
    @loadMore="() => loadMore++"
    @columnWidthUpdated="() => triggerResize++"
    @updatePageCount="(count) => (updatedPageCount = count)"
    @applyFilter="(data) => viewControls.applyFilter(data)"
    @selectionsChanged="
      (selections) => viewControls.updateSelections(selections)
    "
  />
  <EmptyState
    v-else-if="enrollments.data && !rows.length"
    name="Followups"
    :icon="LucideCalendarClock"
  />
</template>

<script setup>
import ViewBreadcrumbs from '@/components/ViewBreadcrumbs.vue'
import LayoutHeader from '@/components/LayoutHeader.vue'
import EnrollmentsListView from '@/components/ListViews/EnrollmentsListView.vue'
import EmptyState from '@/components/ListViews/EmptyState.vue'
import ViewControls from '@/components/ViewControls.vue'
import LucideCalendarClock from '~icons/lucide/calendar-clock'
import { formatDate, timeAgo } from '@/utils'
import { ref, computed } from 'vue'

const enrollmentsListView = ref(null)

// enrollment data is loaded in the ViewControls component
const enrollments = ref({})
const loadMore = ref(1)
const triggerResize = ref(1)
const updatedPageCount = ref(20)
const viewControls = ref(null)

function parseRows(list) {
  return list.map((enrollment) => {
    let _rows = {}
    enrollments.value?.data.rows.forEach((row) => {
      _rows[row] = enrollment[row]
      if (['modified', 'creation'].includes(row)) {
        _rows[row] = {
          label: formatDate(enrollment[row]),
          timeAgo: __(timeAgo(enrollment[row])),
        }
      } else if (row === 'next_send_on' && enrollment[row]) {
        _rows[row] = formatDate(enrollment[row], '', true, false)
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
  const d = enrollments.value?.data
  if (!d?.data) return []
  if (d.view_type === 'group_by') {
    if (!d.group_by_field?.fieldname) return []
    return getGroupedByRows(d.data, d.group_by_field)
  }
  if (!['list', 'group_by'].includes(d.view_type)) return []
  return parseRows(d.data)
})

const columns = computed(() => {
  let _columns = enrollments.value?.data?.columns || []
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
