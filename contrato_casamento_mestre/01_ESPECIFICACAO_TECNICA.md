# Contrato de Casamento — arquivo-mestre para programação

**Pacote técnico 1.4.0 · Método de referência 7.0 · 11/09/2026**  
**Situação: especificação e base de consolidação; carga de produção bloqueada.**

Este pacote organiza o conteúdo efetivamente disponível no PDF “Conversa sobre o projeto 'Contrato de Casamento'”, de 444 páginas, os doze anexos Markdown, o trecho Q101–Q120 recebido na conversa e o fluxo comercial informado pelo solicitante. A versão 1.4.0 identifica esta organização técnica. Esta atualização também registra novas redações conjuntas elaboradas sob delegação expressa do solicitante, sem alterar o número de referência do Método.

## 1. Como utilizar este arquivo

O programador pode iniciar a estrutura de dados, os acessos individuais, o salvamento das respostas, o controle de versões, os componentes de decisão conjunta e os bloqueios de privacidade. A avaliação completa e o contrato definitivo dependem da conclusão das lacunas discriminadas em `auditoria/PENDENCIAS.md`.

O pacote distingue quatro níveis de informação:

| Nível | Significado | Uso permitido |
|---|---|---|
| Regra expressa na fonte | Texto ou comportamento efetivamente presente no PDF | Implementar após aplicar suas correções e dependências |
| Proposta técnica de organização | Estrutura de dados, identificador, estado ou interface propostos neste pacote | Desenvolver como arquitetura; não apresentar como decisão editorial anterior |
| Decisão editorial delegada | Redação nova definida sob autorização expressa do solicitante | Integrar conforme aplicabilidade, segurança e aceites; não apresentar como citação literal da fonte |
| Pendente | Texto, condição, parâmetro ou decisão não recuperado com segurança | Manter bloqueado; não criar regra automática por interpretação |

Campos `source_text`, `base_source_text`, `effect_source_text`, `source_sections` e `*_candidate` são evidências ou candidatos para consolidação. **Não são campos de texto autorizados para impressão direta no contrato.** Campos executáveis, como `contract_template`, permanecem nulos quando não existe consolidação segura.

Todos os registros do catálogo foram entregues inativos. Isso impede que um importador publique acidentalmente trechos antigos, metadados de programação ou respostas privadas. A ativação exige a conclusão técnica e funcional das dependências, conforme a seção 16. A redação dos 487 textos da versão 1.4.0 já está decidida, sem nova aprovação editorial do solicitante.

## 2. Cobertura atualizada das fontes

A versão 1.2.0 incorpora os oito novos anexos e recupera as 40 perguntas restantes: Q051–Q060 e Q071–Q100. **As 200 perguntas principais agora possuem enunciados e alternativas A/B/C. Não faltam IDs principais.**

| Item | Conteúdo recuperado |
|---|---:|
| Perguntas com enunciado e A/B/C | 200 de 200 |
| Textos de alternativas | 600 de 600 |
| Pares inventariados | 1.200 |
| Protocolos identificados | 14 |
| Cláusulas temáticas | 17 |
| Seções do Pacote Canônico 5.0 | 32 |

Os 32 enunciados anteriormente apresentados como candidatos foram conferidos individualmente contra as alternativas vigentes e recuperados do próprio PDF, mantendo a origem exata. Nenhum enunciado novo foi inventado. A definição das despesas prévias à reserva da Q037 segue a correção 5.0.

Q051, Q055, Q056 e Q079 usam as redações corrigidas da 5.0. Q060 não possui decisão conjunta permissiva. Q080 reutiliza o gatilho por ciclos de Q051. Q081 possui subpergunta privada. Q092 define frequência por família separadamente; Q100 exige data concreta de revisão. As 32 seções canônicas constam de `dados/correcoes_canonicas_5_0.json`.

As correções 6.0/7.0 e a auditoria final prevalecem sobre versões anteriores. Q111/Q142/Q153/Q187 e as saídas privadas de Q196/Q197/Q198/Q200 permanecem preservadas. Q154 segue proibição integral de apostas envolvendo dinheiro.

**Redação concluída não é ativação do site.** As 1.200 ações e os 487 textos conjuntos antes ausentes estão definidos. Permanecem a integração das saídas, a compilação de predicados, módulos e parâmetros e sua validação funcional. A prova de admissão, sua página de resultado e lógica já estão implementadas no site, conforme confirmação do usuário, e não são pendências deste pacote. Consulte `auditoria/PENDENCIAS.md`.

## 3. Escopo funcional do produto

### 3.1 Jornada informada pelo solicitante

1. O visitante realiza a **prova de admissão**, com 40 perguntas.
2. Recebe uma apresentação de sua satisfação percebida com o relacionamento.
3. É convidado a comprar acesso ao questionário principal.
4. O casal é vinculado a dois perfis individuais.
5. Cada cônjuge responde separadamente às mesmas 200 perguntas principais, respeitando aplicabilidade.
6. O sistema cruza as respostas e identifica pontos relevantes.
7. O casal participa das decisões conjuntas necessárias.
8. O sistema monta o contrato personalizado a partir das saídas e dos acordos aprovados.
9. O casal pode revisar os acordos, mantendo histórico de versões.

### 3.2 Implementação existente e limites do pacote

O usuário confirmou que a prova de admissão, a página do resultado e sua lógica já foram adicionadas ao site. Essa pendência está encerrada. Preservar essa implementação; não recriar o banco nem substituir a fórmula com base neste pacote. O código do site não foi inspecionado nesta tarefa e os campos locais não importados não representam tarefas em aberto.

