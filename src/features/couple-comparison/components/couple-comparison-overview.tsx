import { consentToCoupleComparison, revokeCoupleComparisonConsent } from "@/app/actions/couple.actions";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { buildCoupleComparisonReportDto } from "@/features/couple-comparison/report/couple-comparison-report-dto";
import { CoupleComparisonReport } from "@/features/couple-comparison/report/couple-comparison-report";
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

  const report = buildCoupleComparisonReportDto(state.comparison);
  return (
    <div className="grid gap-6">
      {error ? <Alert variant="error">{error}</Alert> : null}
      <CoupleComparisonReport report={report} />
    </div>
  );
}
