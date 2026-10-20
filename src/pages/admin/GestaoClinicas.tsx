import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Search, 
  Plus, 
  Trash2, 
  Edit2, 
  MessageCircle,
  UserCheck,
  ShieldCheck,
  Key,
  Copy,
  ExternalLink,
  CheckCircle2,
  Stethoscope,
  Clock,
  Mail
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { toast } from 'sonner';
import { 
  ClinicaParceira, 
  fetchClinicasParceiras, 
  salvarClinicaParceira, 
  vincularUsuarioClinica 
} from '@/lib/clinicas';

export default function GestaoClinicas() {
  const navigate = useNavigate();
  const [clinicas, setClinicas] = useState<ClinicaParceira[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal de Clínica (Cadastro/Edição)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClinica, setEditingClinica] = useState<ClinicaParceira | null>(null);
  
  const [nome, setNome] = useState('');
  const [endereco, setEndereco] = useState('');
  const [telefone, setTelefone] = useState('');
  const [vagasCastracao, setVagasCastracao] = useState('0');
  const [cnpj, setCnpj] = useState('');
  const [veterinarioResponsavel, setVeterinarioResponsavel] = useState('');
  const [crmv, setCrmv] = useState('');
  const [email, setEmail] = useState('');
  const [horarioAtendimento, setHorarioAtendimento] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [saving, setSaving] = useState(false);

  // Modal de Gestão de Usuário / Acesso da Clínica
  const [modalAcessoOpen, setModalAcessoOpen] = useState(false);
  const [clinicaAcesso, setClinicaAcesso] = useState<ClinicaParceira | null>(null);
  const [usuarioEmail, setUsuarioEmail] = useState('');
  const [usuarioNome, setUsuarioNome] = useState('');
  const [usuarioCrmv, setUsuarioCrmv] = useState('');
  const [usuarioSenhaTemp, setUsuarioSenhaTemp] = useState('PetConecta@2026');
  const [salvandoAcesso, setSalvandoAcesso] = useState(false);

  useEffect(() => {
    carregarClinicas();
  }, []);

  const carregarClinicas = async () => {
    try {
      setLoading(true);
      const lista = await fetchClinicasParceiras();
      setClinicas(lista);
    } catch (error) {
      console.error('Erro ao buscar clínicas:', error);
      toast.error('Erro ao carregar clínicas');
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (clinica: ClinicaParceira | null) => {
    setEditingClinica(clinica);
    if (clinica) {
      setNome(clinica.nome || '');
      setEndereco(clinica.endereco || '');
      setTelefone(clinica.telefone || '');
      setVagasCastracao(clinica.vagas_castracao_mensal?.toString() || '0');
      setCnpj(clinica.cnpj || '');
      setVeterinarioResponsavel(clinica.veterinario_responsavel || '');
      setCrmv(clinica.crmv || '');
      setEmail(clinica.email || '');
      setHorarioAtendimento(clinica.horario_atendimento || '');
      setObservacoes(clinica.observacoes || '');
    } else {
      setNome('');
      setEndereco('');
      setTelefone('');
      setVagasCastracao('50');
      setCnpj('');
      setVeterinarioResponsavel('');
      setCrmv('');
      setEmail('');
      setHorarioAtendimento('Segunda a Sexta, 08h às 18h');
      setObservacoes('');
    }
    setIsModalOpen(true);
  };

  const openAcessoModal = (clinica: ClinicaParceira) => {
    setClinicaAcesso(clinica);
    setUsuarioEmail(clinica.usuario_email || clinica.email || `vet.${clinica.nome.toLowerCase().replace(/[^a-z0-9]/g, '')}@arapongas.pr.gov.br`);
    setUsuarioNome(clinica.usuario_nome || clinica.veterinario_responsavel || `Veterinário (${clinica.nome})`);
    setUsuarioCrmv(clinica.crmv || '');
    setUsuarioSenhaTemp('Pet@' + Math.floor(1000 + Math.random() * 9000));
    setModalAcessoOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      toast.error('O nome da clínica é obrigatório');
      return;
    }
    
    setSaving(true);
    try {
      const payload: Partial<ClinicaParceira> = {
        id: editingClinica ? editingClinica.id : undefined,
        nome,
        endereco,
        telefone,
        vagas_castracao_mensal: parseInt(vagasCastracao) || 0,
        cnpj,
        veterinario_responsavel: veterinarioResponsavel,
        crmv,
        email,
        horario_atendimento: horarioAtendimento,
        observacoes,
        ativa: true
      };

      await salvarClinicaParceira(payload);
      toast.success(editingClinica ? 'Clínica atualizada!' : 'Clínica cadastrada com sucesso!');
      setIsModalOpen(false);
      await carregarClinicas();
    } catch (error: any) {
      console.error('Erro ao salvar clínica:', error);
      toast.error('Erro ao salvar dados da clínica');
    } finally {
      setSaving(false);
    }
  };

  const handleSalvarAcesso = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clinicaAcesso) return;
    if (!usuarioEmail.trim()) {
      toast.error('Informe o e-mail de acesso da clínica.');
      return;
    }

    setSalvandoAcesso(true);
    try {
      await vincularUsuarioClinica(clinicaAcesso.id, {
        email: usuarioEmail,
        nome: usuarioNome,
        crmv: usuarioCrmv,
        telefone: clinicaAcesso.telefone
      });

      // Tenta criar/atualizar no Supabase auth se suportado
      try {
        if (supabase) {
          await supabase.from('perfis').upsert({
            nome: usuarioNome,
            cpf: '000.000.000-00',
            telefone: clinicaAcesso.telefone,
            tipo_perfil: 'veterinario',
            clinica_id: clinicaAcesso.id
          });
        }
      } catch {}

      toast.success(`Acesso ativado com sucesso para ${clinicaAcesso.nome}!`);
      setModalAcessoOpen(false);
      await carregarClinicas();
    } catch (e) {
      console.error(e);
      toast.error('Erro ao vincular usuário da clínica.');
    } finally {
      setSalvandoAcesso(false);
    }
  };

  const copiarInstrucoesWhatsApp = () => {
    if (!clinicaAcesso) return;
    const txt = `🏥 *ACESSO AO SISTEMA PETCONECTA ARAPONGAS - CLÍNICA CREDENCIADA*\n\n` +
      `Olá ${usuarioNome}!\n` +
      `Seu acesso exclusivo para gerenciar consultas e castrações conveniadas da *${clinicaAcesso.nome}* foi liberado no sistema municipal.\n\n` +
      `🔗 *Link do Painel:* https://petconecta-br.vercel.app/admin/atendimento-clinico\n` +
      `📧 *E-mail de Login:* ${usuarioEmail}\n` +
      `🔑 *Senha Temporária:* ${usuarioSenhaTemp}\n\n` +
      `No painel, você verá automaticamente todas as consultas e castrações agendadas no nome da sua clínica, com leitor de QR Code para check-in rápido e emissão de atestado/alta médica.`;

    navigator.clipboard.writeText(txt);
    toast.success('Mensagem com credenciais copiada para a área de transferência!');
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja desativar/excluir esta clínica?')) {
      return;
    }
    
    try {
      await supabase.from('clinicas_parceiras').delete().eq('id', id);
      toast.success('Clínica excluída');
      await carregarClinicas();
    } catch (error: any) {
      console.error('Erro ao excluir:', error);
      toast.error('Erro ao excluir clínica');
    }
  };

  const openWhatsApp = (telefone: string) => {
    const numbersOnly = telefone.replace(/\D/g, '');
    if (!numbersOnly) {
      toast.error('Número de telefone inválido');
      return;
    }
    const phoneWithCode = numbersOnly.length <= 11 ? `55${numbersOnly}` : numbersOnly;
    window.open(`https://wa.me/${phoneWithCode}`, '_blank');
  };

  const filteredClinicas = clinicas.filter(c => 
    c.nome?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.endereco?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.veterinario_responsavel?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.usuario_email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4" />
            <span>Rede de Clínicas Credenciadas • Convênio Municipal</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Clínicas Parceiras & Acesso Clínico
          </h1>
          <p className="text-sm text-slate-500">
            Cadastre as clínicas veterinárias de Arapongas, configure seus usuários de acesso e acompanhe as vagas conveniadas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline"
            onClick={() => navigate('/admin/atendimento-clinico')} 
            className="flex items-center gap-2 text-xs"
          >
            <Stethoscope className="w-4 h-4 text-emerald-600" />
            Abrir Painel de Atendimentos
          </Button>

          <Button 
            variant="primary"
            onClick={() => openEditModal(null)} 
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-xs font-bold"
          >
            <Plus className="w-4 h-4" />
            Nova Clínica
          </Button>
        </div>
      </div>

      {/* BUSCA E TABELA */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nome, endereço, veterinário ou login..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Carregando clínicas credenciadas...</div>
        ) : filteredClinicas.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">Nenhuma clínica encontrada.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-5 py-3.5">Clínica / Responsável</th>
                  <th className="px-5 py-3.5">Contato & Local</th>
                  <th className="px-5 py-3.5">Vagas Castração</th>
                  <th className="px-5 py-3.5">Acesso ao Sistema (Login)</th>
                  <th className="px-5 py-3.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredClinicas.map((clinica) => (
                  <tr key={clinica.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 flex-shrink-0">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 text-sm block">{clinica.nome}</span>
                          <span className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                            {clinica.veterinario_responsavel ? `Resp: ${clinica.veterinario_responsavel}` : 'Sem resp. definido'}
                            {clinica.crmv && <span className="font-mono text-emerald-800 font-semibold">• {clinica.crmv}</span>}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="space-y-1 text-slate-600">
                        {clinica.telefone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <span className="font-mono">{clinica.telefone}</span>
                            <button
                              onClick={() => openWhatsApp(clinica.telefone)}
                              title="Chamar no WhatsApp"
                              className="text-emerald-700 hover:text-emerald-800 p-0.5 bg-emerald-50 rounded"
                            >
                              <MessageCircle className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                        {clinica.endereco && (
                          <div className="flex items-center gap-1 text-[11px] text-slate-500">
                            <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                            <span className="truncate max-w-xs">{clinica.endereco}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black bg-blue-50 text-blue-800 border border-blue-200">
                        {clinica.vagas_castracao_mensal || 0} vagas/mês
                      </span>
                    </td>

                    {/* ACESSO AO SISTEMA */}
                    <td className="px-5 py-4">
                      {clinica.usuario_email ? (
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Login Ativo
                          </span>
                          <span className="text-[11px] text-slate-500 font-mono block">
                            {clinica.usuario_email}
                          </span>
                          <button
                            onClick={() => openAcessoModal(clinica)}
                            className="text-[11px] text-emerald-700 hover:underline font-bold flex items-center gap-1"
                          >
                            <Key className="w-3 h-3" /> Gerenciar Acesso
                          </button>
                        </div>
                      ) : (
                        <div>
                          <span className="text-[11px] text-slate-400 block mb-1">Sem usuário vinculado</span>
                          <button
                            onClick={() => openAcessoModal(clinica)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 border border-slate-300 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                          >
                            <UserCheck className="w-3.5 h-3.5" /> Criar Acesso
                          </button>
                        </div>
                      )}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => navigate(`/admin/atendimento-clinico?clinicaId=${clinica.id}`)}
                          className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1 transition-all"
                          title="Abrir Atendimentos desta Clínica"
                        >
                          <Stethoscope className="w-3.5 h-3.5" />
                          <span>Ver Painel</span>
                        </button>

                        <button
                          onClick={() => openEditModal(clinica)}
                          className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-slate-100 rounded-lg"
                          title="Editar Dados da Clínica"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDelete(clinica.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL DE CADASTRO / EDIÇÃO DE DADOS DA CLÍNICA */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingClinica ? `Editar Clínica: ${editingClinica.nome}` : 'Cadastrar Nova Clínica Credenciada'}
        >
          <form onSubmit={handleSave} className="space-y-4 max-h-[75vh] overflow-y-auto p-1 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="md:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Nome da Clínica *</label>
                <Input 
                  required
                  placeholder="Ex: Clínica Veterinária Vida Animal" 
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block font-bold text-slate-700 mb-1">CNPJ</label>
                <Input 
                  placeholder="00.000.000/0001-00" 
                  value={cnpj}
                  onChange={(e) => setCnpj(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block font-bold text-slate-700 mb-1">Telefone / WhatsApp Comercial *</label>
                <Input 
                  required
                  placeholder="(43) 99999-9999" 
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Veterinário Responsável Técnico</label>
                <Input 
                  placeholder="Ex: Dr. Carlos Mendes" 
                  value={veterinarioResponsavel}
                  onChange={(e) => setVeterinarioResponsavel(e.target.value)}
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">CRMV</label>
                <Input 
                  placeholder="CRMV-PR 12345" 
                  value={crmv}
                  onChange={(e) => setCrmv(e.target.value)}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">E-mail Institucional</label>
                <Input 
                  type="email"
                  placeholder="contato@clinica.com.br" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Endereço Completo em Arapongas</label>
                <Input 
                  placeholder="Rua, número, bairro..." 
                  value={endereco}
                  onChange={(e) => setEndereco(e.target.value)}
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Vagas de Castração Mensal</label>
                <Input 
                  type="number"
                  placeholder="Ex: 50" 
                  value={vagasCastracao}
                  onChange={(e) => setVagasCastracao(e.target.value)}
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Horário de Atendimento</label>
                <Input 
                  placeholder="Seg a Sex: 08h às 18h" 
                  value={horarioAtendimento}
                  onChange={(e) => setHorarioAtendimento(e.target.value)}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Observações Internas</label>
                <textarea
                  rows={2}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  placeholder="Instruções sobre convênio, procedimentos ou dias cirúrgicos..."
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary" size="sm" disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 font-bold">
                {saving ? 'Salvando...' : 'Salvar Clínica'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL DE GERENCIAR USUÁRIO & ACESSO DA CLÍNICA */}
      {modalAcessoOpen && clinicaAcesso && (
        <Modal
          isOpen={modalAcessoOpen}
          onClose={() => setModalAcessoOpen(false)}
          title={`Acesso ao Sistema: ${clinicaAcesso.nome}`}
        >
          <form onSubmit={handleSalvarAcesso} className="space-y-4 text-xs">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-1.5">
              <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Painel Restrito da Clínica Parceira
              </span>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                Ao vincular esta conta, a clínica só terá acesso aos atendimentos, consultas e castrações direcionados <strong>especificamente para o nome dela</strong>. O Administrador Geral continuará com acesso total.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nome do Veterinário / Usuário Responsável *</label>
                <Input
                  required
                  value={usuarioNome}
                  onChange={(e) => setUsuarioNome(e.target.value)}
                  placeholder="Ex: Dra. Mariana Costa"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">E-mail de Login da Clínica *</label>
                <Input
                  type="email"
                  required
                  value={usuarioEmail}
                  onChange={(e) => setUsuarioEmail(e.target.value)}
                  placeholder="Ex: vet.petvida@arapongas.pr.gov.br"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  A clínica usará este e-mail para entrar no sistema.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">CRMV</label>
                  <Input
                    value={usuarioCrmv}
                    onChange={(e) => setUsuarioCrmv(e.target.value)}
                    placeholder="CRMV-PR 12345"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Senha Temporária</label>
                  <Input
                    value={usuarioSenhaTemp}
                    onChange={(e) => setUsuarioSenhaTemp(e.target.value)}
                    placeholder="Senha de acesso"
                  />
                </div>
              </div>
            </div>

            {/* BOTÕES DE AÇÃO */}
            <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={copiarInstrucoesWhatsApp}
                className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl font-bold flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" /> Copiar Dados para WhatsApp
              </button>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setModalAcessoOpen(false)}
                >
                  Fechar
                </Button>

                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={salvandoAcesso}
                  className="bg-emerald-600 hover:bg-emerald-700 font-bold"
                >
                  {salvandoAcesso ? 'Salvando...' : 'Salvar Acesso da Clínica'}
                </Button>
              </div>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
}
