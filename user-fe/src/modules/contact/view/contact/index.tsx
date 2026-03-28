'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Send,
  Headphones,
  FileQuestion,
  ShoppingBag,
  CreditCard,
  Truck,
  RotateCcw,
} from 'lucide-react';

const faqs = [
  {
    category: 'Đơn hàng',
    icon: ShoppingBag,
    questions: [
      {
        q: 'Làm thế nào để theo dõi đơn hàng?',
        a: 'Bạn có thể theo dõi đơn hàng bằng cách vào mục "Đơn hàng của tôi" trong tài khoản, hoặc sử dụng trang Theo dõi đơn hàng và nhập mã đơn hàng.',
      },
      {
        q: 'Tôi có thể hủy đơn hàng không?',
        a: 'Bạn có thể hủy đơn hàng khi đơn chưa được xác nhận hoặc chưa giao cho đơn vị vận chuyển. Vào chi tiết đơn hàng và chọn "Hủy đơn hàng".',
      },
      {
        q: 'Làm sao để thay đổi địa chỉ giao hàng?',
        a: 'Bạn có thể thay đổi địa chỉ giao hàng trước khi đơn hàng được xác nhận. Sau khi đơn đã xác nhận, vui lòng liên hệ CSKH để được hỗ trợ.',
      },
    ],
  },
  {
    category: 'Thanh toán',
    icon: CreditCard,
    questions: [
      {
        q: 'MarketHub hỗ trợ những phương thức thanh toán nào?',
        a: 'Chúng tôi hỗ trợ: Thẻ tín dụng/ghi nợ (Visa, Mastercard), Chuyển khoản ngân hàng, Ví điện tử (Momo, ZaloPay, VNPay), và Thanh toán khi nhận hàng (COD).',
      },
      {
        q: 'Tôi có thể thanh toán trả góp không?',
        a: 'Có, MarketHub hỗ trợ trả góp 0% lãi suất qua các ngân hàng đối tác cho đơn hàng từ 3 triệu đồng trở lên.',
      },
    ],
  },
  {
    category: 'Vận chuyển',
    icon: Truck,
    questions: [
      {
        q: 'Phí vận chuyển được tính như thế nào?',
        a: 'Phí vận chuyển phụ thuộc vào khoảng cách và trọng lượng đơn hàng. Miễn phí vận chuyển cho đơn từ 500.000đ.',
      },
      {
        q: 'Thời gian giao hàng là bao lâu?',
        a: 'Nội thành: 1-2 ngày. Ngoại thành: 2-4 ngày. Tỉnh thành khác: 3-7 ngày tùy khu vực.',
      },
    ],
  },
  {
    category: 'Đổi trả & Hoàn tiền',
    icon: RotateCcw,
    questions: [
      {
        q: 'Chính sách đổi trả của MarketHub?',
        a: 'Bạn có thể đổi trả trong vòng 30 ngày kể từ ngày nhận hàng nếu sản phẩm còn nguyên tem mác, chưa qua sử dụng. Một số sản phẩm đặc biệt có chính sách riêng.',
      },
      {
        q: 'Hoàn tiền được xử lý trong bao lâu?',
        a: 'Sau khi yêu cầu hoàn tiền được duyệt, tiền sẽ được hoàn trong 5-7 ngày làm việc tùy theo phương thức thanh toán ban đầu.',
      },
    ],
  },
];

const contactInfo = [
  {
    icon: Phone,
    title: 'Hotline',
    value: '1900 6066',
    description: 'Miễn phí cuộc gọi',
  },
  {
    icon: Mail,
    title: 'Email',
    value: 'support@markethub.vn',
    description: 'Phản hồi trong 24h',
  },
  {
    icon: MessageCircle,
    title: 'Live Chat',
    value: 'Chat ngay',
    description: 'Hỗ trợ 24/7',
  },
  {
    icon: MapPin,
    title: 'Văn phòng',
    value: '123 Nguyễn Huệ, Q1, HCM',
    description: 'T2-T6: 8:00 - 18:00',
  },
];

