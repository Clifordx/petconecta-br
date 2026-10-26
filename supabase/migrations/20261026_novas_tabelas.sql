-- ==============================================================================
-- MIGRAÇÃO ESPECÍFICA: BANCO DE RAÇÃO (+7 ANIMAIS) E LOJINHA PET 3D
-- Cole e execute no Editor SQL do seu Painel do Supabase
-- ==============================================================================

-- 1. TABELA DE SOLICITAÇÕES DO BANCO DE RAÇÃO MUNICIPAL
CREATE TABLE IF NOT EXISTS public.solicitacoes_banco_racao (
  id TEXT PRIMARY KEY,
  user_id UUID,
  nome TEXT NOT NULL,
  cpf VARCHAR(18) NOT NULL,
  telefone VARCHAR(25) NOT NULL,
  tipo VARCHAR(30) CHECK (tipo IN ('protetor_independente', 'baixa_renda', 'ong')) DEFAULT 'baixa_renda',
  nis_cadunico VARCHAR(20),
  endereco TEXT NOT NULL,
  bairro VARCHAR(100) NOT NULL,
  cidade VARCHAR(100) DEFAULT 'Arapongas - PR',
  qtd_caes INTEGER NOT NULL DEFAULT 0,
  qtd_gatos INTEGER NOT NULL DEFAULT 0,
  cota_mensal_kg INTEGER NOT NULL DEFAULT 30,
  status VARCHAR(30) CHECK (status IN ('aprovado', 'em_analise', 'rejeitado', 'suspenso')) DEFAULT 'em_analise',
  motivo_rejeicao TEXT,
  observacoes TEXT,
  documento_cadunico_url TEXT,
  documento_rg_url TEXT,
  comprovante_residencia_url TEXT,
  fotos_animais_url TEXT[],
  protocolo_solicitacao VARCHAR(50),
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Regra de negócio municipal: Permitido apenas para quem tem mais de 7 animais (> 7)
ALTER TABLE public.solicitacoes_banco_racao 
  DROP CONSTRAINT IF EXISTS check_mais_de_sete_animais;
ALTER TABLE public.solicitacoes_banco_racao 
  ADD CONSTRAINT check_mais_de_sete_animais CHECK (qtd_caes + qtd_gatos > 7);

-- 2. TABELA DE ENTREGAS E RECIBOS DO BANCO DE RAÇÃO
CREATE TABLE IF NOT EXISTS public.entregas_banco_racao (
  id TEXT PRIMARY KEY,
  protocolo VARCHAR(50) NOT NULL,
  beneficiario_id TEXT REFERENCES public.solicitacoes_banco_racao(id) ON DELETE CASCADE,
  beneficiario_nome TEXT NOT NULL,
  beneficiario_cpf VARCHAR(18) NOT NULL,
  beneficiario_bairro VARCHAR(100),
  mes_referencia VARCHAR(10) NOT NULL,
  data_entrega DATE NOT NULL DEFAULT CURRENT_DATE,
  quantidade_kg INTEGER NOT NULL,
  tipo_racao VARCHAR(50) DEFAULT 'Cão Adulto (Nutrição Balanceada)',
  responsavel_entrega TEXT NOT NULL,
  observacoes TEXT,
  termo_assinado_url TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABELA DE ESTOQUE DE RAÇÃO
CREATE TABLE IF NOT EXISTS public.estoque_racao (
  id TEXT PRIMARY KEY,
  especie VARCHAR(20) NOT NULL,
  faixa_etaria VARCHAR(20) NOT NULL,
  quantidade_kg INTEGER NOT NULL DEFAULT 0,
  marca VARCHAR(100),
  origem VARCHAR(50) DEFAULT 'compra_municipal',
  data_entrada DATE DEFAULT CURRENT_DATE,
  observacoes TEXT
);

-- Inserção de Estoque Inicial
INSERT INTO public.estoque_racao (id, especie, faixa_etaria, quantidade_kg, marca, origem)
VALUES
  ('est-001', 'cao', 'adulto', 1500, 'NutriPet Premium Arapongas', 'compra_municipal'),
  ('est-002', 'cao', 'filhote', 400, 'Puppy Care', 'doacao_empresa'),
  ('est-003', 'gato', 'adulto', 500, 'GatoSabor Mix', 'compra_municipal')
ON CONFLICT (id) DO UPDATE SET quantidade_kg = EXCLUDED.quantidade_kg;

-- 4. TABELA DE PRODUTOS DA LOJINHA PET 3D
CREATE TABLE IF NOT EXISTS public.loja_produtos (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  slug TEXT UNIQUE,
  descricao TEXT,
  preco NUMERIC(10,2) NOT NULL,
  preco_promocional NUMERIC(10,2),
  categoria VARCHAR(50) NOT NULL,
  fotos TEXT[] DEFAULT '{}',
  estoque INTEGER DEFAULT 10,
  tipo_producao VARCHAR(30) DEFAULT 'impressao_3d',
  tempo_producao_dias INTEGER DEFAULT 2,
  permite_personalizacao BOOLEAN DEFAULT TRUE,
  destaque BOOLEAN DEFAULT FALSE,
  ativo BOOLEAN DEFAULT TRUE,
  reverte_ong BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Inserção de Produtos Padrão
INSERT INTO public.loja_produtos (id, nome, slug, descricao, preco, categoria, estoque, tipo_producao, permite_personalizacao, destaque, ativo, reverte_ong)
VALUES
(
  'prod-001',
  'Plaquinha de Identificação 3D com QR Code Inteligente',
  'plaquinha-identificacao-3d-qr-code',
  'Plaquinha impressa em 3D em filamento PETG de alta resistência. Inclui QR Code gravado a laser com link público do seu pet.',
  24.90,
  'impressao_3d',
  50,
  'impressao_3d',
  TRUE,
  TRUE,
  TRUE,
  TRUE
),
(
  'prod-002',
  'Caminha Ortopédica Pet Nuvem (Tamanhos P ao GG)',
  'caminha-ortopedica-pet-nuvem',
  'Caminha super confortável com espuma de memória e tecido lavável impermeável.',
  89.90,
  'camas_conforto',
  15,
  'pronta_entrega',
  TRUE,
  TRUE,
  TRUE,
  TRUE
),
(
  'prod-003',
  'Coleira Ajustável Personalizada com Nome Bordado',
  'coleira-ajustavel-personalizada',
  'Coleira resistente com fecho de engate rápido e gravação do nome do pet e telefone do tutor.',
  34.90,
  'coleiras_acessorios',
  30,
  'sob_encomenda',
  TRUE,
  FALSE,
  TRUE,
  TRUE
),
(
  'prod-004',
  'Comedouro Lento Anti-Engasgo 3D Formato Labirinto',
  'comedouro-anti-engasgo-3d',
  'Comedouro projetado para desacelerar a alimentação de cães ansiosos, prevenindo torção gástrica.',
  39.90,
  'impressao_3d',
  20,
  'impressao_3d',
  FALSE,
  TRUE,
  TRUE,
  TRUE
)
ON CONFLICT (id) DO UPDATE SET preco = EXCLUDED.preco, estoque = EXCLUDED.estoque;

-- 5. TABELA DE PEDIDOS DA LOJINHA
CREATE TABLE IF NOT EXISTS public.loja_pedidos (
  id TEXT PRIMARY KEY,
  numero_pedido VARCHAR(30) UNIQUE NOT NULL,
  cliente_nome TEXT NOT NULL,
  cliente_telefone VARCHAR(25) NOT NULL,
  cliente_cpf VARCHAR(18),
  cliente_endereco TEXT NOT NULL,
  cliente_bairro VARCHAR(100),
  cliente_cidade VARCHAR(100) DEFAULT 'Arapongas - PR',
  itens JSONB NOT NULL DEFAULT '[]',
  valor_subtotal NUMERIC(10,2) NOT NULL,
  taxa_entrega NUMERIC(10,2) DEFAULT 0.00,
  valor_total NUMERIC(10,2) NOT NULL,
  metodo_pagamento VARCHAR(30) DEFAULT 'pix',
  status VARCHAR(30) CHECK (status IN ('pendente', 'em_producao', 'enviado', 'pronto_retirada', 'entregue', 'cancelado')) DEFAULT 'pendente',
  observacoes TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- HABILITAR RLS COM ACESSO COMPLETO
ALTER TABLE public.solicitacoes_banco_racao ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entregas_banco_racao ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estoque_racao ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loja_produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loja_pedidos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Acesso total solicitacoes_banco_racao" ON public.solicitacoes_banco_racao FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total entregas_banco_racao" ON public.entregas_banco_racao FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total estoque_racao" ON public.estoque_racao FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total loja_produtos" ON public.loja_produtos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total loja_pedidos" ON public.loja_pedidos FOR ALL USING (true) WITH CHECK (true);
