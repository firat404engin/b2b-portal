<script setup>
import { computed, reactive, watch } from 'vue'
import { Filter, RotateCcw } from '@lucide/vue'
import { unwrapList } from '../utils/product'

const props = defineProps({
  filters: {
    type: Object,
    default: () => ({})
  },
  modelValue: {
    type: Object,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update'])

const local = reactive({
  brands: [],
  attributes: [],
  variants: []
})

const brands = computed(() => {
  const brds = unwrapList(props.filters, 'brands')
  return brds.sort((a, b) => (a.title || a.name || '').localeCompare(b.title || b.name || '', 'tr'))
})
const attributeGroups = computed(() => unwrapList(props.filters, 'attribute_groups'))
const variantGroups = computed(() => unwrapList(props.filters, 'variant_groups'))

const hasFilters = computed(
  () =>
    brands.value.length ||
    attributeGroups.value.length ||
    variantGroups.value.length
)

const selectedCount = computed(
  () =>
    local.brands.length +
    local.attributes.length +
    local.variants.length
)

watch(
  () => props.modelValue,
  (value) => {
    local.brands = [...(value.brands || [])]
    local.attributes = [...(value.attributes || [])]
    local.variants = [...(value.variants || [])]
  },
  { immediate: true, deep: true }
)

function toggle(collection, id) {
  const index = local[collection].findIndex(item => String(item) === String(id))

  if (index >= 0) {
    local[collection].splice(index, 1)
  } else {
    local[collection].push(id) 
  }
  
  // Checkbox'a her tıklandığında anında uygula (Otomatik Filtreleme)
  apply()
}

function isSelected(collection, id) {
  return local[collection].some(item => String(item) === String(id))
}

function apply() {
  const selectedFilters = {
    brands: [...local.brands],
    attributes: [...local.attributes],
    variants: [...local.variants]
  }

  console.log('Seçilen filtre ID\'leri (SidebarFilter):', JSON.stringify(selectedFilters))
  emit('update', selectedFilters)
}

function reset() {
  local.brands = []
  local.attributes = []
  local.variants = []
  console.log('Filtreler sıfırlandı.')
  apply()
}
</script>

<template>
  <aside class="filter-panel">
    <div class="filter-header">
      <div class="header-title-wrapper">
        <Filter :size="18" class="header-icon" />
        <h2 class="header-title">Filtreler</h2>
        <span v-if="selectedCount > 0" class="badge total-badge">{{ selectedCount }}</span>
      </div>
    </div>

    <div class="filter-content">
      <div v-if="loading" class="state-box">
        <div class="spinner"></div>
        <span>Yükleniyor...</span>
      </div>
      <div v-else-if="!hasFilters" class="state-box empty">
        <span>Filtre bulunamadı.</span>
      </div>

      <template v-else>
        <section v-if="brands.length" class="filter-group">
          <div class="group-heading">
            <h3>Markalar</h3>
            <span v-if="local.brands.length" class="badge">{{ local.brands.length }}</span>
          </div>
          <div class="brand-grid">
            <label v-for="brand in brands" :key="brand.id" class="custom-checkbox brand-option">
              <input
                :checked="isSelected('brands', brand.id)"
                type="checkbox"
                @change="toggle('brands', brand.id)"
              />
              <span class="checkmark"></span>
              <div class="brand-content">
                <img v-if="brand.image" :src="brand.image" :alt="brand.title || brand.name" class="brand-img" />
                <span class="label-text">{{ brand.title || brand.name }}</span>
              </div>
            </label>
          </div>
        </section>

        <section v-for="group in attributeGroups" :key="group.id || group.title" class="filter-group">
          <div class="group-heading">
            <h3>{{ group.title }}</h3>
          </div>
          <div class="option-grid">
            <label v-for="attribute in group.attributes || []" :key="attribute.id" class="custom-checkbox">
              <input
                :checked="isSelected('attributes', attribute.id)"
                type="checkbox"
                @change="toggle('attributes', attribute.id)"
              />
              <span class="checkmark"></span>
              <span class="label-text">{{ attribute.title || attribute.name }}</span>
            </label>
          </div>
        </section>
      </template>
    </div>

    <div class="filter-actions" v-if="hasFilters && !loading">
      <button class="btn-reset full-width" title="Tüm Filtreleri Sıfırla" type="button" @click="reset">
        <RotateCcw :size="16" />
        <span>Filtreleri Sıfırla</span>
      </button>
    </div>
  </aside>
</template>

<style scoped>
.filter-panel {
  --primary: #4f46e5;
  --primary-hover: #4338ca;
  --surface: #ffffff;
  --text-main: #1e293b;
  --text-muted: #64748b;
  --border-light: #e2e8f0; 
  --border-dark: #cbd5e1;
  
  background-color: var(--surface);
  border: 1px solid var(--border-light);
  border-radius: 12px;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.05);
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 100px);
  overflow: hidden;
  position: sticky;
  top: 1.5rem;
}

.filter-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border-light);
  background-color: var(--surface);
  z-index: 10;
}

