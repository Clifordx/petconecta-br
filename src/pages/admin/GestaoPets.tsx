import React, { useState } from 'react';
import { Search, Plus, Filter, LayoutGrid, List, Heart, Edit } from 'lucide-react';

export default function GestaoPets() {
  const [viewMode, setViewMode] = useState<'grid' | 'lista'>('grid');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Gestão de Pets</h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 shadow-sm transition-colors">
          <Plus className="w-4 h-4" /> Novo Pet
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="relative w-full lg:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Buscar por nome, raça, microchip..." 
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        
        <div className="flex flex-wrap gap-2 w-full lg:w-auto items-center">
          <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
            <option>Espécie: Todas</option>
            <option>Cães</option>
            <option>Gatos</option>
          </select>
          <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
            <option>Status: Todos</option>
            <option>Disponível p/ Adoção</option>
            <option>Em Tratamento</option>
            <option>Adotado</option>
          </select>
          <div className="h-8 w-px bg-gray-300 mx-2 hidden sm:block"></div>
          <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md ${viewMode === 'grid' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-500'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('lista')}
              className={`p-1.5 rounded-md ${viewMode === 'lista' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-500'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow group relative">
              <div className="absolute top-2 right-2 bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded-full font-medium z-10">
                Disponível
              </div>
              <div className="aspect-square bg-gray-200 relative overflow-hidden">
                <img src={`https://source.unsplash.com/random/300x300/?dog,cat&sig=${i}`} alt="Pet" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              </div>
              <div className="p-4">
                <h3 className="font-bold text-gray-900 text-lg">Bolinha {i}</h3>
                <p className="text-sm text-gray-500 mb-3">Cão • Macho • 2 anos</p>
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
          {/* Tabela similar à de denúncias/adoções */}
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
              <tr>
                <th className="p-4">Pet</th>
                <th className="p-4">Idade/Porte</th>
                <th className="p-4">Microchip</th>
                <th className="p-4">Status</th>
                <th className="p-4">Castrado</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {[1, 2, 3].map((i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden">
                      <img src={`https://source.unsplash.com/random/100x100/?dog,cat&sig=${i}`} alt="Pet" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Bolinha {i}</p>
                      <p className="text-xs text-gray-500">Cão • Macho</p>
                    </div>
                  </td>
                  <td className="p-4 text-gray-700">2 anos • Médio</td>
                  <td className="p-4 text-gray-600 font-mono text-xs">98200000{i}</td>
                  <td className="p-4">
                    <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded-full font-medium">Disponível</span>
                  </td>
                  <td className="p-4 text-emerald-600 font-medium">Sim</td>
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
    </div>
  );
}
