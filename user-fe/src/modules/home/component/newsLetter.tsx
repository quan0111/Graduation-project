import { Mail } from "lucide-react";

import { Button } from "@/components/ui/button";

export const Newsletter = () => {
  return (
    <section className="py-12">
      <div className="mx-auto max-w-7xl px-4">
        <div className="rounded-3xl bg-gradient-to-r from-orange-600 to-amber-500 p-6 text-white shadow-xl md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl">
              <p className="mb-2 text-xs uppercase tracking-[0.22em] text-orange-100">Cập nhật mới</p>
              <h2 className="text-2xl font-semibold md:text-3xl">Nhận deal sớm và gợi ý cá nhân hoá mỗi tuần</h2>
              <p className="mt-2 text-sm text-orange-100 md:text-base">
                Đăng ký email để nhận mã giảm giá và danh sách sản phẩm hợp gu của bạn.
              </p>
            </div>

            <div className="flex w-full max-w-md items-center gap-2 rounded-2xl bg-white/15 p-2 backdrop-blur">
              <Mail className="ml-2 h-4 w-4 text-orange-50" />
              <input
                className="h-10 w-full rounded-xl border-0 bg-transparent px-2 text-sm text-white placeholder:text-orange-100/80 focus:outline-none"
                placeholder="Email của bạn"
              />
              <Button className="h-10 rounded-xl bg-white px-4 text-orange-700 hover:bg-orange-50">Đăng ký</Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
