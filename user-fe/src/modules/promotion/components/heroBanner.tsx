interface HeroBannerProps {
  total: number;
}

export const HeroBanner = ({ total }: HeroBannerProps) => {
  return (
    <div className="relative mb-8 overflow-hidden rounded-2xl bg-linear-to-r from-red-500 to-orange-500 p-8 md:p-12">
      <div className="relative z-10">
        <h1 className="mb-4 text-4xl font-bold text-white">
          Khuyến mãi HOT 🔥
        </h1>

        <p className="mb-6 text-white/90">
          Săn voucher giảm giá cực mạnh
        </p>

        <div className="flex gap-4">
          <div className="rounded bg-white/20 px-4 py-2">
            {total} Voucher
          </div>
          <div className="rounded bg-white/20 px-4 py-2">
            Giảm đến 70%
          </div>
        </div>
      </div>
    </div>
  );
};
