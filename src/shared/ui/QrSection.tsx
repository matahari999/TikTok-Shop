import { useRef } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import { Download, QrCode } from 'lucide-react'

// VITE_SITE_URL 미설정 시 현재 도메인으로 폴백
function getSiteUrl(): string {
  return (import.meta.env.VITE_SITE_URL as string | undefined) || window.location.origin
}

export default function QrSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const url = getSiteUrl()

  // QR 코드 PNG 다운로드
  const handleDownload = () => {
    // QRCodeCanvas가 렌더링한 canvas 엘리먼트를 id로 참조
    const canvas = document.getElementById('site-qr-canvas') as HTMLCanvasElement | null
    if (!canvas) return
    const pngUrl = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.download = 'tiktok-shop-vn-qr.png'
    a.href = pngUrl
    a.click()
  }

  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-gray-200 text-gray-600 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
          <QrCode className="w-3.5 h-3.5" />
          Chia sẻ nhanh
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Quét mã QR để truy cập nhanh</h2>
        <p className="text-gray-500 text-sm mt-2 mb-8">
          Dùng cho bài đăng Facebook, Zalo hoặc in ấn tờ rơi
        </p>

        <div className="inline-flex flex-col items-center gap-5 bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
          {/* QR 코드 캔버스 — id로 다운로드 핸들러에서 참조 */}
          <QRCodeCanvas
            id="site-qr-canvas"
            ref={canvasRef}
            value={url}
            size={200}
            bgColor="#ffffff"
            fgColor="#1f2937"
            level="M"
            includeMargin={true}
          />
          <div className="text-center">
            <p className="text-xs text-gray-500 font-mono break-all max-w-xs">{url}</p>
          </div>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 bg-[#EE1D52] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#cc1847] transition-colors"
          >
            <Download className="w-4 h-4" />
            Tải xuống PNG
          </button>
          <p className="text-xs text-gray-400">Kích thước 200×200px · Phù hợp để in ấn và đăng mạng xã hội</p>
        </div>
      </div>
    </section>
  )
}