Preço, prazo de acesso, provedor de pagamento e demais decisões comerciais continuam pendentes quando não definidos em outro lugar. Perguntas de contexto e decisões conjuntas pertencem a módulos próprios e não alteram os IDs Q001–Q200.

### 3.3 Fora do escopo deste pacote

Este pacote não implementa ou publica o site, não integra um pagamento real e não gera contratos de casais reais. Também não escolhe decisões doutrinárias ou valida a eficácia jurídica do instrumento. Essas distinções seguem as próprias pendências e os limites descritos no PDF.

## 4. Precedência, origem e versionamento

As decisões expressas do solicitante e as redações dentro do escopo editorial delegado prevalecem nos pontos que resolvem. Para as fontes do Método, aplicar a seguinte ordem:

1. Correções expressas do Pacote 7.0.
2. Auditoria final, somente nos pontos não substituídos pelo 7.0.
3. Correções expressas do Pacote 6.0.
4. Pacote Canônico de Correções 5.0, recebido integralmente nesta atualização.
5. Versão 4.1 e blocos disponíveis, respeitando as correções posteriores.

Uma referência dizendo “permanece” não recupera uma redação inexistente no anexo. Uma auditoria dizendo “aprovada” não fornece automaticamente o texto da pergunta, das alternativas e das saídas.

Exemplo concreto: a Q002 da versão 4.1 usa 10% da RLF para uma operação patrimonial. A auditoria final cita ativos essenciais e 50% da RLF para outras operações relevantes. O pacote registra a divergência e a orientação posterior; o texto antigo não está liberado para emissão automática.

Usar IDs estáveis `Q001` a `Q200`. O PDF também apresenta exemplos com quatro dígitos; este pacote padroniza em três dígitos, correspondendo à numeração predominante. O ID não deve ser alterado ao mudar a ordem visual.

Cada versão de pergunta, regra, protocolo, decisão conjunta, componente contratual e referência bíblica deve conter:

```text
id estável + version + effective_from + effective_to + is_active
source_ref + editor/revisor + instante da aprovação
```

Não sobrescrever respostas antigas com uma nova redação. Cada sessão de respostas deve apontar para uma versão fixa do questionário. O contrato guarda as versões exatas das respostas, decisões, regras e textos que o produziram.

## 5. Cadastro, sessões e permissões

### 5.1 Modelo do casal

Criar um registro de casal e dois registros de pessoa vinculados. Cada pessoa possui autenticação própria. A posição de membro 1/2 é estável e independente da alternativa marcada.

Os nomes “marido” e “esposa” podem aparecer na interface conforme o produto informado, mas o mecanismo de regras deve trabalhar com `person_id` e `membership_id`. A resposta A não identifica o marido; a resposta C não identifica a esposa.

Guardar somente os dados necessários às funcionalidades ativadas: nome de uso, dados de identificação efetivamente necessários ao documento e contexto de aplicabilidade. Campos de filhos, saúde ou intimidade não devem ser solicitados somente por estarem previstos no banco.

### 5.2 Matriz de acesso proposta

| Conteúdo | Próprio respondente | Outro cônjuge | Serviço de avaliação | Administração editorial |
|---|---|---|---|---|
| Respostas individuais brutas | Sim | Não | Somente para finalidade autorizada | Não por padrão |
| Resultado privado | Sim | Não | Sim, com escopo restrito | Não por padrão |
| Conteúdo de segurança | Somente o destinatário previsto | Não | Escopo específico | Não por padrão |
| Decisões conjuntas elegíveis | Sim | Sim | Sim | Sem acesso nominal por padrão |
| Contrato compartilhável | Sim | Sim | Sim | Sem acesso nominal por padrão |
| Perguntas e regras editoriais sem respostas | Conforme interface | Conforme interface | Sim | Sim |

A autenticação e a autorização devem ser verificadas no servidor em cada leitura e gravação. Não basta esconder uma seção na interface. Um convite ao cônjuge não autoriza acesso às respostas já registradas.

Não enviar respostas sensíveis, alternativas, alertas privados ou fragmentos de cláusulas a ferramentas de publicidade, rastreamento de interface, gravação de sessão ou logs comuns. A escolha de retenção, exclusão e bases de tratamento permanece uma pendência identificada na fonte; este pacote não determina prazos ou validação jurídica.

### 5.3 Estados técnicos propostos

| Objeto | Estados |
|---|---|
| Compra | `PENDING`, `CONFIRMED`, `CANCELED`, `REFUNDED` |
| Direito de acesso | `PENDING`, `ACTIVE`, `EXPIRED`, `REVOKED` |
| Sessão individual | `NOT_STARTED`, `IN_PROGRESS`, `SUBMITTED`, `SUPERSEDED` |
| Avaliação do casal | `WAITING_PARTNER`, `READY`, `RULES_INCOMPLETE`, `EVALUATED` |
| Decisão conjunta | `OPEN`, `PROPOSED`, `CONFIRMED_BY_BOTH`, `NO_CONSENSUS`, `SUPERSEDED` |
| Geração do contrato | `DRAFT`, `PENDING_JOINT_DECISIONS`, `PRIVATE_REVIEW_REQUIRED`, `READY_FOR_REVIEW`, `ACKNOWLEDGED`, `SUPERSEDED` |

