import React from 'react';
import { ArrowLeft, Printer, FileText, CheckCircle, Home, User, Info, FileSignature, Download } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DetalheAdocao() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/admin/adocoes" className="p-2 bg-white border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Processo de Adoção #AD2024-089</h1>
            <p className="text-emerald-600 font-medium text-sm flex items-center gap-1 mt-1">
              <CheckCircle className="w-4 h-4" /> Finalizado em 15/07/2024
            </p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 shadow-sm text-gray-700">
          <Printer className="w-4 h-4" /> Imprimir Dossiê
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Coluna 1: Infos Básicas */}
        <div className="space-y-6 md:col-span-1">
          {/* Animal */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Info className="w-4 h-4" /> Animal
            </h3>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
              <div>
                <h4 className="font-bold text-gray-900 text-lg">Bolinha</h4>
                <p className="text-sm text-gray-500">Cão • Macho • 2 anos</p>
              </div>
            </div>
            <div className="text-sm space-y-2 text-gray-600">
              <p><span className="font-medium text-gray-900">Microchip:</span> 982000012345</p>
              <p><span className="font-medium text-gray-900">Castrado:</span> Sim</p>
              <p><span className="font-medium text-gray-900">Vacinas:</span> Em dia</p>
            </div>
          </div>

          {/* Adotante */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <User className="w-4 h-4" /> Adotante
            </h3>
            <h4 className="font-bold text-gray-900 text-lg mb-1">João Carlos da Silva</h4>
            <div className="text-sm space-y-2 text-gray-600 mt-3">
              <p><span className="font-medium text-gray-900">CPF:</span> 123.456.789-00</p>
              <p><span className="font-medium text-gray-900">Telefone:</span> (41) 99999-9999</p>
              <p><span className="font-medium text-gray-900">Email:</span> joao@email.com</p>
              <p className="pt-2 mt-2 border-t border-gray-100">
                <span className="font-medium text-gray-900 block mb-1">Endereço:</span>
                Rua das Flores, 123 - Apto 402<br/>
                Centro, Curitiba - PR<br/>
                80000-000
              </p>
            </div>
          </div>
        </div>

        {/* Coluna 2: Questionário e Termos */}
        <div className="space-y-6 md:col-span-2">
          {/* Questionário */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Home className="w-4 h-4" /> Questionário Habitacional
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-sm">
              <div>
                <p className="text-gray-500 mb-1">Tipo de Moradia</p>
                <p className="font-medium text-gray-900">Apartamento</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Possui telas de proteção?</p>
                <p className="font-medium text-gray-900">Sim, em todas as janelas</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Outros animais?</p>
                <p className="font-medium text-gray-900">Não</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Todos na casa concordam?</p>
                <p className="font-medium text-gray-900">Sim</p>
              </div>
              <div className="sm:col-span-2 mt-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-gray-500 text-xs uppercase mb-1">Motivo da adoção</p>
                <p className="text-gray-800 italic">"Gostaria de uma companhia para meus filhos e sempre fomos apaixonados por animais."</p>
              </div>
            </div>
          </div>

          {/* Documentos e Assinatura */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <FileSignature className="w-4 h-4" /> Documentação Legal
            </h3>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1 border border-gray-200 rounded-lg p-4 flex items-start gap-4">
                <FileText className="w-8 h-8 text-emerald-600 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-gray-900">Termo de Adoção.pdf</h4>
                  <p className="text-xs text-gray-500 mb-2">Assinado digitalmente em 15/07/2024</p>
                  <button className="text-sm text-emerald-600 font-medium hover:underline flex items-center gap-1">
                    <Download className="w-3 h-3" /> Baixar PDF
                  </button>
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-2 font-medium">Assinatura Coletada:</p>
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 w-full sm:w-1/2 flex items-center justify-center min-h-[100px]">
                <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48dGV4dCB5PSI1MCI+QXNzaW5hdHVyYTwvdGV4dD48L3N2Zz4=" alt="Assinatura" className="opacity-50" />
                {/* SVG placeholder for signature */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