.header-title-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.header-icon {
  color: var(--primary);
}

.header-title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-main);
}

.badge {
  background-color: #e0e7ff;
  color: var(--primary);
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.125rem 0.5rem;
  border-radius: 999px;
}

.total-badge {
  background-color: var(--primary);
  color: white;
  margin-left: auto;
}

.filter-content {
  overflow-y: auto;
  flex: 1;
  padding-bottom: 1rem;
}

.filter-content::-webkit-scrollbar {
  width: 4px;
}
.filter-content::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 4px;
}

.state-box {
  padding: 3rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  color: var(--text-muted);
  font-size: 0.875rem;
  text-align: center;
}

.filter-group {
  padding: 1.5rem 1.5rem 0.5rem;
  border-bottom: 1px solid var(--border-light);
}

.filter-group:last-child {
  border-bottom: none;
}

.group-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.group-heading h3 {
  margin: 0;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
}

.custom-checkbox {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  cursor: pointer;
  margin-bottom: 0.875rem;
  position: relative;
  user-select: none;
}

.custom-checkbox input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.checkmark {
  height: 16px;
  width: 16px;
  background-color: var(--surface);
  border: 1.5px solid #cbd5e1;
  border-radius: 4px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.custom-checkbox:hover input ~ .checkmark {
  border-color: #94a3b8;
}

.custom-checkbox input:checked ~ .checkmark {
  background-color: var(--primary);
  border-color: var(--primary);
}

.checkmark:after {
  content: "";
  display: none;
  width: 3px;
  height: 7px;
  border: solid white;
  border-width: 0 1.5px 1.5px 0;
  transform: rotate(45deg);
  margin-bottom: 1px;
}

.custom-checkbox input:checked ~ .checkmark:after {
  display: block;
}

.label-text {
  font-size: 0.875rem;
  color: var(--text-main);
  transition: color 0.2s;
}

.nested-filter {
  margin-bottom: 0.875rem;
}

.sub-options {
  margin-top: 0.625rem;
  margin-left: 0.4375rem;
  padding-left: 1.125rem;
  border-left: 1.5px solid var(--border-light);
  display: flex;
  flex-direction: column;
}

.brand-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.brand-img {
  width: 20px;
  height: 20px;
  object-fit: contain;
  border-radius: 4px;
  background: white;
}

.filter-actions {
  padding: 1rem 1.5rem;
  background-color: var(--surface);
  border-top: 1px solid var(--border-light);
  display: flex;
  gap: 0.75rem;
  position: sticky;
  bottom: 0;
  z-index: 10;
}

.btn-apply {
  flex: 1;
  background-color: var(--primary);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.625rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-apply:hover {
  background-color: var(--primary-hover);
}

.btn-reset {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.625rem 0.75rem;
  background-color: transparent;
  color: var(--text-muted);
  border: 1px solid var(--border-dark);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-reset.full-width {
  width: 100%;
  gap: 0.5rem;
}

.btn-reset:hover {
  color: #ef4444;
  border-color: #fca5a5;
  background-color: #fef2f2;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid var(--border-dark);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>