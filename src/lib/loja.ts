import { supabase } from './supabase';

export type CategoriaProduto = 
  | 'impressao_3d' 
  | 'camas_conforto' 
  | 'coleiras_acessorios' 
  | 'comedouros_bebedouros' 
  | 'brinquedos_higiene' 
  | 'solidario';

export interface CampoPersonalizacao {
  label: string;
  placeholder: string;
  tipo?: 'texto' | 'select';
  opcoes?: string[];
}

export interface ProdutoLoja {
  id: string;
  nome: string;
  slug: string;
  descricao: string;
  preco: number;
  preco_promocional?: number;
  categoria: CategoriaProduto;
  fotos: string[];
  estoque: number;
  tipo_producao: 'pronta_entrega' | 'sob_encomenda' | 'impressao_3d';
  tempo_producao_dias?: number;
  permite_personalizacao: boolean;
  campos_personalizacao?: CampoPersonalizacao[];
  destaque: boolean;
  ativo: boolean;
  tags: string[];
  reverte_ong?: boolean; // 100% ou parte do valor reverte para ração/resgate
  criado_em: string;
}

export interface ItemCarrinho {
  produto_id: string;
  nome: string;
  preco_unitario: number;
  quantidade: number;
  foto: string;
  personalizacao?: Record<string, string>;
}

export interface PedidoLoja {
  id: string;
  numero_pedido: string;
  cliente_nome: string;
  cliente_telefone: string;
  cliente_cpf?: string;
  cliente_endereco: string;
  cliente_bairro: string;
  cliente_cidade: string;
  itens: ItemCarrinho[];
  valor_subtotal: number;
  taxa_entrega: number;
  valor_total: number;
  metodo_pagamento: 'pix' | 'whatsapp' | 'cartao';
  status: 'pendente' | 'em_producao' | 'enviado' | 'pronto_retirada' | 'entregue' | 'cancelado';
  observacoes?: string;
  criado_em: string;
}

const STORAGE_PRODUTOS = 'petconecta_loja_produtos';
const STORAGE_PEDIDOS = 'petconecta_loja_pedidos';
const STORAGE_CARRINHO = 'petconecta_loja_carrinho';

