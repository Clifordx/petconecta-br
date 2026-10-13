import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Search, ShieldAlert, CheckCircle2, Clock, AlertTriangle, ArrowLeft, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';

export default function AcompanharDenuncia() {
  const [searchParams] = useSearchParams();
  const [protocol, setProtocol] = useState('');
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [denuncia, setDenuncia] = useState<any>(null);

  useEffect(() => {
    const protoParam = searchParams.get('protocolo');
    if (protoParam) {
      setProtocol(protoParam);
      buscarDenuncia(protoParam);
    }
  }, [searchParams]);

  const buscarDenuncia = async (codigo: string) => {
    const codLimpo = codigo.trim().toUpperCase();
    if (!codLimpo) {
      toast.error('Informe o número do protocolo');
      return;
    }

    setLoading(true);
    setSearched(true);
    try {
      const { data, error } = await supabase
        .from('denuncias')
        .select('protocolo, tipo, urgencia, status, criado_em, atualizado_em, bairro, endereco')
        .ilike('protocolo', codLimpo)
        .maybeSingle();

      if (error) throw error;
      setDenuncia(data);
      if (!data) {
        toast.error('Nenhuma denúncia encontrada para este protocolo.');
      }
    } catch (error) {
      console.error('Erro ao buscar protocolo:', error);
      toast.error('Erro ao buscar o protocolo. Verifique o código e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    buscarDenuncia(protocol);
  };

  // Mapeamento de progresso da linha do tempo
  const getTimelineSteps = (status: string) => {
    const steps = [
      { key: 'recebida', label: 'Denúncia Recebida', desc: 'Registrada no sistema e aguardando triagem.' },
      { key: 'em_analise', label: 'Em Análise', desc: 'Avaliada pela equipe técnica e classificada.' },
      { key: 'em_investigacao', label: 'Em Investigação / Vistoria', desc: 'Equipe de fiscalização em ação no local.' },
      { key: 'resolvida', label: 'Concluída / Resolvida', desc: 'Ocorrência atendida e procedimentos finalizados.' },
    ];

    const order = ['recebida', 'em_analise', 'em_investigacao', 'encaminhada', 'resolvida'];
    const currentIndex = order.indexOf(status);

    return steps.map((step, idx) => {
      const stepIndex = order.indexOf(step.key);
      const isPast = currentIndex >= stepIndex;
      const isCurrent = currentIndex === stepIndex || (status === 'encaminhada' && step.key === 'em_investigacao');
      return { ...step, isPast, isCurrent };
    });
  };

  const formatTipo = (tipo: string) => {
    const tiposMap: Record<string, string> = {
      abandono: 'Abandono em via pública',
      agressao: 'Agressão física / Violência',
      negligencia: 'Negligência (Sem água/comida)',
      acorrentado: 'Animal acorrentado',
      envenenamento: 'Suspeita de envenenamento',
      acumulacao: 'Acumulação de animais',
      outros: 'Outros maus-tratos'
    };
    return tiposMap[tipo] || tipo;
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl py-12">
      <div className="text-center mb-8">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-emerald-700 hover:underline mb-4 font-medium">
          <ArrowLeft size={16} /> Voltar para o início
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-2">
          <ShieldAlert className="w-8 h-8 text-emerald-600" /> Acompanhar Denúncia
        </h1>
        <p className="text-gray-600 mt-2 text-sm">
          Consulte o andamento da fiscalização e apuração da sua ocorrência.
        </p>
      </div>

      {/* Formulário de Busca */}
      <form onSubmit={handleSearchSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Ex: DEN-2024-12345"
            value={protocol}
            onChange={(e) => setProtocol(e.target.value)}
            className="flex-1 border border-gray-300 rounded-xl p-3.5 text-base font-mono uppercase tracking-wider focus:ring-2 focus:ring-emerald-500"
            required
          />
          <Button 
            type="submit" 
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700 h-12 px-8 rounded-xl font-semibold flex items-center justify-center gap-2"
          >
            {loading ? <Clock className="animate-spin w-5 h-5" /> : <Search size={18} />} Buscar
          </Button>
        </div>
      </form>

      {/* Resultado da Busca */}
      {searched && !loading && (
        <div className="mt-8">
          {denuncia ? (
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-200 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
                <div>
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
                    Protocolo
                  </span>
                  <span className="text-2xl font-mono font-bold text-gray-900 tracking-wider">
                    {denuncia.protocolo}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
                    Registrado em
                  </span>
                  <span className="text-sm font-medium text-gray-700">
                    {new Date(denuncia.criado_em).toLocaleDateString('pt-BR')} às{' '}
                    {new Date(denuncia.criado_em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              {/* Detalhes públicos da ocorrência */}
              <div className="bg-gray-50 rounded-xl p-4 border grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-xs text-gray-500 block">Tipo:</span>
                  <span className="font-semibold text-gray-800">{formatTipo(denuncia.tipo)}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-500 block">Localidade aproximada:</span>
                  <span className="font-medium text-gray-700 flex items-center gap-1">
                    <MapPin size={14} className="text-gray-400" />
                    {denuncia.bairro ? `Bairro ${denuncia.bairro}` : 'Área urbana informada'}
                  </span>
                </div>
              </div>

              {/* Linha do Tempo Visual */}
              <div>
                <h3 className="font-bold text-gray-900 mb-6 text-sm uppercase tracking-wider text-gray-500">
                  Histórico de Tramitação
                </h3>

                <div className="relative border-l-2 border-emerald-500 ml-4 space-y-8">
                  {getTimelineSteps(denuncia.status).map((step, idx) => (
                    <div key={idx} className="relative pl-6">
                      <div 
                        className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white transition-colors ${
                          step.isPast ? 'bg-emerald-600' : 'bg-gray-300'
                        }`} 
                      />
                      <div>
                        <h4 className={`font-bold text-sm ${step.isPast ? 'text-gray-900' : 'text-gray-400'}`}>
                          {step.label}
                        </h4>
                        <p className={`text-xs mt-0.5 ${step.isPast ? 'text-gray-600' : 'text-gray-400'}`}>
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800">
                🔒 Por questões de segurança e proteção das partes envolvidas, informações detalhadas sobre a identidade do denunciante e a qualificação dos investigados permanecem sob sigilo.
              </div>
            </div>
          ) : (
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 text-center space-y-3">
              <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
              <h3 className="text-lg font-bold text-gray-900">Protocolo não encontrado</h3>
              <p className="text-sm text-gray-500 max-w-sm mx-auto">
                Verifique se o código foi digitado corretamente no formato DEN-AAAA-XXXXX.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
