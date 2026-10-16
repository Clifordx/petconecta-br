import React, { useEffect, useState } from 'react';
import { 
  Users, 
  Dog, 
  Cat, 
  Calendar, 
  AlertTriangle, 
  Heart,
  Activity,
  Plus,
  ShieldAlert,
  Building2,
  Scissors,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { supabase } from '@/lib/supabase';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6'];

export default function Dashboard() {
  const [loading, setLoading] = useState(true);

  // Métricas
  const [totalPets, setTotalPets] = useState(0);
  const [petsParaAdocao, setPetsParaAdocao] = useState(0);
  const [totalCastracoes, setTotalCastracoes] = useState(0);
  const [castracoesPendentes, setCastracoesPendentes] = useState(0);
  const [totalAdocoes, setTotalAdocoes] = useState(0);
  const [denunciasPendentes, setDenunciasPendentes] = useState(0);
  const [denunciasCriticas, setDenunciasCriticas] = useState(0);
  const [totalClinicas, setTotalClinicas] = useState(0);

  // Gráficos
  const [speciesData, setSpeciesData] = useState<{ name: string; value: number }[]>([]);
  const [statusPetsData, setStatusPetsData] = useState<{ name: string; total: number }[]>([]);
  const [denunciasPorTipo, setDenunciasPorTipo] = useState<{ name: string; total: number }[]>([]);

  // Atividades Recentes
  const [ultimasAdocoes, setUltimasAdocoes] = useState<any[]>([]);
  const [ultimasDenuncias, setUltimasDenuncias] = useState<any[]>([]);

  useEffect(() => {
    carregarMetricas();
  }, []);

  const carregarMetricas = async () => {
    try {
      setLoading(true);

      // 1. PETS
      const { data: pets } = await supabase.from('pets').select('id, nome, especie, status, criado_em');
      if (pets) {
        setTotalPets(pets.length);
        setPetsParaAdocao(pets.filter(p => p.status === 'para_adocao').length);

        // Espécies
        const caes = pets.filter(p => ['cao', 'cachorro', 'cão'].includes(p.especie?.toLowerCase())).length;
        const gatos = pets.filter(p => ['gato', 'felino'].includes(p.especie?.toLowerCase())).length;
        const outros = pets.length - caes - gatos;
        
        const specArr = [
          { name: 'Cães', value: caes },
          { name: 'Gatos', value: gatos }
        ];
        if (outros > 0) specArr.push({ name: 'Outros', value: outros });
        setSpeciesData(specArr);

        // Status dos Pets
        const paraAdocaoCount = pets.filter(p => p.status === 'para_adocao').length;
        const comTutorCount = pets.filter(p => p.status === 'com_tutor' || !p.status).length;
        const adotadosCount = pets.filter(p => p.status === 'adotado').length;
        const tratamentoCount = pets.filter(p => p.status === 'em_tratamento').length;

        setStatusPetsData([
          { name: 'Com Tutor', total: comTutorCount },
          { name: 'Para Adoção', total: paraAdocaoCount },
          { name: 'Adotados', total: adotadosCount },
          { name: 'Em Tratamento', total: tratamentoCount },
        ]);
      }

      // 2. CASTRAÇÃO
      const { data: castracoes } = await supabase.from('filas_castracao').select('id, status');
      if (castracoes) {
        setTotalCastracoes(castracoes.filter(c => c.status === 'realizado').length);
        setCastracoesPendentes(castracoes.filter(c => c.status === 'pendente' || c.status === 'agendado').length);
      }

      // 3. ADOÇÕES
      const { data: adocoes } = await supabase
        .from('adocoes')
        .select(`
          id, 
          adotante_nome, 
          data_adocao, 
          criado_em, 
          pets (nome, especie, fotos_pet(url, is_principal))
        `)
        .order('criado_em', { ascending: false })
        .limit(4);

      if (adocoes) {
        // Busca contagem total
        const { count: countAdocoes } = await supabase.from('adocoes').select('id', { count: 'exact', head: true });
        setTotalAdocoes(countAdocoes || adocoes.length);
        setUltimasAdocoes(adocoes);
      }

      // 4. DENÚNCIAS
      const { data: denuncias } = await supabase
        .from('denuncias')
        .select('id, protocolo, tipo, urgencia, status, endereco, criado_em')
        .order('criado_em', { ascending: false });

      if (denuncias) {
        const pendentes = denuncias.filter(d => ['recebida', 'em_analise', 'em_investigacao'].includes(d.status)).length;
        const criticas = denuncias.filter(d => d.urgencia === 'critica' && d.status !== 'resolvida').length;
        setDenunciasPendentes(pendentes);
        setDenunciasCriticas(criticas);
        setUltimasDenuncias(denuncias.slice(0, 4));

        // Tipos de Denúncias
        const tiposMap: Record<string, number> = {};
        denuncias.forEach(d => {
          const t = d.tipo || 'Outros';
          tiposMap[t] = (tiposMap[t] || 0) + 1;
        });

        const chartTipos = Object.entries(tiposMap).map(([name, total]) => ({
          name: formatTipoCurto(name),
          total
        }));
        setDenunciasPorTipo(chartTipos);
      }

      // 5. CLÍNICAS PARCEIRAS
      const { count: countClinicas } = await supabase.from('clinicas_parceiras').select('id', { count: 'exact', head: true });
      setTotalClinicas(countClinicas || 0);

    } catch (err) {
      console.error('Erro ao carregar métricas:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatTipoCurto = (tipo: string) => {
    switch (tipo) {
      case 'abandono': return 'Abandono';
      case 'agressao': return 'Agressão';
      case 'negligencia': return 'Negligência';
      case 'acorrentado': return 'Acorrentado';
      case 'envenenamento': return 'Envenenamento';
      default: return tipo;
    }
  };

  const getFotoPrincipal = (fotos: any[]) => {
    if (!fotos || fotos.length === 0) return 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=200';
    const princ = fotos.find(f => f.is_principal);
    return princ ? princ.url : fotos[0].url;
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            Dashboard Geral de Gestão Animal
          </h1>
          <p className="text-sm text-gray-500">
            Painel consolidado em tempo real do município de Arapongas / PR.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link to="/admin/adocoes/nova">
            <Button size="sm" className="bg-pink-600 hover:bg-pink-700 text-white flex items-center gap-1.5 font-semibold text-xs shadow-sm">
              <Heart size={14} fill="currentColor" /> Nova Adoção
            </Button>
          </Link>
          <Link to="/admin/pets">
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 font-semibold text-xs shadow-sm">
              <Plus size={14} /> Novo Pet
            </Button>
          </Link>
        </div>
      </div>

      {/* Grid de Métricas Principais */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <MetricCard 
          title="Animais no Sistema" 
          value={totalPets.toString()} 
          icon={<Dog className="w-5 h-5 text-emerald-600" />} 
          color="border-emerald-500"
          link="/admin/pets"
        />

        <MetricCard 
          title="Para Adoção" 
          value={petsParaAdocao.toString()} 
          icon={<Cat className="w-5 h-5 text-purple-600" />} 
          color="border-purple-500"
          link="/admin/pets"
        />

        <MetricCard 
          title="Adoções Realizadas" 
          value={totalAdocoes.toString()} 
          icon={<Heart className="w-5 h-5 text-pink-600" />} 
          color="border-pink-500"
          link="/admin/adocoes"
        />

        <MetricCard 
          title="Castrações Feitas" 
          value={totalCastracoes.toString()} 
          icon={<Scissors className="w-5 h-5 text-blue-600" />} 
          color="border-blue-500"
          link="/admin/castracao"
        />

        <MetricCard 
          title="Denúncias Ativas" 
          value={denunciasPendentes.toString()} 
          icon={<ShieldAlert className={`w-5 h-5 ${denunciasCriticas > 0 ? 'text-red-600' : 'text-amber-600'}`} />} 
          color={denunciasCriticas > 0 ? "border-red-500" : "border-amber-500"}
          extra={denunciasCriticas > 0 ? `${denunciasCriticas} crítica(s)` : undefined}
          link="/admin/denuncias"
        />

        <MetricCard 
          title="Clínicas Parceiras" 
          value={totalClinicas.toString()} 
          icon={<Building2 className="w-5 h-5 text-indigo-600" />} 
          color="border-indigo-500"
          link="/admin/clinicas"
        />
      </div>

      {/* Gráficos em Tempo Real */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico 1: Status dos Pets */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
              <TrendingUp size={18} className="text-emerald-600" /> Distribuição da População Animal
            </h3>
            <span className="text-xs text-gray-400">Total: {totalPets} cadastrados</span>
          </div>

          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={statusPetsData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
              <Bar dataKey="total" name="Quantidade de Pets" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico 2: Proporção Cães vs Gatos */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <h3 className="font-bold text-gray-900 text-base mb-4 flex items-center gap-2">
            <Dog size={18} className="text-emerald-600" /> Espécies Cadastradas
          </h3>

          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={speciesData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {speciesData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Linha Inferior: Últimas Ocorrências & Adoções Recentes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Adoções Recentes */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Heart className="w-5 h-5 text-pink-600 fill-current" /> Adoções Recentes
            </h3>
            <Link to="/admin/adocoes" className="text-xs font-semibold text-pink-600 hover:underline flex items-center gap-1">
              Ver todas <ArrowRight size={13} />
            </Link>
          </div>

          {ultimasAdocoes.length === 0 ? (
            <div className="py-8 text-center text-gray-400 text-xs">
              Nenhuma adoção finalizada ainda.
            </div>
          ) : (
            <div className="space-y-3">
              {ultimasAdocoes.map((ad) => (
                <div key={ad.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 hover:border-pink-200 transition-colors">
                  <div className="flex items-center gap-3">
                    <img 
                      src={getFotoPrincipal(ad.pets?.fotos_pet)} 
                      alt={ad.pets?.nome} 
                      className="w-10 h-10 rounded-lg object-cover border"
                    />
                    <div>
                      <span className="font-bold text-sm text-gray-900 block">{ad.pets?.nome}</span>
                      <span className="text-xs text-gray-500">Adotado por {ad.adotante_nome}</span>
                    </div>
                  </div>
                  <span className="text-[11px] text-gray-400 font-medium">
                    {new Date(ad.data_adocao || ad.criado_em).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Denúncias Recentes */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-600" /> Ocorrências & Fiscalizações
            </h3>
            <Link to="/admin/denuncias" className="text-xs font-semibold text-amber-600 hover:underline flex items-center gap-1">
              Gerenciar <ArrowRight size={13} />
            </Link>
          </div>

          {ultimasDenuncias.length === 0 ? (
            <div className="py-8 text-center text-gray-400 text-xs">
              Nenhuma denúncia pendente registrada.
            </div>
          ) : (
            <div className="space-y-3">
              {ultimasDenuncias.map((den) => (
                <div key={den.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 hover:border-amber-200 transition-colors">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-gray-900">{den.protocolo}</span>
                      {den.urgencia === 'critica' && (
                        <span className="text-[10px] bg-red-100 text-red-800 font-bold px-1.5 py-0.2 rounded animate-pulse">
                          🚨 Crítica
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 truncate block max-w-xs mt-0.5">
                      {formatTipoCurto(den.tipo)} • {den.endereco}
                    </span>
                  </div>

                  <span className="text-[11px] text-gray-400 font-medium">
                    {new Date(den.criado_em).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ 
  title, 
  value, 
  icon, 
  color, 
  extra, 
  link 
}: { 
  title: string; 
  value: string; 
  icon: React.ReactNode; 
  color: string; 
  extra?: string; 
  link?: string;
}) {
  const content = (
    <div className={`bg-white rounded-xl shadow-sm p-4 border-l-4 ${color} border-t border-r border-b border-gray-200 hover:shadow-md transition-shadow cursor-pointer h-full flex flex-col justify-between`}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-gray-500 truncate">{title}</p>
        <div className="p-1.5 bg-gray-50 rounded-lg">{icon}</div>
      </div>
      <div className="mt-2">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {extra && (
          <span className="text-[11px] font-semibold text-red-600 block mt-0.5">{extra}</span>
        )}
      </div>
    </div>
  );

  if (link) {
    return <Link to={link}>{content}</Link>;
  }
  return content;
}
