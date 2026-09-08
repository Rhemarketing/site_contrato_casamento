import { Badge } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { AdmissionScorePresentationDto } from "@/types/admission-report";

export const scoreLevelStyles = {
  danger: {
    badge: "border-rose-200 bg-white/70 text-rose-900 shadow-rose-900/5",
    bar: "bg-gradient-to-r from-rose-500 to-red-500",
    panel: "border-rose-200/90 bg-[linear-gradient(145deg,#fff1f2_0%,#fff7ed_100%)] shadow-rose-950/10",
    text: "text-rose-900",
    mutedText: "text-rose-950/65",
    soft: "border-rose-200/70 bg-white/55",
    glow: "bg-rose-300/35",
    icon: "border-rose-200 bg-rose-100 text-rose-800",
  },
  warning: {
    badge: "border-amber-200 bg-white/70 text-amber-950 shadow-amber-900/5",
    bar: "bg-gradient-to-r from-amber-400 to-yellow-500",
    panel: "border-amber-200/90 bg-[linear-gradient(145deg,#fffbeb_0%,#fff7d6_100%)] shadow-amber-950/10",
    text: "text-amber-950",
    mutedText: "text-amber-950/65",
    soft: "border-amber-200/70 bg-white/55",
    glow: "bg-amber-300/35",
    icon: "border-amber-200 bg-amber-100 text-amber-800",
  },
  success: {
    badge: "border-emerald-200 bg-white/70 text-emerald-950 shadow-emerald-900/5",
    bar: "bg-gradient-to-r from-emerald-500 to-teal-500",
    panel: "border-emerald-200/90 bg-[linear-gradient(145deg,#ecfdf5_0%,#f0fdfa_100%)] shadow-emerald-950/10",
    text: "text-emerald-950",
    mutedText: "text-emerald-950/65",
    soft: "border-emerald-200/70 bg-white/55",
    glow: "bg-emerald-300/35",
    icon: "border-emerald-200 bg-emerald-100 text-emerald-800",
  },
} as const;

const categorySymbols = {
  danger: "!",
  warning: "↗",
  success: "✓",
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
    <Badge className={cn("gap-2 border py-1.5 shadow-sm backdrop-blur-sm", scoreLevelStyles[level].badge, className)}>
      <span className={cn("grid size-5 place-items-center rounded-full border text-[11px] leading-none", scoreLevelStyles[level].icon)} aria-hidden="true">
        {categorySymbols[level]}
      </span>
      {title}
    </Badge>
  );
}
