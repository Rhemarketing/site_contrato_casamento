Perfeito. As correções da auditoria ficam **aplicadas e incorporadas à base canônica** antes da Pergunta 151.

# PACOTE CANÔNICO DE CORREÇÕES 6.0

## Perguntas 101–150

Este pacote complementa o **Pacote 5.0 das Perguntas 001–100**. A partir de agora, qualquer continuidade deve considerar a base **001–150 já corrigida**.

## 1. Segurança — Q101 a Q110

### Q101–Q110 — regra agregada

Uma resposta **A isolada** não poderá produzir uma declaração conjunta do tipo “ambos não praticam...”.

Criar:

`SEGURANCA_TODAS_A = SIM/NÃO`

A cláusula compartilhada positiva de segurança somente poderá ser gerada quando a combinação das respostas dos dois permitir essa conclusão.

Se houver B/C:

-  preservar privacidade; 
-  não revelar automaticamente quem respondeu; 
-  não abrir NÓS DECIDIMOS; 
-  não aplicar R$ 10; 
-  segurança prevalece sobre reconciliação ou confronto. 

---

### Q102 — definição de ameaça intimidatória

Passa a valer:

**“Para fins deste Método, ameaça intimidatória é a comunicação deliberada de uma consequência prejudicial utilizada para provocar medo e obter obediência, silêncio, submissão ou desistência de um limite legítimo.”**

Não será considerada automaticamente ameaça abusiva:

-  comunicar possibilidade real de separação; 
-  estabelecer limite legítimo; 
-  informar possível consequência jurídica; 
-  dizer que determinada situação poderá tornar a convivência inviável. 

---

### Q103 — estrangulamento

Qualquer relato de:

-  estrangulamento; 
-  sufocamento intencional; 
-  compressão deliberada do pescoço; 

gera automaticamente:

`ALERTA_SEGURANCA_CRITICO = SIM`

Mesmo se houver apenas um episódio relatado.

---

### Q106 — vigilância digital

Adicionar:

**“Consentimento para compartilhamento de senha, dispositivo ou localização poderá ser retirado posteriormente. Autorização concedida no passado não constitui consentimento permanente para vigilância.”**

---

### Q107 — isolamento

Adicionar:

**“Solicitar limite em relação a uma pessoa específica não será considerado automaticamente isolamento quando existir motivo concreto relacionado a segurança, fidelidade, assédio, ameaça ou comportamento objetivamente prejudicial.”**

Isolamento coercitivo será caracterizado principalmente por tentativa injustificada de:

-  destruir rede de apoio; 
-  impedir relações legítimas; 
-  controlar vínculos; 
-  produzir dependência; 
-  afastar sistematicamente a pessoa de familiares ou amigos confiáveis. 

---

### Q109 — alternativa A corrigida

**A)** Posso trabalhar, estudar, utilizar meus documentos e me deslocar livremente, respeitando os compromissos familiares legitimamente assumidos por nós.

---

### Q110 — proteção de filhos

Adicionar:

**“Não será considerada ameaça abusiva a comunicação de medida legítima destinada à proteção de criança ou dependente, inclusive procura por autoridade competente ou discussão responsável sobre guarda, convivência e segurança.”**

O alerta será aplicado quando filho/dependente for utilizado deliberadamente para:

-  provocar medo; 
-  obter submissão; 
-  punir; 
-  controlar. 

---

# 2. Fé e espiritualidade — Q111 a Q120

## Q111 — substituída

### Nova pergunta

**Pensando principalmente nos últimos 90 dias, quanto a fé cristã esteve presente de forma prática na vida e nas decisões do seu casamento?**

**A)** Esteve presente com frequência em decisões, conversas, valores e práticas do casal.

**B)** A fé é importante para mim, mas sua presença prática na rotina conjunta aconteceu de maneira irregular.

**C)** Minha fé tem sido vivida principalmente de forma individual, com pouca participação na rotina conjunta do casal.

### A

**{Nome} reconhece que a fé cristã possui presença prática em sua vida conjugal e compromete-se a continuar expressando-a principalmente através de amor, responsabilidade, fidelidade, verdade e serviço.**

### B

**{Nome} reconhece que a fé é importante, mas possui presença irregular na rotina conjunta, e manifesta disposição para construir práticas espirituais compatíveis com a realidade dos dois.**

### C

