import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Stethoscope, Scissors, Calendar, Activity, Info, FileText } from 'lucide-react';

const PetDetalhes = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock data
  const pet = {
    nome: 'Rex',
    especie: 'cão',
    raca: 'Vira-lata',
    idade: '3 anos',
    porte: 'Médio',
    sexo: 'Macho',
    status: 'Ativo',
    castrado: true,
    vacinado: true,
    microchip: '982000405551234',
    observacoes: 'Muito dócil, mas tem medo de fogos de artifício.',
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Perfil do Pet</h1>
        </div>
        <button className="flex items-center text-sm font-medium text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-md transition-colors">
          <Edit className="w-4 h-4 mr-1.5" /> Editar
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="h-64 bg-gray-200">
              <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
                <span>Sem Foto</span>
              </div>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{pet.nome}</h2>
                  <p className="text-gray-500 capitalize">{pet.especie} • {pet.raca}</p>
                </div>
                <span className="bg-emerald-100 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                  {pet.status}
                </span>
              </div>

              <div className="space-y-3 pt-4 border-t border-gray-100">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 flex items-center"><Info className="w-4 h-4 mr-2" /> Idade</span>
                  <span className="font-medium text-gray-900">{pet.idade}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 flex items-center"><Info className="w-4 h-4 mr-2" /> Porte</span>
                  <span className="font-medium text-gray-900">{pet.porte}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 flex items-center"><Info className="w-4 h-4 mr-2" /> Sexo</span>
                  <span className="font-medium text-gray-900">{pet.sexo}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center uppercase tracking-wider">
              <Activity className="w-4 h-4 mr-2 text-emerald-600" /> Saúde
            </h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-3 ${pet.castrado ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                <span className="text-sm text-gray-700">{pet.castrado ? 'Castrado' : 'Não castrado'}</span>
              </div>
              <div className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-3 ${pet.vacinado ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                <span className="text-sm text-gray-700">{pet.vacinado ? 'Vacinado' : 'Vacinas pendentes'}</span>
              </div>
              {pet.microchip && (
                <div className="text-sm text-gray-700 pl-5">
                  <span className="text-gray-500">Microchip:</span> {pet.microchip}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Ações Rápidas</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 transition-colors group">
                <Scissors className="w-8 h-8 text-gray-400 group-hover:text-emerald-600 mb-2" />
                <span className="font-medium text-gray-900 group-hover:text-emerald-700">Fila de Castração</span>
                <span className="text-xs text-gray-500 mt-1">Inscrever animal</span>
              </button>
              <button className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 transition-colors group">
                <Stethoscope className="w-8 h-8 text-gray-400 group-hover:text-emerald-600 mb-2" />
                <span className="font-medium text-gray-900 group-hover:text-emerald-700">Agendar Consulta</span>
                <span className="text-xs text-gray-500 mt-1">Atendimento clínico</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-gray-400" /> Observações
            </h3>
            <p className="text-gray-700 bg-gray-50 p-4 rounded-lg text-sm leading-relaxed">
              {pet.observacoes || "Nenhuma observação registrada."}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-gray-400" /> Histórico
            </h3>
            
            <div className="relative pl-4 border-l-2 border-gray-100 space-y-6">
              <div className="relative">
                <div className="absolute -left-[21px] top-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></div>
                <div className="text-sm">
                  <p className="font-medium text-gray-900">Cadastro realizado</p>
                  <p className="text-gray-500">10 de Outubro de 2023</p>
                </div>
              </div>
            </div>
            
          </div>

        </div>
      </div>
    </div>
  );
};

export default PetDetalhes;
