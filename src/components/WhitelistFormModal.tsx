import React, { useState, useEffect, useMemo } from 'react';
import { X, Sparkles, AlertTriangle, Save, Wand2, User, ChevronRight, ChevronLeft, LogIn, FileDown } from 'lucide-react';
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
}

export const WhitelistFormModal: React.FC<WhitelistFormModalProps> = ({
  isOpen,
  onClose,
  user,
  onLogin,
  onSubmit,
  onManualUserSet,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [manualDiscordInput, setManualDiscordInput] = useState('');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfProgress, setPdfProgress] = useState<string | null>(null);

  // Form State Limpo — Sem Dados Fictícios (Anos 2000 Lore)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    birth_date: '1989-09-01',
    birth_place: '',
    blood_status: 'half-blood' as BloodStatus,
    preferred_house: 'gryffindor' as HouseId,
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

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md">
      
      {/* Modal Card / Bottom Sheet */}
      <div className="w-full sm:max-w-3xl max-h-[92vh] sm:max-h-[88vh] bg-[#160504] border border-[#B83A0C]/40 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-apple-sheet sm:animate-apple-modal">
        
        {/* Mobile Pull-to-close Indicator */}
        <div className="w-12 h-1.5 bg-[#B83A0C]/40 rounded-full mx-auto mt-3 mb-1 sm:hidden cursor-pointer" onClick={onClose} />

        {/* Header */}
        <div className="px-6 py-4 border-b border-[#B83A0C]/20 flex items-center justify-between bg-[#210604]/50">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FFC34F] to-[#5B1009] p-0.5">
              <div className="w-full h-full bg-[#160504] rounded-[6px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-[#FFC34F]" />
              </div>
            </div>
            <div>
              <h2 className="font-cinzel text-lg sm:text-xl font-bold text-[#FFF0B2] leading-tight">
                Ficha de Admissão em Hogwarts
              </h2>
              <span className="text-[11px] text-[#FFC34F] font-semibold">
                Etapa {step} de 4 — {step === 1 ? 'Identidade' : step === 2 ? 'Varinha & Casa' : step === 3 ? 'História (3.000+ Palavras)' : 'Revisão'}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {lastSaved && (
              <span className="text-[10px] text-[#FFF0B2]/50 flex items-center space-x-1 hidden sm:flex">
                <Save className="w-3 h-3 text-[#FFC34F]" />
                <span>Salvo {lastSaved}</span>
              </span>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#5B1009]/50 hover:bg-[#5B1009] text-[#FFF0B2]/70 hover:text-[#FFF0B2] flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="px-6 py-2.5 bg-[#CF4A4A]/20 border-b border-[#CF4A4A]/40 text-xs text-[#FFC34F] flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-[#CF4A4A] shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Modal Body / Steps */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">

          {/* Banner de Vinculação com Discord (se não conectado) */}
          {!user && (
            <div className="p-4 rounded-2xl bg-[#5865F2]/10 border border-[#5865F2]/30 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center space-x-3 text-left">
                <div className="w-9 h-9 rounded-xl bg-[#5865F2] flex items-center justify-center text-white shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Vincule sua Conta do Discord</h4>
                  <p className="text-[11px] text-[#FFF0B2]/70">Necessário para emitir seu bilhete e notificar no canal oficial.</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={onLogin}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white text-xs font-bold flex items-center justify-center space-x-1.5 transition cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Conectar OAuth</span>
                </button>
              </div>
            </div>
          )}

          {/* ETAPA 1: Identidade Pessoal */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#FFC34F] mb-1.5">
                    Nome do Bruxo *
                  </label>
                  <input
                    type="text"
                    placeholder="Nome do personagem"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#210604] border border-[#B83A0C]/40 text-[#FFF0B2] placeholder-[#FFF0B2]/30 focus:border-[#FFC34F] focus:outline-none text-sm transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#FFC34F] mb-1.5">
                    Sobrenome do Bruxo *
                  </label>
                  <input
                    type="text"
                    placeholder="Sobrenome da linhagem"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#210604] border border-[#B83A0C]/40 text-[#FFF0B2] placeholder-[#FFF0B2]/30 focus:border-[#FFC34F] focus:outline-none text-sm transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#FFC34F] mb-1.5">
                    Data de Nascimento (Anos 80/90 para os Anos 2000) *
                  </label>
                  <input
                    type="date"
                    min="1975-01-01"
                    max="1995-12-31"
                    value={formData.birth_date}
                    onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#210604] border border-[#B83A0C]/40 text-[#FFF0B2] focus:border-[#FFC34F] focus:outline-none text-sm transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#FFC34F] mb-1.5">
                    Local de Nascimento *
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Hogsmeade, Godric's Hollow, Londres, Edimburgo"
                    value={formData.birth_place}
                    onChange={(e) => setFormData({ ...formData, birth_place: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#210604] border border-[#B83A0C]/40 text-[#FFF0B2] placeholder-[#FFF0B2]/30 focus:border-[#FFC34F] focus:outline-none text-sm transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#FFC34F] mb-1.5">
                  Pureza de Sangue *
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'pure-blood', label: 'Sangue-Puro' },
                    { id: 'half-blood', label: 'Mestiço' },
                    { id: 'muggle-born', label: 'Nascido-Trouxa' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, blood_status: item.id as BloodStatus })}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                        formData.blood_status === item.id
                          ? 'bg-[#5B1009] border-[#FFC34F] text-[#FFF0B2] shadow-lg shadow-[#5B1009]/50'
                          : 'bg-[#210604]/60 border-[#B83A0C]/30 text-[#FFF0B2]/60 hover:border-[#FFC34F]/40'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ETAPA 2: Varinha & Casa (Oficina Ollivanders & Pottermore) */}
          {step === 2 && (() => {
            const currentWandHandle = WAND_HANDLES.find((w) => w.name === formData.wand_handle) || WAND_HANDLES[0];
            return (
              <div className="space-y-5">
                {/* 1. Escolha da Casa de Hogwarts */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#FFC34F] mb-1.5">
                    Aspiração de Casa de Hogwarts *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {(Object.keys(HOUSES) as HouseId[]).map((hId) => {
                      const house = HOUSES[hId];
                      const isSelected = formData.preferred_house === hId;
                      return (
                        <button
                          key={hId}
                          type="button"
                          onClick={() => {
                            soundManager.playSparkle();
                            setFormData({ ...formData, preferred_house: hId });
                          }}
                          className={`p-3 rounded-xl border text-left transition relative overflow-hidden cursor-pointer ${
                            isSelected
                              ? 'border-[#FFC34F] shadow-lg shadow-[#FFC34F]/10'
                              : 'border-[#B83A0C]/30 hover:border-[#FFC34F]/30 bg-[#210604]/40'
                          }`}
                          style={{
                            background: isSelected ? house.bgGradient : undefined,
                          }}
                        >
                          <span className="font-cinzel text-sm font-bold block text-white">
                            {house.name}
                          </span>
                          <span className="text-[10px] text-[#FFF0B2]/70 block mt-0.5 line-clamp-2">
                            {house.motto}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Oficina de Varinhas Ollivanders (Pottermore & Hogwarts Legacy) */}
                <div className="p-4 rounded-2xl bg-[#1c0605] border border-[#FFC34F]/35 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between border-b border-[#B83A0C]/30 pb-2.5">
                    <div className="flex items-center space-x-2 text-[#FFC34F] text-xs font-bold uppercase tracking-wider">
                      <Wand2 className="w-4 h-4 text-[#FFC34F] animate-pulse" />
                      <span>Oficina de Varinhas Ollivanders · Beco Diagonal</span>
                    </div>
                    <span className="text-[11px] text-[#FFF0B2]/70 font-serif italic">
                      "A Varinha Escolhe o Bruxo"
                    </span>
                  </div>

                  {/* Seletor Visual de Cabos (11 Modelos Extraídos de Hogwarts Legacy) */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-semibold text-[#FFF0B2]">
                        1. Selecione o Cabo da Varinha (Hogwarts Legacy):
                      </label>
                      <span className="text-[11px] text-[#FFC34F] font-bold font-mono">
                        {currentWandHandle.name}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 max-h-44 overflow-y-auto pr-1">
                      {WAND_HANDLES.map((handle) => {
                        const isHandleSelected = formData.wand_handle === handle.name;
                        return (
                          <button
                            key={handle.id}
                            type="button"
                            onClick={() => {
                              soundManager.playSparkle();
                              setFormData({ ...formData, wand_handle: handle.name });
                            }}
                            className={`p-2 rounded-xl border flex flex-col items-center text-center transition cursor-pointer relative group ${
                              isHandleSelected
                                ? 'bg-[#5B1009] border-[#FFC34F] shadow-lg shadow-[#FFC34F]/25 scale-105 ring-1 ring-[#FFC34F]'
                                : 'bg-[#100303] border-[#B83A0C]/30 hover:border-[#FFC34F]/40'
                            }`}
                          >
                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#210604] flex items-center justify-center mb-1">
                              <img
                                src={handle.iconImg}
                                alt={handle.name}
                                className="w-full h-full object-contain group-hover:scale-110 transition duration-300"
                              />
                            </div>
                            <span className="text-[10px] font-cinzel font-bold text-[#FFF0B2] truncate w-full">
                              {handle.family}
                            </span>
                            <span className="text-[8px] text-[#FFF0B2]/50 truncate w-full">
                              {handle.colorName.split('&')[0]}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Vitrine Estilo Pottermore & Guia de Campo */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-[#0D0202] border border-[#B83A0C]/40">
                    <div className="relative rounded-lg overflow-hidden border border-[#C4973B]/50 bg-[#DFCDA4] h-32 flex items-center justify-center p-2 shadow-inner">
                      <img
                        src={currentWandHandle.sketchImg}
                        alt={`Esboço de ${currentWandHandle.name}`}
                        className="max-h-full max-w-full object-contain filter drop-shadow"
                      />
                      <span className="absolute bottom-1 right-2 text-[9px] font-mono text-[#3B1207]/70 font-bold uppercase tracking-widest">
                        Esboço Guia de Campo
                      </span>
                    </div>

                    <div className="relative rounded-lg overflow-hidden border border-[#B83A0C]/50 bg-[#160504] h-32 flex flex-col items-center justify-center p-3">
                      <img
                        src={currentWandHandle.handleImg}
                        alt={`Cabo 3D ${currentWandHandle.name}`}
                        className="max-h-16 w-full object-contain filter drop-shadow-[0_0_8px_rgba(255,195,79,0.3)] mb-1.5"
                      />
                      <p className="text-[10px] text-[#FFF0B2]/80 font-crimson italic text-center line-clamp-2">
                        {currentWandHandle.description}
                      </p>
                    </div>
                  </div>

                  {/* Fuste: Madeira, Núcleo, Comprimento e Flexibilidade */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[11px] text-[#FFF0B2]/70 mb-1 font-semibold">
                        2. Madeira do Fuste:
                      </label>
                      <select
                        value={formData.wand_wood}
                        onChange={(e) => setFormData({ ...formData, wand_wood: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-[#160504] border border-[#B83A0C]/40 text-xs text-[#FFF0B2] focus:border-[#FFC34F] outline-none"
                      >
                        {WAND_WOODS.map((wood) => (
                          <option key={wood} value={wood}>{wood}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] text-[#FFF0B2]/70 mb-1 font-semibold">
                        3. Núcleo Mágico (Tradição Ollivanders):
                      </label>
                      <select
                        value={formData.wand_core}
                        onChange={(e) => setFormData({ ...formData, wand_core: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-[#160504] border border-[#B83A0C]/40 text-xs text-[#FFF0B2] focus:border-[#FFC34F] outline-none"
                      >
                        {WAND_CORES.map((core) => (
                          <option key={core} value={core}>{core}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] text-[#FFF0B2]/70 mb-1 font-semibold">
                        4. Comprimento:
                      </label>
                      <select
                        value={formData.wand_length}
                        onChange={(e) => setFormData({ ...formData, wand_length: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-[#160504] border border-[#B83A0C]/40 text-xs text-[#FFF0B2] focus:border-[#FFC34F] outline-none"
                      >
                        {WAND_LENGTHS.map((len) => (
                          <option key={len} value={len}>{len}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] text-[#FFF0B2]/70 mb-1 font-semibold">
                        5. Flexibilidade:
                      </label>
                      <select
                        value={formData.wand_flexibility}
                        onChange={(e) => setFormData({ ...formData, wand_flexibility: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-[#160504] border border-[#B83A0C]/40 text-xs text-[#FFF0B2] focus:border-[#FFC34F] outline-none"
                      >
                        {WAND_FLEXIBILITIES.map((flex) => (
                          <option key={flex} value={flex}>{flex}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Lore Dinâmica de Ollivanders para o Núcleo Selecionado */}
                  <div className="p-2.5 rounded-xl bg-[#210604]/80 border border-[#B83A0C]/30 text-[11px] text-[#FFF0B2]/75 font-crimson italic">
                    <span className="text-[#FFC34F] font-bold not-italic">Propriedades Arcanas de {formData.wand_core}: </span>
                    {OLLIVANDERS_CORE_LORE[formData.wand_core] || 'Núcleo de extraordinária ressonância mágica.'}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ETAPA 3: História do Personagem (Mínimo de 3.000 Palavras) */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#FFC34F]">
                    Crônica & Trajetória do Personagem *
                  </label>
                  <span className="text-[11px] text-[#FFF0B2]/60">
                    Narre a infância, despertar do poder mágico e eventos até a chegada a Hogwarts.
                  </span>
                </div>

                <div className="text-right">
                  <span className={`font-mono text-xs font-bold ${wordCount >= MIN_WORDS_BACKSTORY ? 'text-[#4CAF7C]' : 'text-[#FFC34F]'}`}>
                    {wordCount.toLocaleString()} / {MIN_WORDS_BACKSTORY.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-[#FFF0B2]/50 block">palavras</span>
                </div>
              </div>

              {/* Barra de Progresso de Palavras */}
              <div className="w-full h-2 bg-[#210604] rounded-full overflow-hidden border border-[#B83A0C]/30">
                <div
                  className={`h-full transition-all duration-300 rounded-full ${
                    wordCount >= MIN_WORDS_BACKSTORY
                      ? 'bg-[#4CAF7C]'
                      : 'bg-gradient-to-r from-[#B83A0C] via-[#F47A16] to-[#FFC34F]'
                  }`}
                  style={{ width: `${wordProgress}%` }}
                />
              </div>

              <textarea
                rows={12}
                placeholder="Comece sua narrativa aqui... Escreva detalhadamente sobre suas origens, manifestações mágicas, relações com sua família e sua visão do mundo bruxo nos anos 2000."
                value={formData.character_backstory}
                onChange={(e) => setFormData({ ...formData, character_backstory: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-[#210604] border border-[#B83A0C]/40 text-[#FFF0B2] placeholder-[#FFF0B2]/25 focus:border-[#FFC34F] focus:outline-none text-xs sm:text-sm font-crimson leading-relaxed transition resize-none select-text"
              />
            </div>
          )}

          {/* ETAPA 4: Revisão Final */}
          {step === 4 && (() => {
            const currentWandHandle = WAND_HANDLES.find((w) => w.name === formData.wand_handle) || WAND_HANDLES[0];
            
            const handleDownloadPdfPreview = async () => {
              setIsGeneratingPdf(true);
              soundManager.playSparkle();
              const activeUser = user || {
                id: '14' + Math.floor(1000000000000000 + Math.random() * 9000000000000000),
                username: manualDiscordInput.trim().replace(/^@/, '') || 'Bruxo Pioneiro',
                avatar: null,
              };
              const tempApp: CharacterApplication = {
                discord_id: activeUser.id,
                discord_username: activeUser.username,
                first_name: formData.first_name || 'Bruxo',
                last_name: formData.last_name || 'Convocado',
                birth_date: formData.birth_date,
                birth_place: formData.birth_place || 'Godric Hollow',
                blood_status: formData.blood_status,
                preferred_house: formData.preferred_house,
                wand_wood: formData.wand_wood,
                wand_core: formData.wand_core,
                wand_length: formData.wand_length,
                wand_flexibility: formData.wand_flexibility,
                wand_handle: formData.wand_handle,
                patronus: formData.patronus || undefined,
                character_backstory: formData.character_backstory || 'Crônica em elaboração.',
                word_count: wordCount,
                rules_accepted: formData.rules_accepted,
              };
              await generateAndDownloadCharacterPdf(tempApp, (msg) => setPdfProgress(msg));
              setIsGeneratingPdf(false);
              setPdfProgress(null);
            };

            return (
              <div className="space-y-4">
                <div className="bg-[#210604] border border-[#B83A0C]/30 rounded-2xl p-4 text-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <h4 className="font-cinzel text-sm font-bold text-[#FFC34F]">Resumo da Ficha de Matrícula</h4>
                    <span className="text-[10px] text-[#4CAF7C] font-mono font-bold">
                      Hogwarts Legacy • Anos 2000
                    </span>
                  </div>

                  <p><strong className="text-[#FFF0B2]">Bruxo:</strong> {formData.first_name} {formData.last_name}</p>
                  <p><strong className="text-[#FFF0B2]">Nascimento:</strong> {formData.birth_date} em {formData.birth_place}</p>
                  <p><strong className="text-[#FFF0B2]">Casa de Hogwarts:</strong> {HOUSES[formData.preferred_house].name}</p>
                  
                  {/* Detalhes da Varinha com Imagem do Cabo */}
                  <div className="p-2.5 rounded-xl bg-[#160504] border border-[#B83A0C]/30 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#FFC34F] block">Varinha Mágica Escolhida:</span>
                      <p className="text-[11px] text-[#FFF0B2]">
                        Cabo <strong>{currentWandHandle.name}</strong> • Madeira de <strong>{formData.wand_wood}</strong> • {formData.wand_length} ({formData.wand_flexibility})
                      </p>
                      <p className="text-[10px] text-[#FFF0B2]/60 italic">Núcleo: {formData.wand_core}</p>
                    </div>
                    <img
                      src={currentWandHandle.iconImg}
                      alt={currentWandHandle.name}
                      className="w-10 h-10 object-contain bg-[#210604] p-1 rounded-lg border border-[#FFC34F]/30 shrink-0"
                    />
                  </div>

                  <p><strong className="text-[#FFF0B2]">Contagem da História:</strong> {wordCount.toLocaleString()} palavras ({wordCount >= MIN_WORDS_BACKSTORY ? '✅ Aprovada' : '❌ Insuficiente'})</p>

                  {/* Status do Discord */}
                  <div className="pt-2 border-t border-white/10">
                    {user ? (
                      <p><strong className="text-[#FFF0B2]">Discord Vinculado:</strong> {user.username} ({user.id})</p>
                    ) : (
                      <div className="space-y-2">
                        <label className="block text-[11px] font-bold text-[#FFC34F]">
                          Vincular Discord (Usuário / Tag):
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Ex: @seunick ou seunick#0000"
                            value={manualDiscordInput}
                            onChange={(e) => setManualDiscordInput(e.target.value)}
                            className="flex-1 px-3 py-1.5 rounded-lg bg-[#160504] border border-[#B83A0C]/40 text-xs text-[#FFF0B2] focus:border-[#FFC34F] outline-none"
                          />
                          <button
                            type="button"
                            onClick={handleManualLink}
                            className="px-3 py-1.5 rounded-lg bg-[#5865F2] text-white text-xs font-bold hover:bg-[#4752C4] transition"
                          >
                            Vincular
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Botão de Prévia e Download do Pergaminho em PDF */}
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#5B1009]/40 to-[#210604] border border-[#FFC34F]/30 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#5B1009] flex items-center justify-center text-[#FFC34F] border border-[#FFC34F]/40">
                      <FileDown className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[#FFF0B2] block">Ficha Oficial em Pergaminho (PDF)</span>
                      <span className="text-[10px] text-[#FFF0B2]/60 block">Documento canônico com selo de cera e suas escolhas</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleDownloadPdfPreview}
                    disabled={isGeneratingPdf}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#FFC34F]/20 hover:bg-[#FFC34F]/30 border border-[#FFC34F]/50 text-[#FFF0B2] text-xs font-bold flex items-center justify-center space-x-1.5 transition cursor-pointer disabled:opacity-50"
                  >
                    <FileDown className="w-3.5 h-3.5 text-[#FFC34F]" />
                    <span>{isGeneratingPdf ? (pdfProgress || 'Gerando PDF...') : 'Baixar Prévia em PDF'}</span>
                  </button>
                </div>

                <label className="flex items-start space-x-3 cursor-pointer p-3 rounded-xl bg-[#210604]/50 border border-[#B83A0C]/20 text-xs text-[#FFF0B2]/80">
                  <input
                    type="checkbox"
                    checked={formData.rules_accepted}
                    onChange={(e) => setFormData({ ...formData, rules_accepted: e.target.checked })}
                    className="mt-0.5 rounded text-[#FFC34F] focus:ring-0"
                  />
                  <span>
                    Declaro que li e compreendo o estatuto de sigilo e conduta do ACCIO Roleplay. Estou ciente de que atitudes incompatíveis com o cânone do mundo bruxo nos anos 2000 resultarão na perda da vaga de pioneiro.
                  </span>
                </label>
              </div>
            );
          })()}

        </div>

        {/* Footer Navigation */}
        <div className="px-6 py-4 border-t border-[#B83A0C]/20 bg-[#210604]/80 flex justify-between items-center">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => {
                soundManager.playQuill();
                setStep((prev) => (prev - 1) as any);
              }}
              className="px-4 py-2 rounded-xl bg-[#5B1009]/40 hover:bg-[#5B1009] text-xs font-semibold text-[#FFF0B2] transition flex items-center space-x-1 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Voltar</span>
            </button>
          ) : <div />}

          {step < 4 ? (
            <button
              type="button"
              onClick={() => {
                soundManager.playQuill();
                setErrorMessage(null);
                setStep((prev) => (prev + 1) as any);
              }}
              className="px-5 py-2.5 rounded-xl btn-accio-gold text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
            >
              <span>Avançar</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={isSubmitting || wordCount < MIN_WORDS_BACKSTORY || !formData.rules_accepted}
              onClick={handleSubmit}
              className="px-6 py-2.5 rounded-xl btn-accio-gold text-xs font-bold transition flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-[#F47A16]/20 cursor-pointer"
            >
              {isSubmitting ? (
                <span>Transmitindo ao Castelo...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Enviar Submissão à Escola de Hogwarts</span>
                </>
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
