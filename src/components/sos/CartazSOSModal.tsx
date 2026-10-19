import React, { useState, useEffect, useRef } from 'react';
import { 
  Printer, 
  Download, 
  Share2, 
  X, 
  Phone, 
  MapPin, 
  Calendar, 
  Sparkles, 
  Scissors, 
  AlertTriangle, 
  CheckCircle,
  HelpCircle,
  QrCode as QrCodeIcon,
  Copy
} from 'lucide-react';
import QRCode from 'qrcode';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';
import { AnimalSOS, buildTextoCompartilhamento } from '@/lib/sos';
import { Button } from '@/components/ui/Button';

interface CartazSOSModalProps {
  isOpen: boolean;
  onClose: () => void;
  animal: AnimalSOS | null;
}

export default function CartazSOSModal({ isOpen, onClose, animal }: CartazSOSModalProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [baixando, setBaixando] = useState(false);
  const cartazRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (animal) {
      const publicUrl = `${window.location.origin}/sos?id=${animal.id}`;
      QRCode.toDataURL(publicUrl, {
        width: 180,
        margin: 1,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        }
      })
        .then(url => setQrCodeUrl(url))
        .catch(err => console.error('Erro ao gerar QR Code do cartaz:', err));
    }
  }, [animal]);

  if (!isOpen || !animal) return null;

  const isPerdido = animal.tipo === 'perdido';

  const handleImprimir = () => {
    window.print();
  };

  const handleBaixarImagem = async () => {
    if (!cartazRef.current) return;
    setBaixando(true);
    toast.info('Renderizando cartaz A4 em alta qualidade...');
    try {
      const canvas = await html2canvas(cartazRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `cartaz-sos-${animal.nome.toLowerCase().replace(/\s+/g, '-')}.png`;
      a.click();
      toast.success('Cartaz baixado com sucesso!');
    } catch (e) {
      console.error('Erro ao baixar cartaz:', e);
      toast.error('Erro ao gerar imagem para download.');
    } finally {
      setBaixando(false);
    }
  };

  const handleCompartilharWhatsApp = () => {
    const texto = buildTextoCompartilhamento(animal);
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(texto)}`;
    window.open(url, '_blank');
  };

  const handleCopiarTexto = () => {
    const texto = buildTextoCompartilhamento(animal);
    navigator.clipboard.writeText(texto);
    toast.success('Texto copiado para a área de transferência!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/80 backdrop-blur-xs overflow-y-auto">
      {/* Botão de Fechar Rápido Flutuante */}
      <button 
        onClick={onClose}
        className="fixed top-4 right-4 z-50 p-2 bg-white/90 hover:bg-white text-slate-800 rounded-full shadow-lg transition-transform hover:scale-105"
        title="Fechar Cartaz"
      >
        <X className="w-6 h-6" />
      </button>

      <div className="relative w-full max-w-4xl bg-slate-100 rounded-2xl shadow-2xl flex flex-col my-auto border border-slate-300">
        
        {/* BARRA DE FERRAMENTAS SUPERIOR (NÃO IMPRESSA) */}
        <div className="p-4 bg-white border-b border-slate-200 rounded-t-2xl flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div>
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              {isPerdido ? (
                <>
                  <span className="w-3 h-3 rounded-full bg-red-600 animate-pulse" />
                  Cartaz Oficial A4 • Procura-se Pet
                </>
              ) : (
                <>
                  <span className="w-3 h-3 rounded-full bg-emerald-600" />
                  Cartaz Oficial A4 • Pet Encontrado / Resgatado
                </>
              )}
            </h2>
            <p className="text-xs text-slate-500">
              Pronto para colar em postes, comércios locais, veterinárias e compartilhar em grupos.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopiarTexto}
              className="gap-1.5 text-xs text-slate-700"
            >
              <Copy className="w-4 h-4" /> Copiar Texto
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleCompartilharWhatsApp}
              className="gap-1.5 text-xs text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-300"
            >
              <Share2 className="w-4 h-4 text-emerald-600" /> WhatsApp
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleBaixarImagem}
              disabled={baixando}
              className="gap-1.5 text-xs"
            >
              <Download className="w-4 h-4" /> Baixar PNG
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={handleImprimir}
              className={isPerdido ? 'bg-red-600 hover:bg-red-700 text-white gap-1.5 text-xs' : 'bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 text-xs'}
            >
              <Printer className="w-4 h-4" /> Imprimir A4
            </Button>
          </div>
        </div>

        {/* ÁREA DO CARTAZ (PREVIEW NA TELA E FOLHA OFICIAL PARA IMPRESSÃO) */}
        <div className="p-3 sm:p-6 overflow-x-auto flex justify-center bg-slate-200">
          
          <div 
            ref={cartazRef}
            id="cartaz-print-area"
            className="w-full max-w-[794px] min-h-[1123px] bg-white text-slate-900 p-6 sm:p-8 flex flex-col justify-between shadow-xl border-4 border-slate-900 rounded-sm relative box-border print:border-none print:shadow-none print:p-0 print:m-0"
            style={{ width: '100%', maxWidth: '794px' }}
          >
            {/* CABEÇALHO DE ALTO IMPACTO */}
            <div>
              <div className={`p-4 sm:p-6 text-center text-white rounded-xl ${isPerdido ? 'bg-red-600 border-4 border-red-800' : 'bg-emerald-700 border-4 border-emerald-900'}`}>
                <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-wider drop-shadow-md">
                  {isPerdido ? '🚨 PROCURA-SE DESESPERADAMENTE 🚨' : '🔍 PET ENCONTRADO / RESGATADO'}
                </h1>
                <p className="text-sm sm:text-xl font-bold uppercase tracking-widest mt-1 text-white/90">
                  {isPerdido ? 'POR FAVOR, ME AJUDE A VOLTAR PRA CASA!' : 'PROCURA-SE A FAMÍLIA DESTE ANIMAL!'}
                </p>
              </div>

              {/* FAIXA DE RECOMPENSA (SE HOUVER) */}
              {isPerdido && animal.recompensa && (
                <div className="mt-3 bg-amber-400 border-2 border-amber-600 p-2 sm:p-3 text-center rounded-lg shadow-xs">
                  <span className="text-lg sm:text-2xl font-black text-amber-950 uppercase tracking-wide flex items-center justify-center gap-2">
                    💰 RECOMPENSA OFERTADA: {animal.recompensa} 💰
                  </span>
                </div>
              )}

              {/* BLOCO CENTRAL: FOTO E IDENTIFICAÇÃO */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                
                {/* FOTO GRANDE DO ANIMAL */}
                <div className="md:col-span-6 flex justify-center">
                  <div className="w-full aspect-4/3 max-h-[340px] bg-slate-100 rounded-xl overflow-hidden border-4 border-slate-900 shadow-md flex items-center justify-center">
                    <img 
                      src={animal.foto_url} 
                      alt={animal.nome}
                      className="w-full h-full object-cover"
                      crossOrigin="anonymous"
                    />
                  </div>
                </div>

                {/* INFORMAÇÕES DESTAQUE */}
                <div className="md:col-span-6 space-y-3">
                  <div>
                    <span className="text-xs uppercase font-extrabold text-slate-500 tracking-wider">
                      Nome / Identificação:
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-black text-slate-900 uppercase tracking-tight">
                      {animal.nome}
                    </h2>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm font-semibold bg-slate-50 p-3 rounded-xl border border-slate-300">
                    <div>
                      <span className="text-slate-500 block text-[11px] uppercase">Espécie / Raça:</span>
                      <span className="text-slate-900 font-bold">{animal.especie === 'cachorro' ? 'Cão' : 'Gato'} • {animal.raca || 'SRD'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px] uppercase">Porte / Sexo:</span>
                      <span className="text-slate-900 font-bold capitalize">{animal.porte} • {animal.sexo}</span>
                    </div>
                    <div className="col-span-2 pt-1 border-t border-slate-200">
                      <span className="text-slate-500 block text-[11px] uppercase">Cor Predominante:</span>
                      <span className="text-slate-900 font-bold">{animal.cor}</span>
                    </div>
                  </div>

                  {/* LOCAL E DATA DO OCORRIDO */}
                  <div className="bg-red-50 border-2 border-red-200 p-3 rounded-xl text-xs sm:text-sm space-y-1">
                    <p className="font-bold text-red-900 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-red-600 flex-shrink-0" />
                      <strong>{isPerdido ? 'Visto pela última vez:' : 'Encontrado no Bairro:'}</strong> {animal.bairro} ({animal.cidade})
                    </p>
                    {animal.ponto_referencia && (
                      <p className="text-red-700 text-xs pl-5 font-medium">
                        Ref.: {animal.ponto_referencia}
                      </p>
                    )}
                    <p className="text-slate-700 font-medium flex items-center gap-1.5 pt-1 text-xs pl-5">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      Data: <strong>{new Date(animal.data_ocorrencia).toLocaleDateString('pt-BR')}</strong>
                    </p>
                  </div>
                </div>
              </div>

              {/* DESCRIÇÃO E COMPORTAMENTO */}
              {animal.descricao && (
                <div className="mt-4 p-3 bg-amber-50/70 border border-amber-300 rounded-xl text-xs sm:text-sm">
                  <p className="font-black text-amber-950 uppercase text-[11px] tracking-wider mb-0.5">
                    Características & Detalhes Importantes:
                  </p>
                  <p className="text-slate-800 leading-snug font-medium">
                    {animal.descricao}
                  </p>
                </div>
              )}

              {/* BLOCO DE CONTATO GIGANTE E QR CODE */}
              <div className="mt-4 p-4 bg-slate-900 text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 border-2 border-slate-950">
                <div className="text-center sm:text-left space-y-1">
                  <span className="text-xs uppercase font-extrabold tracking-widest text-amber-400 block">
                    SE VOCÊ VIU OU ESTÁ COM ELE, ENTRE EM CONTATO:
                  </span>
                  <div className="text-3xl sm:text-4xl font-black text-white tracking-wider flex items-center justify-center sm:justify-start gap-2">
                    <Phone className="w-7 h-7 text-emerald-400" />
                    {animal.contato_telefone}
                  </div>
                  <p className="text-xs text-slate-300 font-medium">
                    Falar com: <strong>{animal.contato_nome}</strong> (Ligações e WhatsApp)
                  </p>
                </div>

                {qrCodeUrl && (
                  <div className="bg-white p-2 rounded-xl flex flex-col items-center flex-shrink-0">
                    <img src={qrCodeUrl} alt="QR Code do Pet" className="w-20 h-20" />
                    <span className="text-[9px] font-black text-slate-800 uppercase tracking-tighter mt-1 text-center">
                      Escaneie o QR Code
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* PICOTES DESTACÁVEIS PARA POSTE / COMÉRCIO (TEAR-OFF TABS) */}
            <div className="mt-6 pt-4 border-t-2 border-dashed border-slate-400">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                <span className="flex items-center gap-1">
                  <Scissors className="w-3.5 h-3.5 text-slate-600" /> Corte nas linhas pontilhadas para tirar o telefone:
                </span>
                <span>PetConecta BR • Central SOS</span>
              </div>

              {/* GRID DE TIRINHAS VERTICAIS DESTACÁVEIS */}
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 border-t border-slate-300 pt-2">
                {[...Array(8)].map((_, i) => (
                  <div 
                    key={i} 
                    className="border-r border-dashed border-slate-400 px-1 py-1.5 flex flex-col items-center justify-center text-center bg-slate-50 rounded-xs last:border-r-0"
                  >
                    <span className="text-[10px] font-black text-slate-900 uppercase truncate w-full">
                      {animal.nome}
                    </span>
                    <span className="text-[9px] font-extrabold text-red-600 uppercase">
                      {isPerdido ? 'PROCURA-SE' : 'ENCONTRADO'}
                    </span>
                    <span className="text-[10px] font-black text-slate-950 mt-1 rotate-0 sm:-rotate-90 sm:my-3 select-all">
                      {animal.contato_telefone}
                    </span>
                    <span className="text-[8px] text-slate-500 truncate w-full">
                      {animal.contato_nome.split(' ')[0]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* RODAPÉ DO CARTAZ */}
            <div className="mt-3 text-center text-[10px] font-medium text-slate-400">
              PetConecta BR • Rede Municipal de Proteção e Resgate Animal de Arapongas - PR
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