`PRIVATE_REVIEW_REQUIRED` é estado interno restrito. Não deve ser devolvido ao outro cônjuge nem aparecer em URL, e-mail, notificação ou mensagem que permita inferir a natureza do alerta. O fluxo privado de resolução desse estado ainda precisa ser especificado.

Confirmação de compra deve vir de um evento validado no servidor; a página de sucesso do navegador não é prova de pagamento. Provedor, expiração, reembolso e situação do acesso depois do reembolso são decisões comerciais pendentes.

## 6. Contrato de dados do questionário

### 6.1 Pergunta principal

| Campo | Tipo conceitual | Regra |
|---|---|---|
| `question_id` | Identificador | Q001–Q200, estável |
| `version` | Texto | Versão editorial, separada da versão técnica do pacote |
| `display_order` | Inteiro | Ordem de exibição; não usar como chave |
| `title` | Texto | Rótulo da pergunta |
| `prompt_text` | Texto | Enunciado exibido; não substituir por texto de auditoria |
| `reference_period` | Objeto | Padrão de 90 dias; exceções expressas prevalecem |
| `applicability_rule` | Predicado | Obrigatório antes da ativação |
| `options` | Lista | Exatamente A, B e C |
| `nos_trigger_type` | Enumeração | Condição explícita de abertura da decisão conjunta |
| `clause_destination` | ID ou nulo | Destino aprovado; perguntas internas podem não gerar cláusula |
| `protocol_ids` | Lista de IDs | Referências existentes, sem duplicar o protocolo |
| `source_ref` | Objeto | PDF e intervalo de páginas |
| `is_active` | Booleano | Falso até completar as validações |

`null` significa “não definido ou não recuperado”, salvo campos cujo estado explique expressamente `NONE`. Não interpretar `null` como “não precisa de regra”.

### 6.2 Alternativa e saída

Cada alternativa tem texto e uma ou mais saídas. Uma saída especifica separadamente:

- **Quem pode ver:** `COMMON`, `PRIVATE` ou `SAFETY_PRIVATE`.
- **Para onde vai:** `CONTRACT`, `JOINT_PLAN`, `PRIVATE_PLAN`, `INTERNAL` ou `NONE`.
- **O que faz:** texto completo, sinalizador, protocolo, decisão conjunta ou ausência expressa de saída.

Uma alternativa pode originar mais de uma operação. Não reduzir o modelo a uma coluna de parágrafo. Não inserir expressões de diagnóstico privado dentro de um parágrafo compartilhável.

No pacote atual, `effect_source_text` preserva a redação encontrada. `effect_template_candidate`, quando presente, remove apenas comandos editoriais claramente identificados. A promoção de candidato a `contract_template` depende de validação de privacidade, variáveis e correções.

### 6.3 Aplicabilidade e ausência de resposta

Tratar como estados diferentes:

```text
ANSWERED_A / ANSWERED_B / ANSWERED_C
NOT_APPLICABLE
NOT_ANSWERED
BLOCKED_BY_POLICY
```

`NOT_APPLICABLE` não é uma quarta alternativa do questionário e não equivale a A. A ausência de filhos, por exemplo, deve ser tratada por uma condição de contexto antes de exibir o módulo correspondente. O sistema também não pode considerar uma resposta ausente como concordância.

Se apenas uma pessoa tiver aplicabilidade, a combinação de casal não é AA/AB/AC: é um caso de avaliação unilateral que precisa de regra específica. Enquanto essa regra não existir, não gerar cláusula por suposição.

## 7. Matriz de respostas e motor de regras

### 7.1 Seis pares, nove arranjos de pessoas

Cada pergunta possui seis pares de categorias:

| Par normalizado | Arranjos possíveis nas duas pessoas |
|---|---|
| AA | A/A |
| AB | A/B ou B/A |
| AC | A/C ou C/A |
| BB | B/B |
| BC | B/C ou C/B |
| CC | C/C |

São 200 × 6 = 1.200 registros. Os 1.800 arranjos ordenados são tratados preservando quem marcou cada alternativa. **Normalizar a chave não pode apagar a identidade dos respondentes.**

Exemplo: pessoa 1 marcou B e pessoa 2 marcou A. A regra consultada é AB; `{Nome A}` deve receber o nome da pessoa 2. O código de referência incluído demonstra essa normalização, sem gerar cláusulas.

### 7.2 Ações aceitas

| Ação | Comportamento |
|---|---|
| `MERGE_EXACT_TEXT` | Usar um texto conjunto completo previamente cadastrado |
| `KEEP_INDIVIDUAL_OUTPUTS` | Preservar as saídas individuais elegíveis e identificadas |
| `USE_COMPATIBILITY_TEXT` | Usar o texto integral de compatibilização cadastrado |
| `OPEN_NOS_DECIDIMOS` | Abrir módulo conjunto com gatilho válido |
| `PRIVATE_DIAGNOSTIC` | Registrar resultado no destino privado ou interno autorizado |
| `SAFETY_FLOW` | Acionar proteção e impedir exposição incompatível |
| `TRIGGER_PROTOCOL` | Instanciar protocolo existente, observando prioridade |
| `NO_ADDITIONAL_OUTPUT` | Não adicionar saída específica do par; efeitos individuais/fixos continuam sujeitos às suas próprias regras |

Uma ação principal não elimina as verificações de segurança, os efeitos individuais, os gatilhos específicos ou as regras fixas. Quando o PDF combina ações, o modelo admite `additional_actions`. A ordem de execução é explícita; uma saída privada nunca é promovida a compartilhada por uma etapa posterior.

