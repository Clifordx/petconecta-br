import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Plus, 
  Search, 
  Tag, 
  Printer, 
  Sparkles, 
  Heart, 
  Trash2, 
  Edit, 
  Check, 
  X, 
  ExternalLink, 
  Eye, 
  Clock, 
  DollarSign, 
  Package, 
  MessageCircle, 
  Layers, 
  CheckCircle2, 
  AlertCircle,
  Truck
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  ProdutoLoja, 
  PedidoLoja, 
  CategoriaProduto, 
  fetchProdutosLoja, 
  salvarProdutoLoja, 
  excluirProdutoLoja, 
  fetchPedidosLoja, 
  atualizarStatusPedido, 
  gerarMensagemWhatsAppPedido 
} from '@/lib/loja';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

export default function GestaoLoja() {
  const [produtos, setProdutos] = useState<ProdutoLoja[]>([]);
  const [pedidos, setPedidos] = useState<PedidoLoja[]>([]);
  const [loading, setLoading] = useState(true);
  const [abaAtiva, setAbaAtiva] = useState<'produtos' | 'pedidos'>('produtos');
  const [busca, setBusca] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todas');

  // Modal Produto
  const [modalProdutoOpen, setModalProdutoOpen] = useState(false);
  const [produtoEditando, setProdutoEditando] = useState<Partial<ProdutoLoja>>({
    nome: '',
    descricao: '',
    preco: 29.90,
    categoria: 'impressao_3d',
    estoque: 50,
    tipo_producao: 'impressao_3d',
    tempo_producao_dias: 2,
    permite_personalizacao: true,
    destaque: false,
    ativo: true,
    reverte_ong: true,
    tags: ['Impressão 3D', 'Personalizável'],
    fotos: ['https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&q=80&w=800']
  });
  const [fotoUrlInput, setFotoUrlInput] = useState('');

  // Modal Detalhe de Pedido
  const [pedidoSelecionado, setPedidoSelecionado] = useState<PedidoLoja | null>(null);

  useEffect(() => {
    carregarTudo();
  }, []);

  const carregarTudo = async () => {
    try {
      setLoading(true);
      const [listaProd, listaPed] = await Promise.all([
        fetchProdutosLoja(),
        fetchPedidosLoja()
      ]);
      setProdutos(listaProd);
      setPedidos(listaPed);
    } catch (e) {
      console.error(e);
      toast.error('Erro ao carregar dados da loja.');
    } finally {
      setLoading(false);
    }
  };

  const handleSalvarProduto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!produtoEditando.nome?.trim()) {
      toast.error('Informe o nome do produto.');
      return;
    }

    try {
      await salvarProdutoLoja(produtoEditando);
      toast.success('Produto salvo com sucesso!');
      setModalProdutoOpen(false);
      await carregarTudo();
    } catch {
      toast.error('Erro ao salvar produto.');
    }
  };

  const handleExcluirProduto = async (id: string, nome: string) => {
    if (confirm(`Tem certeza que deseja remover o produto "${nome}"?`)) {
      try {
        await excluirProdutoLoja(id);
        toast.info('Produto removido.');
        await carregarTudo();
      } catch {
        toast.error('Erro ao excluir produto.');
      }
    }
  };

  const handleToggleAtivo = async (prod: ProdutoLoja) => {
    try {
      await salvarProdutoLoja({
        ...prod,
        ativo: !prod.ativo
      });
      toast.success(`Produto ${prod.ativo ? 'desativado' : 'ativado'} com sucesso!`);
      await carregarTudo();
    } catch {
      toast.error('Erro ao atualizar status.');
    }
  };

  const handleMudarStatusPedido = async (id: string, novoStatus: PedidoLoja['status']) => {
    try {
      await atualizarStatusPedido(id, novoStatus);
      toast.success('Status do pedido atualizado!');
      await carregarTudo();
      if (pedidoSelecionado && pedidoSelecionado.id === id) {
        setPedidoSelecionado({ ...pedidoSelecionado, status: novoStatus });
      }
    } catch {
      toast.error('Erro ao atualizar pedido.');
    }
  };

  const produtosFiltrados = produtos.filter((p) => {
    if (filtroCategoria !== 'todas' && p.categoria !== filtroCategoria) return false;
    if (busca.trim()) {
      const q = busca.toLowerCase();
      return p.nome.toLowerCase().includes(q) || p.descricao.toLowerCase().includes(q);
    }
    return true;
  });

  const faturamentoTotal = pedidos.reduce((acc, p) => acc + p.valor_total, 0);
  const totalItens3D = produtos.filter(p => p.categoria === 'impressao_3d').length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* HEADER DA PÁGINA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider">
              E-commerce & Bazar Solidário
            </span>
            <span className="text-xs text-slate-400 font-bold">• Arapongas - PR</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 flex items-center gap-2">
            <ShoppingBag className="w-7 h-7 text-emerald-600" />
            Gestão da Lojinha Pet & Impressão 3D
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Cadastre caminhas, coleiras personalizadas e itens em impressão 3D para venda e arrecadação.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/loja"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <ExternalLink className="w-4 h-4" /> Ver Loja Pública
          </a>

          <Button
            variant="primary"
            size="md"
            onClick={() => {
              setProdutoEditando({
                nome: '',
                descricao: '',
                preco: 29.90,
                categoria: 'impressao_3d',
                estoque: 50,
                tipo_producao: 'impressao_3d',
                tempo_producao_dias: 2,
                permite_personalizacao: true,
                destaque: false,
                ativo: true,
                reverte_ong: true,
                tags: ['Impressão 3D', 'Personalizável'],
                fotos: ['https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&q=80&w=800']
              });
              setFotoUrlInput('');
              setModalProdutoOpen(true);
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-xs font-bold flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Novo Produto
          </Button>
        </div>
      </div>

      {/* CARDS DE ESTATÍSTICAS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Produtos Ativos
          </span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {produtos.filter(p => p.ativo).length}
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold">
            {produtos.length} cadastrados no total
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Itens em Impressão 3D
          </span>
          <div className="text-2xl font-black text-purple-700 mt-1 flex items-center gap-1.5">
            <Printer className="w-5 h-5 text-purple-600" />
            {totalItens3D}
          </div>
          <span className="text-[11px] text-slate-500 font-semibold">
            Plaquinhas, comedouros e chaveiros
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Pedidos Recebidos
          </span>
          <div className="text-2xl font-black text-blue-700 mt-1">
            {pedidos.length}
          </div>
          <span className="text-[11px] text-blue-600 font-semibold">
            {pedidos.filter(p => p.status === 'pendente' || p.status === 'em_producao').length} aguardando/em produção
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Faturamento Total
          </span>
          <div className="text-2xl font-black text-emerald-800 mt-1 font-mono">
            R$ {faturamentoTotal.toFixed(2)}
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold">
            100% revertido à causa animal
          </span>
        </div>
      </div>

      {/* ABAS: CATÁLOGO vs PEDIDOS */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="flex border-b border-slate-200 bg-slate-50/70 p-1">
          <button
            onClick={() => setAbaAtiva('produtos')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
              abaAtiva === 'produtos'
                ? 'bg-white text-emerald-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Package className="w-4 h-4 text-emerald-600" />
            Catálogo de Produtos ({produtos.length})
          </button>

          <button
            onClick={() => setAbaAtiva('pedidos')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
              abaAtiva === 'pedidos'
                ? 'bg-white text-emerald-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Truck className="w-4 h-4 text-emerald-600" />
            Pedidos dos Clientes ({pedidos.length})
          </button>
        </div>

        {/* CONTEÚDO DA ABA DE PRODUTOS */}
        {abaAtiva === 'produtos' && (
          <div className="p-4 sm:p-6 space-y-4">
            {/* Barra de Filtros */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filtrar por nome do produto..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <select
                value={filtroCategoria}
                onChange={(e) => setFiltroCategoria(e.target.value)}
                className="w-full sm:w-auto text-xs p-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
              >
                <option value="todas">Todas as Categorias</option>
                <option value="impressao_3d">Impressão 3D</option>
                <option value="camas_conforto">Camas & Conforto</option>
                <option value="coleiras_acessorios">Coleiras & Acessórios</option>
                <option value="comedouros_bebedouros">Comedouros</option>
                <option value="solidario">100% Solidário</option>
              </select>
            </div>

            {/* TABELA DE PRODUTOS */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="p-3">Foto / Produto</th>
                    <th className="p-3">Categoria</th>
                    <th className="p-3">Preço</th>
                    <th className="p-3">Tipo Produção</th>
                    <th className="p-3">Estoque</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {produtosFiltrados.map((prod) => (
                    <tr key={prod.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={prod.fotos[0] || 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&q=80&w=800'}
                            alt={prod.nome}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200 bg-white"
                          />
                          <div>
                            <span className="font-bold text-slate-900 block">{prod.nome}</span>
                            <div className="flex gap-1 mt-0.5">
                              {prod.permite_personalizacao && (
                                <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-1.5 rounded-sm">
                                  Personalizável
                                </span>
                              )}
                              {prod.destaque && (
                                <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 rounded-sm">
                                  Destaque
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="p-3">
                        <span className="capitalize font-semibold text-slate-700">
                          {prod.categoria === 'impressao_3d' ? '🖨️ Impressão 3D' : prod.categoria.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="p-3 font-mono">
                        {prod.preco_promocional ? (
                          <div>
                            <span className="text-slate-400 line-through text-[10px] block">
                              R$ {prod.preco.toFixed(2)}
                            </span>
                            <span className="font-black text-emerald-800">
                              R$ {prod.preco_promocional.toFixed(2)}
                            </span>
                          </div>
                        ) : (
                          <span className="font-bold text-slate-900">
                            R$ {prod.preco.toFixed(2)}
                          </span>
                        )}
                      </td>

                      <td className="p-3">
                        <span className="capitalize text-slate-600">
                          {prod.tipo_producao === 'impressao_3d' ? 'Impressão 3D' : prod.tipo_producao.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="p-3 font-mono font-bold text-slate-800">
                        {prod.estoque} un
                      </td>

                      <td className="p-3">
                        <button
                          onClick={() => handleToggleAtivo(prod)}
                          className={`px-2 py-0.5 rounded-md text-[11px] font-bold cursor-pointer ${
                            prod.ativo
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {prod.ativo ? 'Ativo' : 'Pausado'}
                        </button>
                      </td>

                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setProdutoEditando({ ...prod });
                              setModalProdutoOpen(true);
                            }}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
                            title="Editar Produto"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleExcluirProduto(prod.id, prod.nome)}
                            className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg"
                            title="Excluir Produto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CONTEÚDO DA ABA DE PEDIDOS */}
        {abaAtiva === 'pedidos' && (
          <div className="p-4 sm:p-6 space-y-4">
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="p-3">Pedido / Data</th>
                    <th className="p-3">Cliente / Contato</th>
                    <th className="p-3">Itens & Personalização</th>
                    <th className="p-3">Total / Pagto</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pedidos.map((ped) => (
                    <tr key={ped.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3">
                        <span className="font-mono font-black text-slate-900 block">{ped.numero_pedido}</span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(ped.criado_em).toLocaleDateString('pt-BR')} {new Date(ped.criado_em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>

                      <td className="p-3">
                        <span className="font-bold text-slate-900 block">{ped.cliente_nome}</span>
                        <span className="text-[11px] text-slate-500 font-mono">{ped.cliente_telefone}</span>
                        <p className="text-[10px] text-slate-400 truncate max-w-xs">{ped.cliente_endereco} - {ped.cliente_bairro}</p>
                      </td>

                      <td className="p-3">
                        <div className="space-y-1">
                          {ped.itens.map((it, iIdx) => (
                            <div key={iIdx} className="bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                              <span className="font-bold text-slate-800">
                                {it.quantidade}x {it.nome}
                              </span>
                              {it.personalizacao && (
                                <div className="text-[10px] text-emerald-800 mt-0.5">
                                  {Object.entries(it.personalizacao).map(([k, v]) => (
                                    <span key={k} className="mr-2">
                                      <strong>{k}:</strong> {v}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </td>

                      <td className="p-3">
                        <span className="font-black text-emerald-800 text-sm block font-mono">
                          R$ {ped.valor_total.toFixed(2)}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          {ped.metodo_pagamento === 'pix' ? '🔑 PIX' : '💬 WhatsApp'}
                        </span>
                      </td>

                      <td className="p-3">
                        <select
                          value={ped.status}
                          onChange={(e) => handleMudarStatusPedido(ped.id, e.target.value as PedidoLoja['status'])}
                          className={`p-1.5 rounded-lg text-xs font-bold border ${
                            ped.status === 'entregue'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : ped.status === 'em_producao'
                              ? 'bg-purple-50 text-purple-800 border-purple-300'
                              : ped.status === 'pronto_retirada'
                              ? 'bg-blue-50 text-blue-800 border-blue-300'
                              : 'bg-amber-50 text-amber-800 border-amber-300'
                          }`}
                        >
                          <option value="pendente">🟡 Pendente</option>
                          <option value="em_producao">🟣 Em Produção (3D/Personalização)</option>
                          <option value="pronto_retirada">🔵 Pronto para Retirada</option>
                          <option value="enviado">🚚 Enviado para Entrega</option>
                          <option value="entregue">🟢 Entregue / Concluído</option>
                          <option value="cancelado">🔴 Cancelado</option>
                        </select>
                      </td>

                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <a
                            href={gerarMensagemWhatsAppPedido(ped, ped.cliente_telefone.replace(/\D/g, ''))}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs"
                            title="Conversar com o Cliente no WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* MODAL DE CADASTRO / EDIÇÃO DE PRODUTO */}
      {modalProdutoOpen && (
        <Modal
          isOpen={modalProdutoOpen}
          onClose={() => setModalProdutoOpen(false)}
          title={produtoEditando.id ? 'Editar Produto da Loja' : 'Cadastrar Novo Produto'}
        >
          <form onSubmit={handleSalvarProduto} className="space-y-4 max-h-[75vh] overflow-y-auto p-1 text-xs">
            
            {/* NOME DO PRODUTO */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nome do Produto *</label>
              <input
                type="text"
                required
                value={produtoEditando.nome || ''}
                onChange={(e) => setProdutoEditando({ ...produtoEditando, nome: e.target.value })}
                placeholder="Ex: Plaquinha de Identificação 3D, Caminha Nuvem..."
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>

            {/* CATEGORIA E TIPO PRODUÇÃO */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Categoria *</label>
                <select
                  value={produtoEditando.categoria || 'impressao_3d'}
                  onChange={(e) => setProdutoEditando({ ...produtoEditando, categoria: e.target.value as CategoriaProduto })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                >
                  <option value="impressao_3d">🖨️ Impressão 3D</option>
                  <option value="camas_conforto">🛋️ Camas & Conforto</option>
                  <option value="coleiras_acessorios">🐕 Coleiras & Acessórios</option>
                  <option value="comedouros_bebedouros">🥣 Comedouros</option>
                  <option value="solidario">❤️ 100% Solidário</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tipo de Fabricação *</label>
                <select
                  value={produtoEditando.tipo_producao || 'impressao_3d'}
                  onChange={(e) => setProdutoEditando({ ...produtoEditando, tipo_producao: e.target.value as any })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                >
                  <option value="impressao_3d">Impressão 3D Local</option>
                  <option value="sob_encomenda">Sob Encomenda (Personalizado)</option>
                  <option value="pronta_entrega">Pronta Entrega no Estoque</option>
                </select>
              </div>
            </div>

            {/* PREÇOS & ESTOQUE */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Preço Normal (R$) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={produtoEditando.preco || 0}
                  onChange={(e) => setProdutoEditando({ ...produtoEditando, preco: Number(e.target.value) })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Preço Promo (Opcional)</label>
                <input
                  type="number"
                  step="0.01"
                  value={produtoEditando.preco_promocional || ''}
                  onChange={(e) => setProdutoEditando({ ...produtoEditando, preco_promocional: e.target.value ? Number(e.target.value) : undefined })}
                  placeholder="Ex: 19.90"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-emerald-800 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Estoque Disponível</label>
                <input
                  type="number"
                  value={produtoEditando.estoque || 0}
                  onChange={(e) => setProdutoEditando({ ...produtoEditando, estoque: Number(e.target.value) })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
                />
              </div>
            </div>

            {/* DESCRIÇÃO */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Descrição Detalhada do Produto *</label>
              <textarea
                rows={3}
                required
                value={produtoEditando.descricao || ''}
                onChange={(e) => setProdutoEditando({ ...produtoEditando, descricao: e.target.value })}
                placeholder="Detalhes sobre materiais, medidas, conforto, filamento utilizado..."
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>

            {/* URL DA FOTO */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">URL da Imagem do Produto</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={produtoEditando.fotos?.[0] || ''}
                  onChange={(e) => setProdutoEditando({ ...produtoEditando, fotos: [e.target.value] })}
                  placeholder="https://images.unsplash.com/..."
                  className="flex-1 p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>
              {produtoEditando.fotos?.[0] && (
                <div className="mt-2 flex items-center gap-3 bg-slate-50 p-2 rounded-xl border border-slate-200">
                  <img src={produtoEditando.fotos[0]} alt="Preview" className="w-12 h-12 rounded-lg object-cover" />
                  <span className="text-[11px] text-slate-500">Prévia da imagem do produto</span>
                </div>
              )}
            </div>

            {/* OPÇÕES ADICIONAIS / CHECKBOXES */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={produtoEditando.permite_personalizacao ?? true}
                  onChange={(e) => setProdutoEditando({ ...produtoEditando, permite_personalizacao: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span className="font-bold text-slate-800">
                  Permite Personalização pelo Cliente (ex: nome do pet, telefone gravado, cor ou tamanho)?
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={produtoEditando.destaque ?? false}
                  onChange={(e) => setProdutoEditando({ ...produtoEditando, destaque: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span className="font-bold text-slate-800">
                  Exibir em Destaque na Página Inicial / Topo da Loja
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={produtoEditando.reverte_ong ?? true}
                  onChange={(e) => setProdutoEditando({ ...produtoEditando, reverte_ong: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span className="font-bold text-slate-800">
                  Selo de Produto Solidário (renda de apoio ao Banco de Ração Municipal)
                </span>
              </label>
            </div>

            {/* BOTÕES DE SUBMISSÃO */}
            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setModalProdutoOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                Salvar Produto
              </Button>
            </div>

          </form>
        </Modal>
      )}

    </div>
  );
}
