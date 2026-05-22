<script setup>
import { computed, ref } from 'vue'
import { LockKeyhole, ShoppingBag, UserRound, Mail, Key, ArrowLeft } from '@lucide/vue'
import { login, setToken, setUser } from '../services/api.js'

const emit = defineEmits(['authenticated'])

const form = ref({
  username: '',
  password: '',
  remember: true
})

const view = ref('login') // 'login', 'forgot', 'verify', 'reset'
const forgotForm = ref({
  email: '',
  code: '',
  password: '',
  confirmPassword: ''
})

const fieldErrors = ref({})
const error = ref('')
const loading = ref(false)

/**
 * Kullanıcı adından otomatik bayi ismi oluşturur
 */
const displayName = computed(() => {
  const raw = (form.value.username || '').trim()
  if (!raw) return ''
  const nameParts = raw
    .replace(/[_.-]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))

  return nameParts.length > 1
    ? `${nameParts.slice(0, 2).join(' ')}`
    : `${nameParts[0]} Bayi`
})

function validate() {
  const errors = {}

  if (!form.value.username.trim()) {
    errors.username = 'Kullanıcı adı veya email adresi zorunludur.'
  }

  if (!form.value.password.trim()) {
    errors.password = 'Şifre zorunludur.'
  }

  fieldErrors.value = errors
  return Object.keys(errors).length === 0
}

async function submit() {
  error.value = ''

  if (!validate()) return

  loading.value = true

  try {
    const { token } = await login({
      username: form.value.username,
      password: form.value.password
    })

    const userProfile = {
      username: form.value.username,
      displayName: displayName.value,
      role: 'Bayi Kullanıcısı'
    }

    setToken(token, form.value.remember)
    setUser(userProfile, form.value.remember)
    emit('authenticated', token)
  } catch (err) {
    error.value = err.message || 'Giriş yapılamadı.'
  } finally {
    loading.value = false
  }
}

/**
 * Şifremi Unuttum - Kod Gönderimi
 */
async function handleForgot() {
  if (!forgotForm.value.email) {
    error.value = 'Lütfen e-posta adresinizi girin.'
    return
  }
  loading.value = true
  error.value = ''
  
  // API Simülasyonu
  setTimeout(() => {
    view.value = 'verify'
    loading.value = false
  }, 1000)
}

/**
 * Kod Doğrulama
 */
async function handleVerify() {
  if (forgotForm.value.code.length !== 6) {
    error.value = 'Lütfen 6 haneli kodu girin.'
    return
  }
  loading.value = true
  error.value = ''

  setTimeout(() => {
    view.value = 'reset'
    loading.value = false
  }, 1000)
}

/**
 * Şifre Sıfırlama Tamamlama
 */
async function handleReset() {
  if (forgotForm.value.password !== forgotForm.value.confirmPassword) {
    error.value = 'Şifreler birbiriyle uyuşmuyor.'
    return
  }
  if (forgotForm.value.password.length < 6) {
    error.value = 'Şifre en az 6 karakter olmalıdır.'
    return
  }
  loading.value = true
  error.value = ''

  setTimeout(() => {
    alert('Şifreniz başarıyla güncellendi. Giriş yapabilirsiniz.')
    view.value = 'login'
    loading.value = false
    forgotForm.value = { email: '', code: '', password: '', confirmPassword: '' }
  }, 1000)
}
</script>

