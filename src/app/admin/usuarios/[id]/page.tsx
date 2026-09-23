import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { WorkspacePage } from "@/components/layout/workspace-page";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserActions } from "./_components/user-actions";
import { getAdminUserDetails } from "@/services/admin-users.service";

interface UserDetailPageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: UserDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const data = await getAdminUserDetails(id);
  return {
    title: data ? `Raio-X: ${data.user.name} | Administração` : "Usuário Não Encontrado",
  };
}

export default async function UserDetailPage({ params }: UserDetailPageProps) {
  const { id } = await params;
  const data = await getAdminUserDetails(id);

  if (!data) {
    notFound();
  }

  const { user, partner, invites, attempts, contract } = data;
  const latestAttempt = attempts[0];

  return (
    <WorkspacePage
      eyebrow="Painel Administrativo"
      title={user.name}
      description={`Visão geral completa dos questionários, parceiro conectado e histórico de ${user.name}.`}
    >
      {/* Botão Voltar e Ações */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline"
        >
          <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Voltar para Lista de Usuários
        </Link>

        <UserActions user={user} />
      </div>

      <div className="space-y-8">
        {/* Bloco 1: Dados Cadastrais & Perfil */}
        <Card className="p-6 sm:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="font-serif text-2xl font-bold text-brand-strong">{user.name}</h2>
                {user.role === "ADMIN" ? (
                  <Badge className="bg-amber-100 text-amber-800 border-amber-300">ADMINISTRADOR</Badge>
                ) : (
                  <Badge className="bg-surface text-muted border border-line">USUÁRIO</Badge>
                )}
              </div>
              <p className="mt-1 text-sm text-muted">{user.email}</p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 border-t border-line pt-6 sm:grid-cols-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-muted">ID do Sistema</span>
              <p className="mt-1 font-mono text-xs text-foreground select-all">{user.id}</p>
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-muted">Data de Cadastro</span>
              <p className="mt-1 text-sm font-medium text-foreground">
                {new Date(user.createdAt).toLocaleString("pt-BR")}
              </p>
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-muted">Última Atualização</span>
              <p className="mt-1 text-sm font-medium text-foreground">
                {new Date(user.updatedAt).toLocaleString("pt-BR")}
              </p>
            </div>
          </div>
        </Card>

        {/* Bloco 2: Vínculo do Casal & Cônjuge */}
        <Card className="p-6 sm:p-7">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-brand/10 text-brand">
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="8" cy="12" r="5" />
                <circle cx="16" cy="12" r="5" />
              </svg>
            </span>
            <h3 className="font-serif text-xl font-bold text-brand-strong">Vínculo Conjugal</h3>
          </div>

          {partner ? (
            <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50/50 p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                    <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Parceiro(a) Conectado(a)
                  </span>
                  <h4 className="mt-2 text-lg font-bold text-brand-strong">{partner.name}</h4>
                  <p className="text-sm text-muted">{partner.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/usuarios/${partner.id}`}
                    className="inline-flex items-center gap-1 rounded-xl bg-surface border border-line px-3 py-2 text-xs font-semibold text-brand shadow-sm hover:bg-background"
                  >
                    Ver Raio-X do Parceiro
                    <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </Link>
                </div>
              </div>

              <div className="mt-4 grid gap-3 border-t border-emerald-200/60 pt-4 text-xs sm:grid-cols-3 text-muted">
                <div>
                  <span className="font-bold text-emerald-900">Papel na Conexão:</span>{" "}
                  {partner.role === "CREATOR" ? "Criador do Casal" : "Convidado"}
                </div>
                <div>
                  <span className="font-bold text-emerald-900">Conectado em:</span>{" "}
                  {new Date(partner.joinedAt).toLocaleDateString("pt-BR")}
                </div>
                <div>
                  <span className="font-bold text-emerald-900">Status do Casal:</span> Ativo
                </div>
              </div>
            </div>
          ) : invites.length > 0 && invites[0].status === "PENDING" ? (
            <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50/50 p-5">
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800">
                Convite Pendente Enviado
              </span>
              <p className="mt-2 text-sm text-brand-strong">
                Destinatário: <strong>{invites[0].whatsappPhone || invites[0].email || "WhatsApp"}</strong>
              </p>
              <p className="mt-1 text-xs text-muted">
                Enviado em {new Date(invites[0].createdAt).toLocaleString("pt-BR")} • Expira em{" "}
                {new Date(invites[0].expiresAt).toLocaleDateString("pt-BR")}
              </p>
            </div>
          ) : (
            <div className="mt-5 rounded-xl border border-line bg-background/50 p-6 text-center text-sm text-muted">
              Este usuário ainda não conectou um cônjuge e não possui convites pendentes.
            </div>
          )}
        </Card>

        {/* Bloco 3: Questionário de Admissão (40 Perguntas) */}
        <Card className="p-6 sm:p-7">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
                <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 11l3 3L22 4" />
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                </svg>
              </span>
              <h3 className="font-serif text-xl font-bold text-brand-strong">
                Avaliação Diagnóstica de Admissão (40 Perguntas)
              </h3>
            </div>

            {latestAttempt && (
              <Badge
                className={
                  latestAttempt.status === "COMPLETED"
                    ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                    : "bg-amber-100 text-amber-800 border-amber-300"
                }
              >
                {latestAttempt.status === "COMPLETED" ? "Concluído" : "Em Andamento"}
              </Badge>
            )}
          </div>

          {!latestAttempt ? (
            <div className="mt-6 rounded-xl border border-line bg-background/50 p-8 text-center text-muted">
              Nenhuma tentativa de questionário registrada para este usuário.
            </div>
          ) : (
            <div className="mt-6 space-y-6">
              {/* Resumo da Nota e Datas */}
              <div className="grid gap-4 rounded-xl border border-line bg-background/60 p-4 sm:grid-cols-3">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-muted">Pontuação Geral</span>
                  <p className="mt-1 font-serif text-2xl font-bold text-brand-strong">
                    {latestAttempt.totalScore !== null ? `${latestAttempt.totalScore} pontos` : "Em cálculo"}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-muted">Iniciado em</span>
                  <p className="mt-1 text-sm font-medium text-foreground">
                    {new Date(latestAttempt.startedAt).toLocaleString("pt-BR")}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-muted">Concluído em</span>
                  <p className="mt-1 text-sm font-medium text-foreground">
                    {latestAttempt.completedAt
                      ? new Date(latestAttempt.completedAt).toLocaleString("pt-BR")
                      : "Ainda não finalizado"}
                  </p>
                </div>
              </div>

              {/* Pontuação por Área do Relacionamento */}
              {latestAttempt.areaResults.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold uppercase tracking-wider text-brand-strong">
                    Desempenho por Área do Relacionamento
                  </h4>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {latestAttempt.areaResults.map((area) => (
                      <div
                        key={area.id}
                        className="rounded-xl border border-line bg-surface p-4 shadow-sm"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-brand-strong">{area.area}</span>
                          <span className="rounded-md bg-brand/10 px-2 py-0.5 text-xs font-bold text-brand">
                            {area.score} / {area.maxScore} pts
                          </span>
                        </div>
                        <p className="mt-2 text-xs font-medium text-muted">
                          Classificação: <strong className="text-brand-strong">{area.classification}</strong>
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tabela Detalhada com Todas as 40 Perguntas e Respostas */}
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-brand-strong">
                    Respostas Registradas pelo Usuário ({latestAttempt.answers.length} respondidas)
                  </h4>
                </div>

                <div className="mt-3 divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
                  {latestAttempt.answers.length === 0 ? (
                    <div className="p-6 text-center text-sm text-muted">
                      Nenhuma resposta individual salva ainda nesta tentativa.
                    </div>
                  ) : (
                    latestAttempt.answers.map((ans, idx) => (
                      <div key={ans.id} className="p-4 transition-colors hover:bg-background/40">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-xs font-bold text-brand">
                            #{idx + 1} • {ans.questionCode} ({ans.questionArea})
                          </span>
                          <span className="rounded bg-background px-2 py-0.5 text-[11px] font-semibold text-muted">
                            Pontos: {ans.score}
                          </span>
                        </div>

                        <p className="mt-2 text-sm font-medium text-foreground">
                          {ans.questionText}
                        </p>

                        <div className="mt-2.5 rounded-lg border border-line bg-background/70 p-3">
                          <span className="text-xs font-bold text-brand-strong">
                            Opção Selecionada [{ans.chosenLetter}]:
                          </span>
                          <p className="mt-1 text-xs text-muted leading-relaxed">
                            {ans.chosenText}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Bloco 4: Jornada do Contrato de Casamento (200 Perguntas) */}
        <Card className="p-6 sm:p-7">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600">
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </span>
            <h3 className="font-serif text-xl font-bold text-brand-strong">
              Jornada do Contrato de Casamento
            </h3>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-line bg-background/50 p-4">
              <span className="text-xs font-bold uppercase tracking-wider text-muted">Aquisição / Checkout</span>
              {contract.purchase ? (
                <div className="mt-2">
                  <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300">
                    {contract.purchase.status} ({contract.purchase.source})
                  </Badge>
                  <p className="mt-1 text-xs text-muted">
                    Liberado em {new Date(contract.purchase.acquiredAt).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              ) : (
                <p className="mt-2 text-xs text-muted italic">Nenhuma aquisição registrada</p>
              )}
            </div>

            <div className="rounded-xl border border-line bg-background/50 p-4">
              <span className="text-xs font-bold uppercase tracking-wider text-muted">Sessão no Questionário</span>
              {contract.sessions.length > 0 ? (
                <div className="mt-2">
                  <Badge className="bg-surface text-muted border border-line">
                    Status: {contract.sessions[0].status}
                  </Badge>
                  {contract.sessions[0].submittedAt && (
                    <p className="mt-1 text-xs text-muted">
                      Enviado em {new Date(contract.sessions[0].submittedAt).toLocaleDateString("pt-BR")}
                    </p>
                  )}
                </div>
              ) : (
                <p className="mt-2 text-xs text-muted italic">Questionário do contrato não iniciado</p>
              )}
            </div>
          </div>
        </Card>
      </div>
    </WorkspacePage>
  );
}
