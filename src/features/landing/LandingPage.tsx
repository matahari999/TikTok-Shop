import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  TrendingUp, Calculator, ShoppingBag, Target,
  Megaphone, BarChart3, ShieldCheck, Smartphone, Download,
  ChevronRight, Star, ArrowUpRight, CheckCircle2, X,
} from 'lucide-react'
import { useAuthStore } from '@/features/auth/authStore'
import { useLang } from '@/shared/lib/langStore'
import LangToggle from '@/shared/ui/LangToggle'
import usePwaInstall from '@/shared/lib/usePwaInstall'

function FloatingElement({ delay, size, x, y, color }: { delay: number; size: number; x: string; y: string; color: string }) {
  return (
    <div
      className="absolute rounded-full opacity-20 animate-float"
      style={{
        width: size, height: size, left: x, top: y,
        backgroundColor: color,
        animationDelay: `${delay}s`,
        animationDuration: `${6 + delay}s`,
      }}
    />
  )
}

export default function LandingPage() {
  const navigate = useNavigate()
  const { t } = useLang()
  const { user } = useAuthStore()
  const pwa = usePwaInstall()
  const [scrolled, setScrolled] = useState(0)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(Math.min(window.scrollY / 400, 1))
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleGetStarted = () => {
    if (user) navigate('/app/dashboard')
    else navigate('/login')
  }

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* PWA install banner */}
      {pwa.canInstall && !dismissed && (
        <div className="bg-[#EE1D52] text-white text-xs py-2 px-4 flex items-center justify-between font-medium">
          <button onClick={pwa.install} className="flex items-center gap-2 flex-1">
            <Download className="w-4 h-4 shrink-0" />
            <span>Cài đặt ứng dụng TikTok Shop VN để sử dụng nhanh hơn</span>
          </button>
          <button onClick={() => setDismissed(true)} className="ml-3 p-1 hover:bg-white/20 rounded-full transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {pwa.installed && (
        <div className="bg-green-600 text-white text-center text-xs py-1.5 font-medium flex items-center justify-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Đã cài đặt ứng dụng thành công</span>
        </div>
      )}

      {/* Navbar */}
      <nav className={`sticky top-0 z-40 transition-all duration-300 ${scrolled > 0.3 ? 'bg-white/90 backdrop-blur-xl shadow-sm' : 'bg-transparent'}`}>
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#EE1D52] rounded-lg flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-sm">TikTok Shop VN</span>
          </div>
          <div className="flex items-center gap-3">
            <LangToggle />
            {user ? (
              <button onClick={() => navigate('/app/dashboard')}
                className="bg-[#EE1D52] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#cc1847] transition-colors shadow-sm shadow-rose-200">
                Dashboard
              </button>
            ) : (
              <>
                <button onClick={() => navigate('/login')}
                  className="text-gray-500 hover:text-gray-800 text-sm font-medium px-3 py-2 transition-colors">
                  {t('auth.login')}
                </button>
                <button onClick={() => navigate('/login')}
                  className="bg-[#EE1D52] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#cc1847] transition-colors shadow-sm shadow-rose-200">
                  {t('auth.register')}
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-50 via-white to-orange-50" />
        <div className="absolute inset-0">
          <FloatingElement delay={0} size={320} x="-5%" y="-10%" color="#EE1D52" />
          <FloatingElement delay={1.5} size={200} x="80%" y="20%" color="#f97316" />
          <FloatingElement delay={3} size={250} x="20%" y="60%" color="#EE1D52" />
          <FloatingElement delay={0.8} size={150} x="70%" y="70%" color="#f43f5e" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 pt-20 pb-28 md:pt-28 md:pb-36">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-rose-100 text-[#EE1D52] text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
              <Star className="w-3 h-3" />
              Công cụ quản lý lợi nhuận TikTok Shop #1 tại Việt Nam
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-[1.1] tracking-tight">
              Quản lý lợi nhuận{' '}
              <span className="bg-gradient-to-r from-[#EE1D52] to-orange-500 bg-clip-text text-transparent">
                TikTok Shop
              </span>
              <br />
              thông minh hơn mỗi ngày
            </h1>
            <p className="text-lg text-gray-500 mt-6 max-w-xl leading-relaxed">
              Tính toán phí, theo dõi đơn hàng, phân tích lợi nhuận sau phí TikTok Shop 2026.
              Dành cho người bán hàng Việt Nam.
            </p>
            <div className="flex flex-wrap gap-3 mt-8">
              <button onClick={handleGetStarted}
                className="inline-flex items-center gap-2 bg-[#EE1D52] text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-[#cc1847] transition-all shadow-lg shadow-rose-200 hover:shadow-xl hover:-translate-y-0.5">
                Bắt đầu ngay <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex items-center gap-2 bg-white text-gray-700 px-6 py-3 rounded-xl font-medium text-sm border border-gray-200 hover:border-gray-300 transition-all">
                Khám phá tính năng
              </button>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-6 mt-10 pt-8 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-7 h-7 rounded-full bg-gradient-to-br from-rose-300 to-orange-300 border-2 border-white" />
                  ))}
                </div>
                <span className="text-sm text-gray-500">
                  <strong className="text-gray-800">2.4k+</strong> người bán đang sử dụng
                </span>
              </div>
              <div className="flex items-center gap-1 text-yellow-500">
                {[1,2,3,4,5].map(i => <Star key={i} className="w-3.5 h-3.5 fill-current" />)}
                <span className="text-sm text-gray-500 ml-1">4.9</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics strip */}
      <section className="relative -mt-12 z-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100">
            {[
              { value: '₫0', label: 'Phí thiết lập', icon: ShieldCheck },
              { value: '2026', label: 'Cập nhật phí mới nhất', icon: BarChart3 },
              { value: '60s', label: 'Nhập dữ liệu nhanh', icon: Calculator },
              { value: '24/7', label: 'Truy cập mọi lúc', icon: Smartphone },
            ].map(({ value, label, icon: Icon }) => (
              <div key={label} className="p-5 text-center">
                <Icon className="w-5 h-5 text-[#EE1D52] mx-auto mb-2" />
                <p className="text-lg font-bold text-gray-900">{value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-xs font-semibold text-[#EE1D52] bg-rose-100 px-3 py-1 rounded-full">
              TÍNH NĂNG
            </span>
            <h2 className="text-3xl font-bold text-gray-900 mt-4">
              Mọi thứ bạn cần để quản lý lợi nhuận
            </h2>
            <p className="text-gray-500 mt-3 max-w-lg mx-auto">
              Từ tính phí, theo dõi đơn hàng đến phân tích quảng cáo — tất cả trong một bảng điều khiển.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Calculator, title: 'Tính lợi nhuận',
                desc: 'Tính phí TikTok Shop 2026 tự động theo từng danh mục. Hỗ trợ công thức cũ & mới.',
                color: 'bg-rose-50 text-[#EE1D52]',
                features: ['Phí hoa hồng, giao dịch, xử lý', 'Công thức trước/sau 01/04/2026', 'Đã đăng ký kinh doanh (trừ thuế)'],
              },
              {
                icon: ShoppingBag, title: 'Quản lý đơn hàng',
                desc: 'Nhập đơn hàng thủ công, CSV hoặc kết nối TikTok Shop. Theo dõi COD & hoàn trả.',
                color: 'bg-blue-50 text-blue-600',
                features: ['Nhập CSV tự động', 'Phân loại trạng thái đơn', 'Tính thiệt hại COD'],
              },
              {
                icon: TrendingUp, title: 'Bảng điều khiển',
                desc: 'Doanh thu, lợi nhuận, biên lợi nhuận, chi phí quảng cáo — trực quan hóa.',
                color: 'bg-green-50 text-green-600',
                features: ['Biểu đồ doanh thu', 'Ngưỡng hòa vốn ads', 'Theo dõi thời gian thử thách'],
              },
              {
                icon: Megaphone, title: 'Chi phí quảng cáo',
                desc: 'Ghi lại chi phí quảng cáo TikTok, tính lãi ròng tự động.',
                color: 'bg-orange-50 text-orange-600',
                features: ['Ghi chi phí theo chiến dịch', 'Tính ROI tự động', 'Cảnh báo vượt ngân sách'],
              },
              {
                icon: Target, title: 'Phân tích biên lợi nhuận',
                desc: 'Phát hiện sản phẩm biên thấp, gợi ý điều chỉnh giá bán.',
                color: 'bg-purple-50 text-purple-600',
                features: ['Cảnh báo biên < 5%', 'Gợi ý tăng giá', 'Phân tích theo danh mục'],
              },
              {
                icon: BarChart3, title: 'Báo cáo & Xuất xuất',
                desc: 'Xem báo cáo theo tuần/tháng/quý, xuất dữ liệu để phân tích.',
                color: 'bg-cyan-50 text-cyan-600',
                features: ['Bộ lọc thời gian linh hoạt', 'So sánh kỳ', 'Dữ liệu chi tiết'],
              },
            ].map(({ icon: Icon, title, desc, color, features }) => (
              <div key={title}
                className="group bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-4`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
                <p className="text-xs text-gray-500 mt-2 leading-relaxed">{desc}</p>
                <ul className="mt-4 space-y-1.5">
                  {features.map(f => (
                    <li key={f} className="flex items-center gap-1.5 text-xs text-gray-400">
                      <div className="w-1 h-1 rounded-full bg-[#EE1D52]" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fee structure preview */}
      <section className="py-20 bg-gradient-to-br from-rose-50 to-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Cấu trúc phí TikTok Shop 2026</h2>
            <p className="text-gray-500 mt-3">Minh bạch, cập nhật tự động theo chính sách mới nhất</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { label: 'Hoa hồng sàn', rate: '12.5%', note: 'Tùy danh mục (5%–12.5%)', icon: TrendingUp },
              { label: 'Phí giao dịch', rate: '6.0%', note: 'Công thức mới từ 01/04/2026', icon: ArrowUpRight },
              { label: 'Phí xử lý đơn', rate: '3.000₫', note: 'Mỗi đơn giao thành công', icon: ShoppingBag },
            ].map(({ label, rate, note, icon: Icon }) => (
              <div key={label} className="bg-white rounded-2xl border border-gray-100 p-6 text-center shadow-sm">
                <Icon className="w-6 h-6 text-[#EE1D52] mx-auto mb-3" />
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">{label}</p>
                <p className="text-3xl font-extrabold text-gray-900 mt-1">{rate}</p>
                <p className="text-xs text-gray-400 mt-2">{note}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 max-w-3xl mx-auto bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <p className="text-xs font-semibold text-gray-700 mb-2">📐 Công thức phí giao dịch</p>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-rose-50 rounded-xl p-3">
                <span className="text-gray-500">Trước 01/04/2026:</span>
                <code className="block text-gray-800 mt-1 font-medium">(Tiền KH trả − Hoàn trả) × 6%</code>
              </div>
              <div className="bg-rose-50 rounded-xl p-3">
                <span className="text-gray-500">Từ 01/04/2026:</span>
                <code className="block text-gray-800 mt-1 font-medium">(Giá vốn − CK + Phí VC − Hoàn trả) × 6%</code>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PWA install section */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-gradient-to-br from-[#EE1D52] to-orange-600 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
            <div className="relative max-w-2xl">
              <div className="flex items-center gap-3 mb-4">
                <Smartphone className="w-6 h-6 text-rose-200" />
                <span className="text-rose-200 text-sm font-semibold tracking-wide">PWA — Ứng dụng web</span>
              </div>
              <h2 className="text-3xl font-bold">
                Sử dụng như ứng dụng<br />mà không cần cài đặt CH Play
              </h2>
              <p className="text-white/80 mt-4 leading-relaxed max-w-lg">
                Thêm màn hình chính và sử dụng TikTok Shop VN như một ứng dụng Android thực thụ.
                Không cần cửa hàng ứng dụng, không phiền phức.
              </p>
              <div className="flex flex-wrap gap-4 mt-8">
                <button onClick={pwa.install}
                  className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl px-5 py-3 transition-all hover:scale-105">
                  <Download className="w-5 h-5" />
                  <div className="text-left">
                    <p className="text-sm font-semibold">
                      {pwa.installed ? 'Đã cài đặt' : 'Cài đặt ngay'}
                    </p>
                    <p className="text-xs text-white/60">Thêm vào màn hình chính</p>
                  </div>
                </button>
                <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-xl px-4 py-3">
                  <ShieldCheck className="w-5 h-5" />
                  <div>
                    <p className="text-sm font-medium">Bảo mật</p>
                    <p className="text-xs text-white/60">Dữ liệu qua Supabase</p>
                  </div>
                </div>
              </div>
              {!pwa.canInstall && !pwa.installed && (
                <p className="text-xs text-white/50 mt-3 italic">
                  Khả dụng khi truy cập qua HTTPS (localhost:3333 hoặc Vercel)
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            Sẵn sàng quản lý lợi nhuận?
          </h2>
          <p className="text-gray-500 mt-3 max-w-md mx-auto">
            Miễn phí, không ràng buộc. Bắt đầu theo dõi lợi nhuận TikTok Shop của bạn ngay hôm nay.
          </p>
          <button onClick={handleGetStarted}
            className="mt-8 inline-flex items-center gap-2 bg-[#EE1D52] text-white px-8 py-3.5 rounded-xl font-semibold text-sm hover:bg-[#cc1847] transition-all shadow-lg shadow-rose-200 hover:shadow-xl hover:-translate-y-0.5">
            <TrendingUp className="w-4 h-4" />
            Bắt đầu ngay — Miễn phí
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-[#EE1D52] rounded flex items-center justify-center">
                <TrendingUp className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm font-bold text-gray-900">TikTok Shop VN</span>
            </div>
            <p className="text-xs text-gray-400">
              {t('auth.footer')} · Dành cho người bán hàng Việt Nam
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