**{Nome} reconhece que atualmente vive sua espiritualidade principalmente de forma individual e compromete-se a respeitar a construção espiritual conjunta que o casal voluntariamente estabelecer.**

Essa passa a ser a **Q111 oficial**.

---

## Q112 — oração

NÓS DECIDIMOS corrigido:

**A)** Diariamente.

**B)** Pelo menos 3 vezes por semana.

**C)** Outra frequência consensualmente escolhida.

Campo:

`FREQUENCIA_ORACAO`

Texto C:

**“{Nome 1} e {Nome 2} escolheram reservar aproximadamente {frequência escolhida} para oração conjunta, respeitando situações em que um dos dois não esteja em condições de participar naquele momento.”**

---

## Q113 — Palavra/devocional

NÓS DECIDIMOS:

**A)** Pelo menos 3 vezes por semana.

**B)** Pelo menos 1 vez por semana.

**C)** Outra frequência consensualmente escolhida.

Campo:

`FREQUENCIA_DEVOCIONAL`

Texto C:

**“{Nome 1} e {Nome 2} escolheram compartilhar leitura bíblica, devocional ou reflexão cristã aproximadamente {frequência escolhida}.”**

---

## Q116 — dízimos/ofertas

Alternativa percentual passa a usar:

`PERCENTUAL_PLANEJADO`

Texto:

**“{Nome 1} e {Nome 2} decidiram planejar aproximadamente {percentual}% da RLF para contribuições religiosas regulares, sujeito à revisão sempre que houver alteração financeira relevante.”**

Nova regra:

**“Contribuição religiosa voluntariamente planejada não deverá justificar inadimplência deliberada de alimentação, moradia, saúde, necessidades dos filhos/dependentes ou obrigações financeiras já assumidas.”**

---

# Q119 — coerção espiritual

Passa a possuir **subpergunta obrigatória quando a resposta principal for B ou C**.

### Pergunta privada

**Quando essa utilização inadequada de argumentos espirituais acontece, qual situação mais representa sua experiência?**

**A)** Reconheço que principalmente eu faço ou já fiz isso.

**B)** Percebo que principalmente meu cônjuge faz ou já fez isso comigo.

**C)** Esse comportamento já aconteceu dos dois lados.

### A

`MODO_DE_SAIDA = DIAGNOSTICO_PRIVADO`

**“{Nome} reconhece que já utilizou argumentos espirituais de maneira capaz de pressionar ou reduzir a voz do cônjuge e compromete-se a interromper esse comportamento, substituindo imposição por diálogo e responsabilidade pessoal.”**

### B

`MODO_DE_SAIDA = DIAGNOSTICO_PRIVADO`

Se existir medo, submissão, ameaça ou controle:

`ALERTA_COERCAO_ESPIRITUAL = SIM`

e, conforme gravidade:

`ALERTA_SEGURANCA = SIM`

### C

Não presumir automaticamente responsabilidade equivalente.

O sistema cruzará as duas respostas individuais antes de decidir a saída compartilhada.

---

# 3. Saúde — Q121 a Q130

## Q126 — saúde emocional

Respostas **B/C não serão automaticamente transformadas em confissão nominal no contrato**.

Usar:

`MODO_DE_SAIDA = DIAGNOSTICO_PRIVADO`

O contrato poderá receber apenas a regra geral:

**“{Nome 1} e {Nome 2} reconhecem que dificuldades emocionais persistentes merecem cuidado responsável e que buscar ajuda adequada não deverá ser motivo de humilhação, desprezo ou acusação.”**

Se houver risco relacionado à integridade da pessoa ou de terceiros, prevalece o fluxo específico de segurança.

---

## Q128 — urgência de saúde

Substituir “urgência real” por:

**“situação percebida como urgente ou que, conforme orientação profissional disponível, não deva aguardar a decisão financeira ordinária.”**

Texto corrigido:

**“Em situação percebida como urgente ou que, conforme orientação profissional disponível, não deva aguardar a decisão financeira ordinária, o cuidado necessário poderá ser buscado antes da consulta financeira habitual. O ocorrido e seu impacto deverão ser comunicados ao cônjuge no mesmo dia ou em até 24 horas quando a situação impedir conversa anterior.”**

---

## Q130 — Registro Familiar de Emergência

Adicionar campos:

`COMPARTILHAMENTO_VOLUNTARIO = SIM`

