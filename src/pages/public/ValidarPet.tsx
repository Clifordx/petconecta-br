import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Dog, 
  Cat, 
  MapPin, 
  Calendar, 
  QrCode, 
  Phone, 
  Share2, 
  ArrowLeft, 
  ExternalLink,
  CreditCard,
  FileText,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import CarteirinhaDigital from '@/components/pets/CarteirinhaDigital';
import { toast } from 'sonner';

export default function ValidarPet() {
  const { id } = useParams<{ id: string }>();
  const [pet, setPet] = useState<any>(null);
  const [tutor, setTutor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [modalCarteirinhaOpen, setModalCarteirinhaOpen] = useState(false);

  useEffect(() => {
    if (id) {
      carregarPet(id);
    }
  }, [id]);

  const carregarPet = async (petId: string) => {
    try {
      setLoading(true);
      // Busca dados do pet
      const { data: petData, error: petError } = await supabase
        .from('pets')
        .select('*, fotos_pet(url)')
        .eq('id', petId)
        .single();

      if (petError) throw petError;
      setPet(petData);

      // Se tiver tutor_id, tenta buscar os dados de contato do perfil
      if (petData?.tutor_id) {
        const { data: tutorData } = await supabase
          .from('perfis')
          .select('nome, telefone, cidade, estado')
          .eq('id', petData.tutor_id)
          .single();

        if (tutorData) setTutor(tutorData);
      }
    } catch (error) {
      console.error('Erro ao validar pet:', error);
      setPet(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCompartilhar = () => {
    if (navigator.share) {
      navigator.share({
        title: `Registro Oficial de ${pet?.nome} - PetConecta BR`,
        text: `Consulte a carteirinha digital e registro municipal de ${pet?.nome}.`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link de validação copiado com sucesso!');
    }
  };

  const openWhatsAppTutor = (telefone: string, nomePet: string) => {
    const clean = telefone.replace(/\D/g, '');
    if (!clean) return;
    const phoneWithCountry = clean.length <= 11 ? `55${clean}` : clean;
    const msg = encodeURIComponent(`Olá! Estou entrando em contato referente ao animal ${nomePet} registrado no PetConecta BR.`);
    window.open(`https://wa.me/${phoneWithCountry}?text=${msg}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-base font-bold text-gray-700">Validando registro no banco oficial...</h2>
        <p className="text-xs text-gray-400 mt-1">Conectando ao sistema municipal de Arapongas - PR</p>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="container mx-auto p-4 max-w-xl py-12 text-center">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={32} />
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900">Registro Não Encontrado</h1>
        <p className="text-sm text-gray-600 mt-2">
          Não foi possível localizar nenhum animal cadastrado com este código de identificação no sistema oficial.
        </p>
        <div className="mt-6">
          <Link to="/" className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700">
            <ArrowLeft size={16} /> Voltar ao Início
          </Link>
        </div>
      </div>
    );
  }

  const rgaCode = `PR-ARA-${pet.id.replace(/-/g, '').slice(0, 8).toUpperCase()}`;
  const petPhoto = pet.fotos_pet && pet.fotos_pet.length > 0 ? pet.fotos_pet[0].url : null;
  const isDesaparecido = pet.status === 'desaparecido';

  return (
    <div className="container mx-auto p-4 max-w-3xl py-8 space-y-6">
      {/* Botão de Retorno */}
      <div className="flex items-center justify-between">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 hover:underline">
          <ArrowLeft size={16} /> Início
        </Link>
        <button
          onClick={handleCompartilhar}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-gray-900 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-xs"
        >
          <Share2 size={13} /> Compartilhar Ficha
        </button>
      </div>

      {/* SELO DE AUTENTICIDADE MUNICIPAL */}
      <div className={`p-5 rounded-2xl border text-white shadow-md flex flex-col sm:flex-row items-center sm:items-start gap-4 ${
        isDesaparecido 
          ? 'bg-gradient-to-r from-red-600 via-rose-600 to-red-700 border-red-500 animate-pulse' 
          : 'bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 border-emerald-500'
      }`}>
        <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
          {isDesaparecido ? <AlertTriangle size={32} /> : <ShieldCheck size={34} />}
        </div>
        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-white/20 text-white">
              {isDesaparecido ? 'Alerta Ativo' : 'Documento Autêntico'}
            </span>
            <span className="text-xs font-mono font-bold text-emerald-100">
              {rgaCode}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black uppercase mt-1 tracking-wide">
            {isDesaparecido ? 'Animal Registrado como Desaparecido!' : 'Registro Animal Oficial Verificado'}
          </h1>
          <p className="text-xs text-white/90 mt-1">
            {isDesaparecido 
              ? 'Se você encontrou este animal, entre em contato imediatamente com o tutor responsável abaixo.'
              : 'Animal devidamente cadastrado no Cadastro Geral Animal de Arapongas - PR (PetConecta BR).'
            }
          </p>
        </div>
      </div>

      {/* FICHA TÉCNICA PRINCIPAL */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Cabeçalho do Perfil */}
        <div className="p-6 flex flex-col md:flex-row items-center gap-6 border-b border-gray-100">
          <div className="relative w-36 h-36 rounded-2xl overflow-hidden border-4 border-emerald-100 shadow-md bg-gray-50 shrink-0 flex items-center justify-center">
            {petPhoto ? (
              <img src={petPhoto} alt={pet.nome} className="w-full h-full object-cover" />
            ) : (
              <div className="text-gray-400 flex flex-col items-center">
                {pet.especie === 'gato' ? <Cat size={44} /> : <Dog size={44} />}
                <span className="text-xs mt-1 font-semibold">Sem Foto</span>
              </div>
            )}
            <div className="absolute top-2 right-2 bg-emerald-600 text-white p-1 rounded-full shadow-xs">
              <CheckCircle2 size={14} />
            </div>
          </div>

          <div className="flex-1 text-center md:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 uppercase">
                {pet.nome}
              </h2>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                pet.status === 'para_adocao' 
                  ? 'bg-pink-100 text-pink-800 border border-pink-200'
                  : pet.status === 'adotado'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}>
                {pet.status === 'para_adocao' ? 'Para Adoção' : pet.status === 'adotado' ? 'Adotado' : 'Com Tutor'}
              </span>
            </div>

            <p className="text-sm text-gray-600 font-medium">
              {pet.especie === 'gato' ? 'Gato (Felino)' : 'Cachorro (Canino)'} • {pet.raca || 'SRD (Sem Raça Definida)'} • {pet.sexo === 'femea' ? 'Fêmea' : 'Macho'}
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-1">
              <Button
                onClick={() => setModalCarteirinhaOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                <CreditCard size={14} /> Abrir Carteirinha Digital
              </Button>

              {tutor?.telefone && (
                <button
                  onClick={() => openWhatsAppTutor(tutor.telefone, pet.nome)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold bg-green-500 hover:bg-green-600 text-white px-3.5 py-2 rounded-lg shadow-sm transition-colors"
                >
                  <Phone size={14} /> Contatar Tutor
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Informações Detalhadas */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Dados Físicos */}
          <div className="space-y-4">
            <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider">
              Características do Animal
            </h3>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase block">Porte</span>
                <span className="font-bold text-gray-800 capitalize">{pet.porte || 'Médio'}</span>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase block">Pelagem / Cor</span>
                <span className="font-bold text-gray-800">{pet.cor || 'Padrão'}</span>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 col-span-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase block">Microchip de Identificação</span>
                <span className="font-mono font-bold text-emerald-900">
                  {pet.microchip || 'Microchip não implantado'}
                </span>
              </div>
            </div>
          </div>

          {/* Dados Sanitários e Vacinais */}
          <div className="space-y-4">
            <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider">
              Prontuário Sanitário
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className={`p-3 rounded-xl border flex flex-col justify-between ${
                pet.castrado ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-gray-500 uppercase">Castração</span>
                  {pet.castrado ? <CheckCircle2 size={16} className="text-emerald-600" /> : <AlertCircle size={16} className="text-gray-400" />}
                </div>
                <span className={`text-sm font-bold mt-2 ${pet.castrado ? 'text-emerald-900' : 'text-gray-600'}`}>
                  {pet.castrado ? 'Castrado' : 'Não Castrado'}
                </span>
              </div>

              <div className={`p-3 rounded-xl border flex flex-col justify-between ${
                pet.vacinado ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-gray-500 uppercase">Vacinação</span>
                  {pet.vacinado ? <CheckCircle2 size={16} className="text-emerald-600" /> : <AlertTriangle size={16} className="text-amber-600" />}
                </div>
                <span className={`text-sm font-bold mt-2 ${pet.vacinado ? 'text-emerald-900' : 'text-amber-800'}`}>
                  {pet.vacinado ? 'Vacinado (V10/Raiva)' : 'Vacina Pendente'}
                </span>
              </div>
            </div>

            {pet.observacoes && (
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-xs">
                <span className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
                  Observações Veterinárias
                </span>
                <p className="text-gray-700 italic leading-relaxed">
                  "{pet.observacoes}"
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Rodapé da Ficha Oficial */}
        <div className="bg-gray-50 p-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <div className="flex items-center gap-1.5 font-medium">
            <MapPin size={14} className="text-emerald-600" /> Arapongas - PR • Sistema Municipal de Proteção Animal
          </div>
          <div className="font-mono text-[11px]">
            Cadastrado em: {new Date(pet.criado_em).toLocaleDateString('pt-BR')}
          </div>
        </div>
      </div>

      {/* MODAL DA CARTEIRINHA DIGITAL */}
      {modalCarteirinhaOpen && (
        <CarteirinhaDigital
          isOpen={modalCarteirinhaOpen}
          onClose={() => setModalCarteirinhaOpen(false)}
          pet={{
            ...pet,
            tutor_nome: tutor?.nome,
            tutor_telefone: tutor?.telefone
          }}
        />
      )}
    </div>
  );
}
