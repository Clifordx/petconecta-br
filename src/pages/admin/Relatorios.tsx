import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, Calendar, Filter } from 'lucide-react';

const data = [
  { name: 'Jan', castracoes: 400, adocoes: 240, denuncias: 100 },
  { name: 'Fev', castracoes: 300, adocoes: 139, denuncias: 80 },
  { name: 'Mar', castracoes: 200, adocoes: 980, denuncias: 120 },
  { name: 'Abr', castracoes: 278, adocoes: 390, denuncias: 90 },
  { name: 'Mai', castracoes: 189, adocoes: 480, denuncias: 60 },
];

export default function Relatorios() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Relatórios Estatísticos</h1>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
            <Download className="w-4 h-4" /> Exportar PDF
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700">
            <Download className="w-4 h-4" /> Exportar Excel
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-wrap gap-4 items-end">
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Tipo de Relatório</label>
          <select className="block w-full min-w-[200px] p-2 border border-gray-300 rounded-lg text-sm">
            <option>Geral (Visão Completa)</option>
            <option>Castrações por Período</option>
            <option>Adoções por Período</option>
            <option>Denúncias por Região</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Período</label>
          <div className="flex gap-2 items-center">
            <input type="date" className="p-2 border border-gray-300 rounded-lg text-sm" />
            <span className="text-gray-500">até</span>
            <input type="date" className="p-2 border border-gray-300 rounded-lg text-sm" />
          </div>
        </div>
        <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 flex items-center gap-2">
          <Filter className="w-4 h-4" /> Gerar
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Comparativo Mensal</h3>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="castracoes" name="Castrações" fill="#10b981" />
                <Bar dataKey="adocoes" name="Adoções" fill="#3b82f6" />
                <Bar dataKey="denuncias" name="Denúncias" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo do Período</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-gray-600">Total de Castrações</span>
                <span className="font-bold text-lg text-emerald-600">1.367</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-gray-600">Total de Adoções</span>
                <span className="font-bold text-lg text-blue-600">2.229</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-gray-600">Denúncias Atendidas</span>
                <span className="font-bold text-lg text-red-600">450</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Novos Cadastros</span>
                <span className="font-bold text-lg text-gray-900">892</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