As 1.200 combinações possuem ação registrada. A Q154 segue proibição integral de apostas com dinheiro, conforme decisão do usuário.

### 7.3 Ordem proposta de avaliação

1. Carregar a versão fixa da sessão e validar o vínculo das duas pessoas.
2. Verificar disponibilidade e integridade das regras necessárias.
3. Aplicar regras de aplicabilidade e distinguir ausência de resposta.
4. Avaliar sinais privados de segurança antes de montar qualquer visão compartilhada.
5. Fixar a classificação de privacidade de cada resultado e de suas dependências.
6. Consultar os pares, preservando os papéis de cada pessoa.
7. Avaliar cruzamentos entre perguntas segundo predicados expressos.
8. Acionar protocolos e decisões conjuntas elegíveis; não repetir instâncias do mesmo evento.
9. Aguardar confirmação dos dois nos acordos que a exigirem.
10. Selecionar componentes contratuais aprovados e resolver suas variáveis.
11. Consolidar componentes por cláusula, sem inventar ou resumir obrigações.
12. Verificar vazamento de informação privada e ausência de variáveis.
13. Salvar o resultado, as versões e a origem de cada componente.

Não usar IA generativa para preencher regras ausentes durante a execução. Se houver uso futuro de IA na redação editorial, o texto deverá ser revisado, versionado e cadastrado antes de poder ser usado como regra de produção.

### 7.4 Cruzamentos

Os cruzamentos não estão contidos nas 1.200 linhas de pares. Uma pergunta pode depender de outra respondida pela mesma pessoa ou pelo cônjuge. É necessário cadastrar explicitamente qual pessoa ocupa cada lado.

Exemplo: Q004 × Q009 cruza a forma de demonstrar amor de X com a forma de perceber amor de Y, nos dois sentidos. Q002 × Q020 cruza participação e percepção de participação. Onde a fonte não define todos os predicados ou papéis, o registro em `cruzamentos.json` conserva a referência, sem ativar o cálculo.

## 8. Etapa “NÓS DECIDIMOS”

Ela não repete as 200 perguntas. Exibe somente decisões legítimas e necessárias, conforme gatilho cadastrado.

| Gatilho | Significado |
|---|---|
| `ALWAYS` | Sempre que a pergunta for aplicável e o fluxo estiver elegível |
| `DIVERGENCE_ONLY` | Somente na divergência expressamente definida |
| `CONCRETE_EVENT_ONLY` | Somente diante de evento concreto pertinente |
| `OPTIONAL` | Escolha voluntária do casal |
| `CONDITION_ONLY` | Somente quando o predicado específico for verdadeiro |
| `NEVER` | Não abrir decisão conjunta a partir desta pergunta |

Cada módulo precisa de enunciado, alternativas, campos complementares, validações, texto de saída integral e versão. “Sempre” não ignora segurança, aplicabilidade ou os requisitos de acesso.

A Q041 possui duas decisões distintas: modelo financeiro e divisão das despesas comuns. Logo, `question_id` não é chave suficiente para o módulo; usar `joint_module_id`.

Uma pessoa pode registrar uma proposta. O acordo somente se torna `CONFIRMED_BY_BOTH` quando as duas confirmam a mesma versão do conteúdo e dos parâmetros. Qualquer alteração posterior invalida os dois aceites daquela versão e abre nova confirmação. Ausência de resposta ou silêncio não é aceite.

Se não houver consenso, registrar `NO_CONSENSUS`. Não tirar média de respostas, escolher a alternativa intermediária ou utilizar voto de desempate. A divergência reprodutiva AC da Q146 aciona P09 e não abre imediatamente uma decisão conjunta.

A Q131 perdeu seu calendário independente na correção 6.0: ela reutiliza os Momentos de Qualidade da Q011. O módulo antigo está preservado apenas como histórico e marcado como substituído.

## 9. Protocolos e parâmetros centrais

| ID | Protocolo | Situação no pacote |
|---|---|---|
| P01 | Conversa, Escuta e Correção | Texto disponível; prazos centrais extraídos |
| P02 | Reconexão após Duas Recusas | Texto 4.1 e mapa de gatilhos 5.0 disponíveis |
| P03 | Frequência Íntima por Ciclos | Dois ciclos e exceção sem meta numérica recuperados da 5.0 |
| P04 | Momento Programado de Reconexão | Texto, frequências e consentimento recuperados da 5.0 |
| P05 | Reconstrução da Confiança | Sete etapas e revisão de 30 dias recuperadas da 5.0 |
| P06 | Reequilíbrio de Tempo/Prioridades | Fonte preservada na Q048 |
| P07 | Retomada da Intimidade | Etapas recuperadas; gatilho único de P03 |
| P08 | Crise Financeira | Fonte preservada na Q043 |
| P09 | Divergência Reprodutiva | Correção 6.0 recuperada |
| P10 | Proteção e Recuperação de Hábitos | Correção 7.0 recuperada |
| P11 | Impasse | Fonte preservada na Q180 |
| P12 | Reavaliação de Regressão | Fonte preservada na Q184 |
| P13 | Segurança | Bloqueios definidos; operação da revisão privada pendente |
| P14 | Calendário Unificado de Revisões | Regras de unificação disponíveis |

Parâmetros expressamente recuperados:

