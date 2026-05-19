const currencyFormatter = new Intl.NumberFormat('tr-TR', {
  style: 'currency',
  currency: 'TRY',
  maximumFractionDigits: 0,
})

const numberFormatter = new Intl.NumberFormat('tr-TR')

export function formatCurrency(value: number) {
  return currencyFormatter.format(value)
}

export function formatNumber(value: number) {
  return numberFormatter.format(value)
}

export function formatPercent(value: number, fractionDigits = 1) {
  return `${(value * 100).toLocaleString('tr-TR', {
    maximumFractionDigits: fractionDigits,
  })}%`
}

export function formatSignedCurrency(value: number) {
  const formatted = formatCurrency(Math.abs(value))
  return value < 0 ? `-${formatted}` : formatted
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('tr-TR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}
