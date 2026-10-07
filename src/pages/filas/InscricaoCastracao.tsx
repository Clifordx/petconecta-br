import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, ArrowLeft } from 'lucide-react';

const schema = z.object({
  petId: z.string().min(1, 'Selecione um animal'),
  campaignId: z.string().optional(),
  agreeTerms: z.boolean().refine(val => val === true, 'Você deve aceitar os termos e condições da cirurgia'),
});

type FormData = z.infer<typeof schema>;

export default function InscricaoCastracao() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [pets, setPets] = useState<{ id: string; nome: string; especie: string }[]>([]);
  const [campanhas, setCampanhas] = useState<{ id: string; titulo: string }[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema)
  });

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      setIsLoadingData(true);
      
      try {
        // Busca os pets do usuário que AINDA NÃO SÃO castrados
        const { data: petsData } = await supabase
          .from('pets')
          .select('id, nome, especie')
          .eq('tutor_id', user.id)
          .eq('castrado', false);
          
        if (petsData) setPets(petsData);

        // Busca campanhas ativas
        const { data: campanhasData } = await supabase
          .from('campanhas_castracao')
          .select('id, titulo')
          .eq('status', 'ativa');
          
        if (campanhasData) setCampanhas(campanhasData);
      } catch (e) {
        toast.error('Erro ao carregar dados do banco');
      } finally {
        setIsLoadingData(false);
      }
    }

    loadData();
  }, [user]);

  const onSubmit = async (data: FormData) => {
    if (!user) return;
    
    try {
      const { error } = await supabase.from('filas_castracao').insert({
        tutor_id: user.id,
        pet_id: data.petId,
        campanha_id: data.campaignId || null,
        status: 'aguardando_analise'
      });

      if (error) {
        if (error.code === '23505') { // Unique violation
          throw new Error('Este pet já está na fila de castração!');
        }
        throw error;
      }

      toast.success('Inscrição realizada com sucesso!');
      navigate('/app/filas');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao realizar inscrição.');
    }
  };

  if (isLoadingData) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <div className="flex items-center mb-6">
        <button onClick={() => navigate(-1)} className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-2xl font-bold text-emerald-900">Inscrição para Castração</h1>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-gray-200">
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Selecione o Animal *</label>
          <select {...register('petId')} className="w-full border-gray-300 rounded-lg p-2.5 focus:ring-emerald-500 focus:border-emerald-500 bg-gray-50">
            <option value="">Selecione um dos seus pets não castrados...</option>
            {pets.map(pet => (
              <option key={pet.id} value={pet.id}>{pet.nome} ({pet.especie})</option>
            ))}
          </select>
          {errors.petId && <p className="text-red-500 text-sm mt-1">{errors.petId.message}</p>}
          {pets.length === 0 && (
            <p className="text-amber-600 text-sm mt-2">Você não possui pets não-castrados cadastrados. (Animais já castrados não aparecem aqui).</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Campanha Específica (Opcional)</label>
          <select {...register('campaignId')} className="w-full border-gray-300 rounded-lg p-2.5 focus:ring-emerald-500 focus:border-emerald-500 bg-gray-50">
            <option value="">Fila Geral do Município</option>
            {campanhas.map(camp => (
              <option key={camp.id} value={camp.id}>{camp.titulo}</option>
            ))}
          </select>
        </div>

        <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100">
          <label className="flex items-start cursor-pointer">
            <input type="checkbox" {...register('agreeTerms')} className="mt-1 text-emerald-600 focus:ring-emerald-500 rounded border-gray-300 w-4 h-4" />
            <div className="ml-3">
              <span className="block text-sm font-medium text-emerald-900">Termo de Responsabilidade *</span>
              <p className="text-sm text-emerald-700 mt-1">
                Declaro estar ciente de que a castração é um procedimento cirúrgico que envolve riscos anestésicos. 
                Autorizo a realização do procedimento e assumo a responsabilidade pelos cuidados pós-operatórios do animal.
              </p>
            </div>
          </label>
          {errors.agreeTerms && <p className="text-red-500 text-sm mt-2 ml-7">{errors.agreeTerms.message}</p>}
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-100">
          <button 
            type="submit" 
            disabled={isSubmitting || pets.length === 0} 
            className="w-full sm:w-auto bg-emerald-600 text-white px-8 py-2.5 rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
            Confirmar Inscrição na Fila
          </button>
        </div>
      </form>
    </div>
  );
}
