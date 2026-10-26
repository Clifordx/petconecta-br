import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Menu, 
  X, 
  PawPrint, 
  LogOut, 
  Settings, 
  MapPin, 
  ClipboardList, 
  Stethoscope, 
  Scissors, 
  ShoppingBag,
  Sparkles,
  Wheat,
  HeartPulse,
  Building2,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export function Header() {
  const { user, profile, isDemoUser, signOut } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const isClinica = profile?.tipo_perfil === 'veterinario' || Boolean(profile?.clinica_id);
  const isCidadao = !profile || profile.tipo_perfil === 'cidadao';

  const navLinks = user
    ? isClinica
      ? [
          { name: 'Atendimento Clínico', path: '/admin/atendimento-clinico' },
          { name: 'Consultas da Clínica', path: '/admin/consultas' },
          { name: 'Castrações da Clínica', path: '/admin/castracao' },
          { name: 'Pets', path: '/admin/pets' },
          { name: 'Lojinha 3D', path: '/loja' },
          { name: 'SOS Perdidos', path: '/sos' },
        ]
      : isCidadao
      ? [
          { name: 'Meus Pets', path: '/app/meus-pets' },
          { name: 'Lojinha Pet & 3D', path: '/loja' },
          { name: 'Banco de Ração', path: '/app/banco-racao' },
          { name: 'Filas & Consultas', path: '/app/filas' },
          { name: 'Adoção', path: '/animais' },
          { name: 'SOS Perdidos', path: '/sos' },
          { name: 'Feiras', path: '/feiras' },
          { name: 'Denúncias', path: '/denuncia' },
        ]
      : [
          { name: 'Painel Geral', path: '/admin/dashboard' },
          { name: 'Atendimento Clínico', path: '/admin/atendimento-clinico' },
          { name: 'Banco de Ração', path: '/admin/banco-racao' },
          { name: 'Lojinha 3D', path: '/admin/loja' },
          { name: 'Castração', path: '/admin/castracao' },
          { name: 'Clínicas', path: '/admin/clinicas' },
          { name: 'Relatórios', path: '/admin/relatorios' },
        ]
    : [
        { name: 'Início', path: '/' },
        { name: 'Lojinha Pet & 3D', path: '/loja' },
        { name: 'Adoção', path: '/animais' },
        { name: 'SOS Perdidos', path: '/sos' },
        { name: 'Feiras', path: '/feiras' },
        { name: 'Denúncias', path: '/denuncia' },
      ];

  const targetHome = user 
    ? (isClinica ? '/admin/atendimento-clinico' : (isCidadao ? '/app/meus-pets' : '/admin/dashboard')) 
    : '/';

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center gap-3">
            <Link to={targetHome} className="flex items-center gap-2 text-emerald-600">
              <PawPrint className="h-8 w-8" />
              <span className="font-bold text-xl hidden sm:block text-gray-900">PetConecta BR</span>
            </Link>

            {isDemoUser && (
              <Link 
                to="/login"
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200 hover:bg-amber-200 transition-colors"
                title="Clique para alternar entre perfis de teste"
              >
                <Sparkles size={12} className="text-amber-600" />
                <span>Simulação Ativa</span>
                <RefreshCw size={10} className="ml-1 opacity-70" />
              </Link>
            )}
          </div>

          {/* Current Municipality Badge */}
          <div className="hidden lg:flex items-center text-xs font-semibold text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
            <MapPin className="h-3.5 w-3.5 mr-1 text-emerald-600" />
            Arapongas - PR
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-4 lg:space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-gray-700 hover:text-emerald-600 px-1.5 py-2 text-sm font-medium transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 text-sm focus:outline-none p-1.5 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="Avatar" className="h-8 w-8 rounded-full object-cover border border-gray-200" />
                  ) : (
                    <div className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs",
                      isClinica ? "bg-blue-100 text-blue-700" : (isCidadao ? "bg-emerald-100 text-emerald-700" : "bg-purple-100 text-purple-700")
                    )}>
                      {profile?.nome?.charAt(0) || user.email?.charAt(0) || 'U'}
                    </div>
                  )}
                  <span className="font-semibold text-gray-800 text-xs sm:text-sm max-w-[130px] truncate">
                    {profile?.nome?.split(' ')[0] || 'Usuário'}
                  </span>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl py-2 ring-1 ring-black/5 focus:outline-none border border-gray-100 z-50">
                    <div className="px-4 py-2 border-b border-gray-100 mb-1">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Conectado como</p>
                      <p className="text-sm font-bold text-gray-900 truncate">{profile?.nome || user.email}</p>
                      <p className="text-[11px] text-emerald-600 font-medium capitalize mt-0.5">
                        {isClinica ? 'Clínica Credenciada' : (isCidadao ? 'Cidadão / Tutor' : 'Admin Municipal')}
                      </p>
                    </div>

                    {isClinica ? (
                      <>
                        <Link
                          to="/admin/atendimento-clinico"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <HeartPulse className="h-4 w-4 mr-2.5 text-blue-600" />
                          Atendimento Clínico
                        </Link>
                        <Link
                          to="/admin/consultas"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Stethoscope className="h-4 w-4 mr-2.5 text-blue-600" />
                          Consultas da Clínica
                        </Link>
                      </>
                    ) : isCidadao ? (
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
                          to="/app/banco-racao"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Wheat className="h-4 w-4 mr-2.5 text-amber-600" />
                          Banco de Ração (+7 pets)
                        </Link>
                        <Link
                          to="/app/filas"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <ClipboardList className="h-4 w-4 mr-2.5 text-emerald-600" />
                          Minhas Filas & Consultas
                        </Link>
                        <Link
                          to="/loja"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <ShoppingBag className="h-4 w-4 mr-2.5 text-purple-600" />
                          Lojinha Pet & 3D
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link
                          to="/admin/dashboard"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Building2 className="h-4 w-4 mr-2.5 text-gray-500" />
                          Painel Administrativo
                        </Link>
                        <Link
                          to="/admin/atendimento-clinico"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <HeartPulse className="h-4 w-4 mr-2.5 text-emerald-600" />
                          Atendimento Clínico
                        </Link>
                      </>
                    )}

                    <div className="border-t border-gray-100 my-1"></div>

                    <Link
                      to="/login"
                      className="flex items-center px-4 py-2 text-xs font-bold text-amber-700 bg-amber-50/70 hover:bg-amber-100 transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <RefreshCw className="h-3.5 w-3.5 mr-2 text-amber-600" />
                      Trocar Perfil de Demonstração
                    </Link>

                    <button
                      onClick={handleSignOut}
                      className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer"
                    >
                      <LogOut className="h-4 w-4 mr-2.5 text-red-500" />
                      Sair
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-x-2">
                <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>Entrar</Button>
                <Button size="sm" onClick={() => navigate('/cadastro')}>Cadastrar</Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden gap-2">
            {isDemoUser && (
              <Link 
                to="/login"
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800"
              >
                <Sparkles size={10} />
                <span>Demo</span>
              </Link>
            )}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-xl text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
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
        <div className="px-3 pt-3 pb-4 space-y-1 overflow-y-auto">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="block px-3 py-2 rounded-xl text-sm font-semibold text-gray-700 hover:text-emerald-600 hover:bg-emerald-50/50"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          
          <div className="border-t border-gray-100 pt-3 mt-2">
            {user ? (
              <div className="space-y-2">
                <div className="px-3 py-2 bg-slate-50 rounded-xl flex items-center justify-between">
                  <div className="truncate">
                    <p className="text-xs font-bold text-gray-900 truncate">{profile?.nome || 'Usuário'}</p>
                    <p className="text-[11px] text-gray-500 truncate">{user.email}</p>
                  </div>
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-1 rounded-lg"
                  >
                    Trocar Perfil
                  </Link>
                </div>

                <button
                  onClick={handleSignOut}
                  className="w-full text-left block px-3 py-2 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50"
                >
                  Sair do Sistema
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 px-1">
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
