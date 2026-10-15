import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Users, 
  Heart, 
  Plus, 
  Search, 
  Check, 
  Trash2, 
  Clock, 
  FileText,
  ExternalLink,
  Dog
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { toast } from 'sonner';

export default function GestaoFeirasDetalhe() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<'animais' | 'adocoes'>('animais');
  
  const [feira, setFeira] = useState<any>(null);
  const [animaisFeira, setAnimaisFeira] = useState<any[]>([]);
  const [adocoesFeira, setAdocoesFeira] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal Escalar Animal
  const [modalEscalarOpen, setModalEscalarOpen] = useState(false);
  const [todosPetsDisponiveis, setTodosPetsDisponiveis] = useState<any[]>([]);
  const [buscaPet, setBuscaPet] = useState('');
  const [salvandoVinculo, setSalvandoVinculo] = useState(false);

  useEffect(() => {
    if (id) {
      carregarDados();
    }
  }, [id]);

  const carregarDados = async () => {
    try {
      setLoading(true);

      // 1. Carrega a Feira
      const { data: dadosFeira, error: errFeira } = await supabase
        .from('feiras')
        .select('*')
        .eq('id', id)
        .single();

      if (errFeira) throw errFeira;
      setFeira(dadosFeira);

      // 2. Carrega Animais da Feira
      const { data: dadosAnimaisFeira, error: errAnimais } = await supabase
        .from('animais_feira')
        .select(`
          id,
          status,
          pet_id,
          pets (
            id,
            nome,
            especie,
            raca,
            sexo,
            porte,
            castrado,
            vacinado,
            status,
            fotos_pet (url, is_principal)
          )
        `)
        .eq('feira_id', id);

      if (errAnimais) throw errAnimais;
      setAnimaisFeira(dadosAnimaisFeira || []);

      // 3. Carrega Adoções Realizadas nesta Feira
      const { data: dadosAdocoes, error: errAdocoes } = await supabase
        .from('adocoes')
        .select(`
          *,
          pets (
            id,
            nome,
            especie,
            fotos_pet (url, is_principal)
          )
        `)
        .eq('feira_id', id)
        .order('criado_em', { ascending: false });

      if (errAdocoes) console.warn('Erro ao carregar adoções:', errAdocoes);
      setAdocoesFeira(dadosAdocoes || []);

    } catch (error: any) {
      console.error('Erro ao carregar feira:', error);
      toast.error('Erro ao carregar informações da feira');
    } finally {
      setLoading(false);
    }
  };

  const abrirModalEscalar = async () => {
    try {
      setModalEscalarOpen(true);
      // Busca todos os pets disponíveis para adoção no sistema
      const { data: pets, error } = await supabase
        .from('pets')
        .select('*, fotos_pet(url, is_principal)')
        .eq('status', 'para_adocao');

      if (error) throw error;

      // Filtra os que já estão escalados nesta feira
      const idsJaEscalados = animaisFeira.map(af => af.pet_id);
      const disponiveis = (pets || []).filter(p => !idsJaEscalados.includes(p.id));
      setTodosPetsDisponiveis(disponiveis);
    } catch (err) {
      console.error('Erro ao buscar pets disponíveis:', err);
      toast.error('Erro ao listar animais');
    }
  };

  const handleEscalarAnimal = async (petId: string) => {
    setSalvandoVinculo(true);
    try {
      const { error } = await supabase
        .from('animais_feira')
        .insert({
          feira_id: id,
          pet_id: petId,
          status: 'disponivel'
        });

      if (error) throw error;
      toast.success('Animal escalado para a feira!');
      carregarDados();
      setModalEscalarOpen(false);
    } catch (error: any) {
      console.error('Erro ao vincular pet:', error);
      toast.error(error.message || 'Erro ao escalar animal');
    } finally {
      setSalvandoVinculo(false);
    }
  };

  const handleRemoverDaFeira = async (vinculoId: string) => {
    if (!window.confirm('Deseja retirar este animal da lista da feira?')) return;
    try {
      const { error } = await supabase
        .from('animais_feira')
        .delete()
        .eq('id', vinculoId);

      if (error) throw error;
      toast.success('Animal removido da feira');
      carregarDados();
    } catch (error: any) {
      console.error('Erro ao remover:', error);
      toast.error('Erro ao remover animal da feira');
    }
  };

  const getFotoPrincipal = (fotos: any[]) => {
    if (!fotos || fotos.length === 0) return 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=300';
    const princ = fotos.find(f => f.is_principal);
    return princ ? princ.url : fotos[0].url;
  };

  if (loading) {
    return <div className="p-12 text-center text-gray-500">Carregando detalhes da feira...</div>;
  }

  if (!feira) {
    return (
      <div className="p-12 text-center text-gray-500">
        Feira não encontrada. <Link to="/admin/feiras" className="text-emerald-600 underline">Voltar</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex items-start gap-4">
          <Link to="/admin/feiras" className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700 transition-colors mt-0.5">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">{feira.titulo}</h1>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                feira.status === 'agendada' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700'
              }`}>
                {feira.status}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mt-2">
              <span className="flex items-center gap-1.5 font-medium text-gray-800">
                <Calendar className="w-4 h-4 text-emerald-600" />
                {new Date(feira.data + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-gray-400" />
                {feira.horario_inicio || '09:00'} às {feira.horario_fim || '16:00'}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-gray-400" />
                {feira.local} {feira.endereco ? `(${feira.endereco})` : ''}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link to={`/admin/adocoes/nova?feira_id=${feira.id}`}>
            <Button className="bg-pink-600 hover:bg-pink-700 text-white font-bold px-5 py-3 rounded-xl shadow-lg shadow-pink-200 flex items-center gap-2">
              <Heart className="w-5 h-5 fill-current" /> Nova Adoção nesta Feira
            </Button>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button 
            onClick={() => setActiveTab('animais')}
            className={`flex-1 py-4 px-6 text-sm font-bold border-b-2 transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'animais' 
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Users className="w-4 h-4" />
            Animais na Feira ({animaisFeira.length})
          </button>

          <button 
            onClick={() => setActiveTab('adocoes')}
            className={`flex-1 py-4 px-6 text-sm font-bold border-b-2 transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'adocoes' 
                ? 'border-pink-600 text-pink-700 bg-pink-50/50' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Heart className="w-4 h-4" />
            Adoções Realizadas ({adocoesFeira.length})
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'animais' ? (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-base font-bold text-gray-900">Animais Participantes</h3>
                  <p className="text-xs text-gray-500">Cães e gatos disponíveis para adoção presencial neste evento.</p>
                </div>
                <Button 
                  onClick={abrirModalEscalar}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 text-sm"
                >
                  <Plus className="w-4 h-4" /> Escalar Animal para a Feira
                </Button>
              </div>

              {animaisFeira.length === 0 ? (
                <div className="py-12 text-center text-gray-500 space-y-2">
                  <Dog className="w-12 h-12 text-gray-300 mx-auto" />
                  <p className="font-semibold text-gray-700">Nenhum animal escalado para esta feira ainda.</p>
                  <p className="text-xs text-gray-400">Clique em "Escalar Animal" para selecionar os pets disponíveis.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {animaisFeira.map((af) => {
                    const pet = af.pets;
                    if (!pet) return null;
                    const isAdotado = af.status === 'adotado' || pet.status === 'adotado';

                    return (
                      <div 
                        key={af.id} 
                        className={`rounded-xl border p-4 flex flex-col justify-between transition-all relative ${
                          isAdotado ? 'bg-pink-50/40 border-pink-200' : 'bg-white border-gray-200 hover:shadow-md'
                        }`}
                      >
                        {isAdotado && (
                          <div className="absolute top-3 right-3 bg-pink-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                            <Check size={12} /> Adotado!
                          </div>
                        )}

                        <div>
                          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-3 border">
                            <img 
                              src={getFotoPrincipal(pet.fotos_pet)} 
                              alt={pet.nome} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <h4 className="font-bold text-gray-900 text-base">{pet.nome}</h4>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {pet.especie} • {pet.raca || 'Sem raça definida'} • {pet.sexo}
                          </p>
                          <div className="flex gap-1.5 mt-2">
                            {pet.castrado && (
                              <span className="text-[10px] bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded">
                                Castrado
                              </span>
                            )}
                            {pet.vacinado && (
                              <span className="text-[10px] bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded">
                                Vacinado
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="pt-4 mt-3 border-t flex items-center justify-between gap-2">
                          {!isAdotado ? (
                            <Link 
                              to={`/admin/adocoes/nova?pet_id=${pet.id}&feira_id=${feira.id}`}
                              className="flex-1 py-1.5 px-3 bg-pink-50 hover:bg-pink-100 text-pink-700 text-xs font-bold rounded-lg text-center transition-colors flex items-center justify-center gap-1"
                            >
                              <Heart size={13} fill="currentColor" /> Adotar
                            </Link>
                          ) : (
                            <span className="text-xs text-pink-700 font-medium">Adoção Concluída</span>
                          )}

                          <button
                            onClick={() => handleRemoverDaFeira(af.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg transition-colors"
                            title="Remover da Feira"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {adocoesFeira.length === 0 ? (
                <div className="py-12 text-center text-gray-500 space-y-2">
                  <Heart className="w-12 h-12 text-pink-200 mx-auto" />
                  <p className="font-semibold text-gray-700">Nenhuma adoção realizada nesta feira até o momento.</p>
                  <p className="text-xs text-gray-400">Use o botão "Nova Adoção nesta Feira" para registrar a posse responsável com assinatura digital.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 text-gray-700 text-xs uppercase font-semibold border-b">
                      <tr>
                        <th className="p-4">Animal</th>
                        <th className="p-4">Adotante</th>
                        <th className="p-4">Telefone</th>
                        <th className="p-4">Data / Hora</th>
                        <th className="p-4 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {adocoesFeira.map((adocao) => (
                        <tr key={adocao.id} className="hover:bg-gray-50/80">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <img 
                                src={getFotoPrincipal(adocao.pets?.fotos_pet)} 
                                alt={adocao.pets?.nome} 
                                className="w-10 h-10 rounded-lg object-cover border"
                              />
                              <span className="font-bold text-gray-900">{adocao.pets?.nome}</span>
                            </div>
                          </td>
                          <td className="p-4 font-medium text-gray-900">
                            {adocao.adotante_nome || 'Adotante Presencial'}
                          </td>
                          <td className="p-4 text-gray-600">
                            {adocao.adotante_telefone || '-'}
                          </td>
                          <td className="p-4 text-xs text-gray-500">
                            {new Date(adocao.criado_em).toLocaleDateString('pt-BR')} às{' '}
                            {new Date(adocao.criado_em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="p-4 text-right">
                            <Link to={`/admin/adocoes/${adocao.id}`}>
                              <Button size="sm" variant="outline" className="text-xs flex items-center gap-1">
                                <FileText size={13} /> Ver Termo Assinado
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
          )}
        </div>
      </div>

      {/* Modal para Escalar Animal */}
      <Modal
        isOpen={modalEscalarOpen}
        onClose={() => setModalEscalarOpen(false)}
        title="Escalar Animal para a Feira"
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar animal disponível pelo nome..."
              value={buscaPet}
              onChange={(e) => setBuscaPet(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm"
            />
          </div>

          <div className="space-y-2">
            {todosPetsDisponiveis
              .filter(p => p.nome?.toLowerCase().includes(buscaPet.toLowerCase()))
              .map((pet) => (
                <div 
                  key={pet.id} 
                  className="flex items-center justify-between p-3 border rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <img 
                      src={getFotoPrincipal(pet.fotos_pet)} 
                      alt={pet.nome} 
                      className="w-12 h-12 rounded-lg object-cover border"
                    />
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">{pet.nome}</h4>
                      <p className="text-xs text-gray-500">{pet.especie} • {pet.raca || 'SRD'}</p>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    disabled={salvandoVinculo}
                    onClick={() => handleEscalarAnimal(pet.id)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-xs"
                  >
                    Escalar
                  </Button>
                </div>
              ))}
          </div>
        </div>
      </Modal>
    </div>
  );
}
