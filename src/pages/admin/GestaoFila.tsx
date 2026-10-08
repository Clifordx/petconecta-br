import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, Filter, Download, Calendar as CalendarIcon, CheckCircle, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

export default function GestaoFila() {
  const [fila, setFila] = useState<any[]>([]);
  const [clinicas, setClinicas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  
  // Agendamento form
  const [dataAgendada, setDataAgendada] = useState('');
  const [clinicaId, setClinicaId] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // 1. Puxa as clínicas para o dropdown de agendamento
      const { data: clinicasData } = await supabase.from('clinicas_parceiras').select('*');
      setClinicas(clinicasData || []);

      // 2. Puxa a fila com os joins
      const { data: filaData, error } = await supabase
        .from('filas_castracao')
        .select(`
          *,
          pets (nome, especie, raca, sexo),
          perfis (nome, telefone, email),
          clinicas_parceiras (nome)
        `)
        .order('criado_em', { ascending: true });

      if (error) throw error;
      setFila(filaData || []);
    } catch (error) {
      console.error('Erro ao carregar fila:', error);
      toast.error('Erro ao carregar fila de castração');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, novoStatus: string) => {
    try {
      const { error } = await supabase
        .from('filas_castracao')
        .update({ status: novoStatus })
        .eq('id', id);
        
      if (error) throw error;
      
      // Se concluiu, atualiza o status do pet para castrado=true
      if (novoStatus === 'concluido') {
        const item = fila.find(f => f.id === id);
        if (item?.pet_id) {
          await supabase.from('pets').update({ castrado: true }).eq('id', item.pet_id);
        }
      }
      
      toast.success(`Status alterado para \${novoStatus}`);
      fetchData();
    } catch (error) {
      console.error('Erro ao atualizar:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  const openAgendarModal = (item: any) => {
    setSelectedItem(item);
    setDataAgendada(item.data_agendada ? new Date(item.data_agendada).toISOString().slice(0, 16) : '');
    setClinicaId(item.clinica_id || '');
    setIsModalOpen(true);
  };

  const handleAgendar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dataAgendada || !clinicaId) {
      toast.error('Selecione uma clínica e uma data válida');
      return;
    }
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('filas_castracao')
        .update({
          status: 'agendado',
          data_agendada: new Date(dataAgendada).toISOString(),
          clinica_id: clinicaId
        })
        .eq('id', selectedItem.id);
        
      if (error) throw error;
      toast.success('Castração agendada com sucesso!');
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Erro ao agendar:', error);
      toast.error('Erro ao realizar agendamento');
    } finally {
      setSaving(false);
    }
  };

  const filteredFila = fila.filter(item => {
    const matchesSearch = 
      item.pets?.nome?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.perfis?.nome?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'todos' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pendente': return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">Pendente</span>;
      case 'agendado': return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">Agendado</span>;
      case 'concluido': return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Concluído</span>;
      case 'cancelado': return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">Cancelado</span>;
      default: return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestão de Fila de Castração</h1>
          <p className="text-gray-500">Administre as solicitações de castração dos munícipes.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Buscar por tutor ou pet..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500"
            >
              <option value="todos">Todos os Status</option>
              <option value="pendente">Pendente</option>
              <option value="agendado">Agendado</option>
              <option value="concluido">Concluído</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Carregando fila...</div>
        ) : filteredFila.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Nenhum registro encontrado na fila.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
                <tr>
                  <th className="p-4">Posição</th>
                  <th className="p-4">Pet</th>
                  <th className="p-4">Tutor</th>
                  <th className="p-4">Clínica / Data</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredFila.map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-semibold text-gray-900">#{index + 1}</td>
                    <td className="p-4">
                      <p className="font-medium text-gray-900">{item.pets?.nome || 'Desconhecido'}</p>
                      <p className="text-xs text-gray-500">
                        {item.pets?.especie === 'cao' ? 'Cão' : 'Gato'} • {item.pets?.raca || 'SRD'}
                      </p>
                    </td>
                    <td className="p-4">
                      <p className="text-gray-900">{item.perfis?.nome || 'Desconhecido'}</p>
                      <p className="text-xs text-gray-500">{item.perfis?.telefone || 'Sem telefone'}</p>
                    </td>
                    <td className="p-4">
                      {item.status === 'agendado' || item.status === 'concluido' ? (
                        <>
                          <p className="font-medium text-gray-900">{item.clinicas_parceiras?.nome}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(item.data_agendada).toLocaleDateString('pt-BR')} às {new Date(item.data_agendada).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </>
                      ) : (
                        <span className="text-xs text-gray-400">Não agendado</span>
                      )}
                    </td>
                    <td className="p-4">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        {item.status === 'pendente' && (
                          <button 
                            onClick={() => openAgendarModal(item)}
                            title="Agendar" 
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded border border-transparent hover:border-blue-200"
                          >
                            <CalendarIcon className="w-4 h-4" />
                          </button>
                        )}
                        {(item.status === 'pendente' || item.status === 'agendado') && (
                          <button 
                            onClick={() => updateStatus(item.id, 'concluido')}
                            title="Marcar como Concluído" 
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded border border-transparent hover:border-emerald-200"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {item.status !== 'cancelado' && item.status !== 'concluido' && (
                          <button 
                            onClick={() => {
                              if (window.confirm('Deseja realmente cancelar esta solicitação?')) {
                                updateStatus(item.id, 'cancelado');
                              }
                            }}
                            title="Cancelar Solicitação" 
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded border border-transparent hover:border-red-200"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Agendar Castração"
      >
        <form onSubmit={handleAgendar} className="space-y-4">
          <div className="bg-gray-50 p-3 rounded-lg mb-4 text-sm">
            <p><strong>Pet:</strong> {selectedItem?.pets?.nome}</p>
            <p><strong>Tutor:</strong> {selectedItem?.perfis?.nome}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Clínica Parceira *</label>
            <select
              required
              value={clinicaId}
              onChange={(e) => setClinicaId(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Selecione uma clínica...</option>
              {clinicas.map(c => (
                <option key={c.id} value={c.id}>{c.nome} (Vagas: {c.vagas_castracao_mensal})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data e Hora do Agendamento *</label>
            <input
              type="datetime-local"
              required
              value={dataAgendada}
              onChange={(e) => setDataAgendada(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Agendando...' : 'Confirmar Agendamento'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
