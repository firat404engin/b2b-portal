import { ref, computed } from 'vue'

const cartItems = ref([])
const isCartOpen = ref(false)

export function useCart() {
  function addToCart(product, quantity) {
    const existingItem = cartItems.value.find(
      item => item.product.id === product.id || item.product.code === product.code
    )
    
    if (existingItem) {
      existingItem.quantity += quantity
    } else {
      cartItems.value.push({ product, quantity })
    }
    
    // Ürün eklendiğinde sepet çekmecesini otomatik aç
    isCartOpen.value = true
  }

  function removeFromCart(product) {
    const index = cartItems.value.findIndex(
      item => item.product.id === product.id || item.product.code === product.code
    )
    if (index > -1) {
      cartItems.value.splice(index, 1)
    }
  }

  const cartItemCount = computed(() => cartItems.value.length)

  const cartTotalAmount = computed(() => {
    return cartItems.value.reduce((total, item) => {
      const p = item.product.price
      const basePrice = p?.final_price || p?.sale_price || p?.unit_price || p || item.product.price
      let amount = 0
      if (typeof basePrice === 'object') {
        amount = Number(basePrice.amount) || 0
      } else {
        amount = Number(String(basePrice).replace(/[^0-9.-]/g, '')) || 0
      }
      return total + (amount * item.quantity)
    }, 0)
  })

  return { 
    cartItems, 
    isCartOpen, 
    addToCart, 
    removeFromCart, 
    cartItemCount, 
    cartTotalAmount 
  }
}