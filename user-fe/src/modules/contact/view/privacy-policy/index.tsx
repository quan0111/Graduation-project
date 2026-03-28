
import { Card } from '@/components/ui/card';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">

      {/* Hero Section */}
      <section className="bg-primary/10 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-2 text-foreground">Chính Sách Bảo Mật</h1>
          <p className="text-gray-600">Cập nhật lần cuối: 25 tháng 3 năm 2026</p>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Card className="p-8 space-y-8">
          {/* Section 1 */}
          <section>
            <h2 className="text-2xl font-bold mb-4 text-foreground">1. Giới Thiệu</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              MarketHub ("chúng tôi", "của chúng tôi" hoặc "chúng ta") cam kết bảo vệ quyền riêng tư của bạn. Chính sách bảo mật này giải thích cách chúng tôi thu thập, sử dụng, công khai và bảo vệ thông tin của bạn khi bạn truy cập và sử dụng nền tảng MarketHub.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-2xl font-bold mb-4 text-foreground">2. Thông Tin Chúng Tôi Thu Thập</h2>
            <p className="text-gray-700 leading-relaxed mb-4">Chúng tôi có thể thu thập thông tin về bạn theo nhiều cách:</p>
            <div className="space-y-3">
              <p className="text-gray-700"><span className="font-semibold">Thông tin bạn cung cấp trực tiếp:</span> Tên, địa chỉ email, số điện thoại, địa chỉ giao hàng, phương thức thanh toán.</p>
              <p className="text-gray-700"><span className="font-semibold">Dữ liệu được thu thập tự động:</span> Địa chỉ IP, loại trình duyệt, trang được truy cập, thời gian truy cập, thông tin vị trí.</p>
              <p className="text-gray-700"><span className="font-semibold">Cookie và công nghệ tương tự:</span> Chúng tôi sử dụng cookie để nhớ các ưu tiên của bạn và cải thiện trải nghiệm của bạn.</p>
            </div>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-2xl font-bold mb-4 text-foreground">3. Cách Chúng Tôi Sử Dụng Thông Tin</h2>
            <p className="text-gray-700 leading-relaxed mb-4">Chúng tôi sử dụng thông tin được thu thập cho các mục đích sau:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Xử lý đơn hàng và cung cấp dịch vụ của chúng tôi</li>
              <li>Gửi thông tin cập nhật về tài khoản của bạn</li>
              <li>Cải thiện nền tảng và dịch vụ của chúng tôi</li>
              <li>Gửi thông tin tiếp thị (với sự đồng ý của bạn)</li>
              <li>Tuân thủ các yêu cầu pháp luật và quy định</li>
              <li>Bảo vệ chống lại gian lận và các hoạt động bất hợp pháp</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-2xl font-bold mb-4 text-foreground">4. Bảo Vệ Dữ Liệu</h2>
            <p className="text-gray-700 leading-relaxed">
              Chúng tôi thực hiện các biện pháp bảo mật thích hợp để bảo vệ thông tin cá nhân của bạn khỏi truy cập, sửa đổi, tiết lộ hoặc hủy diệt trái phép. Chúng tôi sử dụng mã hóa SSL, tường lửa và các hệ thống bảo mật khác.
            </p>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-2xl font-bold mb-4 text-foreground">5. Quyền Của Bạn</h2>
            <p className="text-gray-700 leading-relaxed mb-4">Bạn có quyền:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Truy cập thông tin cá nhân của bạn</li>
              <li>Yêu cầu sửa chữa thông tin không chính xác</li>
              <li>Yêu cầu xóa thông tin cá nhân của bạn</li>
              <li>Từ chối nhận thông tin tiếp thị</li>
              <li>Yêu cầu hạn chế xử lý dữ liệu của bạn</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-2xl font-bold mb-4 text-foreground">6. Liên Hệ</h2>
            <p className="text-gray-700 leading-relaxed">
              Nếu bạn có bất kỳ câu hỏi nào về chính sách bảo mật này, vui lòng liên hệ với chúng tôi tại: privacy@markethub.vn
            </p>
          </section>
        </Card>
      </div>

=    </div>
  );
}
