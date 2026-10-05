import React, { useState } from 'react';
import { 
  Users, 
  Dog, 
  Cat, 
  Calendar, 
  AlertTriangle, 
  Heart,
  TrendingUp,
  Activity
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';

const castrationData = [
  { name: 'Jan', castracoes: 45 },
  { name: 'Fev', castracoes: 52 },
  { name: 'Mar', castracoes: 38 },
  { name: 'Abr', castracoes: 65 },
  { name: 'Mai', castracoes: 48 },
  { name: 'Jun', castracoes: 70 },
];

const speciesData = [
  { name: 'Cães', value: 400 },
  { name: 'Gatos', value: 300 },
];

const adoptionData = [
  { name: 'Jan', adocoes: 12 },
  { name: 'Fev', adocoes: 19 },
  { name: 'Mar', adocoes: 15 },
  { name: 'Abr', adocoes: 22 },
  { name: 'Mai', adocoes: 28 },
  { name: 'Jun', adocoes: 35 },
];

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Administrativo</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <MetricCard title="Animais Cadastrados" value="700" icon={<Dog className="w-6 h-6 text-emerald-600" />} color="border-emerald-500" />
        <MetricCard title="Castrações (Mês)" value="70" icon={<Activity className="w-6 h-6 text-blue-600" />} color="border-blue-500" />
        <MetricCard title="Adoções (Mês)" value="35" icon={<Heart className="w-6 h-6 text-pink-600" />} color="border-pink-500" />
        <MetricCard title="Denúncias Pendentes" value="12" icon={<AlertTriangle className="w-6 h-6 text-amber-600" />} color="border-amber-500" />
        <MetricCard title="Disponíveis p/ Adoção" value="85" icon={<Cat className="w-6 h-6 text-purple-600" />} color="border-purple-500" />
        <MetricCard title="Consultas Agendadas" value="24" icon={<Calendar className="w-6 h-6 text-indigo-600" />} color="border-indigo-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Castrações por Mês (Últimos 6 meses)">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={castrationData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="castracoes" name="Castrações" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ChartCard title="Espécies (Cadastrados)">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={speciesData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {speciesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
          
          <ChartCard title="Adoções por Mês">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={adoptionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="adocoes" name="Adoções" stroke="#ec4899" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon, color }: { title: string, value: string, icon: React.ReactNode, color: string }) {
  return (
    <div className={`bg-white rounded-lg shadow p-4 border-l-4 ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
        </div>
        <div className="p-2 bg-gray-50 rounded-md">{icon}</div>
      </div>
    </div>
  );
}

function ChartCard({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
      {children}
    </div>
  );
}
