import { Card } from "@/components/ui/card";
import { admissionSteps } from "@/data/admission";

export function AdmissionOverview() {
  return (
    <ol className="grid gap-5 md:grid-cols-3">
      {admissionSteps.map((step, index) => (
        <li key={step.title}>
          <Card className="h-full">
            <span className="grid size-10 place-items-center rounded-full bg-accent-soft font-semibold text-brand">{index + 1}</span>
            <h2 className="mt-5 text-lg font-semibold text-brand-strong">{step.title}</h2>
            <p className="mt-2 text-sm text-muted">{step.description}</p>
          </Card>
        </li>
      ))}
    </ol>
  );
}
