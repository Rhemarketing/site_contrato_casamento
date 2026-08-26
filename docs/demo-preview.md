# Preview local e dados de demonstração

## Preparação

1. Inicie o MySQL/MariaDB pelo Laragon.
2. Copie `.env.example` para `.env` e configure `DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL` e `APP_URL` para o ambiente local.
3. Defina uma senha local com pelo menos 12 caracteres em `DEMO_USER_PASSWORD`. Não versione esse valor.
4. Instale e prepare a aplicação:

```text
npm install
npx prisma migrate deploy
npx prisma db seed
npm run demo:seed
npm run dev
```

A senha utilizada por todas as contas abaixo é a definida em `DEMO_USER_PASSWORD`.

## Contas disponíveis

| Conta | Estado | Finalidade |
| --- | --- | --- |
| `demo.novo@contrato.local` | Sem prova e sem casal | Fluxo inicial |
| `demo.andamento@contrato.local` | 15 de 40 respostas | Autosave, continuidade e reload |
| `demo.base@contrato.local` | Resultado de boa base | Relatório com pontos fortes |
| `demo.ajustes@contrato.local` | Resultado intermediário | Relatório equilibrado |
| `demo.desgaste@contrato.local` | Alto desgaste | Áreas prioritárias e quatro flags conjugais |
| `demo.safety@contrato.local` | Resultado com Safety privado | Orientação privada em nível `ATTENTION` |
| `demo.convite@contrato.local` | Casal `PENDING` | Estado de convite pendente |
| `demo.casal.a@contrato.local` | Casal `ACTIVE`, creator | Vínculo conectado |
| `demo.casal.b@contrato.local` | Casal `ACTIVE`, partner | Vínculo conectado pela outra conta |

O cenário Safety usa respostas conjugais controladas e não utiliza `HIGH_ALERT`. O casal ativo não possui comparação ou compartilhamento de respostas.

## Segurança e idempotência

`npm run demo:seed` funciona somente com MariaDB/MySQL local e o banco `contrato_casamento`. Ele recusa `NODE_ENV=production`, host remoto, banco com outro nome e senha demo ausente.

O comando pode ser repetido: ele remove e reconstrói somente registros identificados pelo domínio reservado `@contrato.local`. Se um casal demo estiver ligado a uma conta fora desse domínio, a limpeza é interrompida para proteger o dado não demo.

O token original do convite pendente não é persistido nem exibido. Para testar uma URL real de convite, gere ou regenere um link pela interface autenticada de `/casal`.

## Reset

```text
npm run demo:reset
```

O reset remove somente contas `@contrato.local` e seus attempts, answers, áreas, flags, convites, memberships e couples relacionados. Usuários reais e o questionário oficial são preservados.

Para retornar ao estado conhecido após QA destrutivo:

```text
npm run demo:reset
npm run demo:seed
```

## Roteiro sugerido

1. Navegue anonimamente por `/`, `/admissao`, `/cadastro` e `/login`.
2. Entre com `demo.novo@contrato.local` e inicie a prova.
3. Entre com `demo.andamento@contrato.local`, responda algumas perguntas e recarregue.
4. Compare visualmente os relatórios das contas `demo.base`, `demo.ajustes` e `demo.desgaste`.
5. Confira o bloco privado com `demo.safety@contrato.local`.
6. Confira `/casal` com `demo.convite`, `demo.casal.a` e `demo.casal.b`.
7. Gere um novo convite pela interface para testar `/convite/[token]` anonimamente e com aceite explícito.
