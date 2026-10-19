import { supabase } from './supabase';

export interface RegistroVacina {
  id: string;
  pet_id: string;
  tipo: 'vacina' | 'vermifugo' | 'antipulgas';
  nome: string;
  data_aplicacao: string;
  data_reforco?: string;
  lote?: string;
  fabricante?: string;
  veterinario_nome?: string;
  crmv?: string;
  clinica_nome?: string;
  observacoes?: string;
  criado_em?: string;
}

export interface CatalogoItem {
  nome: string;
  tipo: 'vacina' | 'vermifugo' | 'antipulgas';
  especie: 'todos' | 'cachorro' | 'gato';
  periodoMeses: number; // Intervalo típico para reforço
  fabricantesSugeridos: string[];
  descricao: string;
}

export const CATALOGO_VACINAS: CatalogoItem[] = [
  // CÃES
  {
    nome: 'Vacina Antirrábica (Raiva Canina)',
    tipo: 'vacina',
    especie: 'cachorro',
    periodoMeses: 12,
    fabricantesSugeridos: ['Zoetis (Defensor)', 'Boehringer Ingelheim (Rabisin)', 'MSD (Nobivac)', 'Biovet'],
    descricao: 'Vacina obrigatória anual contra a raiva.'
  },
  {
    nome: 'Polivalente V10 (Vanguard / Nobivac)',
    tipo: 'vacina',
    especie: 'cachorro',
    periodoMeses: 12,
    fabricantesSugeridos: ['Zoetis (Vanguard HTLP 5/CV-L)', 'MSD (Nobivac DHPPI+L)', 'Boehringer (Eurican)'],
    descricao: 'Proteção contra Cinomose, Parvovirose, Coronavirose, Hepatite e 4 sorovares de Leptospirose.'
  },
  {
    nome: 'Polivalente V8',
    tipo: 'vacina',
    especie: 'cachorro',
    periodoMeses: 12,
    fabricantesSugeridos: ['Zoetis', 'Boehringer Ingelheim', 'Biovet'],
    descricao: 'Proteção essencial contra as principais viroses caninas.'
  },
  {
    nome: 'Gripe Canina (Tosse dos Canis)',
    tipo: 'vacina',
    especie: 'cachorro',
    periodoMeses: 12,
    fabricantesSugeridos: ['Zoetis (Bronchiguard / Pneumodog)', 'MSD (Nobivac KC)'],
    descricao: 'Prevenção de traqueobronquite infecciosa canina.'
  },
  {
    nome: 'Giárdia (Giardiavax)',
    tipo: 'vacina',
    especie: 'cachorro',
    periodoMeses: 12,
    fabricantesSugeridos: ['Zoetis (Giardiavax)'],
    descricao: 'Prevenção de infecção e eliminação de cistos por Giardia lamblia.'
  },
  {
    nome: 'Leishmaniose (LeishTec)',
    tipo: 'vacina',
    especie: 'cachorro',
    periodoMeses: 12,
    fabricantesSugeridos: ['Ceva (LeishTec)'],
    descricao: 'Imunização preventiva contra a Leishmaniose Visceral Canina.'
  },

  // GATOS
  {
    nome: 'Vacina Antirrábica (Raiva Felina)',
    tipo: 'vacina',
    especie: 'gato',
    periodoMeses: 12,
    fabricantesSugeridos: ['Boehringer Ingelheim (Rabisin)', 'Zoetis (Defensor)', 'MSD (Nobivac)'],
    descricao: 'Obrigatória anual contra a raiva em felinos.'
  },
  {
    nome: 'Quíntupla Felina (V5 - Panleucopenia, Calici, Rino, Clamidiose e FeLV)',
    tipo: 'vacina',
    especie: 'gato',
    periodoMeses: 12,
    fabricantesSugeridos: ['Zoetis (Felocell 5)', 'Boehringer (Purevax)', 'MSD (Nobivac 1-FeLV)'],
    descricao: 'Proteção completa incluindo o vírus da Leucemia Felina (FeLV).'
  },
  {
    nome: 'Quádrupla Felina (V4)',
    tipo: 'vacina',
    especie: 'gato',
    periodoMeses: 12,
    fabricantesSugeridos: ['Zoetis (Felocell 4)', 'Boehringer Ingelheim'],
    descricao: 'Protege contra Panleucopenia, Calicivirose, Rinotraqueíte e Clamidiose.'
  },
  {
    nome: 'Tríplice Felina (V3)',
    tipo: 'vacina',
    especie: 'gato',
    periodoMeses: 12,
    fabricantesSugeridos: ['Zoetis', 'Boehringer Ingelheim', 'MSD'],
    descricao: 'Proteção básica contra Panleucopenia, Calicivirose e Rinotraqueíte.'
  },

  // VERMÍFUGOS & ANTIPARASITÁRIOS
  {
    nome: 'Simparic (Sarolaner)',
    tipo: 'antipulgas',
    especie: 'cachorro',
    periodoMeses: 1, // 35 dias
    fabricantesSugeridos: ['Zoetis'],
    descricao: 'Comprimido palatável contra pulgas, carrapatos e sarnas (35 dias).'
  },
  {
    nome: 'Bravecto (Fluralaner)',
    tipo: 'antipulgas',
    especie: 'todos',
    periodoMeses: 3, // 12 semanas
    fabricantesSugeridos: ['MSD Saúde Animal'],
    descricao: 'Proteção contínua por 12 semanas (3 meses) contra pulgas e carrapatos.'
  },
  {
    nome: 'Nexgard / Nexgard Spectra',
    tipo: 'antipulgas',
    especie: 'cachorro',
    periodoMeses: 1,
    fabricantesSugeridos: ['Boehringer Ingelheim'],
    descricao: 'Mastigável mensal contra pulgas, carrapatos, sarnas e vermes intestinais.'
  },
  {
    nome: 'Drontal Plus / Chemital (Vermífugo Amplo Espectro)',
    tipo: 'vermifugo',
    especie: 'todos',
    periodoMeses: 4,
    fabricantesSugeridos: ['Vetoquinol', 'Elanco', 'Biovet'],
    descricao: 'Controle de vermes chatos (cestódeos) e redondos (nematódeos).'
  },
  {
    nome: 'Revolution 6% / Advocate (Gatos e Cães)',
    tipo: 'antipulgas',
    especie: 'gato',
    periodoMeses: 1,
    fabricantesSugeridos: ['Zoetis (Revolution)', 'Elanco (Advocate)'],
    descricao: 'Pipeta spot-on contra pulgas, vermes e ácaros da orelha em gatos.'
  }
];

