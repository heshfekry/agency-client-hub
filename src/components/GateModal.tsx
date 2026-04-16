import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export type Role = 'in-house' | 'agency' | 'fractional';

export interface GateData {
  role: Role;
  answer: string;
  structuredAnswer: string;
}

interface GateModalProps {
  open: boolean;
  onUnlock: (data: GateData) => void;
}

const MIN_CHARS = 80;

const QUESTIONS: Record<Role, string> = {
  'in-house': 'How has AI changed the way you consider or work with marketing agencies?',
  'agency': 'What skills will be most important for agencies in the AI era?',
  'fractional': 'How has AI changed the way you position and price your services?',
};

const PLACEHOLDERS: Record<Role, string> = {
  'in-house': 'Write at least a full sentence sharing your experience...',
  'agency': 'Write at least a full sentence sharing your perspective...',
  'fractional': 'Write at least a full sentence sharing your perspective...',
};

const FOLLOW_UP_LABEL: Record<Role, string> = {
  'in-house': 'In the last year, which of these happened with your agency relationships?',
  'agency': "How would you describe your agency's current AI integration?",
  'fractional': 'In the last year, how has AI affected your client roster or pricing?',
};

const FOLLOW_UP_OPTIONS: Record<Role, string[]> = {
  'in-house': [
    'We moved work we previously outsourced in-house',
    'We added new agency services we did not use before',
    'No meaningful change',
    'We replaced an agency with an AI tool or platform entirely',
  ],
  'agency': [
    'Experimenting individually — no shared workflows yet',
    'Some repeatable tasks are AI-powered',
    'Most workflows include AI in some form',
    'AI-first — it is the core of how we deliver',
  ],
  'fractional': [
    'I am taking on more clients than I could before',
    'I have raised my rates or shifted to outcome-based pricing',
    'No change to volume or pricing yet',
    'I have lost work to clients bringing it in-house',
  ],
};

const GateModal = ({ open, onUnlock }: GateModalProps) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [role, setRole] = useState<Role | null>(null);
  const [answer, setAnswer] = useState('');
  const [structuredAnswer, setStructuredAnswer] = useState('');

  const charCount = answer.trim().length;
  const meetsMin = charCount >= MIN_CHARS;

  const handleSubmit = () => {
    if (!role || !meetsMin || !structuredAnswer) return;
    onUnlock({ role, answer: answer.trim(), structuredAnswer });
  };

  const handleRoleSelect = (r: Role) => {
    setRole(r);
    setStep(2);
  };

  return (
    <Dialog open={open}>
      <DialogContent
        className="max-w-md border-border bg-card sm:rounded-xl"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-normal text-foreground">
            {step === 1 && 'Unlock the full report'}
            {step === 2 && role && QUESTIONS[role]}
            {step === 3 && role && FOLLOW_UP_LABEL[role]}
          </DialogTitle>
          <DialogDescription className="font-body text-sm text-muted-foreground">
            {step === 1 && 'Answer two quick questions to access the data and your scorecard.'}
            {step === 2 && 'Share your perspective to unlock the dashboard.'}
            {step === 3 && 'One more — then your access opens.'}
          </DialogDescription>
        </DialogHeader>

        {/* Step 1: role selection */}
        {step === 1 && (
          <div className="mt-2 flex flex-col gap-3">
            <button
              onClick={() => handleRoleSelect('in-house')}
              className="rounded-lg border border-border bg-background px-4 py-3 text-left font-body text-sm text-foreground transition hover:border-primary hover:bg-primary/5"
            >
              I am an in-house marketer
            </button>
            <button
              onClick={() => handleRoleSelect('agency')}
              className="rounded-lg border border-border bg-background px-4 py-3 text-left font-body text-sm text-foreground transition hover:border-primary hover:bg-primary/5"
            >
              I work at a marketing agency
            </button>
            <button
              onClick={() => handleRoleSelect('fractional')}
              className="rounded-lg border border-border bg-background px-4 py-3 text-left font-body text-sm text-foreground transition hover:border-primary hover:bg-primary/5"
            >
              I am a fractional or independent consultant
            </button>
          </div>
        )}

        {/* Step 2: open-text answer */}
        {step === 2 && role && (
          <div className="mt-2 flex flex-col gap-3">
            <Textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder={PLACEHOLDERS[role]}
              className="min-h-[120px] resize-none font-body text-sm"
              autoFocus
            />
            <div className="flex items-center justify-between">
              <span
                className={`font-body text-xs transition-colors ${
                  meetsMin ? 'text-primary font-semibold' : 'text-muted-foreground'
                }`}
              >
                {meetsMin
                  ? 'Good — continue when ready'
                  : `${MIN_CHARS - charCount} more characters to continue`}
              </span>
            </div>
            <p className="font-body text-xs text-muted-foreground">
              Be specific. A single concrete observation counts for more than a general statement.
            </p>
            <div className="flex items-center justify-between pt-1">
              <button
                onClick={() => { setStep(1); setRole(null); setAnswer(''); }}
                className="font-body text-xs text-muted-foreground underline hover:text-foreground"
              >
                Back
              </button>
              <Button
                onClick={() => setStep(3)}
                disabled={!meetsMin}
                className="rounded-lg bg-primary px-6 font-body text-sm font-bold text-primary-foreground hover:bg-primary/90"
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: structured follow-up */}
        {step === 3 && role && (
          <div className="mt-2 flex flex-col gap-2">
            {FOLLOW_UP_OPTIONS[role].map((opt) => (
              <button
                key={opt}
                onClick={() => setStructuredAnswer(opt)}
                className={`rounded-lg border px-4 py-3 text-left font-body text-sm transition ${
                  structuredAnswer === opt
                    ? 'border-primary bg-primary/10 text-foreground font-semibold'
                    : 'border-border bg-background text-foreground hover:border-primary hover:bg-primary/5'
                }`}
              >
                {opt}
              </button>
            ))}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => { setStep(2); setStructuredAnswer(''); }}
                className="font-body text-xs text-muted-foreground underline hover:text-foreground"
              >
                Back
              </button>
              <Button
                onClick={handleSubmit}
                disabled={!structuredAnswer}
                className="rounded-lg bg-primary px-6 font-body text-sm font-bold text-primary-foreground hover:bg-primary/90"
              >
                Unlock report
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default GateModal;
