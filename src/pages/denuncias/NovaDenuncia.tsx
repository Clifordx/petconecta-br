import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/Button';
import { MapPin, UploadCloud, AlertTriangle } from 'lucide-react';

const schema = z.object({
  isAnonymous: z.boolean(),
  name: z.string().optional(),
  phone: z.string().optional(),
  type: z.string().min(1, 'Selecione o tipo'),
  urgency: z.string().min(1, 'Selecione a urgência'),
  description: z.string().min(50, 'A descrição deve ter pelo menos 50 caracteres'),
  cep: z.string().min(8, 'CEP inválido'),
  address: z.string().min(5, 'Endereço obrigatório'),
  reference: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function NovaDenuncia() {
  const [submitted, setSubmitted] = useState(false);
  const [protocol, setProtocol] = useState('');
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { isAnonymous: false, urgency: 'media' }
  });

  const isAnon = watch('isAnonymous');

  const onSubmit = async (data: FormData) => {
    setProtocol(`DEN-2024-${Math.floor(1000 + Math.random() * 9000)}`);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="container mx-auto p-4 max-w-2xl text-center">
        <div className="bg-white p-8 rounded-lg shadow border">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Denúncia Registrada</h2>
          <p className="text-gray-600 mb-6">Sua denúncia foi registrada com sucesso e será analisada pela equipe responsável.</p>
          
          <div className="bg-gray-50 p-4 rounded-lg mb-6 inline-block">
            <span className="text-sm text-gray-500 uppercase block mb-1">Protocolo</span>
            <span className="text-2xl font-mono font-bold text-gray-900">{protocol}</span>
          </div>
          
          <p className="text-sm text-gray-500 mb-8">Guarde este número para acompanhar o andamento da sua denúncia.</p>
          
          <Button onClick={() => window.location.href = '/'}>Voltar ao Início</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-2xl font-bold mb-2 text-emerald-900">Nova Denúncia de Maus Tratos</h1>
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
        <div className="flex">
          <AlertTriangle className="h-5 w-5 text-yellow-400" />
          <div className="ml-3">
            <p className="text-sm text-yellow-700">Falsa comunicação de crime é crime previsto no art. 340 do Código Penal. Utilize este canal com responsabilidade.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 rounded-lg shadow-sm border">
        
        <div className="flex items-center gap-4 mb-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" value="false" {...register('isAnonymous')} checked={!isAnon} onChange={(e) => register('isAnonymous').onChange({ target: { value: false }})} />
            <span>Identificada</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" value="true" {...register('isAnonymous')} checked={isAnon} onChange={(e) => register('isAnonymous').onChange({ target: { value: true }})} />
            <span>Anônima</span>
          </label>
        </div>

        {!isAnon && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nome Completo</label>
              <input type="text" {...register('name')} className="w-full border rounded p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Telefone</label>
              <input type="tel" {...register('phone')} className="w-full border rounded p-2" />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Tipo de Ocorrência</label>
            <select {...register('type')} className="w-full border rounded p-2">
              <option value="">Selecione...</option>
              <option value="abandono">Abandono</option>
              <option value="agressao">Agressão Física</option>
              <option value="negligencia">Negligência (Sem água/comida)</option>
              <option value="acumulacao">Acumulação de Animais</option>
              <option value="envenenamento">Envenenamento</option>
              <option value="outros">Outros</option>
            </select>
            {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Urgência</label>
            <select {...register('urgency')} className="w-full border rounded p-2">
              <option value="baixa">Baixa (Situação crônica, sem risco de morte)</option>
              <option value="media">Média</option>
              <option value="alta">Alta (Animal ferido ou doente)</option>
              <option value="critica">Crítica (Risco iminente de morte)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Descrição Detalhada</label>
          <textarea {...register('description')} rows={5} className="w-full border rounded p-2" placeholder="Descreva o que está acontecendo com o maior número de detalhes possível... (mínimo 50 caracteres)"></textarea>
          {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900 border-b pb-2">Localização</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">CEP</label>
              <input type="text" {...register('cep')} className="w-full border rounded p-2" />
              {errors.cep && <p className="text-red-500 text-sm mt-1">{errors.cep.message}</p>}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Endereço Completo</label>
              <input type="text" {...register('address')} className="w-full border rounded p-2" />
              {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Ponto de Referência</label>
            <input type="text" {...register('reference')} className="w-full border rounded p-2" />
          </div>
          <Button type="button" variant="outline" className="w-full flex items-center justify-center gap-2">
            <MapPin size={18} /> Usar minha localização atual (GPS)
          </Button>
        </div>

        <div>
          <h3 className="font-semibold text-gray-900 border-b pb-2 mb-4">Evidências (Fotos e Vídeos)</h3>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors">
            <UploadCloud className="w-12 h-12 mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-600">Clique para fazer upload ou arraste os arquivos aqui.</p>
            <p className="text-xs text-gray-400 mt-1">Máximo de 5 arquivos (JPG, PNG, MP4)</p>
          </div>
        </div>

        <div className="pt-6">
          <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 h-12 text-lg">
            Registrar Denúncia
          </Button>
        </div>
      </form>
    </div>
  );
}
