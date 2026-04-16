interface ScorecardBridgeProps {
  onStart: () => void;
}

const ScorecardBridge = ({ onStart }: ScorecardBridgeProps) => (
  <div id="scorecard-bridge" className="mt-14 mb-2 rounded-[10px] border-2 border-primary/30 bg-card p-8 text-center">
    <div className="mb-1.5 font-body text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: 'hsl(var(--cxl-text-faint))' }}>
      Act 2
    </div>
    <h2 className="mb-3 font-display text-[22px] font-normal text-foreground">
      How does your agency compare?
    </h2>
    <p className="mx-auto mb-6 max-w-[480px] font-body text-sm leading-relaxed text-muted-foreground">
      44% of clients demand AI transparency. Most agencies are not providing it. Enter your website and answer 7 questions to get a scored breakdown with specific actions.
    </p>
    <button
      onClick={onStart}
      className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-3 font-body text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
    >
      Score my agency
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  </div>
);

export default ScorecardBridge;
