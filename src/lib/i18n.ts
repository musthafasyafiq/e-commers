export const defaultLocale = 'en'
export const locales = ['en', 'id'] as const
export type Locale = typeof locales[number]

export const localeNames: Record<Locale, string> = {
  en: 'English',
  id: 'Bahasa Indonesia'
}

export const localeFlags: Record<Locale, string> = {
  en: '🇺🇸',
  id: '🇮🇩'
}

export function getLocaleFromPathname(pathname: string): Locale {
  const segments = pathname.split('/')
  const locale = segments[1] as Locale
  return locales.includes(locale) ? locale : defaultLocale
}

export function removeLocaleFromPathname(pathname: string): string {
  const segments = pathname.split('/')
  const locale = segments[1] as Locale
  if (locales.includes(locale)) {
    return '/' + segments.slice(2).join('/')
  }
  return pathname
}
