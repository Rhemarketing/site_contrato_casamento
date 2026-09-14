# Convites pelo WhatsApp

Em `/casal`, o criador informa um celular brasileiro com máscara `(xx) xxxxx-xxxx` e clica em **Convidar parceiro**, com ícone do WhatsApp. O servidor valida o telefone, cria o convite de uso único e devolve a URL oficial `wa.me` com destinatário e mensagem. O navegador abre o WhatsApp, onde o criador confirma o envio. Não há disparo automático, API de mensagens ou envio de e-mail nesse fluxo. Há link de recuperação caso o redirecionamento não abra o aplicativo.

O parceiro abre `/convite/[token]` e encontra o formulário de nome completo, e-mail, senha e confirmação da senha. E-mail é obrigatório por decisão do usuário em 14/09/2026. O cadastro autentica a nova conta e retorna ao convite para aceite explícito. Uma pessoa com conta existente pode entrar com e-mail e senha. Receber um convite não permite acessar uma conta existente sem autenticação.

O número de destino fica registrado no convite em formato internacional brasileiro, sem ser publicado na prévia aberta. O aceite associa a conta autenticada ao casal desse convite. O telefone não é usado como identidade verificada nem como credencial: abrir uma conversa no WhatsApp não comprova posse do número. O convite funciona como link privado de uso único; deve ser enviado apenas ao parceiro pretendido.

São preservados: expiração em sete dias, cancelamento, invalidação do link anterior na regeneração, rejeição do próprio criador, limite de um vínculo atual por conta e transação serializável no aceite. Convites antigos por e-mail mantêm a exigência do e-mail original. O vínculo não compartilha automaticamente respostas ou resultados.

Implantação: aplicar `20260914150000_whatsapp_couple_invites` com `prisma migrate deploy`. A migration torna o e-mail do convite opcional e acrescenta `whatsapp_phone`; o e-mail da conta continua obrigatório. O histórico total contém dez migrations. SMTP continua atendendo recuperação de senha, mas não é necessário para convidar pelo WhatsApp.

Para testar com outro dispositivo, `APP_URL` deve ser acessível por esse dispositivo. Um link `localhost` abre o próprio dispositivo do destinatário, não o computador do criador. Em produção, usar o domínio HTTPS real.
