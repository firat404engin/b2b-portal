<script setup>
import { computed } from 'vue'
import { ChevronLeft, ChevronRight } from '@lucide/vue'

const props = defineProps({
  meta: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['change-page'])

const currentPage = computed(() => Number(props.meta.current_page || 1))
const lastPage = computed(() => Number(props.meta.last_page || 1))
const total = computed(() => Number(props.meta.total || 0))

const pages = computed(() => {
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(lastPage.value, start + 4)
  return Array.from({ length: end - start + 1 }, (_, index) => start + index)
})

function go(page) {
  if (page < 1 || page > lastPage.value || page === currentPage.value) return
  emit('change-page', page)
}
</script>

<template>
  <nav v-if="lastPage > 1" class="pagination">
    <span>{{ total }} sonuç</span>
    <button class="icon-button" :disabled="currentPage === 1" title="Önceki sayfa" @click="go(currentPage - 1)">
      <ChevronLeft :size="18" />
    </button>
    <button
      v-for="page in pages"
      :key="page"
      class="page-button"
      :class="{ active: page === currentPage }"
      @click="go(page)"
    >
      {{ page }}
    </button>
    <button
      class="icon-button"
      :disabled="currentPage === lastPage"
      title="Sonraki sayfa"
      @click="go(currentPage + 1)"
    >
      <ChevronRight :size="18" />
    </button>
  </nav>
</template>
