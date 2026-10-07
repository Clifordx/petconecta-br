import React, { useState, useEffect } from 'react';
import { Users, Search, Filter, ShieldCheck, FileText, MapPin, Dog, AlertCircle, X, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Perfil } from '@/types';
import { toast } from 'sonner';

export default function GestaoUsuarios() {
  const [usuarios, setUsuarios] = useState<Perfil[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('todos');
  const [selectedUser, setSelectedUser] = useState<Perfil | null>(null);

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    try {
      const { data, error } = await supabase
        .from('perfis')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsuarios(data || []);
    } catch (error) {
      toast.error('Erro ao buscar usuários');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsuarios = usuarios.filter((u) => {
    const matchesSearch = u.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.cpf.includes(searchTerm);
    const matchesType = filterType === 'todos' || u.tipo_perfil === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Users className="w-6 h-6 mr-2 text-emerald-600" />
            Gestão de Usuários
          </h1>
          <p className="text-gray-500 text-sm mt-1">Visualize e gerencie os tutores cadastrados no sistema.</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nome ou CPF..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border border-gray-300 rounded-md py-2 px-3 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="todos">Todos os Tipos</option>
            <option value="cidadao">Cidadão (Tutor)</option>
            <option value="voluntario">Voluntário</option>
            <option value="admin_ong">Admin ONG</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuário</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contato</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Documentação</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">Carregando usuários...</td>
                </tr>
              ) : filteredUsuarios.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">Nenhum usuário encontrado.</td>
                </tr>
              ) : (
                filteredUsuarios.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 bg-gray-100 rounded-full overflow-hidden">
                          {u.avatar_url ? (
                            <img src={u.avatar_url} alt="" className="h-10 w-10 object-cover" />
                          ) : (
                            <div className="h-10 w-10 flex items-center justify-center text-gray-400">
                              <Users className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{u.nome}</div>
                          <div className="text-sm text-gray-500">CPF: {u.cpf}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{u.telefone || 'Sem telefone'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {u.documento_url ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                          <ShieldCheck className="w-3 h-3 mr-1" /> Documento Validado
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <AlertCircle className="w-3 h-3 mr-1" /> Sem Documento
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                      {u.tipo_perfil.replace('_', ' ')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => setSelectedUser(u)}
                        className="text-emerald-600 hover:text-emerald-900"
                      >
                        Ver Ficha
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-emerald-600" />
                Ficha Cadastral do Tutor
              </h2>
              <button onClick={() => setSelectedUser(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-gray-100 rounded-full overflow-hidden border-2 border-emerald-100">
                  {selectedUser.avatar_url ? (
                    <img src={selectedUser.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Users className="w-8 h-8" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{selectedUser.nome}</h3>
                  <p className="text-gray-500">ID: {selectedUser.id}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                <div>
                  <p className="text-sm text-gray-500 font-medium">CPF</p>
                  <p className="text-gray-900">{selectedUser.cpf}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Telefone</p>
                  <p className="text-gray-900">{selectedUser.telefone || 'Não informado'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500 font-medium">Endereço Completo</p>
                  <p className="text-gray-900 flex items-start mt-1">
                    <MapPin className="w-4 h-4 text-emerald-600 mr-1 mt-0.5" />
                    {selectedUser.endereco}, {selectedUser.numero} {selectedUser.complemento && \` - \${selectedUser.complemento}\`}
                    <br />
                    {selectedUser.bairro} - CEP: {selectedUser.cep}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 mb-3 flex items-center">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 mr-2" />
                  Documento Anexado
                </h4>
                {selectedUser.documento_url ? (
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <img src={selectedUser.documento_url} alt="Documento do usuário" className="w-full max-h-64 object-contain bg-gray-100" />
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg flex items-center text-yellow-800">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    Usuário registrado antes da obrigatoriedade do documento.
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button onClick={() => setSelectedUser(null)} className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium">
                Fechar Ficha
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