export default function ContactPage() {
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const toggleFaq = (id: string) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate form submission
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-background">

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Trung Tâm Hỗ Trợ</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Chúng tôi luôn sẵn sàng hỗ trợ bạn. Tìm câu trả lời nhanh trong FAQ hoặc liên hệ trực tiếp với đội ngũ CSKH.
          </p>
        </div>

        {/* Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {contactInfo.map((info, index) => {
            const Icon = info.icon;
            return (
              <Card
                key={index}
                className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer group"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <Icon className="text-primary" size={24} />
                </div>
                <h3 className="font-semibold text-foreground mb-1">{info.title}</h3>
                <p className="text-primary font-medium mb-1">{info.value}</p>
                <p className="text-sm text-muted-foreground">{info.description}</p>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* FAQ Section */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <FileQuestion className="text-primary" size={24} />
              <h2 className="text-2xl font-bold">Câu hỏi thường gặp</h2>
            </div>

            <div className="space-y-4">
              {faqs.map((category) => {
                const Icon = category.icon;
                return (
                  <Card key={category.category} className="overflow-hidden">
                    <div className="p-4 bg-muted/50 flex items-center gap-3">
                      <Icon className="text-primary" size={20} />
                      <h3 className="font-semibold text-foreground">{category.category}</h3>
                    </div>
                    <div className="divide-y divide-border">
                      {category.questions.map((faq, index) => {
                        const id = `${category.category}-${index}`;
                        const isExpanded = expandedFaq === id;
                        return (
                          <div key={index}>
                            <button
                              onClick={() => toggleFaq(id)}
                              className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-muted/30 transition-colors"
                            >
                              <span className="font-medium text-foreground pr-4">{faq.q}</span>
                              {isExpanded ? (
                                <ChevronUp size={18} className="flex-shrink-0 text-muted-foreground" />
                              ) : (
                                <ChevronDown size={18} className="flex-shrink-0 text-muted-foreground" />
                              )}
                            </button>
                            {isExpanded && (
                              <div className="px-4 pb-4 text-sm text-muted-foreground bg-muted/20">
                                {faq.a}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Headphones className="text-primary" size={24} />
              <h2 className="text-2xl font-bold">Liên hệ với chúng tôi</h2>
            </div>

            <Card className="p-6">
              {submitted ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="text-green-600" size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Gửi thành công!</h3>
                  <p className="text-muted-foreground">
                    Chúng tôi sẽ phản hồi trong vòng 24 giờ.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">
                        Họ tên <span className="text-destructive">*</span>
                      </label>
                      <Input
                        type="text"
                        placeholder="Nhập họ tên"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">
                        Email <span className="text-destructive">*</span>
                      </label>
                      <Input
                        type="email"
                        placeholder="Nhập email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">
                        Số điện thoại
                      </label>
                      <Input
                        type="tel"
                        placeholder="Nhập số điện thoại"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">
                        Chủ đề <span className="text-destructive">*</span>
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        required
                      >
                        <option value="">Chọn chủ đề</option>
                        <option value="order">Vấn đề đơn hàng</option>
                        <option value="payment">Thanh toán</option>
                        <option value="shipping">Vận chuyển</option>
                        <option value="return">Đổi trả & Hoàn tiền</option>
                        <option value="account">Tài khoản</option>
                        <option value="other">Khác</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Nội dung <span className="text-destructive">*</span>
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground min-h-32 resize-none"
                      placeholder="Mô tả chi tiết vấn đề của bạn..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90 gap-2">
                    <Send size={18} />
                    Gửi yêu cầu hỗ trợ
                  </Button>
                </form>
              )}
            </Card>

            {/* Working Hours */}
            <Card className="p-6 mt-6">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="text-primary" size={20} />
                <h3 className="font-semibold text-foreground">Giờ làm việc</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Thứ 2 - Thứ 6:</span>
                  <span className="font-medium text-foreground">8:00 - 22:00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Thứ 7 - Chủ nhật:</span>
                  <span className="font-medium text-foreground">9:00 - 21:00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ngày lễ:</span>
                  <span className="font-medium text-foreground">9:00 - 18:00</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                * Live Chat và Hotline hoạt động 24/7
              </p>
            </Card>
          </div>
        </div>
      </main>

    </div>
  );
}