// Produtos iniciais com temas solicitados: Impressão 3D, Caminhas de cachorro, Coleiras personalizadas
export const PRODUTOS_PADRAO: ProdutoLoja[] = [
  {
    id: 'prod-001',
    nome: 'Plaquinha de Identificação 3D com QR Code Inteligente',
    slug: 'plaquinha-identificacao-3d-qr-code',
    descricao: 'Plaquinha de segurança ultrarresistente e leve produzida em Impressão 3D com bioplástico PLA atóxico. Na frente vai o nome do seu pet em relevo 3D nítido e, no verso, um QR Code exclusivo que abre a Carteirinha Digital ou os contatos do tutor em caso de fuga.',
    preco: 24.90,
    preco_promocional: 19.90,
    categoria: 'impressao_3d',
    fotos: [
      'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&q=80&w=800'
    ],
    estoque: 100,
    tipo_producao: 'impressao_3d',
    tempo_producao_dias: 2,
    permite_personalizacao: true,
    campos_personalizacao: [
      { label: 'Nome do Pet para a Frente', placeholder: 'Ex: Thor, Mel, Bob...' },
      { label: 'Telefone com DDD para o Verso', placeholder: 'Ex: (43) 99876-5432' },
      { 
        label: 'Formato da Plaquinha', 
        placeholder: 'Selecione',
        tipo: 'select',
        opcoes: ['Osso Tradicional', 'Coração', 'Redondo Minimalista', 'Patinha 3D'] 
      },
      { 
        label: 'Cor Principal', 
        placeholder: 'Selecione',
        tipo: 'select',
        opcoes: ['Preto Fosco com Letras Brancas', 'Azul Petróleo com Letras Douradas', 'Vermelho Rubi', 'Rosa Pastel', 'Verde Esmeralda', 'Laranja Vibrante'] 
      }
    ],
    destaque: true,
    ativo: true,
    reverte_ong: true,
    tags: ['Impressão 3D', 'QR Code Integrado', 'Personalizável', 'Mais Vendido'],
    criado_em: '2026-10-10T10:00:00Z'
  },
  {
    id: 'prod-002',
    nome: 'Caminha Nuvem Ortopédica Antiestresse para Cães e Gatos',
    slug: 'caminha-nuvem-ortopedica-antiestresse',
    descricao: 'A caminha favorita dos peludos! Fabricada em pelúcia felpuda hipoalergênica com fundo impermeável antiderrapante. O formato redondo com bordas elevadas cria uma sensação de aconchego e proteção que reduz a ansiedade dos animais. Enchimento de fibra siliconada virgem super macia com zíper completo para fácil lavagem na máquina.',
    preco: 99.90,
    preco_promocional: 84.90,
    categoria: 'camas_conforto',
    fotos: [
      'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1541599540903-216a46ca1dc0?auto=format&fit=crop&q=80&w=800'
    ],
    estoque: 25,
    tipo_producao: 'pronta_entrega',
    tempo_producao_dias: 1,
    permite_personalizacao: true,
    campos_personalizacao: [
      {
        label: 'Tamanho da Caminha',
        placeholder: 'Selecione o tamanho',
        tipo: 'select',
        opcoes: ['P - 50cm (Pets até 6kg)', 'M - 65cm (Pets até 12kg)', 'G - 80cm (Pets até 25kg)', 'GG - 100cm (Pets de grande porte)']
      },
      {
        label: 'Cor Desejada',
        placeholder: 'Selecione a cor',
        tipo: 'select',
        opcoes: ['Cinza Chumbo Sofisticado', 'Bege Caramelo', 'Rosa Bebê', 'Azul Céu']
      }
    ],
    destaque: true,
    ativo: true,
    reverte_ong: true,
    tags: ['Caminha Antiestresse', 'Ortopédica', 'Lavável com Zíper', 'Alta Conforto'],
    criado_em: '2026-10-11T12:00:00Z'
  },
  {
    id: 'prod-003',
    nome: 'Coleira Personalizada em Nylon Refletivo com Fivela Gravada',
    slug: 'coleira-personalizada-nylon-refletivo',
    descricao: 'Segurança e estilo para seu cão em qualquer passeio. Confeccionada em fita de nylon militar de trama reforçada, com 2 faixas refletivas de alta visibilidade para passeios noturnos. Acompanha fivela de engate rápido em metal cromado com gravação a laser permanente do nome do animal e 2 telefones de contato.',
    preco: 49.90,
    preco_promocional: 42.00,
    categoria: 'coleiras_acessorios',
    fotos: [
      'https://images.unsplash.com/photo-1535294435445-d7249524ef2e?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&q=80&w=800'
    ],
    estoque: 60,
    tipo_producao: 'sob_encomenda',
    tempo_producao_dias: 2,
    permite_personalizacao: true,
    campos_personalizacao: [
      { label: 'Nome do Cão para Gravar', placeholder: 'Ex: Luke, Frida, Billy...' },
      { label: 'Telefone 1 com DDD', placeholder: 'Ex: (43) 99123-4567' },
      { label: 'Telefone 2 com DDD (Opcional)', placeholder: 'Ex: (43) 99888-7777' },
      {
        label: 'Tamanho do Pescoço',
        placeholder: 'Selecione',
        tipo: 'select',
        opcoes: ['P (25cm a 38cm)', 'M (35cm a 50cm)', 'G (45cm a 65cm)']
      },
      {
        label: 'Cor da Coleira',
        placeholder: 'Selecione',
        tipo: 'select',
        opcoes: ['Preto com Refletivo Prata', 'Vermelho Ferrari', 'Azul Marinho', 'Verde Militar', 'Rosa Choque']
      }
    ],
    destaque: true,
    ativo: true,
    reverte_ong: true,
    tags: ['Gravação a Laser', 'Refletiva Noturna', 'Super Resistente', 'Personalizada'],
    criado_em: '2026-10-12T09:00:00Z'
  },
  {
    id: 'prod-004',
    nome: 'Comedouro Lento Anti-engasgo Labirinto em Impressão 3D',
    slug: 'comedouro-lento-antiengasgo-3d',
    descricao: 'Desenvolvido por veterinários e impresso em tecnologia 3D com filamento bio-food seguro. O formato interno de labirinto obriga cães afobados a comerem os grãos devagar, prevenindo torção estomacal, regurgitação, refluxo e gases. Fundo com pés antiderrapantes de silicone.',
    preco: 39.90,
    preco_promocional: 32.90,
    categoria: 'impressao_3d',
    fotos: [
      'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&q=80&w=800'
    ],
    estoque: 40,
    tipo_producao: 'impressao_3d',
    tempo_producao_dias: 2,
    permite_personalizacao: true,
    campos_personalizacao: [
      {
        label: 'Dificuldade do Labirinto',
        placeholder: 'Selecione',
        tipo: 'select',
        opcoes: ['Intermediário (Espiral de Ondas)', 'Avançado (Colmeia Hexagonal)']
      },
      {
        label: 'Cor do Comedouro 3D',
        placeholder: 'Selecione',
        tipo: 'select',
        opcoes: ['Verde Menta', 'Azul Cobalto', 'Laranja Citrus', 'Cinza Metálico']
      }
    ],
    destaque: false,
    ativo: true,
    reverte_ong: true,
    tags: ['Impressão 3D', 'Saúde Digestiva', 'Anti-Engasgo', 'Veterinário'],
    criado_em: '2026-10-12T14:30:00Z'
  },
  {
    id: 'prod-005',
    nome: 'Suporte de Parede 3D para Coleiras com Silhueta do Pet',
    slug: 'suporte-parede-3d-coleiras-silhueta',
    descricao: 'Porta-guias e coleiras decorativo para colocar na entrada da sua casa. Impresso em 3D com acabamento acetinado de alta precisão, possui 3 ganchos super resistentes (suportam até 4kg cada) e a silhueta da raça do seu bichinho com o nome da família gravado.',
    preco: 34.90,
    categoria: 'impressao_3d',
    fotos: [
      'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&q=80&w=800'
    ],
    estoque: 30,
    tipo_producao: 'impressao_3d',
    tempo_producao_dias: 3,
    permite_personalizacao: true,
    campos_personalizacao: [
      { label: 'Nome para Gravação (ex: Cantinho do Bob / Família Silva)', placeholder: 'Nome ou frase curta' },
      {
        label: 'Raça / Silhueta Desejada',
        placeholder: 'Selecione',
        tipo: 'select',
        opcoes: ['Vira-Lata Caramelo (SRD)', 'Golden / Labrador', 'Shih Tzu / Lhasa', 'Pitbull / Buldogue', 'Gatinho Elegante', 'Poodle / Maltês']
      },
      {
        label: 'Cor da Peça',
        placeholder: 'Selecione',
        tipo: 'select',
        opcoes: ['Preto Acetinado', 'Branco Puro', 'Madeira Dourada 3D', 'Cinza Grafite']
      }
    ],
    destaque: false,
    ativo: true,
    reverte_ong: true,
    tags: ['Impressão 3D', 'Decoração Pet', 'Organizador', 'Personalizável'],
    criado_em: '2026-10-13T10:00:00Z'
  },
  {
    id: 'prod-006',
    nome: 'Cama Iglu 2 em 1 Térmica para Gatos e Cães Pequenos',
    slug: 'cama-iglu-2-em-1-termica',
    descricao: 'O refúgio perfeito contra o frio e o barulho! Funciona como iglu fechado para momentos em que o pet busca privacidade e escuridão, e pode ser recolhida para virar um cesto aberto nos dias mais amenos. Acompanha almofada dupla face macia.',
    preco: 79.90,
    preco_promocional: 69.90,
    categoria: 'camas_conforto',
    fotos: [
      'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=800'
    ],
    estoque: 18,
    tipo_producao: 'pronta_entrega',
    tempo_producao_dias: 1,
    permite_personalizacao: false,
    destaque: false,
    ativo: true,
    reverte_ong: true,
    tags: ['Para Gatos & Cães Pequenos', '2 em 1', 'Térmica', 'Inverno Aconchegante'],
    criado_em: '2026-10-14T11:00:00Z'
  },
  {
    id: 'prod-007',
    nome: 'Chaveiro 3D Silhueta de Raça com Nome do Peludo',
    slug: 'chaveiro-3d-silhueta-raca-nome',
    descricao: 'Leve seu amor pelo seu pet para onde você for! Chaveiro leve, durável e charmoso com argola de aço e pingente impresso em 3D. 100% do lucro deste item é destinado à compra de sacos de ração para o Banco de Ração Municipal.',
    preco: 15.00,
    categoria: 'impressao_3d',
    fotos: [
      'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=800'
    ],
    estoque: 150,
    tipo_producao: 'impressao_3d',
    tempo_producao_dias: 2,
    permite_personalizacao: true,
    campos_personalizacao: [
      { label: 'Nome do Pet para o Chaveiro', placeholder: 'Ex: Pipoca, Max, Luna...' },
      {
        label: 'Silhueta',
        placeholder: 'Selecione',
        tipo: 'select',
        opcoes: ['Vira-Lata Orelhinha em Pé', 'Patinha Pet', 'Gatinho', 'Golden Retriever', 'Bulldog Francês', 'Dachshund (Salsicha)']
      }
    ],
    destaque: false,
    ativo: true,
    reverte_ong: true,
    tags: ['Impressão 3D', '100% Solidário', 'Lembrancinha', 'Apoie o Banco de Ração'],
    criado_em: '2026-10-15T08:00:00Z'
  }
];

