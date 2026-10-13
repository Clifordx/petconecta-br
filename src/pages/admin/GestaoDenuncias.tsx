import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Search, 
  AlertTriangle, 
  Eye, 
  MapPin, 
  MessageCircle, 
  Calendar, 
  FileText, 
  Trash2, 
  ExternalLink, 
  CheckCircle, 
  Clock, 
  ShieldAlert, 
  Phone, 
  Mail, 
  Camera, 
  Printer, 
  X,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { toast } from 'sonner';

interface DenunciaRow {
  id: string;
  protocolo: string;
  anonima: boolean;
  tipo: string;
  urgencia: string;
  descricao: string;
  endereco: string;
  ponto_referencia?: string;
  bairro?: string;
  latitude?: number | null;
  longitude?: number | null;
  status: string;
  denunciante_nome?: string;
  denunciante_telefone?: string;
  denunciante_email?: string;
  observacoes_internas?: string;
  criado_em: string;
  evidencias?: { id: string; url: string; tipo: string }[];
}

export default function GestaoDenuncias() {
  const [denuncias, setDenuncias] = useState<DenunciaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filtroUrgencia, setFiltroUrgencia] = useState('todas');
  const [filtroStatus, setFiltroStatus] = useState('todos');

  // Modal de Detalhes
  const [selectedDenuncia, setSelectedDenuncia] = useState<DenunciaRow | null>(null);
  const [modalDetalhesOpen, setModalDetalhesOpen] = useState(false);
  const [novoStatus, setNovoStatus] = useState('');
  const [anotacoesInternas, setAnotacoesInternas] = useState('');
  const [salvandoStatus, setSalvandoStatus] = useState(false);

  // Modal de Foto Ampliada
  const [fotoAmpliada, setFotoAmpliada] = useState<string | null>(null);

  useEffect(() => {
    fetchDenuncias();
  }, []);

  const fetchDenuncias = async () => {
    try {
      setLoading(true);
      const { data: listaDenuncias, error: errDenuncias } = await supabase
        .from('denuncias')
        .select('*')
        .order('criado_em', { ascending: false });

      if (errDenuncias) throw errDenuncias;

      // Busca as evidências de todas as denúncias
      const { data: listaEvidencias, error: errEvidencias } = await supabase
        .from('evidencias_denuncia')
        .select('*');

      if (errEvidencias) console.warn('Erro ao carregar evidências:', errEvidencias);

      const denunciasComEvidencias = (listaDenuncias || []).map((d: any) => ({
        ...d,
        evidencias: (listaEvidencias || []).filter((e: any) => e.denuncia_id === d.id)
      }));

      setDenuncias(denunciasComEvidencias);
    } catch (error: any) {
      console.error('Erro ao buscar denúncias:', error);
      toast.error('Erro ao carregar denúncias');
    } finally {
      setLoading(false);
    }
  };

  const abrirModalDetalhes = (item: DenunciaRow) => {
    setSelectedDenuncia(item);
    setNovoStatus(item.status || 'recebida');
    setAnotacoesInternas(item.observacoes_internas || '');
    setModalDetalhesOpen(true);
  };

  const handleSalvarAtualizacao = async () => {
    if (!selectedDenuncia) return;
    setSalvandoStatus(true);
    try {
      const { error } = await supabase
        .from('denuncias')
        .update({
          status: novoStatus,
          observacoes_internas: anotacoesInternas,
          atualizado_em: new Date().toISOString()
        })
        .eq('id', selectedDenuncia.id);

      if (error) throw error;

      toast.success('Denúncia atualizada com sucesso!');
      setSelectedDenuncia(prev => prev ? { ...prev, status: novoStatus, observacoes_internas: anotacoesInternas } : null);
      fetchDenuncias();
    } catch (error: any) {
      console.error('Erro ao atualizar denúncia:', error);
      toast.error('Erro ao salvar atualização');
    } finally {
      setSalvandoStatus(false);
    }
  };

  const handleExcluirDenuncia = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta denúncia permanentemente?')) return;

    try {
      const { error } = await supabase
        .from('denuncias')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Denúncia excluída com sucesso.');
      if (modalDetalhesOpen) setModalDetalhesOpen(false);
      fetchDenuncias();
    } catch (error: any) {
      console.error('Erro ao excluir:', error);
      toast.error('Erro ao excluir denúncia');
    }
  };

  const openWhatsApp = (telefone: string) => {
    const clean = telefone.replace(/\D/g, '');
    if (!clean) return;
    const phoneWithCountry = clean.length <= 11 ? `55${clean}` : clean;
    window.open(`https://wa.me/${phoneWithCountry}`, '_blank');
  };

  const openGoogleMaps = (d: DenunciaRow) => {
    let url = '';
    if (d.latitude && d.longitude) {
      url = `https://www.google.com/maps?q=${d.latitude},${d.longitude}`;
    } else {
      url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(d.endereco || '')}`;
    }
    window.open(url, '_blank');
  };

  const handleImprimir = () => {
    window.print();
  };

  // Contadores de resumo
  const totalCriticas = denuncias.filter(d => d.urgencia === 'critica').length;
  const totalRecebidas = denuncias.filter(d => d.status === 'recebida').length;
  const totalEmAndamento = denuncias.filter(d => ['em_analise', 'em_investigacao', 'encaminhada'].includes(d.status)).length;
  const totalResolvidas = denuncias.filter(d => d.status === 'resolvida').length;

  // Filtros
  const filteredDenuncias = denuncias.filter(d => {
    const matchesSearch = 
      d.protocolo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.endereco?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.descricao?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.denunciante_nome?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesUrgencia = filtroUrgencia === 'todas' || d.urgencia === filtroUrgencia;
    const matchesStatus = filtroStatus === 'todos' || d.status === filtroStatus;

    return matchesSearch && matchesUrgencia && matchesStatus;
  });

  const getUrgencyBadge = (urg: string) => {
    switch (urg) {
      case 'critica':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200 animate-pulse"><AlertTriangle size={12}/> Crítica</span>;
      case 'alta':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800 border border-orange-200"><AlertTriangle size={12}/> Alta</span>;
      case 'media':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">Média</span>;
      case 'baixa':
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">Baixa</span>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'recebida':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">Nova / Recebida</span>;
      case 'em_analise':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">Em Análise</span>;
      case 'em_investigacao':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">Em Vistoria</span>;
      case 'encaminhada':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">Encaminhada à Polícia</span>;
      case 'resolvida':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">Resolvida</span>;
      case 'arquivada':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">Arquivada</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  const formatTipo = (tipo: string) => {
    const tiposMap: Record<string, string> = {
      abandono: 'Abandono em via pública',
      agressao: 'Agressão física / Violência',
      negligencia: 'Negligência (Sem água/comida)',
      acorrentado: 'Animal acorrentado',
      envenenamento: 'Suspeita de envenenamento',
      acumulacao: 'Acumulação de animais',
      outros: 'Outros maus-tratos'
    };
    return tiposMap[tipo] || tipo;
  };

  return (
    <div className="space-y-6">
      {/* Título */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShieldAlert className="w-7 h-7 text-emerald-600" /> Gestão de Denúncias
          </h1>
          <p className="text-sm text-gray-500">
            Acompanhe ocorrências de maus-tratos, despache fiscalizações e gerencie evidências.
          </p>
        </div>
        <Button onClick={fetchDenuncias} variant="outline" size="sm" className="flex items-center gap-1.5">
          <Clock className="w-4 h-4" /> Atualizar
        </Button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-500 uppercase">Aguardando Triagem</span>
            <p className="text-2xl font-bold text-blue-600 mt-1">{totalRecebidas}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Clock size={20} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-red-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-red-600 uppercase">Urgência Crítica</span>
            <p className="text-2xl font-bold text-red-600 mt-1">{totalCriticas}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
            <AlertTriangle size={20} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-500 uppercase">Em Andamento</span>
            <p className="text-2xl font-bold text-purple-600 mt-1">{totalEmAndamento}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
            <FileText size={20} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-500 uppercase">Resolvidas</span>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{totalResolvidas}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle size={20} />
          </div>
        </div>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar por protocolo, endereço ou denunciante..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-400" />
            <select
              value={filtroUrgencia}
              onChange={(e) => setFiltroUrgencia(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-emerald-500"
            >
              <option value="todas">Todas as Urgências</option>
              <option value="critica">🚨 Crítica</option>
              <option value="alta">Alta</option>
              <option value="media">Média</option>
              <option value="baixa">Baixa</option>
            </select>
          </div>

          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-emerald-500"
          >
            <option value="todos">Todos os Status</option>
            <option value="recebida">Nova / Recebida</option>
            <option value="em_analise">Em Análise</option>
            <option value="em_investigacao">Em Vistoria</option>
            <option value="encaminhada">Encaminhada à Polícia</option>
            <option value="resolvida">Resolvida</option>
            <option value="arquivada">Arquivada</option>
          </select>
        </div>
      </div>

      {/* Tabela de Denúncias */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Carregando denúncias...</div>
        ) : filteredDenuncias.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            Nenhuma denúncia encontrada para os filtros selecionados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-700 text-xs uppercase font-semibold border-b">
                <tr>
                  <th className="px-6 py-4">Protocolo / Data</th>
                  <th className="px-6 py-4">Ocorrência</th>
                  <th className="px-6 py-4">Urgência</th>
                  <th className="px-6 py-4">Localização</th>
                  <th className="px-6 py-4">Denunciante</th>
                  <th className="px-6 py-4 text-center">Evidências</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredDenuncias.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-mono font-bold text-gray-900">{item.protocolo}</div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {new Date(item.criado_em).toLocaleDateString('pt-BR')} às{' '}
                        {new Date(item.criado_em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>

                    <td className="px-6 py-4 font-medium text-gray-800">
                      {formatTipo(item.tipo)}
                    </td>

                    <td className="px-6 py-4">
                      {getUrgencyBadge(item.urgencia)}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 max-w-xs">
                        <MapPin size={14} className="text-gray-400 flex-shrink-0" />
                        <span className="truncate" title={item.endereco}>
                          {item.endereco || 'Endereço não informado'}
                        </span>
                      </div>
                      {item.latitude && item.longitude && (
                        <span className="text-[11px] text-emerald-600 font-semibold block mt-0.5">
                          📍 GPS disponível
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      {item.anonima ? (
                        <span className="text-xs font-medium text-gray-500 italic bg-gray-100 px-2 py-0.5 rounded">
                          Anônima
                        </span>
                      ) : (
                        <div>
                          <span className="font-semibold text-gray-800 block text-xs">{item.denunciante_nome || 'Identificado'}</span>
                          {item.denunciante_telefone && (
                            <span className="text-xs text-gray-500">{item.denunciante_telefone}</span>
                          )}
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4 text-center">
                      {item.evidencias && item.evidencias.length > 0 ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-semibold">
                          <Camera size={13} /> {item.evidencias.length}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      {getStatusBadge(item.status)}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => abrirModalDetalhes(item)}
                          className="flex items-center gap-1 text-xs text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                        >
                          <Eye size={14} /> Ver Detalhes
                        </Button>
                        <button
                          onClick={() => handleExcluirDenuncia(item.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg transition-colors"
                          title="Excluir Denúncia"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Completo de Detalhes da Denúncia */}
      {selectedDenuncia && (
        <Modal
          isOpen={modalDetalhesOpen}
          onClose={() => setModalDetalhesOpen(false)}
          title={`Ocorrência #${selectedDenuncia.protocolo}`}
        >
          <div className="space-y-6 max-h-[80vh] overflow-y-auto pr-1">
            {/* Cabeçalho do modal */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-gray-50 rounded-xl border">
              <div>
                <span className="text-xs text-gray-500 uppercase block">Data do Registro</span>
                <span className="text-sm font-semibold text-gray-800">
                  {new Date(selectedDenuncia.criado_em).toLocaleDateString('pt-BR')} às{' '}
                  {new Date(selectedDenuncia.criado_em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {getUrgencyBadge(selectedDenuncia.urgencia)}
                {getStatusBadge(selectedDenuncia.status)}
              </div>
            </div>

            {/* Galeria de Fotos / Evidências */}
            {selectedDenuncia.evidencias && selectedDenuncia.evidencias.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-1.5">
                  <Camera size={16} className="text-emerald-600" /> Fotos e Evidências ({selectedDenuncia.evidencias.length})
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {selectedDenuncia.evidencias.map((ev, idx) => (
                    <div
                      key={idx}
                      onClick={() => setFotoAmpliada(ev.url)}
                      className="cursor-pointer group relative aspect-square rounded-xl overflow-hidden border border-gray-200 bg-gray-100 hover:opacity-90 transition-opacity"
                    >
                      <img src={ev.url} alt={`Evidência ${idx + 1}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold">
                        Clique para ampliar
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Descrição dos Fatos */}
            <div>
              <h3 className="text-sm font-bold text-gray-800 mb-1">Tipo de Infração</h3>
              <p className="text-sm text-gray-700 bg-gray-50 p-2.5 rounded-lg border font-medium">
                {formatTipo(selectedDenuncia.tipo)}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-800 mb-1">Descrição Completa da Ocorrência</h3>
              <div className="text-sm text-gray-800 bg-gray-50 p-3 rounded-lg border whitespace-pre-wrap leading-relaxed">
                {selectedDenuncia.descricao}
              </div>
            </div>

            {/* Localização & Mapa */}
            <div className="bg-emerald-50/50 border border-emerald-200/60 p-4 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-emerald-950 flex items-center gap-1.5">
                  <MapPin size={16} className="text-emerald-600" /> Endereço do Fato
                </h3>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openGoogleMaps(selectedDenuncia)}
                  className="text-xs flex items-center gap-1 bg-white hover:bg-emerald-50 border-emerald-300 text-emerald-800"
                >
                  <ExternalLink size={13} /> Abrir no Google Maps
                </Button>
              </div>
              <p className="text-sm text-gray-800 font-medium">{selectedDenuncia.endereco}</p>
              {selectedDenuncia.ponto_referencia && (
                <p className="text-xs text-gray-600">
                  <span className="font-semibold">Referência:</span> {selectedDenuncia.ponto_referencia}
                </p>
              )}
              {selectedDenuncia.latitude && selectedDenuncia.longitude && (
                <p className="text-xs font-mono text-emerald-700">
                  Coordenadas GPS: {selectedDenuncia.latitude}, {selectedDenuncia.longitude}
                </p>
              )}
            </div>

            {/* Dados do Denunciante */}
            <div className="border rounded-xl p-4 bg-gray-50/60 space-y-2">
              <h3 className="text-sm font-bold text-gray-800">Origem da Denúncia</h3>
              {selectedDenuncia.anonima ? (
                <p className="text-sm text-gray-500 italic">
                  🔒 Denúncia Anônima. O cidadão optou pelo sigilo total de identidade.
                </p>
              ) : (
                <div className="space-y-1.5 text-sm text-gray-700">
                  <p><span className="font-semibold">Nome:</span> {selectedDenuncia.denunciante_nome || 'Não informado'}</p>
                  {selectedDenuncia.denunciante_telefone && (
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">Telefone:</span> {selectedDenuncia.denunciante_telefone}
                      <button
                        onClick={() => openWhatsApp(selectedDenuncia.denunciante_telefone!)}
                        className="text-xs bg-green-100 hover:bg-green-200 text-green-800 font-semibold px-2 py-0.5 rounded flex items-center gap-1"
                      >
                        <MessageCircle size={12} /> WhatsApp
                      </button>
                    </div>
                  )}
                  {selectedDenuncia.denunciante_email && (
                    <p><span className="font-semibold">E-mail:</span> {selectedDenuncia.denunciante_email}</p>
                  )}
                </div>
              )}
            </div>

            {/* Atualização de Status & Despacho */}
            <div className="border-t pt-4 space-y-4">
              <h3 className="text-sm font-bold text-gray-900">Atualizar Ocorrência (Fiscalização / Despacho)</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Alterar Status</label>
                  <select
                    value={novoStatus}
                    onChange={(e) => setNovoStatus(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm bg-white font-medium focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="recebida">Nova / Recebida</option>
                    <option value="em_analise">Em Análise / Triagem</option>
                    <option value="em_investigacao">Em Investigação / Vistoria Agendada</option>
                    <option value="encaminhada">Encaminhada à Polícia Militar / Ambiental</option>
                    <option value="resolvida">Resolvida / Animal Resgatado</option>
                    <option value="arquivada">Arquivada / Improcedente</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Despacho e Anotações Internas da Equipe
                </label>
                <textarea
                  rows={3}
                  value={anotacoesInternas}
                  onChange={(e) => setAnotacoesInternas(e.target.value)}
                  placeholder="Ex: Equipe de vistoria enviada ao local com a PM Ambiental em 14/10. Animal encaminhado para internação."
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleImprimir}
                  className="text-xs flex items-center gap-1.5"
                >
                  <Printer size={14} /> Imprimir Relatório
                </Button>

                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={() => setModalDetalhesOpen(false)}>
                    Fechar
                  </Button>
                  <Button onClick={handleSalvarAtualizacao} disabled={salvandoStatus} className="bg-emerald-600 hover:bg-emerald-700">
                    {salvandoStatus ? 'Salvando...' : 'Salvar Alterações'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal de Foto em Tela Cheia */}
      {fotoAmpliada && (
        <div 
          onClick={() => setFotoAmpliada(null)}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm cursor-pointer"
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img src={fotoAmpliada} alt="Evidência ampliada" className="max-w-full max-h-[90vh] rounded-lg shadow-2xl object-contain" />
            <button
              onClick={() => setFotoAmpliada(null)}
              className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-2 hover:bg-black/90 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
