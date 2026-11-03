-- ==============================================================================
-- 🚀 PETCONECTA BR / ARAPONGAS - PARANÁ
-- SCRIPT CORRIGIDO E DEFINITIVO: PASSOS 1, 2 E 3
-- Execute este script no Editor SQL do seu Painel Supabase
-- (Menu lateral esquerdo: SQL Editor -> New Query -> Colar e clicar em RUN)
-- ==============================================================================

-- 1. HABILITAR EXTENSÃO DE UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 2. AJUSTAR TABELA DE CLÍNICAS PARCEIRAS (PRE-EXISTENTE NO BANCO DE DADOS)
-- ==============================================================================
-- Garante a criação da tabela se não existir
CREATE TABLE IF NOT EXISTS public.clinicas_parceiras (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  endereco TEXT NOT NULL,
  telefone VARCHAR(30) NOT NULL,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Adiciona as colunas novas caso a tabela já tenha sido criada anteriormente
ALTER TABLE public.clinicas_parceiras ADD COLUMN IF NOT EXISTS razao_social TEXT;
ALTER TABLE public.clinicas_parceiras ADD COLUMN IF NOT EXISTS cnpj VARCHAR(30);
ALTER TABLE public.clinicas_parceiras ADD COLUMN IF NOT EXISTS email VARCHAR(100);
ALTER TABLE public.clinicas_parceiras ADD COLUMN IF NOT EXISTS veterinario_responsavel TEXT;
ALTER TABLE public.clinicas_parceiras ADD COLUMN IF NOT EXISTS crmv VARCHAR(30);
ALTER TABLE public.clinicas_parceiras ADD COLUMN IF NOT EXISTS vagas_castracao_mensal INTEGER DEFAULT 50;
ALTER TABLE public.clinicas_parceiras ADD COLUMN IF NOT EXISTS vagas_consulta_mensal INTEGER DEFAULT 50;
ALTER TABLE public.clinicas_parceiras ADD COLUMN IF NOT EXISTS horario_atendimento TEXT DEFAULT 'Segunda a Sexta, 08h às 18h';
ALTER TABLE public.clinicas_parceiras ADD COLUMN IF NOT EXISTS observacoes TEXT;
ALTER TABLE public.clinicas_parceiras ADD COLUMN IF NOT EXISTS usuario_id UUID;
ALTER TABLE public.clinicas_parceiras ADD COLUMN IF NOT EXISTS usuario_email VARCHAR(100);
ALTER TABLE public.clinicas_parceiras ADD COLUMN IF NOT EXISTS usuario_nome VARCHAR(100);
ALTER TABLE public.clinicas_parceiras ADD COLUMN IF NOT EXISTS ativa BOOLEAN DEFAULT TRUE;

-- Atualizar registro já existente da CentroVet (se houver)
UPDATE public.clinicas_parceiras
SET 
  ativa = TRUE,
  vagas_consulta_mensal = COALESCE(vagas_consulta_mensal, 50),
  horario_atendimento = COALESCE(horario_atendimento, 'Segunda a Sexta, 08h às 18h'),
  usuario_email = COALESCE(usuario_email, 'vet.centrovet@arapongas.pr.gov.br'),
  usuario_nome = COALESCE(usuario_nome, 'Dr. CentroVet')
WHERE id = '5bcb0b4d-e33b-4a96-b2cf-53be5d56b647';

-- Inserir / Atualizar clínicas conveniadas padrão de Arapongas com UUIDs válidos
INSERT INTO public.clinicas_parceiras (
  id, nome, endereco, telefone, email, cnpj, veterinario_responsavel, crmv, vagas_castracao_mensal, vagas_consulta_mensal, horario_atendimento, observacoes, usuario_email, usuario_nome, ativa
) VALUES
(
  'a0000000-0000-0000-0000-000000000001',
  'Hospital Veterinário Municipal de Arapongas',
  'Rua das Pombas, 450 - Centro, Arapongas - PR',
  '(43) 3902-1000',
  'hospital.vet@arapongas.pr.gov.br',
  '76.123.456/0001-89',
  'Dra. Fernanda Albuquerque',
  'CRMV-PR 14.820',
  120,
  100,
  'Segunda a Sexta, 08h às 17h',
  'Hospital central de referência para procedimentos cirúrgicos e castrações em massa.',
  'hospital.vet@arapongas.pr.gov.br',
  'Dra. Fernanda (Hospital Vet)',
  TRUE
),
(
  'a0000000-0000-0000-0000-000000000002',
  'Clínica Veterinária PetVida Arapongas',
  'Av. Arapongas, 1280 - Vila Araponguinha, Arapongas - PR',
  '(43) 99876-5432',
  'contato@petvidaarapongas.com.br',
  '12.345.678/0001-90',
  'Dr. Roberto Mendes',
  'CRMV-PR 18.932',
  50,
  50,
  'Segunda a Sábado, 08h às 18h',
  'Clínica conveniada para castração de cães e gatos de protetores e baixa renda.',
  'vet.petvida@arapongas.pr.gov.br',
  'Dr. Roberto (PetVida)',
  TRUE
),
(
  'a0000000-0000-0000-0000-000000000003',
  'Centro Veterinário São Francisco',
  'Rua Falcão, 310 - Jardim Primavera, Arapongas - PR',
  '(43) 99111-2233',
  'clinica.saofrancisco@gmail.com',
  '98.765.432/0001-11',
  'Dra. Juliana Castro',
  'CRMV-PR 12.345',
  40,
  40,
  'Segunda a Sexta, 08h30 às 17h30',
  'Especializada no atendimento de felinos e cães de pequeno porte.',
  'vet.saofrancisco@arapongas.pr.gov.br',
  'Dra. Juliana (São Francisco)',
  TRUE
)
ON CONFLICT (id) DO UPDATE SET
  nome = EXCLUDED.nome,
  telefone = EXCLUDED.telefone,
  veterinario_responsavel = EXCLUDED.veterinario_responsavel,
  crmv = EXCLUDED.crmv,
  usuario_email = EXCLUDED.usuario_email,
  usuario_nome = EXCLUDED.usuario_nome,
  ativa = EXCLUDED.ativa;

-- ==============================================================================
-- 3. GARANTIR COLUNAS EM PERFIS, FILAS E CONSULTAS
-- ==============================================================================
ALTER TABLE public.perfis ADD COLUMN IF NOT EXISTS email VARCHAR(100);
ALTER TABLE public.perfis ADD COLUMN IF NOT EXISTS crmv VARCHAR(30);
ALTER TABLE public.perfis ADD COLUMN IF NOT EXISTS clinica_id UUID REFERENCES public.clinicas_parceiras(id) ON DELETE SET NULL;
ALTER TABLE public.perfis ADD COLUMN IF NOT EXISTS nis_cadunico VARCHAR(20);
ALTER TABLE public.perfis ADD COLUMN IF NOT EXISTS cidade VARCHAR(100) DEFAULT 'Arapongas - PR';

ALTER TABLE public.filas_castracao ADD COLUMN IF NOT EXISTS clinica_id UUID REFERENCES public.clinicas_parceiras(id) ON DELETE SET NULL;
ALTER TABLE public.consultas ADD COLUMN IF NOT EXISTS clinica_id UUID REFERENCES public.clinicas_parceiras(id) ON DELETE SET NULL;

-- ==============================================================================
-- 4. PASSO 1: TABELAS DO BANCO DE RAÇÃO MUNICIPAL (+7 ANIMAIS) E LOJINHA 3D
-- ==============================================================================

-- 4.1 Tabela de Solicitações do Banco de Ração Municipal
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

-- Regra Municipal: Benefício exclusivo para famílias ou protetores com mais de 7 animais (> 7)
ALTER TABLE public.solicitacoes_banco_racao 
  DROP CONSTRAINT IF EXISTS check_mais_de_sete_animais;
ALTER TABLE public.solicitacoes_banco_racao 
  ADD CONSTRAINT check_mais_de_sete_animais CHECK (qtd_caes + qtd_gatos > 7);

-- 4.2 Tabela de Entregas e Recibos do Banco de Ração
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

-- 4.3 Tabela de Estoque de Ração em Armazém
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

-- Estoque Inicial do Município de Arapongas
INSERT INTO public.estoque_racao (id, especie, faixa_etaria, quantidade_kg, marca, origem)
VALUES
  ('est-001', 'cao', 'adulto', 2000, 'NutriPet Premium Arapongas', 'compra_municipal'),
  ('est-002', 'cao', 'filhote', 500, 'Puppy Care Protetor', 'doacao_empresa'),
  ('est-003', 'gato', 'adulto', 800, 'GatoSabor Mix', 'compra_municipal'),
  ('est-004', 'gato', 'filhote', 300, 'Kitten Baby Felinos', 'doacao_empresa')
ON CONFLICT (id) DO UPDATE SET quantidade_kg = EXCLUDED.quantidade_kg;

-- 4.4 Tabela de Produtos da Lojinha Pet & Impressão 3D
CREATE TABLE IF NOT EXISTS public.loja_produtos (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  slug TEXT UNIQUE,
  descricao TEXT,
  preco NUMERIC(10,2) NOT NULL,
  preco_promocional NUMERIC(10,2),
  categoria VARCHAR(50) NOT NULL,
  fotos TEXT[] DEFAULT '{}',
  estoque INTEGER DEFAULT 50,
  tipo_producao VARCHAR(30) DEFAULT 'impressao_3d',
  tempo_producao_dias INTEGER DEFAULT 2,
  permite_personalizacao BOOLEAN DEFAULT TRUE,
  destaque BOOLEAN DEFAULT FALSE,
  ativo BOOLEAN DEFAULT TRUE,
  reverte_ong BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Produtos Padrão da Lojinha Municipal Solidária
INSERT INTO public.loja_produtos (id, nome, slug, descricao, preco, categoria, estoque, tipo_producao, permite_personalizacao, destaque, ativo, reverte_ong)
VALUES
(
  'prod-001',
  'Plaquinha de Identificação 3D com QR Code Inteligente',
  'plaquinha-identificacao-3d-qr-code',
  'Plaquinha impressa em 3D em filamento PETG naval de alta durabilidade. Inclui gravação a laser do nome do pet, telefone do tutor e QR Code exclusivo conectado ao sistema PetConecta BR.',
  24.90,
  'impressao_3d',
  100,
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
  'Caminha super confortável com espuma de memória, tecido lavável impermeável e zíper para fácil higienização.',
  89.90,
  'camas_conforto',
  25,
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
  'Coleira resistente com fecho de engate rápido e gravação do nome do pet e telefone do tutor em relevo.',
  34.90,
  'coleiras_acessorios',
  50,
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
  'Comedouro projetado para desacelerar a alimentação de cães ansiosos, prevenindo torção gástrica e refluxo.',
  39.90,
  'impressao_3d',
  30,
  'impressao_3d',
  FALSE,
  TRUE,
  TRUE,
  TRUE
),
(
  'prod-005',
  'Chaveiro 3D Silhueta de Raça com Nome do Peludo',
  'chaveiro-3d-silhueta-raca-nome',
  'Chaveiro leve e durável impresso em 3D. 100% do lucro é revertido para o Fundo de Ração Municipal.',
  15.00,
  'impressao_3d',
  80,
  'impressao_3d',
  TRUE,
  FALSE,
  TRUE,
  TRUE
)
ON CONFLICT (id) DO UPDATE SET preco = EXCLUDED.preco, estoque = EXCLUDED.estoque;

-- 4.5 Tabela de Pedidos da Lojinha
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

-- ==============================================================================
-- 5. PASSO 2: BUCKETS DE STORAGE (FOTOS, DOCUMENTOS E DENÚNCIAS)
-- ==============================================================================

-- 5.1 Criação dos Buckets Públicos no Supabase
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('pets', 'pets', true),
  ('documentos', 'documentos', true),
  ('denuncias', 'denuncias', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 5.2 Políticas de Leitura e Upload para os Buckets
DROP POLICY IF EXISTS "Public Access Pets" ON storage.objects;
CREATE POLICY "Public Access Pets" ON storage.objects FOR SELECT USING (bucket_id = 'pets');
DROP POLICY IF EXISTS "Public Upload Pets" ON storage.objects;
CREATE POLICY "Public Upload Pets" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'pets');
DROP POLICY IF EXISTS "Public Update Pets" ON storage.objects;
CREATE POLICY "Public Update Pets" ON storage.objects FOR UPDATE WITH CHECK (bucket_id = 'pets');

DROP POLICY IF EXISTS "Public Access Documentos" ON storage.objects;
CREATE POLICY "Public Access Documentos" ON storage.objects FOR SELECT USING (bucket_id = 'documentos');
DROP POLICY IF EXISTS "Public Upload Documentos" ON storage.objects;
CREATE POLICY "Public Upload Documentos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'documentos');

DROP POLICY IF EXISTS "Public Access Denuncias" ON storage.objects;
CREATE POLICY "Public Access Denuncias" ON storage.objects FOR SELECT USING (bucket_id = 'denuncias');
DROP POLICY IF EXISTS "Public Upload Denuncias" ON storage.objects;
CREATE POLICY "Public Upload Denuncias" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'denuncias');

-- ==============================================================================
-- 6. HABILITAR ROW LEVEL SECURITY (RLS) COM ACESSO COMPLETO NAS TABELAS
-- ==============================================================================
ALTER TABLE public.solicitacoes_banco_racao ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entregas_banco_racao ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estoque_racao ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loja_produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loja_pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinicas_parceiras ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Acesso total solicitacoes_banco_racao" ON public.solicitacoes_banco_racao;
CREATE POLICY "Acesso total solicitacoes_banco_racao" ON public.solicitacoes_banco_racao FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso total entregas_banco_racao" ON public.entregas_banco_racao;
CREATE POLICY "Acesso total entregas_banco_racao" ON public.entregas_banco_racao FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso total estoque_racao" ON public.estoque_racao;
CREATE POLICY "Acesso total estoque_racao" ON public.estoque_racao FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso total loja_produtos" ON public.loja_produtos;
CREATE POLICY "Acesso total loja_produtos" ON public.loja_produtos FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso total loja_pedidos" ON public.loja_pedidos;
CREATE POLICY "Acesso total loja_pedidos" ON public.loja_pedidos FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso total clinicas_parceiras" ON public.clinicas_parceiras;
CREATE POLICY "Acesso total clinicas_parceiras" ON public.clinicas_parceiras FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- FIM DO SCRIPT DE MIGRAÇÃO
-- ==============================================================================
