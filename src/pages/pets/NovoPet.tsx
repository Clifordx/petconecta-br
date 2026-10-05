import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Dog, Cat, Upload, X, Loader2, ArrowLeft } from 'lucide-react';

const petSchema = z.object({
  nome: z.string().min(2, 'Nome é obrigatório'),
  especie: z.enum(['cão', 'gato']),
  raca: z.string().min(1, 'Raça é obrigatória'),
  porte: z.enum(['pequeno', 'médio', 'grande']),
  sexo: z.enum(['macho', 'fêmea']),
  idade: z.string(),
  cor: z.string(),
  castrado: z.boolean(),
  vacinado: z.boolean(),
  microchip: z.string().optional(),
  observacoes: z.string().optional(),
});

type PetForm = z.infer<typeof petSchema>;

const NovoPet = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [fotos, setFotos] = useState<File[]>([]);

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<PetForm>({
    resolver: zodResolver(petSchema),
    defaultValues: {
      especie: 'cão',
      porte: 'médio',
      sexo: 'macho',
      castrado: false,
      vacinado: false
    }
  });

  const especie = watch('especie');
  const sexo = watch('sexo');

  const onSubmit = async (data: PetForm) => {
    setIsLoading(true);
    try {
      // Mock upload and insert
      await new Promise(r => setTimeout(r, 1500));
      toast.success('Pet cadastrado com sucesso!');
      navigate('/app/meus-pets');
    } catch (error) {
      toast.error('Erro ao cadastrar pet');
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
          <h1 className="text-2xl font-bold text-gray-900">Adicionar Pet</h1>
          <p className="text-sm text-gray-500 mt-1">Preencha as informações do seu animalzinho</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 sm:p-8">
          
          {/* Espécie Toggle */}
          <div className="mb-8 flex gap-4">
            <button
              type="button"
              onClick={() => setValue('especie', 'cão')}
              className={`flex-1 flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${especie === 'cão' ? 'border-emerald-600 bg-emerald-50 text-emerald-700' : 'border-gray-200 hover:border-emerald-200 text-gray-500'}`}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Pet</label>
              <input type="text" {...register('nome')} className="w-full border-gray-300 rounded-lg shadow-sm focus:border-emerald-500 focus:ring-emerald-500" placeholder="Ex: Rex, Luna..." />
              {errors.nome && <p className="text-red-500 text-xs mt-1">{errors.nome.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Raça</label>
              <input type="text" {...register('raca')} className="w-full border-gray-300 rounded-lg shadow-sm focus:border-emerald-500 focus:ring-emerald-500" placeholder="Ex: Vira-lata, Poodle..." />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Porte</label>
              <select {...register('porte')} className="w-full border-gray-300 rounded-lg shadow-sm focus:border-emerald-500 focus:ring-emerald-500">
                <option value="pequeno">Pequeno (até 10kg)</option>
                <option value="médio">Médio (11 a 25kg)</option>
                <option value="grande">Grande (mais de 25kg)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sexo</label>
              <div className="flex gap-4 mt-2">
                <label className="flex items-center">
                  <input type="radio" {...register('sexo')} value="macho" className="text-emerald-600 focus:ring-emerald-500" />
                  <span className="ml-2 text-sm text-gray-700">Macho</span>
                </label>
                <label className="flex items-center">
                  <input type="radio" {...register('sexo')} value="fêmea" className="text-emerald-600 focus:ring-emerald-500" />
                  <span className="ml-2 text-sm text-gray-700">Fêmea</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Idade Estimada (em anos)</label>
              <input type="number" {...register('idade')} className="w-full border-gray-300 rounded-lg shadow-sm focus:border-emerald-500 focus:ring-emerald-500" />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Informações de Saúde</label>
              <div className="flex gap-6">
                <label className="flex items-center">
                  <input type="checkbox" {...register('castrado')} className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4" />
                  <span className="ml-2 text-sm text-gray-700">Castrado</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" {...register('vacinado')} className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4" />
                  <span className="ml-2 text-sm text-gray-700">Vacinado</span>
                </label>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Observações de Saúde / Histórico</label>
              <textarea {...register('observacoes')} rows={3} className="w-full border-gray-300 rounded-lg shadow-sm focus:border-emerald-500 focus:ring-emerald-500" placeholder="Alergias, medicamentos, etc..."></textarea>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button type="submit" disabled={isLoading} className="bg-emerald-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center">
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Salvar Pet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NovoPet;
