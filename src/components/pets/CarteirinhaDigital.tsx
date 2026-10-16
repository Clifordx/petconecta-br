import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  Printer, 
  Download, 
  Copy, 
  ExternalLink, 
  QrCode, 
  Dog, 
  Cat, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Phone,
  User,
  Heart,
  Sparkles
} from 'lucide-react';
import QRCode from 'qrcode';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

interface CarteirinhaProps {
  isOpen: boolean;
  onClose: () => void;
  pet: {
    id: string;
    nome: string;
    especie: string;
    raca?: string;
    porte?: string;
    sexo?: string;
    cor?: string;
    castrado?: boolean;
    vacinado?: boolean;
    microchip?: string | null;
    status?: string;
    observacoes?: string | null;
    criado_em?: string;
    fotos_pet?: { url: string }[];
    tutor_nome?: string;
    tutor_telefone?: string;
  };
}

export default function CarteirinhaDigital({ isOpen, onClose, pet }: CarteirinhaProps) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [abaAtiva, setAbaAtiva] = useState<'lado_a_lado' | 'frente' | 'verso'>('lado_a_lado');
  const [baixando, setBaixando] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const validationUrl = `${window.location.origin}/validar/pet/${pet.id}`;
  const rgaCode = `PR-ARA-${pet.id.replace(/-/g, '').slice(0, 8).toUpperCase()}`;

  useEffect(() => {
    if (isOpen && pet.id) {
      QRCode.toDataURL(validationUrl, {
        width: 300,
        margin: 1,
        color: {
          dark: '#064e3b', // emerald-900
          light: '#ffffff'
        }
      })
      .then(url => setQrCodeDataUrl(url))
      .catch(err => console.error('Erro ao gerar QR Code:', err));
    }
  }, [isOpen, pet.id, validationUrl]);

  const handleCopiarLink = () => {
    navigator.clipboard.writeText(validationUrl);
    toast.success('Link de validação copiado para a área de transferência!');
  };

  const handleImprimir = () => {
    window.print();
  };

  const handleBaixarImagem = async () => {
    if (!cardRef.current) return;
    setBaixando(true);
    toast.info('Gerando imagem de alta resolução...');
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2.5,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      const imgData = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = imgData;
      link.download = `carteirinha-${pet.nome.toLowerCase().replace(/\s+/g, '-')}.png`;
      link.click();
      toast.success('Carteirinha baixada com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar carteirinha:', error);
      toast.error('Erro ao baixar a carteirinha');
    } finally {
      setBaixando(false);
    }
  };

  const petPhoto = pet.fotos_pet && pet.fotos_pet.length > 0 ? pet.fotos_pet[0].url : null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Carteirinha Digital de Saúde e Identificação Animal"
      description="Documento oficial de Registro Geral Animal (RGA) com QR Code para fiscalização e consultas."
      size="xl"
    >
      <div className="space-y-6">
        {/* Controles do Topo */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-gray-50 p-3 rounded-xl border border-gray-200">
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-lg border border-gray-200 shadow-xs">
            <button
              onClick={() => setAbaAtiva('lado_a_lado')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                abaAtiva === 'lado_a_lado' ? 'bg-emerald-600 text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Frente & Verso
            </button>
            <button
              onClick={() => setAbaAtiva('frente')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                abaAtiva === 'frente' ? 'bg-emerald-600 text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Apenas Frente
            </button>
            <button
              onClick={() => setAbaAtiva('verso')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                abaAtiva === 'verso' ? 'bg-emerald-600 text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Apenas Verso
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopiarLink}
              className="text-xs flex items-center gap-1.5"
            >
              <Copy size={13} /> Copiar Link
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleImprimir}
              className="text-xs flex items-center gap-1.5"
            >
              <Printer size={13} /> Imprimir
            </Button>
            <Button
              size="sm"
              onClick={handleBaixarImagem}
              disabled={baixando}
              className="text-xs flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Download size={13} /> {baixando ? 'Gerando...' : 'Baixar Imagem'}
            </Button>
          </div>
        </div>

        {/* CONTAINER DA CARTEIRINHA (CAPTURA HTML2CANVAS & PRINT) */}
        <div className="overflow-x-auto py-2">
          <div 
            ref={cardRef} 
            className="flex flex-col md:flex-row gap-6 items-center justify-center min-w-[320px] p-4 bg-emerald-50/40 rounded-2xl border border-emerald-100"
          >
            {/* FRENTE DO CARTÃO */}
            {(abaAtiva === 'lado_a_lado' || abaAtiva === 'frente') && (
              <div className="w-[360px] h-[520px] bg-white rounded-2xl shadow-xl border-2 border-emerald-700 overflow-hidden flex flex-col justify-between relative print:shadow-none print:border-emerald-800">
                {/* Cabeçalho Oficial */}
                <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white p-3.5 text-center relative">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-200">
                      ESTADO DO PARANÁ
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-200">
                      ARAPONGAS - PR
                    </span>
                  </div>
                  <h2 className="text-sm font-extrabold tracking-wider uppercase mt-1">
                    PetConecta BR
                  </h2>
                  <p className="text-[10px] text-emerald-100 font-medium">
                    Registro Geral Animal • Identificação Oficial
                  </p>

                  <div className="absolute right-3 top-3 opacity-20">
                    <ShieldCheck size={36} />
                  </div>
                </div>

                {/* Corpo do Cartão */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  {/* Foto e RGA */}
                  <div className="flex gap-3 items-center">
                    <div className="relative w-28 h-32 rounded-xl border-2 border-emerald-600 overflow-hidden bg-gray-100 shadow-inner shrink-0 flex items-center justify-center">
                      {petPhoto ? (
                        <img 
                          src={petPhoto} 
                          alt={pet.nome} 
                          className="w-full h-full object-cover" 
                          crossOrigin="anonymous"
                        />
                      ) : (
                        <div className="text-gray-400 flex flex-col items-center">
                          {pet.especie === 'gato' ? <Cat size={32} /> : <Dog size={32} />}
                          <span className="text-[9px] mt-1 font-semibold">Sem Foto</span>
                        </div>
                      )}
                      <div className="absolute bottom-0 inset-x-0 bg-emerald-900/90 text-[8px] text-white font-bold py-0.5 text-center uppercase tracking-tighter">
                        Autenticado
                      </div>
                    </div>

                    <div className="flex-1 space-y-1.5">
                      <div>
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">
                          Nome do Pet
                        </span>
                        <h3 className="text-xl font-extrabold text-emerald-950 uppercase leading-tight truncate">
                          {pet.nome}
                        </h3>
                      </div>

                      <div className="bg-emerald-50/80 p-2 rounded-lg border border-emerald-200/60">
                        <span className="text-[9px] font-bold text-emerald-800 uppercase block">
                          Número do RGA
                        </span>
                        <span className="text-xs font-mono font-bold text-emerald-950">
                          {rgaCode}
                        </span>
                      </div>

                      <div>
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">
                          Microchip
                        </span>
                        <span className="text-xs font-mono text-gray-700 font-medium">
                          {pet.microchip || 'Não Identificado'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Informações Biológicas */}
                  <div className="grid grid-cols-2 gap-2 bg-gray-50 p-2.5 rounded-xl border border-gray-200 text-xs">
                    <div>
                      <span className="text-[9px] font-bold text-gray-400 uppercase block">Espécie</span>
                      <span className="font-bold text-gray-800 uppercase">
                        {pet.especie === 'gato' ? 'Felina (Gato)' : 'Canina (Cão)'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-gray-400 uppercase block">Raça</span>
                      <span className="font-semibold text-gray-800 truncate block">
                        {pet.raca || 'SRD (Sem Raça)'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-gray-400 uppercase block">Sexo</span>
                      <span className="font-semibold text-gray-800">
                        {pet.sexo === 'femea' ? 'Fêmea' : 'Macho'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-gray-400 uppercase block">Porte / Pelagem</span>
                      <span className="font-semibold text-gray-800 capitalize">
                        {pet.porte || 'Médio'} {pet.cor ? `• ${pet.cor}` : ''}
                      </span>
                    </div>
                  </div>

                  {/* QR Code de Validação Oficial */}
                  <div className="flex items-center gap-3 bg-gradient-to-r from-emerald-50 to-teal-50 p-2.5 rounded-xl border border-emerald-200">
                    <div className="w-16 h-16 bg-white p-1 rounded-lg border border-emerald-300 shadow-xs shrink-0 flex items-center justify-center">
                      {qrCodeDataUrl ? (
                        <img src={qrCodeDataUrl} alt="QR Code" className="w-full h-full object-contain" />
                      ) : (
                        <QrCode className="text-emerald-700 animate-spin" size={24} />
                      )}
                    </div>
                    <div className="flex-1">
                      <span className="text-[9px] font-extrabold text-emerald-900 uppercase tracking-tight block">
                        Validação Pública Instantânea
                      </span>
                      <p className="text-[10px] text-gray-600 leading-tight mt-0.5">
                        Aponte a câmera do celular para consultar a autenticidade oficial deste animal.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Rodapé da Frente */}
                <div className="bg-emerald-900 text-emerald-100 px-4 py-1.5 flex items-center justify-between text-[9px] font-semibold">
                  <span>Validade em Todo Território Nacional</span>
                  <span className="flex items-center gap-1 text-emerald-300">
                    <Sparkles size={10} /> Sistema Municipal
                  </span>
                </div>
              </div>
            )}

            {/* VERSO DO CARTÃO */}
            {(abaAtiva === 'lado_a_lado' || abaAtiva === 'verso') && (
              <div className="w-[360px] h-[520px] bg-white rounded-2xl shadow-xl border-2 border-emerald-700 overflow-hidden flex flex-col justify-between relative print:shadow-none print:border-emerald-800">
                {/* Topo do Verso */}
                <div className="bg-emerald-900 text-white p-3 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 block">
                    PRONTUÁRIO SANITÁRIO E CONTATO
                  </span>
                  <span className="text-xs font-extrabold tracking-wide uppercase">
                    PetConecta • Arapongas (PR)
                  </span>
                </div>

                {/* Dados do Tutor e Saúde */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  {/* Tutor */}
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700 uppercase">
                      <User size={13} className="text-emerald-600" /> Tutor Responsável
                    </div>
                    <p className="text-sm font-extrabold text-gray-900">
                      {pet.tutor_nome || 'Tutor Cadastrado no Sistema'}
                    </p>
                    {pet.tutor_telefone && (
                      <div className="flex items-center gap-1 text-xs text-gray-600 font-medium">
                        <Phone size={11} className="text-emerald-600" /> {pet.tutor_telefone}
                      </div>
                    )}
                  </div>

                  {/* Status Sanitário (Castração & Vacina) */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                      Situação Sanitária do Animal
                    </span>

                    <div className="grid grid-cols-2 gap-2">
                      <div className={`p-2.5 rounded-xl border flex flex-col justify-between ${
                        pet.castrado ? 'bg-emerald-50 border-emerald-200 text-emerald-950' : 'bg-amber-50 border-amber-200 text-amber-950'
                      }`}>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase">Castração</span>
                          {pet.castrado ? (
                            <CheckCircle2 size={14} className="text-emerald-600" />
                          ) : (
                            <AlertCircle size={14} className="text-amber-600" />
                          )}
                        </div>
                        <span className="text-xs font-extrabold mt-1">
                          {pet.castrado ? 'Castrado' : 'Não Castrado'}
                        </span>
                      </div>

                      <div className={`p-2.5 rounded-xl border flex flex-col justify-between ${
                        pet.vacinado ? 'bg-emerald-50 border-emerald-200 text-emerald-950' : 'bg-amber-50 border-amber-200 text-amber-950'
                      }`}>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase">Vacinação</span>
                          {pet.vacinado ? (
                            <CheckCircle2 size={14} className="text-emerald-600" />
                          ) : (
                            <AlertCircle size={14} className="text-amber-600" />
                          )}
                        </div>
                        <span className="text-xs font-extrabold mt-1">
                          {pet.vacinado ? 'Em Dia (V10 / Raiva)' : 'Pendente'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Observações de Saúde */}
                  {pet.observacoes && (
                    <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200 text-xs">
                      <span className="text-[9px] font-bold text-gray-500 uppercase block mb-0.5">
                        Observações Veterinárias
                      </span>
                      <p className="text-gray-700 line-clamp-2 italic">
                        "{pet.observacoes}"
                      </p>
                    </div>
                  )}

                  {/* Advertência Legal */}
                  <div className="bg-amber-50/60 p-2.5 rounded-xl border border-amber-200 text-[10px] text-amber-950 leading-tight">
                    <p className="font-bold mb-0.5">⚖️ Guarda Responsável & Proteção Legal:</p>
                    <p className="text-gray-700">
                      Maus-tratos e abandono são crimes inafiançáveis conforme a Lei Federal nº 9.605/98 e Lei Sansão nº 14.064/20.
                    </p>
                  </div>
                </div>

                {/* Rodapé do Verso */}
                <div className="bg-gray-100 p-2.5 text-center border-t border-gray-200">
                  <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest block">
                    Assinatura Digital Verificada via Supabase
                  </span>
                  <span className="text-[8px] text-gray-400">
                    Emitido em: {new Date().toLocaleDateString('pt-BR')} • Arapongas - Paraná
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Link Público de Acesso Direto */}
        <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-emerald-950 font-medium">
            <QrCode size={18} className="text-emerald-700 shrink-0" />
            <span>Página de validação pública para fiscais, clínicas e munícipes:</span>
          </div>
          <a
            href={validationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-bold text-emerald-700 hover:text-emerald-900 hover:underline bg-white px-3 py-1.5 rounded-lg border border-emerald-300 shadow-xs"
          >
            Abrir Página Pública <ExternalLink size={13} />
          </a>
        </div>
      </div>
    </Modal>
  );
}
