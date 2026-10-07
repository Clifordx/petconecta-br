import React, { useEffect, useState } from 'react';
import { User, Mail, Phone, Camera, Save, MapPin, FileText, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

const MeuPerfil = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  
  const { register, handleSubmit, reset, setValue } = useForm({
    defaultValues: {
      nome: '',
      email: '',
      telefone: '',
      cpf: '',
      cep: '',
      endereco: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      estado: ''
    }
  });

  useEffect(() => {
    if (profile && user) {
      reset({
        nome: profile.nome || '',
        email: user.email || '',
        telefone: profile.telefone || '',
        cpf: profile.cpf || '',
        cep: profile.cep || '',
        endereco: profile.endereco || '',
        numero: profile.numero || '',
        complemento: profile.complemento || '',
        bairro: profile.bairro || '',
        cidade: '', // Usually fetched or stored
        estado: ''
      });
      if (profile.avatar_url) setAvatarUrl(profile.avatar_url);
    }
  }, [profile, user, reset]);

  const handleCEPChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const cep = e.target.value.replace(/\D/g, '');
    if (cep.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setValue('endereco', data.logradouro);
          setValue('bairro', data.bairro);
          setValue('cidade', data.localidade);
          setValue('estado', data.uf);
        }
      } catch (err) {
        toast.error('Erro ao buscar CEP');
      }
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !user) return;
    const file = e.target.files[0];
    
    setIsUploadingAvatar(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('pets') // Reusing pets bucket or you can use avatars bucket if created
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      const { data } = supabase.storage.from('pets').getPublicUrl(filePath);
      
      const { error: updateError } = await supabase
        .from('perfis')
        .update({ avatar_url: data.publicUrl })
        .eq('id', user.id);
        
      if (updateError) throw updateError;
      
      setAvatarUrl(data.publicUrl);
      refreshProfile();
      toast.success('Foto de perfil atualizada!');
    } catch (error) {
      toast.error('Erro ao fazer upload da foto.');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const onSubmit = async (data: any) => {
    if (!user) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('perfis')
        .update({
          nome: data.nome,
          telefone: data.telefone,
          cep: data.cep,
          endereco: data.endereco,
          numero: data.numero,
          complemento: data.complemento,
          bairro: data.bairro
        })
        .eq('id', user.id);

      if (error) throw error;
      
      await refreshProfile();
      setIsEditing(false);
      toast.success('Perfil atualizado com sucesso!');
    } catch (error) {
      toast.error('Erro ao atualizar perfil.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!profile) return <div className="p-8 text-center">Carregando perfil...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meu Perfil</h1>
          <p className="text-sm text-gray-500 mt-1">Gerencie suas informações pessoais e endereço</p>
        </div>
        {!isEditing && (
          <button onClick={() => setIsEditing(true)} className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
            Editar Perfil
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="h-32 bg-emerald-600"></div>
        
        <div className="px-8 pb-8">
          <div className="relative flex justify-between items-end -mt-12 mb-8">
            <div className="relative group">
              <div className="w-24 h-24 bg-white rounded-full p-1 shadow-md">
                <div className="w-full h-full rounded-full bg-gray-100 overflow-hidden flex items-center justify-center">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-10 h-10 text-gray-400" />
                  )}
                </div>
              </div>
              <label className="absolute bottom-0 right-0 bg-emerald-600 p-2 rounded-full text-white cursor-pointer hover:bg-emerald-700 transition-colors shadow-sm">
                {isUploadingAvatar ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={isUploadingAvatar} />
              </label>
            </div>
            
            {profile.tipo_perfil === 'cidadao' && (
              <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Cidadão
              </span>
            )}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-emerald-600" /> Informações Pessoais
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nome Completo</label>
                  <input type="text" {...register('nome')} disabled={!isEditing} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-50 disabled:text-gray-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">CPF</label>
                  <input type="text" {...register('cpf')} disabled className="mt-1 block w-full border border-gray-200 rounded-md shadow-sm py-2 px-3 bg-gray-50 text-gray-500" />
                  <p className="text-xs text-gray-400 mt-1">O CPF não pode ser alterado após o cadastro.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">E-mail</label>
                  <input type="email" {...register('email')} disabled className="mt-1 block w-full border border-gray-200 rounded-md shadow-sm py-2 px-3 bg-gray-50 text-gray-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Telefone</label>
                  <input type="text" {...register('telefone')} disabled={!isEditing} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-50 disabled:text-gray-500" />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-emerald-600" /> Endereço Residencial
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700">CEP</label>
                  <input type="text" {...register('cep')} onChange={e => {register('cep').onChange(e); handleCEPChange(e)}} disabled={!isEditing} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-50 disabled:text-gray-500" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Endereço</label>
                  <input type="text" {...register('endereco')} disabled={!isEditing} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-50 disabled:text-gray-500" />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700">Número</label>
                  <input type="text" {...register('numero')} disabled={!isEditing} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-50 disabled:text-gray-500" />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700">Complemento</label>
                  <input type="text" {...register('complemento')} disabled={!isEditing} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-50 disabled:text-gray-500" />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700">Bairro</label>
                  <input type="text" {...register('bairro')} disabled={!isEditing} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-50 disabled:text-gray-500" />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-emerald-600" /> Documentação Verificada
              </h3>
              <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4 flex items-start">
                <div className="bg-emerald-100 rounded-full p-2 mr-4">
                  <FileText className="w-6 h-6 text-emerald-700" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-emerald-900">Documento de Identidade Validado</h4>
                  <p className="text-xs text-emerald-700 mt-1">Sua CNH/RG foi enviada no momento do cadastro e está validada no sistema. Por segurança, apenas administradores podem alterar ou visualizar a foto do documento original.</p>
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
                <button type="button" onClick={() => setIsEditing(false)} className="bg-white border border-gray-300 text-gray-700 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={isSaving} className="bg-emerald-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center">
                  {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Salvar Alterações
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default MeuPerfil;
