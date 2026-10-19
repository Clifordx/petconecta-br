import React, { useState, useEffect } from 'react';
import { 
  Package, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Dog, 
  Cat, 
  FileText, 
  Calendar, 
  MapPin, 
  HelpCircle,
  Wheat,
  ShieldCheck,
  Printer,
  Upload,
  Camera,
  Eye,
  Check,
  ChevronRight,
  Info,
  Building2,
  Phone,
  User
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { 
  BeneficiarioRacao, 
  EntregaRacao, 
  fetchBeneficiarios, 
  fetchEntregasRacao, 
  salvarBeneficiario, 
  calcularCotaSugerida 
} from '@/lib/bancoRacao';
import { Button } from '@/components/ui/Button';
import ReciboEntregaRacaoModal from '@/components/racao/ReciboEntregaRacaoModal';

export default function SolicitarBancoRacao() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [meuBeneficio, setMeuBeneficio] = useState<BeneficiarioRacao | null>(null);
  const [minhasEntregas, setMinhasEntregas] = useState<EntregaRacao[]>([]);
  const [meusPets, setMeusPets] = useState<any[]>([]);

  // Formulário de Inscrição
  const [tipo, setTipo] = useState<'baixa_renda' | 'protetor_independente'>('baixa_renda');
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');
  const [nis, setNis] = useState('');
  
  // Endereço
  const [endereco, setEndereco] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('Centro');
  const [pontoReferencia, setPontoReferencia] = useState('');
  
  // Animais
  const [qtdCaes, setQtdCaes] = useState(7);
  const [qtdGatos, setQtdGatos] = useState(2);
  const [tipoEspaco, setTipoEspaco] = useState('Quintal amplo com abrigo coberto');
  const [observacoes, setObservacoes] = useState('');

  // Uploads / Documentos (Base64 para preview imediato e persistência local)
  const [docCadunicoUrl, setDocCadunicoUrl] = useState<string>('');
  const [docRgUrl, setDocRgUrl] = useState<string>('');
  const [docResidenciaUrl, setDocResidenciaUrl] = useState<string>('');
  const [fotosAnimaisUrl, setFotosAnimaisUrl] = useState<string>('');

  const [termoAceito, setTermoAceito] = useState(false);
  const [enviando, setEnviando] = useState(false);

  // Recibo Modal
  const [reciboModalOpen, setReciboModalOpen] = useState(false);
  const [entregaSelecionada, setEntregaSelecionada] = useState<EntregaRacao | null>(null);

  const mesAtual = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  })();

  useEffect(() => {
    carregar();
  }, [user, profile]);

  const carregar = async () => {
    try {
      setLoading(true);
      if (user) {
        // Carrega pets cadastrados do usuário
        const { data: pets } = await supabase
          .from('pets')
          .select('id, especie, nome')
          .eq('tutor_id', user.id);

        if (pets && pets.length > 0) {
          setMeusPets(pets);
          const caes = pets.filter(p => !p.especie?.toLowerCase().includes('gato')).length;
          const gatos = pets.filter(p => p.especie?.toLowerCase().includes('gato')).length;
          setQtdCaes(caes > 0 ? caes : 7);
          setQtdGatos(gatos);
        }

        // Pré-preenche dados do perfil
        if (profile) {
          setNome(profile.nome || '');
          setCpf(profile.cpf || '');
          setTelefone(profile.telefone || '');
          if (profile.endereco) setEndereco(profile.endereco);
          if (profile.bairro) setBairro(profile.bairro);
        }

        // Verifica se já possui benefício cadastrado
        const beneficiarios = await fetchBeneficiarios();
        const encontrado = beneficiarios.find(b => 
          (b.user_id && b.user_id === user.id) || 
          (profile?.cpf && b.cpf === profile.cpf)
        );

        if (encontrado) {
          setMeuBeneficio(encontrado);
          const todasEntregas = await fetchEntregasRacao();
          const doUser = todasEntregas.filter(e => e.beneficiario_id === encontrado.id);
          setMinhasEntregas(doUser);
        }
      }
    } catch (e) {
      console.error('Erro ao carregar dados do banco de ração:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (url: string) => void,
    nomeDoc: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setter(reader.result as string);
      toast.success(`${nomeDoc} carregado com sucesso!`);
    };
    reader.readAsDataURL(file);
  };

  const cotaSugerida = calcularCotaSugerida(qtdCaes, qtdGatos);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nome.trim() || !cpf.trim()) {
      toast.error('Informe seu nome e CPF completos.');
      return;
    }
    if (tipo === 'baixa_renda' && !nis.trim()) {
      toast.error('Informe o número do NIS / CadÚnico para comprovação do benefício social.');
      return;
    }
    if (!endereco.trim() || !bairro.trim()) {
      toast.error('Informe o endereço e bairro completo onde os animais ficam abrigados.');
      return;
    }
    if (qtdCaes === 0 && qtdGatos === 0) {
      toast.error('Informe a quantidade de cães ou gatos sob sua guarda.');
      return;
    }
    if (!termoAceito) {
      toast.warning('É necessário aceitar os termos do programa municipal.');
      return;
    }

    setEnviando(true);
    try {
      const protocolo = `INS-RAC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

      const salvo = await salvarBeneficiario({
        user_id: user?.id,
        nome: nome.trim(),
        cpf: cpf.trim(),
        telefone: telefone.trim(),
        tipo,
        nis_cadunico: nis.trim() || undefined,
        endereco: `${endereco.trim()}${numero ? `, nº ${numero.trim()}` : ''}`,
        bairro: bairro.trim(),
        cidade: 'Arapongas - PR',
        qtd_caes: Number(qtdCaes),
        qtd_gatos: Number(qtdGatos),
        cota_mensal_kg: cotaSugerida,
        status: 'em_analise',
        observacoes: `Espaço: ${tipoEspaco}. Detalhes: ${observacoes.trim()}${pontoReferencia ? ` | Ref: ${pontoReferencia}` : ''}`,
        documento_cadunico_url: docCadunicoUrl || undefined,
        documento_rg_url: docRgUrl || undefined,
        comprovante_residencia_url: docResidenciaUrl || undefined,
        fotos_animais_url: fotosAnimaisUrl ? [fotosAnimaisUrl] : undefined,
        protocolo_solicitacao: protocolo
      });

      setMeuBeneficio(salvo);
      toast.success('Inscrição enviada com sucesso! Aguarde a avaliação da Secretaria de Meio Ambiente.');
    } catch {
      toast.error('Erro ao enviar solicitação.');
    } finally {
      setEnviando(false);
    }
  };

  const entregaDesteMes = minhasEntregas.find(e => e.mes_referencia === mesAtual);

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* CABEÇALHO DO PROGRAMA */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-800 rounded-3xl p-6 sm:p-8 text-white shadow-lg space-y-3">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-black uppercase tracking-wider">
            Assistência Social Animal • Arapongas - PR
          </span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black">
          Banco de Ração Municipal Solidário
        </h1>
        <p className="text-sm sm:text-base text-white/90 max-w-2xl">
          Destinado a tutores de baixa renda cadastrados no <strong>CadÚnico</strong> e <strong>Protetores Independentes</strong> com muitos animais sob tutela (lares temporários de resgate).
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500 font-medium">Carregando informações do programa...</p>
        </div>
      ) : meuBeneficio ? (
        /* PAINEL QUANDO O USUÁRIO JÁ ENVIOU A SOLICITAÇÃO */
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
            
            {/* STATUS HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Status da sua Inscrição no Banco de Ração
                </span>
                <h2 className="text-2xl font-black text-slate-900 mt-1">
                  {meuBeneficio.nome}
                </h2>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="text-xs text-slate-600 font-medium">
                    CPF: <strong className="font-mono">{meuBeneficio.cpf}</strong>
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs text-slate-600 font-medium">
                    Categoria: <strong>{meuBeneficio.tipo === 'protetor_independente' ? 'Protetor Independente' : 'Baixa Renda (CadÚnico)'}</strong>
                  </span>
                  {meuBeneficio.protocolo_solicitacao && (
                    <>
                      <span className="text-slate-300">•</span>
                      <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        Protocolo: {meuBeneficio.protocolo_solicitacao}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div>
                {meuBeneficio.status === 'aprovado' ? (
                  <span className="px-4 py-2 bg-emerald-100 text-emerald-800 rounded-full font-black text-xs uppercase flex items-center gap-1.5 border border-emerald-200 shadow-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Benefício Aprovado
                  </span>
                ) : meuBeneficio.status === 'em_analise' ? (
                  <span className="px-4 py-2 bg-amber-100 text-amber-800 rounded-full font-black text-xs uppercase flex items-center gap-1.5 border border-amber-200 shadow-xs animate-pulse">
                    <Clock className="w-4 h-4 text-amber-600" /> Aguardando Aprovação da Prefeitura
                  </span>
                ) : (
                  <span className="px-4 py-2 bg-red-100 text-red-800 rounded-full font-black text-xs uppercase flex items-center gap-1.5 border border-red-200 shadow-xs">
                    <AlertTriangle className="w-4 h-4 text-red-600" /> Inscrição Suspensa / Rejeitada
                  </span>
                )}
              </div>
            </div>

            {/* SE ESTIVER EM ANÁLISE */}
            {meuBeneficio.status === 'em_analise' && (
              <div className="bg-amber-50 border-2 border-amber-300 p-5 rounded-2xl text-amber-950 space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-600 flex-shrink-0" />
                  <h4 className="text-sm font-black uppercase tracking-wide">
                    Documentação em Análise pela Secretaria Municipal de Meio Ambiente
                  </h4>
                </div>
                <p className="text-xs leading-relaxed text-amber-900">
                  Sua inscrição foi protocolada com sucesso sob o número <strong>{meuBeneficio.protocolo_solicitacao || 'INS-RAC'}</strong>. A equipe técnica da Prefeitura está verificando o comprovante do CadÚnico e os dados dos seus <strong>{meuBeneficio.qtd_caes} cães</strong> e <strong>{meuBeneficio.qtd_gatos} gatos</strong>.
                </p>
                <div className="pt-2 border-t border-amber-200 flex flex-wrap gap-4 text-xs font-bold text-amber-800">
                  <span>📍 Bairro: {meuBeneficio.bairro}</span>
                  <span>⚖️ Cota Estimada Solicitada: {meuBeneficio.cota_mensal_kg} KG / mês</span>
                </div>
              </div>
            )}

            {/* SE ESTIVER APROVADO */}
            {meuBeneficio.status === 'aprovado' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-2">
                  <span className="text-xs font-bold text-emerald-900 uppercase block">
                    Cota Mensal Concedida
                  </span>
                  <div className="text-3xl font-black text-emerald-800">
                    {meuBeneficio.cota_mensal_kg} KG <span className="text-sm font-semibold text-emerald-600">/ mês</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Destinada para <strong>{meuBeneficio.qtd_caes} cães</strong> e <strong>{meuBeneficio.qtd_gatos} gatos</strong> cadastrados no endereço <strong>{meuBeneficio.bairro}</strong>.
                  </p>
                </div>

                <div className={`rounded-xl p-4 border space-y-2 ${
                  entregaDesteMes 
                    ? 'bg-blue-50 border-blue-200 text-blue-900' 
                    : 'bg-amber-50 border-amber-200 text-amber-900'
                }`}>
                  <span className="text-xs font-bold uppercase block">
                    Retirada do Mês Vigente ({mesAtual})
                  </span>
                  {entregaDesteMes ? (
                    <div>
                      <h4 className="text-base font-black text-blue-900 flex items-center gap-1.5">
                        <CheckCircle2 className="w-5 h-5 text-blue-600" />
                        Cota Retirada com Sucesso ({entregaDesteMes.quantidade_kg} KG)
                      </h4>
                      <p className="text-xs text-blue-700 mt-1">
                        Retirada realizada em {new Date(entregaDesteMes.data_entrega).toLocaleDateString('pt-BR')}. Sua próxima cota estará liberada no início do mês seguinte.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <h4 className="text-base font-black text-amber-900 flex items-center gap-1.5">
                        <Wheat className="w-5 h-5 text-amber-600" />
                        Disponível para Retirada no Galpão!
                      </h4>
                      <p className="text-xs text-amber-800 mt-1">
                        Dirija-se ao almoxarifado da Secretaria de Meio Ambiente com documento com foto para retirar seus <strong>{meuBeneficio.cota_mensal_kg} KG</strong> deste mês.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* DOCUMENTOS ENVIADOS */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-600" /> Documentos Anexados à sua Inscrição:
              </h4>
              <div className="flex flex-wrap gap-2 pt-1">
                {meuBeneficio.documento_cadunico_url && (
                  <a 
                    href={meuBeneficio.documento_cadunico_url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-semibold text-slate-700 hover:text-emerald-700 hover:border-emerald-300 flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-600" /> Comprovante CadÚnico
                  </a>
                )}
                {meuBeneficio.documento_rg_url && (
                  <a 
                    href={meuBeneficio.documento_rg_url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-semibold text-slate-700 hover:text-emerald-700 hover:border-emerald-300 flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-600" /> Documento RG/CNH
                  </a>
                )}
                {meuBeneficio.comprovante_residencia_url && (
                  <a 
                    href={meuBeneficio.comprovante_residencia_url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-semibold text-slate-700 hover:text-emerald-700 hover:border-emerald-300 flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-600" /> Comprovante de Residência
                  </a>
                )}
                {meuBeneficio.fotos_animais_url && meuBeneficio.fotos_animais_url.length > 0 && (
                  <a 
                    href={meuBeneficio.fotos_animais_url[0]} 
                    target="_blank" 
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-semibold text-slate-700 hover:text-emerald-700 hover:border-emerald-300 flex items-center gap-1"
                  >
                    <Camera className="w-3.5 h-3.5 text-emerald-600" /> Foto dos Animais/Espaço
                  </a>
                )}
              </div>
            </div>

          </div>

          {/* HISTÓRICO DE ENTREGAS */}
          {minhasEntregas.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                Histórico de Retiradas de Ração Realizadas
              </h3>

              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden text-xs">
                {minhasEntregas.map((ent) => (
                  <div key={ent.id} className="p-3.5 flex flex-wrap items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
                    <div>
                      <span className="font-mono font-bold text-slate-900 block">{ent.protocolo}</span>
                      <p className="text-slate-500 text-[11px]">{ent.tipo_racao}</p>
                    </div>

                    <div>
                      <span className="font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        {ent.quantidade_kg} KG
                      </span>
                    </div>

                    <div className="text-slate-600 font-medium">
                      {new Date(ent.data_entrega).toLocaleDateString('pt-BR')}
                    </div>

                    <div>
                      <button
                        onClick={() => {
                          setEntregaSelecionada(ent);
                          setReciboModalOpen(true);
                        }}
                        className="p-1.5 text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-300 flex items-center gap-1 font-bold text-[11px] px-2.5"
                      >
                        <Printer className="w-3.5 h-3.5" /> Ver Recibo
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* FORMULÁRIO COMPLETO DE INSCRIÇÃO COM UPLOADS */
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-6">
          
          {/* BANNER DE CRITÉRIOS LEGAIS */}
          <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-5 space-y-3">
            <h3 className="text-base font-black text-emerald-950 uppercase flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              Critérios para Ingresso no Banco de Ração Municipal:
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-emerald-900">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span><strong>Famílias de Baixa Renda:</strong> Comprovante de inscrição no Cadastro Único (CadÚnico/Bolsa Família).</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span><strong>Múltiplos Animais:</strong> Guarda responsável de 5 ou mais animais (ou protetor independente).</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span><strong>Residência em Arapongas:</strong> Apresentar comprovante de residência atualizado no município.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span><strong>Uso Exclusivo:</strong> Proibida qualquer venda, cessão comercial ou desvio da ração recebida.</span>
              </li>
            </ul>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* ETAPA 1: CATEGORIA */}
            <div className="space-y-2">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-2 border-b border-slate-100 pb-2">
                <User className="w-4 h-4 text-emerald-600" /> 1. Qual o seu perfil de solicitação?
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setTipo('baixa_renda')}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    tipo === 'baixa_renda'
                      ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 font-bold shadow-xs'
                      : 'border-slate-300 bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="block text-sm font-black">Família Baixa Renda (CadÚnico)</span>
                  <span className="block text-xs text-slate-500 mt-1">Tenho inscrição no Cadastro Único e muitos animais sob meus cuidados</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTipo('protetor_independente')}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    tipo === 'protetor_independente'
                      ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 font-bold shadow-xs'
                      : 'border-slate-300 bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="block text-sm font-black">Protetor(a) Independente</span>
                  <span className="block text-xs text-slate-500 mt-1">Mantenho lar temporário abrigando animais resgatados das ruas</span>
                </button>
              </div>
            </div>

            {/* ETAPA 2: DADOS PESSOAIS E ENDEREÇO */}
            <div className="space-y-3">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-2 border-b border-slate-100 pb-2">
                <MapPin className="w-4 h-4 text-emerald-600" /> 2. Dados do Responsável & Local dos Animais
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nome Completo *</label>
                  <input
                    type="text"
                    required
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">CPF *</label>
                  <input
                    type="text"
                    required
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value)}
                    placeholder="000.000.000-00"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Telefone / WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    placeholder="(43) 99999-9999"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>

                {tipo === 'baixa_renda' && (
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Número do NIS / Código Familiar CadÚnico *
                    </label>
                    <input
                      type="text"
                      required
                      value={nis}
                      onChange={(e) => setNis(e.target.value)}
                      placeholder="Ex: 123.45678.90-1"
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Bairro em Arapongas *</label>
                  <input
                    type="text"
                    required
                    value={bairro}
                    onChange={(e) => setBairro(e.target.value)}
                    placeholder="Ex: Jardim Primavera, Vila Araponguinha..."
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Rua / Logradouro *</label>
                  <input
                    type="text"
                    required
                    value={endereco}
                    onChange={(e) => setEndereco(e.target.value)}
                    placeholder="Rua das Camélias..."
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>

                <div className="sm:col-span-1">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Número</label>
                  <input
                    type="text"
                    value={numero}
                    onChange={(e) => setNumero(e.target.value)}
                    placeholder="120"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ponto de Referência</label>
                  <input
                    type="text"
                    value={pontoReferencia}
                    onChange={(e) => setPontoReferencia(e.target.value)}
                    placeholder="Próximo à igreja, perto do mercado..."
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>
            </div>

            {/* ETAPA 3: QUANTIDADE DE ANIMAIS E ESPAÇO */}
            <div className="space-y-3">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-2 border-b border-slate-100 pb-2">
                <Dog className="w-4 h-4 text-emerald-600" /> 3. Animais sob sua Guarda e Espaço Físico
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 flex items-center gap-1">
                      <Dog className="w-4 h-4 text-amber-600" /> Quantidade de Cães:
                    </label>
                    <span className="text-[11px] text-slate-500">Média de 7kg/mês por cão</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    max="150"
                    value={qtdCaes}
                    onChange={(e) => setQtdCaes(Number(e.target.value))}
                    className="w-20 text-center font-black text-lg p-2 bg-white border border-slate-300 rounded-xl"
                  />
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 flex items-center gap-1">
                      <Cat className="w-4 h-4 text-blue-600" /> Quantidade de Gatos:
                    </label>
                    <span className="text-[11px] text-slate-500">Média de 2.5kg/mês por gato</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    max="150"
                    value={qtdGatos}
                    onChange={(e) => setQtdGatos(Number(e.target.value))}
                    className="w-20 text-center font-black text-lg p-2 bg-white border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Como é o espaço onde os animais ficam abrigados?
                </label>
                <select
                  value={tipoEspaco}
                  onChange={(e) => setTipoEspaco(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                >
                  <option value="Quintal amplo todo cercado e murado com abrigo coberto">Quintal amplo todo cercado e murado com abrigo coberto</option>
                  <option value="Canil / Gatil estruturado de proteção animal">Canil / Gatil estruturado de proteção animal</option>
                  <option value="Interior da residência com acesso a pátio">Interior da residência com acesso a pátio</option>
                  <option value="Sítio / Chácara na zona rural">Sítio / Chácara na zona rural</option>
                </select>
              </div>

              {/* CARD DE COTA ESTIMADA */}
              <div className="bg-emerald-100/70 border border-emerald-300 p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-black uppercase text-emerald-950 block">
                    Cota Mensal Estimada para Liberação:
                  </span>
                  <span className="text-xs text-slate-600">Calculada para o total de {qtdCaes + qtdGatos} animais informados</span>
                </div>
                <div className="text-3xl font-black text-emerald-800">
                  {cotaSugerida} KG <span className="text-sm font-normal">/ mês</span>
                </div>
              </div>
            </div>

            {/* ETAPA 4: UPLOAD DE DOCUMENTOS OBRIGATÓRIOS */}
            <div className="space-y-3">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-2 border-b border-slate-100 pb-2">
                <Upload className="w-4 h-4 text-emerald-600" /> 4. Envio dos Documentos Obrigatórios
              </h3>
              <p className="text-xs text-slate-500">
                Tire uma foto nítida ou anexe o PDF dos documentos abaixo para comprovação cadastral:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* 1. Comprovante CadÚnico (se baixa renda) */}
                {tipo === 'baixa_renda' && (
                  <div className="p-4 border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl bg-slate-50 space-y-2 text-center">
                    <span className="text-xs font-bold text-slate-800 block">
                      1. Folha Resumo CadÚnico / Comprovante NIS *
                    </span>
                    {docCadunicoUrl ? (
                      <div className="flex items-center justify-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-100 py-1.5 px-3 rounded-lg">
                        <Check className="w-4 h-4" /> Comprovante CadÚnico Anexado
                      </div>
                    ) : (
                      <label className="cursor-pointer inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100">
                        <Upload className="w-3.5 h-3.5" /> Anexar Comprovante
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, setDocCadunicoUrl, 'CadÚnico')}
                        />
                      </label>
                    )}
                    <span className="text-[10px] text-slate-400 block">Extrato do aplicativo Meu CadÚnico ou CRAS</span>
                  </div>
                )}

                {/* 2. Documento de Identidade RG / CNH */}
                <div className="p-4 border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl bg-slate-50 space-y-2 text-center">
                  <span className="text-xs font-bold text-slate-800 block">
                    {tipo === 'baixa_renda' ? '2. RG ou CNH do Tutor *' : '1. RG ou CNH do Protetor *'}
                  </span>
                  {docRgUrl ? (
                    <div className="flex items-center justify-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-100 py-1.5 px-3 rounded-lg">
                      <Check className="w-4 h-4" /> Documento de Identidade Anexado
                    </div>
                  ) : (
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100">
                      <Upload className="w-3.5 h-3.5" /> Anexar RG / CNH
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, setDocRgUrl, 'RG/CNH')}
                      />
                    </label>
                  )}
                  <span className="text-[10px] text-slate-400 block">Foto da frente e verso aberta</span>
                </div>

                {/* 3. Comprovante de Residência */}
                <div className="p-4 border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl bg-slate-50 space-y-2 text-center">
                  <span className="text-xs font-bold text-slate-800 block">
                    Comprovante de Residência Atualizado *
                  </span>
                  {docResidenciaUrl ? (
                    <div className="flex items-center justify-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-100 py-1.5 px-3 rounded-lg">
                      <Check className="w-4 h-4" /> Comprovante de Residência Anexado
                    </div>
                  ) : (
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100">
                      <Upload className="w-3.5 h-3.5" /> Anexar Conta Água/Luz
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, setDocResidenciaUrl, 'Comprovante de Residência')}
                      />
                    </label>
                  )}
                  <span className="text-[10px] text-slate-400 block">Conta de luz, água ou IPTU em Arapongas</span>
                </div>

                {/* 4. Foto dos Animais / Espaço */}
                <div className="p-4 border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl bg-slate-50 space-y-2 text-center">
                  <span className="text-xs font-bold text-slate-800 block">
                    Foto dos Animais / Local onde ficam
                  </span>
                  {fotosAnimaisUrl ? (
                    <div className="flex items-center justify-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-100 py-1.5 px-3 rounded-lg">
                      <Check className="w-4 h-4" /> Foto dos Animais Carregada
                    </div>
                  ) : (
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100">
                      <Camera className="w-3.5 h-3.5" /> Tirar Foto dos Animais
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, setFotosAnimaisUrl, 'Foto dos Animais')}
                      />
                    </label>
                  )}
                  <span className="text-[10px] text-slate-400 block">Foto do pátio ou dos cães/gatos reunidos</span>
                </div>

              </div>
            </div>

            {/* ETAPA 5: DECLARAÇÃO FINAL E TERMO */}
            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Conte em poucas palavras o histórico dos animais e a sua necessidade:
                </label>
                <textarea
                  rows={2}
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Ex: Resgatei vários cães abandonados no bairro, sou autônomo e no momento não consigo arcar com toda a alimentação sozinho..."
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-2">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={termoAceito}
                    onChange={(e) => setTermoAceito(e.target.checked)}
                    className="mt-1 rounded-sm border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-slate-700 leading-relaxed">
                    Declaro sob as penas da lei que todas as informações e documentos anexados são verídicos, que a ração recebida será de <strong>uso exclusivo para alimentação dos animais sob minha guarda</strong> (sendo proibida a venda ou doação a terceiros) e autorizo a visita de agentes municipais de fiscalização animal no endereço cadastrado.
                  </span>
                </label>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <Button
                type="submit"
                variant="primary"
                disabled={enviando || !termoAceito}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-black px-8 py-3 rounded-xl shadow-md transition-all hover:scale-105"
              >
                {enviando ? 'Enviando Inscrição...' : '🚀 Enviar Inscrição para Análise da Prefeitura'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL DE RECIBO OFICIAL A4 */}
      <ReciboEntregaRacaoModal
        isOpen={reciboModalOpen}
        onClose={() => setReciboModalOpen(false)}
        entrega={entregaSelecionada}
        beneficiario={meuBeneficio}
      />

    </div>
  );
}
