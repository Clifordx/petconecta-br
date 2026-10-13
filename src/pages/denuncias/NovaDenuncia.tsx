import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  AlertTriangle, 
  MapPin, 
  UploadCloud, 
  CheckCircle2, 
  Copy, 
  X, 
  Loader2, 
  ShieldCheck, 
  ExternalLink,
  Camera
} from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

export default function NovaDenuncia() {
  const { user, profile } = useAuth();

  // Estados do formulário
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [denuncianteNome, setDenuncianteNome] = useState(profile?.nome || '');
  const [denuncianteTelefone, setDenuncianteTelefone] = useState(profile?.telefone || '');
  const [denuncianteEmail, setDenuncianteEmail] = useState(user?.email || '');

  const [tipo, setTipo] = useState('abandono');
  const [urgencia, setUrgencia] = useState('media');
  const [descricao, setDescricao] = useState('');

  // Localização
  const [cep, setCep] = useState('');
  const [endereco, setEndereco] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('Arapongas');
  const [pontoReferencia, setPontoReferencia] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [buscandoGps, setBuscandoGps] = useState(false);
  const [buscandoCep, setBuscandoCep] = useState(false);

  // Evidências
  const [arquivos, setArquivos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  // Submissão
  const [enviando, setEnviando] = useState(false);
  const [protocoloGerado, setProtocoloGerado] = useState('');
  const [sucesso, setSucesso] = useState(false);

  // Preenche dados do perfil se logado
  React.useEffect(() => {
    if (profile?.nome && !denuncianteNome) setDenuncianteNome(profile.nome);
    if (profile?.telefone && !denuncianteTelefone) setDenuncianteTelefone(profile.telefone);
    if (user?.email && !denuncianteEmail) setDenuncianteEmail(user.email);
  }, [profile, user]);

  // Busca CEP automático via ViaCEP
  const handleCepChange = async (valor: string) => {
    const limpo = valor.replace(/\D/g, '');
    setCep(valor);
    if (limpo.length === 8) {
      setBuscandoCep(true);
      try {
        const res = await fetch(`https://viacep.com.br/ws/${limpo}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setEndereco(data.logradouro || '');
          setBairro(data.bairro || '');
          if (data.localidade) setCidade(data.localidade);
          toast.success('Endereço encontrado pelo CEP!');
        } else {
          toast.error('CEP não encontrado');
        }
      } catch (err) {
        console.error('Erro ao buscar CEP:', err);
      } finally {
        setBuscandoCep(false);
      }
    }
  };

  // Captura localização atual via GPS
  const handleObterLocalizacaoGps = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocalização não suportada no seu navegador.');
      return;
    }

    setBuscandoGps(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setLatitude(lat);
        setLongitude(lng);

        try {
          // Tenta geocodificação reversa pública (Nominatim OpenStreetMap)
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
          const data = await res.json();
          if (data && data.address) {
            const rua = data.address.road || data.address.street || '';
            const bairroDetectado = data.address.suburb || data.address.neighbourhood || '';
            const cidadeDetectada = data.address.city || data.address.town || data.address.municipality || '';
            if (rua && !endereco) setEndereco(rua);
            if (bairroDetectado && !bairro) setBairro(bairroDetectado);
            if (cidadeDetectada) setCidade(cidadeDetectada);
          }
        } catch (e) {
          // Se falhar o reverse geocoding, as coordenadas lat/lng ainda ficam salvas
        }

        toast.success(`Coordenadas GPS capturadas com sucesso!`);
        setBuscandoGps(false);
      },
      (err) => {
        console.error('Erro GPS:', err);
        toast.error('Não foi possível obter sua localização. Verifique as permissões de GPS do navegador.');
        setBuscandoGps(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Gerenciamento de arquivos
  const handleSelecionarArquivos = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const novosArquivos = Array.from(e.target.files);

    if (arquivos.length + novosArquivos.length > 5) {
      toast.error('Máximo de 5 arquivos por denúncia.');
      return;
    }

    const novosPreviews = novosArquivos.map(file => URL.createObjectURL(file));
    setArquivos(prev => [...prev, ...novosArquivos]);
    setPreviews(prev => [...prev, ...novosPreviews]);
  };

  const handleRemoverArquivo = (index: number) => {
    setArquivos(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  // Envio da Denúncia
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!descricao.trim() || descricao.trim().length < 20) {
      toast.error('Por favor, descreva a situação com mais detalhes (mínimo 20 caracteres).');
      return;
    }

    const enderecoFinal = [
      endereco,
      numero ? `Nº ${numero}` : '',
      bairro ? `- ${bairro}` : '',
      cidade ? `(${cidade})` : ''
    ].filter(Boolean).join(' ');

    if (!enderecoFinal.trim() && !latitude) {
      toast.error('Por favor, informe o endereço da ocorrência ou utilize o botão de GPS.');
      return;
    }

    setEnviando(true);
    try {
      // 1. Gera protocolo único
      const anoAtual = new Date().getFullYear();
      const randomCode = Math.floor(10000 + Math.random() * 90000);
      const protocolo = `DEN-${anoAtual}-${randomCode}`;

      // 2. Insere registro da denúncia
      const payloadDenuncia: any = {
        protocolo,
        anonima: isAnonymous,
        tipo,
        urgencia,
        descricao: descricao.trim(),
        endereco: enderecoFinal || 'Coordenadas GPS informadas',
        ponto_referencia: pontoReferencia || null,
        latitude: latitude || null,
        longitude: longitude || null,
        bairro: bairro || null,
        status: 'recebida',
        denunciante_id: user?.id || null,
        denunciante_nome: isAnonymous ? null : (denuncianteNome || null),
        denunciante_telefone: isAnonymous ? null : (denuncianteTelefone || null),
        denunciante_email: isAnonymous ? null : (denuncianteEmail || null)
      };

      const { data: denunciaInserida, error: denunciaErr } = await supabase
        .from('denuncias')
        .insert(payloadDenuncia)
        .select()
        .single();

      if (denunciaErr) {
        console.error('Erro ao inserir denúncia:', denunciaErr);
        throw denunciaErr;
      }

      const denunciaId = denunciaInserida.id;

      // 3. Upload das evidências no bucket 'denuncias'
      if (arquivos.length > 0) {
        for (let i = 0; i < arquivos.length; i++) {
          const file = arquivos[i];
          const fileExt = file.name.split('.').pop();
          const fileName = `${denunciaId}/${Date.now()}_${i}.${fileExt}`;

          const { error: uploadErr } = await supabase.storage
            .from('denuncias')
            .upload(fileName, file);

          if (!uploadErr) {
            const { data: publicUrlData } = supabase.storage
              .from('denuncias')
              .getPublicUrl(fileName);

            if (publicUrlData?.publicUrl) {
              await supabase.from('evidencias_denuncia').insert({
                denuncia_id: denunciaId,
                url: publicUrlData.publicUrl,
                tipo: file.type.startsWith('video/') ? 'VIDEO' : 'FOTO'
              });
            }
          } else {
            console.warn('Erro ao fazer upload da evidência:', uploadErr);
          }
        }
      }

      setProtocoloGerado(protocolo);
      setSucesso(true);
      toast.success('Denúncia registrada com sucesso!');
    } catch (error: any) {
      console.error('Erro ao registrar denúncia:', error);
      toast.error(error.message || 'Erro ao registrar a denúncia. Tente novamente.');
    } finally {
      setEnviando(false);
    }
  };

  const copiarProtocolo = () => {
    navigator.clipboard.writeText(protocoloGerado);
    toast.success('Protocolo copiado para a área de transferência!');
  };

  // Tela de Sucesso após envio
  if (sucesso) {
    return (
      <div className="container mx-auto p-4 max-w-2xl py-12">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 text-center space-y-6">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 size={42} />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900">Denúncia Registrada com Sucesso!</h2>
            <p className="text-gray-600 mt-2 text-sm max-w-md mx-auto">
              Sua denúncia já foi enviada para a equipe de fiscalização e proteção animal.
            </p>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-xl inline-block w-full max-w-md">
            <span className="text-xs uppercase tracking-wider font-semibold text-emerald-800 block mb-1">
              Número de Protocolo
            </span>
            <div className="flex items-center justify-center gap-3">
              <span className="text-3xl font-mono font-bold text-emerald-950 tracking-wider">
                {protocoloGerado}
              </span>
              <button
                onClick={copiarProtocolo}
                className="p-2 text-emerald-700 hover:text-emerald-900 hover:bg-emerald-100 rounded-lg transition-colors"
                title="Copiar Protocolo"
              >
                <Copy size={20} />
              </button>
            </div>
            <p className="text-xs text-emerald-700 mt-2">
              Guarde este código para consultar o andamento a qualquer momento.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link to={`/acompanhar-denuncia?protocolo=${protocoloGerado}`} className="w-full sm:w-auto">
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700 flex items-center justify-center gap-2">
                Acompanhar Andamento <ExternalLink size={16} />
              </Button>
            </Link>
            <Link to="/" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full">
                Voltar ao Início
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-3xl py-8">
      {/* Cabeçalho */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
          Denúncia de Maus-Tratos e Abandono
        </h1>
        <p className="text-gray-600 mt-1 text-sm">
          Canal oficial e seguro para fiscalização e proteção animal no município.
        </p>
      </div>

      {/* Aviso Legal */}
      <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg mb-6 text-amber-900 text-sm flex gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold block">Aviso Importante</span>
          Falsa comunicação de crime é infração prevista no Art. 340 do Código Penal. Utilize este canal com responsabilidade para que as equipes priorizem animais em perigo real.
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Bloco 1: Identificação ou Anonimato */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" /> Identificação do Denunciante
            </h2>
            <span className="text-xs text-gray-500">Sigilo garantido por lei</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              onClick={() => setIsAnonymous(false)}
              className={`p-3.5 rounded-lg border text-left transition-all flex flex-col justify-between ${
                !isAnonymous
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700 bg-gray-50/50'
              }`}
            >
              <span className="font-semibold text-sm">Denúncia Identificada</span>
              <span className="text-xs text-gray-500 mt-1">
                Facilita o contato da equipe caso precisem de mais informações sobre o local.
              </span>
            </button>

            <button
              type="button"
              onClick={() => setIsAnonymous(true)}
              className={`p-3.5 rounded-lg border text-left transition-all flex flex-col justify-between ${
                isAnonymous
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700 bg-gray-50/50'
              }`}
            >
              <span className="font-semibold text-sm">Denúncia 100% Anônima</span>
              <span className="text-xs text-gray-500 mt-1">
                Nenhum dado seu será registrado ou exibido no relatório da fiscalização.
              </span>
            </button>
          </div>

          {!isAnonymous && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Seu Nome</label>
                <Input
                  placeholder="Nome completo"
                  value={denuncianteNome}
                  onChange={(e) => setDenuncianteNome(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Telefone / WhatsApp</label>
                <Input
                  placeholder="(00) 00000-0000"
                  value={denuncianteTelefone}
                  onChange={(e) => setDenuncianteTelefone(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">E-mail (opcional)</label>
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  value={denuncianteEmail}
                  onChange={(e) => setDenuncianteEmail(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        {/* Bloco 2: Detalhes da Ocorrência */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <h2 className="font-bold text-gray-900 border-b pb-3">Sobre a Ocorrência</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Tipo de Ocorrência *</label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                className="w-full rounded-lg border border-gray-300 p-2.5 text-sm bg-white focus:ring-2 focus:ring-emerald-500"
              >
                <option value="abandono">Abandono em Via Pública ou Terreno</option>
                <option value="agressao">Agressão Física ou Violência</option>
                <option value="negligencia">Negligência (Sem água, comida ou abrigo)</option>
                <option value="acorrentado">Animal Preso / Acorrentado Permanentemente</option>
                <option value="envenenamento">Suspeita de Envenenamento</option>
                <option value="acumulacao">Acumulação Extrema de Animais</option>
                <option value="outros">Outros Maus-Tratos</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Nível de Urgência *</label>
              <select
                value={urgencia}
                onChange={(e) => setUrgencia(e.target.value)}
                className="w-full rounded-lg border border-gray-300 p-2.5 text-sm bg-white focus:ring-2 focus:ring-emerald-500 font-medium"
              >
                <option value="baixa">Baixa (Problema recorrente, sem risco iminente)</option>
                <option value="media">Média (Requer vistoria nos próximos dias)</option>
                <option value="alta">Alta (Animal ferido, doente ou debilitado)</option>
                <option value="critica">🚨 Crítica (Risco iminente de morte / Violência agora)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Descrição Detalhada do Fato *
            </label>
            <textarea
              rows={4}
              required
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descreva o que está acontecendo: quantos animais são, como eles estão, se o tutor está no local, etc. (mínimo 20 caracteres)"
              className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:ring-2 focus:ring-emerald-500"
            />
            <span className="text-xs text-gray-400 block text-right mt-1">
              {descricao.length} caracteres digitados
            </span>
          </div>
        </div>

        {/* Bloco 3: Localização da Ocorrência */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-3 gap-2">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-600" /> Local do Fato
            </h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={buscandoGps}
              onClick={handleObterLocalizacaoGps}
              className="flex items-center gap-1.5 text-xs text-emerald-700 border-emerald-300 hover:bg-emerald-50"
            >
              {buscandoGps ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Obtendo GPS...
                </>
              ) : (
                <>
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" /> Usar Minha Localização Atual (GPS)
                </>
              )}
            </Button>
          </div>

          {latitude && longitude && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center justify-between">
              <span>📍 Coordenadas GPS vinculadas: {latitude.toFixed(5)}, {longitude.toFixed(5)}</span>
              <button
                type="button"
                onClick={() => { setLatitude(null); setLongitude(null); }}
                className="text-red-500 hover:underline"
              >
                Remover GPS
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                CEP (opcional) {buscandoCep && <Loader2 className="inline w-3 h-3 animate-spin text-emerald-600" />}
              </label>
              <Input
                placeholder="00000-000"
                value={cep}
                onChange={(e) => handleCepChange(e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1">Rua / Avenida *</label>
              <Input
                placeholder="Ex: Rua das Flores"
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Número</label>
              <Input
                placeholder="Ex: 123 ou S/N"
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Bairro</label>
              <Input
                placeholder="Ex: Centro"
                value={bairro}
                onChange={(e) => setBairro(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Cidade</label>
              <Input
                placeholder="Cidade"
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Ponto de Referência</label>
            <Input
              placeholder="Ex: Casa verde em frente ao mercadinho, portão branco"
              value={pontoReferencia}
              onChange={(e) => setPontoReferencia(e.target.value)}
            />
          </div>
        </div>

        {/* Bloco 4: Fotos e Evidências */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <Camera className="w-5 h-5 text-emerald-600" /> Fotos e Vídeos do Local
            </h2>
            <span className="text-xs text-gray-500">Até 5 arquivos</span>
          </div>

          <label className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/20 transition-all block">
            <UploadCloud className="w-10 h-10 mx-auto text-gray-400 mb-2" />
            <span className="text-sm font-semibold text-gray-700 block">
              Clique para anexar fotos ou vídeos
            </span>
            <span className="text-xs text-gray-400 mt-1 block">
              Formatos aceitos: JPG, PNG, WEBP ou MP4 (Máximo 5 arquivos)
            </span>
            <input
              type="file"
              multiple
              accept="image/*,video/*"
              className="hidden"
              onChange={handleSelecionarArquivos}
            />
          </label>

          {previews.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 pt-2">
              {previews.map((url, idx) => (
                <div key={idx} className="relative group rounded-lg overflow-hidden border border-gray-200 aspect-square bg-gray-100">
                  <img src={url} alt={`Evidência ${idx + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoverArquivo(idx)}
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-90 hover:opacity-100 transition-opacity shadow-sm"
                    title="Remover"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Botão de Envio */}
        <Button
          type="submit"
          disabled={enviando}
          className="w-full bg-emerald-600 hover:bg-emerald-700 h-14 text-base font-semibold shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
        >
          {enviando ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" /> Enviando denúncia e arquivos...
            </>
          ) : (
            'Confirmar e Registrar Denúncia'
          )}
        </Button>
      </form>
    </div>
  );
}
