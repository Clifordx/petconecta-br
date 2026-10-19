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
  Printer
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

  // Formulário
  const [tipo, setTipo] = useState<'baixa_renda' | 'protetor_independente'>('baixa_renda');
  const [nis, setNis] = useState('');
  const [qtdCaes, setQtdCaes] = useState(2);
  const [qtdGatos, setQtdGatos] = useState(0);
  const [endereco, setEndereco] = useState('');
  const [bairro, setBairro] = useState('Centro');
  const [observacoes, setObservacoes] = useState('');
  const [termoAceito, setTermoAceito] = useState(false);
  const [enviando, setEnviando] = useState(false);

  // Modal de Recibo
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
        // Carrega pets do usuário
        const { data: pets } = await supabase
          .from('pets')
          .select('id, especie, nome')
          .eq('tutor_id', user.id);

        if (pets) {
          setMeusPets(pets);
          const caes = pets.filter(p => !p.especie?.toLowerCase().includes('gato')).length;
          const gatos = pets.filter(p => p.especie?.toLowerCase().includes('gato')).length;
          if (caes > 0 || gatos > 0) {
            setQtdCaes(caes);
            setQtdGatos(gatos);
          }
        }

        // Carrega dados de endereço do perfil
        if (profile) {
          if (profile.endereco) setEndereco(profile.endereco);
          if (profile.bairro) setBairro(profile.bairro);
        }

        // Busca se o usuário já possui cadastro no Banco de Ração
        const beneficiarios = await fetchBeneficiarios();
        const encontrado = beneficiarios.find(b => 
          (b.user_id && b.user_id === user.id) || 
          (profile?.cpf && b.cpf === profile.cpf)
        );

        if (encontrado) {
          setMeuBeneficio(encontrado);
          // Busca histórico de entregas dele
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

  const cotaSugerida = calcularCotaSugerida(qtdCaes, qtdGatos);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!termoAceito) {
      toast.warning('É necessário aceitar os termos do programa municipal.');
      return;
    }

    setEnviando(true);
    try {
      const salvo = await salvarBeneficiario({
        user_id: user?.id,
        nome: profile?.nome || user?.email || 'Cidadão',
        cpf: profile?.cpf || '000.000.000-00',
        telefone: profile?.telefone || '',
        tipo,
        nis_cadunico: nis.trim() || undefined,
        endereco: endereco.trim(),
        bairro: bairro.trim(),
        cidade: 'Arapongas - PR',
        qtd_caes: qtdCaes,
        qtd_gatos: qtdGatos,
        cota_mensal_kg: cotaSugerida,
        status: 'em_analise',
        observacoes: observacoes.trim() || undefined
      });

      setMeuBeneficio(salvo);
      toast.success('Solicitação enviada com sucesso! A Secretaria de Meio Ambiente avaliará seu pedido.');
    } catch {
      toast.error('Erro ao enviar solicitação');
    } finally {
      setEnviando(false);
    }
  };

  const entregaDesteMes = minhasEntregas.find(e => e.mes_referencia === mesAtual);

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* CABEÇALHO */}
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
          Auxílio nutricional gratuito para famílias em vulnerabilidade social e protetores independentes com múltiplos animais resgatados sob sua guarda.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500 font-medium">Carregando informações do programa...</p>
        </div>
      ) : meuBeneficio ? (
        /* CARD QUANDO O USUÁRIO JÁ POSSUI BENEFÍCIO (APROVADO OU EM ANÁLISE) */
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Situação do seu Cadastro
                </span>
                <h2 className="text-xl font-black text-slate-900 mt-0.5">
                  {meuBeneficio.nome}
                </h2>
                <p className="text-xs text-slate-500">
                  Categoria: <strong>{meuBeneficio.tipo === 'protetor_independente' ? 'Protetor Independente' : 'Família Baixa Renda (CadÚnico)'}</strong>
                </p>
              </div>

              <div>
                {meuBeneficio.status === 'aprovado' ? (
                  <span className="px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-full font-black text-xs uppercase flex items-center gap-1.5 border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Cota Mensal Aprovada
                  </span>
                ) : meuBeneficio.status === 'em_analise' ? (
                  <span className="px-3 py-1.5 bg-amber-100 text-amber-800 rounded-full font-black text-xs uppercase flex items-center gap-1.5 border border-amber-200">
                    <Clock className="w-4 h-4 text-amber-600" /> Em Análise pela Prefeitura
                  </span>
                ) : (
                  <span className="px-3 py-1.5 bg-red-100 text-red-800 rounded-full font-black text-xs uppercase flex items-center gap-1.5 border border-red-200">
                    <AlertTriangle className="w-4 h-4 text-red-600" /> Cadastro Suspenso
                  </span>
                )}
              </div>
            </div>

            {/* STATUS DO MÊS ATUAL */}
            {meuBeneficio.status === 'aprovado' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-2">
                  <span className="text-xs font-bold text-emerald-900 uppercase block">
                    Cota Mensal Autorizada
                  </span>
                  <div className="text-3xl font-black text-emerald-800">
                    {meuBeneficio.cota_mensal_kg} KG <span className="text-sm font-semibold text-emerald-600">/ mês</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Calculada para o sustento de <strong>{meuBeneficio.qtd_caes} cães</strong> e <strong>{meuBeneficio.qtd_gatos} gatos</strong>.
                  </p>
                </div>

                <div className={`rounded-xl p-4 border space-y-2 ${
                  entregaDesteMes 
                    ? 'bg-blue-50 border-blue-200 text-blue-900' 
                    : 'bg-amber-50 border-amber-200 text-amber-900'
                }`}>
                  <span className="text-xs font-bold uppercase block">
                    Disponibilidade em {mesAtual}
                  </span>
                  {entregaDesteMes ? (
                    <div>
                      <h4 className="text-base font-black text-blue-900 flex items-center gap-1.5">
                        <CheckCircle2 className="w-5 h-5 text-blue-600" />
                        Retirada Concluída ({entregaDesteMes.quantidade_kg} KG)
                      </h4>
                      <p className="text-xs text-blue-700 mt-1">
                        Você já retirou sua cota em {new Date(entregaDesteMes.data_entrega).toLocaleDateString('pt-BR')}. A próxima cota estará liberada no próximo mês.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <h4 className="text-base font-black text-amber-900 flex items-center gap-1.5">
                        <Clock className="w-5 h-5 text-amber-600" />
                        Disponível para Retirada!
                      </h4>
                      <p className="text-xs text-amber-800 mt-1">
                        Sua cota deste mês está disponível no galpão da Secretaria Municipal de Meio Ambiente. Leve seu documento com foto.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {meuBeneficio.status === 'em_analise' && (
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-xs text-amber-900 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-600" /> Sua solicitação está sendo avaliada pela equipe técnica municipal
                </p>
                <p>
                  Assim que aprovado, sua cota mensal de ração será liberada para retirada no almoxarifado municipal de Arapongas.
                </p>
              </div>
            )}
          </div>

          {/* HISTÓRICO DE ENTREGAS ANTERIORES */}
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
        /* FORMULÁRIO DE NOVA SOLICITAÇÃO */
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-lg font-black text-slate-900">
              Solicitar Inclusão no Banco de Ração Municipal
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Preencha os dados abaixo para submeter sua solicitação de auxílio à Secretaria de Meio Ambiente.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* CATEGORIA */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Qual o seu perfil de atendimento? *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTipo('baixa_renda')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    tipo === 'baixa_renda'
                      ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 font-bold shadow-xs'
                      : 'border-slate-300 bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="block text-xs font-black">Família de Baixa Renda (CadÚnico)</span>
                  <span className="block text-[11px] text-slate-500 mt-0.5">Tutores inscritos em programas sociais com múltiplos pets</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTipo('protetor_independente')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    tipo === 'protetor_independente'
                      ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 font-bold shadow-xs'
                      : 'border-slate-300 bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="block text-xs font-black">Protetor(a) Independente</span>
                  <span className="block text-[11px] text-slate-500 mt-0.5">Lares temporários abrigando animais resgatados da rua</span>
                </button>
              </div>
            </div>

            {/* DADOS SOCIAIS */}
            {tipo === 'baixa_renda' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Número do NIS / CadÚnico *
                </label>
                <input
                  type="text"
                  required
                  value={nis}
                  onChange={(e) => setNis(e.target.value)}
                  placeholder="Ex: 123.45678.90-1"
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>
            )}

            {/* ENDEREÇO */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Bairro em Arapongas *</label>
                <input
                  type="text"
                  required
                  value={bairro}
                  onChange={(e) => setBairro(e.target.value)}
                  placeholder="Ex: Vila Araponguinha, Jardim Primavera..."
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Endereço Completo</label>
                <input
                  type="text"
                  value={endereco}
                  onChange={(e) => setEndereco(e.target.value)}
                  placeholder="Rua, número e complemento..."
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>
            </div>

            {/* QUANTIDADE DE ANIMAIS E COTA CALCULADA */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Wheat className="w-4 h-4 text-emerald-600" />
                Quantos animais você tutela atualmente?
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
                    <Dog className="w-3.5 h-3.5 text-amber-600" /> Quantidade de Cães:
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={qtdCaes}
                    onChange={(e) => setQtdCaes(Number(e.target.value))}
                    className="w-full text-sm font-black p-2 bg-white border border-slate-300 rounded-xl text-center"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
                    <Cat className="w-3.5 h-3.5 text-blue-600" /> Quantidade de Gatos:
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={qtdGatos}
                    onChange={(e) => setQtdGatos(Number(e.target.value))}
                    className="w-full text-sm font-black p-2 bg-white border border-slate-300 rounded-xl text-center"
                  />
                </div>
              </div>

              <div className="bg-emerald-100/60 border border-emerald-300 p-3 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-black uppercase text-emerald-950 block">
                    Cota Mensal Estimada pelo Sistema:
                  </span>
                  <span className="text-xs text-slate-600 font-medium">Com base nas necessidades nutricionais dos seus animais</span>
                </div>
                <div className="text-2xl font-black text-emerald-800">
                  {cotaSugerida} KG <span className="text-xs font-normal">/ mês</span>
                </div>
              </div>
            </div>

            {/* OBSERVAÇÕES */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Conte brevemente a situação dos animais (Histórico de resgate / Vulnerabilidade):
              </label>
              <textarea
                rows={3}
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Ex: Resgatei 5 filhotes abandonados na linha férrea e cuido de outros 3 animais idosos na minha casa..."
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>

            {/* TERMO DE COMPROMISSO */}
            <div className="p-3 bg-slate-100 rounded-xl text-xs space-y-2">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={termoAceito}
                  onChange={(e) => setTermoAceito(e.target.checked)}
                  className="mt-0.5 rounded-sm border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-slate-700 leading-snug">
                  Declaro que as informações são verdadeiras, que a ração será de uso <strong>exclusivo para alimentação dos animais sob minha guarda</strong> (sendo proibida a venda ou doação a terceiros) e autorizo a visita de agentes municipais para fiscalização do bem-estar dos pets.
                </span>
              </label>
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                type="submit"
                variant="primary"
                disabled={enviando || !termoAceito}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-6 py-2.5"
              >
                {enviando ? 'Enviando Pedido...' : '🚀 Enviar Solicitação para a Prefeitura'}
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
