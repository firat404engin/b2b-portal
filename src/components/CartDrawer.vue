<script setup>
import { ShoppingCart, X, Trash2 } from '@lucide/vue'
import { useCart } from '@/composables/useCart.js'

const { cartItems, isCartOpen, removeFromCart, cartTotalAmount } = useCart()

function closeCart() {
  isCartOpen.value = false
}

function formatPrice(amount) {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount)
}

function getItemTotal(item) {
  const p = item.product.price
  const basePrice = p?.final_price || p?.sale_price || p?.unit_price || p || item.product.price
  let amount = 0
  if (typeof basePrice === 'object') {
    amount = Number(basePrice.amount) || 0
  } else {
    amount = Number(String(basePrice).replace(/[^0-9.-]/g, '')) || 0
  }
  return formatPrice(amount * item.quantity)
}

function getImg(product) {
  if (Array.isArray(product.images) && product.images.length > 0) return product.images[0]
  return 'https://placehold.co/100x100/f8fafc/94a3b8?text=Gorsel+Yok'
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="isCartOpen" class="cart-overlay" @click="closeCart"></div>
    </Transition>

    <Transition name="slide">
      <aside v-if="isCartOpen" class="cart-drawer">
        <div class="drawer-header">
          <div class="header-title">
            <ShoppingCart :size="20" />
            <h2>Sepetim</h2>
            <span class="badge">{{ cartItems.length }}</span>
          </div>
          <button class="close-btn" @click="closeCart">
            <X :size="20" />
          </button>
        </div>

        <div class="drawer-body">
          <div v-if="cartItems.length === 0" class="empty-state">
            <ShoppingCart :size="48" class="empty-icon" />
            <p>Sepetiniz şu an boş.</p>
            <button class="btn-continue" @click="closeCart">Alışverişe Devam Et</button>
          </div>

          <ul v-else class="cart-list">
            <li v-for="(item, index) in cartItems" :key="index" class="cart-item">
              <img :src="getImg(item.product)" :alt="item.product.title" class="item-img" />
              
              <div class="item-info">
                <h4 class="item-title">{{ item.product.title || item.product.name }}</h4>
                <div class="item-meta">
                  <span class="qty">{{ item.quantity }} {{ item.product.unit || 'Adet' }}</span>
                  <span class="price">{{ getItemTotal(item) }}</span>
                </div>
              </div>

              <button class="btn-remove" @click="removeFromCart(item.product)" title="Sil">
                <Trash2 :size="16" />
              </button>
            </li>
          </ul>
        </div>

        <div v-if="cartItems.length > 0" class="drawer-footer">
          <div class="total-row">
            <span>Ara Toplam:</span>
            <strong class="total-price">{{ formatPrice(cartTotalAmount) }}</strong>
          </div>
          <button class="btn-checkout">Siparişi Tamamla</button>
        </div>
      </aside>
    </Transition>
  </Teleport>
</template>

<style scoped>
.cart-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(2px);
  z-index: 100;
}

.cart-drawer {
  position: fixed;
  top: 0;
  right: 0;
  height: 100%;
  width: 100%;
  max-width: 400px;
  background-color: #ffffff;
  box-shadow: -4px 0 25px rgba(0, 0, 0, 0.1);
  z-index: 101;
  display: flex;
  flex-direction: column;
}

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.header-title { display: flex; align-items: center; gap: 0.5rem; color: #0f172a; }
.header-title h2 { margin: 0; font-size: 1.25rem; font-weight: 700; }
.badge { background-color: #6366f1; color: white; font-size: 0.75rem; font-weight: 700; padding: 0.125rem 0.5rem; border-radius: 999px; }
.close-btn { background: none; border: none; color: #64748b; cursor: pointer; padding: 0.25rem; transition: color 0.2s; }
.close-btn:hover { color: #0f172a; }

.drawer-body { flex: 1; overflow-y: auto; padding: 1.5rem; }

.empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: #64748b; text-align: center; gap: 1rem; }
.empty-icon { color: #cbd5e1; }
.btn-continue { background-color: #f1f5f9; color: #0f172a; border: none; font-weight: 600; padding: 0.75rem 1.25rem; border-radius: 8px; cursor: pointer; transition: background 0.2s; }
.btn-continue:hover { background-color: #e2e8f0; }

.cart-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 1rem; }
.cart-item { display: flex; gap: 1rem; padding-bottom: 1rem; border-bottom: 1px solid #f1f5f9; align-items: center; }
.cart-item:last-child { border-bottom: none; padding-bottom: 0; }

.item-img { width: 64px; height: 64px; object-fit: contain; border-radius: 8px; background-color: #f8fafc; border: 1px solid #e2e8f0; }
.item-info { flex: 1; display: flex; flex-direction: column; gap: 0.25rem; }
.item-title { margin: 0; font-size: 0.875rem; color: #0f172a; line-height: 1.3; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.item-meta { display: flex; justify-content: space-between; align-items: center; margin-top: 0.25rem; }
.qty { font-size: 0.8125rem; color: #64748b; font-weight: 500; }
.price { font-size: 0.875rem; color: #6366f1; font-weight: 700; }

.btn-remove { background: none; border: none; color: #cbd5e1; cursor: pointer; padding: 0.5rem; transition: color 0.2s; }
.btn-remove:hover { color: #ef4444; }

.drawer-footer { padding: 1.5rem; border-top: 1px solid #e2e8f0; background-color: #f8fafc; display: flex; flex-direction: column; gap: 1rem; }
.total-row { display: flex; justify-content: space-between; align-items: center; font-size: 1rem; color: #0f172a; }
.total-price { font-size: 1.5rem; font-weight: 700; color: #6366f1; }
.btn-checkout { background-color: #6366f1; color: white; border: none; font-weight: 600; font-size: 1rem; padding: 1rem; border-radius: 8px; cursor: pointer; transition: background 0.2s; }
.btn-checkout:hover { background-color: #4f46e5; }

/* Animasyonlar */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.slide-enter-active, .slide-leave-active { transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.slide-enter-from, .slide-leave-to { transform: translateX(100%); }
</style>