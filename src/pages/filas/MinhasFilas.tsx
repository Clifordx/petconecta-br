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
  Cat,
  CreditCard,
  AlertTriangle,
  ShieldCheck
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import FichaAutorizacaoModal from '@/components/filas/FichaAutorizacaoModal';
import CarteirinhaDigital from '@/components/pets/CarteirinhaDigital';

export default function MinhasFilas() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, profile } = useAuth();
  const initialTab = searchParams.get('tab') === 'consulta' ? 'consulta' : 'castracao';
  const [activeTab, setActiveTab] = useState<'castracao' | 'consulta'>(initialTab);
  const [loading, setLoading] = useState(true);

  const [castracoes, setCastracoes] = useState<any[]>([]);
  const [consultas, setConsultas] = useState<any[]>([]);

  // Modais de Documentação
  const [fichaModalOpen, setFichaModalOpen] = useState(false);
  const [fichaData, setFichaData] = useState<any>(null);

  const [carteirinhaModalOpen, setCarteirinhaModalOpen] = useState(false);
  const [carteirinhaPet, setCarteirinhaPet] = useState<any>(null);

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
          pets (id, nome, especie, raca, sexo, porte, cor, castrado, microchip, fotos_pet(url)),
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
        return { 
          ...item, 
          posicao,
          pets: Array.isArray(item.pets) ? item.pets[0] : item.pets,
          clinicas_parceiras: Array.isArray(item.clinicas_parceiras) ? item.clinicas_parceiras[0] : item.clinicas_parceiras
        };
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
          pets (id, nome, especie, raca, sexo, porte, cor, castrado, microchip, fotos_pet(url)),
          clinicas_parceiras (nome, endereco, telefone)
        `)
        .eq('tutor_id', user.id)
        .order('criado_em', { ascending: false });

      if (errConsulta) throw errConsulta;

      const consultasFormatadas = (minhasConsultas || []).map(item => ({
        ...item,
        pets: Array.isArray(item.pets) ? item.pets[0] : item.pets,
        clinicas_parceiras: Array.isArray(item.clinicas_parceiras) ? item.clinicas_parceiras[0] : item.clinicas_parceiras
      }));

      setConsultas(consultasFormatadas);

    } catch (error) {
      console.error('Erro ao carregar filas do cidadão:', error);
      toast.error('Erro ao buscar dados das filas.');
    } finally {
      setLoading(false);
    }
  };

  const abrirFicha = (item: any, tipo: 'castracao' | 'consulta') => {
    const petObj = item.pets;
    if (!petObj) {
      toast.error('Dados do animal não encontrados.');
      return;
    }

    setFichaData({
      tipo,
      protocolo: `AUT-${tipo === 'castracao' ? 'CAST' : 'CONS'}-${item.id.replace(/-/g, '').slice(0, 6).toUpperCase()}`,
      dataAgendada: tipo === 'castracao' ? item.data_agendada : item.data_consulta,
      clinicaNome: item.clinicas_parceiras?.nome || 'Clínica Conveniada Municipal',
      clinicaEndereco: item.clinicas_parceiras?.endereco,
      clinicaTelefone: item.clinicas_parceiras?.telefone,
      motivo: item.motivo,
      pet: petObj,
      tutor: {
        nome: profile?.nome || user?.email || 'Tutor',
        cpf: profile?.cpf,
        telefone: profile?.telefone
      }
    });
    setFichaModalOpen(true);
  };

  const abrirCarteirinha = (pet: any) => {
    if (!pet) return;
    setCarteirinhaPet({
      ...pet,
      tutor_nome: profile?.nome || user?.email,
      tutor_telefone: profile?.telefone
    });
    setCarteirinhaModalOpen(true);
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
            variant="outline" 
            size="sm" 
            onClick={carregarMinhasFilas}
            disabled={loading}
            className="text-xs flex items-center gap-1.5"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            Atualizar
          </Button>
          <Button 
            size="sm" 
            onClick={() => navigate('/app/filas/castracao')}
            className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1"
          >
            <Plus size={14} /> Inscrever para Castração
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => navigate('/app/filas/consulta')}
            className="text-xs text-blue-700 border-blue-200 hover:bg-blue-50 flex items-center gap-1"
          >
            <Stethoscope size={14} /> Solicitar Consulta
          </Button>
        </div>
      </div>

      {/* AVISO GERAL DE DOCUMENTAÇÃO OBRIGATÓRIA */}
      <div className="bg-amber-50/80 border border-amber-300/80 rounded-2xl p-4 text-xs text-amber-950 flex items-start gap-3 shadow-xs">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-extrabold text-amber-950 block text-sm">
            Documentação Obrigatória para o Dia do Atendimento
          </span>
          <p className="text-amber-900 leading-relaxed">
            Para garantir a segurança do seu pet e a correta identificação na clínica conveniada, é <strong>obrigatório apresentar</strong> no dia da cirurgia ou consulta:
          </p>
          <ul className="list-disc pl-4 space-y-0.5 text-amber-800 font-medium">
            <li><strong>Carteirinha Digital do Pet:</strong> com o QR Code e RGA Oficial gerado pelo sistema.</li>
            <li><strong>Guia Oficial de Autorização:</strong> baixada no seu celular ou impressa (com o termo e horário).</li>
          </ul>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6 space-y-6">
        
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
                      className="border rounded-2xl p-5 hover:border-emerald-300 transition-colors bg-white shadow-xs space-y-4"
                    >
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
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

                        {/* Posição ou Agendamento */}
                        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
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

                      {/* BARRA DE DOCUMENTAÇÃO OBRIGATÓRIA (CARTEIRINHA + GUIA) */}
                      <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-3 text-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div>
                          <p className="font-bold text-gray-900 flex items-center gap-1.5">
                            <ShieldCheck size={15} className="text-emerald-600" /> Documentos Oficiais para Atendimento:
                          </p>
                          <p className="text-[11px] text-gray-500 mt-0.5">
                            Apresente a Carteirinha com QR Code e a Ficha de Autorização assinada na clínica.
                          </p>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => abrirCarteirinha(item.pets)}
                            className="text-xs flex-1 sm:flex-initial flex items-center justify-center gap-1.5 border-emerald-300 text-emerald-800 hover:bg-emerald-50 bg-white"
                          >
                            <CreditCard size={13} /> Carteirinha do Pet
                          </Button>
                          <Button 
                            size="sm" 
                            onClick={() => abrirFicha(item, 'castracao')}
                            className="text-xs flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                          >
                            <FileText size={13} /> Ficha de Autorização
                          </Button>
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
                      <p className="text-xs text-gray-400 mt-0.5">Se o seu animal estiver com sintomas clínicos, solicite atendimento gratuito.</p>
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

                      {/* BARRA DE DOCUMENTAÇÃO OBRIGATÓRIA DA CONSULTA */}
                      <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-3 text-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div>
                          <p className="font-bold text-gray-900 flex items-center gap-1.5">
                            <ShieldCheck size={15} className="text-emerald-600" /> Documentação Obrigatória:
                          </p>
                          <p className="text-[11px] text-gray-500 mt-0.5">
                            Leve a Carteirinha Digital e a Guia Oficial impressa ou no celular.
                          </p>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => abrirCarteirinha(item.pets)}
                            className="text-xs flex-1 sm:flex-initial flex items-center justify-center gap-1.5 border-emerald-300 text-emerald-800 hover:bg-emerald-50 bg-white"
                          >
                            <CreditCard size={13} /> Carteirinha do Pet
                          </Button>
                          <Button 
                            size="sm" 
                            onClick={() => abrirFicha(item, 'consulta')}
                            className="text-xs flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <FileText size={13} /> Baixar Guia de Consulta
                          </Button>
                        </div>
                      </div>

                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* MODAL DA GUIA OFICIAL DE AUTORIZAÇÃO */}
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
          onAbrirCarteirinha={() => {
            setFichaModalOpen(false);
            abrirCarteirinha(fichaData.pet);
          }}
        />
      )}

      {/* MODAL DA CARTEIRINHA DIGITAL */}
      {carteirinhaModalOpen && carteirinhaPet && (
        <CarteirinhaDigital
          isOpen={carteirinhaModalOpen}
          onClose={() => setCarteirinhaModalOpen(false)}
          pet={carteirinhaPet}
        />
      )}

    </div>
  );
}
