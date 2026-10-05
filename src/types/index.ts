export interface Municipio {
  id: string;
  nome: string;
  uf: string;
  codigo_ibge: string;
  created_at: string;
}

export interface Organizacao {
  id: string;
  nome: string;
  cnpj: string;
  tipo: 'PREFEITURA' | 'ONG' | 'PROTETOR_INDEPENDENTE' | 'CLINICA_VETERINARIA';
  municipio_id: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  ativa: boolean;
  created_at: string;
  updated_at: string;
}

export interface Perfil {
  id: string;
  nome: string;
  cpf: string;
  telefone?: string;
  endereco?: string;
  bairro?: string;
  numero?: string;
  complemento?: string;
  municipio_id?: string;
  papel: 'CIDADAO' | 'ADMIN_MUNICIPIO' | 'MEMBRO_ONG' | 'VETERINARIO' | 'SUPER_ADMIN';
  organizacao_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Pet {
  id: string;
  nome: string;
  especie: 'CACHORRO' | 'GATO' | 'OUTRO';
  raca?: string;
  sexo: 'MACHO' | 'FEMEA';
  porte: 'PEQUENO' | 'MEDIO' | 'GRANDE';
  idade_aproximada?: string;
  peso_aproximado?: number;
  cor?: string;
  pelagem?: string;
  castrado: boolean;
  vacinado: boolean;
  vermifugado: boolean;
  microchip?: string;
  descricao?: string;
  status: 'DISPONIVEL' | 'ADOTADO' | 'EM_TRATAMENTO' | 'PERDIDO' | 'OBITO';
  tutor_id?: string;
  organizacao_id?: string;
  municipio_id: string;
  data_resgate?: string;
  created_at: string;
  updated_at: string;
}

export interface FotoPet {
  id: string;
  pet_id: string;
  url: string;
  principal: boolean;
  created_at: string;
}

export interface CampanhaCastracao {
  id: string;
  nome: string;
  descricao?: string;
  data_inicio: string;
  data_fim: string;
  vagas_total: number;
  vagas_disponiveis: number;
  municipio_id: string;
  organizacao_id: string;
  status: 'PLANEJADA' | 'ATIVA' | 'FINALIZADA' | 'CANCELADA';
  created_at: string;
}

export interface FilaCastracao {
  id: string;
  pet_id: string;
  tutor_id: string;
  campanha_id?: string;
  municipio_id: string;
  status: 'AGUARDANDO' | 'APROVADO' | 'AGENDADO' | 'REALIZADO' | 'CANCELADO';
  data_agendamento?: string;
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

export interface Consulta {
  id: string;
  pet_id: string;
  veterinario_id: string;
  clinica_id?: string;
  data_consulta: string;
  motivo: string;
  diagnostico?: string;
  prescricao?: string;
  peso?: number;
  realizada: boolean;
  created_at: string;
  updated_at: string;
}

export interface Denuncia {
  id: string;
  protocolo: string;
  denunciante_id?: string; // null if anonymous
  anonima: boolean;
  municipio_id: string;
  endereco: string;
  bairro?: string;
  ponto_referencia?: string;
  coordenadas?: { lat: number; lng: number };
  descricao: string;
  especie_animal?: string;
  quantidade_animais?: number;
  status: 'NOVA' | 'EM_ANALISE' | 'VISTORIA_AGENDADA' | 'CONCLUIDA' | 'IMPROCEDENTE';
  prioridade: 'BAIXA' | 'MEDIA' | 'ALTA' | 'URGENTE';
  parecer_fiscal?: string;
  data_vistoria?: string;
  fiscal_id?: string;
  created_at: string;
  updated_at: string;
}

export interface EvidenciaDenuncia {
  id: string;
  denuncia_id: string;
  url: string;
  tipo: 'FOTO' | 'VIDEO' | 'DOCUMENTO';
  created_at: string;
}

export interface Feira {
  id: string;
  nome: string;
  descricao?: string;
  local: string;
  endereco: string;
  municipio_id: string;
  organizacao_id: string;
  data_inicio: string;
  data_fim: string;
  status: 'PLANEJADA' | 'EM_ANDAMENTO' | 'FINALIZADA' | 'CANCELADA';
  created_at: string;
}

export interface AnimalFeira {
  id: string;
  feira_id: string;
  pet_id: string;
  status: 'AGUARDANDO' | 'ADOTADO_NA_FEIRA' | 'RETORNOU';
  created_at: string;
}

export interface Adocao {
  id: string;
  pet_id: string;
  adotante_id: string;
  organizacao_id?: string; // if mediated by ONG/Prefeitura
  feira_id?: string; // if happened at a fair
  status: 'EM_ANALISE' | 'APROVADA' | 'REJEITADA' | 'CONCLUIDA' | 'DEVOLVIDO';
  data_adocao?: string;
  observacoes?: string;
  entrevistador_id?: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentoAdocao {
  id: string;
  adocao_id: string;
  tipo: 'TERMO_RESPONSABILIDADE' | 'COMPROVANTE_RESIDENCIA' | 'DOCUMENTO_IDENTIDADE' | 'OUTRO';
  url: string;
  assinado: boolean;
  data_assinatura?: string;
  assinatura_digital?: string; // Could be a hash or base64 canvas signature
  created_at: string;
}

export interface VisitaAcompanhamento {
  id: string;
  adocao_id: string;
  visitante_id: string;
  data_visita: string;
  status_animal: 'BEM' | 'REGULAR' | 'MAUS_TRATOS' | 'FALECIDO' | 'DESAPARECIDO';
  relatorio: string;
  fotos?: string[];
  created_at: string;
}

export interface Notificacao {
  id: string;
  usuario_id: string;
  titulo: string;
  mensagem: string;
  lida: boolean;
  link?: string;
  created_at: string;
}
