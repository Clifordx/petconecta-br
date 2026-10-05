import React from 'react';
import { Calendar, MapPin, Users, Plus, ArrowRight, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function GestaoFeiras() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestão de Feiras de Adoção</h1>
          <p className="text-gray-500">Organize e acompanhe eventos de adoção</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 shadow-sm transition-colors">
          <Plus className="w-4 h-4" /> Nova Feira
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card Feira Ativa/Próxima */}
        <div className="bg-white border-2 border-emerald-500 rounded-xl overflow-hidden shadow-sm relative flex flex-col">
          <div className="absolute top-4 right-4 bg-emerald-500 text-white text-xs px-2 py-1 rounded-full font-bold uppercase tracking-wider">
            Neste Final de Semana
          </div>
          <div className="h-32 bg-emerald-100 p-4 flex flex-col justify-end">
            <h3 className="text-xl font-bold text-emerald-900">Mega Feira Pet Inverno</h3>
          </div>
          <div className="p-5 flex-1 space-y-4">
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                15 e 16 de Julho • 10h às 17h
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                Parque Barigui (Pavilhão)
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-400" />
                32 Animais escalados
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-100">
              <Link to="/admin/feiras/1" className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-100 transition-colors">
                Gerenciar Feira <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Cards Feiras Passadas */}
        {[2, 3].map((i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm relative flex flex-col opacity-75 hover:opacity-100 transition-opacity">
            <div className="absolute top-4 right-4 bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full font-bold uppercase tracking-wider">
              Concluída
            </div>
            <div className="h-32 bg-gray-100 p-4 flex flex-col justify-end">
              <h3 className="text-xl font-bold text-gray-800">Feira de Adoção Shopping {i}</h3>
            </div>
            <div className="p-5 flex-1 space-y-4">
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  10 de Junho • 12h às 18h
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  Shopping Mueller
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-pink-500" />
                  12 Adoções realizadas
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-100">
                <Link to={`/admin/feiras/${i}`} className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                  Ver Relatório
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
