import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { 
  ArrowLeft, 
  Printer, 
  CheckCircle, 
  Home, 
  User, 
  Info, 
  FileSignature, 
  Phone, 
  MessageCircle, 
  Calendar, 
  MapPin, 
  Heart,
  Camera,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';

export default function DetalheAdocao() {
  const { id } = useParams<{ id: string }>();
  const [adocao, setAdocao] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchAdocao();
    }
  }, [id]);

  const fetchAdocao = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('adocoes')
        .select(`
          *,
          pets (
            id,
            nome,
            especie,
            raca,
            sexo,
            porte,
            castrado,
            vacinado,
            microchip,
            fotos_pet (url, is_principal)
          ),
          feiras (
            id,
            titulo,
            local,
            data
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setAdocao(data);
    } catch (error: any) {
      console.error('Erro ao carregar adoção:', error);
      toast.error('Erro ao carregar detalhes da adoção');
    } finally {
      setLoading(false);
    }
  };

  const openWhatsApp = (telefone: string) => {
    const clean = telefone.replace(/\D/g, '');
    if (!clean) return;
    const phoneWithCode = clean.length <= 11 ? `55${clean}` : clean;
    window.open(`https://wa.me/${phoneWithCode}`, '_blank');
  };

  const getFotoPrincipal = (fotos: any[]) => {
    if (!fotos || fotos.length === 0) return 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=400';
    const princ = fotos.find(f => f.is_principal);
    return princ ? princ.url : fotos[0].url;
  };

  const handleImprimir = () => {
    window.print();
  };

  if (loading) {
    return <div className="p-12 text-center text-gray-500">Carregando dossiê de adoção...</div>;
  }

  if (!adocao) {
    return (
      <div className="p-12 text-center text-gray-500 space-y-3">
        <p>Adoção não encontrada.</p>
        <Link to="/admin/adocoes" className="text-emerald-600 underline">Voltar para a lista</Link>
      </div>
    );
  }

  const pet = adocao.pets;
  const questionario = adocao.questionario || {};

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Header - Oculto na impressão */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <Link to="/admin/adocoes" className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              Dossiê de Adoção Oficial
            </h1>
            <p className="text-emerald-700 font-semibold text-sm flex items-center gap-1.5 mt-0.5">
              <CheckCircle className="w-4 h-4 text-emerald-600" /> 
              Oficializada em {new Date(adocao.data_adocao || adocao.criado_em).toLocaleDateString('pt-BR')} às{' '}
              {new Date(adocao.data_adocao || adocao.criado_em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>

        <Button onClick={handleImprimir} className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 shadow-sm">
          <Printer className="w-4 h-4" /> Imprimir Termo Oficial
        </Button>
      </div>

      {/* Grid de Informações */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Coluna 1: Animal */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 border-b pb-2">
            <Info className="w-4 h-4 text-emerald-600" /> Animal Adotado
          </h3>

          <div className="flex items-center gap-4">
            <img 
              src={getFotoPrincipal(pet?.fotos_pet)} 
              alt={pet?.nome} 
              className="w-20 h-20 rounded-xl object-cover border flex-shrink-0"
            />
            <div>
              <h4 className="font-bold text-gray-900 text-xl">{pet?.nome}</h4>
              <p className="text-xs text-gray-500">{pet?.especie} • {pet?.sexo} • {pet?.raca || 'SRD'}</p>
              <span className="inline-block mt-1 text-[11px] bg-pink-100 text-pink-800 font-bold px-2 py-0.5 rounded-full">
                Adotado
              </span>
            </div>
          </div>

          <div className="text-xs space-y-2 text-gray-600 pt-2 border-t">
            <p><span className="font-semibold text-gray-900">Porte:</span> {pet?.porte || 'Médio'}</p>
            <p><span className="font-semibold text-gray-900">Castrado:</span> {pet?.castrado ? 'Sim' : 'Não'}</p>
            <p><span className="font-semibold text-gray-900">Vacinado:</span> {pet?.vacinado ? 'Sim' : 'Não'}</p>
            {pet?.microchip && (
              <p><span className="font-semibold text-gray-900">Microchip:</span> {pet.microchip}</p>
            )}
            {adocao.feiras && (
              <p><span className="font-semibold text-gray-900">Evento:</span> {adocao.feiras.titulo}</p>
            )}
          </div>
        </div>

        {/* Coluna 2: Adotante */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4 md:col-span-2">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-4 h-4 text-emerald-600" /> Novo Tutor Responsável
            </h3>
            {adocao.adotante_telefone && (
              <button
                onClick={() => openWhatsApp(adocao.adotante_telefone)}
                className="text-xs bg-green-50 hover:bg-green-100 text-green-700 font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors"
              >
                <MessageCircle size={14} /> Chamar no WhatsApp
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-xs text-gray-400 block">Nome Completo:</span>
              <span className="font-bold text-gray-900 text-base">{adocao.adotante_nome}</span>
            </div>
            <div>
              <span className="text-xs text-gray-400 block">CPF:</span>
              <span className="font-medium text-gray-800">{adocao.adotante_cpf}</span>
            </div>
            <div>
              <span className="text-xs text-gray-400 block">Telefone / WhatsApp:</span>
              <span className="font-medium text-gray-800">{adocao.adotante_telefone}</span>
            </div>
            <div>
              <span className="text-xs text-gray-400 block">E-mail:</span>
              <span className="font-medium text-gray-800">{adocao.adotante_email || 'Não informado'}</span>
            </div>
            <div className="sm:col-span-2">
              <span className="text-xs text-gray-400 block">Endereço Residencial:</span>
              <span className="font-medium text-gray-800">{adocao.adotante_endereco}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Questionário de Posse Responsável */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 border-b pb-2">
          <Home className="w-4 h-4 text-emerald-600" /> Respostas do Questionário de Posse Responsável
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs text-gray-700">
          <div className="p-3 bg-gray-50 rounded-xl border">
            <span className="text-gray-400 block font-semibold">Tipo de Moradia:</span>
            <span className="font-bold text-gray-900 text-sm mt-0.5 block">{questionario.tipo_moradia || 'Casa'}</span>
          </div>

          <div className="p-3 bg-gray-50 rounded-xl border">
            <span className="text-gray-400 block font-semibold">Quintal Murado/Cercado:</span>
            <span className="font-bold text-gray-900 text-sm mt-0.5 block">{questionario.quintal_cercado || 'Sim'}</span>
          </div>

          <div className="p-3 bg-gray-50 rounded-xl border">
            <span className="text-gray-400 block font-semibold">Telas de Proteção:</span>
            <span className="font-bold text-gray-900 text-sm mt-0.5 block">{questionario.telas_janelas || 'Sim'}</span>
          </div>

          <div className="p-3 bg-gray-50 rounded-xl border">
            <span className="text-gray-400 block font-semibold">Outros Animais:</span>
            <span className="font-bold text-gray-900 text-sm mt-0.5 block">
              {questionario.tem_outros_animais === 'Sim' ? questionario.quais_outros_animais || 'Sim' : 'Nenhum'}
            </span>
          </div>

          <div className="p-3 bg-gray-50 rounded-xl border">
            <span className="text-gray-400 block font-semibold">Acordo com Familiares:</span>
            <span className="font-bold text-gray-900 text-sm mt-0.5 block">{questionario.concordancia_familia || 'Sim'}</span>
          </div>

          <div className="p-3 bg-gray-50 rounded-xl border">
            <span className="text-gray-400 block font-semibold">Em caso de viagens:</span>
            <span className="font-bold text-gray-900 text-sm mt-0.5 block">{questionario.planejamento_viagem || 'Com a família'}</span>
          </div>
        </div>
      </div>

      {/* Fotos Opcionais de Comprovação */}
      {(adocao.foto_com_pet_url || adocao.documento_foto_url) && (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4 print:hidden">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 border-b pb-2">
            <Camera className="w-4 h-4 text-emerald-600" /> Registros Fotográficos da Feira
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {adocao.foto_com_pet_url && (
              <div>
                <span className="text-xs font-semibold text-gray-700 block mb-1">Adotante com o Pet</span>
                <div className="aspect-video rounded-xl overflow-hidden border">
                  <img src={adocao.foto_com_pet_url} alt="Adotante com Pet" className="w-full h-full object-cover" />
                </div>
              </div>
            )}
            {adocao.documento_foto_url && (
              <div>
                <span className="text-xs font-semibold text-gray-700 block mb-1">Documento de Identidade</span>
                <div className="aspect-video rounded-xl overflow-hidden border">
                  <img src={adocao.documento_foto_url} alt="Documento" className="w-full h-full object-cover" />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* DOCUMENTO OFICIAL FORMATADO PARA IMPRESSÃO / ARQUIVO */}
      <div className="bg-white p-8 rounded-2xl border border-gray-300 shadow-sm space-y-6 print:border-none print:shadow-none print:p-0">
        <div className="text-center border-b pb-4">
          <h2 className="text-xl font-bold uppercase tracking-wider text-gray-900">
            Termo de Adoção e Responsabilidade de Animal
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Sistema Oficial de Proteção Animal • Município de Arapongas / PR
          </p>
        </div>

        <div className="text-xs text-gray-700 space-y-3 leading-relaxed text-justify">
          <p>
            Pelo presente instrumento particular, o(a) <strong>ADOTANTE</strong> qualificado(a) acima assume de livre e espontânea vontade a guarda e posse responsável do animal descrito neste documento, comprometendo-se a zelar pela sua saúde física e psíquica, conferindo-lhe alimentação adequada, água potável, abrigo protegido das intempéries, cuidados médico-veterinários, carinho e respeito.
          </p>
          <p>
            O(A) Adotante declara estar ciente de que o abandono ou maus-tratos de animais configuram crime inafiançável previsto no Artigo 32 da Lei Federal nº 9.605/1998, com pena de reclusão e multa, além das sanções administrativas municipais.
          </p>
        </div>

        {/* Quadro com a Assinatura Digital do Dedo */}
        <div className="pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-xs text-gray-500">
            <p>Data do Registro:</p>
            <p className="font-bold text-gray-800 text-sm">
              {new Date(adocao.data_adocao || adocao.criado_em).toLocaleDateString('pt-BR')}
            </p>
          </div>

          <div className="flex flex-col items-center">
            {adocao.assinatura_url ? (
              <div className="h-20 flex items-center justify-center p-2 border-b-2 border-gray-900 min-w-[240px]">
                <img 
                  src={adocao.assinatura_url} 
                  alt="Assinatura Digital" 
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            ) : (
              <div className="h-16 border-b-2 border-gray-900 min-w-[240px]"></div>
            )}
            <span className="text-xs font-bold text-gray-900 mt-1">{adocao.adotante_nome}</span>
            <span className="text-[11px] text-gray-500">Assinatura Digital do Adotante (CPF: {adocao.adotante_cpf})</span>
          </div>
        </div>
      </div>
    </div>
  );
}
