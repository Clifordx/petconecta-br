import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { 
  FileText, 
  Stethoscope, 
  Plus, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  MapPin, 
  Phone,
  Scissors,
  Loader2,
  RefreshCw,
  Dog,
  Cat
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function MinhasFilas() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const initialTab = searchParams.get('tab') === 'consulta' ? 'consulta' : 'castracao';
  const [activeTab, setActiveTab] = useState<'castracao' | 'consulta'>(initialTab);
  const [loading, setLoading] = useState(true);

  const [castracoes, setCastracoes] = useState<any[]>([]);
  const [consultas, setConsultas] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      carregarMinhasFilas();
    }
  }, [user]);

  const carregarMinhasFilas = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // 1. Carrega todas as filas de castração pendentes para calcular a posição real
      const { data: todasFilas } = await supabase
        .from('filas_castracao')
        .select('id, criado_em, status')
        .eq('status', 'pendente')
        .order('criado_em', { ascending: true });

      // 2. Carrega as castrações do próprio usuário
      const { data: minhasCastracoes, error: errCastracao } = await supabase
        .from('filas_castracao')
        .select(`
          id,
          status,
          data_agendada,
          observacoes,
          criado_em,
          pets (id, nome, especie, raca, fotos_pet(url)),
          clinicas_parceiras (nome, endereco, telefone)
        `)
        .eq('tutor_id', user.id)
        .order('criado_em', { ascending: false });

      if (errCastracao) throw errCastracao;

      // Calcula posição real na fila para cada inscrição pendente
      const castracoesComPosicao = (minhasCastracoes || []).map(item => {
        let posicao = 0;
        if (item.status === 'pendente' && todasFilas) {
          const index = todasFilas.findIndex(f => f.id === item.id);
          posicao = index !== -1 ? index + 1 : 1;
        }
        return { ...item, posicao };
      });

      setCastracoes(castracoesComPosicao);

      // 3. Carrega as consultas do usuário
      const { data: minhasConsultas, error: errConsulta } = await supabase
        .from('consultas')
        .select(`
          id,
          motivo,
          urgencia,
          status,
          data_consulta,
          diagnostico,
          prescricao,
          criado_em,
          pets (id, nome, especie, raca, fotos_pet(url)),
          clinicas_parceiras (nome, endereco, telefone)
        `)
        .eq('tutor_id', user.id)
        .order('criado_em', { ascending: false });

      if (errConsulta) throw errConsulta;
      setConsultas(minhasConsultas || []);

    } catch (error) {
      console.error('Erro ao carregar filas do cidadão:', error);
      toast.error('Erro ao buscar dados das filas.');
    } finally {
      setLoading(false);
    }
  };

  const getCastracaoBadge = (status: string) => {
    switch (status) {
      case 'pendente':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">Na Fila de Espera</span>;
      case 'agendado':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-900 border border-blue-200 animate-pulse">Cirurgia Agendada</span>;
      case 'concluido':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-200">Castração Realizada</span>;
      case 'cancelado':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700">Cancelado</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  const getConsultaBadge = (status: string, data_consulta?: string | null) => {
    if (status === 'solicitada' || (status === 'agendada' && !data_consulta)) {
      return <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">Aguardando Triagem</span>;
    }
    switch (status) {
      case 'agendada':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-900 border border-blue-200">Consulta Confirmada</span>;
      case 'realizada':
      case 'concluida':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-200">Atendimento Concluído</span>;
      case 'cancelada':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700">Cancelada</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl py-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Minhas Filas e Atendimentos</h1>
          <p className="text-sm text-gray-500">
            Acompanhe a posição do seu animal na fila de castração e consultas agendadas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            onClick={carregarMinhasFilas} 
            variant="outline" 
            size="sm" 
            className="text-xs flex items-center gap-1.5"
            disabled={loading}
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Atualizar
          </Button>
          <Button 
            onClick={() => navigate('/app/filas/castracao')} 
            className="bg-emerald-600 hover:bg-emerald-700 text-xs flex items-center gap-1.5"
          >
            <Plus size={14} /> Inscrever para Castração
          </Button>
          <Button 
            onClick={() => navigate('/app/filas/consulta')} 
            variant="outline" 
            className="border-emerald-600 text-emerald-700 hover:bg-emerald-50 text-xs flex items-center gap-1.5"
          >
            <Stethoscope size={14} /> Solicitar Consulta
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6">
        {/* Abas */}
        <div className="flex gap-4 border-b pb-2">
          <button 
            onClick={() => {
              setActiveTab('castracao');
              setSearchParams({ tab: 'castracao' });
            }}
            className={`pb-2.5 px-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'castracao' 
                ? 'border-emerald-600 text-emerald-800' 
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Scissors size={16} /> Fila de Castração ({castracoes.length})
          </button>
          <button 
            onClick={() => {
              setActiveTab('consulta');
              setSearchParams({ tab: 'consulta' });
            }}
            className={`pb-2.5 px-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'consulta' 
                ? 'border-emerald-600 text-emerald-800' 
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Stethoscope size={16} /> Consultas Veterinárias ({consultas.length})
          </button>
        </div>

        {loading ? (
          <div className="py-16 text-center">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-2" />
            <p className="text-sm text-gray-500">Buscando suas solicitações...</p>
          </div>
        ) : (
          <>
            {/* ABA 1: CASTRAÇÃO */}
            {activeTab === 'castracao' && (
              <div className="space-y-4">
                {castracoes.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 space-y-3">
                    <Scissors className="w-12 h-12 mx-auto text-gray-300" />
                    <div>
                      <p className="font-semibold text-gray-800">Você não possui animais na fila de castração.</p>
                      <p className="text-xs text-gray-400 mt-0.5">Cadastre um pet não castrado e solicite a cirurgia gratuita municipal.</p>
                    </div>
                    <Button onClick={() => navigate('/app/filas/castracao')} size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-xs">
                      Inscrever Animal na Fila
                    </Button>
                  </div>
                ) : (
                  castracoes.map((item) => (
                    <div 
                      key={item.id} 
                      className="border rounded-2xl p-5 hover:border-emerald-300 transition-colors bg-white shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 overflow-hidden shrink-0 flex items-center justify-center">
                          {item.pets?.fotos_pet && item.pets.fotos_pet.length > 0 ? (
                            <img src={item.pets.fotos_pet[0].url} alt={item.pets.nome} className="w-full h-full object-cover" />
                          ) : (
                            item.pets?.especie === 'gato' ? <Cat size={24} className="text-emerald-700" /> : <Dog size={24} className="text-emerald-700" />
                          )}
                        </div>

                        <div className="space-y-1">
                          <h3 className="font-extrabold text-lg text-gray-900">{item.pets?.nome || 'Pet'}</h3>
                          <p className="text-xs text-gray-500">
                            {item.pets?.especie === 'gato' ? 'Gato' : 'Cachorro'} • {item.pets?.raca || 'SRD'}
                          </p>
                          <p className="text-xs text-gray-400">
                            Inscrito em: {new Date(item.criado_em).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>

                      {/* Informações de Agendamento ou Posição */}
                      <div className="flex flex-wrap items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                        {item.status === 'pendente' && (
                          <div className="bg-amber-50 border border-amber-200 px-4 py-2 rounded-xl text-center">
                            <span className="block text-2xl font-black text-amber-900">{item.posicao}º</span>
                            <span className="text-[10px] font-extrabold text-amber-700 uppercase tracking-wider">Lugar na Fila</span>
                          </div>
                        )}

                        {item.status === 'agendado' && (
                          <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl text-xs space-y-1 text-blue-950">
                            <div className="flex items-center gap-1 font-bold">
                              <Calendar size={13} className="text-blue-700" />
                              <span>Cirurgia: {new Date(item.data_agendada).toLocaleDateString('pt-BR')} às {new Date(item.data_agendada).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            {item.clinicas_parceiras?.nome && (
                              <div className="flex items-center gap-1 text-gray-600">
                                <MapPin size={12} className="text-blue-600" /> {item.clinicas_parceiras.nome}
                              </div>
                            )}
                          </div>
                        )}

                        <div>
                          {getCastracaoBadge(item.status)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ABA 2: CONSULTAS */}
            {activeTab === 'consulta' && (
              <div className="space-y-4">
                {consultas.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 space-y-3">
                    <Stethoscope className="w-12 h-12 mx-auto text-gray-300" />
                    <div>
                      <p className="font-semibold text-gray-800">Você não possui consultas solicitadas.</p>
                      <p className="text-xs text-gray-400 mt-0.5">Se o seu pet estiver doente ou necessitar de atendimento, agende uma consulta.</p>
                    </div>
                    <Button onClick={() => navigate('/app/filas/consulta')} size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-xs">
                      Agendar Consulta Veterinária
                    </Button>
                  </div>
                ) : (
                  consultas.map((item) => (
                    <div 
                      key={item.id} 
                      className="border rounded-2xl p-5 hover:border-emerald-300 transition-colors bg-white shadow-xs space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 overflow-hidden shrink-0 flex items-center justify-center">
                            {item.pets?.fotos_pet && item.pets.fotos_pet.length > 0 ? (
                              <img src={item.pets.fotos_pet[0].url} alt={item.pets.nome} className="w-full h-full object-cover" />
                            ) : (
                              <Stethoscope size={20} className="text-blue-600" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-extrabold text-base text-gray-900">{item.pets?.nome || 'Pet'}</h3>
                            <p className="text-xs text-gray-500">Solicitado em: {new Date(item.criado_em).toLocaleDateString('pt-BR')}</p>
                          </div>
                        </div>

                        <div>
                          {getConsultaBadge(item.status, item.data_consulta)}
                        </div>
                      </div>

                      {/* Motivo da Consulta */}
                      <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-xs space-y-1">
                        <span className="font-bold text-gray-700 uppercase text-[10px] block">Motivo Informado:</span>
                        <p className="text-gray-800">{item.motivo}</p>
                      </div>

                      {/* Data / Clínica Agendada */}
                      {item.data_consulta && (
                        <div className="bg-emerald-50/70 border border-emerald-200 p-3 rounded-xl text-xs space-y-1 text-emerald-950">
                          <span className="font-bold block">
                            📅 Consulta agendada para: {new Date(item.data_consulta).toLocaleDateString('pt-BR')} às {new Date(item.data_consulta).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {item.clinicas_parceiras?.nome && (
                            <p className="text-emerald-800">
                              📍 Local: {item.clinicas_parceiras.nome} {item.clinicas_parceiras.endereco ? `(${item.clinicas_parceiras.endereco})` : ''}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Prescrição médica se já concluída */}
                      {item.prescricao && (
                        <div className="bg-blue-50/70 border border-blue-200 p-3 rounded-xl text-xs space-y-1 text-blue-950">
                          <span className="font-bold block">💊 Prescrição / Orientações Veterinárias:</span>
                          <p className="text-gray-700 whitespace-pre-wrap">{item.prescricao}</p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
