# Integração do arquivo-mestre 1.4.0

## Estado da entrega

A admissão, suas 40 perguntas, cálculo e relatório foram preservados. O questionário principal usa um agregado próprio, com tabelas `contract_*`; não reutiliza as tentativas ou pontuações da admissão.

O catálogo de 200 perguntas, 1.200 regras de pares e 487 textos conjuntos foi integrado. As telas e serviços de sessões individuais, decisões versionadas e rascunhos estão implementados. **O fluxo integral da edição real ainda não pode ser concluído nem ativado em produção:** o pacote tem 184 aplicabilidades nulas, cruzamentos sem predicado e pendências de segurança/operação. Uma pergunta sem regra não é liberada por suposição. A prévia local também respeita esse bloqueio.

## Rotas

| Rota | Conteúdo |
|---|---|
| `/contrato` | Jornada e entrada da prévia autorizada |
| `/contrato/questionario` | Somente a própria sessão, contexto e respostas |
| `/contrato/decisoes` | Propostas conjuntas elegíveis; mensagem neutra enquanto indisponíveis |
| `/contrato/documento` | Leitura e solicitação de rascunho, com verificação de acesso a cada operação |
| `/admin/contrato` | Catálogo, seis pares por pergunta, prévia dos textos finais com nomes fictícios e pendências; sem acesso a dados de casais |

## Conteúdo e importação

`npm run contract:compile` verifica os hashes SHA-256 do manifesto original e compila `src/data/contract-master-v1.4.0.json`. Confere também a igualdade e o hash de cada uma das 487 redações. O pacote original é preservado. Não são enviados ao navegador o arquivo-mestre completo, transcrições ou planos internos de avaliação.

O catálogo compilado é um módulo exclusivo do servidor. Ao iniciar uma sessão, sua fotografia é persistida em `ContractEdition`, com hash canônico e versão imutável. Uma nova compilação divergente não pode sobrescrever uma edição que já tenha sido importada: deve receber uma nova versão de integração antes de novas sessões. Respostas existentes continuam ligadas à edição original.

Os 487 textos ficam registrados como redações editoriais finais. O gerador sabe selecioná-los diretamente; não exige outra redação ou decisão editorial. Componentes e regras permanecem inativos, e candidatos não finalizados não são usados como fallback de impressão.

## Regras implementadas

- Avaliação trivalente de predicados: verdadeiro, falso e desconhecido. A ausência de fato não libera o ramo contrário.
- As 16 aplicabilidades expressas são avaliadas antes do enunciado e das opções. As demais ficam `BLOCKED_BY_POLICY`. `NOT_APPLICABLE` não vira A; aplicabilidade unilateral exige regra própria.
- Salvamento individual criptografado com AES-256-GCM, associado por autenticação ao dono, sessão, edição e vínculo ativo. Contextos também são privados. Não há bypass administrativo.
- Concorrência por revisão da sessão e transações serializáveis; tentativas de gravação com revisão antiga falham. Sessão concluída não aceita alteração de resposta.
- Subperguntas privadas Q081-C e Q119-B/C, obrigatórias quando acionadas. O complemento não entra em decisões compartilhadas.
- Consulta às 1.200 ações mantendo identidades estáveis nos 1.800 arranjos ordenados; seleção interna de componentes, módulos e protocolos. Seleção não equivale a publicação.
- Níveis de segurança explícitos por alternativa; relato de compressão de pescoço prevalece mesmo em um episódio. Não se inventa agregação de duas respostas B ou liberação por todas A. **Enquanto PEND-14 e a revisão privada não estiverem resolvidas, o avaliador real não declara segurança liberada.**
- Q146-AC encaminha internamente a P09, sem abrir decisão conjunta imediata. Q131 não recria calendário: conserva a reutilização de Q011. Q154 mantém a mesma proibição fixa independentemente das respostas; o diagnóstico C e P10 permanecem privados.
- Propostas com parâmetros validados, identificador do módulo, versão da definição, revisão e hash da base de avaliação. Cada pessoa confirma a versão exata. O hash inclui a revisão, mesmo quando o texto é repetido. Alterações exigem novos aceites; `NO_CONSENSUS` não gera decisão intermediária.
- Consentimento específico para a avaliação do questionário principal, separado do vínculo e da comparação da admissão. Revogar invalida propostas ativas e documentos; consentir novamente não reativa aceites antigos. O histórico é mantido.
- Gerador determinístico com verificação de privacidade, componentes ativos, variáveis resolvidas, decisões confirmadas e dependências. Deduplicação por ID e respondente, sem resumo livre. Fotografia, proveniência e hashes são armazenados. Não há assinatura jurídica, cobrança, PDF final ou anexos de protocolos/bíblia liberados.

## Módulos conjuntos estruturados

Foram compiladas oito definições cujo conteúdo permite a estruturação abaixo. Isso não elimina seus bloqueios globais de aplicabilidade, segurança, consentimento ou eventos.

| ID | Definição |
|---|---|
| ND-Q011-01 | Frequência do momento exclusivo; vínculo de reutilização por Q048 e Q131 |
| ND-Q031-01 | Regra de publicações nas redes sociais |
| ND-Q041-01 | Modelo financeiro |
| ND-Q041-02 | Contribuição comum, incluindo categorias de cada pessoa na opção C |
| ND-Q069-01 | Posição sobre possibilidade de gravidez, preservada a regra de não coerção |
| ND-Q113-01 | Frequência de devocional conforme alternativas corrigidas |
| ND-Q124-01 | Organização das refeições |
| ND-Q140-01 | Experiências especiais, com a exclusão expressa por impedimento legítimo |

