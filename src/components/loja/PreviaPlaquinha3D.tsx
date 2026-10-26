import React, { useState } from 'react';
import { QrCode, Phone, Sparkles, RefreshCw, Dog, ShieldCheck, Heart } from 'lucide-react';

interface PreviaPlaquinha3DProps {
  nomePet?: string;
  telefone?: string;
  cor?: string;
  formato?: string;
  categoria?: string;
}

export default function PreviaPlaquinha3D({
  nomePet = '',
  telefone = '',
  cor = 'Azul Royal',
  formato = 'Ossinho Clássico',
  categoria = 'impressao_3d'
}: PreviaPlaquinha3DProps) {
  const [lado, setLado] = useState<'frente' | 'verso'>('frente');

  // Mapeamento de cores de filamento 3D com gradiente e brilho metálico
  const colorStyles: Record<string, { bg: string; text: string; shadow: string; border: string }> = {
    'Azul Royal': {
      bg: 'from-blue-600 via-blue-700 to-indigo-900',
      text: 'text-white',
      shadow: 'shadow-blue-500/40',
      border: 'border-blue-400/50'
    },
    'Rosa Chiclete': {
      bg: 'from-pink-500 via-pink-600 to-rose-700',
      text: 'text-white',
      shadow: 'shadow-pink-500/40',
      border: 'border-pink-300/50'
    },
    'Dourado Ouro': {
      bg: 'from-amber-400 via-yellow-500 to-amber-700',
      text: 'text-amber-950',
      shadow: 'shadow-amber-500/40',
      border: 'border-yellow-200/60'
    },
    'Preto Fosco': {
      bg: 'from-zinc-800 via-zinc-900 to-black',
      text: 'text-white',
      shadow: 'shadow-zinc-900/40',
      border: 'border-zinc-700/60'
    },
    'Vermelho Rubi': {
      bg: 'from-red-600 via-red-700 to-rose-900',
      text: 'text-white',
      shadow: 'shadow-red-500/40',
      border: 'border-red-400/50'
    },
    'Verde Esmeralda': {
      bg: 'from-emerald-500 via-emerald-600 to-teal-800',
      text: 'text-white',
      shadow: 'shadow-emerald-500/40',
      border: 'border-emerald-300/50'
    }
  };

  const estiloAtual = colorStyles[cor] || colorStyles['Azul Royal'];

  const nomeExibido = nomePet.trim() ? nomePet.toUpperCase() : 'NOME DO PET';
  const telefoneExibido = telefone.trim() ? telefone : '(43) 99999-9999';

  return (
    <div className="bg-slate-900 rounded-3xl p-5 text-white shadow-xl border border-slate-800 flex flex-col items-center justify-between relative overflow-hidden">
      
      {/* Background decorativo */}
      <div className="absolute inset-0 bg-radial from-slate-800/60 via-slate-900 to-slate-950 pointer-events-none" />
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header da Prévia */}
      <div className="w-full flex items-center justify-between z-10 mb-4 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <span className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg">
            <Sparkles size={14} />
          </span>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
              Prévia Visual ao Vivo (Render 3D)
            </span>
            <span className="text-xs text-slate-300 font-semibold">
              Personalização em Tempo Real
            </span>
          </div>
        </div>

        {/* Alternador Frente / Verso */}
        <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs">
          <button
            type="button"
            onClick={() => setLado('frente')}
            className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
              lado === 'frente' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            Frente
          </button>
          <button
            type="button"
            onClick={() => setLado('verso')}
            className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
              lado === 'verso' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            Verso
          </button>
        </div>
      </div>

      {/* ÁREA DA PLAQUINHA RENDERIZADA */}
      <div className="relative z-10 py-6 px-4 flex flex-col items-center justify-center min-h-[190px] w-full">
        
        {/* Argola de Aço da Plaquinha 3D */}
        <div className="w-8 h-8 rounded-full border-4 border-slate-300 ring-2 ring-slate-500 bg-transparent mb-[-12px] z-20 shadow-lg relative flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-slate-900 border border-slate-400" />
        </div>

        {/* CORPO DA PLAQUINHA CONFORME O FORMATO */}
        {formato === 'Ossinho Clássico' ? (
          <div className="relative">
            {/* Lóbulo esquerdo superior */}
            <div className={`absolute -left-4 -top-3 w-10 h-10 rounded-full bg-gradient-to-br ${estiloAtual.bg} border ${estiloAtual.border} shadow-lg`} />
            {/* Lóbulo esquerdo inferior */}
            <div className={`absolute -left-4 -bottom-3 w-10 h-10 rounded-full bg-gradient-to-br ${estiloAtual.bg} border ${estiloAtual.border} shadow-lg`} />
            {/* Lóbulo direito superior */}
            <div className={`absolute -right-4 -top-3 w-10 h-10 rounded-full bg-gradient-to-br ${estiloAtual.bg} border ${estiloAtual.border} shadow-lg`} />
            {/* Lóbulo direito inferior */}
            <div className={`absolute -right-4 -bottom-3 w-10 h-10 rounded-full bg-gradient-to-br ${estiloAtual.bg} border ${estiloAtual.border} shadow-lg`} />
            
            {/* Placa central */}
            <div className={`relative z-10 px-8 py-5 min-w-[240px] max-w-[280px] rounded-2xl bg-gradient-to-br ${estiloAtual.bg} border-2 ${estiloAtual.border} shadow-2xl ${estiloAtual.shadow} text-center flex flex-col items-center justify-center`}>
              
              {lado === 'frente' ? (
                <>
                  <div className="flex items-center gap-1.5 opacity-80 mb-1">
                    <Dog size={12} className={estiloAtual.text} />
                    <span className={`text-[9px] font-black uppercase tracking-widest ${estiloAtual.text}`}>
                      PetConecta BR
                    </span>
                  </div>

                  <h3 className={`text-2xl font-black tracking-wider leading-none truncate max-w-[210px] ${estiloAtual.text} drop-shadow-[0_2px_3px_rgba(0,0,0,0.6)]`}>
                    {nomeExibido}
                  </h3>

                  <div className="mt-2.5 flex items-center gap-2 bg-white/95 px-3 py-1 rounded-full shadow-inner">
                    <QrCode size={14} className="text-slate-900" />
                    <span className="text-[10px] font-black text-slate-900 tracking-tight">
                      QR CODE INTELIGENTE
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 opacity-90 ${estiloAtual.text}`}>
                    Se eu me perder, ligue:
                  </p>
                  
                  <div className="bg-black/30 border border-white/20 px-3 py-1 rounded-xl my-1">
                    <p className={`text-sm font-black tracking-widest font-mono ${estiloAtual.text}`}>
                      {telefoneExibido}
                    </p>
                  </div>

                  <p className={`text-[9px] font-semibold mt-1 opacity-80 ${estiloAtual.text}`}>
                    Arapongas - Paraná
                  </p>
                </>
              )}

            </div>
          </div>
        ) : formato === 'Coração' ? (
          <div className={`relative px-8 py-7 min-w-[220px] max-w-[260px] rounded-[38px] bg-gradient-to-br ${estiloAtual.bg} border-2 ${estiloAtual.border} shadow-2xl ${estiloAtual.shadow} text-center flex flex-col items-center justify-center`}>
            {lado === 'frente' ? (
              <>
                <Heart size={14} className={`mb-1 opacity-80 ${estiloAtual.text}`} />
                <h3 className={`text-2xl font-black tracking-wider leading-none truncate max-w-[190px] ${estiloAtual.text} drop-shadow-[0_2px_3px_rgba(0,0,0,0.6)]`}>
                  {nomeExibido}
                </h3>
                <div className="mt-2 bg-white/95 px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shadow-inner">
                  <QrCode size={12} className="text-slate-900" />
                  <span className="text-[9px] font-black text-slate-900">QR CODE PET</span>
                </div>
              </>
            ) : (
              <>
                <p className={`text-[10px] font-bold uppercase opacity-90 mb-1 ${estiloAtual.text}`}>
                  Tutor / Emergência:
                </p>
                <div className="bg-black/30 border border-white/20 px-3 py-1 rounded-xl my-0.5">
                  <p className={`text-xs font-black font-mono tracking-wider ${estiloAtual.text}`}>
                    {telefoneExibido}
                  </p>
                </div>
                <p className={`text-[9px] opacity-80 mt-1 ${estiloAtual.text}`}>Arapongas - PR</p>
              </>
            )}
          </div>
        ) : (
          /* Formato Círculo Minimalista ou Patas 3D */
          <div className={`relative w-48 h-48 rounded-full bg-gradient-to-br ${estiloAtual.bg} border-4 ${estiloAtual.border} shadow-2xl ${estiloAtual.shadow} text-center flex flex-col items-center justify-center p-4 ring-4 ring-black/20`}>
            {lado === 'frente' ? (
              <>
                <div className="flex items-center gap-1 opacity-80 mb-1">
                  <ShieldCheck size={14} className={estiloAtual.text} />
                  <span className={`text-[9px] font-black tracking-widest ${estiloAtual.text}`}>ARAPONGAS</span>
                </div>
                <h3 className={`text-2xl font-black tracking-wider truncate max-w-[150px] ${estiloAtual.text} drop-shadow-[0_2px_3px_rgba(0,0,0,0.6)]`}>
                  {nomeExibido}
                </h3>
                <div className="mt-2 bg-white/95 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-inner">
                  <QrCode size={13} className="text-slate-900" />
                  <span className="text-[9px] font-black text-slate-900">QR CODE</span>
                </div>
              </>
            ) : (
              <>
                <p className={`text-[9px] font-bold uppercase opacity-90 mb-1 ${estiloAtual.text}`}>
                  Em caso de emergência:
                </p>
                <div className="bg-black/40 border border-white/20 px-2.5 py-1 rounded-lg">
                  <p className={`text-xs font-black font-mono tracking-wider ${estiloAtual.text}`}>
                    {telefoneExibido}
                  </p>
                </div>
                <p className={`text-[9px] font-semibold mt-1 opacity-80 ${estiloAtual.text}`}>
                  PetConecta BR
                </p>
              </>
            )}
          </div>
        )}

      </div>

      {/* Legenda Informativa */}
      <div className="w-full z-10 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Filamento PETG Naval (Anti-desgaste)</span>
        </div>
        <span className="font-bold text-slate-300">
          Cor: <strong className="text-emerald-400">{cor}</strong> • {formato}
        </span>
      </div>

    </div>
  );
}
