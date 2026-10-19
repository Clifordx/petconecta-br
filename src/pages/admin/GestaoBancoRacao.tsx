import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Search, 
  Plus, 
  Printer, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Download, 
  User, 
  Building2, 
  Dog, 
  Cat, 
  Filter, 
  Wheat,
  Boxes,
  Eye,
  Camera,
  FileText,
  Calendar,
  X,
  HeartHandshake
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  BeneficiarioRacao, 
  EstoqueRacao, 
  EntregaRacao, 
  fetchBeneficiarios, 
  fetchEstoqueRacao, 
  fetchEntregasRacao, 
  salvarBeneficiario, 
  atualizarStatusBeneficiario, 
  adicionarEntradaEstoque, 
  registrarEntregaRacao, 
  calcularCotaSugerida,
  verificarRetiradaNoMes
} from '@/lib/bancoRacao';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import ReciboEntregaRacaoModal from '@/components/racao/ReciboEntregaRacaoModal';

export default function GestaoBancoRacao() {
  const [activeTab, setActiveTab] = useState<'entregas' | 'beneficiarios' | 'estoque'>('entregas');
  const [loading, setLoading] = useState(true);

  // Dados
  const [beneficiarios, setBeneficiarios] = useState<BeneficiarioRacao[]>([]);
  const [estoque, setEstoque] = useState<EstoqueRacao[]>([]);
  const [entregas, setEntregas] = useState<EntregaRacao[]>([]);

  // Filtros
  const [busca, setBusca] = useState('');
  const [mesFiltro, setMesFiltro] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  // Modal de Entrega
  const [modalEntregaOpen, setModalEntregaOpen] = useState(false);
  const [beneficiarioIdSelecionado, setBeneficiarioIdSelecionado] = useState('');
  const [qtdKgEntrega, setQtdKgEntrega] = useState(15);
  const [tipoRacaoEntrega, setTipoRacaoEntrega] = useState('Ração Canina Adulto (Premium)');
  const [responsavelEntrega, setResponsavelEntrega] = useState('Secretaria de Meio Ambiente / Aline Santos');
  const [obsEntrega, setObsEntrega] = useState('');
  const [salvandoEntrega, setSalvandoEntrega] = useState(false);

  // Modal de Entrada de Estoque
  const [modalEstoqueOpen, setModalEstoqueOpen] = useState(false);
  const [novaEspecie, setNovaEspecie] = useState<'cao' | 'gato'>('cao');
  const [novaFaixaEtaria, setNovaFaixaEtaria] = useState<'adulto' | 'filhote'>('adulto');
  const [novaQtdKg, setNovaQtdKg] = useState(250);
  const [novaMarca, setNovaMarca] = useState('');
  const [novaOrigem, setNovaOrigem] = useState<'compra_municipal' | 'doacao_empresa' | 'feira_adocao' | 'apreensao'>('compra_municipal');

  // Modal de Novo / Editar Beneficiário
  const [modalBeneficiarioOpen, setModalBeneficiarioOpen] = useState(false);
  // Modal de Análise de Documentos do Beneficiário
  const [modalAnaliseOpen, setModalAnaliseOpen] = useState(false);
  const [beneficiarioAnalise, setBeneficiarioAnalise] = useState<BeneficiarioRacao | null>(null);
  const [cotaAprovadaKg, setCotaAprovadaKg] = useState(30);
  const [motivoRejeicao, setMotivoRejeicao] = useState('');

  const [beneficiarioEditando, setBeneficiarioEditando] = useState<Partial<BeneficiarioRacao>>({
    tipo: 'baixa_renda',
    bairro: 'Centro',
    cidade: 'Arapongas - PR',
    qtd_caes: 2,
    qtd_gatos: 0,
    status: 'aprovado'
  });

  // Recibo Modal
  const [reciboModalOpen, setReciboModalOpen] = useState(false);
  const [entregaRecibo, setEntregaRecibo] = useState<EntregaRacao | null>(null);

  useEffect(() => {
    carregarTudo();
  }, []);

  const carregarTudo = async () => {
    try {
      setLoading(true);
      const [bData, eData, entData] = await Promise.all([
        fetchBeneficiarios(),
        fetchEstoqueRacao(),
        fetchEntregasRacao()
      ]);
      setBeneficiarios(bData);
      setEstoque(eData);
      setEntregas(entData);
    } catch {
      toast.error('Erro ao carregar dados do Banco de Ração');
    } finally {
      setLoading(false);
    }
  };

  // Abre modal de entrega com pré-seleção
  const abrirNovaEntrega = (bId?: string) => {
    const aprovados = beneficiarios.filter(b => b.status === 'aprovado');
    const alvoId = bId || (aprovados[0]?.id || '');
    setBeneficiarioIdSelecionado(alvoId);
    
    const alvo = beneficiarios.find(b => b.id === alvoId);
    if (alvo) {
      setQtdKgEntrega(alvo.cota_mensal_kg || 15);
      setTipoRacaoEntrega(alvo.qtd_caes >= alvo.qtd_gatos ? 'Ração Canina Adulto (Premium)' : 'Ração Felina Adulto');
    }
    setModalEntregaOpen(true);
  };

  // Executa entrega
  const handleSalvarEntrega = async (e: React.FormEvent) => {
    e.preventDefault();
    const ben = beneficiarios.find(b => b.id === beneficiarioIdSelecionado);
    if (!ben) {
      toast.error('Selecione um beneficiário válido.');
      return;
    }

    setSalvandoEntrega(true);
    try {
      const entregaSalva = await registrarEntregaRacao({
        beneficiario: ben,
        quantidade_kg: Number(qtdKgEntrega),
        tipo_racao: tipoRacaoEntrega,
        responsavel_entrega: responsavelEntrega,
        mes_referencia: mesFiltro,
        observacoes: obsEntrega.trim() || undefined
      });

      toast.success(`Entrega de ${qtdKgEntrega} KG registrada para ${ben.nome}!`);
      setModalEntregaOpen(false);
      setObsEntrega('');
      await carregarTudo();

      // Já abre o recibo oficial A4 imediatamente para impressão!
      setEntregaRecibo(entregaSalva);
      setReciboModalOpen(true);
    } catch (err: any) {
      toast.error('Erro ao registrar entrega: ' + err.message);
    } finally {
      setSalvandoEntrega(false);
    }
  };

  // Salva nova entrada de estoque
  const handleSalvarEntradaEstoque = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adicionarEntradaEstoque({
        especie: novaEspecie,
        faixa_etaria: novaFaixaEtaria,
        quantidade_kg: Number(novaQtdKg),
        marca: novaMarca.trim() || undefined,
        origem: novaOrigem,
        data_entrada: new Date().toISOString().split('T')[0]
      });

      toast.success(`Entrada de ${novaQtdKg} KG adicionada ao estoque municipal!`);
      setModalEstoqueOpen(false);
      setNovaMarca('');
      await carregarTudo();
    } catch {
      toast.error('Erro ao adicionar estoque');
    }
  };

  // Salva beneficiário
  const handleSalvarBeneficiario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!beneficiarioEditando.nome || !beneficiarioEditando.cpf) {
      toast.error('Preencha nome e CPF do beneficiário');
      return;
    }

    try {
      const cota = beneficiarioEditando.cota_mensal_kg || calcularCotaSugerida(
        beneficiarioEditando.qtd_caes || 0,
        beneficiarioEditando.qtd_gatos || 0
      );

      await salvarBeneficiario({
        ...beneficiarioEditando,
        cota_mensal_kg: cota
      });

      toast.success('Beneficiário salvo com sucesso!');
      setModalBeneficiarioOpen(false);
      await carregarTudo();
    } catch {
      toast.error('Erro ao salvar beneficiário');
    }
  };

  // Totais para os KPIs
  const totalKgEstoque = estoque.reduce((acc, curr) => acc + curr.quantidade_kg, 0);
  const beneficiariosAtivos = beneficiarios.filter(b => b.status === 'aprovado');
  const totalAnimaisAtendidos = beneficiariosAtivos.reduce((acc, curr) => acc + (curr.qtd_caes + curr.qtd_gatos), 0);
  const entregasDoMes = entregas.filter(e => e.mes_referencia === mesFiltro);
  const totalKgEntregueMes = entregasDoMes.reduce((acc, curr) => acc + curr.quantidade_kg, 0);

  // Beneficiário selecionado na entrega (para checar cota)
  const benSelecionadoObj = beneficiarios.find(b => b.id === beneficiarioIdSelecionado);

  const handleExportarCSV = () => {
    const cabecalho = 'Protocolo,Beneficiário,CPF,Bairro,Mês,Data,QuantidadeKG,TipoRação,Responsável\n';
    const linhas = entregas.map(e => 
      `"${e.protocolo}","${e.beneficiario_nome}","${e.beneficiario_cpf}","${e.beneficiario_bairro}","${e.mes_referencia}","${new Date(e.data_entrega).toLocaleDateString('pt-BR')}","${e.quantidade_kg}","${e.tipo_racao}","${e.responsavel_entrega}"`
    ).join('\n');

    const blob = new Blob([cabecalho + linhas], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-entregas-racao-${mesFiltro}.csv`;
    a.click();
    toast.success('Relatório CSV exportado com sucesso!');
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      
      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Package className="w-7 h-7 text-emerald-600" />
            Banco de Ração Municipal Solidário
          </h1>
          <p className="text-sm text-slate-500">
            Segurança alimentar animal para protetores independentes e famílias de baixa renda em Arapongas - PR.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportarCSV}
            className="text-xs gap-1.5"
          >
            <Download className="w-4 h-4" /> Exportar Prestação de Contas
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setModalEstoqueOpen(true)}
            className="text-xs gap-1.5 border-emerald-300 text-emerald-800 bg-emerald-50 hover:bg-emerald-100"
          >
            <Boxes className="w-4 h-4 text-emerald-600" /> + Entrada Estoque
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => abrirNovaEntrega()}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5 font-bold shadow-sm"
          >
            <Plus className="w-4 h-4" /> Registrar Retirada de Ração
          </Button>
        </div>
      </div>

      {/* CARDS DE RESUMO E INDICADORES (KPIS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Estoque Atual</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{totalKgEstoque.toLocaleString('pt-BR')} KG</h3>
            <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Disponível no galpão</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Package className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Beneficiários Ativos</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{beneficiariosAtivos.length}</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Protetores & Famílias</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <User className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Animais Alimentados</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{totalAnimaisAtendidos}</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Sob tutela do programa</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <HeartHandshake className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Entregas em {mesFiltro}</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{totalKgEntregueMes} KG</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">{entregasDoMes.length} retiradas registradas</p>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <FileText className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* ABAS DE NAVEGAÇÃO INTERNA */}
      <div className="flex border-b border-slate-200 gap-4">
        <button
          onClick={() => setActiveTab('entregas')}
          className={`pb-3 font-bold text-xs uppercase tracking-wider transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'entregas'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" /> Entregas & Recibos ({entregas.length})
        </button>

        <button
          onClick={() => setActiveTab('beneficiarios')}
          className={`pb-3 font-bold text-xs uppercase tracking-wider transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'beneficiarios'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <User className="w-4 h-4" /> Famílias & Protetores ({beneficiarios.length})
        </button>

        <button
          onClick={() => setActiveTab('estoque')}
          className={`pb-3 font-bold text-xs uppercase tracking-wider transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'estoque'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Boxes className="w-4 h-4" /> Estoque de Ração ({totalKgEstoque} KG)
        </button>
      </div>

      {/* CONTEÚDO DA ABA 1: ENTREGAS & RETIRADAS */}
      {activeTab === 'entregas' && (
        <div className="space-y-4">
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-[240px]">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar entrega por nome, CPF ou protocolo..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <input
                type="month"
                value={mesFiltro}
                onChange={(e) => setMesFiltro(e.target.value)}
                className="text-xs p-1.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-700"
              />
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() => abrirNovaEntrega()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1 font-bold"
            >
              <Plus className="w-3.5 h-3.5" /> Nova Retirada
            </Button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-extrabold uppercase text-[11px]">
                <tr>
                  <th className="p-3.5">Protocolo</th>
                  <th className="p-3.5">Beneficiário / CPF</th>
                  <th className="p-3.5">Bairro</th>
                  <th className="p-3.5">Volume (KG)</th>
                  <th className="p-3.5">Tipo de Ração</th>
                  <th className="p-3.5">Data da Entrega</th>
                  <th className="p-3.5 text-right">Recibo A4</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {entregas
                  .filter(e => {
                    const matchBusca = 
                      e.beneficiario_nome.toLowerCase().includes(busca.toLowerCase()) ||
                      e.protocolo.toLowerCase().includes(busca.toLowerCase()) ||
                      e.beneficiario_cpf.includes(busca);
                    const matchMes = !mesFiltro || e.mes_referencia === mesFiltro;
                    return matchBusca && matchMes;
                  })
                  .map((ent) => (
                    <tr key={ent.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-slate-900">
                        {ent.protocolo}
                      </td>
                      <td className="p-3.5">
                        <p className="font-black text-slate-900 text-sm">{ent.beneficiario_nome}</p>
                        <p className="text-[11px] text-slate-500 font-mono">CPF: {ent.beneficiario_cpf}</p>
                      </td>
                      <td className="p-3.5 font-medium text-slate-700">
                        {ent.beneficiario_bairro}
                      </td>
                      <td className="p-3.5">
                        <span className="font-black text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-md text-xs border border-emerald-200">
                          {ent.quantidade_kg} KG
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-600 font-medium">
                        {ent.tipo_racao}
                      </td>
                      <td className="p-3.5 text-slate-700 font-medium">
                        {new Date(ent.data_entrega).toLocaleDateString('pt-BR')} às {new Date(ent.data_entrega).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => {
                            setEntregaRecibo(ent);
                            setReciboModalOpen(true);
                          }}
                          title="Imprimir Recibo Oficial A4"
                          className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg transition-colors inline-flex items-center gap-1 font-semibold text-[11px] px-2.5"
                        >
                          <Printer className="w-3.5 h-3.5 text-slate-600" /> Recibo
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CONTEÚDO DA ABA 2: BENEFICIÁRIOS & PROTETORES */}
      {activeTab === 'beneficiarios' && (
        <div className="space-y-4">
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar beneficiário por nome, CPF ou bairro..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setBeneficiarioEditando({
                  tipo: 'baixa_renda',
                  bairro: 'Centro',
                  cidade: 'Arapongas - PR',
                  qtd_caes: 2,
                  qtd_gatos: 0,
                  status: 'aprovado'
                });
                setModalBeneficiarioOpen(true);
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1 font-bold"
            >
              <Plus className="w-3.5 h-3.5" /> + Cadastrar Beneficiário
            </Button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-extrabold uppercase text-[11px]">
                <tr>
                  <th className="p-3.5">Nome / Tipo</th>
                  <th className="p-3.5">CPF / NIS</th>
                  <th className="p-3.5">Bairro</th>
                  <th className="p-3.5">Animais Sob Guarda</th>
                  <th className="p-3.5">Cota Mensal</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {beneficiarios
                  .filter(b => 
                    b.nome.toLowerCase().includes(busca.toLowerCase()) ||
                    b.cpf.includes(busca) ||
                    b.bairro.toLowerCase().includes(busca.toLowerCase())
                  )
                  .map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3.5">
                        <p className="font-black text-slate-900 text-sm">{b.nome}</p>
                        <span className={`inline-block text-[10px] font-bold uppercase mt-0.5 px-1.5 py-0.5 rounded-sm ${
                          b.tipo === 'protetor_independente' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {b.tipo === 'protetor_independente' ? 'Protetor Independente' : 'Baixa Renda (CadÚnico)'}
                        </span>
                      </td>

                      <td className="p-3.5 font-mono">
                        <p className="text-slate-900 font-bold">{b.cpf}</p>
                        {b.nis_cadunico && <p className="text-[11px] text-slate-500">NIS: {b.nis_cadunico}</p>}
                      </td>

                      <td className="p-3.5 font-medium text-slate-700">
                        {b.bairro}
                      </td>

                      <td className="p-3.5">
                        <div className="flex items-center gap-3 text-slate-700 font-semibold">
                          <span className="flex items-center gap-1"><Dog className="w-3.5 h-3.5 text-amber-600" /> {b.qtd_caes} cães</span>
                          <span className="flex items-center gap-1"><Cat className="w-3.5 h-3.5 text-blue-600" /> {b.qtd_gatos} gatos</span>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <span className="font-black text-slate-900 text-sm">{b.cota_mensal_kg} KG</span>
                        <span className="text-[10px] text-slate-500 block">/mês</span>
                      </td>

                      <td className="p-3.5">
                        {b.status === 'aprovado' ? (
                          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px] uppercase border border-emerald-200">
                            Aprovado
                          </span>
                        ) : b.status === 'em_analise' ? (
                          <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full font-bold text-[10px] uppercase border border-amber-200">
                            Em Análise
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-red-100 text-red-800 rounded-full font-bold text-[10px] uppercase border border-red-200">
                            Suspenso
                          </span>
                        )}
                      </td>

                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setBeneficiarioAnalise(b);
                              setCotaAprovadaKg(b.cota_mensal_kg || 30);
                              setModalAnaliseOpen(true);
                            }}
                            title="Ver Documentos e Analisar Inscrição"
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-lg text-xs font-bold flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" /> Analisar
                          </button>

                          {b.status === 'aprovado' && (
                            <button
                              onClick={() => abrirNovaEntrega(b.id)}
                              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-bold"
                            >
                              Entregar Ração
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CONTEÚDO DA ABA 3: ESTOQUE DE RAÇÃO */}
      {activeTab === 'estoque' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {estoque.map((item) => (
              <div key={item.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
                    {item.especie === 'cao' ? '🐶 Cães' : '🐱 Gatos'} • {item.faixa_etaria}
                  </span>
                  <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-full capitalize">
                    {item.origem.replace('_', ' ')}
                  </span>
                </div>
                <h3 className="text-2xl font-black text-slate-900">{item.quantidade_kg} KG</h3>
                <p className="text-xs text-slate-600 font-medium">Marca: {item.marca || 'Padrão Municipal'}</p>
                <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400">
                  Entrada em: {new Date(item.data_entrada).toLocaleDateString('pt-BR')}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Wheat className="w-8 h-8 text-amber-600 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-amber-950">
                  Estoque abastecido por licitações públicas e doações parceiras
                </h4>
                <p className="text-xs text-amber-800">
                  Todas as entradas de ração recebem rastreio por lote e são auditadas mensalmente pela Secretaria de Meio Ambiente.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setModalEstoqueOpen(true)}
              className="text-xs font-bold bg-white border-amber-300 text-amber-900"
            >
              + Nova Entrada
            </Button>
          </div>
        </div>
      )}

      {/* MODAL DE REGISTRAR ENTREGA */}
      {modalEntregaOpen && (
        <Modal
          isOpen={modalEntregaOpen}
          onClose={() => setModalEntregaOpen(false)}
          title="Registrar Retirada de Ração Municipal"
        >
          <form onSubmit={handleSalvarEntrega} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Beneficiário Aprovado *
              </label>
              <select
                required
                value={beneficiarioIdSelecionado}
                onChange={(e) => {
                  const bId = e.target.value;
                  setBeneficiarioIdSelecionado(bId);
                  const alvo = beneficiarios.find(b => b.id === bId);
                  if (alvo) setQtdKgEntrega(alvo.cota_mensal_kg || 15);
                }}
                className="w-full text-xs font-semibold p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
              >
                <option value="">Selecione o beneficiário...</option>
                {beneficiarios.filter(b => b.status === 'aprovado').map(b => (
                  <option key={b.id} value={b.id}>
                    {b.nome} ({b.bairro}) • Cota: {b.cota_mensal_kg} KG/mês
                  </option>
                ))}
              </select>
            </div>

            {benSelecionadoObj && (
              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-xs space-y-1">
                <p><strong>Tutor / Protetor:</strong> {benSelecionadoObj.nome} (CPF: {benSelecionadoObj.cpf})</p>
                <p><strong>Animais:</strong> {benSelecionadoObj.qtd_caes} cães e {benSelecionadoObj.qtd_gatos} gatos</p>
                <p><strong>Cota Autorizada:</strong> {benSelecionadoObj.cota_mensal_kg} KG por mês</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Quantidade a Entregar (KG) *
                </label>
                <input
                  type="number"
                  min="1"
                  max="300"
                  required
                  value={qtdKgEntrega}
                  onChange={(e) => setQtdKgEntrega(Number(e.target.value))}
                  className="w-full text-sm font-black p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-emerald-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mês de Referência *
                </label>
                <input
                  type="month"
                  required
                  value={mesFiltro}
                  onChange={(e) => setMesFiltro(e.target.value)}
                  className="w-full text-xs font-bold p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tipo e Especificação da Ração *
              </label>
              <select
                value={tipoRacaoEntrega}
                onChange={(e) => setTipoRacaoEntrega(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
              >
                <option value="Ração Canina Adulto (Premium)">Ração Canina Adulto (Premium)</option>
                <option value="Ração Canina Filhote (Crescimento)">Ração Canina Filhote (Crescimento)</option>
                <option value="Ração Felina Adulto (Premium)">Ração Felina Adulto (Premium)</option>
                <option value="Ração Felina Filhote">Ração Felina Filhote</option>
                <option value="Ração Mista Canina + Felina">Ração Mista Canina + Felina</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Servidor Responsável pela Entrega *
              </label>
              <input
                type="text"
                required
                value={responsavelEntrega}
                onChange={(e) => setResponsavelEntrega(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Observações Adicionais:
              </label>
              <textarea
                rows={2}
                value={obsEntrega}
                onChange={(e) => setObsEntrega(e.target.value)}
                placeholder="Ex: Apresentou CadÚnico e comprovante de endereço. Retirou no galpão..."
                className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setModalEntregaOpen(false)}
                className="text-xs"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={salvandoEntrega}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
              >
                {salvandoEntrega ? 'Registrando...' : 'Confirmar & Gerar Recibo A4'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL DE ENTRADA DE ESTOQUE */}
      {modalEstoqueOpen && (
        <Modal
          isOpen={modalEstoqueOpen}
          onClose={() => setModalEstoqueOpen(false)}
          title="Nova Entrada de Ração no Estoque Municipal"
        >
          <form onSubmit={handleSalvarEntradaEstoque} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Espécie</label>
                <select
                  value={novaEspecie}
                  onChange={(e: any) => setNovaEspecie(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                >
                  <option value="cao">Cão (Canino)</option>
                  <option value="gato">Gato (Felino)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Faixa Etária</label>
                <select
                  value={novaFaixaEtaria}
                  onChange={(e: any) => setNovaFaixaEtaria(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                >
                  <option value="adulto">Adulto</option>
                  <option value="filhote">Filhote</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Quantidade (KG) *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={novaQtdKg}
                  onChange={(e) => setNovaQtdKg(Number(e.target.value))}
                  className="w-full text-sm font-black p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-emerald-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Origem *</label>
                <select
                  value={novaOrigem}
                  onChange={(e: any) => setNovaOrigem(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                >
                  <option value="compra_municipal">Compra Pública (Licitação)</option>
                  <option value="doacao_empresa">Doação de Empresa / Fábrica</option>
                  <option value="feira_adocao">Arrecadação em Feira</option>
                  <option value="apreensao">Apreensão / Multa Ambiental</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Marca / Fornecedor</label>
              <input
                type="text"
                placeholder="Ex: NutriPet, Special Dog, Pedigree..."
                value={novaMarca}
                onChange={(e) => setNovaMarca(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setModalEstoqueOpen(false)}
                className="text-xs"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
              >
                Adicionar ao Estoque
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL DE CADASTRO/EDIÇÃO DE BENEFICIÁRIO */}
      {modalBeneficiarioOpen && (
        <Modal
          isOpen={modalBeneficiarioOpen}
          onClose={() => setModalBeneficiarioOpen(false)}
          title="Cadastrar Beneficiário do Banco de Ração"
        >
          <form onSubmit={handleSalvarBeneficiario} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nome Completo *</label>
              <input
                type="text"
                required
                value={beneficiarioEditando.nome || ''}
                onChange={(e) => setBeneficiarioEditando({ ...beneficiarioEditando, nome: e.target.value })}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">CPF *</label>
                <input
                  type="text"
                  required
                  placeholder="000.000.000-00"
                  value={beneficiarioEditando.cpf || ''}
                  onChange={(e) => setBeneficiarioEditando({ ...beneficiarioEditando, cpf: e.target.value })}
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Telefone *</label>
                <input
                  type="text"
                  required
                  placeholder="(43) 99999-9999"
                  value={beneficiarioEditando.telefone || ''}
                  onChange={(e) => setBeneficiarioEditando({ ...beneficiarioEditando, telefone: e.target.value })}
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Categoria *</label>
                <select
                  value={beneficiarioEditando.tipo || 'baixa_renda'}
                  onChange={(e: any) => setBeneficiarioEditando({ ...beneficiarioEditando, tipo: e.target.value })}
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-xl"
                >
                  <option value="baixa_renda">Família Baixa Renda (CadÚnico)</option>
                  <option value="protetor_independente">Protetor Independente (Lar Temporário)</option>
                  <option value="ong">ONG / Entidade Animal</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">NIS / CadÚnico (Opcional)</label>
                <input
                  type="text"
                  value={beneficiarioEditando.nis_cadunico || ''}
                  onChange={(e) => setBeneficiarioEditando({ ...beneficiarioEditando, nis_cadunico: e.target.value })}
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Bairro *</label>
                <input
                  type="text"
                  required
                  value={beneficiarioEditando.bairro || ''}
                  onChange={(e) => setBeneficiarioEditando({ ...beneficiarioEditando, bairro: e.target.value })}
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Endereço</label>
                <input
                  type="text"
                  value={beneficiarioEditando.endereco || ''}
                  onChange={(e) => setBeneficiarioEditando({ ...beneficiarioEditando, endereco: e.target.value })}
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Qtd. Cães</label>
                <input
                  type="number"
                  min="0"
                  value={beneficiarioEditando.qtd_caes ?? 0}
                  onChange={(e) => setBeneficiarioEditando({ ...beneficiarioEditando, qtd_caes: Number(e.target.value) })}
                  className="w-full text-xs p-1.5 bg-white border border-slate-300 rounded-lg text-center font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Qtd. Gatos</label>
                <input
                  type="number"
                  min="0"
                  value={beneficiarioEditando.qtd_gatos ?? 0}
                  onChange={(e) => setBeneficiarioEditando({ ...beneficiarioEditando, qtd_gatos: Number(e.target.value) })}
                  className="w-full text-xs p-1.5 bg-white border border-slate-300 rounded-lg text-center font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Cota (KG/mês)</label>
                <input
                  type="number"
                  min="5"
                  value={beneficiarioEditando.cota_mensal_kg ?? calcularCotaSugerida(beneficiarioEditando.qtd_caes || 0, beneficiarioEditando.qtd_gatos || 0)}
                  onChange={(e) => setBeneficiarioEditando({ ...beneficiarioEditando, cota_mensal_kg: Number(e.target.value) })}
                  className="w-full text-xs p-1.5 bg-white border border-emerald-500 rounded-lg text-center font-black text-emerald-800"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setModalBeneficiarioOpen(false)}
                className="text-xs"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
              >
                Salvar Beneficiário
              </Button>
            </div>
          </form>
        </Modal>
      )}

            {/* MODAL DE ANÁLISE DE DOCUMENTOS E APROVAÇÃO */}
      {modalAnaliseOpen && beneficiarioAnalise && (
        <Modal
          isOpen={modalAnaliseOpen}
          onClose={() => setModalAnaliseOpen(false)}
          title={`Análise de Inscrição: ${beneficiarioAnalise.nome}`}
        >
          <div className="space-y-4 max-h-[75vh] overflow-y-auto p-1">
            
            {/* DADOS BÁSICOS */}
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-500 uppercase">Protocolo:</span>
                <span className="font-mono font-black text-slate-900 bg-white px-2 py-0.5 rounded-sm border border-slate-300">
                  {beneficiarioAnalise.protocolo_solicitacao || 'INS-RAC-2026'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200">
                <div>
                  <span className="text-slate-500 block">CPF:</span>
                  <span className="font-mono font-bold text-slate-900">{beneficiarioAnalise.cpf}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Telefone:</span>
                  <span className="font-bold text-slate-900">{beneficiarioAnalise.telefone}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Categoria:</span>
                  <span className="font-bold text-emerald-800 capitalize">{beneficiarioAnalise.tipo.replace('_', ' ')}</span>
                </div>
                {beneficiarioAnalise.nis_cadunico && (
                  <div>
                    <span className="text-slate-500 block">NIS CadÚnico:</span>
                    <span className="font-mono font-bold text-slate-900">{beneficiarioAnalise.nis_cadunico}</span>
                  </div>
                )}
                <div className="col-span-2">
                  <span className="text-slate-500 block">Endereço e Bairro:</span>
                  <span className="font-semibold text-slate-900">{beneficiarioAnalise.endereco} - {beneficiarioAnalise.bairro} ({beneficiarioAnalise.cidade})</span>
                </div>
                <div className="col-span-2 pt-1 border-t border-slate-200 flex gap-4 font-bold text-slate-800">
                  <span>🐕 {beneficiarioAnalise.qtd_caes} cães</span>
                  <span>🐈 {beneficiarioAnalise.qtd_gatos} gatos</span>
                  <span>Total: {beneficiarioAnalise.qtd_caes + beneficiarioAnalise.qtd_gatos} animais</span>
                </div>
              </div>

              {beneficiarioAnalise.observacoes && (
                <div className="pt-2 border-t border-slate-200 text-slate-700 italic">
                  <strong>Observações do solicitante:</strong> "{beneficiarioAnalise.observacoes}"
                </div>
              )}
            </div>

            {/* DOCUMENTOS ENVIADOS */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                Documentos Comprobatórios Anexados:
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                
                {/* 1. CadUnico */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <span className="font-bold text-slate-700 block">Comprovante CadÚnico:</span>
                  {beneficiarioAnalise.documento_cadunico_url ? (
                    <div className="space-y-1.5">
                      <img 
                        src={beneficiarioAnalise.documento_cadunico_url} 
                        alt="CadÚnico" 
                        className="w-full h-32 object-contain bg-white rounded-lg border border-slate-200"
                      />
                      <a 
                        href={beneficiarioAnalise.documento_cadunico_url} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-[11px] font-bold text-emerald-700 hover:underline block text-center"
                      >
                        Ver Documento Completo
                      </a>
                    </div>
                  ) : (
                    <p className="text-slate-400 italic">Não anexado</p>
                  )}
                </div>

                {/* 2. RG / CNH */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <span className="font-bold text-slate-700 block">Documento de Identidade (RG):</span>
                  {beneficiarioAnalise.documento_rg_url ? (
                    <div className="space-y-1.5">
                      <img 
                        src={beneficiarioAnalise.documento_rg_url} 
                        alt="RG" 
                        className="w-full h-32 object-contain bg-white rounded-lg border border-slate-200"
                      />
                      <a 
                        href={beneficiarioAnalise.documento_rg_url} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-[11px] font-bold text-emerald-700 hover:underline block text-center"
                      >
                        Ver Documento Completo
                      </a>
                    </div>
                  ) : (
                    <p className="text-slate-400 italic">Não anexado</p>
                  )}
                </div>

                {/* 3. Comprovante de Residência */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <span className="font-bold text-slate-700 block">Comprovante de Residência:</span>
                  {beneficiarioAnalise.comprovante_residencia_url ? (
                    <div className="space-y-1.5">
                      <img 
                        src={beneficiarioAnalise.comprovante_residencia_url} 
                        alt="Residência" 
                        className="w-full h-32 object-contain bg-white rounded-lg border border-slate-200"
                      />
                      <a 
                        href={beneficiarioAnalise.comprovante_residencia_url} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-[11px] font-bold text-emerald-700 hover:underline block text-center"
                      >
                        Ver Documento Completo
                      </a>
                    </div>
                  ) : (
                    <p className="text-slate-400 italic">Não anexado</p>
                  )}
                </div>

                {/* 4. Fotos dos Animais */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <span className="font-bold text-slate-700 block">Foto dos Animais / Local:</span>
                  {beneficiarioAnalise.fotos_animais_url && beneficiarioAnalise.fotos_animais_url.length > 0 ? (
                    <div className="space-y-1.5">
                      <img 
                        src={beneficiarioAnalise.fotos_animais_url[0]} 
                        alt="Animais" 
                        className="w-full h-32 object-contain bg-white rounded-lg border border-slate-200"
                      />
                      <a 
                        href={beneficiarioAnalise.fotos_animais_url[0]} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-[11px] font-bold text-emerald-700 hover:underline block text-center"
                      >
                        Ver Foto Ampliada
                      </a>
                    </div>
                  ) : (
                    <p className="text-slate-400 italic">Não anexado</p>
                  )}
                </div>

              </div>
            </div>

            {/* DEFINIÇÃO DA COTA E APROVAÇÃO */}
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3">
              <label className="block text-xs font-bold text-emerald-950">
                Definir Cota Mensal Concedida (KG de ração por mês):
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="5"
                  max="300"
                  value={cotaAprovadaKg}
                  onChange={(e) => setCotaAprovadaKg(Number(e.target.value))}
                  className="w-28 p-2 font-black text-lg bg-white border border-emerald-400 rounded-xl text-center text-emerald-900"
                />
                <span className="text-xs text-slate-600">
                  Sugerido para {beneficiarioAnalise.qtd_caes + beneficiarioAnalise.qtd_gatos} animais: <strong>{beneficiarioAnalise.cota_mensal_kg || 30} KG</strong>
                </span>
              </div>
            </div>

            {/* BOTÕES DE DECISÃO */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200">
              <button
                type="button"
                onClick={async () => {
                  const mot = prompt('Informe o motivo da rejeição ou pendência para o solicitante:');
                  if (!mot) return;
                  await atualizarStatusBeneficiario(beneficiarioAnalise.id, 'rejeitado', undefined, mot);
                  toast.info('Inscrição marcada como rejeitada/pendente.');
                  setModalAnaliseOpen(false);
                  carregarTudo();
                }}
                className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-300 rounded-xl text-xs font-bold"
              >
                Rejeitar / Solicitar Correção
              </button>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setModalAnaliseOpen(false)}
                  className="text-xs"
                >
                  Fechar
                </Button>

                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={async () => {
                    await atualizarStatusBeneficiario(beneficiarioAnalise.id, 'aprovado', cotaAprovadaKg);
                    toast.success(`Beneficiário ${beneficiarioAnalise.nome} APROVADO com cota de ${cotaAprovadaKg} KG/mês!`);
                    setModalAnaliseOpen(false);
                    carregarTudo();
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                >
                  ✅ Aprovar Inscrição & Cota
                </Button>
              </div>
            </div>

          </div>
        </Modal>
      )}

{/* MODAL DE RECIBO OFICIAL A4 */}
      <ReciboEntregaRacaoModal
        isOpen={reciboModalOpen}
        onClose={() => setReciboModalOpen(false)}
        entrega={entregaRecibo}
        beneficiario={beneficiarios.find(b => b.id === entregaRecibo?.beneficiario_id)}
      />

    </div>
  );
}
