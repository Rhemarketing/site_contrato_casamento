# Contrato de Casamento

Aplicação web para apoiar conversas conscientes sobre expectativas e decisões na vida a dois.

A integração `1.4.0-release.1` está documentada em [docs/contract-master-implementation.md](docs/contract-master-implementation.md). A jornada de 200 perguntas fica em `/contrato`, com aquisição de R$ 0,00, decisões conjuntas, contrato e acompanhamento. A admissão foi preservada. A ativação depende das variáveis e migrations do [guia de implantação](docs/easypanel-deploy.md). O gateway será desenvolvido após os testes do usuário em produção.

Uma única aquisição do produto libera o questionário de 200 perguntas para os dois membros do casal conectado. O acesso do parceiro é reconhecido automaticamente após aceitar o convite ou após a compra, sem uma segunda aquisição. A compra deve estar confirmada e não revogada, e o vínculo do casal deve estar ativo. Cada pessoa mantém suas respostas individuais privadas e a avaliação conjunta continua exigindo consentimento separado.

### Alertas privados e continuidade

A política `1.4.0-engine.3` trata alertas, inclusive críticos, como avisos individuais na aba Privacidade. Nenhuma alternativa selecionada exige revisor ou bloqueia a geração do contrato. A Q181 depende somente dos contextos informados; o acordo voluntário da Q151 depende do pedido conjunto e das confirmações, sem revisão. Respostas e orientações privadas continuam excluídas do documento compartilhado. Preenchimento obrigatório, consentimento individual e confirmação bilateral dos acordos continuam necessários.

A política também interpreta as edições já armazenadas, sem alterar respostas, consentimentos ou snapshots do catálogo e sem migration. A nova versão de processamento impede reutilizar propostas e rascunhos gerados pela regra anterior: acordos precisam de novas confirmações e documentos de nova geração. Versões já aceitas permanecem no histórico. Revisões antigas permanecem disponíveis para consulta e revogação de acesso, mas não concedem nem condicionam acesso ao contrato.

## Requisitos

- Node.js compatível com Next.js 16
- MariaDB

## Configuração local

1. Copie `.env.example` para `.env` e ajuste a conexão do MariaDB.
2. Instale as dependências com `npm install`.
3. Gere o Prisma Client com `npm run prisma:generate`.
4. Inicie com `npm run dev`.

Para testar e-mails, configure também `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD` e `SMTP_FROM`. Credenciais reais devem permanecer somente no ambiente local ignorado pelo Git ou no Environment do EasyPanel.

O Prisma utiliza `provider = "mysql"`, o conector correto para MariaDB. Alterações futuras de estrutura devem ser registradas por migrations.

## Banco de dados e migrations

- Desenvolvimento: `npm run prisma:migrate:dev`
- Produção/EasyPanel: `npm run prisma:migrate:deploy`
- Nunca utilize `prisma db push` como substituto das migrations versionadas.

Os testes de constraints usam um banco separado. Copie `.env.test.example` para `.env.test`, configure um banco local cujo nome termine em `_test` e aplique as migrations antes de executar a suíte. A proteção no teste recusa hosts remotos e bancos sem esse sufixo.

## Validação

- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npm run build`