const LOCAL_STORAGE_KEY_PREFIX = 'pet_caderneta_vacinas_';

/**
 * Busca o histórico de vacinas e medicamentos de um pet
 */
export async function fetchVacinasPet(petId: string): Promise<RegistroVacina[]> {
  const lista: RegistroVacina[] = [];
  const cacheKey = `${LOCAL_STORAGE_KEY_PREFIX}${petId}`;

  // 1. Puxa do localStorage para resposta imediata
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed)) {
        lista.push(...parsed);
      }
    }
  } catch (e) {
    console.error('Erro ao ler cache local de vacinas:', e);
  }

  // 2. Busca registros salvos no banco Supabase (tabela consultas com tag)
  try {
    const { data, error } = await supabase
      .from('consultas')
      .select(`
        id,
        pet_id,
        data_consulta,
        motivo,
        diagnostico,
        prescricao,
        observacoes,
        criado_em,
        clinicas_parceiras (nome)
      `)
      .eq('pet_id', petId)
      .ilike('motivo', '[%')
      .order('data_consulta', { ascending: false });

    if (!error && data && data.length > 0) {
      const doBanco: RegistroVacina[] = [];

      for (const item of data) {
        let meta: any = {};
        try {
          if (item.diagnostico) {
            meta = JSON.parse(item.diagnostico);
          }
        } catch {
          // diagnóstico pode ser texto livre
        }

        let tipo: 'vacina' | 'vermifugo' | 'antipulgas' = 'vacina';
        if (item.motivo?.includes('[VERMIFUGO]')) tipo = 'vermifugo';
        else if (item.motivo?.includes('[ANTIPULGAS]')) tipo = 'antipulgas';

        const nomeLimpo = item.motivo?.replace(/^\[(VACINA|VERMIFUGO|ANTIPULGAS|SAUDE)\]\s*/i, '') || 'Procedimento Preventivo';

        // Extrai data_reforco da prescrição se formatado
        let dataReforco: string | undefined = undefined;
        if (item.prescricao) {
          const match = item.prescricao.match(/(\d{4}-\d{2}-\d{2})/);
          if (match) dataReforco = match[1];
        }

        const reg: RegistroVacina = {
          id: item.id,
          pet_id: item.pet_id,
          tipo,
          nome: nomeLimpo,
          data_aplicacao: item.data_consulta ? item.data_consulta.split('T')[0] : (item.criado_em?.split('T')[0] || new Date().toISOString().split('T')[0]),
          data_reforco: dataReforco || meta.data_reforco,
          lote: meta.lote,
          fabricante: meta.fabricante,
          veterinario_nome: meta.veterinario,
          crmv: meta.crmv,
          clinica_nome: (item.clinicas_parceiras as any)?.nome || meta.clinica_nome,
          observacoes: item.observacoes || undefined,
          criado_em: item.criado_em
        };

        doBanco.push(reg);
      }

      // Mescla com cache local sem duplicar por ID
      const idsExistentes = new Set(doBanco.map(x => x.id));
      const unicos = [...doBanco, ...lista.filter(x => !idsExistentes.has(x.id))];

      // Ordena por data_aplicacao mais recente primeiro
      unicos.sort((a, b) => new Date(b.data_aplicacao).getTime() - new Date(a.data_aplicacao).getTime());

      // Atualiza cache local
      try {
        localStorage.setItem(cacheKey, JSON.stringify(unicos));
      } catch {}

      return unicos;
    }
  } catch (error) {
    console.error('Erro ao buscar vacinas no banco:', error);
  }

  // Ordena lista do cache e retorna
  lista.sort((a, b) => new Date(b.data_aplicacao).getTime() - new Date(a.data_aplicacao).getTime());
  return lista;
}

