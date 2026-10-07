import React, { useState } from 'react';
import { useForm } from 'react-hook-form'; // Make sure it's react-hook-form
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, ArrowRight, Dog, Loader2, Check } from 'lucide-react';
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

  const { register, handleSubmit, formState: { errors }, watch, setValue, trigger } = useForm<CadastroForm>({
    resolver: zodResolver(cadastroSchema),
    mode: 'onTouched'
  });

  const nextStep = async () => {
    let fieldsToValidate: any[] = [];
    if (step === 1) fieldsToValidate = ['email', 'password', 'confirmPassword'];
    if (step === 2) fieldsToValidate = ['nome', 'cpf', 'rg', 'dataNascimento', 'telefone'];
    
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
    setIsLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });

      if (authError) throw authError;

      if (authData.user) {
        const { error: profileError } = await supabase.from('perfis').insert({
          id: authData.user.id,
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
        });

        if (profileError) {
          console.error('Erro ao criar perfil:', profileError);
          // Don't throw here, the auth account was created
        }
      }
      
      toast.success('Conta criada com sucesso! Verifique seu e-mail para confirmar (ou faça login diretamente se configurado sem confirmação).');
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
                <div className="h-full bg-emerald-600 transition-all duration-300" style={{ width: `${((step - 1) / 2) * 100}%` }} />
              </div>
              {[1, 2, 3].map((num) => (
                <div key={num} className={clsx("relative z-10 w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-colors", step >= num ? "bg-emerald-600 text-white" : "bg-gray-200 text-gray-500")}>
                  {step > num ? <Check className="w-5 h-5" /> : num}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>Conta</span>
              <span>Dados Pessoais</span>
              <span>Endereço</span>
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

            <div className="mt-8 flex justify-between">
              {step > 1 ? (
                <button type="button" onClick={prevStep} className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
                </button>
              ) : (
                <div />
              )}
              
              {step < 3 ? (
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
