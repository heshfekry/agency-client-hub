interface StickyScorecardCTAProps {
  onStart: () => void;
  visible: boolean;
}

const StickyScorecardCTA = ({ onStart, visible }: StickyScorecardCTAProps) => (
  <div
    className={`fixed inset-x-0 bottom-0 z-40 transition-transform duration-300 ${
      visible ? "translate-y-0" : "translate-y-full"
    }`}
    role="region"
    aria-label="Score your agency"
  >
    <div className="border-t border-border bg-card/95 backdrop-blur shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
      <div className="mx-auto flex max-w-[900px] items-center justify-between gap-4 px-4 py-3 md:py-4">
        <div className="flex-1 min-w-0">
          <div className="font-display text-sm font-bold text-foreground md:text-base">
            How does your agency compare?
          </div>
          <div className="hidden font-body text-[12px] text-muted-foreground md:block">
            7 questions · scored breakdown with specific actions
          </div>
        </div>
        <button
          onClick={onStart}
          className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-cxl-red px-5 py-2.5 font-body text-sm font-bold text-primary-foreground transition hover:bg-cxl-red/90 md:px-7 md:py-3"
        >
          Score my agency
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  </div>
);

export default StickyScorecardCTA;
