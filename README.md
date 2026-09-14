# Contrato de Casamento

Aplicação web para apoiar conversas conscientes sobre expectativas e decisões na vida a dois.

A integração `1.4.0-release.1` está documentada em [docs/contract-master-implementation.md](docs/contract-master-implementation.md). A jornada de 200 perguntas fica em `/contrato`, com aquisição de R$ 0,00, decisões conjuntas, contrato e acompanhamento. A admissão foi preservada. A ativação depende das variáveis e migrations do [guia de implantação](docs/easypanel-deploy.md). O gateway será desenvolvido após os testes do usuário em produção.

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
