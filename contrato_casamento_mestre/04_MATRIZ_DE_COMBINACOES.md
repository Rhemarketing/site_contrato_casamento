# Matriz das combinações — versão 1.4.0

As 1.200 combinações possuem ação registrada. A Q154 segue proibição integral de apostas com dinheiro, conforme decisão do usuário.

**As 487 redações conjuntas antes ausentes estão concluídas.** Consulte `05_TEXTOS_CONJUNTOS.md` e `dados/textos_conjuntos.json`. Os textos são selecionados por ID; não há geração de redação em tempo de execução. A liberação funcional para produção permanece separada.

## Como executar

1. Validar pessoas, respostas e aplicabilidade; não transformar ausência ou inaplicabilidade em A.
2. Verificar segurança antes de selecionar qualquer conteúdo compartilhado.
3. Consultar a linha do par, preservando a pessoa que escolheu cada alternativa.
4. Carregar componentes, condição de decisão conjunta e eventos referenciados.
5. Tratar contexto desconhecido como desconhecido; não interpretar como falso ou consentimento.
6. Encaminhar para módulos privados quando exigido. Nenhuma resposta privada será revelada por um texto de combinação.
7. Bloquear componentes sem texto exato ou sem aprovação. A etapa de acordo sempre exige confirmação dos dois.

## Arquivos relacionados

- `dados/matriz_combinacoes.json`: seis registros por pergunta, ação, componentes, condições e bloqueios.
- `dados/componentes_saida.json`: 600 efeitos individuais e componentes de pares; textos-fonte separados da aprovação.
- `dados/condicoes_fluxo.json`: condições por pergunta, inclusive as decisões conjuntas.
- `dados/contextos_combinacoes.json`: fatos de contexto, com significado e origem.
- `dados/eventos_protocolos.json`: eventos separados das letras de resposta.
- `dados/perfis_combinacoes.json`: justificativa técnica por pergunta e referências de origem.
- `auditoria/decisoes_combinacoes_1_3_0.json`: histórico das ações na versão 1.3.0.
- `dados/textos_conjuntos.json`: redações finais, origem e IDs dos 487 textos.
- `auditoria/decisao_textos_conjuntos_1_4_0.json`: decisão editorial e invariantes preservadas.
- `programacao/planejar_combinacao.py`: planejamento interno com lógica de três valores; não gera contrato nem publica dados.

## Regras de consolidação

Textos específicos da pergunta prevalecem. Para respostas iguais, os 487 componentes antes ausentes agora possuem redação integral. A regra geral MERGE_EXACT_TEXT seleciona o componente vinculado; qualquer ausência futura deve bloquear sua emissão. Para respostas diferentes sem instrução adicional, o mapeamento técnico registra os efeitos individuais daquela pergunta, com as exceções de segurança, privacidade, decisão conjunta e protocolo explicitadas. Não existe fallback em tempo de execução.

Os 200 perfis são registros de consolidação técnica apoiados nas fontes; não significam 200 novas decisões editoriais aprovadas. Os textos originais e o histórico foram preservados.

## Limites ainda visíveis

As 1.200 combinações possuem ação registrada. A Q154 segue proibição integral de apostas com dinheiro, conforme decisão do usuário.
- Redação dos 487 componentes: concluída. As demais dependências permanecem visíveis por registro.
- Q130: falta resolver a interface do registro de emergência obrigatório com compartilhamento voluntário de dados.
- Q151 com B/C: a entrada é privada; o fluxo seguro para posterior decisão conjunta não está compilado.
- Q200 fora de AA: o plano moderado/leve ainda precisa de quantificação.
- Aplicabilidade, aprovação de componentes e integração com o site permanecem requisitos próprios.

## Matriz completa

