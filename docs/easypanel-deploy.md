# Deploy no EasyPanel

Este guia publica o Contrato de Casamento como uma aplicação Docker conectada a um MariaDB privado no mesmo projeto do EasyPanel.

## Arquitetura

```text
Projeto EasyPanel
├── MariaDB privado
└── App Next.js (Dockerfile, porta 3000, uma réplica)
```

A imagem usa Node.js 22 sobre Debian Bookworm, executa `prisma migrate deploy` antes de iniciar o Next.js e roda como o usuário não-root `node`. O startup falha se uma migration falhar.

## 1. Preparar domínio e DNS

1. Escolha o hostname HTTPS público, por exemplo `casamento.seudominio.com`.
2. Crie o registro DNS apontando para a VPS do EasyPanel.
3. Use exatamente esse domínio em `APP_URL` e `AUTH_URL`; nunca use `localhost` em produção.

## 2. Criar o MariaDB

1. Abra o projeto no EasyPanel.
2. Selecione **New Service → MariaDB**.
3. Defina um nome de serviço e um banco exclusivo da aplicação.
4. Use o usuário próprio gerado/configurado para a aplicação, nunca `root`.
5. Mantenha **Expose** desativado: a porta 3306 não deve ser pública.
6. Em **Credentials**, copie a **Internal Connection URL** para `DATABASE_URL` da App.

O Prisma usa uma URL `mysql://` também para MariaDB. Se a senha possuir caracteres reservados, use a URL já codificada exibida pelo EasyPanel.

## 3. Criar a App

1. Selecione **New Service → App**.
2. Em **Source**, escolha GitHub ou Git e configure repositório, branch e **Build Path** `/`.
3. Em **Build**, selecione **Dockerfile**.
4. Informe `Dockerfile` como caminho.
5. Configure uma réplica inicialmente.
6. Não sobrescreva `ENTRYPOINT`, `CMD` ou o comando de startup no painel.

## 4. Configurar Environment

Cadastre no ambiente da App, sem incluir aspas desnecessárias:

```text
NODE_ENV=production
PORT=3000
HOSTNAME=0.0.0.0
DATABASE_URL=<Internal Connection URL do MariaDB>
AUTH_SECRET=<segredo aleatório com pelo menos 32 caracteres>
APP_URL=https://casamento.seudominio.com
AUTH_URL=https://casamento.seudominio.com
CONTRACT_ENABLED=true
CONTRACT_DATA_KEY=<chave aleatória de 32 bytes em base64, distinta de AUTH_SECRET>
CONTRACT_REVIEWER_USER_IDS=<UUIDs das contas revisoras nominalmente designadas>
```

Gere `AUTH_SECRET` e, em uma segunda execução independente, `CONTRACT_DATA_KEY` fora do repositório, por exemplo com `openssl rand -base64 32`. Não registre os resultados em issue, commit ou log. Conserve a chave dos dados em armazenamento de segredos separado do banco e de seus backups. Não substitua chaves existentes sem o procedimento de rotação abaixo.

A integração `1.4.0-release.1` está liberada no catálogo. `CONTRACT_ENABLED=true` ativa compra gratuita e jornada do contrato; a inicialização falha se a chave for inválida ou a edição não estiver liberada. Não use `CONTRACT_PREVIEW_*` em produção. Cadastre as contas revisoras e obtenha seus UUIDs, incluindo somente essas identidades em `CONTRACT_REVIEWER_USER_IDS`. O papel ADMIN serve à edição do catálogo, sem conceder acesso a respostas. Cada titular ainda precisa escolher e autorizar seu revisor. Sem revisor configurado, os casos dependentes de revisão ficam bloqueados na área individual.

O produto é R$ 0,00 e a aquisição é confirmada no servidor como PAID/FREE_CHECKOUT. Não há credenciais de gateway a configurar nesta versão.

O SMTP é opcional durante esta fase. Sem ele, a aplicação inicia normalmente, mas recuperação de senha e envio de convites por e-mail retornam falha controlada. Quando esses recursos forem habilitados, cadastre juntos `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD` e `SMTP_FROM` exclusivamente em **Environment** da App. Não use build arguments, não crie arquivo `.env` dentro da imagem e não publique credenciais SMTP no Git. A porta 465 usa conexão TLS imediata; as demais portas usam STARTTLS. O remetente configurado em `SMTP_FROM` deve estar autorizado no provedor.

`AUTH_URL` torna o host canônico conhecido pelo Auth.js e já habilita a confiança de host prevista pela versão instalada. Não configure `AUTH_TRUST_HOST` no primeiro deploy. Use `AUTH_TRUST_HOST=true` somente se os logs mostrarem `UntrustedHost`, depois de confirmar que o proxy do EasyPanel controla corretamente `Host` e `X-Forwarded-*`.

