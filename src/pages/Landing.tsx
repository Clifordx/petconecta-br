import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  Stethoscope, 
  AlertTriangle, 
  Home, 
  Calendar, 
  CreditCard, 
  Shield, 
  Dog, 
  ArrowRight, 
  ArrowUpRight,
  ShoppingBag, 
  Sparkles, 
  Printer,
  CheckCircle2,
  Package,
  QrCode,
  Scissors,
  Megaphone
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getMockAdocaoPets } from '@/lib/mockPets';

const FeatureCard = ({ icon: Icon, title, description }: { icon: any, title: string, description: string }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-100 hover:shadow-md hover:border-emerald-300 hover:-translate-y-0.5 transition-all flex flex-col justify-between">
    <div>
      <div className="h-12 w-12 bg-emerald-100/80 text-emerald-700 rounded-2xl flex items-center justify-center mb-4">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-black text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
    </div>
  </div>
);

const Landing = () => {
  const [petsAdocao, setPetsAdocao] = useState<any[]>(() => getMockAdocaoPets().slice(0, 4));

  useEffect(() => {
    const carregarPetsDestaque = async () => {
      try {
        const { data, error } = await supabase
          .from('pets')
          .select('*, fotos_pet(url, is_principal)')
          .eq('status', 'para_adocao')
          .order('criado_em', { ascending: false })
          .limit(4);

        if (!error && data && data.length > 0) {
          const mockList = getMockAdocaoPets();
          const idsBanco = new Set(data.map((p: any) => p.id));
          const combinados = [...data, ...mockList.filter((m: any) => !idsBanco.has(m.id))].slice(0, 4);
          setPetsAdocao(combinados);
        }
      } catch {
        // Mantém a prévia oficial instantânea
      }
    };
    carregarPetsDestaque();
  }, []);

  const getFotoPet = (pet: any) => {
    if (pet.foto_url) return pet.foto_url;
    if (pet.fotos_pet && pet.fotos_pet.length > 0) {
      const principal = pet.fotos_pet.find((f: any) => f.is_principal);
      return principal?.url || pet.fotos_pet[0].url;
    }
    return 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=600';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-emerald-500 selection:text-white">
      
      {/* ============================================================== */}
      {/* 1. HERO SECTION SPLIT MODERNA COM TEXTURA DOT-GRID             */}
      {/* ============================================================== */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/75 via-white to-slate-50 pt-10 pb-20 sm:pt-14 sm:pb-28">
        {/* Textura sutil de pontinhos (Dot Grid) */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.06]"
          style={{
            backgroundImage: 'radial-gradient(#059669 1.25px, transparent 1.25px)',
            backgroundSize: '24px 24px'
          }}
        ></div>

        {/* Glows decorativos de fundo */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-300/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/3 left-10 w-80 h-80 bg-teal-200/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            
            {/* COLUNA ESQUERDA: Textos, Pílula e CTAs */}
            <div className="lg:col-span-7 text-left space-y-6">
              
              {/* Pílula Institucional */}
              <div className="inline-flex items-center gap-2 bg-emerald-100/90 border border-emerald-300/80 text-emerald-950 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider backdrop-blur-xs shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                <span>🏛️ Programa Oficial de Bem-Estar Animal • Arapongas - PR</span>
              </div>

              {/* Título Principal */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
                Cuidando dos nossos <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700">amigos de quatro patas</span>
              </h1>

              {/* Subtítulo */}
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl font-medium">
                O ecossistema público e solidário do Paraná para cadastrar pets, emitir <strong>RG Animal com QR Code</strong>, solicitar <strong>castrações e consultas gratuitas</strong>, acessar o <strong>Banco de Ração</strong> e apoiar a causa animal.
              </p>

              {/* Botões de Ação com Hierarquia Clara */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                <Link 
                  to="/cadastro" 
                  className="inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-7 py-4 rounded-2xl font-black text-base shadow-xl shadow-emerald-600/25 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  <span>Cadastrar Meu Pet</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>

                <Link 
                  to="/animais" 
                  className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-800 hover:text-emerald-700 border-2 border-slate-200 hover:border-emerald-300 px-6 py-4 rounded-2xl font-bold text-base shadow-xs transition-all cursor-pointer"
                >
                  <Heart className="w-5 h-5 text-rose-500 fill-rose-500/20" />
                  <span>Animais para Adoção</span>
                </Link>
              </div>

              {/* Prova Social / Comunidade */}
              <div className="pt-5 border-t border-slate-200/80 flex flex-wrap items-center gap-4">
                <div className="flex -space-x-2">
                  <img 
                    className="w-10 h-10 rounded-full border-2 border-white object-cover shadow-xs" 
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150" 
                    alt="Tutor" 
                  />
                  <img 
                    className="w-10 h-10 rounded-full border-2 border-white object-cover shadow-xs" 
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150" 
                    alt="Tutor" 
                  />
                  <img 
                    className="w-10 h-10 rounded-full border-2 border-white object-cover shadow-xs" 
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150" 
                    alt="Tutor" 
                  />
                  <div className="w-10 h-10 rounded-full border-2 border-white bg-emerald-600 text-white text-xs font-black flex items-center justify-center shadow-xs">
                    +5k
                  </div>
                </div>
                <div className="text-xs text-slate-600 leading-snug">
                  <span className="font-black text-slate-900 flex items-center gap-1">
                    Comunidade Ativa de Arapongas
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline" />
                  </span>
                  Mais de 5.200 tutores, protetores e clínicas credenciadas
                </div>
              </div>
            </div>

            {/* COLUNA DIREITA: Composição Visual com Foto e Card Flutuante Clicável */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                
                {/* Imagem Principal */}
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-slate-200 aspect-[4/3] sm:aspect-[5/4] group">
                  <img
                    src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=1000"
                    alt="Cães e gatos saudáveis sob proteção animal"
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-slate-950/10 to-transparent"></div>
                  
                  {/* Badge na base da foto */}
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <span className="inline-flex items-center gap-1.5 bg-emerald-500/90 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full backdrop-blur-xs mb-1.5 shadow-xs">
                      ✓ Proteção Animal Integrada
                    </span>
                    <h4 className="text-base sm:text-lg font-black leading-snug drop-shadow-xs">
                      Saúde, acolhimento e posse responsável em Arapongas.
                    </h4>
                  </div>
                </div>

                {/* Card Flutuante Superior Clicável: RG Animal Inteligente */}
                <Link 
                  to="/loja"
                  title="Ver Plaquinha com QR Code na Lojinha 3D"
                  className="group absolute -top-5 -left-3 sm:-left-6 bg-white/95 hover:bg-white backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-purple-100 hover:border-purple-300 flex items-center gap-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-purple-100 group-hover:bg-purple-600 text-purple-700 group-hover:text-white flex items-center justify-center font-bold flex-shrink-0 transition-colors">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div className="pr-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 block">RG Animal Oficial</span>
                    <strong className="text-xs font-black text-slate-900 flex items-center gap-1">
                      Carteirinha com QR Code
                      <ArrowUpRight className="w-3.5 h-3.5 text-purple-600 opacity-70 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </strong>
                  </div>
                </Link>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 2. ACESSO RÁPIDO AOS SERVIÇOS MUNICIPAIS (ÍCONES ÚNICOS)       */}
      {/* ============================================================== */}
      <section className="relative z-20 -mt-10 sm:-mt-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 w-full">
        <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-xl shadow-slate-200/70 border border-slate-200/90">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 block">
                Atalhos Rápidos • Portal do Cidadão
              </span>
              <h3 className="text-lg sm:text-xl font-black text-slate-900">
                Acesse os Serviços Municipais em 1 Clique
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              Navegue pelos programas e atendimentos
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            
            {/* 1. Castração */}
            <Link 
              to="/cadastro" 
              className="relative group bg-slate-50/80 hover:bg-emerald-50 p-4 rounded-2xl border border-slate-200/80 hover:border-emerald-300 transition-all duration-200 text-center flex flex-col items-center cursor-pointer hover:-translate-y-1 hover:shadow-md"
            >
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600 absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-11 h-11 rounded-xl bg-emerald-100 group-hover:bg-emerald-600 text-emerald-700 group-hover:text-white flex items-center justify-center mb-2.5 transition-colors">
                <Scissors className="w-5 h-5" />
              </div>
              <strong className="text-xs font-black text-slate-900 group-hover:text-emerald-950">Castração</strong>
              <span className="text-[11px] font-medium text-slate-600 mt-0.5">Fila pública</span>
            </Link>

            {/* 2. Banco de Ração */}
            <Link 
              to="/app/banco-racao" 
              className="relative group bg-slate-50/80 hover:bg-amber-50 p-4 rounded-2xl border border-slate-200/80 hover:border-amber-300 transition-all duration-200 text-center flex flex-col items-center cursor-pointer hover:-translate-y-1 hover:shadow-md"
            >
              <ArrowUpRight className="w-3.5 h-3.5 text-amber-600 absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-11 h-11 rounded-xl bg-amber-100 group-hover:bg-amber-600 text-amber-800 group-hover:text-white flex items-center justify-center mb-2.5 transition-colors">
                <Package className="w-5 h-5" />
              </div>
              <strong className="text-xs font-black text-slate-900 group-hover:text-amber-950">Banco de Ração</strong>
              <span className="text-[11px] font-medium text-slate-600 mt-0.5">Cotas de 25kg</span>
            </Link>

            {/* 3. Lojinha Pet & 3D */}
            <Link 
              to="/loja" 
              className="relative group bg-slate-50/80 hover:bg-purple-50 p-4 rounded-2xl border border-slate-200/80 hover:border-purple-300 transition-all duration-200 text-center flex flex-col items-center cursor-pointer hover:-translate-y-1 hover:shadow-md"
            >
              <ArrowUpRight className="w-3.5 h-3.5 text-purple-600 absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-11 h-11 rounded-xl bg-purple-100 group-hover:bg-purple-600 text-purple-700 group-hover:text-white flex items-center justify-center mb-2.5 transition-colors">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <strong className="text-xs font-black text-slate-900 group-hover:text-purple-950">Lojinha &amp; 3D</strong>
              <span className="text-[11px] font-medium text-slate-600 mt-0.5">Plaquinhas QR</span>
            </Link>

            {/* 4. SOS Perdidos */}
            <Link 
              to="/sos" 
              className="relative group bg-slate-50/80 hover:bg-red-50 p-4 rounded-2xl border border-slate-200/80 hover:border-red-300 transition-all duration-200 text-center flex flex-col items-center cursor-pointer hover:-translate-y-1 hover:shadow-md"
            >
              <ArrowUpRight className="w-3.5 h-3.5 text-red-600 absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-11 h-11 rounded-xl bg-red-100 group-hover:bg-red-600 text-red-700 group-hover:text-white flex items-center justify-center mb-2.5 transition-colors">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <strong className="text-xs font-black text-slate-900 group-hover:text-red-950">SOS Perdidos</strong>
              <span className="text-[11px] font-medium text-slate-600 mt-0.5">Cartaz imediato</span>
            </Link>

            {/* 5. Adoção */}
            <Link 
              to="/animais" 
              className="relative group bg-slate-50/80 hover:bg-rose-50 p-4 rounded-2xl border border-slate-200/80 hover:border-rose-300 transition-all duration-200 text-center flex flex-col items-center cursor-pointer hover:-translate-y-1 hover:shadow-md"
            >
              <ArrowUpRight className="w-3.5 h-3.5 text-rose-600 absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-11 h-11 rounded-xl bg-rose-100 group-hover:bg-rose-600 text-rose-700 group-hover:text-white flex items-center justify-center mb-2.5 transition-colors">
                <Heart className="w-5 h-5" />
              </div>
              <strong className="text-xs font-black text-slate-900 group-hover:text-rose-950">Adoção</strong>
              <span className="text-[11px] font-medium text-slate-600 mt-0.5">Encontre seu pet</span>
            </Link>

            {/* 6. Denúncias */}
            <Link 
              to="/denuncia" 
              className="relative group bg-slate-50/80 hover:bg-slate-100 p-4 rounded-2xl border border-slate-200/80 hover:border-slate-400 transition-all duration-200 text-center flex flex-col items-center cursor-pointer hover:-translate-y-1 hover:shadow-md"
            >
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-600 absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-11 h-11 rounded-xl bg-slate-200 group-hover:bg-slate-800 text-slate-700 group-hover:text-white flex items-center justify-center mb-2.5 transition-colors">
                <Megaphone className="w-5 h-5" />
              </div>
              <strong className="text-xs font-black text-slate-900 group-hover:text-slate-950">Denúncias</strong>
              <span className="text-[11px] font-medium text-slate-600 mt-0.5">Canal sigiloso</span>
            </Link>

          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 3. SEÇÃO NOSSOS NÚMEROS (MODERNIZADA COM GLASSMORPHISM)         */}
      {/* ============================================================== */}
      <section className="py-20 bg-gradient-to-br from-emerald-800 via-emerald-900 to-teal-950 text-white relative overflow-hidden">
        {/* Glows de ambientação */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-black uppercase tracking-widest text-emerald-300 block mb-1">
              Impacto Municipal Comprovado
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Resultados reais para a causa animal
            </h2>
            <p className="text-emerald-100/80 text-sm mt-2 font-medium">
              Acompanhe o alcance das ações públicas integradas em Arapongas e municípios parceiros.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            
            <div className="bg-white/10 backdrop-blur-md border border-white/15 p-6 rounded-3xl hover:bg-white/15 transition-all text-left">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center mb-3">
                <Dog className="w-6 h-6" />
              </div>
              <div className="text-3xl sm:text-4xl font-black text-white tracking-tight">10k+</div>
              <div className="text-xs font-bold text-emerald-200 mt-1">Animais Cadastrados</div>
              <p className="text-[11px] text-emerald-100/70 mt-1">Com RG Digital e histórico de vacinas</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/15 p-6 rounded-3xl hover:bg-white/15 transition-all text-left">
              <div className="w-11 h-11 rounded-2xl bg-rose-500/20 text-rose-300 flex items-center justify-center mb-3">
                <Heart className="w-6 h-6" />
              </div>
              <div className="text-3xl sm:text-4xl font-black text-white tracking-tight">5.2k</div>
              <div className="text-xs font-bold text-emerald-200 mt-1">Adoções Felizes</div>
              <p className="text-[11px] text-emerald-100/70 mt-1">Lares responsáveis formalizados</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/15 p-6 rounded-3xl hover:bg-white/15 transition-all text-left">
              <div className="w-11 h-11 rounded-2xl bg-teal-500/20 text-teal-300 flex items-center justify-center mb-3">
                <Stethoscope className="w-6 h-6" />
              </div>
              <div className="text-3xl sm:text-4xl font-black text-white tracking-tight">15k</div>
              <div className="text-xs font-bold text-emerald-200 mt-1">Castrações Realizadas</div>
              <p className="text-[11px] text-emerald-100/70 mt-1">Em clínicas veterinárias parceiras</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/15 p-6 rounded-3xl hover:bg-white/15 transition-all text-left">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center mb-3">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="text-3xl sm:text-4xl font-black text-white tracking-tight">2.5k</div>
              <div className="text-xs font-bold text-emerald-200 mt-1">Denúncias Atendidas</div>
              <p className="text-[11px] text-emerald-100/70 mt-1">Com protocolo e fiscalização ativa</p>
            </div>

          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 4. PRÉVIA VIVA: PETS ESPERANDO UM LAR EM ARAPONGAS             */}
      {/* ============================================================== */}
      <section className="py-20 bg-gradient-to-b from-slate-50 to-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 bg-rose-100 text-rose-800 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
                <Heart className="w-3.5 h-3.5 fill-rose-600 text-rose-600" />
                Adoção Responsável • Arapongas - PR
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Amigos esperando um lar cheio de carinho
              </h2>
              <p className="text-base text-slate-600 mt-2 max-w-2xl font-medium">
                Todos os animais disponíveis para adoção recebem acompanhamento, vacinação e termo oficial de posse responsável.
              </p>
            </div>
            <div>
              <Link
                to="/animais"
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3.5 rounded-2xl font-black text-sm shadow-lg shadow-emerald-600/20 transition-all hover:scale-105 cursor-pointer"
              >
                <Heart className="w-4 h-4" />
                <span>Ver Todos para Adoção</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {petsAdocao.map((pet: any) => (
              <Link
                key={pet.id}
                to={`/animais/${pet.id}`}
                className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                    <img
                      src={getFotoPet(pet)}
                      alt={pet.nome}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-3 left-3 bg-emerald-600/95 backdrop-blur-xs text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-full shadow-xs">
                      Para Adoção
                    </span>
                    <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-xs text-slate-800 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-xs">
                      {['cachorro', 'cao', 'cão'].includes(pet.especie?.toLowerCase()) ? '🐶 Cão' : '🐱 Gato'}
                    </span>
                  </div>

                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-black text-slate-900 group-hover:text-emerald-700 transition-colors">
                        {pet.nome}
                      </h3>
                      <span className="text-[11px] font-bold text-slate-500 capitalize">
                        {pet.sexo === 'femea' ? 'Fêmea' : 'Macho'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-1 font-medium">
                      {pet.raca || 'Sem raça definida'} • Porte {pet.porte ? pet.porte.charAt(0).toUpperCase() + pet.porte.slice(1) : 'Médio'}
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {pet.castrado && (
                        <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-md border border-blue-100">
                          ✓ Castrado
                        </span>
                      )}
                      {pet.vacinado && (
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-md border border-emerald-100">
                          ✓ Vacinado
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="px-4 pb-4 pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-black text-emerald-700 group-hover:text-emerald-800">
                  <span>Conhecer {pet.nome}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 5. TUDO PARA O BEM-ESTAR ANIMAL (CARDS DE RECURSOS)             */}
      {/* ============================================================== */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-xs font-black uppercase tracking-widest text-emerald-600 block mb-1">
              Plataforma Completa
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4 tracking-tight">
              Tudo para o bem-estar animal em um só lugar
            </h2>
            <p className="text-base text-slate-600 max-w-2xl mx-auto">
              Desenvolvido para conectar tutores, protetores independentes, ONGs e prefeituras em uma gestão transparente e humana.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <FeatureCard 
              icon={Scissors} 
              title="Castração Municipal" 
              description="Inscreva seus animais na fila pública de castração gratuita gerenciada pelas clínicas credenciadas." 
            />
            <FeatureCard 
              icon={Stethoscope} 
              title="Consultas Veterinárias" 
              description="Agende atendimentos em clínicas conveniadas e hospitais veterinários públicos com guia de encaminhamento." 
            />
            <FeatureCard 
              icon={Package} 
              title="Banco de Ração Solidário" 
              description="Apoio alimentar mensal com sacos de 25kg para famílias de baixa renda (CadÚnico) e protetores registrados." 
            />
            <FeatureCard 
              icon={Home} 
              title="Adoção com Termo Digital" 
              description="Encontre seu novo melhor amigo ou formalize adoções em feiras com assinatura do termo direto na tela." 
            />
            <FeatureCard 
              icon={Calendar} 
              title="Feiras e Eventos" 
              description="Fique por dentro das feiras públicas de adoção e campanhas de vacinação na região de Arapongas." 
            />
            <FeatureCard 
              icon={CreditCard} 
              title="Carteirinha com QR Code" 
              description="Histórico de vacinas, microchip e dados do tutor acessíveis ao escanear a plaquinha do pet." 
            />
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 6. SEÇÃO LOJINHA PET & IMPRESSÃO 3D SOLIDÁRIA                  */}
      {/* ============================================================== */}
      <section className="py-20 bg-gradient-to-b from-white to-purple-50/40 border-y border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-900 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
                <Sparkles className="w-4 h-4 text-purple-600" />
                Lojinha PetConecta BR • Impressão 3D &amp; Acessórios
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Produtos Exclusivos para o seu Pet
              </h2>
              <p className="text-base text-slate-600 mt-2 max-w-2xl font-medium">
                Adquira itens personalizados em <strong>Impressão 3D</strong> (como plaquinhas inteligentes com QR Code), <strong>caminhas ortopédicas confortáveis</strong> e <strong>coleiras com nome gravado</strong>. Toda a renda apoia o Banco de Ração Municipal!
              </p>
            </div>
            <div>
              <Link
                to="/loja"
                className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3.5 rounded-2xl font-black text-sm shadow-lg shadow-purple-600/20 transition-all hover:scale-105 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Ver Todos os Produtos</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Card 1: Plaquinha 3D */}
            <div className="bg-white rounded-3xl border border-purple-200 overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col group">
              <div className="relative aspect-4/3 overflow-hidden bg-slate-100">
                <img
                  src="https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&q=80&w=800"
                  alt="Plaquinha 3D"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-3 left-3 bg-purple-600 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-lg shadow-xs flex items-center gap-1">
                  <Printer className="w-3 h-3" /> Impressão 3D
                </span>
                <span className="absolute top-3 right-3 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                  QR Code Integrado
                </span>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="font-black text-base text-slate-900 group-hover:text-purple-700 transition-colors">
                    Plaquinha de Identificação 3D
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Nome em relevo na frente e QR Code que abre a Carteirinha Digital ou WhatsApp do tutor no verso.
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xl font-black text-emerald-800">R$ 19,90</span>
                  <Link to="/loja" className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1">
                    Personalizar <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Card 2: Caminha Nuvem */}
            <div className="bg-white rounded-3xl border border-purple-200 overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col group">
              <div className="relative aspect-4/3 overflow-hidden bg-slate-100">
                <img
                  src="https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=800"
                  alt="Caminha Nuvem"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-3 left-3 bg-emerald-600 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-lg shadow-xs">
                  Conforto Máximo
                </span>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="font-black text-base text-slate-900 group-hover:text-purple-700 transition-colors">
                    Caminha Nuvem Ortopédica Antiestresse
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Pelúcia macia hipoalergênica, fundo impermeável e zíper para lavar na máquina. Vários tamanhos.
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xl font-black text-emerald-800">R$ 84,90</span>
                  <Link to="/loja" className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1">
                    Ver Opções <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Card 3: Coleira Personalizada */}
            <div className="bg-white rounded-3xl border border-purple-200 overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col group">
              <div className="relative aspect-4/3 overflow-hidden bg-slate-100">
                <img
                  src="https://images.unsplash.com/photo-1535294435445-d7249524ef2e?auto=format&fit=crop&q=80&w=800"
                  alt="Coleira Personalizada"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-3 left-3 bg-blue-600 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-lg shadow-xs">
                  Refletiva Noturna
                </span>
                <span className="absolute top-3 right-3 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                  Gravação a Laser
                </span>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="font-black text-base text-slate-900 group-hover:text-purple-700 transition-colors">
                    Coleira com Fivela Gravada a Laser
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Nylon reforçado com fitas refletivas e gravação a laser permanente do nome do animal e telefone.
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xl font-black text-emerald-800">R$ 42,00</span>
                  <Link to="/loja" className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1">
                    Personalizar <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 7. COMO FUNCIONA (PASSO A PASSO EM 3 ETAPAS)                   */}
      {/* ============================================================== */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-xs font-black uppercase tracking-widest text-emerald-600 block mb-1">
              Jornada do Cidadão
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-3 tracking-tight">
              Como funciona o PetConecta BR
            </h2>
            <p className="text-base text-slate-600">Simples, rápido e feito para facilitar sua vida e a do seu pet.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center">
              <div className="w-14 h-14 bg-emerald-600 text-white rounded-2xl flex items-center justify-center text-xl font-black mx-auto mb-6 shadow-lg shadow-emerald-600/30">
                1
              </div>
              <h3 className="text-lg font-black mb-2 text-slate-900">Crie sua Conta</h3>
              <p className="text-sm text-slate-600 leading-relaxed">Cadastre-se rapidamente no sistema com seu nome e telefone direto pelo celular.</p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center">
              <div className="w-14 h-14 bg-emerald-600 text-white rounded-2xl flex items-center justify-center text-xl font-black mx-auto mb-6 shadow-lg shadow-emerald-600/30">
                2
              </div>
              <h3 className="text-lg font-black mb-2 text-slate-900">Cadastre seus Pets</h3>
              <p className="text-sm text-slate-600 leading-relaxed">Adicione fotos, raça, dados de vacinas e gere a Carteirinha Digital com QR Code.</p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center">
              <div className="w-14 h-14 bg-emerald-600 text-white rounded-2xl flex items-center justify-center text-xl font-black mx-auto mb-6 shadow-lg shadow-emerald-600/30">
                3
              </div>
              <h3 className="text-lg font-black mb-2 text-slate-900">Acesse os Serviços</h3>
              <p className="text-sm text-slate-600 leading-relaxed">Solicite castração, solicite cotas do Banco de Ração e acompanhe seus atendimentos.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 8. CTA PARA ONGS, PROTETORES E PREFEITURAS                      */}
      {/* ============================================================== */}
      <section className="bg-slate-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-white text-center md:text-left">
            <span className="text-xs font-black uppercase tracking-widest text-emerald-400 block mb-1">
              Rede de Proteção Animal
            </span>
            <h2 className="text-2xl sm:text-3xl font-black mb-2 tracking-tight">
              Você é uma ONG, Protetor Independente ou Clínica?
            </h2>
            <p className="text-slate-400 text-sm sm:text-base max-w-2xl font-medium">
              Junte-se à nossa rede municipal integrada para gestão de castrações, vagas credenciadas, Banco de Ração e feiras de adoção.
            </p>
          </div>
          <div>
            <Link 
              to="/cadastro-parceiro" 
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-8 py-4 rounded-2xl font-black text-sm shadow-xl transition-all hover:scale-105 cursor-pointer whitespace-nowrap"
            >
              <span>Cadastrar como Parceiro</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 9. FOOTER INSTITUCIONAL                                        */}
      {/* ============================================================== */}
      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-500 text-xs space-y-3">
          <div className="flex justify-center items-center gap-2 text-emerald-700">
            <Dog className="h-6 w-6" />
            <span className="text-lg font-black tracking-tight text-slate-900">PetConecta BR</span>
          </div>
          <p>© {new Date().getFullYear()} Sistema Integrado de Gestão e Bem-Estar Animal do Paraná. Todos os direitos reservados.</p>
          <div className="flex justify-center items-center gap-4 text-slate-400 pt-1">
            <Link to="/animais" className="hover:text-emerald-700 transition-colors">Adoção de Pets</Link>
            <span>•</span>
            <Link to="/loja" className="hover:text-emerald-700 transition-colors">Lojinha &amp; Plaquinhas 3D</Link>
            <span>•</span>
            <Link to="/sos" className="hover:text-emerald-700 transition-colors">SOS Pets Perdidos</Link>
            <span>•</span>
            <Link to="/denuncia" className="hover:text-emerald-700 transition-colors">Canal de Denúncias</Link>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Landing;
