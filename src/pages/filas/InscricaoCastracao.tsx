import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const schema = z.object({
  petId: z.string().min(1, 'Selecione um animal'),
  campaignId: z.string().optional(),
  notes: z.string().optional(),
  agreeTerms: z.boolean().refine(val => val, 'Você deve aceitar os termos'),
});

type FormData = z.infer<typeof schema>;

export default function InscricaoCastracao() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema)
  });

  const onSubmit = async (data: FormData) => {
    // mock api call
    await new Promise(r => setTimeout(r, 1000));
    toast.success('Inscrição realizada com sucesso!');
    navigate('/filas');
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6 text-emerald-900">Inscrição para Castração</h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 rounded-lg shadow-sm border">
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Selecione o Animal</label>
          <select {...register('petId')} className="w-full border rounded-md p-2 focus:ring-emerald-500 focus:border-emerald-500">
            <option value="">Selecione...</option>
            <option value="1">Rex (Cão)</option>
            <option value="2">Mimi (Gato)</option>
          </select>
          {errors.petId && <p className="text-red-500 text-sm mt-1">{errors.petId.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Campanha (Opcional)</label>
          <select {...register('campaignId')} className="w-full border rounded-md p-2 focus:ring-emerald-500 focus:border-emerald-500">
            <option value="">Fila Geral</option>
            <option value="camp1">Campanha de Inverno 2024</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Observações Adicionais</label>
          <textarea {...register('notes')} className="w-full border rounded-md p-2 focus:ring-emerald-500 focus:border-emerald-500" rows={3}></textarea>
        </div>

        <div className="flex items-start gap-2">
          <input type="checkbox" id="terms" {...register('agreeTerms')} className="mt-1" />
          <label htmlFor="terms" className="text-sm text-gray-700">
            Autorizo a realização de procedimento cirúrgico de castração no meu animal, assumindo os riscos inerentes a qualquer procedimento anestésico e cirúrgico.
          </label>
        </div>
        {errors.agreeTerms && <p className="text-red-500 text-sm">{errors.agreeTerms.message}</p>}

        <div className="flex gap-4 pt-4 border-t">
          <Button type="button" variant="outline" onClick={() => navigate('/filas')} className="w-full">Cancelar</Button>
          <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={isSubmitting}>
            {isSubmitting ? 'Inscrevendo...' : 'Confirmar Inscrição'}
          </Button>
        </div>
      </form>
    </div>
  );
}
