import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { type Lang, type TKey, createT } from './i18n'

interface LangState {
  lang: Lang
  t: (key: TKey, params?: Record<string, string | number>) => string
  toggle: () => void
}

export const useLang = create<LangState>()(
  persist(
    (set, get) => ({
      lang: 'vi' as Lang,
      t: createT('vi'),
      toggle: () => {
        const next: Lang = get().lang === 'vi' ? 'en' : 'vi'
        set({ lang: next, t: createT(next) })
      },
    }),
    { name: 'tiktok-lang', partialize: (s) => ({ lang: s.lang }) }
  )
)