- Referência geral das respostas: últimos 90 dias; Q121 usa últimos dois anos.
- Conversa inicial: mesmo dia ou até 24 horas; fala inicial de até cinco minutos; retomada em até 72 horas quando a primeira conversa não solucionar.
- Repetição geral sem gatilho próprio: três ocorrências em 30 dias; situações menos frequentes podem usar três ocorrências consecutivas quando essa classificação estiver expressa.
- Q178: três ciclos estruturados sem resultado, ou persistência do gatilho apesar de três intervenções; `PARCIAL` não conta automaticamente como fracasso completo.
- Q180: três conversas estruturadas sobre o mesmo problema em até 90 dias, sem melhora suficiente. A expressão deve ser operacionalizada em coerência com os resultados estruturados; não presumir que todos os critérios da Q178 foram incorporados à Q180.
- P10: revisão em até 30 dias, ou prazo menor quando houver indicação adequada.
- Plano inicial: até três prioridades principais e até três ações secundárias; os valores específicos de “moderado” e “leve” não estão definidos.

O mecanismo deve registrar evento de origem, instante de ocorrência, fuso da agenda e versão da regra. Um prazo em horas não é a mesma coisa que uma revisão mensal. A interpretação de “mesmo dia”, final de semana/ciclo e situações de impedimento deve constar do calendário implementado; os detalhes ausentes estão na lista de decisões técnicas.

Prazos de urgência não devem aguardar reunião periódica. Uma revisão pode tratar vários módulos, mantendo o resultado de cada assunto separado.

## 10. Contribuição simbólica de R$ 10

O valor é um parâmetro central em BRL, representado como decimal. O destino descrito é o Cofrinho de Reconexão do casal, para benefício comum.

As regras possíveis são `NONE` e `GENERAL_PROCESS_REFUSAL`. A contribuição não é consequência automática de responder B/C, discordar ou deixar uma meta de ser atingida.

A fonte limita sua aplicação à recusa injustificada de um processo pertinente, respeitando conhecimento do processo, condições de comunicação e ausência de impedimento legítimo. Um prazo vencido isoladamente não demonstra intenção de recusar. A forma de registrar esses fatos e tratar contestação ainda precisa ser definida.

Não aplicar por sexo, recusa sexual, falta de desejo, doença, sofrimento emocional, segurança, violência, dependência, compulsão, recaída, gravidez, divergência sobre filhos, divergência espiritual ou ausência legítima de consenso. As exclusões posteriores prevalecem sobre formulações mais amplas das versões antigas.

O pacote prevê registro do cofrinho, não autorização de débito, cobrança ao cartão ou integração de pagamento dessa contribuição. O valor não é receita da plataforma e não pertence individualmente ao cônjuge que apresentou a reclamação.

## 11. Segurança e proteção das saídas

As seguintes regras vêm da conversa-fonte e fazem parte do comportamento funcional solicitado:

- Um relato de violência, coerção ou medo não deve ser tratado como simples divergência de preferência.
- B/C no bloco Q101–Q110 exige tratamento privado, sem expor automaticamente quem respondeu. Nem todo B/C significa automaticamente alerta crítico; a classificação específica depende da regra.
- Relato de estrangulamento, sufocamento intencional ou compressão deliberada do pescoço aciona alerta crítico mesmo se houver um episódio.
- Alerta crítico impede a finalização automática do contrato conjunto e pode levar a `PRIVATE_REVIEW_REQUIRED`.
- Não abrir confronto, decisão conjunta sobre o relato, contribuição simbólica ou notificação que revele a resposta.
- O sistema não presume que atendimento conjunto é apropriado.
- Respostas A isoladas não autorizam uma declaração conjunta afirmando que ambos estão seguros.
- Compartilhamento de senha, dispositivo ou localização não é permanente e pode ser revogado.
- Regras sobre visitas à residência não autorizam controle geral de amizades.
- O sistema não recebe fotos ou vídeos íntimos; registra somente os acordos necessários.

O primeiro exemplo do PDF mostra respostas individuais na etapa conjunta. A arquitetura posterior de privacidade é mais restritiva. Portanto, uma tela conjunta deve usar a projeção expressamente permitida para o assunto, e não copiar automaticamente respostas brutas.

Uma resposta privada também não pode ser revelada indiretamente pelo nome de um módulo, lista de “perguntas faltantes”, diferenças de notificações ou uma cláusula que só apareceria após a resposta sensível. Os testes devem cobrir essas inferências de interface. A nova fonte acrescenta níveis BASE/ALTO/CRÍTICO por alternativa e a elevação por duas respostas B em perguntas diferentes. O escopo dessa agregação (por respondente ou caso do casal) deve ser explicitado; ele não foi presumido neste pacote.

## 12. Geração do contrato

### 12.1 Estrutura final

O contrato consolida aproximadamente 17 cláusulas:

| ID | Cláusula |
|---|---|
| C01 | Dignidade, respeito e segurança |
| C02 | Comunicação e conflitos |
| C03 | Decisões, confiança e transparência |
| C04 | Amor, carinho e presença |
| C05 | Intimidade e sexualidade |
| C06 | Fidelidade e reconstrução |
| C07 | Organização doméstica |
| C08 | Finanças e patrimônio |
| C09 | Filhos e parentalidade |
| C10 | Trabalho, carreira e projetos |
| C11 | Famílias de origem |
| C12 | Fé e espiritualidade |
| C13 | Saúde e cuidado |
| C14 | Lazer, amizades e vida social |
| C15 | Hábitos, substâncias e compulsões |
| C16 | Crises, reparação e impasses |
| C17 | Revisões e evolução do contrato |

Anexo A: protocolos aplicáveis. Anexo B: decisões específicas do casal. Anexo C: fundamentação bíblica.

