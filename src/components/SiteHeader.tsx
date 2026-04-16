const SiteHeader = () => (
  <header className="sticky top-0 z-50 flex h-14 items-center justify-between bg-cxl-dark px-6">
    <a
      href="https://cxl.com"
      target="_blank"
      rel="noopener"
      className="flex h-9 w-16 items-center justify-center rounded bg-cxl-cyan"
    >
      <span className="font-body text-lg font-black tracking-tight text-cxl-red">CXL</span>
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
