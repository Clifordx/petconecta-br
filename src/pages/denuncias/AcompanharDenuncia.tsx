import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function AcompanharDenuncia() {
  const [protocol, setProtocol] = useState('');
  const [searched, setSearched] = useState(false);

  return (
    <div className="container mx-auto p-4 max-w-2xl mt-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4 text-emerald-900">Acompanhar Denúncia</h1>
        <p className="text-gray-600">Insira o número do protocolo para verificar o andamento.</p>
      </div>
      
      <form onSubmit={(e) => { e.preventDefault(); setSearched(true); }} className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex flex-col md:flex-row gap-4">
          <input 
            type="text" 
            placeholder="Ex: DEN-2024-XXXX" 
            value={protocol}
            onChange={(e) => setProtocol(e.target.value)}
            className="flex-1 border rounded p-3 text-lg font-mono uppercase"
            required
          />
          <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 h-12 px-8">
            <Search size={20} className="mr-2"/> Buscar
          </Button>
        </div>
      </form>

      {searched && (
        <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-xl font-bold mb-4 border-b pb-2">Status da Denúncia: {protocol.toUpperCase()}</h3>
          <div className="relative border-l-2 border-emerald-500 ml-3 md:ml-6 mt-6 space-y-8">
            
            <div className="relative">
              <div className="absolute w-4 h-4 bg-emerald-500 rounded-full -left-[9px] top-1 border-2 border-white"></div>
              <div className="pl-6">
                <h4 className="font-bold text-gray-900">Denúncia Recebida</h4>
                <p className="text-sm text-gray-500">10/11/2023 às 14:30</p>
              </div>
            </div>

            <div className="relative">
              <div className="absolute w-4 h-4 bg-emerald-500 rounded-full -left-[9px] top-1 border-2 border-white"></div>
              <div className="pl-6">
                <h4 className="font-bold text-gray-900">Em Análise</h4>
                <p className="text-sm text-gray-500">11/11/2023 às 09:15</p>
                <p className="text-sm text-gray-700 mt-1">A denúncia foi triada e encaminhada ao departamento responsável.</p>
              </div>
            </div>

            <div className="relative">
              <div className="absolute w-4 h-4 bg-gray-300 rounded-full -left-[9px] top-1 border-2 border-white"></div>
              <div className="pl-6">
                <h4 className="font-bold text-gray-400">Em Investigação</h4>
              </div>
            </div>

            <div className="relative">
              <div className="absolute w-4 h-4 bg-gray-300 rounded-full -left-[9px] top-1 border-2 border-white"></div>
              <div className="pl-6">
                <h4 className="font-bold text-gray-400">Resolvida</h4>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