`DATA_ATUALIZACAO`

### Regra de minimização

**“Somente informações necessárias para auxílio em eventual emergência deverão ser armazenadas. O sistema não deverá coletar informações clínicas adicionais apenas porque tecnicamente possui capacidade para armazená-las.”**

### Regra de controle

**“Cada pessoa poderá atualizar ou remover informações de saúde voluntariamente fornecidas para o Registro Familiar de Emergência, ressalvadas informações já necessárias em situação emergencial em andamento.”**

---

# 4. Lazer — Q131 a Q140

# Q131 — correção importante

A pergunta diagnóstica permanece:

**A)** Temos momentos de lazer juntos com frequência que considero satisfatória.

**B)** Temos algum lazer, mas gostaria que acontecesse mais vezes.

**C)** Raramente fazemos algo juntos apenas por prazer, descanso ou diversão.

Porém fica **eliminado o NÓS DECIDIMOS obrigatório** com frequência semanal/quinzenal/mensal.

### Nova regra

**“Quando qualquer dos cônjuges identificar insuficiência de lazer compartilhado, {Nome 1} e {Nome 2} procurarão utilizar parte dos Momentos de Qualidade já definidos na Pergunta 011 para descanso, diversão, passeio ou outra experiência agradável escolhida pelos dois.”**

Assim:

> Q011 define **quanto tempo de qualidade** o casal terá.

Q131 ajuda a definir **como parte desse tempo poderá ser utilizada**.

Não criamos dois calendários concorrentes.

---

# 5. Projeto de vida — Q141 a Q150

# Q142 — SUBSTITUÍDA DEFINITIVAMENTE

### Nova pergunta

**Quando seus projetos pessoais entram em contato com as necessidades da família, como você normalmente procura equilibrar as duas coisas?**

**A)** Procuro continuar desenvolvendo meus objetivos pessoais, conversando previamente sobre impactos importantes para a família.

**B)** Consigo adiar alguns projetos quando a fase familiar exige, desde que exista possibilidade de revisão futura.

**C)** Frequentemente coloco meus próprios objetivos em segundo plano e deixo de retomá-los, mesmo quando poderia voltar a conversar sobre eles.

### A

**{Nome} reconhece a importância de preservar seus objetivos pessoais sem tomar unilateralmente decisões que produzam impacto relevante sobre a família.**

### B

**{Nome} reconhece que alguns objetivos poderão precisar de adiamento temporário e compromete-se a estabelecer revisão quando um projeto importante for postergado.**

### C

**{Nome} reconhece tendência de deixar seus próprios projetos indefinidamente em segundo plano e compromete-se a comunicar sonhos e necessidades pessoais antes que renúncias silenciosas se transformem em frustração ou ressentimento.**

### A + C

**“{Nome A} possui maior iniciativa para preservar seus projetos pessoais, enquanto {Nome C} tende a deixá-los em segundo plano. Ambos comprometem-se a construir espaço legítimo para os objetivos dos dois, sem permitir que os sonhos de apenas uma pessoa dominem continuamente o projeto familiar.”**

### B + C

**“{Nome B} aceita adiamentos quando necessários, enquanto {Nome C} apresenta maior tendência a abandonar seus próprios projetos. Ambos comprometem-se a diferenciar adiamento temporário de renúncia indefinida e a revisar objetivos importantes quando as circunstâncias familiares se modificarem.”**

Essa substitui integralmente a Q142 anterior.

---

# Q143 — prioridade de 3 anos

Alternativa C passa a ser:

**C)** Desenvolver um projeto específico importante para nossa próxima fase de vida.

Campo:

`PROJETO_PRIORITARIO`

Exemplos internos:

-  profissional; 
-  empresarial; 
-  ministerial; 
-  educacional; 
-  saúde; 
-  mudança; 
-  construção; 
-  projeto familiar; 
-  outro. 

### Texto C

**“{Nome} demonstra preferência por priorizar nos próximos anos o desenvolvimento de um projeto específico importante para sua próxima fase de vida, reconhecendo que sua execução deverá ser compatibilizada com responsabilidades, recursos e demais objetivos do casal.”**

---

# Q146 — NOVO PROTOCOLO DE DIVERGÊNCIA REPRODUTIVA

Quando as respostas forem:

`A × C`

registrar:

