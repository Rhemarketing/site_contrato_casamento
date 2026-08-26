import { PrivateSafetyGuidance } from "@/features/admission/components/private-safety-guidance";
import type { AdmissionIndividualReportDto } from "@/types/admission-report";
import { AnswerDistribution } from "./answer-distribution";
import { AreaGroups } from "./area-groups";
import { GeneralScoreCard } from "./general-score-card";
import { PriorityFlagsSection } from "./priority-flags-section";
import { ReportDisclaimer } from "./report-disclaimer";
import { ReportHeader } from "./report-header";

export function IndividualAdmissionReport({ report }: { report: AdmissionIndividualReportDto }) {
  return (
    <article>
      <ReportHeader attempt={report.attempt} />
      <GeneralScoreCard general={report.general} />
      <AreaGroups areaGroups={report.areaGroups} />
      <AnswerDistribution counts={report.answerCounts} />
      <PriorityFlagsSection flags={report.flags} />
      {report.safety ? <PrivateSafetyGuidance result={report.safety} /> : null}
      <ReportDisclaimer />
    </article>
  );
}
