import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, ArrowLeft, AlertCircle, CheckCircle2, Plus, Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/Button';

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
  const [totalPets, setTotalPets] = useState(0);
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
        // 1. Busca os pets do tutor
        const { data: petsData } = await supabase
          .from('pets')
          .select('id, nome, especie')
          .eq('tutor_id', user.id);
          
        setTotalPets(petsData?.length || 0);

        // 2. Busca consultas em andamento (agendada, em_andamento ou solicitada)
        const { data: consultasAtivas } = await supabase
          .from('consultas')
          .select('pet_id, status')
          .eq('tutor_id', user.id)
          .in('status', ['agendada', 'em_andamento', 'solicitada']);

        const petIdsComConsulta = new Set((consultasAtivas || []).map(c => c.pet_id));

        // 3. Filtra apenas os pets que NÃO possuem consulta em aberto
        const disponiveis = (petsData || []).filter(p => !petIdsComConsulta.has(p.id));
        setPets(disponiveis);
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
      // Dupla checagem preventiva contra duplicidade
      const { data: consultaExistente } = await supabase
        .from('consultas')
        .select('id, status')
        .eq('pet_id', data.petId)
        .in('status', ['agendada', 'em_andamento', 'solicitada'])
        .maybeSingle();

      if (consultaExistente) {
        toast.warning('Este pet já possui uma consulta em andamento ou aguardando triagem!');
        navigate('/app/filas?tab=consulta');
        return;
      }

      const { error } = await supabase.from('consultas').insert({
        tutor_id: user.id,
        pet_id: data.petId,
        motivo: data.reason,
        urgencia: data.urgency,
        status: 'agendada'
      });

      if (error) throw error;

      toast.success('Consulta solicitada com sucesso!');
      navigate('/app/filas?tab=consulta');
    } catch (error: any) {
      console.error('Erro ao agendar consulta:', error);
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
    <div className="container mx-auto p-4 max-w-2xl py-6">
      <div className="flex items-center mb-6">
        <button onClick={() => navigate(-1)} className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agendar Consulta Veterinária</h1>
          <p className="text-xs text-gray-500">Atendimento clínico municipal para avaliação e tratamento</p>
        </div>
      </div>
      
      {totalPets === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto text-amber-600">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-lg font-bold text-gray-900">Você ainda não possui pets cadastrados</h2>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Para solicitar uma consulta veterinária, primeiro cadastre seu animal no sistema.
          </p>
          <Button onClick={() => navigate('/app/meus-pets/novo')} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <Plus size={16} className="mr-1.5" /> Cadastrar Meu Pet
          </Button>
        </div>
      ) : pets.length === 0 ? (
        <div className="bg-white rounded-2xl border border-blue-200 p-8 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto text-blue-600">
            <Stethoscope size={32} />
          </div>
          <h2 className="text-lg font-bold text-blue-950">Seu(s) pet(s) já possuem consulta em andamento!</h2>
          <p className="text-sm text-gray-600 max-w-md mx-auto">
            Todos os seus animais cadastrados já possuem um atendimento clínico solicitado ou agendado. Você pode acompanhar a triagem na sua área de filas.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Button onClick={() => navigate('/app/filas?tab=consulta')} className="bg-blue-600 hover:bg-blue-700 text-white">
              Acompanhar Minhas Consultas
            </Button>
            <Button variant="outline" onClick={() => navigate('/app/meus-pets/novo')}>
              Cadastrar Outro Pet
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-200">
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Selecione o Animal *</label>
            <select {...register('petId')} className="w-full border-gray-300 rounded-xl p-3 focus:ring-emerald-500 focus:border-emerald-500 bg-gray-50 text-sm font-medium">
              <option value="">Selecione um dos seus pets...</option>
              {pets.map(pet => (
                <option key={pet.id} value={pet.id}>{pet.nome} ({pet.especie})</option>
              ))}
            </select>
            {errors.petId && <p className="text-red-500 text-xs mt-1 font-medium">{errors.petId.message}</p>}
            <p className="text-[11px] text-gray-500 mt-1.5">
              💡 Animais que já possuem uma consulta em triagem não aparecem nesta lista para evitar agendamentos duplicados.
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Motivo da Consulta e Sintomas *</label>
            <textarea 
              {...register('reason')} 
              rows={4}
              placeholder="Descreva o que seu pet está sentindo, há quantos dias começou, se está com febre, tosse, vômito ou sem apetite..."
              className="w-full border-gray-300 rounded-xl p-3.5 focus:ring-emerald-500 focus:border-emerald-500 bg-gray-50 text-sm resize-none"
            />
            {errors.reason && <p className="text-red-500 text-xs mt-1 font-medium">{errors.reason.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Nível de Urgência Relatado</label>
            <div className="flex flex-col sm:flex-row gap-4">
              <label className={`flex-1 flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedUrgency === 'normal' ? 'border-emerald-500 bg-emerald-50/60 shadow-xs' : 'border-gray-200 hover:bg-gray-50'}`}>
                <input type="radio" {...register('urgency')} value="normal" className="text-emerald-600 focus:ring-emerald-500 h-4 w-4" />
                <div className="ml-3">
                  <span className="block font-bold text-gray-900 text-sm">Normal / Sintomas Leves</span>
                  <span className="text-xs text-gray-500">Avaliação rotineira, coceiras, gripe inicial ou vacinação</span>
                </div>
              </label>
              <label className={`flex-1 flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedUrgency === 'urgente' ? 'border-red-500 bg-red-50/60 shadow-xs' : 'border-gray-200 hover:bg-gray-50'}`}>
                <input type="radio" {...register('urgency')} value="urgente" className="text-red-600 focus:ring-red-500 h-4 w-4" />
                <div className="ml-3">
                  <span className="block font-bold text-gray-900 text-sm">Urgente / Risco</span>
                  <span className="text-xs text-gray-500">Dor intensa, ferimentos, sangramento ou apatia severa</span>
                </div>
              </label>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-100">
            <button 
              type="submit" 
              disabled={isSubmitting || pets.length === 0} 
              className="w-full sm:w-auto bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center disabled:opacity-50 text-sm shadow-sm"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
              Solicitar Agendamento
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
