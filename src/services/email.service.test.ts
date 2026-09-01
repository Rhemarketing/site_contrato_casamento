import { describe, expect, it } from "vitest";
import { EmailService, type EmailMessage, type EmailTransport } from "./email.service";

class CaptureTransport implements EmailTransport {
  message?: EmailMessage;
  async send(message: EmailMessage) { this.message = message; }
}

describe("templates e DTOs de e-mail", () => {
  it("cria recuperação sem senha e com o token somente no link entregue", async () => {
    const transport = new CaptureTransport();
    const service = new EmailService(transport);
    await service.sendPasswordReset("owner@example.test", "https://app.example.test/redefinir-senha/raw-token");
    expect(transport.message).toMatchObject({
      to: "owner@example.test",
      subject: "Redefina sua senha | Contrato de Casamento",
    });
    expect(transport.message?.text).toContain("60 minutos");
    expect(JSON.stringify(transport.message)).not.toMatch(/password|senha atual|nova senha:/i);
  });

  it("cria convite sem respostas, resultados, Safety ou dados financeiros", async () => {
    const transport = new CaptureTransport();
    const service = new EmailService(transport);
    await service.sendCoupleInvite("partner@example.test", "Nome <script>", "https://app.example.test/convite/token");
    expect(transport.message?.subject).toBe("Convite para conectar o casal | Contrato de Casamento");
    expect(transport.message?.html).toContain("Nome &lt;script&gt;");
    expect(JSON.stringify(transport.message)).not.toMatch(/P31|P32|P33|P34|P35|P36|P37|P38|SAFETY_|renda|dívida|score/i);
  });
});
