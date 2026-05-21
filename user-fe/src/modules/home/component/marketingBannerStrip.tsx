import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

import type { MarketingBanner } from "@/modules/marketing/api/marketing";

interface MarketingBannerStripProps {
  banners: MarketingBanner[];
  onBannerClick?: (banner: MarketingBanner) => void;
}

const isExternalUrl = (href: string) => /^https?:\/\//i.test(href);

export const MarketingBannerStrip = ({ banners, onBannerClick }: MarketingBannerStripProps) => {
  if (!banners.length) {
    return null;
  }

  return (
    <section className="grid gap-4 pt-6 md:grid-cols-3">
      {banners.map((banner) => {
        const href = banner.linkUrl || banner.redirectUrl || "/promotions";
        const content = (
          <div className="group relative min-h-44 overflow-hidden rounded-xl bg-slate-900 text-white shadow-sm">
            <picture className="absolute inset-0">
              {banner.mobileImageUrl ? <source media="(max-width: 768px)" srcSet={banner.mobileImageUrl} /> : null}
              <img src={banner.imageUrl} alt={banner.title} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
            </picture>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/82 via-slate-950/28 to-transparent" />
            <div className="relative flex min-h-44 flex-col justify-end p-4">
              <p className="line-clamp-1 text-base font-semibold">{banner.title}</p>
              {banner.subtitle ? <p className="mt-1 line-clamp-2 text-sm text-slate-100">{banner.subtitle}</p> : null}
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-orange-100">
                {banner.buttonText || "Xem ngay"} <ArrowRight className="size-4" />
              </span>
            </div>
          </div>
        );

        return isExternalUrl(href) ? (
          <a
            key={banner.id}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onBannerClick?.(banner)}
          >
            {content}
          </a>
        ) : (
          <Link key={banner.id} to={href} onClick={() => onBannerClick?.(banner)}>
            {content}
          </Link>
        );
      })}
    </section>
  );
};