/**
 * Salva um novo registro vacinal ou de medicamento no banco e no cache
 */
export async function salvarRegistroVacina(dados: {
  pet_id: string;
  tutor_id?: string;
  clinica_id?: string;
  tipo: 'vacina' | 'vermifugo' | 'antipulgas';
  nome: string;
  data_aplicacao: string;
  data_reforco?: string;
  lote?: string;
  fabricante?: string;
  veterinario_nome?: string;
  crmv?: string;
  observacoes?: string;
}): Promise<RegistroVacina> {
  const meta = {
    tipo: dados.tipo,
    lote: dados.lote || null,
    fabricante: dados.fabricante || null,
    veterinario: dados.veterinario_nome || null,
    crmv: dados.crmv || null,
    data_reforco: dados.data_reforco || null
  };

  const payload = {
    pet_id: dados.pet_id,
    tutor_id: dados.tutor_id || null,
    clinica_id: dados.clinica_id || null,
    data_consulta: `${dados.data_aplicacao}T10:00:00.000Z`,
    motivo: `[${dados.tipo.toUpperCase()}] ${dados.nome}`,
    diagnostico: JSON.stringify(meta),
    prescricao: dados.data_reforco ? `Próximo reforço / revacinação: ${dados.data_reforco}` : null,
    observacoes: dados.observacoes || null,
    status: 'realizada'
  };

  let novoId = `local-${Date.now()}`;

  try {
    const { data, error } = await supabase
      .from('consultas')
      .insert(payload)
      .select('id, criado_em')
      .single();

    if (!error && data) {
      novoId = data.id;
    }
  } catch (err) {
    console.warn('Persistindo temporariamente em cache local:', err);
  }

  const registroCriado: RegistroVacina = {
    id: novoId,
    pet_id: dados.pet_id,
    tipo: dados.tipo,
    nome: dados.nome,
    data_aplicacao: dados.data_aplicacao,
    data_reforco: dados.data_reforco,
    lote: dados.lote,
    fabricante: dados.fabricante,
    veterinario_nome: dados.veterinario_nome,
    crmv: dados.crmv,
    observacoes: dados.observacoes,
    criado_em: new Date().toISOString()
  };

  // Se for vacina, atualiza também a flag pet.vacinado = true
  if (dados.tipo === 'vacina') {
    try {
      await supabase
        .from('pets')
        .update({ vacinado: true })
        .eq('id', dados.pet_id);
    } catch {}
  }

  // Atualiza cache local
  const cacheKey = `${LOCAL_STORAGE_KEY_PREFIX}${dados.pet_id}`;
  try {
    const cached = localStorage.getItem(cacheKey);
    const lista = cached ? JSON.parse(cached) : [];
    lista.unshift(registroCriado);
    localStorage.setItem(cacheKey, JSON.stringify(lista));
  } catch {}

  return registroCriado;
}