O mapeamento inicial de perguntas para cláusulas em `clause_destination_proposal` é uma organização técnica proposta. Ele não substitui a aprovação dos componentes que efetivamente devem aparecer.

### 12.2 Regras de montagem

Selecionar somente componentes pertinentes, com texto integral, variáveis resolvidas, origem e privacidade compatíveis. A pergunta original não precisa aparecer no contrato.

Consolidar por IDs de componentes e grupos de conteúdo aprovados. Não deduplicar usando apenas semelhança textual nem pedir a uma IA que faça um resumo livre, pois isso pode eliminar prazos, condições e exceções.

Uma resposta equivalente pode exigir texto conjunto. Não produzir esse texto substituindo cegamente “reconhece” por “reconhecem”: concordância, pronomes e o sujeito do compromisso variam. Usar `MERGE_EXACT_TEXT` com a redação previamente cadastrada.

Algumas respostas individuais atribuem um compromisso ao outro cônjuge. Isso não demonstra que ele já o aceitou. A revisão final e o registro de concordância com o documento devem contemplar essas obrigações propostas.

Q196, Q197, Q198 e Q200 são privadas/internas e não imprimem cláusulas nominais. A Q200 calibra o plano; não representa prova de desinteresse ou falta de disposição do cônjuge.

### 12.3 Referências bíblicas

A versão 4.1 pede texto da passagem em tradução adequada para reprodução comercial. A arquitetura posterior propõe uma tabela própria com livro, capítulo, versículos, tradução e tipo de uso (`DIRECT` ou `PRINCIPLE`).

As referências encontradas estão preservadas por pergunta. A tradução e os textos licenciados não foram definidos no anexo e não foram adicionados neste pacote. Não imprimir referências internas como se fossem citações bíblicas completas.

### 12.4 Natureza do documento

A fonte propõe informar que se trata de instrumento de compromisso, organização e desenvolvimento conjugal, sem substituição dos atendimentos profissionais necessários. A aplicação não deve afirmar validade jurídica automática, atribuir poderes sobre o corpo ou recursos do cônjuge, ou apresentar a contribuição simbólica como penalidade legal.

O significado técnico de “assinatura” deve ser definido antes da implementação: simples ciência interna, confirmação do documento ou integração específica. `ACKNOWLEDGED` registra ciência no sistema e, neste pacote, não representa uma modalidade jurídica de assinatura.

## 13. Modelo relacional proposto

O arquivo `programacao/modelo_referencia.sql` implementa um esquema local de referência em SQLite para conferir relações e restrições básicas. Ele não é uma migração pronta do site e não implementa autenticação, criptografia, políticas de acesso ou a totalidade do motor.

| Entidade | Responsabilidade principal |
|---|---|
| `persons`, `couples`, `couple_members` | Identidades, casal e vínculos |
| `questionnaire_versions`, `questionnaire_items` | Versão imutável e seus itens |
| `questions`, `question_options` | Conteúdo versionado |
| `output_components`, `option_outputs` | Textos e ações com privacidade e destino |
| `pair_rules`, `pair_rule_outputs` | Seis pares e componentes associados |
| `fixed_rules`, `question_fixed_rules` | Regras compartilhadas reutilizáveis |
| `protocols`, `question_protocols`, `protocol_instances` | Definições e eventos de execução |
| `joint_modules`, `joint_options`, `joint_decisions`, `joint_confirmations` | Definições, propostas e aceite dos dois |
| `response_sessions`, `responses` | Sessões e respostas individuais |
| `evaluation_runs`, `alerts` | Execuções, versões e saídas restritas |
| `contract_versions`, `contract_components` | Documento e origem dos componentes |
| `review_schedule` | Revisões periódicas e extraordinárias |
| `reconnection_entries` | Registro simbólico do cofrinho |
| `purchases`, `entitlements` | Compra e direito de acesso |
| `audit_events` | Ações técnicas sem conteúdo sensível em texto livre |

Componentes devem ser imutáveis depois de publicados. Usar novas versões para correção. Não compartilhar um componente privado com um destino comum somente porque o seu texto parece genérico.

## 14. Interface de serviços proposta

Os nomes abaixo são contratos conceituais para implementação; não pressupõem um framework ou serviço externo.

| Operação | Entrada essencial | Resultado e condição |
|---|---|---|
| `start_admission` | Versão publicada da prova | Utiliza a implementação de admissão já existente no site |
| `save_admission_answer` | Sessão, ID, versão, resposta | Salva apenas resposta do visitante autorizado |
| `get_admission_result` | Sessão concluída | Resultado pela metodologia aprovada; sem fórmula inventada |
| `confirm_purchase_event` | Evento validado, ID de idempotência | Atualiza compra e acesso sem duplicar |
| `create_couple_invitation` | Pessoa autenticada e intenção de vínculo | Convite limitado; sem acesso a respostas |
| `start_response_session` | Vínculo e versão publicada | Sessão individual congelada na versão |
| `save_response` | Sessão, pergunta/versão, alternativa, revisão esperada | Persiste com validação e controle de concorrência |
| `submit_responses` | Sessão e revisão esperada | Fecha quando todas as perguntas aplicáveis tiverem estado válido |
| `evaluate_couple` | Duas sessões válidas e versão do motor | Avaliação interna ou bloqueio por falta de regra |
| `list_joint_modules` | Usuário e avaliação | Somente projeções elegíveis e compartilháveis |
| `propose_joint_decision` | Módulo, escolha, parâmetros, revisão esperada | Nova proposta versionada |
| `confirm_joint_decision` | ID da proposta e hash do conteúdo | Aceite individual da versão exata |
| `generate_contract_draft` | Avaliação e decisões vigentes | Rascunho rastreável ou bloqueio justificado ao destinatário apropriado |
| `acknowledge_contract` | ID, versão e hash do documento | Ciência do documento exato |
| `review_agreement` | Acordo, manter/revisar/redefinir e contexto | Nova versão sem apagar a anterior |

