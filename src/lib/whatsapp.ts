/**
 * Serviço de Notificações e Gateway de WhatsApp - PetConecta BR
 * 
 * Suporta:
 * 1. Disparo 100% Automático em Segundo Plano (Evolution API, Z-API, Webhook n8n/Zapier)
 * 2. Fallback Inteligente de 1-Clique (WhatsApp Web / App nativo)
 * 3. Fila de Auditoria e Logs de Disparos
 */

export type ProvedorWhatsApp = 'evolution' | 'zapi' | 'webhook' | 'manual';
export type ModoDisparoWhatsApp = 'automatico' | 'manual' | 'hibrido';

export interface ConfigWhatsApp {
  ativo: boolean;
  modo: ModoDisparoWhatsApp;
  provedor: ProvedorWhatsApp;
  
  // Evolution API
  evolutionUrl?: string; // Ex: https://api.whatsapp.arapongas.pr.gov.br
  evolutionInstance?: string; // Ex: arapongas-pet
  evolutionApiKey?: string;

  // Z-API
  zapiInstanceId?: string;
  zapiToken?: string;
  zapiClientToken?: string;

  // Webhook Genérico (n8n, Zapier, Make)
  webhookUrl?: string;
  webhookToken?: string;

  // Configurações Gerais
  notificarCastracao: boolean;
  notificarConsulta: boolean;
  notificarAlta: boolean;
  notificarDenuncia: boolean;
  notificarVacina: boolean;
}

export interface LogWhatsApp {
  id: string;
  destinatarioNome: string;
  telefone: string;
  tipo: 'castracao' | 'consulta' | 'alta' | 'denuncia' | 'vacina' | 'teste';
  mensagem: string;
  modo: 'automatico' | 'manual';
  provedor: string;
  sucesso: boolean;
  erro?: string;
  data: string;
}

const CONFIG_STORAGE_KEY = 'petconecta_config_whatsapp';
const LOGS_STORAGE_KEY = 'petconecta_logs_whatsapp';

export const CONFIG_PADRAO_WHATSAPP: ConfigWhatsApp = {
  ativo: true,
  modo: 'automatico',
  provedor: 'evolution',
  evolutionUrl: 'https://api.evolution.exemplo.gov.br',
  evolutionInstance: 'petconecta-arapongas',
  evolutionApiKey: '',
  zapiInstanceId: '',
  zapiToken: '',
  webhookUrl: '',
  notificarCastracao: true,
  notificarConsulta: true,
  notificarAlta: true,
  notificarDenuncia: true,
  notificarVacina: true
};

