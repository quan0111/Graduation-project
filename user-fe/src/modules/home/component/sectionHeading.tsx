interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  description: string;
}

export const SectionHeading = ({ eyebrow, title, description }: SectionHeadingProps) => {
  return (
    <div className="mb-6 flex flex-col gap-2">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-500">{eyebrow}</p>
      <h2 className="text-2xl font-semibold text-slate-900 md:text-3xl">{title}</h2>
      <p className="max-w-2xl text-sm text-slate-600 md:text-base">{description}</p>
    </div>
  );
};
