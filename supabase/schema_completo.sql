-- ==============================================================================
-- PETCONECTA BR / PET PARANÁ - SCHEMA COMPLETO DE BANCO DE DADOS (SUPABASE / POSTGRESQL)
-- Município Piloto: Arapongas - Paraná
-- ==============================================================================

-- 1. Habilitar extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabela de Municípios
CREATE TABLE IF NOT EXISTS public.municipios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  uf VARCHAR(2) NOT NULL DEFAULT 'PR',
  codigo_ibge VARCHAR(10),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inserir Arapongas como município padrão
INSERT INTO public.municipios (id, nome, uf, codigo_ibge)
VALUES ('00000000-0000-0000-0000-000000000001', 'Arapongas', 'PR', '4101402')
ON CONFLICT (id) DO NOTHING;

-- 3. Tabela de Organizações (Prefeitura, ONGs, Protetores)
CREATE TABLE IF NOT EXISTS public.organizacoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  cnpj VARCHAR(20),
  tipo TEXT CHECK (tipo IN ('PREFEITURA', 'ONG', 'PROTETOR_INDEPENDENTE', 'CLINICA_VETERINARIA')) DEFAULT 'PREFEITURA',
  municipio_id UUID REFERENCES public.municipios(id) ON DELETE SET NULL,
  telefone VARCHAR(30),
  email VARCHAR(100),
  endereco TEXT,
  ativa BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inserir Prefeitura de Arapongas
INSERT INTO public.organizacoes (id, nome, cnpj, tipo, municipio_id, telefone, email, endereco, ativa)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  'Prefeitura Municipal de Arapongas - Secretaria do Meio Ambiente',
  '76.123.456/0001-89',
  'PREFEITURA',
  '00000000-0000-0000-0000-000000000001',
  '(43) 3902-1000',
  'bemestaranimal@arapongas.pr.gov.br',
  'Rua das Garças, 750 - Centro, Arapongas - PR',
  TRUE
) ON CONFLICT (id) DO NOTHING;

