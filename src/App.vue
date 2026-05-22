<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { ChevronDown, LogOut, UserRound } from '@lucide/vue'
import Login from './views/Login.vue'
import Products from './views/Products.vue'
import { clearUser, getToken, getUser, logout } from './services/api'

const token = ref(getToken())
const currentUser = ref(getUser())
const profileMenuOpen = ref(false)
const isAuthenticated = computed(() => Boolean(token.value))
const busy = ref(false)

function handleLogin(nextToken) {
  token.value = nextToken
  currentUser.value = getUser()
}

function toggleProfileMenu() {
  profileMenuOpen.value = !profileMenuOpen.value
}

function closeProfileMenu() {
  profileMenuOpen.value = false
}

async function handleLogout() {
  busy.value = true
  await logout()
  clearUser()
  token.value = null
  currentUser.value = null
  profileMenuOpen.value = false
  busy.value = false
}

function onDocumentClick(event) {
  const target = event.target
  if (!target.closest || !target.closest('.topbar-actions')) {
    closeProfileMenu()
  }
}

onMounted(() => {
  token.value = getToken()
  currentUser.value = getUser()
  document.addEventListener('click', onDocumentClick)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocumentClick)
})
</script>

<template>
  <main class="app-shell">
    <template v-if="isAuthenticated">
      
      <!-- Modern Üst Bar -->
      <header class="topbar">
        <div class="brand-section">
          <h1 class="brand-title">B2B Portal</h1>
          <span class="divider"></span>
          <p class="welcome-text">
            Hoş geldiniz, <strong>{{ currentUser?.displayName || 'Değerli Müşteri' }}</strong>
          </p>
        </div>

        <div class="topbar-actions">

          <!-- Profil Tetikleyici Buton -->
          <button
            class="user-chip"
            :class="{ 'is-active': profileMenuOpen }"
            type="button"
            @click.stop="toggleProfileMenu"
            aria-haspopup="menu"
            :aria-expanded="profileMenuOpen"
          >
            <div class="avatar">
              <UserRound :size="18" />
            </div>
            <div class="user-info">
              <span class="user-name">{{ currentUser?.displayName || 'Bayi Kullanıcısı' }}</span>
            </div>
            <ChevronDown 
              :size="16" 
              class="chevron" 
              :class="{ 'rotate': profileMenuOpen }" 
            />
          </button>

          <!-- Modern Açılır Menü (Dropdown) -->
          <Transition name="dropdown">
            <div v-if="profileMenuOpen" class="profile-menu">
              <div class="profile-menu-header">
                <strong class="menu-name">{{ currentUser?.displayName || 'Bayi Kullanıcısı' }}</strong>
                <span class="menu-role">{{ currentUser?.username || 'Kullanıcı' }}</span>
              </div>
              <div class="menu-divider"></div>
              
              <button class="menu-item logout-btn" type="button" @click="handleLogout" :disabled="busy">
                <LogOut :size="16" />
                <span>Çıkış Yap</span>
              </button>
            </div>
          </Transition>
        </div>
      </header>

      <!-- İçerik Alanı -->
      <div class="content-wrapper">
        <Products />
      </div>

    </template>

    <Login v-else @authenticated="handleLogin" />
  </main>
</template>

<style scoped>
/* Genel Yapı ve CSS Değişkenleri */
.app-shell {
  --primary: #4f46e5;
  --surface: #ffffff;
  --background: #f8fafc;
  --text-main: #0f172a;
  --text-muted: #64748b;
  --border: #e2e8f0;
  
  min-height: 100vh;
  background-color: var(--background);
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  color: var(--text-main);
}

/* Üst Navigasyon Barı */
.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 2rem;
  background-color: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(226, 232, 240, 0.8);
  position: sticky;
  top: 0;
  z-index: 40;
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
}

@media (max-width: 640px) {
  .topbar {
    padding: 0.75rem 1rem;
  }
}

.brand-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.brand-title {
  font-size: 1.125rem;
  font-weight: 700;
  margin: 0;
  color: var(--text-main);
  letter-spacing: -0.025em;
}

.divider {
  width: 1px;
  height: 24px;
  background-color: var(--border);
}

.welcome-text {
  font-size: 0.875rem;
  color: var(--text-muted);
  margin: 0;
}

@media (max-width: 768px) {
  .welcome-text, .divider {
    display: none;
  }
}

.welcome-text strong {
  color: var(--text-main);
  font-weight: 500;
}

/* Profil Butonu (Hap Tasarım) */
.topbar-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  position: relative;
}

.action-divider { width: 1px; height: 24px; background-color: var(--border); }

.cart-trigger { position: relative; background: none; border: none; color: var(--text-main); cursor: pointer; padding: 0.5rem; display: flex; align-items: center; justify-content: center; transition: color 0.2s; }
.cart-trigger:hover { color: var(--primary); }

.cart-badge {
  position: absolute;
  top: -2px; right: -6px;
  background-color: #ef4444; color: white;
  font-size: 0.65rem; font-weight: 700;
  height: 18px; min-width: 18px;
  border-radius: 9px; padding: 0 4px;
  display: flex; align-items: center; justify-content: center;
}

.user-chip {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.375rem 0.5rem 0.375rem 0.375rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 9999px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.user-chip:hover, .user-chip.is-active {
  background-color: var(--background);
  border-color: #cbd5e1;
}

.avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background-color: #e0e7ff;
  color: var(--primary);
  border-radius: 50%;
}

.user-info {
  text-align: left;
}

.user-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-main);
  display: block;
}

.chevron {
  color: var(--text-muted);
  transition: transform 0.2s ease;
  margin-left: 0.25rem;
}

.chevron.rotate {
  transform: rotate(180deg);
}

/* Profil Açılır Menüsü */
.profile-menu {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  width: 240px;
  background-color: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.05);
  overflow: hidden;
  transform-origin: top right;
}

.profile-menu-header {
  padding: 1rem;
  background-color: var(--background);
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.menu-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-main);
}

.menu-role {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.menu-divider {
  height: 1px;
  background-color: var(--border);
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  font-size: 0.875rem;
  font-weight: 500;
  color: #ef4444; /* Çıkış yap kırmızısı */
  cursor: pointer;
  transition: background-color 0.2s ease;
  text-align: left;
}

.menu-item:hover {
  background-color: #fef2f2;
}

.menu-item:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* İçerik Konteyneri */
.content-wrapper {
  padding: 2rem;
  max-width: 1440px;
  margin: 0 auto;
}

/* Vue Dropdown Animasyonu */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(-10px);
}
</style>