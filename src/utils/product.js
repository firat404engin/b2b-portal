export function unwrapList(payload, fallbackKey) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.[fallbackKey])) return payload[fallbackKey]
  if (Array.isArray(payload?.data?.[fallbackKey])) return payload.data[fallbackKey]
  return []
}

export function getMeta(payload) {
  return payload?.meta || payload?.data?.meta || {}
}

export function money(price, fallback = '-') {
  if (!price) return fallback
  if (typeof price === 'string') return price
  if (price.formatted) return price.formatted
  if (price.amount === undefined || price.amount === null) return fallback

  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: price.currency || 'TRY'
  }).format(Number(price.amount))
}

export function decimalValue(value, fallback = 0) {
  const number = Number.parseFloat(value)
  return Number.isFinite(number) ? number : fallback
}

export function sanitizeStep(value) {
  const step = decimalValue(value, 1)
  return step > 0 ? step : 1
}


