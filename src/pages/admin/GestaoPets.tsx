import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, LayoutGrid, List, Heart, Edit, Trash2, Camera, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { removeBackground } from '@imgly/background-removal';
import { Pet } from '@/types';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export default function GestaoPets() {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<'grid' | 'lista'>('grid');
  const [pets, setPets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPet, setEditingPet] = useState<any>(null);
  
  const [nome, setNome] = useState('');
  const [especie, setEspecie] = useState('cao');
  const [porte, setPorte] = useState('medio');
  const [idade, setIdade] = useState('');
  const [status, setStatus] = useState('para_adocao');
  const [foto, setFoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [useAI, setUseAI] = useState(true);

  
  const handleFotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setFoto(null);
      setPreview(null);
      return;
    }

    setIsProcessingImage(true);
    try {
      const logoImg = new Image();
      await new Promise((resolve) => {
        logoImg.onload = resolve;
        logoImg.onerror = resolve;
        logoImg.src = '/paw-logo.svg';
      });

      let blobToDraw: Blob = file;

      if (useAI) {
        toast.info('Processando foto...', { duration: 2000 });
        try {
          blobToDraw = await removeBackground(file);
        } catch (e) {
          console.error("AI error", e);
          toast.warning('A IA não conseguiu remover o fundo. Usando foto original.');
          blobToDraw = file;
        }
      }

      const processedFile = await new Promise<File>((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          
          // Mante as proporções
          let targetWidth = img.width;
          let targetHeight = img.height;
          
          // Se for muito grande, redimensiona para otimizar
          const MAX_SIZE = 1200;
          if (targetWidth > MAX_SIZE || targetHeight > MAX_SIZE) {
            const ratio = Math.min(MAX_SIZE / targetWidth, MAX_SIZE / targetHeight);
            targetWidth *= ratio;
            targetHeight *= ratio;
          }
          
          canvas.width = targetWidth;
          canvas.height = targetHeight;
          const ctx = canvas.getContext('2d');
          if (!ctx) return reject('Context error');
          
          // Fundo (só aparece se a imagem tiver transparência)
          const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
          gradient.addColorStop(0, '#ffffff');
          gradient.addColorStop(1, '#f1f5f9');
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          if (useAI) {
            ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
            ctx.shadowBlur = 40;
            ctx.shadowOffsetY = 20;
          }
          
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          ctx.shadowColor = 'transparent';
          ctx.shadowBlur = 0;
          ctx.shadowOffsetY = 0;
          
          const fontSize = Math.max(24, canvas.height * 0.04);
          const bannerHeight = fontSize * 2.5;
          
          ctx.fillStyle = '#059669';
          ctx.fillRect(0, canvas.height - bannerHeight, canvas.width, bannerHeight);
          
          ctx.fillStyle = '#ffffff';
          ctx.font = `bold ${fontSize}px sans-serif`;
          ctx.textBaseline = 'middle';
          
          const text = 'PetConecta BR';
          const textWidth = ctx.measureText(text).width;
          const logoSize = fontSize * 1.2;
          const gap = 10;
          const totalWidth = logoSize + gap + textWidth;
          
          const startX = (canvas.width - totalWidth) / 2;
          const centerY = canvas.height - (bannerHeight / 2);
          
          if (typeof logoImg !== 'undefined' && logoImg.complete && logoImg.naturalHeight !== 0) {
            ctx.drawImage(logoImg, startX, centerY - (logoSize / 2), logoSize, logoSize);
          }
          
          ctx.textAlign = 'left';
          ctx.fillText(text, startX + logoSize + gap, centerY);
          
          canvas.toBlob((blob) => {
            if (!blob) return reject('Blob error');
            const newFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".jpg"), { type: 'image/jpeg' });
            resolve(newFile);
          }, 'image/jpeg', 0.9);
        };
        img.src = URL.createObjectURL(blobToDraw);
      });
      
      setFoto(processedFile);
      setPreview(URL.createObjectURL(processedFile));
      if (useAI) toast.success('Fundo removido!');
    } catch (error) {
      console.error('Erro geral ao processar imagem:', error);
      toast.error('Erro ao processar. Usando foto original.');
      setFoto(file);
      setPreview(URL.createObjectURL(file));
    } finally {
      setIsProcessingImage(false);
    }
  };
  


  useEffect(() => {
    fetchPets();
  }, []);

  const fetchPets = async () => {
    try {
      const { data: petsData, error } = await supabase.from('pets').select('*, fotos_pet(*)').order('criado_em', { ascending: false });
      if (error) throw error;
      
      if (petsData) {
        const { data: perfis } = await supabase.from('perfis').select('id, nome');
        const petsComTutores = petsData.map(pet => ({
          ...pet,
          tutor_nome: pet.tutor_id ? (perfis?.find(p => p.id === pet.tutor_id)?.nome || 'Tutor Privado') : 'Sem Tutor'
        }));
        setPets(petsComTutores);
      }
    } catch (error) {
      console.error('Erro ao buscar pets:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPrincipalPhoto = (fotos: any[]) => {
    if (!fotos || fotos.length === 0) return 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=800';
    // Se tiver várias fotos principais, pega a ÚLTIMA (mais recente)
    const principais = fotos.filter(f => f.is_principal);
    if (principais.length > 0) {
      return principais[principais.length - 1].url;
    }
    return fotos[fotos.length - 1].url;
  };

  const filteredPets = pets.filter(pet => 
    pet.nome.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeletePet = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este pet?')) return;
    try {
      const { error } = await supabase.from('pets').delete().eq('id', id);
      if (error) throw error;
      toast.success('Pet excluído com sucesso!');
      fetchPets();
    } catch (error: any) {
      toast.error(`Erro ao excluir: ${error.message || JSON.stringify(error)}`);
    }
  };

  const openEditModal = (pet: any) => {
    setEditingPet(pet);
    setNome(pet.nome);
    setEspecie(pet.especie);
    setPorte(pet.porte);
    setStatus(pet.status);
    const obs = pet.observacoes || '';
    if (obs.startsWith('Idade aproximada: ')) {
      setIdade(obs.replace('Idade aproximada: ', ''));
    } else {
      setIdade('');
    }
    setFoto(null);
    setPreview(pet.fotos_pet?.[0]?.url || null);
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingPet(null);
    setNome('');
    setEspecie('cao');
    setPorte('medio');
    setIdade('');
    setStatus('para_adocao');
    setFoto(null);
    setPreview(null);
  };

  const openNewModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleSavePet = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      let petId = editingPet?.id;
      
      if (editingPet) {
        const { error: updateError } = await supabase
          .from('pets')
          .update({
            nome, especie, porte, status,
            observacoes: idade ? `Idade aproximada: ${idade}` : null,
          })
          .eq('id', editingPet.id);
        if (updateError) throw updateError;
        toast.success('Pet atualizado com sucesso!');
      } else {
        const { data: newPet, error: insertError } = await supabase
          .from('pets')
          .insert({
            nome, especie, porte, status, sexo: 'femea', castrado: false,
            observacoes: idade ? `Idade aproximada: ${idade}` : null,
            tutor_id: user?.id
          }).select().single();
        if (insertError) throw insertError;
        petId = newPet.id;
        toast.success('Pet cadastrado com sucesso!');
      }

      if (foto && petId) {
        const fileExt = foto.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${user?.id}/${fileName}`;
        
        const { error: uploadError } = await supabase.storage.from('pets').upload(filePath, foto);
        if (uploadError) {
          console.error('Erro no upload da foto:', uploadError);
          toast.warning('Salvo, mas erro na foto.');
        } else {
          const { data: publicUrlData } = supabase.storage.from('pets').getPublicUrl(filePath);
          
          // Desmarca fotos antigas como principais (ou deleta para economizar espaço)
          await supabase.from('fotos_pet').update({ is_principal: false }).eq('pet_id', petId);
          
          await supabase.from('fotos_pet').insert({
            pet_id: petId, url: publicUrlData.publicUrl, is_principal: true
          });
        }
      }
      setIsModalOpen(false);
      resetForm();
      fetchPets();
    } catch (error: any) {
      console.error('Erro ao salvar:', error);
      toast.error(`Erro: ${error.message || JSON.stringify(error)}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Gestão de Pets</h1>
        <button onClick={openNewModal} className="w-full sm:w-auto bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 font-medium">
          <Plus className="w-5 h-5" /> Novo Pet
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Buscar por nome..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center bg-gray-100 p-1 rounded-lg">
            <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}>
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button onClick={() => setViewMode('lista')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'lista' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}>
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12"><div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div></div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPets.map((pet) => (
            <div key={pet.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="aspect-square bg-gray-100 relative overflow-hidden">
                <img src={getPrincipalPhoto(pet.fotos_pet)} alt={pet.nome} className="w-full h-full object-contain p-2" />
                <div className="absolute top-3 right-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium \${pet.status === 'para_adocao' ? 'bg-emerald-100/90 text-emerald-800' : 'bg-white/90 text-gray-800'}`}>
                    {pet.status === 'para_adocao' ? 'Para Adoção' : pet.status}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-gray-900">{pet.nome}</h3>
                </div>
                <p className="text-sm text-gray-500 mb-1">
                  {(pet.especie === 'CACHORRO' || pet.especie === 'cao' || pet.especie === 'cão' || pet.especie === 'Cão') ? 'Cão' : 'Gato'} • {pet.sexo === 'femea' ? 'Fêmea' : 'Macho'} • {pet.observacoes || 'Idade desconhecida'}
                </p>
                <p className="text-xs text-emerald-600 font-medium mb-4">
                  Tutor: {pet.tutor_nome}
                </p>
                <div className="flex gap-2">
                  <button onClick={() => openEditModal(pet)} className="flex-1 py-1.5 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 flex justify-center items-center gap-1">
                    <Edit className="w-3.5 h-3.5" /> Editar
                  </button>
                  <button onClick={() => handleDeletePet(pet.id)} className="py-1.5 px-3 text-sm font-medium border border-red-200 rounded-lg hover:bg-red-50 text-red-600 flex justify-center items-center">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
              <tr>
                <th className="p-4">Pet</th>
                <th className="p-4">Idade/Porte</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPets.map((pet) => (
                <tr key={pet.id} className="hover:bg-gray-50">
                  <td className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden">
                      <img src={getPrincipalPhoto(pet.fotos_pet)} alt={pet.nome} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{pet.nome}</p>
                      <p className="text-xs text-gray-500">{(pet.especie === 'CACHORRO' || pet.especie === 'cao' || pet.especie === 'cão' || pet.especie === 'Cão') ? 'Cão' : 'Gato'} • Tutor: {pet.tutor_nome}</p>
                    </div>
                  </td>
                  <td className="p-4 text-gray-700">{pet.observacoes || '-'} • {pet.porte}</td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium \${pet.status === 'para_adocao' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'}`}>
                      {pet.status === 'para_adocao' ? 'Para Adoção' : pet.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => openEditModal(pet)} className="text-gray-400 hover:text-emerald-600 mr-2">
                      <Edit className="w-4 h-4 inline-block" />
                    </button>
                    <button onClick={() => handleDeletePet(pet.id)} className="text-gray-400 hover:text-red-600">
                      <Trash2 className="w-4 h-4 inline-block" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold text-gray-900">{editingPet ? 'Editar Pet' : 'Cadastrar Novo Pet'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSavePet} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Animal</label>
                <input type="text" required value={nome} onChange={(e) => setNome(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Espécie</label>
                  <select value={especie} onChange={(e) => setEspecie(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500">
                    <option value="cao">Cachorro</option>
                    <option value="gato">Gato</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Porte</label>
                  <select value={porte} onChange={(e) => setPorte(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500">
                    <option value="pequeno">Pequeno</option>
                    <option value="medio">Médio</option>
                    <option value="grande">Grande</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Idade Aproximada</label>
                  <input type="text" placeholder="Ex: 2 anos" value={idade} onChange={(e) => setIdade(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status Inicial</label>
                  <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500">
                    <option value="para_adocao">Disponível para Adoção</option>
                    <option value="em_tratamento">Em Tratamento</option>
                  </select>
                </div>
              </div>

              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700">Foto Principal</label>
                  <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={useAI}
                      onChange={(e) => setUseAI(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    Recortar fundo com IA
                  </label>
                </div>
                <input type="file" accept="image/*" onChange={handleFotoChange} disabled={isProcessingImage} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100" />
                {isProcessingImage && (
                  <div className="flex items-center justify-center py-4 bg-gray-50 rounded-lg border border-gray-200 mt-2">
                    <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                    <span className="text-sm text-gray-600">A IA está processando o fundo da foto...</span>
                  </div>
                )}
                {preview && !isProcessingImage && (
                  <div className="mt-3 relative rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex justify-center h-48">
                    <img src={preview} alt="Preview" className="h-full w-auto object-contain" />
                  </div>
                )}
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50">Cancelar</button>
                <button type="submit" disabled={saving || isProcessingImage} className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-70 flex justify-center items-center">
                  {saving ? 'Salvando...' : isProcessingImage ? 'Processando Foto...' : editingPet ? 'Atualizar Pet' : 'Cadastrar Pet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
