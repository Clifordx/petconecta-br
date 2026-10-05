import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Users, Heart, Plus, Search, Check } from 'lucide-react';

export default function GestaoFeirasDetalhe() {
  const [activeTab, setActiveTab] = useState<'animais' | 'adocoes'>('animais');
  const { id } = useParams();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/admin/feiras" className="p-2 bg-white border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mega Feira Pet Inverno</h1>
          <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> 15/07/2024</span>
            <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> Parque Barigui</span>
          </div>
        </div>
        <div className="ml-auto">
          <Link to="/admin/adocoes/nova" className="flex items-center gap-2 px-5 py-2.5 bg-pink-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-pink-200 hover:bg-pink-700 transition-all hover:-translate-y-0.5">
            <Heart className="w-5 h-5" fill="currentColor" /> Nova Adoção
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button 
            onClick={() => setActiveTab('animais')}
            className={`flex-1 py-4 px-6 text-sm font-medium border-b-2 transition-colors ${activeTab === 'animais' ? 'border-emerald-500 text-emerald-700 bg-emerald-50/50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
          >
            <div className="flex items-center justify-center gap-2">
              <Users className="w-4 h-4" />
              Animais da Feira (32)
            </div>
          </button>
          <button 
            onClick={() => setActiveTab('adocoes')}
            className={`flex-1 py-4 px-6 text-sm font-medium border-b-2 transition-colors ${activeTab === 'adocoes' ? 'border-pink-500 text-pink-700 bg-pink-50/50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
          >
            <div className="flex items-center justify-center gap-2">
              <Heart className="w-4 h-4" />
              Adoções Realizadas (5)
            </div>
          </button>
        </div>

        <div className="p-4 sm:p-6">
          {activeTab === 'animais' ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="relative w-full max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input type="text" placeholder="Buscar animal na feira..." className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 border border-emerald-600 text-emerald-700 bg-emerald-50 rounded-lg text-sm font-medium hover:bg-emerald-100">
                  <Plus className="w-4 h-4" /> Adicionar à Feira
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="border border-gray-200 rounded-lg p-3 relative group">
                    {i === 1 ? (
                       <div className="absolute -top-2 -right-2 bg-pink-500 text-white p-1 rounded-full shadow-sm z-10" title="Adotado!">
                         <Check className="w-4 h-4" />
                       </div>
                    ) : null}
                    <div className="aspect-square bg-gray-100 rounded-md mb-3 overflow-hidden">
                      <img src={`https://source.unsplash.com/random/200x200/?dog,cat&sig=${i}`} className="w-full h-full object-cover" />
                    </div>
                    <h4 className="font-bold text-gray-900 text-sm">Princesa {i}</h4>
                    <p className="text-xs text-gray-500">Gato • Fêmea</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Heart className="w-12 h-12 text-pink-300 mx-auto mb-3" />
              <p className="text-lg font-medium text-gray-900">5 adoções realizadas nesta feira!</p>
              <p className="text-sm">Lista de adotantes e contratos aparecerão aqui.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