Em gravações, o servidor identifica a pessoa pelo contexto autenticado, não por um `person_id` livre enviado pelo navegador. Usar chave de idempotência e controle de versão para evitar respostas sobrescritas, cobranças duplicadas, acordos alterados após aceite e contratos produzidos com sessões incompatíveis.

## 15. Arquivos fornecidos e integração

`dados/arquivo_mestre.json` reúne as coleções principais. Os arquivos individuais em `dados/` facilitam revisão e importação separada. Não carregar o consolidado e os arquivos separados como se fossem registros diferentes.

`fontes/transcricao_com_paginas.txt` permite localizar a passagem original. `fontes/ocorrencias_perguntas.json` mantém as diferentes aparições das perguntas. `dados/correcoes_fonte.json` mantém os trechos de correção e a página de origem. O catálogo humano em `02_CATALOGO_DE_PERGUNTAS.md` apresenta o conteúdo por ID, com aviso sobre textos anteriores às correções.

Ordem proposta de carga em ambiente de revisão:

1. Ler o manifesto e verificar hashes.
2. Carregar versões, cláusulas e protocolos como rascunho.
3. Carregar perguntas, alternativas e candidatos de saída.
4. Carregar correções, regras fixas, cruzamentos e decisões conjuntas.
5. Carregar os 1.200 pares sem preencher ações nulas.
6. Conferir vínculos, pendências e variáveis.
7. Promover somente conteúdo revisado para uma nova versão publicável.

Não importar a transcrição como conteúdo visível ao usuário final. Não usar `status_in_source = APROVADA` para mudar `is_active`: a auditoria do diálogo não elimina a ausência material dos textos.

## 16. Critérios de aceite e testes

Uma versão principal só pode ser publicada quando satisfizer todos os critérios:

1. Exatamente 200 IDs únicos, com enunciado final e A/B/C completos.
2. Aplicabilidade e período de referência definidos por pergunta.
3. Todas as alternativas com ações e saídas explícitas, inclusive `NONE` quando pertinente.
4. Seis pares únicos por pergunta e nenhuma ação nula.
5. Todo texto automático completo e com variáveis declaradas.
6. Nenhum comando editorial ou referência a “texto anterior” no contrato emitido.
7. Todos os cruzamentos com predicado, pessoas de origem e saídas completas.
8. Todos os módulos conjuntos com gatilho, opções, campos, validações e saídas.
9. Concordância dos dois registrada sobre a mesma versão das decisões.
10. Informação privada impedida de entrar em contrato, tela ou notificação compartilhada.
11. Segurança prevalecendo sobre todos os demais módulos.
12. Protocolos existentes, sem duplicação de instâncias para o mesmo evento.
13. Exclusões da contribuição simbólica efetivas.
14. Perguntas inaplicáveis sem conversão artificial em A e sem distorção dos resultados.
15. Revisões periódicas combinadas sem atrasar gatilhos urgentes.
16. Reprodução do documento pela mesma fotografia de dados e versões.
17. Dados comerciais definidos antes da liberação de novos fluxos de compra; admissão e resultado já implementados conforme o usuário.
18. Aplicar a proibição integral da Q154, decidida na versão 1.3.1, com preservação do fluxo privado.
19. Definições operacionais de privacidade, acesso, retenção e suporte privado concluídas.
20. Tradução e uso dos textos bíblicos definidos para o documento final.

O pacote inclui `programacao/validar_pacote.py`, que confere integridade do inventário e sinaliza bloqueios de produção, e `programacao/test_referencia.py`, com testes de normalização de pares, projeção de privacidade e tratamento de contribuição. Os testes de regressão 1.1.0 também verificam a incorporação de 61 IDs, as quatro versões preservadas e os bloqueios de saída privada. Os testes 1.2.0 verificam cobertura 200/200 e preservação das correções. Os testes 1.4.0 verificam vínculos das pessoas, condições desconhecidas, privacidade, segurança, decisões conjuntas e bloqueios editoriais. Eles demonstram controles pontuais e **não constituem certificação do site**, que ainda não foi implementado neste trabalho.

```bash
python3 programacao/validar_pacote.py
python3 programacao/validar_pacote.py --production
python3 -m unittest discover -s programacao -p 'test_*.py'
```

O primeiro comando deve aprovar a integridade do pacote. O segundo deve reprovar a prontidão para produção enquanto as lacunas persistirem. Essa reprovação é o comportamento esperado deste material de consolidação.

## 17. Sequência de implementação

1. Construir o ambiente de revisão editorial e o armazenamento versionado.
2. Implementar identidade, vínculo do casal, salvamento e permissões.
3. Conferir o conteúdo recuperado das 200 perguntas e concluir a compilação dos campos e das correções 5.0/6.0/7.0.
4. Consolidar as alternativas, os enunciados abreviados e as correções posteriores.
5. Integrar os pares e textos já definidos e concluir cruzamentos, módulos de decisão conjunta e variáveis restantes.
6. Implementar e testar os bloqueios de privacidade e segurança antes da geração compartilhada.
7. Implementar o gerador determinístico, os aceites e as revisões.
8. Preservar a admissão e o resultado já implementados e configurar os fluxos de compra conforme as decisões comerciais.
9. Validar a versão integral e liberar somente depois de remover seus bloqueios.

