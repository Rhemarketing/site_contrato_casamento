# Contrato de Casamento — arquivo-mestre 1.4.0

**Os 487 textos conjuntos antes ausentes estão concluídos e integrados.** As 1.200 combinações possuem ação registrada. A proibição integral de apostas com dinheiro permanece conforme a decisão do solicitante.

## Leitura recomendada

1. `05_TEXTOS_CONJUNTOS.md`: as 487 redações por pergunta e combinação.
2. `auditoria/PENDENCIAS.md`: requisitos funcionais restantes e decisões encerradas.
3. `01_ESPECIFICACAO_TECNICA.md`: funcionamento e integração.
4. `04_MATRIZ_DE_COMBINACOES.md`: ações, vínculos e dependências locais.
5. `dados/arquivo_mestre.json`: todas as coleções de programação, incluindo `joint_texts`.
6. `02_CATALOGO_DE_PERGUNTAS.md`: as 200 perguntas, com origem preservada.

## Redação encerrada

São 182 textos A+A, 169 B+B e 136 C+C. Cada um tem redação específica, ID, vínculo com a matriz, nomes estáveis e rastreabilidade. A decisão editorial foi delegada pelo solicitante; não é necessário pedir novamente que ele escolha ou aprove estes 487 textos.

O código deve selecionar o texto cadastrado, sem pedir a uma IA que o escreva durante a utilização. Respostas iguais não substituem a confirmação dos parâmetros de NÓS DECIDIMOS, o consentimento por ocasião ou a autorização de compartilhamento de dados.

## Integração e validação

As redações finais estão em `dados/textos_conjuntos.json`, campo `template`, e em `dados/componentes_saida.json`, campo `editorial_template`. O campo legado `template_candidate` contém a mesma redação para compatibilidade com o planejador. O estado editorial final é separado da ativação de produção: `contract_template` e `is_active` continuam sujeitos aos controles de integração.

O pacote permanece inativo para produção enquanto faltarem aplicabilidade, módulos funcionais completos e controles operacionais. A conclusão destes textos não implementa o site. A prova de admissão e seu resultado já estão implementados, conforme confirmação do usuário, e permanecem fora das pendências.

```bash
python3 programacao/validar_pacote.py
python3 -m unittest discover -s programacao -p 'test_*.py'
```

`programacao/planejar_combinacao.py` é referência interna de seleção de componentes, não um gerador público de contratos. O modo `--production` do validador continua sinalizando os requisitos restantes.
