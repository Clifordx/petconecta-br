import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, LayoutGrid, List, Heart, Edit, Camera, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Pet } from '@/types';
import { toast } from 'sonner';

export default function GestaoPets() {
  const [viewMode, setViewMode] = useState<'grid' | 'lista'>('grid');
  const [pets, setPets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // New Pet Form state
  const [nome, setNome] = useState('');
  const [especie, setEspecie] = useState('CACHORRO');
  const [porte, setPorte] = useState('MEDIO');
  const [idade, setIdade] = useState('');
  const [status, setStatus] = useState('DISPONIVEL');
  const [foto, setFoto] = useState<File | null>(null);

  useEffect(() => {
    fetchPets();
  }, []);

  const fetchPets = async () => {
    try {
      const { data, error } = await supabase
        .from('pets')
        .select('*, fotos_pet(url, is_principal)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPets(data || []);
    } catch (error) {
      console.error('Erro ao buscar pets:', error);
      toast.error('Erro ao carregar os animais.');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePet = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // 1. Inserir o Pet
      const { data: newPet, error: petError } = await supabase
        .from('pets')
        .insert({
          nome,
          especie,
          porte,
          idade_aproximada: idade,
          status,
          sexo: 'MACHO', // default for MVP
          castrado: false,
          vacinado: false,
          vermifugado: false,
          municipio_id: 'arapongas-pr', // mocked
        })
        .select()
        .single();

      if (petError) throw petError;

      // 2. Fazer upload da foto se houver
      if (foto && newPet) {
        const fileExt = foto.name.split('.').pop();
        const fileName = `\${newPet.id}-\${Math.random()}.\${fileExt}`;
        const filePath = `\${newPet.id}/\${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('pets')
          .upload(filePath, foto);

        if (!uploadError) {
          const { data: publicUrlData } = supabase.storage.from('pets').getPublicUrl(filePath);
          await supabase.from('fotos_pet').insert({
            pet_id: newPet.id,
            url: publicUrlData.publicUrl,
            is_principal: true
          });
        }
      }

      toast.success('Pet cadastrado com sucesso!');
      setIsModalOpen(false);
      resetForm();
      fetchPets();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao cadastrar o animal.');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setNome('');
    setEspecie('CACHORRO');
    setPorte('MEDIO');
    setIdade('');
    setStatus('DISPONIVEL');
    setFoto(null);
  };

  const getPrincipalPhoto = (fotos: any[]) => {
    if (!fotos || fotos.length === 0) return 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=400';
    const principal = fotos.find(f => f.is_principal);
    return principal ? principal.url : fotos[0].url;
  };

  const filteredPets = pets.filter(p => p.nome.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Gestão de Pets</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" /> Novo Pet
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="relative w-full lg:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Buscar por nome..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        
        <div className="flex flex-wrap gap-2 w-full lg:w-auto items-center">
          <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md \${viewMode === 'grid' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-500'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('lista')}
              className={`p-1.5 rounded-md \${viewMode === 'lista' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-500'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      ) : filteredPets.length === 0 ? (
        <div className="text-center p-12 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500">Nenhum animal cadastrado ainda.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredPets.map((pet) => (
            <div key={pet.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow group relative">
              <div className={`absolute top-2 right-2 text-xs px-2 py-1 rounded-full font-medium z-10 \${
                pet.status === 'DISPONIVEL' ? 'bg-emerald-100 text-emerald-800' : 
                pet.status === 'ADOTADO' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {pet.status === 'DISPONIVEL' ? 'Para Adoção' : pet.status}
              </div>
              <div className="aspect-square bg-gray-200 relative overflow-hidden">
                <img src={getPrincipalPhoto(pet.fotos_pet)} alt={pet.nome} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              </div>
              <div className="p-4">
                <h3 className="font-bold text-gray-900 text-lg">{pet.nome}</h3>
                <p className="text-sm text-gray-500 mb-3">{pet.especie === 'CACHORRO' ? 'Cão' : 'Gato'} • {pet.sexo === 'FEMEA' ? 'Fêmea' : 'Macho'} • {pet.idade_aproximada || 'Idade desconhecida'}</p>
                <div className="flex gap-2">
                  <button className="flex-1 py-1.5 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 flex justify-center items-center gap-1">
                    <Edit className="w-3.5 h-3.5" /> Editar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
              <tr>
                <th className="p-4">Pet</th>
                <th className="p-4">Idade/Porte</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPets.map((pet) => (
                <tr key={pet.id} className="hover:bg-gray-50">
                  <td className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden">
                      <img src={getPrincipalPhoto(pet.fotos_pet)} alt={pet.nome} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{pet.nome}</p>
                      <p className="text-xs text-gray-500">{pet.especie === 'CACHORRO' ? 'Cão' : 'Gato'} • {pet.sexo === 'FEMEA' ? 'Fêmea' : 'Macho'}</p>
                    </div>
                  </td>
                  <td className="p-4 text-gray-700">{pet.idade_aproximada || '-'} • {pet.porte}</td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium \${
                      pet.status === 'DISPONIVEL' ? 'bg-emerald-100 text-emerald-800' : 
                      pet.status === 'ADOTADO' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {pet.status === 'DISPONIVEL' ? 'Para Adoção' : pet.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button className="text-gray-400 hover:text-emerald-600">
                      <Edit className="w-4 h-4 inline-block" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Novo Pet (Simplificado para o MVP) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold text-gray-900">Cadastrar Novo Pet</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSavePet} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Animal</label>
                <input 
                  type="text" 
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Espécie</label>
                  <select 
                    value={especie}
                    onChange={(e) => setEspecie(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="CACHORRO">Cachorro</option>
                    <option value="GATO">Gato</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Porte</label>
                  <select 
                    value={porte}
                    onChange={(e) => setPorte(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="PEQUENO">Pequeno</option>
                    <option value="MEDIO">Médio</option>
                    <option value="GRANDE">Grande</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Idade Aproximada</label>
                  <input 
                    type="text" 
                    placeholder="Ex: 2 anos"
                    value={idade}
                    onChange={(e) => setIdade(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status Inicial</label>
                  <select 
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="DISPONIVEL">Disponível para Adoção</option>
                    <option value="EM_TRATAMENTO">Em Tratamento</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Foto Principal</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => setFoto(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100" 
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-70 flex justify-center items-center"
                >
                  {saving ? 'Salvando...' : 'Cadastrar Pet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
