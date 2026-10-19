import React, { useRef, useState, useEffect } from 'react';
import { 
  FileText, 
  Printer, 
  Download, 
  ShieldCheck, 
  Stethoscope, 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  Building2, 
  Dog, 
  Cat, 
  AlertCircle,
  Pill,
  HeartPulse
} from 'lucide-react';
import QRCode from 'qrcode';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

export interface ReceitaAltaProps {
  isOpen: boolean;
  onClose: () => void;
  clinica: {
    nome: string;
    cnpj?: string;
    endereco?: string;
    telefone?: string;
    crmv?: string;
    veterinario_responsavel?: string;
  };
  pet: {
    id: string;
    nome: string;
    especie: string;
    raca?: string;
    sexo?: string;
    porte?: string;
    rga?: string;
    microchip?: string | null;
  };
  tutor: {
    nome: string;
    cpf?: string;
    telefone?: string;
    endereco?: string;
  };
  atendimento: {
    tipo: 'castracao' | 'consulta';
    dataAtendimento: string;
    veterinarioNome: string;
    veterinarioCrmv: string;
    pesoAferido?: string | number;
    temperatura?: string | number;
    anestesia?: string;
    procedimento?: string;
    prescricao: string;
    orientacoes: string;
    retornoPontos?: string;
  };
}

