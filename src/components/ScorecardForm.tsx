import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Loader2 } from "lucide-react";

export interface MCQAnswers {
  teamSize: string;
  services: string[];
  aiToolUsage: string;
  aiInWorkflows: string;
  aiOnWebsite: string;
  pricingModel: string;
  aiServices: string;
  clientAskFrequency: string;
  headcountChange: string;
  roiMeasurement: string;
}

interface ScorecardFormProps {
  onSubmit: (url: string, answers: MCQAnswers) => void;
  isLoading: boolean;
}

const TEAM_SIZES = ["Solo / freelancer", "2–5 people", "6–15 people", "16–50 people", "50+"];

const SERVICE_OPTIONS = [
  "Content marketing", "SEO", "Paid media / PPC", "Brand / creative",
  "Web design / dev", "Social media", "Strategy / consulting", "PR / comms",
];

const AI_TOOL_USAGE = [
  "No one uses AI tools yet",
  "A few people experiment individually",
  "Most of the team uses AI tools regularly",
  "We have a documented AI playbook — tools, prompts, SOPs, guardrails",
  "We've built custom AI workflows or agents firm-wide",
];

const AI_WORKFLOW = [
  "Nothing is automated — everything is manual",
  "We use AI for drafts and brainstorming only",
  "Some repeatable tasks are AI-powered (reports, briefs, proposals)",
  "Most production workflows include AI automation",
  "We have at least one end-to-end automated pipeline and can show the output",
];

const AI_ON_WEBSITE = [
  "No mention of AI anywhere",
  "We mention AI informally (blog posts, social)",
  "We have an AI section or case study on our site",
  "AI is a core part of our positioning and messaging",
  "We offer dedicated AI advisory services",
];

const PRICING_MODELS = [
  "Hourly / time-based billing",
  "Project-based (fixed fee per project)",
  "Monthly retainers",
  "Value-based / outcome-based pricing",
  "Productized services (fixed scope + price)",
  "Mix of the above",
];

const AI_SERVICE_OPTIONS = [
  "No AI-specific services",
  "We deliver faster using AI but don't market it",
  "We've adapted existing services to be AI-accelerated",
  "We offer new AI-native services (e.g., AI content, AI strategy)",
  "AI is our core differentiator — all services are AI-first",
];

const CLIENT_ASK_FREQ = [
  "Never — clients don't bring it up",
  "Occasionally (a few times a year)",
  "Often (monthly or more)",
  "Almost every new client conversation includes it",
];

const HEADCOUNT_CHANGE = [
  "Headcount grew alongside revenue",
  "Headcount stayed flat while revenue grew",
  "Headcount shrunk while revenue stayed flat or grew",
  "Both headcount and revenue fell",
  "Too early to tell / less than 6 months tracking",
];

const ROI_MEASUREMENT = [
  "We don't measure it",
  "Time saved per project (hours/week)",
  "Gross margin improvement",
  "Client retention or satisfaction scores",
  "New revenue from AI-native services",
  "Multiple metrics tracked in a dashboard",
];

function OptionButton({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left px-4 py-3 rounded-lg border text-sm font-medium transition-all ${
        selected
          ? "border-primary bg-primary/10 text-card-foreground"
          : "border-input bg-card text-muted-foreground hover:border-primary/40"
      }`}
    >
      {label}
    </button>
  );
}

function MultiSelectButton({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
        selected
          ? "border-primary bg-primary/10 text-card-foreground"
          : "border-input bg-card text-muted-foreground hover:border-primary/40"
      }`}
    >
      {label}
    </button>
  );
}

