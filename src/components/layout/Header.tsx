import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, PawPrint, LogOut, Settings, MapPin, ClipboardList, Stethoscope, Scissors } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export function Header() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const isCidadao = !profile || profile.tipo_perfil === 'cidadao';

  const navLinks = user
    ? isCidadao
      ? [
          { name: 'Meus Pets', path: '/app/meus-pets' },
          { name: 'Minhas Filas & Consultas', path: '/app/filas' },
          { name: 'Banco de Ração', path: '/app/banco-racao' },
          { name: 'Adoção', path: '/animais' },
          { name: 'SOS Perdidos', path: '/sos' },
          { name: 'Feiras', path: '/feiras' },
          { name: 'Denúncias', path: '/denuncia' },
        ]
      : [
          { name: 'Painel Admin', path: '/admin/dashboard' },
          { name: 'Adoção', path: '/animais' },
          { name: 'SOS Perdidos', path: '/sos' },
          { name: 'Feiras', path: '/feiras' },
          { name: 'Denúncias', path: '/denuncia' },
        ]
    : [
        { name: 'Início', path: '/' },
        { name: 'Adoção', path: '/animais' },
        { name: 'SOS Perdidos', path: '/sos' },
        { name: 'Feiras', path: '/feiras' },
        { name: 'Denúncias', path: '/denuncia' },
      ];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to={user ? (isCidadao ? '/app/meus-pets' : '/admin/dashboard') : '/'} className="flex items-center gap-2 text-emerald-600">
              <PawPrint className="h-8 w-8" />
              <span className="font-bold text-xl hidden sm:block text-gray-900">PetConecta BR</span>
            </Link>
          </div>

          {/* Current Municipality Badge */}
          <div className="hidden md:flex items-center text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            <MapPin className="h-4 w-4 mr-1 text-emerald-600" />
            Arapongas - PR
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-gray-700 hover:text-emerald-600 px-2 py-2 text-sm font-medium transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 text-sm focus:outline-none p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                >
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="Avatar" className="h-8 w-8 rounded-full object-cover border border-gray-200" />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                      {profile?.nome?.charAt(0) || user.email?.charAt(0) || 'U'}
                    </div>
                  )}
                  <span className="font-semibold text-gray-800">{profile?.nome?.split(' ')[0] || 'Usuário'}</span>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl py-2 ring-1 ring-black/5 focus:outline-none border border-gray-100 z-50">
                    <div className="px-4 py-2 border-b border-gray-100 mb-1">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Conectado como</p>
                      <p className="text-sm font-bold text-gray-800 truncate">{profile?.nome || user.email}</p>
                    </div>
                    {isCidadao ? (
                      <>
                        <Link
                          to="/app/meus-pets"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <PawPrint className="h-4 w-4 mr-2.5 text-emerald-600" />
                          Meus Pets
                        </Link>
                        <Link
                          to="/app/filas"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <ClipboardList className="h-4 w-4 mr-2.5 text-emerald-600" />
                          Minhas Filas & Consultas
                        </Link>
                      </>
                    ) : (
                      <Link
                        to="/admin/dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Painel Administrativo
                      </Link>
                    )}
                    <Link
                      to="/app/perfil"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Settings className="h-4 w-4 mr-2.5 text-gray-400" />
                      Configurações do Perfil
                    </Link>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4 mr-2.5 text-red-500" />
                      Sair
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-x-2">
                <Button variant="ghost" onClick={() => navigate('/login')}>Entrar</Button>
                <Button onClick={() => navigate('/cadastro')}>Cadastrar</Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
            >
              <span className="sr-only">Abrir menu principal</span>
              {isMobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <div
        className={cn(
          "md:hidden absolute top-16 left-0 w-full bg-white shadow-xl border-t border-gray-200 transition-all duration-300 ease-in-out",
          isMobileMenuOpen ? "max-h-screen opacity-100 visible" : "max-h-0 opacity-0 invisible"
        )}
      >
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 overflow-y-auto">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-emerald-600 hover:bg-gray-50"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          
          <div className="border-t border-gray-200 pt-4 pb-3">
            {user ? (
              <div className="space-y-1">
                <div className="px-3 flex items-center gap-3 mb-3">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="Avatar" className="h-10 w-10 rounded-full object-cover border border-gray-200" />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                      {profile?.nome?.charAt(0) || user.email?.charAt(0) || 'U'}
                    </div>
                  )}
                  <div>
                    <div className="text-base font-medium text-gray-800">{profile?.nome || 'Usuário'}</div>
                    <div className="text-sm font-medium text-gray-500">{user.email}</div>
                  </div>
                </div>
                {isCidadao ? (
                  <>
                    <Link
                      to="/app/meus-pets"
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-emerald-600 hover:bg-gray-50"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Meus Pets
                    </Link>
                    <Link
                      to="/app/filas"
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-emerald-600 hover:bg-gray-50"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Minhas Filas & Consultas
                    </Link>
                    <Link
                      to="/app/banco-racao"
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-emerald-600 hover:bg-gray-50"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Banco de Ração Municipal
                    </Link>
                  </>
                ) : (
                  <Link
                    to="/admin/dashboard"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-emerald-600 hover:bg-gray-50"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Painel Administrativo
                  </Link>
                )}
                <Link
                  to="/app/perfil"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-emerald-600 hover:bg-gray-50"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Configurações
                </Link>
                <button
                  onClick={handleSignOut}
                  className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
                >
                  Sair
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 px-3">
                <Button variant="outline" className="w-full" onClick={() => { navigate('/login'); setIsMobileMenuOpen(false); }}>
                  Entrar
                </Button>
                <Button className="w-full" onClick={() => { navigate('/cadastro'); setIsMobileMenuOpen(false); }}>
                  Cadastrar
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
