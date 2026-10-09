import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Building2, MapPin, Phone, Search, Plus, Trash2, Edit2, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { toast } from 'sonner';

export default function GestaoClinicas() {
  const [clinicas, setClinicas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClinica, setEditingClinica] = useState<any>(null);
  
  const [nome, setNome] = useState('');
  const [endereco, setEndereco] = useState('');
  const [telefone, setTelefone] = useState('');
  const [vagasCastracao, setVagasCastracao] = useState('0');
  
  // Novos campos
  const [cnpj, setCnpj] = useState('');
  const [veterinarioResponsavel, setVeterinarioResponsavel] = useState('');
  const [crmv, setCrmv] = useState('');
  const [email, setEmail] = useState('');
  const [horarioAtendimento, setHorarioAtendimento] = useState('');
  const [observacoes, setObservacoes] = useState('');

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchClinicas();
  }, []);

  const fetchClinicas = async () => {
    try {
      const { data, error } = await supabase
        .from('clinicas_parceiras')
        .select('*')
        .order('criado_em', { ascending: false });
        
      if (error) throw error;
      setClinicas(data || []);
    } catch (error) {
      console.error('Erro ao buscar clínicas:', error);
      toast.error('Erro ao carregar clínicas');
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (clinica: any) => {
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
      setVagasCastracao('0');
      
      setCnpj('');
      setVeterinarioResponsavel('');
      setCrmv('');
      setEmail('');
      setHorarioAtendimento('');
      setObservacoes('');
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome) {
      toast.error('O nome da clínica é obrigatório');
      return;
    }
    
    setSaving(true);
    try {
      const payload = {
        nome,
        endereco,
        telefone,
        vagas_castracao_mensal: parseInt(vagasCastracao) || 0,
        cnpj,
        veterinario_responsavel: veterinarioResponsavel,
        crmv,
        email,
        horario_atendimento: horarioAtendimento,
        observacoes
      };

      if (editingClinica) {
        const { error } = await supabase
          .from('clinicas_parceiras')
          .update(payload)
          .eq('id', editingClinica.id);
          
        if (error) throw error;
        toast.success('Clínica atualizada com sucesso!');
      } else {
        const { error } = await supabase
          .from('clinicas_parceiras')
          .insert(payload);
          
        if (error) throw error;
        toast.success('Clínica cadastrada com sucesso!');
      }
      
      setIsModalOpen(false);
      fetchClinicas();
    } catch (error: any) {
      console.error('Erro ao salvar clínica:', error);
      if (error.message?.includes('column')) {
         toast.error('Erro: A tabela no banco de dados ainda não tem as colunas novas. Execute o código SQL no Supabase.');
      } else {
         toast.error('Erro ao salvar os dados');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta clínica? Isso não poderá ser desfeito se não houver vínculos.')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('clinicas_parceiras')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      toast.success('Clínica excluída');
      fetchClinicas();
    } catch (error: any) {
      console.error('Erro ao excluir:', error);
      toast.error(error.message?.includes('violates foreign key constraint') ? 'Não é possível excluir: existem filas ou pets vinculados a esta clínica.' : 'Erro ao excluir');
    }
  };

  const openWhatsApp = (telefone: string) => {
    const numbersOnly = telefone.replace(/\\D/g, '');
    if (!numbersOnly) {
      toast.error('Número de telefone inválido');
      return;
    }
    // Adiciona o código do Brasil 55 caso não tenha sido digitado
    const phoneWithCode = numbersOnly.length <= 11 ? `55\${numbersOnly}` : numbersOnly;
    window.open(`https://wa.me/\${phoneWithCode}`, '_blank');
  };

  const filteredClinicas = clinicas.filter(c => 
    c.nome?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.endereco?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.veterinario_responsavel?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Carregando clínicas...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clínicas Parceiras</h1>
          <p className="text-sm text-gray-500">Gerencie as clínicas veterinárias, responsáveis e vagas.</p>
        </div>
        <Button onClick={() => openEditModal(null)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nova Clínica
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar pelo nome, endereço ou veterinário..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
        </div>

        {filteredClinicas.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Nenhuma clínica encontrada.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-700 text-xs uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4">Clínica & Responsável</th>
                  <th className="px-6 py-4">Contato & Endereço</th>
                  <th className="px-6 py-4 text-center">Vagas Mensais</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredClinicas.map((clinica) => (
                  <tr key={clinica.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="font-semibold text-gray-900 block">{clinica.nome}</span>
                          {clinica.veterinario_responsavel && (
                            <span className="text-xs text-gray-500 block mt-0.5">Resp: {clinica.veterinario_responsavel}</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 text-xs">
                        {clinica.telefone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-3 h-3 text-gray-400" />
                            <span>{clinica.telefone}</span>
                            <button 
                              onClick={() => openWhatsApp(clinica.telefone)}
                              title="Chamar no WhatsApp"
                              className="text-green-600 hover:text-green-700 p-0.5 bg-green-50 hover:bg-green-100 rounded transition-colors"
                            >
                              <MessageCircle className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                        {clinica.endereco && (
                          <div className="flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3 text-gray-400" />
                            <span className="truncate max-w-[200px]">{clinica.endereco}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">
                        {clinica.vagas_castracao_mensal} vagas
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(clinica)}
                          className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(clinica.id)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingClinica ? 'Editar Clínica' : 'Nova Clínica'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Clínica *</label>
              <Input 
                required
                placeholder="Ex: Clínica Veterinária Vida" 
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CNPJ</label>
              <Input 
                placeholder="Ex: 00.000.000/0000-00" 
                value={cnpj}
                onChange={(e) => setCnpj(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefone / WhatsApp</label>
              <Input 
                placeholder="Ex: (00) 00000-0000" 
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Veterinário Responsável</label>
              <Input 
                placeholder="Ex: Dr. João da Silva" 
                value={veterinarioResponsavel}
                onChange={(e) => setVeterinarioResponsavel(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CRMV</label>
              <Input 
                placeholder="Ex: CRMV-PR 12345" 
                value={crmv}
                onChange={(e) => setCrmv(e.target.value)}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
              <Input 
                type="email"
                placeholder="Ex: contato@clinica.com.br" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Endereço Completo</label>
              <Input 
                placeholder="Ex: Rua das Flores, 123 - Centro" 
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Horário de Atendimento</label>
              <Input 
                placeholder="Ex: Segunda a Sexta, das 08:00 às 18:00" 
                value={horarioAtendimento}
                onChange={(e) => setHorarioAtendimento(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cota Mensal de Castrações</label>
              <Input 
                type="number"
                min="0"
                placeholder="Ex: 20" 
                value={vagasCastracao}
                onChange={(e) => setVagasCastracao(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">Vagas custeadas pela prefeitura/ONG no mês.</p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Observações Gerais</label>
              <textarea
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                rows={3}
                placeholder="Anotações internas sobre o contrato, serviços prestados, etc."
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar Clínica'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
