import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2, Heart, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { Pet } from '@/types';
import { toast } from 'sonner';

export default function DetalheAnimal() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [animal, setAnimal] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchAnimalDetails();
    }
  }, [id]);

  const fetchAnimalDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('pets')
        .select('*, fotos_pet(url, is_principal)')
        .eq('id', id)
        .single();

      if (error) throw error;
      setAnimal(data);
    } catch (error) {
      console.error('Erro ao buscar detalhes do animal:', error);
      toast.error('Animal não encontrado.');
      navigate('/animais');
    } finally {
      setLoading(false);
    }
  };

  const getPrincipalPhoto = (fotos: any[]) => {
    if (!fotos || fotos.length === 0) return 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=800';
    const principal = fotos.find(f => f.is_principal);
    return principal ? principal.url : fotos[0].url;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!animal) return null;

  return (
    <div className="container mx-auto p-4 max-w-5xl mt-6">
      <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 hover:text-emerald-600 mb-6 transition-colors">
        <ArrowLeft size={20} className="mr-2" /> Voltar para lista
      </button>

      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <div className="flex flex-col md:flex-row">
          
          <div className="w-full md:w-1/2 bg-gray-100">
            <img 
              src={getPrincipalPhoto(animal.fotos_pet)} 
              alt={animal.nome} 
              className="w-full h-[300px] md:h-[500px] object-cover"
            />
          </div>

          <div className="w-full md:w-1/2 p-8 overflow-y-auto max-h-[500px]">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">{animal.nome}</h1>
                <p className="text-lg text-gray-500">
                  {animal.especie === 'CACHORRO' ? 'Cão' : animal.especie === 'GATO' ? 'Gato' : animal.especie} • {animal.sexo === 'FEMEA' ? 'Fêmea' : 'Macho'} • {animal.raca || 'Sem Raça Definida (SRD)'}
                </p>
              </div>
              <div className="flex gap-2">
                <button className="p-3 bg-gray-100 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors">
                  <Heart size={24} />
                </button>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success('Link copiado!');
                  }}
                  className="p-3 bg-gray-100 rounded-full hover:bg-blue-50 hover:text-blue-500 transition-colors"
                >
                  <Share2 size={24} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-gray-50 p-4 rounded-xl">
                <span className="block text-sm text-gray-500 mb-1">Idade</span>
                <span className="font-semibold text-gray-900">{animal.idade_aproximada || 'Desconhecida'}</span>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl">
                <span className="block text-sm text-gray-500 mb-1">Porte</span>
                <span className="font-semibold text-gray-900">{animal.porte}</span>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl">
                <span className="block text-sm text-gray-500 mb-1">Pelagem/Cor</span>
                <span className="font-semibold text-gray-900">{animal.cor || animal.pelagem || 'Não informado'}</span>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl">
                <span className="block text-sm text-gray-500 mb-1">Peso</span>
                <span className="font-semibold text-gray-900">{animal.peso_aproximado ? `\${animal.peso_aproximado} kg` : 'Não informado'}</span>
              </div>
            </div>

            {animal.descricao && (
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Sobre {animal.nome}</h3>
                <p className="text-gray-700 leading-relaxed">{animal.descricao}</p>
              </div>
            )}

            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Saúde</h3>
              <ul className="space-y-2">
                <li className="flex items-center text-gray-700">
                  {animal.vacinado ? <CheckCircle2 className="text-emerald-500 mr-2" size={20} /> : <AlertCircle className="text-gray-400 mr-2" size={20} />}
                  Vacinado
                </li>
                <li className="flex items-center text-gray-700">
                  {animal.castrado ? <CheckCircle2 className="text-emerald-500 mr-2" size={20} /> : <AlertCircle className="text-gray-400 mr-2" size={20} />}
                  Castrado
                </li>
                <li className="flex items-center text-gray-700">
                  {animal.vermifugado ? <CheckCircle2 className="text-emerald-500 mr-2" size={20} /> : <AlertCircle className="text-gray-400 mr-2" size={20} />}
                  Vermifugado
                </li>
                {animal.microchip && (
                  <li className="flex items-center text-gray-700">
                    <CheckCircle2 className="text-emerald-500 mr-2" size={20} />
                    Microchipado
                  </li>
                )}
              </ul>
            </div>

            <Button className="w-full h-14 text-lg bg-emerald-600 hover:bg-emerald-700 shadow-lg">
              Quero Adotar {animal.sexo === 'FEMEA' ? 'a' : 'o'} {animal.nome}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
