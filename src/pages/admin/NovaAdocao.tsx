import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  Search, 
  Camera, 
  FileText, 
  Upload, 
  Heart, 
  AlertCircle, 
  Loader2, 
  User, 
  Home, 
  ShieldCheck, 
  FileSignature, 
  Printer, 
  X,
  Dog,
  MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from 'sonner';
import SignatureCanvas from 'react-signature-canvas';

const STEPS = [
  'Selecionar Animal',
  'Dados do Adotante',
  'Questionário',
  'Termo & Assinatura',
  'Confirmação'
];

export default function NovaAdocao() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const prePetId = searchParams.get('pet_id');
  const preFeiraId = searchParams.get('feira_id');

  const [currentStep, setCurrentStep] = useState(0);
  const signatureRef = useRef<SignatureCanvas>(null);

  // 1. Animal
  const [petsDisponiveis, setPetsDisponiveis] = useState<any[]>([]);
  const [buscaPet, setBuscaPet] = useState('');
  const [selectedPet, setSelectedPet] = useState<any>(null);
  const [loadingPets, setLoadingPets] = useState(true);

  // 2. Adotante
  const [adotanteCpf, setAdotanteCpf] = useState('');
  const [adotanteNome, setAdotanteNome] = useState('');
  const [adotanteRg, setAdotanteRg] = useState('');
  const [adotanteTelefone, setAdotanteTelefone] = useState('');
  const [adotanteEmail, setAdotanteEmail] = useState('');
  const [adotanteCep, setAdotanteCep] = useState('');
  const [adotanteEndereco, setAdotanteEndereco] = useState('');
  const [adotanteNumero, setAdotanteNumero] = useState('');
  const [adotanteBairro, setAdotanteBairro] = useState('');
  const [adotanteCidade, setAdotanteCidade] = useState('Arapongas');
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [buscandoCpf, setBuscandoCpf] = useState(false);

  // 3. Questionário
  const [tipoMoradia, setTipoMoradia] = useState('Casa');
  const [quintalCercado, setQuintalCercado] = useState('Sim');
  const [telasJanelas, setTelasJanelas] = useState('Sim');
  const [temOutrosAnimais, setTemOutrosAnimais] = useState('Não');
  const [quaisOutrosAnimais, setQuaisOutrosAnimais] = useState('');
  const [concordanciaFamilia, setConcordanciaFamilia] = useState('Sim');
  const [planejamentoViagem, setPlanejamentoViagem] = useState('Ficará com familiares ou em hotelzinho pet');
  const [motivoAdocao, setMotivoAdocao] = useState('Companhia para a família');

  // 4. Termo & Assinatura
  const [termoAceito, setTermoAceito] = useState(false);
  const [temAssinatura, setTemAssinatura] = useState(false);

  // 5. Fotos adicionais
  const [fotoPetFile, setFotoPetFile] = useState<File | null>(null);
  const [fotoPetPreview, setFotoPetPreview] = useState<string | null>(null);
  const [fotoDocFile, setFotoDocFile] = useState<File | null>(null);
  const [fotoDocPreview, setFotoDocPreview] = useState<string | null>(null);

  // Submissão
  const [salvando, setSalvando] = useState(false);
  const [adocaoConcluida, setAdocaoConcluida] = useState<any>(null);

  useEffect(() => {
    carregarPetsDisponiveis();
  }, []);

  const carregarPetsDisponiveis = async () => {
    try {
      setLoadingPets(true);
      const { data, error } = await supabase
        .from('pets')
        .select('*, fotos_pet(url, is_principal)')
        .eq('status', 'para_adocao')
        .order('nome');

      if (error) throw error;
      setPetsDisponiveis(data || []);

      // Se tiver pet_id na URL, pré-seleciona
      if (prePetId && data) {
        const petPre = data.find((p: any) => p.id === prePetId);
        if (petPre) {
          setSelectedPet(petPre);
        }
      }
    } catch (err) {
      console.error('Erro ao carregar pets:', err);
    } finally {
      setLoadingPets(false);
    }
  };

  // Busca CEP via ViaCEP
  const handleCepChange = async (val: string) => {
    setAdotanteCep(val);
    const limpo = val.replace(/\D/g, '');
    if (limpo.length === 8) {
      setBuscandoCep(true);
      try {
        const res = await fetch(`https://viacep.com.br/ws/${limpo}/json/`);
        const d = await res.json();
        if (!d.erro) {
          if (d.logradouro) setAdotanteEndereco(d.logradouro);
          if (d.bairro) setAdotanteBairro(d.bairro);
          if (d.localidade) setAdotanteCidade(d.localidade);
          toast.success('Endereço preenchido pelo CEP!');
        }
      } catch (e) {
        console.error(e);
      } finally {
        setBuscandoCep(false);
      }
    }
  };

  // Busca Perfil existente pelo CPF
  const handleCpfBlur = async () => {
    const limpo = adotanteCpf.replace(/\D/g, '');
    if (limpo.length === 11) {
      setBuscandoCpf(true);
      try {
        const { data, error } = await supabase
          .from('perfis')
          .select('*')
          .eq('cpf', adotanteCpf)
          .maybeSingle();

        if (data && !error) {
          if (data.nome && !adotanteNome) setAdotanteNome(data.nome);
          if (data.telefone && !adotanteTelefone) setAdotanteTelefone(data.telefone);
          if (data.endereco && !adotanteEndereco) setAdotanteEndereco(data.endereco);
          if (data.cidade && !adotanteCidade) setAdotanteCidade(data.cidade);
          toast.success('Dados do adotante recuperados pelo CPF!');
        }
      } catch (e) {
        // Ignora
      } finally {
        setBuscandoCpf(false);
      }
    }
  };

  const getFotoPrincipal = (fotos: any[]) => {
    if (!fotos || fotos.length === 0) return 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=300';
    const princ = fotos.find(f => f.is_principal);
    return princ ? princ.url : fotos[0].url;
  };

  // Validação por passo
  const podeAvancar = () => {
    if (currentStep === 0) {
      if (!selectedPet) {
        toast.error('Selecione um animal para continuar.');
        return false;
      }
      return true;
    }

    if (currentStep === 1) {
      if (!adotanteNome.trim()) {
        toast.error('Informe o nome completo do adotante.');
        return false;
      }
      if (!adotanteCpf.trim()) {
        toast.error('Informe o CPF do adotante.');
        return false;
      }
      if (!adotanteTelefone.trim()) {
        toast.error('Informe o telefone/WhatsApp do adotante.');
        return false;
      }
      if (!adotanteEndereco.trim()) {
        toast.error('Informe o endereço do adotante.');
        return false;
      }
      return true;
    }

    if (currentStep === 2) {
      return true;
    }

    if (currentStep === 3) {
      if (!termoAceito) {
        toast.error('É obrigatório marcar o aceite dos termos.');
        return false;
      }
      if (signatureRef.current?.isEmpty()) {
        toast.error('O adotante deve assinar com o dedo na tela.');
        return false;
      }
      return true;
    }

    return true;
  };

  const nextStep = () => {
    if (podeAvancar()) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const clearSignature = () => {
    signatureRef.current?.clear();
    setTemAssinatura(false);
  };

  // Upload das fotos adicionais
  const handleSelectFotoPet = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setFotoPetFile(f);
      setFotoPetPreview(URL.createObjectURL(f));
    }
  };

  const handleSelectFotoDoc = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setFotoDocFile(f);
      setFotoDocPreview(URL.createObjectURL(f));
    }
  };

  // Finalização da Adoção
  const handleFinalizarAdocao = async () => {
    if (!selectedPet) return;
    setSalvando(true);

    try {
      // 1. Exporta e faz upload da assinatura
      let assinaturaUrl = '';
      if (signatureRef.current && !signatureRef.current.isEmpty()) {
        const canvas = signatureRef.current.getTrimmedCanvas();
        const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
        if (blob) {
          const signFileName = `adocoes/assinaturas/${selectedPet.id}_${Date.now()}.png`;
          const { error: signErr } = await supabase.storage
            .from('documentos')
            .upload(signFileName, blob);

          if (!signErr) {
            const { data: pubData } = supabase.storage
              .from('documentos')
              .getPublicUrl(signFileName);
            assinaturaUrl = pubData.publicUrl;
          }
        }
      }

      // 2. Upload foto com pet se houver
      let fotoComPetUrl = '';
      if (fotoPetFile) {
        const fotoName = `adocoes/fotos_adotantes/${selectedPet.id}_${Date.now()}_${fotoPetFile.name}`;
        const { error: fotoErr } = await supabase.storage
          .from('documentos')
          .upload(fotoName, fotoPetFile);
        if (!fotoErr) {
          fotoComPetUrl = supabase.storage.from('documentos').getPublicUrl(fotoName).data.publicUrl;
        }
      }

      // 3. Upload documento se houver
      let documentoFotoUrl = '';
      if (fotoDocFile) {
        const docName = `adocoes/docs_identidade/${selectedPet.id}_${Date.now()}_${fotoDocFile.name}`;
        const { error: docErr } = await supabase.storage
          .from('documentos')
          .upload(docName, fotoDocFile);
        if (!docErr) {
          documentoFotoUrl = supabase.storage.from('documentos').getPublicUrl(docName).data.publicUrl;
        }
      }

      // 4. Monta objeto do Questionário
      const questionarioRespostas = {
        tipo_moradia: tipoMoradia,
        quintal_cercado: quintalCercado,
        telas_janelas: telasJanelas,
        tem_outros_animais: temOutrosAnimais,
        quais_outros_animais: quaisOutrosAnimais,
        concordancia_familia: concordanciaFamilia,
        planejamento_viagem: planejamentoViagem,
        motivo_adocao: motivoAdocao
      };

      const enderecoCompleto = [
        adotanteEndereco,
        adotanteNumero ? `Nº ${adotanteNumero}` : '',
        adotanteBairro ? `- ${adotanteBairro}` : '',
        adotanteCidade ? `(${adotanteCidade})` : ''
      ].filter(Boolean).join(' ');

      // 5. Insere registro em adocoes
      const payloadAdocao: any = {
        pet_id: selectedPet.id,
        feira_id: preFeiraId || null,
        status: 'finalizada',
        adotante_nome: adotanteNome.trim(),
        adotante_cpf: adotanteCpf.trim(),
        adotante_rg: adotanteRg.trim() || null,
        adotante_telefone: adotanteTelefone.trim(),
        adotante_email: adotanteEmail.trim() || null,
        adotante_endereco: enderecoCompleto,
        adotante_bairro: adotanteBairro || null,
        adotante_cidade: adotanteCidade || null,
        questionario: questionarioRespostas,
        assinatura_url: assinaturaUrl,
        foto_com_pet_url: fotoComPetUrl || null,
        documento_foto_url: documentoFotoUrl || null,
        data_adocao: new Date().toISOString()
      };

      const { data: adocaoInserida, error: adocaoErr } = await supabase
        .from('adocoes')
        .insert(payloadAdocao)
        .select()
        .single();

      if (adocaoErr) throw adocaoErr;

      // 6. Atualiza status do pet para 'adotado'
      await supabase
        .from('pets')
        .update({ status: 'adotado' })
        .eq('id', selectedPet.id);

      // 7. Se veio de uma feira, atualiza o status em animais_feira
      if (preFeiraId) {
        await supabase
          .from('animais_feira')
          .update({ status: 'adotado' })
          .eq('feira_id', preFeiraId)
          .eq('pet_id', selectedPet.id);
      }

      setAdocaoConcluida(adocaoInserida);
      toast.success('🎉 Parabéns! Adoção oficializada com sucesso!');
    } catch (error: any) {
      console.error('Erro ao finalizar adoção:', error);
      toast.error(error.message || 'Erro ao concluir o processo de adoção.');
    } finally {
      setSalvando(false);
    }
  };

  // Tela de Sucesso
  if (adocaoConcluida) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center space-y-6">
        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
          <div className="w-20 h-20 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <Heart size={44} fill="currentColor" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-pink-600 bg-pink-50 px-3 py-1 rounded-full">
              Processo Concluído
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">
              {selectedPet?.nome} Ganhou um Novo Lar! 🏡
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              O Termo de Posse Responsável foi assinado digitalmente e já está arquivado.
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl border text-left text-sm space-y-2">
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500">Adotante Oficial:</span>
              <span className="font-bold text-gray-800">{adotanteNome}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500">Animal Adotado:</span>
              <span className="font-bold text-gray-800">{selectedPet?.nome} ({selectedPet?.especie})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Telefone:</span>
              <span className="font-medium text-gray-800">{adotanteTelefone}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link to={`/admin/adocoes/${adocaoConcluida.id}`}>
              <Button className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 flex items-center gap-2">
                <FileSignature size={18} /> Ver Termo & Imprimir Dossiê
              </Button>
            </Link>
            <Link to="/admin/adocoes">
              <Button variant="outline" className="w-full sm:w-auto">
                Ir para Gestão de Adoções
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto bg-white min-h-[calc(100vh-4rem)] md:min-h-0 md:rounded-2xl md:shadow-lg border border-gray-200 overflow-hidden flex flex-col my-4">
      {/* Header & Steps Indicator */}
      <div className="bg-emerald-600 text-white p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Link to={preFeiraId ? `/admin/feiras/${preFeiraId}` : '/admin/adocoes'} className="p-1 hover:bg-emerald-700 rounded transition-colors">
              <ChevronLeft size={20} />
            </Link>
            <h1 className="text-lg sm:text-xl font-bold flex items-center gap-2">
              <Heart className="w-5 h-5 fill-current" /> Nova Adoção de Animal
            </h1>
          </div>
          <span className="text-xs bg-emerald-700/80 px-2.5 py-1 rounded-full font-medium">
            Passo {currentStep + 1} de {STEPS.length}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center justify-between relative mt-2">
          <div className="absolute left-0 top-1/2 w-full h-1 bg-emerald-700 -z-0 transform -translate-y-1/2"></div>
          {STEPS.map((step, idx) => (
            <div key={step} className="flex flex-col items-center z-10">
              <div 
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold border-2 transition-all ${
                  idx < currentStep 
                    ? 'bg-white text-emerald-700 border-white shadow'
                    : idx === currentStep 
                    ? 'bg-emerald-950 text-white border-white scale-110 shadow-md'
                    : 'bg-emerald-800 text-emerald-300 border-emerald-700'
                }`}
              >
                {idx < currentStep ? <Check className="w-4 h-4 stroke-[3]" /> : idx + 1}
              </div>
              <span className="text-[10px] mt-1 hidden md:block opacity-90 font-medium">{step}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Conteúdo Dinâmico por Passo */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
        {/* PASSO 0: Selecionar Animal */}
        {currentStep === 0 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Selecione o Animal para Adoção</h2>
              <p className="text-xs text-gray-500">Escolha o pet que está sendo adotado.</p>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar pet por nome, raça ou porte..."
                value={buscaPet}
                onChange={(e) => setBuscaPet(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 text-sm"
              />
            </div>

            {loadingPets ? (
              <div className="py-12 text-center text-gray-500">Carregando animais disponíveis...</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto pr-1">
                {petsDisponiveis
                  .filter(p => p.nome?.toLowerCase().includes(buscaPet.toLowerCase()) || p.raca?.toLowerCase().includes(buscaPet.toLowerCase()))
                  .map((pet) => {
                    const isSelected = selectedPet?.id === pet.id;
                    return (
                      <div
                        key={pet.id}
                        onClick={() => setSelectedPet(pet)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3.5 relative ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/30'
                            : 'border-gray-200 hover:border-emerald-300 hover:bg-gray-50'
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-2 right-2 bg-emerald-600 text-white rounded-full p-0.5">
                            <Check size={14} />
                          </div>
                        )}
                        <img
                          src={getFotoPrincipal(pet.fotos_pet)}
                          alt={pet.nome}
                          className="w-16 h-16 rounded-lg object-cover border flex-shrink-0"
                        />
                        <div>
                          <h3 className="font-bold text-gray-900 text-base">{pet.nome}</h3>
                          <p className="text-xs text-gray-500">
                            {pet.especie} • {pet.sexo} • {pet.raca || 'SRD'}
                          </p>
                          <div className="flex gap-1 mt-1.5">
                            {pet.castrado && (
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-medium px-1.5 py-0.5 rounded">
                                Castrado
                              </span>
                            )}
                            {pet.vacinado && (
                              <span className="text-[10px] bg-blue-100 text-blue-800 font-medium px-1.5 py-0.5 rounded">
                                Vacinado
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* PASSO 1: Dados do Adotante */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <User className="text-emerald-600" /> Dados do Novo Tutor (Adotante)
              </h2>
              <p className="text-xs text-gray-500">
                Preencha os dados do cidadão responsável. Se ele já tiver cadastro, o sistema preencherá automaticamente.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  CPF * {buscandoCpf && <Loader2 className="inline w-3 h-3 animate-spin text-emerald-600" />}
                </label>
                <Input
                  required
                  placeholder="000.000.000-00"
                  value={adotanteCpf}
                  onChange={(e) => setAdotanteCpf(e.target.value)}
                  onBlur={handleCpfBlur}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">RG</label>
                <Input
                  placeholder="Número do RG"
                  value={adotanteRg}
                  onChange={(e) => setAdotanteRg(e.target.value)}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">Nome Completo *</label>
                <Input
                  required
                  placeholder="Nome do adotante"
                  value={adotanteNome}
                  onChange={(e) => setAdotanteNome(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Telefone / WhatsApp *</label>
                <Input
                  required
                  placeholder="(00) 00000-0000"
                  value={adotanteTelefone}
                  onChange={(e) => setAdotanteTelefone(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">E-mail</label>
                <Input
                  type="email"
                  placeholder="email@exemplo.com"
                  value={adotanteEmail}
                  onChange={(e) => setAdotanteEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="border-t pt-4 space-y-3">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                <MapPin size={16} className="text-emerald-600" /> Endereço da Residência
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    CEP {buscandoCep && <Loader2 className="inline w-3 h-3 animate-spin text-emerald-600" />}
                  </label>
                  <Input
                    placeholder="00000-000"
                    value={adotanteCep}
                    onChange={(e) => handleCepChange(e.target.value)}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Rua / Logradouro *</label>
                  <Input
                    required
                    placeholder="Nome da rua"
                    value={adotanteEndereco}
                    onChange={(e) => setAdotanteEndereco(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Número</label>
                  <Input
                    placeholder="123 ou S/N"
                    value={adotanteNumero}
                    onChange={(e) => setAdotanteNumero(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Bairro</label>
                  <Input
                    placeholder="Bairro"
                    value={adotanteBairro}
                    onChange={(e) => setAdotanteBairro(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Cidade</label>
                  <Input
                    placeholder="Cidade"
                    value={adotanteCidade}
                    onChange={(e) => setAdotanteCidade(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PASSO 2: Questionário de Posse Responsável */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Home className="text-emerald-600" /> Questionário de Posse Responsável
              </h2>
              <p className="text-xs text-gray-500">
                Avaliação rápida das condições do lar para garantir o bem-estar animal.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Tipo de Moradia</label>
                <select
                  value={tipoMoradia}
                  onChange={(e) => setTipoMoradia(e.target.value)}
                  className="w-full border rounded-lg p-2.5 text-sm bg-white"
                >
                  <option value="Casa">Casa</option>
                  <option value="Apartamento">Apartamento</option>
                  <option value="Chácara / Sítio">Chácara / Sítio</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    O quintal é cercado/murado com segurança?
                  </label>
                  <select
                    value={quintalCercado}
                    onChange={(e) => setQuintalCercado(e.target.value)}
                    className="w-full border rounded-lg p-2.5 text-sm bg-white"
                  >
                    <option value="Sim">Sim, totalmente fechado sem rotas de fuga</option>
                    <option value="Não">Não</option>
                    <option value="Não se aplica (Apartamento)">Não se aplica (Apartamento)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Janelas e sacadas possuem telas de proteção?
                  </label>
                  <select
                    value={telasJanelas}
                    onChange={(e) => setTelasJanelas(e.target.value)}
                    className="w-full border rounded-lg p-2.5 text-sm bg-white"
                  >
                    <option value="Sim">Sim, com telas em perfeito estado</option>
                    <option value="Não">Não</option>
                    <option value="Não se aplica (Casa térrea)">Não se aplica (Casa térrea)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Já possui outros animais na residência?
                  </label>
                  <select
                    value={temOutrosAnimais}
                    onChange={(e) => setTemOutrosAnimais(e.target.value)}
                    className="w-full border rounded-lg p-2.5 text-sm bg-white"
                  >
                    <option value="Não">Não possui</option>
                    <option value="Sim">Sim, já possui</option>
                  </select>
                </div>

                {temOutrosAnimais === 'Sim' && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Quais outros animais?
                    </label>
                    <Input
                      placeholder="Ex: 1 cachorro de pequeno porte dócil"
                      value={quaisOutrosAnimais}
                      onChange={(e) => setQuaisOutrosAnimais(e.target.value)}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Todos os moradores da residência estão cientes e concordam com a adoção?
                </label>
                <select
                  value={concordanciaFamilia}
                  onChange={(e) => setConcordanciaFamilia(e.target.value)}
                  className="w-full border rounded-lg p-2.5 text-sm bg-white font-medium"
                >
                  <option value="Sim">Sim, todos de acordo</option>
                  <option value="Não">Não</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Em caso de viagens ou mudanças, qual a previsão de cuidados?
                </label>
                <Input
                  value={planejamentoViagem}
                  onChange={(e) => setPlanejamentoViagem(e.target.value)}
                  placeholder="Ex: Viajará com a família ou ficará com parentes"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Motivo principal da adoção
                </label>
                <Input
                  value={motivoAdocao}
                  onChange={(e) => setMotivoAdocao(e.target.value)}
                  placeholder="Ex: Companhia e guarda responsável para a família"
                />
              </div>
            </div>
          </div>
        )}

        {/* PASSO 3: Termo de Adoção e Assinatura Digital com o Dedo na Tela */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <FileSignature className="text-emerald-600" /> Termo de Compromisso e Posse Responsável
              </h2>
              <p className="text-xs text-gray-500">
                O adotante deve ler as cláusulas e assinar diretamente no quadro abaixo com o dedo ou caneta touch.
              </p>
            </div>

            {/* Texto Formal do Termo */}
            <div className="h-44 overflow-y-auto p-4 bg-gray-50 border rounded-xl text-xs text-gray-700 space-y-2 leading-relaxed">
              <p className="font-bold uppercase text-gray-900 text-center">
                TERMO DE ADOÇÃO E COMPROMISSO DE GUARDA RESPONSÁVEL
              </p>
              <p>
                Pelo presente instrumento, eu, <strong>{adotanteNome || 'ADOTANTE'}</strong>, portador(a) do CPF nº <strong>{adotanteCpf || '000.000.000-00'}</strong>, assumo total e exclusiva responsabilidade sobre o animal <strong>{selectedPet?.nome}</strong>, espécie <strong>{selectedPet?.especie}</strong>, comprometendo-me solenemente a:
              </p>
              <ol className="list-decimal pl-4 space-y-1">
                <li>Garantir abrigo seguro, limpo e protegido de intempéries, jamais mantendo o animal permanentemente acorrentado ou confinado em cubículos;</li>
                <li>Fornecer alimentação balanceada e água fresca continuamente;</li>
                <li>Garantir assistência médico-veterinária, mantendo em dia as vacinas, vermífugos e controle de parasitas;</li>
                <li>Não transferir a posse nem abandonar o animal sob qualquer circunstância, sob as penas da Lei Federal nº 9.605/1998 (Lei de Crimes Ambientais);</li>
                <li>Permitir o acompanhamento ou visitas periódicas de fiscais ou voluntários da proteção animal para averiguação da adaptação;</li>
                <li>Comunicar imediatamente à equipe em caso de fuga, acidente grave ou óbito do animal.</li>
              </ol>
            </div>

            {/* Aceite Obrigatório */}
            <label className="flex items-start gap-3 p-3 border rounded-xl bg-emerald-50/50 cursor-pointer">
              <input
                type="checkbox"
                checked={termoAceito}
                onChange={(e) => setTermoAceito(e.target.checked)}
                className="w-5 h-5 mt-0.5 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
              />
              <span className="text-xs text-gray-800 font-medium leading-tight">
                Declaro que li, compreendi e assumo de livre e espontânea vontade todas as responsabilidades civis e obrigações do presente Termo de Posse Responsável.
              </span>
            </label>

            {/* Quadro de Assinatura com o Dedo */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-700 flex items-center gap-1">
                  ✍️ Assinatura do Adotante (Desenhe com o dedo abaixo)
                </span>
                <button
                  type="button"
                  onClick={clearSignature}
                  className="text-xs text-red-600 hover:text-red-800 font-semibold underline"
                >
                  Limpar Assinatura
                </button>
              </div>

              <div className="border-2 border-dashed border-gray-400 rounded-xl bg-white overflow-hidden shadow-inner touch-none">
                <SignatureCanvas
                  ref={signatureRef}
                  penColor="#064e3b"
                  canvasProps={{
                    className: 'w-full h-44 cursor-crosshair'
                  }}
                  onBegin={() => setTemAssinatura(true)}
                />
              </div>
              <p className="text-[11px] text-gray-400 text-center">
                Toque e deslize o dedo na tela para assinar digitalmente.
              </p>
            </div>
          </div>
        )}

        {/* PASSO 4: Revisão, Fotos de Comprovação e Finalização */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <ShieldCheck size={32} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Revisão Final da Adoção</h2>
              <p className="text-xs text-gray-500">
                Confira os dados e anexe uma foto com o pet para o registro histórico da feira.
              </p>
            </div>

            {/* Card Resumo */}
            <div className="bg-gray-50 p-4 rounded-xl border space-y-3 text-xs">
              <div className="flex items-center gap-3 border-b pb-2">
                <img
                  src={getFotoPrincipal(selectedPet?.fotos_pet)}
                  alt={selectedPet?.nome}
                  className="w-12 h-12 rounded-lg object-cover border"
                />
                <div>
                  <span className="font-bold text-sm text-gray-900 block">{selectedPet?.nome}</span>
                  <span className="text-gray-500">{selectedPet?.especie} • {selectedPet?.raca || 'SRD'} • {selectedPet?.porte}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-gray-700">
                <div>
                  <span className="text-gray-400 block">Adotante:</span>
                  <span className="font-bold">{adotanteNome}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">CPF:</span>
                  <span className="font-medium">{adotanteCpf}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">WhatsApp:</span>
                  <span className="font-medium">{adotanteTelefone}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Cidade:</span>
                  <span className="font-medium">{adotanteCidade}</span>
                </div>
              </div>
            </div>

            {/* Fotos Opcionais de Comprovação (Câmera do celular na feira) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/20 transition-all block">
                <Camera className="w-8 h-8 mx-auto text-emerald-600 mb-1" />
                <span className="text-xs font-bold text-gray-800 block">
                  Foto do Adotante com o Pet
                </span>
                <span className="text-[11px] text-gray-400 block mt-0.5">
                  Tire uma foto na hora do evento
                </span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleSelectFotoPet}
                />
                {fotoPetPreview && (
                  <div className="mt-2 aspect-video rounded-lg overflow-hidden border">
                    <img src={fotoPetPreview} alt="Adotante com pet" className="w-full h-full object-cover" />
                  </div>
                )}
              </label>

              <label className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/20 transition-all block">
                <FileText className="w-8 h-8 mx-auto text-blue-600 mb-1" />
                <span className="text-xs font-bold text-gray-800 block">
                  Foto do Documento (Opcional)
                </span>
                <span className="text-[11px] text-gray-400 block mt-0.5">
                  Foto da CNH ou RG do tutor
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleSelectFotoDoc}
                />
                {fotoDocPreview && (
                  <div className="mt-2 aspect-video rounded-lg overflow-hidden border">
                    <img src={fotoDocPreview} alt="Documento" className="w-full h-full object-cover" />
                  </div>
                )}
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Footer Navigation Buttons */}
      <div className="p-4 border-t bg-gray-50 flex gap-3">
        {currentStep > 0 && (
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={salvando}
            className="flex-1 flex items-center justify-center gap-1.5 h-12 text-sm"
          >
            <ChevronLeft size={16} /> Voltar
          </Button>
        )}

        {currentStep < STEPS.length - 1 ? (
          <Button
            type="button"
            onClick={nextStep}
            className="flex-[2] bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-2 h-12 text-sm shadow-md"
          >
            Avançar <ChevronRight size={16} />
          </Button>
        ) : (
          <Button
            type="button"
            disabled={salvando}
            onClick={handleFinalizarAdocao}
            className="flex-[2] bg-pink-600 hover:bg-pink-700 text-white font-bold flex items-center justify-center gap-2 h-12 text-sm shadow-md"
          >
            {salvando ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Concluindo Adoção...
              </>
            ) : (
              <>
                Finalizar e Oficializar Adoção <Check size={18} />
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
