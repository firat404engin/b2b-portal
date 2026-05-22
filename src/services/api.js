const API_BASE_URL = import.meta.env.DEV
  ? '/api'
  : 'https://testb2bapi.maverabilisim.com/api/v1'
const TOKEN_KEY = 'b2b_access_token'
const USER_KEY = 'b2b_user_profile'

export function getToken() {
  const token = localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY)

  if (token === 'demo_access_token') {
    clearToken()
    clearUser()
    return null
  }

  return token
}

export function setToken(token, remember = true) {
  const primaryStorage = remember ? localStorage : sessionStorage
  const secondaryStorage = remember ? sessionStorage : localStorage
  secondaryStorage.removeItem(TOKEN_KEY)
  primaryStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(TOKEN_KEY)
}

export function setUser(user, remember = true) {
  const payload = JSON.stringify(user || {})
  const primaryStorage = remember ? localStorage : sessionStorage
  const secondaryStorage = remember ? sessionStorage : localStorage
  secondaryStorage.removeItem(USER_KEY)
  primaryStorage.setItem(USER_KEY, payload)
}

export function getUser() {
  const raw = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function clearUser() {
  localStorage.removeItem(USER_KEY)
  sessionStorage.removeItem(USER_KEY)
}

async function request(path, options = {}) {
  const headers = new Headers(options.headers || {})
  const token = getToken()
  const { auth = true, ...fetchOptions } = options

  headers.set('Accept', 'application/json')

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  if (auth && token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const url = `${API_BASE_URL}${path}`

  if (import.meta.env.DEV) {
    console.debug('API request', {
      url,
      method: fetchOptions.method || 'GET',
      headers: Object.fromEntries(headers.entries()),
      body: fetchOptions.body
    })
  }

  const response = await fetch(url, {
    ...fetchOptions,
    headers
  })

  const contentType = response.headers.get('content-type') || ''
  const data = contentType.includes('application/json')
    ? await response.json()
    : await response.text()

  if (!response.ok) {
    const defaultMessage = response.status >= 500
      ? 'API sunucusu isteği işlerken hata verdi. Bu hata tarayıcıdan değil, test API servisinden dönüyor.'
      : 'İstek tamamlanamadı.'

    const message =
      data?.message ||
      data?.error ||
      Object.values(data?.errors || {}).flat().join(' ') ||
      defaultMessage

    const error = new Error(message)
    error.status = response.status
    error.payload = data
    error.url = url
    error.method = fetchOptions.method || 'GET'
    error.body = fetchOptions.body

    if (import.meta.env.DEV && response.status >= 500) {
      console.error('API 500 error:', {
        url,
        method: error.method,
        status: response.status,
        statusText: response.statusText,
        requestBody: fetchOptions.body,
        responseBody: data
      })
    }

    throw error
  }

  return data
}

export async function login(payload) {
  let data
  let jsonError

  if (import.meta.env.DEV) {
    console.debug('Login payload', payload)
  }

  try {
    data = await request('/auth/login', {
      method: 'POST',
      auth: false,
      body: JSON.stringify(payload)
    })

    if (import.meta.env.DEV) {
      console.debug('Login JSON response', data)
    }
  } catch (error) {
    jsonError = error

    if (import.meta.env.DEV) {
      console.warn('Login JSON attempt failed', {
        status: error.status,
        message: error.message,
        payload: error.payload
      })
    }

    const formBody = new URLSearchParams(payload)

    try {
      data = await request('/auth/login', {
        method: 'POST',
        auth: false,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formBody
      })

      if (import.meta.env.DEV) {
        console.debug('Login FORM response', data)
      }
    } catch (formError) {
      if (import.meta.env.DEV) {
        console.warn('Login FORM attempt failed', {
          status: formError.status,
          message: formError.message,
          payload: formError.payload
        })
      }

      if (jsonError?.status >= 500 && formError?.status >= 500) {
        const jsonMessage = jsonError.message || 'Bilinmeyen JSON login hatası'
        const formMessage = formError.message || 'Bilinmeyen form login hatası'

        if (import.meta.env.DEV) {
          console.error('Login 500 errors:', {
            json: {
              status: jsonError.status,
              url: jsonError.url,
              method: jsonError.method,
              message: jsonError.message,
              payload: jsonError.payload
            },
            form: {
              status: formError.status,
              url: formError.url,
              method: formError.method,
              message: formError.message,
              payload: formError.payload
            }
          })
        }

        throw new Error(
          `Login API 500 Server Error döndürdü. Yerel proxy üzerinden de aynı hata alınırsa test API tarafındaki login servisi kontrol edilmelidir. JSON denemesi: ${jsonMessage}. FORM denemesi: ${formMessage}`
        )
      }

      throw formError
    }
  }

  const token = data?.access_token || data?.token || data?.data?.access_token

  if (!token) {
    throw new Error('Giriş başarılı görünüyor ancak access_token alınamadı.')
  }

  return { data, token }
}

export async function logout() {
  try {
    await request('/auth/logout', { method: 'GET' })
  } finally {
    clearToken()
  }
}

export function fetchFilters() {
  return request('/products/filters')
}

export function fetchProducts(params = {}) {
  const search = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item !== undefined && item !== null && item !== '') {
          search.append(`${key}[]`, item)
        }
      })
      return
    }

    search.set(key, value)
  })

  const query = search.toString()
  return request(`/products${query ? `?${query}` : ''}`)
}
