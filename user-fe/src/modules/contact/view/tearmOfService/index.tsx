

import { Card } from '@/components/ui/card';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background">

      {/* Hero Section */}
      <section className="bg-primary/10 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-2 text-foreground">Điều Khoản Dịch Vụ</h1>
          <p className="text-gray-600">Cập nhật lần cuối: 25 tháng 3 năm 2026</p>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Card className="p-8 space-y-8">
          {/* Section 1 */}
          <section>
            <h2 className="text-2xl font-bold mb-4 text-foreground">1. Chấp Nhận Điều Khoản</h2>
            <p className="text-gray-700 leading-relaxed">
              Bằng cách truy cập và sử dụng nền tảng MarketHub, bạn đồng ý bị ràng buộc bởi các Điều Khoản Dịch Vụ này. Nếu bạn không đồng ý với bất kỳ phần nào, vui lòng không sử dụng nền tảng của chúng tôi.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-2xl font-bold mb-4 text-foreground">2. Tài Khoản Người Dùng</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Bạn chịu trách nhiệm duy trì tính bảo mật của tài khoản của bạn và mật khẩu của bạn. Bạn đồng ý chịu trách nhiệm cho tất cả các hoạt động diễn ra dưới tài khoản của bạn. Bạn phải thông báo cho chúng tôi ngay lập tức về bất kỳ truy cập trái phép nào.
            </p>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-2xl font-bold mb-4 text-foreground">3. Quy Tắc Hành Vi</h2>
            <p className="text-gray-700 leading-relaxed mb-4">Bạn đồng ý không:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Sử dụng nền tảng cho bất kỳ mục đích bất hợp pháp hoặc trái phép</li>
              <li>Tham gia vào bất kỳ hoạt động gian lận hoặc lừa dối nào</li>
              <li>Đăng nội dung xúc phạm, thù địch hoặc bạo lực</li>
              <li>Vi phạm bất kỳ quyền sở hữu trí tuệ nào</li>
              <li>Spam, quấy rối hoặc đe dọa người dùng khác</li>
              <li>Cố gắng xâm nhập hoặc vô hiệu hóa bất kỳ hệ thống bảo mật nào</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-2xl font-bold mb-4 text-foreground">4. Sản Phẩm và Dịch Vụ</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              MarketHub cung cấp một nền tảng để người mua và người bán giao dịch. Chúng tôi không phải là bên trong bất kỳ giao dịch nào và không bao gồm cho bất kỳ sản phẩm hoặc dịch vụ nào được bán trên nền tảng của chúng tôi.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Các người bán chịu trách nhiệm đảm bảo rằng các sản phẩm của họ tuân thủ tất cả các luật pháp và quy định hiện hành.
            </p>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-2xl font-bold mb-4 text-foreground">5. Giới Hạn Trách Nhiệm</h2>
            <p className="text-gray-700 leading-relaxed">
              Trong phạm vi tối đa được pháp luật cho phép, MarketHub sẽ không chịu trách nhiệm đối với bất kỳ thiệt hại gián tiếp, ngẫu nhiên, đặc biệt hoặc hậu quả nào phát sinh từ việc sử dụng hoặc không thể sử dụng nền tảng của chúng tôi.
            </p>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-2xl font-bold mb-4 text-foreground">6. Chấm Dứt</h2>
            <p className="text-gray-700 leading-relaxed">
              Chúng tôi có quyền chấm dứt hoặc tạm ngừng tài khoản của bạn nếu chúng tôi phát hiện bạn đang vi phạm các Điều Khoản Dịch Vụ này hoặc bất kỳ luật pháp hiện hành nào.
            </p>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-2xl font-bold mb-4 text-foreground">7. Thay Đổi Điều Khoản</h2>
            <p className="text-gray-700 leading-relaxed">
              MarketHub bảo lưu quyền sửa đổi các Điều Khoản Dịch Vụ này bất kỳ lúc nào. Bạn chịu trách nhiệm xem xét các thay đổi này. Việc tiếp tục sử dụng nền tảng sau khi các thay đổi đồng nghĩa với việc chấp nhận các Điều Khoản Dịch Vụ sửa đổi.
            </p>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-2xl font-bold mb-4 text-foreground">8. Luật Hiện Hành</h2>
            <p className="text-gray-700 leading-relaxed">
              Các Điều Khoản Dịch Vụ này được điều chỉnh bởi và được hiểu theo luật pháp của Cộng hòa Xã hội chủ nghĩa Việt Nam, không xem xét các nguyên tắc xung đột của luật pháp của nó.
            </p>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="text-2xl font-bold mb-4 text-foreground">9. Liên Hệ</h2>
            <p className="text-gray-700 leading-relaxed">
              Nếu bạn có bất kỳ câu hỏi nào về các Điều Khoản Dịch Vụ này, vui lòng liên hệ với chúng tôi tại: support@markethub.vn
            </p>
          </section>
        </Card>
      </div>

    </div>
  );
}
