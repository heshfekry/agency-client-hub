const SiteHeader = () => (
  <header className="sticky top-0 z-50 flex h-14 items-center justify-between bg-cxl-dark px-6">
    <a
      href="https://cxl.com"
      target="_blank"
      rel="noopener"
      className="flex h-9 items-center justify-center rounded bg-cxl-cyan px-2.5"
    >
      <span className="font-display text-[22px] font-black leading-none tracking-tight text-cxl-red">
        <span className="italic">C</span>XL
      </span>
    </a>
    <a
      href="https://cxl.com"
      target="_blank"
      rel="noopener"
      className="font-body text-xs uppercase tracking-widest text-foreground/50 transition-colors hover:text-cxl-cyan"
      style={{ color: 'rgba(255,255,255,0.5)' }}
    >
      cxl.com
    </a>
  </header>
);

export default SiteHeader;
