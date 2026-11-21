import React, { useState, useEffect, useMemo } from 'react';
import { X, Sparkles, AlertTriangle, Save, Wand2, User, ChevronRight, ChevronLeft, LogIn } from 'lucide-react';
import { CharacterApplication, DiscordUser, HouseId, BloodStatus } from '../types';
import { HOUSES, WAND_WOODS, WAND_CORES, WAND_LENGTHS, WAND_FLEXIBILITIES, MIN_WORDS_BACKSTORY, LOCAL_STORAGE_FORM_KEY, LOCAL_STORAGE_DRAFT_KEY } from '../lib/constants';

interface WhitelistFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: DiscordUser | null;
  onLogin: () => void;
  onSubmit: (app: CharacterApplication) => Promise<void>;
}

export const WhitelistFormModal: React.FC<WhitelistFormModalProps> = ({
  isOpen,
  onClose,
  user,
  onLogin,
  onSubmit,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  // Form State Limpo — Sem Dados Fictícios
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    birth_date: '1875-09-01',
    birth_place: '',
    blood_status: 'half-blood' as BloodStatus,
    preferred_house: 'gryffindor' as HouseId,
    wand_wood: WAND_WOODS[0],
    wand_core: WAND_CORES[0],
    wand_length: WAND_LENGTHS[3],
    wand_flexibility: WAND_FLEXIBILITIES[2],
    patronus: '',
    character_backstory: '',
    rp_experience: '',
    rules_accepted: true,
  });

  // Restaurar dados salvos localmente vinculados ao usuário
  useEffect(() => {
    if (!user) return;
    const userDraftKey = `${LOCAL_STORAGE_DRAFT_KEY}_${user.id}`;
    const userFormKey = `${LOCAL_STORAGE_FORM_KEY}_${user.id}`;

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

  // Auto-save no LocalStorage atrelado ao usuário a cada 3 segundos
  useEffect(() => {
    if (!user || (!formData.first_name && !formData.character_backstory)) return;

    const userDraftKey = `${LOCAL_STORAGE_DRAFT_KEY}_${user.id}`;
    const userFormKey = `${LOCAL_STORAGE_FORM_KEY}_${user.id}`;

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

  const handleSubmit = async () => {
    if (!user) {
      setErrorMessage('Acesso negado: Autentique-se com o Discord para continuar.');
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
      await onSubmit({
        discord_id: user.id,
        discord_username: user.global_name || user.username,
        discord_avatar: user.avatar || undefined,
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
        patronus: formData.patronus.trim() || undefined,
        character_backstory: formData.character_backstory.trim(),
        word_count: wordCount,
        rp_experience: formData.rp_experience.trim() || undefined,
        rules_accepted: formData.rules_accepted,
        status: 'pending',
      });

      // Limpar rascunho local após envio bem-sucedido
      if (user) {
        localStorage.removeItem(`${LOCAL_STORAGE_DRAFT_KEY}_${user.id}`);
        localStorage.removeItem(`${LOCAL_STORAGE_FORM_KEY}_${user.id}`);
      }
      onClose();
    } catch (err: any) {
      console.error('Erro ao submeter no Supabase:', err);
      setErrorMessage(err.message || 'Falha ao registrar candidatura no banco de dados Supabase.');
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

          {/* Autenticação Discord Gate Obrigatório */}
          {!user ? (
            <div className="py-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-[#5865F2]/20 border border-[#5865F2]/40 flex items-center justify-center mx-auto text-[#5865F2]">
                <User className="w-8 h-8" />
              </div>
              <h3 className="font-cinzel text-xl font-bold text-[#FFF0B2]">
                Login com Discord Obrigatório
              </h3>
              <p className="text-sm text-[#FFF0B2]/70 max-w-md mx-auto font-sans leading-relaxed">
                Para vincular seu personagem de forma autêntica à sua conta no servidor Arcane MP, você deve autenticar-se através do Discord.
              </p>
              <button
                type="button"
                onClick={onLogin}
                className="px-6 py-3 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white text-sm font-bold transition shadow-xl shadow-[#5865F2]/20 inline-flex items-center space-x-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Conectar com Discord</span>
              </button>
            </div>
          ) : (
            <>
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
                        Data de Nascimento *
                      </label>
                      <input
                        type="date"
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
                        placeholder="Ex: Hogsmeade, Godric's Hollow, Londres"
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

              {/* ETAPA 2: Casa & Varinha */}
              {step === 2 && (
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#FFC34F] mb-2">
                      Casa de Preferência *
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {(Object.keys(HOUSES) as HouseId[]).map((hId) => {
                        const house = HOUSES[hId];
                        const isSelected = formData.preferred_house === hId;
                        return (
                          <div
                            key={hId}
                            onClick={() => setFormData({ ...formData, preferred_house: hId })}
                            className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                              isSelected
                                ? 'border-[#FFC34F] shadow-lg shadow-[#F47A16]/20 scale-102'
                                : 'border-[#B83A0C]/30 hover:border-[#FFC34F]/50 opacity-70 hover:opacity-100'
                            }`}
                            style={{ background: house.bgGradient }}
                          >
                            <h4 className="font-cinzel text-base font-bold text-[#FFF0B2]">{house.name}</h4>
                            <p className="text-[11px] text-[#FFF0B2]/70 mt-1 leading-tight">{house.motto}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#B83A0C]/20">
                    <h3 className="font-cinzel text-sm font-bold text-[#FFC34F] mb-3 flex items-center space-x-1.5">
                      <Wand2 className="w-4 h-4" />
                      <span>Especificações da Varinha</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] text-[#FFF0B2]/70 mb-1">Madeira</label>
                        <select
                          value={formData.wand_wood}
                          onChange={(e) => setFormData({ ...formData, wand_wood: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-[#210604] border border-[#B83A0C]/40 text-[#FFF0B2] text-xs focus:outline-none"
                        >
                          {WAND_WOODS.map((w) => <option key={w} value={w}>{w}</option>)}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] text-[#FFF0B2]/70 mb-1">Núcleo Mágico</label>
                        <select
                          value={formData.wand_core}
                          onChange={(e) => setFormData({ ...formData, wand_core: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-[#210604] border border-[#B83A0C]/40 text-[#FFF0B2] text-xs focus:outline-none"
                        >
                          {WAND_CORES.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] text-[#FFF0B2]/70 mb-1">Comprimento</label>
                        <select
                          value={formData.wand_length}
                          onChange={(e) => setFormData({ ...formData, wand_length: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-[#210604] border border-[#B83A0C]/40 text-[#FFF0B2] text-xs focus:outline-none"
                        >
                          {WAND_LENGTHS.map((l) => <option key={l} value={l}>{l}</option>)}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] text-[#FFF0B2]/70 mb-1">Flexibilidade</label>
                        <select
                          value={formData.wand_flexibility}
                          onChange={(e) => setFormData({ ...formData, wand_flexibility: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-[#210604] border border-[#B83A0C]/40 text-[#FFF0B2] text-xs focus:outline-none"
                        >
                          {WAND_FLEXIBILITIES.map((f) => <option key={f} value={f}>{f}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ETAPA 3: A História de 3.000 Palavras */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 bg-[#210604] p-3.5 rounded-2xl border border-[#B83A0C]/30">
                    <div>
                      <h4 className="font-cinzel text-xs uppercase tracking-wider text-[#FFC34F] font-bold">
                        História do Personagem (Mínimo de 3.000 palavras)
                      </h4>
                      <p className="text-[11px] text-[#FFF0B2]/60 mt-0.5">
                        Inclua infância, primeiras manifestações de magia e chegada a Hogwarts.
                      </p>
                    </div>

                    {/* Contador de Palavras & Progresso */}
                    <div className="flex items-center space-x-3 shrink-0">
                      <div className="text-right">
                        <span className={`font-mono text-sm font-bold ${wordCount >= MIN_WORDS_BACKSTORY ? 'text-[#4CAF7C]' : 'text-[#FFC34F]'}`}>
                          {wordCount.toLocaleString()} / {MIN_WORDS_BACKSTORY.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-[#FFF0B2]/50 block">palavras</span>
                      </div>
                      
                      <div className="w-10 h-10 rounded-full bg-[#100303] border border-[#B83A0C]/40 flex items-center justify-center font-mono text-[10px] font-bold text-[#FFC34F]">
                        {wordProgress}%
                      </div>
                    </div>
                  </div>

                  {/* Textarea de Alta Resiliência com Auto-Save */}
                  <div className="relative">
                    <textarea
                      rows={12}
                      value={formData.character_backstory}
                      onChange={(e) => setFormData({ ...formData, character_backstory: e.target.value })}
                      placeholder="Comece aqui a narrativa do seu personagem..."
                      className="w-full p-4 rounded-2xl bg-[#100303]/90 border border-[#B83A0C]/40 text-[#FFF0B2] placeholder-[#FFF0B2]/25 focus:border-[#FFC34F] focus:outline-none text-sm font-crimson leading-relaxed resize-none transition"
                    />
                    
                    {wordCount < MIN_WORDS_BACKSTORY && (
                      <div className="mt-2 text-xs text-[#F47A16] flex items-center space-x-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Faltam {(MIN_WORDS_BACKSTORY - wordCount).toLocaleString()} palavras para atingir o requisito mínimo.</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#FFC34F] mb-1">
                      Experiência Prévia em Roleplay (Opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="Descreva seu histórico em servidores de RP"
                      value={formData.rp_experience}
                      onChange={(e) => setFormData({ ...formData, rp_experience: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#210604] border border-[#B83A0C]/40 text-[#FFF0B2] text-xs focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* ETAPA 4: Revisão Final */}
              {step === 4 && (
                <div className="space-y-4">
                  <div className="bg-[#210604] border border-[#B83A0C]/30 rounded-2xl p-4 text-xs space-y-2">
                    <h4 className="font-cinzel text-sm font-bold text-[#FFC34F] mb-2">Resumo da Ficha</h4>
                    <p><strong className="text-[#FFF0B2]">Bruxo:</strong> {formData.first_name} {formData.last_name}</p>
                    <p><strong className="text-[#FFF0B2]">Nascimento:</strong> {formData.birth_date} em {formData.birth_place}</p>
                    <p><strong className="text-[#FFF0B2]">Casa:</strong> {HOUSES[formData.preferred_house].name}</p>
                    <p><strong className="text-[#FFF0B2]">Varinha:</strong> {formData.wand_wood}, {formData.wand_core}, {formData.wand_length} ({formData.wand_flexibility})</p>
                    <p><strong className="text-[#FFF0B2]">Contagem da História:</strong> {wordCount.toLocaleString()} palavras ({wordCount >= MIN_WORDS_BACKSTORY ? '✅ Aprovada' : '❌ Insuficiente'})</p>
                    <p><strong className="text-[#FFF0B2]">Discord Vinculado:</strong> {user.username} ({user.id})</p>
                  </div>

                  <label className="flex items-start space-x-3 cursor-pointer p-3 rounded-xl bg-[#210604]/50 border border-[#B83A0C]/20 text-xs text-[#FFF0B2]/80">
                    <input
                      type="checkbox"
                      checked={formData.rules_accepted}
                      onChange={(e) => setFormData({ ...formData, rules_accepted: e.target.checked })}
                      className="mt-0.5 rounded text-[#FFC34F] focus:ring-0"
                    />
                    <span>
                      Declaro que li e compreendo as diretrizes de Roleplay sério do servidor VICCS Accio. Estou ciente de que atitudes anti-RP ou metagaming resultarão em perda da vaga.
                    </span>
                  </label>
                </div>
              )}
            </>
          )}

        </div>

        {/* Footer Navigation */}
        {user && (
          <div className="px-6 py-4 border-t border-[#B83A0C]/20 bg-[#210604]/80 flex justify-between items-center">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((prev) => (prev - 1) as any)}
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
                  <span>Salvando no Supabase...</span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Emitir Carta de Admissão</span>
                  </>
                )}
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
