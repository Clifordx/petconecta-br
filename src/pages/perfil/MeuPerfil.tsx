import React, { useEffect } from 'react';
import { User, Mail, Phone, Camera, Save, Lock, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

const MeuPerfil = () => {
  const { user, profile, refreshProfile } = useAuth();
  
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      nome: '',
      email: '',
      telefone: '',
      cpf: '',
    }
  });

  useEffect(() => {
    if (profile && user) {
      reset({
        nome: profile.nome || '',
        email: user.email || '',
        telefone: profile.telefone || '',
        cpf: profile.cpf || '',
      });
    }
  }, [profile, user, reset]);

  const onSubmit = async (data: any) => {
    try {
      if (!user) throw new Error('Usuário não autenticado');
      
      const { error } = await supabase
        .from('perfis')
        .upsert({
          id: user.id,
          nome: data.nome,
          telefone: data.telefone,
          cpf: profile?.cpf || data.cpf || null, // Keep existing CPF if any
          tipo_perfil: profile?.tipo_perfil || 'cidadao' // Ensure they get at least cidadao
        }, { onConflict: 'id' });

      if (error) throw error;
      
      await refreshProfile();
      toast.success('Perfil atualizado com sucesso!');
    } catch (error: any) {
      toast.error('Erro ao atualizar perfil: ' + error.message);
    }
  };

  const initiais = profile?.nome ? profile.nome.substring(0, 2).toUpperCase() : 'UE';

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Meu Perfil</h1>
        <p className="text-sm text-gray-500 mt-1">Gerencie suas informações pessoais e configurações da conta</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8 pb-8 border-b border-gray-100">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-3xl font-bold">
                {initiais}
              </div>
              <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors">
                <Camera className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{profile?.nome || 'Usuário'}</h2>
              <p className="text-gray-500 flex items-center mt-1">
                <Mail className="w-4 h-4 mr-2" /> {user?.email}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="w-4 h-4 text-gray-400" />
                  </div>
                  <input type="text" {...register('nome')} className="w-full pl-10 border-gray-300 rounded-lg shadow-sm focus:border-emerald-500 focus:ring-emerald-500" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="w-4 h-4 text-gray-400" />
                  </div>
                  <input type="email" {...register('email')} disabled className="w-full pl-10 border-gray-200 bg-gray-50 text-gray-500 rounded-lg shadow-sm" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
                <div className="relative">
                  <input type="text" {...register('cpf')} disabled={!!profile?.cpf} className="w-full border-gray-300 rounded-lg shadow-sm px-3 py-2 disabled:bg-gray-50 disabled:text-gray-500" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="w-4 h-4 text-gray-400" />
                  </div>
                  <input type="text" {...register('telefone')} className="w-full pl-10 border-gray-300 rounded-lg shadow-sm focus:border-emerald-500 focus:ring-emerald-500" />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button type="submit" className="bg-emerald-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center">
                <Save className="w-4 h-4 mr-2" /> Salvar Alterações
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <Lock className="w-5 h-5 mr-2 text-gray-400" /> Segurança
          </h3>
          <p className="text-sm text-gray-500 mb-4">Atualize sua senha para manter sua conta segura.</p>
          <button className="text-emerald-600 font-medium text-sm hover:text-emerald-700 transition-colors">
            Alterar Senha
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-red-100 p-6">
          <h3 className="text-lg font-bold text-red-600 mb-4 flex items-center">
            <Trash2 className="w-5 h-5 mr-2 text-red-500" /> Zona de Risco
          </h3>
          <p className="text-sm text-gray-500 mb-4">Esta ação é irreversível e excluirá todos os seus dados e pets cadastrados.</p>
          <button className="text-red-600 font-medium text-sm hover:text-red-700 transition-colors border border-red-200 px-4 py-2 rounded-lg hover:bg-red-50">
            Excluir Conta
          </button>
        </div>
      </div>
    </div>
  );
};

export default MeuPerfil;
