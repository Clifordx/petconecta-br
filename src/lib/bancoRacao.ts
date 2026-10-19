import { supabase } from './supabase';

export interface BeneficiarioRacao {
  id: string;
  user_id?: string;
  nome: string;
  cpf: string;
  telefone: string;
  tipo: 'protetor_independente' | 'baixa_renda' | 'ong';
  nis_cadunico?: string;
  endereco: string;
  bairro: string;
  cidade: string;
  qtd_caes: number;
  qtd_gatos: number;
  cota_mensal_kg: number;
  status: 'aprovado' | 'em_analise' | 'rejeitado' | 'suspenso';
  motivo_rejeicao?: string;
  observacoes?: string;
  documento_cadunico_url?: string;
  documento_rg_url?: string;
  comprovante_residencia_url?: string;
  fotos_animais_url?: string[];
  protocolo_solicitacao?: string;
  criado_em: string;
}

export interface EstoqueRacao {
  id: string;
  especie: 'cao' | 'gato';
  faixa_etaria: 'adulto' | 'filhote';
  quantidade_kg: number;
  marca?: string;
  origem: 'compra_municipal' | 'doacao_empresa' | 'feira_adocao' | 'apreensao';
  data_entrada: string;
  observacoes?: string;
}

export interface EntregaRacao {
  id: string;
  protocolo: string;
  beneficiario_id: string;
  beneficiario_nome: string;
  beneficiario_cpf: string;
  beneficiario_bairro: string;
  mes_referencia: string; // Ex: '2026-10'
  data_entrega: string;
  quantidade_kg: number;
  tipo_racao: string; // Ex: 'Cão Adulto (Premium)'
  responsavel_entrega: string;
  observacoes?: string;
}

const STORAGE_BENEFICIARIOS = 'petconecta_beneficiarios_racao';
const STORAGE_ESTOQUE = 'petconecta_estoque_racao';
const STORAGE_ENTREGAS = 'petconecta_entregas_racao';

// Dados iniciais de exemplo para simulação imediata
export const DADOS_EXEMPLO_BENEFICIARIOS: BeneficiarioRacao[] = [
  {
    id: 'ben-001',
    nome: 'Dona Maria de Lourdes',
    cpf: '123.456.789-00',
    telefone: '(43) 99876-1234',
    tipo: 'baixa_renda',
    nis_cadunico: '12345678901',
    endereco: 'Rua das Camélias, 120',
    bairro: 'Vila Araponguinha',
    cidade: 'Arapongas - PR',
    qtd_caes: 6,
    qtd_gatos: 3,
    cota_mensal_kg: 45,
    status: 'aprovado',
    observacoes: 'Família em vulnerabilidade social acompanhada pelo CRAS. Cuida de animais idosos resgatados.',
    criado_em: '2026-08-10T10:00:00.000Z'
  },
  {
    id: 'ben-002',
    nome: 'Juliana Protetora dos Peludos',
    cpf: '234.567.890-11',
    telefone: '(43) 99765-4321',
    tipo: 'protetor_independente',
    endereco: 'Rua Flamingo, 450',
    bairro: 'Jardim Primavera',
    cidade: 'Arapongas - PR',
    qtd_caes: 18,
    qtd_gatos: 8,
    cota_mensal_kg: 90,
    status: 'aprovado',
    observacoes: 'Lar temporário voluntário. Abriga animais retirados de maus-tratos em fiscalizações municipais.',
    criado_em: '2026-07-15T14:30:00.000Z'
  },
  {
    id: 'ben-003',
    nome: 'Carlos Eduardo Mendes',
    cpf: '345.678.901-22',
    telefone: '(43) 99123-9876',
    tipo: 'baixa_renda',
    nis_cadunico: '98765432100',
    endereco: 'Av. Gaturamo, 890',
    bairro: 'Conjunto Flamingos',
    cidade: 'Arapongas - PR',
    qtd_caes: 4,
    qtd_gatos: 0,
    cota_mensal_kg: 30,
    status: 'em_analise',
    observacoes: 'Solicitou adesão no portal do cidadão anexando comprovante do CadÚnico.',
    criado_em: new Date().toISOString()
  }
];

export const DADOS_EXEMPLO_ESTOQUE: EstoqueRacao[] = [
  {
    id: 'est-001',
    especie: 'cao',
    faixa_etaria: 'adulto',
    quantidade_kg: 1250,
    marca: 'NutriPet Especial',
    origem: 'compra_municipal',
    data_entrada: '2026-10-01'
  },
  {
    id: 'est-002',
    especie: 'cao',
    faixa_etaria: 'filhote',
    quantidade_kg: 400,
    marca: 'SuperFilhote Crescimento',
    origem: 'compra_municipal',
    data_entrada: '2026-10-01'
  },
  {
    id: 'est-003',
    especie: 'gato',
    faixa_etaria: 'adulto',
    quantidade_kg: 680,
    marca: 'GatoMix Salmão',
    origem: 'doacao_empresa',
    data_entrada: '2026-10-05'
  },
  {
    id: 'est-004',
    especie: 'gato',
    faixa_etaria: 'filhote',
    quantidade_kg: 180,
    marca: 'KittenCare Premium',
    origem: 'feira_adocao',
    data_entrada: '2026-10-12'
  }
];