| Pergunta | Par | Ação | Condição / vínculos | Pendências locais |
|---|---|---|---|---|
| Q001 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q001 | AB | Texto de compatibilização | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q001 | AC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q001 | BB | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q001 | BC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q001 | CC | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q002 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q002 | AB | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q002 | AC | Texto de compatibilização | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q002 | BB | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q002 | BC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q002 | CC | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q003 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q003 | AB | Texto de compatibilização | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q003 | AC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q003 | BB | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q003 | BC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q003 | CC | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q004 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q004 | AB | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q004 | AC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q004 | BB | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q004 | BC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q004 | CC | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q005 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q005 | AB | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q005 | AC | Texto de compatibilização | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q005 | BB | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q005 | BC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q005 | CC | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q006 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q006 | AB | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q006 | AC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q006 | BB | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q006 | BC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q006 | CC | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q007 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q007 | AB | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q007 | AC | Texto de compatibilização | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q007 | BB | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q007 | BC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q007 | CC | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q008 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q008 | AB | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q008 | AC | Texto de compatibilização | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q008 | BB | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q008 | BC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q008 | CC | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q009 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q009 | AB | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q009 | AC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q009 | BB | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q009 | BC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q009 | CC | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q010 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q010 | AB | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q010 | AC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q010 | BB | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q010 | BC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q010 | CC | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q011 | AA | Texto conjunto exato | ND-Q011-01, COND-Q011 | Redação concluída; ativação separada |
| Q011 | AB | Manter efeitos individuais | ND-Q011-01, COND-Q011 | Sem pendência local identificada; aguarda liberação geral |
| Q011 | AC | Manter efeitos individuais | ND-Q011-01, COND-Q011 | Sem pendência local identificada; aguarda liberação geral |
| Q011 | BB | Texto conjunto exato | ND-Q011-01, COND-Q011 | Redação concluída; ativação separada |
| Q011 | BC | Manter efeitos individuais | ND-Q011-01, COND-Q011 | Sem pendência local identificada; aguarda liberação geral |
| Q011 | CC | Texto conjunto exato | ND-Q011-01, COND-Q011 | Redação concluída; ativação separada |
| Q012 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q012 | AB | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q012 | AC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q012 | BB | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q012 | BC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q012 | CC | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q013 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q013 | AB | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q013 | AC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q013 | BB | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q013 | BC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q013 | CC | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q014 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q014 | AB | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q014 | AC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q014 | BB | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q014 | BC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q014 | CC | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q015 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q015 | AB | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q015 | AC | Texto de compatibilização | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q015 | BB | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q015 | BC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q015 | CC | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q016 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q016 | AB | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q016 | AC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q016 | BB | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q016 | BC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q016 | CC | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q017 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q017 | AB | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q017 | AC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q017 | BB | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q017 | BC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q017 | CC | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q018 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q018 | AB | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q018 | AC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q018 | BB | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q018 | BC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q018 | CC | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q019 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q019 | AB | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q019 | AC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q019 | BB | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q019 | BC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q019 | CC | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q020 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q020 | AB | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q020 | AC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q020 | BB | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q020 | BC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q020 | CC | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q021 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q021 | AB | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q021 | AC | Texto de compatibilização | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q021 | BB | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q021 | BC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q021 | CC | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q022 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q022 | AB | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q022 | AC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q022 | BB | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q022 | BC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q022 | CC | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q023 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q023 | AB | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q023 | AC | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q023 | BB | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q023 | BC | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q023 | CC | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q024 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q024 | AB | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q024 | AC | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q024 | BB | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q024 | BC | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q024 | CC | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q025 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q025 | AB | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q025 | AC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q025 | BB | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q025 | BC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q025 | CC | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q026 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q026 | AB | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q026 | AC | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q026 | BB | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q026 | BC | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q026 | CC | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q027 | AA | Texto conjunto exato | ND-Q027-01, COND-Q027 | Redação concluída; ativação separada |
| Q027 | AB | Manter efeitos individuais | ND-Q027-01, COND-Q027 | Sem pendência local identificada; aguarda liberação geral |
| Q027 | AC | Manter efeitos individuais | ND-Q027-01, COND-Q027 | Sem pendência local identificada; aguarda liberação geral |
| Q027 | BB | Texto conjunto exato | ND-Q027-01, COND-Q027 | Redação concluída; ativação separada |
| Q027 | BC | Manter efeitos individuais | ND-Q027-01, COND-Q027 | Sem pendência local identificada; aguarda liberação geral |
| Q027 | CC | Texto conjunto exato | ND-Q027-01, COND-Q027 | Redação concluída; ativação separada |
| Q028 | AA | Texto conjunto exato | ND-Q028-01, COND-Q028 | Redação concluída; ativação separada |
| Q028 | AB | Manter efeitos individuais | ND-Q028-01, COND-Q028 | Sem pendência local identificada; aguarda liberação geral |
| Q028 | AC | Manter efeitos individuais | ND-Q028-01, COND-Q028 | Sem pendência local identificada; aguarda liberação geral |
| Q028 | BB | Texto conjunto exato | ND-Q028-01, COND-Q028 | Redação concluída; ativação separada |
| Q028 | BC | Manter efeitos individuais | ND-Q028-01, COND-Q028 | Sem pendência local identificada; aguarda liberação geral |
| Q028 | CC | Texto conjunto exato | ND-Q028-01, COND-Q028 | Redação concluída; ativação separada |
| Q029 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q029 | AB | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q029 | AC | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q029 | BB | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q029 | BC | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q029 | CC | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q030 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q030 | AB | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q030 | AC | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q030 | BB | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q030 | BC | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q030 | CC | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q031 | AA | Decisão conjunta | ND-Q031-01, COND-Q031 | Redação concluída; ativação separada |
| Q031 | AB | Decisão conjunta | ND-Q031-01, COND-Q031 | Sem pendência local identificada; aguarda liberação geral |
| Q031 | AC | Decisão conjunta | ND-Q031-01, COND-Q031 | Sem pendência local identificada; aguarda liberação geral |
| Q031 | BB | Decisão conjunta | ND-Q031-01, COND-Q031 | Redação concluída; ativação separada |
| Q031 | BC | Decisão conjunta | ND-Q031-01, COND-Q031 | Sem pendência local identificada; aguarda liberação geral |
| Q031 | CC | Decisão conjunta | ND-Q031-01, COND-Q031 | Redação concluída; ativação separada |
| Q032 | AA | Texto conjunto exato | ND-Q032-01, COND-Q032 | Redação concluída; ativação separada |
| Q032 | AB | Manter efeitos individuais | ND-Q032-01, COND-Q032 | Sem pendência local identificada; aguarda liberação geral |
| Q032 | AC | Texto de compatibilização | ND-Q032-01, COND-Q032 | Sem pendência local identificada; aguarda liberação geral |
| Q032 | BB | Texto conjunto exato | ND-Q032-01, COND-Q032 | Redação concluída; ativação separada |
| Q032 | BC | Texto de compatibilização | ND-Q032-01, COND-Q032 | Sem pendência local identificada; aguarda liberação geral |
| Q032 | CC | Texto conjunto exato | ND-Q032-01, COND-Q032 | Redação concluída; ativação separada |
| Q033 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q033 | AB | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q033 | AC | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q033 | BB | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q033 | BC | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q033 | CC | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q034 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q034 | AB | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q034 | AC | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q034 | BB | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q034 | BC | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q034 | CC | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q035 | AA | Decisão conjunta | ND-Q035-01, COND-Q035 | Redação concluída; ativação separada |
| Q035 | AB | Decisão conjunta | ND-Q035-01, COND-Q035 | Sem pendência local identificada; aguarda liberação geral |
| Q035 | AC | Decisão conjunta | ND-Q035-01, COND-Q035 | Sem pendência local identificada; aguarda liberação geral |
| Q035 | BB | Decisão conjunta | ND-Q035-01, COND-Q035 | Redação concluída; ativação separada |
| Q035 | BC | Decisão conjunta | ND-Q035-01, COND-Q035 | Sem pendência local identificada; aguarda liberação geral |
| Q035 | CC | Decisão conjunta | ND-Q035-01, COND-Q035 | Redação concluída; ativação separada |
| Q036 | AA | Decisão conjunta | ND-Q036-01, COND-Q036 | Redação concluída; ativação separada |
| Q036 | AB | Decisão conjunta | ND-Q036-01, COND-Q036 | Sem pendência local identificada; aguarda liberação geral |
| Q036 | AC | Decisão conjunta | ND-Q036-01, COND-Q036 | Sem pendência local identificada; aguarda liberação geral |
| Q036 | BB | Decisão conjunta | ND-Q036-01, COND-Q036 | Redação concluída; ativação separada |
| Q036 | BC | Decisão conjunta | ND-Q036-01, COND-Q036 | Sem pendência local identificada; aguarda liberação geral |
| Q036 | CC | Decisão conjunta | ND-Q036-01, COND-Q036 | Redação concluída; ativação separada |
| Q037 | AA | Decisão conjunta | ND-Q037-01, COND-Q037 | Redação concluída; ativação separada |
| Q037 | AB | Decisão conjunta | ND-Q037-01, COND-Q037 | Sem pendência local identificada; aguarda liberação geral |
| Q037 | AC | Decisão conjunta | ND-Q037-01, COND-Q037 | Sem pendência local identificada; aguarda liberação geral |
| Q037 | BB | Decisão conjunta | ND-Q037-01, COND-Q037 | Redação concluída; ativação separada |
| Q037 | BC | Decisão conjunta | ND-Q037-01, COND-Q037 | Sem pendência local identificada; aguarda liberação geral |
| Q037 | CC | Decisão conjunta | ND-Q037-01, COND-Q037 | Redação concluída; ativação separada |
| Q038 | AA | Decisão conjunta | ND-Q038-01, COND-Q038 | Redação concluída; ativação separada |
| Q038 | AB | Decisão conjunta | ND-Q038-01, COND-Q038 | Sem pendência local identificada; aguarda liberação geral |
| Q038 | AC | Decisão conjunta | ND-Q038-01, COND-Q038 | Sem pendência local identificada; aguarda liberação geral |
| Q038 | BB | Decisão conjunta | ND-Q038-01, COND-Q038 | Redação concluída; ativação separada |
| Q038 | BC | Decisão conjunta | ND-Q038-01, COND-Q038 | Sem pendência local identificada; aguarda liberação geral |
| Q038 | CC | Decisão conjunta | ND-Q038-01, COND-Q038 | Sem pendência local identificada; aguarda liberação geral |
| Q039 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q039 | AB | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q039 | AC | Texto de compatibilização | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q039 | BB | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q039 | BC | Texto de compatibilização | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q039 | CC | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q040 | AA | Decisão conjunta | ND-Q040-01, COND-Q040 | Redação concluída; ativação separada |
| Q040 | AB | Decisão conjunta | ND-Q040-01, COND-Q040 | Sem pendência local identificada; aguarda liberação geral |
| Q040 | AC | Decisão conjunta | ND-Q040-01, COND-Q040 | Sem pendência local identificada; aguarda liberação geral |
| Q040 | BB | Decisão conjunta | ND-Q040-01, COND-Q040 | Redação concluída; ativação separada |
| Q040 | BC | Decisão conjunta | ND-Q040-01, COND-Q040 | Sem pendência local identificada; aguarda liberação geral |
| Q040 | CC | Decisão conjunta | ND-Q040-01, COND-Q040 | Redação concluída; ativação separada |
| Q041 | AA | Decisão conjunta | ND-Q041-01, ND-Q041-02, COND-Q041 | Redação concluída; ativação separada |
| Q041 | AB | Decisão conjunta | ND-Q041-01, ND-Q041-02, COND-Q041 | Sem pendência local identificada; aguarda liberação geral |
| Q041 | AC | Decisão conjunta | ND-Q041-01, ND-Q041-02, COND-Q041 | Sem pendência local identificada; aguarda liberação geral |
| Q041 | BB | Decisão conjunta | ND-Q041-01, ND-Q041-02, COND-Q041 | Redação concluída; ativação separada |
| Q041 | BC | Decisão conjunta | ND-Q041-01, ND-Q041-02, COND-Q041 | Sem pendência local identificada; aguarda liberação geral |
| Q041 | CC | Decisão conjunta | ND-Q041-01, ND-Q041-02, COND-Q041 | Redação concluída; ativação separada |
| Q042 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q042 | AB | Texto de compatibilização | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q042 | AC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q042 | BB | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q042 | BC | Texto de compatibilização | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q042 | CC | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q043 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q043 | AB | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q043 | AC | Texto de compatibilização | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q043 | BB | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q043 | BC | Texto de compatibilização | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q043 | CC | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q044 | AA | Decisão conjunta | ND-Q044-01, COND-Q044 | Redação concluída; ativação separada |
| Q044 | AB | Decisão conjunta | ND-Q044-01, COND-Q044 | Sem pendência local identificada; aguarda liberação geral |
| Q044 | AC | Decisão conjunta | ND-Q044-01, COND-Q044 | Sem pendência local identificada; aguarda liberação geral |
| Q044 | BB | Decisão conjunta | ND-Q044-01, COND-Q044 | Redação concluída; ativação separada |
| Q044 | BC | Decisão conjunta | ND-Q044-01, COND-Q044 | Sem pendência local identificada; aguarda liberação geral |
| Q044 | CC | Decisão conjunta | ND-Q044-01, COND-Q044 | Sem pendência local identificada; aguarda liberação geral |
| Q045 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q045 | AB | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q045 | AC | Texto de compatibilização | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q045 | BB | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q045 | BC | Texto de compatibilização | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q045 | CC | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q046 | AA | Decisão conjunta | ND-Q046-01, COND-Q046 | Redação concluída; ativação separada |
| Q046 | AB | Decisão conjunta | ND-Q046-01, COND-Q046 | Sem pendência local identificada; aguarda liberação geral |
| Q046 | AC | Decisão conjunta | ND-Q046-01, COND-Q046 | Sem pendência local identificada; aguarda liberação geral |
| Q046 | BB | Decisão conjunta | ND-Q046-01, COND-Q046 | Redação concluída; ativação separada |
| Q046 | BC | Decisão conjunta | ND-Q046-01, COND-Q046 | Sem pendência local identificada; aguarda liberação geral |
| Q046 | CC | Decisão conjunta | ND-Q046-01, COND-Q046 | Sem pendência local identificada; aguarda liberação geral |
| Q047 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q047 | AB | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q047 | AC | Texto de compatibilização | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q047 | BB | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q047 | BC | Texto de compatibilização | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q047 | CC | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q048 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q048 | AB | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q048 | AC | Texto de compatibilização | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q048 | BB | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q048 | BC | Texto de compatibilização | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q048 | CC | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q049 | AA | Texto conjunto exato | ND-Q049-01, COND-Q049 | Redação concluída; ativação separada |
| Q049 | AB | Texto de compatibilização | ND-Q049-01, COND-Q049 | Sem pendência local identificada; aguarda liberação geral |
| Q049 | AC | Texto de compatibilização | ND-Q049-01, COND-Q049 | Sem pendência local identificada; aguarda liberação geral |
| Q049 | BB | Texto conjunto exato | ND-Q049-01, COND-Q049 | Redação concluída; ativação separada |
| Q049 | BC | Texto de compatibilização | ND-Q049-01, COND-Q049 | Sem pendência local identificada; aguarda liberação geral |
| Q049 | CC | Texto conjunto exato | ND-Q049-01, COND-Q049 | Sem pendência local identificada; aguarda liberação geral |
| Q050 | AA | Texto conjunto exato | ND-Q050-01, COND-Q050 | Redação concluída; ativação separada |
| Q050 | AB | Texto de compatibilização | ND-Q050-01, COND-Q050 | Sem pendência local identificada; aguarda liberação geral |
| Q050 | AC | Texto de compatibilização | ND-Q050-01, COND-Q050 | Sem pendência local identificada; aguarda liberação geral |
| Q050 | BB | Texto conjunto exato | ND-Q050-01, COND-Q050 | Redação concluída; ativação separada |
| Q050 | BC | Texto de compatibilização | ND-Q050-01, COND-Q050 | Sem pendência local identificada; aguarda liberação geral |
| Q050 | CC | Texto conjunto exato | ND-Q050-01, COND-Q050 | Sem pendência local identificada; aguarda liberação geral |
| Q051 | AA | Decisão conjunta | ND-Q051-50, COND-Q051 | Redação concluída; ativação separada |
| Q051 | AB | Decisão conjunta | ND-Q051-50, COND-Q051 | Sem pendência local identificada; aguarda liberação geral |
| Q051 | AC | Decisão conjunta | ND-Q051-50, COND-Q051 | Sem pendência local identificada; aguarda liberação geral |
| Q051 | BB | Decisão conjunta | ND-Q051-50, COND-Q051 | Redação concluída; ativação separada |
| Q051 | BC | Decisão conjunta | ND-Q051-50, COND-Q051 | Sem pendência local identificada; aguarda liberação geral |
| Q051 | CC | Decisão conjunta | ND-Q051-50, COND-Q051 | Redação concluída; ativação separada |
| Q052 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q052 | AB | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q052 | AC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q052 | BB | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q052 | BC | Texto de compatibilização | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q052 | CC | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q053 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q053 | AB | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q053 | AC | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q053 | BB | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q053 | BC | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q053 | CC | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q054 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q054 | AB | Texto de compatibilização | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q054 | AC | Texto de compatibilização | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q054 | BB | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q054 | BC | Texto de compatibilização | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q054 | CC | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q055 | AA | Decisão conjunta | ND-Q055-12, COND-Q055 | Redação concluída; ativação separada |
| Q055 | AB | Decisão conjunta | ND-Q055-12, COND-Q055 | Sem pendência local identificada; aguarda liberação geral |
| Q055 | AC | Decisão conjunta | ND-Q055-12, COND-Q055 | Sem pendência local identificada; aguarda liberação geral |
| Q055 | BB | Decisão conjunta | ND-Q055-12, COND-Q055 | Redação concluída; ativação separada |
| Q055 | BC | Decisão conjunta | ND-Q055-12, COND-Q055 | Sem pendência local identificada; aguarda liberação geral |
| Q055 | CC | Decisão conjunta | ND-Q055-12, COND-Q055 | Redação concluída; ativação separada |
| Q056 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q056 | AB | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q056 | AC | Texto de compatibilização | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q056 | BB | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q056 | BC | Texto de compatibilização | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q056 | CC | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q057 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q057 | AB | Texto de compatibilização | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q057 | AC | Texto de compatibilização | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q057 | BB | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q057 | BC | Texto de compatibilização | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q057 | CC | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q058 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q058 | AB | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q058 | AC | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q058 | BB | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q058 | BC | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q058 | CC | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q059 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q059 | AB | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q059 | AC | Texto de compatibilização | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q059 | BB | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q059 | BC | Texto de compatibilização | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q059 | CC | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q060 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q060 | AB | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q060 | AC | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q060 | BB | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q060 | BC | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q060 | CC | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q061 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q061 | AB | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q061 | AC | Texto de compatibilização | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q061 | BB | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q061 | BC | Texto de compatibilização | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q061 | CC | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q062 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q062 | AB | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q062 | AC | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q062 | BB | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q062 | BC | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q062 | CC | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q063 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q063 | AB | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q063 | AC | Texto de compatibilização | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q063 | BB | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q063 | BC | Texto de compatibilização | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q063 | CC | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q064 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q064 | AB | Texto de compatibilização | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q064 | AC | Texto de compatibilização | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q064 | BB | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q064 | BC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q064 | CC | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q065 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q065 | AB | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q065 | AC | Texto de compatibilização | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q065 | BB | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q065 | BC | Texto de compatibilização | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q065 | CC | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q066 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q066 | AB | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q066 | AC | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q066 | BB | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q066 | BC | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q066 | CC | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q067 | AA | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q067 | AB | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q067 | AC | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q067 | BB | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q067 | BC | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q067 | CC | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q068 | AA | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q068 | AB | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q068 | AC | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q068 | BB | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q068 | BC | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q068 | CC | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q069 | AA | Texto conjunto exato | ND-Q069-01, COND-Q069 | Redação concluída; ativação separada |
| Q069 | AB | Manter efeitos individuais | ND-Q069-01, COND-Q069 | Sem pendência local identificada; aguarda liberação geral |
| Q069 | AC | Manter efeitos individuais | ND-Q069-01, COND-Q069 | Sem pendência local identificada; aguarda liberação geral |
| Q069 | BB | Texto conjunto exato | ND-Q069-01, COND-Q069 | Redação concluída; ativação separada |
| Q069 | BC | Manter efeitos individuais | ND-Q069-01, COND-Q069 | Sem pendência local identificada; aguarda liberação geral |
| Q069 | CC | Texto conjunto exato | ND-Q069-01, COND-Q069 | Redação concluída; ativação separada |
| Q070 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q070 | AB | Texto de compatibilização | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q070 | AC | Texto de compatibilização | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q070 | BB | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q070 | BC | Texto de compatibilização | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q070 | CC | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q071 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q071 | AB | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q071 | AC | Texto de compatibilização | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q071 | BB | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q071 | BC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q071 | CC | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q072 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q072 | AB | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q072 | AC | Texto de compatibilização | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q072 | BB | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q072 | BC | Texto de compatibilização | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q072 | CC | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q073 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q073 | AB | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q073 | AC | Texto de compatibilização | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q073 | BB | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q073 | BC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q073 | CC | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q074 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q074 | AB | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q074 | AC | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q074 | BB | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q074 | BC | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q074 | CC | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q075 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q075 | AB | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q075 | AC | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q075 | BB | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q075 | BC | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q075 | CC | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q076 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q076 | AB | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q076 | AC | Texto de compatibilização | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q076 | BB | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q076 | BC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q076 | CC | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q077 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q077 | AB | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q077 | AC | Texto de compatibilização | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q077 | BB | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q077 | BC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q077 | CC | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q078 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q078 | AB | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q078 | AC | Texto de compatibilização | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q078 | BB | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q078 | BC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q078 | CC | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q079 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q079 | AB | Texto de compatibilização | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q079 | AC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q079 | BB | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q079 | BC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q079 | CC | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q080 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q080 | AB | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q080 | AC | Texto de compatibilização | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q080 | BB | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q080 | BC | Texto de compatibilização | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q080 | CC | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q081 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q081 | AB | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q081 | AC | Diagnóstico privado | PF-Q081-01 | Sem pendência local identificada; aguarda liberação geral |
| Q081 | BB | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q081 | BC | Diagnóstico privado | PF-Q081-01 | Sem pendência local identificada; aguarda liberação geral |
| Q081 | CC | Diagnóstico privado | PF-Q081-01 | Sem pendência local identificada; aguarda liberação geral |
| Q082 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q082 | AB | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q082 | AC | Texto de compatibilização | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q082 | BB | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q082 | BC | Texto de compatibilização | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q082 | CC | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q083 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q083 | AB | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q083 | AC | Texto de compatibilização | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q083 | BB | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q083 | BC | Texto de compatibilização | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q083 | CC | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q084 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q084 | AB | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q084 | AC | Texto de compatibilização | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q084 | BB | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q084 | BC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q084 | CC | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q085 | AA | Texto conjunto exato | ND-Q085-12, COND-Q085 | Redação concluída; ativação separada |
| Q085 | AB | Manter efeitos individuais | ND-Q085-12, COND-Q085 | Sem pendência local identificada; aguarda liberação geral |
| Q085 | AC | Manter efeitos individuais | ND-Q085-12, COND-Q085 | Sem pendência local identificada; aguarda liberação geral |
| Q085 | BB | Texto conjunto exato | ND-Q085-12, COND-Q085 | Redação concluída; ativação separada |
| Q085 | BC | Manter efeitos individuais | ND-Q085-12, COND-Q085 | Sem pendência local identificada; aguarda liberação geral |
| Q085 | CC | Texto conjunto exato | ND-Q085-12, COND-Q085 | Redação concluída; ativação separada |
| Q086 | AA | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q086 | AB | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q086 | AC | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q086 | BB | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q086 | BC | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q086 | CC | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q087 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q087 | AB | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q087 | AC | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q087 | BB | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q087 | BC | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q087 | CC | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q088 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q088 | AB | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q088 | AC | Texto de compatibilização | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q088 | BB | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q088 | BC | Texto de compatibilização | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q088 | CC | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q089 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q089 | AB | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q089 | AC | Texto de compatibilização | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q089 | BB | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q089 | BC | Texto de compatibilização | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q089 | CC | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q090 | AA | Decisão conjunta | ND-Q090-12, COND-Q090 | Redação concluída; ativação separada |
| Q090 | AB | Decisão conjunta | ND-Q090-12, COND-Q090 | Sem pendência local identificada; aguarda liberação geral |
| Q090 | AC | Decisão conjunta | ND-Q090-12, COND-Q090 | Sem pendência local identificada; aguarda liberação geral |
| Q090 | BB | Decisão conjunta | ND-Q090-12, COND-Q090 | Redação concluída; ativação separada |
| Q090 | BC | Decisão conjunta | ND-Q090-12, COND-Q090 | Sem pendência local identificada; aguarda liberação geral |
| Q090 | CC | Decisão conjunta | ND-Q090-12, COND-Q090 | Redação concluída; ativação separada |
| Q091 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q091 | AB | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q091 | AC | Texto de compatibilização | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q091 | BB | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q091 | BC | Texto de compatibilização | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q091 | CC | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q092 | AA | Texto conjunto exato | ND-Q092-12, COND-Q092 | Redação concluída; ativação separada |
| Q092 | AB | Manter efeitos individuais | ND-Q092-12, COND-Q092 | Sem pendência local identificada; aguarda liberação geral |
| Q092 | AC | Texto de compatibilização | ND-Q092-12, COND-Q092 | Sem pendência local identificada; aguarda liberação geral |
| Q092 | BB | Texto conjunto exato | ND-Q092-12, COND-Q092 | Redação concluída; ativação separada |
| Q092 | BC | Manter efeitos individuais | ND-Q092-12, COND-Q092 | Sem pendência local identificada; aguarda liberação geral |
| Q092 | CC | Texto conjunto exato | ND-Q092-12, COND-Q092 | Redação concluída; ativação separada |
| Q093 | AA | Decisão conjunta | ND-Q093-12, COND-Q093 | Redação concluída; ativação separada |
| Q093 | AB | Decisão conjunta | ND-Q093-12, COND-Q093 | Sem pendência local identificada; aguarda liberação geral |
| Q093 | AC | Decisão conjunta | ND-Q093-12, COND-Q093 | Sem pendência local identificada; aguarda liberação geral |
| Q093 | BB | Decisão conjunta | ND-Q093-12, COND-Q093 | Redação concluída; ativação separada |
| Q093 | BC | Decisão conjunta | ND-Q093-12, COND-Q093 | Sem pendência local identificada; aguarda liberação geral |
| Q093 | CC | Decisão conjunta | ND-Q093-12, COND-Q093 | Redação concluída; ativação separada |
| Q094 | AA | Decisão conjunta | ND-Q094-12, COND-Q094 | Redação concluída; ativação separada |
| Q094 | AB | Decisão conjunta | ND-Q094-12, COND-Q094 | Sem pendência local identificada; aguarda liberação geral |
| Q094 | AC | Decisão conjunta | ND-Q094-12, COND-Q094 | Sem pendência local identificada; aguarda liberação geral |
| Q094 | BB | Decisão conjunta | ND-Q094-12, COND-Q094 | Redação concluída; ativação separada |
| Q094 | BC | Decisão conjunta | ND-Q094-12, COND-Q094 | Sem pendência local identificada; aguarda liberação geral |
| Q094 | CC | Decisão conjunta | ND-Q094-12, COND-Q094 | Redação concluída; ativação separada |
| Q095 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q095 | AB | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q095 | AC | Texto de compatibilização | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q095 | BB | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q095 | BC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q095 | CC | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q096 | AA | Texto conjunto exato | ND-Q096-12, COND-Q096 | Redação concluída; ativação separada |
| Q096 | AB | Manter efeitos individuais | ND-Q096-12, COND-Q096 | Sem pendência local identificada; aguarda liberação geral |
| Q096 | AC | Texto de compatibilização | ND-Q096-12, COND-Q096 | Sem pendência local identificada; aguarda liberação geral |
| Q096 | BB | Texto conjunto exato | ND-Q096-12, COND-Q096 | Redação concluída; ativação separada |
| Q096 | BC | Manter efeitos individuais | ND-Q096-12, COND-Q096 | Sem pendência local identificada; aguarda liberação geral |
| Q096 | CC | Texto conjunto exato | ND-Q096-12, COND-Q096 | Redação concluída; ativação separada |
| Q097 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q097 | AB | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q097 | AC | Texto de compatibilização | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q097 | BB | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q097 | BC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q097 | CC | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q098 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q098 | AB | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q098 | AC | Texto de compatibilização | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q098 | BB | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q098 | BC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q098 | CC | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q099 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q099 | AB | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q099 | AC | Texto de compatibilização | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q099 | BB | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q099 | BC | Texto de compatibilização | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q099 | CC | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q100 | AA | Texto conjunto exato | ND-Q100-12, COND-Q100 | Redação concluída; ativação separada |
| Q100 | AB | Manter efeitos individuais | ND-Q100-12, COND-Q100 | Sem pendência local identificada; aguarda liberação geral |
| Q100 | AC | Manter efeitos individuais | ND-Q100-12, COND-Q100 | Sem pendência local identificada; aguarda liberação geral |
| Q100 | BB | Texto conjunto exato | ND-Q100-12, COND-Q100 | Redação concluída; ativação separada |
| Q100 | BC | Manter efeitos individuais | ND-Q100-12, COND-Q100 | Sem pendência local identificada; aguarda liberação geral |
| Q100 | CC | Texto conjunto exato | ND-Q100-12, COND-Q100 | Redação concluída; ativação separada |
| Q101 | AA | Sem saída adicional do par | Agregado de segurança | Sem pendência local identificada; aguarda liberação geral |
| Q101 | AB | Fluxo de segurança | P13 | Sem pendência local identificada; aguarda liberação geral |
| Q101 | AC | Fluxo de segurança | P13 | Sem pendência local identificada; aguarda liberação geral |
| Q101 | BB | Fluxo de segurança | P13 | Sem pendência local identificada; aguarda liberação geral |
| Q101 | BC | Fluxo de segurança | P13 | Sem pendência local identificada; aguarda liberação geral |
| Q101 | CC | Fluxo de segurança | P13 | Sem pendência local identificada; aguarda liberação geral |
| Q102 | AA | Sem saída adicional do par | Agregado de segurança | Sem pendência local identificada; aguarda liberação geral |
| Q102 | AB | Fluxo de segurança | P13 | Sem pendência local identificada; aguarda liberação geral |
| Q102 | AC | Fluxo de segurança | P13 | Sem pendência local identificada; aguarda liberação geral |
| Q102 | BB | Fluxo de segurança | P13 | Sem pendência local identificada; aguarda liberação geral |
| Q102 | BC | Fluxo de segurança | P13 | Sem pendência local identificada; aguarda liberação geral |
| Q102 | CC | Fluxo de segurança | P13 | Sem pendência local identificada; aguarda liberação geral |
| Q103 | AA | Sem saída adicional do par | Agregado de segurança | Sem pendência local identificada; aguarda liberação geral |
| Q103 | AB | Fluxo de segurança | P13 | Sem pendência local identificada; aguarda liberação geral |
| Q103 | AC | Fluxo de segurança | P13 | Sem pendência local identificada; aguarda liberação geral |
| Q103 | BB | Fluxo de segurança | P13 | Sem pendência local identificada; aguarda liberação geral |
| Q103 | BC | Fluxo de segurança | P13 | Sem pendência local identificada; aguarda liberação geral |
| Q103 | CC | Fluxo de segurança | P13 | Sem pendência local identificada; aguarda liberação geral |
| Q104 | AA | Sem saída adicional do par | Agregado de segurança | Sem pendência local identificada; aguarda liberação geral |
| Q104 | AB | Fluxo de segurança | P13 | Sem pendência local identificada; aguarda liberação geral |
| Q104 | AC | Fluxo de segurança | P13 | Sem pendência local identificada; aguarda liberação geral |
| Q104 | BB | Fluxo de segurança | P13 | Sem pendência local identificada; aguarda liberação geral |
| Q104 | BC | Fluxo de segurança | P13 | Sem pendência local identificada; aguarda liberação geral |
| Q104 | CC | Fluxo de segurança | P13 | Sem pendência local identificada; aguarda liberação geral |
| Q105 | AA | Sem saída adicional do par | Agregado de segurança | Sem pendência local identificada; aguarda liberação geral |
| Q105 | AB | Fluxo de segurança | P13 | Sem pendência local identificada; aguarda liberação geral |
| Q105 | AC | Fluxo de segurança | P13 | Sem pendência local identificada; aguarda liberação geral |
| Q105 | BB | Fluxo de segurança | P13 | Sem pendência local identificada; aguarda liberação geral |
| Q105 | BC | Fluxo de segurança | P13 | Sem pendência local identificada; aguarda liberação geral |
| Q105 | CC | Fluxo de segurança | P13 | Sem pendência local identificada; aguarda liberação geral |
| Q106 | AA | Sem saída adicional do par | Agregado de segurança | Sem pendência local identificada; aguarda liberação geral |
| Q106 | AB | Fluxo de segurança | P13 | Sem pendência local identificada; aguarda liberação geral |
| Q106 | AC | Fluxo de segurança | P13 | Sem pendência local identificada; aguarda liberação geral |
| Q106 | BB | Fluxo de segurança | P13 | Sem pendência local identificada; aguarda liberação geral |
| Q106 | BC | Fluxo de segurança | P13 | Sem pendência local identificada; aguarda liberação geral |
| Q106 | CC | Fluxo de segurança | P13 | Sem pendência local identificada; aguarda liberação geral |
| Q107 | AA | Sem saída adicional do par | Agregado de segurança | Sem pendência local identificada; aguarda liberação geral |
| Q107 | AB | Fluxo de segurança | P13 | Sem pendência local identificada; aguarda liberação geral |
| Q107 | AC | Fluxo de segurança | P13 | Sem pendência local identificada; aguarda liberação geral |
| Q107 | BB | Fluxo de segurança | P13 | Sem pendência local identificada; aguarda liberação geral |
| Q107 | BC | Fluxo de segurança | P13 | Sem pendência local identificada; aguarda liberação geral |
| Q107 | CC | Fluxo de segurança | P13 | Sem pendência local identificada; aguarda liberação geral |
| Q108 | AA | Sem saída adicional do par | Agregado de segurança | Sem pendência local identificada; aguarda liberação geral |
| Q108 | AB | Fluxo de segurança | P13 | Sem pendência local identificada; aguarda liberação geral |
| Q108 | AC | Fluxo de segurança | P13 | Sem pendência local identificada; aguarda liberação geral |
| Q108 | BB | Fluxo de segurança | P13 | Sem pendência local identificada; aguarda liberação geral |
| Q108 | BC | Fluxo de segurança | P13 | Sem pendência local identificada; aguarda liberação geral |
| Q108 | CC | Fluxo de segurança | P13 | Sem pendência local identificada; aguarda liberação geral |
| Q109 | AA | Sem saída adicional do par | Agregado de segurança | Sem pendência local identificada; aguarda liberação geral |
| Q109 | AB | Fluxo de segurança | P13 | Sem pendência local identificada; aguarda liberação geral |
| Q109 | AC | Fluxo de segurança | P13 | Sem pendência local identificada; aguarda liberação geral |
| Q109 | BB | Fluxo de segurança | P13 | Sem pendência local identificada; aguarda liberação geral |
| Q109 | BC | Fluxo de segurança | P13 | Sem pendência local identificada; aguarda liberação geral |
| Q109 | CC | Fluxo de segurança | P13 | Sem pendência local identificada; aguarda liberação geral |
| Q110 | AA | Sem saída adicional do par | Agregado de segurança | Sem pendência local identificada; aguarda liberação geral |
| Q110 | AB | Fluxo de segurança | P13 | Sem pendência local identificada; aguarda liberação geral |
| Q110 | AC | Fluxo de segurança | P13 | Sem pendência local identificada; aguarda liberação geral |
| Q110 | BB | Fluxo de segurança | P13 | Sem pendência local identificada; aguarda liberação geral |
| Q110 | BC | Fluxo de segurança | P13 | Sem pendência local identificada; aguarda liberação geral |
| Q110 | CC | Fluxo de segurança | P13 | Sem pendência local identificada; aguarda liberação geral |
| Q111 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q111 | AB | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q111 | AC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q111 | BB | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q111 | BC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q111 | CC | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q112 | AA | Decisão conjunta | ND-Q112-01, COND-Q112 | Redação concluída; ativação separada |
| Q112 | AB | Decisão conjunta | ND-Q112-01, COND-Q112 | Sem pendência local identificada; aguarda liberação geral |
| Q112 | AC | Decisão conjunta | ND-Q112-01, COND-Q112 | Sem pendência local identificada; aguarda liberação geral |
| Q112 | BB | Decisão conjunta | ND-Q112-01, COND-Q112 | Redação concluída; ativação separada |
| Q112 | BC | Decisão conjunta | ND-Q112-01, COND-Q112 | Sem pendência local identificada; aguarda liberação geral |
| Q112 | CC | Decisão conjunta | ND-Q112-01, COND-Q112 | Redação concluída; ativação separada |
| Q113 | AA | Decisão conjunta | ND-Q113-01, COND-Q113 | Redação concluída; ativação separada |
| Q113 | AB | Decisão conjunta | ND-Q113-01, COND-Q113 | Sem pendência local identificada; aguarda liberação geral |
| Q113 | AC | Decisão conjunta | ND-Q113-01, COND-Q113 | Sem pendência local identificada; aguarda liberação geral |
| Q113 | BB | Decisão conjunta | ND-Q113-01, COND-Q113 | Redação concluída; ativação separada |
| Q113 | BC | Decisão conjunta | ND-Q113-01, COND-Q113 | Sem pendência local identificada; aguarda liberação geral |
| Q113 | CC | Decisão conjunta | ND-Q113-01, COND-Q113 | Redação concluída; ativação separada |
| Q114 | AA | Decisão conjunta | ND-Q114-01, COND-Q114 | Redação concluída; ativação separada |
| Q114 | AB | Decisão conjunta | ND-Q114-01, COND-Q114 | Sem pendência local identificada; aguarda liberação geral |
| Q114 | AC | Decisão conjunta | ND-Q114-01, COND-Q114 | Sem pendência local identificada; aguarda liberação geral |
| Q114 | BB | Decisão conjunta | ND-Q114-01, COND-Q114 | Redação concluída; ativação separada |
| Q114 | BC | Decisão conjunta | ND-Q114-01, COND-Q114 | Sem pendência local identificada; aguarda liberação geral |
| Q114 | CC | Decisão conjunta | ND-Q114-01, COND-Q114 | Redação concluída; ativação separada |
| Q115 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q115 | AB | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q115 | AC | Texto de compatibilização | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q115 | BB | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q115 | BC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q115 | CC | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q116 | AA | Decisão conjunta | ND-Q116-01, COND-Q116 | Redação concluída; ativação separada |
| Q116 | AB | Decisão conjunta | ND-Q116-01, COND-Q116 | Sem pendência local identificada; aguarda liberação geral |
| Q116 | AC | Decisão conjunta | ND-Q116-01, COND-Q116 | Sem pendência local identificada; aguarda liberação geral |
| Q116 | BB | Decisão conjunta | ND-Q116-01, COND-Q116 | Redação concluída; ativação separada |
| Q116 | BC | Decisão conjunta | ND-Q116-01, COND-Q116 | Sem pendência local identificada; aguarda liberação geral |
| Q116 | CC | Decisão conjunta | ND-Q116-01, COND-Q116 | Redação concluída; ativação separada |
| Q117 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q117 | AB | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q117 | AC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q117 | BB | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q117 | BC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q117 | CC | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q118 | AA | Texto conjunto exato | ND-Q118-01, COND-Q118 | Redação concluída; ativação separada |
| Q118 | AB | Manter efeitos individuais | ND-Q118-01, COND-Q118 | Sem pendência local identificada; aguarda liberação geral |
| Q118 | AC | Manter efeitos individuais | ND-Q118-01, COND-Q118 | Sem pendência local identificada; aguarda liberação geral |
| Q118 | BB | Texto conjunto exato | ND-Q118-01, COND-Q118 | Redação concluída; ativação separada |
| Q118 | BC | Manter efeitos individuais | ND-Q118-01, COND-Q118 | Sem pendência local identificada; aguarda liberação geral |
| Q118 | CC | Texto conjunto exato | ND-Q118-01, COND-Q118 | Redação concluída; ativação separada |
| Q119 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q119 | AB | Diagnóstico privado | PF-Q119-01 | Sem pendência local identificada; aguarda liberação geral |
| Q119 | AC | Diagnóstico privado | PF-Q119-01 | Sem pendência local identificada; aguarda liberação geral |
| Q119 | BB | Diagnóstico privado | PF-Q119-01 | Sem pendência local identificada; aguarda liberação geral |
| Q119 | BC | Diagnóstico privado | PF-Q119-01 | Sem pendência local identificada; aguarda liberação geral |
| Q119 | CC | Diagnóstico privado | PF-Q119-01 | Sem pendência local identificada; aguarda liberação geral |
| Q120 | AA | Decisão conjunta | ND-Q120-01, COND-Q120 | Redação concluída; ativação separada |
| Q120 | AB | Decisão conjunta | ND-Q120-01, COND-Q120 | Sem pendência local identificada; aguarda liberação geral |
| Q120 | AC | Decisão conjunta | ND-Q120-01, COND-Q120 | Sem pendência local identificada; aguarda liberação geral |
| Q120 | BB | Decisão conjunta | ND-Q120-01, COND-Q120 | Redação concluída; ativação separada |
| Q120 | BC | Decisão conjunta | ND-Q120-01, COND-Q120 | Sem pendência local identificada; aguarda liberação geral |
| Q120 | CC | Decisão conjunta | ND-Q120-01, COND-Q120 | Redação concluída; ativação separada |
| Q121 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q121 | AB | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q121 | AC | Texto de compatibilização | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q121 | BB | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q121 | BC | Texto de compatibilização | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q121 | CC | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q122 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q122 | AB | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q122 | AC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q122 | BB | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q122 | BC | Texto de compatibilização | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q122 | CC | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q123 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q123 | AB | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q123 | AC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q123 | BB | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q123 | BC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q123 | CC | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q124 | AA | Texto conjunto exato | ND-Q124-01, COND-Q124 | Redação concluída; ativação separada |
| Q124 | AB | Manter efeitos individuais | ND-Q124-01, COND-Q124 | Sem pendência local identificada; aguarda liberação geral |
| Q124 | AC | Texto de compatibilização | ND-Q124-01, COND-Q124 | Sem pendência local identificada; aguarda liberação geral |
| Q124 | BB | Texto conjunto exato | ND-Q124-01, COND-Q124 | Redação concluída; ativação separada |
| Q124 | BC | Manter efeitos individuais | ND-Q124-01, COND-Q124 | Sem pendência local identificada; aguarda liberação geral |
| Q124 | CC | Texto conjunto exato | ND-Q124-01, COND-Q124 | Redação concluída; ativação separada |
| Q125 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q125 | AB | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q125 | AC | Texto de compatibilização | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q125 | BB | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q125 | BC | Texto de compatibilização | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q125 | CC | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q126 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q126 | AB | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q126 | AC | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q126 | BB | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q126 | BC | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q126 | CC | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q127 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q127 | AB | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q127 | AC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q127 | BB | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q127 | BC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q127 | CC | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q128 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q128 | AB | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q128 | AC | Texto de compatibilização | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q128 | BB | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q128 | BC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q128 | CC | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q129 | AA | Texto conjunto exato | ND-Q129-01, COND-Q129 | Redação concluída; ativação separada |
| Q129 | AB | Manter efeitos individuais | ND-Q129-01, COND-Q129 | Sem pendência local identificada; aguarda liberação geral |
| Q129 | AC | Manter efeitos individuais | ND-Q129-01, COND-Q129 | Sem pendência local identificada; aguarda liberação geral |
| Q129 | BB | Texto conjunto exato | ND-Q129-01, COND-Q129 | Redação concluída; ativação separada |
| Q129 | BC | Manter efeitos individuais | ND-Q129-01, COND-Q129 | Sem pendência local identificada; aguarda liberação geral |
| Q129 | CC | Texto conjunto exato | ND-Q129-01, COND-Q129 | Redação concluída; ativação separada |
| Q130 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | UNRESOLVED_JOINT_TRIGGER, VOLUNTARY_EMERGENCY_REGISTRY_DESIGN_REQUIRED |
| Q130 | AB | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | UNRESOLVED_JOINT_TRIGGER; VOLUNTARY_EMERGENCY_REGISTRY_DESIGN_REQUIRED |
| Q130 | AC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | UNRESOLVED_JOINT_TRIGGER; VOLUNTARY_EMERGENCY_REGISTRY_DESIGN_REQUIRED |
| Q130 | BB | Texto conjunto exato | Efeitos e eventos próprios da pergunta | UNRESOLVED_JOINT_TRIGGER, VOLUNTARY_EMERGENCY_REGISTRY_DESIGN_REQUIRED |
| Q130 | BC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | UNRESOLVED_JOINT_TRIGGER; VOLUNTARY_EMERGENCY_REGISTRY_DESIGN_REQUIRED |
| Q130 | CC | Texto conjunto exato | Efeitos e eventos próprios da pergunta | UNRESOLVED_JOINT_TRIGGER, VOLUNTARY_EMERGENCY_REGISTRY_DESIGN_REQUIRED |
| Q131 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q131 | AB | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q131 | AC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q131 | BB | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q131 | BC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q131 | CC | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q132 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q132 | AB | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q132 | AC | Texto de compatibilização | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q132 | BB | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q132 | BC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q132 | CC | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q133 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q133 | AB | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q133 | AC | Texto de compatibilização | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q133 | BB | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q133 | BC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q133 | CC | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q134 | AA | Texto conjunto exato | ND-Q134-01, COND-Q134 | Redação concluída; ativação separada |
| Q134 | AB | Manter efeitos individuais | ND-Q134-01, COND-Q134 | Sem pendência local identificada; aguarda liberação geral |
| Q134 | AC | Texto de compatibilização | ND-Q134-01, COND-Q134 | Sem pendência local identificada; aguarda liberação geral |
| Q134 | BB | Texto conjunto exato | ND-Q134-01, COND-Q134 | Redação concluída; ativação separada |
| Q134 | BC | Manter efeitos individuais | ND-Q134-01, COND-Q134 | Sem pendência local identificada; aguarda liberação geral |
| Q134 | CC | Texto conjunto exato | ND-Q134-01, COND-Q134 | Redação concluída; ativação separada |
| Q135 | AA | Texto conjunto exato | ND-Q135-01, COND-Q135 | Redação concluída; ativação separada |
| Q135 | AB | Manter efeitos individuais | ND-Q135-01, COND-Q135 | Sem pendência local identificada; aguarda liberação geral |
| Q135 | AC | Texto de compatibilização | ND-Q135-01, COND-Q135 | Sem pendência local identificada; aguarda liberação geral |
| Q135 | BB | Texto conjunto exato | ND-Q135-01, COND-Q135 | Redação concluída; ativação separada |
| Q135 | BC | Manter efeitos individuais | ND-Q135-01, COND-Q135 | Sem pendência local identificada; aguarda liberação geral |
| Q135 | CC | Texto conjunto exato | ND-Q135-01, COND-Q135 | Redação concluída; ativação separada |
| Q136 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q136 | AB | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q136 | AC | Texto de compatibilização | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q136 | BB | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q136 | BC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q136 | CC | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q137 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q137 | AB | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q137 | AC | Texto de compatibilização | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q137 | BB | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q137 | BC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q137 | CC | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q138 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q138 | AB | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q138 | AC | Texto de compatibilização | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q138 | BB | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q138 | BC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q138 | CC | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q139 | AA | Texto conjunto exato | ND-Q139-01, COND-Q139 | Redação concluída; ativação separada |
| Q139 | AB | Manter efeitos individuais | ND-Q139-01, COND-Q139 | Sem pendência local identificada; aguarda liberação geral |
| Q139 | AC | Texto de compatibilização | ND-Q139-01, COND-Q139 | Sem pendência local identificada; aguarda liberação geral |
| Q139 | BB | Texto conjunto exato | ND-Q139-01, COND-Q139 | Redação concluída; ativação separada |
| Q139 | BC | Manter efeitos individuais | ND-Q139-01, COND-Q139 | Sem pendência local identificada; aguarda liberação geral |
| Q139 | CC | Texto conjunto exato | ND-Q139-01, COND-Q139 | Redação concluída; ativação separada |
| Q140 | AA | Decisão conjunta | ND-Q140-01, COND-Q140 | Redação concluída; ativação separada |
| Q140 | AB | Decisão conjunta | ND-Q140-01, COND-Q140 | Sem pendência local identificada; aguarda liberação geral |
| Q140 | AC | Decisão conjunta | ND-Q140-01, COND-Q140 | Sem pendência local identificada; aguarda liberação geral |
| Q140 | BB | Decisão conjunta | ND-Q140-01, COND-Q140 | Redação concluída; ativação separada |
| Q140 | BC | Decisão conjunta | ND-Q140-01, COND-Q140 | Sem pendência local identificada; aguarda liberação geral |
| Q140 | CC | Decisão conjunta | ND-Q140-01, COND-Q140 | Redação concluída; ativação separada |
| Q141 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q141 | AB | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q141 | AC | Texto de compatibilização | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q141 | BB | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q141 | BC | Texto de compatibilização | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q141 | CC | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q142 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q142 | AB | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q142 | AC | Texto de compatibilização | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q142 | BB | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q142 | BC | Texto de compatibilização | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q142 | CC | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q143 | AA | Decisão conjunta | ND-Q143-01, COND-Q143 | Redação concluída; ativação separada |
| Q143 | AB | Decisão conjunta | ND-Q143-01, COND-Q143 | Sem pendência local identificada; aguarda liberação geral |
| Q143 | AC | Decisão conjunta | ND-Q143-01, COND-Q143 | Sem pendência local identificada; aguarda liberação geral |
| Q143 | BB | Decisão conjunta | ND-Q143-01, COND-Q143 | Redação concluída; ativação separada |
| Q143 | BC | Decisão conjunta | ND-Q143-01, COND-Q143 | Sem pendência local identificada; aguarda liberação geral |
| Q143 | CC | Decisão conjunta | ND-Q143-01, COND-Q143 | Redação concluída; ativação separada |
| Q144 | AA | Texto conjunto exato | ND-Q144-01, COND-Q144 | Redação concluída; ativação separada |
| Q144 | AB | Manter efeitos individuais | ND-Q144-01, COND-Q144 | Sem pendência local identificada; aguarda liberação geral |
| Q144 | AC | Texto de compatibilização | ND-Q144-01, COND-Q144 | Sem pendência local identificada; aguarda liberação geral |
| Q144 | BB | Texto conjunto exato | ND-Q144-01, COND-Q144 | Redação concluída; ativação separada |
| Q144 | BC | Manter efeitos individuais | ND-Q144-01, COND-Q144 | Sem pendência local identificada; aguarda liberação geral |
| Q144 | CC | Texto conjunto exato | ND-Q144-01, COND-Q144 | Redação concluída; ativação separada |
| Q145 | AA | Texto conjunto exato | ND-Q145-01, COND-Q145 | Redação concluída; ativação separada |
| Q145 | AB | Manter efeitos individuais | ND-Q145-01, COND-Q145 | Sem pendência local identificada; aguarda liberação geral |
| Q145 | AC | Texto de compatibilização | ND-Q145-01, COND-Q145 | Sem pendência local identificada; aguarda liberação geral |
| Q145 | BB | Texto conjunto exato | ND-Q145-01, COND-Q145 | Redação concluída; ativação separada |
| Q145 | BC | Manter efeitos individuais | ND-Q145-01, COND-Q145 | Sem pendência local identificada; aguarda liberação geral |
| Q145 | CC | Texto conjunto exato | ND-Q145-01, COND-Q145 | Redação concluída; ativação separada |
| Q146 | AA | Texto conjunto exato | ND-Q146-01, COND-Q146 | Redação concluída; ativação separada |
| Q146 | AB | Texto de compatibilização | ND-Q146-01, COND-Q146 | Sem pendência local identificada; aguarda liberação geral |
| Q146 | AC | Acionar protocolo | P09 | Sem pendência local identificada; aguarda liberação geral |
| Q146 | BB | Texto conjunto exato | ND-Q146-01, COND-Q146 | Redação concluída; ativação separada |
| Q146 | BC | Texto de compatibilização | ND-Q146-01, COND-Q146 | Sem pendência local identificada; aguarda liberação geral |
| Q146 | CC | Texto conjunto exato | ND-Q146-01, COND-Q146 | Redação concluída; ativação separada |
| Q147 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q147 | AB | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q147 | AC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q147 | BB | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q147 | BC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q147 | CC | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q148 | AA | Texto conjunto exato | ND-Q148-01, COND-Q148 | Redação concluída; ativação separada |
| Q148 | AB | Manter efeitos individuais | ND-Q148-01, COND-Q148 | Sem pendência local identificada; aguarda liberação geral |
| Q148 | AC | Texto de compatibilização | ND-Q148-01, COND-Q148 | Sem pendência local identificada; aguarda liberação geral |
| Q148 | BB | Texto conjunto exato | ND-Q148-01, COND-Q148 | Redação concluída; ativação separada |
| Q148 | BC | Manter efeitos individuais | ND-Q148-01, COND-Q148 | Sem pendência local identificada; aguarda liberação geral |
| Q148 | CC | Texto conjunto exato | ND-Q148-01, COND-Q148 | Redação concluída; ativação separada |
| Q149 | AA | Texto conjunto exato | ND-Q149-01, COND-Q149 | Redação concluída; ativação separada |
| Q149 | AB | Manter efeitos individuais | ND-Q149-01, COND-Q149 | Sem pendência local identificada; aguarda liberação geral |
| Q149 | AC | Texto de compatibilização | ND-Q149-01, COND-Q149 | Sem pendência local identificada; aguarda liberação geral |
| Q149 | BB | Texto conjunto exato | ND-Q149-01, COND-Q149 | Redação concluída; ativação separada |
| Q149 | BC | Manter efeitos individuais | ND-Q149-01, COND-Q149 | Sem pendência local identificada; aguarda liberação geral |
| Q149 | CC | Texto conjunto exato | ND-Q149-01, COND-Q149 | Redação concluída; ativação separada |
| Q150 | AA | Decisão conjunta | ND-Q150-01, COND-Q150 | Redação concluída; ativação separada |
| Q150 | AB | Decisão conjunta | ND-Q150-01, COND-Q150 | Sem pendência local identificada; aguarda liberação geral |
| Q150 | AC | Decisão conjunta | ND-Q150-01, COND-Q150 | Sem pendência local identificada; aguarda liberação geral |
| Q150 | BB | Decisão conjunta | ND-Q150-01, COND-Q150 | Redação concluída; ativação separada |
| Q150 | BC | Decisão conjunta | ND-Q150-01, COND-Q150 | Sem pendência local identificada; aguarda liberação geral |
| Q150 | CC | Decisão conjunta | ND-Q150-01, COND-Q150 | Redação concluída; ativação separada |
| Q151 | AA | Texto conjunto exato | ND-Q151-01, COND-Q151 | Redação concluída; ativação separada |
| Q151 | AB | Diagnóstico privado | Efeitos e eventos próprios da pergunta | PRIVATE_TO_JOINT_RESUMPTION_NOT_COMPILED |
| Q151 | AC | Diagnóstico privado | Efeitos e eventos próprios da pergunta | PRIVATE_TO_JOINT_RESUMPTION_NOT_COMPILED |
| Q151 | BB | Diagnóstico privado | Efeitos e eventos próprios da pergunta | PRIVATE_TO_JOINT_RESUMPTION_NOT_COMPILED |
| Q151 | BC | Diagnóstico privado | Efeitos e eventos próprios da pergunta | PRIVATE_TO_JOINT_RESUMPTION_NOT_COMPILED |
| Q151 | CC | Diagnóstico privado | Efeitos e eventos próprios da pergunta | PRIVATE_TO_JOINT_RESUMPTION_NOT_COMPILED |
| Q152 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q152 | AB | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q152 | AC | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q152 | BB | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q152 | BC | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q152 | CC | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q153 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q153 | AB | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q153 | AC | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q153 | BB | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q153 | BC | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q153 | CC | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q154 | AA | MERGE_EXACT_TEXT | Proibição fixa; P10 privado se C | Aguarda liberação geral |
| Q154 | AB | MERGE_EXACT_TEXT | Proibição fixa; P10 privado se C | Aguarda liberação geral |
| Q154 | AC | PRIVATE_DIAGNOSTIC | Proibição fixa; P10 privado se C | Aguarda liberação geral |
| Q154 | BB | MERGE_EXACT_TEXT | Proibição fixa; P10 privado se C | Aguarda liberação geral |
| Q154 | BC | PRIVATE_DIAGNOSTIC | Proibição fixa; P10 privado se C | Aguarda liberação geral |
| Q154 | CC | PRIVATE_DIAGNOSTIC | Proibição fixa; P10 privado se C | Aguarda liberação geral |
| Q155 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q155 | AB | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q155 | AC | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q155 | BB | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q155 | BC | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q155 | CC | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q156 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q156 | AB | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q156 | AC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q156 | BB | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q156 | BC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q156 | CC | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q157 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q157 | AB | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q157 | AC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q157 | BB | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q157 | BC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q157 | CC | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q158 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q158 | AB | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q158 | AC | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q158 | BB | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q158 | BC | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q158 | CC | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q159 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q159 | AB | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q159 | AC | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q159 | BB | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q159 | BC | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q159 | CC | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q160 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q160 | AB | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q160 | AC | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q160 | BB | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q160 | BC | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q160 | CC | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q161 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q161 | AB | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q161 | AC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q161 | BB | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q161 | BC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q161 | CC | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q162 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q162 | AB | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q162 | AC | Fluxo de segurança | P13 | Sem pendência local identificada; aguarda liberação geral |
| Q162 | BB | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q162 | BC | Fluxo de segurança | P13 | Sem pendência local identificada; aguarda liberação geral |
| Q162 | CC | Fluxo de segurança | P13 | Sem pendência local identificada; aguarda liberação geral |
| Q163 | AA | Decisão conjunta | ND-Q163-01, COND-Q163 | Redação concluída; ativação separada |
| Q163 | AB | Decisão conjunta | ND-Q163-01, COND-Q163 | Sem pendência local identificada; aguarda liberação geral |
| Q163 | AC | Decisão conjunta | ND-Q163-01, COND-Q163 | Sem pendência local identificada; aguarda liberação geral |
| Q163 | BB | Decisão conjunta | ND-Q163-01, COND-Q163 | Redação concluída; ativação separada |
| Q163 | BC | Decisão conjunta | ND-Q163-01, COND-Q163 | Sem pendência local identificada; aguarda liberação geral |
| Q163 | CC | Decisão conjunta | ND-Q163-01, COND-Q163 | Redação concluída; ativação separada |
| Q164 | AA | Texto conjunto exato | ND-Q164-01, COND-Q164 | Redação concluída; ativação separada |
| Q164 | AB | Manter efeitos individuais | ND-Q164-01, COND-Q164 | Sem pendência local identificada; aguarda liberação geral |
| Q164 | AC | Manter efeitos individuais | ND-Q164-01, COND-Q164 | Sem pendência local identificada; aguarda liberação geral |
| Q164 | BB | Texto conjunto exato | ND-Q164-01, COND-Q164 | Redação concluída; ativação separada |
| Q164 | BC | Manter efeitos individuais | ND-Q164-01, COND-Q164 | Sem pendência local identificada; aguarda liberação geral |
| Q164 | CC | Texto conjunto exato | ND-Q164-01, COND-Q164 | Redação concluída; ativação separada |
| Q165 | AA | Texto conjunto exato | ND-Q165-01, COND-Q165 | Redação concluída; ativação separada |
| Q165 | AB | Manter efeitos individuais | ND-Q165-01, COND-Q165 | Sem pendência local identificada; aguarda liberação geral |
| Q165 | AC | Manter efeitos individuais | ND-Q165-01, COND-Q165 | Sem pendência local identificada; aguarda liberação geral |
| Q165 | BB | Texto conjunto exato | ND-Q165-01, COND-Q165 | Redação concluída; ativação separada |
| Q165 | BC | Manter efeitos individuais | ND-Q165-01, COND-Q165 | Sem pendência local identificada; aguarda liberação geral |
| Q165 | CC | Texto conjunto exato | ND-Q165-01, COND-Q165 | Redação concluída; ativação separada |
| Q166 | AA | Decisão conjunta | ND-Q166-01, COND-Q166 | Redação concluída; ativação separada |
| Q166 | AB | Decisão conjunta | ND-Q166-01, COND-Q166 | Sem pendência local identificada; aguarda liberação geral |
| Q166 | AC | Decisão conjunta | ND-Q166-01, COND-Q166 | Sem pendência local identificada; aguarda liberação geral |
| Q166 | BB | Decisão conjunta | ND-Q166-01, COND-Q166 | Redação concluída; ativação separada |
| Q166 | BC | Decisão conjunta | ND-Q166-01, COND-Q166 | Sem pendência local identificada; aguarda liberação geral |
| Q166 | CC | Decisão conjunta | ND-Q166-01, COND-Q166 | Redação concluída; ativação separada |
| Q167 | AA | Decisão conjunta | ND-Q167-01, COND-Q167 | Redação concluída; ativação separada |
| Q167 | AB | Decisão conjunta | ND-Q167-01, COND-Q167 | Sem pendência local identificada; aguarda liberação geral |
| Q167 | AC | Decisão conjunta | ND-Q167-01, COND-Q167 | Sem pendência local identificada; aguarda liberação geral |
| Q167 | BB | Decisão conjunta | ND-Q167-01, COND-Q167 | Redação concluída; ativação separada |
| Q167 | BC | Decisão conjunta | ND-Q167-01, COND-Q167 | Sem pendência local identificada; aguarda liberação geral |
| Q167 | CC | Decisão conjunta | ND-Q167-01, COND-Q167 | Redação concluída; ativação separada |
| Q168 | AA | Texto conjunto exato | ND-Q168-01, COND-Q168 | Redação concluída; ativação separada |
| Q168 | AB | Manter efeitos individuais | ND-Q168-01, COND-Q168 | Sem pendência local identificada; aguarda liberação geral |
| Q168 | AC | Manter efeitos individuais | ND-Q168-01, COND-Q168 | Sem pendência local identificada; aguarda liberação geral |
| Q168 | BB | Texto conjunto exato | ND-Q168-01, COND-Q168 | Redação concluída; ativação separada |
| Q168 | BC | Manter efeitos individuais | ND-Q168-01, COND-Q168 | Sem pendência local identificada; aguarda liberação geral |
| Q168 | CC | Texto conjunto exato | ND-Q168-01, COND-Q168 | Redação concluída; ativação separada |
| Q169 | AA | Decisão conjunta | ND-Q169-01, COND-Q169 | Redação concluída; ativação separada |
| Q169 | AB | Decisão conjunta | ND-Q169-01, COND-Q169 | Sem pendência local identificada; aguarda liberação geral |
| Q169 | AC | Decisão conjunta | ND-Q169-01, COND-Q169 | Sem pendência local identificada; aguarda liberação geral |
| Q169 | BB | Decisão conjunta | ND-Q169-01, COND-Q169 | Redação concluída; ativação separada |
| Q169 | BC | Decisão conjunta | ND-Q169-01, COND-Q169 | Sem pendência local identificada; aguarda liberação geral |
| Q169 | CC | Decisão conjunta | ND-Q169-01, COND-Q169 | Redação concluída; ativação separada |
| Q170 | AA | Decisão conjunta | ND-Q170-01, COND-Q170 | Redação concluída; ativação separada |
| Q170 | AB | Decisão conjunta | ND-Q170-01, COND-Q170 | Sem pendência local identificada; aguarda liberação geral |
| Q170 | AC | Decisão conjunta | ND-Q170-01, COND-Q170 | Sem pendência local identificada; aguarda liberação geral |
| Q170 | BB | Decisão conjunta | ND-Q170-01, COND-Q170 | Redação concluída; ativação separada |
| Q170 | BC | Decisão conjunta | ND-Q170-01, COND-Q170 | Sem pendência local identificada; aguarda liberação geral |
| Q170 | CC | Decisão conjunta | ND-Q170-01, COND-Q170 | Redação concluída; ativação separada |
| Q171 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q171 | AB | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q171 | AC | Texto de compatibilização | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q171 | BB | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q171 | BC | Texto de compatibilização | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q171 | CC | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q172 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q172 | AB | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q172 | AC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q172 | BB | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q172 | BC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q172 | CC | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q173 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q173 | AB | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q173 | AC | Texto de compatibilização | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q173 | BB | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q173 | BC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q173 | CC | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q174 | AA | Texto conjunto exato | ND-Q174-01, COND-Q174 | Redação concluída; ativação separada |
| Q174 | AB | Manter efeitos individuais | ND-Q174-01, COND-Q174 | Sem pendência local identificada; aguarda liberação geral |
| Q174 | AC | Manter efeitos individuais | ND-Q174-01, COND-Q174 | Sem pendência local identificada; aguarda liberação geral |
| Q174 | BB | Texto conjunto exato | ND-Q174-01, COND-Q174 | Redação concluída; ativação separada |
| Q174 | BC | Manter efeitos individuais | ND-Q174-01, COND-Q174 | Sem pendência local identificada; aguarda liberação geral |
| Q174 | CC | Texto conjunto exato | ND-Q174-01, COND-Q174 | Redação concluída; ativação separada |
| Q175 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q175 | AB | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q175 | AC | Texto de compatibilização | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q175 | BB | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q175 | BC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q175 | CC | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q176 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q176 | AB | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q176 | AC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q176 | BB | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q176 | BC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q176 | CC | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q177 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q177 | AB | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q177 | AC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q177 | BB | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q177 | BC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q177 | CC | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q178 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q178 | AB | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q178 | AC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q178 | BB | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q178 | BC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q178 | CC | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q179 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q179 | AB | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q179 | AC | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q179 | BB | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q179 | BC | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q179 | CC | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q180 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q180 | AB | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q180 | AC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q180 | BB | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q180 | BC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q180 | CC | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q181 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q181 | AB | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q181 | AC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q181 | BB | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q181 | BC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q181 | CC | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q182 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q182 | AB | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q182 | AC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q182 | BB | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q182 | BC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q182 | CC | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q183 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q183 | AB | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q183 | AC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q183 | BB | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q183 | BC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q183 | CC | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q184 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q184 | AB | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q184 | AC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q184 | BB | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q184 | BC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q184 | CC | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q185 | AA | Decisão conjunta | ND-Q185-01, COND-Q185 | Redação concluída; ativação separada |
| Q185 | AB | Decisão conjunta | ND-Q185-01, COND-Q185 | Sem pendência local identificada; aguarda liberação geral |
| Q185 | AC | Decisão conjunta | ND-Q185-01, COND-Q185 | Sem pendência local identificada; aguarda liberação geral |
| Q185 | BB | Decisão conjunta | ND-Q185-01, COND-Q185 | Redação concluída; ativação separada |
| Q185 | BC | Decisão conjunta | ND-Q185-01, COND-Q185 | Sem pendência local identificada; aguarda liberação geral |
| Q185 | CC | Decisão conjunta | ND-Q185-01, COND-Q185 | Redação concluída; ativação separada |
| Q186 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q186 | AB | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q186 | AC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q186 | BB | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q186 | BC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q186 | CC | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q187 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q187 | AB | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q187 | AC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q187 | BB | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q187 | BC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q187 | CC | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q188 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q188 | AB | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q188 | AC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q188 | BB | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q188 | BC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q188 | CC | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q189 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q189 | AB | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q189 | AC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q189 | BB | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q189 | BC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q189 | CC | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q190 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q190 | AB | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q190 | AC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q190 | BB | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q190 | BC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q190 | CC | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q191 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q191 | AB | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q191 | AC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q191 | BB | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q191 | BC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q191 | CC | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q192 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q192 | AB | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q192 | AC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q192 | BB | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q192 | BC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q192 | CC | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q193 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q193 | AB | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q193 | AC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q193 | BB | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q193 | BC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q193 | CC | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q194 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q194 | AB | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q194 | AC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q194 | BB | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q194 | BC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q194 | CC | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q195 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q195 | AB | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q195 | AC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q195 | BB | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q195 | BC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q195 | CC | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q196 | AA | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q196 | AB | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q196 | AC | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q196 | BB | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q196 | BC | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q196 | CC | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q197 | AA | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q197 | AB | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q197 | AC | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q197 | BB | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q197 | BC | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q197 | CC | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q198 | AA | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q198 | AB | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q198 | AC | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q198 | BB | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q198 | BC | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q198 | CC | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q199 | AA | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q199 | AB | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q199 | AC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q199 | BB | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q199 | BC | Manter efeitos individuais | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q199 | CC | Texto conjunto exato | Efeitos e eventos próprios da pergunta | Redação concluída; ativação separada |
| Q200 | AA | Diagnóstico privado | Efeitos e eventos próprios da pergunta | Sem pendência local identificada; aguarda liberação geral |
| Q200 | AB | Diagnóstico privado | Efeitos e eventos próprios da pergunta | PLAN_INTENSITY_PARAMETERS_UNDEFINED |
| Q200 | AC | Diagnóstico privado | Efeitos e eventos próprios da pergunta | PLAN_INTENSITY_PARAMETERS_UNDEFINED |
| Q200 | BB | Diagnóstico privado | Efeitos e eventos próprios da pergunta | PLAN_INTENSITY_PARAMETERS_UNDEFINED |
| Q200 | BC | Diagnóstico privado | Efeitos e eventos próprios da pergunta | PLAN_INTENSITY_PARAMETERS_UNDEFINED |
| Q200 | CC | Diagnóstico privado | Efeitos e eventos próprios da pergunta | PLAN_INTENSITY_PARAMETERS_UNDEFINED |


### Decisão Q154 — proibição integral

{Nome 1} e {Nome 2} comprometem-se a não participar de apostas, bets, cassino, jogos de azar, loterias ou atividades semelhantes envolvendo dinheiro, mesmo em pequenas quantias, tanto com recursos pessoais quanto com recursos familiares.

Aplica-se a todos os pares, sem revelar respostas individuais. Não haverá NÓS DECIDIMOS permissivo, limite mensal de apostas ou R$10 por aposta/recaída. Q154-C permanece privada e encaminha à proteção P10. As 1.200 ações e os 487 textos antes ausentes estão definidos. Permanecem os requisitos funcionais de produção.
