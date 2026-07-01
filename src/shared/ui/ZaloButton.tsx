// Zalo OA 플로팅 버튼 — 화면 우측 하단 고정
// VITE_ZALO_OA_ID 환경변수 미설정 시 버튼 숨김

const ZALO_OA_ID = import.meta.env.VITE_ZALO_OA_ID as string | undefined

export default function ZaloButton() {
  if (!ZALO_OA_ID) return null

  return (
    <a
      href={`https://zalo.me/${ZALO_OA_ID}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Liên hệ qua Zalo"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#0068FF] text-white pl-3 pr-4 py-2.5 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 group"
    >
      {/* Zalo SVG 로고 */}
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="shrink-0">
        <rect width="24" height="24" rx="6" fill="#0068FF" />
        <text x="12" y="17" textAnchor="middle" fontSize="11" fontWeight="800" fill="white" fontFamily="Arial, sans-serif">
          Za
        </text>
      </svg>
      <span className="text-sm font-semibold whitespace-nowrap">
        Chat Zalo
      </span>
      {/* 호버 시 툴팁 */}
      <span className="absolute -top-9 right-0 bg-gray-900 text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
        Liên hệ hỗ trợ qua Zalo
      </span>
    </a>
  )
}
