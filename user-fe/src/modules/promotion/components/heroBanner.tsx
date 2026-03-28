// HeroBanner.tsx
export const HeroBanner = ({ total }) => {
  return (
    <div className="relative rounded-2xl overflow-hidden mb-8 bg-gradient-to-r from-red-500 to-orange-500 p-8 md:p-12">

      <div className="relative z-10">
        <h1 className="text-4xl font-bold text-white mb-4">
          Khuyến mãi HOT 🔥
        </h1>

        <p className="text-white/90 mb-6">
          Săn voucher giảm giá cực mạnh
        </p>

        <div className="flex gap-4">
          <div className="bg-white/20 px-4 py-2 rounded">
            {total} Voucher
          </div>
          <div className="bg-white/20 px-4 py-2 rounded">
            Giảm đến 70%
          </div>
        </div>
      </div>

    </div>
  );
};