import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Dog, Cat, Loader2, Info } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

type Pet = {
  id: string;
  nome: string;
  especie: 'cao' | 'gato' | 'outro';
  raca: string;
  status: string;
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
          .select('*')
          .eq('tutor_id', user.id);
        
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
          <Plus className="w-5 h-5 mr-2" />
          Adicionar Pet
        </Link>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        </div>
      ) : pets.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 border-dashed p-12 text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
            <Dog className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum pet cadastrado</h3>
          <p className="text-gray-500 max-w-sm mx-auto mb-6">
            Você ainda não cadastrou nenhum animal. Cadastre seus pets para agendar consultas e solicitar castração.
          </p>
          <Link 
            to="/app/meus-pets/novo"
            className="inline-flex items-center justify-center bg-white border border-gray-300 text-gray-700 px-5 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Cadastrar meu primeiro pet
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {pets.map((pet) => (
            <Link 
              key={pet.id} 
              to={`/app/meus-pets/${pet.id}`}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group"
            >
              <div className="aspect-square bg-gray-100 relative overflow-hidden flex items-center justify-center text-gray-300">
                 {pet.especie === 'gato' ? <Cat className="w-20 h-20" /> : <Dog className="w-20 h-20" />}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
                    {pet.nome}
                  </h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                    {pet.status === 'com_tutor' ? 'Comigo' : pet.status}
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <span className="capitalize">{pet.especie}</span>
                  <span className="mx-2">•</span>
                  <span>{pet.raca}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default MeusPets;