export default function ReceitaAltaModal({
  isOpen,
  onClose,
  clinica,
  pet,
  tutor,
  atendimento
}: ReceitaAltaProps) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [isExporting, setIsExporting] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const rgaFormatado = pet.rga || `PR-ARA-2026-${pet.id.replace(/-/g, '').slice(0, 5).toUpperCase()}`;
  const validationUrl = `${window.location.origin}/validar/pet/${pet.id}`;

  useEffect(() => {
    if (isOpen && pet.id) {
      QRCode.toDataURL(validationUrl, {
        width: 130,
        margin: 1,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        }
      })
        .then(url => setQrCodeDataUrl(url))
        .catch(err => console.error('Erro ao gerar QR Code de alta:', err));
    }
  }, [isOpen, pet.id, validationUrl]);

  const handleImprimir = () => {
    window.print();
  };

  const handleDownloadImagem = async () => {
    if (!printRef.current) return;
    try {
      setIsExporting(true);
      toast.info('Gerando Termo de Alta em alta resolução...');

      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false
      });

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `Termo-Alta-${pet.nome.replace(/\s+/g, '_')}-${rgaFormatado}.png`;
      link.href = dataUrl;
      link.click();

      toast.success('Termo de Alta baixado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar imagem:', error);
      toast.error('Erro ao baixar termo. Tente utilizar a opção Imprimir.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Termo de Alta Médica e Prescrição Pós-Operatória"
      size="xl"
    >
      <div className="space-y-4">
        {/* Barra de Ações do Topo */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Documento oficial com validade clínica e carimbo veterinário.</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadImagem}
              disabled={isExporting}
              className="text-xs flex items-center gap-1.5 border-slate-300 hover:bg-slate-100"
            >
              <Download size={14} className="text-slate-600" />
              <span>{isExporting ? 'Processando...' : 'Salvar Imagem'}</span>
            </Button>

            <Button
              size="sm"
              onClick={handleImprimir}
              className="text-xs flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Printer size={14} />
              <span>Imprimir Receituário (A4)</span>
            </Button>
          </div>
        </div>

        {/* ÁREA IMPRIMÍVEL DO DOCUMENTO OFICIAL A4 */}
        <div className="max-h-[72vh] overflow-y-auto p-1 border rounded-xl bg-slate-100">
          <div 
            ref={printRef}
            className="bg-white p-6 sm:p-8 rounded-lg shadow-sm border border-slate-200 max-w-3xl mx-auto text-slate-800 font-sans space-y-6 print:p-0 print:border-none print:shadow-none"
          >
            {/* CABEÇALHO INSTITUCIONAL */}
            <div className="border-b-2 border-emerald-600 pb-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center border border-emerald-200 text-emerald-700 font-black text-xl shrink-0">
                  <Stethoscope className="w-8 h-8 text-emerald-600" />
                </div>
                <div>
                  <h1 className="text-base font-extrabold text-slate-900 tracking-tight leading-tight">
                    PREFEITURA MUNICIPAL DE ARAPONGAS
                  </h1>
                  <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">
                    Secretaria Municipal de Meio Ambiente e Bem-Estar Animal
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Programa Municipal Permanente de Controle Populacional e Castração Gratuita
                  </p>
                </div>
              </div>

              {/* QR Code de Autenticidade */}
              <div className="flex flex-col items-center shrink-0">
                {qrCodeDataUrl ? (
                  <img 
                    src={qrCodeDataUrl} 
                    alt="QR Code de Validação do Pet" 
                    className="w-20 h-20 border rounded-lg p-0.5 bg-white shadow-2xs" 
                  />
                ) : (
                  <div className="w-20 h-20 bg-slate-100 animate-pulse rounded-lg" />
                )}
                <span className="text-[9px] font-bold text-slate-500 uppercase mt-0.5 tracking-wider">
                  Validação Online
                </span>
              </div>
            </div>

            {/* TÍTULO DO DOCUMENTO */}
            <div className="text-center py-2 bg-emerald-50/70 border border-emerald-200 rounded-xl">
              <h2 className="text-sm font-extrabold text-emerald-950 uppercase tracking-wider">
                DECLARAÇÃO DE ALTA MÉDICA E PRESCRIÇÃO PÓS-OPERATÓRIA
              </h2>
              <p className="text-xs text-emerald-800 font-medium">
                Procedimento: {atendimento.procedimento || (atendimento.tipo === 'castracao' ? 'Castração Cirúrgica Municipal (Esterilização Reprodutiva)' : 'Consulta Clínica Veterinária')}
              </p>
            </div>

            {/* DADOS DA CLÍNICA & MÉDICO RESPONSÁVEL */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="font-bold text-slate-500 uppercase text-[10px] block">Clínica Executante Credenciada</span>
                <span className="font-extrabold text-slate-900 text-sm block">{clinica.nome}</span>
                {clinica.cnpj && <span className="text-slate-500 block">CNPJ: {clinica.cnpj}</span>}
                {clinica.endereco && <span className="text-slate-600 block">{clinica.endereco}</span>}
                {clinica.telefone && <span className="text-slate-600 block">Tel/Plantão: {clinica.telefone}</span>}
              </div>

              <div>
                <span className="font-bold text-slate-500 uppercase text-[10px] block">Médico Veterinário Responsável</span>
                <span className="font-extrabold text-slate-900 text-sm block">{atendimento.veterinarioNome || clinica.veterinario_responsavel || 'Médico Veterinário'}</span>
                <span className="text-emerald-700 font-bold block">CRMV/PR: {atendimento.veterinarioCrmv || clinica.crmv || 'Ativo'}</span>
                <span className="text-slate-500 block">Data do Procedimento: {new Date(atendimento.dataAtendimento).toLocaleDateString('pt-BR')}</span>
              </div>
            </div>

            {/* IDENTIFICAÇÃO DO PACIENTE & TUTOR */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs border border-slate-200 rounded-xl p-4">
              {/* Paciente */}
              <div className="space-y-1.5 border-b sm:border-b-0 sm:border-r border-slate-200 pb-3 sm:pb-0 sm:pr-4">
                <div className="flex items-center gap-1.5 font-bold text-emerald-800 uppercase text-[11px]">
                  {pet.especie === 'gato' ? <Cat size={14} /> : <Dog size={14} />}
                  <span>Dados do Paciente</span>
                </div>
                <div><span className="font-semibold text-slate-600">Nome:</span> <span className="font-black text-slate-900">{pet.nome}</span></div>
                <div><span className="font-semibold text-slate-600">RGA Municipal:</span> <span className="font-mono font-bold text-emerald-700">{rgaFormatado}</span></div>
                <div><span className="font-semibold text-slate-600">Espécie / Raça:</span> <span className="capitalize">{pet.especie}</span> • {pet.raca || 'SRD'}</div>
                <div><span className="font-semibold text-slate-600">Sexo / Porte:</span> <span className="capitalize">{pet.sexo || 'Não informado'}</span> • {pet.porte || 'Médio'}</div>
                {atendimento.pesoAferido && (
                  <div><span className="font-semibold text-slate-600">Peso Aferido:</span> <span className="font-bold text-slate-900">{atendimento.pesoAferido} kg</span></div>
                )}
                {atendimento.anestesia && (
                  <div><span className="font-semibold text-slate-600">Protocolo Anestésico:</span> {atendimento.anestesia}</div>
                )}
              </div>

              {/* Tutor */}
              <div className="space-y-1.5">
                <div className="font-bold text-emerald-800 uppercase text-[11px]">Dados do Tutor / Responsável</div>
                <div><span className="font-semibold text-slate-600">Nome:</span> <span className="font-bold text-slate-900">{tutor.nome}</span></div>
                {tutor.cpf && <div><span className="font-semibold text-slate-600">CPF:</span> {tutor.cpf}</div>}
                {tutor.telefone && <div><span className="font-semibold text-slate-600">Telefone:</span> {tutor.telefone}</div>}
                {tutor.endereco && <div><span className="font-semibold text-slate-600">Endereço:</span> {tutor.endereco}</div>}
                <div><span className="font-semibold text-slate-600">Município:</span> Arapongas - PR</div>
              </div>
            </div>

            {/* PRESCRIÇÃO MÉDICA / MEDICAMENTOS */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-900 uppercase">
                <Pill className="w-4 h-4 text-emerald-600" />
                <span>Prescrição Farmacológica e Posologia</span>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs whitespace-pre-line text-slate-800 font-mono leading-relaxed">
                {atendimento.prescricao || 'Nenhum medicamento específico cadastrado. Seguir orientações verbais do cirurgião.'}
              </div>
            </div>

            {/* CUIDADOS PÓS-OPERATÓRIOS E ORIENTAÇÕES */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-900 uppercase">
                <HeartPulse className="w-4 h-4 text-emerald-600" />
                <span>Cuidados Pós-Operatórios Obrigatórios ao Tutor</span>
              </div>
              <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 text-xs space-y-2 text-slate-800">
                <ul className="list-disc pl-4 space-y-1 text-slate-700">
                  <li><strong>Repouso absoluto por 7 a 10 dias:</strong> o animal não deve pular em sofás, camas, correr ou subir escadas.</li>
                  <li><strong>Uso obrigatório de colar elizabetano ou roupa cirúrgica:</strong> o paciente JAMAIS deve lamber, coçar ou morder a sutura cirúrgica.</li>
                  <li><strong>Higienização da incisão:</strong> limpar a ferida 2 vezes ao dia com gaze embebida em soro fisiológico ou antisséptico prescrito.</li>
                  <li><strong>Alimentação:</strong> retornar a água e comida de forma gradativa, em pequenas porções após cessar o efeito anestésico.</li>
                  {atendimento.retornoPontos && (
                    <li className="font-bold text-amber-950">
                      📅 Retorno para avaliação / retirada de pontos: {atendimento.retornoPontos}.
                    </li>
                  )}
                </ul>

                {atendimento.orientacoes && (
                  <div className="pt-2 border-t border-amber-200 font-medium text-slate-800">
                    <strong>Observações Adicionais:</strong> {atendimento.orientacoes}
                  </div>
                )}
              </div>
            </div>

            {/* LINHAS DE ASSINATURA */}
            <div className="pt-6 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-8 text-center text-xs">
              <div>
                <div className="border-b border-slate-400 pb-1 mb-1">
                  <span className="font-bold text-slate-900 block">{atendimento.veterinarioNome || 'Médico Veterinário'}</span>
                  <span className="text-[11px] text-emerald-700 font-semibold block">CRMV/PR: {atendimento.veterinarioCrmv || 'Ativo'}</span>
                </div>
                <span className="text-[10px] text-slate-500 uppercase">Carimbo e Assinatura do Médico Veterinário</span>
              </div>

              <div>
                <div className="border-b border-slate-400 pb-1 mb-1">
                  <span className="font-bold text-slate-900 block">{tutor.nome}</span>
                  <span className="text-[11px] text-slate-500 block">CPF: {tutor.cpf || 'Documento apresentado'}</span>
                </div>
                <span className="text-[10px] text-slate-500 uppercase">Assinatura do Tutor / Declaração de Recebimento da Alta</span>
              </div>
            </div>

            {/* RODAPÉ */}
            <div className="text-center pt-2 text-[10px] text-slate-400 border-t">
              Documento gerado eletronicamente pelo Sistema PetConecta BR • Município de Arapongas / PR • Autenticidade verificável via QR Code
            </div>
          </div>
        </div>

        {/* Rodapé do Modal */}
        <div className="flex justify-end gap-2 pt-2 border-t">
          <Button variant="outline" size="sm" onClick={onClose}>
            Fechar
          </Button>
          <Button 
            size="sm" 
            onClick={handleImprimir}
            className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5"
          >
            <Printer size={14} /> Imprimir Termo
          </Button>
        </div>
      </div>
    </Modal>
  );
}
