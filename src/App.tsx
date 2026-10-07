import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { MainLayout } from './components/layout/MainLayout';
import { AdminLayout } from './components/layout/AdminLayout';
import { Loading } from './components/ui/Loading';

// Public & Auth Pages
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Cadastro from './pages/auth/Cadastro';
import AnimaisAdocao from './pages/public/AnimaisAdocao';
import DetalheAnimal from './pages/public/DetalheAnimal';
import FeirasPublicas from './pages/public/FeirasPublicas';
import NovaDenuncia from './pages/denuncias/NovaDenuncia';
import AcompanharDenuncia from './pages/denuncias/AcompanharDenuncia';

// Citizen / Tutor Pages
import MeusPets from './pages/pets/MeusPets';
import NovoPet from './pages/pets/NovoPet';
import PetDetalhes from './pages/pets/PetDetalhes';
import MinhasFilas from './pages/filas/MinhasFilas';
import InscricaoCastracao from './pages/filas/InscricaoCastracao';
import SolicitarConsulta from './pages/filas/SolicitarConsulta';
import MinhasDenuncias from './pages/denuncias/MinhasDenuncias';
import MeuPerfil from './pages/perfil/MeuPerfil';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import GestaoPets from './pages/admin/GestaoPets';
import GestaoUsuarios from './pages/admin/GestaoUsuarios';
import GestaoFila from './pages/admin/GestaoFila';
import GestaoConsultas from './pages/admin/GestaoConsultas';
import GestaoDenuncias from './pages/admin/GestaoDenuncias';
import GestaoFeiras from './pages/admin/GestaoFeiras';
import GestaoFeirasDetalhe from './pages/admin/GestaoFeirasDetalhe';
import GestaoAdocoes from './pages/admin/GestaoAdocoes';
import NovaAdocao from './pages/admin/NovaAdocao';
import DetalheAdocao from './pages/admin/DetalheAdocao';
import Relatorios from './pages/admin/Relatorios';

// Protected Route Wrapper
const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) => {
  const { user, profile, loading } = useAuth();

  if (loading) return <Loading fullScreen />;
  // For local demo/dev without Supabase configured yet, allow navigation if no user
  if (!user && import.meta.env.VITE_SUPABASE_URL) {
    return <Navigate to="/login" replace />;
  }

  // If a role is required, we MUST have a profile AND the profile must match
  if (allowedRoles && allowedRoles.length > 0) {
    if (!profile) {
      // If we are logged in but have no profile yet, only allow if 'cidadao' is an allowed role
      if (!allowedRoles.includes('cidadao')) {
        return <Navigate to="/" replace />;
      }
    } else if (!allowedRoles.includes(profile.tipo_perfil)) {
      // Profile exists but doesn't have the required role
      return <Navigate to="/" replace />;
    }
  }
  
  return <>{children}</>;
};

// 404 Component
const NotFound = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8">
    <h1 className="text-6xl font-extrabold text-emerald-600 mb-4">404</h1>
    <h2 className="text-2xl font-bold text-gray-800 mb-2">Página não encontrada</h2>
    <p className="text-gray-500 mb-6">A página que você procura não existe ou foi movida.</p>
    <a href="/" className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors">
      Voltar para o Início
    </a>
  </div>
);

function AppRoutes() {
  return (
    <Routes>
      {/* Rotas Públicas e do Cidadão (Com Header/Footer) */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/animais" element={<AnimaisAdocao />} />
        <Route path="/animais/:id" element={<DetalheAnimal />} />
        <Route path="/feiras" element={<FeirasPublicas />} />
        <Route path="/denuncia" element={<NovaDenuncia />} />
        <Route path="/acompanhar-denuncia" element={<AcompanharDenuncia />} />
        
        {/* Rotas Cidadão/Tutor */}
        <Route path="/app/dashboard" element={<ProtectedRoute allowedRoles={['cidadao']}><MeusPets /></ProtectedRoute>} />
        <Route path="/app/meus-pets" element={<ProtectedRoute allowedRoles={['cidadao']}><MeusPets /></ProtectedRoute>} />
        <Route path="/app/meus-pets/novo" element={<ProtectedRoute allowedRoles={['cidadao']}><NovoPet /></ProtectedRoute>} />
        <Route path="/app/meus-pets/:id" element={<ProtectedRoute allowedRoles={['cidadao']}><PetDetalhes /></ProtectedRoute>} />
        <Route path="/app/filas" element={<ProtectedRoute allowedRoles={['cidadao']}><MinhasFilas /></ProtectedRoute>} />
        <Route path="/app/filas/castracao" element={<ProtectedRoute allowedRoles={['cidadao']}><InscricaoCastracao /></ProtectedRoute>} />
        <Route path="/app/filas/consulta" element={<ProtectedRoute allowedRoles={['cidadao']}><SolicitarConsulta /></ProtectedRoute>} />
        <Route path="/app/denuncias" element={<ProtectedRoute allowedRoles={['cidadao']}><MinhasDenuncias /></ProtectedRoute>} />
        <Route path="/app/perfil" element={<ProtectedRoute><MeuPerfil /></ProtectedRoute>} />

        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Rotas Administrativas (ONGs, Prefeituras, Vets) */}
      <Route element={<ProtectedRoute allowedRoles={['admin_prefeitura', 'admin_ong', 'veterinario', 'voluntario']}><AdminLayout /></ProtectedRoute>}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/pets" element={<GestaoPets />} />
        <Route path="/admin/usuarios" element={<GestaoUsuarios />} />
        <Route path="/admin/castracao" element={<GestaoFila />} />
        <Route path="/admin/consultas" element={<GestaoConsultas />} />
        <Route path="/admin/denuncias" element={<GestaoDenuncias />} />
        <Route path="/admin/feiras" element={<GestaoFeiras />} />
        <Route path="/admin/feiras/:id" element={<GestaoFeirasDetalhe />} />
        <Route path="/admin/adocoes" element={<GestaoAdocoes />} />
        <Route path="/admin/adocoes/nova" element={<NovaAdocao />} />
        <Route path="/admin/adocoes/:id" element={<DetalheAdocao />} />
        <Route path="/admin/relatorios" element={<Relatorios />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster position="top-right" richColors />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
