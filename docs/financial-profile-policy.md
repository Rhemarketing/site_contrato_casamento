# Política do perfil financeiro

## Escopo

P34–P38 formam um domínio descritivo separado. Eles representam moradia, faixa de renda familiar, margem financeira mensal, situação das dívidas e capacidade de investimento declarada naquele momento.

Essas respostas não participam do score conjugal, das áreas, da classificação, das contagens A/B/C, das flags prioritárias ou do resultado privado de Safety. Não existe score financeiro, lead score, classificação de riqueza ou preço personalizado.

## Acesso e compartilhamento

Nesta etapa, o perfil é owner-only. O serviço exige simultaneamente o identificador da tentativa e o usuário proprietário. Estranhos, parceiros do mesmo casal e administradores não recebem bypass.

Uma pergunta marcada como não privada não está automaticamente aprovada para relatório do casal. P34–P38 não são compartilhadas com o parceiro. Uma etapa futura de comparação deverá decidir explicitamente quais dimensões podem ser comparadas, o nível de detalhe permitido e se dados financeiros aparecerão em um relatório do casal.

## Derivação e dados expostos

O perfil é derivado sob demanda das respostas versionadas já persistidas em `Answer`, `Question` e `QuestionOption`. O mapeamento usa `QuestionOption.internalCode`, pois A/B/C não constitui uma escala financeira comum. Não há tabela financeira nem colunas redundantes em `QuestionnaireAttempt`.

O DTO expõe somente códigos de domínio sanitizados e labels editoriais neutras. Não expõe entidades Prisma, códigos internos brutos, IDs ou scores.

## Limites comerciais e operacionais

Não há preço personalizado, oferta automática, desconto, pagamento ou priorização comercial. O perfil não é enviado a logs ou analytics e não é persistido em cache público, `localStorage`, `sessionStorage`, cookies ou query strings.
