import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Search, ShieldAlert, ChevronRight, Clock, Plus, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Link } from 'react-router-dom';

export default function MinhasDenuncias() {
  const { user } = useAuth();
  const [denuncias, setDenuncias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (user) {
      fetchMinhasDenuncias();
    }
  }, [user]);

  const fetchMinhasDenuncias = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('denuncias')
        .select('*')
        .eq('denunciante_id', user?.id)
        .order('criado_em', { ascending: false });

      if (error) throw error;
      setDenuncias(data || []);
    } catch (error) {
      console.error('Erro ao buscar denúncias:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'recebida':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">Recebida</span>;
      case 'em_analise':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">Em Análise</span>;
      case 'em_investigacao':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">Em Vistoria</span>;
      case 'encaminhada':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">Polícia Notificada</span>;
      case 'resolvida':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">Resolvida</span>;
      case 'arquivada':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">Arquivada</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  const formatTipo = (tipo: string) => {
    const tiposMap: Record<string, string> = {
      abandono: 'Abandono em via pública',
      agressao: 'Agressão física / Violência',
      negligencia: 'Negligência (Sem água/comida)',
      acorrentado: 'Animal acorrentado',
      envenenamento: 'Suspeita de envenenamento',
      acumulacao: 'Acumulação de animais',
      outros: 'Outros maus-tratos'
    };
    return tiposMap[tipo] || tipo;
  };

  const filtered = denuncias.filter(d => 
    d.protocolo?.toLowerCase().includes(search.toLowerCase()) ||
    d.endereco?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container mx-auto p-4 max-w-4xl py-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-emerald-600" /> Minhas Denúncias Registradas
          </h1>
          <p className="text-sm text-gray-500">
            Acompanhe o andamento das ocorrências enviadas pela sua conta.
          </p>
        </div>
        <Link to="/denuncia">
          <Button className="bg-emerald-600 hover:bg-emerald-700 flex items-center gap-1.5">
            <Plus size={16} /> Nova Denúncia
          </Button>
        </Link>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border flex gap-3">
        <input 
          type="text" 
          placeholder="Buscar pelo protocolo (ex: DEN-2024-XXXXX)..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {loading ? (
        <div className="p-12 text-center text-gray-500">Carregando suas denúncias...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white p-12 rounded-xl shadow-sm border text-center space-y-4">
          <ShieldAlert className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="text-lg font-semibold text-gray-700">Nenhuma denúncia encontrada</h3>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">
            Você ainda não registrou denúncias com esta conta ou elas foram feitas no modo 100% anônimo.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Link to="/denuncia">
              <Button className="bg-emerald-600 hover:bg-emerald-700">Registrar Denúncia</Button>
            </Link>
            <Link to="/acompanhar-denuncia">
              <Button variant="outline">Consultar por Protocolo</Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(d => (
            <div key={d.id} className="bg-white rounded-xl shadow-sm border p-4 hover:border-emerald-300 transition-all">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-gray-900 text-base">{d.protocolo}</span>
                    {getStatusBadge(d.status)}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatTipo(d.tipo)} • Registrada em {new Date(d.criado_em).toLocaleDateString('pt-BR')} às{' '}
                    {new Date(d.criado_em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <p className="text-xs text-gray-600 mt-1 truncate max-w-md">
                    📍 {d.endereco}
                  </p>
                </div>

                <Link to={`/acompanhar-denuncia?protocolo=${d.protocolo}`}>
                  <Button variant="outline" size="sm" className="text-xs flex items-center gap-1 hover:bg-emerald-50 hover:text-emerald-700 border-gray-300">
                    Acompanhar <ChevronRight size={14} />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
