-- ==============================================================================
-- ATUALIZAÇÃO DA REGRA DO BANCO DE RAÇÃO MUNICIPAL (ARAPONGAS - PR)
-- ==============================================================================
-- Nova regra:
-- - Mínimo de 05 animais (cães + gatos >= 5)
-- - 05 a 09 animais: 1 saco de 25kg (25 kg/mês)
-- - 10 a 15 animais: 2 sacos de 25kg (50 kg/mês)
-- - 16 a 20 animais: 3 sacos de 25kg (75 kg/mês)
-- - A cada 5 adicionais: +1 saco de 25kg (+25 kg)
-- ==============================================================================

-- 1. Remove a trava legada de > 7 animais e aplica a trava de >= 5 animais
ALTER TABLE public.solicitacoes_banco_racao 
  DROP CONSTRAINT IF EXISTS check_mais_de_sete_animais;

ALTER TABLE public.solicitacoes_banco_racao 
  DROP CONSTRAINT IF EXISTS check_minimo_cinco_animais;

ALTER TABLE public.solicitacoes_banco_racao 
  ADD CONSTRAINT check_minimo_cinco_animais CHECK (qtd_caes + qtd_gatos >= 5);

-- 2. Recalcula a cota_mensal_kg de solicitações existentes no banco de dados
UPDATE public.solicitacoes_banco_racao
SET cota_mensal_kg = CASE 
  WHEN (qtd_caes + qtd_gatos) < 5 THEN 0
  WHEN (qtd_caes + qtd_gatos) BETWEEN 5 AND 9 THEN 25
  WHEN (qtd_caes + qtd_gatos) BETWEEN 10 AND 15 THEN 50
  WHEN (qtd_caes + qtd_gatos) BETWEEN 16 AND 20 THEN 75
  ELSE 75 + (CEIL(((qtd_caes + qtd_gatos) - 20)::numeric / 5) * 25)
END;

-- Mensagem de confirmação
SELECT 'Constraint e cotas atualizadas com sucesso para a regra oficial de sacos de 25kg!' AS resultado;
