import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const schema = z.object({
  petId: z.string().min(1, 'Selecione um animal'),
  reason: z.string().min(10, 'Descreva o motivo com pelo menos 10 caracteres'),
  urgency: z.enum(['normal', 'urgente']),
  preferredDate: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function SolicitarConsulta() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { urgency: 'normal' }
  });

  const onSubmit = async (data: FormData) => {
    await new Promise(r => setTimeout(r, 1000));
    toast.success('Consulta solicitada com sucesso!');
    navigate('/filas');
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6 text-emerald-900">Solicitar Consulta Veterinária</h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 rounded-lg shadow-sm border">
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Selecione o Animal</label>
          <select {...register('petId')} className="w-full border rounded-md p-2">
            <option value="">Selecione...</option>
            <option value="1">Rex</option>
          </select>
          {errors.petId && <p className="text-red-500 text-sm mt-1">{errors.petId.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Motivo da Consulta</label>
          <textarea {...register('reason')} className="w-full border rounded-md p-2" rows={4} placeholder="Descreva os sintomas ou motivo da consulta..."></textarea>
          {errors.reason && <p className="text-red-500 text-sm mt-1">{errors.reason.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Urgência</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input type="radio" value="normal" {...register('urgency')} />
              <span>Normal</span>
            </label>
            <label className="flex items-center gap-2 text-orange-600 font-medium">
              <input type="radio" value="urgente" {...register('urgency')} />
              <span>Urgente</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Data/Hora de Preferência (Opcional)</label>
          <input type="datetime-local" {...register('preferredDate')} className="w-full border rounded-md p-2" />
        </div>

        <div className="flex gap-4 pt-4 border-t">
          <Button type="button" variant="outline" onClick={() => navigate('/filas')} className="w-full">Cancelar</Button>
          <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={isSubmitting}>
            {isSubmitting ? 'Solicitando...' : 'Solicitar Consulta'}
          </Button>
        </div>
      </form>
    </div>
  );
}