Não configure `DEMO_USER_PASSWORD` e nunca execute `demo:seed` ou `demo:reset` em produção.

## 5. Configurar domínio

1. Abra **Domains** na App.
2. Adicione o hostname público.
3. Direcione protocolo HTTP interno para a porta `3000`.
4. Habilite HTTPS/certificado.
5. Marque-o como domínio principal.

O EasyPanel termina o TLS no proxy e encaminha a requisição ao container. Com `NODE_ENV=production` e URL pública HTTPS, verifique no navegador que o cookie de sessão do Auth.js possui `Secure`, `HttpOnly` e `SameSite=Lax`.

## 6. Primeiro deploy e migrations

Para atualizar uma instalação existente, faça e verifique um backup antes do deploy. Esta entrega acrescenta as migrations `20260912160000_add_contract_workspace`, `20260913010000_contract_release_records` e `20260913020000_contract_workspace_activity`; são nove migrations no histórico completo. As migrations anteriores da admissão não foram alteradas.

1. Selecione **Deploy**.
2. Acompanhe o build da imagem.
3. No startup, o entrypoint executará somente:

   ```bash
   prisma migrate deploy
   ```

4. A aplicação inicia apenas depois das migrations concluírem.

Nunca use `prisma migrate dev`, `prisma db push` ou `prisma migrate reset` em produção. Não aplique SQL manualmente.

## 7. Executar o seed oficial

Após o primeiro deploy, abra um shell/console da App e execute uma vez:

```bash
npm run db:seed
```

Esse comando executa apenas `prisma/seed.ts`, sincronizando o questionário oficial 8.0. Ele é idempotente e não cria contas demo. Repita somente quando um deploy trouxer uma versão oficial nova ou a documentação da release solicitar.

## 8. Healthcheck

Valide externamente:

```bash
curl --fail https://casamento.seudominio.com/api/health
```

Resposta esperada:

```json
{"status":"ok"}
```

O Docker também consulta internamente `http://127.0.0.1:3000/api/health`. A rota confirma que o processo HTTP responde; migrations bem-sucedidas no entrypoint validam a preparação do banco antes do startup.

## 9. Checklist funcional pós-deploy

Teste usando dados de produção controlados, sem respostas privadas reais durante QA:

- landing page;
- cadastro, login e logout;
- callback para `/dashboard`;
- questionário e retomada de tentativa;
- resultado individual;
- área do casal;
- criação, abertura e aceite de convite;
- recebimento do e-mail de convite sem respostas ou resultados, quando SMTP estiver configurado;
- solicitação e conclusão de recuperação de senha, quando SMTP estiver configurado;
- link de convite começando pelo domínio HTTPS público;
- cookies de autenticação marcados como `Secure`;
- `/api/health` retornando 200.

Para a integração do contrato, testar com duas contas fictícias conectadas:

- compra de R$ 0,00 em cada conta, inclusive duplo clique e retorno à página;
- retomada das respostas individuais, contextos desconhecidos/inaplicáveis e complementos privados;
- impossibilidade de ler os dados do parceiro pela URL ou pelo acesso administrativo;
- conclusão e consentimento individual dos dois;
- fatos comuns, proposta com campos, confirmação da mesma versão, ausência de consenso e acordo adicional;
- geração somente com as condições satisfeitas, texto cadastrado, aceites dos dois e impressão/PDF;
- revisão com motivo, novo aceite, histórico e revogação sem reativar aceites antigos;
- agenda com fuso, registros privados, compartilhamento de emergência por campo e cofrinho confirmado/contestado;
- revisão privada somente após autorização nominal, revogação e bloqueio diante de alerta crítico;
- exportação própria e exclusão com preservação das respostas privadas do outro.

Não usar relatos sensíveis reais para executar cenários de QA. O teste completo no servidor é do usuário antes de desenvolver o pagamento real.

Nunca registre tokens de convite, senhas ou respostas P31–P33 durante esses testes.

As sessões usam JWT. Alterar a senha atualiza as próximas autenticações, mas não revoga automaticamente JWTs que já tenham sido emitidos. Não altere a estratégia de sessão durante um deploy desta etapa.

## 10. Backups

1. Em **Server Settings → Storage Providers**, configure um destino remoto.
2. No serviço MariaDB, abra **Backups** e crie um backup lógico para o banco da aplicação.
3. Configure agenda diária, retenção máxima de 30 dias e um caminho exclusivo com acesso restrito.
4. Execute **Manual Run** e confirme o arquivo e o log antes de considerar a rotina pronta.
5. Teste restauração em banco não produtivo.

