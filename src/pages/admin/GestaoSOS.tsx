import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  AlertTriangle, 
  Search, 
  Filter, 
  Printer, 
  Phone, 
  CheckCircle2, 
  RotateCcw, 
  Plus, 
  ExternalLink, 
  MapPin, 
  Dog, 
  Cat, 
  Sparkles,
  Download,
  Share2,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  AnimalSOS, 
  fetchAnimaisSOS, 
  marcarResolvidoSOS, 
  salvarAnimalSOS, 
  buildMensagemContatoSOS 
} from '@/lib/sos';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import CartazSOSModal from '@/components/sos/CartazSOSModal';
import NovoAlertaSOSModal from '@/components/sos/NovoAlertaSOSModal';

export default function GestaoSOS() {
  const [animais, setAnimais] = useState<AnimalSOS[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroStatus, setFiltroStatus] = useState('todos');

  // Modais
  const [cartazModalOpen, setCartazModalOpen] = useState(false);
  const [animalSelecionado, setAnimalSelecionado] = useState<AnimalSOS | null>(null);
  const [novoModalOpen, setNovoModalOpen] = useState(false);
  const [tipoNovo, setTipoNovo] = useState<'perdido' | 'encontrado'>('perdido');

  useEffect(() => {
    carregar();
  }, []);

  const carregar = async () => {
    try {
      setLoading(true);
      const dados = await fetchAnimaisSOS();
      setAnimais(dados);
    } catch {
      toast.error('Erro ao carregar lista de alertas');
    } finally {
      setLoading(false);
    }
  };

  const handleMarcarResolvido = async (animal: AnimalSOS) => {
    if (!window.confirm(`Deseja marcar ${animal.nome} como REUNIDO com a família / resolvido?`)) return;
    try {
      await marcarResolvidoSOS(animal.id, animal.pet_id);
      toast.success('Alerta atualizado com sucesso!');
      carregar();
    } catch {
      toast.error('Erro ao atualizar alerta');
    }
  };

  const handleReabrirAlerta = async (animal: AnimalSOS) => {
    try {
      await salvarAnimalSOS({ ...animal, status: 'ativo' });
      toast.info('Alerta reaberto!');
      carregar();
    } catch {
      toast.error('Erro ao reabrir alerta');
    }
  };

  const handleExportarCSV = () => {
    const cabecalho = 'ID,Tipo,Status,Nome,Especie,Raca,Bairro,Cidade,Data,ContatoNome,ContatoTelefone,Recompensa\n';
    const linhas = animais.map(a => 
      `"${a.id}","${a.tipo}","${a.status}","${a.nome}","${a.especie}","${a.raca || ''}","${a.bairro}","${a.cidade}","${a.data_ocorrencia}","${a.contato_nome}","${a.contato_telefone}","${a.recompensa || ''}"`
    ).join('\n');

    const blob = new Blob([cabecalho + linhas], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-sos-animais-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Relatório CSV exportado com sucesso!');
  };

  const filtrados = animais.filter(a => {
    if (filtroTipo !== 'todos' && a.tipo !== filtroTipo) return false;
    if (filtroStatus !== 'todos' && a.status !== filtroStatus) return false;
    if (busca) {
      const q = busca.toLowerCase();
      const match = 
        a.nome.toLowerCase().includes(q) ||
        (a.raca && a.raca.toLowerCase().includes(q)) ||
        a.bairro.toLowerCase().includes(q) ||
        a.contato_nome.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const totalAtivos = animais.filter(a => a.status === 'ativo').length;
  const totalPerdidos = animais.filter(a => a.tipo === 'perdido' && a.status === 'ativo').length;
  const totalEncontrados = animais.filter(a => a.tipo === 'encontrado' && a.status === 'ativo').length;
  const totalResolvidos = animais.filter(a => a.status === 'resolvido').length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-7 h-7 text-red-600" />
            Central SOS • Gestão de Animais Perdidos & Achados
          </h1>
          <p className="text-sm text-slate-500">
            Acompanhamento dos alertas comunitários de desaparecimento e animais recolhidos no município de Arapongas - PR.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportarCSV}
            className="text-xs gap-1.5"
          >
            <Download className="w-4 h-4" /> Exportar CSV
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => { setTipoNovo('perdido'); setNovoModalOpen(true); }}
            className="bg-red-600 hover:bg-red-700 text-white text-xs gap-1.5"
          >
            <Plus className="w-4 h-4" /> Novo Alerta SOS
          </Button>
        </div>
      </div>

      {/* METRICAS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Alertas Ativos</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{totalAtivos}</h3>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-red-600 uppercase tracking-wider">Desaparecidos</p>
            <h3 className="text-2xl font-black text-red-700 mt-1">{totalPerdidos}</h3>
          </div>
          <div className="p-3 bg-red-50 text-red-600 rounded-xl">
            <Dog className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Resgatados na Rua</p>
            <h3 className="text-2xl font-black text-emerald-700 mt-1">{totalEncontrados}</h3>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Cat className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Finais Felizes 🎉</p>
            <h3 className="text-2xl font-black text-indigo-700 mt-1">{totalResolvidos}</h3>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* FILTROS E BUSCA */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nome, bairro, tutor ou raça..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="text-xs p-1.5 bg-white border border-slate-300 rounded-xl font-semibold"
          >
            <option value="todos">Todos os Tipos</option>
            <option value="perdido">🔴 Perdidos</option>
            <option value="encontrado">🟢 Encontrados</option>
          </select>

          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="text-xs p-1.5 bg-white border border-slate-300 rounded-xl font-semibold"
          >
            <option value="todos">Todos os Status</option>
            <option value="ativo">Ativo (Em busca)</option>
            <option value="resolvido">Resolvido (Reunido)</option>
          </select>
        </div>

        <Link
          to="/sos"
          target="_blank"
          className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1"
        >
          Ver Portal Público SOS <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* TABELA DE GESTÃO */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-extrabold uppercase text-[11px]">
              <tr>
                <th className="p-3.5">Animal / Foto</th>
                <th className="p-3.5">Tipo / Status</th>
                <th className="p-3.5">Bairro / Local</th>
                <th className="p-3.5">Data Ocorrência</th>
                <th className="p-3.5">Contato / Tutor</th>
                <th className="p-3.5">Recompensa</th>
                <th className="p-3.5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    Carregando registros...
                  </td>
                </tr>
              ) : filtrados.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    Nenhum alerta encontrado com os filtros atuais.
                  </td>
                </tr>
              ) : (
                filtrados.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <img 
                          src={item.foto_url} 
                          alt={item.nome}
                          className="w-11 h-11 rounded-xl object-cover border border-slate-200 bg-slate-100 flex-shrink-0"
                        />
                        <div>
                          <p className="font-black text-slate-900 text-sm">{item.nome}</p>
                          <p className="text-[11px] text-slate-500">{item.especie} • {item.raca || 'SRD'} ({item.porte})</p>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5">
                      <div className="space-y-1">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          item.tipo === 'perdido' ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {item.tipo === 'perdido' ? '🔴 Desaparecido' : '🟢 Encontrado'}
                        </span>
                        <div>
                          {item.status === 'resolvido' ? (
                            <span className="text-[11px] font-bold text-indigo-700 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Reunido com a Família
                            </span>
                          ) : (
                            <span className="text-[11px] font-semibold text-amber-700">
                              Em andamento
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5">
                      <p className="font-semibold text-slate-800">{item.bairro}</p>
                      {item.ponto_referencia && (
                        <p className="text-[11px] text-slate-500 truncate max-w-[200px]">
                          Ref: {item.ponto_referencia}
                        </p>
                      )}
                    </td>

                    <td className="p-3.5 font-medium text-slate-700">
                      {new Date(item.data_ocorrencia).toLocaleDateString('pt-BR')}
                    </td>

                    <td className="p-3.5">
                      <p className="font-bold text-slate-900">{item.contato_nome}</p>
                      <p className="text-[11px] text-slate-500">{item.contato_telefone}</p>
                    </td>

                    <td className="p-3.5">
                      {item.recompensa ? (
                        <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                          {item.recompensa}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setAnimalSelecionado(item);
                            setCartazModalOpen(true);
                          }}
                          title="Imprimir Cartaz Oficial A4"
                          className="p-1.5 text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-300 transition-colors"
                        >
                          <Printer className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => {
                            const limpo = item.contato_telefone.replace(/\D/g, '');
                            const phone = limpo.startsWith('55') ? limpo : `55${limpo}`;
                            const msg = buildMensagemContatoSOS(item);
                            window.open(`https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(msg)}`, '_blank');
                          }}
                          title="Falar no WhatsApp"
                          className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg border border-emerald-300 transition-colors"
                        >
                          <Phone className="w-4 h-4" />
                        </button>

                        {item.status === 'ativo' ? (
                          <button
                            onClick={() => handleMarcarResolvido(item)}
                            title="Marcar como Resolvido / Devolvido"
                            className="p-1.5 text-indigo-700 hover:bg-indigo-50 rounded-lg border border-indigo-200 transition-colors"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleReabrirAlerta(item)}
                            title="Reabrir Alerta"
                            className="p-1.5 text-amber-700 hover:bg-amber-50 rounded-lg border border-amber-200 transition-colors"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DO CARTAZ A4 */}
      <CartazSOSModal
        isOpen={cartazModalOpen}
        onClose={() => setCartazModalOpen(false)}
        animal={animalSelecionado}
      />

      {/* MODAL DE NOVO ALERTA */}
      <NovoAlertaSOSModal
        isOpen={novoModalOpen}
        onClose={() => setNovoModalOpen(false)}
        onSuccess={() => carregar()}
        tipoInicial={tipoNovo}
      />

    </div>
  );
}
