import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Dog, 
  Cat, 
  Loader2, 
  Scissors, 
  Stethoscope, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

type Pet = {
  id: string;
  nome: string;
  especie: 'cao' | 'gato' | 'outro';
  raca: string;
  status: string;
  fotos_pet?: { url: string }[];
};

type ActiveCastracao = {
  id: string;
  pet_id: string;
  status: string;
  data_agendada?: string;
  posicao?: number;
  pets?: { nome: string; especie: string };
};

type ActiveConsulta = {
  id: string;
  pet_id: string;
  status: string;
  data_consulta?: string;
  motivo: string;
  pets?: { nome: string; especie: string };
  clinicas_parceiras?: { nome: string };
};

const MeusPets = () => {
  const { user } = useAuth();
  const [pets, setPets] = useState<Pet[]>([]);
  const [activeCastracao, setActiveCastracao] = useState<ActiveCastracao | null>(null);
  const [activeConsulta, setActiveConsulta] = useState<ActiveConsulta | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        setIsLoading(true);

        // 1. Busca os pets do tutor
        const { data: petsData, error: petErr } = await supabase
          .from('pets')
          .select('*, fotos_pet(url)')
          .eq('tutor_id', user.id)
          .order('criado_em', { referencedTable: 'fotos_pet', ascending: false });

        if (petErr) throw petErr;
        setPets(petsData || []);

        // 2. Busca se há castrações ativas (pendente ou agendada)
        const { data: todasFilas } = await supabase
          .from('filas_castracao')
          .select('id, criado_em, status')
          .eq('status', 'pendente')
          .order('criado_em', { ascending: true });

        const { data: userCastracoes } = await supabase
          .from('filas_castracao')
          .select('id, pet_id, status, data_agendada, criado_em, pets(nome, especie)')
          .eq('tutor_id', user.id)
          .in('status', ['pendente', 'agendado'])
          .order('criado_em', { ascending: false })
          .limit(1);

        if (userCastracoes && userCastracoes.length > 0) {
          const item = userCastracoes[0];
          let posicao = 1;
          if (item.status === 'pendente' && todasFilas) {
            const idx = todasFilas.findIndex(f => f.id === item.id);
            posicao = idx !== -1 ? idx + 1 : 1;
          }
          setActiveCastracao({
            ...item,
            posicao,
            pets: Array.isArray(item.pets) ? item.pets[0] : item.pets
          });
        }

        // 3. Busca se há consultas ativas (agendada ou em_andamento)
        const { data: userConsultas } = await supabase
          .from('consultas')
          .select('id, pet_id, status, data_consulta, motivo, criado_em, pets(nome, especie), clinicas_parceiras(nome)')
          .eq('tutor_id', user.id)
          .in('status', ['agendada', 'em_andamento', 'solicitada'])
          .order('criado_em', { ascending: false })
          .limit(1);

        if (userConsultas && userConsultas.length > 0) {
          const c = userConsultas[0];
          setActiveConsulta({
            ...c,
            pets: Array.isArray(c.pets) ? c.pets[0] : c.pets,
            clinicas_parceiras: Array.isArray(c.clinicas_parceiras) ? c.clinicas_parceiras[0] : c.clinicas_parceiras
          });
        }

      } catch (error) {
        console.error("Erro ao carregar dados do usuário:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      
      {/* PAINEL DE ACOMPANHAMENTO EM TEMPO REAL */}
      {!isLoading && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                Acompanhamento em Tempo Real
              </h2>
              <p className="text-xs text-gray-500">Status dos seus agendamentos e filas nos serviços municipais</p>
            </div>
            <Link 
              to="/app/filas" 
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 transition-colors"
            >
              Ver todas as minhas filas e atendimentos <ChevronRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* CARD 1: FILA DE CASTRAÇÃO */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs flex flex-col justify-between hover:border-emerald-300 transition-colors">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                    <Scissors size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">Fila de Castração Gratuita</h3>
                    <p className="text-xs text-gray-500">Programa Municipal de Castração</p>
                  </div>
                </div>

                {activeCastracao ? (
                  activeCastracao.status === 'agendado' ? (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-900 border border-blue-200">
                      Agendada
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">
                      Na Fila ({activeCastracao.posicao}º Lugar)
                    </span>
                  )
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-600">
                    Sem pet na fila
                  </span>
                )}
              </div>

              {activeCastracao ? (
                <div className="bg-amber-50/50 rounded-xl p-3 border border-amber-100 mb-3 space-y-1 text-xs">
                  <p className="font-semibold text-gray-800">
                    Animal: <span className="text-amber-900 font-bold">{activeCastracao.pets?.nome || 'Pet'}</span>
                  </p>
                  {activeCastracao.status === 'agendado' && activeCastracao.data_agendada ? (
                    <p className="text-blue-900 font-medium flex items-center gap-1">
                      <Calendar size={13} /> Cirurgia marcada para: {new Date(activeCastracao.data_agendada).toLocaleDateString('pt-BR')}
                    </p>
                  ) : (
                    <p className="text-amber-800 flex items-center gap-1">
                      <Clock size={13} /> Posição atual: <strong className="text-amber-950 font-extrabold">{activeCastracao.posicao}º Lugar na fila de espera</strong>
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-xs text-gray-500 mb-4">
                  Você não possui animais na fila de castração no momento.
                </p>
              )}

              <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                {activeCastracao ? (
                  <Link 
                    to="/app/filas?tab=castracao" 
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                  >
                    Ver detalhes da fila <ChevronRight size={14} />
                  </Link>
                ) : (
                  <Link 
                    to="/app/filas/castracao" 
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                  >
                    + Inscrever animal na castração <ChevronRight size={14} />
                  </Link>
                )}
              </div>
            </div>

            {/* CARD 2: CONSULTAS VETERINÁRIAS */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs flex flex-col justify-between hover:border-emerald-300 transition-colors">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
                    <Stethoscope size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">Consultas Veterinárias</h3>
                    <p className="text-xs text-gray-500">Atendimento Clínico Municipal</p>
                  </div>
                </div>

                {activeConsulta ? (
                  activeConsulta.data_consulta ? (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-900 border border-blue-200">
                      Confirmada
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">
                      Aguardando Triagem
                    </span>
                  )
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-600">
                    Nenhuma consulta
                  </span>
                )}
              </div>

              {activeConsulta ? (
                <div className="bg-blue-50/50 rounded-xl p-3 border border-blue-100 mb-3 space-y-1 text-xs">
                  <p className="font-semibold text-gray-800">
                    Paciente: <span className="text-blue-900 font-bold">{activeConsulta.pets?.nome || 'Pet'}</span>
                  </p>
                  <p className="text-gray-600 truncate">
                    Motivo: <span className="text-gray-800">{activeConsulta.motivo}</span>
                  </p>
                  {activeConsulta.data_consulta ? (
                    <p className="text-blue-900 font-bold flex items-center gap-1">
                      <Calendar size={13} /> Consulta agendada para: {new Date(activeConsulta.data_consulta).toLocaleDateString('pt-BR')} às {new Date(activeConsulta.data_consulta).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  ) : (
                    <p className="text-amber-800 font-medium flex items-center gap-1">
                      <Clock size={13} /> Aguardando análise da equipe municipal
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-xs text-gray-500 mb-4">
                  Seu pet não possui nenhuma consulta em aberto.
                </p>
              )}

              <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                {activeConsulta ? (
                  <Link 
                    to="/app/filas?tab=consulta" 
                    className="text-xs font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1"
                  >
                    Acompanhar atendimento <ChevronRight size={14} />
                  </Link>
                ) : (
                  <Link 
                    to="/app/filas/consulta" 
                    className="text-xs font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1"
                  >
                    + Agendar consulta veterinária <ChevronRight size={14} />
                  </Link>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* SEÇÃO PRINCIPAL: MEUS PETS */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Meus Animais ({pets.length})</h1>
            <p className="text-sm text-gray-500 mt-1">Gerencie os animais cadastrados, emita a Carteirinha Digital e solicite serviços</p>
          </div>
          <div className="flex items-center gap-2">
            <Link 
              to="/app/filas/castracao"
              className="bg-amber-50 text-amber-800 border border-amber-200 px-4 py-2.5 rounded-lg font-medium hover:bg-amber-100 transition-colors flex items-center justify-center text-sm shadow-xs"
            >
              <Scissors className="w-4 h-4 mr-1.5" /> Castração
            </Link>
            <Link 
              to="/app/filas/consulta"
              className="bg-blue-50 text-blue-800 border border-blue-200 px-4 py-2.5 rounded-lg font-medium hover:bg-blue-100 transition-colors flex items-center justify-center text-sm shadow-xs"
            >
              <Stethoscope className="w-4 h-4 mr-1.5" /> Consulta
            </Link>
            <Link 
              to="/app/meus-pets/novo"
              className="bg-emerald-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center text-sm shadow-sm"
            >
              <Plus className="w-4 h-4 mr-1.5" /> Cadastrar Pet
            </Link>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
          </div>
        ) : pets.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center shadow-sm">
            <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
              <Dog className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Nenhum pet cadastrado</h2>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto text-sm">
              Você ainda não cadastrou nenhum animal. Cadastre seu cão ou gato para emitir a Carteirinha Digital oficial e ter acesso a castrações e consultas gratuitas.
            </p>
            <Link 
              to="/app/meus-pets/novo"
              className="inline-flex items-center justify-center bg-emerald-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-emerald-700 transition-colors shadow-sm text-sm"
            >
              <Plus className="w-5 h-5 mr-2" /> Cadastrar Meu Primeiro Pet
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {pets.map(pet => (
              <Link 
                key={pet.id} 
                to={`/app/meus-pets/${pet.id}`} 
                className="bg-white rounded-2xl shadow-xs border border-gray-200 overflow-hidden hover:shadow-md hover:border-emerald-300 transition-all group flex flex-col"
              >
                <div className="h-48 bg-slate-50 relative flex items-center justify-center overflow-hidden border-b border-gray-100">
                  {pet.fotos_pet && pet.fotos_pet.length > 0 ? (
                    <img src={pet.fotos_pet[0].url} alt={pet.nome} className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    pet.especie === 'gato' ? <Cat className="w-16 h-16 text-gray-300" /> : <Dog className="w-16 h-16 text-gray-300" />
                  )}
                  <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors"></div>
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">{pet.nome}</h3>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        pet.status === 'perdido' ? 'bg-red-100 text-red-800 border border-red-200' : 
                        pet.status === 'para_adocao' ? 'bg-blue-100 text-blue-800 border border-blue-200' : 
                        pet.status === 'obito' ? 'bg-gray-100 text-gray-800 border border-gray-200' : 
                        'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}>
                        {pet.status === 'com_tutor' ? 'COMIGO' : 
                         pet.status === 'para_adocao' ? 'PARA ADOÇÃO' : 
                         pet.status === 'obito' ? 'ÓBITO' : 'PERDIDO'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 capitalize">{pet.especie} • {pet.raca}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-emerald-700 font-semibold group-hover:translate-x-0.5 transition-transform">
                    <span>Ver carteirinha e detalhes</span>
                    <ChevronRight size={14} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default MeusPets;
