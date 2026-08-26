# Política de respostas privadas

P31, P32 e P33 pertencem exclusivamente ao usuário que forneceu as respostas. Elas nunca entram em comparação de casal, relatórios compartilháveis, analytics, logs de conteúdo ou acesso administrativo genérico.

Toda funcionalidade futura de casal deve consumir apenas APIs explicitamente shareable, que excluam no banco perguntas com `isPrivate = true` e os códigos P31–P33. A ausência de um marcador conhecido nunca torna uma resposta compartilhável: a política é default deny.

O resultado privado de segurança é derivado no servidor a partir das respostas originais, exige ownership da tentativa e não é persistido em tabela duplicada.
