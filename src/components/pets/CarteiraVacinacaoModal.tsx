import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  Syringe, 
  Pill, 
  Calendar, 
  Clock, 
  Printer, 
  Download, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle, 
  Dog, 
  Cat, 
  User, 
  Sparkles,
  Info,
  Check,
  Building2,
  FileText
} from 'lucide-react';
import QRCode from 'qrcode';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { 
  RegistroVacina, 
  CATALOGO_VACINAS, 
  fetchVacinasPet, 
  salvarRegistroVacina, 
  excluirRegistroVacina, 
  calcularStatusVacinal 
} from '@/lib/vacinacao';

export interface CarteiraVacinacaoModalProps {
  isOpen: boolean;
  onClose: () => void;
  pet: {
    id: string;
    nome: string;
    especie: string;
    raca?: string;
    sexo?: string;
    porte?: string;
    cor?: string;
    rga?: string;
    microchip?: string | null;
    vacinado?: boolean;
    castrado?: boolean;
    tutor_id?: string;
    fotos_pet?: { url: string }[];
  };
  tutor?: {
    nome: string;
    cpf?: string;
    telefone?: string;
    endereco?: string;
  };
  onAtualizacao?: () => void;
}

export default function CarteiraVacinacaoModal({
  isOpen,
  onClose,
  pet,
  tutor,
  onAtualizacao
}: CarteiraVacinacaoModalProps) {
  const [activeTab, setActiveTab] = useState<'vacinas' | 'parasitas' | 'novo'>('vacinas');
  const [vacinas, setVacinas] = useState<RegistroVacina[]>([]);
  const [loading, setLoading] = useState(true);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [isExporting, setIsExporting] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  // Formulário de Nova Vacina / Medicamento
  const [tipoNovo, setTipoNovo] = useState<'vacina' | 'vermifugo' | 'antipulgas'>('vacina');
  const [nomeNovo, setNomeNovo] = useState('');
  const [dataAplicacao, setDataAplicacao] = useState(new Date().toISOString().split('T')[0]);
  const [dataReforco, setDataReforco] = useState('');
  const [loteNovo, setLoteNovo] = useState('');
  const [fabricanteNovo, setFabricanteNovo] = useState('');
  const [veterinarioNovo, setVeterinarioNovo] = useState('');
  const [crmvNovo, setCrmvNovo] = useState('');
  const [obsNovo, setObsNovo] = useState('');
  const [salvando, setSalvando] = useState(false);

  const rgaFormatado = pet.rga || `PR-ARA-2026-${pet.id.replace(/-/g, '').slice(0, 5).toUpperCase()}`;
  const validationUrl = `${window.location.origin}/validar/pet/${pet.id}`;

  useEffect(() => {
    if (isOpen && pet.id) {
      carregarDados();

      QRCode.toDataURL(validationUrl, {
        width: 130,
        margin: 1,
        color: { dark: '#064e3b', light: '#ffffff' }
      })
        .then(url => setQrCodeDataUrl(url))
        .catch(err => console.error('Erro ao gerar QR Code:', err));
    }
  }, [isOpen, pet.id]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const lista = await fetchVacinasPet(pet.id);
      setVacinas(lista);
    } catch (e) {
      console.error(e);
      toast.error('Erro ao carregar caderneta de vacinas.');
    } finally {
      setLoading(false);
    }
  };

  const statusVacinal = calcularStatusVacinal(vacinas);

  // Filtra sugestões do catálogo conforme espécie
  const catalogoFiltrado = CATALOGO_VACINAS.filter(c => {
    if (c.tipo !== tipoNovo) return false;
    if (c.especie === 'todos') return true;
    return c.especie === (pet.especie === 'gato' ? 'gato' : 'cachorro');
  });

  const handleSelecionarCatalogo = (item: (typeof CATALOGO_VACINAS)[0]) => {
    setNomeNovo(item.nome);
    if (item.fabricantesSugeridos.length > 0) {
      setFabricanteNovo(item.fabricantesSugeridos[0]);
    }
    // Calcula data do reforço com base no período em meses
    const d = new Date(dataAplicacao);
    d.setMonth(d.getMonth() + item.periodoMeses);
    setDataReforco(d.toISOString().split('T')[0]);
  };

  const handleSalvarRegistro = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomeNovo.trim()) {
      toast.error('Informe o nome da vacina ou medicamento.');
      return;
    }

    setSalvando(true);
    try {
      await salvarRegistroVacina({
        pet_id: pet.id,
        tutor_id: pet.tutor_id,
        tipo: tipoNovo,
        nome: nomeNovo.trim(),
        data_aplicacao: dataAplicacao,
        data_reforco: dataReforco || undefined,
        lote: loteNovo.trim() || undefined,
        fabricante: fabricanteNovo.trim() || undefined,
        veterinario_nome: veterinarioNovo.trim() || undefined,
        crmv: crmvNovo.trim() || undefined,
        observacoes: obsNovo.trim() || undefined
      });

      toast.success(`${tipoNovo === 'vacina' ? 'Vacina' : 'Medicamento'} registrado na carteira digital!`);
      
      // Limpa form
      setNomeNovo('');
      setLoteNovo('');
      setFabricanteNovo('');
      setObsNovo('');
      
      await carregarDados();
      setActiveTab(tipoNovo === 'vacina' ? 'vacinas' : 'parasitas');
      if (onAtualizacao) onAtualizacao();
    } catch (error: any) {
      console.error('Erro ao salvar vacina:', error);
      toast.error('Erro ao salvar registro: ' + error.message);
    } finally {
      setSalvando(false);
    }
  };

  const handleExcluir = async (id: string, nome: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir o registro de "${nome}"?`)) return;
    try {
      await excluirRegistroVacina(id, pet.id);
      toast.success('Registro removido da carteira.');
      await carregarDados();
      if (onAtualizacao) onAtualizacao();
    } catch (e) {
      toast.error('Erro ao excluir registro.');
    }
  };

  const handleImprimir = () => {
    window.print();
  };

  const handleDownloadImagem = async () => {
    if (!printRef.current) return;
    try {
      setIsExporting(true);
      toast.info('Gerando Caderneta Sanitária em alta resolução...');

      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false
      });

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `Carteira-Vacinacao-${pet.nome.replace(/\s+/g, '_')}-${rgaFormatado}.png`;
      link.href = dataUrl;
      link.click();

      toast.success('Carteira de Vacinação baixada com sucesso!');
    } catch (error) {
      console.error('Erro ao baixar carteira:', error);
      toast.error('Erro ao baixar imagem. Tente a opção Imprimir.');
    } finally {
      setIsExporting(false);
    }
  };

  const vacinasFiltradas = vacinas.filter(v => v.tipo === 'vacina');
  const parasitasFiltrados = vacinas.filter(v => v.tipo === 'vermifugo' || v.tipo === 'antipulgas');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Caderneta de Saúde & Carteira de Vacinação Digital"
      size="xl"
    >
      <div className="space-y-4">
        {/* BARRA DE AÇÕES DO TOPO */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2 text-xs text-slate-700">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Documento oficial de imunização com QR Code de autenticação.</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadImagem}
              disabled={isExporting}
              className="text-xs flex items-center gap-1.5 border-slate-300"
            >
              <Download size={14} />
              <span>{isExporting ? 'Processando...' : 'Salvar Imagem'}</span>
            </Button>

            <Button
              size="sm"
              onClick={handleImprimir}
              className="text-xs flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Printer size={14} />
              <span>Imprimir Carteira (A4)</span>
            </Button>
          </div>
        </div>

        {/* NAVEGAÇÃO DE ABAS */}
        <div className="flex border-b border-slate-200 gap-2 sm:gap-6 text-xs sm:text-sm font-semibold">
          <button
            onClick={() => setActiveTab('vacinas')}
            className={`pb-2.5 px-1 flex items-center gap-1.5 border-b-2 transition-colors ${
              activeTab === 'vacinas'
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Syringe size={16} />
            <span>Vacinas ({vacinasFiltradas.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('parasitas')}
            className={`pb-2.5 px-1 flex items-center gap-1.5 border-b-2 transition-colors ${
              activeTab === 'parasitas'
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Pill size={16} />
            <span>Vermífugos & Antipulgas ({parasitasFiltrados.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('novo')}
            className={`pb-2.5 px-1 flex items-center gap-1.5 border-b-2 transition-colors ${
              activeTab === 'novo'
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent text-emerald-600 hover:text-emerald-800'
            }`}
          >
            <Plus size={16} />
            <span>+ Registrar Nova Dose</span>
          </button>
        </div>

        {/* CONTEÚDO PRINCIPAL VISÍVEL / IMPRIMÍVEL */}
        <div className="max-h-[72vh] overflow-y-auto p-1 border rounded-xl bg-slate-100">
          <div 
            ref={printRef}
            className="bg-white p-6 sm:p-8 rounded-lg shadow-sm border border-slate-200 max-w-3xl mx-auto text-slate-800 font-sans space-y-6 print:p-0 print:border-none print:shadow-none"
          >
            {/* CABEÇALHO INSTITUCIONAL */}
            <div className="border-b-2 border-emerald-600 pb-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center border border-emerald-200 text-emerald-700 font-black text-xl shrink-0">
                  <Syringe className="w-8 h-8 text-emerald-600" />
                </div>
                <div>
                  <h1 className="text-base font-extrabold text-slate-900 tracking-tight leading-tight">
                    ESTADO DO PARANÁ • MUNICÍPIO DE ARAPONGAS
                  </h1>
                  <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">
                    Secretaria Municipal de Saúde • Vigilância em Zoonoses & Bem-Estar Animal
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Caderneta Sanitária e Registro Oficial de Imunização Animal
                  </p>
                </div>
              </div>

              {/* QR Code de Autenticidade */}
              <div className="flex flex-col items-center shrink-0">
                {qrCodeDataUrl ? (
                  <img 
                    src={qrCodeDataUrl} 
                    alt="QR Code de Validação" 
                    className="w-18 h-18 border rounded-lg p-0.5 bg-white shadow-2xs" 
                  />
                ) : (
                  <div className="w-18 h-18 bg-slate-100 rounded-lg animate-pulse" />
                )}
                <span className="text-[8px] font-bold text-slate-500 uppercase mt-0.5 tracking-wider">
                  Verificação Online
                </span>
              </div>
            </div>

            {/* IDENTIFICAÇÃO DO PACIENTE E TUTOR */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="space-y-1">
                <span className="font-extrabold text-emerald-800 uppercase text-[10px] block">Paciente</span>
                <div className="text-base font-black text-slate-900">{pet.nome}</div>
                <div><span className="font-semibold text-slate-500">RGA Municipal:</span> <span className="font-mono font-bold text-emerald-700">{rgaFormatado}</span></div>
                <div><span className="font-semibold text-slate-500">Espécie / Raça:</span> <span className="capitalize">{pet.especie}</span> • {pet.raca || 'SRD'}</div>
                <div><span className="font-semibold text-slate-500">Sexo / Porte:</span> <span className="capitalize">{pet.sexo || 'Não informado'}</span> • {pet.porte || 'Médio'}</div>
                {pet.microchip && <div><span className="font-semibold text-slate-500">Microchip:</span> <span className="font-mono">{pet.microchip}</span></div>}
              </div>

              <div className="space-y-1 sm:border-l sm:pl-4 border-slate-200">
                <span className="font-extrabold text-emerald-800 uppercase text-[10px] block">Tutor Responsável</span>
                <div className="text-sm font-bold text-slate-900">{tutor?.nome || 'Tutor Cadastrado'}</div>
                {tutor?.cpf && <div><span className="font-semibold text-slate-500">CPF:</span> {tutor.cpf}</div>}
                {tutor?.telefone && <div><span className="font-semibold text-slate-500">Telefone:</span> {tutor.telefone}</div>}
                {tutor?.endereco && <div><span className="font-semibold text-slate-500">Endereço:</span> {tutor.endereco}</div>}
                <div><span className="font-semibold text-slate-500">Município:</span> Arapongas - PR</div>
              </div>
            </div>

            {/* CARDS DE STATUS SANITÁRIO RÁPIDO */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Card Raiva */}
              <div className={`p-3 rounded-xl border flex items-center justify-between ${
                statusVacinal.antirrabica.emDia 
                  ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950' 
                  : 'bg-amber-50/80 border-amber-300 text-amber-950'
              }`}>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 font-bold uppercase text-[11px]">
                    <Syringe size={14} className={statusVacinal.antirrabica.emDia ? 'text-emerald-700' : 'text-amber-700'} />
                    <span>Vacina Antirrábica</span>
                  </div>
                  <p className="text-[11px] font-medium">
                    {statusVacinal.antirrabica.registrado ? (
                      statusVacinal.antirrabica.emDia 
                        ? `Em dia (Próxima: ${new Date(statusVacinal.antirrabica.proxima!).toLocaleDateString('pt-BR')})` 
                        : `Vencida em ${new Date(statusVacinal.antirrabica.proxima!).toLocaleDateString('pt-BR')}`
                    ) : (
                      'Nenhuma dose registrada'
                    )}
                  </p>
                </div>
                <div className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                  statusVacinal.antirrabica.emDia ? 'bg-emerald-200 text-emerald-900' : 'bg-amber-200 text-amber-900'
                }`}>
                  {statusVacinal.antirrabica.emDia ? 'Em Dia' : 'Pendente'}
                </div>
              </div>

              {/* Card Polivalente */}
              <div className={`p-3 rounded-xl border flex items-center justify-between ${
                statusVacinal.polivalente.emDia 
                  ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950' 
                  : 'bg-blue-50/80 border-blue-300 text-blue-950'
              }`}>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 font-bold uppercase text-[11px]">
                    <ShieldCheck size={14} className={statusVacinal.polivalente.emDia ? 'text-emerald-700' : 'text-blue-700'} />
                    <span>Vacina Polivalente (V8/V10/V5)</span>
                  </div>
                  <p className="text-[11px] font-medium">
                    {statusVacinal.polivalente.registrado ? (
                      statusVacinal.polivalente.emDia 
                        ? `Em dia (Próxima: ${new Date(statusVacinal.polivalente.proxima!).toLocaleDateString('pt-BR')})` 
                        : `Vencida em ${new Date(statusVacinal.polivalente.proxima!).toLocaleDateString('pt-BR')}`
                    ) : (
                      'Nenhuma dose registrada'
                    )}
                  </p>
                </div>
                <div className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                  statusVacinal.polivalente.emDia ? 'bg-emerald-200 text-emerald-900' : 'bg-blue-200 text-blue-900'
                }`}>
                  {statusVacinal.polivalente.emDia ? 'Em Dia' : 'Pendente'}
                </div>
              </div>
            </div>

            {/* SEÇÃO 1: TABELA DE VACINAS */}
            {activeTab === 'vacinas' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wide flex items-center gap-2">
                    <Syringe className="w-4 h-4 text-emerald-600" />
                    Histórico de Vacinas Aplicadas
                  </h3>
                  <button 
                    onClick={() => { setTipoNovo('vacina'); setActiveTab('novo'); }}
                    className="text-xs text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 print:hidden"
                  >
                    <Plus size={13} /> Adicionar Vacina
                  </button>
                </div>

                {vacinasFiltradas.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300 space-y-2">
                    <Syringe className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className="text-xs text-slate-600 font-medium">Nenhuma vacina registrada para este pet.</p>
                    <Button 
                      size="sm" 
                      onClick={() => { setTipoNovo('vacina'); setActiveTab('novo'); }}
                      className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white print:hidden"
                    >
                      + Registrar Primeira Vacina
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                      <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                        <tr>
                          <th className="p-3">Vacina / Antígeno</th>
                          <th className="p-3">Data Aplicação</th>
                          <th className="p-3">Próximo Reforço</th>
                          <th className="p-3">Lote / Laboratório</th>
                          <th className="p-3">Veterinário / CRMV</th>
                          <th className="p-3 text-right print:hidden">Ação</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {vacinasFiltradas.map((v) => {
                          const expirada = v.data_reforco && new Date(v.data_reforco) < new Date();

                          return (
                            <tr key={v.id} className="hover:bg-slate-50/80">
                              <td className="p-3">
                                <span className="font-bold text-slate-900 block">{v.nome}</span>
                                {v.observacoes && <span className="text-[10px] text-slate-500 italic block">{v.observacoes}</span>}
                              </td>
                              <td className="p-3 font-medium">
                                {new Date(v.data_aplicacao).toLocaleDateString('pt-BR')}
                              </td>
                              <td className="p-3">
                                {v.data_reforco ? (
                                  <span className={`font-semibold ${expirada ? 'text-red-600' : 'text-emerald-700'}`}>
                                    {new Date(v.data_reforco).toLocaleDateString('pt-BR')}
                                    {expirada && ' (Vencida)'}
                                  </span>
                                ) : (
                                  <span className="text-slate-400">-</span>
                                )}
                              </td>
                              <td className="p-3">
                                <span className="text-slate-800 font-medium block">{v.fabricante || 'Oficial'}</span>
                                {v.lote && <span className="text-[10px] text-slate-500 font-mono">Lote: {v.lote}</span>}
                              </td>
                              <td className="p-3">
                                <span className="text-slate-800 font-medium block">{v.veterinario_nome || 'Campanha Municipal'}</span>
                                {v.crmv && <span className="text-[10px] text-emerald-700 font-semibold">CRMV: {v.crmv}</span>}
                              </td>
                              <td className="p-3 text-right print:hidden">
                                <button
                                  onClick={() => handleExcluir(v.id, v.nome)}
                                  className="text-slate-400 hover:text-red-600 p-1 rounded-md transition-colors"
                                  title="Excluir vacina"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* SEÇÃO 2: TABELA DE VERMÍFUGOS & ANTIPARASITÁRIOS */}
            {activeTab === 'parasitas' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wide flex items-center gap-2">
                    <Pill className="w-4 h-4 text-emerald-600" />
                    Controle de Vermífugos e Ectoparasitas (Pulgas/Carrapatos)
                  </h3>
                  <button 
                    onClick={() => { setTipoNovo('vermifugo'); setActiveTab('novo'); }}
                    className="text-xs text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 print:hidden"
                  >
                    <Plus size={13} /> Adicionar Medicamento
                  </button>
                </div>

                {parasitasFiltrados.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300 space-y-2">
                    <Pill className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className="text-xs text-slate-600 font-medium">Nenhum controle parasitário registrado.</p>
                    <Button 
                      size="sm" 
                      onClick={() => { setTipoNovo('vermifugo'); setActiveTab('novo'); }}
                      className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white print:hidden"
                    >
                      + Registrar Medicamento
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                      <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                        <tr>
                          <th className="p-3">Medicamento / Princípio</th>
                          <th className="p-3">Tipo</th>
                          <th className="p-3">Data Administração</th>
                          <th className="p-3">Próxima Dose</th>
                          <th className="p-3">Laboratório</th>
                          <th className="p-3 text-right print:hidden">Ação</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {parasitasFiltrados.map((m) => (
                          <tr key={m.id} className="hover:bg-slate-50/80">
                            <td className="p-3">
                              <span className="font-bold text-slate-900 block">{m.nome}</span>
                              {m.observacoes && <span className="text-[10px] text-slate-500 italic block">{m.observacoes}</span>}
                            </td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                                m.tipo === 'vermifugo' ? 'bg-amber-100 text-amber-900' : 'bg-purple-100 text-purple-900'
                              }`}>
                                {m.tipo === 'vermifugo' ? 'Vermífugo' : 'Antipulgas'}
                              </span>
                            </td>
                            <td className="p-3 font-medium">
                              {new Date(m.data_aplicacao).toLocaleDateString('pt-BR')}
                            </td>
                            <td className="p-3">
                              {m.data_reforco ? (
                                <span className="font-semibold text-emerald-700">
                                  {new Date(m.data_reforco).toLocaleDateString('pt-BR')}
                                </span>
                              ) : (
                                <span className="text-slate-400">-</span>
                              )}
                            </td>
                            <td className="p-3 text-slate-600 font-medium">
                              {m.fabricante || '-'}
                            </td>
                            <td className="p-3 text-right print:hidden">
                              <button
                                onClick={() => handleExcluir(m.id, m.nome)}
                                className="text-slate-400 hover:text-red-600 p-1 rounded-md transition-colors"
                                title="Excluir medicamento"
                              >
                                <Trash2 size={13} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* SEÇÃO 3: FORMULÁRIO DE NOVA DOSE */}
            {activeTab === 'novo' && (
              <form onSubmit={handleSalvarRegistro} className="space-y-4 print:hidden">
                <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200">
                  <h4 className="font-extrabold text-sm text-emerald-950 flex items-center gap-1.5">
                    <Plus size={16} /> Registrar Nova Aplicação Sanitária
                  </h4>
                  <p className="text-xs text-emerald-800 mt-0.5">
                    Adicione vacinas ou antiparasitários aplicados no pet. O registro atualiza automaticamente o status no banco de dados.
                  </p>
                </div>

                {/* Seleção de Tipo */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setTipoNovo('vacina')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center ${
                      tipoNovo === 'vacina' 
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs' 
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    💉 Vacina
                  </button>
                  <button
                    type="button"
                    onClick={() => setTipoNovo('vermifugo')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center ${
                      tipoNovo === 'vermifugo' 
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs' 
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    🪱 Vermífugo
                  </button>
                  <button
                    type="button"
                    onClick={() => setTipoNovo('antipulgas')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center ${
                      tipoNovo === 'antipulgas' 
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs' 
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    🛡️ Antipulgas / Carrapatos
                  </button>
                </div>

                {/* Sugestões do Catálogo */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-500 uppercase block">
                    Sugestões Rápidas de {pet.especie === 'gato' ? 'Felinos' : 'Caninos'}:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {catalogoFiltrado.map((cat) => (
                      <button
                        key={cat.nome}
                        type="button"
                        onClick={() => handleSelecionarCatalogo(cat)}
                        className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                          nomeNovo === cat.nome 
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-400 font-bold' 
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-emerald-50'
                        }`}
                      >
                        {cat.nome.split('(')[0]}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Nome da Vacina / Medicamento *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Vacina Antirrábica"
                      value={nomeNovo}
                      onChange={(e) => setNomeNovo(e.target.value)}
                      className="w-full border rounded-xl p-2.5 bg-white font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Laboratório / Fabricante</label>
                    <input
                      type="text"
                      placeholder="Ex: Zoetis, MSD, Boehringer"
                      value={fabricanteNovo}
                      onChange={(e) => setFabricanteNovo(e.target.value)}
                      className="w-full border rounded-xl p-2.5 bg-white font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Data da Aplicação *</label>
                    <input
                      type="date"
                      required
                      value={dataAplicacao}
                      onChange={(e) => setDataAplicacao(e.target.value)}
                      className="w-full border rounded-xl p-2.5 bg-white font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Data da Próxima Dose / Reforço</label>
                    <input
                      type="date"
                      value={dataReforco}
                      onChange={(e) => setDataReforco(e.target.value)}
                      className="w-full border rounded-xl p-2.5 bg-white font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Número do Lote</label>
                    <input
                      type="text"
                      placeholder="Ex: 045/26"
                      value={loteNovo}
                      onChange={(e) => setLoteNovo(e.target.value)}
                      className="w-full border rounded-xl p-2.5 bg-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Médico Veterinário & CRMV</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Nome Dr(a)"
                        value={veterinarioNovo}
                        onChange={(e) => setVeterinarioNovo(e.target.value)}
                        className="w-full border rounded-xl p-2.5 bg-white"
                      />
                      <input
                        type="text"
                        placeholder="CRMV/PR"
                        value={crmvNovo}
                        onChange={(e) => setCrmvNovo(e.target.value)}
                        className="w-full border rounded-xl p-2.5 bg-white"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Observações Adicionais</label>
                  <input
                    type="text"
                    placeholder="Ex: Campanha municipal gratuita de vacinação contra a raiva"
                    value={obsNovo}
                    onChange={(e) => setObsNovo(e.target.value)}
                    className="w-full border rounded-xl p-2 text-xs bg-white"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t">
                  <Button type="button" variant="outline" size="sm" onClick={() => setActiveTab('vacinas')}>
                    Voltar
                  </Button>
                  <Button 
                    type="submit" 
                    size="sm" 
                    disabled={salvando}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5"
                  >
                    <Check size={14} />
                    {salvando ? 'Salvando...' : 'Salvar Registro na Carteira'}
                  </Button>
                </div>
              </form>
            )}

            {/* AVISO LEGAL E RODAPÉ */}
            <div className="border-t border-slate-200 pt-4 text-center space-y-1 text-[10px] text-slate-400">
              <p>
                Documento de controle sanitário animal emitido eletronicamente pelo Sistema PetConecta BR • Município de Arapongas / PR
              </p>
              <p>
                A vacinação antirrábica em cães e gatos é obrigatória por lei e fundamental para a saúde pública e prevenção de zoonoses.
              </p>
            </div>
          </div>
        </div>

        {/* RODAPÉ DO MODAL */}
        <div className="flex justify-end gap-2 pt-2 border-t">
          <Button variant="outline" size="sm" onClick={onClose}>
            Fechar
          </Button>
          <Button 
            size="sm" 
            onClick={handleImprimir}
            className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5"
          >
            <Printer size={14} /> Imprimir Caderneta
          </Button>
        </div>
      </div>
    </Modal>
  );
}
