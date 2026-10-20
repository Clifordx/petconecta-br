import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Search, 
  SlidersHorizontal, 
  Tag, 
  Sparkles, 
  Printer, 
  Heart, 
  Share2, 
  Check, 
  X, 
  Plus, 
  Minus, 
  ShoppingCart, 
  ArrowRight, 
  MessageCircle, 
  QrCode, 
  ShieldCheck, 
  Clock, 
  Copy, 
  Dog, 
  Cat, 
  Layers,
  MapPin,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ProdutoLoja, 
  CategoriaProduto, 
  ItemCarrinho, 
  PedidoLoja, 
  fetchProdutosLoja, 
  criarPedidoLoja, 
  gerarMensagemWhatsAppPedido, 
  getCarrinhoLocal, 
  salvarCarrinhoLocal 
} from '@/lib/loja';
import { Button } from '@/components/ui/Button';

export default function LojaPublica() {
  const { user, profile } = useAuth();
  
  const [produtos, setProdutos] = useState<ProdutoLoja[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoriaAtiva, setCategoriaAtiva] = useState<string>('todas');
  const [busca, setBusca] = useState('');
  const [apenas3D, setApenas3D] = useState(false);
  const [apenasPersonalizaveis, setApenasPersonalizaveis] = useState(false);

  // Carrinho
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]);
  const [carrinhoAberto, setCarrinhoAberto] = useState(false);

  // Modal de Detalhe e Personalização
  const [produtoModal, setProdutoModal] = useState<ProdutoLoja | null>(null);
  const [personalizacaoTemp, setPersonalizacaoTemp] = useState<Record<string, string>>({});
  const [qtdTemp, setQtdTemp] = useState(1);

  // Modal de Checkout / Finalização
  const [checkoutAberto, setCheckoutAberto] = useState(false);
  const [clienteNome, setClienteNome] = useState('');
  const [clienteTelefone, setClienteTelefone] = useState('');
  const [clienteEndereco, setClienteEndereco] = useState('');
  const [clienteBairro, setClienteBairro] = useState('');
  const [metodoPagamento, setMetodoPagamento] = useState<'pix' | 'whatsapp'>('pix');
  const [pedidoConcluido, setPedidoConcluido] = useState<PedidoLoja | null>(null);
  const [enviandoPedido, setEnviandoPedido] = useState(false);

  useEffect(() => {
    carregarProdutos();
    setCarrinho(getCarrinhoLocal());
  }, []);

  // Preenche dados do usuário logado se disponíveis
  useEffect(() => {
    if (profile) {
      if (profile.nome) setClienteNome(profile.nome);
      if (profile.telefone) setClienteTelefone(profile.telefone);
      if (profile.endereco) setClienteEndereco(profile.endereco);
      if (profile.bairro) setClienteBairro(profile.bairro);
    }
  }, [profile]);

  const carregarProdutos = async () => {
    try {
      setLoading(true);
      const lista = await fetchProdutosLoja();
      setProdutos(lista.filter(p => p.ativo));
    } catch (e) {
      console.error(e);
      toast.error('Não foi possível carregar os produtos.');
    } finally {
      setLoading(false);
    }
  };

  const categorias = [
    { id: 'todas', nome: 'Todos os Produtos', icone: Tag },
    { id: 'impressao_3d', nome: 'Impressão 3D', icone: Printer },
    { id: 'camas_conforto', nome: 'Camas & Conforto', icone: Heart },
    { id: 'coleiras_acessorios', nome: 'Coleiras Personalizadas', icone: Sparkles },
    { id: 'comedouros_bebedouros', nome: 'Comedouros & Tigelas', icone: Layers },
    { id: 'solidario', nome: '100% Solidário', icone: Dog },
  ];

  // Filtros aplicados
  const produtosFiltrados = produtos.filter((p) => {
    if (categoriaAtiva !== 'todas' && p.categoria !== categoriaAtiva) {
      return false;
    }
    if (apenas3D && p.categoria !== 'impressao_3d') {
      return false;
    }
    if (apenasPersonalizaveis && !p.permite_personalizacao) {
      return false;
    }
    if (busca.trim()) {
      const q = busca.toLowerCase();
      const matchNome = p.nome.toLowerCase().includes(q);
      const matchDesc = p.descricao.toLowerCase().includes(q);
      const matchTag = p.tags.some(t => t.toLowerCase().includes(q));
      if (!matchNome && !matchDesc && !matchTag) return false;
    }
    return true;
  });

  const abrirModalProduto = (p: ProdutoLoja) => {
    setProdutoModal(p);
    setQtdTemp(1);
    const inicialPersonalizacao: Record<string, string> = {};
    if (p.campos_personalizacao) {
      p.campos_personalizacao.forEach(c => {
        if (c.tipo === 'select' && c.opcoes && c.opcoes.length > 0) {
          inicialPersonalizacao[c.label] = c.opcoes[0];
        } else {
          inicialPersonalizacao[c.label] = '';
        }
      });
    }
    setPersonalizacaoTemp(inicialPersonalizacao);
  };

  const adicionarAoCarrinho = (p: ProdutoLoja, qtd: number, personalizacoes: Record<string, string>) => {
    // Validação se há campos obrigatórios vazios
    if (p.permite_personalizacao && p.campos_personalizacao) {
      for (const campo of p.campos_personalizacao) {
        if (campo.tipo !== 'select' && !personalizacoes[campo.label]?.trim()) {
          toast.warning(`Por favor, preencha o campo: "${campo.label}"`);
          return;
        }
      }
    }

    const precoFinal = p.preco_promocional || p.preco;
    const novoItem: ItemCarrinho = {
      produto_id: p.id,
      nome: p.nome,
      preco_unitario: precoFinal,
      quantidade: qtd,
      foto: p.fotos[0] || 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&q=80&w=800',
      personalizacao: Object.keys(personalizacoes).length > 0 ? { ...personalizacoes } : undefined
    };

    const atualizado = [...carrinho, novoItem];
    setCarrinho(atualizado);
    salvarCarrinhoLocal(atualizado);
    setProdutoModal(null);
    toast.success(`${p.nome} adicionado à sacola!`);
  };

  const removerDoCarrinho = (index: number) => {
    const atualizado = carrinho.filter((_, i) => i !== index);
    setCarrinho(atualizado);
    salvarCarrinhoLocal(atualizado);
    toast.info('Item removido da sacola.');
  };

  const alterarQtdCarrinho = (index: number, delta: number) => {
    const atualizado = [...carrinho];
    const novaQtd = atualizado[index].quantidade + delta;
    if (novaQtd <= 0) {
      removerDoCarrinho(index);
    } else {
      atualizado[index].quantidade = novaQtd;
      setCarrinho(atualizado);
      salvarCarrinhoLocal(atualizado);
    }
  };

  const subtotal = carrinho.reduce((acc, item) => acc + item.preco_unitario * item.quantidade, 0);
  const totalItens = carrinho.reduce((acc, item) => acc + item.quantidade, 0);

  const handleFinalizarPedido = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!clienteNome.trim() || !clienteTelefone.trim() || !clienteEndereco.trim() || !clienteBairro.trim()) {
      toast.error('Preencha seu nome, telefone, endereço e bairro para entrega/retirada.');
      return;
    }

    if (carrinho.length === 0) {
      toast.error('Sua sacola está vazia.');
      return;
    }

    setEnviandoPedido(true);
    try {
      const pedido = await criarPedidoLoja({
        cliente_nome: clienteNome,
        cliente_telefone: clienteTelefone,
        cliente_endereco: clienteEndereco,
        cliente_bairro: clienteBairro,
        cliente_cidade: 'Arapongas - PR',
        itens: carrinho,
        valor_subtotal: subtotal,
        taxa_entrega: 0,
        valor_total: subtotal,
        metodo_pagamento: metodoPagamento,
        status: 'pendente',
        observacoes: 'Pedido realizado pela Loja PetConecta BR'
      });

      setPedidoConcluido(pedido);
      setCarrinho([]);
      salvarCarrinhoLocal([]);
      toast.success('Pedido registrado com sucesso!');
    } catch {
      toast.error('Erro ao gerar pedido.');
    } finally {
      setEnviandoPedido(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* BANNER PRINCIPAL / HERO DA LOJA */}
        <div className="relative overflow-hidden bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl">
          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-emerald-100">
              <Sparkles className="w-4 h-4 text-amber-300" />
              Lojinha Pet Solidária & Exclusiva • Arapongas - PR
            </div>
            
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Acessórios, Caminhas & Itens Únicos em Impressão 3D
            </h1>
            
            <p className="text-emerald-100 text-sm sm:text-base leading-relaxed">
              Personalize plaquinhas com <strong>QR Code inteligente</strong>, adquira <strong>caminhas ortopédicas confortáveis</strong> e <strong>coleiras bordadas sob medida</strong>. Além de cuidar do seu pet, você ajuda diretamente na compra de ração para o Banco de Ração Municipal!
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-bold text-white/90">
              <span className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-xl">
                🖨️ Produção 3D com Bioplástico Atóxico
              </span>
              <span className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-xl">
                🏷️ Gravação Personalizada do Nome & Telefone
              </span>
              <span className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-xl">
                ❤️ Apoio ao Resgate Animal de Arapongas
              </span>
            </div>
          </div>

          {/* Botão Flutuante de Sacola no Banner */}
          <button
            onClick={() => setCarrinhoAberto(true)}
            className="absolute top-6 right-6 sm:bottom-10 sm:top-auto sm:right-10 bg-white text-emerald-900 hover:bg-emerald-50 px-5 py-3 rounded-2xl font-black text-sm shadow-xl flex items-center gap-2.5 transition-transform hover:scale-105 active:scale-95"
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5 text-emerald-600" />
              {totalItens > 0 && (
                <span className="absolute -top-2 -right-2 bg-amber-500 text-white font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                  {totalItens}
                </span>
              )}
            </div>
            <span>Minha Sacola</span>
            {totalItens > 0 && (
              <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md text-xs font-mono font-bold">
                R$ {subtotal.toFixed(2)}
              </span>
            )}
          </button>
        </div>

        {/* BARRA DE PESQUISA & FILTROS RÁPIDOS */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Input de Busca */}
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar plaquinha 3D, caminha, coleira..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {busca && (
                <button 
                  onClick={() => setBusca('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Badges de Filtros Extras */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <button
                onClick={() => setApenas3D(!apenas3D)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 ${
                  apenas3D 
                    ? 'bg-purple-100 text-purple-900 border-purple-300 shadow-xs' 
                    : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                🖨️ Apenas Impressão 3D
              </button>

              <button
                onClick={() => setApenasPersonalizaveis(!apenasPersonalizaveis)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 ${
                  apenasPersonalizaveis 
                    ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-xs' 
                    : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                ✨ Personalizáveis (com Nome)
              </button>

              {(categoriaAtiva !== 'todas' || apenas3D || apenasPersonalizaveis || busca) && (
                <button
                  onClick={() => {
                    setCategoriaAtiva('todas');
                    setApenas3D(false);
                    setApenasPersonalizaveis(false);
                    setBusca('');
                  }}
                  className="px-3 py-1.5 text-xs font-bold text-red-600 hover:text-red-700 hover:underline"
                >
                  Limpar filtros
                </button>
              )}
            </div>
          </div>

          {/* Categorias Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
            {categorias.map((cat) => {
              const Icon = cat.icone;
              const ativa = categoriaAtiva === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setCategoriaAtiva(cat.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
                    ativa
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {cat.nome}
                </button>
              );
            })}
          </div>
        </div>

        {/* LISTAGEM DE PRODUTOS */}
        {loading ? (
          <div className="text-center py-16">
            <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-500 font-medium">Carregando catálogo de produtos...</p>
          </div>
        ) : produtosFiltrados.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto space-y-3">
            <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">Nenhum produto encontrado</h3>
            <p className="text-xs text-slate-500">Tente ajustar seus termos de busca ou remover os filtros aplicados.</p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setCategoriaAtiva('todas');
                setApenas3D(false);
                setApenasPersonalizaveis(false);
                setBusca('');
              }}
            >
              Ver Todos os Produtos
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {produtosFiltrados.map((prod) => {
              const temDesconto = prod.preco_promocional && prod.preco_promocional < prod.preco;
              return (
                <div
                  key={prod.id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group"
                >
                  {/* FOTO DO PRODUTO */}
                  <div className="relative aspect-4/3 bg-slate-100 overflow-hidden">
                    <img
                      src={prod.fotos[0] || 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&q=80&w=800'}
                      alt={prod.nome}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* BADGES NO CANTO DA IMAGEM */}
                    <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start">
                      {prod.categoria === 'impressao_3d' && (
                        <span className="px-2 py-0.5 bg-purple-600/90 backdrop-blur-xs text-white text-[10px] font-black uppercase rounded-md shadow-xs flex items-center gap-1">
                          <Printer className="w-3 h-3" /> 3D Print
                        </span>
                      )}
                      {prod.permite_personalizacao && (
                        <span className="px-2 py-0.5 bg-amber-500/90 backdrop-blur-xs text-white text-[10px] font-black uppercase rounded-md shadow-xs flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> Personalizável
                        </span>
                      )}
                      {temDesconto && (
                        <span className="px-2 py-0.5 bg-red-600/90 backdrop-blur-xs text-white text-[10px] font-black uppercase rounded-md shadow-xs">
                          OFERTA
                        </span>
                      )}
                    </div>

                    {prod.reverte_ong && (
                      <span className="absolute bottom-2.5 right-2.5 bg-emerald-600/90 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-xs">
                        <Heart className="w-3 h-3 text-red-300 fill-red-300" /> Solidário
                      </span>
                    )}
                  </div>

                  {/* CONTEÚDO DO CARD */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-1">
                        {prod.categoria === 'impressao_3d' ? 'Tecnologia 3D' : prod.categoria.replace('_', ' ')}
                        {prod.tempo_producao_dias ? ` • ${prod.tempo_producao_dias}d produção` : ''}
                      </div>

                      <h3 className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2">
                        {prod.nome}
                      </h3>

                      <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                        {prod.descricao}
                      </p>
                    </div>

                    {/* PREÇO E BOTÕES */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div>
                        {temDesconto ? (
                          <div>
                            <span className="text-[10px] text-slate-400 line-through block leading-tight">
                              R$ {prod.preco.toFixed(2)}
                            </span>
                            <span className="text-lg font-black text-emerald-800">
                              R$ {prod.preco_promocional?.toFixed(2)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-lg font-black text-slate-900">
                            R$ {prod.preco.toFixed(2)}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => abrirModalProduto(prod)}
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                      >
                        {prod.permite_personalizacao ? 'Personalizar' : 'Comprar'}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* MODAL DE DETALHES & PERSONALIZAÇÃO DO PRODUTO */}
      {produtoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative space-y-6 max-h-[90vh] overflow-y-auto">
            
            {/* Fechar */}
            <button
              onClick={() => setProdutoModal(null)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col sm:flex-row gap-6">
              {/* Imagem */}
              <div className="w-full sm:w-1/2 aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                <img
                  src={produtoModal.fotos[0] || 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&q=80&w=800'}
                  alt={produtoModal.nome}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Informações Principais */}
              <div className="w-full sm:w-1/2 space-y-3">
                <div className="flex flex-wrap gap-1.5">
                  {produtoModal.categoria === 'impressao_3d' && (
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-[10px] font-black rounded-md">
                      🖨️ IMPRESSÃO 3D
                    </span>
                  )}
                  {produtoModal.reverte_ong && (
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-md">
                      ❤️ PRODUTO SOLIDÁRIO
                    </span>
                  )}
                </div>

                <h2 className="text-xl font-black text-slate-900">
                  {produtoModal.nome}
                </h2>

                <div className="flex items-baseline gap-2">
                  {produtoModal.preco_promocional ? (
                    <>
                      <span className="text-2xl font-black text-emerald-800">
                        R$ {produtoModal.preco_promocional.toFixed(2)}
                      </span>
                      <span className="text-sm text-slate-400 line-through">
                        R$ {produtoModal.preco.toFixed(2)}
                      </span>
                    </>
                  ) : (
                    <span className="text-2xl font-black text-slate-900">
                      R$ {produtoModal.preco.toFixed(2)}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {produtoModal.descricao}
                </p>

                {produtoModal.tempo_producao_dias && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 pt-1">
                    <Clock className="w-3.5 h-3.5 text-emerald-600" />
                    Tempo estimado de confecção: <strong>{produtoModal.tempo_producao_dias} dias úteis</strong>
                  </div>
                )}
              </div>
            </div>

            {/* FORMULÁRIO DE PERSONALIZAÇÃO SE HOUVER */}
            {produtoModal.permite_personalizacao && produtoModal.campos_personalizacao && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Personalize seu Produto Sob Medida:
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {produtoModal.campos_personalizacao.map((campo, idx) => (
                    <div key={idx} className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700">
                        {campo.label} *
                      </label>
                      {campo.tipo === 'select' && campo.opcoes ? (
                        <select
                          value={personalizacaoTemp[campo.label] || ''}
                          onChange={(e) => setPersonalizacaoTemp({
                            ...personalizacaoTemp,
                            [campo.label]: e.target.value
                          })}
                          className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-xl"
                        >
                          {campo.opcoes.map((op, oIdx) => (
                            <option key={oIdx} value={op}>{op}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          placeholder={campo.placeholder}
                          value={personalizacaoTemp[campo.label] || ''}
                          onChange={(e) => setPersonalizacaoTemp({
                            ...personalizacaoTemp,
                            [campo.label]: e.target.value
                          })}
                          className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-xl"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CONTROLE DE QUANTIDADE E AÇÕES */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-600">Quantidade:</span>
                <div className="flex items-center border border-slate-300 rounded-xl bg-slate-50 p-1">
                  <button
                    onClick={() => setQtdTemp(Math.max(1, qtdTemp - 1))}
                    className="p-1 hover:bg-white rounded-lg text-slate-700 transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-3 font-black text-xs text-slate-900">{qtdTemp}</span>
                  <button
                    onClick={() => setQtdTemp(qtdTemp + 1)}
                    className="p-1 hover:bg-white rounded-lg text-slate-700 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => setProdutoModal(null)}
                  className="flex-1 sm:flex-none text-xs"
                >
                  Continuar Olhando
                </Button>

                <Button
                  variant="primary"
                  size="md"
                  onClick={() => adicionarAoCarrinho(produtoModal, qtdTemp, personalizacaoTemp)}
                  className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-xs font-bold flex items-center gap-1.5"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Adicionar à Sacola (R$ {((produtoModal.preco_promocional || produtoModal.preco) * qtdTemp).toFixed(2)})
                </Button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* DRAWER / MODAL DA SACOLA DE COMPRAS */}
      {carrinhoAberto && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
            
            {/* Header da Sacola */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-emerald-600" />
                <h3 className="font-black text-base text-slate-900">
                  Minha Sacola ({totalItens} {totalItens === 1 ? 'item' : 'itens'})
                </h3>
              </div>
              <button
                onClick={() => setCarrinhoAberto(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Itens da Sacola */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {carrinho.length === 0 ? (
                <div className="text-center py-20 space-y-3">
                  <ShoppingBag className="w-12 h-12 text-slate-200 mx-auto" />
                  <p className="text-sm font-bold text-slate-700">Sua sacola está vazia</p>
                  <p className="text-xs text-slate-400">Adicione caminhas, coleiras personalizadas ou itens 3D para seu pet.</p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setCarrinhoAberto(false)}
                  >
                    Ver Produtos
                  </Button>
                </div>
              ) : (
                carrinho.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex gap-3 relative"
                  >
                    <img
                      src={item.foto}
                      alt={item.nome}
                      className="w-16 h-16 rounded-xl object-cover bg-white border border-slate-200 flex-shrink-0"
                    />

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                          {item.nome}
                        </h4>
                        <button
                          onClick={() => removerDoCarrinho(idx)}
                          className="text-slate-400 hover:text-red-500 p-0.5"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {item.personalizacao && (
                        <div className="text-[10px] text-slate-600 bg-white p-1.5 rounded-lg border border-slate-200 space-y-0.5">
                          {Object.entries(item.personalizacao).map(([k, v]) => (
                            <div key={k} className="truncate">
                              <strong>{k}:</strong> {v}
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center border border-slate-300 rounded-lg bg-white">
                          <button
                            onClick={() => alterarQtdCarrinho(idx, -1)}
                            className="px-1.5 py-0.5 text-slate-600 hover:bg-slate-100 rounded-l"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 text-xs font-bold text-slate-800 font-mono">
                            {item.quantidade}
                          </span>
                          <button
                            onClick={() => alterarQtdCarrinho(idx, 1)}
                            className="px-1.5 py-0.5 text-slate-600 hover:bg-slate-100 rounded-r"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="text-xs font-black text-emerald-800">
                          R$ {(item.preco_unitario * item.quantidade).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer da Sacola com Total */}
            {carrinho.length > 0 && (
              <div className="p-5 border-t border-slate-200 bg-slate-50 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-bold text-slate-900">R$ {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>Entrega / Retirada em Arapongas:</span>
                  <span className="font-bold text-emerald-700">A combinar / Grátis</span>
                </div>
                <div className="flex items-center justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total do Pedido:</span>
                  <span className="text-emerald-800 text-lg">R$ {subtotal.toFixed(2)}</span>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => {
                    setCarrinhoAberto(false);
                    setCheckoutAberto(true);
                  }}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 font-black text-xs py-3 rounded-xl shadow-md flex items-center justify-center gap-2"
                >
                  Finalizar Pedido <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* MODAL DE CHECKOUT / DADOS DE ENTREGA & PAGAMENTO */}
      {checkoutAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative space-y-5">
            
            <button
              onClick={() => {
                setCheckoutAberto(false);
                setPedidoConcluido(null);
              }}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            {!pedidoConcluido ? (
              <form onSubmit={handleFinalizarPedido} className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    Finalizar Pedido na Lojinha
                  </h3>
                  <p className="text-xs text-slate-500">
                    Informe onde deseja receber seus produtos em Arapongas - PR.
                  </p>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Seu Nome Completo *</label>
                    <input
                      type="text"
                      required
                      value={clienteNome}
                      onChange={(e) => setClienteNome(e.target.value)}
                      placeholder="Ex: Ana Maria Silva"
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">WhatsApp para Contato / Atualizações *</label>
                    <input
                      type="tel"
                      required
                      value={clienteTelefone}
                      onChange={(e) => setClienteTelefone(e.target.value)}
                      placeholder="(43) 99999-9999"
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Bairro em Arapongas *</label>
                      <input
                        type="text"
                        required
                        value={clienteBairro}
                        onChange={(e) => setClienteBairro(e.target.value)}
                        placeholder="Ex: Centro, Vila Nova..."
                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Endereço & Número *</label>
                      <input
                        type="text"
                        required
                        value={clienteEndereco}
                        onChange={(e) => setClienteEndereco(e.target.value)}
                        placeholder="Rua, número e apto"
                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                      />
                    </div>
                  </div>
                </div>

                {/* FORMA DE PAGAMENTO */}
                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <label className="block text-xs font-bold text-slate-800">
                    Escolha a Forma de Pagamento:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setMetodoPagamento('pix')}
                      className={`p-3 rounded-xl border text-center text-xs font-bold transition-all ${
                        metodoPagamento === 'pix'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-xs'
                          : 'border-slate-300 bg-slate-50 text-slate-700'
                      }`}
                    >
                      <QrCode className="w-4 h-4 mx-auto mb-1 text-emerald-600" />
                      PIX Instantâneo
                    </button>

                    <button
                      type="button"
                      onClick={() => setMetodoPagamento('whatsapp')}
                      className={`p-3 rounded-xl border text-center text-xs font-bold transition-all ${
                        metodoPagamento === 'whatsapp'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-xs'
                          : 'border-slate-300 bg-slate-50 text-slate-700'
                      }`}
                    >
                      <MessageCircle className="w-4 h-4 mx-auto mb-1 text-emerald-600" />
                      Combinar no WhatsApp
                    </button>
                  </div>
                </div>

                {/* RESUMO DE VALORES */}
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-950">Total a Pagar ({totalItens} itens):</span>
                  <span className="text-base font-black text-emerald-800 font-mono">
                    R$ {subtotal.toFixed(2)}
                  </span>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={enviandoPedido}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 font-black text-xs py-3 rounded-xl shadow-md"
                >
                  {enviandoPedido ? 'Registrando Pedido...' : 'Confirmar e Gerar Pedido'}
                </Button>
              </form>
            ) : (
              /* TELA DE SUCESSO DO PEDIDO */
              <div className="space-y-5 text-center py-2">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-xl font-black text-slate-900">
                    Pedido Realizado com Sucesso!
                  </h3>
                  <p className="text-xs text-slate-500">
                    Protocolo: <strong className="font-mono text-emerald-800">{pedidoConcluido.numero_pedido}</strong>
                  </p>
                </div>

                {/* CAIXA DE PIX SE ESCOLHIDO */}
                {pedidoConcluido.metodo_pagamento === 'pix' && (
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-2.5 text-left">
                    <span className="font-bold text-slate-800 block text-center uppercase tracking-wide">
                      🔑 Pagamento via Chave PIX:
                    </span>
                    <div className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-slate-300 font-mono font-bold text-slate-800">
                      <span className="flex-1 truncate">pix@petconecta.com.br</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText('pix@petconecta.com.br');
                          toast.success('Chave PIX copiada para a área de transferência!');
                        }}
                        className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-[11px] font-sans font-bold flex items-center gap-1"
                      >
                        <Copy className="w-3.5 h-3.5" /> Copiar
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-500 text-center">
                      Valor exato: <strong>R$ {pedidoConcluido.valor_total.toFixed(2)}</strong>. Envie o comprovante no WhatsApp da produção.
                    </p>
                  </div>
                )}

                {/* BOTÃO PARA ENVIAR NO WHATSAPP */}
                <div className="space-y-2">
                  <a
                    href={gerarMensagemWhatsAppPedido(pedidoConcluido)}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Enviar Detalhes & Personalizações no WhatsApp
                  </a>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCheckoutAberto(false);
                      setPedidoConcluido(null);
                    }}
                    className="w-full text-xs"
                  >
                    Voltar para a Loja
                  </Button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
