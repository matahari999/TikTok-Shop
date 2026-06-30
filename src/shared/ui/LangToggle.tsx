import { useLang } from '@/shared/lib/langStore'

export default function LangToggle({ className = '' }: { className?: string }) {
  const { lang, toggle } = useLang()
  return (
    <button
      onClick={toggle}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:bg-gray-100 transition-colors ${className}`}
      title={lang === 'vi' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
    >
      {lang === 'vi' ? '🇻🇳 VI' : '🇬🇧 EN'}
    </button>
  )
}
