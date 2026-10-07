import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Dog, Cat, ArrowLeft, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

const petSchema = z.object({
  nome: z.string().min(2, 'Nome é obrigatório'),
  especie: z.enum(['cao', 'gato']),
  raca: z.string().min(1, 'Raça é obrigatória'),
  porte: z.enum(['pequeno', 'medio', 'grande']),
  sexo: z.enum(['macho', 'femea']),
  cor: z.string().min(1, 'Cor é obrigatória'),
  castrado: z.boolean(),
  vacinado: z.boolean(),
  microchip: z.string().optional(),
  observacoes: z.string().optional(),
});

type PetForm = z.infer<typeof petSchema>;

const NovoPet = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<PetForm>({
    resolver: zodResolver(petSchema),
    defaultValues: {
      especie: 'cao',
      sexo: 'macho',
      porte: 'medio',
      castrado: false,
      vacinado: false,
    }
  });

  const especie = watch('especie');
  const sexo = watch('sexo');

  const onSubmit = async (data: PetForm) => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { error } = await supabase.from('pets').insert({
        tutor_id: user.id,
        nome: data.nome,
        especie: data.especie,
        raca: data.raca,
        porte: data.porte,
        sexo: data.sexo,
        cor: data.cor,
        castrado: data.castrado,
        microchip: data.microchip || null,
        observacoes: data.observacoes || null,
        status: 'com_tutor'
      });

      if (error) throw error;

      toast.success('Pet cadastrado com sucesso!');
      navigate('/app/meus-pets');
    } catch (error: any) {
      toast.error('Erro ao cadastrar pet: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex items-center">
        <button onClick={() => navigate(-1)} className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cadastrar Novo Pet</h1>
          <p className="text-sm text-gray-500 mt-1">Preencha as informações do seu animalzinho</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 sm:p-8">
          
          <div className="mb-8 flex gap-4">
            <button
              type="button"
              onClick={() => setValue('especie', 'cao')}
              className={`flex-1 flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${especie === 'cao' ? 'border-emerald-600 bg-emerald-50 text-emerald-700' : 'border-gray-200 hover:border-emerald-200 text-gray-500'}`}
            >
              <Dog className="w-8 h-8 mb-2" />
              <span className="font-medium">Cachorro</span>
            </button>
            <button
              type="button"
              onClick={() => setValue('especie', 'gato')}
              className={`flex-1 flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${especie === 'gato' ? 'border-emerald-600 bg-emerald-50 text-emerald-700' : 'border-gray-200 hover:border-emerald-200 text-gray-500'}`}
            >
              <Cat className="w-8 h-8 mb-2" />
              <span className="font-medium">Gato</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Pet *</label>
              <input type="text" {...register('nome')} className="w-full border-gray-300 rounded-lg shadow-sm focus:border-emerald-500 focus:ring-emerald-500" />
              {errors.nome && <p className="mt-1 text-sm text-red-600">{errors.nome.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Raça *</label>
              <input type="text" {...register('raca')} placeholder="Ex: SRD, Poodle, Siamês..." className="w-full border-gray-300 rounded-lg shadow-sm focus:border-emerald-500 focus:ring-emerald-500" />
              {errors.raca && <p className="mt-1 text-sm text-red-600">{errors.raca.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cor / Pelagem *</label>
              <input type="text" {...register('cor')} placeholder="Ex: Caramelo, Preto e Branco..." className="w-full border-gray-300 rounded-lg shadow-sm focus:border-emerald-500 focus:ring-emerald-500" />
              {errors.cor && <p className="mt-1 text-sm text-red-600">{errors.cor.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Microchip (Opcional)</label>
              <input type="text" {...register('microchip')} className="w-full border-gray-300 rounded-lg shadow-sm focus:border-emerald-500 focus:ring-emerald-500" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Porte</label>
              <select {...register('porte')} className="w-full border-gray-300 rounded-lg shadow-sm focus:border-emerald-500 focus:ring-emerald-500">
                <option value="pequeno">Pequeno (até 10kg)</option>
                <option value="medio">Médio (11kg a 25kg)</option>
                <option value="grande">Grande (mais de 25kg)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Sexo</label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input type="radio" {...register('sexo')} value="macho" className="text-emerald-600 focus:ring-emerald-500 h-4 w-4" />
                  <span className="ml-2 text-sm text-gray-700">Macho</span>
                </label>
                <label className="flex items-center">
                  <input type="radio" {...register('sexo')} value="femea" className="text-emerald-600 focus:ring-emerald-500 h-4 w-4" />
                  <span className="ml-2 text-sm text-gray-700">Fêmea</span>
                </label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 bg-gray-50 p-4 rounded-xl border border-gray-100">
            <label className="flex items-center p-3 bg-white rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
              <input type="checkbox" {...register('castrado')} className="text-emerald-600 focus:ring-emerald-500 h-5 w-5 rounded border-gray-300" />
              <div className="ml-3">
                <span className="block text-sm font-medium text-gray-900">Animal Castrado</span>
              </div>
            </label>
            <label className="flex items-center p-3 bg-white rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
              <input type="checkbox" {...register('vacinado')} className="text-emerald-600 focus:ring-emerald-500 h-5 w-5 rounded border-gray-300" />
              <div className="ml-3">
                <span className="block text-sm font-medium text-gray-900">Vacinas em dia</span>
              </div>
            </label>
          </div>

          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-1">Observações de Saúde (Opcional)</label>
            <textarea {...register('observacoes')} rows={3} placeholder="Alergias, medicamentos de uso contínuo, etc." className="w-full border-gray-300 rounded-lg shadow-sm focus:border-emerald-500 focus:ring-emerald-500 resize-none"></textarea>
          </div>

          <div className="flex justify-end pt-6 border-t border-gray-100">
            <button type="button" onClick={() => navigate(-1)} className="mr-4 px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={isLoading} className="bg-emerald-600 text-white px-8 py-2.5 rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center disabled:opacity-50">
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
              Salvar Pet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NovoPet;
