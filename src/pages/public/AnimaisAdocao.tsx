import React, { useState, useEffect } from 'react';
import { Search, Heart } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Pet } from '@/types';

export default function AnimaisAdocao() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('todos');
  const [animais, setAnimais] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchAnimais();
  }, []);

  const fetchAnimais = async () => {
    try {
      const { data, error } = await supabase
        .from('pets')
        .select('*, fotos_pet(url, is_principal)')
        .eq('status', 'para_adocao')
        .order('criado_em', { ascending: false });

      if (error) throw error;
      setAnimais(data || []);
    } catch (error) {
      console.error('Erro ao buscar animais:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAnimais = animais.filter(animal => {
    if (filter !== 'todos') {
      const isCachorro = animal.especie.toLowerCase() === 'cachorro' || animal.especie.toLowerCase() === 'cao' || animal.especie.toLowerCase() === 'cão';
      if (filter === 'CACHORRO' && !isCachorro) return false;
      if (filter === 'GATO' && isCachorro) return false;
    }
    if (search && !animal.nome.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    return true;
  });

  const getPrincipalPhoto = (fotos: any[]) => {
    if (!fotos || fotos.length === 0) return 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=400';
    const principal = fotos.find(f => f.is_principal);
    return principal ? principal.url : fotos[0].url;
  };

  return (
    <div className="container mx-auto p-4 min-h-screen">
      <div className="text-center mb-10 mt-6">
        <h1 className="text-4xl font-bold text-emerald-900 mb-4">Adote um Amigo</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">Conheça os animais que estão esperando por um lar cheio de amor.</p>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          <Button variant={filter === 'todos' ? 'primary' : 'outline'} onClick={() => setFilter('todos')}>Todos</Button>
          <Button variant={filter === 'CACHORRO' ? 'primary' : 'outline'} onClick={() => setFilter('CACHORRO')}>Cães</Button>
          <Button variant={filter === 'GATO' ? 'primary' : 'outline'} onClick={() => setFilter('GATO')}>Gatos</Button>
        </div>
        
        <div className="relative w-full md:w-72">
          <input 
            type="text" 
            placeholder="Buscar por nome..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border rounded-full pl-10 pr-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none" 
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      ) : filteredAnimais.length === 0 ? (
        <div className="text-center p-12 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500">Nenhum animal encontrado com esses filtros.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredAnimais.map((animal: any) => (
            <div key={animal.id} className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow group cursor-pointer" onClick={() => navigate(`/adocao/\${animal.id}`)}>
              <div className="relative h-48 overflow-hidden bg-gray-100">
                <img src={getPrincipalPhoto(animal.fotos_pet)} alt={animal.nome} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <button className="absolute top-2 right-2 p-2 bg-white/80 rounded-full hover:bg-white hover:text-red-500 transition-colors" onClick={(e) => { e.stopPropagation(); }}>
                  <Heart size={20} />
                </button>
              </div>
              <div className="p-4">
                <div className="flex justify-between items-end mb-2">
                  <h3 className="text-xl font-bold text-gray-900">{animal.nome}</h3>
                  <span className="text-xs font-medium px-2 py-1 bg-emerald-100 text-emerald-800 rounded-full">
                    {(animal.especie === 'CACHORRO' || animal.especie === 'cao' || animal.especie === 'cão' || animal.especie === 'Cão') ? 'Cão' : 'Gato'}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-4">{animal.raca || 'SRD'} • {animal.observacoes || 'Idade desconhecida'} • {animal.porte}</p>
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700">Conhecer {animal.nome}</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
