import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { fetchClinicasParceiras, isUsuarioClinica, getClinicaIdDoUsuario } from '@/lib/clinicas';
import { Search, Calendar as CalendarIcon, CheckCircle, XCircle, MessageCircle, RotateCcw, Edit, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { buildCastracaoMessage, dispararWhatsApp, openWhatsApp1Click } from '@/lib/whatsapp';
import FichaAutorizacaoModal from '@/components/filas/FichaAutorizacaoModal';

export default function GestaoFila() {
  const [fila, setFila] = useState<any[]>([]);
  const [clinicas, setClinicas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  
  // Agendamento form
  const [modalStatus, setModalStatus] = useState('agendado');
  const [dataAgendada, setDataAgendada] = useState('');
  const [clinicaId, setClinicaId] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [saving, setSaving] = useState(false);

  // Guia Oficial
  const [fichaModalOpen, setFichaModalOpen] = useState(false);
  const [fichaData, setFichaData] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // 1. Puxa as clínicas parceiras
      const clinicasLista = await fetchClinicasParceiras();
      setClinicas(clinicasLista);

      // 2. Puxa a fila com os relacionamentos corretos
      const { data: filaData, error } = await supabase
        .from('filas_castracao')
        .select(`
          *,
          pets (id, nome, especie, raca, sexo, castrado, microchip),
          perfis:tutor_id (nome, telefone),
          clinicas_parceiras:clinica_id (id, nome, endereco, telefone)
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
      const item = fila.find(f => f.id === id);
      
      const { error } = await supabase
        .from('filas_castracao')
        .update({ status: novoStatus })
        .eq('id', id);
        
      if (error) throw error;
      
      // Se concluiu, atualiza o status do pet para castrado = true
      if (novoStatus === 'concluido' && item?.pet_id) {
        await supabase.from('pets').update({ castrado: true }).eq('id', item.pet_id);
      }

      // Se reverteu de concluído para pendente ou agendado, reverte o pet para castrado = false!
      if ((novoStatus === 'pendente' || novoStatus === 'agendado') && item?.pet_id) {
        await supabase.from('pets').update({ castrado: false }).eq('id', item.pet_id);
      }
      
      toast.success(
        novoStatus === 'pendente' 
          ? 'Solicitação revertida para a fila de espera!' 
          : `Status alterado para ${novoStatus}`
      );
      fetchData();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  const openAgendarModal = (item: any) => {
    setSelectedItem(item);
    setModalStatus(item.status || 'agendado');
    setDataAgendada(item.data_agendada ? new Date(item.data_agendada).toISOString().slice(0, 16) : '');
    setClinicaId(item.clinica_id || (clinicas[0]?.id || ''));
    setObservacoes(item.observacoes || '');
    setIsModalOpen(true);
  };

  const abrirGuia = (item: any) => {
    setFichaData({
      tipo: 'castracao',
      protocolo: `AUT-CAST-${item.id.replace(/-/g, '').slice(0, 6).toUpperCase()}`,
      dataAgendada: item.data_agendada,
      clinicaNome: item.clinicas_parceiras?.nome || 'Clínica Conveniada Municipal',
      clinicaEndereco: item.clinicas_parceiras?.endereco,
      clinicaTelefone: item.clinicas_parceiras?.telefone,
      motivo: item.observacoes,
      pet: item.pets,
      tutor: {
        nome: item.perfis?.nome || 'Tutor',
        telefone: item.perfis?.telefone
      }
    });
    setFichaModalOpen(true);
  };

  const dispararWhatsAppCastracao = async (item: any, customClinicaId?: string, customData?: string) => {
    const telefone = item.perfis?.telefone;
    if (!telefone) {
      toast.warning('Este tutor não possui telefone cadastrado.');
      return;
    }

    const cId = customClinicaId || item.clinica_id;
    const cObj = clinicas.find(c => c.id === cId) || item.clinicas_parceiras;
    const clinicaNome = cObj?.nome || 'Clínica Conveniada Municipal';
    const dt = customData || item.data_agendada;

    if (!dt) {
      toast.warning('O horário da cirurgia ainda não foi definido.');
      return;
    }

    const msg = buildCastracaoMessage({
      tutorNome: item.perfis?.nome || 'Tutor',
      petNome: item.pets?.nome || 'Animal',
      especie: item.pets?.especie,
      raca: item.pets?.raca,
      clinicaNome: clinicaNome,
      dataAgendada: dt,
      cidade: 'Arapongas - PR'
    });

    const res = await dispararWhatsApp({
      telefone,
      tipo: 'castracao',
      destinatarioNome: item.perfis?.nome,
      mensagem: msg,
      metadata: { protocolo: `AUT-CAST-${item.id.replace(/-/g, '').slice(0, 6).toUpperCase()}` }
    });

    if (res.sucesso) {
      if (res.modo === 'manual') {
        toast.info('Instruções preparadas e WhatsApp aberto para envio!');
      } else {
        toast.success('Notificação de castração enviada automaticamente via robô de WhatsApp!');
      }
    } else {
      toast.error(res.erro || 'Erro ao enviar notificação WhatsApp.');
    }
  };

  const handleSalvarModal = async (e: React.FormEvent, notificarWhatsApp = false) => {
    e.preventDefault();
    if (!selectedItem) return;

    if (modalStatus === 'agendado' && (!dataAgendada || !clinicaId)) {
      toast.error('Para agendar, selecione a clínica parceira e a data/hora');
      return;
    }
    
    setSaving(true);
    try {
      const updatePayload: any = {
        status: modalStatus,
        observacoes: observacoes.trim() || null
      };

      if (modalStatus === 'agendado') {
        updatePayload.data_agendada = new Date(dataAgendada).toISOString();
        updatePayload.clinica_id = clinicaId;
      } else if (modalStatus === 'pendente') {
        updatePayload.data_agendada = null;
        updatePayload.clinica_id = null;
      }

      const { error } = await supabase
        .from('filas_castracao')
        .update(updatePayload)
        .eq('id', selectedItem.id);
        
      if (error) throw error;

      // Sincroniza flag do pet
      if (modalStatus === 'concluido' && selectedItem.pet_id) {
        await supabase.from('pets').update({ castrado: true }).eq('id', selectedItem.pet_id);
      } else if ((modalStatus === 'pendente' || modalStatus === 'agendado') && selectedItem.pet_id) {
        await supabase.from('pets').update({ castrado: false }).eq('id', selectedItem.pet_id);
      }

      toast.success('Fila de castração atualizada com sucesso!');

      if (notificarWhatsApp && modalStatus === 'agendado') {
        await dispararWhatsAppCastracao(selectedItem, clinicaId, dataAgendada);
      }

      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Erro ao atualizar agendamento:', error);
      toast.error('Erro ao salvar agendamento');
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
      case 'pendente': return <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold border border-amber-200">Na Fila (Pendente)</span>;
      case 'agendado': return <span className="px-2.5 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold border border-blue-200">Cirurgia Agendada</span>;
      case 'concluido': return <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold border border-emerald-200">Castrado / Concluído</span>;
      case 'cancelado': return <span className="px-2.5 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold border border-red-200">Cancelado</span>;
      default: return <span className="px-2.5 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestão de Fila de Castração</h1>
          <p className="text-sm text-gray-500">Administre as solicitações de castração dos munícipes, agendamentos e clínicas conveniadas.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Buscar por tutor ou pet..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-xl text-sm bg-white focus:ring-2 focus:ring-emerald-500 font-medium"
            >
              <option value="todos">Todos os Status</option>
              <option value="pendente">Pendente (Na Fila)</option>
              <option value="agendado">Agendado</option>
              <option value="concluido">Concluído</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-500">Carregando fila...</div>
        ) : filteredFila.length === 0 ? (
          <div className="p-12 text-center text-gray-500">Nenhum registro encontrado na fila.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200 text-xs uppercase tracking-wider">
                <tr>
                  <th className="p-4">Posição</th>
                  <th className="p-4">Pet</th>
                  <th className="p-4">Tutor</th>
                  <th className="p-4">Clínica / Data da Cirurgia</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredFila.map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-bold text-gray-900">#{index + 1}</td>
                    
                    <td className="p-4">
                      <p className="font-bold text-gray-900">{item.pets?.nome || 'Desconhecido'}</p>
                      <p className="text-xs text-gray-500 capitalize">
                        {item.pets?.especie === 'cao' ? 'Cachorro' : 'Gato'} • {item.pets?.raca || 'SRD'} • {item.pets?.sexo === 'macho' ? 'Macho' : 'Fêmea'}
                      </p>
                    </td>

                    <td className="p-4">
                      <p className="font-semibold text-gray-900">{item.perfis?.nome || 'Tutor'}</p>
                      <p className="text-xs text-gray-500">{item.perfis?.telefone || 'Sem telefone'}</p>
                    </td>

                    <td className="p-4">
                      {item.clinicas_parceiras?.nome || item.data_agendada ? (
                        <div>
                          <p className="font-semibold text-gray-900">{item.clinicas_parceiras?.nome || 'Clínica Conveniada'}</p>
                          {item.data_agendada ? (
                            <p className="text-xs text-gray-500">
                              {new Date(item.data_agendada).toLocaleDateString('pt-BR')} às {new Date(item.data_agendada).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          ) : (
                            <p className="text-xs text-amber-600">Data não informada</p>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-medium">
                          Aguardando agendamento
                        </span>
                      )}
                    </td>

                    <td className="p-4">
                      {getStatusBadge(item.status)}
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2 items-center flex-wrap">
                        
                        {/* Se estiver agendado, botão de WhatsApp com 1 clique */}
                        {item.status === 'agendado' && (
                          <button 
                            onClick={() => dispararWhatsAppCastracao(item)}
                            title="Enviar Comprovante e Jejum no WhatsApp" 
                            className="p-1.5 text-green-700 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 flex items-center gap-1 text-xs font-semibold px-2 transition-colors"
                          >
                            <MessageCircle className="w-3.5 h-3.5 text-green-600" /> WhatsApp
                          </button>
                        )}

                        {/* Botão para Visualizar e Imprimir a Guia Oficial */}
                        <button 
                          onClick={() => abrirGuia(item)}
                          title="Visualizar e Imprimir Guia Oficial" 
                          className="p-1.5 text-gray-700 hover:bg-gray-100 rounded-lg border border-gray-300 flex items-center gap-1 text-xs font-medium px-2"
                        >
                          <FileText className="w-3.5 h-3.5 text-gray-600" /> Guia
                        </button>

                        {/* Botão de Gerenciar / Agendar */}
                        <button 
                          onClick={() => openAgendarModal(item)}
                          title="Gerenciar / Agendar" 
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg border border-blue-200 flex items-center gap-1 text-xs font-medium px-2"
                        >
                          <Edit className="w-3.5 h-3.5" /> Gerenciar
                        </button>

                        {/* Se estiver concluído ou cancelado: Botão explícito para Reverter */}
                        {(item.status === 'concluido' || item.status === 'cancelado') && (
                          <button 
                            onClick={() => {
                              if (window.confirm(`Deseja reverter a situação de ${item.pets?.nome}? O animal voltará para a fila de espera e constará como NÃO castrado.`)) {
                                updateStatus(item.id, 'pendente');
                              }
                            }}
                            title="Reverter para a fila de espera" 
                            className="p-1.5 text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200 flex items-center gap-1 text-xs font-semibold px-2"
                          >
                            <RotateCcw className="w-3.5 h-3.5" /> Reverter para Fila
                          </button>
                        )}

                        {/* Se estiver pendente ou agendado: Botão rápido para marcar como concluído */}
                        {(item.status === 'pendente' || item.status === 'agendado') && (
                          <button 
                            onClick={() => {
                              if (window.confirm(`Confirmar que a castração de ${item.pets?.nome} foi realizada com sucesso? O pet será marcado como castrado no sistema.`)) {
                                updateStatus(item.id, 'concluido');
                              }
                            }}
                            title="Marcar como Cirurgia Realizada" 
                            className="p-1.5 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 flex items-center gap-1 text-xs font-semibold px-2"
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> Concluir
                          </button>
                        )}

                        {/* Botão Cancelar se estiver pendente ou agendado */}
                        {item.status !== 'cancelado' && item.status !== 'concluido' && (
                          <button 
                            onClick={() => {
                              if (window.confirm(`Deseja realmente cancelar a solicitação de ${item.pets?.nome}?`)) {
                                updateStatus(item.id, 'cancelado');
                              }
                            }}
                            title="Cancelar Solicitação" 
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-200"
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

      {/* Modal de Agendamento e Alteração de Status */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Gerenciar Castração: ${selectedItem?.pets?.nome || ''}`}
      >
        <form onSubmit={handleSalvarModal} className="space-y-4">
          <div className="bg-gray-50 p-3 rounded-xl border text-xs space-y-1">
            <p><strong>Paciente:</strong> {selectedItem?.pets?.nome} ({selectedItem?.pets?.especie})</p>
            <p><strong>Tutor:</strong> {selectedItem?.perfis?.nome} ({selectedItem?.perfis?.telefone || 'Sem telefone'})</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Status da Castração</label>
            <select
              value={modalStatus}
              onChange={(e) => setModalStatus(e.target.value)}
              className="w-full rounded-xl border border-gray-300 p-2.5 text-sm bg-white font-medium focus:ring-2 focus:ring-emerald-500"
            >
              <option value="pendente">Pendente (Na Fila de Espera)</option>
              <option value="agendado">Agendado (Definir clínica e data)</option>
              <option value="concluido">Concluído (Castração Realizada)</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Clínica Conveniada {modalStatus === 'agendado' ? '*' : '(Opcional)'}
            </label>
            <select
              required={modalStatus === 'agendado'}
              value={clinicaId}
              onChange={(e) => setClinicaId(e.target.value)}
              className="w-full rounded-xl border border-gray-300 p-2.5 text-sm bg-white focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Selecione uma clínica...</option>
              {clinicas.map(c => (
                <option key={c.id} value={c.id}>{c.nome} (Vagas: {c.vagas_castracao_mensal})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Data e Horário da Cirurgia {modalStatus === 'agendado' ? '*' : '(Opcional)'}
            </label>
            <input
              type="datetime-local"
              required={modalStatus === 'agendado'}
              value={dataAgendada}
              onChange={(e) => setDataAgendada(e.target.value)}
              className="w-full rounded-xl border border-gray-300 p-2.5 text-sm focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Observações Internas (Opcional)</label>
            <textarea
              rows={2}
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Instruções adicionais, restrições ou observações clínicas..."
              className="w-full rounded-xl border border-gray-300 p-2.5 text-sm resize-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <div className="flex items-center gap-2">
              <Button type="submit" disabled={saving} variant="outline" className="text-xs">
                {saving ? 'Salvando...' : 'Apenas Salvar'}
              </Button>
              {modalStatus === 'agendado' && (
                <Button 
                  type="button" 
                  disabled={saving}
                  onClick={async (e) => {
                    await handleSalvarModal(e, true);
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white text-xs flex items-center gap-1.5"
                >
                  <MessageCircle size={14} /> Salvar e Enviar WhatsApp
                </Button>
              )}
            </div>
          </div>
        </form>
      </Modal>

      {/* MODAL DA GUIA OFICIAL */}
      {fichaModalOpen && fichaData && (
        <FichaAutorizacaoModal
          isOpen={fichaModalOpen}
          onClose={() => setFichaModalOpen(false)}
          tipo={fichaData.tipo}
          protocolo={fichaData.protocolo}
          dataAgendada={fichaData.dataAgendada}
          clinicaNome={fichaData.clinicaNome}
          clinicaEndereco={fichaData.clinicaEndereco}
          clinicaTelefone={fichaData.clinicaTelefone}
          motivo={fichaData.motivo}
          pet={fichaData.pet}
          tutor={fichaData.tutor}
        />
      )}
    </div>
  );
}