// Exemplos de pedidos simulados para a visualização do admin
export const PEDIDOS_PADRAO: PedidoLoja[] = [
  {
    id: 'ped-001',
    numero_pedido: 'PED-2026-8912',
    cliente_nome: 'Camila Fernandes',
    cliente_telefone: '(43) 99123-8877',
    cliente_cpf: '333.444.555-66',
    cliente_endereco: 'Rua das Andorinhas, 450, Apto 32',
    cliente_bairro: 'Centro',
    cliente_cidade: 'Arapongas - PR',
    itens: [
      {
        produto_id: 'prod-001',
        nome: 'Plaquinha de Identificação 3D com QR Code Inteligente',
        preco_unitario: 19.90,
        quantidade: 2,
        foto: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&q=80&w=800',
        personalizacao: {
          'Nome do Pet para a Frente': 'Pipoca',
          'Telefone com DDD para o Verso': '(43) 99123-8877',
          'Formato da Plaquinha': 'Osso Tradicional',
          'Cor Principal': 'Azul Petróleo com Letras Douradas'
        }
      },
      {
        produto_id: 'prod-002',
        nome: 'Caminha Nuvem Ortopédica Antiestresse para Cães e Gatos',
        preco_unitario: 84.90,
        quantidade: 1,
        foto: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=800',
        personalizacao: {
          'Tamanho da Caminha': 'M - 65cm (Pets até 12kg)',
          'Cor Desejada': 'Cinza Chumbo Sofisticado'
        }
      }
    ],
    valor_subtotal: 124.70,
    taxa_entrega: 0,
    valor_total: 124.70,
    metodo_pagamento: 'pix',
    status: 'em_producao',
    observacoes: 'Cliente enviou comprovante PIX via WhatsApp. Plaquinha já em fila de impressão 3D.',
    criado_em: '2026-10-18T14:20:00Z'
  },
  {
    id: 'ped-002',
    numero_pedido: 'PED-2026-8913',
    cliente_nome: 'Marcos Vinícius Silva',
    cliente_telefone: '(43) 98877-6655',
    cliente_endereco: 'Rua Tangará, 1200',
    cliente_bairro: 'Vila Industrial',
    cliente_cidade: 'Arapongas - PR',
    itens: [
      {
        produto_id: 'prod-003',
        nome: 'Coleira Personalizada em Nylon Refletivo com Fivela Gravada',
        preco_unitario: 42.00,
        quantidade: 1,
        foto: 'https://images.unsplash.com/photo-1535294435445-d7249524ef2e?auto=format&fit=crop&q=80&w=800',
        personalizacao: {
          'Nome do Cão para Gravar': 'Thor',
          'Telefone 1 com DDD': '(43) 98877-6655',
          'Tamanho do Pescoço': 'G (45cm a 65cm)',
          'Cor da Coleira': 'Vermelho Ferrari'
        }
      }
    ],
    valor_subtotal: 42.00,
    taxa_entrega: 5.00,
    valor_total: 47.00,
    metodo_pagamento: 'whatsapp',
    status: 'pronto_retirada',
    observacoes: 'Retirada no Almoxarifado Central / Bazar Solidário.',
    criado_em: '2026-10-19T09:15:00Z'
  }
];