`DIVERGENCIA_REPRODUTIVA_RELEVANTE = SIM`

### Não abrir NÓS DECIDIMOS imediatamente.

### Procedimento

**1.** Nenhuma tentativa deliberada de concepção enquanto não existir consenso.

**2.** Cada pessoa poderá explicar:

-  seu desejo; 
-  seus motivos; 
-  expectativas; 
-  preocupações; 
-  medos; 
-  impactos esperados. 

**3.** Nenhum dos dois receberá prazo para “ceder”.

**4.** Não haverá contribuição de R$ 10 pela ausência de consenso.

**5.** Não haverá voto, desempate ou decisão por maioria.

**6.** Se ambos considerarem útil, poderão buscar acompanhamento adequado.

**7.** O tema somente será novamente submetido a decisão conjunta quando ambos concordarem em retomá-lo ou quando surgir mudança significativa de circunstância.\*\*

### Texto estrutural

**“Ter ou não ter filho é decisão de impacto profundo e não poderá ser imposta através de pressão emocional, sexual, espiritual, financeira ou sabotagem contraceptiva.”**

---

# Q148 — proteção das reservas

Adicionar:

**“A aprovação conjunta de projeto de risco não autoriza automaticamente utilizar reserva familiar em valor capaz de reduzi-la abaixo do piso de segurança definido pelo casal. Qualquer exceção exigirá decisão financeira específica, consciente dos impactos.”**

Cruzamentos obrigatórios:

`Q148 × Q037 × Q043`

---

# 6. NOVO MECANISMO SISTÊMICO

# CALENDÁRIO UNIFICADO DE REVISÕES

Criar:

`TIPO_REVISAO`

`FREQUENCIA`

`DATA_PROXIMA`

`PODE_SER_COMBINADA`

`GATILHO_IMEDIATO`

### Regra

**“Revisões periódicas que vencerem no mesmo período poderão ser realizadas em uma única reunião do casal, desde que cada assunto mantenha seu próprio roteiro e registro.”**

Por exemplo:

# REVISÃO MENSAL DO CASAL

Pode incluir, conforme vencimento:

-  finanças; 
-  intimidade; 
-  espiritualidade; 
-  projetos; 
-  outras metas. 

### Não podem esperar essa revisão

Nunca deverão ser adiados até o calendário periódico:

-  violência; 
-  ameaça; 
-  coerção; 
-  risco de segurança; 
-  saúde urgente; 
-  crise financeira relevante; 
-  quebra grave de confiança; 
-  gatilho sexual/reconexão já acionado; 
-  situação com prazo específico de 24h ou 72h. 

Isso impede que o Método transforme o casamento em uma sequência exagerada de reuniões.

---

# 7. NOVO TESTE OBRIGATÓRIO PARA Q151 EM DIANTE

Toda nova pergunta deverá passar por estas verificações antes de ser incorporada:

### Teste 1 — eixo único

A/B/C precisam medir **uma dimensão compreensível**.

### Teste 2 — comportamento não contraditório

Uma alternativa nunca poderá conter:

> “faço X ou faço exatamente o contrário”.

### Teste 3 — contrato sem pergunta

Removendo mentalmente a pergunta original, o efeito contratual continua compreensensível?

### Teste 4 — privacidade

A resposta revela:

-  medo; 
-  segredo; 
-  infidelidade; 
-  sexualidade sensível; 
-  saúde; 
-  violência; 
-  coerção? 

Se sim, avaliar `MODO_DE_SAIDA`.

### Teste 5 — calendário

Estamos criando uma nova frequência quando poderíamos utilizar uma já existente?

### Teste 6 — protocolo

Estamos criando outro protocolo para uma situação já coberta?

Se sim, reutilizar o anterior.

### Teste 7 — NÓS DECIDIMOS

Existe escolha legítima dos dois?

Se não existe, não abrir.

### Teste 8 — R$ 10

Somente recusa injustificada em processo obrigatório, jamais como punição por problema substantivo.

---

# STATUS CANÔNICO

Com isso ficam aplicados:

**Pacote 5.0 — correções 001–100**

-

**Pacote 6.0 — correções 101–150**

Portanto, a base **001–150 está corrigida e liberada** para continuidade.

Podemos agora iniciar diretamente as **Perguntas 151 a 160**, já submetendo cada uma a esses testes antes de adicioná-la ao Método.