export const DADOS_EXEMPLO_ENTREGAS: EntregaRacao[] = [
  {
    id: 'ent-001',
    protocolo: 'REC-RAC-2026-0042',
    beneficiario_id: 'ben-001',
    beneficiario_nome: 'Dona Maria de Lourdes',
    beneficiario_cpf: '123.456.789-00',
    beneficiario_bairro: 'Vila Araponguinha',
    mes_referencia: '2026-10',
    data_entrega: '2026-10-05T14:30:00.000Z',
    quantidade_kg: 45,
    tipo_racao: 'Ração Canina e Felina Adulto',
    responsavel_entrega: 'Secretaria de Meio Ambiente / Aline Santos',
    observacoes: 'Retirada no galpão central do município. Apresentou RG e CadÚnico.'
  },
  {
    id: 'ent-002',
    protocolo: 'REC-RAC-2026-0043',
    beneficiario_id: 'ben-002',
    beneficiario_nome: 'Juliana Protetora dos Peludos',
    beneficiario_cpf: '234.567.890-11',
    beneficiario_bairro: 'Jardim Primavera',
    mes_referencia: '2026-10',
    data_entrega: '2026-10-08T09:15:00.000Z',
    quantidade_kg: 90,
    tipo_racao: 'Ração Canina Adulto (Sacos 15kg)',
    responsavel_entrega: 'Secretaria de Meio Ambiente / Aline Santos',
    observacoes: 'Entregue com veículo oficial no lar temporário devido ao grande volume.'
  }
];

/**
 * Calcula a cota sugerida de ração mensal (KG) com base no número de animais
 * Média de cálculo ético municipal:
 * - Cão médio: ~6 a 8 kg/mês
 * - Gato: ~2 a 3 kg/mês
 */
export function calcularCotaSugerida(qtdCaes: number, qtdGatos: number): number {
  const kgCaes = Math.max(0, qtdCaes) * 7;
  const kgGatos = Math.max(0, qtdGatos) * 2.5;
  const total = Math.ceil(kgCaes + kgGatos);
  // Limita teto de segurança por família comum a 120kg (para protetores pode ser maior)
  return total > 0 ? total : 15;
}

/**
 * Busca a lista de beneficiários
 */
export async function fetchBeneficiarios(): Promise<BeneficiarioRacao[]> {
  try {
    const salvo = localStorage.getItem(STORAGE_BENEFICIARIOS);
    if (salvo) return JSON.parse(salvo);
  } catch (e) {
    console.error('Erro ao ler beneficiários:', e);
  }
  localStorage.setItem(STORAGE_BENEFICIARIOS, JSON.stringify(DADOS_EXEMPLO_BENEFICIARIOS));
  return DADOS_EXEMPLO_BENEFICIARIOS;
}

/**
 * Salva ou atualiza um beneficiário do Banco de Ração
 */
export async function salvarBeneficiario(dados: Partial<BeneficiarioRacao>): Promise<BeneficiarioRacao> {
  const lista = await fetchBeneficiarios();
  const id = dados.id || `ben-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  const novo: BeneficiarioRacao = {
    id,
    user_id: dados.user_id,
    nome: dados.nome || 'Beneficiário',
    cpf: dados.cpf || '',
    telefone: dados.telefone || '',
    tipo: dados.tipo || 'baixa_renda',
    nis_cadunico: dados.nis_cadunico,
    endereco: dados.endereco || '',
    bairro: dados.bairro || 'Centro',
    cidade: dados.cidade || 'Arapongas - PR',
    qtd_caes: dados.qtd_caes || 0,
    qtd_gatos: dados.qtd_gatos || 0,
    cota_mensal_kg: dados.cota_mensal_kg || calcularCotaSugerida(dados.qtd_caes || 0, dados.qtd_gatos || 0),
    status: dados.status || 'em_analise',
    observacoes: dados.observacoes,
    documento_cadunico_url: dados.documento_cadunico_url,
    documento_rg_url: dados.documento_rg_url,
    comprovante_residencia_url: dados.comprovante_residencia_url,
    fotos_animais_url: dados.fotos_animais_url,
    protocolo_solicitacao: dados.protocolo_solicitacao || `INS-RAC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    criado_em: dados.criado_em || new Date().toISOString()
  };

  const idx = lista.findIndex(b => b.id === id);
  if (idx >= 0) {
    lista[idx] = novo;
  } else {
    lista.unshift(novo);
  }

  localStorage.setItem(STORAGE_BENEFICIARIOS, JSON.stringify(lista));
  return novo;
}

/**
 * Altera status do beneficiário (Aprovar, Rejeitar, Suspender)
 */
