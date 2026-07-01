import { useNavigate } from 'react-router-dom'
import { TrendingUp, ArrowLeft, FileText } from 'lucide-react'

// 이용약관 섹션 컴포넌트
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">{title}</h2>
      <div className="text-gray-600 text-sm leading-relaxed space-y-3">{children}</div>
    </section>
  )
}

export default function TermsPage() {
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
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Điều khoản sử dụng</h1>
            <p className="text-xs text-gray-400 mt-0.5">Cập nhật lần cuối: tháng 6 năm 2026</p>
          </div>
        </div>

        <Section title="1. Chấp nhận điều khoản">
          <p>
            Khi tạo tài khoản hoặc sử dụng TikTok Shop VN, bạn đồng ý với các điều khoản này.
            Nếu không đồng ý, vui lòng không sử dụng dịch vụ.
          </p>
        </Section>

        <Section title="2. Mô tả dịch vụ">
          <p>
            TikTok Shop VN là công cụ tính toán lợi nhuận và quản lý dữ liệu kinh doanh dành cho
            người bán hàng trên nền tảng TikTok Shop tại Việt Nam. Dịch vụ bao gồm:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Tính toán phí TikTok Shop theo từng danh mục (hoa hồng, giao dịch, xử lý)</li>
            <li>Theo dõi đơn hàng, doanh thu và lợi nhuận</li>
            <li>Ghi nhận chi phí quảng cáo và tính lãi ròng</li>
            <li>Bảng điều khiển phân tích lợi nhuận</li>
          </ul>
          <p className="mt-3 text-gray-500 text-xs">
            * TikTok Shop VN là công cụ độc lập, không phải sản phẩm chính thức của TikTok hoặc ByteDance.
          </p>
        </Section>

        <Section title="3. Miễn phí và thay đổi dịch vụ">
          <p>
            Dịch vụ hiện cung cấp <strong>hoàn toàn miễn phí</strong>. Chúng tôi bảo lưu quyền:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Thêm, sửa đổi hoặc ngưng tính năng bất kỳ lúc nào</li>
            <li>Giới thiệu gói trả phí trong tương lai với thông báo trước</li>
            <li>Dừng dịch vụ với thông báo tối thiểu 30 ngày</li>
          </ul>
        </Section>

        <Section title="4. Trách nhiệm của người dùng">
          <p>Khi sử dụng dịch vụ, bạn đồng ý:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Chỉ sử dụng cho mục đích hợp pháp và kinh doanh của bản thân</li>
            <li>Không chia sẻ tài khoản với người khác</li>
            <li>Bảo quản mật khẩu an toàn và thông báo ngay nếu phát hiện truy cập trái phép</li>
            <li>Không cố gắng truy cập dữ liệu của người dùng khác</li>
            <li>Không sử dụng công cụ tự động để khai thác hoặc tấn công hệ thống</li>
          </ul>
        </Section>

        <Section title="5. Độ chính xác của dữ liệu tính toán">
          <p>
            Các tính toán trong ứng dụng dựa trên công thức phí TikTok Shop được cập nhật theo
            chính sách công khai. Tuy nhiên:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Tỷ lệ phí có thể thay đổi theo chính sách mới của TikTok Shop</li>
            <li>Kết quả tính toán chỉ mang tính tham khảo, không phải con số chính thức từ TikTok</li>
            <li>Người dùng cần đối chiếu với báo cáo thực tế trên Seller Center</li>
          </ul>
          <p className="mt-3">
            Chúng tôi không chịu trách nhiệm cho các quyết định kinh doanh được đưa ra dựa
            hoàn toàn vào dữ liệu từ ứng dụng.
          </p>
        </Section>

        <Section title="6. Quyền sở hữu dữ liệu">
          <p>
            <strong>Dữ liệu bạn nhập (sản phẩm, đơn hàng, chi phí quảng cáo) thuộc về bạn.</strong>{' '}
            Chúng tôi không có quyền sử dụng dữ liệu kinh doanh của bạn cho bất kỳ mục đích nào
            ngoài việc hiển thị cho chính bạn.
          </p>
        </Section>

        <Section title="7. Chấm dứt tài khoản">
          <p>Chúng tôi có quyền tạm khóa hoặc xóa tài khoản khi:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Người dùng vi phạm điều khoản này</li>
            <li>Phát hiện hành vi tấn công hoặc lạm dụng hệ thống</li>
          </ul>
          <p className="mt-3">
            Bạn có thể yêu cầu xóa tài khoản bất kỳ lúc nào bằng cách liên hệ qua Zalo OA.
            Toàn bộ dữ liệu của bạn sẽ bị xóa vĩnh viễn trong vòng 7 ngày làm việc.
          </p>
        </Section>

        <Section title="8. Giới hạn trách nhiệm">
          <p>
            TikTok Shop VN không chịu trách nhiệm về thiệt hại gián tiếp, mất mát lợi nhuận
            hoặc thiệt hại dữ liệu phát sinh từ việc sử dụng hoặc không thể sử dụng dịch vụ,
            trong phạm vi tối đa được pháp luật Việt Nam cho phép.
          </p>
        </Section>

        <Section title="9. Luật áp dụng">
          <p>
            Các điều khoản này được điều chỉnh theo pháp luật Cộng hòa Xã hội Chủ nghĩa Việt Nam.
            Mọi tranh chấp sẽ được giải quyết tại tòa án có thẩm quyền tại Việt Nam.
          </p>
        </Section>

        <div className="mt-10 p-4 bg-blue-50 rounded-xl border border-blue-100 text-sm text-gray-600">
          <p>
            Nếu có câu hỏi về điều khoản sử dụng, vui lòng liên hệ qua Zalo OA hoặc xem{' '}
            <a href="/chinh-sach-bao-mat" className="text-[#EE1D52] underline">Chính sách bảo mật</a>.
          </p>
        </div>
      </div>

      <footer className="border-t border-gray-100 py-6 px-4 text-center text-xs text-gray-400">
        <a href="/" className="hover:text-gray-600 transition-colors">Trang chủ</a>
        <span className="mx-2">·</span>
        <a href="/chinh-sach-bao-mat" className="hover:text-gray-600 transition-colors">Chính sách bảo mật</a>
        <span className="mx-2">·</span>
        <a href="/huong-dan" className="hover:text-gray-600 transition-colors">Hướng dẫn sử dụng</a>
      </footer>
    </div>
  )
}