export function getConfigWhatsApp(): ConfigWhatsApp {
  try {
    const saved = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (saved) {
      return { ...CONFIG_PADRAO_WHATSAPP, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error('Erro ao ler config do WhatsApp:', e);
  }
  return CONFIG_PADRAO_WHATSAPP;
}

export function saveConfigWhatsApp(config: ConfigWhatsApp): void {
  try {
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Erro ao salvar config do WhatsApp:', e);
  }
}

export function getLogsWhatsApp(): LogWhatsApp[] {
  try {
    const saved = localStorage.getItem(LOGS_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Erro ao ler logs do WhatsApp:', e);
  }
  return [];
}

export function registrarLogWhatsApp(log: Omit<LogWhatsApp, 'id' | 'data'>): LogWhatsApp {
  const novo: LogWhatsApp = {
    ...log,
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    data: new Date().toISOString()
  };

  try {
    const logs = getLogsWhatsApp();
    logs.unshift(novo);
    // Limita aos 150 registros mais recentes
    if (logs.length > 150) logs.pop();
    localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(logs));
  } catch (e) {
    console.error('Erro ao salvar log do WhatsApp:', e);
  }

  return novo;
}

export function limparLogsWhatsApp(): void {
  localStorage.removeItem(LOGS_STORAGE_KEY);
}

/**
 * Normaliza o telefone para o padrão internacional (DDI 55 + DDD + Número)
 */
export function formatPhoneNumber(telefone: string): string {
  const digits = telefone.replace(/\D/g, '');
  if (!digits) return '';
  if (digits.length === 10 || digits.length === 11) {
    return `55${digits}`;
  }
  return digits;
}

export interface CastracaoParams {
  tutorNome: string;
  petNome: string;
  especie?: string;
  raca?: string;
  clinicaNome: string;
  clinicaEndereco?: string;
  dataAgendada: string | Date;
  cidade?: string;
  protocolo?: string;
}

export interface ConsultaParams {
  tutorNome: string;
  petNome: string;
  clinicaNome: string;
  clinicaEndereco?: string;
  dataConsulta: string | Date;
  motivo?: string;
  cidade?: string;
  protocolo?: string;
}

export interface AltaMedicaParams {
  tutorNome: string;
  petNome: string;
  clinicaNome: string;
  clinicaEndereco?: string;
  procedimento?: string;
  cidade?: string;
  retornoPontos?: string;
}

export interface DenunciaParams {
  denuncianteNome?: string;
  protocolo: string;
  statusLabel: string;
  endereco: string;
  despacho?: string;
  cidade?: string;
}

export interface VacinaParams {
  tutorNome: string;
  petNome: string;
  vacinaNome: string;
  dataReforco: string;
  cidade?: string;
}

/**
 * 1. MENSAGEM OFICIAL DE CASTRAÇÃO AGENDADA (COM REGRAS DE JEJUM E DOCUMENTOS)
 */
export function buildCastracaoMessage(params: CastracaoParams): string {
  const dt = new Date(params.dataAgendada);
  const dataFormatada = dt.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const horaFormatada = dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const cidade = params.cidade || 'Arapongas - PR';
  const esp = params.especie === 'gato' ? 'Felino' : 'Canino';

  return `🐾 *PROGRAMA MUNICIPAL DE CASTRAÇÃO - PETCONECTA BR*
*Prefeitura Municipal de ${cidade}*

Olá, *${params.tutorNome}*!
A cirurgia de castração gratuita do seu animal foi *agendada com sucesso*!

📋 *DADOS DO AGENDAMENTO:*
🐶 *Animal:* ${params.petNome} (${esp}${params.raca ? ` • ${params.raca}` : ''})
🏥 *Clínica Conveniada:* ${params.clinicaNome}${params.clinicaEndereco ? `\n📍 *Endereço:* ${params.clinicaEndereco}` : ''}
📅 *Data:* ${dataFormatada}
⏰ *Horário de Chegada:* ${horaFormatada}
${params.protocolo ? `🎫 *Protocolo:* ${params.protocolo}\n` : ''}
⚠️ *DOCUMENTOS E REQUISITOS OBRIGATÓRIOS (APRESENTAR NA CLÍNICA):*
1. *Carteirinha Digital do Pet:* Com QR Code gerado pelo app PetConecta BR (no celular ou impressa).
2. *Guia Oficial de Autorização:* Baixada na aba "Minhas Filas" do aplicativo.
3. *Jejum Total de 8 Horas:* Água e comida rigorosamente suspensos nas 8h anteriores (risco anestésico grave).
4. Cães devem comparecer com coleira e guia firme.
5. Gatos devem ser transportados obrigatoriamente em caixa de transporte fechada.
6. Leve um cobertor ou toalha limpa para aquecer o animal no pós-operatório.

⚠️ *ATENÇÃO:* Caso não possa comparecer, avise com no mínimo 24h de antecedência para ceder a vaga para outro animal na fila de espera.`;
}

/**
 * 2. MENSAGEM OFICIAL DE CONSULTA VETERINÁRIA
 */
export function buildConsultaMessage(params: ConsultaParams): string {
  const dt = new Date(params.dataConsulta);
  const dataFormatada = dt.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const horaFormatada = dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const cidade = params.cidade || 'Arapongas - PR';

  return `🩺 *PETCONECTA BR - CONSULTA VETERINÁRIA CONFIRMADA*
*Atendimento Municipal de Saúde Animal • ${cidade}*

Olá, *${params.tutorNome}*!
A consulta veterinária do seu pet *${params.petNome}* foi confirmada:

🏥 *Clínica:* ${params.clinicaNome}${params.clinicaEndereco ? `\n📍 *Endereço:* ${params.clinicaEndereco}` : ''}
📅 *Data:* ${dataFormatada}
⏰ *Horário:* ${horaFormatada}
${params.protocolo ? `🎫 *Protocolo:* ${params.protocolo}\n` : ''}${params.motivo ? `📋 *Motivo Registrado:* ${params.motivo}\n` : ''}
⚠️ *DOCUMENTOS OBRIGATÓRIOS (APRESENTAR NA RECEPÇÃO):*
1. *Carteirinha Digital do Pet:* Com QR Code gerado pelo sistema PetConecta BR.
2. *Guia Oficial de Consulta:* Disponível para download no app em "Minhas Filas".
3. Documento com foto do tutor (RG ou CNH).
• Chegue com 10 minutos de antecedência.`;
}

/**
 * 3. MENSAGEM DE ALTA MÉDICA PÓS-OPERATÓRIA
 */
export function buildAltaMedicaMessage(params: AltaMedicaParams): string {
  const cidade = params.cidade || 'Arapongas - PR';

  return `🎉 *PETCONECTA BR - ALTA MÉDICA E LIBERAÇÃO*
*Saúde e Bem-Estar Animal • ${cidade}*

Olá, *${params.tutorNome}*!
Temos ótimas notícias: o procedimento de *${params.petNome}* na clínica *${params.clinicaNome}* foi finalizado com sucesso! 🐶🐱✨

O animal já está acordado, monitorado e pronto para voltar para o conforto do seu lar.

📍 *Endereço para Retirada:* ${params.clinicaEndereco || 'Arapongas - PR'}
${params.retornoPontos ? `📅 *Retorno de Pontos:* ${params.retornoPontos}\n` : ''}
⚠️ *LEMBRETES IMPORTANTES DE CUIDADOS EM CASA:*
• Mantenha a roupa cirúrgica ou colar elizabetano (proibido lamber os pontos);
• Siga a receita médica e os horários dos remédios prescritos;
• Mantenha o animal em repouso absoluto em local limpo e aquecido.

Obrigado pelo carinho e pela guarda responsável! ❤️`;
}

/**
 * 4. MENSAGEM DE ANDAMENTO / DESPACHO DE DENÚNCIA
 */
export function buildDenunciaMessage(params: DenunciaParams): string {
  const cidade = params.cidade || 'Arapongas - PR';
  const saudacao = params.denuncianteNome ? `Olá, *${params.denuncianteNome}*!` : 'Olá, Cidadão!';

  return `🛡️ *PETCONECTA BR - ATUALIZAÇÃO DE DENÚNCIA*
*Fiscalização de Proteção e Bem-Estar Animal • ${cidade}*

${saudacao}
Informamos que a ocorrência de maus-tratos registrada sob o protocolo *#${params.protocolo}* teve uma nova atualização pela equipe de fiscalização:

📋 *Novo Status da Ocorrência:* ${params.statusLabel}
📍 *Endereço:* ${params.endereco}
${params.despacho ? `📝 *Despacho da Equipe:* ${params.despacho}\n` : ''}
Agradecemos por exercer sua cidadania e nos ajudar a proteger os animais da nossa cidade!`;
}

/**
 * 5. MENSAGEM DE LEMBRETE DE REVACINAÇÃO
 */
export function buildVacinaMessage(params: VacinaParams): string {
  const cidade = params.cidade || 'Arapongas - PR';
  const dt = new Date(params.dataReforco).toLocaleDateString('pt-BR');

  return `💉 *PETCONECTA BR - LEMBRETE DE REVACINAÇÃO*
*Vigilância em Zoonoses • ${cidade}*

Olá, *${params.tutorNome}*!
Atenção à caderneta de saúde do(a) seu(sua) pet *${params.petNome}*:

A dose de reforço da vacina *${params.vacinaNome}* está programada para *${dt}*.
Manter as vacinas em dia protege o animal e toda a sua família contra graves doenças como raiva e cinomose.

Consulte a Caderneta Sanitária no aplicativo PetConecta BR e procure uma clínica ou posto de vacinação credenciado! 🐾`;
}

/**
 * 🚀 EXECUTA O ENVIO EM 1 CLIQUE (MANUAL)
 */
export function openWhatsApp1Click(telefone: string, message: string): boolean {
  const cleanPhone = formatPhoneNumber(telefone);
  if (!cleanPhone) {
    return false;
  }
  const encodedText = encodeURIComponent(message);
  const url = `https://wa.me/${cleanPhone}?text=${encodedText}`;
  window.open(url, '_blank');
  return true;
}

/**
 * 🤖 ENVIA VIA EVOLUTION API (SEGUNDO PLANO)
 */
async function enviarViaEvolutionApi(config: ConfigWhatsApp, phone: string, message: string) {
  if (!config.evolutionUrl || !config.evolutionInstance) {
    throw new Error('Evolution API não configurada (URL ou Instância ausente).');
  }

  const cleanUrl = config.evolutionUrl.replace(/\/$/, '');
  const endpoint = `${cleanUrl}/message/sendText/${config.evolutionInstance}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(config.evolutionApiKey ? { 'apikey': config.evolutionApiKey } : {})
    },
    body: JSON.stringify({
      number: phone,
      text: message,
      options: {
        delay: 1200,
        presence: 'composing',
        linkPreview: false
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Evolution API retornou erro ${response.status}: ${errorText}`);
  }

  return await response.json();
}

