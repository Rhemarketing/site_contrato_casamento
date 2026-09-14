# Aplicabilidade — decisões delegadas

Gerado por `npm run contract:compile`. Política 1.0.0; integração 1.4.0-release.1; base original 1.4.0.

Autorização: pedido do usuário em 12/09/2026 para decidir a aplicabilidade das 184 perguntas. São decisões de produto, não citações da fonte nem novas cláusulas de contrato.

Das 184 regras antes ausentes: **128 gerais** e **56 condicionais**. As 16 regras existentes são preservadas. Há **zero regras de aplicabilidade ausentes**, mas Q181 conserva a exigência de revisão privada segura, agora implementada com autorização nominal e revogação.

## Critérios

- Preferências, cenários hipotéticos e autoavaliações de postura são gerais, sem afirmar que um evento ocorreu. Responder exige escolher uma alternativa real; o sistema nunca escolhe por alguém. Não conseguir se avaliar mantém a pergunta sem resposta, sem transformá-la em A ou em inaplicável.
- Experiências específicas e contextos estruturais são verificados antes do enunciado e das alternativas. Contexto SIM libera a resposta quando não há outra exigência; contexto NÃO produz NOT_APPLICABLE; ausente ou desconhecido mantém BLOCKED_BY_POLICY.
- Contextos são individuais, booleanos e criptografados. Não pedir nomes de terceiros, diagnósticos, detalhes íntimos ou provas. Não inferir por sexo, gênero, idade, renda, orientação sexual, religião presumida, letras ou respostas do cônjuge.
- O enunciado e seu período original prevalecem. Contextos ligados a episódios usam esse período; histórico com consequências atuais e luto em curso têm as exceções descritas na tabela. Preferências futuras não exigem ocorrência nos últimos 90 dias. Nenhum período novo de diagnóstico ou prazo de protocolo foi criado.
- Q101–Q109 e Q119 não recebem filtros de violência, religião, emprego, tecnologia ou vida sexual. Q110 preserva a condição original de filhos/dependentes. Sem resposta não significa ausência de risco; a agregação considera respostas distintas por pessoa e a maior severidade, conforme a política de liberação.
- Na Q146, não desejar filhos é uma posição válida (C), e dúvida ou divergência não excluem o tema. Fertilidade, idade e ausência de filhos não decidem a pertinência.
- Na Q181, histórico conhecido e reconstrução voluntária são condições necessárias, insuficientes para liberação. A revisão privada segura é uma exigência da fonte; nenhum campo do navegador pode concedê-la. Ausência confirmada de contexto torna a pergunta inaplicável; presença mantém bloqueio até existir uma revisão vigente e autorizada.
- Uma pergunta aplicável a somente um participante não forma par artificial: NO_SHARED_APPLICABILITY. Sua resposta permanece privada e não produz saída conjunta.
- Quando o contexto muda para não ou desconhecido, respostas e complementos desse ramo são removidos. Voltar a sim exige nova resposta; não se ressuscita A/B/C antigo. NOT_APPLICABLE conta como item resolvido no progresso, mas não como resposta A/B/C.
- Nova edição para novas sessões. Fotografias e respostas da integração 1.4.0 permanecem vinculadas à versão antiga; não são migradas nem reinterpretadas automaticamente.
- A edição de liberação inclui os controles documentados em contract-release-decisions.md. A ativação do servidor exige chave própria, configuração do ambiente e migrations; gateway real permanece adiado por solicitação do usuário.

## Matriz completa

