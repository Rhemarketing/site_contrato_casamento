import { consentToCoupleComparison, revokeCoupleComparisonConsent } from "@/app/actions/couple.actions";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { CoupleComparisonPageDto } from "@/types/couple-comparison";

function RevokeForm() {
  return (
    <form action={revokeCoupleComparisonConsent}>
      <Button type="submit" variant="secondary">Revogar autorização</Button>
    </form>
  );
}

export function CoupleComparisonOverview({
  state,
  error,
}: {
  state: CoupleComparisonPageDto;
  error?: string;
}) {
  if (state.state === "PARTNER_NOT_CONNECTED") {
    return (
      <Card className="mx-auto max-w-2xl space-y-4">
        {error ? <Alert variant="error">{error}</Alert> : null}
        <Badge>Vínculo necessário</Badge>
        <h2 className="font-serif text-2xl font-semibold text-brand-strong">Comparação ainda indisponível</h2>
        <p className="text-muted">A comparação ficará disponível depois que seu cônjuge estiver conectado.</p>
      </Card>
    );
  }

  if (state.state === "WAITING_COMPLETION") {
    return (
      <Card className="mx-auto max-w-2xl space-y-4">
        {error ? <Alert variant="error">{error}</Alert> : null}
        <Badge>Provas individuais</Badge>
        <h2 className="font-serif text-2xl font-semibold text-brand-strong">Aguardando conclusão</h2>
        <p className="text-muted">A comparação ficará disponível quando ambos concluírem a Prova de Admissão.</p>
      </Card>
    );
  }

  if (state.state === "WAITING_OWN_CONSENT") {
    return (
      <Card className="mx-auto max-w-2xl space-y-5">
        {error ? <Alert variant="error">{error}</Alert> : null}
        <Badge>Consentimento individual</Badge>
        <h2 className="font-serif text-2xl font-semibold text-brand-strong">Autorize quando estiver pronto(a)</h2>
        <p className="text-muted">
          A comparação considera somente diferenças de percepção em P06–P30. Respostas privadas e dados financeiros ficam excluídos.
        </p>
        <form action={consentToCoupleComparison}>
          <Button type="submit">Autorizar comparação</Button>
        </form>
      </Card>
    );
  }

  if (state.state === "WAITING_PARTNER_CONSENT") {
    return (
      <Card className="mx-auto max-w-2xl space-y-5">
        {error ? <Alert variant="error">{error}</Alert> : null}
        <Badge>Autorização registrada</Badge>
        <h2 className="font-serif text-2xl font-semibold text-brand-strong">Aguardando a outra autorização</h2>
        <p className="text-muted">
          Sua autorização foi registrada. A comparação será liberada quando os dois autorizarem.
        </p>
        <RevokeForm />
      </Card>
    );
  }

  const { comparison } = state;
  return (
    <div className="mx-auto grid max-w-4xl gap-6">
      {error ? <Alert variant="error">{error}</Alert> : null}
      <Card className="space-y-4">
        <Badge>Comparação disponível</Badge>
        <h2 className="font-serif text-2xl font-semibold text-brand-strong">Resumo das diferenças de percepção</h2>
        <p className="text-muted">
          Este resumo não determina quem está certo. Ele apresenta convergências e diferenças nas 25 perguntas comparáveis.
        </p>
        <dl className="grid gap-4 pt-2 sm:grid-cols-3">
          <div><dt className="text-sm font-semibold">Convergências</dt><dd className="text-2xl text-brand-strong">{comparison.summary.convergenceCount}</dd></div>
          <div><dt className="text-sm font-semibold">Diferenças moderadas</dt><dd className="text-2xl text-brand-strong">{comparison.summary.moderateDivergenceCount}</dd></div>
          <div><dt className="text-sm font-semibold">Diferenças importantes</dt><dd className="text-2xl text-brand-strong">{comparison.summary.importantDivergenceCount}</dd></div>
        </dl>
      </Card>
      <Card>
        <h3 className="font-serif text-xl font-semibold text-brand-strong">Estrutura por área</h3>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2" aria-label="Resumo por área">
          {comparison.areas.map((area) => (
            <li key={area.area} className="rounded-2xl border border-line p-4">
              <p className="font-semibold text-brand-strong">{area.area.replaceAll("_", " ")}</p>
              <p className="mt-1 text-sm text-muted">Diferença média: {area.averageDifference.toLocaleString("pt-BR")}</p>
            </li>
          ))}
        </ul>
      </Card>
      <div><RevokeForm /></div>
    </div>
  );
}
