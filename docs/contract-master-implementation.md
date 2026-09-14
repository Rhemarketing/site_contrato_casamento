# Integração do arquivo-mestre 1.4.0

## Estado da entrega

A integração `1.4.0-release.1` implementa a jornada do contrato e está liberada no catálogo após validação funcional. A ativação exige `CONTRACT_ENABLED=true`, chave de criptografia e migrations aplicadas. Isso não significa que um servidor remoto já foi atualizado. O destino EasyPanel, a configuração operacional e o teste do usuário em produção precisam ser conferidos no ambiente real.

A admissão, suas 40 perguntas, cálculo e página de resultado foram preservados. O questionário principal utiliza tabelas `contract_*`, sem reaproveitar tentativas ou pontuações da admissão.

O produto custa **R$ 0,00**. Comprar registra uma aquisição pessoal autenticada e idempotente, com estado `PAID`, origem `FREE_CHECKOUT`, moeda BRL e valor zero determinado no servidor. Cada participante adquire seu acesso. Gateway e cobrança real ficam para depois dos testes do usuário em produção.

## Conteúdo e rastreabilidade

`npm run contract:compile` verifica os 74 hashes do manifesto original e compila 200 perguntas, 600 alternativas, 1.200 regras de pares e os 487 textos conjuntos exatos. A aplicação preserva os papéis nos nove arranjos ordenados de cada pergunta. O pacote original permanece imutável; seus 409 bloqueios históricos não são apagados nem apresentados como pendências atuais da integração.

A [matriz de aplicabilidade](contract-applicability-decisions.md) resolve as 184 lacunas delegadas: 128 gerais e 56 condicionais, somadas às 16 condições preservadas. Contexto desconhecido bloqueia; contexto falso produz inaplicabilidade, nunca resposta A. A inaplicabilidade unilateral não imprime texto que revele o contexto do outro.

Os 56 módulos conjuntos ativos da fonte foram estruturados com campos tipados, tabelas, datas, horários, pessoas, valores, percentuais e opções. Há também um formulário operacional de revisão Q150 com texto automático registrado. Os 74 módulos desativados pela fonte continuam desativados. A presença no catálogo não dispensa aplicabilidade, segurança e confirmação dos dois.

Os 96 vínculos entre perguntas têm destino explícito: dois cruzamentos com texto registrado, duas reutilizações e 92 referências de contexto na área individual. Referências não são transformadas em diagnósticos inventados. Componentes comuns e 154 parágrafos fixos revisados usam os textos cadastrados. As 487 redações finais são selecionadas somente quando elegíveis.

O anexo bíblico usa Bíblia Livre 2018, licença CC BY 4.0, com atribuição e fonte em `content/bible`. A compilação reproduz 125 referências e 187 ocorrências de versículos. O anexo é fixo para impedir inferência de respostas privadas pela ausência de uma referência.

O catálogo é exclusivo do servidor. Cada edição é uma fotografia imutável com versão e hash. Alterar conteúdo já importado exige nova versão de integração; sessões antigas não são reinterpretadas automaticamente. Não há geração livre de cláusulas por IA.

## Jornada

| Rota | Conteúdo |
|---|---|
| `/contrato` | Aquisição e etapas |
| `/contrato/comprar` | Compra gratuita e situação da aquisição |
| `/contrato/questionario` | Contextos, respostas e orientações do titular |
| `/contrato/decisoes` | Fatos voluntariamente compartilhados, propostas e confirmação da mesma versão |
| `/contrato/documento` | Rascunho, texto exato, identificação, aceites e impressão/PDF pelo navegador |
| `/contrato/historico` | Versões aceitas, motivo e seções alteradas |
| `/contrato/acompanhamento` | Eventos privados, protocolos, agenda, plano e emergência |
| `/contrato/cofrinho` | Contribuições voluntárias de processo, confirmação e contestação |
| `/contrato/privacidade` | Consentimento, revisão privada, exportação e exclusão |
| `/contrato/exportar` | JSON dos próprios dados |
| `/contrato/revisoes` | Revisões autorizadas ao revisor nominal |
| `/admin/contrato` | Revisão editorial sem acesso a respostas de casais |

## Segurança, decisões e documentos

Respostas, contextos, avaliações e registros sensíveis usam AES-256-GCM, com escopo autenticado por sessão, titular e vínculo. Operações revalidam autenticação, aquisição, edição e membros ativos. Revisões otimistas e transações serializáveis protegem contra gravações concorrentes. Sessões concluídas ficam imutáveis até reabertura explícita.