| Pergunta | Origem da regra | Aplicabilidade | Justificativa |
|---|---|---|---|
| Q001 — REAÇÃO DIANTE DE UM PROBLEMA | Decisão delegada | Sempre aplicável | Autoavaliação da reação habitual a problemas; não exige comprovar conflito recente. |
| Q002 — DECISÕES IMPORTANTES | Decisão delegada | Sempre aplicável | Postura sobre decisões que afetam a vida comum, inclusive decisões futuras. |
| Q003 — REAÇÃO DURANTE A IRRITAÇÃO | Decisão delegada | Sempre aplicável | Autoavaliação da reação à irritação; não pressupõe agressão ou episódio recente. |
| Q004 — COMO DEMONSTRA AMOR | Decisão delegada | Sempre aplicável | Forma pessoal de demonstrar afeto, inclusive dificuldade de demonstrá-lo. |
| Q005 — ORGANIZAÇÃO E ROTINA | Decisão delegada | Sempre aplicável | Preferência de organização da vida familiar, sem exigir filhos ou residência conjunta. |
| Q006 — RECEBIMENTO DE RECLAMAÇÕES | Decisão delegada | Sempre aplicável | Autoavaliação da reação habitual a reclamações, sem transformar a resposta em registro de evento. |
| Q007 — VIDA SOCIAL | Decisão delegada | Sempre aplicável | Preferência de vida social; ser reservado ou não frequentar festas não exclui a pergunta. |
| Q008 — IMPREVISTOS | Decisão delegada | Sempre aplicável | Autoavaliação de flexibilidade diante de imprevistos, sem exigir uma ocorrência recente. |
| Q009 — COMO PERCEBE O AMOR | Decisão delegada | Sempre aplicável | Preferência sobre como perceber amor; não exige receber atualmente essas demonstrações. |
| Q010 — RECONHECIMENTO | Decisão delegada | Sempre aplicável | Percepção de reconhecimento, incluindo cuidado e contribuições não financeiras. |
| Q011 — ATENÇÃO E PRESENÇA | Decisão delegada | Sempre aplicável | Percepção de atenção e conexão; ausência de bons momentos também faz parte da avaliação. |
| Q012 — PEDIDOS DE AJUDA | Decisão delegada | Sempre aplicável | Postura sobre pedidos de ajuda na vida comum; não depende de filhos ou renda. |
| Q013 — PEDIDO DE DESCULPAS | Decisão delegada | Sempre aplicável | Autoavaliação da facilidade de reconhecer erros e pedir desculpas. |
| Q014 — FORMA DE RECEBER RECLAMAÇÃO | Decisão delegada | Sempre aplicável | Preferência de como receber uma conversa difícil; não exige reclamação prévia. |
| Q015 — DISCORDÂNCIA | Decisão delegada | Sempre aplicável | Autoavaliação da postura diante de discordâncias, sem exigir conflito comprovado. |
| Q016 — ERROS ANTIGOS | Decisão delegada | Sempre aplicável | Autoavaliação sobre trazer o passado às conversas; não comprova erros antigos. |
| Q017 — SILÊNCIO E AFASTAMENTO | Decisão delegada | Sempre aplicável | Autoavaliação de silêncio e afastamento; não implica autorização para abordagem conjunta. |
| Q018 — DEPOIS DAS DESCULPAS | Decisão delegada | Sempre aplicável | Preferência sobre necessidades após desculpas; não exige quebra grave de confiança. |
| Q019 — EXPOSIÇÃO DOS PROBLEMAS | Decisão delegada | Sempre aplicável | Postura sobre buscar apoio e exposição de problemas, mesmo sem apoio externo atual. |
| Q020 — PARTICIPAÇÃO REAL NAS DECISÕES | Decisão delegada | Sempre aplicável | Percepção atual de participação nas decisões, sem exigir uma decisão recente específica. |
| Q021 — INTENÇÃO E IMPACTO | Decisão delegada | Sempre aplicável | Autoavaliação sobre intenção e impacto, sem pressupor relato de dano. |
| Q022 — BRINCADEIRAS E COMENTÁRIOS | Decisão delegada | Sempre aplicável | Percepção de conforto com comentários e brincadeiras; sinais de humilhação não podem ser filtrados por contexto prévio. |
| Q023 — ASSUNTOS DIFÍCEIS | Decisão delegada | Sempre aplicável | Liberdade para abordar assuntos difíceis; não exigir conversa prévia permite relatar evitação por medo. |
| Q024 — TRANSPARÊNCIA SOBRE INFORMAÇÕES DESCONFORTÁVEIS | Decisão delegada | Sempre aplicável | Postura sobre transparência de informações, sem exigir revelar um segredo. |
| Q025 — PROMESSAS E ACORDOS | Decisão delegada | Sempre aplicável | Autoavaliação de cumprimento de compromissos; não comprova descumprimento específico. |
| Q026 — FLERTES E INTERESSE DE TERCEIROS | Decisão delegada | Sempre aplicável | Postura diante de interesse de terceiros; não exige identificar terceiro ou comprovar flerte. |
| Q027 — EX-RELACIONAMENTOS | Decisão delegada | EX_CONTACT_RELEVANT = sim | Contato com ex ou antigo interesse precisa ser uma situação real ou concretamente prevista; ausência desse contexto não equivale a preferir distância. |
| Q028 — CIÚME E INSEGURANÇA | Decisão delegada | Sempre aplicável | Autoavaliação sobre ciúme e insegurança; não exige suspeita de infidelidade. |
| Q029 — CELULAR, PRIVACIDADE E TRANSPARÊNCIA | Decisão delegada | PERSONAL_PHONE_USE = sim | As alternativas descrevem relação com celular pessoal; não ter esse uso não é uma posição sobre privacidade. |
| Q030 — CONVERSAS DIGITAIS | Decisão delegada | DIGITAL_CONVERSATIONS = sim | Exige contexto de comunicação digital, sem exigir existência de interesse afetivo ou sexual. |
| Q031 — EXPOSIÇÃO NAS REDES SOCIAIS | Decisão delegada | SOCIAL_PUBLISHING = sim | Exige publicação atual ou considerada; não possuir rede social não deve ser convertido em concordância com uma regra de postagem. |
| Q032 — AMIZADES POTENCIALMENTE SENSÍVEIS | Decisão delegada | SENSITIVE_FRIENDSHIP = sim | Exige amizade próxima para a qual a avaliação de limites faça sentido, sem dedução por gênero ou orientação. |
| Q033 — INTIMIDADE EMOCIONAL COM TERCEIRO | Decisão delegada | Sempre aplicável | Postura sobre apoio e intimidade emocional, incluindo possibilidade de desenvolver uma troca reservada. |
| Q034 — TRANSPARÊNCIA FINANCEIRA | Decisão delegada | Sempre aplicável | Transparência financeira inclui ausência de renda, dívidas e recursos administrados por terceiros. |
| Q035 — DÍVIDAS | Decisão delegada | Sempre aplicável | Postura sobre crédito e dívida; não exige dívida existente nem autorização de crédito. |
| Q036 — GASTOS PESSOAIS | Decisão delegada | Sempre aplicável | Preferência de gastos pessoais; renda zero ou ausência de compras não exclui a avaliação. |
| Q037 — RESERVA FINANCEIRA | Decisão delegada | Sempre aplicável | Preferência sobre eventual sobra financeira; não exige existir sobra no período. |
| Q038 — ADMINISTRAÇÃO DO DINHEIRO | Decisão delegada | Sempre aplicável | Preferência de participação na administração financeira, sem dedução pelo nível de renda. |
| Q039 — ACOMPANHAMENTO DO ORÇAMENTO | Decisão delegada | Sempre aplicável | Grau de acompanhamento do orçamento, inclusive pouca participação e ausência de renda própria. |
| Q040 — AJUDA FINANCEIRA A TERCEIROS | Decisão delegada | Sempre aplicável | Postura sobre ajuda a terceiros; não exige pedido atual nem disponibilidade financeira. |
| Q041 — MODELO FINANCEIRO | Decisão delegada | Sempre aplicável | Preferência de modelo financeiro para todos os participantes, inclusive sem renda própria. |
| Q042 — DIFERENÇA DE RENDA | Decisão delegada | Sempre aplicável | Visão sobre diferença de renda; não exige desigualdade atual nem remuneração dos dois. |
| Q043 — CRISE FINANCEIRA | Decisão delegada | Sempre aplicável | Postura diante de eventual crise financeira; a resposta não comprova desemprego ou emergência. |
| Q044 — TAREFAS DOMÉSTICAS | Decisão delegada | SHARED_DOMESTIC_RESPONSIBILITIES = sim | Avalia participação real em tarefas domésticas sob responsabilidade do casal, inclusive terceirizadas. |
| Q045 — CARGA MENTAL | Decisão delegada | Sempre aplicável | Carga mental inclui organização da vida comum mesmo sem filhos ou domicílio compartilhado. |
| Q046 — FILHOS | Decisão delegada | RESPONSABILIDADE_PARENTAL = sim | Compila a instrução expressa da própria pergunta: sem responsabilidade parental, não aplicável. |
| Q047 — DIVERGÊNCIA SOBRE EDUCAÇÃO | Decisão delegada | RESPONSABILIDADE_PARENTAL = sim | Discordância sobre educação exige responsabilidade parental; não se presume pela existência de filhos do outro. |
| Q048 — TRABALHO E TEMPO PARA O CASAMENTO | Decisão delegada | PROFESSIONAL_ACTIVITY = sim | Avalia equilíbrio da atividade profissional existente; desemprego ou aposentadoria sem atividade não equivalem a limites bem estabelecidos. |
| Q049 — MUDANÇAS PROFISSIONAIS | Decisão delegada | Sempre aplicável | Postura sobre oportunidade profissional futura; não exige emprego ou oferta atual. |
| Q050 — APOIO AO CRESCIMENTO PROFISSIONAL | Decisão delegada | Sempre aplicável | Postura sobre apoiar desenvolvimento do cônjuge, inclusive projeto futuro. |
| Q051 — FREQUÊNCIA SEXUAL | Decisão delegada | Sempre aplicável | Compara frequência atual e desejada; frequência zero é uma realidade avaliável e não implica inaplicabilidade. |
| Q052 — INICIATIVA PARA A INTIMIDADE SEXUAL | Decisão delegada | SEXUAL_INITIATIVE_IN_PERIOD = sim | Distribuição de iniciativa exige alguma aproximação no período; ausência total não será descrita como equilíbrio. |
| Q053 — REAÇÃO DIANTE DA RECUSA SEXUAL | Decisão delegada | PARTNER_DECLINED_IN_PERIOD = sim | A pergunta pede reação real à indisponibilidade do cônjuge; não solicitar reação inventada quando a situação não ocorreu. |
| Q054 — O QUE MAIS FAVORECE SEU DESEJO E SUA DISPONIBILIDADE PARA A INTIMIDADE? | Decisão delegada | Sempre aplicável | Preferência de condições que favorecem disponibilidade; não implica obrigação de desejo ou de contato. |
| Q055 — MOMENTO PROGRAMADO DE INTIMIDADE E RECONEXÃO | Decisão delegada | Sempre aplicável | Preferência de reservar momento de reconexão; não exige atividade sexual nem cria consentimento por ocasião. |
| Q056 — CARINHO FÍSICO NÃO SEXUAL | Decisão delegada | Sempre aplicável | Percepção de carinho não sexual; ausência de carinho já é contemplada pelas alternativas. |
| Q057 — SATISFAÇÃO COM A VIDA SEXUAL | Decisão delegada | Sempre aplicável | Satisfação com a vida sexual inclui períodos sem relações; não se presume satisfação pela ausência de atividade. |
| Q058 — COMUNICAÇÃO SOBRE DESEJOS, PREFERÊNCIAS E LIMITES | Decisão delegada | Sempre aplicável | Autoavaliação da liberdade de comunicar preferências e limites, mesmo sem atividade sexual recente. |
| Q059 — DIFERENÇA DE DESEJO SEXUAL ENTRE OS CÔNJUGES | Decisão delegada | DESIRE_DIFFERENCE_IN_PERIOD = sim | Exige diferença de desejo percebida; não infere diferença por gênero, frequência ou resposta do parceiro. |
| Q060 — PORNOGRAFIA E CONTEÚDO SEXUAL EXPLÍCITO | Decisão delegada | Sempre aplicável | Rastreio de consumo que contempla explicitamente não consumo; não usar filtro prévio de uso. |
| Q061 — PRAZER E RECIPROCIDADE NA INTIMIDADE | Decisão delegada | SEXUAL_CONTACT_IN_PERIOD = sim | Avaliar reciprocidade durante a intimidade exige experiência no período; não presume consentimento desse contato. |
| Q062 — DOR, DESCONFORTO OU LIMITAÇÃO DURANTE A INTIMIDADE | Decisão delegada | INTIMACY_DISCOMFORT_IN_PERIOD = sim | Comunicação real de desconforto exige ter vivido esse contexto; sua ausência não é habilidade de comunicar. |
| Q063 — PRIVACIDADE E AMBIENTE PARA A INTIMIDADE | Decisão delegada | Sempre aplicável | Condições de privacidade podem ser avaliadas mesmo quando impedem completamente a intimidade. |
| Q064 — CARINHO E CONEXÃO DEPOIS DA RELAÇÃO SEXUAL | Decisão delegada | Sempre aplicável | A pergunta solicita preferência após a intimidade; não exige episódio recente. |
| Q065 — VARIEDADE E NOVIDADES NA VIDA SEXUAL | Decisão delegada | Sempre aplicável | Postura sobre novidades e limites, sem exigir proposta ou prática específica. |
| Q066 — CORPO, AUTOIMAGEM E SENTIR-SE DESEJADO(A) | Decisão delegada | Sempre aplicável | Percepção atual de autoimagem e desejo, inclusive quando insegurança provoca evitação. |
| Q067 — MASTURBAÇÃO E IMPACTO NA VIDA CONJUGAL | Decisão delegada | Sempre aplicável | Contempla explicitamente ausência de masturbação; não filtrar por uso. |
| Q068 — SAÚDE SEXUAL E COMUNICAÇÃO DE DIFICULDADES | Decisão delegada | SEXUAL_DIFFICULTY_RELEVANT = sim | Avalia comunicação de dificuldade percebida; não exige diagnóstico nem dedução a partir de outras respostas. |
| Q069 — PLANEJAMENTO DA POSSIBILIDADE DE GRAVIDEZ | Fonte preservada | PREGNANCY_POSSIBLE = sim | Regra existente preservada integralmente. |
| Q070 — SEXUALIDADE DEPOIS DE CONFLITOS E MÁGOAS | Decisão delegada | INTIMACY_AFTER_CONFLICT = sim | Exige experiência ou consideração de intimidade em contexto de mágoa; não exige a realização de contato. |
| Q071 — ESPONTANEIDADE OU INTIMIDADE PROGRAMADA | Decisão delegada | Sempre aplicável | Preferência por espontaneidade ou planejamento, mesmo sem atividade sexual recente. |
| Q072 — SENTIR-SE DESEJADO(A) PELO CÔNJUGE | Decisão delegada | Sempre aplicável | Percepção de sentir-se desejado; ausência de demonstrações é parte do conteúdo avaliado. |
| Q073 — PRIVACIDADE SOBRE A VIDA SEXUAL DO CASAL | Decisão delegada | Sempre aplicável | Postura sobre privacidade íntima, incluindo possibilidade de compartilhamento; não exige exposição prévia. |
| Q074 — FANTASIAS, DESEJOS E PREFERÊNCIAS ÍNTIMAS | Decisão delegada | UNSPOKEN_INTIMATE_PREFERENCE = sim | Exige preferência ainda não conversada; não inventa um desejo nem obriga a revelar seu conteúdo. |
| Q075 — HIGIENE E PREPARAÇÃO PARA A INTIMIDADE | Decisão delegada | Sempre aplicável | Percepção de cuidados e conforto no casamento; dificuldades que inibem a intimidade continuam avaliáveis. |
| Q076 — PERÍODOS EM QUE A RELAÇÃO SEXUAL NÃO É POSSÍVEL OU RECOMENDÁVEL | Decisão delegada | TEMPORARY_SEXUAL_LIMITATION = sim | Exige período de impedimento; não deduz limitação por sexo, idade, diagnóstico ou frequência. |
| Q077 — GRAVIDEZ, PÓS-PARTO E MUDANÇAS TEMPORÁRIAS NA INTIMIDADE | Fonte preservada | PREGNANCY_POSTPARTUM_RELEVANT = sim | Regra existente preservada integralmente. |
| Q078 — MUDANÇAS DE DESEJO COM IDADE, HORMÔNIOS OU SAÚDE | Decisão delegada | SEXUAL_CHANGE_RELEVANT = sim | Exige mudança percebida, sem tornar idade, medicamento ou doença um diagnóstico automático. |
| Q079 — MELHOR PERÍODO PARA A INTIMIDADE | Decisão delegada | Sempre aplicável | Preferência de horário de aproximação; não exige relação sexual nem disponibilidade obrigatória. |
| Q080 — RETOMADA DA INTIMIDADE DEPOIS DE UM PERÍODO DE AFASTAMENTO | Decisão delegada | SEXUAL_DISTANCE_RELEVANT = sim | Retomada pressupõe afastamento após intimidade anterior; não impõe duração nem vontade de retomar. |
| Q081 — FIDELIDADE FÍSICA E EXCLUSIVIDADE SEXUAL | Decisão delegada | Sempre aplicável | Compreensão de fidelidade e riscos; não depende de atividade sexual atual ou confissão de evento. |
| Q082 — ROMANTISMO, SEDUÇÃO E CULTIVO DO DESEJO DENTRO DO CASAMENTO | Decisão delegada | Sempre aplicável | Autoavaliação de romantismo; ausência de iniciativas é prevista nas alternativas. |
| Q083 — QUEM RETOMA A APROXIMAÇÃO DEPOIS DE UMA RECUSA | Decisão delegada | OWN_DECLINE_IN_PERIOD = sim | Exige aproximação recusada pelo respondente, sem presumir retorno posterior do desejo. |
| Q084 — CONEXÃO ÍNTIMA DURANTE VIAGENS OU PERÍODOS DE DISTÂNCIA | Decisão delegada | PHYSICAL_DISTANCE_IN_PERIOD = sim | Avalia comportamento em dias de distância efetivamente vividos; não se inventa viagem ou afastamento. |
| Q085 — FOTOS, VÍDEOS E REGISTROS ÍNTIMOS DO CASAL | Decisão delegada | Sempre aplicável | Preferência sobre registros íntimos inclui recusa de produzi-los; não exige arquivo existente. |
| Q086 — SAÚDE SEXUAL E INFORMAÇÕES QUE PODEM AFETAR O CÔNJUGE | Decisão delegada | Sempre aplicável | Cenário expressamente hipotético sobre comunicação; não exige nem coleta diagnóstico. |
| Q087 — SEXO, CARINHO E INTIMIDADE COMO MOEDA DE TROCA | Decisão delegada | Sempre aplicável | Autoavaliação sobre uso de afeto e intimidade; falta legítima de vontade não exclui a pergunta nem comprova punição. |
| Q088 — COMO DAR E RECEBER FEEDBACK SOBRE A INTIMIDADE | Decisão delegada | SEXUAL_CONTACT_IN_PERIOD = sim | Comunicação de experiência íntima exige contato no período; não se presume consentimento nem satisfação. |
| Q089 — RESPONSABILIDADE PELA MELHORIA DA VIDA ÍNTIMA | Decisão delegada | Sempre aplicável | Postura sobre responsabilidade pela vida íntima; não exige crise comprovada. |
| Q090 — REVISÃO PERIÓDICA DA VIDA ÍNTIMA | Decisão delegada | Sempre aplicável | Preferência de revisão íntima explicitamente aplicável mesmo sem crise. |
| Q091 — CÔNJUGE E FAMÍLIA DE ORIGEM DIANTE DE UMA DIVERGÊNCIA | Decisão delegada | OWN_FAMILY_RELEVANT = sim | Exige vínculo ou influência da família de origem do respondente, sem exigir identificar familiares ou provar conflito. |
| Q092 — FREQUÊNCIA DE CONTATO E VISITAS ÀS FAMÍLIAS | Decisão delegada | FAMILY_CONTACT_RELEVANT = sim | Preferência de convivência familiar exige família presente ou contato concretamente previsto. |
| Q093 — VISITAS SEM AVISO E ACESSO À CASA DO CASAL | Decisão delegada | FAMILY_CONTACT_RELEVANT = sim | Preferência sobre visitas de familiares, inclusive futuras, sem obrigar reatar contato. |
| Q094 — FERIADOS, DATAS ESPECIAIS E DIVISÃO ENTRE AS FAMÍLIAS | Decisão delegada | FAMILY_CONTACT_RELEVANT = sim | Planejamento de datas com familiares exige contexto de convivência; não impõe celebrações nem contato. |
| Q095 — AJUDA FINANCEIRA A PAIS, SOGROS E FAMILIARES | Decisão delegada | FAMILY_SUPPORT_RELEVANT = sim | Postura sobre ajuda familiar quando esse apoio é contexto real ou possível; não exige renda disponível. |
| Q096 — CUIDADO DE PAIS IDOSOS, DOENTES OU DEPENDENTES | Decisão delegada | FAMILY_SUPPORT_RELEVANT = sim | Planejamento hipotético de cuidado de familiares; não exige familiar doente atualmente. |
| Q097 — QUANDO UM FAMILIAR DESRESPEITA O CÔNJUGE | Decisão delegada | OWN_FAMILY_RELEVANT = sim | Postura diante da própria família pressupõe vínculo ou influência atual; não exige declaração prévia de desrespeito. |
| Q098 — INTERFERÊNCIA DE AVÓS E FAMILIARES NA CRIAÇÃO DOS FILHOS | Fonte preservada | RESPONSABILIDADE_PARENTAL = sim | Regra existente preservada integralmente. |
| Q099 — EQUILÍBRIO ENTRE AS DUAS FAMÍLIAS | Decisão delegada | TWO_FAMILIES_RELEVANT = sim | Comparação entre duas famílias exige presença das duas no contexto; uma família ausente não equivale a desequilíbrio. |
| Q100 — MORADIA COM FAMILIARES OU PERMANÊNCIA PROLONGADA NA CASA | Decisão delegada | FAMILY_SUPPORT_RELEVANT = sim | Preferência sobre acolhimento de familiares pressupõe possibilidade concreta, sem exigir pedido atual ou concordância. |
| Q101 — MEDO DA REAÇÃO DO CÔNJUGE | Decisão delegada | Sempre aplicável | Pergunta de segurança disponível sem triagem de medo ou conflito; evitação por medo também é experiência válida. |
| Q102 — AMEAÇAS E INTIMIDAÇÃO | Decisão delegada | Sempre aplicável | Rastreio de ameaça com alternativa explícita de ausência; não condicionar a relato anterior. |
| Q103 — AGRESSÃO FÍSICA | Decisão delegada | Sempre aplicável | Rastreio de agressão disponível a todos; não depende de convivência presencial, conflito declarado ou autorização do parceiro. |
| Q104 — COERÇÃO SEXUAL | Decisão delegada | Sempre aplicável | Rastreio de coerção disponível mesmo sem relação sexual ou recusa verbal; nenhuma ausência de contexto será interpretada como segurança. |
| Q105 — DESTRUIÇÃO, OBJETOS E IMPEDIMENTO DE SAÍDA | Decisão delegada | Sempre aplicável | Rastreio de intimidação com ausência expressa; não exigir conflito ou dano previamente declarado. |
| Q106 — VIGILÂNCIA, LOCALIZAÇÃO E PERSEGUIÇÃO | Decisão delegada | Sempre aplicável | Controle e vigilância podem ocorrer sem celular próprio ou uso voluntário de localização; não filtrar por tecnologia. |
| Q107 — ISOLAMENTO DE AMIGOS E FAMILIARES | Decisão delegada | Sempre aplicável | Isolamento pode explicar a ausência atual de vínculos; não condicionar a ter amigos ou familiares próximos. |
| Q108 — CONTROLE FINANCEIRO ABUSIVO | Decisão delegada | Sempre aplicável | Controle financeiro pode ocorrer sem renda própria; não filtrar por emprego, conta ou recursos. |
| Q109 — TRABALHO, DOCUMENTOS E LIBERDADE DE LOCOMOÇÃO | Decisão delegada | Sempre aplicável | Restrição de liberdade pode impedir trabalho e estudo; não condicionar a exercê-los. |
| Q110 — FILHOS OU DEPENDENTES UTILIZADOS COMO INSTRUMENTO DE PRESSÃO | Fonte preservada | HAS_CHILDREN_OR_DEPENDENTS = sim | Regra existente preservada integralmente. |
| Q111 — Fé cristã na vida conjugal | Decisão delegada | CHRISTIAN_FAITH_PERSONAL = sim | As alternativas pressupõem fé cristã pessoal; não atribuir essa fé ao respondente pela religião do parceiro. |
| Q112 — ORAÇÃO DO CASAL | Decisão delegada | SHARED_PRAYER_RELEVANT = sim | As alternativas incluem valorizar oração compartilhada; não forçar essa posição em quem não a deseja. |
| Q113 — LEITURA BÍBLICA OU DEVOCIONAL EM CONJUNTO | Decisão delegada | SHARED_BIBLE_RELEVANT = sim | Todas as alternativas propõem frequência de prática cristã; exigir pertinência e vontade individual prévias. |
| Q114 — PARTICIPAÇÃO EM IGREJA OU COMUNIDADE CRISTÃ | Decisão delegada | CHRISTIAN_COMMUNITY_RELEVANT = sim | Todas as alternativas tratam de participação em comunidade cristã; não impor pertencimento ou frequência. |
| Q115 — DIFERENÇAS DE CONVICÇÃO OU PRÁTICA ESPIRITUAL | Decisão delegada | FAITH_DIFFERENCES_RELEVANT = sim | Diferenças espirituais podem incluir ausência de fé; não exige que os dois sejam cristãos. |
| Q116 — DÍZIMOS, OFERTAS E CONTRIBUIÇÕES RELIGIOSAS | Decisão delegada | RELIGIOUS_DONATIONS_RELEVANT = sim | As alternativas descrevem modelos de contribuição religiosa; não presume que todos desejem doar. |
| Q117 — MINISTÉRIO, SERVIÇO RELIGIOSO E TEMPO DA FAMÍLIA | Decisão delegada | RELIGIOUS_SERVICE_IN_PERIOD = sim | Avalia uso real de tempo em serviço religioso; ausência de serviço não equivale a bom equilíbrio ministerial. |
| Q118 — FORMAÇÃO ESPIRITUAL DOS FILHOS | Fonte preservada | RESPONSABILIDADE_PARENTAL = sim | Regra existente preservada integralmente. |
| Q119 — USO DA FÉ PARA CONTROLAR OU ENCERRAR DISCUSSÕES | Decisão delegada | Sempre aplicável | Controle religioso pode atingir pessoa sem fé ou prática religiosa; pergunta e complemento privado não recebem filtro de religião. |
| Q120 — REVISÃO E OBJETIVOS ESPIRITUAIS DO CASAL | Decisão delegada | SHARED_SPIRITUAL_REVIEW_RELEVANT = sim | Todas as alternativas fixam revisão espiritual; exigir aceitação individual dessa prática sem presumir consenso. |
| Q121 — CUIDADO PREVENTIVO COM A PRÓPRIA SAÚDE | Decisão delegada | Sempre aplicável | Autoavaliação de cuidado preventivo no período de dois anos da fonte; não depende de doença. |
| Q122 — SONO E DESCANSO | Decisão delegada | Sempre aplicável | Percepção de sono e descanso, inclusive limitações da rotina e problemas de saúde. |
| Q123 — ATIVIDADE FÍSICA E CUIDADO COM O CORPO | Decisão delegada | Sempre aplicável | A pergunta já considera atividade compatível com saúde e realidade; limitação não implica falta de compromisso. |
| Q124 — ALIMENTAÇÃO E ROTINA DA CASA | Decisão delegada | Sempre aplicável | Preferência sobre organização alimentar; não exige cozinhar nem realizar refeições conjuntas. |
| Q125 — APOIO QUANDO O CÔNJUGE ADOECE | Decisão delegada | PARTNER_ILLNESS_IN_PERIOD = sim | Avalia cuidado efetivo em doença ou incapacidade; não inventa experiência nem solicita diagnóstico do parceiro. |
| Q126 — SAÚDE EMOCIONAL E PEDIDO DE AJUDA | Decisão delegada | EMOTIONAL_DIFFICULTY_RELEVANT = sim | Avalia pedido de ajuda diante de dificuldade percebida; não presume saúde emocional nem exige diagnóstico. |
| Q127 — PRIVACIDADE E TRANSPARÊNCIA SOBRE SAÚDE | Decisão delegada | HEALTH_IMPACT_RELEVANT = sim | Exige questão de saúde com impacto na vida comum; preserva dados clínicos e privacidade individual. |
| Q128 — DESPESAS DE SAÚDE | Decisão delegada | Sempre aplicável | Postura sobre despesa imprevista de saúde, inclusive planejamento para eventual necessidade. |
| Q129 — LIMITAÇÃO PROLONGADA DE SAÚDE E REDISTRIBUIÇÃO DE RESPONSABILIDADES | Decisão delegada | Sempre aplicável | Modelo expressamente hipotético de redistribuição; não exige limitação de saúde atual. |
| Q130 — EMERGÊNCIAS E DECISÕES DE SAÚDE | Decisão delegada | Sempre aplicável | Preparação para emergências é pertinente sem doença atual; responder não autoriza compartilhar dados de saúde. |
| Q131 — FREQUÊNCIA DE LAZER DO CASAL | Decisão delegada | Sempre aplicável | Avalia lazer do casal, inclusive ausência de lazer; não depende de dinheiro ou viagem. |
| Q132 — LAZER INDIVIDUAL E AUTONOMIA | Decisão delegada | Sempre aplicável | Visão de autonomia e lazer individual, mesmo sem hobby atual. |
| Q133 — LAZER EM CASA OU FORA DE CASA | Decisão delegada | Sempre aplicável | Preferência de estilo de lazer, sem exigir acesso financeiro ou atividade atual. |
| Q134 — PLANEJAMENTO DE VIAGENS E FÉRIAS | Decisão delegada | Sempre aplicável | Preferência de planejamento de viagem futura; não exige férias, renda ou viagem marcada. |
| Q135 — ORÇAMENTO PARA LAZER E EXPERIÊNCIAS | Decisão delegada | Sempre aplicável | Postura sobre orçamento de lazer; falta de recursos não equivale a recusa ou inaplicabilidade. |
| Q136 — EXPERIMENTAR ATIVIDADES NOVAS | Decisão delegada | Sempre aplicável | Postura sobre novidades de lazer, sem exigir proposta já realizada. |
| Q137 — HOBBIES QUE CONSOMEM MUITO TEMPO | Decisão delegada | TIME_INTENSIVE_HOBBY = sim | Exige atividade com carga de tempo relevante, sem inferir prejuízo ou fixar limite arbitrário de horas. |
| Q138 — DIREITO AO DESCANSO SEM PRODUTIVIDADE | Decisão delegada | Sempre aplicável | Postura sobre descanso, inclusive quando há tarefas pendentes; não exige emprego. |
| Q139 — ANIVERSÁRIOS E DATAS IMPORTANTES DO CASAL | Decisão delegada | Sempre aplicável | Preferência de significado das datas; não exige celebração, data recente ou gasto. |
| Q140 — EXPERIÊNCIA OU VIAGEM ESPECIAL DO CASAL | Decisão delegada | Sempre aplicável | A própria pergunta condiciona a busca à realidade financeira e familiar; falta de recursos não impede declarar preferência. |
| Q141 — VISÃO DE FUTURO DO CASAMENTO | Decisão delegada | Sempre aplicável | Visão de futuro, inclusive ausência de planos; não exige projeto já definido. |
| Q142 — Projetos pessoais e necessidades familiares | Decisão delegada | Sempre aplicável | Postura sobre projetos pessoais e família, sem depender de trabalho, renda ou filhos. |
| Q143 — OBJETIVO PRINCIPAL DO CASAL PARA OS PRÓXIMOS ANOS | Decisão delegada | Sempre aplicável | Prioridade hipotética atual para os próximos anos, sem exigir recursos disponíveis. |
| Q144 — MUDANÇA DE CIDADE, ESTADO OU PAÍS | Decisão delegada | Sempre aplicável | Posição diante de mudança hipotética, sem exigir oferta ou autorização para mudar. |
| Q145 — PADRÃO DE VIDA OU MAIOR LIBERDADE FINANCEIRA | Decisão delegada | Sempre aplicável | Preferência sobre eventual aumento de renda; não exige aumento ocorrido. |
| Q146 — TER FILHOS OU AMPLIAR A FAMÍLIA | Decisão delegada | FAMILY_EXPANSION_RELEVANT = sim | Compila a pertinência prévia exigida pela fonte; dúvida, não desejar filhos ou impossibilidade de gravidez não bastam para excluir o tema. |
| Q147 — VIDA NA MATURIDADE E APOSENTADORIA | Decisão delegada | Sempre aplicável | Planejamento da maturidade em qualquer fase adulta; não filtrar por idade ou situação previdenciária. |
| Q148 — DISPOSIÇÃO PARA ASSUMIR RISCO EM GRANDES PROJETOS | Decisão delegada | Sempre aplicável | Postura diante de risco hipotético; não exige patrimônio, investimento ou negócio existente. |
| Q149 — ADIAR UM SONHO POR CAUSA DA FAMÍLIA | Decisão delegada | Sempre aplicável | Postura sobre adiamento de sonhos, sem exigir um adiamento atual comprovado. |
| Q150 — REVISÃO ANUAL DO PROJETO DE VIDA | Decisão delegada | Sempre aplicável | Preferência sobre revisão do projeto de vida, mesmo sem planejamento anterior. |
| Q151 — CONSUMO DE BEBIDA ALCOÓLICA | Decisão delegada | Sempre aplicável | Contempla ausência de consumo; não excluir abstêmios nem condicionar a segurança pela letra. |
| Q152 — COMPORTAMENTO QUANDO HÁ INTOXICAÇÃO | Fonte preservada | USES_INTOXICATING_SUBSTANCE = sim | Regra existente preservada integralmente. |
| Q153 — Substâncias e medicamentos | Decisão delegada | Sempre aplicável | Contempla ausência de uso; não exigir diagnóstico, consumo declarado ou opinião sobre legalidade para exibir. |
| Q154 — APOSTAS E JOGOS ENVOLVENDO DINHEIRO | Decisão delegada | Sempre aplicável | Aplica a todos, inclusive quem não aposta; a proibição fixa não depende do consumo nem da letra. |
| Q155 — COMPRAS POR IMPULSO | Decisão delegada | Sempre aplicável | Postura sobre compra não essencial, sem exigir compra efetuada ou renda própria. |
| Q156 — JOGOS ELETRÔNICOS E ENTRETENIMENTO DIGITAL | Decisão delegada | DIGITAL_ENTERTAINMENT_IN_PERIOD = sim | Todas as alternativas pressupõem uso de entretenimento digital; não usar A para quem não utilizou. |
| Q157 — USO EXCESSIVO DE CELULAR E REDES SOCIAIS | Decisão delegada | NONWORK_DIGITAL_USE = sim | O enunciado exclui necessidades profissionais; exige algum uso não profissional no período. |
| Q158 — ESCONDER OU MENTIR SOBRE UM HÁBITO | Decisão delegada | Sempre aplicável | Autoavaliação de transparência sobre hábitos; não exige identificar hábito nem revelar conteúdo privado. |
| Q159 — DIFICULDADE DE PARAR OU REDUZIR | Decisão delegada | HABIT_REDUCTION_ATTEMPT = sim | Avalia resultado real de tentativa de redução; ausência de tentativa não equivale a conseguir parar. |
| Q160 — DISPOSIÇÃO PARA TRATAR UM HÁBITO QUE ESTÁ PREJUDICANDO A FAMÍLIA | Decisão delegada | Sempre aplicável | Disposição diante de evidência de prejuízo, sem exigir diagnóstico ou comprovar um evento. |
| Q161 — CONSISTÊNCIA DAS REGRAS PARA OS FILHOS | Fonte preservada | RESPONSABILIDADE_PARENTAL = sim | Regra existente preservada integralmente. |
| Q162 — CORREÇÃO SEM HUMILHAÇÃO OU VIOLÊNCIA | Fonte preservada | RESPONSABILIDADE_PARENTAL = sim | Regra existente preservada integralmente. |
| Q163 — CELULAR, INTERNET E TELAS DOS FILHOS | Fonte preservada | RESPONSABILIDADE_PARENTAL = sim | Regra existente preservada integralmente. |
| Q164 — HORÁRIO DE DORMIR E ROTINA DOS FILHOS | Fonte preservada | RESPONSABILIDADE_PARENTAL = sim | Regra existente preservada integralmente. |
| Q165 — ESCOLA, ESTUDOS E ACOMPANHAMENTO | Fonte preservada | RESPONSABILIDADE_PARENTAL = sim | Regra existente preservada integralmente. |
| Q166 — TAREFAS DOMÉSTICAS E RESPONSABILIDADES DOS FILHOS | Fonte preservada | RESPONSABILIDADE_PARENTAL = sim | Regra existente preservada integralmente. |
| Q167 — DINHEIRO, MESADA E EDUCAÇÃO FINANCEIRA DOS FILHOS | Fonte preservada | RESPONSABILIDADE_PARENTAL = sim | Regra existente preservada integralmente. |
| Q168 — ESPORTES, CURSOS E ATIVIDADES EXTRACURRICULARES | Fonte preservada | RESPONSABILIDADE_PARENTAL = sim | Regra existente preservada integralmente. |
| Q169 — SAÚDE DOS FILHOS E DECISÕES IMPORTANTES | Fonte preservada | RESPONSABILIDADE_PARENTAL = sim | Regra existente preservada integralmente. |
| Q170 — FOTOS, VÍDEOS E EXPOSIÇÃO DOS FILHOS NAS REDES SOCIAIS | Fonte preservada | RESPONSABILIDADE_PARENTAL = sim | Regra existente preservada integralmente. |
| Q171 — VIDA SOCIAL SEM O CÔNJUGE | Decisão delegada | Sempre aplicável | Visão sobre autonomia social, mesmo sem saídas recentes; ausência de saídas pode decorrer de controle. |
| Q172 — AMIZADES DO CASAL | Decisão delegada | Sempre aplicável | Preferência de amizades compartilhadas; a própria alternativa C contempla ausência de convivência. |
| Q173 — INFLUÊNCIA DE AMIGOS NAS DECISÕES DO CASAL | Decisão delegada | Sempre aplicável | Postura sobre influência de terceiros, sem exigir identificar amigo ou comprovar opinião recebida. |
| Q174 — VISITAS DE AMIGOS À CASA | Decisão delegada | Sempre aplicável | Preferência sobre receber visitas, inclusive futuras; não exige visita recente ou casa própria. |
| Q175 — EVENTOS SOCIAIS NOTURNOS OU DE LONGA DURAÇÃO SEM O CÔNJUGE | Decisão delegada | Sempre aplicável | Postura diante de evento social possível; não exige convite atual ou atividade profissional. |
| Q176 — COMO VOCÊ REAGE QUANDO PERCEBE QUE O CASAMENTO ESTÁ MAL | Decisão delegada | Sempre aplicável | Autoavaliação de postura diante de desgaste; não comprova crise atual nem exclui casais estáveis. |
| Q177 — AFASTAMENTO TEMPORÁRIO DURANTE CRISE | Decisão delegada | Sempre aplicável | Visão sobre pausas em conflitos; não exige afastamento e não autoriza retomada em situação insegura. |
| Q178 — BUSCAR AJUDA EXTERNA PARA O CASAMENTO | Decisão delegada | Sempre aplicável | Disposição para ajuda externa, sem exigir tratamento ou crise atual. |
| Q179 — Uso da separação durante conflitos | Decisão delegada | Sempre aplicável | Autoavaliação do uso de separação em conflitos, sem exigir intenção ou ameaça prévia. |
| Q180 — PROBLEMA IMPORTANTE QUE PERMANECE SEM SOLUÇÃO | Decisão delegada | UNRESOLVED_REPEATED_PROBLEM = sim | Exige problema atual discutido repetidamente; não se presume falha de resolução a partir de letras. |
| Q181 — DEPOIS DE UMA QUEBRA GRAVE DE CONFIANÇA | Decisão delegada | KNOWN_TRUST_BREACH = sim e REBUILDING_CHOSEN = sim + revisão privada segura vinculada às respostas | A fonte exige histórico relevante já conhecido, decisão de reconstruir e abordagem segura. Os dois contextos são privados; a liberação de segurança não pode ser autodeclarada e aguarda PEND-06/PEND-14. |
| Q182 — RECONHECER MELHORAS DO CÔNJUGE | Decisão delegada | PARTNER_CHANGE_ATTEMPT = sim | Reconhecimento de melhora exige tentativa concreta percebida; não inventa esforço ou progresso. |
| Q183 — MANTER O CASAMENTO APENAS NO “AUTOMÁTICO” | Decisão delegada | Sempre aplicável | Avalia cuidado intencional nos 12 meses da fonte, inclusive sua ausência; não exige filhos ou trabalho. |
| Q184 — O QUE FAZER QUANDO O CASAL PERCEBE REGRESSÃO | Decisão delegada | REGRESSION_IN_PERIOD = sim | Avalia reação a melhora seguida de regressão; sem essa sequência não se inventa experiência. |
| Q185 — REVISÃO GERAL DO CONTRATO DE CASAMENTO | Decisão delegada | Sempre aplicável | Preferência de revisão futura do instrumento; não exige contrato anterior. |
| Q186 — CLAREZA SOBRE LIMITES INACEITÁVEIS | Decisão delegada | Sempre aplicável | Clareza atual de limites, inclusive dificuldade de estabelecê-los; não exigir violência prévia. |
| Q187 — Apoio diante de luto ou perda | Decisão delegada | PARTNER_LOSS_RELEVANT = sim | Apoio real em perda ou sofrimento exige esse contexto; luto em curso não tem prazo arbitrário de validade. |
| Q188 — REPARAR UM PREJUÍZO CONCRETO | Decisão delegada | CONCRETE_HARM_RELEVANT = sim | Avalia reparação diante de prejuízo concreto ou consequências atuais; não presume dívida ou culpa de um evento. |
| Q189 — PERDÃO E RECONSTRUÇÃO DA CONFIANÇA | Decisão delegada | FORGIVENESS_RELEVANT = sim | Avalia experiência de erro e pedido de perdão; não exige perdão concedido ou confiança restaurada. |
| Q190 — REPETIÇÃO DE UM DESCUMPRIMENTO IMPORTANTE | Decisão delegada | REPEATED_COMMITMENT_BREACH = sim | Exige repetição de descumprimento e tentativas de correção; não ativa sanções nem comprova evento por si só. |
| Q191 — RESPONSABILIDADE PELO PRÓPRIO COMPORTAMENTO | Decisão delegada | Sempre aplicável | Autoavaliação de responsabilidade própria, sem atribuição automática de culpa por conflitos ou violência. |
| Q192 — TRANSFORMAR PROMESSA EM MUDANÇA | Decisão delegada | Sempre aplicável | Autoavaliação de transformar intenção em ação; não exige promessa formal ou prova de descumprimento. |
| Q193 — RECEBER FEEDBACK DEPOIS QUE A SITUAÇÃO JÁ PASSOU | Decisão delegada | Sempre aplicável | Postura ao receber feedback posterior, sem exigir reclamação recente. |
| Q194 — QUANDO EXISTEM MUITOS PROBLEMAS AO MESMO TEMPO | Decisão delegada | Sempre aplicável | Estratégia expressamente hipotética para múltiplos problemas; não exige crise atual. |
| Q195 — PRINCÍPIO ESSENCIAL OU PREFERÊNCIA PESSOAL | Decisão delegada | Sempre aplicável | Autoavaliação de princípios e preferências, sem depender de um conflito específico. |
| Q196 — PERCEPÇÃO ATUAL DO ESTADO DO CASAMENTO | Decisão delegada | Sempre aplicável | Diagnóstico privado da percepção atual do casamento, para todos os participantes. |
| Q197 — PERCEPÇÃO DE ESFORÇO DOS DOIS | Decisão delegada | Sempre aplicável | Diagnóstico privado de esforço percebido, inclusive ausência de esforço dos dois. |
| Q198 — CONFIANÇA NA DISPOSIÇÃO DO CÔNJUGE PARA MUDAR | Decisão delegada | Sempre aplicável | Diagnóstico privado da disposição percebida do parceiro, sem compartilhar a resposta ou inferir aceite dele. |
| Q199 — USAR O CONTRATO COMO GUIA OU COMO ARMA | Decisão delegada | Sempre aplicável | Intenção de uso futuro do instrumento, sem exigir contrato pronto. |
| Q200 — DISPOSIÇÃO REAL PARA O PRÓXIMO CICLO DO CASAMENTO | Decisão delegada | Sempre aplicável | Disposição individual para o próximo ciclo, inclusive dúvida e resistência; não presume consentimento para avaliação. |

