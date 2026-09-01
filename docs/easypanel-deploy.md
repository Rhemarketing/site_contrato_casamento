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
```

Gere `AUTH_SECRET` fora do repositório, por exemplo com `openssl rand -base64 32`. Não registre o resultado em issue, commit ou log.

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

Nunca registre tokens de convite, senhas ou respostas P31–P33 durante esses testes.

As sessões usam JWT. Alterar a senha atualiza as próximas autenticações, mas não revoga automaticamente JWTs que já tenham sido emitidos. Não altere a estratégia de sessão durante um deploy desta etapa.

## 10. Backups

1. Em **Server Settings → Storage Providers**, configure um destino remoto.
2. No serviço MariaDB, abra **Backups** e crie um backup lógico para o banco da aplicação.
3. Configure agenda, retenção e um caminho exclusivo.
4. Execute **Manual Run** e confirme o arquivo e o log antes de considerar a rotina pronta.
5. Teste restauração em banco não produtivo.

Faça um backup manual verificado antes de migrations de alto risco, atualização do MariaDB ou rotação de credenciais. Não use cópia do volume vivo como substituto de `mariadb-dump`.

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
