<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { fetchProducts, fetchFilters } from '../services/api'
import { unwrapList, getMeta } from '../utils/product'
import ProductCard from '../components/ProductCard.vue'
import SidebarFilter from '../components/SidebarFilter.vue'
import Pagination from '../components/Pagination.vue'
import { Search, AlertCircle, Loader2, PackageX } from '@lucide/vue'

// State
const loading = ref(false)
const products = ref([])
const currentPage = ref(1)
const meta = ref({})
const searchQuery = ref('')
const filters = ref({})
const selectedFilters = reactive({
  brands: [],
  attributes: [],
  variants: []
})

// İlk yükleme
onMounted(async () => {
  try {
    loading.value = true
    const filtersResponse = await fetchFilters()
    filters.value = filtersResponse
    await loadProducts()
  } catch (error) {
    console.error('Verileri yükleme hatası:', error)
  } finally {
    loading.value = false
  }
})

// Ürünleri API'den getir
async function loadProducts() {
  try {
    loading.value = true
    
    const params = { page: currentPage.value }

    if (searchQuery.value && searchQuery.value.length >= 3) {
      params.search = searchQuery.value
    }

    // Sadece içi dolu olan dizileri parametre olarak ekliyoruz (undefined göndermemek için)
    if (selectedFilters.brands && selectedFilters.brands.length > 0) {
      params.brands = selectedFilters.brands
    }
    if (selectedFilters.attributes && selectedFilters.attributes.length > 0) {
      params.attributes = selectedFilters.attributes
    }
    if (selectedFilters.variants && selectedFilters.variants.length > 0) {
      params.variants = selectedFilters.variants
    }

    console.log('API\'ye Gönderilen Parametreler:', params)

    const response = await fetchProducts(params)
    const rawProducts = unwrapList(response, 'products')
    
    // Stok veya Fiyat kontrolü yaparak boş ürünleri gizle
    let processedProducts = rawProducts.filter(p => {
      const s = Number(p.stock)
      const q = Number(p.quantity)
      const hasStock = (!isNaN(s) && s > 0) || (!isNaN(q) && q > 0)
      
      const getPrice = (v) => {
        const isValidPrice = (val) => {
          if (val === null || val === undefined || val === '') return false;
          const cleaned = String(val).replace(/[^0-9,.-]/g, ''); 
          return cleaned !== '0' && cleaned !== '0.00' && cleaned !== '0,00' && cleaned !== '0.0' && cleaned !== '';
        };

        if (!v) return false
        if (typeof v === 'object') {
          if (Array.isArray(v)) return false;
          const nestedOptions = [v.final_price, v.unit_price, v.net_price, v.list_price, v.sale_price, v];
          for (const nested of nestedOptions) {
            if (!nested) continue;
            if (nested.amount !== undefined && !isValidPrice(nested.amount)) continue; 
            const val = nested.formatted || nested.amount || nested.value || (typeof nested !== 'object' ? nested : null);
            if (isValidPrice(val)) return true;
          }
          return false
        }
        return isValidPrice(v)
      }
      const hasPrice = getPrice(p.price) || getPrice(p.unit_price) || getPrice(p.sale_price) || getPrice(p.net_price) || getPrice(p.list_price)
      
      return hasStock && hasPrice
    })

    // 1. Marka (Brand) Filtrelemesi (JSON yapısındaki brand.id'ye göre)
    if (selectedFilters.brands && selectedFilters.brands.length > 0) {
      processedProducts = processedProducts.filter(p => 
        p.brand && selectedFilters.brands.some(id => String(id) === String(p.brand.id))
      )
    }

    // 2. Özellik (Attribute) Filtrelemesi (JSON yapısındaki attributes.attribute.id'ye göre)
    if (selectedFilters.attributes && selectedFilters.attributes.length > 0) {
      processedProducts = processedProducts.filter(p => {
        if (!p.attributes || !Array.isArray(p.attributes)) return false
        // Ürünün özelliklerinden en az biri, seçilen özellikler arasında var mı?
        return p.attributes.some(attrItem => 
          attrItem.attribute && selectedFilters.attributes.some(id => String(id) === String(attrItem.attribute.id))
        )
      })
    }

    // 3. Arama (Search) Filtrelemesi
    if (searchQuery.value && searchQuery.value.length >= 3) {
      const q = searchQuery.value.toLowerCase()
      processedProducts = processedProducts.filter(p => 
        (p.title || p.name || '').toLowerCase().includes(q) ||
        (p.code || '').toLowerCase().includes(q)
      )
    }

    products.value = processedProducts
    meta.value = getMeta(response)
  } catch (error) {
    console.error('Ürün yükleme hatası:', error)
    products.value = []
  } finally {
    loading.value = false
  }
}

