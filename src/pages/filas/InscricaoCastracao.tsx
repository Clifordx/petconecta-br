import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, ArrowLeft, AlertCircle, CheckCircle2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const schema = z.object({
  petId: z.string().min(1, 'Selecione um animal'),
  campaignId: z.string().optional(),
  agreeTerms: z.literal(true, {
    errorMap: () => ({ message: 'Você precisa aceitar os termos para prosseguir' }),
  }),
});

type FormData = z.infer<typeof schema>;

export default function InscricaoCastracao() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [pets, setPets] = useState<{ id: string; nome: string; especie: string }[]>([]);
  const [campanhas, setCampanhas] = useState<{ id: string; titulo: string }[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [totalPets, setTotalPets] = useState(0);
  const [petsJaNaFila, setPetsJaNaFila] = useState<string[]>([]);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      setIsLoadingData(true);
      
      try {
        // 1. Busca os pets do usuário
        const { data: petsData } = await supabase
          .from('pets')
          .select('id, nome, especie, castrado')
          .eq('tutor_id', user.id);

        setTotalPets(petsData?.length || 0);

        // 2. Busca inscrições ativas (pendente ou agendada)
        const { data: filasData } = await supabase
          .from('filas_castracao')
          .select('pet_id, status')
          .eq('tutor_id', user.id)
          .in('status', ['pendente', 'agendado']);

        const naFilaIds = new Set((filasData || []).map(f => f.pet_id));
        setPetsJaNaFila(Array.from(naFilaIds));

        // 3. Filtra apenas pets que não são castrados e ainda NÃO estão na fila
        const disponiveis = (petsData || []).filter(p => !p.castrado && !naFilaIds.has(p.id));
        setPets(disponiveis);

        // 4. Busca campanhas ativas
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
      // Dupla checagem antes de inserir para evitar duplicidade
      const { data: jaExiste } = await supabase
        .from('filas_castracao')
        .select('id, status')
        .eq('pet_id', data.petId)
        .in('status', ['pendente', 'agendado'])
        .maybeSingle();

      if (jaExiste) {
        toast.warning('Este pet já possui uma inscrição ativa na fila de castração!');
        navigate('/app/filas?tab=castracao');
        return;
      }

      const campanhaSelecionada = campanhas.find(c => c.id === data.campaignId);
      const obs = campanhaSelecionada 
        ? `Inscrição vinculada à campanha: ${campanhaSelecionada.titulo}`
        : 'Inscrição na fila geral de castração municipal';

      const { error } = await supabase.from('filas_castracao').insert({
        tutor_id: user.id,
        pet_id: data.petId,
        status: 'pendente',
        observacoes: obs
      });

      if (error) {
        if (error.code === '23505') {
          throw new Error('Este pet já está na fila de castração!');
        }
        throw error;
      }

      toast.success('Inscrição realizada com sucesso! Seu pet está na fila de castração.');
      navigate('/app/filas?tab=castracao');
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
    <div className="container mx-auto p-4 max-w-2xl py-6">
      <div className="flex items-center mb-6">
        <button onClick={() => navigate(-1)} className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inscrição para Castração Gratuita</h1>
          <p className="text-xs text-gray-500">Programa Municipal de Controle Populacional e Bem-Estar Animal</p>
        </div>
      </div>

      {totalPets === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto text-amber-600">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-lg font-bold text-gray-900">Você ainda não possui pets cadastrados</h2>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Para inscrever um animal na fila de castração, primeiro cadastre-o no seu perfil informando raça, porte e idade.
          </p>
          <Button onClick={() => navigate('/app/meus-pets/novo')} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <Plus size={16} className="mr-1.5" /> Cadastrar Meu Pet
          </Button>
        </div>
      ) : pets.length === 0 ? (
        <div className="bg-white rounded-2xl border border-emerald-200 p-8 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto text-emerald-600">
            <CheckCircle2 size={32} />
          </div>
          <h2 className="text-lg font-bold text-emerald-950">Seus pets já estão na fila ou já são castrados!</h2>
          <p className="text-sm text-gray-600 max-w-md mx-auto">
            Não há outros animais elegíveis para inscrição no momento. Você já pode acompanhar a posição na fila de espera.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Button onClick={() => navigate('/app/filas?tab=castracao')} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              Acompanhar Minha Fila de Castração
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
              <option value="">Selecione um animal disponível...</option>
              {pets.map(pet => (
                <option key={pet.id} value={pet.id}>{pet.nome} ({pet.especie})</option>
              ))}
            </select>
            {errors.petId && <p className="text-red-500 text-xs mt-1 font-medium">{errors.petId.message}</p>}
            <p className="text-[11px] text-gray-500 mt-1.5">
              💡 Apenas animais ainda não castrados e que não estão na fila aparecem nesta lista.
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Campanha Específica (Opcional)</label>
            <select {...register('campaignId')} className="w-full border-gray-300 rounded-xl p-3 focus:ring-emerald-500 focus:border-emerald-500 bg-gray-50 text-sm">
              <option value="">Fila Geral do Município (Padrão)</option>
              {campanhas.map(camp => (
                <option key={camp.id} value={camp.id}>{camp.titulo}</option>
              ))}
            </select>
          </div>

          <div className="bg-emerald-50/80 p-4 rounded-xl border border-emerald-200">
            <label className="flex items-start cursor-pointer">
              <input type="checkbox" {...register('agreeTerms')} className="mt-1 text-emerald-600 focus:ring-emerald-500 rounded border-gray-300 w-4 h-4" />
              <div className="ml-3">
                <span className="block text-sm font-bold text-emerald-950">Termo de Responsabilidade e Ciência *</span>
                <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                  Declaro estar ciente de que a castração é um procedimento cirúrgico com anestesia geral. 
                  Comprometo-me a seguir as orientações pré-operatórias (como o jejum obrigatório de 8 horas) e pós-operatórias informadas pela clínica parceira.
                </p>
              </div>
            </label>
            {errors.agreeTerms && <p className="text-red-500 text-xs mt-2 ml-7 font-medium">{errors.agreeTerms.message}</p>}
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-100">
            <button 
              type="submit" 
              disabled={isSubmitting || pets.length === 0} 
              className="w-full sm:w-auto bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center disabled:opacity-50 text-sm shadow-sm"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
              Confirmar Inscrição na Fila
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
