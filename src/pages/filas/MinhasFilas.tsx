import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { FileText, Stethoscope, Plus, Clock, CheckCircle2, AlertCircle, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

export default function MinhasFilas() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('castracao');

  // mock data
  const castracoes = [
    { id: 1, petName: 'Rex', status: 'na_fila', position: 15, date: '2023-10-25' },
  ];
  
  const consultas: any[] = [];

  const statusMap = {
    inscrito: { label: 'Inscrito', color: 'bg-blue-100 text-blue-800' },
    em_analise: { label: 'Em Análise', color: 'bg-yellow-100 text-yellow-800' },
    na_fila: { label: 'Na Fila', color: 'bg-purple-100 text-purple-800' },
    agendado: { label: 'Agendado', color: 'bg-green-100 text-green-800' },
    realizado: { label: 'Realizado', color: 'bg-gray-100 text-gray-800' },
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6 text-emerald-900">Minhas Filas</h1>
      
      <div className="flex gap-4 mb-6">
        <Button onClick={() => navigate('/filas/castracao')} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="w-4 h-4 mr-2" />
          Inscrever para Castração
        </Button>
        <Button onClick={() => navigate('/filas/consulta')} variant="outline" className="border-emerald-600 text-emerald-600 hover:bg-emerald-50">
          <Stethoscope className="w-4 h-4 mr-2" />
          Solicitar Consulta
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex gap-4 border-b pb-2 mb-4">
          <button 
            onClick={() => setActiveTab('castracao')}
            className={cn("px-4 py-2 font-medium transition-colors", activeTab === 'castracao' ? "text-emerald-700 border-b-2 border-emerald-600" : "text-gray-500")}
          >
            Castração
          </button>
          <button 
            onClick={() => setActiveTab('consulta')}
            className={cn("px-4 py-2 font-medium transition-colors", activeTab === 'consulta' ? "text-emerald-700 border-b-2 border-emerald-600" : "text-gray-500")}
          >
            Consultas
          </button>
        </div>

        {activeTab === 'castracao' && (
          <div className="space-y-4">
            {castracoes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                <p>Você não tem animais na fila de castração.</p>
              </div>
            ) : (
              castracoes.map(item => (
                <div key={item.id} className="border rounded-lg p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h3 className="font-semibold text-lg">{item.petName}</h3>
                    <p className="text-sm text-gray-500">Data de inscrição: {new Date(item.date).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-center px-4 border-r">
                      <span className="block text-2xl font-bold text-emerald-600">{item.position}º</span>
                      <span className="text-xs text-gray-500 uppercase">Posição</span>
                    </div>
                    <div>
                      <span className={cn("px-3 py-1 rounded-full text-sm font-medium", statusMap[item.status as keyof typeof statusMap].color)}>
                        {statusMap[item.status as keyof typeof statusMap].label}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'consulta' && (
          <div className="space-y-4">
            {consultas.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Stethoscope className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                <p>Você não tem consultas solicitadas.</p>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
