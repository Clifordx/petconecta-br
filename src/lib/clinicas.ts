import { supabase } from './supabase';
import { Perfil } from '@/types';

export interface ClinicaParceira {
  id: string;
  nome: string;
  endereco: string;
  telefone: string;
  email?: string;
  cnpj?: string;
  veterinario_responsavel?: string;
  crmv?: string;
  vagas_castracao_mensal?: number;
  horario_atendimento?: string;
  observacoes?: string;
  usuario_id?: string;
  usuario_email?: string;
  usuario_nome?: string;
  ativa: boolean;
  criado_em?: string;
}

const STORAGE_CLINICAS = 'petconecta_clinicas_parceiras';

export const CLINICAS_PADRAO: ClinicaParceira[] = [
  {
    id: 'clinica-001',
    nome: 'Hospital Veterinário Municipal de Arapongas',
    endereco: 'Rua das Pombas, 450 - Centro, Arapongas - PR',
    telefone: '(43) 3902-1000',
    email: 'hospital.vet@arapongas.pr.gov.br',
    cnpj: '76.123.456/0001-89',
    veterinario_responsavel: 'Dra. Fernanda Albuquerque',
    crmv: 'CRMV-PR 14.820',
    vagas_castracao_mensal: 120,
    horario_atendimento: 'Segunda a Sexta, 08h às 17h',
    observacoes: 'Hospital central de referência para procedimentos cirúrgicos e castrações em massa.',
    usuario_email: 'hospital.vet@arapongas.pr.gov.br',
    usuario_nome: 'Dra. Fernanda (Hospital Vet)',
    ativa: true,
    criado_em: '2026-01-10T10:00:00Z'
  },
  {
    id: 'clinica-002',
    nome: 'Clínica Veterinária PetVida Arapongas',
    endereco: 'Av. Arapongas, 1280 - Vila Araponguinha, Arapongas - PR',
    telefone: '(43) 99876-5432',
    email: 'contato@petvidaarapongas.com.br',
    cnpj: '12.345.678/0001-90',
    veterinario_responsavel: 'Dr. Roberto Mendes',
    crmv: 'CRMV-PR 18.932',
    vagas_castracao_mensal: 50,
    horario_atendimento: 'Segunda a Sábado, 08h às 18h',
    observacoes: 'Clínica conveniada para castração de cães e gatos de protetores e baixa renda.',
    usuario_email: 'vet.petvida@arapongas.pr.gov.br',
    usuario_nome: 'Dr. Roberto (PetVida)',
    ativa: true,
    criado_em: '2026-02-15T11:00:00Z'
  },
  {
    id: 'clinica-003',
    nome: 'Centro Veterinário São Francisco',
    endereco: 'Rua Falcão, 310 - Jardim Primavera, Arapongas - PR',
    telefone: '(43) 99111-2233',
    email: 'clinica.saofrancisco@gmail.com',
    cnpj: '98.765.432/0001-11',
    veterinario_responsavel: 'Dra. Juliana Castro',
    crmv: 'CRMV-PR 12.345',
    vagas_castracao_mensal: 40,
    horario_atendimento: 'Segunda a Sexta, 08h30 às 17h30',
    observacoes: 'Especializada no atendimento de felinos e cães de pequeno porte.',
    usuario_email: 'vet.saofrancisco@arapongas.pr.gov.br',
    usuario_nome: 'Dra. Juliana (São Francisco)',
    ativa: true,
    criado_em: '2026-03-01T09:00:00Z'
  }
];

