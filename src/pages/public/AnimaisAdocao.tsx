import React, { useState } from 'react';
import { Search, Heart } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useNavigate } from 'react-router-dom';

const mockAnimais = [
  { id: 1, name: 'Luna', species: 'Cão', breed: 'SRD', age: '2 anos', size: 'Médio', img: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=400' },
  { id: 2, name: 'Simba', species: 'Gato', breed: 'Siamês', age: '1 ano', size: 'Pequeno', img: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=400' },
  { id: 3, name: 'Thor', species: 'Cão', breed: 'Labrador', age: '4 anos', size: 'Grande', img: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=400' },
  { id: 4, name: 'Mia', species: 'Gato', breed: 'SRD', age: '3 meses', size: 'Pequeno', img: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&q=80&w=400' },
];

export default function AnimaisAdocao() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('todos');

  return (
    <div className="container mx-auto p-4">
      <div className="text-center mb-10 mt-6">
        <h1 className="text-4xl font-bold text-emerald-900 mb-4">Adote um Amigo</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">Conheça os animais que estão esperando por um lar cheio de amor.</p>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          <Button variant={filter === 'todos' ? 'primary' : 'outline'} onClick={() => setFilter('todos')}>Todos</Button>
          <Button variant={filter === 'cao' ? 'primary' : 'outline'} onClick={() => setFilter('cao')}>Cães</Button>
          <Button variant={filter === 'gato' ? 'primary' : 'outline'} onClick={() => setFilter('gato')}>Gatos</Button>
        </div>
        
        <div className="relative w-full md:w-72">
          <input type="text" placeholder="Buscar por nome..." className="w-full border rounded-full pl-10 pr-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {mockAnimais.map(animal => (
          <div key={animal.id} className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow group cursor-pointer" onClick={() => navigate(`/adocao/${animal.id}`)}>
            <div className="relative h-48 overflow-hidden">
              <img src={animal.img} alt={animal.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <button className="absolute top-2 right-2 p-2 bg-white/80 rounded-full hover:bg-white hover:text-red-500 transition-colors" onClick={(e) => { e.stopPropagation(); }}>
                <Heart size={20} />
              </button>
            </div>
            <div className="p-4">
              <div className="flex justify-between items-end mb-2">
                <h3 className="text-xl font-bold text-gray-900">{animal.name}</h3>
                <span className="text-xs font-medium px-2 py-1 bg-emerald-100 text-emerald-800 rounded-full">{animal.species}</span>
              </div>
              <p className="text-sm text-gray-500 mb-4">{animal.breed} • {animal.age} • {animal.size}</p>
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700">Conhecer {animal.name}</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
