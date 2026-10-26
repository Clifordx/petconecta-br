import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Stethoscope, Scissors, Calendar, Activity, Info, FileText, Loader2, Dog, Cat, CreditCard, QrCode, Syringe, AlertTriangle, Printer, CheckCircle2 } from 'lucide-react';
import CartazSOSModal from '@/components/sos/CartazSOSModal';
import NovoAlertaSOSModal from '@/components/sos/NovoAlertaSOSModal';
import { AnimalSOS, fetchAnimaisSOS, salvarAnimalSOS, marcarResolvidoSOS } from '@/lib/sos';
import { getMockPetById } from '@/lib/mockPets';
import { supabase } from '@/lib/supabase';
import { removeBackground } from '@imgly/background-removal';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import CarteirinhaDigital from '@/components/pets/CarteirinhaDigital';
import CarteiraVacinacaoModal from '@/components/pets/CarteiraVacinacaoModal';

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
  const [editForm, setEditForm] = useState({ observacoes: '', castrado: false, vacinado: false, cor: '', porte: '', sexo: '', status: '' });
  const [isUploading, setIsUploading] = useState(false);
  const [modalCarteirinhaOpen, setModalCarteirinhaOpen] = useState(false);
  const [modalVacinasOpen, setModalVacinasOpen] = useState(false);
  const [tutor, setTutor] = useState<{ nome?: string; telefone?: string } | null>(null);
  const [castracaoPet, setCastracaoPet] = useState<{ id: string; status: string } | null>(null);
  const [consultaPet, setConsultaPet] = useState<{ id: string; status: string; data_consulta?: string } | null>(null);
  const [modalNovoSosOpen, setModalNovoSosOpen] = useState(false);
  const [modalCartazSosOpen, setModalCartazSosOpen] = useState(false);
  const [sosAnimal, setSosAnimal] = useState<AnimalSOS | null>(null);
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
        sexo: editForm.sexo,
        status: editForm.status
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
          if (!ctx) return reject('Context error');          // Draw professional gradient background
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
          
          // Draw PetConecta BR Banner at bottom
          const fontSize = Math.max(24, canvas.height * 0.04);
          const bannerHeight = fontSize * 2.5;
          
          // Draw banner background at bottom
          ctx.fillStyle = '#059669'; // emerald-600
          ctx.fillRect(0, canvas.height - bannerHeight, canvas.width, bannerHeight);
          
          // Draw text
          ctx.fillStyle = '#ffffff';
          ctx.font = `bold ${fontSize}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('🐾 PetConecta BR', canvas.width / 2, canvas.height - (bannerHeight / 2));
          
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
      if (data) { setPet(data); setEditForm({ observacoes: data.observacoes || '', castrado: data.castrado || false, vacinado: data.vacinado || false, cor: data.cor || '', porte: data.porte || '', sexo: data.sexo || '', status: data.status || 'com_tutor' }); }

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

        // Busca dados do tutor para a carteirinha
        if (data?.tutor_id) {
          const { data: tutorData } = await supabase
            .from('perfis')
            .select('nome, telefone')
            .eq('id', data.tutor_id)
            .single();
          if (tutorData) setTutor(tutorData);
        }

        // Busca status na fila de castracao
        const { data: cData } = await supabase.from('filas_castracao').select('id, status').eq('pet_id', id).in('status', ['pendente', 'agendado']).maybeSingle();
        if (cData) setCastracaoPet(cData);

        // Busca status em consultas
        const { data: conData } = await supabase.from('consultas').select('id, status, data_consulta').eq('pet_id', id).in('status', ['agendada', 'em_andamento', 'solicitada']).maybeSingle();
        if (conData) setConsultaPet(conData);

        // Busca se o pet está em alerta SOS
        const listaSos = await fetchAnimaisSOS();
        const achado = listaSos.find(s => (s.pet_id === id || (s.nome.toLowerCase() === data.nome?.toLowerCase())) && s.status === 'ativo');
        if (achado) setSosAnimal(achado);
      } catch (error: any) {
        toast.error('Erro ao carregar detalhes do pet');
        navigate('/app/meus-pets');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchPet();
  }, [id, navigate]);

  const handleResolverPerdido = async () => {
    if (!pet) return;
    if (!window.confirm(`Confirmar que ${pet.nome} foi ENCONTRADO e já está seguro com você?`)) return;
    try {
      if (sosAnimal) {
        await marcarResolvidoSOS(sosAnimal.id, pet.id);
      }
      await supabase.from('pets').update({ status: 'DISPONIVEL' }).eq('id', pet.id);
      setPet({ ...pet, status: 'DISPONIVEL' });
      setSosAnimal(null);
      toast.success('🎉 Que excelente notícia! Seu pet foi retirado do alerta de busca.');
    } catch {
      toast.error('Erro ao atualizar situação do pet');
    }
  };

  const handleAbrirCartazPet = () => {
    if (sosAnimal) {
      setModalCartazSosOpen(true);
    } else if (pet) {
      setSosAnimal({
        id: `sos-${pet.id}`,
        tipo: 'perdido',
        status: 'ativo',
        pet_id: pet.id,
        nome: pet.nome,
        especie: pet.especie?.toLowerCase().includes('gato') ? 'gato' : 'cachorro',
        raca: pet.raca,
        sexo: (pet.sexo?.toLowerCase() === 'femea' ? 'femea' : 'macho'),
        porte: (pet.porte?.toLowerCase() as any) || 'medio',
        cor: pet.cor,
        foto_url: (pet.fotos_pet && pet.fotos_pet[0]?.url) || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=600',
        bairro: 'Centro',
        cidade: 'Arapongas - PR',
        data_ocorrencia: new Date().toISOString().split('T')[0],
        contato_nome: tutor?.nome || user?.email || 'Tutor',
        contato_telefone: tutor?.telefone || '(43) 99999-9999',
        criado_em: new Date().toISOString()
      });
      setModalCartazSosOpen(true);
    }
  };

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
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setModalCarteirinhaOpen(true)}
            className="flex items-center text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-3.5 py-1.5 rounded-lg shadow-sm transition-colors"
          >
            <CreditCard className="w-4 h-4 mr-1.5" /> Carteirinha Digital
          </button>
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
      </div>

      {/* Banner de Emergência se o pet estiver perdido */}
      {(pet.status?.toUpperCase() === 'PERDIDO' || sosAnimal?.status === 'ativo') && (
        <div className="bg-red-50 border-2 border-red-500 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center flex-shrink-0 animate-pulse">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-black text-red-900 uppercase">
                🚨 Animal marcado como DESAPARECIDO na Central SOS!
              </h4>
              <p className="text-xs text-red-700">
                O cartaz de procura-se está ativo na rede pública de Arapongas. Se você já o encontrou, marque como resolvido abaixo.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleAbrirCartazPet}
              className="flex-1 sm:flex-none px-3.5 py-2 bg-white text-slate-800 border border-slate-300 hover:bg-slate-50 font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-slate-600" /> Cartaz A4
            </button>
            <button
              type="button"
              onClick={handleResolverPerdido}
              className="flex-1 sm:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" /> 🎉 Já Encontrei!
            </button>
          </div>
        </div>
      )}

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
                {isEditing ? (
                  <select 
                    value={editForm.status} 
                    onChange={e => setEditForm({...editForm, status: e.target.value})}
                    className="border-gray-300 rounded-lg text-sm py-1.5 pl-3 pr-8 focus:ring-emerald-500 focus:border-emerald-500 bg-white shadow-sm border font-medium text-gray-700"
                  >
                    <option value="com_tutor">✅ Comigo</option>
                    <option value="perdido">🚨 Perdido</option>
                    <option value="para_adocao">🏠 Para Adoção</option>
                    <option value="obito">🕊️ Óbito</option>
                  </select>
                ) : (
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    pet.status === 'perdido' ? 'bg-red-100 text-red-800 border border-red-200' : 
                    pet.status === 'para_adocao' ? 'bg-blue-100 text-blue-800 border border-blue-200' : 
                    pet.status === 'obito' ? 'bg-gray-100 text-gray-800 border border-gray-200' : 
                    'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  }`}>
                    {pet.status === 'com_tutor' ? 'COMIGO' : 
                     pet.status === 'para_adocao' ? 'PARA ADOÇÃO' : 
                     pet.status === 'obito' ? 'ÓBITO' : 'PERDIDO'}
                  </span>
                )}
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
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <button 
                type="button"
                onClick={() => setModalCarteirinhaOpen(true)}
                className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-emerald-500/40 bg-emerald-50/50 hover:border-emerald-600 hover:bg-emerald-100/70 transition-all group text-center cursor-pointer shadow-xs"
              >
                <CreditCard className="w-7 h-7 text-emerald-600 group-hover:scale-110 mb-2 transition-transform" />
                <span className="font-bold text-emerald-950 group-hover:text-emerald-700 text-xs">Carteirinha Digital</span>
                <span className="text-[10px] text-emerald-800/80 mt-0.5">RGA & QR Code</span>
              </button>

              <button 
                type="button"
                onClick={() => setModalVacinasOpen(true)}
                className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-emerald-500/40 bg-emerald-50/50 hover:border-emerald-600 hover:bg-emerald-100/70 transition-all group text-center cursor-pointer shadow-xs"
              >
                <Syringe className="w-7 h-7 text-emerald-600 group-hover:scale-110 mb-2 transition-transform" />
                <span className="font-bold text-emerald-950 group-hover:text-emerald-700 text-xs">Carteira de Vacinas</span>
                <span className="text-[10px] text-emerald-800/80 mt-0.5">Doses & Vermífugos</span>
              </button>

              {/* Ação SOS / Perdido */}
              <button 
                type="button"
                onClick={() => {
                  if (pet.status?.toUpperCase() === 'PERDIDO' || sosAnimal?.status === 'ativo') {
                    handleAbrirCartazPet();
                  } else {
                    setModalNovoSosOpen(true);
                  }
                }}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all group text-center cursor-pointer shadow-xs ${
                  pet.status?.toUpperCase() === 'PERDIDO' || sosAnimal?.status === 'ativo'
                    ? 'border-red-500 bg-red-50 hover:bg-red-100 text-red-950'
                    : 'border-rose-200 bg-rose-50/50 hover:border-red-500 hover:bg-rose-100/70 text-slate-900'
                }`}
              >
                <AlertTriangle className={`w-7 h-7 mb-2 transition-transform group-hover:scale-110 ${
                  pet.status?.toUpperCase() === 'PERDIDO' || sosAnimal?.status === 'ativo' ? 'text-red-600 animate-pulse' : 'text-rose-500'
                }`} />
                <span className="font-bold text-xs">
                  {pet.status?.toUpperCase() === 'PERDIDO' || sosAnimal?.status === 'ativo' ? 'Cartaz de Busca' : 'Alerta SOS'}
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5">
                  {pet.status?.toUpperCase() === 'PERDIDO' || sosAnimal?.status === 'ativo' ? 'Imprimir A4' : 'Pet Perdido?'}
                </span>
              </button>


              {pet.castrado ? (
                <div className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-200 bg-gray-50 text-center opacity-85">
                  <Scissors className="w-7 h-7 text-emerald-600 mb-2" />
                  <span className="font-bold text-emerald-800 text-xs">Já Castrado</span>
                  <span className="text-[10px] text-gray-500 mt-0.5">Realizado</span>
                </div>
              ) : castracaoPet ? (
                <Link 
                  to="/app/filas?tab=castracao"
                  className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-amber-300 bg-amber-50/70 hover:bg-amber-100/80 transition-all group text-center"
                >
                  <Scissors className="w-7 h-7 text-amber-600 group-hover:scale-110 mb-2 transition-transform" />
                  <span className="font-bold text-amber-950 group-hover:text-amber-800 text-xs">Na Fila</span>
                  <span className="text-[10px] text-amber-700 font-medium mt-0.5">Castração</span>
                </Link>
              ) : (
                <Link 
                  to="/app/filas/castracao"
                  className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-200 hover:border-emerald-500 hover:bg-emerald-50 transition-all group text-center"
                >
                  <Scissors className="w-7 h-7 text-gray-400 group-hover:text-emerald-600 mb-2 transition-colors" />
                  <span className="font-medium text-gray-900 group-hover:text-emerald-700 text-xs">Fila de Castração</span>
                  <span className="text-[10px] text-gray-500 mt-0.5">Inscrever pet</span>
                </Link>
              )}

              {consultaPet ? (
                <Link 
                  to="/app/filas?tab=consulta"
                  className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-blue-300 bg-blue-50/70 hover:bg-blue-100/80 transition-all group text-center"
                >
                  <Stethoscope className="w-7 h-7 text-blue-600 group-hover:scale-110 mb-2 transition-transform" />
                  <span className="font-bold text-blue-950 group-hover:text-blue-800 text-xs">
                    {consultaPet.data_consulta ? 'Agendada' : 'Na Fila'}
                  </span>
                  <span className="text-[10px] text-blue-700 font-medium mt-0.5">Consulta</span>
                </Link>
              ) : (
                <Link 
                  to="/app/filas/consulta"
                  className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all group text-center"
                >
                  <Stethoscope className="w-7 h-7 text-gray-400 group-hover:text-blue-600 mb-2 transition-colors" />
                  <span className="font-medium text-gray-900 group-hover:text-blue-700 text-xs">Agendar Consulta</span>
                  <span className="text-[10px] text-gray-500 mt-0.5">Atendimento</span>
                </Link>
              )}
            </div>
          </div>

          {/* Caderneta de Vacinação e Saúde Banner */}
          <div className="bg-white rounded-xl shadow-sm border border-emerald-200 p-5 sm:p-6 bg-gradient-to-r from-emerald-50/40 to-white">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800 shrink-0 shadow-2xs">
                  <Syringe className="w-6 h-6 text-emerald-700" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    Caderneta Sanitária e Vacinação
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold uppercase">
                      {pet.vacinado ? 'Em Dia' : 'Atualizar'}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Histórico oficial de vacinas (Raiva, V10/V8), reforços anuais, vermífugos e controle antiparasitário.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setModalVacinasOpen(true)}
                className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors shrink-0"
              >
                <Syringe size={14} /> Abrir Carteira de Vacinas
              </button>
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

            {/* Modal do Cartaz A4 de Busca SOS */}
      <CartazSOSModal
        isOpen={modalCartazSosOpen}
        onClose={() => setModalCartazSosOpen(false)}
        animal={sosAnimal}
      />

      {/* Modal de Publicação SOS */}
      <NovoAlertaSOSModal
        isOpen={modalNovoSosOpen}
        onClose={() => setModalNovoSosOpen(false)}
        onSuccess={(alvoSalvo) => {
          setSosAnimal(alvoSalvo);
          setPet({ ...pet, status: 'PERDIDO' });
          setModalCartazSosOpen(true);
        }}
        tipoInicial="perdido"
        petPreSelecionado={pet}
      />

      {/* Modal da Carteirinha Digital */}
      {modalCarteirinhaOpen && (
        <CarteirinhaDigital
          isOpen={modalCarteirinhaOpen}
          onClose={() => setModalCarteirinhaOpen(false)}
          pet={{
            ...pet,
            tutor_nome: tutor?.nome || user?.email,
            tutor_telefone: tutor?.telefone
          }}
        />
      )}

      {/* Modal da Carteira de Vacinação */}
      {modalVacinasOpen && (
        <CarteiraVacinacaoModal
          isOpen={modalVacinasOpen}
          onClose={() => setModalVacinasOpen(false)}
          pet={{
            ...pet,
            rga: `PR-ARA-2026-${pet.id.replace(/-/g, '').slice(0, 5).toUpperCase()}`,
            tutor_id: user?.id
          }}
          tutor={{
            nome: tutor?.nome || user?.email || 'Tutor',
            telefone: tutor?.telefone
          }}
          onAtualizacao={() => {
            supabase
              .from('pets')
              .select('*')
              .eq('id', pet.id)
              .single()
              .then(({ data }) => {
                if (data) setPet(data);
              });
          }}
        />
      )}
    </div>
  );
};

export default PetDetalhes;
