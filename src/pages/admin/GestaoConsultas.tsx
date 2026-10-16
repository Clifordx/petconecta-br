import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Search, 
  Calendar, 
  Clock, 
  User, 
  Stethoscope, 
  Activity, 
  CheckCircle, 
  XCircle, 
  MessageCircle, 
  Building2, 
  FileText,
  AlertTriangle,
  Plus,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { toast } from 'sonner';
import { buildConsultaMessage, openWhatsApp1Click } from '@/lib/whatsapp';
import FichaAutorizacaoModal from '@/components/filas/FichaAutorizacaoModal';

export default function GestaoConsultas() {
  const [consultas, setConsultas] = useState<any[]>([]);
  const [clinicas, setClinicas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');

  // Modal Agendamento / Atendimento
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedConsulta, setSelectedConsulta] = useState<any>(null);
  const [dataConsulta, setDataConsulta] = useState('');
  const [horarioConsulta, setHorarioConsulta] = useState('14:00');
  const [clinicaId, setClinicaId] = useState('');
  const [status, setStatus] = useState('agendada');
  const [diagnostico, setDiagnostico] = useState('');
  const [prescricao, setPrescricao] = useState('');
  const [saving, setSaving] = useState(false);

  // Modal Guia de Autorização
  const [fichaModalOpen, setFichaModalOpen] = useState(false);
  const [fichaData, setFichaData] = useState<any>(null);

  useEffect(() => {
    fetchConsultas();
    fetchClinicas();
  }, []);

  const fetchClinicas = async () => {
    try {
      const { data } = await supabase.from('clinicas_parceiras').select('id, nome, telefone, endereco');
      setClinicas(data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchConsultas = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('consultas')
        .select(`
          *,
          pets (
            id,
            nome,
            especie,
            raca,
            sexo,
            porte,
            castrado,
            microchip,
            fotos_pet (url, is_principal)
          ),
          perfis:tutor_id (
            nome,
            telefone
          ),
          clinicas_parceiras:clinica_id (
            id,
            nome,
            telefone,
            endereco
          )
        `)
        .order('criado_em', { ascending: false });

      if (error) throw error;
      setConsultas(data || []);
    } catch (error) {
      console.error('Erro ao buscar consultas:', error);
      toast.error('Erro ao carregar consultas');
    } finally {
      setLoading(false);
    }
  };

  const abrirGuia = (item: any) => {
    setFichaData({
      tipo: 'consulta',
      protocolo: `AUT-CONS-${item.id.replace(/-/g, '').slice(0, 6).toUpperCase()}`,
      dataAgendada: item.data_consulta,
      clinicaNome: item.clinicas_parceiras?.nome || clinicas.find(c => c.id === item.clinica_id)?.nome || 'Clínica Municipal Credenciada',
      clinicaEndereco: item.clinicas_parceiras?.endereco || 'Arapongas - PR',
      clinicaTelefone: item.clinicas_parceiras?.telefone || clinicas.find(c => c.id === item.clinica_id)?.telefone,
      motivo: item.motivo,
      pet: item.pets,
      tutor: {
        nome: item.perfis?.nome || 'Tutor',
        telefone: item.perfis?.telefone
      }
    });
    setFichaModalOpen(true);
  };

  const abrirModalAgendamento = (item: any) => {
    setSelectedConsulta(item);
    setStatus(item.status || 'agendada');
    setClinicaId(item.clinica_id || (clinicas[0]?.id || ''));
    setDiagnostico(item.diagnostico || '');
    setPrescricao(item.prescricao || '');
    
    if (item.data_consulta) {
      const dt = new Date(item.data_consulta);
      setDataConsulta(dt.toISOString().split('T')[0]);
      setHorarioConsulta(dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
    } else {
      setDataConsulta(new Date().toISOString().split('T')[0]);
      setHorarioConsulta('14:00');
    }

    setModalOpen(true);
  };

  const dispararWhatsAppConsulta = (item: any, customClinicaId?: string, customData?: string) => {
    const telefone = item.perfis?.telefone;
    if (!telefone) {
      toast.warning('Este tutor não possui telefone cadastrado.');
      return;
    }

    const cId = customClinicaId || item.clinica_id;
    const clinicaObj = clinicas.find(c => c.id === cId) || item.clinicas_parceiras;
    const clinicaNome = clinicaObj?.nome || 'Clínica Municipal Credenciada';
    const dt = customData || item.data_consulta;

    const msg = buildConsultaMessage({
      tutorNome: item.perfis?.nome || 'Tutor',
      petNome: item.pets?.nome || 'Animal',
      clinicaNome,
      dataConsulta: dt || new Date(),
      motivo: item.motivo,
      cidade: 'Arapongas - PR'
    });

    openWhatsApp1Click(telefone, msg);
    toast.success('WhatsApp aberto com a confirmação de consulta!');
  };

  const handleSalvar = async (e: React.FormEvent, notificarWhatsApp = false) => {
    e.preventDefault();
    if (!selectedConsulta) return;

    setSaving(true);
    try {
      let dataFinal = null;
      if (dataConsulta) {
        dataFinal = `${dataConsulta}T${horarioConsulta || '00:00'}:00.000Z`;
      }

      const { error } = await supabase
        .from('consultas')
        .update({
          status,
          clinica_id: clinicaId || null,
          data_consulta: dataFinal,
          diagnostico: diagnostico.trim() || null,
          prescricao: prescricao.trim() || null
        })
        .eq('id', selectedConsulta.id);

      if (error) throw error;

      toast.success('Consulta atualizada com sucesso!');

      if (notificarWhatsApp) {
        dispararWhatsAppConsulta(selectedConsulta, clinicaId, dataFinal || undefined);
      }

      setModalOpen(false);
      fetchConsultas();
    } catch (error: any) {
      console.error('Erro ao atualizar consulta:', error);
      toast.error(error.message || 'Erro ao salvar consulta');
    } finally {
      setSaving(false);
    }
  };

  const getFotoPrincipal = (fotos: any[]) => {
    if (!fotos || fotos.length === 0) return 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=200';
    const princ = fotos.find(f => f.is_principal);
    return princ ? princ.url : fotos[0].url;
  };

  const filtered = consultas.filter(c => {
    const matchesSearch = 
      c.pets?.nome?.toLowerCase().includes(search.toLowerCase()) ||
      c.perfis?.nome?.toLowerCase().includes(search.toLowerCase()) ||
      c.motivo?.toLowerCase().includes(search.toLowerCase());

    let matchesStatus = true;
    if (filtroStatus === 'triagem') {
      matchesStatus = c.status === 'solicitada' || (c.status === 'agendada' && !c.data_consulta);
    } else if (filtroStatus === 'agendada') {
      matchesStatus = c.status === 'agendada' && !!c.data_consulta;
    } else if (filtroStatus !== 'todos') {
      matchesStatus = c.status === filtroStatus;
    }
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (st: string, data_consulta?: string | null) => {
    if (st === 'solicitada' || (st === 'agendada' && !data_consulta)) {
      return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">Aguardando Triagem</span>;
    }
    switch (st) {
      case 'agendada':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">Agendada</span>;
      case 'em_andamento':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">Em Atendimento</span>;
      case 'realizada':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">Atendida / Concluída</span>;
      case 'cancelada':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">Cancelada</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{st}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Stethoscope className="w-7 h-7 text-emerald-600" /> Gestão de Consultas Veterinárias
          </h1>
          <p className="text-sm text-gray-500">
            Triagem clínica, agendamento com clínicas credenciadas e prontuário básico.
          </p>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por paciente, tutor ou sintoma..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="border rounded-xl px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-emerald-500"
          >
            <option value="todos">Todos os Status</option>
            <option value="triagem">Aguardando Triagem</option>
            <option value="agendada">Agendadas</option>
            <option value="em_andamento">Em Atendimento</option>
            <option value="realizada">Realizadas</option>
            <option value="cancelada">Canceladas</option>
          </select>
        </div>
      </div>

      {/* Tabela de Consultas */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Carregando consultas...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-500 space-y-2">
            <Stethoscope className="w-12 h-12 text-gray-300 mx-auto" />
            <h3 className="font-bold text-gray-800">Nenhuma consulta encontrada</h3>
            <p className="text-xs text-gray-400">As solicitações dos tutores aparecerão aqui automaticamente.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-700 text-xs uppercase font-semibold border-b">
                <tr>
                  <th className="p-4">Paciente (Pet)</th>
                  <th className="p-4">Tutor Responsável</th>
                  <th className="p-4">Sintomas / Motivo</th>
                  <th className="p-4">Data Agendada & Clínica</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={getFotoPrincipal(item.pets?.fotos_pet)} 
                          alt={item.pets?.nome} 
                          className="w-10 h-10 rounded-lg object-cover border flex-shrink-0"
                        />
                        <div>
                          <span className="font-bold text-gray-900 block">{item.pets?.nome}</span>
                          <span className="text-xs text-gray-500">{item.pets?.especie} • {item.pets?.raca || 'SRD'}</span>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="font-semibold text-gray-800 block text-xs">{item.perfis?.nome || 'Tutor'}</span>
                      {item.perfis?.telefone && (
                        <div className="flex items-center gap-1.5 mt-0.5 text-xs text-gray-500">
                          <span>{item.perfis?.telefone}</span>
                          <button
                            onClick={() => dispararWhatsAppConsulta(item)}
                            className="text-green-700 hover:text-green-800 px-1.5 py-0.5 bg-green-50 hover:bg-green-100 rounded border border-green-200 flex items-center gap-1 font-semibold text-[11px]"
                            title="Enviar Confirmação no WhatsApp"
                          >
                            <MessageCircle size={12} className="text-green-600" /> WhatsApp
                          </button>
                        </div>
                      )}
                    </td>

                    <td className="p-4 text-xs max-w-xs">
                      <p className="font-medium text-gray-800 truncate" title={item.motivo}>{item.motivo}</p>
                      {item.urgencia === 'urgente' && (
                        <span className="text-[10px] text-red-600 font-bold flex items-center gap-0.5 mt-0.5">
                          <AlertTriangle size={11} /> Urgente
                        </span>
                      )}
                    </td>

                    <td className="p-4 text-xs">
                      {item.data_consulta ? (
                        <div>
                          <span className="font-bold text-gray-900 block">
                            {new Date(item.data_consulta).toLocaleDateString('pt-BR')} às{' '}
                            {new Date(item.data_consulta).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className="text-gray-500 block">{item.clinicas_parceiras?.nome || 'Clínica Municipal'}</span>
                        </div>
                      ) : (
                        <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-medium">Aguardando agendamento</span>
                      )}
                    </td>

                    <td className="p-4">
                      {getStatusBadge(item.status, item.data_consulta)}
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => abrirGuia(item)}
                          className="text-xs flex items-center gap-1 border-gray-300 text-gray-700 hover:bg-gray-100"
                          title="Imprimir ou Baixar Guia Oficial de Consulta"
                        >
                          <FileText size={13} className="text-emerald-600" /> Guia
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => abrirModalAgendamento(item)}
                          className="text-xs flex items-center gap-1 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                        >
                          <Calendar size={13} /> Gerenciar
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Agendamento e Prontuário */}
      {selectedConsulta && (
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={`Consulta de ${selectedConsulta.pets?.nome}`}
        >
          <form onSubmit={handleSalvar} className="space-y-4">
            <div className="p-3 bg-gray-50 rounded-xl border text-xs space-y-1">
              <p><span className="font-bold text-gray-700">Tutor:</span> {selectedConsulta.perfis?.nome || 'Não informado'} ({selectedConsulta.perfis?.telefone || 'Sem telefone'})</p>
              <p><span className="font-bold text-gray-700">Motivo informado:</span> {selectedConsulta.motivo}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Status da Consulta</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full border rounded-xl p-2.5 text-sm bg-white font-medium"
                >
                  <option value="agendada">Agendada</option>
                  <option value="em_andamento">Em Atendimento</option>
                  <option value="realizada">Realizada / Concluída</option>
                  <option value="cancelada">Cancelada</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Clínica Credenciada</label>
                <select
                  value={clinicaId}
                  onChange={(e) => setClinicaId(e.target.value)}
                  className="w-full border rounded-xl p-2.5 text-sm bg-white"
                >
                  <option value="">Selecione a clínica...</option>
                  {clinicas.map(c => (
                    <option key={c.id} value={c.id}>{c.nome}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Data da Consulta</label>
                <Input
                  type="date"
                  value={dataConsulta}
                  onChange={(e) => setDataConsulta(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Horário</label>
                <Input
                  type="time"
                  value={horarioConsulta}
                  onChange={(e) => setHorarioConsulta(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Diagnóstico Clínico (Opcional)</label>
              <textarea
                rows={2}
                value={diagnostico}
                onChange={(e) => setDiagnostico(e.target.value)}
                placeholder="Anotações do veterinário sobre a avaliação física, sintomas..."
                className="w-full border rounded-xl p-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Prescrição / Tratamento (Opcional)</label>
              <textarea
                rows={2}
                value={prescricao}
                onChange={(e) => setPrescricao(e.target.value)}
                placeholder="Medicamentos receitados, dosagem, orientações ao tutor..."
                className="w-full border rounded-xl p-2.5 text-sm"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Cancelar
              </Button>
              <div className="flex items-center gap-2">
                <Button type="submit" disabled={saving} variant="outline" className="text-xs">
                  {saving ? 'Salvando...' : 'Apenas Salvar'}
                </Button>
                <Button 
                  type="button" 
                  disabled={saving}
                  onClick={async (e) => {
                    await handleSalvar(e, true);
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white text-xs flex items-center gap-1.5"
                >
                  <MessageCircle size={14} /> Salvar e Enviar WhatsApp
                </Button>
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal Guia Oficial / Ficha de Autorização */}
      {fichaData && (
        <FichaAutorizacaoModal
          isOpen={fichaModalOpen}
          onClose={() => setFichaModalOpen(false)}
          tipo="consulta"
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
