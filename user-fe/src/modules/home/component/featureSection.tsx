// components/FeatureSection.tsx
export const FeatureSection = ({ features }) => {
  return (
    <section className="py-12 bg-muted">
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-6 px-4">

        {features.map((f, i) => (
          <div key={i} className="text-center">
            <div className="mb-2">{f.icon}</div>
            <h3>{f.title}</h3>
            <p className="text-sm">{f.description}</p>
          </div>
        ))}

      </div>
    </section>
  );
};