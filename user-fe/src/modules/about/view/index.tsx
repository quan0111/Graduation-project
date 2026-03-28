

import { Card } from '@/components/ui/card';
import { Users, Award, Globe, Zap } from 'lucide-react';

export default function AboutPage() {
  const values = [
    {
      icon: Users,
      title: 'Cộng Đồng',
      description: 'Xây dựng một cộng đồng tin cậy giữa người mua và người bán'
    },
    {
      icon: Award,
      title: 'Chất Lượng',
      description: 'Đảm bảo sản phẩm chính hãng và dịch vụ tốt nhất'
    },
    {
      icon: Globe,
      title: 'Tiếp Cận',
      description: 'Kết nối mọi người tới các sản phẩm chất lượng từ khắp nơi'
    },
    {
      icon: Zap,
      title: 'Đổi Mới',
      description: 'Liên tục cải tiến công nghệ để phục vụ khách hàng tốt hơn'
    }
  ];

  const team = [
    { name: 'Nguyễn Văn A', role: 'CEO & Founder', image: '👔' },
    { name: 'Trần Thị B', role: 'CTO', image: '💼' },
    { name: 'Lê Văn C', role: 'Head of Operations', image: '🎯' },
    { name: 'Phạm Thị D', role: 'Head of Customer Service', image: '💬' }
  ];

  return (
    <div className="min-h-screen bg-background">

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-primary/80 text-white py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Về MarketHub</h1>
          <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto">
            Nền tảng thương mại điện tử hàng đầu Việt Nam, nơi mọi người có thể mua bán với niềm tin
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Story Section */}
        <section className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4 text-foreground">Câu Chuyện Của Chúng Tôi</h2>
              <p className="text-gray-600 mb-4 leading-relaxed">
                MarketHub được thành lập vào năm 2020 với một sứ mệnh đơn giản: kết nối người mua và người bán bằng một nền tảng đáng tin cậy, an toàn và tiện lợi.
              </p>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Trong hơn 4 năm, chúng tôi đã phục vụ hàng triệu người dùng, xử lý hàng triệu giao dịch thành công và tạo dựng một cộng đồng thương mại điện tử sôi động.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Ngày hôm nay, MarketHub tự hào là một trong những nền tảng thương mại điện tử lớn nhất tại Việt Nam, với sứ mệnh tiếp tục phục vụ khách hàng với tận tâm.
              </p>
            </div>
            <div className="bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg p-8 text-center">
              <div className="text-6xl mb-4">🏢</div>
              <h3 className="text-2xl font-bold text-foreground mb-2">MarketHub</h3>
              <p className="text-gray-600">Thương Mại Điện Tử Tin Cậy</p>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">Giá Trị Cơ Bản</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, idx) => {
              const Icon = value.icon;
              return (
                <Card key={idx} className="p-6 text-center hover:shadow-lg transition-shadow">
                  <Icon className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="text-lg font-bold mb-2 text-foreground">{value.title}</h3>
                  <p className="text-gray-600 text-sm">{value.description}</p>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Stats Section */}
        <section className="mb-16 bg-primary/5 rounded-lg p-12">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">Con Số Ấn Tượng</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">2M+</div>
              <p className="text-gray-600">Người Dùng</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">10M+</div>
              <p className="text-gray-600">Sản Phẩm</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">50M+</div>
              <p className="text-gray-600">Giao Dịch</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">98%</div>
              <p className="text-gray-600">Hài Lòng</p>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">Đội Ngũ Lãnh Đạo</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, idx) => (
              <Card key={idx} className="p-6 text-center hover:shadow-lg transition-shadow">
                <div className="text-6xl mb-4">{member.image}</div>
                <h3 className="text-lg font-bold text-foreground">{member.name}</h3>
                <p className="text-sm text-gray-600">{member.role}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* Contact Section */}
        <section className="bg-primary/10 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4 text-foreground">Liên Hệ Với Chúng Tôi</h2>
          <p className="text-gray-600 mb-6">Bạn có câu hỏi hoặc muốn biết thêm về MarketHub?</p>
          <a href="/contact" className="inline-block bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium">
            Gửi Tin Nhắn
          </a>
        </section>
      </div>

    </div>
  );
}
