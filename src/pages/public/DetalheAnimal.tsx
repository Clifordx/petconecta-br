import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2, Heart, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function DetalheAnimal() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="container mx-auto p-4 max-w-5xl mt-6">
      <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 hover:text-emerald-600 mb-6 transition-colors">
        <ArrowLeft size={20} className="mr-2" /> Voltar para lista
      </button>

      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <div className="flex flex-col md:flex-row">
          
          <div className="w-full md:w-1/2 bg-gray-100">
            <img 
              src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=800" 
              alt="Luna" 
              className="w-full h-[300px] md:h-[500px] object-cover"
            />
          </div>

          <div className="w-full md:w-1/2 p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Luna</h1>
                <p className="text-lg text-gray-500">Cão • Fêmea • Sem Raça Definida (SRD)</p>
              </div>
              <div className="flex gap-2">
                <button className="p-3 bg-gray-100 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors">
                  <Heart size={24} />
                </button>
                <button className="p-3 bg-gray-100 rounded-full hover:bg-blue-50 hover:text-blue-500 transition-colors">
                  <Share2 size={24} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-gray-50 p-4 rounded-xl">
                <span className="block text-sm text-gray-500 mb-1">Idade</span>
                <span className="font-semibold text-gray-900">2 anos</span>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl">
                <span className="block text-sm text-gray-500 mb-1">Porte</span>
                <span className="font-semibold text-gray-900">Médio (15kg)</span>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl">
                <span className="block text-sm text-gray-500 mb-1">Pelagem</span>
                <span className="font-semibold text-gray-900">Curta</span>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl">
                <span className="block text-sm text-gray-500 mb-1">Temperamento</span>
                <span className="font-semibold text-gray-900">Dócil, Brincalhona</span>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Saúde</h3>
              <ul className="space-y-2">
                <li className="flex items-center text-gray-700"><CheckCircle2 className="text-emerald-500 mr-2" size={20} /> Vacinada (V10 e Raiva)</li>
                <li className="flex items-center text-gray-700"><CheckCircle2 className="text-emerald-500 mr-2" size={20} /> Castrada</li>
                <li className="flex items-center text-gray-700"><CheckCircle2 className="text-emerald-500 mr-2" size={20} /> Vermifugada</li>
                <li className="flex items-center text-gray-700"><CheckCircle2 className="text-emerald-500 mr-2" size={20} /> Microchipada</li>
              </ul>
            </div>

            <Button className="w-full h-14 text-lg bg-emerald-600 hover:bg-emerald-700 shadow-lg">
              Quero Adotar a Luna
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