// Busca todas as clínicas do Supabase com fallback para localStorage / padrões
export async function fetchClinicasParceiras(): Promise<ClinicaParceira[]> {
  try {
    const { data, error } = await supabase
      .from('clinicas_parceiras')
      .select('*')
      .order('nome');

    if (!error && data && data.length > 0) {
      // Salva em cache local para offline/sync
      localStorage.setItem(STORAGE_CLINICAS, JSON.stringify(data));
      return data;
    }
  } catch (e) {
    console.warn('Erro ao buscar clínicas do Supabase, tentando storage:', e);
  }

  // Tenta localStorage
  try {
    const local = localStorage.getItem(STORAGE_CLINICAS);
    if (local) {
      const parsed = JSON.parse(local);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {}

  // Padrões
  localStorage.setItem(STORAGE_CLINICAS, JSON.stringify(CLINICAS_PADRAO));
  return CLINICAS_PADRAO;
}

// Salva ou atualiza uma clínica
export async function salvarClinicaParceira(clinica: Partial<ClinicaParceira>): Promise<ClinicaParceira> {
  const lista = await fetchClinicasParceiras();
  let clinicaFinal: ClinicaParceira;

  if (clinica.id) {
    const idx = lista.findIndex(c => c.id === clinica.id);
    if (idx >= 0) {
      clinicaFinal = { ...lista[idx], ...clinica, id: clinica.id };
      lista[idx] = clinicaFinal;
    } else {
      clinicaFinal = { ...clinica, id: clinica.id } as ClinicaParceira;
      lista.push(clinicaFinal);
    }
  } else {
    clinicaFinal = {
      ...clinica,
      id: 'clinica-' + Date.now(),
      ativa: true,
      criado_em: new Date().toISOString()
    } as ClinicaParceira;
    lista.push(clinicaFinal);
  }

  localStorage.setItem(STORAGE_CLINICAS, JSON.stringify(lista));

  try {
    await supabase.from('clinicas_parceiras').upsert(clinicaFinal);
  } catch (e) {
    console.warn('Sync com Supabase silencioso:', e);
  }

  return clinicaFinal;
}

// Vincula um usuário/e-mail a uma clínica parceira
export async function vincularUsuarioClinica(
  clinicaId: string, 
  dadosUsuario: { email: string; nome: string; crmv?: string; telefone?: string }
): Promise<void> {
  const clinicas = await fetchClinicasParceiras();
  const cIdx = clinicas.findIndex(c => c.id === clinicaId);
  if (cIdx >= 0) {
    clinicas[cIdx].usuario_email = dadosUsuario.email;
    clinicas[cIdx].usuario_nome = dadosUsuario.nome;
    if (dadosUsuario.crmv) clinicas[cIdx].crmv = dadosUsuario.crmv;
    localStorage.setItem(STORAGE_CLINICAS, JSON.stringify(clinicas));

    try {
      await supabase
        .from('clinicas_parceiras')
        .update({
          usuario_email: dadosUsuario.email,
          usuario_nome: dadosUsuario.nome,
          ...(dadosUsuario.crmv ? { crmv: dadosUsuario.crmv } : {})
        })
        .eq('id', clinicaId);
    } catch {}
  }
}

// Verifica se o usuário atual é uma clínica parceira
export function isUsuarioClinica(profile: Perfil | null): boolean {
  if (!profile) return false;
  return profile.tipo_perfil === 'veterinario' || Boolean(profile.clinica_id);
}

// Obtém o ID da clínica vinculado ao perfil do usuário
export function getClinicaIdDoUsuario(profile: Perfil | null, clinicas: ClinicaParceira[] = []): string | null {
  if (!profile) return null;
  
  // Se tiver clinica_id diretamente no perfil
  if (profile.clinica_id) return profile.clinica_id;

  // Se o tipo_perfil for veterinario, procura clínica com o mesmo e-mail ou nome
  if (profile.tipo_perfil === 'veterinario') {
    const encontrada = clinicas.find(c => 
      (profile.id && c.usuario_id === profile.id) ||
      (c.usuario_email && profile.nome && c.usuario_nome?.toLowerCase() === profile.nome.toLowerCase())
    );
    if (encontrada) return encontrada.id;

    // Fallback: se não tiver vínculo exato ainda, usa a primeira clínica padrão
    if (clinicas.length > 0) return clinicas[0].id;
  }

  return null;
}
