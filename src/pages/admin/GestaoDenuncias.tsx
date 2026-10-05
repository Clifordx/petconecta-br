import React, { useState } from 'react';
import { Search, Filter, AlertTriangle, Eye, CheckCircle, MapPin, Map, FileText } from 'lucide-react';

export default function GestaoDenuncias() {
  const [viewMode, setViewMode] = useState<'lista' | 'mapa'>('lista');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestão de Denúncias</h1>
          <p className="text-gray-500">Acompanhamento de maus-tratos e abandonos</p>
        </div>
        <div className="flex gap-2 bg-gray-100 p-1 rounded-lg border border-gray-200">
          <button 
            onClick={() => setViewMode('lista')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'lista' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
          >
            Lista
          </button>
          <button 
            onClick={() => setViewMode('mapa')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'mapa' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
          >
            Mapa
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="relative w-full lg:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Buscar por protocolo, endereço..." 
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div className="flex flex-wrap gap-2 w-full lg:w-auto">
            <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
              <option>Todas as Urgências</option>
              <option>Crítica</option>
              <option>Alta</option>
              <option>Média</option>
              <option>Baixa</option>
            </select>
            <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
              <option>Status: Todos</option>
              <option>Nova</option>
              <option>Em Investigação</option>
              <option>Resolvida</option>
            </select>
          </div>
        </div>

        {viewMode === 'lista' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
                <tr>
                  <th className="p-4">Protocolo / Data</th>
                  <th className="p-4">Tipo</th>
                  <th className="p-4">Urgência</th>
                  <th className="p-4">Endereço</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {[
                  { prot: '2024-001', urg: 'Crítica', color: 'red', type: 'Maus-tratos (Violência)', status: 'Nova' },
                  { prot: '2024-002', urg: 'Alta', color: 'orange', type: 'Abandono em via pública', status: 'Em Investigação' },
                  { prot: '2024-003', urg: 'Média', color: 'yellow', type: 'Animal acorrentado', status: 'Nova' },
                  { prot: '2024-004', urg: 'Baixa', color: 'gray', type: 'Cão solto na rua', status: 'Resolvida' },
                ].map((item, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <p className="font-semibold text-gray-900">#{item.prot}</p>
                      <p className="text-xs text-gray-500">Hoje, 14:30</p>
                    </td>
                    <td className="p-4 font-medium text-gray-700">{item.type}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-${item.color}-100 text-${item.color}-800`}>
                        <AlertTriangle className="w-3 h-3" />
                        {item.urg}
                      </span>
                    </td>
                    <td className="p-4 text-gray-600 max-w-xs truncate" title="Rua das Flores, 123 - Centro">
                      Rua das Flores, 123 - Centro
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border border-gray-200 bg-white text-gray-700">
                        {item.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button title="Ver Detalhes e Evidências" className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-200">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button title="Atualizar Status" className="p-1.5 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-200">
                          <FileText className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="h-[500px] bg-gray-100 flex flex-col items-center justify-center text-gray-400">
            <Map className="w-12 h-12 mb-2 opacity-50" />
            <p>Visualização de mapa (Integração com Google Maps/Leaflet)</p>
          </div>
        )}
      </div>
    </div>
  );
}
