import { Card } from "@/components/ui/card";
import { COUPLE_COMPARISON_GUIDANCE } from "./couple-comparison-content";

export function ComparisonGuidance() {
  return (
    <section aria-labelledby="comparison-guidance-title">
      <Card className="border-brand/20 bg-brand-strong text-white">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent-soft">Conversa orientada</p>
        <h2 id="comparison-guidance-title" className="mt-2 font-serif text-3xl font-semibold">Como usar este relatório</h2>
        <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {COUPLE_COMPARISON_GUIDANCE.map((guidance, index) => (
            <li key={guidance} className="rounded-2xl border border-white/15 bg-white/5 p-4 text-sm leading-relaxed text-white/90">
              <span className="mb-3 grid size-8 place-items-center rounded-full bg-accent-soft font-bold text-brand-strong" aria-hidden="true">
                {index + 1}
              </span>
              {guidance}
            </li>
          ))}
        </ol>
      </Card>
    </section>
  );
}
