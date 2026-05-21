import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import type { MarketingBanner } from "@/modules/marketing/api/marketing";

interface HeroSectionProps {
  banner?: MarketingBanner | null;
  onBannerClick?: (banner: MarketingBanner) => void;
}

const DEFAULT_HERO = {
  title: "Khám phá sản phẩm phù hợp với hành vi của bạn",
  subtitle:
    "Hệ thống đề xuất AI cập nhật liên tục từ lượt xem, tương tác và giỏ hàng để rút ngắn thời gian chọn mua.",
  imageUrl: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=1400&q=80",
  buttonText: "Mua ngay",
  href: "/products",
};

const isExternalUrl = (href: string) => /^https?:\/\//i.test(href);

export const HeroSection = ({ banner, onBannerClick }: HeroSectionProps) => {
  const title = banner?.title || DEFAULT_HERO.title;
  const subtitle = banner?.subtitle || DEFAULT_HERO.subtitle;
  const imageUrl = banner?.imageUrl || DEFAULT_HERO.imageUrl;
  const mobileImageUrl = banner?.mobileImageUrl || imageUrl;
  const href = banner?.linkUrl || banner?.redirectUrl || DEFAULT_HERO.href;
  const buttonText = banner?.buttonText || DEFAULT_HERO.buttonText;

  const handleClick = () => {
    if (banner) {
      onBannerClick?.(banner);
    }
  };

  const cta = (
    <Button className="h-11 gap-2 rounded-full bg-orange-600 px-6 text-white hover:bg-orange-700">
      {buttonText} <ArrowRight className="h-4 w-4" />
    </Button>
  );

  return (
    <section className="relative min-h-[420px] overflow-hidden rounded-b-[2rem] bg-slate-950 text-white md:min-h-[520px]">
      <picture className="absolute inset-0">
        <source media="(max-width: 768px)" srcSet={mobileImageUrl} />
        <img src={imageUrl} alt={title} className="h-full w-full object-cover" />
      </picture>
      <div className="absolute inset-0 bg-linear-to-r from-slate-950/85 via-slate-950/48 to-slate-950/12" />

      <div className="relative mx-auto flex max-w-7xl min-h-[420px] items-center px-4 py-12 md:min-h-[520px] md:px-6">
        <div className="max-w-2xl space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-orange-100 backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" />
            Trải nghiệm mua sắm cá nhân hóa
          </div>

          <h1 className="text-4xl font-semibold leading-tight md:text-5xl">{title}</h1>

          {subtitle ? <p className="max-w-xl text-base leading-7 text-slate-100 md:text-lg">{subtitle}</p> : null}

          <div className="flex flex-wrap gap-3">
            {isExternalUrl(href) ? (
              <a href={href} target="_blank" rel="noopener noreferrer" onClick={handleClick}>
                {cta}
              </a>
            ) : (
              <Link to={href} onClick={handleClick}>
                {cta}
              </Link>
            )}
            <Link to="/promotions">
              <Button
                variant="outline"
                className="h-11 rounded-full border-white/50 bg-white/10 px-6 text-white hover:bg-white hover:text-slate-950"
              >
                Xem ưu đãi
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
