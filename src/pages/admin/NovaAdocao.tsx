import React, { useState, useRef } from 'react';
import { Check, ChevronRight, ChevronLeft, Search, Camera, FileText, Upload } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import SignatureCanvas from 'react-signature-canvas';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const STEPS = [
  'Selecionar Animal',
  'Dados do Adotante',
  'Questionário',
  'Termo de Adoção',
  'Confirmação'
];

export default function NovaAdocao() {
  const [currentStep, setCurrentStep] = useState(0);
  const signatureRef = useRef<SignatureCanvas>(null);

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  const clearSignature = () => {
    signatureRef.current?.clear();
  };

  return (
    <div className="max-w-3xl mx-auto bg-white min-h-[calc(100vh-4rem)] md:min-h-0 md:rounded-xl md:shadow-lg overflow-hidden flex flex-col">
      {/* Header & Progress */}
      <div className="bg-emerald-600 text-white p-4">
        <h1 className="text-xl font-bold mb-4">Nova Adoção</h1>
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 w-full h-1 bg-emerald-700 -z-10 transform -translate-y-1/2"></div>
          {STEPS.map((step, idx) => (
            <div key={step} className="flex flex-col items-center z-10">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors",
                idx <= currentStep ? "bg-emerald-500 border-white" : "bg-emerald-800 border-emerald-700 text-emerald-300"
              )}>
                {idx < currentStep ? <Check className="w-5 h-5" /> : idx + 1}
              </div>
              <span className="text-[10px] mt-1 hidden md:block opacity-90">{step}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-4 md:p-6 overflow-y-auto">
        {currentStep === 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">Selecione o Animal</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Buscar por nome ou microchip..." 
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-lg"
              />
            </div>
            {/* Placeholder animals list */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border rounded-lg p-3 flex items-center gap-4 cursor-pointer hover:border-emerald-500 transition-colors">
                  <div className="w-16 h-16 bg-gray-200 rounded-md flex-shrink-0"></div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Bolinha {i}</h3>
                    <p className="text-sm text-gray-500">Cão • Macho • 2 anos</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">Dados do Adotante</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CPF (Busca automática)</label>
                <input type="text" className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 text-lg" placeholder="000.000.000-00" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                <input type="text" className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 text-lg" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                  <input type="tel" className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 text-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CEP</label>
                  <input type="text" className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 text-lg" />
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">Questionário de Adoção</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de moradia</label>
                <select className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 text-lg bg-white">
                  <option>Casa</option>
                  <option>Apartamento</option>
                  <option>Sítio/Chácara</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50">
                  <input type="checkbox" className="w-5 h-5 text-emerald-600 rounded border-gray-300" />
                  <span className="text-gray-800">A residência possui quintal cercado?</span>
                </label>
                <label className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50">
                  <input type="checkbox" className="w-5 h-5 text-emerald-600 rounded border-gray-300" />
                  <span className="text-gray-800">As janelas possuem telas de proteção?</span>
                </label>
                <label className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50">
                  <input type="checkbox" className="w-5 h-5 text-emerald-600 rounded border-gray-300" />
                  <span className="text-gray-800">Já possui outros animais?</span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Motivo da adoção</label>
                <textarea className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 text-lg" rows={3}></textarea>
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">Termo de Adoção e Responsabilidade</h2>
            <div className="h-48 overflow-y-auto p-4 bg-gray-50 border rounded-lg text-sm text-gray-700 font-serif">
              <p>Pelo presente instrumento, o ADOTANTE assume a responsabilidade pela guarda, proteção e cuidados do animal descrito...</p>
              <br />
              <p>Compromete-se a: <br />
              1. Fornecer alimentação adequada e água fresca.<br />
              2. Garantir atendimento veterinário quando necessário.<br />
              3. Não acorrentar ou manter em espaços minúsculos.<br />
              4. Não abandonar sob nenhuma circunstância.</p>
            </div>
            
            <label className="flex items-center gap-3 p-2">
              <input type="checkbox" className="w-6 h-6 text-emerald-600 rounded border-gray-300" />
              <span className="text-gray-800 font-medium text-lg">Li e aceito os termos de adoção</span>
            </label>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">Assinatura Digital (Adotante)</label>
                <button onClick={clearSignature} className="text-sm text-red-600 hover:text-red-800">Limpar</button>
              </div>
              <div className="border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 overflow-hidden">
                <SignatureCanvas 
                  ref={signatureRef}
                  penColor="black"
                  canvasProps={{ className: 'w-full h-48 touch-none' }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1 text-center">Assine com o dedo ou caneta touch no espaço acima</p>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Quase lá!</h2>
              <p className="text-gray-500">Revise os dados e anexe os documentos necessários.</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Animal</span>
                <span className="font-medium">Bolinha 1</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Adotante</span>
                <span className="font-medium">João da Silva</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-50 text-emerald-600">
                <Camera className="w-8 h-8 mb-2" />
                <span className="text-sm font-medium text-center">Foto com o Pet</span>
              </button>
              <button className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-50 text-emerald-600">
                <FileText className="w-8 h-8 mb-2" />
                <span className="text-sm font-medium text-center">Documento com Foto</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t bg-white flex gap-3">
        {currentStep > 0 && (
          <button 
            onClick={prevStep}
            className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 flex items-center justify-center gap-2"
          >
            <ChevronLeft className="w-5 h-5" /> Voltar
          </button>
        )}
        
        {currentStep < STEPS.length - 1 ? (
          <button 
            onClick={nextStep}
            className="flex-[2] py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors shadow-sm"
          >
            Próximo <ChevronRight className="w-5 h-5" />
          </button>
        ) : (
          <button 
            className="flex-[2] py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors shadow-sm"
          >
            Finalizar Adoção <Check className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