O trabalho editorial faltante está identificado no pacote. O programador não deve decidir doutrina, inventar respostas ou transformar ausência de regra em comportamento padrão.


## 18. Consolidação das combinações — 1.4.0

Consulte `04_MATRIZ_DE_COMBINACOES.md`. O planejador demonstra a seleção de regras e componentes. Não gera o contrato e seu retorno é exclusivamente interno: não deve ser enviado integralmente ao navegador ou ao outro cônjuge.

`component_refs` aponta os efeitos individuais. `pair_component_id` aponta o texto conjunto quando necessário. `conditional_steps` descreve decisões que dependem de contexto; `event_rule_ids` preserva os protocolos associados a eventos. `base_output_action` registra o tratamento dos efeitos quando a ação principal é abrir uma decisão conjunta. `execution_dependencies` torna os bloqueios locais explícitos.

`null` na avaliação de fatos significa desconhecido. A falta de informação não libera a alternativa contrária nem produz consentimento. Os fatos precisam ser produzidos por um avaliador de eventos/contexto verificado pelo servidor. As tabelas relacionais existentes podem receber componentes em `output_components`, vínculos em `pair_rule_outputs`, condições em `predicate_json` e operações condicionais em `additional_actions_json`; a carga deverá preservar versões e estados de aprovação.

Todas as ações permanecem inativas para produção até a validação do conjunto de dependências. A conclusão das 487 redações não encerra a compilação dos cruzamentos, dos demais módulos nem a validação da implementação do site.


### Decisão Q154 — proibição integral

{Nome 1} e {Nome 2} comprometem-se a não participar de apostas, bets, cassino, jogos de azar, loterias ou atividades semelhantes envolvendo dinheiro, mesmo em pequenas quantias, tanto com recursos pessoais quanto com recursos familiares.

Aplica-se a todos os pares, sem revelar respostas individuais. Não haverá NÓS DECIDIMOS permissivo, limite mensal de apostas ou R$10 por aposta/recaída. Q154-C permanece privada e encaminha à proteção P10. As 1.200 ações e os 487 textos antes ausentes estão definidos. Permanecem os requisitos funcionais de produção.


## 19. Textos conjuntos finalizados — versão 1.4.0

O solicitante delegou a decisão dos 487 textos faltantes. Todos correspondem a respostas iguais: 182 A+A, 169 B+B e 136 C+C, em 182 perguntas. Foram criadas redações específicas, aplicando efeitos individuais e correções canônicas; não se trata de transcrição literal nem de geração durante o uso do produto.

### Seleção e estado editorial

- Coleção principal: `joint_texts`, em `dados/textos_conjuntos.json`.
- Identificadores: `TXT-Q001-AA` → `OUT-PAIR-Q001-AA` → `PAIR-Q001-AA`, seguindo o mesmo padrão para cada registro.
- Texto final: `joint_texts.template` e `output_components.editorial_template`.
- Estado editorial: `FINAL_BY_USER_DELEGATION`; a pendência de redação está encerrada.
- Compatibilidade: `template_candidate` e `contract_template_candidate` contêm a mesma redação, mas não conferem autorização técnica de publicação.
- Produção: os componentes permanecem inativos. A carga para `contract_template` exige o fluxo funcional completo, a aplicabilidade, a segurança e os aceites pertinentes. Não exige pedir novamente ao solicitante uma decisão editorial sobre estes 487 casos.

### Vínculos e limites

Cada texto usa somente `{Nome 1}` e `{Nome 2}`, ligados às identidades estáveis dos membros. Não usar `{Nome A}` em pares A+A nem duplicar a mesma cláusula uma vez para cada respondente.

Os 81 casos deste lote cuja ação principal é `OPEN_NOS_DECIDIMOS` mantêm essa ação. Os demais passos condicionais, módulos privados, protocolos, gatilhos e regras de contribuição permanecem preservados. A+A não define automaticamente uma quantidade de encontros; C+C não prova que os projetos pessoais são iguais. O texto de preferência acompanha a decisão específica do casal e não a substitui.

A Q060 usa a proibição corrigida e sua exceção clínica/educacional. Q085 preserva consentimento revogável. Q097 aplica os prazos corrigidos. Q130 preserva compartilhamento voluntário. Q131 utiliza o calendário da Q011. Q146 não autoriza concepção automática. Q174/Q175 preservam amizades e transparência sem vigilância. Q187 não fixa prazo para o luto.

### Verificação e rastreabilidade

`05_TEXTOS_CONJUNTOS.md` reúne todas as redações para leitura. `auditoria/decisao_textos_conjuntos_1_4_0.json` registra origem, escopo e referências de integridade. `fontes/textos_conjuntos_antes_1_4_0.json` preserva o estado anterior dos 487 componentes e pares.

O validador deve confirmar correspondência exata entre catálogo, componentes e matriz; ausência de placeholders ambíguos; nenhuma alteração dos fluxos privados ou de segurança; nenhum desvio dos módulos de decisão conjunta; e ausência do bloqueio `EXACT_PAIR_TEXT_MISSING` neste lote. Esse encerramento não elimina os outros requisitos de produção descritos em `auditoria/PENDENCIAS.md`.
