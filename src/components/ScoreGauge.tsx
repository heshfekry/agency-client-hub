import { useEffect, useState } from "react";

interface ScoreGaugeProps {
  score: number;
  label: string;
  reasoning?: string;
  delay?: number;
}

export function ScoreGauge({ score, label, reasoning, delay = 0 }: ScoreGaugeProps) {
  const [animated, setAnimated] = useState(false);
  const percentage = (score / 5) * 100;

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const getColorClass = () => {
    if (score <= 2) return "score-bar-low";
    if (score <= 3.5) return "score-bar-mid";
    return "score-bar-high";
  };

  const getTextColor = () => {
    if (score <= 2) return "text-score-low";
    if (score <= 3.5) return "text-score-mid";
    return "text-score-high";
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="font-body text-sm font-medium text-foreground">{label}</span>
        <span className={`font-display text-lg ${getTextColor()}`}>{score}/5</span>
      </div>
      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
        <div
          className={`score-bar ${getColorClass()}`}
          style={{ width: animated ? `${percentage}%` : "0%" }}
        />
      </div>
      {reasoning && (
        <p className="font-body text-xs text-muted-foreground leading-relaxed pt-0.5">
          {reasoning}
        </p>
      )}
    </div>
  );
}
