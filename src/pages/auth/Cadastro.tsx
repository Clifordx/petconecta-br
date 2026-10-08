import React, { useState } from 'react';
import { useForm } from 'react-hook-form'; // Make sure it's react-hook-form
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { validateDocumentWithAI } from '@/lib/gemini';
import { ArrowLeft, ArrowRight, Dog, Loader2, Check, FileText, Camera } from 'lucide-react';
import clsx from 'clsx';

// Real world CPF valdiation would go here
const cadastroSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  confirmPassword: z.string(),
  nome: z.string().min(3, 'Nome muito curto'),
  cpf: z.string().min(11, 'CPF inválido'),
  rg: z.string().optional(),
  dataNascimento: z.string().min(1, 'Data obrigatória'),
  telefone: z.string().min(11, 'Telefone inválido'),
  cep: z.string().min(8, 'CEP inválido'),
  endereco: z.string().min(1, 'Endereço obrigatório'),
  numero: z.string().min(1, 'Número obrigatório'),
  complemento: z.string().optional(),
  bairro: z.string().min(1, 'Bairro obrigatório'),
  cidade: z.string().min(1, 'Cidade obrigatória'),
  estado: z.string().min(2, 'Estado obrigatório'),
}).refine(data => data.password === data.confirmPassword, {
  message: "As senhas n�o coincidem",
  path: ["confirmPassword"],
});

type CadastroForm = z.infer<typeof cadastroSchema>;

