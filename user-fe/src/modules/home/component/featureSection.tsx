// components/FeatureSection.tsx

import type { ReactNode } from "react";

interface Feature {
  id: string | number;
  icon: ReactNode;
  title: string;
  description: string;
}

interface FeatureSectionProps {
  features: Feature[];
}

export const FeatureSection: React.FC<FeatureSectionProps> = ({ features }) => {
  if (!features || features.length === 0) return null;

  return (
    <section className="py-12 bg-muted">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 px-4">

        {features.map((f) => (
          <div
            key={f.id}
            className="text-center p-4 rounded-lg hover:bg-background transition"
          >
            {/* Icon */}
            <div className="mb-3 text-3xl flex justify-center">
              {f.icon}
            </div>

            {/* Title */}
            <h3 className="font-semibold text-sm mb-1">
              {f.title}
            </h3>

            {/* Description */}
            <p className="text-xs text-muted-foreground">
              {f.description}
            </p>
          </div>
        ))}

      </div>
    </section>
  );
};