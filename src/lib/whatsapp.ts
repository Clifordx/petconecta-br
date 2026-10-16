/**
 * Serviço de Notificações WhatsApp - PetConecta BR
 * 
 * Suporta:
 * 1. Envio Imediato em 1 Clique (via WhatsApp Web / App, 100% gratuito)
 * 2. Integração Preparada para Robô Automático em Segundo Plano (Evolution API / Z-API / Meta)
 */

export interface CastracaoParams {
  tutorNome: string;
  petNome: string;
  especie?: string;
  raca?: string;
  clinicaNome: string;
  dataAgendada: string | Date;
  cidade?: string;
}

export interface ConsultaParams {
  tutorNome: string;
  petNome: string;
  clinicaNome: string;
  dataConsulta: string | Date;
  motivo?: string;
  cidade?: string;
}

export interface DenunciaParams {
  denuncianteNome?: string;
  protocolo: string;
  statusLabel: string;
  endereco: string;
  despacho?: string;
  cidade?: string;
}

/**
 * Normaliza o telefone para o padrão internacional (DDI 55 + DDD + Número)
 */
export function formatPhoneNumber(telefone: string): string {
  const digits = telefone.replace(/\D/g, '');
  if (!digits) return '';
  // Se for celular brasileiro sem DDI (10 ou 11 dígitos), adiciona 55
  if (digits.length === 10 || digits.length === 11) {
    return `55${digits}`;
  }
  return digits;
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
🏥 *Clínica Conveniada:* ${params.clinicaNome}
📅 *Data:* ${dataFormatada}
⏰ *Horário de Chegada:* ${horaFormatada}
📍 *Município:* ${cidade}

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
A consulta veterinária do(a) seu(sua) pet *${params.petNome}* foi confirmada:

🏥 *Clínica:* ${params.clinicaNome}
📅 *Data:* ${dataFormatada}
⏰ *Horário:* ${horaFormatada}
${params.motivo ? `📋 *Motivo Registrado:* ${params.motivo}\n` : ''}
⚠️ *DOCUMENTOS OBRIGATÓRIOS (APRESENTAR NA RECEPÇÃO):*
1. *Carteirinha Digital do Pet:* Com QR Code gerado pelo sistema PetConecta BR.
2. *Guia Oficial de Consulta:* Disponível para download no app em "Minhas Filas".
3. Documento com foto do tutor (RG ou CNH).
• Chegue com 10 minutos de antecedência.`;
}

/**
 * 3. MENSAGEM DE ANDAMENTO / DESPACHO DE DENÚNCIA
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
 * 🚀 EXECUTA O ENVIO EM 1 CLIQUE
 * Abre o WhatsApp diretamente com o número e o texto já preenchidos.
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
 * 🤖 ESTRUTURA PREPARADA PARA ROBÔ AUTOMÁTICO EM SEGUNDO PLANO
 * Se as variáveis de ambiente VITE_WHATSAPP_API_URL e VITE_WHATSAPP_API_KEY
 * forem configuradas no .env, este método dispara sozinho sem abrir tela.
 */
export async function sendAutomatedWhatsAppBot(telefone: string, message: string): Promise<{ success: boolean; mode: 'bot' | 'manual'; error?: string }> {
  const apiUrl = import.meta.env.VITE_WHATSAPP_API_URL;
  const apiKey = import.meta.env.VITE_WHATSAPP_API_KEY;
  const cleanPhone = formatPhoneNumber(telefone);

  if (!cleanPhone) {
    return { success: false, mode: 'manual', error: 'Telefone inválido' };
  }

  // Se o robô estiver configurado no servidor, dispara em segundo plano:
  if (apiUrl) {
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(apiKey ? { 'apikey': apiKey, 'Authorization': `Bearer ${apiKey}` } : {})
        },
        body: JSON.stringify({
          number: cleanPhone,
          text: message,
          message: message
        })
      });

      if (response.ok) {
        return { success: true, mode: 'bot' };
      }
    } catch (err: any) {
      console.warn('Falha no envio via robô, acionando fallback manual:', err);
    }
  }

  // Se o robô não estiver configurado ou falhar, abre pelo método de 1 Clique:
  openWhatsApp1Click(cleanPhone, message);
  return { success: true, mode: 'manual' };
}
