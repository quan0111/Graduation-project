import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";

export const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-amber-50 to-lime-50">
      <div className="absolute -left-20 top-10 h-48 w-48 rounded-full bg-orange-200/40 blur-3xl" />
      <div className="absolute right-0 top-20 h-60 w-60 rounded-full bg-emerald-200/30 blur-3xl" />

      <div className="mx-auto grid max-w-7xl gap-8 px-4 pb-12 pt-12 md:grid-cols-2 md:items-center md:pb-16 md:pt-16">
        <div className="space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/80 px-3 py-1 text-xs font-medium text-orange-600">
            <Sparkles className="h-3.5 w-3.5" />
            Trải nghiệm mua sắm cá nhân hóa
          </div>

          <h1 className="text-4xl font-semibold leading-tight text-slate-900 md:text-5xl">
            Khám phá sản phẩm phù hợp với hành vi của bạn
          </h1>

          <p className="max-w-xl text-base text-slate-600 md:text-lg">
            Hệ thống đề xuất AI cập nhật liên tục từ lượt xem, tương tác và giỏ hàng để rút ngắn thời gian chọn mua.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link to="/products">
              <Button className="h-11 gap-2 rounded-full bg-orange-600 px-6 text-white hover:bg-orange-700">
                Mua ngay <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/promotions">
              <Button
                variant="outline"
                className="h-11 rounded-full border-orange-300 bg-white px-6 text-orange-700 hover:bg-orange-50"
              >
                Xem ưu đãi
              </Button>
            </Link>
          </div>
        </div>

        <div className="relative">
          <img
            src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=1000&q=80"
            alt="Shopping preview"
            className="h-[320px] w-full rounded-3xl object-cover shadow-xl md:h-[420px]"
          />
          <div className="absolute bottom-4 left-4 rounded-2xl border border-white/30 bg-white/80 px-4 py-3 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.16em] text-slate-500">AI Insight</p>
            <p className="text-sm font-semibold text-slate-900">Gợi ý mới mỗi phiên truy cập</p>
          </div>
        </div>
      </div>
    </section>
  );
};
