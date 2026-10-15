import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Calendar, MapPin, Share2, Users, Clock, Heart } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

export default function FeirasPublicas() {
  const [feiras, setFeiras] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeirasPublicas();
  }, []);

  const fetchFeirasPublicas = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('feiras')
        .select('*')
        .order('data', { ascending: true });

      if (error) throw error;
      setFeiras(data || []);
    } catch (error) {
      console.error('Erro ao buscar feiras:', error);
    } finally {
      setLoading(false);
    }
  };

  const compartilhar = (feira: any) => {
    if (navigator.share) {
      navigator.share({
        title: feira.titulo,
        text: `Venha participar da ${feira.titulo} no ${feira.local}! Encontre seu novo melhor amigo de quatro patas.`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copiado para a área de transferência!');
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-5xl py-8">
      <div className="text-center mb-10 mt-2">
        <h1 className="text-3xl sm:text-4xl font-bold text-emerald-950 mb-3 flex items-center justify-center gap-2">
          <Calendar className="w-9 h-9 text-emerald-600" /> Feiras de Adoção de Animais
        </h1>
        <p className="text-base text-gray-600 max-w-2xl mx-auto">
          Participe dos eventos presenciais no município e encontre seu novo melhor amigo vacinado e castrado.
        </p>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-900 border-b pb-3">Eventos Programados</h2>

        {loading ? (
          <div className="p-12 text-center text-gray-500">Carregando feiras de adoção...</div>
        ) : feiras.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border text-center space-y-3">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto" />
            <h3 className="text-lg font-bold text-gray-800">Nenhuma feira pública agendada no momento</h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              Em breve anunciaremos novas datas. Você também pode conferir os animais disponíveis online na nossa aba de Adoção.
            </p>
            <div className="pt-2">
              <Link to="/animais">
                <Button className="bg-emerald-600 hover:bg-emerald-700">Ver Animais para Adoção Online</Button>
              </Link>
            </div>
          </div>
        ) : (
          feiras.map(feira => (
            <div key={feira.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col md:flex-row hover:border-emerald-300 transition-all">
              <div className="w-full md:w-1/3 min-h-[180px] bg-emerald-50 flex items-center justify-center p-6 text-emerald-700">
                <div className="text-center">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2 text-emerald-700">
                    <Heart size={32} fill="currentColor" />
                  </div>
                  <span className="font-bold text-sm block">Evento de Adoção</span>
                  <span className="text-xs text-emerald-600 font-medium">Entrada Gratuita</span>
                </div>
              </div>

              <div className="p-6 md:w-2/3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                      {feira.status === 'agendada' ? 'Confirmado' : feira.status === 'em_andamento' ? 'Acontecendo Hoje' : 'Encerrada'}
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{feira.titulo}</h3>

                  <div className="space-y-1.5 mb-4 text-sm text-gray-700">
                    <div className="flex items-center">
                      <Calendar size={16} className="mr-2 text-emerald-600 flex-shrink-0" />
                      <span className="font-medium">
                        {new Date(feira.data + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
                      </span>
                    </div>

                    {(feira.horario_inicio || feira.horario_fim) && (
                      <div className="flex items-center">
                        <Clock size={16} className="mr-2 text-gray-400 flex-shrink-0" />
                        <span>Das {feira.horario_inicio || '09:00'} às {feira.horario_fim || '16:00'}</span>
                      </div>
                    )}

                    <div className="flex items-start">
                      <MapPin size={16} className="mr-2 text-gray-400 flex-shrink-0 mt-0.5" />
                      <span>{feira.local} {feira.endereco ? `• ${feira.endereco}` : ''}</span>
                    </div>
                  </div>

                  {feira.descricao && (
                    <p className="text-sm text-gray-600 mb-4 bg-gray-50 p-3 rounded-xl border">
                      {feira.descricao}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-3 pt-3 border-t">
                  <Link to="/animais">
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-sm">
                      Ver Animais para Adotar
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    onClick={() => compartilhar(feira)}
                    className="border-gray-300 text-gray-700 hover:bg-gray-50 text-sm flex items-center gap-1.5"
                  >
                    <Share2 size={16} /> Compartilhar Evento
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
