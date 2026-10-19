import React, { useRef, useState, useEffect } from 'react';
import { 
  Printer, 
  Download, 
  X, 
  Building2, 
  ShieldCheck, 
  Package, 
  User, 
  FileText,
  Calendar,
  CheckCircle2
} from 'lucide-react';
import QRCode from 'qrcode';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';
import { EntregaRacao, BeneficiarioRacao } from '@/lib/bancoRacao';
import { Button } from '@/components/ui/Button';

interface ReciboEntregaRacaoModalProps {
  isOpen: boolean;
  onClose: () => void;
  entrega: EntregaRacao | null;
  beneficiario?: BeneficiarioRacao | null;
}

export default function ReciboEntregaRacaoModal({
  isOpen,
  onClose,
  entrega,
  beneficiario
}: ReciboEntregaRacaoModalProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [baixando, setBaixando] = useState(false);
  const reciboRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (entrega) {
      QRCode.toDataURL(entrega.protocolo, {
        width: 140,
        margin: 1,
        color: { dark: '#0f172a', light: '#ffffff' }
      })
        .then(url => setQrCodeUrl(url))
        .catch(err => console.error('Erro ao gerar QR Code do recibo:', err));
    }
  }, [entrega]);

  if (!isOpen || !entrega) return null;

  const dataFormatada = new Date(entrega.data_entrega).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  const horaFormatada = new Date(entrega.data_entrega).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const handleImprimir = () => {
    window.print();
  };

  const handleBaixarImagem = async () => {
    if (!reciboRef.current) return;
    setBaixando(true);
    toast.info('Exportando recibo oficial em alta resolução...');
    try {
      const canvas = await html2canvas(reciboRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `recibo-racao-${entrega.protocolo}.png`;
      a.click();
      toast.success('Recibo baixado com sucesso!');
    } catch (e) {
      console.error('Erro ao baixar recibo:', e);
      toast.error('Erro ao exportar recibo.');
    } finally {
      setBaixando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-xs overflow-y-auto">
      {/* Botão de Fechar Rápido Flutuante */}
      <button 
        onClick={onClose}
        className="fixed top-4 right-4 z-50 p-2 bg-white/90 hover:bg-white text-slate-800 rounded-full shadow-lg transition-transform hover:scale-105"
        title="Fechar Recibo"
      >
        <X className="w-6 h-6" />
      </button>

      <div className="relative w-full max-w-4xl bg-slate-100 rounded-2xl shadow-2xl flex flex-col my-auto border border-slate-300">
        
        {/* BARRA SUPERIOR DE AÇÕES (NÃO IMPRESSA) */}
        <div className="p-4 bg-white border-b border-slate-200 rounded-t-2xl flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div>
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Package className="w-5 h-5 text-emerald-600" />
              Recibo Oficial de Fornecimento de Ração Municipal
            </h2>
            <p className="text-xs text-slate-500">
              Protocolo oficial de prestação de contas e controle de entrega do Programa Banco de Ração.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBaixarImagem}
              disabled={baixando}
              className="text-xs gap-1.5"
            >
              <Download className="w-4 h-4" /> Baixar Imagem
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={handleImprimir}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5 font-bold"
            >
              <Printer className="w-4 h-4" /> Imprimir Recibo A4
            </Button>
          </div>
        </div>

        {/* ÁREA DO RECIBO A4 (PADRÃO GOVERNO / TRIBUNAL DE CONTAS) */}
        <div className="p-4 sm:p-8 overflow-x-auto flex justify-center bg-slate-200">
          <div 
            ref={reciboRef}
            id="recibo-racao-print-area"
            className="w-full max-w-[794px] bg-white text-slate-900 p-8 sm:p-12 shadow-xl border border-slate-300 rounded-sm space-y-6 box-border print:border-none print:shadow-none print:p-0 print:m-0"
            style={{ width: '100%', maxWidth: '794px' }}
          >
            {/* CABEÇALHO OFICIAL */}
            <div className="border-b-2 border-slate-900 pb-5 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[11px] font-black uppercase tracking-widest text-emerald-700 block">
                  Estado do Paraná • Município de Arapongas
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 uppercase">
                  Secretaria Municipal de Meio Ambiente e Bem-Estar Animal
                </h1>
                <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                  Programa Municipal "Banco de Ração Solidário" • Lei Municipal de Apoio Animal
                </p>
              </div>

              {qrCodeUrl && (
                <div className="text-center flex-shrink-0">
                  <img src={qrCodeUrl} alt="QR Code Protocolo" className="w-20 h-20 border border-slate-300 p-1 rounded-sm mx-auto" />
                  <span className="text-[9px] font-mono font-bold text-slate-600 block mt-0.5">
                    {entrega.protocolo}
                  </span>
                </div>
              )}
            </div>

            {/* FAIXA DO PROTOCOLO E MÊS DE REFERÊNCIA */}
            <div className="bg-slate-50 border border-slate-300 p-3 rounded-lg flex flex-wrap items-center justify-between text-xs gap-2">
              <div>
                <span className="text-slate-500 font-bold uppercase text-[10px] block">Protocolo de Retirada:</span>
                <span className="font-mono font-black text-slate-900 text-sm">{entrega.protocolo}</span>
              </div>
              <div>
                <span className="text-slate-500 font-bold uppercase text-[10px] block">Mês de Competência:</span>
                <span className="font-bold text-slate-900 uppercase">{entrega.mes_referencia}</span>
              </div>
              <div>
                <span className="text-slate-500 font-bold uppercase text-[10px] block">Data e Hora da Entrega:</span>
                <span className="font-bold text-slate-900">{dataFormatada} às {horaFormatada}</span>
              </div>
            </div>

            {/* DADOS DO BENEFICIÁRIO */}
            <div className="border border-slate-300 rounded-lg p-4 space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
                <User className="w-4 h-4 text-emerald-600" />
                1. Identificação do Beneficiário / Tutor Responsável
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block text-[11px]">Nome Completo:</span>
                  <span className="font-black text-slate-900 text-sm uppercase">{entrega.beneficiario_nome}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">CPF:</span>
                  <span className="font-mono font-bold text-slate-900">{entrega.beneficiario_cpf}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Categoria de Atendimento:</span>
                  <span className="font-bold text-slate-800 uppercase">
                    {beneficiario?.tipo === 'protetor_independente' ? 'Protetor Independente (Lar Temporário)' : 'Família em Vulnerabilidade Social (CadÚnico)'}
                  </span>
                </div>
                {beneficiario?.nis_cadunico && (
                  <div>
                    <span className="text-slate-500 block text-[11px]">Número NIS / CadÚnico:</span>
                    <span className="font-mono font-bold text-slate-900">{beneficiario.nis_cadunico}</span>
                  </div>
                )}
                <div className="sm:col-span-2">
                  <span className="text-slate-500 block text-[11px]">Endereço / Bairro de Atendimento:</span>
                  <span className="font-semibold text-slate-800">
                    {beneficiario?.endereco ? `${beneficiario.endereco} - ` : ''}Bairro {entrega.beneficiario_bairro} • Arapongas - PR
                  </span>
                </div>
                {beneficiario && (
                  <div className="sm:col-span-2 pt-1 border-t border-slate-100 flex gap-4 text-slate-700">
                    <span>Animais sob tutela: <strong>{beneficiario.qtd_caes} Cães</strong></span>
                    <span>•</span>
                    <span><strong>{beneficiario.qtd_gatos} Gatos</strong></span>
                    <span>•</span>
                    <span>Cota Mensal Concedida: <strong>{beneficiario.cota_mensal_kg} KG</strong></span>
                  </div>
                )}
              </div>
            </div>

            {/* DISCRIMINAÇÃO DO FORNECIMENTO */}
            <div className="border border-slate-300 rounded-lg p-4 space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
                <Package className="w-4 h-4 text-emerald-600" />
                2. Discriminação da Ração Fornecida
              </h3>

              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-900 uppercase block">Especificação do Produto:</span>
                  <span className="text-base font-black text-slate-900">{entrega.tipo_racao}</span>
                  <p className="text-[11px] text-slate-600 mt-0.5">Alimento balanceado completo em embalagem fechada e lacrada pelo município.</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-900 uppercase block">Volume Entregue:</span>
                  <span className="text-3xl font-black text-emerald-700">{entrega.quantidade_kg} KG</span>
                </div>
              </div>

              {entrega.observacoes && (
                <p className="text-xs text-slate-600 italic">
                  <strong>Observações registradas:</strong> {entrega.observacoes}
                </p>
              )}
            </div>

            {/* TERMO DE COMPROMISSO E DECLARAÇÃO LEGAL */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-[11px] text-slate-700 space-y-2 leading-relaxed">
              <h4 className="font-black text-slate-900 uppercase text-[11px]">
                3. Termo de Compromisso e Responsabilidade do Beneficiário
              </h4>
              <p>
                1. Declaro sob as penas da lei que os insumos acima discriminados destinam-se <strong>exclusivamente à alimentação e nutrição dos animais cadastrados sob minha guarda e tutela</strong>.
              </p>
              <p>
                2. É <strong>expressamente proibida</strong> a comercialização, venda, cessão, troca ou desvio de finalidade de qualquer quantidade da ração fornecida pelo Município de Arapongas, sob pena de exclusão irrevogável do programa e instauração de processo administrativo/judicial.
              </p>
              <p>
                3. Comprometo-me a manter os animais em condições adequadas de higiene, abrigo, água limpa e assistência veterinária, franqueando o acesso de fiscais ambientais municipais quando solicitado.
              </p>
            </div>

            {/* ASSINATURAS */}
            <div className="pt-8 grid grid-cols-1 sm:grid-cols-2 gap-8 text-center text-xs">
              <div className="space-y-1">
                <div className="border-b-2 border-slate-800 pb-1 mb-1 w-full max-w-xs mx-auto" />
                <p className="font-black text-slate-900 uppercase">{entrega.beneficiario_nome}</p>
                <p className="text-[10px] text-slate-500 font-medium">Assinatura do Beneficiário / Recebedor</p>
                <p className="text-[9px] font-mono text-slate-400">CPF: {entrega.beneficiario_cpf}</p>
              </div>

              <div className="space-y-1">
                <div className="border-b-2 border-slate-800 pb-1 mb-1 w-full max-w-xs mx-auto" />
                <p className="font-black text-slate-900 uppercase">{entrega.responsavel_entrega}</p>
                <p className="text-[10px] text-slate-500 font-medium">Servidor Responsável pela Entrega / Carimbo</p>
                <p className="text-[9px] text-slate-400">Secretaria Municipal de Meio Ambiente</p>
              </div>
            </div>

            {/* RODAPÉ AUDITÁVEL */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-[9px] text-slate-400 font-mono">
              <span>PetConecta BR • Módulo Banco de Ração Municipal</span>
              <span>Documento emitido eletronicamente em {new Date().toLocaleString('pt-BR')}</span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