/**
 * Remove um registro de vacina
 */
export async function excluirRegistroVacina(id: string, petId: string): Promise<boolean> {
  // 1. Tenta deletar no Supabase se não for ID local
  if (!id.startsWith('local-')) {
    try {
      await supabase.from('consultas').delete().eq('id', id);
    } catch (err) {
      console.error('Erro ao excluir no banco:', err);
    }
  }

  // 2. Remove do cache local
  const cacheKey = `${LOCAL_STORAGE_KEY_PREFIX}${petId}`;
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const lista: RegistroVacina[] = JSON.parse(cached);
      const filtrado = lista.filter(x => x.id !== id);
      localStorage.setItem(cacheKey, JSON.stringify(filtrado));

      // Se não sobrou nenhuma vacina do tipo 'vacina', pode atualizar pet.vacinado
      const temVacina = filtrado.some(x => x.tipo === 'vacina');
      await supabase.from('pets').update({ vacinado: temVacina }).eq('id', petId);
    }
  } catch {}

  return true;
}

/**
 * Avalia a situação vacinal do animal
 */
export function calcularStatusVacinal(vacinas: RegistroVacina[]) {
  const hoje = new Date();

  const vacinasTipo = vacinas.filter(v => v.tipo === 'vacina');
  const antirrabica = vacinasTipo.find(v => v.nome.toLowerCase().includes('antirrábica') || v.nome.toLowerCase().includes('raiva'));
  const polivalente = vacinasTipo.find(v => v.nome.toLowerCase().includes('v10') || v.nome.toLowerCase().includes('v8') || v.nome.toLowerCase().includes('quíntupla') || v.nome.toLowerCase().includes('v5') || v.nome.toLowerCase().includes('v4') || v.nome.toLowerCase().includes('v3'));

  const verificaValidade = (reg?: RegistroVacina) => {
    if (!reg) return { registrado: false, emDia: false, data: null, proxima: null };
    
    if (reg.data_reforco) {
      const dataReforco = new Date(reg.data_reforco);
      const emDia = dataReforco >= hoje;
      return { registrado: true, emDia, data: reg.data_aplicacao, proxima: reg.data_reforco };
    }

    // Se não tiver data de reforço explícita, considera 12 meses da aplicação
    const dataAplicada = new Date(reg.data_aplicacao);
    const validadeEstimada = new Date(dataAplicada);
    validadeEstimada.setFullYear(validadeEstimada.getFullYear() + 1);
    const emDia = validadeEstimada >= hoje;

    return { 
      registrado: true, 
      emDia, 
      data: reg.data_aplicacao, 
      proxima: validadeEstimada.toISOString().split('T')[0] 
    };
  };

  const statusRaiva = verificaValidade(antirrabica);
  const statusPoli = verificaValidade(polivalente);

  const emDiaGeral = (statusRaiva.registrado && statusRaiva.emDia) || (statusPoli.registrado && statusPoli.emDia);

  return {
    antirrabica: statusRaiva,
    polivalente: statusPoli,
    emDiaGeral,
    totalDoses: vacinas.length,
    antirrabicaItem: antirrabica,
    polivalenteItem: polivalente
  };
}
