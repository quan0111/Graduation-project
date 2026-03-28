'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Heart, Share2, Clock, Shield, Truck } from 'lucide-react';

const mockShop = {
  id: 'shop-001',
  name: 'TechStore Official',
  logo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=shop001',
  banner: 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=1200&h=400&fit=crop',
  description: 'Chuyên bán các sản phẩm công nghệ chính hãng với giá tốt nhất',
  followers: 25430,
  isFollowing: false,
  rating: 4.8,
  reviews: 1250,
  verified: true,
  responsesTime: '2 giờ',
  products: 450,
  stats: [
    { label: 'Đánh giá chất lượng', value: '4.8', icon: Star },
    { label: 'Tốc độ phản hồi', value: '2h', icon: Clock },
    { label: 'Đơn hàng hoàn thành', value: '99.5%', icon: Truck }
  ]
};

const shopProducts = [
  {
    id: 1,
    name: 'Laptop Dell XPS 13',
    price: 2000000,
    salePrice: 1800000,
    rating: 4.9,
    reviews: 256,
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=300&h=300&fit=crop',
    seller: 'TechStore Official',
    inStock: true
  },
  {
    id: 2,
    name: 'Chuột Logitech MX Master 3',
    price: 300000,
    salePrice: 250000,
    rating: 4.7,
    reviews: 189,
    image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=300&h=300&fit=crop',
    seller: 'TechStore Official',
    inStock: true
  },
  {
    id: 3,
    name: 'Bàn phím Mechanical Razer',
    price: 200000,
    salePrice: 175000,
    rating: 4.8,
    reviews: 142,
    image: 'https://images.unsplash.com/photo-1587829191301-8f679a6e8d85?w=300&h=300&fit=crop',
    seller: 'TechStore Official',
    inStock: true
  },
  {
    id: 4,
    name: 'Monitor Dell U2724D',
    price: 450000,
    salePrice: 420000,
    rating: 4.6,
    reviews: 98,
    image: 'https://images.unsplash.com/photo-1527017033215-6492900f2fa2?w=300&h=300&fit=crop',
    seller: 'TechStore Official',
    inStock: true
  },
  {
    id: 5,
    name: 'Webcam Logitech 4K',
    price: 150000,
    salePrice: 130000,
    rating: 4.5,
    reviews: 76,
    image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=300&h=300&fit=crop',
    seller: 'TechStore Official',
    inStock: true
  },
  {
    id: 6,
    name: 'USB-C Hub 7 in 1',
    price: 80000,
    salePrice: 65000,
    rating: 4.4,
    reviews: 54,
    image: 'https://images.unsplash.com/photo-1625948515291-6613e72d6b84?w=300&h=300&fit=crop',
    seller: 'TechStore Official',
    inStock: true
  }
];

