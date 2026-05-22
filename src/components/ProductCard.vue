<script setup>
import { ref, computed, watch } from 'vue'
import { ShoppingCart } from '@lucide/vue'

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['view-detail'])

const stepAmount = computed(() => {
  const mult = parseFloat(props.product.quantity_multiple)
  return (!isNaN(mult) && mult > 0) ? mult : 1
})

const minAmount = computed(() => {
  const min = parseFloat(props.product.quantity_multiple)
  return (!isNaN(min) && min > 0) ? min : stepAmount.value
})

const orderQuantity = ref(minAmount.value)

// 1. MARKA
const displayBrand = computed(() => {
  if (props.product.brand && props.product.brand.title) {
    return props.product.brand.title
  }
  return ''
})

// 2. GÖRSEL
const displayImage = computed(() => {
  if (Array.isArray(props.product.images) && props.product.images.length > 0) {
    return props.product.images[0]
  }
  return 'https://placehold.co/300x300/f8fafc/94a3b8?text=Gorsel+Yok'
})

function handleImageError(event) {
  event.target.src = 'https://placehold.co/300x300/f8fafc/94a3b8?text=Gorsel+Bulunamadi'
}

// 3. FİYATLAR VE DİNAMİK HESAPLAMA
function calculateTotal(priceNode) {
  if (!priceNode) return null

  let amount = 0
  let currency = 'TRY'

  if (typeof priceNode === 'object') {
    amount = Number(priceNode.amount) || 0
    currency = priceNode.currency || 'TRY'
  } else {
    amount = Number(String(priceNode).replace(/[^0-9.-]/g, '')) || 0
  }

  if (amount === 0) return null

  const total = amount * (orderQuantity.value || 1)
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency }).format(total)
}

const displayCurrentPrice = computed(() => {
  const p = props.product.price
  const basePrice = p?.final_price || p?.sale_price || p?.unit_price || p || props.product.price
  return calculateTotal(basePrice) || 'Fiyat Yok'
})

const displayOldPrice = computed(() => {
  const p = props.product.price
  return calculateTotal(p?.list_price || props.product.list_price)
})

const displayNetPrice = computed(() => {
  const p = props.product.price
  return calculateTotal(p?.net_price || props.product.net_price)
})

// 4. STOK VE UYARI LİMİTİ
const displayStock = computed(() => {
  const qty = parseFloat(props.product.quantity)
  return isNaN(qty) ? 0 : Math.floor(qty)
})

// Stok 500'den az ve 0'dan büyükse Düşük Stok uyarısını tetikler
const isLowStock = computed(() => {
  return displayStock.value > 0 && displayStock.value < 500
})

watch(orderQuantity, (newVal) => {
  if (displayStock.value <= 0) return

  const maxLimit = Math.min(parseFloat(props.product.max_quantity) || Infinity, displayStock.value)

  if (newVal > maxLimit) {
    orderQuantity.value = Math.floor(maxLimit / stepAmount.value) * stepAmount.value
  } else if (newVal < minAmount.value || typeof newVal !== 'number') {
    orderQuantity.value = minAmount.value
  }
})

function enforceRules() {
  let val = orderQuantity.value
  if (typeof val !== 'number' || isNaN(val) || val < minAmount.value) {
    orderQuantity.value = minAmount.value
    return
  }
  const remainder = val % stepAmount.value
  if (remainder !== 0) {
    orderQuantity.value = Math.round(val / stepAmount.value) * stepAmount.value
  }
}

// 5. AÇIKLAMA
const cleanDescription = computed(() => {
  let desc = props.product.description || ''
  desc = desc.replace(/<\/?[^>]+(>|$)/g, "")
  const txt = document.createElement("textarea")
  txt.innerHTML = desc
  return txt.value
})

function increaseQty() {
  const nextVal = orderQuantity.value + stepAmount.value
  const maxLimit = Math.min(parseFloat(props.product.max_quantity) || Infinity, displayStock.value)
  if (nextVal <= maxLimit) {
    orderQuantity.value = nextVal
  }
}

function decreaseQty() {
  if (orderQuantity.value - stepAmount.value >= minAmount.value) {
    orderQuantity.value -= stepAmount.value
  }
}

function addToCart() {
  if (displayStock.value <= 0) return
  console.log(`${props.product.title} ürününden ${orderQuantity.value} adet sepete eklendi.`)
}

function goToDetail() {
  if (props.product.id || props.product.code) {
    emit('view-detail', props.product.id || props.product.code)
  }
}
</script>

