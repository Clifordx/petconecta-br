import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Stethoscope, AlertTriangle, Home, Calendar, CreditCard, Shield, Dog, Cat, ArrowRight } from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, description }: { icon: any, title: string, description: string }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-100 hover:shadow-md transition-shadow">
    <div className="h-12 w-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
      <Icon className="h-6 w-6" />
    </div>
    <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

const Landing = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-600">
            <Dog className="h-8 w-8" />
            <span className="text-2xl font-bold tracking-tight">PetConecta BR</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-gray-600 hover:text-emerald-600 font-medium hidden sm:block">Entrar</Link>
            <Link to="/cadastro" className="bg-emerald-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors">Cadastre-se</Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50 to-white pt-16 pb-24 sm:pt-24 sm:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-6xl font-extrabold text-gray-900 tracking-tight mb-6">
              Cuidando dos nossos <span className="text-emerald-600">amigos de quatro patas</span>
            </h1>
            <p className="text-xl text-gray-600 mb-10">
              O sistema integrado de bem-estar animal do Paraná. Cadastre seus pets, agende castrações, consultas e ajude animais de rua a encontrarem um lar.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/cadastro" className="bg-emerald-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-200">
                Começar Agora <ArrowRight className="h-5 w-5" />
              </Link>
              <Link to="/adocao" className="bg-white text-emerald-700 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 border-2 border-emerald-100 transition-colors flex items-center justify-center gap-2">
                <Heart className="h-5 w-5" /> Animais para Adoção
              </Link>
            </div>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-1/2 left-10 transform -translate-y-1/2 text-emerald-100 opacity-50 hidden lg:block">
          <Cat className="w-48 h-48" />
        </div>
        <div className="absolute top-1/2 right-10 transform -translate-y-1/2 text-emerald-100 opacity-50 hidden lg:block">
          <Dog className="w-48 h-48" />
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-emerald-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white">Nossos Números</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div className="bg-emerald-700/50 rounded-2xl p-6 backdrop-blur-sm">
              <div className="text-4xl font-extrabold text-white mb-2">10k+</div>
              <div className="text-emerald-100 font-medium">Animais Resgatados</div>
            </div>
            <div className="bg-emerald-700/50 rounded-2xl p-6 backdrop-blur-sm">
              <div className="text-4xl font-extrabold text-white mb-2">5.2k</div>
              <div className="text-emerald-100 font-medium">Adoções Felizes</div>
            </div>
            <div className="bg-emerald-700/50 rounded-2xl p-6 backdrop-blur-sm">
              <div className="text-4xl font-extrabold text-white mb-2">15k</div>
              <div className="text-emerald-100 font-medium">Castrações Realizadas</div>
            </div>
            <div className="bg-emerald-700/50 rounded-2xl p-6 backdrop-blur-sm">
              <div className="text-4xl font-extrabold text-white mb-2">2.5k</div>
              <div className="text-emerald-100 font-medium">Denúncias Atendidas</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Tudo para o bem-estar animal</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Uma plataforma completa para tutores, protetores, ONGs e prefeituras trabalharem juntos.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={Shield} 
              title="Castração Solidária" 
              description="Inscreva seus animais na fila de castração gratuita ou com valores sociais." 
            />
            <FeatureCard 
              icon={Stethoscope} 
              title="Consultas Veterinárias" 
              description="Agende atendimentos em clínicas conveniadas e hospitais veterinários públicos." 
            />
            <FeatureCard 
              icon={AlertTriangle} 
              title="Canal de Denúncias" 
              description="Reporte casos de maus-tratos ou abandono de forma anônima e segura." 
            />
            <FeatureCard 
              icon={Home} 
              title="Adoção Responsável" 
              description="Encontre seu novo melhor amigo ou cadastre animais resgatados para adoção." 
            />
            <FeatureCard 
              icon={Calendar} 
              title="Feiras e Eventos" 
              description="Fique por dentro das feiras de adoção e campanhas de vacinação na sua região." 
            />
            <FeatureCard 
              icon={CreditCard} 
              title="Carteirinha Digital" 
              description="Tenha todo o histórico médico e de vacinas do seu pet sempre em mãos." 
            />
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Como Funciona</h2>
            <p className="text-lg text-gray-600">Simples, rápido e feito para ajudar.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-12 relative">
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 relative z-10 shadow-lg">1</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Crie sua Conta</h3>
              <p className="text-gray-600">Cadastre-se rapidamente no sistema informando seus dados básicos.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 relative z-10 shadow-lg">2</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Cadastre seus Pets</h3>
              <p className="text-gray-600">Adicione as informações dos seus animais, como fotos, raça e histórico de vacinas.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 relative z-10 shadow-lg">3</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Acesse os Serviços</h3>
              <p className="text-gray-600">Solicite castração, agende consultas ou visualize a carteirinha digital.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA para ONGs/Prefeituras */}
      <section className="bg-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-white text-center md:text-left">
            <h2 className="text-3xl font-bold mb-4">Você é uma ONG, Protetor ou Prefeitura?</h2>
            <p className="text-gray-400 text-lg max-w-2xl">Junte-se à nossa rede e utilize nossas ferramentas exclusivas para gestão de castrações, adoções e voluntários.</p>
          </div>
          <div>
            <Link to="/cadastro-parceiro" className="inline-block bg-white text-gray-900 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors">
              Seja um Parceiro
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500">
          <div className="flex justify-center items-center gap-2 text-emerald-600 mb-4">
            <Dog className="h-6 w-6" />
            <span className="text-xl font-bold">PetConecta BR</span>
          </div>
          <p>© {new Date().getFullYear()} Sistema Integrado de Bem-Estar Animal do Paraná. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
