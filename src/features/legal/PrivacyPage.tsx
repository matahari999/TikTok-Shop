import { useNavigate } from 'react-router-dom'
import { TrendingUp, ArrowLeft, Shield } from 'lucide-react'

// 개인정보처리방침 섹션 컴포넌트
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">{title}</h2>
      <div className="text-gray-600 text-sm leading-relaxed space-y-3">{children}</div>
    </section>
  )
}

export default function PrivacyPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 */}
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <button onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#EE1D52] rounded-lg flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-sm hidden sm:block">TikTok Shop VN</span>
          </div>
          <div className="w-16" />
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* 페이지 제목 */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5 text-[#EE1D52]" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Chính sách bảo mật</h1>
            <p className="text-xs text-gray-400 mt-0.5">Cập nhật lần cuối: tháng 6 năm 2026</p>
          </div>
        </div>

        <Section title="1. Giới thiệu">
          <p>
            TikTok Shop VN ("chúng tôi") cam kết bảo vệ quyền riêng tư của người dùng.
            Chính sách này giải thích dữ liệu nào chúng tôi thu thập, cách lưu trữ và sử dụng.
          </p>
          <p>
            Dịch vụ này là công cụ quản lý lợi nhuận dành cho người bán hàng trên TikTok Shop tại Việt Nam.
            Chúng tôi không có quan hệ chính thức với TikTok hoặc ByteDance.
          </p>
        </Section>

        <Section title="2. Dữ liệu chúng tôi thu thập">
          <p><strong>Thông tin tài khoản:</strong></p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Địa chỉ email (dùng để đăng nhập và liên hệ)</li>
            <li>Tên shop hoặc tên bạn (tùy chọn khi đăng ký)</li>
          </ul>
          <p className="mt-3"><strong>Dữ liệu kinh doanh bạn tự nhập:</strong></p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Thông tin sản phẩm: tên, giá vốn, giá bán, danh mục, tồn kho</li>
            <li>Dữ liệu đơn hàng: ngày đặt, số lượng, doanh thu, trạng thái</li>
            <li>Chi phí quảng cáo: ngày, số tiền, tên chiến dịch</li>
            <li>Cài đặt phí và thông tin shop (ngày bắt đầu, đăng ký kinh doanh)</li>
          </ul>
          <p className="mt-3"><strong>Chúng tôi không thu thập:</strong></p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Thông tin thanh toán hoặc tài khoản ngân hàng</li>
            <li>Dữ liệu từ tài khoản TikTok Shop của bạn (bạn tự nhập thủ công)</li>
            <li>Dữ liệu vị trí, danh bạ hoặc thông tin cá nhân nhạy cảm</li>
          </ul>
        </Section>

        <Section title="3. Cách chúng tôi lưu trữ dữ liệu">
          <p>
            Toàn bộ dữ liệu được lưu trữ trên <strong>Supabase</strong> — nền tảng cơ sở dữ liệu đám mây
            tuân thủ tiêu chuẩn bảo mật quốc tế (SOC 2 Type II, ISO 27001).
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Mật khẩu được mã hóa và không bao giờ lưu dưới dạng văn bản thuần</li>
            <li>Kết nối được mã hóa bằng HTTPS/TLS</li>
            <li>Mỗi người dùng chỉ xem được dữ liệu của chính mình (Row Level Security)</li>
            <li>Máy chủ đặt tại Singapore/US theo cấu hình Supabase</li>
          </ul>
        </Section>

        <Section title="4. Chúng tôi sử dụng dữ liệu để làm gì">
          <ul className="list-disc pl-5 space-y-1">
            <li>Hiển thị bảng điều khiển và tính toán lợi nhuận của bạn</li>
            <li>Lưu cài đặt phí và tùy chọn cá nhân</li>
            <li>Gửi email xác nhận tài khoản hoặc đặt lại mật khẩu</li>
          </ul>
          <p className="mt-3">
            Chúng tôi <strong>không</strong> sử dụng dữ liệu của bạn để phân tích thị trường, quảng cáo
            hoặc bán cho bên thứ ba.
          </p>
        </Section>

        <Section title="5. Chia sẻ dữ liệu với bên thứ ba">
          <p>
            Chúng tôi <strong>không bán, không chia sẻ, không cho thuê</strong> dữ liệu cá nhân của bạn
            với bất kỳ bên thứ ba nào vì mục đích thương mại.
          </p>
          <p>
            Dữ liệu chỉ được chuyển đến Supabase (nhà cung cấp hạ tầng) để phục vụ chức năng của ứng dụng.
            Supabase có chính sách bảo mật riêng tại{' '}
            <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer"
              className="text-[#EE1D52] underline">supabase.com/privacy</a>.
          </p>
        </Section>

        <Section title="6. Quyền của bạn">
          <p>Bạn có toàn quyền đối với dữ liệu của mình:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Xem & sửa:</strong> Trực tiếp trong ứng dụng</li>
            <li><strong>Xóa dữ liệu:</strong> Liên hệ chúng tôi để yêu cầu xóa toàn bộ tài khoản và dữ liệu</li>
            <li><strong>Xuất dữ liệu:</strong> Liên hệ để nhận bản xuất dữ liệu của bạn</li>
          </ul>
          <p className="mt-3">
            Để thực hiện yêu cầu, vui lòng liên hệ qua Zalo OA hoặc email được liệt kê trên trang chủ.
            Chúng tôi sẽ xử lý trong vòng 7 ngày làm việc.
          </p>
        </Section>

        <Section title="7. Cookie và lưu trữ cục bộ">
          <p>
            Ứng dụng sử dụng <strong>localStorage</strong> của trình duyệt để lưu trạng thái đăng nhập
            và tùy chọn ngôn ngữ. Không có cookie theo dõi hoặc quảng cáo.
          </p>
        </Section>

        <Section title="8. Thay đổi chính sách">
          <p>
            Khi có thay đổi quan trọng, chúng tôi sẽ thông báo qua email hoặc thông báo trong ứng dụng
            ít nhất 7 ngày trước khi có hiệu lực.
          </p>
        </Section>

        <div className="mt-10 p-4 bg-rose-50 rounded-xl border border-rose-100 text-sm text-gray-600">
          <p>
            Nếu có câu hỏi về chính sách bảo mật, vui lòng liên hệ qua Zalo OA hoặc xem{' '}
            <a href="/dieu-khoan-su-dung" className="text-[#EE1D52] underline">Điều khoản sử dụng</a>.
          </p>
        </div>
      </div>

      <footer className="border-t border-gray-100 py-6 px-4 text-center text-xs text-gray-400">
        <a href="/" className="hover:text-gray-600 transition-colors">Trang chủ</a>
        <span className="mx-2">·</span>
        <a href="/dieu-khoan-su-dung" className="hover:text-gray-600 transition-colors">Điều khoản sử dụng</a>
        <span className="mx-2">·</span>
        <a href="/huong-dan" className="hover:text-gray-600 transition-colors">Hướng dẫn sử dụng</a>
      </footer>
    </div>
  )
}
