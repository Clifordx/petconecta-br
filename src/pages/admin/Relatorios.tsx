import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  Download, 
  Calendar, 
  Filter, 
  FileText, 
  Printer, 
  Scissors, 
  Heart, 
  ShieldAlert, 
  Dog, 
  Building2,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';

export default function Relatorios() {
  const [tipoRelatorio, setTipoRelatorio] = useState('geral');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [loading, setLoading] = useState(false);

  // Dados consolidados
  const [dadosFiltrados, setDadosFiltrados] = useState<any[]>([]);
  const [metricas, setMetricas] = useState({
    totalCastracoes: 0,
    totalAdocoes: 0,
    totalDenuncias: 0,
    totalPets: 0
  });

  useEffect(() => {
    // Inicializa com os últimos 90 dias
    const hoje = new Date();
    const dataPassada = new Date();
    dataPassada.setDate(hoje.getDate() - 90);

    setDataInicio(dataPassada.toISOString().split('T')[0]);
    setDataFim(hoje.toISOString().split('T')[0]);

    gerarRelatorio(dataPassada.toISOString().split('T')[0], hoje.toISOString().split('T')[0], 'geral');
  }, []);

  const gerarRelatorio = async (inicio: string, fim: string, tipo: string) => {
    try {
      setLoading(true);

      const dataInicioIso = `${inicio}T00:00:00.000Z`;
      const dataFimIso = `${fim}T23:59:59.999Z`;

      // 1. Castrações
      const { data: castracoes } = await supabase
        .from('filas_castracao')
        .select('*, pets(nome, especie), clinicas_parceiras(nome)')
        .gte('criado_em', dataInicioIso)
        .lte('criado_em', dataFimIso);

      // 2. Adoções
      const { data: adocoes } = await supabase
        .from('adocoes')
        .select('*, pets(nome, especie), feiras(titulo)')
        .gte('criado_em', dataInicioIso)
        .lte('criado_em', dataFimIso);

      // 3. Denúncias
      const { data: denuncias } = await supabase
        .from('denuncias')
        .select('*')
        .gte('criado_em', dataInicioIso)
        .lte('criado_em', dataFimIso);

      // 4. Pets cadastrados
      const { data: pets } = await supabase
        .from('pets')
        .select('*')
        .gte('criado_em', dataInicioIso)
        .lte('criado_em', dataFimIso);

      const nCastracoes = (castracoes || []).length;
      const nAdocoes = (adocoes || []).length;
      const nDenuncias = (denuncias || []).length;
      const nPets = (pets || []).length;

      setMetricas({
        totalCastracoes: nCastracoes,
        totalAdocoes: nAdocoes,
        totalDenuncias: nDenuncias,
        totalPets: nPets
      });

      if (tipo === 'castracao') {
        setDadosFiltrados(castracoes || []);
      } else if (tipo === 'adocao') {
        setDadosFiltrados(adocoes || []);
      } else if (tipo === 'denuncia') {
        setDadosFiltrados(denuncias || []);
      } else {
        // Geral: agrupa os dados
        setDadosFiltrados([
          { categoria: 'Animais Cadastrados no Período', total: nPets },
          { categoria: 'Adoções Concluídas com Termo', total: nAdocoes },
          { categoria: 'Castrações Solicitadas / Realizadas', total: nCastracoes },
          { categoria: 'Ocorrências e Denúncias Apuradas', total: nDenuncias }
        ]);
      }

    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      toast.error('Erro ao processar dados do relatório.');
    } finally {
      setLoading(false);
    }
  };

  const handleFiltrar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dataInicio || !dataFim) {
      toast.error('Informe o período inicial e final.');
      return;
    }
    gerarRelatorio(dataInicio, dataFim, tipoRelatorio);
  };

  const handleImprimir = () => {
    window.print();
  };

  const exportarCSV = () => {
    if (dadosFiltrados.length === 0) {
      toast.error('Nenhum dado para exportar.');
      return;
    }

    let csvContent = 'data:text/csv;charset=utf-8,';
    
    if (tipoRelatorio === 'geral') {
      csvContent += 'Categoria;Quantidade\n';
      dadosFiltrados.forEach(row => {
        csvContent += `"${row.categoria}";"${row.total}"\n`;
      });
    } else if (tipoRelatorio === 'castracao') {
      csvContent += 'Data;Pet;Especie;Clinica;Status\n';
      dadosFiltrados.forEach(row => {
        csvContent += `"${new Date(row.criado_em).toLocaleDateString('pt-BR')}";"${row.pets?.nome || ''}";"${row.pets?.especie || ''}";"${row.clinicas_parceiras?.nome || 'Fila Geral'}";"${row.status}"\n`;
      });
    } else if (tipoRelatorio === 'adocao') {
      csvContent += 'Data;Pet;Adotante;Telefone;Origem\n';
      dadosFiltrados.forEach(row => {
        csvContent += `"${new Date(row.data_adocao || row.criado_em).toLocaleDateString('pt-BR')}";"${row.pets?.nome || ''}";"${row.adotante_nome || ''}";"${row.adotante_telefone || ''}";"${row.feiras?.titulo || 'Adoção Direta'}"\n`;
      });
    } else if (tipoRelatorio === 'denuncia') {
      csvContent += 'Data;Protocolo;Tipo;Urgencia;Status;Endereco\n';
      dadosFiltrados.forEach(row => {
        csvContent += `"${new Date(row.criado_em).toLocaleDateString('pt-BR')}";"${row.protocolo}";"${row.tipo}";"${row.urgencia}";"${row.status}";"${row.endereco || ''}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `relatorio_${tipoRelatorio}_${dataInicio}_a_${dataFim}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Relatório exportado em formato CSV (Excel)!');
  };

  return (
    <div className="space-y-6">
      {/* Top Header - Oculto na impressão */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-7 h-7 text-emerald-600" /> Relatórios Estatísticos e Prestação de Contas
          </h1>
          <p className="text-sm text-gray-500">
            Geração de dados oficiais para a Prefeitura Municipal, Secretarias e ONGs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            onClick={exportarCSV} 
            variant="outline" 
            className="flex items-center gap-1.5 text-xs border-gray-300 hover:bg-gray-50"
          >
            <Download size={14} /> Exportar Excel (CSV)
          </Button>

          <Button 
            onClick={handleImprimir} 
            className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 text-xs font-semibold shadow-sm"
          >
            <Printer size={14} /> Imprimir Relatório Oficial
          </Button>
        </div>
      </div>

      {/* Filtros de Consulta - Oculto na impressão */}
      <form onSubmit={handleFiltrar} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 flex flex-wrap gap-4 items-end print:hidden">
        <div className="space-y-1 flex-1 min-w-[200px]">
          <label className="text-xs font-semibold text-gray-700">Tipo de Relatório</label>
          <select 
            value={tipoRelatorio}
            onChange={(e) => setTipoRelatorio(e.target.value)}
            className="block w-full p-2.5 border border-gray-300 rounded-xl text-sm bg-white focus:ring-2 focus:ring-emerald-500"
          >
            <option value="geral">Relatório Geral Consolidado</option>
            <option value="castracao">Relatório de Castrações & Clínicas</option>
            <option value="adocao">Relatório de Adoções & Feiras</option>
            <option value="denuncia">Relatório de Fiscalização & Denúncias</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-700">Período de Apuração</label>
          <div className="flex gap-2 items-center">
            <input 
              type="date" 
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="p-2 border border-gray-300 rounded-xl text-sm" 
            />
            <span className="text-gray-400 text-xs">até</span>
            <input 
              type="date" 
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="p-2 border border-gray-300 rounded-xl text-sm" 
            />
          </div>
        </div>

        <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 h-10 px-5 text-sm font-semibold rounded-xl flex items-center gap-1.5">
          <Filter size={14} /> Atualizar Relatório
        </Button>
      </form>

      {/* ÁREA DE DOCUMENTO OFICIAL (Exibida na tela e formatada para impressão A4) */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6 print:border-none print:shadow-none print:p-0">
        
        {/* Cabeçalho Oficial do Relatório */}
        <div className="border-b pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h2 className="text-xl font-bold uppercase tracking-wider text-gray-900">
              Relatório de Gestão e Bem-Estar Animal
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Sistema PetConecta BR • Município de Arapongas / PR
            </p>
          </div>
          <div className="text-left sm:text-right text-xs text-gray-500">
            <p><span className="font-semibold">Período:</span> {new Date(dataInicio + 'T00:00:00').toLocaleDateString('pt-BR')} a {new Date(dataFim + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
            <p><span className="font-semibold">Emissão:</span> {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        </div>

        {/* Quadro Consolidado de Metas / Indicadores */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
            <span className="text-[11px] font-bold uppercase text-emerald-800 block">Castrações</span>
            <span className="text-2xl font-extrabold text-emerald-950 mt-1 block">{metricas.totalCastracoes}</span>
            <span className="text-[10px] text-emerald-700 mt-0.5 block">cirurgias no período</span>
          </div>

          <div className="p-4 bg-pink-50 rounded-xl border border-pink-100">
            <span className="text-[11px] font-bold uppercase text-pink-800 block">Adoções</span>
            <span className="text-2xl font-extrabold text-pink-950 mt-1 block">{metricas.totalAdocoes}</span>
            <span className="text-[10px] text-pink-700 mt-0.5 block">animais acolhidos</span>
          </div>

          <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
            <span className="text-[11px] font-bold uppercase text-amber-800 block">Denúncias</span>
            <span className="text-2xl font-extrabold text-amber-950 mt-1 block">{metricas.totalDenuncias}</span>
            <span className="text-[10px] text-amber-700 mt-0.5 block">ocorrências atendidas</span>
          </div>

          <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
            <span className="text-[11px] font-bold uppercase text-blue-800 block">Novos Pets</span>
            <span className="text-2xl font-extrabold text-blue-950 mt-1 block">{metricas.totalPets}</span>
            <span className="text-[10px] text-blue-700 mt-0.5 block">registros no sistema</span>
          </div>
        </div>

        {/* Tabela Detalhada Conforme o Filtro Selecionado */}
        <div>
          <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider mb-3">
            Detalhamento das Ações Realizadas
          </h3>

          {loading ? (
            <div className="p-12 text-center text-gray-400 text-sm">Atualizando dados...</div>
          ) : dadosFiltrados.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm bg-gray-50 rounded-xl border">
              Nenhum registro encontrado no período de apuração informado.
            </div>
          ) : tipoRelatorio === 'geral' ? (
            <div className="overflow-x-auto border rounded-xl">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-700 text-xs uppercase font-semibold border-b">
                  <tr>
                    <th className="p-3.5">Indicador / Programa</th>
                    <th className="p-3.5 text-right">Total Acumulado</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-gray-700">
                  {dadosFiltrados.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="p-3.5 font-medium">{item.categoria}</td>
                      <td className="p-3.5 text-right font-bold text-emerald-800 text-base">{item.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : tipoRelatorio === 'castracao' ? (
            <div className="overflow-x-auto border rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-700 uppercase font-semibold border-b">
                  <tr>
                    <th className="p-3">Data</th>
                    <th className="p-3">Animal</th>
                    <th className="p-3">Espécie</th>
                    <th className="p-3">Clínica Credenciada</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-gray-700">
                  {dadosFiltrados.map((row) => (
                    <tr key={row.id}>
                      <td className="p-3">{new Date(row.criado_em).toLocaleDateString('pt-BR')}</td>
                      <td className="p-3 font-bold">{row.pets?.nome || 'Pet'}</td>
                      <td className="p-3 capitalize">{row.pets?.especie || '-'}</td>
                      <td className="p-3">{row.clinicas_parceiras?.nome || 'Fila Geral'}</td>
                      <td className="p-3 capitalize font-semibold">{row.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : tipoRelatorio === 'adocao' ? (
            <div className="overflow-x-auto border rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-700 uppercase font-semibold border-b">
                  <tr>
                    <th className="p-3">Data</th>
                    <th className="p-3">Animal</th>
                    <th className="p-3">Adotante (Tutor)</th>
                    <th className="p-3">Telefone</th>
                    <th className="p-3">Origem / Feira</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-gray-700">
                  {dadosFiltrados.map((row) => (
                    <tr key={row.id}>
                      <td className="p-3">{new Date(row.data_adocao || row.criado_em).toLocaleDateString('pt-BR')}</td>
                      <td className="p-3 font-bold">{row.pets?.nome || 'Pet'}</td>
                      <td className="p-3 font-medium">{row.adotante_nome}</td>
                      <td className="p-3">{row.adotante_telefone}</td>
                      <td className="p-3">{row.feiras?.titulo || 'Adoção Direta'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto border rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-700 uppercase font-semibold border-b">
                  <tr>
                    <th className="p-3">Protocolo</th>
                    <th className="p-3">Data</th>
                    <th className="p-3">Tipo de Ocorrência</th>
                    <th className="p-3">Urgência</th>
                    <th className="p-3">Localização</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-gray-700">
                  {dadosFiltrados.map((row) => (
                    <tr key={row.id}>
                      <td className="p-3 font-mono font-bold">{row.protocolo}</td>
                      <td className="p-3">{new Date(row.criado_em).toLocaleDateString('pt-BR')}</td>
                      <td className="p-3 capitalize">{row.tipo}</td>
                      <td className="p-3 uppercase font-bold">{row.urgencia}</td>
                      <td className="p-3 truncate max-w-xs">{row.endereco}</td>
                      <td className="p-3 font-semibold">{row.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Rodapé do Relatório Oficial para Assinatura (Aparece na Impressão) */}
        <div className="pt-12 mt-8 border-t flex flex-col sm:flex-row justify-between items-center gap-8 text-center text-xs text-gray-600">
          <div>
            <div className="border-b border-gray-900 w-56 mb-1"></div>
            <p className="font-bold">Responsável pelo Bem-Estar Animal</p>
            <p>Secretaria Municipal / Coordenação</p>
          </div>

          <div>
            <div className="border-b border-gray-900 w-56 mb-1"></div>
            <p className="font-bold">Médico Veterinário Responsável</p>
            <p>CRMV-PR</p>
          </div>
        </div>

      </div>
    </div>
  );
}
