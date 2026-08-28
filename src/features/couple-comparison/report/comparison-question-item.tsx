import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";
import type { CoupleComparisonReportQuestionDto } from "@/types/couple-comparison-report";

const classificationStyles = {
  CONVERGENCIA: "bg-emerald-50 text-emerald-800",
  DIVERGENCIA_MODERADA: "bg-amber-50 text-amber-900",
  DIVERGENCIA_IMPORTANTE: "bg-rose-50 text-rose-900",
} as const;

export function ComparisonQuestionItem({ question }: { question: CoupleComparisonReportQuestionDto }) {
  return (
    <li className="grid gap-3 border-t border-line py-4 first:border-t-0 first:pt-0 last:pb-0 sm:grid-cols-[1fr_auto] sm:items-start">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">{question.questionCode}</p>
        <p className="mt-1 leading-relaxed text-foreground">{question.text}</p>
      </div>
      <Badge className={cn("w-fit normal-case tracking-normal", classificationStyles[question.classification])}>
        {question.classificationLabel}
      </Badge>
    </li>
  );
}
