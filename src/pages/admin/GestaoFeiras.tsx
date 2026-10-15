import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Calendar, MapPin, Users, Plus, ArrowRight, Heart, Clock, Search, Edit2, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { toast } from 'sonner';

interface FeiraItem {
  id: string;
  titulo: string;
  descricao?: string;
  data: string;
  horario_inicio?: string;
  horario_fim?: string;
  local: string;
  endereco?: string;
  status: string;
  banner_url?: string;
  total_animais?: number;
  total_adocoes?: number;
}

export default function GestaoFeiras() {
  const [feiras, setFeiras] = useState<FeiraItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal de Criação / Edição
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFeira, setEditingFeira] = useState<FeiraItem | null>(null);
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [dataEvento, setDataEvento] = useState('');
  const [horarioInicio, setHorarioInicio] = useState('09:00');
  const [horarioFim, setHorarioFim] = useState('16:00');
  const [local, setLocal] = useState('');
  const [endereco, setEndereco] = useState('');
  const [status, setStatus] = useState('agendada');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchFeiras();
  }, []);

  const fetchFeiras = async () => {
    try {
      setLoading(true);
      const { data: listaFeiras, error: errFeiras } = await supabase
        .from('feiras')
        .select('*')
        .order('data', { ascending: false });

      if (errFeiras) throw errFeiras;

      // Busca contagem de animais escalados e adoções realizadas
      const { data: animaisFeira } = await supabase.from('animais_feira').select('feira_id, status');
      const { data: adocoes } = await supabase.from('adocoes').select('feira_id');

      const feirasComTotais = (listaFeiras || []).map((f: any) => {
        const animaisDestaFeira = (animaisFeira || []).filter((a: any) => a.feira_id === f.id);
        const adocoesDestaFeira = (adocoes || []).filter((ad: any) => ad.feira_id === f.id);
        return {
          ...f,
          total_animais: animaisDestaFeira.length,
          total_adocoes: adocoesDestaFeira.length
        };
      });

      setFeiras(feirasComTotais);
    } catch (error: any) {
      console.error('Erro ao buscar feiras:', error);
      toast.error('Erro ao carregar lista de feiras');
    } finally {
      setLoading(false);
    }
  };

  const abrirModal = (feira: FeiraItem | null = null) => {
    setEditingFeira(feira);
    if (feira) {
      setTitulo(feira.titulo || '');
      setDescricao(feira.descricao || '');
      setDataEvento(feira.data ? feira.data.split('T')[0] : '');
      setHorarioInicio(feira.horario_inicio || '09:00');
      setHorarioFim(feira.horario_fim || '16:00');
      setLocal(feira.local || '');
      setEndereco(feira.endereco || '');
      setStatus(feira.status || 'agendada');
    } else {
      setTitulo('');
      setDescricao('');
      setDataEvento(new Date().toISOString().split('T')[0]);
      setHorarioInicio('09:00');
      setHorarioFim('16:00');
      setLocal('');
      setEndereco('');
      setStatus('agendada');
    }
    setModalOpen(true);
  };

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim() || !local.trim() || !dataEvento) {
      toast.error('Preencha título, data e local do evento.');
      return;
    }

    setSaving(true);
    try {
      const payload: any = {
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        data: dataEvento,
        horario_inicio: horarioInicio,
        horario_fim: horarioFim,
        local: local.trim(),
        endereco: endereco.trim(),
        status
      };

      if (editingFeira) {
        const { error } = await supabase
          .from('feiras')
          .update(payload)
          .eq('id', editingFeira.id);

        if (error) throw error;
        toast.success('Feira atualizada com sucesso!');
      } else {
        const { error } = await supabase
          .from('feiras')
          .insert(payload);

        if (error) throw error;
        toast.success('Feira criada com sucesso!');
      }

      setModalOpen(false);
      fetchFeiras();
    } catch (error: any) {
      console.error('Erro ao salvar feira:', error);
      toast.error(error.message || 'Erro ao salvar feira');
    } finally {
      setSaving(false);
    }
  };

  const handleExcluir = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta feira?')) return;
    try {
      const { error } = await supabase.from('feiras').delete().eq('id', id);
      if (error) throw error;
      toast.success('Feira excluída');
      fetchFeiras();
    } catch (error: any) {
      console.error('Erro ao excluir:', error);
      toast.error('Não foi possível excluir a feira.');
    }
  };

  const filteredFeiras = feiras.filter(f => 
    f.titulo?.toLowerCase().includes(search.toLowerCase()) ||
    f.local?.toLowerCase().includes(search.toLowerCase()) ||
    f.endereco?.toLowerCase().includes(search.toLowerCase())
  );

  // Totais
  const totalAnimaisEscalados = feiras.reduce((acc, f) => acc + (f.total_animais || 0), 0);
  const totalAdocoesFeitas = feiras.reduce((acc, f) => acc + (f.total_adocoes || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="w-7 h-7 text-emerald-600" /> Gestão de Feiras de Adoção
          </h1>
          <p className="text-sm text-gray-500">
            Cadastre eventos presenciais, escale os animais participantes e realize adoções com termo digital.
          </p>
        </div>
        <Button onClick={() => abrirModal(null)} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700">
          <Plus className="w-4 h-4" /> Nova Feira
        </Button>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-xs uppercase font-semibold text-gray-400 block">Total de Feiras</span>
          <span className="text-2xl font-bold text-gray-900 mt-1 block">{feiras.length}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-sm">
          <span className="text-xs uppercase font-semibold text-emerald-600 block">Próximos Eventos</span>
          <span className="text-2xl font-bold text-emerald-700 mt-1 block">
            {feiras.filter(f => f.status === 'agendada' || f.status === 'em_andamento').length}
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-sm">
          <span className="text-xs uppercase font-semibold text-blue-600 block">Animais nas Feiras</span>
          <span className="text-2xl font-bold text-blue-700 mt-1 block">{totalAnimaisEscalados}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-pink-200 shadow-sm">
          <span className="text-xs uppercase font-semibold text-pink-600 block">Adoções Concluídas</span>
          <span className="text-2xl font-bold text-pink-700 mt-1 block">{totalAdocoesFeitas}</span>
        </div>
      </div>

      {/* Barra de Busca */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por título, praça ou endereço da feira..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm"
          />
        </div>
      </div>

      {/* Grid de Feiras */}
      {loading ? (
        <div className="p-12 text-center text-gray-500">Carregando feiras de adoção...</div>
      ) : filteredFeiras.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-gray-200 text-center space-y-3">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="text-lg font-bold text-gray-800">Nenhuma feira cadastrada</h3>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">
            Clique no botão acima para criar o primeiro evento de adoção do município.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFeiras.map((feira) => {
            const isAgendada = feira.status === 'agendada' || feira.status === 'em_andamento';
            return (
              <div 
                key={feira.id} 
                className={`bg-white rounded-xl overflow-hidden shadow-sm flex flex-col justify-between border transition-all ${
                  isAgendada ? 'border-emerald-500 ring-1 ring-emerald-500/30' : 'border-gray-200 opacity-90'
                }`}
              >
                <div>
                  <div className={`p-4 ${isAgendada ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
                    <div className="flex justify-between items-start gap-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        isAgendada ? 'bg-white text-emerald-800' : 'bg-gray-200 text-gray-700'
                      }`}>
                        {feira.status === 'agendada' ? 'Agendada' : feira.status === 'em_andamento' ? 'Em Andamento' : 'Concluída'}
                      </span>
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => abrirModal(feira)} 
                          className="p-1 hover:bg-black/10 rounded transition-colors"
                          title="Editar"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button 
                          onClick={() => handleExcluir(feira.id)} 
                          className="p-1 hover:bg-black/10 rounded transition-colors"
                          title="Excluir"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                    <h3 className="text-lg font-bold mt-2 leading-tight">{feira.titulo}</h3>
                  </div>

                  <div className="p-5 space-y-3 text-sm text-gray-600">
                    <div className="flex items-center gap-2 font-medium text-gray-900">
                      <Calendar className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>
                        {new Date(feira.data + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                      </span>
                    </div>

                    {(feira.horario_inicio || feira.horario_fim) && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span>{feira.horario_inicio || '09:00'} às {feira.horario_fim || '16:00'}</span>
                      </div>
                    )}

                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-gray-800 block">{feira.local}</span>
                        {feira.endereco && <span className="text-xs text-gray-500">{feira.endereco}</span>}
                      </div>
                    </div>

                    <div className="pt-2 border-t flex justify-between text-xs text-gray-500">
                      <span className="flex items-center gap-1 font-semibold text-emerald-700">
                        <Users size={14} /> {feira.total_animais || 0} animais escalados
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-pink-600">
                        <Heart size={14} /> {feira.total_adocoes || 0} adotados
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 border-t border-gray-100">
                  <Link
                    to={`/admin/feiras/${feira.id}`}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
                  >
                    Gerenciar Feira & Animais <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Nova / Editar Feira */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingFeira ? 'Editar Feira de Adoção' : 'Nova Feira de Adoção'}
      >
        <form onSubmit={handleSalvar} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Título do Evento *</label>
            <Input
              required
              placeholder="Ex: 1ª Feira de Adoção de Arapongas"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Data do Evento *</label>
              <Input
                type="date"
                required
                value={dataEvento}
                onChange={(e) => setDataEvento(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Início</label>
              <Input
                type="time"
                value={horarioInicio}
                onChange={(e) => setHorarioInicio(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Término</label>
              <Input
                type="time"
                value={horarioFim}
                onChange={(e) => setHorarioFim(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Local / Ponto de Referência *</label>
              <Input
                required
                placeholder="Ex: Praça Mauá (Pavilhão Central)"
                value={local}
                onChange={(e) => setLocal(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Status da Feira</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm bg-white focus:ring-2 focus:ring-emerald-500 font-medium"
              >
                <option value="agendada">Agendada</option>
                <option value="em_andamento">Em Andamento</option>
                <option value="concluida">Concluída</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Endereço Completo</label>
            <Input
              placeholder="Ex: Av. Arapongas, 500 - Centro"
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Descrição / Instruções aos Voluntários</label>
            <textarea
              rows={3}
              placeholder="Observações sobre estrutura, barracas, água para os animais, etc."
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">
              {saving ? 'Salvando...' : 'Salvar Feira'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