/**
 * 🤖 ENVIA VIA Z-API (SEGUNDO PLANO)
 */
async function enviarViaZApi(config: ConfigWhatsApp, phone: string, message: string) {
  if (!config.zapiInstanceId || !config.zapiToken) {
    throw new Error('Z-API não configurada (Instance ID ou Token ausente).');
  }

  const endpoint = `https://api.z-api.io/instances/${config.zapiInstanceId}/token/${config.zapiToken}/send-text`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (config.zapiClientToken) {
    headers['Client-Token'] = config.zapiClientToken;
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      phone,
      message
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Z-API retornou erro ${response.status}: ${errorText}`);
  }

  return await response.json();
}

/**
 * 🤖 ENVIA VIA WEBHOOK CUSTOMIZADO (n8n, Zapier, Make)
 */
async function enviarViaWebhook(config: ConfigWhatsApp, phone: string, message: string, metadata?: any) {
  if (!config.webhookUrl) {
    throw new Error('URL do Webhook não configurada.');
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (config.webhookToken) {
    headers['Authorization'] = `Bearer ${config.webhookToken}`;
  }

  const response = await fetch(config.webhookUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      phone,
      message,
      event: 'whatsapp_notification',
      timestamp: new Date().toISOString(),
      metadata
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Webhook retornou erro ${response.status}: ${errorText}`);
  }

  return await response.json().catch(() => ({ ok: true }));
}