export default function ShopPage({ params }: { params: { shopId: string } }) {
  const [isFollowing, setIsFollowing] = useState(mockShop.isFollowing);
  const [activeTab, setActiveTab] = useState('products');

  return (
    <main className="min-h-screen bg-background">
      {/* Banner */}
      <div className="h-48 md:h-64 bg-gradient-to-r from-primary to-accent overflow-hidden">
        <img
          src={mockShop.banner}
          alt="Banner"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4">
        {/* Shop Header */}
        <div className="relative -mt-16 mb-8">
          <Card className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
              {/* Logo */}
              <img
                src={mockShop.logo}
                alt="Shop Logo"
                className="w-32 h-32 rounded-lg border-4 border-background"
              />

              {/* Shop Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-foreground">{mockShop.name}</h1>
                  {mockShop.verified && (
                    <Badge className="bg-blue-100 text-blue-700 flex items-center gap-1">
                      <Shield size={14} />
                      Xác thực
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground mb-4">{mockShop.description}</p>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {mockShop.stats.map((stat, idx) => {
                    const Icon = stat.icon;
                    return (
                      <div key={idx} className="text-center">
                        <Icon size={20} className="text-primary mx-auto mb-2" />
                        <p className="font-bold text-foreground text-lg">{stat.value}</p>
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 w-full md:w-auto">
                <Button
                  onClick={() => setIsFollowing(!isFollowing)}
                  className={`flex-1 md:flex-none ${
                    isFollowing
                      ? 'bg-muted text-foreground hover:bg-muted/80'
                      : 'bg-primary text-primary-foreground hover:bg-primary/90'
                  }`}
                >
                  {isFollowing ? 'Đã theo dõi' : 'Theo dõi'}
                </Button>
                <Button variant="outline" className="flex-1 md:flex-none gap-2">
                  <Share2 size={18} />
                  <span className="hidden md:inline">Chia sẻ</span>
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-border">
          {[
            { label: 'Sản phẩm', value: 'products' },
            { label: 'Đánh giá', value: 'reviews' },
            { label: 'Thông tin', value: 'info' }
          ].map(tab => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === tab.value
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                Sản phẩm ({mockShop.products})
              </h2>
              <select className="px-4 py-2 border border-border rounded-lg bg-background">
                <option>Bán chạy nhất</option>
                <option>Giá từ thấp đến cao</option>
                <option>Giá từ cao đến thấp</option>
                <option>Mới nhất</option>
              </select>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
              {shopProducts.map(product => (
                <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative bg-muted">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-40 object-cover"
                    />
                    {product.salePrice < product.price && (
                      <div className="absolute top-2 right-2 bg-destructive text-destructive-foreground px-2 py-1 rounded text-sm font-bold">
                        -{Math.round(((product.price - product.salePrice) / product.price) * 100)}%
                      </div>
                    )}
                    <button className="absolute top-2 left-2 p-2 bg-white rounded-full hover:bg-gray-100 transition-colors">
                      <Heart size={18} className="text-destructive" />
                    </button>
                  </div>

                  <div className="p-3">
                    <h3 className="font-medium text-foreground text-sm line-clamp-2 mb-2">
                      {product.name}
                    </h3>

                    <div className="flex items-center gap-1 mb-2">
                      <Star size={14} className="fill-accent text-accent" />
                      <span className="text-xs font-medium text-foreground">
                        {product.rating}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({product.reviews})
                      </span>
                    </div>

                    <div className="mb-3">
                      <p className="text-lg font-bold text-primary">
                        {(product.salePrice / 1000).toFixed(0)}k đ
                      </p>
                      {product.price !== product.salePrice && (
                        <p className="text-xs text-muted-foreground line-through">
                          {(product.price / 1000).toFixed(0)}k đ
                        </p>
                      )}
                    </div>

                    <Button className="w-full bg-primary hover:bg-primary/90 h-8 text-sm">
                      Thêm vào giỏ
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="space-y-6 mb-12">
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-5xl font-bold text-primary">{mockShop.rating}</p>
                <div className="flex items-center gap-1 my-2 justify-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={i < Math.floor(mockShop.rating) ? 'fill-accent text-accent' : 'text-muted-foreground'}
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">Dựa trên {mockShop.reviews} đánh giá</p>
              </div>
            </div>

            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <Card key={i} className="p-4">
                  <div className="flex gap-4">
                    <img
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=user${i}`}
                      alt="User"
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-foreground">Người dùng {i}</span>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, j) => (
                            <Star
                              key={j}
                              size={14}
                              className={j < 5 - i ? 'fill-accent text-accent' : 'text-muted-foreground'}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">Rất hài lòng với sản phẩm và dịch vụ. Giao hàng nhanh, sản phẩm chất lượng.</p>
                      <p className="text-xs text-muted-foreground">2 ngày trước</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Info Tab */}
        {activeTab === 'info' && (
          <Card className="p-8 mb-12">
            <h3 className="text-2xl font-bold mb-6">Thông tin cửa hàng</h3>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold text-foreground mb-4">Thống kê</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Năm hoạt động</span>
                      <span className="font-medium text-foreground">Từ 2018</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Số sản phẩm</span>
                      <span className="font-medium text-foreground">{mockShop.products}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Người theo dõi</span>
                      <span className="font-medium text-foreground">{mockShop.followers.toLocaleString('vi-VN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tốc độ phản hồi</span>
                      <span className="font-medium text-foreground">{mockShop.responsesTime}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-foreground mb-4">Chính sách</h4>
                  <div className="space-y-2 text-sm">
                    <p className="text-muted-foreground">✓ Giao hàng miễn phí cho đơn trên 200k đ</p>
                    <p className="text-muted-foreground">✓ Hỗ trợ trả góp 0% lãi suất</p>
                    <p className="text-muted-foreground">✓ Bảo hành 12 tháng cho tất cả sản phẩm</p>
                    <p className="text-muted-foreground">✓ Đổi trả trong 30 ngày</p>
                    <p className="text-muted-foreground">✓ Hỗ trợ khách hàng 24/7</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </main>
  );
}
