const Hero = () => (
  <section className="bg-cxl-dark px-6 pb-12 pt-14">
    <div className="mx-auto max-w-[900px]">
      <div className="mb-4 flex items-center gap-2.5 font-body text-[11px] font-bold uppercase tracking-[0.12em] text-cxl-cyan">
        <span className="block h-0.5 w-6 bg-cxl-cyan" />
        Wynter Research · March 2026
      </div>
      <h1 className="mb-4 max-w-[640px] font-display text-[clamp(28px,5vw,44px)] font-normal leading-[1.15] text-primary-foreground">
        AI's impact on <em className="italic text-cxl-cyan">agencies</em>
      </h1>
      <p className="max-w-[520px] font-body text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
        How AI is changing client expectations for agencies — and how agencies are adapting. Survey of CMOs, founders, and agency directors.
      </p>
    </div>
  </section>
);

export default Hero;
