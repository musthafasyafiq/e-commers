"use client"

import { usePathname } from "next/navigation"
import { getLocaleFromPathname, type Locale } from "@/lib/i18n"
import { t } from "@/lib/translations"

export function useTranslation() {
  const pathname = usePathname()
  const locale = getLocaleFromPathname(pathname)
  
  const translate = (key: string): string => {
    return t(key, locale)
  }
  
  return {
    t: translate,
    locale,
    isRTL: false // Add RTL support later if needed
  }
}
