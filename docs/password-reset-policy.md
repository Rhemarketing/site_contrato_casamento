# Política de recuperação de senha

- A resposta pública não informa se o e-mail existe.
- O e-mail é normalizado com `trim` e `lowercase` antes da consulta.
- O token possui 32 bytes aleatórios; somente seu SHA-256 é persistido.
- Cada token expira em 60 minutos e pode ser consumido uma única vez.
- Uma nova solicitação marca tokens pendentes anteriores como usados.
- A troca de senha e o consumo do token ocorrem na mesma transaction.
- Após a troca, os demais tokens pendentes do usuário são invalidados.
- Falhas SMTP não são devolvidas ao cliente e não expõem configuração do provedor.
- Tokens, senhas e conteúdo de e-mails não devem ser registrados em logs.

## Sessões existentes

O Auth.js utiliza sessões JWT sem uma versão de sessão persistida no usuário. A nova senha passa a valer imediatamente para novos logins, mas JWTs emitidos anteriormente continuam válidos até sua expiração. A ETAPA 13 não altera a estratégia de autenticação nem introduz uma revogação global insegura.
