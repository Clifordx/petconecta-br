import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Stethoscope, Scissors, Calendar, Activity, Info, FileText, Loader2, Dog, Cat } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { removeBackground } from '@imgly/background-removal';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

type Pet = {
  id: string;
  nome: string;
  especie: string;
  raca: string;
  porte: string;
  sexo: string;
  cor: string;
  castrado: boolean;
  vacinado: boolean;
  microchip: string | null;
  status: string;
  observacoes: string | null;
  criado_em: string;
  fotos_pet?: { url: string }[];
};

const PetDetalhes = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pet, setPet] = useState<Pet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({ observacoes: '', castrado: false, vacinado: false, cor: '', porte: '', sexo: '' });
  const [isUploading, setIsUploading] = useState(false);
  const { user } = useAuth();

  
  
  const handleSave = async () => {
    if (!pet) return;
    setIsSaving(true);
    try {
      const { error } = await supabase.from('pets').update({
        observacoes: editForm.observacoes,
        castrado: editForm.castrado,
        vacinado: editForm.vacinado,
        cor: editForm.cor,
        porte: editForm.porte,
        sexo: editForm.sexo
      }).eq('id', pet.id);
      
      if (error) throw error;
      
      setPet({ ...pet, ...editForm });
      setIsEditing(false);
      toast.success('Pet atualizado com sucesso!');
    } catch (error) {
      toast.error('Erro ao atualizar pet.');
    } finally {
      setIsSaving(false);
    }
  };


  const handleFotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !user || !pet) return;
    
    const file = e.target.files[0];
    setIsUploading(true);
    
    try {
      toast.info('Criando foto de estúdio com IA...', { duration: 4000 });
      
      // Remove BG
      const transparentBlob = await removeBackground(file);
      
      // Draw on white background
      const processedFile = await new Promise<File>((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) return reject('Context error');
          
                    // Draw professional gradient background
          const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
          gradient.addColorStop(0, '#ffffff');
          gradient.addColorStop(1, '#f1f5f9'); // slate-100
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // Add drop shadow for the pet to give a studio effect
          ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
          ctx.shadowBlur = 40;
          ctx.shadowOffsetY = 20;
          
          // Draw Transparent Image
          ctx.drawImage(img, 0, 0);
          
          // Reset shadow for text
          ctx.shadowColor = 'transparent';
          ctx.shadowBlur = 0;
          ctx.shadowOffsetY = 0;
          
          // Draw PetConecta BR watermark at bottom right
          const fontSize = Math.max(16, canvas.height * 0.025);
          ctx.fillStyle = '#64748b'; // slate-500
          ctx.font = `bold ${fontSize}px sans-serif`;
          ctx.textAlign = 'right';
          // Draw a small background for the watermark for readability
          const text = '🐾 PetConecta BR';
          const padding = fontSize * 0.8;
          ctx.fillText(text, canvas.width - padding, canvas.height - padding);
          
          canvas.toBlob((blob) => {
            if (!blob) return reject('Blob error');
            const newFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".jpg"), { type: 'image/jpeg' });
            resolve(newFile);
          }, 'image/jpeg', 0.9);
        };
        img.src = URL.createObjectURL(transparentBlob);
      });

      // Upload to Supabase
      const fileName = `${pet.id}-${Math.random()}.jpg`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('pets')
        .upload(filePath, processedFile);

      if (uploadError) throw uploadError;

            const { data: publicUrlData } = supabase.storage.from('pets').getPublicUrl(filePath);

      // Remove fotos antigas do banco para manter apenas a nova
      await supabase.from('fotos_pet').delete().eq('pet_id', pet.id);

      // Insert into fotos_pet
      await supabase.from('fotos_pet').insert({
        pet_id: pet.id,
        url: publicUrlData.publicUrl + '?t=' + Date.now(),
        is_principal: true
      });

      // Limpa o input para permitir selecionar a mesma foto novamente
      e.target.value = '';

      toast.success('Foto adicionada com sucesso!');
      
      // Refresh pet data
      const { data } = await supabase.from('pets').select('*, fotos_pet(url)').order('criado_em', { referencedTable: 'fotos_pet', ascending: false }).eq('id', pet.id).single();
      if (data) { setPet(data); setEditForm({ observacoes: data.observacoes || '', castrado: data.castrado || false, vacinado: data.vacinado || false, cor: data.cor || '', porte: data.porte || '', sexo: data.sexo || '' }); }

    } catch (error) {
      console.error('Erro ao subir foto:', error);
      toast.error('Erro ao enviar a foto.');
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    const fetchPet = async () => {
      try {
        const { data, error } = await supabase
          .from('pets').select('*, fotos_pet(url)').order('criado_em', { referencedTable: 'fotos_pet', ascending: false })
          .eq('id', id)
          .single();
        
        if (error) throw error;
        setPet(data);
      } catch (error: any) {
        toast.error('Erro ao carregar detalhes do pet');
        navigate('/app/meus-pets');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchPet();
  }, [id, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  if (!pet) return null;

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button onClick={() => navigate('/app/meus-pets')} className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Perfil do Pet</h1>
        </div>
        {!isEditing ? (
          <button onClick={() => setIsEditing(true)} className="flex items-center text-sm font-medium text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-md transition-colors">
            <Edit className="w-4 h-4 mr-1.5" /> Editar
          </button>
        ) : (
          <div className="flex gap-2">
            <button onClick={() => setIsEditing(false)} className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-800 bg-gray-100 px-3 py-1.5 rounded-md transition-colors">
              Cancelar
            </button>
            <button onClick={handleSave} disabled={isSaving} className="flex items-center text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-md transition-colors disabled:opacity-50">
              {isSaving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <label className="h-64 bg-gray-100 relative group cursor-pointer hover:bg-gray-200 transition-colors block overflow-hidden">
              <input type="file" className="hidden" accept="image/*" onChange={handleFotoUpload} disabled={isUploading} />
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                {pet.fotos_pet && pet.fotos_pet.length > 0 ? (
                <>
                  <img src={pet.fotos_pet[0].url} alt={pet.nome} className="w-full h-full object-contain p-2" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white font-medium">Alterar Foto</span>
                  </div>
                </>
              ) : (
                <>
                  {pet.especie === 'gato' ? <Cat className="w-16 h-16 mb-2" /> : <Dog className="w-16 h-16 mb-2" />}
                  <span className="text-sm font-medium">Sem foto</span>
                  <span className="text-xs text-gray-500 mt-1">Clique para adicionar</span>
                </>
              )}
              </div>
                          {isUploading && (
                <div className="absolute inset-0 bg-white/70 flex flex-col items-center justify-center">
                  <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mb-2" />
                  <span className="text-sm font-medium text-emerald-800">Processando Foto...</span>
                </div>
              )}
            </label>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{pet.nome}</h2>
                  <p className="text-gray-500 capitalize">{pet.especie} • {pet.raca}</p>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                  {pet.status === 'com_tutor' ? 'Comigo' : pet.status.replace('_', ' ')}
                </span>
              </div>

              <div className="space-y-3 py-4 border-t border-b border-gray-100 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 flex items-center"><Info className="w-4 h-4 mr-2" /> Cor</span>
                  <span className="font-medium text-gray-900">{pet.cor}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 flex items-center"><Info className="w-4 h-4 mr-2" /> Porte</span>
                  <span className="font-medium text-gray-900 capitalize">{pet.porte}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 flex items-center"><Info className="w-4 h-4 mr-2" /> Sexo</span>
                  <span className="font-medium text-gray-900 capitalize">{pet.sexo}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center">
              <Activity className="w-4 h-4 mr-2 text-emerald-600" /> Saúde
            </h3>
            <ul className="space-y-3 text-sm">
              {isEditing ? (
              <li className="space-y-4 pt-2">
                <label className="flex items-center cursor-pointer">
                  <input type="checkbox" checked={editForm.castrado} onChange={e => setEditForm({...editForm, castrado: e.target.checked})} className="w-4 h-4 text-emerald-600 rounded mr-3" />
                  <span className="text-sm font-medium text-gray-900">Pet Castrado</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input type="checkbox" checked={editForm.vacinado} onChange={e => setEditForm({...editForm, vacinado: e.target.checked})} className="w-4 h-4 text-emerald-600 rounded mr-3" />
                  <span className="text-sm font-medium text-gray-900">Vacinas em dia</span>
                </label>
              </li>
            ) : (
              <>
                <li className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-3 ${pet.castrado ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>
                  <span className={pet.castrado ? 'text-gray-900' : 'text-gray-500'}>
                    {pet.castrado ? 'Castrado' : 'Não castrado'}
                  </span>
                </li>
                <li className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-3 ${pet.vacinado ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>
                  <span className={pet.vacinado ? 'text-gray-900' : 'text-gray-500'}>
                    {pet.vacinado ? 'Vacinado' : 'Sem vacinas registradas'}
                  </span>
                </li>
              </>
            )}
              {pet.microchip && (
                <li className="flex items-center pt-2 mt-2 border-t border-gray-100">
                  <span className="text-gray-500 mr-2">Microchip:</span>
                  <span className="font-mono text-gray-900">{pet.microchip}</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Ações Rápidas</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link 
                to="/app/filas/castracao"
                className="flex flex-col items-center justify-center p-6 rounded-xl border border-gray-200 hover:border-emerald-500 hover:bg-emerald-50 transition-all group"
              >
                <Scissors className="w-8 h-8 text-gray-400 group-hover:text-emerald-600 mb-3 transition-colors" />
                <span className="font-medium text-gray-900 group-hover:text-emerald-700">Fila de Castração</span>
                <span className="text-xs text-gray-500 mt-1">Inscrever animal</span>
              </Link>
              <Link 
                to="/app/filas/consulta"
                className="flex flex-col items-center justify-center p-6 rounded-xl border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all group"
              >
                <Stethoscope className="w-8 h-8 text-gray-400 group-hover:text-blue-600 mb-3 transition-colors" />
                <span className="font-medium text-gray-900 group-hover:text-blue-700">Agendar Consulta</span>
                <span className="text-xs text-gray-500 mt-1">Atendimento clínico</span>
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-gray-400" /> Observações
            </h3>
            {isEditing ? (
              <textarea 
                value={editForm.observacoes}
                onChange={e => setEditForm({...editForm, observacoes: e.target.value})}
                className="w-full border-gray-300 rounded-lg p-3 focus:ring-emerald-500 focus:border-emerald-500 bg-gray-50"
                rows={4}
                placeholder="Ex: Alérgico a dipirona, não gosta de gatos..."
              />
            ) : pet.observacoes ? (
              <div className="bg-gray-50 rounded-lg p-4 text-gray-700 text-sm leading-relaxed border border-gray-100 whitespace-pre-line">
                {pet.observacoes}
              </div>
            ) : (
              <p className="text-gray-500 text-sm italic">Nenhuma observação registrada para este animal.</p>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-gray-400" /> Histórico
            </h3>
            <div className="relative border-l-2 border-gray-100 ml-3 py-2 space-y-8">
              <div className="relative pl-6">
                <div className="absolute w-3 h-3 bg-emerald-500 rounded-full -left-[7px] top-1.5 ring-4 ring-white"></div>
                <h4 className="text-sm font-bold text-gray-900">Cadastro realizado</h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  {new Date(pet.criado_em).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PetDetalhes;
