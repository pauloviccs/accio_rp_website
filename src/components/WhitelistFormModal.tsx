import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, Sparkles, AlertTriangle, Save, Wand2, User, ChevronRight, ChevronLeft, 
  LogIn, FileDown, Check, Shield, BookOpen, Scroll, Droplet, Scale, Zap, Lightbulb
} from 'lucide-react';
import { CharacterApplication, DiscordUser, HouseId, BloodStatus } from '../types';
import { 
  HOUSES, 
  WAND_WOODS, 
  WAND_CORES, 
  WAND_LENGTHS, 
  WAND_FLEXIBILITIES, 
  WAND_HANDLES,
  OLLIVANDERS_CORE_LORE,
  MIN_WORDS_BACKSTORY, 
  LOCAL_STORAGE_FORM_KEY, 
  LOCAL_STORAGE_DRAFT_KEY 
} from '../lib/constants';
import { soundManager, musicPlayer } from '../lib/audio';
import { generateAndDownloadCharacterPdf } from '../lib/pdfGenerator';

interface WhitelistFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: DiscordUser | null;
  onLogin: () => void;
  onSubmit: (app: CharacterApplication) => Promise<void>;
  onManualUserSet?: (user: DiscordUser) => void;
  activeHouseTheme?: HouseId;
  onSelectHouseTheme?: (house: HouseId) => void;
}

