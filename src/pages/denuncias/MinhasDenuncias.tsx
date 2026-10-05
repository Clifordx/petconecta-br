import React, { useState } from 'react';
import { Search, ChevronDown, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function MinhasDenuncias() {
  const [search, setSearch] = useState('');
  
  const mockDenuncias = [
    {
      id: 'DEN-2024-1234',
      type: 'Abandono',
      date: '2023-11-01',
      status: 'em_investigacao',
      urgency: 'alta',
      expanded: false
    }
  ];

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6 text-emerald-900">Acompanhamento de Denúncias</h1>
      
      <div className="bg-white p-4 rounded-lg shadow-sm border mb-6 flex gap-4">
        <input 
          type="text" 
          placeholder="Buscar por número de protocolo (ex: DEN-2024-XXXX)" 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border rounded p-2"
        />
        <Button className="bg-emerald-600"><Search size={18} className="mr-2"/> Buscar</Button>
      </div>

      <div className="space-y-4">
        {mockDenuncias.map(d => (
          <div key={d.id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 cursor-pointer hover:bg-gray-50">
              <div>
                <h3 className="font-bold font-mono text-lg">{d.id}</h3>
                <p className="text-sm text-gray-500">{d.type} • Registrada em {new Date(d.date).toLocaleDateString('pt-BR')}</p>
              </div>
              <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                  Em Investigação
                </span>
                <ChevronDown className="text-gray-400" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
