import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Dog, Cat, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

type Pet = {
  id: string;
  nome: string;
  especie: 'cao' | 'gato' | 'outro';
  raca: string;
  status: string;
  fotos_pet?: { url: string }[];
};

const MeusPets = () => {
  const { user } = useAuth();
  const [pets, setPets] = useState<Pet[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchPets = async () => {
      try {
        const { data, error } = await supabase
          .from('pets')
          .select('*, fotos_pet(url)')
          .eq('tutor_id', user.id)
          .order('criado_em', { referencedTable: 'fotos_pet', ascending: false });
        
        if (error) throw error;
        setPets(data || []);
      } catch (error) {
        console.error("Erro ao buscar pets:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPets();
  }, [user]);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meus Pets</h1>
          <p className="text-sm text-gray-500 mt-1">Gerencie os animais cadastrados no seu perfil</p>
        </div>
        <Link 
          to="/app/meus-pets/novo"
          className="bg-emerald-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center shadow-sm"
        >
          <Plus className="w-5 h-5 mr-2" /> Cadastrar Novo Pet
        </Link>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        </div>
      ) : pets.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center shadow-sm">
          <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
            <Dog className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Nenhum pet cadastrado</h2>
          <p className="text-gray-500 mb-6 max-w-sm mx-auto">
            Você ainda não cadastrou nenhum animal. Que tal adicionar o seu primeiro amigo de quatro patas?
          </p>
          <Link 
            to="/app/meus-pets/novo"
            className="inline-flex items-center justify-center bg-emerald-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-emerald-700 transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5 mr-2" /> Cadastrar Meu Pet
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {pets.map(pet => (
            <Link key={pet.id} to={`/app/meus-pets/${pet.id}`} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group flex flex-col">
              <div className="h-48 bg-gray-100 relative flex items-center justify-center overflow-hidden">
                {pet.fotos_pet && pet.fotos_pet.length > 0 ? (
                  <img src={pet.fotos_pet[0].url} alt={pet.nome} className="w-full h-full object-contain p-2" />
                ) : (
                  pet.especie === 'gato' ? <Cat className="w-16 h-16 text-gray-300" /> : <Dog className="w-16 h-16 text-gray-300" />
                )}
                <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors"></div>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">{pet.nome}</h3>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    pet.status === 'perdido' ? 'bg-red-100 text-red-800 border border-red-200' : 
                    pet.status === 'para_adocao' ? 'bg-blue-100 text-blue-800 border border-blue-200' : 
                    pet.status === 'obito' ? 'bg-gray-100 text-gray-800 border border-gray-200' : 
                    'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  }`}>
                    {pet.status === 'com_tutor' ? 'COMIGO' : 
                     pet.status === 'para_adocao' ? 'PARA ADOÇÃO' : 
                     pet.status === 'obito' ? 'ÓBITO' : 'PERDIDO'}
                  </span>
                </div>
                <p className="text-sm text-gray-500 capitalize">{pet.especie} • {pet.raca}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default MeusPets;
