import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Share2, 
  Heart, 
  CheckCircle2, 
  AlertCircle, 
  MessageCircle, 
  Phone, 
  Calendar, 
  ShieldCheck, 
  MapPin, 
  Info,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function DetalheAnimal() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [animal, setAnimal] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [modalInteresseOpen, setModalInteresseOpen] = useState(false);

  // Número padrão de WhatsApp da equipe de adoção (se houver clínica ou org configurada, pode puxar)
  const [whatsappEquipe, setWhatsappEquipe] = useState('43999999999');

  useEffect(() => {
    if (id) {
      fetchAnimalDetails();
      buscarContatoEquipe();
    }
  }, [id]);

  const fetchAnimalDetails = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pets')
        .select('*, fotos_pet(url, is_principal)')
        .eq('id', id)
        .single();

      if (error) throw error;
      setAnimal(data);
    } catch (error) {
      console.error('Erro ao buscar detalhes do animal:', error);
      toast.error('Animal não encontrado.');
      navigate('/animais');
    } finally {
      setLoading(false);
    }
  };

  const buscarContatoEquipe = async () => {
    try {
      // Pega o telefone da primeira clínica ou organização se existir
      const { data: clinicas } = await supabase.from('clinicas_parceiras').select('telefone').limit(1);
      if (clinicas && clinicas.length > 0 && clinicas[0].telefone) {
        setWhatsappEquipe(clinicas[0].telefone.replace(/\D/g, ''));
      }
    } catch (e) {
      // Usa fallback
    }
  };

  const getPrincipalPhoto = (fotos: any[]) => {
    if (!fotos || fotos.length === 0) return 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=800';
    const principal = fotos.find(f => f.is_principal);
    return principal ? principal.url : fotos[0].url;
  };

  const handleAbrirWhatsApp = () => {
    const texto = encodeURIComponent(
      `Olá! Vi o animal *${animal?.nome}* (${animal?.especie}, ${animal?.raca || 'SRD'}) para adoção no PetConecta BR e tenho muito interesse em adotá-lo! Poderia me passar mais informações?`
    );
    const numeroLimpo = whatsappEquipe.replace(/\D/g, '');
    const phoneFinal = numeroLimpo.length <= 11 ? `55${numeroLimpo}` : numeroLimpo;
    window.open(`https://wa.me/${phoneFinal}?text=${texto}`, '_blank');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!animal) return null;

  return (
    <div className="container mx-auto p-4 max-w-5xl py-8">
      {/* Botão Voltar */}
      <button 
        onClick={() => navigate('/animais')} 
        className="flex items-center text-sm font-semibold text-gray-600 hover:text-emerald-700 mb-6 transition-colors gap-1.5"
      >
        <ArrowLeft size={18} /> Voltar para lista de animais
      </button>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex flex-col md:flex-row">
          
          {/* Foto Principal com Logo Oficial */}
          <div className="w-full md:w-1/2 bg-gray-50 flex items-center justify-center p-4 border-b md:border-b-0 md:border-r">
            <div className="w-full max-h-[520px] rounded-2xl overflow-hidden flex items-center justify-center">
              <img 
                src={getPrincipalPhoto(animal.fotos_pet)} 
                alt={animal.nome} 
                className="max-h-[500px] w-auto object-contain rounded-xl"
              />
            </div>
          </div>

          {/* Dados do Animal */}
          <div className="w-full md:w-1/2 p-6 sm:p-8 flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-xs uppercase font-bold tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full inline-block mb-2">
                    Disponível para Adoção
                  </span>
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">{animal.nome}</h1>
                  <p className="text-base text-gray-500 mt-1">
                    {['cachorro', 'cao', 'cão'].includes(animal.especie?.toLowerCase()) ? 'Cão' : 'Gato'} • {animal.raca || 'Sem raça definida (SRD)'} • {animal.sexo === 'femea' ? 'Fêmea' : 'Macho'}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: `Adote o ${animal.nome}!`,
                          text: `Conheça o ${animal.nome} disponível para adoção responsável no PetConecta BR!`,
                          url: window.location.href
                        }).catch(() => {});
                      } else {
                        navigator.clipboard.writeText(window.location.href);
                        toast.success('Link copiado para a área de transferência!');
                      }
                    }}
                    className="p-3 bg-gray-100 hover:bg-emerald-50 hover:text-emerald-700 rounded-full transition-colors"
                    title="Compartilhar"
                  >
                    <Share2 size={20} />
                  </button>
                </div>
              </div>

              {/* Grid de Características */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                <div className="bg-gray-50 p-3 rounded-xl border">
                  <span className="block text-xs text-gray-400 font-semibold mb-0.5">Porte</span>
                  <span className="font-bold text-gray-800 text-sm capitalize">{animal.porte || 'Médio'}</span>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl border">
                  <span className="block text-xs text-gray-400 font-semibold mb-0.5">Sexo</span>
                  <span className="font-bold text-gray-800 text-sm capitalize">{animal.sexo === 'femea' ? 'Fêmea' : 'Macho'}</span>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl border">
                  <span className="block text-xs text-gray-400 font-semibold mb-0.5">Idade</span>
                  <span className="font-bold text-gray-800 text-sm">
                    {animal.observacoes?.replace('Idade aproximada: ', '') || 'Jovem/Adulto'}
                  </span>
                </div>
              </div>

              {/* Status de Saúde */}
              <div className="mb-6 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-2">
                <h3 className="text-xs uppercase font-bold text-emerald-900 tracking-wider">
                  Cuidados Veterinários
                </h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center text-gray-700">
                    <CheckCircle2 className={`mr-2 flex-shrink-0 ${animal.castrado ? 'text-emerald-600' : 'text-gray-300'}`} size={18} />
                    <span>{animal.castrado ? 'Castrado' : 'Castração Pendente'}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <CheckCircle2 className={`mr-2 flex-shrink-0 ${animal.vacinado ? 'text-emerald-600' : 'text-gray-300'}`} size={18} />
                    <span>{animal.vacinado ? 'Vacinado' : 'Vacinas Pendentes'}</span>
                  </div>
                </div>
              </div>

              {/* Requisitos Importantes */}
              <div className="mb-6 text-xs text-gray-500 space-y-1.5">
                <p className="flex items-center gap-1.5 font-medium text-gray-700">
                  <ShieldCheck size={16} className="text-emerald-600" /> Adoção com Termo Oficial de Guarda Responsável
                </p>
                <p>• Obrigatório ser maior de 18 anos</p>
                <p>• Necessário apresentar documento de identidade e comprovante de endereço</p>
              </div>
            </div>

            {/* Botão Principal Quero Adotar */}
            <div className="space-y-3 pt-4 border-t">
              <Button 
                onClick={() => setModalInteresseOpen(true)}
                className="w-full h-14 text-base font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
              >
                <Heart size={20} fill="currentColor" /> Quero Adotar {animal.sexo === 'femea' ? 'a' : 'o'} {animal.nome}
              </Button>

              <button
                onClick={handleAbrirWhatsApp}
                className="w-full py-2.5 text-xs text-emerald-700 font-bold hover:underline flex items-center justify-center gap-1.5"
              >
                <MessageCircle size={15} /> Falar com a equipe no WhatsApp sobre {animal.nome}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Interesse na Adoção */}
      <Modal
        isOpen={modalInteresseOpen}
        onClose={() => setModalInteresseOpen(false)}
        title={`Adotar ${animal.nome}`}
      >
        <div className="space-y-5 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-emerald-50 p-4 rounded-2xl border border-emerald-200">
            <img 
              src={getPrincipalPhoto(animal.fotos_pet)} 
              alt={animal.nome} 
              className="w-16 h-16 rounded-xl object-cover border"
            />
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Você escolheu {animal.nome}! ❤️</h3>
              <p className="text-xs text-gray-600">
                Para adotar, você pode falar direto com nossos voluntários pelo WhatsApp ou participar de uma das nossas feiras presenciais.
              </p>
            </div>
          </div>

          <div className="space-y-2 text-xs text-gray-700">
            <span className="font-bold uppercase tracking-wider text-gray-500 block">Como funciona a adoção:</span>
            <div className="space-y-1.5">
              <p className="flex items-start gap-2">
                <Check size={16} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                <span><strong>Conversa inicial:</strong> Nossa equipe tira dúvidas sobre o temperamento e rotina do pet.</span>
              </p>
              <p className="flex items-start gap-2">
                <Check size={16} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                <span><strong>Termo Digital:</strong> Você assina o Termo de Posse Responsável direto no celular/tablet.</span>
              </p>
              <p className="flex items-start gap-2">
                <Check size={16} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                <span><strong>Novo lar:</strong> O pet já vai para a sua casa vacinado e castrado!</span>
              </p>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <Button 
              onClick={handleAbrirWhatsApp}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold h-12 rounded-xl flex items-center justify-center gap-2 shadow-md shadow-green-600/20"
            >
              <MessageCircle size={18} /> Conversar no WhatsApp Agora
            </Button>

            <Link to="/feiras" onClick={() => setModalInteresseOpen(false)}>
              <Button variant="outline" className="w-full h-11 rounded-xl text-xs flex items-center justify-center gap-1.5 mt-2">
                <Calendar size={15} /> Ver Próximas Feiras de Adoção
              </Button>
            </Link>
          </div>
        </div>
      </Modal>
    </div>
  );
}
