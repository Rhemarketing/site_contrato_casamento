function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function layout(content: string) {
  return `<!doctype html><html lang="pt-BR"><body style="margin:0;background:#f8f5ef;color:#192d38;font-family:Arial,sans-serif"><div style="max-width:600px;margin:0 auto;padding:32px 20px"><div style="background:#fffdf9;border:1px solid #ded8ce;border-radius:16px;padding:32px"><p style="margin:0 0 20px;color:#c86f5d;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase">Contrato de Casamento</p>${content}</div></div></body></html>`;
}

function actionLink(label: string, url: string) {
  const safeUrl = escapeHtml(url);
  return `<p style="margin:28px 0"><a href="${safeUrl}" style="display:inline-block;border-radius:999px;background:#244b5a;color:#fff;padding:13px 22px;text-decoration:none;font-weight:700">${escapeHtml(label)}</a></p><p style="font-size:12px;color:#65737a;overflow-wrap:anywhere">Se o botão não funcionar, acesse: <a href="${safeUrl}" style="color:#244b5a">${safeUrl}</a></p>`;
}

export function passwordResetEmailTemplate(resetUrl: string) {
  return {
    subject: "Redefina sua senha | Contrato de Casamento",
    text: `Recebemos uma solicitação para redefinir sua senha. Acesse ${resetUrl} em até 60 minutos. Se você não fez esta solicitação, ignore este e-mail.`,
    html: layout(`<h1 style="margin:0;font-family:Georgia,serif;font-size:28px;color:#173744">Redefina sua senha</h1><p style="line-height:1.6">Recebemos uma solicitação para redefinir a senha da sua conta.</p>${actionLink("Criar nova senha", resetUrl)}<p style="line-height:1.6">Este link expira em 60 minutos e pode ser usado uma única vez.</p><p style="line-height:1.6;color:#65737a">Se você não fez esta solicitação, ignore este e-mail. Sua senha continuará a mesma.</p>`),
  };
}

export function coupleInviteEmailTemplate(input: { creatorName: string; inviteUrl: string }) {
  const safeName = escapeHtml(input.creatorName);
  return {
    subject: "Convite para conectar o casal | Contrato de Casamento",
    text: `${input.creatorName} convidou você para conectar as contas no Contrato de Casamento. Acesse ${input.inviteUrl}. O aceite é individual e explícito.`,
    html: layout(`<h1 style="margin:0;font-family:Georgia,serif;font-size:28px;color:#173744">Um convite para vocês</h1><p style="line-height:1.6"><strong>${safeName}</strong> convidou você para conectar as contas no Contrato de Casamento.</p><p style="line-height:1.6">O convite conecta somente as contas. Nenhuma resposta, resultado individual ou informação privada é compartilhada por este e-mail.</p>${actionLink("Abrir convite", input.inviteUrl)}<p style="line-height:1.6;color:#65737a">O aceite é individual e explícito. Se você não esperava este convite, pode ignorar esta mensagem.</p>`),
  };
}