O consentimento é específico e separado da admissão. Revogação invalida derivados e aceites ativos; consentir novamente não ressuscita confirmações antigas. Perguntas com qualquer alternativa privada têm projeção compartilhada uniforme, evitando inferências por títulos, módulos ou cláusulas.

A segurança conta duas B distintas em Q101–Q110 por respondente, considera a maior severidade e mantém prevalência de alertas críticos e compressão do pescoço. Q110 inaplicável não vira A. Ausência de resposta não libera o fluxo; ausência de alerta não equivale a certificado de segurança.

A revisão exige escolha e autorização expressas de revisor nominal pelo titular. Administrador não recebe acesso automaticamente; o parceiro não pode revisar o próprio casal. A fotografia contém somente campos necessários. Revogação ou mudança da base retira a liberação, que nunca supera alerta crítico. Q181 exige contexto e liberação específicos. Q151 exige solicitação independente dos dois e revisão específica de ambos, sem revelar letras privadas ou liberar diante de C ativo.

Propostas são validadas no servidor, versionadas e confirmadas individualmente pelos dois. Sem consenso não há texto intermediário. Acordos adicionais por filho ou situação têm identidade própria e podem ser retirados. O gerador rejeita saídas privadas, parâmetros ausentes, texto adulterado e confirmação desatualizada.

O documento registra proveniência, versão, hash e ciência do texto exato. Após uma versão aceita, mudanças exigem motivo, comparação de seções e novos aceites. O histórico preserva a versão anterior. A impressão permite salvar PDF no navegador. O aceite não é anunciado como assinatura qualificada ou garantia jurídica.

## Acompanhamento e dados

Os 14 protocolos possuem guias cadastrados. Eventos são registros privados explícitos, com assunto, instante, fuso, resultado e impedimento. Gatilhos respeitam contagens e bases da fonte, sem inferir ocorrências das letras. P07 reutiliza P03; P12 reabre o protocolo original após novo gatilho completo. A retomada sem solução conta 72 horas da conversa registrada. Calendário depende de âncora e fuso confirmados pelos dois; meses preservam o dia local, ajustado ao último dia quando necessário.

O plano individual respeita limites de prioridades. O registro de emergência é opcional e compartilha apenas campos autorizados. O cofrinho registra R$ 10 somente por processo elegível, voluntariamente reconhecido e confirmado pelos dois; contestação suspende a contribuição. Não há débito automático ou penalidade por recusa sexual, risco, doença, fé ou discordância.

A exportação contém dados próprios. A exclusão remove os dados privados do titular e derivados conjuntos, preservando respostas privadas do outro e a admissão. Espaços inativos sem documento aceito são eliminados após 180 dias. Documentos aceitos permanecem até solicitação de exclusão. A limpeza roda após startup e diariamente no servidor Node dedicado; há comando de simulação e aplicação. Rotação de chaves preserva leitura, hashes e datas de atividade. Backups de até 30 dias e chaves separadas dependem da configuração do operador: ver [implantação](easypanel-deploy.md).

## Verificação e reprodução

- Compilação: integridade da fonte, 200 aplicabilidades, 1.200 pares, 487 redações e todos os formulários ativos.
- Cobertura de 3.600 cenários da edição real: 200 perguntas × nove pares ordenados × dois conjuntos de fatos, além de testes de desconhecidos, segurança e invariância das saídas privadas.
- Integrações reais: duas sessões, conclusão, decisões, documento, dois aceites, revisão, histórico, cofrinho, autorização nominal, Q151/Q181, exportação, exclusão, retenção e rotação de todos os tipos de payload. A suíte usa o avaliador real da edição de liberação.
- Regressões de admissão, autenticação, convite e comparação. Bancos isolados: MySQL 8.4.3 e MariaDB 11.4.13; contas e dados de QA fictícios.
- Lint, TypeScript, build Next.js, imagem Docker e auditoria de dependências. Correções transitivas de segurança fixadas no lockfile, sem downgrade de Prisma ou Auth.js.

Comandos: `npm run contract:compile`, `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, `npm audit` e `docker build -t contrato-casamento:release .`. Testes de banco exigem `.env.test` local, banco terminado em `_test` e migrations aplicadas. Nunca apontar a suíte para produção. No Windows, executar o pacote Python original com `python -X utf8`.

O fechamento das pendências está em [decisões de liberação](contract-release-decisions.md). Publicação remota e checklist no servidor são etapas distintas dos testes locais.