## Contextos exibidos somente ao respondente

| Identificador | Pergunta de contexto | Orientação |
|---|---|---|
| PREGNANCY_POSSIBLE | A possibilidade de gravidez é pertinente à realidade de vocês? | Considere se uma relação entre vocês pode resultar em gravidez. Não informe exames, diagnósticos ou métodos utilizados. |
| PREGNANCY_POSTPARTUM_RELEVANT | Gravidez ou pós-parto, atuais ou futuros, são pertinentes à realidade de vocês? | Inclua a possibilidade futura desse período, conforme a regra original. Não é necessário informar detalhes de saúde. |
| RESPONSABILIDADE_PARENTAL | Você exerce responsabilidade parental? | Considere cuidado e educação de filhos, inclusive adotivos, enteados ou sob sua responsabilidade. Não depende de vínculo biológico ou de morar na mesma casa; não informe nomes nem idades. |
| HAS_CHILDREN_OR_DEPENDENTS | Há filhos ou dependentes envolvidos na sua vida familiar? | Inclua dependentes envolvidos na relação familiar, mesmo sem responsabilidade parental formal ou residência conjunta. Não informe dados deles. |
| USES_INTOXICATING_SUBSTANCE | Houve consumo de álcool ou outra substância capaz de produzir intoxicação no período de referência? | O contexto é o consumo, mesmo sem embriaguez. Não informe qual substância, quantidade, prescrição ou diagnóstico. |
| EX_CONTACT_RELEVANT | Contato com ex-relacionamento ou antigo interesse é uma situação presente ou concretamente prevista na sua realidade? | Inclua contato necessário por filhos ou trabalho. Não é preciso identificar ninguém; ter tido um relacionamento no passado, sozinho, não obriga a responder. |
| PERSONAL_PHONE_USE | Você usa um celular pessoal no período de referência? | A resposta não autoriza acesso ao aparelho, às mensagens ou às senhas. |
| DIGITAL_CONVERSATIONS | Conversas por mensagens ou redes sociais fazem parte da sua realidade? | Não é necessário declarar interesse por alguém nem identificar interlocutores. A pergunta trata dos limites dessas conversas. |
| SOCIAL_PUBLISHING | Você publica ou considera publicar conteúdo sobre o casamento em redes sociais? | Inclua publicações feitas por outra pessoa a seu pedido. Não publicar nem considerar publicações torna este tema inaplicável. |
| SENSITIVE_FRIENDSHIP | Há uma amizade próxima na sua realidade para a qual faz sentido avaliar limites afetivos ou sexuais? | Não informe identidade, gênero ou detalhes da amizade. Isso não declara envolvimento nem quebra de confiança. |
| SHARED_DOMESTIC_RESPONSIBILITIES | Há tarefas domésticas pelas quais vocês têm responsabilidade? | Inclua tarefas realizadas por terceiros ou distribuídas entre residências. Morar separado não implica, por si só, ausência de responsabilidades. |
| PROFESSIONAL_ACTIVITY | Você exerce trabalho ou atividade profissional no período de referência? | Inclua trabalho formal, informal, autônomo e atividade profissional não remunerada. A renda não determina a aplicabilidade. |
| SEXUAL_INITIATIVE_IN_PERIOD | Houve alguma iniciativa ou aproximação sexual entre vocês nos últimos 90 dias? | Inclua aproximação que não terminou em relação sexual ou que foi recusada. Este contexto não indica consentimento. |
| PARTNER_DECLINED_IN_PERIOD | Nos últimos 90 dias, houve situação em que você desejou intimidade e seu cônjuge não desejou naquele momento? | Considere qualquer indicação de que não queria, inclusive sem uma recusa verbal. Não informe detalhes do episódio. |
| DESIRE_DIFFERENCE_IN_PERIOD | Você percebeu diferença de desejo sexual entre vocês no período de referência? | Inclua ausência de desejo de uma pessoa. Não é necessário que tenha havido relação sexual. |
| SEXUAL_CONTACT_IN_PERIOD | Houve alguma forma de intimidade sexual entre vocês nos últimos 90 dias? | Considere também contato indesejado. Informar esse contexto não declara consentimento nem autoriza nova aproximação. |
| INTIMACY_DISCOMFORT_IN_PERIOD | Você sentiu dor, desconforto físico ou emocional durante alguma forma de intimidade no período de referência? | Não informe diagnóstico, prática ou detalhes. As perguntas de segurança continuam disponíveis independentemente deste contexto. |
| SEXUAL_DIFFICULTY_RELEVANT | Você percebe alguma dificuldade física, emocional ou funcional afetando sua vida sexual no período de referência? | Considere dificuldade atual ou vivenciada no período, sem precisar de diagnóstico ou informar sua natureza. |
| INTIMACY_AFTER_CONFLICT | No período de referência, você considerou ou viveu intimidade enquanto uma discussão ou mágoa ainda não estava resolvida? | A intimidade não precisa ter ocorrido. Não é necessário descrever o conflito. |
| UNSPOKEN_INTIMATE_PREFERENCE | Há desejo, fantasia ou preferência íntima que você ainda não conversou claramente com seu cônjuge? | Informe somente se o contexto existe. Nenhum conteúdo desse desejo será solicitado neste campo. |
| TEMPORARY_SEXUAL_LIMITATION | Alguma circunstância impediu temporariamente a relação sexual no período de referência? | Inclua saúde, recuperação, tratamento, cansaço extremo ou outra limitação. Não solicite confirmação do cônjuge nem informe a causa. |
| SEXUAL_CHANGE_RELEVANT | Mudanças relacionadas a idade, hormônios, medicamentos ou saúde afetaram o desejo ou a resposta sexual de algum de vocês? | Considere mudanças atuais ou do período de referência, sem inferir pela idade e sem informar medicamentos ou diagnósticos. |
| SEXUAL_DISTANCE_RELEVANT | Há ou houve no período de referência um afastamento sexual prolongado depois de uma fase de intimidade entre vocês? | Considere o que é prolongado na sua experiência, sem um número imposto de dias. Responder sim não significa desejar ou consentir com a retomada. |
| OWN_DECLINE_IN_PERIOD | Você recusou alguma aproximação íntima do seu cônjuge no período de referência? | Inclua indicação verbal ou não verbal de que não desejava. A recusa não gera obrigação de retomar a intimidade. |
| PHYSICAL_DISTANCE_IN_PERIOD | Vocês passaram alguns dias fisicamente separados no período de referência? | Inclua viagem, trabalho ou outra circunstância. Não informe motivo, local ou itinerário. |
| OWN_FAMILY_RELEVANT | Sua família de origem tem convivência ou influência na sua vida conjugal atual? | Inclua pessoas que exerceram esse papel familiar. Ausência de contato não impede responder se ainda houver influência relevante; não é necessário retomar contato. |
| FAMILY_CONTACT_RELEVANT | A convivência com alguma das famílias de origem é presente ou concretamente prevista na vida de vocês? | Considere a família de qualquer um dos dois e pessoas que exerceram esse papel. Não é necessário reatar vínculos rompidos. |
| FAMILY_SUPPORT_RELEVANT | Apoio financeiro, cuidado ou acolhimento de familiares é uma situação presente ou concretamente possível para vocês? | Não exige pedido atual de ajuda nem concordância em ajudar. Não informe nome, renda, doença ou condição do familiar. |
| TWO_FAMILIES_RELEVANT | As duas famílias de origem estão presentes nas relações ou responsabilidades atuais de vocês? | Só é possível comparar a distribuição entre duas famílias quando ambas fazem parte do contexto. Considere vínculos e responsabilidades mesmo à distância. |
| CHRISTIAN_FAITH_PERSONAL | A fé cristã faz parte da sua vivência pessoal? | A resposta é individual; a fé do cônjuge não define a sua. Não ter essa vivência torna a pergunta inaplicável, sem presumir uma resposta sobre sua fé. |
| SHARED_PRAYER_RELEVANT | Orar em casal é uma prática que você vive ou vê valor em construir voluntariamente? | Não praticar atualmente é diferente de não desejar essa prática. Nenhuma resposta autoriza imposição religiosa. |
| SHARED_BIBLE_RELEVANT | Você deseja ou aceita voluntariamente ter leitura bíblica, devocional ou estudo cristão em conjunto? | As três alternativas escolhem uma frequência. Se você não deseja essa prática, não será obrigado a escolher uma frequência mínima. |
| CHRISTIAN_COMMUNITY_RELEVANT | Participar de igreja ou comunidade cristã em casal é algo que você deseja ou aceita voluntariamente? | Não exige presença atual, filiação a uma igreja ou concordância do cônjuge. |
| FAITH_DIFFERENCES_RELEVANT | Convicções ou práticas de fé fazem parte das diferenças ou decisões que vocês precisam considerar? | Inclua diferença entre fé e ausência de fé. Não depende de ambos professarem a mesma religião. A pergunta sobre controle religioso não depende deste campo. |
| RELIGIOUS_DONATIONS_RELEVANT | Doações religiosas que afetam o orçamento familiar são realizadas ou consideradas por você? | Não é necessário doar atualmente nem aceitar valor mínimo. Renda zero não torna o tema automaticamente inaplicável. |
| RELIGIOUS_SERVICE_IN_PERIOD | Você dedica tempo a atividades de igreja, ministério ou serviço religioso no período de referência? | Inclua serviço voluntário. Não informe instituição, função ou crença do cônjuge. |
| SHARED_SPIRITUAL_REVIEW_RELEVANT | Você deseja ou aceita voluntariamente revisar a vida espiritual em casal? | As três alternativas definem periodicidade. Ausência de interesse nessa prática não será convertida em uma frequência obrigatória. |
| PARTNER_ILLNESS_IN_PERIOD | Seu cônjuge esteve doente ou temporariamente incapacitado no período de referência? | Inclua situação ainda em curso. Não informe diagnóstico, tratamento ou dados de saúde do cônjuge. |
| EMOTIONAL_DIFFICULTY_RELEVANT | Você percebe dificuldade emocional afetando significativamente sua rotina ou relacionamento no período de referência? | Não exige diagnóstico. Informe apenas se esse contexto faz parte da sua experiência, sem descrever sintomas. |
| HEALTH_IMPACT_RELEVANT | Há ou houve questão de saúde sua com impacto direto na rotina, finanças ou responsabilidades do casal no período de referência? | Informe somente a existência do contexto. Isso não autoriza compartilhar sua informação de saúde. |
| TIME_INTENSIVE_HOBBY | Você tem hobby ou atividade pessoal que ocupa muitas horas da semana? | Considere sua rotina no período de referência. Não há um limite de horas criado pelo sistema, e o contexto não comprova prejuízo. |
| FAMILY_EXPANSION_RELEVANT | Ter filhos ou ampliar a família é um tema pertinente ao projeto de vida de vocês? | Inclua dúvidas, divergência ou a posição de não querer filhos. Não depende de fertilidade, idade ou já ter filhos; considere também outras formas de ampliar a família. Marque não somente se o tema não fizer parte da realidade nem do projeto de vida de vocês. |
| DIGITAL_ENTERTAINMENT_IN_PERIOD | Você usou jogos eletrônicos, streaming ou entretenimento digital nos últimos 90 dias? | Inclua uso ocasional. Não informe aplicativos, histórico ou tempo de uso. |
| NONWORK_DIGITAL_USE | Você usou celular ou redes sociais fora das necessidades de trabalho nos últimos 90 dias? | Inclua uso ocasional. Ter um aparelho exclusivamente profissional não basta para esta pergunta. |
| HABIT_REDUCTION_ATTEMPT | Você tentou reduzir ou parar um hábito prejudicial no período de referência, ou ainda vive as consequências de uma tentativa relevante? | Não é necessário identificar o hábito. A resposta não é diagnóstico e não cria um evento de recaída. |
| UNRESOLVED_REPEATED_PROBLEM | Há um problema importante atual que vocês já conversaram diversas vezes sem conseguir resolver? | Não informe o tema nem o conteúdo das conversas. A existência desse contexto não dispara um protocolo por si só. |
| KNOWN_TRUST_BREACH | Há histórico relevante de quebra grave de confiança já conhecido pelos dois? | Não revele conteúdo desconhecido pelo cônjuge. Este contexto permanece privado e não será usado como aviso ao outro. |
| REBUILDING_CHOSEN | Vocês decidiram voluntariamente tentar reconstruir o relacionamento após essa quebra de confiança? | Informe sua percepção dessa decisão, sem presumir concordância do outro. A abordagem ainda depende de revisão privada de segurança; este campo não a substitui. |
| PARTNER_CHANGE_ATTEMPT | Você percebe uma tentativa concreta atual ou recente do seu cônjuge de corrigir um comportamento que causava conflito? | Não é necessário considerar o problema resolvido, perdoar ou retomar confiança. Não informe o comportamento. |
| REGRESSION_IN_PERIOD | Uma melhora alcançada começou a desaparecer ou um problema antigo voltou no período de referência? | Não informe o problema. Este contexto não define gravidade, culpa ou prazo de intervenção. |
| PARTNER_LOSS_RELEVANT | Seu cônjuge atravessa ou atravessou no período de referência uma perda ou sofrimento importante? | Inclua luto ainda em curso, mesmo iniciado antes do período. Não há prazo imposto de recuperação e não é necessário informar a perda. |
| CONCRETE_HARM_RELEVANT | Alguma atitude sua produziu prejuízo concreto ao cônjuge ou à família no período de referência, ou deixou consequências ainda presentes? | Não informe valores nem detalhes. O contexto não comprova dívida nem autoriza cobrança. |
| FORGIVENESS_RELEVANT | Há erro relevante com pedido de perdão cuja forma de tratamento ainda faz parte da sua experiência atual? | Inclua situações do período de referência ou com efeitos atuais. Não pressupõe aceitar o pedido, perdoar ou restaurar confiança. |
| REPEATED_COMMITMENT_BREACH | Há compromisso importante descumprido repetidamente apesar de conversas e tentativas de correção? | Considere situação atual ou com efeitos no período de referência. Não informe o compromisso; o campo não comprova recusa injustificada nem autoriza sanção. |
