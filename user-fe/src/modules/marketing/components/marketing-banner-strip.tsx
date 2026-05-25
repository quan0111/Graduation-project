import { Link } from "react-router-dom";

import type { MarketingBanner } from "@/modules/marketing/api/marketing";

interface MarketingBannerStripProps {
  banners: MarketingBanner[];
  className?: string;
  onBannerClick?: (banner: MarketingBanner) => void;
}

const isExternalUrl = (href: string) => /^https?:\/\//i.test(href);

const BANNER_LAYOUT_CLASS: Record<string, string> = {
  FULL: "md:col-span-12 md:row-span-2",
  HALF: "md:col-span-6 md:row-span-1",
  ONE_THIRD: "md:col-span-4 md:row-span-1",
  TWO_THIRDS: "md:col-span-8 md:row-span-2",
  ONE_QUARTER: "md:col-span-3 md:row-span-1",
  THREE_QUARTERS: "md:col-span-9 md:row-span-2",
};

const getBannerLayoutClass = (layout?: string | null) => {
  const normalizedLayout = String(layout || "ONE_THIRD").toUpperCase();
  return BANNER_LAYOUT_CLASS[normalizedLayout] ?? BANNER_LAYOUT_CLASS.ONE_THIRD;
};

export const MarketingBannerStrip = ({ banners, className = "", onBannerClick }: MarketingBannerStripProps) => {
  if (!banners.length) {
    return null;
  }

  return (
    <section className={`grid grid-cols-1 gap-2 md:grid-flow-row-dense md:grid-cols-12 md:auto-rows-[12rem] ${className}`}>
      {banners.map((banner) => {
        const href = banner.linkUrl || banner.redirectUrl || "/promotions";
        const layoutClass = getBannerLayoutClass(banners.length === 1 ? "FULL" : banner.layout);
        const itemClass = `group block aspect-[2.25/1] overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-orange-100 md:aspect-auto md:h-full ${layoutClass}`;
        const content = (
          <picture className="block h-full w-full">
            {banner.mobileImageUrl ? <source media="(max-width: 768px)" srcSet={banner.mobileImageUrl} /> : null}
            <img
              src={banner.imageUrl}
              alt={banner.title}
              className="h-full w-full object-contain transition duration-300 group-hover:brightness-95"
            />
          </picture>
        );

        return isExternalUrl(href) ? (
          <a
            key={banner.id}
            href={href}
            className={itemClass}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onBannerClick?.(banner)}
          >
            {content}
          </a>
        ) : (
          <Link key={banner.id} to={href} className={itemClass} onClick={() => onBannerClick?.(banner)}>
            {content}
          </Link>
        );
      })}
    </section>
  );
};
