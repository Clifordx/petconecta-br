import React, { useState, useEffect } from 'react';
import { 
  MessageCircle, 
  Bot, 
  Send, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Settings, 
  ShieldCheck, 
  Key, 
  Globe, 
  Smartphone, 
  Clock, 
  Trash2, 
  Check, 
  Radio, 
  Sliders, 
  ExternalLink,
  Zap,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { toast } from 'sonner';
import { 
  ConfigWhatsApp, 
  getConfigWhatsApp, 
  saveConfigWhatsApp, 
  getLogsWhatsApp, 
  limparLogsWhatsApp, 
  dispararWhatsApp, 
  LogWhatsApp 
} from '@/lib/whatsapp';

export default function GestaoWhatsApp() {
  const [config, setConfig] = useState<ConfigWhatsApp>(getConfigWhatsApp);
  const [logs, setLogs] = useState<LogWhatsApp[]>(getLogsWhatsApp);
  const [salvando, setSalvando] = useState(false);

  // Testador de Envio
  const [telefoneTeste, setTelefoneTeste] = useState('');
  const [mensagemTeste, setMensagemTeste] = useState('Olá! Este é um teste oficial de conexão do Robô de WhatsApp do PetConecta BR (Arapongas - PR). Se você recebeu esta mensagem, o gateway está 100% operacional! 🐾🚀');
  const [enviandoTeste, setEnviandoTeste] = useState(false);
  const [resultadoTeste, setResultadoTeste] = useState<any>(null);

  useEffect(() => {
    setLogs(getLogsWhatsApp());
  }, []);

  const handleSalvarConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    try {
      saveConfigWhatsApp(config);
      toast.success('Configurações do Robô de WhatsApp salvas com sucesso!');
    } catch (err) {
      toast.error('Erro ao salvar configurações.');
    } finally {
      setSalvando(false);
    }
  };

  const handleDispararTeste = async () => {
    if (!telefoneTeste.trim()) {
      toast.error('Informe um número de telefone com DDD para teste.');
      return;
    }

    setEnviandoTeste(true);
    setResultadoTeste(null);
    try {
      const res = await dispararWhatsApp({
        telefone: telefoneTeste,
        destinatarioNome: 'Teste Administrador',
        tipo: 'teste',
        mensagem: mensagemTeste
      });

      setResultadoTeste(res);
      setLogs(getLogsWhatsApp());

      if (res.sucesso) {
        if (res.modo === 'automatico') {
          toast.success('Mensagem enviada com sucesso pelo robô em segundo plano!');
        } else {
          toast.info('Mensagem aberta no WhatsApp Web de 1-Clique.');
        }
      } else {
        toast.warning('A API do robô falhou e foi acionado o fallback manual: ' + (res.erro || ''));
      }
    } catch (err: any) {
      toast.error('Erro ao disparar teste: ' + err.message);
    } finally {
      setEnviandoTeste(false);
    }
  };

  const handleLimparLogs = () => {
    if (!window.confirm('Deseja limpar todos os logs de envio de WhatsApp?')) return;
    limparLogsWhatsApp();
    setLogs([]);
    toast.success('Logs de disparo limpos com sucesso.');
  };

  const totalSucessos = logs.filter(l => l.sucesso).length;
  const taxaEntrega = logs.length > 0 ? Math.round((totalSucessos / logs.length) * 100) : 100;

  return (
    <div className="space-y-6">
      {/* CABEÇALHO */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-wider mb-1">
            <Bot className="w-4 h-4" />
            <span>Automação & Comunicação Municipal</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Robô de WhatsApp & Gateway de Disparos
          </h1>
          <p className="text-sm text-slate-500">
            Configure o robô automático em segundo plano para envio de avisos de castração, consultas e alta médica aos munícipes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge 
            variant={config.ativo ? (config.modo === 'automatico' ? 'primary' : 'warning') : 'default'}
            className="text-xs px-3 py-1 font-extrabold uppercase tracking-wider"
          >
            {config.ativo 
              ? (config.modo === 'automatico' ? '🟢 Robô Automático Ativo' : '🔵 Modo 1-Clique Manual') 
              : '⚪ Notificações Desativadas'}
          </Badge>
        </div>
      </div>

      {/* CARDS DE RESUMO DE OPERAÇÃO */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase">Modo Atual</span>
          <div className="text-lg font-black text-slate-900 capitalize">
            {config.modo === 'automatico' ? 'Segundo Plano (API)' : config.modo === 'hibrido' ? 'Híbrido' : '1-Clique Manual'}
          </div>
          <p className="text-xs text-slate-400">
            {config.modo === 'automatico' ? 'Dispara sem abrir janelas' : 'Abre o WhatsApp Web para o operador'}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase">Provedor Ativo</span>
          <div className="text-lg font-black text-emerald-700 uppercase">
            {config.provedor === 'evolution' ? 'Evolution API v2' : config.provedor === 'zapi' ? 'Z-API' : config.provedor === 'webhook' ? 'Webhook n8n' : 'Manual'}
          </div>
          <p className="text-xs text-slate-400">Gateway de integração</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase">Total Disparado</span>
          <div className="text-2xl font-black text-slate-900">{logs.length}</div>
          <p className="text-xs text-slate-400">Mensagens registradas</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase">Taxa de Sucesso</span>
          <div className="text-2xl font-black text-emerald-600">{taxaEntrega}%</div>
          <p className="text-xs text-slate-400">{totalSucessos} de {logs.length} entregues</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* COLUNA ESQUERDA: CONFIGURAÇÕES DO ROBÔ */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSalvarConfig} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div className="border-b pb-4">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-emerald-600" />
                Configurações do Gateway
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Defina como as mensagens oficiais da prefeitura e clínicas serão disparadas aos tutores.
              </p>
            </div>

            {/* SELEÇÃO DO MODO DE DISPARO */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Modo de Operação do Sistema:
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className={`p-4 rounded-xl border-2 flex flex-col justify-between cursor-pointer transition-all ${
                  config.modo === 'automatico'
                    ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 shadow-2xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs">🤖 Automático</span>
                    <input
                      type="radio"
                      name="modo"
                      checked={config.modo === 'automatico'}
                      onChange={() => setConfig({ ...config, modo: 'automatico' })}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-2">
                    O robô dispara sozinho em segundo plano via API. Rápido e sem abrir abas.
                  </p>
                </label>

                <label className={`p-4 rounded-xl border-2 flex flex-col justify-between cursor-pointer transition-all ${
                  config.modo === 'manual'
                    ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 shadow-2xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs">📲 1-Clique Manual</span>
                    <input
                      type="radio"
                      name="modo"
                      checked={config.modo === 'manual'}
                      onChange={() => setConfig({ ...config, modo: 'manual' })}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-2">
                    Abre direto no WhatsApp Web do atendente com texto oficial preenchido (Sem custos de API).
                  </p>
                </label>

                <label className={`p-4 rounded-xl border-2 flex flex-col justify-between cursor-pointer transition-all ${
                  config.modo === 'hibrido'
                    ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 shadow-2xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs">⚡ Híbrido</span>
                    <input
                      type="radio"
                      name="modo"
                      checked={config.modo === 'hibrido'}
                      onChange={() => setConfig({ ...config, modo: 'hibrido' })}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-2">
                    Tenta o robô automático. Se falhar, abre imediatamente no WhatsApp Web.
                  </p>
                </label>
              </div>
            </div>

            {/* SELEÇÃO DE PROVEDOR */}
            <div className="space-y-3 pt-3 border-t">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Provedor de API de WhatsApp:
              </label>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setConfig({ ...config, provedor: 'evolution' })}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${
                    config.provedor === 'evolution' 
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs' 
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Evolution API (Recomendado)
                </button>

                <button
                  type="button"
                  onClick={() => setConfig({ ...config, provedor: 'zapi' })}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${
                    config.provedor === 'zapi' 
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs' 
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Z-API
                </button>

                <button
                  type="button"
                  onClick={() => setConfig({ ...config, provedor: 'webhook' })}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${
                    config.provedor === 'webhook' 
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs' 
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Webhook Customizado (n8n / Zapier)
                </button>
              </div>
            </div>

            {/* CAMPOS ESPECÍFICOS DO PROVEDOR: EVOLUTION API */}
            {config.provedor === 'evolution' && (
              <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-xs">
                  <Globe size={15} />
                  <span>Configuração Evolution API v2 (Open-Source)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">URL da Instância Evolution *</label>
                    <input
                      type="url"
                      placeholder="https://api.evolution.exemplo.gov.br"
                      value={config.evolutionUrl || ''}
                      onChange={(e) => setConfig({ ...config, evolutionUrl: e.target.value })}
                      className="w-full border rounded-xl p-2.5 bg-white text-xs"
                      required={config.modo !== 'manual'}
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Nome da Instância *</label>
                    <input
                      type="text"
                      placeholder="petconecta-arapongas"
                      value={config.evolutionInstance || ''}
                      onChange={(e) => setConfig({ ...config, evolutionInstance: e.target.value })}
                      className="w-full border rounded-xl p-2.5 bg-white text-xs font-mono"
                      required={config.modo !== 'manual'}
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Chave Global / Apikey</label>
                  <input
                    type="password"
                    placeholder="Sua Global Apikey da Evolution"
                    value={config.evolutionApiKey || ''}
                    onChange={(e) => setConfig({ ...config, evolutionApiKey: e.target.value })}
                    className="w-full border rounded-xl p-2.5 bg-white text-xs font-mono"
                  />
                </div>

                <div className="text-[11px] text-slate-500 bg-white p-2.5 rounded-lg border">
                  💡 <strong>Como funciona:</strong> O robô faz chamadas HTTP para o endpoint <code>/message/sendText/{'{instance}'}</code>. Para conectar seu chip de WhatsApp oficial, basta escanear o QR Code no painel da sua Evolution API.
                </div>
              </div>
            )}

            {/* CAMPOS ESPECÍFICOS DO PROVEDOR: Z-API */}
            {config.provedor === 'zapi' && (
              <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-xs">
                  <Smartphone size={15} />
                  <span>Configuração Z-API (Gateway Comercial)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">ID da Instância Z-API *</label>
                    <input
                      type="text"
                      placeholder="Ex: 3B4C5D6E7F"
                      value={config.zapiInstanceId || ''}
                      onChange={(e) => setConfig({ ...config, zapiInstanceId: e.target.value })}
                      className="w-full border rounded-xl p-2.5 bg-white text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Token de Acesso Z-API *</label>
                    <input
                      type="password"
                      placeholder="Token da instância"
                      value={config.zapiToken || ''}
                      onChange={(e) => setConfig({ ...config, zapiToken: e.target.value })}
                      className="w-full border rounded-xl p-2.5 bg-white text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Client-Token de Segurança (Opcional)</label>
                  <input
                    type="password"
                    placeholder="Token de segurança configurado na conta"
                    value={config.zapiClientToken || ''}
                    onChange={(e) => setConfig({ ...config, zapiClientToken: e.target.value })}
                    className="w-full border rounded-xl p-2.5 bg-white text-xs font-mono"
                  />
                </div>
              </div>
            )}

            {/* CAMPOS ESPECÍFICOS DO PROVEDOR: WEBHOOK */}
            {config.provedor === 'webhook' && (
              <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-xs">
                  <Zap size={15} />
                  <span>Webhook Customizado (n8n, Zapier, Make, Chatwoot)</span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Endpoint URL do Webhook *</label>
                  <input
                    type="url"
                    placeholder="https://n8n.arapongas.pr.gov.br/webhook/whatsapp-pet"
                    value={config.webhookUrl || ''}
                    onChange={(e) => setConfig({ ...config, webhookUrl: e.target.value })}
                    className="w-full border rounded-xl p-2.5 bg-white text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Authorization Bearer Token (Opcional)</label>
                  <input
                    type="password"
                    placeholder="Bearer token de autenticação"
                    value={config.webhookToken || ''}
                    onChange={(e) => setConfig({ ...config, webhookToken: e.target.value })}
                    className="w-full border rounded-xl p-2.5 bg-white text-xs font-mono"
                  />
                </div>
              </div>
            )}

            {/* GATILHOS AUTOMÁTICOS */}
            <div className="space-y-3 pt-3 border-t">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Gatilhos de Notificação Ativos:
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <label className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.notificarCastracao}
                    onChange={(e) => setConfig({ ...config, notificarCastracao: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <span>Aviso de Castração Agendada & Jejum</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.notificarConsulta}
                    onChange={(e) => setConfig({ ...config, notificarConsulta: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <span>Confirmação de Consulta Veterinária</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.notificarAlta}
                    onChange={(e) => setConfig({ ...config, notificarAlta: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <span>Declaração de Alta Médica (Pós-operatório)</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.notificarDenuncia}
                    onChange={(e) => setConfig({ ...config, notificarDenuncia: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <span>Despacho e Atualização de Denúncias</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.notificarVacina}
                    onChange={(e) => setConfig({ ...config, notificarVacina: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <span>Lembretes de Revacinação Anual</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t">
              <Button
                type="submit"
                disabled={salvando}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 px-6 py-2.5"
              >
                <Check size={15} />
                <span>{salvando ? 'Salvando...' : 'Salvar Configurações do Gateway'}</span>
              </Button>
            </div>
          </form>
        </div>

        {/* COLUNA DIREITA: TESTADOR DE CONEXÃO & SIMULADOR */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="border-b pb-3 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                  <Send size={15} className="text-emerald-600" /> Testador de Conexão
                </h3>
                <p className="text-xs text-slate-500">Dispare um teste real para o seu número.</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Número de Teste (com DDD) *
                </label>
                <input
                  type="tel"
                  placeholder="(43) 99999-9999"
                  value={telefoneTeste}
                  onChange={(e) => setTelefoneTeste(e.target.value)}
                  className="w-full border rounded-xl p-2.5 bg-white text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Mensagem de Teste
                </label>
                <textarea
                  rows={3}
                  value={mensagemTeste}
                  onChange={(e) => setMensagemTeste(e.target.value)}
                  className="w-full border rounded-xl p-2.5 bg-slate-50 text-[11px]"
                />
              </div>

              <Button
                type="button"
                onClick={handleDispararTeste}
                disabled={enviandoTeste}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 py-2.5 shadow-xs"
              >
                <Send size={14} className={enviandoTeste ? 'animate-bounce' : ''} />
                <span>{enviandoTeste ? 'Disparando...' : 'Enviar Teste Agora'}</span>
              </Button>

              {resultadoTeste && (
                <div className={`p-3 rounded-xl border text-xs space-y-1 ${
                  resultadoTeste.sucesso ? 'bg-emerald-50 border-emerald-200 text-emerald-950' : 'bg-amber-50 border-amber-200 text-amber-950'
                }`}>
                  <div className="font-bold flex items-center gap-1">
                    {resultadoTeste.sucesso ? <CheckCircle2 size={14} className="text-emerald-600" /> : <AlertTriangle size={14} className="text-amber-600" />}
                    <span>{resultadoTeste.sucesso ? 'Envio Realizado com Sucesso!' : 'Atenção no Disparo'}</span>
                  </div>
                  <p className="text-[11px]">
                    Modo: <strong>{resultadoTeste.modo}</strong> • Provedor: <strong>{resultadoTeste.provedor}</strong>
                  </p>
                  {resultadoTeste.erro && (
                    <p className="text-[10px] text-red-700 font-mono">
                      Erro API: {resultadoTeste.erro}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* DICA DE INFRAESTRUTURA */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-xs space-y-2 text-slate-600">
            <h4 className="font-extrabold text-slate-800 flex items-center gap-1.5">
              <ShieldCheck className="text-emerald-600" size={16} /> Dica para Prefeituras e ONGs
            </h4>
            <p className="text-slate-500 leading-relaxed">
              O modo <strong>1-Clique Manual</strong> é 100% gratuito e não exige nenhum servidor. Caso a prefeitura deseje automação total com robô 24 horas, recomendamos hospedar a <strong>Evolution API</strong> em um servidor Linux municipal ou container Docker.
            </p>
          </div>
        </div>
      </div>

      {/* TABELA DE AUDITORIA E LOGS DE DISPARO */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <Clock size={16} className="text-emerald-600" />
              Histórico & Logs de Mensagens Disparadas
            </h3>
            <p className="text-xs text-slate-500">
              Registro das últimas notificações enviadas aos cidadãos para transparência e auditoria.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleLimparLogs}
              className="text-xs flex items-center gap-1 border-slate-300 text-slate-600 hover:text-red-700"
            >
              <Trash2 size={13} /> Limpar Logs
            </Button>
          </div>
        </div>

        {logs.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            Nenhuma mensagem registrada no histórico ainda. Dispare uma notificação de agendamento ou faça um teste.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Data/Hora</th>
                  <th className="p-3">Destinatário</th>
                  <th className="p-3">Telefone</th>
                  <th className="p-3">Tipo</th>
                  <th className="p-3">Modo / Provedor</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80">
                    <td className="p-3 font-medium whitespace-nowrap">
                      {new Date(log.data).toLocaleDateString('pt-BR')} às{' '}
                      {new Date(log.data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-3 font-bold text-slate-900">
                      {log.destinatarioNome}
                    </td>
                    <td className="p-3 font-mono">
                      {log.telefone}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        log.tipo === 'castracao' ? 'bg-emerald-100 text-emerald-800' :
                        log.tipo === 'consulta' ? 'bg-blue-100 text-blue-800' :
                        log.tipo === 'alta' ? 'bg-purple-100 text-purple-800' :
                        log.tipo === 'denuncia' ? 'bg-amber-100 text-amber-800' :
                        'bg-slate-100 text-slate-800'
                      }`}>
                        {log.tipo}
                      </span>
                    </td>
                    <td className="p-3 text-[11px]">
                      <span className="font-semibold block capitalize">{log.modo}</span>
                      <span className="text-[10px] text-slate-400">{log.provedor}</span>
                    </td>
                    <td className="p-3">
                      {log.sucesso ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1 w-fit">
                          <CheckCircle2 size={11} /> Entregue
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 flex items-center gap-1 w-fit" title={log.erro}>
                          <AlertTriangle size={11} /> Falha API
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => {
                          dispararWhatsApp({
                            telefone: log.telefone,
                            destinatarioNome: log.destinatarioNome,
                            tipo: log.tipo,
                            mensagem: log.mensagem,
                            forcarManual: true
                          });
                          toast.info('Reenviando mensagem...');
                        }}
                        className="text-emerald-700 hover:text-emerald-900 font-bold text-xs flex items-center gap-1 ml-auto"
                        title="Reenviar agora"
                      >
                        <RotateCcw size={12} /> Reenviar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