// Filtre değiştiğinde
function onFiltersChanged(newFilters) {
  selectedFilters.brands = newFilters.brands || []
  selectedFilters.attributes = newFilters.attributes || []
  selectedFilters.variants = newFilters.variants || []
  currentPage.value = 1
  loadProducts()
}

// Arama değiştiğinde (Debounce ile)
let searchTimeout = null
watch(searchQuery, (val) => {
  if (val.length >= 3 || val.length === 0) {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
      currentPage.value = 1
      loadProducts()
    }, 400)
  }
})

// Sayfa değiştiğinde
function onPageChanged(page) {
  currentPage.value = page
  loadProducts()
}

// Ürün detayına git
function onViewDetail(productId) {
  console.log('Ürün detayına git:', productId)
  // router.push(`/product/${productId}`)
}

const hasProducts = computed(() => products.value.length > 0)
</script>

<template>
  <div class="products-page">
    <div class="products-container">
      
      <SidebarFilter
        :filters="filters"
        :model-value="selectedFilters"
        :loading="loading"
        @update="onFiltersChanged"
      />

      <div class="products-main">
        
        <div class="products-header">
          <h1 class="products-title">Ürün Kataloğu</h1>
          <div class="search-wrapper">
            <Search :size="18" class="search-icon" />
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Ürün adı veya kod ara..." 
              class="search-input"
            />
          </div>
        </div>

        <div v-if="loading && !hasProducts" class="state-box loading">
          <Loader2 class="spinner" :size="32" />
          <p>Ürünler yükleniyor, lütfen bekleyin...</p>
        </div>

        <div v-else-if="!hasProducts" class="state-box empty">
          <PackageX :size="48" class="empty-icon" />
          <h3>Ürün Bulunamadı</h3>
          <p>Arama kriterlerinize veya seçtiğiniz filtrelere uygun ürün bulunmamaktadır.</p>
        </div>

        <div v-else class="products-grid">
          <ProductCard
            v-for="product in products"
            :key="product.id || product.code"
            :product="product"
            @view-detail="onViewDetail"
          />
        </div>

        <Pagination
          v-if="hasProducts"
          :meta="meta"
          @change-page="onPageChanged"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.products-page {
  padding: 1.5rem;
  background-color: #f8fafc;
  min-height: calc(100vh - 60px);
}

.products-container {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 2rem;
  max-width: 1440px;
  margin: 0 auto;
  align-items: start;
}

.products-main {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.products-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background-color: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.05);
  gap: 1rem;
}

@media (max-width: 640px) {
  .products-header {
    flex-direction: column;
    align-items: flex-start;
    padding: 1rem;
  }
  .search-wrapper {
    max-width: 100%;
  }
}

.products-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
}

.search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 320px;
}

.search-icon {
  position: absolute;
  left: 12px;
  color: #94a3b8;
}

.search-input {
  width: 100%;
  padding: 0.625rem 0.75rem 0.625rem 2.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.875rem;
  outline: none;
  transition: all 0.2s;
}

.search-input:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1.5rem;
}

.state-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  background-color: white;
  border: 1px dashed #cbd5e1;
  border-radius: 12px;
  text-align: center;
  color: #64748b;
}

.state-box.loading {
  color: #4f46e5;
}

.spinner {
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

.state-box.empty .empty-icon {
  color: #cbd5e1;
  margin-bottom: 1rem;
}

.state-box.empty h3 {
  color: #0f172a;
  font-size: 1.125rem;
  margin: 0 0 0.5rem 0;
}

.state-box.empty p {
  margin: 0;
  font-size: 0.875rem;
  max-width: 400px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 1024px) {
  .products-container {
    grid-template-columns: 240px 1fr;
  }
}

@media (max-width: 768px) {
  .products-container {
    grid-template-columns: 1fr;
  }
}
</style>