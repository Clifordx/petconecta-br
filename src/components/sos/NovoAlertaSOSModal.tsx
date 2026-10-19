import React, { useState, useEffect } from 'react';
import { 
  X, 
  AlertTriangle, 
  Camera, 
  MapPin, 
  Phone, 
  User, 
  DollarSign, 
  FileText, 
  Calendar,
  Sparkles,
  Search,
  CheckCircle2,
  Dog,
  Cat
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { AnimalSOS, salvarAnimalSOS } from '@/lib/sos';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface NovoAlertaSOSModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (animalSalvo: AnimalSOS) => void;
  tipoInicial?: 'perdido' | 'encontrado';
  petPreSelecionado?: any;
}

export default function NovoAlertaSOSModal({
  isOpen,
  onClose,
  onSuccess,
  tipoInicial = 'perdido',
  petPreSelecionado
}: NovoAlertaSOSModalProps) {
  const { user, profile } = useAuth();
  const [tipo, setTipo] = useState<'perdido' | 'encontrado'>(tipoInicial);
  const [meusPets, setMeusPets] = useState<any[]>([]);
  const [petId, setPetId] = useState<string>(petPreSelecionado?.id || '');

  // Formulário
  const [nome, setNome] = useState('');
  const [especie, setEspecie] = useState<'cachorro' | 'gato' | 'outro'>('cachorro');
  const [raca, setRaca] = useState('');
  const [porte, setPorte] = useState<'pequeno' | 'medio' | 'grande'>('medio');
  const [sexo, setSexo] = useState<'macho' | 'femea' | 'indefinido'>('macho');
  const [cor, setCor] = useState('');
  const [fotoUrl, setFotoUrl] = useState('');
  const [bairro, setBairro] = useState('Centro');
  const [cidade, setCidade] = useState('Arapongas - PR');
  const [pontoReferencia, setPontoReferencia] = useState('');
  const [dataOcorrencia, setDataOcorrencia] = useState(new Date().toISOString().split('T')[0]);
  const [recompensa, setRecompensa] = useState('');
  const [descricao, setDescricao] = useState('');
  const [contatoNome, setContatoNome] = useState('');
  const [contatoTelefone, setContatoTelefone] = useState('');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (tipoInicial) {
      setTipo(tipoInicial);
    }
  }, [tipoInicial]);

  // Carrega pets do usuário para auto-preenchimento
  useEffect(() => {
    if (user && isOpen) {
      supabase
        .from('pets')
        .select('*, fotos_pet(url)')
        .eq('tutor_id', user.id)
        .then(({ data }) => {
          setMeusPets(data || []);
        });

      if (profile) {
        setContatoNome(profile.nome || '');
        setContatoTelefone(profile.telefone || '');
      }
    }
  }, [user, profile, isOpen]);

  // Se já veio pet pré-selecionado ou o usuário selecionou da lista
  useEffect(() => {
    const alvo = petPreSelecionado || meusPets.find(p => p.id === petId);
    if (alvo) {
      setNome(alvo.nome || '');
      setEspecie(alvo.especie?.toLowerCase().includes('gato') ? 'gato' : 'cachorro');
      setRaca(alvo.raca || '');
      setPorte(alvo.porte?.toLowerCase() || 'medio');
      setSexo(alvo.sexo?.toLowerCase() || 'macho');
      setCor(alvo.cor || '');
      if (alvo.fotos_pet && alvo.fotos_pet.length > 0) {
        setFotoUrl(alvo.fotos_pet[0].url);
      }
    }
  }, [petId, petPreSelecionado, meusPets]);

  if (!isOpen) return null;

  const handleFotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Converte para Base64 para preview imediato sem depender de storage bucket
    const reader = new FileReader();
    reader.onloadend = () => {
      setFotoUrl(reader.result as string);
      toast.success('Foto carregada com sucesso!');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nome.trim()) {
      toast.error('Informe o nome ou identificação do animal.');
      return;
    }
    if (!bairro.trim()) {
      toast.error('Informe o bairro do ocorrido.');
      return;
    }
    if (!contatoTelefone.trim()) {
      toast.error('Informe um telefone com WhatsApp para contato.');
      return;
    }

    setSalvando(true);
    try {
      const salvo = await salvarAnimalSOS({
        tipo,
        status: 'ativo',
        pet_id: petId || undefined,
        nome: nome.trim(),
        especie,
        raca: raca.trim() || 'SRD (Sem Raça Definida)',
        porte,
        sexo,
        cor: cor.trim() || 'Não especificado',
        foto_url: fotoUrl || (especie === 'gato' 
          ? 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=600'
          : 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=600'),
        bairro: bairro.trim(),
        cidade: cidade.trim(),
        ponto_referencia: pontoReferencia.trim(),
        data_ocorrencia: dataOcorrencia,
        recompensa: recompensa.trim(),
        descricao: descricao.trim(),
        contato_nome: contatoNome.trim() || (profile?.nome || 'Tutor'),
        contato_telefone: contatoTelefone.trim(),
        user_id: user?.id
      });

      toast.success(tipo === 'perdido' ? 'Alerta de Pet Perdido publicado!' : 'Alerta de Pet Encontrado publicado!');
      onSuccess(salvo);
      onClose();
    } catch (e: any) {
      console.error('Erro ao salvar SOS:', e);
      toast.error('Erro ao publicar alerta: ' + (e.message || 'Erro inesperado'));
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto">
        
        {/* TOPO COM SELETOR DE TIPO */}
        <div className={`p-4 sm:p-5 text-white flex items-center justify-between ${tipo === 'perdido' ? 'bg-red-600' : 'bg-emerald-600'}`}>
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-6 h-6 text-white" />
            <div>
              <h2 className="text-lg font-black uppercase tracking-wide">
                {tipo === 'perdido' ? 'Publicar Pet Desaparecido (SOS)' : 'Publicar Pet Encontrado na Rua'}
              </h2>
              <p className="text-xs text-white/85">
                {tipo === 'perdido' 
                  ? 'Gere um cartaz instantâneo e alerte os moradores de Arapongas' 
                  : 'Ajude um animal resgatado a reencontrar seus donos'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 rounded-lg hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* TOGGLE PERDIDO VS ENCONTRADO */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex gap-2">
          <button
            type="button"
            onClick={() => setTipo('perdido')}
            className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
              tipo === 'perdido' 
                ? 'bg-red-600 text-white shadow-md' 
                : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
            }`}
          >
            🔴 Perdi meu pet
          </button>
          <button
            type="button"
            onClick={() => setTipo('encontrado')}
            className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
              tipo === 'encontrado' 
                ? 'bg-emerald-600 text-white shadow-md' 
                : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
            }`}
          >
            🟢 Encontrei um pet na rua
          </button>
        </div>

        {/* FORMULÁRIO */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          
          {/* Seletor de pet do usuário se houver */}
          {tipo === 'perdido' && meusPets.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
              <label className="block text-xs font-bold text-amber-900 mb-1">
                Selecionar um dos meus pets cadastrados:
              </label>
              <select
                value={petId}
                onChange={(e) => setPetId(e.target.value)}
                className="w-full text-xs font-semibold p-2 bg-white border border-amber-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-amber-500"
              >
                <option value="">-- Cadastrar manualmente ou outro animal --</option>
                {meusPets.map(p => (
                  <option key={p.id} value={p.id}>
                    🐾 {p.nome} ({p.especie} - {p.raca || 'SRD'})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* DADOS DO PET */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nome do Pet / Apelido *
              </label>
              <input
                type="text"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Thor, Rex, Pipoca..."
                className="w-full text-sm p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Espécie *
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setEspecie('cachorro')}
                  className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 border ${
                    especie === 'cachorro' ? 'bg-primary-50 border-primary-500 text-primary-700' : 'bg-slate-50 border-slate-300'
                  }`}
                >
                  <Dog className="w-4 h-4" /> Cão
                </button>
                <button
                  type="button"
                  onClick={() => setEspecie('gato')}
                  className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 border ${
                    especie === 'gato' ? 'bg-primary-50 border-primary-500 text-primary-700' : 'bg-slate-50 border-slate-300'
                  }`}
                >
                  <Cat className="w-4 h-4" /> Gato
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Raça
              </label>
              <input
                type="text"
                value={raca}
                onChange={(e) => setRaca(e.target.value)}
                placeholder="Ex: Poodle, Vira-lata, Siamês..."
                className="w-full text-sm p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Porte & Sexo
              </label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={porte}
                  onChange={(e: any) => setPorte(e.target.value)}
                  className="text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                >
                  <option value="pequeno">Pequeno</option>
                  <option value="medio">Médio</option>
                  <option value="grande">Grande</option>
                </select>
                <select
                  value={sexo}
                  onChange={(e: any) => setSexo(e.target.value)}
                  className="text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                >
                  <option value="macho">Macho</option>
                  <option value="femea">Fêmea</option>
                  <option value="indefinido">Não sei</option>
                </select>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Cor Predominante / Pelagem *
              </label>
              <input
                type="text"
                required
                value={cor}
                onChange={(e) => setCor(e.target.value)}
                placeholder="Ex: Preto com patas brancas, Caramelo, Rajado..."
                className="w-full text-sm p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* FOTO */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Foto do Animal (Essencial para o cartaz A4 e reconhecimento)
            </label>
            <div className="flex items-center gap-3">
              {fotoUrl ? (
                <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-300 bg-slate-100 flex-shrink-0">
                  <img src={fotoUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-xl border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-slate-400 flex-shrink-0">
                  <Camera className="w-6 h-6" />
                </div>
              )}
              <div className="flex-1 space-y-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFotoUpload}
                  className="text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                />
                <input
                  type="text"
                  placeholder="Ou cole a URL direta de uma foto online..."
                  value={fotoUrl}
                  onChange={(e) => setFotoUrl(e.target.value)}
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* LOCAL DO OCORRIDO */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-red-500" />
              {tipo === 'perdido' ? 'Onde ele desapareceu?' : 'Onde ele foi encontrado?'}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Bairro *</label>
                <input
                  type="text"
                  required
                  value={bairro}
                  onChange={(e) => setBairro(e.target.value)}
                  placeholder="Ex: Jardim Primavera, Centro, Vila Nova..."
                  className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Data do Ocorrido *</label>
                <input
                  type="date"
                  required
                  value={dataOcorrencia}
                  onChange={(e) => setDataOcorrencia(e.target.value)}
                  className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Ponto de Referência / Rua</label>
                <input
                  type="text"
                  value={pontoReferencia}
                  onChange={(e) => setPontoReferencia(e.target.value)}
                  placeholder="Ex: Próximo à Praça Mauá, perto do Colégio Emílio..."
                  className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* RECOMPENSA (SE PERDIDO) E OBSERVAÇÕES */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {tipo === 'perdido' && (
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-amber-800 mb-1 flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-amber-600" /> Recompensa Ofertada (Opcional):
                </label>
                <input
                  type="text"
                  value={recompensa}
                  onChange={(e) => setRecompensa(e.target.value)}
                  placeholder="Ex: R$ 300,00 ou Gratifica-se com recompensa"
                  className="w-full text-sm p-2 bg-amber-50/60 border border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500 font-medium text-amber-950"
                />
              </div>
            )}

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Detalhes & Características Marcantes:
              </label>
              <textarea
                rows={2}
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Ex: Dócil, atende pelo nome, estava com coleira vermelha, precisa de colírio diário..."
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* DADOS DE CONTATO */}
          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
            <h3 className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-emerald-600" />
              Telefone para Receber Informações e Pistas (WhatsApp)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Nome do Contato *</label>
                <input
                  type="text"
                  required
                  value={contatoNome}
                  onChange={(e) => setContatoNome(e.target.value)}
                  placeholder="Ex: Carlos Silva"
                  className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Telefone com WhatsApp *</label>
                <input
                  type="tel"
                  required
                  value={contatoTelefone}
                  onChange={(e) => setContatoTelefone(e.target.value)}
                  placeholder="(43) 99999-9999"
                  className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* BOTÕES DE AÇÃO */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={salvando}
              className="text-xs"
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              variant="primary"
              disabled={salvando}
              className={`text-xs text-white font-bold gap-1.5 ${
                tipo === 'perdido' ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              {salvando ? 'Publicando Alerta...' : '🚀 Publicar Alerta & Gerar Cartaz'}
            </Button>
          </div>
        </form>

      </div>
    </div>
  );
}