const Cadastro = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [docFile, setDocFile] = useState<File | null>(null);
  const [profileFile, setProfileFile] = useState<File | null>(null);

  const { register, handleSubmit, formState: { errors }, watch, setValue, trigger } = useForm<CadastroForm>({
    resolver: zodResolver(cadastroSchema),
    mode: 'onTouched'
  });

  const nextStep = async () => {
    let fieldsToValidate: any[] = [];
    if (step === 1) fieldsToValidate = ['email', 'password', 'confirmPassword'];
    if (step === 2) fieldsToValidate = ['nome', 'cpf', 'rg', 'dataNascimento', 'telefone'];
    if (step === 3) fieldsToValidate = ['cep', 'endereco', 'numero', 'bairro'];
    
    const isValid = await trigger(fieldsToValidate);
    if (isValid) setStep(s => s + 1);
  };

  const prevStep = () => setStep(s => s - 1);

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
          clearErrors('cep');
        } else {
          toast.error('CEP inválido ou não encontrado na base dos Correios.');
          setError('cep', { type: 'manual', message: 'CEP inválido' });
          setValue('endereco', '');
          setValue('bairro', '');
          setValue('cidade', '');
          setValue('estado', '');
        }
      } catch (err) {
        toast.error('Erro ao buscar CEP');
      }
    }
  };

  
  const handleCPFMask = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    e.target.value = value;
    return value;
  };

  const handleTelefoneMask = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
    value = value.replace(/(\d)(\d{4})$/, '$1-$2');
    e.target.value = value;
    return value;
  };

    const onSubmit = async (data: CadastroForm) => {
      if (step === 4 && (!docFile || !profileFile)) {
        toast.error('Por favor, envie sua foto de perfil e documento.');
        return;
      }
    setIsLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            nome: data.nome,
            cpf: data.cpf,
            rg: data.rg || null,
            data_nascimento: data.dataNascimento,
            telefone: data.telefone,
            endereco: data.endereco,
            numero: data.numero,
            complemento: data.complemento || null,
            bairro: data.bairro,
            cep: data.cep,
            tipo_perfil: 'cidadao'
          }
        }
      });

      if (authError) throw authError;

      // --- INÍCIO DO UPLOAD DAS FOTOS ---
      if (authData.user) {
        let avatarUrl = null;
        let documentoUrl = null;

        // 1. Upload da Foto de Perfil
        if (profileFile) {
          const ext = profileFile.name.split('.').pop();
          const fileName = `${authData.user.id}_${Date.now()}.${ext}`;
          
          const { error: uploadProfileError } = await supabase.storage
            .from('avatars')
            .upload(fileName, profileFile);
            
          if (!uploadProfileError) {
            const { data: { publicUrl } } = supabase.storage
              .from('avatars')
              .getPublicUrl(fileName);
            avatarUrl = publicUrl;
          } else {
            console.error('Erro ao subir foto de perfil:', uploadProfileError);
          }
        }

        // 2. Upload do Documento
        if (docFile) {
          const ext = docFile.name.split('.').pop();
          const fileName = `${authData.user.id}_${Date.now()}.${ext}`;
          
          const { error: uploadDocError } = await supabase.storage
            .from('documentos')
            .upload(fileName, docFile);
            
          if (!uploadDocError) {
            const { data: { publicUrl } } = supabase.storage
              .from('documentos')
              .getPublicUrl(fileName);
            documentoUrl = publicUrl;
          } else {
            console.error('Erro ao subir documento:', uploadDocError);
          }
        }

        // 3. Atualiza o perfil recém-criado com as URLs das fotos
        if (avatarUrl || documentoUrl) {
          // Pequeno delay para garantir que o trigger do banco já criou a linha
          await new Promise(r => setTimeout(r, 1000));
          
          await supabase
            .from('perfis')
            .update({ 
              avatar_url: avatarUrl, 
              documento_url: documentoUrl 
            })
            .eq('id', authData.user.id);
        }
      }
      // --- FIM DO UPLOAD ---

      toast.success('Conta criada com sucesso! Verifique seu e-mail para confirmar.');
      navigate('/login');
    } catch (error: any) {
      toast.error('Erro ao criar conta: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <Dog className="h-12 w-12 text-emerald-600 mx-auto mb-4" />
          <h2 className="text-3xl font-extrabold text-gray-900">Crie sua Conta</h2>
          <p className="mt-2 text-sm text-gray-600">
            Junte-se ao PetConecta BR e ajude a cuidar dos nossos animais
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-6 sm:p-10">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between relative">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200">
                <div className="h-full bg-emerald-600 transition-all duration-300" style={{ width: `${((step - 1) / 3) * 100}%` }} />
              </div>
              {[1, 2, 3, 4].map((num) => (
                <div key={num} className={clsx("relative z-10 w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-colors", step >= num ? "bg-emerald-600 text-white" : "bg-gray-200 text-gray-500")}>
                  {step > num ? <Check className="w-5 h-5" /> : num}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>Conta</span>
              <span>Dados Pessoais</span>
              <span>Endereço</span>
              <span>Segurança</span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            {step === 1 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input type="email" {...register('email')} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Senha</label>
                  <input type="password" {...register('password')} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" />
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Confirmar Senha</label>
                  <input type="password" {...register('confirmPassword')} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" />
                  {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nome Completo</label>
                  <input type="text" {...register('nome')} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" />
                  {errors.nome && <p className="text-red-500 text-xs mt-1">{errors.nome.message}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">CPF</label>
                    <input type="text" {...register('cpf')} onChange={(e) => { register('cpf').onChange(e); handleCPFMask(e); }} placeholder="000.000.000-00" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" />
                    {errors.cpf && <p className="text-red-500 text-xs mt-1">{errors.cpf.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">RG</label>
                    <input type="text" {...register('rg')} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Data de Nascimento</label>
                    <input type="date" {...register('dataNascimento')} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Telefone</label>
                    <input type="text" {...register('telefone')} onChange={(e) => { register('telefone').onChange(e); handleTelefoneMask(e); }} placeholder="(00) 00000-0000" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" />
                  </div>
                </div>
              </div>
            )}

                        {step === 3 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">CEP</label>
                  <input type="text" {...register('cep')} onChange={(e) => { register('cep').onChange(e); handleCEPChange(e); }} placeholder="00000-000" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" />
                  {errors.cep && <p className="text-red-500 text-xs mt-1">{errors.cep.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Endereço</label>
                  <input type="text" {...register('endereco')} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Número</label>
                    <input type="text" {...register('numero')} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Complemento</label>
                    <input type="text" {...register('complemento')} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700">Bairro</label>
                    <input type="text" {...register('bairro')} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700">Cidade</label>
                    <input type="text" {...register('cidade')} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700">Estado</label>
                    <input type="text" {...register('estado')} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" />
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100 mb-4">
                  <h3 className="text-emerald-800 font-bold flex items-center mb-2">
                    <Check className="w-5 h-5 mr-2" /> Segurança e Verificação
                  </h3>
                  <p className="text-sm text-emerald-700">Para garantir a segurança dos animais, precisamos confirmar sua identidade e manter seu perfil completo.</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sua Foto de Perfil (Rosto visível)</label>
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Camera className="w-8 h-8 text-gray-400 mb-2" />
                      {profileFile ? (
                        <p className="text-sm text-emerald-600 font-semibold">{profileFile.name}</p>
                      ) : (
                        <p className="text-sm text-gray-500">Clique para enviar foto de perfil</p>
                      )}
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => { if(e.target.files) setProfileFile(e.target.files[0]) }} />
                  </label>
                  {!profileFile && <p className="text-red-500 text-xs mt-1">Obrigatório enviar uma foto de perfil.</p>}
                </div>

                <div className="pt-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Foto da sua CNH, RG ou CPF</label>
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <FileText className="w-8 h-8 text-gray-400 mb-2" />
                      {docFile ? (
                        <p className="text-sm text-emerald-600 font-semibold">{docFile.name}</p>
                      ) : (
                        <p className="text-sm text-gray-500">Clique para enviar foto do documento</p>
                      )}
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => { if(e.target.files) setDocFile(e.target.files[0]) }} />
                  </label>
                  {!docFile && <p className="text-red-500 text-xs mt-1">Obrigatório enviar um documento de identificação.</p>}
                </div>
              </div>
            )}

            <div className="mt-8 flex justify-between">
              {step > 1 ? (
                <button type="button" onClick={prevStep} className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
                </button>
              ) : (
                <div />
              )}
              
              {step < 4 ? (
                <button type="button" onClick={nextStep} className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  Próximo <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              ) : (
                <button type="submit" disabled={isLoading} className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50">
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                  Finalizar Cadastro
                </button>
              )}
            </div>
          </form>
          
          <div className="mt-6 text-center text-sm">
            Já tem uma conta? <Link to="/login" className="text-emerald-600 font-medium">Faça login</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cadastro;