<template>
  <section class="login-page">
    <div class="login-visual">
      <div class="brand-mark">
        <ShoppingBag :size="34" />
      </div>
      <p class="eyebrow">Bayi portalı</p>
      <h1>B2B sipariş akışını tek ekranda yönetin</h1>
      <p>
        Ürünleri filtreleyin, stok ve fiyat bilgisini görün, miktar çarpanına uygun şekilde sipariş hazırlayın.
      </p>
    </div>

    <!-- 1. Giriş Formu -->
    <form v-if="view === 'login'" class="login-panel" @submit.prevent="submit">
      <header>
        <p class="eyebrow">Bayi Girişi</p>
        <h2>Panele devam edin</h2>
      </header>

      <label class="field">
        <span>Kullanıcı Adı</span>
        <div class="input-shell" :class="{ invalid: fieldErrors.username }">
          <UserRound :size="18" />
          <input v-model="form.username" autocomplete="username" type="text" placeholder="Kullanıcı adınızı girin" />
        </div>
      </label>

      <label class="field">
        <div class="label-row">
          <span>Şifre</span>
          <button type="button" class="text-link" @click="view = 'forgot'; error = ''">Şifremi Unuttum</button>
        </div>
        <div class="input-shell" :class="{ invalid: fieldErrors.password }">
          <LockKeyhole :size="18" />
          <input v-model="form.password" autocomplete="current-password" type="password" placeholder="Şifrenizi girin" />
        </div>
      </label>

      <label class="check-row">
        <input v-model="form.remember" type="checkbox" />
        <span>Beni bu cihazda hatırla</span>
      </label>

      <p v-if="error" class="alert">{{ error }}</p>

      <button class="primary-button" :disabled="loading" type="submit">
        {{ loading ? 'Giriş yapılıyor...' : 'Giriş Yap' }}
      </button>
    </form>

    <!-- 2. Şifremi Unuttum (E-posta) -->
    <form v-else-if="view === 'forgot'" class="login-panel" @submit.prevent="handleForgot">
      <button type="button" class="back-btn" @click="view = 'login'; error = ''">
        <ArrowLeft :size="16" /> Geri Dön
      </button>
      <header>
        <p class="eyebrow">Şifre Kurtarma</p>
        <h2>E-posta adresinizi girin</h2>
        <p>Size 6 haneli bir doğrulama kodu göndereceğiz.</p>
      </header>

      <label class="field">
        <span>E-posta Adresi</span>
        <div class="input-shell">
          <Mail :size="18" />
          <input v-model="forgotForm.email" type="email" placeholder="bayi@firma.com" required />
        </div>
      </label>

      <p v-if="error" class="alert">{{ error }}</p>

      <button class="primary-button" :disabled="loading" type="submit">
        {{ loading ? 'Gönderiliyor...' : 'Kod Gönder' }}
      </button>
    </form>

    <!-- 3. Kod Doğrulama -->
    <form v-else-if="view === 'verify'" class="login-panel" @submit.prevent="handleVerify">
      <button type="button" class="back-btn" @click="view = 'forgot'; error = ''">
        <ArrowLeft :size="16" /> Geri
      </button>
      <header>
        <p class="eyebrow">Doğrulama</p>
        <h2>Kodu Onaylayın</h2>
        <p><strong>{{ forgotForm.email }}</strong> adresine gelen kodu girin.</p>
      </header>

      <label class="field">
        <span>6 Haneli Kod</span>
        <div class="input-shell">
          <Key :size="18" />
          <input v-model="forgotForm.code" type="text" maxlength="6" placeholder="000000" style="letter-spacing: 0.5em; font-weight: bold; text-align: center" />
        </div>
      </label>

      <p v-if="error" class="alert">{{ error }}</p>

      <button class="primary-button" :disabled="loading" type="submit">
        {{ loading ? 'Doğrulanıyor...' : 'Kodu Doğrula' }}
      </button>
    </form>

    <!-- 4. Yeni Şifre Belirleme -->
    <form v-else-if="view === 'reset'" class="login-panel" @submit.prevent="handleReset">
      <header>
        <p class="eyebrow">Son Adım</p>
        <h2>Yeni Şifre Oluştur</h2>
      </header>

      <label class="field">
        <span>Yeni Şifre</span>
        <div class="input-shell">
          <LockKeyhole :size="18" />
          <input v-model="forgotForm.password" type="password" placeholder="••••••••" required />
        </div>
      </label>

      <label class="field">
        <span>Şifre Tekrar</span>
        <div class="input-shell">
          <LockKeyhole :size="18" />
          <input v-model="forgotForm.confirmPassword" type="password" placeholder="••••••••" required />
        </div>
      </label>

      <p v-if="error" class="alert">{{ error }}</p>

      <button class="primary-button" :disabled="loading" type="submit">
        {{ loading ? 'Güncelleniyor...' : 'Şifreyi Güncelle' }}
      </button>
    </form>
  </section>
</template>

<style scoped>
.label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.text-link {
  background: none;
  border: none;
  padding: 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--primary);
  cursor: pointer;
}

.back-btn {
  background: none;
  border: none;
  padding: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-muted);
  margin-bottom: 1rem;
  cursor: pointer;
}

.back-btn:hover {
  color: var(--primary);
}

header h2 {
  margin-top: 4px;
  margin-bottom: 8px;
}

header p {
  margin-bottom: 1.5rem;
  font-size: 14px;
  color: var(--text-muted);
  line-height: 1.5;
}
</style>