export const WhitelistFormModal: React.FC<WhitelistFormModalProps> = ({
  isOpen,
  onClose,
  user,
  onLogin,
  onSubmit,
  onManualUserSet,
  activeHouseTheme = 'gryffindor',
  onSelectHouseTheme,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [manualDiscordInput, setManualDiscordInput] = useState('');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfProgress, setPdfProgress] = useState<string | null>(null);
  const [wandViewMode, setWandViewMode] = useState<'3d' | 'sketch'>('3d');
  const [handleCategory, setHandleCategory] = useState<string>('todos');

  // Form State Limpo — Sem Dados Fictícios (Anos 2000 Lore)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    birth_date: '1989-09-01',
    birth_place: '',
    blood_status: 'half-blood' as BloodStatus,
    dormitory: 'wizard' as 'witch' | 'wizard',
    preferred_house: activeHouseTheme,
    wand_wood: WAND_WOODS[0],
    wand_core: WAND_CORES[0],
    wand_length: WAND_LENGTHS[3],
    wand_flexibility: WAND_FLEXIBILITIES[2],
    wand_handle: WAND_HANDLES[0].name,
    patronus: '',
    character_backstory: '',
    rp_experience: '',
    rules_accepted: true,
  });

  // Alternar para a trilha musical de criação/artesanato arcano quando o modal estiver aberto
  useEffect(() => {
    if (isOpen) {
      musicPlayer.setContextTheme('creation');
    }
  }, [isOpen]);

  // Sincronizar casa preferida quando o tema externo mudar
  useEffect(() => {
    if (activeHouseTheme && !formData.preferred_house) {
      setFormData((prev) => ({ ...prev, preferred_house: activeHouseTheme }));
    }
  }, [activeHouseTheme]);

  // Restaurar dados salvos localmente vinculados ao usuário
  useEffect(() => {
    const userDraftKey = user ? `${LOCAL_STORAGE_DRAFT_KEY}_${user.id}` : `${LOCAL_STORAGE_DRAFT_KEY}_guest`;
    const userFormKey = user ? `${LOCAL_STORAGE_FORM_KEY}_${user.id}` : `${LOCAL_STORAGE_FORM_KEY}_guest`;

    const savedForm = localStorage.getItem(userFormKey);
    const savedBackstory = localStorage.getItem(userDraftKey);

    if (savedForm) {
      try {
        const parsed = JSON.parse(savedForm);
        setFormData((prev) => ({ ...prev, ...parsed }));
      } catch (e) {
        console.error('Falha ao restaurar formulário:', e);
      }
    }

    if (savedBackstory) {
      setFormData((prev) => ({ ...prev, character_backstory: savedBackstory }));
    }
  }, [user]);

  // Auto-save no LocalStorage a cada 3 segundos
  useEffect(() => {
    if (!formData.first_name && !formData.character_backstory) return;

    const userDraftKey = user ? `${LOCAL_STORAGE_DRAFT_KEY}_${user.id}` : `${LOCAL_STORAGE_DRAFT_KEY}_guest`;
    const userFormKey = user ? `${LOCAL_STORAGE_FORM_KEY}_${user.id}` : `${LOCAL_STORAGE_FORM_KEY}_guest`;

    const timer = setInterval(() => {
      localStorage.setItem(userFormKey, JSON.stringify(formData));
      localStorage.setItem(userDraftKey, formData.character_backstory);
      const now = new Date();
      setLastSaved(now.toLocaleTimeString());
    }, 3000);

    return () => clearInterval(timer);
  }, [formData, user]);

  // Contagem precisa de palavras
  const wordCount = useMemo(() => {
    const text = formData.character_backstory.trim();
    if (!text) return 0;
    const words = text.match(/\S+/g);
    return words ? words.length : 0;
  }, [formData.character_backstory]);

  const wordProgress = Math.min(Math.round((wordCount / MIN_WORDS_BACKSTORY) * 100), 100);

  if (!isOpen) return null;

  const currentWandHandle = WAND_HANDLES.find((w) => w.name === formData.wand_handle) || WAND_HANDLES[0];

  const handleManualLink = () => {
    if (!manualDiscordInput.trim()) {
      setErrorMessage('Informe seu usuário ou tag do Discord.');
      return;
    }
    const cleanNick = manualDiscordInput.trim().replace(/^@/, '');
    const dummyId = '14' + Math.floor(1000000000000000 + Math.random() * 9000000000000000);
    const newUser: DiscordUser = {
      id: dummyId,
      username: cleanNick,
      global_name: cleanNick,
      avatar: null,
    };
    if (onManualUserSet) {
      onManualUserSet(newUser);
    }
    setErrorMessage(null);
  };

  const handleHouseSelect = (hId: HouseId) => {
    soundManager.playSparkle();
    setFormData({ ...formData, preferred_house: hId });
    if (onSelectHouseTheme) {
      onSelectHouseTheme(hId);
    }
  };

  const handleDownloadDraftPdf = async () => {
    setIsGeneratingPdf(true);
    setPdfProgress('Transcrevendo Ficha de Hogwarts...');
    soundManager.playSparkle();

    try {
      const draftApp: CharacterApplication = {
        discord_id: user?.id || '0000000000000000',
        discord_username: user?.username || 'Bruxo Convocado',
        discord_avatar: user?.avatar || undefined,
        first_name: formData.first_name || 'Nome',
        last_name: formData.last_name || 'Sobrenome',
        birth_date: formData.birth_date,
        birth_place: formData.birth_place || 'Grã-Bretanha',
        blood_status: formData.blood_status,
        preferred_house: formData.preferred_house,
        wand_wood: formData.wand_wood,
        wand_core: formData.wand_core,
        wand_length: formData.wand_length,
        wand_flexibility: formData.wand_flexibility,
        wand_handle: formData.wand_handle,
        patronus: formData.patronus || undefined,
        character_backstory: formData.character_backstory,
        word_count: wordCount,
        rp_experience: formData.rp_experience || undefined,
        rules_accepted: formData.rules_accepted,
        status: 'pending',
      };

      await generateAndDownloadCharacterPdf(draftApp);
      setPdfProgress(null);
    } catch (err: any) {
      console.error('Falha ao gerar prévia PDF:', err);
      setPdfProgress('Erro ao gerar pergaminho.');
      setTimeout(() => setPdfProgress(null), 3000);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleSubmit = async () => {
    const activeUser = user || (manualDiscordInput.trim() ? {
      id: '14' + Math.floor(1000000000000000 + Math.random() * 9000000000000000),
      username: manualDiscordInput.trim().replace(/^@/, ''),
      avatar: null,
    } : null);

    if (!activeUser) {
      setErrorMessage('Vincule sua conta do Discord antes de enviar sua submissão.');
      setStep(4);
      return;
    }

    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      setErrorMessage('O Nome e o Sobrenome do personagem são obrigatórios.');
      setStep(1);
      return;
    }

    if (!formData.birth_place.trim()) {
      setErrorMessage('O Local de Nascimento do personagem é obrigatório.');
      setStep(1);
      return;
    }

    if (wordCount < MIN_WORDS_BACKSTORY) {
      setErrorMessage(`A história exige no mínimo ${MIN_WORDS_BACKSTORY.toLocaleString()} palavras. Você possui ${wordCount.toLocaleString()} palavras.`);
      setStep(3);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const applicationPayload: CharacterApplication = {
        discord_id: activeUser.id,
        discord_username: activeUser.username,
        discord_avatar: activeUser.avatar ? `https://cdn.discordapp.com/avatars/${activeUser.id}/${activeUser.avatar}.png` : undefined,
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        birth_date: formData.birth_date,
        birth_place: formData.birth_place.trim(),
        blood_status: formData.blood_status,
        preferred_house: formData.preferred_house,
        wand_wood: formData.wand_wood,
        wand_core: formData.wand_core,
        wand_length: formData.wand_length,
        wand_flexibility: formData.wand_flexibility,
        wand_handle: formData.wand_handle,
        patronus: formData.patronus.trim() || undefined,
        character_backstory: formData.character_backstory.trim(),
        word_count: wordCount,
        rp_experience: formData.rp_experience.trim() || undefined,
        rules_accepted: formData.rules_accepted,
        status: 'pending',
      };

      await onSubmit(applicationPayload);

      // Limpar rascunho salvo
      const userDraftKey = `${LOCAL_STORAGE_DRAFT_KEY}_${activeUser.id}`;
      const userFormKey = `${LOCAL_STORAGE_FORM_KEY}_${activeUser.id}`;
      localStorage.removeItem(userDraftKey);
      localStorage.removeItem(userFormKey);

      onClose();
    } catch (err: any) {
      console.error('Erro ao submeter no Livro da Admissão:', err);
      setErrorMessage(err.message || 'Falha ao lavrar candidatura no Livro da Admissão de Hogwarts.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtro de cabos
  const filteredHandles = WAND_HANDLES.filter((h) => {
    if (handleCategory === 'todos') return true;
    if (handleCategory === 'classicos') return h.id.includes('column') || h.id.includes('corkscrew');
    if (handleCategory === 'exoticos') return h.id.includes('celestial') || h.id.includes('checkerboard');
    if (handleCategory === 'botanicos') return h.id.includes('botanical') || h.id.includes('arrow');
    if (handleCategory === 'imperiais') return h.id.includes('imperial') || h.id.includes('regal') || h.id.includes('orbicular') || h.id.includes('avian');
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-[#05080f]/90 backdrop-blur-xl overflow-y-auto">
      
      {/* Container Principal Estilo ArcaneMP + Hogwarts Legacy */}
      <div className="relative w-full max-w-4xl max-h-[94vh] bg-[#0a0f19] border border-[var(--house-border-strong)] shadow-[0_0_50px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden animate-apple-modal my-auto">
        
        {/* Glow de Ambiente da Casa Selecionada */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[var(--house-glow)] rounded-full blur-[120px] pointer-events-none opacity-35" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[var(--house-primary)] rounded-full blur-[140px] pointer-events-none opacity-15" />

        {/* ─── Topo: Stepper com Medalhões Inspirado em Hogwarts Legacy ─── */}
        <div className="relative z-10 px-5 sm:px-8 pt-5 pb-4 border-b border-[var(--house-border)] bg-[#090e17]/95 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[#0d1422] border border-[var(--house-border)] flex items-center justify-center shadow-lg">
                <Wand2 className="w-5 h-5 text-[var(--house-accent)]" />
              </div>
              <div>
                <span className="eyebrow text-[10px] block">
                  Ministério da Magia · Criação de Personagem
                </span>
                <h2 className="font-display text-lg sm:text-2xl text-[#ece7da] leading-tight">
                  Ficha de Admissão em Hogwarts
                </h2>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {lastSaved && (
                <span className="text-[10px] text-[#b6bbc5] items-center space-x-1 hidden sm:flex">
                  <Save className="w-3 h-3 text-[var(--house-accent)]" />
                  <span>Salvo {lastSaved}</span>
                </span>
              )}
              <button
                onClick={onClose}
                className="p-2 bg-[#0d1422] hover:bg-[#172033] text-[#b6bbc5] hover:text-white transition cursor-pointer border border-[var(--house-border)]"
                title="Fechar formulário"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Barra de Trilho com Medalhões estilo Hogwarts Legacy */}
          <div className="relative flex items-center justify-between max-w-2xl mx-auto pt-2 pb-1">
            {/* Trilho Ornamental */}
            <div className="absolute top-1/2 left-4 right-4 -translate-y-1/2 h-[1px] bg-gradient-to-r from-[#c9b07a]/20 via-[#c9b07a]/60 to-[#c9b07a]/20 z-0" />

            {[
              { num: 1, label: 'Identidade', icon: User },
              { num: 2, label: 'Varinha Ollivanders', icon: Wand2 },
              { num: 3, label: 'Casa & Crônica', icon: Shield },
              { num: 4, label: 'Matrícula Oficial', icon: Scroll },
            ].map((item) => {
              const isActive = step === item.num;
              const isDone = step > item.num;
              const IconComp = item.icon;

              return (
                <button
                  key={item.num}
                  type="button"
                  onClick={() => {
                    soundManager.playClick();
                    setStep(item.num as any);
                  }}
                  className="relative z-10 flex flex-col items-center group cursor-pointer focus:outline-none"
                >
                  <div
                    className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center border transition-all duration-300 relative ${
                      isActive
                        ? 'bg-[#0d1422] border-[var(--house-accent)] ring-4 ring-[var(--house-glow)] scale-110 shadow-lg text-[var(--house-accent)]'
                        : isDone
                        ? 'bg-[#0d1422] border-[#c9b07a]/70 text-[#ead6a6]'
                        : 'bg-[#090e17] border-[var(--house-border)] text-[#8b93a1] hover:border-[var(--house-accent)]'
                    }`}
                  >
                    <IconComp className={`w-4 h-4 ${isActive ? 'animate-pulse' : ''}`} />
                    {isDone && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#6e9e81] flex items-center justify-center text-[10px] text-[#090e17]">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    )}
                  </div>
                  <span
                    className={`text-[10px] sm:text-xs font-display mt-1.5 transition ${
                      isActive
                        ? 'text-gold-gradient scale-105'
                        : isDone
                        ? 'text-[#ece7da]'
                        : 'text-[#8b93a1]'
                    }`}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Notificação de Erro */}
        {errorMessage && (
          <div className="px-6 py-2.5 bg-[#CF4A4A]/20 border-b border-[#CF4A4A]/40 text-xs text-[#FFC34F] flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-[#CF4A4A] shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* ─── Corpo do Formulário com Rolagem Suave ─── */}
        <div className="p-5 sm:p-7 overflow-y-auto flex-1 space-y-6 relative z-10 custom-scrollbar">

          {/* Banner Discord (se não conectado) */}
          {!user && (
            <div className="p-4 rounded-2xl bg-[#5865F2]/10 border border-[#5865F2]/30 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center space-x-3 text-left">
                <div className="w-9 h-9 rounded-xl bg-[#5865F2] flex items-center justify-center text-white shrink-0 shadow-md">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Vincule sua Conta do Discord</h4>
                  <p className="text-[11px] text-[#FFF0B2]/70">Necessário para emitir seu bilhete e notificar no canal oficial de Whitelist.</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={onLogin}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white text-xs font-bold flex items-center justify-center space-x-1.5 transition cursor-pointer shadow-lg"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Conectar OAuth</span>
                </button>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* ETAPA 1: Identidade & Linhagem (Hogwarts Legacy Character Spec) */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {step === 1 && (
            <div className="space-y-5 animate-apple-modal">
              <div className="border-b border-white/10 pb-2">
                <span className="text-[11px] uppercase tracking-widest text-[var(--house-accent)] font-bold block">
                  Passo 1 de 4
                </span>
                <h3 className="font-cinzel text-xl font-bold text-[#FFF0B2]">
                  Identidade do Bruxo(a) & Origem
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--house-accent)] mb-1.5">
                    Nome do Personagem *
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Alastair, Lyra, Edward"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[#0d1422] border border-[var(--house-border)] text-[#FFF0B2] placeholder-[#FFF0B2]/30 focus:border-[var(--house-accent)] focus:outline-none text-sm transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--house-accent)] mb-1.5">
                    Sobrenome da Linhagem *
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Blackwood, Pendelton, Vance"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[#0d1422] border border-[var(--house-border)] text-[#FFF0B2] placeholder-[#FFF0B2]/30 focus:border-[var(--house-accent)] focus:outline-none text-sm transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--house-accent)] mb-1.5">
                    Data de Nascimento (Anos 80/90 para os Anos 2000) *
                  </label>
                  <input
                    type="date"
                    min="1975-01-01"
                    max="1995-12-31"
                    value={formData.birth_date}
                    onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[#0d1422] border border-[var(--house-border)] text-[#FFF0B2] focus:border-[var(--house-accent)] focus:outline-none text-sm transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--house-accent)] mb-1.5">
                    Local de Nascimento *
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Hogsmeade, Godric's Hollow, Londres Mágica"
                    value={formData.birth_place}
                    onChange={(e) => setFormData({ ...formData, birth_place: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[#0d1422] border border-[var(--house-border)] text-[#FFF0B2] placeholder-[#FFF0B2]/30 focus:border-[var(--house-accent)] focus:outline-none text-sm transition"
                  />
                </div>
              </div>

              {/* Dormitório & Pronomes (Witch / Wizard - Canônico Hogwarts Legacy) */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--house-accent)] mb-1.5">
                  Acomodação dos Dormitórios de Hogwarts *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'wizard', label: 'Bruxo (Wizard Dormitory)', desc: 'Ala masculina das torres e masmorras' },
                    { id: 'witch', label: 'Bruxa (Witch Dormitory)', desc: 'Ala feminina com encanto anti-intrusão' },
                  ].map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, dormitory: d.id as any })}
                      className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                        formData.dormitory === d.id
                          ? 'bg-[var(--house-primary)] border-[var(--house-accent)] text-[#FFF0B2] shadow-lg'
                          : 'bg-[#0d1422] border-[var(--house-border)] text-[#FFF0B2]/60 hover:border-[var(--house-accent)]/50'
                      }`}
                    >
                      <span className="font-cinzel text-xs font-bold block">{d.label}</span>
                      <span className="text-[10px] text-[#FFF0B2]/50 block mt-0.5">{d.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Pureza de Sangue */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--house-accent)] mb-1.5">
                  Linhagem Mágica (Pureza de Sangue) *
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'pure-blood', label: 'Sangue-Puro', icon: Droplet, desc: 'Tradição ancestral das Sagradas 28' },
                    { id: 'half-blood', label: 'Mestiço', icon: Scale, desc: 'Herança mágica e laços trouxas' },
                    { id: 'muggle-born', label: 'Nascido-Trouxa', icon: Zap, desc: 'A magia espontânea nascida de surpresa' },
                  ].map((item) => {
                    const BloodIcon = item.icon;
                    return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, blood_status: item.id as BloodStatus })}
                      className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                        formData.blood_status === item.id
                          ? 'bg-[var(--house-primary)] border-[var(--house-accent)] text-[#FFF0B2] shadow-lg'
                          : 'bg-[#0d1422] border-[var(--house-border)] text-[#FFF0B2]/60 hover:border-[var(--house-accent)]/50'
                      }`}
                    >
                      <span className="text-xs font-bold flex items-center gap-1.5">
                        <span>{item.label}</span>
                        <BloodIcon className="w-3.5 h-3.5 text-[var(--house-accent)]" />
                      </span>
                      <span className="text-[10px] text-[#FFF0B2]/50 block mt-0.5">{item.desc}</span>
                    </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* ETAPA 2: OFICINA DE VARINHAS OLLIVANDERS (Hogwarts Legacy Look) */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {step === 2 && (
            <div className="space-y-6 animate-apple-modal">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <div>
                  <span className="text-[11px] uppercase tracking-widest text-[var(--house-accent)] font-bold block">
                    Passo 2 de 4 · Artesania Arcana
                  </span>
                  <h3 className="font-cinzel text-xl font-bold text-[#FFF0B2]">
                    Oficina de Varinhas Ollivanders · Beco Diagonal
                  </h3>
                </div>
                <span className="text-xs font-crimson italic text-[var(--house-accent)] hidden sm:block">
                  "A varinha escolhe o bruxo, Sr. {formData.last_name || 'Bruxo'}..."
                </span>
              </div>

              {/* Vitrine Superior: Inventário de Cabos (Esq) vs Pedestal de Inspeção (Dir) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                
                {/* COLUNA ESQUERDA: Slots de Equipamentos de Hogwarts Legacy (7 Colunas) */}
                <div className="lg:col-span-7 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-cinzel font-bold text-[#FFF0B2] flex items-center space-x-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[var(--house-accent)]" />
                      <span>Cabos de Varinha (Hogwarts Legacy Gear)</span>
                    </label>
                    <span className="text-[10px] font-mono text-[var(--house-accent)] font-bold">
                      {WAND_HANDLES.length} MODELOS
                    </span>
                  </div>

                  {/* Filtro de Estilos */}
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { id: 'todos', label: 'Todos' },
                      { id: 'imperiais', label: 'Imperiais & Régios' },
                      { id: 'botanicos', label: 'Botânicos' },
                      { id: 'exoticos', label: 'Celestiais & Xadrez' },
                      { id: 'classicos', label: 'Clássicos' },
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setHandleCategory(cat.id)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition cursor-pointer ${
                          handleCategory === cat.id
                            ? 'bg-[var(--house-accent)] text-[#160504] border-[var(--house-accent)] font-bold shadow-md'
                            : 'bg-[#0d1422] text-[#FFF0B2]/60 border-white/10 hover:border-[var(--house-accent)]/40 hover:text-white'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  {/* Grade de Slots de Equipamentos (Estilo Hogwarts Legacy Gear) */}
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5 max-h-60 overflow-y-auto p-2 rounded-2xl bg-[#0B0202] border border-[var(--house-border)] shadow-inner custom-scrollbar">
                    {filteredHandles.map((handle) => {
                      const isSelected = formData.wand_handle === handle.name;
                      return (
                        <button
                          key={handle.id}
                          type="button"
                          onClick={() => {
                            soundManager.playSparkle();
                            setFormData({ ...formData, wand_handle: handle.name });
                          }}
                          className={`relative aspect-square rounded-xl p-1 border transition-all duration-200 cursor-pointer flex flex-col items-center justify-center group ${
                            isSelected
                              ? 'bg-gradient-to-b from-[var(--house-primary)] to-[#0B0202] border-[var(--house-accent)] ring-2 ring-[var(--house-accent)] shadow-[0_0_16px_var(--house-glow)] scale-105 z-10'
                              : 'bg-[#090e17] border-white/10 hover:border-[var(--house-accent)]/50 hover:bg-[#200604]'
                          }`}
                          title={`${handle.name} — ${handle.colorName}`}
                        >
                          <img
                            src={handle.iconImg}
                            alt={handle.name}
                            draggable={false}
                            onDragStart={(e) => e.preventDefault()}
                            className="w-full h-full object-contain filter drop-shadow-md select-none pointer-events-none group-hover:scale-110 transition duration-300"
                          />
                          {isSelected && (
                            <div className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-[var(--house-accent)] shadow-[0_0_8px_var(--house-accent)] animate-pulse" />
                          )}
                          <span className="text-[8px] font-cinzel font-bold text-[#FFF0B2]/90 truncate w-full px-0.5 text-center mt-0.5">
                            {handle.family}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* COLUNA DIREITA: Pedestal de Inspeção de Relíquia (5 Colunas) */}
                <div className="lg:col-span-5 rounded-2xl bg-[#090e17] border border-[var(--house-border-strong)] p-4 shadow-2xl space-y-3 relative overflow-hidden">
                  
                  {/* Seletor de Modo de Exibição */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="text-[10px] font-cinzel font-bold uppercase tracking-wider text-[var(--house-accent)] inline-flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3" />
                      <span>Relíquia de Duelo 1890</span>
                    </span>
                    <div className="flex items-center bg-[#0B0202] p-0.5 rounded-lg border border-white/10">
                      <button
                        type="button"
                        onClick={() => setWandViewMode('3d')}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition flex items-center space-x-1 cursor-pointer ${
                          wandViewMode === '3d'
                            ? 'bg-[var(--house-accent)] text-[#120404]'
                            : 'text-[#FFF0B2]/60 hover:text-white'
                        }`}
                      >
                        <Wand2 className="w-2.5 h-2.5" />
                        <span>3D Macro</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setWandViewMode('sketch')}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition flex items-center space-x-1 cursor-pointer ${
                          wandViewMode === 'sketch'
                            ? 'bg-[var(--house-accent)] text-[#120404]'
                            : 'text-[#FFF0B2]/60 hover:text-white'
                        }`}
                      >
                        <BookOpen className="w-2.5 h-2.5" />
                        <span>Guia Campo</span>
                      </button>
                    </div>
                  </div>

                  {/* O Mostruário Cinematográfico (Sem Imagens Arrastáveis) */}
                  <div className="h-44 rounded-xl bg-gradient-to-b from-[#090e17] to-[#080202] border border-[var(--house-border)] relative flex items-center justify-center p-3 overflow-hidden shadow-inner select-none">
                    {/* Brilho radial no centro */}
                    <div className="absolute inset-0 bg-radial from-[var(--house-glow)]/25 via-transparent to-transparent pointer-events-none" />

                    {wandViewMode === '3d' ? (
                      <div className="relative w-full h-full flex items-center justify-center">
                        <img
                          src={currentWandHandle.handleImg}
                          alt={currentWandHandle.name}
                          draggable={false}
                          onDragStart={(e) => e.preventDefault()}
                          className="max-h-40 object-contain rotate-[-35deg] filter drop-shadow-[0_0_24px_var(--house-glow)] select-none pointer-events-none transition-transform duration-500 hover:scale-105"
                        />
                      </div>
                    ) : (
                      <div className="relative w-full h-full flex items-center justify-center bg-[#DFCDA4]/5 rounded-lg p-2 border border-[#C59A4E]/30">
                        <img
                          src={currentWandHandle.sketchImg}
                          alt={currentWandHandle.name}
                          draggable={false}
                          onDragStart={(e) => e.preventDefault()}
                          className="max-h-32 object-contain filter drop-shadow select-none pointer-events-none"
                        />
                      </div>
                    )}

                    <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/60 border border-white/10 text-[8px] font-mono uppercase tracking-widest text-[#FFF0B2]/60 pointer-events-none inline-flex items-center gap-1">
                      {wandViewMode === '3d' ? (
                        <>
                          <Sparkles className="w-2.5 h-2.5 text-[var(--house-accent)]" />
                          <span>Fuste e Empunhadura</span>
                        </>
                      ) : (
                        <>
                          <Scroll className="w-2.5 h-2.5 text-[var(--house-accent)]" />
                          <span>Guia de Campo</span>
                        </>
                      )}
                    </span>
                  </div>

                  {/* Dados Heráldicos da Varinha */}
                  <div>
                    <h4 className="font-cinzel text-sm sm:text-base font-extrabold text-[#FFF0B2]">
                      {currentWandHandle.name}
                    </h4>
                    <span className="text-[10px] text-[var(--house-accent)] font-semibold block uppercase tracking-wider">
                      {currentWandHandle.family} · {currentWandHandle.colorName}
                    </span>
                    <p className="font-crimson italic text-xs text-[#FFF0B2]/80 mt-1 leading-relaxed">
                      "{currentWandHandle.description}"
                    </p>
                  </div>
                </div>

              </div>

              {/* ─── Especificações Tradicionais de Garrick Ollivanders ─── */}
              <div className="space-y-4 pt-2 border-t border-white/10">
                <span className="text-xs font-cinzel font-bold text-[#FFF0B2] block">
                  Propriedades Arcanas do Fuste & Núcleo:
                </span>

                {/* 3 Grandes Núcleos Canônicos em Cards */}
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--house-accent)] mb-1.5">
                    Núcleo Mágico Canônico:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {WAND_CORES.slice(0, 3).map((core) => {
                      const isCoreSelected = formData.wand_core === core;
                      return (
                        <button
                          key={core}
                          type="button"
                          onClick={() => {
                            soundManager.playSparkle();
                            setFormData({ ...formData, wand_core: core });
                          }}
                          className={`p-3 rounded-xl border text-left transition cursor-pointer relative ${
                            isCoreSelected
                              ? 'bg-[var(--house-primary)] border-[var(--house-accent)] text-[#FFF0B2] shadow-lg ring-1 ring-[var(--house-accent)]'
                              : 'bg-[#0d1422] border-white/10 text-[#FFF0B2]/70 hover:border-[var(--house-accent)]/40'
                          }`}
                        >
                          <span className="font-cinzel text-xs font-bold block">{core}</span>
                          <span className="text-[9px] text-[#FFF0B2]/60 block mt-1 line-clamp-2">
                            {OLLIVANDERS_CORE_LORE[core] || 'Núcleo arcano nobre.'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Madeira, Comprimento e Flexibilidade */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#FFF0B2]/80 mb-1">
                      Madeira do Fuste:
                    </label>
                    <select
                      value={formData.wand_wood}
                      onChange={(e) => setFormData({ ...formData, wand_wood: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#0d1422] border border-[var(--house-border)] text-xs text-[#FFF0B2] focus:border-[var(--house-accent)] outline-none"
                    >
                      {WAND_WOODS.map((wood) => (
                        <option key={wood} value={wood}>{wood}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#FFF0B2]/80 mb-1">
                      Comprimento:
                    </label>
                    <select
                      value={formData.wand_length}
                      onChange={(e) => setFormData({ ...formData, wand_length: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#0d1422] border border-[var(--house-border)] text-xs text-[#FFF0B2] focus:border-[var(--house-accent)] outline-none"
                    >
                      {WAND_LENGTHS.map((len) => (
                        <option key={len} value={len}>{len}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#FFF0B2]/80 mb-1">
                      Flexibilidade:
                    </label>
                    <select
                      value={formData.wand_flexibility}
                      onChange={(e) => setFormData({ ...formData, wand_flexibility: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#0d1422] border border-[var(--house-border)] text-xs text-[#FFF0B2] focus:border-[var(--house-accent)] outline-none"
                    >
                      {WAND_FLEXIBILITIES.map((flex) => (
                        <option key={flex} value={flex}>{flex}</option>
                      ))}
                    </select>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* ETAPA 3: Aspiração de Casa & Crônica do Bruxo (3.000 Palavras) */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {step === 3 && (
            <div className="space-y-5 animate-apple-modal">
              <div className="border-b border-white/10 pb-2">
                <span className="text-[11px] uppercase tracking-widest text-[var(--house-accent)] font-bold block">
                  Passo 3 de 4 · Destino & Crônica
                </span>
                <h3 className="font-cinzel text-xl font-bold text-[#FFF0B2]">
                  Aspiração de Casa de Hogwarts & História Pessoal
                </h3>
              </div>

              {/* Seletor Dinâmico de Casas (Muda o Tema Instantaneamente com Animação Suave) */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--house-accent)] mb-2">
                  1. Aspiração da Casa Ancestral (Dispara a Adaptação de Cores do Website):
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {(Object.keys(HOUSES) as HouseId[]).map((hId) => {
                    const house = HOUSES[hId];
                    const isSelected = formData.preferred_house === hId;

                    return (
                      <button
                        key={hId}
                        type="button"
                        onClick={() => handleHouseSelect(hId)}
                        className={`p-3.5 rounded-2xl border text-left transition-all duration-500 relative overflow-hidden cursor-pointer group ${
                          isSelected
                            ? 'border-[var(--house-accent)] ring-2 ring-[var(--house-accent)] shadow-xl scale-105'
                            : 'border-white/10 hover:border-white/30 bg-[#160404]'
                        }`}
                        style={{
                          background: isSelected ? house.bgGradient : undefined,
                        }}
                      >
                        <span className="font-cinzel text-sm sm:text-base font-extrabold block text-white">
                          {house.name}
                        </span>
                        <span className="text-[10px] text-[#FFF0B2]/75 block mt-1 line-clamp-2">
                          "{house.motto}"
                        </span>
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-white shadow-md animate-pulse" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Patrono do Bruxo (Opcional) */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--house-accent)] mb-1.5">
                  Forma do Feitiço do Patrono (Se manifestado nos Anos 2000):
                </label>
                <input
                  type="text"
                  placeholder="Ex: Corça Prateada, Falcão-Peregrino, Lobo Ártico, Doninha"
                  value={formData.patronus}
                  onChange={(e) => setFormData({ ...formData, patronus: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0d1422] border border-[var(--house-border)] text-[#FFF0B2] placeholder-[#FFF0B2]/30 focus:border-[var(--house-accent)] focus:outline-none text-sm transition"
                />
              </div>

              {/* Crônica de 3.000 Palavras */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[var(--house-accent)]">
                    Crônica Oficial do Bruxo (Mínimo de 3.000 Palavras para o Roleplay):
                  </label>
                  <span className={`text-xs font-mono font-bold ${wordCount >= MIN_WORDS_BACKSTORY ? 'text-[#4CAF7C]' : 'text-[var(--house-accent)]'}`}>
                    {wordCount.toLocaleString()} / {MIN_WORDS_BACKSTORY.toLocaleString()} palavras ({wordProgress}%)
                  </span>
                </div>

                {/* Barra de Progresso */}
                <div className="w-full h-2 rounded-full bg-[#0D0202] border border-white/10 overflow-hidden mb-2">
                  <div
                    className={`h-full transition-all duration-300 rounded-full ${
                      wordCount >= MIN_WORDS_BACKSTORY
                        ? 'bg-gradient-to-r from-[#4CAF7C] to-[#2ECC71]'
                        : 'bg-gradient-to-r from-[var(--house-primary)] to-[var(--house-accent)]'
                    }`}
                    style={{ width: `${wordProgress}%` }}
                  />
                </div>

                <textarea
                  rows={9}
                  placeholder="Escreva a biografia detalhada do seu personagem, manifestações mágicas infantis, árvore genealógica, aspirações acadêmicas nos anos 2000 em Hogwarts..."
                  value={formData.character_backstory}
                  onChange={(e) => setFormData({ ...formData, character_backstory: e.target.value })}
                  className="w-full p-4 rounded-xl bg-[#0d1422] border border-[var(--house-border)] text-[#FFF0B2] placeholder-[#FFF0B2]/30 focus:border-[var(--house-accent)] focus:outline-none text-xs sm:text-sm font-crimson leading-relaxed custom-scrollbar transition"
                />

                <span className="text-[11px] text-[#FFF0B2]/60 flex items-center gap-1.5 mt-1">
                  <Lightbulb className="w-3.5 h-3.5 text-[var(--house-accent)] flex-shrink-0" />
                  <span>O rascunho é gravado automaticamente no seu navegador. Você pode pausar e continuar a qualquer momento.</span>
                </span>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* ETAPA 4: Revisão, Download do PDF & Matrícula Oficial           */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {step === 4 && (
            <div className="space-y-5 animate-apple-modal">
              <div className="border-b border-white/10 pb-2">
                <span className="text-[11px] uppercase tracking-widest text-[var(--house-accent)] font-bold block">
                  Passo 4 de 4 · Selamento do Pergaminho
                </span>
                <h3 className="font-cinzel text-xl font-bold text-[#FFF0B2]">
                  Revisão Final & Convocação no Livro da Admissão
                </h3>
              </div>

              {/* Resumo em Estilo Pergaminho */}
              <div className="p-5 rounded-2xl bg-[#0d1422] border border-[var(--house-border-strong)] space-y-4 shadow-xl">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-[var(--house-accent)] block font-semibold">Nome Completo:</span>
                    <span className="text-sm font-cinzel font-bold text-[#FFF0B2]">
                      {formData.first_name || '—'} {formData.last_name || '—'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[var(--house-accent)] block font-semibold">Casa Solicitada:</span>
                    <span className="text-sm font-cinzel font-bold text-[#FFF0B2]">
                      {HOUSES[formData.preferred_house]?.name || formData.preferred_house}
                    </span>
                  </div>
                  <div>
                    <span className="text-[var(--house-accent)] block font-semibold">Linhagem:</span>
                    <span className="text-sm text-[#FFF0B2] capitalize">
                      {formData.blood_status}
                    </span>
                  </div>
                  <div>
                    <span className="text-[var(--house-accent)] block font-semibold">Palavras da Crônica:</span>
                    <span className="text-sm font-mono font-bold text-[#4CAF7C]">
                      {wordCount.toLocaleString()} palavras
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <img
                      src={currentWandHandle.iconImg}
                      alt={currentWandHandle.name}
                      draggable={false}
                      className="w-12 h-12 object-contain rounded-lg bg-[#0B0202] p-1 border border-white/10 pointer-events-none"
                    />
                    <div className="text-xs">
                      <span className="text-[var(--house-accent)] font-bold block">Varinha Ollivanders:</span>
                      <span className="text-[#FFF0B2]">
                        {currentWandHandle.name} · {formData.wand_wood} com {formData.wand_core} ({formData.wand_length}, {formData.wand_flexibility})
                      </span>
                    </div>
                  </div>

                  {/* Botão de Download da Ficha em PDF */}
                  <button
                    type="button"
                    onClick={handleDownloadDraftPdf}
                    disabled={isGeneratingPdf}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#2A0604] hover:bg-[#5B1009] border border-[var(--house-border)] text-xs font-bold text-[#FFF0B2] transition flex items-center justify-center space-x-2 cursor-pointer shadow-md disabled:opacity-60"
                  >
                    <FileDown className={`w-4 h-4 text-[var(--house-accent)] ${isGeneratingPdf ? 'animate-bounce' : ''}`} />
                    <span>{pdfProgress || 'Baixar Prévia em PDF (Pergaminho)'}</span>
                  </button>
                </div>
              </div>

              {/* Vinculação do Discord se Pendente */}
              {!user && (
                <div className="p-4 rounded-xl bg-[#0d1422] border border-white/10 space-y-2">
                  <label className="block text-xs font-semibold text-[#FFC34F]">
                    Ou informe seu usuário do Discord manualmente:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ex: paulo_viccs ou Paulo#1234"
                      value={manualDiscordInput}
                      onChange={(e) => setManualDiscordInput(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl bg-[#120404] border border-white/20 text-xs text-white"
                    />
                    <button
                      type="button"
                      onClick={handleManualLink}
                      className="px-4 py-2 rounded-xl bg-[var(--house-accent)] text-[#160504] font-bold text-xs cursor-pointer hover:brightness-110"
                    >
                      Vincular
                    </button>
                  </div>
                </div>
              )}

              {/* Juramento Escolar de Hogwarts */}
              <div className="flex items-start space-x-3 p-3.5 rounded-xl bg-[#0F0202] border border-white/10">
                <input
                  type="checkbox"
                  id="rules-chk"
                  checked={formData.rules_accepted}
                  onChange={(e) => setFormData({ ...formData, rules_accepted: e.target.checked })}
                  className="mt-1 w-4 h-4 rounded text-[#FFC34F] focus:ring-0 cursor-pointer accent-[#FFC34F]"
                />
                <label htmlFor="rules-chk" className="text-xs text-[#FFF0B2]/80 leading-relaxed cursor-pointer">
                  Juro solenemente cumprir o Estatuto de Sigilo Mágico, as diretrizes do Ministério da Magia e os regulamentos de conduta de Hogwarts nos anos 2000 no servidor ACCIO Roleplay (Arcane MP).
                </label>
              </div>
            </div>
          )}

        </div>

        {/* ─── Rodapé de Navegação do Modal (Avançar / Voltar / Submeter) ─── */}
        <div className="px-6 py-4 border-t border-[var(--house-border)] bg-[#090e17]/95 backdrop-blur-md flex items-center justify-between">
          <div>
            {step > 1 ? (
              <button
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  setStep((step - 1) as any);
                }}
                className="btn-secondary btn-sm"
              >
                <ChevronLeft />
                <span>Voltar</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary btn-sm"
              >
                <span>Cancelar</span>
              </button>
            )}
          </div>

          <div>
            {step < 4 ? (
              <button
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  setStep((step + 1) as any);
                }}
                className="btn-primary btn-sm"
              >
                <span>Avançar</span>
                <ChevronRight />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || !formData.rules_accepted}
                className="btn-primary btn-sm"
              >
                <Sparkles />
                <span>{isSubmitting ? 'Lavrando...' : 'Lavrar Candidatura'}</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
