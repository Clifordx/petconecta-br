-- ==============================================================================
-- TABELA DE SOS ANIMAIS PERDIDOS & ENCONTRADOS (ACHADOS E PERDIDOS)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.sos_animais (
  id TEXT PRIMARY KEY,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('perdido', 'encontrado')),
  status VARCHAR(20) NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'resolvido')),
  pet_id UUID REFERENCES public.pets(id) ON DELETE SET NULL,
  nome TEXT NOT NULL,
  especie VARCHAR(20) NOT NULL DEFAULT 'cachorro',
  raca TEXT,
  sexo VARCHAR(20) DEFAULT 'indefinido',
  porte VARCHAR(20) DEFAULT 'medio',
  cor TEXT,
  foto_url TEXT NOT NULL,
  bairro TEXT NOT NULL,
  cidade TEXT NOT NULL DEFAULT 'Arapongas - PR',
  ponto_referencia TEXT,
  data_ocorrencia DATE NOT NULL DEFAULT CURRENT_DATE,
  recompensa TEXT,
  descricao TEXT,
  contato_nome TEXT NOT NULL,
  contato_telefone TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Habilita Row Level Security
ALTER TABLE public.sos_animais ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso público para permitir consulta e cadastro direto pelo cidadão
DROP POLICY IF EXISTS "Permitir leitura publica de sos_animais" ON public.sos_animais;
CREATE POLICY "Permitir leitura publica de sos_animais" ON public.sos_animais FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir insercao publica de sos_animais" ON public.sos_animais;
CREATE POLICY "Permitir insercao publica de sos_animais" ON public.sos_animais FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir atualizacao publica de sos_animais" ON public.sos_animais;
CREATE POLICY "Permitir atualizacao publica de sos_animais" ON public.sos_animais FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Permitir exclusao publica de sos_animais" ON public.sos_animais;
CREATE POLICY "Permitir exclusao publica de sos_animais" ON public.sos_animais FOR DELETE USING (true);
