import type { ReactNode } from "react";

import { SectionHeading } from "@/modules/home/component/sectionHeading";

interface Feature {
  id: string | number;
  icon: ReactNode;
  title: string;
  description: string;
}

interface FeatureSectionProps {
  features: Feature[];
}

export const FeatureSection = ({ features }: FeatureSectionProps) => {
  if (features.length === 0) {
    return null;
  }

  return (
    <section className="bg-gradient-to-r from-orange-50/70 via-white to-amber-50/70 py-12">
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeading
          eyebrow="Dịch vụ"
          title="Mua sắm an tâm, giao hàng nhanh"
          description="Trải nghiệm được tối ưu từ khâu chọn sản phẩm đến hậu mãi."
        />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="rounded-2xl border border-orange-100 bg-white p-4 shadow-sm transition hover:border-orange-200 hover:shadow-md"
            >
              <div className="mb-3 inline-flex rounded-xl bg-orange-50 p-2 text-orange-600">{feature.icon}</div>
              <h3 className="mb-1 text-sm font-semibold text-slate-900">{feature.title}</h3>
              <p className="text-sm text-slate-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
