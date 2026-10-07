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
  reason: z.string().min(10, 'Descreva o motivo com pelo menos 10 caracteres'),
  urgency: z.enum(['normal', 'urgente']),
});

type FormData = z.infer<typeof schema>;

export default function SolicitarConsulta() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [pets, setPets] = useState<{ id: string; nome: string; especie: string }[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { urgency: 'normal' }
  });

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      setIsLoadingData(true);
      
      try {
        const { data: petsData } = await supabase
          .from('pets')
          .select('id, nome, especie')
          .eq('tutor_id', user.id);
          
        if (petsData) setPets(petsData);
      } catch (e) {
        toast.error('Erro ao carregar dados do banco');
      } finally {
        setIsLoadingData(false);
      }
    }

    loadData();
  }, [user]);

  const selectedUrgency = watch('urgency');

  const onSubmit = async (data: FormData) => {
    if (!user) return;
    
    try {
      const { error } = await supabase.from('consultas').insert({
        tutor_id: user.id,
        pet_id: data.petId,
        motivo: data.reason,
        urgencia: data.urgency,
        status: 'solicitada'
      });

      if (error) throw error;

      toast.success('Consulta solicitada com sucesso!');
      navigate('/app/filas');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao agendar consulta.');
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
        <h1 className="text-2xl font-bold text-emerald-900">Agendar Consulta Veterinária</h1>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-gray-200">
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Selecione o Animal *</label>
          <select {...register('petId')} className="w-full border-gray-300 rounded-lg p-2.5 focus:ring-emerald-500 focus:border-emerald-500 bg-gray-50">
            <option value="">Selecione um dos seus pets...</option>
            {pets.map(pet => (
              <option key={pet.id} value={pet.id}>{pet.nome} ({pet.especie})</option>
            ))}
          </select>
          {errors.petId && <p className="text-red-500 text-sm mt-1">{errors.petId.message}</p>}
          {pets.length === 0 && (
            <p className="text-amber-600 text-sm mt-2">Você não possui pets cadastrados.</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Motivo da Consulta *</label>
          <textarea 
            {...register('reason')} 
            rows={4}
            placeholder="Descreva os sintomas, há quantos dias começaram, etc..."
            className="w-full border-gray-300 rounded-lg p-3 focus:ring-emerald-500 focus:border-emerald-500 bg-gray-50 resize-none"
          />
          {errors.reason && <p className="text-red-500 text-sm mt-1">{errors.reason.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Nível de Urgência</label>
          <div className="flex flex-col sm:flex-row gap-4">
            <label className={`flex-1 flex items-center p-4 rounded-xl border-2 cursor-pointer transition-colors ${selectedUrgency === 'normal' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:bg-gray-50'}`}>
              <input type="radio" {...register('urgency')} value="normal" className="text-emerald-600 focus:ring-emerald-500 h-4 w-4" />
              <div className="ml-3">
                <span className="block font-medium text-gray-900">Normal</span>
                <span className="text-xs text-gray-500">Avaliação de rotina ou sintomas leves</span>
              </div>
            </label>
            <label className={`flex-1 flex items-center p-4 rounded-xl border-2 cursor-pointer transition-colors ${selectedUrgency === 'urgente' ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:bg-gray-50'}`}>
              <input type="radio" {...register('urgency')} value="urgente" className="text-red-600 focus:ring-red-500 h-4 w-4" />
              <div className="ml-3">
                <span className="block font-medium text-gray-900">Urgente</span>
                <span className="text-xs text-gray-500">Dor intensa, sangramento ou risco de vida</span>
              </div>
            </label>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-100">
          <button 
            type="submit" 
            disabled={isSubmitting || pets.length === 0} 
            className="w-full sm:w-auto bg-emerald-600 text-white px-8 py-2.5 rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
            Solicitar Agendamento
          </button>
        </div>
      </form>
    </div>
  );

  }
