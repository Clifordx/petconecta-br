import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, 
  Printer, 
  Download, 
  CreditCard, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  Building2, 
  Dog, 
  Cat,
  Share2
} from 'lucide-react';
import QRCode from 'qrcode';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

export interface FichaAutorizacaoProps {
  isOpen: boolean;
  onClose: () => void;
  tipo: 'castracao' | 'consulta';
  protocolo?: string;
  dataAgendada?: string | null;
  clinicaNome?: string;
  clinicaEndereco?: string;
  clinicaTelefone?: string;
  motivo?: string;
  pet: {
    id: string;
    nome: string;
    especie: string;
    raca?: string;
    sexo?: string;
    porte?: string;
    cor?: string;
    castrado?: boolean;
    microchip?: string | null;
    fotos_pet?: { url: string }[];
  };
  tutor: {
    nome: string;
    cpf?: string;
    telefone?: string;
    endereco?: string;
  };
  onAbrirCarteirinha?: () => void;
}

export default function FichaAutorizacaoModal({
  isOpen,
  onClose,
  tipo,
  protocolo,
  dataAgendada,
  clinicaNome,
  clinicaEndereco,
  clinicaTelefone,
  motivo,
  pet,
  tutor,
  onAbrirCarteirinha
}: FichaAutorizacaoProps) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [baixando, setBaixando] = useState(false);
  const fichaRef = useRef<HTMLDivElement>(null);

  const numProtocolo = protocolo || `AUT-${tipo === 'castracao' ? 'CAST' : 'CONS'}-${pet.id.replace(/-/g, '').slice(0, 6).toUpperCase()}`;
  const rgaCode = `PR-ARA-${pet.id.replace(/-/g, '').slice(0, 8).toUpperCase()}`;
  const validationUrl = `${window.location.origin}/validar/pet/${pet.id}`;

  useEffect(() => {
    if (isOpen && pet.id) {
      QRCode.toDataURL(validationUrl, {
        width: 180,
        margin: 1,
        color: {
          dark: '#064e3b',
          light: '#ffffff',
        },
      }).then(url => {
        setQrCodeDataUrl(url);
      }).catch(err => {
        console.error('Erro ao gerar QR Code:', err);
      });
    }
  }, [isOpen, pet.id, validationUrl]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadImage = async () => {
    if (!fichaRef.current) return;
    setBaixando(true);
    toast.info('Gerando guia digital de alta resolução...', { duration: 2500 });

    try {
      const canvas = await html2canvas(fichaRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false
      });

      const link = document.createElement('a');
      link.download = `Guia_Autorizacao_${pet.nome}_${numProtocolo}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast.success('Guia de autorização baixada com sucesso!');
    } catch (error) {
      console.error('Erro ao baixar guia:', error);
      toast.error('Erro ao gerar imagem da guia.');
    } finally {
      setBaixando(false);
    }
  };

  const dataFormatada = dataAgendada ? new Date(dataAgendada).toLocaleDateString('pt-BR') : 'Data a ser definida';
  const horaFormatada = dataAgendada ? new Date(dataAgendada).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '--:--';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Guia Oficial de Autorização e Encaminhamento"
      size="xl"
    >
      <div className="space-y-4">
        
        {/* BARRA SUPERIOR DE AÇÕES */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-200">
          <div className="text-xs text-emerald-900 font-medium">
            <span className="font-bold block">Apresentação Obrigatória no Atendimento:</span>
            Apresente este comprovante e a Carteirinha do Pet no celular ou impressos.
          </div>
          <div className="flex items-center gap-2">
            {onAbrirCarteirinha && (
              <Button 
                size="sm" 
                variant="outline" 
                onClick={onAbrirCarteirinha} 
                className="text-xs flex items-center gap-1.5 border-emerald-300 text-emerald-800 hover:bg-emerald-100"
              >
                <CreditCard size={14} /> Carteirinha do Pet
              </Button>
            )}
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handlePrint} 
              className="text-xs flex items-center gap-1.5"
            >
              <Printer size={14} /> Imprimir A4
            </Button>
            <Button 
              size="sm" 
              onClick={handleDownloadImage} 
              disabled={baixando}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs flex items-center gap-1.5"
            >
              <Download size={14} /> {baixando ? 'Salvando...' : 'Baixar no Celular'}
            </Button>
          </div>
        </div>

        {/* FICHA OFICIAL A4 PARA CAPTURA & IMPRESSÃO */}
        <div className="overflow-y-auto max-h-[70vh] p-2 bg-gray-100 rounded-xl flex justify-center">
          <div 
            ref={fichaRef}
            className="w-full max-w-[760px] bg-white p-8 sm:p-10 rounded-xl shadow-md border border-gray-300 text-gray-900 font-sans space-y-6 print:shadow-none print:border-none print:p-0 print:m-0"
          >
            {/* CABEÇALHO OFICIAL */}
            <div className="border-b-2 border-emerald-800 pb-4 flex justify-between items-start gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 rounded-lg bg-emerald-800 text-white flex items-center justify-center font-black text-sm">
                    PR
                  </div>
                  <div>
                    <h2 className="text-xs font-black tracking-widest text-emerald-950 uppercase">
                      PREFEITURA MUNICIPAL DE ARAPONGAS - PR
                    </h2>
                    <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                      Secretaria Municipal de Meio Ambiente • Gestão e Bem-Estar Animal
                    </p>
                  </div>
                </div>
                <h1 className="text-base font-black text-gray-900 mt-2 uppercase">
                  GUIA OFICIAL DE ENCAMINHAMENTO E AUTORIZAÇÃO
                </h1>
                <p className="text-xs text-gray-600">
                  {tipo === 'castracao' ? 'Procedimento Cirúrgico Eletivo de Esterilização (Castração Gratuita)' : 'Atendimento Clínico e Consulta Veterinária Municipal'}
                </p>
              </div>

              {/* QR CODE DE VALIDAÇÃO */}
              <div className="text-center shrink-0 border border-emerald-200 p-2 rounded-xl bg-emerald-50/50">
                {qrCodeDataUrl ? (
                  <img src={qrCodeDataUrl} alt="QR Code Oficial" className="w-20 h-20 mx-auto rounded" />
                ) : (
                  <div className="w-20 h-20 bg-gray-100 flex items-center justify-center text-[10px] text-gray-400">QR Code</div>
                )}
                <span className="text-[9px] font-bold text-emerald-900 block mt-1">Validação Oficial</span>
                <span className="text-[8px] text-gray-500 font-mono">{rgaCode}</span>
              </div>
            </div>

            {/* PROTOCOLO E DATA */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-gray-50 p-3 rounded-lg border border-gray-200 text-xs">
              <div>
                <span className="text-[10px] text-gray-500 font-bold uppercase block">Nº da Guia / Protocolo</span>
                <span className="font-extrabold text-emerald-900 font-mono">{numProtocolo}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-500 font-bold uppercase block">Data de Emissão</span>
                <span className="font-semibold">{new Date().toLocaleDateString('pt-BR')}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-500 font-bold uppercase block">RGA Oficial</span>
                <span className="font-bold text-gray-900 font-mono">{rgaCode}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-500 font-bold uppercase block">Status</span>
                <span className="font-bold text-emerald-700">AUTORIZADO</span>
              </div>
            </div>

            {/* SEÇÃO 1: DADOS DO ANIMAL */}
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-emerald-900 mb-2 flex items-center gap-1.5 border-b pb-1">
                <Dog size={14} className="text-emerald-700" /> 1. Identificação do Animal (Paciente)
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50/70 p-3 rounded-lg border border-gray-200">
                <div>
                  <span className="text-gray-500 block text-[10px] uppercase font-bold">Nome do Pet</span>
                  <span className="font-extrabold text-gray-900 text-sm">{pet.nome}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[10px] uppercase font-bold">Espécie / Raça</span>
                  <span className="font-semibold capitalize">{pet.especie === 'cao' ? 'Cão' : 'Gato'} • {pet.raca || 'SRD'}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[10px] uppercase font-bold">Sexo / Porte</span>
                  <span className="font-semibold capitalize">{pet.sexo || 'Não inf.'} • {pet.porte || 'Médio'}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[10px] uppercase font-bold">Microchip</span>
                  <span className="font-semibold">{pet.microchip || 'Não microchipado'}</span>
                </div>
              </div>
            </div>

            {/* SEÇÃO 2: DADOS DO TUTOR */}
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-emerald-900 mb-2 flex items-center gap-1.5 border-b pb-1">
                <ShieldCheck size={14} className="text-emerald-700" /> 2. Dados do Tutor / Responsável Legal
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50/70 p-3 rounded-lg border border-gray-200">
                <div>
                  <span className="text-gray-500 block text-[10px] uppercase font-bold">Nome Completo</span>
                  <span className="font-bold text-gray-900">{tutor.nome || 'Não informado'}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[10px] uppercase font-bold">CPF</span>
                  <span className="font-semibold">{tutor.cpf || 'Cadastrado no sistema'}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[10px] uppercase font-bold">Telefone de Contato</span>
                  <span className="font-semibold">{tutor.telefone || 'Não informado'}</span>
                </div>
              </div>
            </div>

            {/* SEÇÃO 3: LOCAL E DATA DO ATENDIMENTO */}
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-emerald-900 mb-2 flex items-center gap-1.5 border-b pb-1">
                <Building2 size={14} className="text-emerald-700" /> 3. Local e Horário do Atendimento
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-emerald-50/50 p-3.5 rounded-lg border border-emerald-200">
                <div>
                  <span className="text-emerald-800 block text-[10px] uppercase font-bold">Clínica Credenciada</span>
                  <span className="font-extrabold text-emerald-950 text-sm block">{clinicaNome || 'Clínica Municipal Conveniada'}</span>
                  {clinicaEndereco && <span className="text-[11px] text-gray-600 block mt-0.5">{clinicaEndereco}</span>}
                  {clinicaTelefone && <span className="text-[11px] text-gray-600 block">Tel: {clinicaTelefone}</span>}
                </div>
                <div>
                  <span className="text-emerald-800 block text-[10px] uppercase font-bold">Data da Cirurgia/Consulta</span>
                  <span className="font-extrabold text-gray-900 text-sm flex items-center gap-1 mt-0.5">
                    <Calendar size={14} className="text-emerald-600" /> {dataFormatada}
                  </span>
                </div>
                <div>
                  <span className="text-emerald-800 block text-[10px] uppercase font-bold">Horário de Chegada</span>
                  <span className="font-extrabold text-gray-900 text-sm flex items-center gap-1 mt-0.5">
                    <Clock size={14} className="text-emerald-600" /> {horaFormatada}
                  </span>
                  {tipo === 'castracao' && <span className="text-[10px] text-amber-700 font-bold block mt-1">Pontualidade exigida</span>}
                </div>
              </div>
            </div>

            {/* SEÇÃO 4: AVISOS E INSTRUÇÕES OBRIGATÓRIAS */}
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-300 space-y-2">
              <h4 className="text-xs font-black uppercase text-amber-950 flex items-center gap-1.5">
                <AlertTriangle size={15} className="text-amber-700" /> REQUISITOS E DOCUMENTOS OBRIGATÓRIOS
              </h4>
              <ul className="text-xs text-amber-900 space-y-1.5 list-disc pl-4 font-medium">
                <li>
                  <strong>Apresentação Obrigatória da Carteirinha Digital:</strong> É indispensável apresentar no balcão da clínica a <strong>Carteirinha Digital com QR Code</strong> (gerada no PetConecta BR) e esta guia assinada.
                </li>
                {tipo === 'castracao' ? (
                  <>
                    <li>
                      <strong>Jejum Absoluto de 8 Horas:</strong> O animal deve estar rigorosamente em jejum total de água e alimentos sólidos nas 8 horas que antecedem o procedimento cirúrgico. Animais alimentados <u>não serão operados</u> devido ao risco grave de broncoaspiração anestésica.
                    </li>
                    <li>
                      <strong>Segurança no Transporte:</strong> Cães devem comparecer com coleira e guia firmes (focinheira se necessário). Gatos devem ser transportados obrigatoriamente dentro de caixa de transporte fechada e segura.
                    </li>
                    <li>
                      <strong>Pós-Operatório:</strong> O tutor deve trazer uma manta, toalha ou cobertor limpo para aquecer o animal após o término da anestesia.
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      <strong>Documento Pessoal:</strong> Apresentar documento oficial de identificação com foto do tutor (RG ou CNH).
                    </li>
                    <li>
                      <strong>Histórico Clínico:</strong> Trazer receitas, exames anteriores ou medicamentos que o animal já esteja utilizando.
                    </li>
                  </>
                )}
              </ul>
            </div>

            {/* SEÇÃO 5: TERMO DE AUTORIZAÇÃO E ASSINATURAS */}
            <div className="pt-2 border-t border-gray-200 space-y-6">
              <p className="text-[11px] text-gray-600 text-justify leading-relaxed">
                Eu, tutor(a) e responsável legal identificado(a) acima, autorizo a realização do procedimento pelo corpo clínico da clínica credenciada municipal. Declaro estar ciente dos riscos anestésicos inerentes e comprometo-me a cumprir integralmente as orientações pré e pós-operatórias para o pleno restabelecimento da saúde do animal.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4">
                <div className="text-center">
                  <div className="border-b border-gray-800 pb-1 mb-1"></div>
                  <span className="text-xs font-bold text-gray-900 block">{tutor.nome || 'Assinatura do Tutor'}</span>
                  <span className="text-[10px] text-gray-500">Tutor / Responsável Legal</span>
                </div>

                <div className="text-center">
                  <div className="border-b border-gray-800 pb-1 mb-1"></div>
                  <span className="text-xs font-bold text-gray-900 block">Médico(a) Veterinário(a) / Clínica</span>
                  <span className="text-[10px] text-gray-500">Carimbo e CRMV-PR</span>
                </div>
              </div>
            </div>

            {/* RODAPÉ DO DOCUMENTO */}
            <div className="text-center pt-3 border-t border-gray-200 text-[10px] text-gray-400 font-mono">
              PetConecta BR • Autenticidade verificável através do QR Code Oficial no padrão RGA Paraná.
            </div>

          </div>
        </div>

      </div>
    </Modal>
  );
}