export interface DisparoOptions {
  telefone: string;
  destinatarioNome: string;
  mensagem: string;
  tipo: 'castracao' | 'consulta' | 'alta' | 'denuncia' | 'vacina' | 'teste';
  metadata?: any;
  forcarManual?: boolean;
}

export interface DisparoResult {
  sucesso: boolean;
  modo: 'automatico' | 'manual';
  provedor: string;
  erro?: string;
}

/**
 * 🎯 MÉTODO CENTRAL DE DISPARO DE NOTIFICAÇÃO WHATSAPP
 * 
 * Se o modo automático estiver ativo e o gateway configurado,
 * realiza o envio 100% em segundo plano sem abrir popups.
 * Se houver erro ou o modo for manual, realiza fallback de 1-Clique.
 */
export async function dispararWhatsApp(options: DisparoOptions): Promise<DisparoResult> {
  const config = getConfigWhatsApp();
  const cleanPhone = formatPhoneNumber(options.telefone);

  if (!cleanPhone) {
    return {
      sucesso: false,
      modo: 'manual',
      provedor: 'nenhum',
      erro: 'Número de telefone inválido ou em branco.'
    };
  }

  // Se o modo for manual explícito ou o usuário forçou manual
  if (options.forcarManual || config.modo === 'manual' || !config.ativo) {
    openWhatsApp1Click(cleanPhone, options.mensagem);
    registrarLogWhatsApp({
      destinatarioNome: options.destinatarioNome,
      telefone: cleanPhone,
      tipo: options.tipo,
      mensagem: options.mensagem,
      modo: 'manual',
      provedor: 'whatsapp_web_1click',
      sucesso: true
    });
    return {
      sucesso: true,
      modo: 'manual',
      provedor: 'whatsapp_web_1click'
    };
  }

  // Tenta disparo automático em segundo plano
  let provedorNome = config.provedor;
  try {
    if (config.provedor === 'evolution') {
      await enviarViaEvolutionApi(config, cleanPhone, options.mensagem);
    } else if (config.provedor === 'zapi') {
      await enviarViaZApi(config, cleanPhone, options.mensagem);
    } else if (config.provedor === 'webhook') {
      await enviarViaWebhook(config, cleanPhone, options.mensagem, options.metadata);
    } else {
      // Fallback
      throw new Error('Nenhum provedor de gateway selecionado.');
    }

    registrarLogWhatsApp({
      destinatarioNome: options.destinatarioNome,
      telefone: cleanPhone,
      tipo: options.tipo,
      mensagem: options.mensagem,
      modo: 'automatico',
      provedor: provedorNome,
      sucesso: true
    });

    return {
      sucesso: true,
      modo: 'automatico',
      provedor: provedorNome
    };

  } catch (err: any) {
    console.warn(`[Robô WhatsApp] Falha no disparo automático (${provedorNome}):`, err);

    registrarLogWhatsApp({
      destinatarioNome: options.destinatarioNome,
      telefone: cleanPhone,
      tipo: options.tipo,
      mensagem: options.mensagem,
      modo: 'automatico',
      provedor: provedorNome,
      sucesso: false,
      erro: err.message || 'Falha de conexão com a API do WhatsApp'
    });

    // Se o modo for híbrido ou falhar, abre o fallback de 1-Clique para não perder o contato com o cidadão!
    openWhatsApp1Click(cleanPhone, options.mensagem);

    return {
      sucesso: false,
      modo: 'manual',
      provedor: provedorNome,
      erro: err.message
    };
  }
}
