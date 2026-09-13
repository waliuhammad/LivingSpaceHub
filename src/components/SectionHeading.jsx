export default function SectionHeading({ eyebrow, title, className = '' }) {
  return (
    <div className={`text-center mb-10 md:mb-14 ${className}`}>
      {eyebrow && (
        <span className="inline-block text-xs font-sans font-medium uppercase tracking-[0.2em] text-accent-500 mb-3">
          {eyebrow}
        </span>
      )}
      <h2 className="font-display text-2xl md:text-3xl lg:text-[2.65rem] font-bold text-neutral-900 leading-tight">
        {title}
      </h2>
    </div>
  );
}
