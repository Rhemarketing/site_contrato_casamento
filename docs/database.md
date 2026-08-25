# Modelo de dados

O banco usa nomes de tabelas e colunas em `snake_case`, mantendo models e campos idiomáticos em TypeScript no schema Prisma.

## Histórico e exclusões

- Usuários, questionários e perguntas usam relações com `onDelete: Restrict` para impedir remoção silenciosa de tentativas e respostas históricas.
- Tentativas também usam `Restrict` para respostas, resultados por área e flags.
- A referência opcional de uma tentativa ao casal usa `SetNull`, preservando a tentativa caso o casal deixe de existir.
- A referência opcional de uma flag à pergunta usa `SetNull`, preservando o registro da flag.
- Atualizações de chaves usam `Cascade`; os identificadores UUID não devem ser alterados pelas regras de negócio.

## Versionamento

Cada combinação de código e versão identifica um questionário independente. A tentativa referencia o registro utilizado e armazena também `questionnaire_version` como snapshot adicional.

## Privacidade

`questions.is_private` é apenas um marcador de domínio. A autorização de leitura de respostas privadas deverá ser implementada na camada de services e nunca depender apenas desse campo ou de identificadores enviados pelo cliente.
