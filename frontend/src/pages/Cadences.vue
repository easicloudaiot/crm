<template>
  <LayoutHeader>
    <template #left-header>
      <ViewBreadcrumbs v-model="viewControls" routeName="Cadences" />
    </template>
  </LayoutHeader>
  <ViewControls
    ref="viewControls"
    v-model="cadences"
    v-model:loadMore="loadMore"
    v-model:resizeColumn="triggerResize"
    v-model:updatedPageCount="updatedPageCount"
    doctype="CRM Cadence"
    :options="{ allowedViews: ['list', 'group_by'] }"
  />
  <CadencesListView
    v-if="cadences.data && rows.length"
    ref="cadencesListView"
    v-model="cadences.data.page_length_count"
    v-model:list="cadences"
    :rows="rows"
    :columns="columns"
    :options="{
      showTooltip: false,
      resizeColumn: true,
      rowCount: cadences.data.row_count,
      totalCount: cadences.data.total_count,
    }"
    @loadMore="() => loadMore++"
    @columnWidthUpdated="() => triggerResize++"
    @updatePageCount="(count) => (updatedPageCount = count)"
    @applyFilter="(data) => viewControls.applyFilter(data)"
  />
  <EmptyState
    v-else-if="cadences.data && !rows.length"
    name="Cadences"
    :icon="LucideMegaphone"
  />
</template>

<script setup>
import ViewBreadcrumbs from '@/components/ViewBreadcrumbs.vue'
import LayoutHeader from '@/components/LayoutHeader.vue'
import CadencesListView from '@/components/ListViews/CadencesListView.vue'
import EmptyState from '@/components/ListViews/EmptyState.vue'
import ViewControls from '@/components/ViewControls.vue'
import LucideMegaphone from '~icons/lucide/megaphone'
import { formatDate, timeAgo } from '@/utils'
import { ref, computed } from 'vue'

const cadencesListView = ref(null)

// cadences data is loaded in the ViewControls component
const cadences = ref({})
const loadMore = ref(1)
const triggerResize = ref(1)
const updatedPageCount = ref(20)
const viewControls = ref(null)

function parseRows(list) {
  return list.map((cadence) => {
    let _rows = {}
    cadences.value?.data.rows.forEach((row) => {
      _rows[row] = cadence[row]
      if (['modified', 'creation'].includes(row)) {
        _rows[row] = {
          label: formatDate(cadence[row]),
          timeAgo: __(timeAgo(cadence[row])),
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
  const d = cadences.value?.data
  if (!d?.data) return []
  if (d.view_type === 'group_by') {
    if (!d.group_by_field?.fieldname) return []
    return getGroupedByRows(d.data, d.group_by_field)
  }
  if (!['list', 'group_by'].includes(d.view_type)) return []
  return parseRows(d.data)
})

const columns = computed(() => {
  let _columns = cadences.value?.data?.columns || []
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
