import { PageContainer } from "@/components/ui/page-container";

interface PageHeadingProps {
  eyebrow?: string;
  title: string;
  description: string;
}

export function PageHeading({ eyebrow, title, description }: PageHeadingProps) {
  return (
    <div className="border-b border-line bg-surface py-12 sm:py-16">
      <PageContainer>
        {eyebrow ? <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">{eyebrow}</p> : null}
        <h1 className="mt-2 max-w-3xl font-serif text-4xl leading-tight text-brand-strong sm:text-5xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-lg text-muted">{description}</p>
      </PageContainer>
    </div>
  );
}
