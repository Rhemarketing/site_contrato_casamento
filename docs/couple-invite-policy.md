# Política de casal e convites

## Cardinalidade e vínculo atual

Um casal possui no máximo um `CREATOR` e um `PARTNER`. A constraint `UNIQUE(coupleId, role)` garante esse limite no banco.

Cada usuário pode possuir somente um vínculo atual `PENDING` ou `ACTIVE`. Enquanto atual, `CoupleMember.activeMembershipKey` recebe o `userId` e é protegido por índice único. Quando um vínculo pendente é cancelado e se torna `INACTIVE`, a chave é limpa; isso preserva o histórico e permite um vínculo futuro.

Cada casal possui no máximo um convite `PENDING`. `CoupleInvite.activeInviteKey` recebe o `coupleId` durante a vigência do convite e é limpo quando ele é aceito, cancelado ou expirado.

## Token e aceite

O token possui 256 bits de entropia, usa formato base64url e expira após sete dias. Somente `SHA-256(token)` é persistido. O token original aparece uma única vez no resultado da criação e não pode ser reconstruído a partir do banco.

O aceite exige usuário autenticado, ação POST explícita e correspondência entre o e-mail normalizado da sessão e o destinatário do convite. Abrir o link é read-only e nunca aceita automaticamente. O claim do convite, a criação do `PARTNER` e a ativação do casal acontecem na mesma transaction.

## Cancelamento

O criador pode cancelar ou regenerar um convite pendente. Também pode cancelar um `Couple` ainda `PENDING` sem parceiro: o casal torna-se `INACTIVE`, o convite é cancelado e a chave do vínculo atual é limpa. Casais `ACTIVE` não podem ser encerrados por esse fluxo.

## Privacidade

O vínculo confirma somente que duas contas formam um casal na aplicação. Nesta etapa nenhuma resposta é compartilhada.

- P31–P33 continuam privadas e owner-only.
- P34–P38 e o perfil financeiro continuam owner-only.
- Answers, scores, áreas, flags, Safety e relatório individual não entram no DTO do casal.
- O preview público contém apenas nome do criador, e-mail destinatário mascarado e expiração.
- Tokens e hashes não entram em logs ou analytics.

O envio de e-mail real, rate limiting distribuído, comparação e encerramento de casal ativo serão tratados em etapas próprias.