// OPERAÇÕES DE PRODUTOS
export async function fetchProdutosLoja(): Promise<ProdutoLoja[]> {
  try {
    const local = localStorage.getItem(STORAGE_PRODUTOS);
    if (local) {
      const parsed = JSON.parse(local);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Erro ao ler produtos do localStorage, usando padrões:', e);
  }

  // Se não existir nada salvo, salva os padrões
  localStorage.setItem(STORAGE_PRODUTOS, JSON.stringify(PRODUTOS_PADRAO));
  return PRODUTOS_PADRAO;
}

export async function salvarProdutoLoja(produto: Partial<ProdutoLoja>): Promise<ProdutoLoja> {
  const produtos = await fetchProdutosLoja();
  let produtoFinal: ProdutoLoja;

  if (produto.id) {
    const index = produtos.findIndex(p => p.id === produto.id);
    if (index >= 0) {
      produtoFinal = {
        ...produtos[index],
        ...produto,
        id: produto.id
      } as ProdutoLoja;
      produtos[index] = produtoFinal;
    } else {
      produtoFinal = {
        ...produto,
        id: produto.id,
        criado_em: new Date().toISOString()
      } as ProdutoLoja;
      produtos.unshift(produtoFinal);
    }
  } else {
    produtoFinal = {
      ...produto,
      id: 'prod-' + Date.now(),
      slug: (produto.nome || 'produto').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      criado_em: new Date().toISOString()
    } as ProdutoLoja;
    produtos.unshift(produtoFinal);
  }

  localStorage.setItem(STORAGE_PRODUTOS, JSON.stringify(produtos));

  // Tenta sincronizar com Supabase se a tabela existir
  try {
    if (supabase) {
      await supabase.from('produtos_loja').upsert(produtoFinal);
    }
  } catch (e) {
    // Silencia se a tabela opcional não estiver no Supabase
  }

  return produtoFinal;
}

export async function excluirProdutoLoja(id: string): Promise<void> {
  const produtos = await fetchProdutosLoja();
  const filtrados = produtos.filter(p => p.id !== id);
  localStorage.setItem(STORAGE_PRODUTOS, JSON.stringify(filtrados));

  try {
    if (supabase) {
      await supabase.from('produtos_loja').delete().eq('id', id);
    }
  } catch (e) {}
}

// OPERAÇÕES DE PEDIDOS
export async function fetchPedidosLoja(): Promise<PedidoLoja[]> {
  try {
    const local = localStorage.getItem(STORAGE_PEDIDOS);
    if (local) {
      const parsed = JSON.parse(local);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {}

  localStorage.setItem(STORAGE_PEDIDOS, JSON.stringify(PEDIDOS_PADRAO));
  return PEDIDOS_PADRAO;
}

export async function criarPedidoLoja(dados: Omit<PedidoLoja, 'id' | 'numero_pedido' | 'criado_em'>): Promise<PedidoLoja> {
  const pedidos = await fetchPedidosLoja();
  const novoPedido: PedidoLoja = {
    ...dados,
    id: 'ped-' + Date.now(),
    numero_pedido: `PED-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    criado_em: new Date().toISOString()
  };

  pedidos.unshift(novoPedido);
  localStorage.setItem(STORAGE_PEDIDOS, JSON.stringify(pedidos));

  // Limpa carrinho local
  localStorage.removeItem(STORAGE_CARRINHO);

  return novoPedido;
}

export async function atualizarStatusPedido(id: string, status: PedidoLoja['status']): Promise<void> {
  const pedidos = await fetchPedidosLoja();
  const index = pedidos.findIndex(p => p.id === id);
  if (index >= 0) {
    pedidos[index].status = status;
    localStorage.setItem(STORAGE_PEDIDOS, JSON.stringify(pedidos));
  }
}

// GERAÇÃO DE MENSAGEM DO WHATSAPP COM OS DETALHES DO PEDIDO
export function gerarMensagemWhatsAppPedido(pedido: PedidoLoja, telefoneVendedor = '5543999999999'): string {
  let texto = `🐾 *NOVO PEDIDO - LOJINHA PETCONECTA BR*\n`;
  texto += `📋 *Pedido:* ${pedido.numero_pedido}\n`;
  texto += `👤 *Cliente:* ${pedido.cliente_nome}\n`;
  texto += `📱 *Telefone:* ${pedido.cliente_telefone}\n`;
  texto += `📍 *Endereço:* ${pedido.cliente_endereco}, ${pedido.cliente_bairro} - ${pedido.cliente_cidade}\n\n`;
  
  texto += `🛒 *ITENS DO PEDIDO:*\n`;
  pedido.itens.forEach((item, idx) => {
    texto += `\n*${idx + 1}. ${item.nome}* (x${item.quantidade})\n`;
    texto += `   Valor: R$ ${(item.preco_unitario * item.quantidade).toFixed(2)}\n`;
    if (item.personalizacao && Object.keys(item.personalizacao).length > 0) {
      texto += `   *Personalização Solicitada:*\n`;
      Object.entries(item.personalizacao).forEach(([chave, valor]) => {
        texto += `   • ${chave}: _${valor}_\n`;
      });
    }
  });

  texto += `\n💰 *VALOR TOTAL:* R$ ${pedido.valor_total.toFixed(2)}\n`;
  texto += `💳 *Forma de Pagamento:* ${pedido.metodo_pagamento === 'pix' ? 'Chave PIX' : 'Combinar via WhatsApp'}\n`;
  
  if (pedido.observacoes) {
    texto += `📝 *Observações:* ${pedido.observacoes}\n`;
  }

  texto += `\nOlá, gostaria de confirmar a produção e o envio do meu pedido! Aguardo orientações. Obrigado! 🐶🐱`;

  const textoEncoded = encodeURIComponent(texto);
  return `https://wa.me/${telefoneVendedor}?text=${textoEncoded}`;
}

// HELPERS DE CARRINHO NO STORAGE
export function getCarrinhoLocal(): ItemCarrinho[] {
  try {
    const raw = localStorage.getItem(STORAGE_CARRINHO);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function salvarCarrinhoLocal(itens: ItemCarrinho[]) {
  localStorage.setItem(STORAGE_CARRINHO, JSON.stringify(itens));
}
