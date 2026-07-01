import { useNavigate } from 'react-router-dom'
import {
  TrendingUp, UserPlus, Settings, ShoppingBag, Megaphone,
  BarChart3, ChevronRight, Image, BookOpen, ArrowLeft,
} from 'lucide-react'
import QrSection from '@/shared/ui/QrSection'

// 스크린샷 자리 표시 컴포넌트 — 추후 실제 이미지 파일로 교체
function StepScreenshot({ label }: { label: string }) {
  return (
    <div className="w-full aspect-video bg-gray-50 rounded-xl flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-200 mt-4">
      <Image className="w-8 h-8 text-gray-300" />
      <p className="text-xs text-gray-400 font-medium">{label}</p>
      <p className="text-[10px] text-gray-300">Ảnh chụp màn hình sẽ được thêm sau</p>
    </div>
  )
}

// 단계별 가이드 데이터
const STEPS = [
  {
    number: 1,
    icon: UserPlus,
    title: 'Tạo tài khoản',
    color: 'bg-rose-100 text-[#EE1D52]',
    description: 'Truy cập trang chủ và nhấn nút "Đăng ký miễn phí". Nhập địa chỉ email, mật khẩu và tên shop của bạn. Sau khi đăng ký, kiểm tra hộp thư để xác nhận tài khoản.',
    tips: [
      'Sử dụng email bạn thường xuyên kiểm tra',
      'Tên shop có thể đặt theo tên TikTok Shop của bạn',
      'Kiểm tra cả thư mục thư rác (spam) nếu không thấy email xác nhận',
    ],
    screenshotLabel: 'Màn hình đăng ký tài khoản',
  },
  {
    number: 2,
    icon: Settings,
    title: 'Cài đặt phí & thông tin shop',
    color: 'bg-blue-100 text-blue-600',
    description: 'Vào menu "Cài đặt phí" ở thanh bên trái. Nhập ngày bắt đầu bán hàng, chọn trạng thái đăng ký kinh doanh và phiên bản công thức phí phù hợp với thời điểm bắt đầu của bạn.',
    tips: [
      'Nếu đăng ký kinh doanh: phí tính trên giá chưa VAT — chọn "Đã đăng ký kinh doanh"',
      'Công thức "Từ 01/04/2026" áp dụng cho đơn hàng sau ngày đó',
      'Tỷ lệ hoa hồng mặc định là 12.5% — điều chỉnh theo danh mục thực tế của bạn',
    ],
    screenshotLabel: 'Trang Cài đặt phí',
  },
  {
    number: 3,
    icon: ShoppingBag,
    title: 'Nhập dữ liệu đơn hàng',
    color: 'bg-green-100 text-green-600',
    description: 'Vào menu "Đơn hàng". Bạn có thể nhập đơn theo 2 cách: thủ công từng đơn hoặc tải lên file CSV xuất từ TikTok Shop Seller Center. Hệ thống tự động tính lợi nhuận sau khi nhập.',
    tips: [
      'Xuất CSV: TikTok Shop Seller Center → Đơn hàng → Tải xuống báo cáo',
      'Hỗ trợ cả file CSV tiếng Việt và tiếng Anh từ Seller Center',
      'Đơn hoàn trả và COD từ chối sẽ tự động tính thiệt hại',
    ],
    screenshotLabel: 'Trang Đơn hàng — nhập thủ công hoặc CSV',
  },
  {
    number: 4,
    icon: Megaphone,
    title: 'Nhập chi phí quảng cáo',
    color: 'bg-orange-100 text-orange-600',
    description: 'Vào menu "Quảng cáo". Ghi lại chi phí quảng cáo TikTok hằng ngày theo từng chiến dịch. Hệ thống tự động trừ vào lợi nhuận để tính lãi ròng thực tế.',
    tips: [
      'Nhập chi phí quảng cáo theo ngày để theo dõi chính xác hơn',
      'Đặt tên chiến dịch rõ ràng: "CPC tháng 6", "Livestream tuần 3"...',
      'Bảng điều khiển hiển thị điểm hòa vốn quảng cáo tự động',
    ],
    screenshotLabel: 'Trang Quảng cáo',
  },
  {
    number: 5,
    icon: BarChart3,
    title: 'Xem bảng điều khiển & phân tích lợi nhuận',
    color: 'bg-purple-100 text-purple-600',
    description: 'Vào "Tổng quan" để xem toàn bộ: doanh thu, lợi nhuận gộp, chi quảng cáo, lãi ròng và biểu đồ theo thời gian. Bộ lọc 7/30/90 ngày giúp bạn phân tích theo từng giai đoạn.',
    tips: [
      'Biên lợi nhuận dưới 5% sẽ được cảnh báo màu đỏ',
      'Xem "Ngưỡng hòa vốn quảng cáo" để biết khi nào ads đang lãi',
      'Sử dụng "Tính lợi nhuận" để thử nghiệm giá trước khi nhập kho',
    ],
    screenshotLabel: 'Bảng điều khiển Tổng quan',
  },
]