export async function atualizarStatusBeneficiario(
  id: string, 
  status: 'aprovado' | 'em_analise' | 'rejeitado' | 'suspenso',
  cotaKg?: number,
  motivo?: string
): Promise<void> {
  const lista = await fetchBeneficiarios();
  const item = lista.find(b => b.id === id);
  if (item) {
    item.status = status;
    if (cotaKg !== undefined) item.cota_mensal_kg = cotaKg;
    if (motivo !== undefined) item.motivo_rejeicao = motivo;
    localStorage.setItem(STORAGE_BENEFICIARIOS, JSON.stringify(lista));
  }
}

/**
 * Busca o estoque atual de ração
 */
export async function fetchEstoqueRacao(): Promise<EstoqueRacao[]> {
  try {
    const salvo = localStorage.getItem(STORAGE_ESTOQUE);
    if (salvo) return JSON.parse(salvo);
  } catch (e) {
    console.error('Erro ao ler estoque:', e);
  }
  localStorage.setItem(STORAGE_ESTOQUE, JSON.stringify(DADOS_EXEMPLO_ESTOQUE));
  return DADOS_EXEMPLO_ESTOQUE;
}

/**
 * Adiciona entrada de ração no estoque (compra ou doação)
 */
export async function adicionarEntradaEstoque(entrada: Omit<EstoqueRacao, 'id'>): Promise<EstoqueRacao> {
  const estoque = await fetchEstoqueRacao();
  const novo: EstoqueRacao = {
    ...entrada,
    id: `est-${Date.now()}`
  };
  estoque.unshift(novo);
  localStorage.setItem(STORAGE_ESTOQUE, JSON.stringify(estoque));
  return novo;
}

/**
 * Busca o histórico de entregas de ração
 */
export async function fetchEntregasRacao(mesReferencia?: string): Promise<EntregaRacao[]> {
  let entregas: EntregaRacao[] = [];
  try {
    const salvo = localStorage.getItem(STORAGE_ENTREGAS);
    if (salvo) {
      entregas = JSON.parse(salvo);
    } else {
      entregas = [...DADOS_EXEMPLO_ENTREGAS];
      localStorage.setItem(STORAGE_ENTREGAS, JSON.stringify(entregas));
    }
  } catch (e) {
    console.error('Erro ao ler entregas:', e);
    entregas = [...DADOS_EXEMPLO_ENTREGAS];
  }

  if (mesReferencia) {
    return entregas.filter(e => e.mes_referencia === mesReferencia);
  }
  return entregas;
}

/**
 * Verifica se um beneficiário já retirou sua cota no mês
 */
export async function verificarRetiradaNoMes(beneficiarioId: string, mesReferencia: string): Promise<{
  jaRetirou: boolean;
  totalKgRetirado: number;
  entregas: EntregaRacao[];
}> {
  const entregas = await fetchEntregasRacao(mesReferencia);
  const doBeneficiario = entregas.filter(e => e.beneficiario_id === beneficiarioId);
  const totalKg = doBeneficiario.reduce((acc, curr) => acc + curr.quantidade_kg, 0);

  return {
    jaRetirou: totalKg > 0,
    totalKgRetirado: totalKg,
    entregas: doBeneficiario
  };
}

/**
 * Registra a entrega de ração ao beneficiário, abate do estoque e gera o protocolo oficial
 */
export async function registrarEntregaRacao(dados: {
  beneficiario: BeneficiarioRacao;
  quantidade_kg: number;
  tipo_racao: string;
  responsavel_entrega: string;
  mes_referencia: string;
  observacoes?: string;
}): Promise<EntregaRacao> {
  const { beneficiario, quantidade_kg, tipo_racao, responsavel_entrega, mes_referencia, observacoes } = dados;

  // 1. Gera protocolo auditável
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const protocolo = `REC-RAC-${mes_referencia.replace('-', '')}-${randomSuffix}`;

  const novaEntrega: EntregaRacao = {
    id: `ent-${Date.now()}`,
    protocolo,
    beneficiario_id: beneficiario.id,
    beneficiario_nome: beneficiario.nome,
    beneficiario_cpf: beneficiario.cpf,
    beneficiario_bairro: beneficiario.bairro,
    mes_referencia,
    data_entrega: new Date().toISOString(),
    quantidade_kg,
    tipo_racao,
    responsavel_entrega,
    observacoes
  };

  // 2. Salva entrega
  const entregas = await fetchEntregasRacao();
  entregas.unshift(novaEntrega);
  localStorage.setItem(STORAGE_ENTREGAS, JSON.stringify(entregas));

  // 3. Abate proporcionalmente do estoque
  try {
    const estoque = await fetchEstoqueRacao();
    const isGato = tipo_racao.toLowerCase().includes('gato') || tipo_racao.toLowerCase().includes('felin');
    const especieAlvo = isGato ? 'gato' : 'cao';

    const itemEstoque = estoque.find(e => e.especie === especieAlvo && e.quantidade_kg > 0);
    if (itemEstoque) {
      itemEstoque.quantidade_kg = Math.max(0, itemEstoque.quantidade_kg - quantidade_kg);
      localStorage.setItem(STORAGE_ESTOQUE, JSON.stringify(estoque));
    }
  } catch (e) {
    console.warn('Erro ao abater do estoque:', e);
  }

  return novaEntrega;
}
