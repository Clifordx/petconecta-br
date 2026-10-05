import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Dog, Cat, Loader2, Info } from 'lucide-react';
// Assume custom hooks/context are set up to fetch data, but here we just mock or use local state
import { supabase } from '@/lib/supabase';

// Mock type
type Pet = {
  id: string;
  nome: string;
  especie: 'cão' | 'gato';
  raca: string;
  foto_url?: string;
  status: string;
};

const MeusPets = () => {
  const [pets, setPets] = useState<Pet[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In real app, fetch from Supabase
    setTimeout(() => {
      setPets([
        { id: '1', nome: 'Rex', especie: 'cão', raca: 'Vira-lata', status: 'Ativo' },
        { id: '2', nome: 'Mimi', especie: 'gato', raca: 'Siamês', status: 'Ativo' }
      ]);
      setIsLoading(false);
    }, 1000);
  }, []);

  if (isLoading) {
    return (
      <div className="flex-1 p-8 flex justify-center items-center h-[calc(100vh-4rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meus Pets</h1>
          <p className="text-gray-500 text-sm mt-1">Gerencie seus animais cadastrados</p>
        </div>
        <Link to="/app/novo-pet" className="hidden sm:flex bg-emerald-600 text-white px-4 py-2 rounded-lg items-center text-sm font-medium hover:bg-emerald-700 transition-colors">
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Pet
        </Link>
      </div>

      {pets.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-4">
            <Dog className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum pet cadastrado</h3>
          <p className="text-gray-500 mb-6 max-w-md">Você ainda não tem nenhum animal cadastrado no sistema. Adicione seu primeiro pet para começar a usar nossos serviços.</p>
          <Link to="/app/novo-pet" className="bg-emerald-600 text-white px-6 py-3 rounded-lg flex items-center font-medium hover:bg-emerald-700 transition-colors">
            <Plus className="w-5 h-5 mr-2" />
            Adicionar Primeiro Pet
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {pets.map((pet) => (
            <Link key={pet.id} to={`/app/pets/${pet.id}`} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group">
              <div className="h-48 bg-gray-100 relative">
                {pet.foto_url ? (
                  <img src={pet.foto_url} alt={pet.nome} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">
                    {pet.especie === 'cão' ? <Dog className="w-16 h-16 opacity-50" /> : <Cat className="w-16 h-16 opacity-50" />}
                  </div>
                )}
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium text-gray-700 shadow-sm flex items-center">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5"></span>
                  {pet.status}
                </div>
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">{pet.nome}</h3>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      {pet.especie === 'cão' ? <Dog className="w-4 h-4 mr-1.5" /> : <Cat className="w-4 h-4 mr-1.5" />}
                      <span className="capitalize">{pet.especie}</span>
                      <span className="mx-2">•</span>
                      <span>{pet.raca}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* FAB Mobile */}
      <Link to="/app/novo-pet" className="sm:hidden fixed bottom-20 right-4 w-14 h-14 bg-emerald-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-emerald-700 active:scale-95 transition-transform">
        <Plus className="w-6 h-6" />
      </Link>
    </div>
  );
};

export default MeusPets;