Faça um backup manual verificado antes de migrations de alto risco, atualização do MariaDB ou rotação de credenciais. Não use cópia do volume vivo como substituto de `mariadb-dump`.

Na restauração, mantenha o ambiente sem acesso público e sem envio de e-mails. Use a chave correspondente guardada separadamente, confira migrations e reaplique as exclusões de titulares efetuadas depois da data do backup antes de reabrir o site. O operador deve manter registro restrito das solicitações de exclusão, sem respostas, para executar essa reconciliação. A restauração não deve republicar dados apagados. O limite de 30 dias também se aplica a cópias locais e exportações administrativas de backup.

### Retenção e rotação dos dados do contrato

No servidor Node dedicado, a manutenção executa uma varredura um minuto após iniciar e outra diariamente. Remove espaços inativos há 180 dias sem documento aceito. Documentos aceitos permanecem até solicitação de exclusão. Consulte falhas de manutenção nos logs; as mensagens não contêm dados privados. Simulação manual:

```bash
npm run contract:maintenance
```

Para aplicar a limpeza: `npm run contract:maintenance -- --apply`. Faça a operação na única réplica, sem executar outra manutenção simultânea.

Para rotacionar, mantenha a chave antiga em `CONTRACT_DATA_KEY` para payloads v1. Configure `CONTRACT_DATA_KEYS` como objeto JSON de identificadores para chaves base64 e `CONTRACT_DATA_ACTIVE_KEY_ID` como o identificador da chave nova. Preserve também todas as chaves v2 antigas nesse objeto durante a migração. Reinicie o serviço e execute:

```bash
npm run contract:maintenance -- --rotate
npm run contract:maintenance -- --apply --rotate
npm run contract:maintenance -- --rotate
```

A primeira execução simula, a segunda aplica e a terceira confirma que não restam payloads antigos. O comando pode aplicar também a retenção; confira o resultado da simulação antes. A rotação mantém os hashes do conteúdo e as datas de atividade. Verifique leitura de sessões, revisões e histórico com contas controladas. Só retire chaves antigas do serviço depois de confirmar ausência de registros dependentes; conserve cópias restritas enquanto existirem backups que dependam delas. Perda de todas as cópias da chave não é recuperável pela senha da conta.

## 11. Atualizações

1. Faça backup quando a release incluir migrations relevantes.
2. Publique o commit no repositório configurado.
3. Acione **Deploy**.
4. Confira o log do entrypoint e o healthcheck.
5. Execute `npm run db:seed` somente quando necessário.
6. Repita o checklist funcional.

Mantenha uma réplica enquanto migrations forem executadas no entrypoint. Antes de escalar horizontalmente, defina coordenação de cache, chave compartilhada para Server Actions e estratégia de migrations com execução única.

## 12. Troubleshooting

### Aplicação não inicia

- Confira primeiro o log de `prisma migrate deploy`.
- Confirme que `DATABASE_URL` usa a URL interna, banco correto e usuário não-root.
- Verifique se MariaDB está ativo e acessível pela rede privada do projeto.

### `UntrustedHost` no Auth.js

- Confirme que `AUTH_URL` e `APP_URL` são idênticos ao domínio HTTPS principal.
- Confirme o domínio principal e os headers encaminhados pelo proxy.
- Somente então avalie `AUTH_TRUST_HOST=true`.

### Login retorna ao formulário

- Apague cookies antigos depois de alterar `AUTH_SECRET` ou domínio.
- Confirme HTTPS e os atributos do cookie no navegador.
- Nunca altere `AUTH_SECRET` durante um deploy normal: isso invalida todas as sessões.

### Convite aponta para localhost

- Corrija `APP_URL` para o domínio HTTPS, redeploye e gere um novo convite.
- Links já emitidos não devem ser reconstruídos a partir de logs.

### E-mail não é enviado

- Confirme os cinco nomes `SMTP_*` no Environment, sem imprimir seus valores em logs ou tickets.
- Verifique se a porta está liberada pela VPS e se o remetente de `SMTP_FROM` foi autorizado.
- Para porta 465, o transporte usa TLS imediato; para as demais, usa STARTTLS.
- Uma falha de envio não duplica convites. O link criado continua disponível para cópia, e um novo envio exige regeneração explícita.

### Container unhealthy

- Consulte os logs da App e teste `/api/health` dentro e fora do domínio.
- Confirme que a App escuta em `0.0.0.0:3000` e que o domínio aponta para a porta interna 3000.

## Referências oficiais do EasyPanel

- [App Service](https://easypanel.io/docs/services/app)
- [Builders e Dockerfile](https://easypanel.io/docs/builders)
- [MariaDB Service](https://easypanel.io/docs/services/mariadb)
- [Database Backups](https://easypanel.io/docs/backups/database)
