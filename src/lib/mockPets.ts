export interface PetModel {
  id: string;
  nome: string;
  especie: 'cao' | 'gato' | 'outro';
  raca: string;
  porte: string;
  sexo: 'macho' | 'femea';
  cor: string;
  castrado: boolean;
  vacinado: boolean;
  microchip: string | null;
  status: string;
  observacoes: string | null;
  tutor_id: string;
  criado_em: string;
  foto_url: string;
  fotos_pet: { url: string }[];
}

export const PETS_DONA_MARIA: PetModel[] = [
  {
    id: 'pet-maria-001',
    nome: 'Thor',
    especie: 'cao',
    raca: 'Pitbull SRD',
    porte: 'grande',
    sexo: 'macho',
    cor: 'Castanho e Branco',
    castrado: true,
    vacinado: true,
    microchip: '981.098.102.938.101',
    status: 'ativo',
    observacoes: 'Resgatado da rua em 2024. Extremamente dócil com crianças e protetor da casa.',
    tutor_id: 'demo-maria-id',
    criado_em: '2024-02-10T10:00:00Z',
    foto_url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=800',
    fotos_pet: [
      { url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=800' }
    ]
  },
  {
    id: 'pet-maria-002',
    nome: 'Belinha',
    especie: 'cao',
    raca: 'Vira-lata Caramelo',
    porte: 'medio',
    sexo: 'femea',
    cor: 'Caramelo Dourado',
    castrado: true,
    vacinado: true,
    microchip: '981.098.102.938.102',
    status: 'ativo',
    observacoes: 'Castrada pelo mutirão municipal. Adora brincar com bolinhas e tomar banho de sol.',
    tutor_id: 'demo-maria-id',
    criado_em: '2024-03-15T11:00:00Z',
    foto_url: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=800',
    fotos_pet: [
      { url: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=800' }
    ]
  },
  {
    id: 'pet-maria-003',
    nome: 'Mel',
    especie: 'cao',
    raca: 'Poodle Mix',
    porte: 'pequeno',
    sexo: 'femea',
    cor: 'Branco Pérola',
    castrado: true,
    vacinado: true,
    microchip: '981.098.102.938.103',
    status: 'ativo',
    observacoes: 'Idosa com 8 anos. Muito calma e carinhosa. Acompanhada pelo programa de bem-estar.',
    tutor_id: 'demo-maria-id',
    criado_em: '2024-04-01T09:30:00Z',
    foto_url: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&q=80&w=800',
    fotos_pet: [
      { url: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&q=80&w=800' }
    ]
  },
  {
    id: 'pet-maria-004',
    nome: 'Bob',
    especie: 'cao',
    raca: 'Pastor Mix',
    porte: 'grande',
    sexo: 'macho',
    cor: 'Preto e Fogo',
    castrado: true,
    vacinado: true,
    microchip: '981.098.102.938.104',
    status: 'ativo',
    observacoes: 'Excelente cão de guarda, brincalhão e convive bem com os gatos da casa.',
    tutor_id: 'demo-maria-id',
    criado_em: '2024-05-10T14:00:00Z',
    foto_url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=800',
    fotos_pet: [
      { url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=800' }
    ]
  },
  {
    id: 'pet-maria-005',
    nome: 'Pipoca',
    especie: 'cao',
    raca: 'SRD Terriersinho',
    porte: 'pequeno',
    sexo: 'femea',
    cor: 'Preto e Branco',
    castrado: false,
    vacinado: true,
    microchip: null,
    status: 'na_fila_castracao',
    observacoes: 'Inscrita na Fila de Castração Gratuita Municipal (3º lugar na lista de espera).',
    tutor_id: 'demo-maria-id',
    criado_em: '2024-06-20T16:00:00Z',
    foto_url: 'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&q=80&w=800',
    fotos_pet: [
      { url: 'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&q=80&w=800' }
    ]
  },
  {
    id: 'pet-maria-006',
    nome: 'Caramelo',
    especie: 'cao',
    raca: 'SRD Porte Médio',
    porte: 'medio',
    sexo: 'macho',
    cor: 'Caramelo',
    castrado: true,
    vacinado: true,
    microchip: '981.098.102.938.106',
    status: 'ativo',
    observacoes: 'Resgatado filhote na Avenida Arapongas. Companheiro inseparável da Dona Maria.',
    tutor_id: 'demo-maria-id',
    criado_em: '2024-07-05T10:00:00Z',
    foto_url: 'https://images.unsplash.com/photo-1561037404-61cd46aa615b?auto=format&fit=crop&q=80&w=800',
    fotos_pet: [
      { url: 'https://images.unsplash.com/photo-1561037404-61cd46aa615b?auto=format&fit=crop&q=80&w=800' }
    ]
  },
  {
    id: 'pet-maria-007',
    nome: 'Luna',
    especie: 'gato',
    raca: 'Siamês Mix',
    porte: 'pequeno',
    sexo: 'femea',
    cor: 'Branco e Cinza',
    castrado: true,
    vacinado: true,
    microchip: '981.098.102.938.107',
    status: 'ativo',
    observacoes: 'Gata carinhosa, dorme na cama e usa a caixa de areia perfeitamente.',
    tutor_id: 'demo-maria-id',
    criado_em: '2024-08-12T08:00:00Z',
    foto_url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=800',
    fotos_pet: [
      { url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=800' }
    ]
  },
  {
    id: 'pet-maria-008',
    nome: 'Fred',
    especie: 'gato',
    raca: 'Frajola (SRD)',
    porte: 'pequeno',
    sexo: 'macho',
    cor: 'Preto e Branco',
    castrado: true,
    vacinado: true,
    microchip: '981.098.102.938.108',
    status: 'ativo',
    observacoes: 'Gato ronronador resgatado de telhado. Muito saudável e ativo.',
    tutor_id: 'demo-maria-id',
    criado_em: '2024-09-01T12:00:00Z',
    foto_url: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&q=80&w=800',
    fotos_pet: [
      { url: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&q=80&w=800' }
    ]
  },
  {
    id: 'pet-maria-009',
    nome: 'Nina',
    especie: 'gato',
    raca: 'Tricolor Calico',
    porte: 'pequeno',
    sexo: 'femea',
    cor: 'Branco, Preto e Laranja',
    castrado: false,
    vacinado: true,
    microchip: null,
    status: 'na_fila_castracao',
    observacoes: 'Filhote resgatada recentemente. Também aguarda chamada de castração municipal.',
    tutor_id: 'demo-maria-id',
    criado_em: '2024-10-01T15:00:00Z',
    foto_url: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&q=80&w=800',
    fotos_pet: [
      { url: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&q=80&w=800' }
    ]
  }
];

const STORAGE_PETS_LOCAL = 'petconecta_pets_usuario';

export function getMockPetsForUser(userId?: string): PetModel[] {
  // 1. Tenta recuperar pets salvos no localStorage
  try {
    const local = localStorage.getItem(STORAGE_PETS_LOCAL);
    if (local) {
      const parsed = JSON.parse(local);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Erro ao ler pets do local storage:', e);
  }

  // 2. Se for a Dona Maria (ou demo), retorna os 9 animais oficiais
  if (userId === 'demo-maria-id' || !userId) {
    return PETS_DONA_MARIA;
  }

  return [];
}

export function getMockPetById(id: string): PetModel | undefined {
  // Busca no cache local primeiro
  try {
    const local = localStorage.getItem(STORAGE_PETS_LOCAL);
    if (local) {
      const parsed = JSON.parse(local);
      const found = parsed.find((p: any) => p.id === id);
      if (found) return found;
    }
  } catch (e) {
    console.warn('Erro ao ler cache local de pets:', e);
  }

  // Busca na lista padrão da Dona Maria
  return PETS_DONA_MARIA.find(p => p.id === id);
}

export function savePetLocal(pet: PetModel) {
  try {
    const current = getMockPetsForUser(pet.tutor_id);
    const existingIndex = current.findIndex(p => p.id === pet.id);
    let updated: PetModel[];
    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = pet;
    } else {
      updated = [pet, ...current];
    }
    localStorage.setItem(STORAGE_PETS_LOCAL, JSON.stringify(updated));
  } catch (e) {
    console.warn('Erro ao salvar pet localmente:', e);
  }
}

export const PETS_ADOCAO_MOCK = [
  {
    id: 'adocao-001',
    nome: 'Pipoca',
    especie: 'cao',
    raca: 'Vira-lata Caramelo (SRD)',
    porte: 'medio',
    sexo: 'macho',
    cor: 'Caramelo',
    castrado: true,
    vacinado: true,
    microchip: '981.000.111.222',
    status: 'para_adocao',
    observacoes: 'Idade aproximada: 1 ano e meio. Super dócil, brincalhão e sociável com outros cães. Resgatado no Jardim Primavera.',
    criado_em: '2026-09-10T10:00:00Z',
    foto_url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=800',
    fotos_pet: [
      { url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=800', is_principal: true }
    ]
  },
  {
    id: 'adocao-002',
    nome: 'Luna',
    especie: 'gato',
    raca: 'Siamês Mix',
    porte: 'pequeno',
    sexo: 'femea',
    cor: 'Branco e Cinza',
    castrado: true,
    vacinado: true,
    microchip: '981.000.333.444',
    status: 'para_adocao',
    observacoes: 'Idade aproximada: 1 ano. Gata calma, carinhosa, adaptada a apartamento e acostumada com caixa de areia.',
    criado_em: '2026-09-12T11:00:00Z',
    foto_url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=800',
    fotos_pet: [
      { url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=800', is_principal: true }
    ]
  },
  {
    id: 'adocao-003',
    nome: 'Barão',
    especie: 'cao',
    raca: 'Pastor Alemão Mix',
    porte: 'grande',
    sexo: 'macho',
    cor: 'Preto e Dourado',
    castrado: true,
    vacinado: true,
    microchip: '981.000.555.666',
    status: 'para_adocao',
    observacoes: 'Idade aproximada: 3 anos. Excelente cão de guarda e companheiro de caminhada. Muito obediente e leal.',
    criado_em: '2026-09-15T09:30:00Z',
    foto_url: 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?auto=format&fit=crop&q=80&w=800',
    fotos_pet: [
      { url: 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?auto=format&fit=crop&q=80&w=800', is_principal: true }
    ]
  },
  {
    id: 'adocao-004',
    nome: 'Mia',
    especie: 'gato',
    raca: 'Frajolinha (SRD)',
    porte: 'pequeno',
    sexo: 'femea',
    cor: 'Preto e Branco',
    castrado: true,
    vacinado: true,
    microchip: '981.000.777.888',
    status: 'para_adocao',
    observacoes: 'Idade aproximada: 8 meses. Muito boazinha, adora carinho na barriga e ronronar no colo.',
    criado_em: '2026-09-18T14:00:00Z',
    foto_url: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&q=80&w=800',
    fotos_pet: [
      { url: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&q=80&w=800', is_principal: true }
    ]
  },
  {
    id: 'adocao-005',
    nome: 'Toby',
    especie: 'cao',
    raca: 'Fox Paulistinha Mix',
    porte: 'pequeno',
    sexo: 'macho',
    cor: 'Tricolor',
    castrado: true,
    vacinado: true,
    microchip: '981.000.999.000',
    status: 'para_adocao',
    observacoes: 'Idade aproximada: 2 anos. Porte pequeno, ideal para casas com quintal pequeno ou apartamentos.',
    criado_em: '2026-09-20T16:00:00Z',
    foto_url: 'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&q=80&w=800',
    fotos_pet: [
      { url: 'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&q=80&w=800', is_principal: true }
    ]
  },
  {
    id: 'adocao-006',
    nome: 'Chiquinha',
    especie: 'cao',
    raca: 'Labrador Mix',
    porte: 'grande',
    sexo: 'femea',
    cor: 'Dourada',
    castrado: true,
    vacinado: true,
    microchip: '981.000.123.456',
    status: 'para_adocao',
    observacoes: 'Idade aproximada: 2 anos. Uma doçura de cachorra, se dá muito bem com crianças e outros animais.',
    criado_em: '2026-09-22T10:00:00Z',
    foto_url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=800',
    fotos_pet: [
      { url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=800', is_principal: true }
    ]
  },
  {
    id: 'adocao-007',
    nome: 'Simba',
    especie: 'gato',
    raca: 'Laranja Rajado',
    porte: 'medio',
    sexo: 'macho',
    cor: 'Laranja e Branco',
    castrado: true,
    vacinado: true,
    microchip: '981.000.789.012',
    status: 'para_adocao',
    observacoes: 'Idade aproximada: 1 ano e meio. Castrado, vacinado e vermifugado. Companheiro e dócil.',
    criado_em: '2026-09-25T13:00:00Z',
    foto_url: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&q=80&w=800',
    fotos_pet: [
      { url: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&q=80&w=800', is_principal: true }
    ]
  }
];

export function getMockAdocaoPets(): any[] {
  return PETS_ADOCAO_MOCK;
}

export function getMockAdocaoById(id: string): any | undefined {
  return PETS_ADOCAO_MOCK.find(p => p.id === id);
}
