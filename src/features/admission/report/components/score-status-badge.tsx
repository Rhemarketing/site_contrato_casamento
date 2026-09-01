import { Badge } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { AdmissionScorePresentationDto } from "@/types/admission-report";

export const scoreLevelStyles = {
  danger: {
    badge: "bg-red-100 text-red-900",
    bar: "bg-red-600",
    panel: "bg-red-700",
  },
  warning: {
    badge: "bg-amber-100 text-amber-950",
    bar: "bg-amber-500",
    panel: "bg-amber-600",
  },
  success: {
    badge: "bg-emerald-100 text-emerald-950",
    bar: "bg-emerald-600",
    panel: "bg-emerald-700",
  },
} as const;

export function ScoreStatusBadge({
  level,
  title,
  className,
}: {
  level: AdmissionScorePresentationDto["level"];
  title: string;
  className?: string;
}) {
  return (
    <Badge className={cn("gap-2", scoreLevelStyles[level].badge, className)}>
      <span className={cn("size-2 rounded-full", scoreLevelStyles[level].bar)} aria-hidden="true" />
      {title}
    </Badge>
  );
}