-- 4. Tabela de Clínicas Veterinárias Conveniadas
CREATE TABLE IF NOT EXISTS public.clinicas_parceiras (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  razao_social TEXT,
  cnpj VARCHAR(30),
  endereco TEXT NOT NULL,
  telefone VARCHAR(30) NOT NULL,
  email VARCHAR(100),
  veterinario_responsavel TEXT,
  crmv VARCHAR(30),
  vagas_castracao_mensal INTEGER DEFAULT 50,
  vagas_consulta_mensal INTEGER DEFAULT 50,
  horario_atendimento TEXT DEFAULT 'Segunda a Sexta, 08h às 18h',
  observacoes TEXT,
  usuario_id UUID,
  usuario_email VARCHAR(100),
  usuario_nome VARCHAR(100),
  ativa BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Seed de Clínicas Parceiras de Arapongas
INSERT INTO public.clinicas_parceiras (
  id, nome, endereco, telefone, email, cnpj, veterinario_responsavel, crmv, vagas_castracao_mensal, horario_atendimento, observacoes, usuario_email, usuario_nome, ativa
) VALUES
(
  'clinica-001',
  'Hospital Veterinário Municipal de Arapongas',
  'Rua das Pombas, 450 - Centro, Arapongas - PR',
  '(43) 3902-1000',
  'hospital.vet@arapongas.pr.gov.br',
  '76.123.456/0001-89',
  'Dra. Fernanda Albuquerque',
  'CRMV-PR 14.820',
  120,
  'Segunda a Sexta, 08h às 17h',
  'Hospital central de referência para procedimentos cirúrgicos e castrações em massa.',
  'hospital.vet@arapongas.pr.gov.br',
  'Dra. Fernanda (Hospital Vet)',
  TRUE
),
(
  'clinica-002',
  'Clínica Veterinária PetVida Arapongas',
  'Av. Arapongas, 1280 - Vila Araponguinha, Arapongas - PR',
  '(43) 99876-5432',
  'contato@petvidaarapongas.com.br',
  '12.345.678/0001-90',
  'Dr. Roberto Mendes',
  'CRMV-PR 18.932',
  50,
  'Segunda a Sábado, 08h às 18h',
  'Clínica conveniada para castração de cães e gatos de protetores e baixa renda.',
  'vet.petvida@arapongas.pr.gov.br',
  'Dr. Roberto (PetVida)',
  TRUE
),
(
  'clinica-003',
  'Centro Veterinário São Francisco',
  'Rua Falcão, 310 - Jardim Primavera, Arapongas - PR',
  '(43) 99111-2233',
  'clinica.saofrancisco@gmail.com',
  '98.765.432/0001-11',
  'Dra. Juliana Castro',
  'CRMV-PR 12.345',
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
  crmv = EXCLUDED.crmv;

-- 5. Tabela de Perfis de Usuários
CREATE TABLE IF NOT EXISTS public.perfis (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  cpf VARCHAR(18) NOT NULL,
  rg VARCHAR(20),
  data_nascimento DATE,
  telefone VARCHAR(25),
  endereco TEXT,
  numero VARCHAR(20),
  complemento TEXT,
  bairro VARCHAR(100),
  cep VARCHAR(10),
  avatar_url TEXT,
  documento_url TEXT,
  tipo_perfil VARCHAR(30) CHECK (tipo_perfil IN ('cidadao', 'admin_prefeitura', 'admin_ong', 'veterinario', 'super_admin')) DEFAULT 'cidadao',
  municipio_id UUID REFERENCES public.municipios(id) ON DELETE SET NULL,
  organizacao_id UUID REFERENCES public.organizacoes(id) ON DELETE SET NULL,
  clinica_id TEXT REFERENCES public.clinicas_parceiras(id) ON DELETE SET NULL,
  nis_cadunico VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Tabela de Pets Cadastrados
CREATE TABLE IF NOT EXISTS public.pets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  especie VARCHAR(20) CHECK (especie IN ('CACHORRO', 'GATO', 'OUTRO', 'cao', 'gato')) NOT NULL,
  raca VARCHAR(100) DEFAULT 'SRD (Sem Raça Definida)',
  sexo VARCHAR(10) CHECK (sexo IN ('MACHO', 'FEMEA', 'macho', 'femea')) NOT NULL,
  porte VARCHAR(20) CHECK (porte IN ('PEQUENO', 'MEDIO', 'GRANDE', 'pequeno', 'medio', 'grande')) DEFAULT 'MEDIO',
  idade_aproximada VARCHAR(50),
  peso_aproximado NUMERIC(5,2),
  cor VARCHAR(50),
  pelagem VARCHAR(50),
  castrado BOOLEAN DEFAULT FALSE,
  vacinado BOOLEAN DEFAULT FALSE,
  vermifugado BOOLEAN DEFAULT FALSE,
  microchip VARCHAR(50),
  descricao TEXT,
  status VARCHAR(30) DEFAULT 'DISPONIVEL',
  tutor_id UUID REFERENCES public.perfis(id) ON DELETE SET NULL,
  organizacao_id UUID REFERENCES public.organizacoes(id) ON DELETE SET NULL,
  clinica_id TEXT REFERENCES public.clinicas_parceiras(id) ON DELETE SET NULL,
  municipio_id UUID REFERENCES public.municipios(id) ON DELETE SET NULL,
  foto_url TEXT,
  data_resgate DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Tabela de Filas de Castração
CREATE TABLE IF NOT EXISTS public.filas_castracao (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_id UUID REFERENCES public.pets(id) ON DELETE CASCADE,
  tutor_id UUID REFERENCES public.perfis(id) ON DELETE CASCADE,
  clinica_id TEXT REFERENCES public.clinicas_parceiras(id) ON DELETE SET NULL,
  prioridade VARCHAR(20) DEFAULT 'NORMAL',
  status VARCHAR(30) DEFAULT 'AGUARDANDO',
  data_inscricao TIMESTAMPTZ DEFAULT NOW(),
  data_agendamento TIMESTAMPTZ,
  hora_agendamento VARCHAR(10),
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Tabela de Consultas Veterinárias
CREATE TABLE IF NOT EXISTS public.consultas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_id UUID REFERENCES public.pets(id) ON DELETE CASCADE,
  tutor_id UUID REFERENCES public.perfis(id) ON DELETE SET NULL,
  veterinario_id UUID REFERENCES public.perfis(id) ON DELETE SET NULL,
  clinica_id TEXT REFERENCES public.clinicas_parceiras(id) ON DELETE SET NULL,
  data_consulta TIMESTAMPTZ,
  motivo TEXT NOT NULL,
  urgencia VARCHAR(20) DEFAULT 'NORMAL',
  status VARCHAR(30) DEFAULT 'agendada',
  diagnostico TEXT,
  prescricao TEXT,
  peso NUMERIC(5,2),
  temperatura NUMERIC(4,1),
  realizada BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Tabela do Banco de Ração Municipal (+ de 7 animais)
CREATE TABLE IF NOT EXISTS public.solicitacoes_banco_racao (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES public.perfis(id) ON DELETE SET NULL,
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
  total_animais INTEGER GENERATED ALWAYS AS (qtd_caes + qtd_gatos) STORED,
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

-- Regra de validação: Banco de Ração exclusivo para quem possui mais de 7 animais
ALTER TABLE public.solicitacoes_banco_racao 
  DROP CONSTRAINT IF EXISTS check_mais_de_sete_animais;
ALTER TABLE public.solicitacoes_banco_racao 
  ADD CONSTRAINT check_mais_de_sete_animais CHECK (qtd_caes + qtd_gatos > 7);

-- Tabela de Entregas e Recibos do Banco de Ração
CREATE TABLE IF NOT EXISTS public.entregas_banco_racao (
  id TEXT PRIMARY KEY,
  protocolo VARCHAR(50) NOT NULL,
  beneficiario_id TEXT REFERENCES public.solicitacoes_banco_racao(id) ON DELETE CASCADE,
  beneficiario_nome TEXT NOT NULL,
  beneficiario_cpf VARCHAR(18) NOT NULL,
  beneficiario_bairro VARCHAR(100),
  mes_referencia VARCHAR(10) NOT NULL, -- Ex: '2026-10'
  data_entrega DATE NOT NULL DEFAULT CURRENT_DATE,
  quantidade_kg INTEGER NOT NULL,
  tipo_racao VARCHAR(50) DEFAULT 'Cão Adulto (Nutrição Balanceada)',
  responsavel_entrega TEXT NOT NULL,
  observacoes TEXT,
  termo_assinado_url TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Estoque de Ração
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

-- Seed de Estoque Inicial
INSERT INTO public.estoque_racao (id, especie, faixa_etaria, quantidade_kg, marca, origem, data_entrada)
VALUES
  ('est-001', 'cao', 'adulto', 1250, 'NutriPet Premium Arapongas', 'compra_municipal', CURRENT_DATE),
  ('est-002', 'cao', 'filhote', 320, 'Puppy Care', 'doacao_empresa', CURRENT_DATE),
  ('est-003', 'gato', 'adulto', 450, 'GatoSabor Mix', 'compra_municipal', CURRENT_DATE),
  ('est-004', 'gato', 'filhote', 180, 'Kitten Baby', 'doacao_empresa', CURRENT_DATE)
ON CONFLICT (id) DO UPDATE SET quantidade_kg = EXCLUDED.quantidade_kg;

-- 10. Tabela de Produtos da Lojinha Pet 3D
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

-- Seed de Produtos
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

-- 11. Tabela de Pedidos da Lojinha
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

-- 12. Tabela de Denúncias
CREATE TABLE IF NOT EXISTS public.denuncias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  protocolo VARCHAR(30) UNIQUE NOT NULL,
  tipo VARCHAR(50) NOT NULL,
  urgencia VARCHAR(20) DEFAULT 'MEDIA',
  descricao TEXT NOT NULL,
  anonima BOOLEAN DEFAULT FALSE,
  denunciante_nome TEXT,
  denunciante_telefone VARCHAR(25),
  denunciante_email VARCHAR(100),
  endereco TEXT NOT NULL,
  bairro VARCHAR(100),
  cidade VARCHAR(100) DEFAULT 'Arapongas - PR',
  ponto_referencia TEXT,
  latitude NUMERIC(10,7),
  longitude NUMERIC(10,7),
  fotos TEXT[] DEFAULT '{}',
  status VARCHAR(30) DEFAULT 'recebida',
  parecer_fiscal TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Tabela de Feiras de Adoção
CREATE TABLE IF NOT EXISTS public.feiras (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo TEXT NOT NULL,
  descricao TEXT,
  data DATE NOT NULL,
  horario_inicio VARCHAR(10) NOT NULL,
  horario_fim VARCHAR(10) NOT NULL,
  local TEXT NOT NULL,
  endereco TEXT NOT NULL,
  banner_url TEXT,
  status VARCHAR(20) DEFAULT 'AGENDADA',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. Tabela de Adoções Concluídas (com Termo e Assinatura Digital)
CREATE TABLE IF NOT EXISTS public.adocoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_id UUID REFERENCES public.pets(id) ON DELETE CASCADE,
  adotante_nome TEXT NOT NULL,
  adotante_cpf VARCHAR(18) NOT NULL,
  adotante_telefone VARCHAR(25) NOT NULL,
  adotante_email VARCHAR(100),
  adotante_endereco TEXT NOT NULL,
  adotante_bairro VARCHAR(100),
  adotante_cidade VARCHAR(100) DEFAULT 'Arapongas - PR',
  feira_id UUID REFERENCES public.feiras(id) ON DELETE SET NULL,
  assinatura_digital_url TEXT,
  termo_pdf_url TEXT,
  status VARCHAR(30) DEFAULT 'concluida',
  data_adocao TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. HABILITAR ROW LEVEL SECURITY (RLS) COM PERMISSÕES FLEXÍVEIS
ALTER TABLE public.municipios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinicas_parceiras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.perfis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.filas_castracao ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solicitacoes_banco_racao ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entregas_banco_racao ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estoque_racao ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loja_produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loja_pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.denuncias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feiras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.adocoes ENABLE ROW LEVEL SECURITY;

-- Políticas de Leitura Pública
DROP POLICY IF EXISTS "Leitura pública de municípios" ON public.municipios;
CREATE POLICY "Leitura pública de municípios" ON public.municipios FOR SELECT USING (true);

DROP POLICY IF EXISTS "Leitura pública de clínicas parceiras" ON public.clinicas_parceiras;
CREATE POLICY "Leitura pública de clínicas parceiras" ON public.clinicas_parceiras FOR SELECT USING (true);

DROP POLICY IF EXISTS "Leitura pública de pets disponíveis" ON public.pets;
CREATE POLICY "Leitura pública de pets disponíveis" ON public.pets FOR SELECT USING (true);

DROP POLICY IF EXISTS "Leitura pública de produtos da loja" ON public.loja_produtos;
CREATE POLICY "Leitura pública de produtos da loja" ON public.loja_produtos FOR SELECT USING (true);

DROP POLICY IF EXISTS "Leitura pública de feiras de adoção" ON public.feiras;
CREATE POLICY "Leitura pública de feiras de adoção" ON public.feiras FOR SELECT USING (true);

DROP POLICY IF EXISTS "Acesso e escrita para usuários autenticados e anônimos no banco de ração" ON public.solicitacoes_banco_racao;
CREATE POLICY "Acesso e escrita para usuários autenticados e anônimos no banco de ração" ON public.solicitacoes_banco_racao FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso total à loja pedidos" ON public.loja_pedidos;
CREATE POLICY "Acesso total à loja pedidos" ON public.loja_pedidos FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso total a perfis" ON public.perfis;
CREATE POLICY "Acesso total a perfis" ON public.perfis FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso total a consultas" ON public.consultas;
CREATE POLICY "Acesso total a consultas" ON public.consultas FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso total a filas castracao" ON public.filas_castracao;
CREATE POLICY "Acesso total a filas castracao" ON public.filas_castracao FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- FIM DO SCHEMA COMPLETO PETCONECTA BR
-- ==============================================================================
