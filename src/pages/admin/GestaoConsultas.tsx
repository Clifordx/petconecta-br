import React from 'react';
import { Search, Calendar, Clock, User, Stethoscope, Activity, CheckCircle, XCircle } from 'lucide-react';

export default function GestaoConsultas() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestão de Consultas</h1>
          <p className="text-gray-500">Agendamentos e triagem clínica</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 shadow-sm transition-colors">
          Novo Agendamento
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Buscar paciente ou tutor..." 
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <input type="date" className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white" />
            <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
              <option>Todos os Veterinários</option>
              <option>Dra. Ana Silva</option>
              <option>Dr. Carlos Souza</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
              <tr>
                <th className="p-4">Horário</th>
                <th className="p-4">Paciente / Tutor</th>
                <th className="p-4">Motivo / Urgência</th>
                <th className="p-4">Veterinário</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {[
                { time: '09:00', pet: 'Thor', tutor: 'Maria R.', reason: 'Vômito e apatia', urg: 'Alta', status: 'Aguardando', doc: 'Dra. Ana Silva', color: 'orange' },
                { time: '09:30', pet: 'Luna', tutor: 'João P.', reason: 'Revisão Castração', urg: 'Baixa', status: 'Em Atendimento', doc: 'Dra. Ana Silva', color: 'blue' },
                { time: '10:00', pet: 'Mingau', tutor: 'Pedro H.', reason: 'Vacina Anual', urg: 'Rotina', status: 'Agendado', doc: 'Sem atribuição', color: 'gray' },
              ].map((item, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="p-4 font-bold text-gray-700">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-emerald-600" /> {item.time}
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="font-semibold text-gray-900">{item.pet}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1"><User className="w-3 h-3" /> {item.tutor}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-gray-900 truncate max-w-[150px]">{item.reason}</p>
                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-${item.color}-100 text-${item.color}-800 mt-1`}>
                      {item.urg}
                    </span>
                  </td>
                  <td className="p-4">
                    <select className="text-sm border border-gray-200 rounded p-1 bg-gray-50 w-full text-gray-700">
                      <option selected={item.doc === 'Dra. Ana Silva'}>Dra. Ana Silva</option>
                      <option selected={item.doc === 'Dr. Carlos Souza'}>Dr. Carlos Souza</option>
                      <option selected={item.doc === 'Sem atribuição'}>Atribuir...</option>
                    </select>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium border border-gray-200 bg-white">
                      {item.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded" title="Iniciar Atendimento">
                        <Activity className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Cancelar">
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
