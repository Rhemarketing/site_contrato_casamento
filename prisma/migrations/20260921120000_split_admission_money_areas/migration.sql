-- Atualiza a área das perguntas P22, P23 e P24 do questionário de admissão
UPDATE `questions`
SET `area` = 'dinheiro_casal'
WHERE `code` = 'P22';

UPDATE `questions`
SET `area` = 'casa_filhos_responsabilidades'
WHERE `code` IN ('P23', 'P24');
