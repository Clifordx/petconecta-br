import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  AlertTriangle, 
  Search, 
  Filter, 
  Printer, 
  Phone, 
  Share2, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  Heart, 
  Plus, 
  Dog, 
  Cat, 
  Sparkles,
  HelpCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  AnimalSOS, 
  fetchAnimaisSOS, 
  marcarResolvidoSOS, 
  buildMensagemContatoSOS, 
  buildTextoCompartilhamento 
} from '@/lib/sos';
import { Button } from '@/components/ui/Button';
import CartazSOSModal from '@/components/sos/CartazSOSModal';
import NovoAlertaSOSModal from '@/components/sos/NovoAlertaSOSModal';
import { useAuth } from '@/contexts/AuthContext';

export default function CentralSOS() {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const [animais, setAnimais] = useState<AnimalSOS[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'perdido' | 'encontrado' | 'resolvido'>('todos');
  const [filtroEspecie, setFiltroEspecie] = useState<'todos' | 'cachorro' | 'gato'>('todos');
  const [busca, setBusca] = useState('');

  // Modais
  const [cartazModalOpen, setCartazModalOpen] = useState(false);
  const [animalSelecionado, setAnimalSelecionado] = useState<AnimalSOS | null>(null);

  const [novoModalOpen, setNovoModalOpen] = useState(false);
  const [tipoNovo, setTipoNovo] = useState<'perdido' | 'encontrado'>('perdido');

  useEffect(() => {
    carregarAnimais();
  }, []);

  const carregarAnimais = async () => {
    try {
      setLoading(true);
      const dados = await fetchAnimaisSOS();
      setAnimais(dados);

      // Se houver id na URL, abre automaticamente o cartaz do pet
      const idUrl = searchParams.get('id');
      if (idUrl) {
        const petUrl = dados.find(d => d.id === idUrl);
        if (petUrl) {
          setAnimalSelecionado(petUrl);
          setCartazModalOpen(true);
        }
      }
    } catch (e) {
      console.error('Erro ao buscar dados SOS:', e);
      toast.error('Erro ao carregar lista de alertas SOS');
    } finally {
      setLoading(false);
    }
  };

  const handleAbrirNovoModal = (tipo: 'perdido' | 'encontrado') => {
    setTipoNovo(tipo);
    setNovoModalOpen(true);
  };

  const handleSucessoNovoAlerta = (novoAnimal: AnimalSOS) => {
    carregarAnimais();
    // Já abre o cartaz A4 imediatamente para o usuário imprimir ou baixar!
    setAnimalSelecionado(novoAnimal);
    setCartazModalOpen(true);
  };

  const handleMarcarResolvido = async (animal: AnimalSOS) => {
    const confirmMsg = animal.tipo === 'perdido'
      ? `Confirmar que ${animal.nome} foi ENCONTRADO e já está de volta com a família?`
      : `Confirmar que a família de ${animal.nome} foi localizada?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      await marcarResolvidoSOS(animal.id, animal.pet_id);
      toast.success('🎉 Que notícia maravilhosa! Alerta marcado como resolvido.');
      carregarAnimais();
    } catch {
      toast.error('Erro ao atualizar status');
    }
  };

  const handleContatarWhatsApp = (animal: AnimalSOS) => {
    const limpo = animal.contato_telefone.replace(/\D/g, '');
    const phone = limpo.startsWith('55') ? limpo : `55${limpo}`;
    const msg = buildMensagemContatoSOS(animal);
    window.open(`https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleCompartilhar = (animal: AnimalSOS) => {
    const texto = buildTextoCompartilhamento(animal);
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(texto)}`;
    window.open(url, '_blank');
  };

  // Filtragem dos cards
  const animaisFiltrados = animais.filter(a => {
    if (filtroTipo === 'resolvido') {
      if (a.status !== 'resolvido') return false;
    } else if (filtroTipo !== 'todos') {
      if (a.tipo !== filtroTipo || a.status === 'resolvido') return false;
    } else {
      // Se for 'todos', oculta resolvidos por padrão a menos que o usuário queira ver
      if (a.status === 'resolvido') return false;
    }

    if (filtroEspecie !== 'todos') {
      if (a.especie !== filtroEspecie) return false;
    }

    if (busca) {
      const q = busca.toLowerCase();
      const match =
        a.nome.toLowerCase().includes(q) ||
        (a.raca && a.raca.toLowerCase().includes(q)) ||
        a.bairro.toLowerCase().includes(q) ||
        (a.descricao && a.descricao.toLowerCase().includes(q));
      if (!match) return false;
    }

    return true;
  });

  const totalPerdidos = animais.filter(a => a.tipo === 'perdido' && a.status === 'ativo').length;
  const totalEncontrados = animais.filter(a => a.tipo === 'encontrado' && a.status === 'ativo').length;
  const totalResolvidos = animais.filter(a => a.status === 'resolvido').length;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HERO BANNER DA CENTRAL SOS */}
        <div className="relative overflow-hidden bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 rounded-3xl p-6 sm:p-10 text-white shadow-xl">
          <div className="relative z-10 max-w-3xl space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-black tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Rede de Solidariedade Animal • Arapongas - PR
            </span>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight drop-shadow-sm">
              Central SOS • Pets Perdidos e Achados
            </h1>

            <p className="text-sm sm:text-lg text-white/90 font-medium">
              Perdeu seu bichinho ou encontrou um animalzinho desorientado na rua? Publique o alerta com 1 clique, gere o cartaz oficial A4 para postes e comércios e acione nossa rede de voluntários.
            </p>

            {/* BOTÕES DE AÇÃO IMEDIATA */}
            <div className="pt-2 flex flex-wrap gap-3">
              <button
                onClick={() => handleAbrirNovoModal('perdido')}
                className="px-5 py-3 rounded-xl bg-white text-red-700 hover:bg-slate-100 font-black text-sm shadow-lg transition-transform hover:scale-105 flex items-center gap-2"
              >
                <AlertTriangle className="w-5 h-5 text-red-600" />
                🚨 PERDI MEU PET (PUBLICAR)
              </button>

              <button
                onClick={() => handleAbrirNovoModal('encontrado')}
                className="px-5 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-sm shadow-lg border border-emerald-500 transition-transform hover:scale-105 flex items-center gap-2"
              >
                <Plus className="w-5 h-5 text-emerald-300" />
                🟢 ENCONTREI UM PET NA RUA
              </button>
            </div>
          </div>

          {/* ESTATÍSTICAS NO BANNER */}
          <div className="mt-8 pt-6 border-t border-white/20 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3">
              <div className="text-2xl sm:text-3xl font-black">{totalPerdidos}</div>
              <div className="text-xs text-white/80 font-bold uppercase">Procurando Tutor</div>
            </div>
            <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3">
              <div className="text-2xl sm:text-3xl font-black">{totalEncontrados}</div>
              <div className="text-xs text-white/80 font-bold uppercase">Resgatados na Rua</div>
            </div>
            <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3">
              <div className="text-2xl sm:text-3xl font-black">{totalResolvidos}</div>
              <div className="text-xs text-white/80 font-bold uppercase">Finais Felizes 🎉</div>
            </div>
            <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3">
              <div className="text-2xl sm:text-3xl font-black">100%</div>
              <div className="text-xs text-white/80 font-bold uppercase">Gratuito à População</div>
            </div>
          </div>
        </div>

        {/* BARRA DE FILTROS E BUSCA */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            
            {/* TABS DE STATUS */}
            <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
              <button
                onClick={() => setFiltroTipo('todos')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  filtroTipo === 'todos'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Todos Ativos ({totalPerdidos + totalEncontrados})
              </button>
              <button
                onClick={() => setFiltroTipo('perdido')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  filtroTipo === 'perdido'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'bg-red-50 text-red-700 hover:bg-red-100'
                }`}
              >
                🔴 Desaparecidos ({totalPerdidos})
              </button>
              <button
                onClick={() => setFiltroTipo('encontrado')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  filtroTipo === 'encontrado'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                🟢 Resgatados na Rua ({totalEncontrados})
              </button>
              <button
                onClick={() => setFiltroTipo('resolvido')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  filtroTipo === 'resolvido'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                }`}
              >
                🎉 Finais Felizes ({totalResolvidos})
              </button>
            </div>

            {/* SELETOR DE ESPÉCIE */}
            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  onClick={() => setFiltroEspecie('todos')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
                    filtroEspecie === 'todos' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setFiltroEspecie('cachorro')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 ${
                    filtroEspecie === 'cachorro' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  <Dog className="w-3.5 h-3.5" /> Cães
                </button>
                <button
                  onClick={() => setFiltroEspecie('gato')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 ${
                    filtroEspecie === 'gato' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  <Cat className="w-3.5 h-3.5" /> Gatos
                </button>
              </div>
            </div>

          </div>

          {/* CAMPO DE BUSCA */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nome, raça, cor, bairro ou características..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:bg-white"
            />
          </div>
        </div>

        {/* GRID DE CARDS SOS */}
        {loading ? (
          <div className="text-center py-16">
            <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-slate-500 font-medium">Buscando alertas de animais...</p>
          </div>
        ) : animaisFiltrados.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 space-y-4">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Nenhum alerta encontrado com os filtros selecionados
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Que ótima notícia! Não há animais pendentes com esses critérios ou o animal pesquisado já pode ter voltado para sua casa.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setFiltroTipo('todos'); setFiltroEspecie('todos'); setBusca(''); }}
              className="text-xs"
            >
              Limpar Filtros
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {animaisFiltrados.map((animal) => {
              const isPerdido = animal.tipo === 'perdido';
              const isResolvido = animal.status === 'resolvido';

              return (
                <div
                  key={animal.id}
                  className={`bg-white rounded-2xl overflow-hidden border shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${
                    isResolvido 
                      ? 'border-indigo-200 opacity-90' 
                      : isPerdido 
                        ? 'border-red-200 hover:border-red-400' 
                        : 'border-emerald-200 hover:border-emerald-400'
                  }`}
                >
                  <div>
                    {/* FOTO E BADGES */}
                    <div className="relative aspect-4/3 w-full bg-slate-100 overflow-hidden">
                      <img 
                        src={animal.foto_url} 
                        alt={animal.nome}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />

                      {/* BADGE DE TIPO NO TOPO ESQUERDO */}
                      <div className="absolute top-3 left-3">
                        {isResolvido ? (
                          <span className="px-3 py-1 bg-indigo-600 text-white text-xs font-black rounded-full shadow-md flex items-center gap-1 uppercase tracking-wide">
                            <CheckCircle2 className="w-3.5 h-3.5" /> REUNIDO COM A FAMÍLIA 🎉
                          </span>
                        ) : isPerdido ? (
                          <span className="px-3 py-1 bg-red-600 text-white text-xs font-black rounded-full shadow-md flex items-center gap-1.5 uppercase tracking-wide">
                            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                            DESAPARECIDO
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-emerald-600 text-white text-xs font-black rounded-full shadow-md flex items-center gap-1 uppercase tracking-wide">
                            🟢 RESGATADO NA RUA
                          </span>
                        )}
                      </div>

                      {/* FAIXA DE RECOMPENSA */}
                      {isPerdido && animal.recompensa && !isResolvido && (
                        <div className="absolute bottom-3 left-3 right-3 bg-amber-400/95 backdrop-blur-xs text-amber-950 font-black text-xs py-1 px-3 rounded-lg text-center shadow-md border border-amber-500">
                          💰 RECOMPENSA: {animal.recompensa}
                        </div>
                      )}
                    </div>

                    {/* CORPO DO CARD */}
                    <div className="p-4 space-y-3">
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="text-xl font-black text-slate-900 truncate">
                            {animal.nome}
                          </h3>
                          <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md capitalize">
                            {animal.especie} • {animal.porte}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium">
                          {animal.raca || 'SRD'} • {animal.cor}
                        </p>
                      </div>

                      {/* LOCAL E DATA */}
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs space-y-1">
                        <div className="font-bold text-slate-800 flex items-center gap-1 truncate">
                          <MapPin className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                          <span>Bairro {animal.bairro} ({animal.cidade.split(' - ')[0]})</span>
                        </div>
                        {animal.ponto_referencia && (
                          <p className="text-slate-500 text-[11px] pl-4 truncate">
                            Ref: {animal.ponto_referencia}
                          </p>
                        )}
                        <div className="text-slate-500 flex items-center gap-1 text-[11px] pl-4 pt-0.5">
                          <Clock className="w-3 h-3 text-slate-400" />
                          Ocorrido em: {new Date(animal.data_ocorrencia).toLocaleDateString('pt-BR')}
                        </div>
                      </div>

                      {/* DESCRIÇÃO */}
                      {animal.descricao && (
                        <p className="text-xs text-slate-600 line-clamp-2 italic">
                          "{animal.descricao}"
                        </p>
                      )}

                      {/* CONTATO */}
                      <div className="text-xs text-slate-500">
                        Responsável: <strong className="text-slate-800">{animal.contato_nome}</strong>
                      </div>
                    </div>
                  </div>

                  {/* AÇÕES NO RODAPÉ DO CARD */}
                  <div className="p-4 pt-0 space-y-2">
                    {!isResolvido && (
                      <button
                        onClick={() => handleContatarWhatsApp(animal)}
                        className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-sm transition-colors flex items-center justify-center gap-2"
                      >
                        <Phone className="w-4 h-4" />
                        {isPerdido ? 'Vi este Pet! (Avisar Tutor)' : 'Sou o Dono / Tenho Pistas'}
                      </button>
                    )}

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setAnimalSelecionado(animal);
                          setCartazModalOpen(true);
                        }}
                        className="flex-1 text-xs gap-1 py-2 text-slate-700 hover:text-slate-900 border-slate-300"
                      >
                        <Printer className="w-3.5 h-3.5 text-slate-500" /> Imprimir Cartaz A4
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCompartilhar(animal)}
                        title="Compartilhar no WhatsApp"
                        className="px-3 text-xs text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-300"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </Button>

                      {/* Se for resolvido ou o usuário for dono/admin, botão de resolver */}
                      {!isResolvido && (
                        <button
                          onClick={() => handleMarcarResolvido(animal)}
                          title="Marcar como Encontrado / Resolvido"
                          className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg border border-slate-200 transition-colors"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* MODAL DO CARTAZ A4 PARA IMPRESSÃO */}
      <CartazSOSModal
        isOpen={cartazModalOpen}
        onClose={() => setCartazModalOpen(false)}
        animal={animalSelecionado}
      />

      {/* MODAL DE NOVO ALERTA SOS */}
      <NovoAlertaSOSModal
        isOpen={novoModalOpen}
        onClose={() => setNovoModalOpen(false)}
        onSuccess={handleSucessoNovoAlerta}
        tipoInicial={tipoNovo}
      />
    </div>
  );
}
