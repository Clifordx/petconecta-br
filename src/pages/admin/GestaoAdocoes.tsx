import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Heart, 
  Search, 
  Plus, 
  FileText, 
  Phone, 
  MessageCircle, 
  Calendar, 
  MapPin, 
  CheckCircle2, 
  Download, 
  Printer,
  Eye,
  Filter
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';

export default function GestaoAdocoes() {
  const [adocoes, setAdocoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchAdocoes();
  }, []);

  const fetchAdocoes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('adocoes')
        .select(`
          *,
          pets (
            id,
            nome,
            especie,
            raca,
            sexo,
            porte,
            fotos_pet (url, is_principal)
          ),
          feiras (
            id,
            titulo,
            local
          )
        `)
        .order('criado_em', { ascending: false });

      if (error) throw error;
      setAdocoes(data || []);
    } catch (error: any) {
      console.error('Erro ao buscar adoções:', error);
      toast.error('Erro ao carregar lista de adoções');
    } finally {
      setLoading(false);
    }
  };

  const openWhatsApp = (telefone: string) => {
    const clean = telefone.replace(/\D/g, '');
    if (!clean) return;
    const phoneWithCode = clean.length <= 11 ? `55${clean}` : clean;
    window.open(`https://wa.me/${phoneWithCode}`, '_blank');
  };

  const getFotoPrincipal = (fotos: any[]) => {
    if (!fotos || fotos.length === 0) return 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=200';
    const princ = fotos.find(f => f.is_principal);
    return princ ? princ.url : fotos[0].url;
  };

  const filtered = adocoes.filter(ad => 
    ad.pets?.nome?.toLowerCase().includes(search.toLowerCase()) ||
    ad.adotante_nome?.toLowerCase().includes(search.toLowerCase()) ||
    ad.adotante_cpf?.toLowerCase().includes(search.toLowerCase()) ||
    ad.feiras?.titulo?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Heart className="w-7 h-7 text-pink-600 fill-current" /> Gestão de Adoções
          </h1>
          <p className="text-sm text-gray-500">
            Histórico oficial de tutores, termos de posse responsável assinados e animais acolhidos.
          </p>
        </div>
        <Link to="/admin/adocoes/nova">
          <Button className="bg-pink-600 hover:bg-pink-700 text-white font-bold flex items-center gap-2 shadow-lg shadow-pink-200">
            <Plus className="w-4 h-4" /> Nova Adoção Oficial
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-xs uppercase font-semibold text-gray-400 block">Total de Adoções</span>
          <span className="text-2xl font-bold text-gray-900 mt-1 block">{adocoes.length}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-pink-200 shadow-sm">
          <span className="text-xs uppercase font-semibold text-pink-600 block">Em Feiras Presenciais</span>
          <span className="text-2xl font-bold text-pink-700 mt-1 block">
            {adocoes.filter(a => a.feira_id).length}
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-sm col-span-2 sm:col-span-1">
          <span className="text-xs uppercase font-semibold text-emerald-600 block">Adoções Diretas / Canil</span>
          <span className="text-2xl font-bold text-emerald-700 mt-1 block">
            {adocoes.filter(a => !a.feira_id).length}
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nome do pet, nome do adotante ou CPF..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 text-sm"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Carregando histórico de adoções...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-500 space-y-3">
            <Heart className="w-12 h-12 text-gray-300 mx-auto" />
            <h3 className="text-lg font-bold text-gray-800">Nenhuma adoção encontrada</h3>
            <p className="text-sm text-gray-500 max-w-sm mx-auto">
              Clique no botão "Nova Adoção Oficial" para cadastrar o primeiro pet adotado com assinatura digital.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-700 text-xs uppercase font-semibold border-b">
                <tr>
                  <th className="px-6 py-4">Data</th>
                  <th className="px-6 py-4">Animal</th>
                  <th className="px-6 py-4">Novo Tutor (Adotante)</th>
                  <th className="px-6 py-4">Origem / Feira</th>
                  <th className="px-6 py-4">Termo Assinado</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.map((adocao) => (
                  <tr key={adocao.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4 text-xs font-medium text-gray-500 whitespace-nowrap">
                      {new Date(adocao.data_adocao || adocao.criado_em).toLocaleDateString('pt-BR')}
                      <span className="block text-[11px] text-gray-400">
                        {new Date(adocao.data_adocao || adocao.criado_em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={getFotoPrincipal(adocao.pets?.fotos_pet)}
                          alt={adocao.pets?.nome}
                          className="w-12 h-12 rounded-lg object-cover border flex-shrink-0"
                        />
                        <div>
                          <span className="font-bold text-gray-900 block text-base">{adocao.pets?.nome}</span>
                          <span className="text-xs text-gray-500">
                            {adocao.pets?.especie} • {adocao.pets?.raca || 'SRD'}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-900 block text-sm">
                        {adocao.adotante_nome || 'Adotante Presencial'}
                      </span>
                      {adocao.adotante_cpf && (
                        <span className="text-xs text-gray-500 block">CPF: {adocao.adotante_cpf}</span>
                      )}
                      {adocao.adotante_telefone && (
                        <div className="flex items-center gap-1.5 mt-1 text-xs">
                          <span>{adocao.adotante_telefone}</span>
                          <button
                            onClick={() => openWhatsApp(adocao.adotante_telefone)}
                            title="Conversar no WhatsApp"
                            className="text-green-600 hover:text-green-700 p-0.5 bg-green-50 rounded"
                          >
                            <MessageCircle size={13} />
                          </button>
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4 text-xs">
                      {adocao.feiras ? (
                        <span className="inline-flex items-center gap-1 bg-pink-50 text-pink-700 font-semibold px-2.5 py-1 rounded-full">
                          📍 {adocao.feiras.titulo}
                        </span>
                      ) : (
                        <span className="text-gray-500 font-medium">Adoção Direta (Canil/Sede)</span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      {adocao.assinatura_url ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 text-xs font-semibold px-2.5 py-1 rounded-full border border-emerald-200">
                          <CheckCircle2 size={13} /> Assinado Digitalmente
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">Pendente</span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <Link to={`/admin/adocoes/${adocao.id}`}>
                        <Button size="sm" variant="outline" className="text-xs flex items-center gap-1 border-gray-300 hover:border-emerald-500 hover:text-emerald-700">
                          <Eye size={14} /> Dossiê & Termo
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
