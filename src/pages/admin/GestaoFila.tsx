import React, { useState } from 'react';
import { Search, Filter, Download, Calendar as CalendarIcon, CheckCircle, XCircle } from 'lucide-react';

export default function GestaoFila() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestão de Fila de Castração</h1>
          <p className="text-gray-500">Campanha Atual: Mutirão Centro (Maio 2024)</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
            <Download className="w-4 h-4" /> Exportar CSV
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Buscar por tutor ou pet..." 
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500">
              <option>Todos os Status</option>
              <option>Aguardando</option>
              <option>Agendado</option>
              <option>Realizado</option>
            </select>
            <button className="p-2 border border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
              <tr>
                <th className="p-4 w-12"><input type="checkbox" className="rounded text-emerald-600" /></th>
                <th className="p-4">Posição</th>
                <th className="p-4">Pet / Espécie</th>
                <th className="p-4">Tutor</th>
                <th className="p-4">Prioridade</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4"><input type="checkbox" className="rounded text-emerald-600" /></td>
                  <td className="p-4 font-semibold text-gray-900">#{i}</td>
                  <td className="p-4">
                    <p className="font-medium text-gray-900">Rex</p>
                    <p className="text-xs text-gray-500">Cão • Macho</p>
                  </td>
                  <td className="p-4">
                    <p className="text-gray-900">Maria Silva</p>
                    <p className="text-xs text-gray-500">(41) 99999-9999</p>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                      Alta (Baixa Renda)
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Aguardando
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button title="Agendar" className="p-1.5 text-blue-600 hover:bg-blue-50 rounded">
                        <CalendarIcon className="w-4 h-4" />
                      </button>
                      <button title="Concluir" className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded">
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button title="Cancelar" className="p-1.5 text-red-600 hover:bg-red-50 rounded">
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-gray-200 text-sm text-gray-500 flex justify-between items-center">
          <span>Mostrando 1 a 5 de 156 registros</span>
          <div className="flex gap-1">
            <button className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50" disabled>Anterior</button>
            <button className="px-3 py-1 border rounded hover:bg-gray-50">Próxima</button>
          </div>
        </div>
      </div>
    </div>
  );
}
