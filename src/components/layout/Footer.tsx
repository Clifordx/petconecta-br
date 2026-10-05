import React from 'react';
import { Link } from 'react-router-dom';
import { PawPrint, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 text-primary-600 mb-4">
              <PawPrint className="h-6 w-6" />
              <span className="font-bold text-lg text-gray-900">PetConecta BR</span>
            </Link>
            <p className="text-gray-500 text-sm">
              Sistema de gestão de bem-estar animal para municípios do Paraná.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Serviços</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link to="/animais" className="hover:text-primary-600">Adoção de Pets</Link></li>
              <li><Link to="/feiras" className="hover:text-primary-600">Feiras de Adoção</Link></li>
              <li><Link to="/denuncia" className="hover:text-primary-600">Denunciar Maus Tratos</Link></li>
              <li><Link to="/login" className="hover:text-primary-600">Castração (Login)</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Municípios Parceiros</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>Arapongas - PR</li>
              <li>Rolândia - PR</li>
              <li>Apucarana - PR</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Sobre</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><a href="#" className="hover:text-primary-600">Termos de Uso</a></li>
              <li><a href="#" className="hover:text-primary-600">Política de Privacidade</a></li>
              <li><a href="#" className="hover:text-primary-600">Contato</a></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} PetConecta BR. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-1 text-sm text-gray-500">
            Feito com <Heart className="h-4 w-4 text-red-500 mx-1" /> no Paraná
          </div>
        </div>
      </div>
    </footer>
  );
}
