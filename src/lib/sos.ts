import { supabase } from './supabase';

export interface AnimalSOS {
  id: string;
  tipo: 'perdido' | 'encontrado';
  status: 'ativo' | 'resolvido';
  pet_id?: string;
  nome: string;
  especie: 'cachorro' | 'gato' | 'outro';
  raca?: string;
  sexo?: 'macho' | 'femea' | 'indefinido';
  porte?: 'pequeno' | 'medio' | 'grande';
  cor?: string;
  foto_url: string;
  bairro: string;
  cidade: string;
  ponto_referencia?: string;
  data_ocorrencia: string;
  recompensa?: string;
  descricao?: string;
  contato_nome: string;
  contato_telefone: string;
  criado_em: string;
  user_id?: string;
}

const STORAGE_KEY = 'petconecta_sos_animais';

// Animais de exemplo para exibição imediata e teste inicial do portal
export const DADOS_EXEMPLO_SOS: AnimalSOS[] = [
  {
    id: 'sos-001',
    tipo: 'perdido',
    status: 'ativo',
    nome: 'Thor',
    especie: 'cachorro',
    raca: 'Golden Retriever',
    sexo: 'macho',
    porte: 'grande',
    cor: 'Dourado / Caramelo',
    foto_url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=600',
    bairro: 'Jardim Primavera',
    cidade: 'Arapongas - PR',
    ponto_referencia: 'Próximo à Praça Mauá e Colégio Emílio',
    data_ocorrencia: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    recompensa: 'R$ 500,00',
    descricao: 'Ele é muito dócil, atende pelo nome de Thor. Estava usando uma coleira vermelha de couro no momento do desaparecimento. Tem uma manchinha branca perto do focinho.',
    contato_nome: 'Marcos Oliveira',
    contato_telefone: '43991234567',
    criado_em: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'sos-002',
    tipo: 'perdido',
    status: 'ativo',
    nome: 'Mimi',
    especie: 'gato',
    raca: 'Siamês',
    sexo: 'femea',
    porte: 'pequeno',
    cor: 'Bege com extremidades marrons',
    foto_url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=600',
    bairro: 'Vila Araponguinha',
    cidade: 'Arapongas - PR',
    ponto_referencia: 'Perto do Mercado Cidade',
    data_ocorrencia: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    recompensa: '',
    descricao: 'Gatinha siamesa de olhos azuis bem claros. É assustada com barulho alto. É castrada e chipada pelo município.',
    contato_nome: 'Ana Carolina Silva',
    contato_telefone: '43998765432',
    criado_em: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'sos-003',
    tipo: 'encontrado',
    status: 'ativo',
    nome: 'Cachorrinho Caramelo (Resgatado)',
    especie: 'cachorro',
    raca: 'Sem Raça Definida (SRD)',
    sexo: 'macho',
    porte: 'medio',
    cor: 'Caramelo claro',
    foto_url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=600',
    bairro: 'Centro',
    cidade: 'Arapongas - PR',
    ponto_referencia: 'Encontrado na calçada da Av. Arapongas em frente à Caixa Econômica',
    data_ocorrencia: new Date().toISOString().split('T')[0],
    recompensa: '',
    descricao: 'Cachorrinho jovem e carinhoso, muito bem cuidado (parece ter fugido de casa recentemente). Estava com coleira peitoral azul.',
    contato_nome: 'Clínica SOS Vet / Protetora Juliana',
    contato_telefone: '43997654321',
    criado_em: new Date().toISOString()
  }
];

/**
 * Busca todos os alertas de SOS (do Supabase com fallback para o cache local)
 */
