import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  fetchClinicasParceiras, 
  isUsuarioClinica, 
  getClinicaIdDoUsuario, 
  ClinicaParceira 
} from '@/lib/clinicas';
import { 
  Building2, 
  Search, 
  QrCode, 
  Camera, 
  CameraOff, 
  Stethoscope, 
  Scissors, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  DollarSign, 
  FileText, 
  Printer, 
  Download, 
  User, 
  Phone, 
  Dog, 
  Cat, 
  HeartPulse, 
  Pill, 
  ShieldCheck, 
  MessageCircle,
  ExternalLink,
  ChevronRight,
  Filter,
  Check,
  RefreshCw,
  Syringe
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { toast } from 'sonner';
import ReceitaAltaModal, { ReceitaAltaProps } from '@/components/clinica/ReceitaAltaModal';
import CarteiraVacinacaoModal from '@/components/pets/CarteiraVacinacaoModal';
import { openWhatsApp1Click, dispararWhatsApp, buildAltaMedicaMessage } from '@/lib/whatsapp';

export default function AtendimentoClinico() {
  const [searchParams, setSearchParams] = useSearchParams();
  const paramClinicaId = searchParams.get('clinicaId');
  const { profile } = useAuth();

  const isClinica = isUsuarioClinica(profile);
  const isAdmin = !profile || profile.tipo_perfil === 'admin_prefeitura' || profile.tipo_perfil === 'super_admin';

  const [activeTab, setActiveTab] = useState<'checkin' | 'em_atendimento' | 'faturamento'>('checkin');
  const [clinicas, setClinicas] = useState<any[]>([]);
  const [selectedClinicaId, setSelectedClinicaId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Dados
  const [agendamentosCastracao, setAgendamentosCastracao] = useState<any[]>([]);
  const [agendamentosConsultas, setAgendamentosConsultas] = useState<any[]>([]);
  const [atendidosMes, setAtendidosMes] = useState<any[]>([]);

  // Filtros e busca
  const clinicaAtual = clinicas.find(c => c.id === selectedClinicaId);
  const [searchQuery, setSearchQuery] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'castracao' | 'consulta'>('todos');
  const [mesFaturamento, setMesFaturamento] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  // Tabela de Preços Convênio Municipal (Arapongas / PR)
  const [tabelaPrecos, setTabelaPrecos] = useState({
    castracaoCao: 130,
    castracaoGato: 90,
    consulta: 60
  });

  // Scanner de Câmera
  const [scannerOpen, setScannerOpen] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Modal de Check-in
  const [modalCheckinOpen, setModalCheckinOpen] = useState(false);
  const [itemCheckin, setItemCheckin] = useState<any>(null);
  const [pesoEntrada, setPesoEntrada] = useState('');
  const [temperaturaEntrada, setTemperaturaEntrada] = useState('');
  const [jejumConfirmado, setJejumConfirmado] = useState(true);
  const [carteirinhaApresentada, setCarteirinhaApresentada] = useState(true);
  const [obsEntrada, setObsEntrada] = useState('');
  const [submittingCheckin, setSubmittingCheckin] = useState(false);

  // Modal de Prontuário / Conclusão de Atendimento
  const [modalConclusaoOpen, setModalConclusaoOpen] = useState(false);
  const [itemConclusao, setItemConclusao] = useState<any>(null);
  const [veterinarioNome, setVeterinarioNome] = useState('');
  const [veterinarioCrmv, setVeterinarioCrmv] = useState('');
  const [protocoloAnestesico, setProtocoloAnestesico] = useState('Inalatória (Isoflurano) + Indução');
  const [prescricaoMedicamentos, setPrescricaoMedicamentos] = useState('');
  const [orientacoesPos, setOrientacoesPos] = useState('');
  const [retornoPontos, setRetornoPontos] = useState('10 dias');
  const [submittingConclusao, setSubmittingConclusao] = useState(false);

  // Modal de Termo de Alta / Receita Impressa
  const [receitaModalOpen, setReceitaModalOpen] = useState(false);
  const [receitaData, setReceitaData] = useState<ReceitaAltaProps | null>(null);

  // Modal de Carteira de Vacinação
  const [vacinasModalOpen, setVacinasModalOpen] = useState(false);
  const [petParaVacinas, setPetParaVacinas] = useState<any>(null);

  const abrirCarteiraVacinas = (item: any) => {
    setPetParaVacinas({
      pet: {
        id: item.pets?.id || item.pet_id,
        nome: item.pets?.nome || 'Pet',
        especie: item.pets?.especie || 'cão',
        raca: item.pets?.raca,
        porte: item.pets?.porte,
        sexo: item.pets?.sexo,
        rga: item.pets?.rga || `PR-ARA-2026-${(item.pets?.id || item.pet_id).replace(/-/g, '').slice(0, 5).toUpperCase()}`,
        microchip: item.pets?.microchip,
        vacinado: item.pets?.vacinado,
        castrado: item.pets?.castrado,
        tutor_id: item.tutor_id
      },
      tutor: {
        nome: item.perfis?.nome || 'Tutor',
        telefone: item.perfis?.telefone,
        cpf: item.perfis?.cpf,
        endereco: item.perfis?.endereco
      }
    });
    setVacinasModalOpen(true);
  };

  useEffect(() => {
    fetchClinicas();
  }, []);

  useEffect(() => {
    if (selectedClinicaId) {
      fetchAtendimentos();
    }
  }, [selectedClinicaId, mesFaturamento]);

  const fetchClinicas = async () => {
    try {
      setLoading(true);
      const lista = await fetchClinicasParceiras();
      setClinicas(lista || []);

      if (isClinica) {
        // Se for perfil de clínica/veterinário, TRAVA na clínica dele
        const meuClinicaId = getClinicaIdDoUsuario(profile, lista) || lista[0]?.id;
        setSelectedClinicaId(meuClinicaId || '');
      } else {
        // Se for o Admin Geral do sistema
        if (paramClinicaId && lista.some(c => c.id === paramClinicaId)) {
          setSelectedClinicaId(paramClinicaId);
        } else if (!selectedClinicaId) {
          setSelectedClinicaId('todas'); // Por padrão o Admin vê todas as clínicas consolidadas
        }
      }
    } catch (error) {
      console.error('Erro ao buscar clínicas:', error);
      toast.error('Erro ao carregar lista de clínicas');
    } finally {
      setLoading(false);
    }
  };

  const fetchAtendimentos = async () => {
    if (!selectedClinicaId) return;
    try {
      setLoading(true);

      // 1. Castrações
      let queryCastracoes = supabase
        .from('filas_castracao')
        .select(`
          *,
          pets (id, nome, especie, raca, sexo, porte, castrado, microchip, fotos_pet(url)),
          perfis:tutor_id (nome, telefone, cpf, endereco, cidade),
          clinicas_parceiras:clinica_id (id, nome, endereco, telefone, crmv, veterinario_responsavel, cnpj)
        `)
        .order('data_agendada', { ascending: true });

      if (selectedClinicaId !== 'todas') {
        queryCastracoes = queryCastracoes.eq('clinica_id', selectedClinicaId);
      }

      const { data: castracoes, error: errCastracoes } = await queryCastracoes;
      if (errCastracoes) throw errCastracoes;

      // 2. Consultas
      let queryConsultas = supabase
        .from('consultas')
        .select(`
          *,
          pets (id, nome, especie, raca, sexo, porte, castrado, microchip, fotos_pet(url)),
          perfis:tutor_id (nome, telefone, cpf, endereco, cidade),
          clinicas_parceiras:clinica_id (id, nome, endereco, telefone, crmv, veterinario_responsavel, cnpj)
        `)
        .order('data_consulta', { ascending: true });

      if (selectedClinicaId !== 'todas') {
        queryConsultas = queryConsultas.eq('clinica_id', selectedClinicaId);
      }

      const { data: consultas, error: errConsultas } = await queryConsultas;
      if (errConsultas) throw errConsultas;

      const normCastracoes = (castracoes || []).map(c => ({
        ...c,
        tipoAtendimento: 'castracao',
        dataReferencia: c.data_agendada || c.criado_em,
        protocoloGuia: `AUT-CAST-${c.id.replace(/-/g, '').slice(0, 6).toUpperCase()}`
      }));

      const normConsultas = (consultas || []).map(c => ({
        ...c,
        tipoAtendimento: 'consulta',
        dataReferencia: c.data_consulta || c.criado_em,
        protocoloGuia: `AUT-CONS-${c.id.replace(/-/g, '').slice(0, 6).toUpperCase()}`
      }));

      setAgendamentosCastracao(normCastracoes);
      setAgendamentosConsultas(normConsultas);

    } catch (error) {
      console.error('Erro ao buscar atendimentos da clínica:', error);
      toast.error('Erro ao atualizar agendamentos da clínica');
    } finally {
      setLoading(false);
    }
  };

  const selectedClinica = clinicas.find(c => c.id === selectedClinicaId);

  // Inicializa valores padrão do veterinário da clínica selecionada
  useEffect(() => {
    if (selectedClinica) {
      setVeterinarioNome(selectedClinica.veterinario_responsavel || '');
      setVeterinarioCrmv(selectedClinica.crmv || '');
    }
  }, [selectedClinica]);

  // Lista unificada de atendimentos
  const todosAtendimentos = [...agendamentosCastracao, ...agendamentosConsultas];

  // Filtra itens para a aba de Check-in (Aguardando ou Agendados)
  const itensParaCheckin = todosAtendimentos.filter(item => {
    const isPendenteOuAgendado = item.status === 'agendado' || item.status === 'pendente' || item.status === 'solicitada';
    if (!isPendenteOuAgendado) return false;

    if (filtroTipo === 'castracao' && item.tipoAtendimento !== 'castracao') return false;
    if (filtroTipo === 'consulta' && item.tipoAtendimento !== 'consulta') return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase().trim();
      const matchPet = item.pets?.nome?.toLowerCase().includes(q);
      const matchTutor = item.perfis?.nome?.toLowerCase().includes(q) || item.perfis?.cpf?.includes(q);
      const matchProto = item.protocoloGuia?.toLowerCase().includes(q);
      const matchRga = item.pets?.id?.replace(/-/g, '').toLowerCase().includes(q);
      return matchPet || matchTutor || matchProto || matchRga;
    }
    return true;
  });

  // Filtra itens para a aba "Em Atendimento / Sala Cirúrgica"
  const itensEmAtendimento = todosAtendimentos.filter(item => {
    return item.status === 'em_andamento';
  });

  // Filtra itens para a aba de Faturamento (Concluídos no mês selecionado)
  const itensFaturadosNoMes = todosAtendimentos.filter(item => {
    const isConcluido = item.status === 'concluido' || item.status === 'realizada';
    if (!isConcluido) return false;

    const dataItem = item.dataReferencia || item.atualizado_em || item.criado_em;
    if (!dataItem) return false;

    const anoMes = dataItem.slice(0, 7);
    return anoMes === mesFaturamento;
  });

  // Cálculos de faturamento
  const qtdCastracoesCaes = itensFaturadosNoMes.filter(i => i.tipoAtendimento === 'castracao' && i.pets?.especie !== 'gato').length;
  const qtdCastracoesGatos = itensFaturadosNoMes.filter(i => i.tipoAtendimento === 'castracao' && i.pets?.especie === 'gato').length;
  const qtdConsultas = itensFaturadosNoMes.filter(i => i.tipoAtendimento === 'consulta').length;

  const totalFaturamento = 
    (qtdCastracoesCaes * tabelaPrecos.castracaoCao) +
    (qtdCastracoesGatos * tabelaPrecos.castracaoGato) +
    (qtdConsultas * tabelaPrecos.consulta);

  // Abertura do Modal de Check-in
  const abrirCheckin = (item: any) => {
    setItemCheckin(item);
    setPesoEntrada('');
    setTemperaturaEntrada('38.5');
    setJejumConfirmado(item.tipoAtendimento === 'castracao');
    setCarteirinhaApresentada(true);
    setObsEntrada('');
    setModalCheckinOpen(true);
  };

  const handleConfirmarCheckin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemCheckin) return;

    if (itemCheckin.tipoAtendimento === 'castracao' && !jejumConfirmado) {
      if (!window.confirm('Atenção: O tutor informou que o animal NÃO cumpriu o jejum de 8h. Procedimentos cirúrgicos sem jejum têm alto risco anestésico. Deseja prosseguir mesmo assim?')) {
        return;
      }
    }

    setSubmittingCheckin(true);
    try {
      const tabela = itemCheckin.tipoAtendimento === 'castracao' ? 'filas_castracao' : 'consultas';
      
      const payload: any = {
        status: 'em_andamento'
      };

      if (obsEntrada) {
        payload.observacoes = itemCheckin.observacoes 
          ? `${itemCheckin.observacoes} | Check-in: ${obsEntrada} (Peso: ${pesoEntrada || 'N/A'}kg, Temp: ${temperaturaEntrada || 'N/A'}°C)` 
          : `Check-in: ${obsEntrada} (Peso: ${pesoEntrada || 'N/A'}kg, Temp: ${temperaturaEntrada || 'N/A'}°C)`;
      }

      const { error } = await supabase
        .from(tabela)
        .update(payload)
        .eq('id', itemCheckin.id);

      if (error) throw error;

      toast.success(`Check-in realizado com sucesso! Paciente ${itemCheckin.pets?.nome} está em atendimento.`);
      setModalCheckinOpen(false);
      fetchAtendimentos();
      setActiveTab('em_atendimento');
    } catch (error: any) {
      console.error('Erro no check-in:', error);
      toast.error('Erro ao realizar check-in: ' + error.message);
    } finally {
      setSubmittingCheckin(false);
    }
  };

  // Conclusão do Atendimento / Cirurgia
  const abrirConclusao = (item: any) => {
    setItemConclusao(item);
    setVeterinarioNome(selectedClinica?.veterinario_responsavel || '');
    setVeterinarioCrmv(selectedClinica?.crmv || '');
    setProtocoloAnestesico(item.tipoAtendimento === 'castracao' ? 'Inalatória com Isoflurano + Indução TIVA' : 'Exame Clínico Ambulatorial');
    
    if (item.tipoAtendimento === 'castracao') {
      setPrescricaoMedicamentos(
        `1. Meloxicam 0,1 mg/kg - 1x ao dia por 4 dias (anti-inflamatório e analgésico);\n` +
        `2. Dipirona gotas (25 mg/kg) - a cada 8 horas se apresentar dor por 3 dias;\n` +
        `3. Enrofloxacino ou Cefalexina conforme peso corporal por 7 dias;\n` +
        `4. Pomada cicatrizante / Rifocina spray sobre a sutura cirúrgica 2x ao dia.`
      );
      setOrientacoesPos(
        `Repouso estrito por 10 dias. Proibido correr, saltar ou brincar bruscamente.\n` +
        `Uso OBRIGATÓRIO de colar elizabetano ou roupa cirúrgica protetora para evitar lamber os pontos.\n` +
        `Manter o local limpo e seco. Em caso de inchaço, secreção ou febre, contatar a clínica imediatamente.`
      );
      setRetornoPontos('10 dias para retirada de pontos');
    } else {
      setPrescricaoMedicamentos(item.prescricao || 'Tratamento clínico prescrito em consulta.');
      setOrientacoesPos('Retornar se houver piora dos sintomas.');
      setRetornoPontos('Conforme evolução');
    }

    setModalConclusaoOpen(true);
  };

  const handleFinalizarAtendimento = async (e: React.FormEvent, abrirReceitaImediata = true) => {
    e.preventDefault();
    if (!itemConclusao) return;

    setSubmittingConclusao(true);
    try {
      const isCastracao = itemConclusao.tipoAtendimento === 'castracao';
      const tabela = isCastracao ? 'filas_castracao' : 'consultas';
      const novoStatus = isCastracao ? 'concluido' : 'realizada';

      // 1. Atualiza registro na fila ou consulta
      const updatePayload: any = {
        status: novoStatus
      };

      if (!isCastracao) {
        updatePayload.diagnostico = protocoloAnestesico;
        updatePayload.prescricao = prescricaoMedicamentos;
      }

      const { error: errUpdate } = await supabase
        .from(tabela)
        .update(updatePayload)
        .eq('id', itemConclusao.id);

      if (errUpdate) throw errUpdate;

      // 2. Se for castração, atualiza o animal para castrado: true no banco de dados
      if (isCastracao && itemConclusao.pet_id) {
        await supabase
          .from('pets')
          .update({ castrado: true })
          .eq('id', itemConclusao.pet_id);
      }

      toast.success(`Procedimento de ${itemConclusao.pets?.nome} finalizado com sucesso!`);

      // Prepara dados para a receita/alta médica
      const altaProps: ReceitaAltaProps = {
        isOpen: true,
        onClose: () => setReceitaModalOpen(false),
        clinica: {
          nome: selectedClinica?.nome || 'Clínica Conveniada',
          cnpj: selectedClinica?.cnpj,
          endereco: selectedClinica?.endereco,
          telefone: selectedClinica?.telefone,
          crmv: veterinarioCrmv,
          veterinario_responsavel: veterinarioNome
        },
        pet: {
          id: itemConclusao.pets?.id || itemConclusao.pet_id,
          nome: itemConclusao.pets?.nome || 'Animal',
          especie: itemConclusao.pets?.especie || 'cão',
          raca: itemConclusao.pets?.raca,
          sexo: itemConclusao.pets?.sexo,
          porte: itemConclusao.pets?.porte,
          rga: itemConclusao.pets?.rga
        },
        tutor: {
          nome: itemConclusao.perfis?.nome || 'Tutor',
          cpf: itemConclusao.perfis?.cpf,
          telefone: itemConclusao.perfis?.telefone,
          endereco: itemConclusao.perfis?.endereco
        },
        atendimento: {
          tipo: itemConclusao.tipoAtendimento,
          dataAtendimento: new Date().toISOString(),
          veterinarioNome,
          veterinarioCrmv,
          anestesia: protocoloAnestesico,
          prescricao: prescricaoMedicamentos,
          orientacoes: orientacoesPos,
          retornoPontos
        }
      };

      setModalConclusaoOpen(false);
      fetchAtendimentos();

      if (abrirReceitaImediata) {
        setReceitaData(altaProps);
        setReceitaModalOpen(true);
      }
    } catch (error: any) {
      console.error('Erro ao finalizar atendimento:', error);
      toast.error('Erro ao finalizar atendimento: ' + error.message);
    } finally {
      setSubmittingConclusao(false);
    }
  };

  // Notificar tutor via WhatsApp sobre alta do animal
  const notificarAltaWhatsApp = async (item: any) => {
    const tel = item.perfis?.telefone;
    if (!tel) {
      toast.warning('Tutor sem telefone cadastrado.');
      return;
    }

    const msg = buildAltaMedicaMessage({
      tutorNome: item.perfis?.nome || 'Tutor(a)',
      petNome: item.pets?.nome || 'Animal',
      clinicaNome: selectedClinica?.nome || 'Conveniada Municipal',
      clinicaEndereco: selectedClinica?.endereco,
      procedimento: item.tipoAtendimento === 'castracao' ? 'Cirurgia de Castração' : 'Consulta e Tratamento Clínico'
    });

    const res = await dispararWhatsApp({
      telefone: tel,
      tipo: 'alta',
      destinatarioNome: item.perfis?.nome,
      mensagem: msg,
      metadata: { protocolo: item.protocoloGuia }
    });

    if (res.sucesso) {
      if (res.modo === 'manual') {
        toast.info('Mensagem preparada e WhatsApp aberto para envio!');
      } else {
        toast.success('Notificação de alta enviada automaticamente via robô de WhatsApp!');
      }
    } else {
      toast.error(res.erro || 'Erro ao notificar tutor via WhatsApp.');
    }
  };

  // Câmera / Leitor de QR Code
  const startCamera = async () => {
    try {
      setScannerOpen(true);
      setCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Erro ao acessar câmera:', err);
      toast.error('Não foi possível acessar a câmera. Você pode buscar o pet digitando o nome ou protocolo.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
    setScannerOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* CABEÇALHO DA PÁGINA */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4" />
            <span>Portal do Médico Veterinário & Clínica Credenciada</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Atendimento Clínico & Check-in Rápido
          </h1>
          <p className="text-sm text-slate-500">
            Recepção de pacientes com QR Code, prontuário cirúrgico e faturamento do convênio municipal.
          </p>
        </div>

        {/* SELETOR / IDENTIFICADOR DE CLÍNICA */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          {isClinica ? (
            /* VISÃO DA CLÍNICA (LOCKED - APENAS A SUA PRÓPRIA UNIDADE) */
            <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl px-4 py-2.5 flex items-center gap-3 shadow-xs">
              <div className="p-2 bg-emerald-600 text-white rounded-xl flex-shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-sm">
                    Sua Unidade Credenciada
                  </span>
                  <span className="text-[11px] font-bold text-emerald-700">Acesso Restrito</span>
                </div>
                <h3 className="text-sm font-black text-slate-900 mt-0.5">
                  {selectedClinica?.nome || 'Minha Clínica'}
                </h3>
                <span className="text-[11px] text-slate-500">
                  {selectedClinica?.veterinario_responsavel ? `Resp: ${selectedClinica.veterinario_responsavel}` : ''} {selectedClinica?.crmv ? `• ${selectedClinica.crmv}` : ''}
                </span>
              </div>
            </div>
          ) : (
            /* VISÃO DO ADMINISTRADOR GERAL (SUPER ADMIN / ADMIN PREFEITURA) */
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl px-4 py-2 flex items-center gap-3">
              <Building2 className="w-5 h-5 text-emerald-700 shrink-0" />
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-800 block">
                  Filtrar por Clínica (Visão do Administrador Geral)
                </span>
                <select
                  value={selectedClinicaId}
                  onChange={(e) => setSelectedClinicaId(e.target.value)}
                  className="bg-transparent font-extrabold text-slate-900 text-sm focus:outline-hidden cursor-pointer"
                >
                  <option value="todas">🌟 Todas as Clínicas (Visão Geral da Prefeitura)</option>
                  {clinicas.map((c) => (
                    <option key={c.id} value={c.id}>
                      🏥 {c.nome} {c.crmv ? `(${c.crmv})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={fetchAtendimentos}
            className="flex items-center gap-1.5 border-slate-300 text-slate-700 hover:bg-slate-100"
            title="Atualizar lista"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Atualizar</span>
          </Button>
        </div>
      </div>

      {/* NAVEGAÇÃO POR ABAS */}
      <div className="flex border-b border-slate-200 gap-2 sm:gap-6 text-sm font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab('checkin')}
          className={`pb-3 px-2 flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'checkin'
              ? 'border-emerald-600 text-emerald-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <QrCode size={18} />
          <span>Check-in & Recepção</span>
          <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-emerald-100 text-emerald-800 font-bold">
            {itensParaCheckin.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('em_atendimento')}
          className={`pb-3 px-2 flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'em_atendimento'
              ? 'border-emerald-600 text-emerald-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <HeartPulse size={18} />
          <span>Em Sala Cirúrgica / Consulta</span>
          {itensEmAtendimento.length > 0 && (
            <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-amber-100 text-amber-800 font-bold animate-pulse">
              {itensEmAtendimento.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('faturamento')}
          className={`pb-3 px-2 flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'faturamento'
              ? 'border-emerald-600 text-emerald-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <DollarSign size={18} />
          <span>Faturamento & Convênio Municipal</span>
          <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-700">
            {itensFaturadosNoMes.length}
          </span>
        </button>
      </div>

      {/* CONTEÚDO DA ABA 1: CHECK-IN & RECEPÇÃO */}
      {activeTab === 'checkin' && (
        <div className="space-y-6">
          {/* BARRA DE BUSCA E SCANNER QR CODE */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por Protocolo (AUT-...), Nome do Pet ou Tutor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
              <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setFiltroTipo('todos')}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${filtroTipo === 'todos' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600'}`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setFiltroTipo('castracao')}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${filtroTipo === 'castracao' ? 'bg-white text-emerald-700 shadow-2xs font-bold' : 'text-slate-600'}`}
                >
                  Castrações
                </button>
                <button
                  onClick={() => setFiltroTipo('consulta')}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${filtroTipo === 'consulta' ? 'bg-white text-blue-700 shadow-2xs font-bold' : 'text-slate-600'}`}
                >
                  Consultas
                </button>
              </div>

              <Button
                onClick={startCamera}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs flex items-center gap-1.5 shrink-0"
              >
                <Camera size={15} />
                <span>Escanear QR Code</span>
              </Button>
            </div>
          </div>

          {/* LISTA DE PACIENTES PARA CHECK-IN */}
          {loading ? (
            <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-600 mb-2" />
              Carregando agendamentos da clínica...
            </div>
          ) : itensParaCheckin.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 space-y-3">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="font-extrabold text-slate-800 text-base">Nenhum paciente aguardando entrada</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Todos os animais agendados para esta clínica já deram entrada ou foram atendidos.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {itensParaCheckin.map((item) => {
                const fotoUrl = item.pets?.fotos_pet?.[0]?.url || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=200';
                const isCastracao = item.tipoAtendimento === 'castracao';

                return (
                  <div 
                    key={item.id} 
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-emerald-300 transition-all space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      {/* Topo do Card */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img 
                            src={fotoUrl} 
                            alt={item.pets?.nome} 
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                          />
                          <div>
                            <span className="font-black text-slate-900 text-base block">{item.pets?.nome}</span>
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                              {item.pets?.especie === 'gato' ? <Cat size={12} /> : <Dog size={12} />}
                              <span className="capitalize">{item.pets?.especie}</span> • {item.pets?.raca || 'SRD'}
                            </span>
                          </div>
                        </div>

                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider ${
                          isCastracao ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {isCastracao ? 'Castração' : 'Consulta'}
                        </span>
                      </div>

                      {/* Informações de Agendamento */}
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1">
                        <div className="flex items-center gap-1 text-slate-700 font-bold">
                          <Calendar size={13} className="text-emerald-600" />
                          <span>
                            {item.dataReferencia 
                              ? `${new Date(item.dataReferencia).toLocaleDateString('pt-BR')} às ${new Date(item.dataReferencia).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
                              : 'Data a definir'}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          Protocolo: <strong className="text-slate-800">{item.protocoloGuia}</strong>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Tutor: <strong className="text-slate-800">{item.perfis?.nome || 'Não informado'}</strong>
                          {item.perfis?.telefone && ` • ${item.perfis.telefone}`}
                        </div>
                      </div>

                      {isCastracao && (
                        <div className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200 flex items-center gap-1.5 font-medium">
                          <AlertTriangle size={13} className="text-amber-600 shrink-0" />
                          <span>Requer jejum de 8h de água e sólidos.</span>
                        </div>
                      )}
                    </div>

                    {/* Botões de Ação */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => abrirCarteiraVacinas(item)}
                        className="text-xs flex items-center gap-1 border-slate-300 text-slate-700 hover:bg-slate-100 py-2 px-3 rounded-xl shrink-0"
                        title="Ver ou registrar vacinas na Caderneta Oficial"
                      >
                        <Syringe size={14} className="text-emerald-600" />
                        <span className="hidden sm:inline">Vacinas</span>
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => abrirCheckin(item)}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 py-2.5 rounded-xl shadow-xs"
                      >
                        <CheckCircle2 size={15} />
                        <span>Realizar Check-in</span>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* CONTEÚDO DA ABA 2: EM ATENDIMENTO / SALA CIRÚRGICA */}
      {activeTab === 'em_atendimento' && (
        <div className="space-y-6">
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2">
              <HeartPulse className="w-5 h-5 text-amber-700 shrink-0" />
              <div>
                <h4 className="font-bold text-amber-950">Pacientes em Atendimento Clínico ou Procedimento</h4>
                <p className="text-amber-800">Após a cirurgia ou consulta, clique em "Concluir & Prescrever Alta" para emitir o termo e liberar o pet.</p>
              </div>
            </div>
          </div>

          {itensEmAtendimento.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 space-y-3">
              <Stethoscope className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-extrabold text-slate-800">Nenhum animal em procedimento no momento</h3>
              <p className="text-xs text-slate-400">Faça o check-in de pacientes na recepção para que apareçam aqui.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {itensEmAtendimento.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl border border-emerald-200 p-5 shadow-xs space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center font-black text-emerald-700">
                        {item.pets?.especie === 'gato' ? <Cat size={24} /> : <Dog size={24} />}
                      </div>
                      <div>
                        <span className="font-black text-slate-900 text-lg block">{item.pets?.nome}</span>
                        <span className="text-xs text-slate-500">
                          {item.pets?.especie === 'gato' ? 'Gato' : 'Cachorro'} • {item.pets?.raca || 'SRD'} • Sexo: {item.pets?.sexo || 'N/I'}
                        </span>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1 animate-pulse">
                      <HeartPulse size={12} />
                      Em Atendimento
                    </span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border text-xs space-y-1">
                    <div><strong>Tutor:</strong> {item.perfis?.nome} ({item.perfis?.telefone || 'Sem tel'})</div>
                    <div><strong>Protocolo:</strong> <span className="font-mono">{item.protocoloGuia}</span></div>
                    {item.observacoes && <div><strong>Anotações Triagem:</strong> {item.observacoes}</div>}
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => abrirCarteiraVacinas(item)}
                      className="text-xs flex items-center gap-1.5 border-slate-300 text-slate-700 hover:bg-slate-100"
                    >
                      <Syringe size={14} className="text-emerald-600" />
                      <span>Caderneta de Vacinas</span>
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => abrirConclusao(item)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5"
                    >
                      <Stethoscope size={15} />
                      <span>Concluir & Prescrever Alta</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CONTEÚDO DA ABA 3: FATURAMENTO & PRESTAÇÃO DE CONTAS */}
      {activeTab === 'faturamento' && (
        <div className="space-y-6">
          {/* BARRA DE CONTROLE DE MÊS */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] uppercase font-bold text-slate-500 block">Competência de Faturamento</span>
              <div className="flex items-center gap-3 mt-1">
                <input
                  type="month"
                  value={mesFaturamento}
                  onChange={(e) => setMesFaturamento(e.target.value)}
                  className="border rounded-xl px-3 py-2 text-sm font-bold bg-slate-50 text-slate-900 focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-xs text-slate-500">
                  Total de <strong>{itensFaturadosNoMes.length}</strong> procedimentos realizados.
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                className="text-xs flex items-center gap-1.5 border-slate-300"
              >
                <Printer size={14} /> Imprimir Boletim (A4)
              </Button>
            </div>
          </div>

          {/* CARDS DE TOTALIZAÇÃO FINANCEIRA DO CONVÊNIO */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase">Castrações Caninas</span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-slate-900">{qtdCastracoesCaes}</span>
                <span className="text-xs font-semibold text-emerald-700">R$ {tabelaPrecos.castracaoCao},00 un</span>
              </div>
              <p className="text-xs text-slate-400">Total: R$ {(qtdCastracoesCaes * tabelaPrecos.castracaoCao).toLocaleString('pt-BR')},00</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase">Castrações Felinas</span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-slate-900">{qtdCastracoesGatos}</span>
                <span className="text-xs font-semibold text-emerald-700">R$ {tabelaPrecos.castracaoGato},00 un</span>
              </div>
              <p className="text-xs text-slate-400">Total: R$ {(qtdCastracoesGatos * tabelaPrecos.castracaoGato).toLocaleString('pt-BR')},00</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase">Consultas Veterinárias</span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-slate-900">{qtdConsultas}</span>
                <span className="text-xs font-semibold text-blue-700">R$ {tabelaPrecos.consulta},00 un</span>
              </div>
              <p className="text-xs text-slate-400">Total: R$ {(qtdConsultas * tabelaPrecos.consulta).toLocaleString('pt-BR')},00</p>
            </div>

            <div className="bg-emerald-600 text-white p-5 rounded-2xl shadow-sm space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-100">Total a Empenhar</span>
              <div className="text-2xl font-black">
                R$ {totalFaturamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-emerald-100">Repasse Municipal Prefeitura</p>
            </div>
          </div>
          {/* CABEÇALHO OFICIAL DE IMPRESSÃO A4 (Aparece ao imprimir o Boletim) */}
          <div className="hidden print:block border-b-2 border-slate-900 pb-4 mb-4">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-lg font-black text-slate-900 uppercase tracking-wide">
                  Prefeitura Municipal de Arapongas - Estado do Paraná
                </h1>
                <p className="text-xs text-slate-600 font-bold">
                  Secretaria Municipal de Meio Ambiente e Bem-Estar Animal
                </p>
                <p className="text-xs text-slate-800 font-extrabold mt-1">
                  Boletim Oficial de Produção Ambulatorial & Faturamento do Convênio Clínico
                </p>
              </div>
              <div className="text-right text-xs">
                <p className="font-bold text-slate-900">{clinicaAtual?.nome || 'Clínica Credenciada'}</p>
                <p className="text-slate-600">{clinicaAtual?.cnpj ? `CNPJ: ${clinicaAtual.cnpj}` : ''}</p>
                <p className="text-slate-700 font-bold mt-1">Competência: {mesFaturamento}</p>
              </div>
            </div>
          </div>


          {/* TABELA DE PRESTAÇÃO DE CONTAS / BOLETIM */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 text-sm">
                Boletim Detalhado de Produção Ambulatorial / Convênio
              </h3>
              <span className="text-xs text-slate-500">Competência: {mesFaturamento}</span>
            </div>

            {itensFaturadosNoMes.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs">
                Nenhum procedimento concluído nesta competência.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] border-b">
                    <tr>
                      <th className="p-3.5">Data</th>
                      <th className="p-3.5">Protocolo Guia</th>
                      <th className="p-3.5">Paciente (Pet)</th>
                      <th className="p-3.5">Tutor Responsável</th>
                      <th className="p-3.5">Procedimento</th>
                      <th className="p-3.5 text-right">Valor Convênio</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {itensFaturadosNoMes.map((item) => {
                      const isGato = item.pets?.especie === 'gato';
                      const isCastracao = item.tipoAtendimento === 'castracao';
                      const valor = isCastracao 
                        ? (isGato ? tabelaPrecos.castracaoGato : tabelaPrecos.castracaoCao)
                        : tabelaPrecos.consulta;

                      return (
                        <tr key={item.id} className="hover:bg-slate-50/80">
                          <td className="p-3.5 font-medium">
                            {new Date(item.dataReferencia).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="p-3.5 font-mono font-bold text-slate-800">
                            {item.protocoloGuia}
                          </td>
                          <td className="p-3.5">
                            <span className="font-bold text-slate-900 block">{item.pets?.nome}</span>
                            <span className="text-[11px] text-slate-400 capitalize">{item.pets?.especie} • {item.pets?.raca || 'SRD'}</span>
                          </td>
                          <td className="p-3.5">
                            <span className="font-medium text-slate-800 block">{item.perfis?.nome || 'Tutor'}</span>
                            <span className="text-[10px] text-slate-400">CPF: {item.perfis?.cpf || 'Cadastrado'}</span>
                          </td>
                          <td className="p-3.5">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              isCastracao ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {isCastracao ? (isGato ? 'Castração Felina' : 'Castração Canina') : 'Consulta Clínica'}
                            </span>
                          </td>
                          <td className="p-3.5 text-right font-black text-slate-900">
                            R$ {valor.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-slate-50 font-black border-t-2 border-slate-300 text-slate-900">
                    <tr>
                      <td colSpan={5} className="p-4 text-right uppercase text-xs">Total do Faturamento:</td>
                      <td className="p-4 text-right text-emerald-700 text-sm">
                        R$ {totalFaturamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
          {/* ASSINATURAS DO BOLETIM OFICIAL (Aparece na Impressão A4) */}
          <div className="hidden print:flex pt-12 mt-8 justify-between items-center text-center text-xs text-slate-700">
            <div>
              <div className="border-b border-slate-900 w-64 mb-1"></div>
              <p className="font-bold">{clinicaAtual?.veterinario_responsavel || 'Responsável Técnico da Clínica'}</p>
              <p className="text-[11px] text-slate-500">{clinicaAtual?.crmv || 'CRMV-PR'}</p>
            </div>
            <div>
              <div className="border-b border-slate-900 w-64 mb-1"></div>
              <p className="font-bold">Fiscal do Convênio Municipal</p>
              <p className="text-[11px] text-slate-500">Secretaria de Meio Ambiente / Prefeitura de Arapongas</p>
            </div>
          </div>

        </div>
      )}

      {/* MODAL 1: CHECK-IN / TRIAGEM NA RECEPÇÃO */}
      {itemCheckin && (
        <Modal
          isOpen={modalCheckinOpen}
          onClose={() => setModalCheckinOpen(false)}
          title={`Check-in: ${itemCheckin.pets?.nome}`}
        >
          <form onSubmit={handleConfirmarCheckin} className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-xl border text-xs space-y-2">
              <div className="flex justify-between">
                <span><strong>Paciente:</strong> {itemCheckin.pets?.nome} ({itemCheckin.pets?.especie})</span>
                <span className="font-mono text-emerald-700 font-bold">{itemCheckin.protocoloGuia}</span>
              </div>
              <div><strong>Tutor:</strong> {itemCheckin.perfis?.nome} ({itemCheckin.perfis?.telefone || 'Sem tel'})</div>
              <div><strong>Procedimento:</strong> {itemCheckin.tipoAtendimento === 'castracao' ? 'Cirurgia de Castração' : 'Consulta Clínica'}</div>
            </div>

            {/* Checklist de Entrada */}
            <div className="space-y-2 border-t pt-3">
              <span className="text-xs font-bold text-slate-800 uppercase block">Checklist de Entrada</span>
              
              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={carteirinhaApresentada}
                  onChange={(e) => setCarteirinhaApresentada(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span>Carteirinha Digital com QR Code apresentada pelo tutor</span>
              </label>

              {itemCheckin.tipoAtendimento === 'castracao' && (
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={jejumConfirmado}
                    onChange={(e) => setJejumConfirmado(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <span>Tutor confirmou jejum pré-operatório obrigatório de 8 horas</span>
                </label>
              )}
            </div>

            {/* Sinais Vitais */}
            <div className="grid grid-cols-2 gap-3 border-t pt-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Peso Aferido (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="Ex: 8.5"
                  value={pesoEntrada}
                  onChange={(e) => setPesoEntrada(e.target.value)}
                  className="w-full border rounded-xl p-2.5 text-xs bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Temperatura (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="Ex: 38.5"
                  value={temperaturaEntrada}
                  onChange={(e) => setTemperaturaEntrada(e.target.value)}
                  className="w-full border rounded-xl p-2.5 text-xs bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Observações de Triagem</label>
              <textarea
                rows={2}
                placeholder="Condições do animal, alergias relatadas pelo tutor..."
                value={obsEntrada}
                onChange={(e) => setObsEntrada(e.target.value)}
                className="w-full border rounded-xl p-2 text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <Button type="button" variant="outline" size="sm" onClick={() => setModalCheckinOpen(false)}>
                Cancelar
              </Button>
              <Button 
                type="submit" 
                size="sm" 
                disabled={submittingCheckin}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
              >
                {submittingCheckin ? 'Processando...' : 'Confirmar Check-in & Encaminhar'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 2: PRONTUÁRIO & CONCLUSÃO DE ATENDIMENTO */}
      {itemConclusao && (
        <Modal
          isOpen={modalConclusaoOpen}
          onClose={() => setModalConclusaoOpen(false)}
          title={`Concluir: ${itemConclusao.pets?.nome}`}
          size="lg"
        >
          <form onSubmit={(e) => handleFinalizarAtendimento(e, true)} className="space-y-4">
            <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-xs flex justify-between items-center">
              <div>
                <span className="font-bold text-emerald-950 block">Paciente: {itemConclusao.pets?.nome}</span>
                <span className="text-emerald-800">Tutor: {itemConclusao.perfis?.nome}</span>
              </div>
              <Badge variant="primary" className="text-xs">
                {itemConclusao.tipoAtendimento === 'castracao' ? 'Castração' : 'Consulta'}
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Médico Veterinário Responsável</label>
                <input
                  type="text"
                  value={veterinarioNome}
                  onChange={(e) => setVeterinarioNome(e.target.value)}
                  placeholder="Nome do Veterinário"
                  className="w-full border rounded-xl p-2.5 text-xs bg-white font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">CRMV/PR</label>
                <input
                  type="text"
                  value={veterinarioCrmv}
                  onChange={(e) => setVeterinarioCrmv(e.target.value)}
                  placeholder="Ex: 12345/PR"
                  className="w-full border rounded-xl p-2.5 text-xs bg-white font-medium"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Protocolo Cirúrgico / Anestesia</label>
              <input
                type="text"
                value={protocoloAnestesico}
                onChange={(e) => setProtocoloAnestesico(e.target.value)}
                placeholder="Ex: Ovariohisterectomia (OSH) com Anestesia Inalatória Isoflurano"
                className="w-full border rounded-xl p-2.5 text-xs bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Prescrição Farmacológica Pós-Operatória (Medicamentos & Posologia)
              </label>
              <textarea
                rows={4}
                value={prescricaoMedicamentos}
                onChange={(e) => setPrescricaoMedicamentos(e.target.value)}
                className="w-full border rounded-xl p-2.5 text-xs font-mono"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Retirada de Pontos</label>
                <input
                  type="text"
                  value={retornoPontos}
                  onChange={(e) => setRetornoPontos(e.target.value)}
                  placeholder="Ex: 10 dias"
                  className="w-full border rounded-xl p-2.5 text-xs bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Recomendações ao Tutor</label>
                <input
                  type="text"
                  value={orientacoesPos}
                  onChange={(e) => setOrientacoesPos(e.target.value)}
                  placeholder="Ex: Uso obrigatório de roupa cirúrgica ou colar"
                  className="w-full border rounded-xl p-2.5 text-xs bg-white"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t">
              <Button type="button" variant="outline" size="sm" onClick={() => setModalConclusaoOpen(false)}>
                Cancelar
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => notificarAltaWhatsApp(itemConclusao)}
                  className="text-xs text-green-700 border-green-300 hover:bg-green-50 flex items-center gap-1"
                >
                  <MessageCircle size={14} /> Avisar no WhatsApp
                </Button>

                <Button
                  type="submit"
                  size="sm"
                  disabled={submittingConclusao}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1"
                >
                  <FileText size={14} />
                  {submittingConclusao ? 'Salvando...' : 'Finalizar & Imprimir Termo de Alta'}
                </Button>
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 3: SCANNER DE QR CODE COM CÂMERA */}
      {scannerOpen && (
        <Modal
          isOpen={scannerOpen}
          onClose={stopCamera}
          title="Escanear QR Code da Guia ou Carteirinha"
        >
          <div className="space-y-4 text-center">
            <div className="relative w-full aspect-square max-w-xs mx-auto bg-slate-900 rounded-2xl overflow-hidden flex items-center justify-center border-2 border-emerald-500">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-8 border-2 border-dashed border-emerald-400 rounded-xl pointer-events-none animate-pulse" />
            </div>

            <p className="text-xs text-slate-500">
              Aponte a câmera para o QR Code impresso na <strong>Guia de Autorização</strong> ou na <strong>Carteirinha Digital</strong> do pet.
            </p>

            <div className="flex justify-center gap-2 pt-2 border-t">
              <Button variant="outline" size="sm" onClick={stopCamera}>
                Fechar Câmera
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL 4: TERMO DE ALTA MÉDICA E RECEITA IMPRIMÍVEL */}
      {receitaData && (
        <ReceitaAltaModal
          isOpen={receitaModalOpen}
          onClose={() => setReceitaModalOpen(false)}
          clinica={receitaData.clinica}
          pet={receitaData.pet}
          tutor={receitaData.tutor}
          atendimento={receitaData.atendimento}
        />
      )}

      {/* MODAL 5: CARTEIRA DE VACINAÇÃO DO PACIENTE */}
      {petParaVacinas && (
        <CarteiraVacinacaoModal
          isOpen={vacinasModalOpen}
          onClose={() => setVacinasModalOpen(false)}
          pet={petParaVacinas.pet}
          tutor={petParaVacinas.tutor}
          onAtualizacao={fetchAtendimentos}
        />
      )}
    </div>
  );
}