As 48 outras definições marcadas `REQUIRES_STRUCTURED_CONSOLIDATION` permanecem indisponíveis. As 74 desativadas ou bloqueadas pela fonte permanecem assim. Algumas têm textos recuperados, mas ainda dependem de submódulos, campos, calendário, regras de consentimento por ocasião ou consolidação de correções; a ausência dessas operações não foi ignorada.

## Decisões e desenvolvimento restantes

| Pendência da fonte | Trabalho necessário |
|---|---|
| PEND-04 | Definir as 184 aplicabilidades e os períodos/exceções restantes; consolidar componentes individuais, regras fixas, destinos de cláusulas, campos e submódulos restantes |
| PEND-06 | Definir revisão privada, destinatários, retomada segura (incluindo Q151), retenção, exclusão e acesso operacional; implementar recuperação/rotação de chaves antes de dados reais |
| PEND-08 | Preço, provedor, validade de acesso, reembolso, cancelamento e mudança de vínculo; implementar pagamento e direitos de acesso após essas decisões |
| PEND-09 | Compilar os 96 cruzamentos com papéis/predicados; implementar avaliadores de fatos, instâncias idempotentes dos protocolos e agenda. O motor atual seleciona referências internas, não executa protocolos completos nem deduz fatos de letras |
| PEND-10 | Tradução e textos bíblicos autorizados, com mapeamento por componente |
| PEND-11 | Natureza do aceite/assinatura e operação da contribuição simbólica; nenhum débito ou multa automática implementado |
| PEND-12 | Parâmetros abertos, critério de melhora, fuso/âncora de ciclos, RLF zero |
| PEND-13 | Registro Familiar de Emergência e compartilhamento voluntário/revogável |
| PEND-14 | Escopo das duas B, agregados de segurança e inaplicabilidade; implementar liberação e revisão privada verificadas |

Não é suficiente ligar uma variável de ambiente para liberar a produção. A política do servidor rejeita `NODE_ENV=production`, mesmo com a flag da prévia, e a edição distribuída tem `productionReady=false`. A publicação deve ser uma mudança explícita posterior, com critérios de aceite resolvidos e regressões executadas.

## Executar a prévia local

1. Usar banco local e contas fictícias conectadas como casal. Aplicar a migration aditiva `20260912160000_add_contract_workspace` no banco escolhido com `npm run prisma:migrate:deploy`. Nenhuma migration da admissão foi alterada.
2. Gerar uma chave aleatória de 32 bytes em base64 e armazenar em `CONTRACT_DATA_KEY`, apenas no ambiente local ignorado. Guardar a chave separadamente; perdê-la impede ler as respostas criptografadas. Não reutilizar `AUTH_SECRET`.
3. Definir `CONTRACT_PREVIEW_ENABLED=true` e `CONTRACT_PREVIEW_USER_IDS` com os UUIDs das contas fictícias, separados por vírgulas. Reiniciar `npm run dev`.
4. Abrir `/contrato`, iniciar a sessão e acessar as perguntas. Condições conhecidas podem ser preenchidas; as 184 aplicabilidades não definidas continuam bloqueadas.
5. Para revisar todas as 200 perguntas e os textos independentemente de uma sessão real, usar a área editorial com uma conta administrativa de teste.

O catálogo é importado ao iniciar a primeira sessão, de forma idempotente. A operação não altera a prova de admissão. O reset antigo de dados de demonstração não apaga `contract_*`; se forem utilizadas contas da demonstração antiga, as novas chaves estrangeiras impedem sua remoção acidental. Preferir contas fictícias próprias para esta prévia.

## Verificação realizada

- Compilação com conferência dos hashes e das 487 redações.
- Testes do motor para todos os 1.800 arranjos, estados de aplicabilidade, predicados, segurança, exceções e vinculação correta dos nomes.
- Testes de criptografia, escopo da sessão, adulteração, bloqueio de produção e contas permitidas.
- Testes de integração de duas contas, acesso indevido, concorrência, conclusão, consentimento, revisão dos acordos, ausência de consenso e revogação.
- Testes do gerador: texto final exato, proveniência, reprodução, rejeição de candidatos/saídas privadas e invariância da cláusula de apostas.
- Fluxo completo de decisões e rascunho exercitado **somente com uma edição sintética criada pelo teste e liberação de segurança simulada**. Essa fotografia não é importada pela aplicação. Os testes não provam prontidão editorial da edição real.
- Suíte existente de admissão, autenticação, convites e comparação, lint, TypeScript e build.
- Navegador com duas contas fictícias: login, contexto antes do enunciado, salvamento e recarga, administração restrita, catálogo e estado neutro da segunda pessoa.

As migrations e integrações foram executadas em instância isolada **MySQL 8.4.3**, usando o adapter MariaDB já instalado, na porta local 3317. O banco habitual não estava em execução e não foi alterado. Repetir as integrações na versão MariaDB de destino antes de produção.

Comandos reproduzíveis no banco local `_test` configurado em `.env.test`: `npm test`, `npm run lint`, `npm run typecheck`, `npm run build`. Os testes de criptografia geram chaves temporárias e não precisam de chave real. No Windows, executar os scripts Python com `python -X utf8`: o pacote assume UTF-8 e não deve ser regravado como CP1252. Os 37 testes Python passaram. O validador confirmou integridade e 409 bloqueios de produção no pacote original; o modo `--production` retorna código 2, como esperado.