export async function fetchAnimaisSOS(filtros?: {
  tipo?: string;
  especie?: string;
  status?: string;
  busca?: string;
}): Promise<AnimalSOS[]> {
  let lista: AnimalSOS[] = [];

  // 1. Tenta carregar do localStorage
  try {
    const salvo = localStorage.getItem(STORAGE_KEY);
    if (salvo) {
      lista = JSON.parse(salvo);
    } else {
      lista = [...DADOS_EXEMPLO_SOS];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
    }
  } catch (e) {
    console.error('Erro ao ler SOS do localStorage:', e);
    lista = [...DADOS_EXEMPLO_SOS];
  }

  // 2. Tenta sincronizar com Supabase se a tabela sos_animais existir
  try {
    const { data, error } = await supabase
      .from('sos_animais')
      .select('*')
      .order('criado_em', { ascending: false });

    if (!error && data && data.length > 0) {
      // Mescla priorizando os dados do banco
      const mapa = new Map<string, AnimalSOS>();
      lista.forEach(item => mapa.set(item.id, item));
      data.forEach((item: any) => mapa.set(item.id, item));
      lista = Array.from(mapa.values());
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
    }
  } catch {
    // Falha silenciosa caso a tabela ainda não exista no Supabase do usuário
  }

  // 3. Aplica filtros
  return lista.filter(item => {
    if (filtros?.status && filtros.status !== 'todos') {
      if (item.status !== filtros.status) return false;
    }
    if (filtros?.tipo && filtros.tipo !== 'todos') {
      if (item.tipo !== filtros.tipo) return false;
    }
    if (filtros?.especie && filtros.especie !== 'todos') {
      if (item.especie !== filtros.especie) return false;
    }
    if (filtros?.busca) {
      const q = filtros.busca.toLowerCase();
      const match =
        item.nome.toLowerCase().includes(q) ||
        (item.raca && item.raca.toLowerCase().includes(q)) ||
        item.bairro.toLowerCase().includes(q) ||
        (item.cor && item.cor.toLowerCase().includes(q)) ||
        (item.descricao && item.descricao.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });
}

/**
 * Salva ou atualiza um alerta de SOS
 */
export async function salvarAnimalSOS(dados: Partial<AnimalSOS>): Promise<AnimalSOS> {
  const agora = new Date().toISOString();
  const id = dados.id || `sos-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  const novo: AnimalSOS = {
    id,
    tipo: dados.tipo || 'perdido',
    status: dados.status || 'ativo',
    pet_id: dados.pet_id,
    nome: dados.nome || 'Animal sem identificação',
    especie: dados.especie || 'cachorro',
    raca: dados.raca || 'SRD (Sem Raça Definida)',
    sexo: dados.sexo || 'indefinido',
    porte: dados.porte || 'medio',
    cor: dados.cor || 'Não informado',
    foto_url: dados.foto_url || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=600',
    bairro: dados.bairro || 'Centro',
    cidade: dados.cidade || 'Arapongas - PR',
    ponto_referencia: dados.ponto_referencia || '',
    data_ocorrencia: dados.data_ocorrencia || agora.split('T')[0],
    recompensa: dados.recompensa || '',
    descricao: dados.descricao || '',
    contato_nome: dados.contato_nome || 'Tutor / Resgatador',
    contato_telefone: dados.contato_telefone || '',
    criado_em: dados.criado_em || agora,
    user_id: dados.user_id
  };

  // Salva no localStorage imediatamente
  try {
    const lista = await fetchAnimaisSOS();
    const idx = lista.findIndex(i => i.id === id);
    if (idx >= 0) {
      lista[idx] = novo;
    } else {
      lista.unshift(novo);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
  } catch (e) {
    console.error('Erro ao salvar no storage:', e);
  }

  // Tenta salvar no Supabase
  try {
    await supabase.from('sos_animais').upsert(novo);
  } catch {
    // Sincronização em background se tabela estiver pronta
  }

  // Se estiver associado a um pet cadastrado, atualiza o status do pet
  if (novo.pet_id) {
    try {
      await supabase
        .from('pets')
        .update({ status: novo.status === 'ativo' ? 'PERDIDO' : 'DISPONIVEL' })
        .eq('id', novo.pet_id);
    } catch (e) {
      console.warn('Não foi possível atualizar status na tabela pets:', e);
    }
  }

  return novo;
}

/**
 * Marca um alerta como Resolvido (Animal Encontrado e Devolvido ao Tutor!)
 */
export async function marcarResolvidoSOS(id: string, petId?: string): Promise<void> {
  try {
    const lista = await fetchAnimaisSOS();
    const item = lista.find(i => i.id === id);
    if (item) {
      item.status = 'resolvido';
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
    }

    try {
      await supabase
        .from('sos_animais')
        .update({ status: 'resolvido' })
        .eq('id', id);
    } catch {}

    const targetPetId = petId || item?.pet_id;
    if (targetPetId) {
      try {
        await supabase
          .from('pets')
          .update({ status: 'DISPONIVEL' })
          .eq('id', targetPetId);
      } catch {}
    }
  } catch (e) {
    console.error('Erro ao resolver SOS:', e);
    throw e;
  }
}

/**
 * Gera mensagem formatada pronta para enviar no WhatsApp
 */
export function buildMensagemContatoSOS(animal: AnimalSOS): string {
  const isPerdido = animal.tipo === 'perdido';
  const saudacao = `Olá, ${animal.contato_nome}! Vi o alerta do pet *${animal.nome}* no sistema PetConecta BR da Prefeitura.`;

  if (isPerdido) {
    return `${saudacao}\n\nAcredito que vi ou tenho informações sobre o paradeiro dele no bairro ${animal.bairro}. Como posso te ajudar a encontrá-lo?`;
  } else {
    return `${saudacao}\n\nAcredito que sou o tutor ou conheço a família desse animalzinho resgatado no bairro ${animal.bairro}. Podemos conversar?`;
  }
}

/**
 * Gera o texto oficial para compartilhamento nas redes sociais e grupos de WhatsApp
 */
export function buildTextoCompartilhamento(animal: AnimalSOS): string {
  const isPerdido = animal.tipo === 'perdido';
  const titulo = isPerdido
    ? `🚨 *ALERTA SOS: PET DESAPARECIDO!* 🚨`
    : `🔍 *PET ENCONTRADO / RESGATADO NA RUA!* 🔍`;

  const detalhes = [
    `🐾 *Nome/Identificação:* ${animal.nome}`,
    `🐕 *Espécie/Raça:* ${animal.especie.toUpperCase()} • ${animal.raca || 'SRD'}`,
    `🎨 *Porte/Cor:* Porte ${animal.porte} • ${animal.cor}`,
    `📍 *Local:* Bairro ${animal.bairro} (${animal.cidade})`,
    animal.ponto_referencia ? `📌 *Ponto de ref.:* ${animal.ponto_referencia}` : '',
    `📅 *Data do ocorrido:* ${new Date(animal.data_ocorrencia).toLocaleDateString('pt-BR')}`,
    animal.recompensa ? `💰 *RECOMPENSA OFERTADA:* ${animal.recompensa}` : '',
    animal.descricao ? `📝 *Descrição:* ${animal.descricao}` : '',
    `\n📞 *Contato direto:* ${animal.contato_nome} - Tel/Whats: ${animal.contato_telefone}`,
    `\n🔗 *Acesse o alerta e imprima o cartaz:* ${window.location.origin}/sos?id=${animal.id}`,
    `\nCompartilhe nos grupos de WhatsApp e ajude esse amiguinho a voltar pra casa! ❤️🐶🐱`
  ].filter(Boolean).join('\n');

  return `${titulo}\n\n${detalhes}`;
}
