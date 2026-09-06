const MEASUREMENT_ID = 'G-4ZZ79CB412'

declare global {
  interface Window {
    dataLayer: unknown[]
    gtag: (...args: unknown[]) => void
  }
}

export function initAnalytics(): void {
  if (!import.meta.env.PROD || document.getElementById('ga4-gtag')) {
    return
  }

  const script = document.createElement('script')
  script.id = 'ga4-gtag'
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`
  document.head.appendChild(script)

  window.dataLayer = window.dataLayer || []
  window.gtag = function (..._args: unknown[]): void {
    window.dataLayer.push(arguments)
  }
  window.gtag('js', new Date())
  window.gtag('config', MEASUREMENT_ID)
}
