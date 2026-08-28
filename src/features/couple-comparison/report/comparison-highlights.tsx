import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { CoupleComparisonHighlightDto, CoupleComparisonReportDto } from "@/types/couple-comparison-report";

function HighlightList({
  items,
  emptyMessage,
}: {
  items: CoupleComparisonHighlightDto[];
  emptyMessage: string;
}) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-line bg-background px-5 py-7 text-center text-sm text-muted">
        {emptyMessage}
      </div>
    );
  }
  const visibleItems = items.slice(0, 5);
  return (
    <div>
      <ul className="grid gap-3">
        {visibleItems.map((item) => (
          <li key={item.questionCode} className="rounded-2xl border border-line bg-background p-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="normal-case tracking-normal">{item.areaName}</Badge>
              <span className="text-xs font-semibold text-muted">{item.questionCode}</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-foreground">{item.text}</p>
          </li>
        ))}
      </ul>
      {items.length > visibleItems.length ? (
        <p className="mt-3 text-sm text-muted">Mais {items.length - visibleItems.length} temas aparecem nos cards das áreas.</p>
      ) : null}
    </div>
  );
}

export function ComparisonHighlights({ highlights }: { highlights: CoupleComparisonReportDto["highlights"] }) {
  const sections = [
    {
      id: "alignment",
      title: "Maior alinhamento",
      description: "Temas em que as percepções de vocês se aproximam.",
      items: highlights.alignment,
      emptyMessage: "Nenhuma percepção semelhante foi identificada nesta comparação.",
    },
    {
      id: "moderate",
      title: "Temas que merecem conversa",
      description: "Diferenças moderadas que podem ser exploradas uma de cada vez.",
      items: highlights.moderateDivergences,
      emptyMessage: "Não existem diferenças moderadas de percepção neste relatório.",
    },
    {
      id: "important",
      title: "Diferenças importantes de percepção",
      description: "Temas que podem merecer uma conversa mais cuidadosa, sem determinar quem está certo.",
      items: highlights.importantDivergences,
      emptyMessage: "Não existem diferenças importantes de percepção neste relatório.",
    },
  ];

  return (
    <section aria-labelledby="comparison-highlights-title">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">Leitura orientada</p>
        <h2 id="comparison-highlights-title" className="mt-2 font-serif text-3xl font-semibold text-brand-strong">Destaques</h2>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        {sections.map((section) => (
          <Card key={section.id} className="flex min-w-0 flex-col p-5 sm:p-6">
            <h3 className="font-serif text-xl font-semibold text-brand-strong">{section.title}</h3>
            <p className="mt-2 min-h-12 text-sm text-muted">{section.description}</p>
            <div className="mt-5">
              <HighlightList items={section.items} emptyMessage={section.emptyMessage} />
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
