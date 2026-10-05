import React from 'react';
import { Calendar, MapPin, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function FeirasPublicas() {
  const feiras = [
    {
      id: 1,
      title: 'Super Feira de Adoção - Praça do Japão',
      date: 'Sábado, 25 de Novembro - 10h às 16h',
      location: 'Praça do Japão, Água Verde, Curitiba - PR',
      desc: 'Venha conhecer mais de 50 animais resgatados esperando por um lar! Teremos cães e gatos de todas as idades, microchipados, vacinados e castrados.',
      img: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=800'
    }
  ];

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <div className="text-center mb-10 mt-6">
        <h1 className="text-4xl font-bold text-emerald-900 mb-4">Feiras de Adoção</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">Participe dos nossos eventos e encontre seu novo melhor amigo presencialmente.</p>
      </div>

      <div className="space-y-8">
        <h2 className="text-2xl font-bold text-gray-900 border-b pb-2">Próximos Eventos</h2>
        
        {feiras.map(feira => (
          <div key={feira.id} className="bg-white rounded-xl shadow-sm border overflow-hidden flex flex-col md:flex-row">
            <div className="w-full md:w-1/3 h-48 md:h-auto">
              <img src={feira.img} alt={feira.title} className="w-full h-full object-cover" />
            </div>
            <div className="p-6 md:w-2/3 flex flex-col justify-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">{feira.title}</h3>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-gray-600">
                  <Calendar size={18} className="mr-2 text-emerald-600" />
                  <span>{feira.date}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <MapPin size={18} className="mr-2 text-emerald-600" />
                  <span>{feira.location}</span>
                </div>
              </div>
              
              <p className="text-gray-600 mb-6">{feira.desc}</p>
              
              <div className="flex gap-4 mt-auto">
                <Button className="bg-emerald-600 hover:bg-emerald-700">Ver Detalhes</Button>
                <Button variant="outline" className="border-emerald-600 text-emerald-600 hover:bg-emerald-50">
                  <Share2 size={18} className="mr-2" /> Compartilhar
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
