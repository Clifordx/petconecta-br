import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuth, DemoUserType } from '@/contexts/AuthContext';
import { 
  Dog, 
  Mail, 
  Lock, 
  LogIn, 
  Loader2, 
  Sparkles, 
  Building2, 
  Stethoscope, 
  HeartHandshake, 
  User, 
  ShieldCheck 
} from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
});

type LoginForm = z.infer<typeof loginSchema>;

const Login = () => {
  const navigate = useNavigate();
  const { loginAsDemo } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) throw error;
      
      toast.success('Login realizado com sucesso!');
      navigate('/app/dashboard');
    } catch (error: any) {
      toast.error('Erro ao fazer login. Verifique suas credenciais ou use o modo de teste abaixo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (tipo: DemoUserType) => {
    loginAsDemo(tipo);
    if (tipo === 'admin') {
      toast.success('Conectado como Secretaria do Meio Ambiente (Admin Geral)');
      navigate('/admin/dashboard');
    } else if (tipo === 'clinica') {
      toast.success('Conectado como Clínica Veterinária PetVida (Dr. Roberto)');
      navigate('/admin/atendimento-clinico');
    } else if (tipo === 'cidadao_aprovado') {
      toast.success('Conectada como Dona Maria (Protetora - 9 animais)');
      navigate('/app/meus-pets');
    } else {
      toast.success('Conectado como João da Silva (Novo Tutor)');
      navigate('/app/meus-pets');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-8">
      <div className="max-w-lg w-full bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        
        {/* BANNER DE ACESSO RÁPIDO PARA DEMONSTRAÇÃO / TESTES */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-5 text-white">
          <div className="flex items-center gap-2 mb-2">
            <span className="p-1.5 bg-white/20 rounded-lg text-emerald-100">
              <Sparkles size={16} />
            </span>
            <span className="text-xs font-black uppercase tracking-wider text-emerald-100">
              Ambiente de Testes & Demonstração
            </span>
          </div>
          <h3 className="font-extrabold text-base leading-tight">
            Acesso Rápido em 1 Clique (Simulação)
          </h3>
          <p className="text-xs text-emerald-100 mt-1">
            Escolha um perfil para navegar imediatamente com permissões completas:
          </p>

          <div className="grid grid-cols-2 gap-2 mt-4">
            <button
              type="button"
              onClick={() => handleDemoLogin('admin')}
              className="flex items-center gap-2 p-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-left transition-all active:scale-95 cursor-pointer"
            >
              <div className="p-1.5 bg-emerald-500 rounded-lg text-white shrink-0">
                <Building2 size={16} />
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-white truncate">Prefeitura / Admin</p>
                <p className="text-[10px] text-emerald-200 truncate">Visão Geral da Cidade</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin('clinica')}
              className="flex items-center gap-2 p-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-left transition-all active:scale-95 cursor-pointer"
            >
              <div className="p-1.5 bg-blue-500 rounded-lg text-white shrink-0">
                <Stethoscope size={16} />
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-white truncate">Clínica Credenciada</p>
                <p className="text-[10px] text-emerald-200 truncate">PetVida (Dr. Roberto)</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin('cidadao_aprovado')}
              className="flex items-center gap-2 p-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-left transition-all active:scale-95 cursor-pointer"
            >
              <div className="p-1.5 bg-amber-500 rounded-lg text-white shrink-0">
                <HeartHandshake size={16} />
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-white truncate">Dona Maria (Protetora)</p>
                <p className="text-[10px] text-emerald-200 truncate">9 Pets + Banco Ração</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin('cidadao_novo')}
              className="flex items-center gap-2 p-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-left transition-all active:scale-95 cursor-pointer"
            >
              <div className="p-1.5 bg-teal-500 rounded-lg text-white shrink-0">
                <User size={16} />
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-white truncate">João Silva (Tutor)</p>
                <p className="text-[10px] text-emerald-200 truncate">Cadastro do Zero</p>
              </div>
            </button>
          </div>
        </div>

        {/* FORMULÁRIO DE LOGIN COM CREDENCIAIS OFICIAIS */}
        <div className="p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl mb-3">
              <Dog className="h-7 w-7" />
            </div>
            <h2 className="text-2xl font-black text-gray-900">Entrar na sua Conta</h2>
            <p className="text-xs text-gray-500 mt-1">Prefeitura Municipal de Arapongas / PetConecta BR</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Email Cadastrado</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  {...register('email')}
                  className={`block w-full pl-10 pr-3 py-2.5 border ${errors.email ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-emerald-500'} rounded-xl shadow-xs text-sm focus:outline-none focus:ring-2`}
                  placeholder="seu@email.com"
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-gray-700 uppercase">Senha</label>
                <Link to="/esqueci-minha-senha" className="text-xs font-medium text-emerald-600 hover:text-emerald-500">
                  Esqueci minha senha
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  {...register('password')}
                  className={`block w-full pl-10 pr-3 py-2.5 border ${errors.password ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-emerald-500'} rounded-xl shadow-xs text-sm focus:outline-none focus:ring-2`}
                  placeholder="••••••••"
                />
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-3 px-4 rounded-xl shadow-sm text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 transition-all cursor-pointer"
            >
              {isLoading ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                <>
                  <LogIn className="mr-2 h-5 w-5" /> Entrar com Senha
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Ainda não tem conta no sistema?{' '}
              <Link to="/cadastro" className="font-bold text-emerald-600 hover:underline">
                Criar cadastro de cidadão
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