export default function GuidePage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 */}
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <button onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Trang chủ
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#EE1D52] rounded-lg flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-sm hidden sm:block">TikTok Shop VN</span>
          </div>
          <button onClick={() => navigate('/login')}
            className="bg-[#EE1D52] text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-[#cc1847] transition-colors">
            Đăng ký ngay
          </button>
        </div>
      </nav>

      {/* 페이지 헤더 */}
      <div className="bg-gradient-to-br from-rose-50 to-white py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-rose-100 text-[#EE1D52] text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            <BookOpen className="w-3.5 h-3.5" />
            Hướng dẫn sử dụng
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">
            Bắt đầu trong 5 phút
          </h1>
          <p className="text-gray-500 mt-3 max-w-xl mx-auto">
            Làm theo 5 bước đơn giản này để theo dõi lợi nhuận TikTok Shop của bạn ngay hôm nay.
          </p>
        </div>
      </div>

      {/* 단계별 가이드 */}
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-16">
        {STEPS.map((step) => {
          const Icon = step.icon
          return (
            <div key={step.number} className="flex flex-col md:flex-row gap-8">
              {/* 단계 번호 + 아이콘 */}
              <div className="flex flex-row md:flex-col items-center md:items-start gap-4 md:gap-3 shrink-0">
                <div className={`w-12 h-12 rounded-2xl ${step.color} flex items-center justify-center shrink-0`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-2 md:ml-0">
                  <span className="text-3xl font-extrabold text-gray-100">0{step.number}</span>
                </div>
              </div>

              {/* 내용 */}
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900">{step.title}</h2>
                <p className="text-gray-600 mt-2 leading-relaxed">{step.description}</p>

                {/* 팁 목록 */}
                <ul className="mt-4 space-y-2">
                  {step.tips.map(tip => (
                    <li key={tip} className="flex items-start gap-2 text-sm text-gray-500">
                      <ChevronRight className="w-4 h-4 text-[#EE1D52] shrink-0 mt-0.5" />
                      {tip}
                    </li>
                  ))}
                </ul>

                {/* 스크린샷 플레이스홀더 */}
                <StepScreenshot label={step.screenshotLabel} />
              </div>
            </div>
          )
        })}
      </div>

      {/* 마무리 CTA */}
      <div className="bg-gradient-to-br from-[#EE1D52] to-orange-600 py-16 px-4 text-center text-white">
        <h2 className="text-2xl font-bold">Sẵn sàng bắt đầu?</h2>
        <p className="text-white/80 mt-2 max-w-md mx-auto">
          Tạo tài khoản miễn phí và theo dõi lợi nhuận TikTok Shop ngay hôm nay.
        </p>
        <button onClick={() => navigate('/login')}
          className="mt-6 inline-flex items-center gap-2 bg-white text-[#EE1D52] px-8 py-3 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-all shadow-lg">
          Đăng ký miễn phí <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* QR 섹션 */}
      <QrSection />

      {/* 푸터 */}
      <footer className="border-t border-gray-100 py-8 px-4">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-[#EE1D52] rounded flex items-center justify-center">
              <TrendingUp className="w-2.5 h-2.5 text-white" />
            </div>
            <span className="text-sm font-bold text-gray-900">TikTok Shop VN</span>
          </div>
          <div className="flex gap-4 text-xs text-gray-400">
            <a href="/chinh-sach-bao-mat" className="hover:text-gray-600 transition-colors">Chính sách bảo mật</a>
            <a href="/dieu-khoan-su-dung" className="hover:text-gray-600 transition-colors">Điều khoản sử dụng</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