export function ScorecardForm({ onSubmit, isLoading }: ScorecardFormProps) {
  const [url, setUrl] = useState("");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<MCQAnswers>({
    teamSize: "", services: [], aiToolUsage: "", aiInWorkflows: "",
    aiOnWebsite: "", pricingModel: "", aiServices: "",
    clientAskFrequency: "", headcountChange: "", roiMeasurement: "",
  });

  const steps = [
    {
      title: "What's your agency website?",
      content: (
        <Input
          type="url"
          placeholder="https://youragency.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="h-12 bg-card border-input text-base"
        />
      ),
      valid: url.trim().length > 0,
    },
    {
      title: "How large is your team?",
      content: (
        <div className="grid gap-2">
          {TEAM_SIZES.map((size) => (
            <OptionButton key={size} label={size} selected={answers.teamSize === size}
              onClick={() => setAnswers((a) => ({ ...a, teamSize: size }))} />
          ))}
        </div>
      ),
      valid: answers.teamSize !== "",
    },
    {
      title: "What services do you offer?",
      subtitle: "Select all that apply",
      content: (
        <div className="flex flex-wrap gap-2">
          {SERVICE_OPTIONS.map((svc) => (
            <MultiSelectButton key={svc} label={svc} selected={answers.services.includes(svc)}
              onClick={() => setAnswers((a) => ({
                ...a,
                services: a.services.includes(svc)
                  ? a.services.filter((s) => s !== svc)
                  : [...a.services, svc],
              }))} />
          ))}
        </div>
      ),
      valid: answers.services.length > 0,
    },
    {
      title: "How widely does your team use AI tools?",
      content: (
        <div className="grid gap-2">
          {AI_TOOL_USAGE.map((opt) => (
            <OptionButton key={opt} label={opt} selected={answers.aiToolUsage === opt}
              onClick={() => setAnswers((a) => ({ ...a, aiToolUsage: opt }))} />
          ))}
        </div>
      ),
      valid: answers.aiToolUsage !== "",
    },
    {
      title: "How much of your workflow is AI-automated?",
      content: (
        <div className="grid gap-2">
          {AI_WORKFLOW.map((opt) => (
            <OptionButton key={opt} label={opt} selected={answers.aiInWorkflows === opt}
              onClick={() => setAnswers((a) => ({ ...a, aiInWorkflows: opt }))} />
          ))}
        </div>
      ),
      valid: answers.aiInWorkflows !== "",
    },
    {
      title: "How do you communicate AI on your website?",
      content: (
        <div className="grid gap-2">
          {AI_ON_WEBSITE.map((opt) => (
            <OptionButton key={opt} label={opt} selected={answers.aiOnWebsite === opt}
              onClick={() => setAnswers((a) => ({ ...a, aiOnWebsite: opt }))} />
          ))}
        </div>
      ),
      valid: answers.aiOnWebsite !== "",
    },
    {
      title: "What's your primary pricing model?",
      content: (
        <div className="grid gap-2">
          {PRICING_MODELS.map((opt) => (
            <OptionButton key={opt} label={opt} selected={answers.pricingModel === opt}
              onClick={() => setAnswers((a) => ({ ...a, pricingModel: opt }))} />
          ))}
        </div>
      ),
      valid: answers.pricingModel !== "",
    },
    {
      title: "How are your services positioned for AI?",
      content: (
        <div className="grid gap-2">
          {AI_SERVICE_OPTIONS.map((opt) => (
            <OptionButton key={opt} label={opt} selected={answers.aiServices === opt}
              onClick={() => setAnswers((a) => ({ ...a, aiServices: opt }))} />
          ))}
        </div>
      ),
      valid: answers.aiServices !== "",
    },
    {
      title: "How often do clients ask about your AI process?",
      content: (
        <div className="grid gap-2">
          {CLIENT_ASK_FREQ.map((opt) => (
            <OptionButton key={opt} label={opt} selected={answers.clientAskFrequency === opt}
              onClick={() => setAnswers((a) => ({ ...a, clientAskFrequency: opt }))} />
          ))}
        </div>
      ),
      valid: answers.clientAskFrequency !== "",
    },
    {
      title: "In the last 12 months: headcount vs. revenue?",
      content: (
        <div className="grid gap-2">
          {HEADCOUNT_CHANGE.map((opt) => (
            <OptionButton key={opt} label={opt} selected={answers.headcountChange === opt}
              onClick={() => setAnswers((a) => ({ ...a, headcountChange: opt }))} />
          ))}
        </div>
      ),
      valid: answers.headcountChange !== "",
    },
    {
      title: "How do you measure the business impact of your AI investment?",
      content: (
        <div className="grid gap-2">
          {ROI_MEASUREMENT.map((opt) => (
            <OptionButton key={opt} label={opt} selected={answers.roiMeasurement === opt}
              onClick={() => setAnswers((a) => ({ ...a, roiMeasurement: opt }))} />
          ))}
        </div>
      ),
      valid: answers.roiMeasurement !== "",
    },
  ];

  const currentStep = steps[step];
  const isLast = step === steps.length - 1;

  const handleNext = () => {
    if (isLast) {
      onSubmit(url.trim(), answers);
    } else {
      setStep((s) => s + 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div className="flex gap-1">
        {steps.map((_, i) => (
          <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= step ? "bg-primary" : "bg-input"}`} />
        ))}
      </div>

      <div className="space-y-1">
        <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">
          Step {step + 1} of {steps.length}
        </p>
        <h2 className="font-display text-xl text-card-foreground tracking-tight">{currentStep.title}</h2>
        {"subtitle" in currentStep && currentStep.subtitle && (
          <p className="text-sm text-muted-foreground">{currentStep.subtitle}</p>
        )}
      </div>

      {currentStep.content}

      <div className="flex gap-3">
        {step > 0 && (
          <Button type="button" variant="outline" onClick={() => setStep((s) => s - 1)} className="flex-1 font-bold">
            Back
          </Button>
        )}
        <Button
          type="button"
          onClick={handleNext}
          disabled={!currentStep.valid || isLoading}
          className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-bold"
        >
          {isLoading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analyzing...</>
          ) : isLast ? (
            <>Generate Scorecard <ArrowRight className="ml-2 h-4 w-4" /></>
          ) : (
            "Next"
          )}
        </Button>
      </div>
    </div>
  );
}
