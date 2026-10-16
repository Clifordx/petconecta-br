import React, { useState, useEffect } from 'react';
import { Search, Heart, Filter, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Pet } from '@/types';

export default function AnimaisAdocao() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('todos');
  const [animais, setAnimais] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchAnimais();
  }, []);

  const fetchAnimais = async () => {
    try {
      setLoading(true);
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
      const isCachorro = ['cachorro', 'cao', 'cão'].includes(animal.especie?.toLowerCase());
      if (filter === 'CACHORRO' && !isCachorro) return false;
      if (filter === 'GATO' && isCachorro) return false;
    }
    if (search && !animal.nome?.toLowerCase().includes(search.toLowerCase()) && !animal.raca?.toLowerCase().includes(search.toLowerCase())) {
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
    <div className="container mx-auto p-4 min-h-screen py-8">
      {/* Hero Header */}
      <div className="text-center mb-10 mt-2">
        <span className="text-xs uppercase font-bold tracking-wider text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full inline-block mb-3">
          Adote um Amigo • Posse Responsável
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-emerald-950 mb-3">
          Encontre seu Novo Melhor Amigo
        </h1>
        <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
          Animais resgatados, cuidados e prontos para encher o seu lar de carinho no município de Arapongas / PR.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <Button 
            variant={filter === 'todos' ? 'primary' : 'outline'} 
            onClick={() => setFilter('todos')}
            className="text-xs sm:text-sm font-semibold rounded-xl"
          >
            Todos ({animais.length})
          </Button>
          <Button 
            variant={filter === 'CACHORRO' ? 'primary' : 'outline'} 
            onClick={() => setFilter('CACHORRO')}
            className="text-xs sm:text-sm font-semibold rounded-xl"
          >
            Cães
          </Button>
          <Button 
            variant={filter === 'GATO' ? 'primary' : 'outline'} 
            onClick={() => setFilter('GATO')}
            className="text-xs sm:text-sm font-semibold rounded-xl"
          >
            Gatos
          </Button>
        </div>
        
        <div className="relative w-full md:w-80">
          <input 
            type="text" 
            placeholder="Buscar por nome ou raça..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" 
          />
          <Search className="absolute left-3.5 top-3 text-gray-400" size={16} />
        </div>
      </div>

      {/* Grid of Pets */}
      {loading ? (
        <div className="flex justify-center p-16">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredAnimais.length === 0 ? (
        <div className="text-center p-16 bg-white rounded-2xl border border-gray-200 space-y-3">
          <Heart className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="text-lg font-bold text-gray-800">Nenhum animal encontrado</h3>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">
            Não encontramos pets disponíveis com os filtros selecionados no momento.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredAnimais.map((animal: any) => (
            <div 
              key={animal.id} 
              className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all group cursor-pointer flex flex-col justify-between"
              onClick={() => navigate(`/animais/${animal.id}`)}
            >
              <div>
                <div className="relative aspect-square overflow-hidden bg-gray-50">
                  <img 
                    src={getPrincipalPhoto(animal.fotos_pet)} 
                    alt={animal.nome} 
                    className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300" 
                  />
                  <div className="absolute top-3 left-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 bg-emerald-600 text-white rounded-full shadow-sm">
                      Para Adoção
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">
                      {animal.nome}
                    </h3>
                    <span className="text-xs font-semibold px-2 py-0.5 bg-gray-100 text-gray-700 rounded-md">
                      {['cachorro', 'cao', 'cão'].includes(animal.especie?.toLowerCase()) ? 'Cão' : 'Gato'}
                    </span>
                  </div>

                  <p className="text-xs text-gray-500 mb-2">
                    {animal.raca || 'Sem raça definida'} • {animal.sexo === 'femea' ? 'Fêmea' : 'Macho'} • Porte {animal.porte || 'Médio'}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {animal.castrado && (
                      <span className="text-[10px] bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded">
                        Castrado
                      </span>
                    )}
                    {animal.vacinado && (
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded">
                        Vacinado
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-4 pt-0">
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-sm font-bold rounded-xl py-2.5 shadow-sm">
                  Conhecer {animal.nome}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