<template>
  <div class="product-card">
    
    <div class="card-clickable-area" @click="goToDetail" title="Ürün detayına git">
      <div class="image-frame">
        <img 
          :src="displayImage" 
          :alt="product.title || 'Ürün Görseli'" 
          @error="handleImageError"
        />
      </div>

      <div class="product-info">
        <span v-if="displayBrand" class="brand-name">
          {{ displayBrand }}
        </span>
        <h3 class="product-title">{{ product.title || product.name }}</h3>
        
        <div class="product-meta">
          <span v-if="product.code" class="meta-item">Kod: {{ product.code }}</span>
          <span v-if="product.barcode" class="meta-item">Barkod: {{ product.barcode }}</span>
        </div>

        <p v-if="cleanDescription" class="product-description">
          {{ cleanDescription }}
        </p>
      </div>
    </div>

    <div class="card-footer">
      
      <div class="stock-info">
        <span 
          class="stock-badge" 
          :class="{
            'out-of-stock': displayStock <= 0,
            'low-stock': isLowStock
          }"
        >
          Stok: {{ displayStock }} {{ product.unit || 'Adet' }}
          <span v-if="isLowStock" class="low-stock-text">- Düşük Stok</span>
        </span>
      </div>

      <div class="price-block">
        <div class="price-row">
          <span v-if="displayOldPrice && displayOldPrice !== displayCurrentPrice" class="old-price">
            {{ displayOldPrice }}
          </span>
          <strong class="current-price">{{ displayCurrentPrice }}</strong>
        </div>
        
        <small v-if="displayNetPrice && displayNetPrice !== displayCurrentPrice" class="net-price">
          Net: {{ displayNetPrice }}
        </small>
      </div>

      <div class="cart-action-row">
        <div class="stepper" :class="{ 'is-disabled': displayStock <= 0 }">
          <button 
            type="button" 
            class="step-btn" 
            :disabled="orderQuantity <= minAmount || displayStock <= 0" 
            @click.stop="decreaseQty"
          >-</button>
          
          <input 
            type="number" 
            class="step-input" 
            v-model.number="orderQuantity" 
            :max="product.max_quantity" 
            :min="minAmount" 
            :step="stepAmount"
            @change="enforceRules"
            @blur="enforceRules"
            :disabled="displayStock <= 0"
            @click.stop 
          />
          
          <button 
            type="button" 
            class="step-btn" 
            :disabled="orderQuantity + stepAmount > Math.min(parseFloat(product.max_quantity) || Infinity, displayStock) || displayStock <= 0" 
            @click.stop="increaseQty"
          >+</button>
        </div>
        
        <button 
          type="button" 
          class="btn-add-cart" 
          :disabled="displayStock <= 0" 
          @click.stop="addToCart"
        >
          <ShoppingCart :size="16" />
          <span>{{ displayStock <= 0 ? 'Tükendi' : 'Ekle' }}</span>
        </button>
      </div>
    </div>

  </div>
</template>

<style scoped>
/* CSS Değişkenleri */
.product-card {
  --primary: #4f46e5;
  --primary-hover: #4338ca;
  --surface: #ffffff;
  --text-main: #0f172a;
  --text-muted: #64748b;
  --border: #e2e8f0;
  
  display: flex;
  flex-direction: column;
  background-color: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
  transition: box-shadow 0.2s ease, transform 0.2s ease;
  height: 100%;
}

.product-card:hover {
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.05);
  transform: translateY(-2px);
}

.card-clickable-area {
  cursor: pointer;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.image-frame {
  width: 100%;
  aspect-ratio: 1 / 1; 
  background-color: #f8fafc;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid var(--border);
  position: relative;
}

.image-frame img {
  width: 100%;
  height: 100%;
  object-fit: contain; 
  transition: transform 0.3s ease;
}

.card-clickable-area:hover .image-frame img {
  transform: scale(1.05); 
}

.product-info {
  padding: 1.25rem 1.25rem 0.5rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
}

.brand-name {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--primary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.product-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-main);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-word; 
}

.product-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: var(--text-muted);
}

.meta-item {
  background-color: #f1f5f9;
  padding: 0.25rem 0.375rem;
  border-radius: 4px;
  word-break: break-all;
}

.product-description {
  margin: 0;
  font-size: 0.8125rem;
  color: var(--text-muted);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3; 
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-word;
}

.card-footer {
  padding: 0.5rem 1.25rem 1.25rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
}

.stock-info {
  display: flex;
}

/* Yeterli Stok (Yeşil) */
.stock-badge {
  font-size: 0.75rem;
  font-weight: 600;
  color: #059669; 
  background-color: #d1fae5;
  padding: 0.25rem 0.625rem;
  border-radius: 999px;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  transition: all 0.2s;
}

/* Düşük Stok (Turuncu) */
.stock-badge.low-stock {
  color: #b45309;
  background-color: #fef3c7;
}

.low-stock-text {
  font-weight: 700;
}

/* Tükendi (Kırmızı) */
.stock-badge.out-of-stock {
  color: #dc2626; 
  background-color: #fee2e2;
}

.price-block {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  min-height: 2.5rem;
}

.price-row {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.old-price {
  font-size: 0.875rem;
  color: #94a3b8;
  text-decoration: line-through;
}

.current-price {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-main);
}

.net-price {
  font-size: 0.75rem;
  color: var(--primary);
  font-weight: 600;
}

.cart-action-row {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  margin-top: auto;
}

.stepper {
  display: flex;
  align-items: center;
  border: 1px solid var(--border);
  border-radius: 8px;
  height: 2.5rem;
  overflow: hidden;
  background-color: #f8fafc;
  flex: 0 0 auto;
}

.stepper.is-disabled {
  opacity: 0.5;
  background-color: #f1f5f9;
}

.step-btn {
  background: transparent;
  border: none;
  width: 2rem;
  height: 100%;
  font-size: 1.125rem;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.step-btn:hover:not(:disabled) {
  background-color: #e2e8f0;
  color: var(--text-main);
}

.step-btn:disabled {
  cursor: not-allowed;
  opacity: 0.4;
}

.step-input {
  width: 2.5rem;
  height: 100%;
  border: none;
  border-left: 1px solid var(--border);
  border-right: 1px solid var(--border);
  text-align: center;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-main);
  background-color: white;
  padding: 0;
}

.step-input:disabled {
  background-color: #f1f5f9;
  color: #94a3b8;
}

.step-input::-webkit-outer-spin-button,
.step-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.btn-add-cart {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  height: 2.5rem;
  background-color: var(--primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  white-space: nowrap;
}

.btn-add-cart:hover:not(:disabled) {
  background-color: var(--primary-hover);
}

.btn-add-cart:disabled {
  background-color: #cbd5e1;
  cursor: not-allowed;
}
</style>