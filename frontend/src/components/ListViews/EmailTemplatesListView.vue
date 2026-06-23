<template>
  <ListView
    :class="$attrs.class"
    :columns="columns"
    :rows="rows"
    :options="{
      getRowRoute: (row) => ({
        name: 'EmailTemplate',
        params: { templateId: row.name },
        query: { view: route.query.view, viewType: route.params.viewType },
      }),
      selectable: false,
      showTooltip: options.showTooltip,
      resizeColumn: options.resizeColumn,
    }"
    row-key="name"
  >
    <ListHeader
      class="mx-3 sm:mx-5"
      @columnWidthUpdated="emit('columnWidthUpdated')"
    >
      <ListHeaderItem
        v-for="column in columns"
        :key="column.key"
        :item="column"
        @columnWidthUpdated="emit('columnWidthUpdated', column)"
      />
    </ListHeader>
    <ListRows
      v-slot="{ idx, column, item }"
      class="mx-3 sm:mx-5"
      :rows="rows"
      doctype="Email Template"
    >
      <ListRowItem :item="item" :align="column.align" class="overflow-hidden">
        <template #default="{ label }">
          <Badge
            v-if="column.key === 'status' && item"
            variant="subtle"
            :theme="statusTheme(item)"
            :label="__(item)"
          />
          <div
            v-else-if="['modified', 'creation'].includes(column.key)"
            class="truncate text-base"
            @click="
              (event) =>
                emit('applyFilter', {
                  event,
                  idx,
                  column,
                  item,
                  firstColumn: columns[0],
                })
            "
          >
            <Tooltip :text="item?.label">
              <div>{{ item?.timeAgo }}</div>
            </Tooltip>
          </div>
          <div
            v-else-if="label"
            class="truncate text-base"
            @click="
              (event) =>
                emit('applyFilter', {
                  event,
                  idx,
                  column,
                  item,
                  firstColumn: columns[0],
                })
            "
          >
            {{ label }}
          </div>
          <div v-else class="text-ink-gray-4">—</div>
        </template>
      </ListRowItem>
    </ListRows>
  </ListView>
  <ListFooter
    v-if="pageLengthCount"
    v-model="pageLengthCount"
    class="border-t px-3 py-2 sm:px-5"
    :options="{
      rowCount: options.rowCount,
      totalCount: options.totalCount,
    }"
    @loadMore="emit('loadMore')"
  />
</template>
<script setup>
import ListRows from '@/components/ListViews/ListRows.vue'
import {
  Badge,
  ListView,
  ListHeader,
  ListHeaderItem,
  ListRowItem,
  ListFooter,
  Tooltip,
} from 'frappe-ui'
import { watch } from 'vue'
import { useRoute } from 'vue-router'

defineProps({
  rows: { type: Array, required: true },
  columns: { type: Array, required: true },
  options: {
    type: Object,
    default: () => ({
      showTooltip: true,
      resizeColumn: false,
      totalCount: 0,
      rowCount: 0,
    }),
  },
})

const emit = defineEmits([
  'loadMore',
  'updatePageCount',
  'columnWidthUpdated',
  'applyFilter',
])

const route = useRoute()
const pageLengthCount = defineModel({ type: Number })

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

watch(pageLengthCount, (val, old_value) => {
  if (val === old_value) return
  emit('updatePageCount', val)
})
</script>
