import React, { useState, useEffect } from 'react';
import { DiscordUser, HouseId } from '../types';
import { LogIn, LogOut, Sparkles, Mail, ShieldCheck, Shield, Volume2, VolumeX, ChevronDown } from 'lucide-react';
import { soundManager } from '../lib/audio';

interface NavbarProps {
  user: DiscordUser | null;
  userRole?: string | null;
  canAccessAdmin?: boolean;
  activeHouseTheme?: HouseId;
  onSelectHouseTheme?: (house: HouseId) => void;
  onLogin: () => void;
  onLogout: () => void;
  onOpenForm: () => void;
  hasApplication: boolean;
  onViewTicket: () => void;
  onOpenLetter: () => void;
  onOpenValidation: () => void;
  onOpenAdmin: () => void;
}

const HOUSE_THEME_INFO: Record<HouseId, { name: string; emoji: string; color: string }> = {
  gryffindor: { name: 'Grifinória', emoji: '🦁', color: '#EEBA30' },
  slytherin: { name: 'Sonserina', emoji: '🐍', color: '#2ECC71' },
  ravenclaw: { name: 'Corvinal', emoji: '🦅', color: '#60A5FA' },
  hufflepuff: { name: 'Lufa-Lufa', emoji: '🦡', color: '#F59E0B' },
};

export const Navbar: React.FC<NavbarProps> = ({
  user,
  userRole,
  canAccessAdmin = false,
  activeHouseTheme = 'gryffindor',
  onSelectHouseTheme,
  onLogin,
  onLogout,
  onOpenForm,
  hasApplication,
  onViewTicket,
  onOpenLetter,
  onOpenValidation,
  onOpenAdmin,
}) => {
  const [isMuted, setIsMuted] = useState(soundManager.isMuted());
  const [isHouseDropdownOpen, setIsHouseDropdownOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = soundManager.subscribe((muted) => {
      setIsMuted(muted);
    });
    return unsubscribe;
  }, []);

  const handleToggleSound = () => {
    soundManager.toggleMute();
  };

  const handleHouseChange = (hId: HouseId) => {
    soundManager.playSparkle();
    if (onSelectHouseTheme) {
      onSelectHouseTheme(hId);
    }
    setIsHouseDropdownOpen(false);
  };

  const currentTheme = HOUSE_THEME_INFO[activeHouseTheme] || HOUSE_THEME_INFO.gryffindor;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--house-border)] bg-[var(--house-bg-deep)]/85 backdrop-blur-xl transition-all duration-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">

        {/* Logo & Brand */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[var(--house-btn-start)] to-[var(--house-primary)] p-0.5 shadow-lg shadow-[var(--house-glow)]">
            <div className="w-full h-full rounded-[10px] bg-[#160504] flex items-center justify-center overflow-hidden">
              <span className="font-cinzel text-xl font-black text-gold-gradient">A</span>
            </div>
          </div>
          <div>
            <span className="font-cinzel text-lg sm:text-xl font-extrabold tracking-wider text-[#FFF0B2] block leading-none">
              ACCIO
            </span>
            <span className="text-[10px] tracking-[0.25em] text-[var(--house-accent)] font-semibold block mt-0.5">
              ROLEPLAY
            </span>
          </div>
        </div>

        {/* Status Pill & User Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3">

          {/* Seletor de Casa Dinâmico no Topo */}
          <div className="relative">
            <button
              onClick={() => setIsHouseDropdownOpen(!isHouseDropdownOpen)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-[#180504] border border-[var(--house-border)] text-xs text-[#FFF0B2] hover:border-[var(--house-accent)] transition cursor-pointer shadow-sm"
              title="Trocar o tema da Casa de Hogwarts"
            >
              <span className="text-sm">{currentTheme.emoji}</span>
              <span className="font-cinzel font-bold text-[11px] hidden md:inline text-gold-gradient">
                {currentTheme.name}
              </span>
              <ChevronDown className="w-3 h-3 text-[var(--house-accent)] opacity-70" />
            </button>

            {isHouseDropdownOpen && (
              <div className="absolute top-full right-0 mt-2 w-44 rounded-2xl bg-[#160504] border border-[var(--house-border)] p-1.5 shadow-2xl z-50 animate-apple-modal">
                <span className="text-[9px] uppercase tracking-wider font-bold text-[var(--house-accent)] px-2.5 py-1 block border-b border-white/10 mb-1">
                  Mudar Tema da Casa:
                </span>
                {(Object.keys(HOUSE_THEME_INFO) as HouseId[]).map((hId) => {
                  const h = HOUSE_THEME_INFO[hId];
                  const isCur = activeHouseTheme === hId;
                  return (
                    <button
                      key={hId}
                      onClick={() => handleHouseChange(hId)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-cinzel font-bold flex items-center space-x-2 transition cursor-pointer ${
                        isCur
                          ? 'bg-[var(--house-primary)] text-white shadow-md'
                          : 'text-[#FFF0B2]/70 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <span>{h.emoji}</span>
                      <span>{h.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Botão de Acesso ao Painel ADM (Exclusivo para admin, super_admin e mod) */}
          {canAccessAdmin && (
            <button
              onClick={onOpenAdmin}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-[#160504] border border-[var(--house-border)] text-xs text-[var(--house-accent)] hover:bg-[#5B1009]/60 transition cursor-pointer shadow-md"
              title="Abrir Painel Administrativo do Ministério da Magia"
            >
              <Shield className="w-3.5 h-3.5 text-[var(--house-accent)]" />
              <span className="hidden md:inline">Painel ADM</span>
            </button>
          )}

          {/* Botão para Rever a Carta de Admissão */}
          <button
            onClick={onOpenLetter}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-[#200504] border border-[var(--house-border)] text-xs text-[#FFF0B2] hover:bg-[#5B1009]/80 transition cursor-pointer"
            title="Abrir Carta Oficial de Hogwarts"
          >
            <Mail className="w-3.5 h-3.5 text-[var(--house-accent)]" />
            <span className="hidden sm:inline">Carta de Hogwarts</span>
          </button>

          {/* Botão Universal de Mutar / Desmutar Sons do Site */}
          <button
            onClick={handleToggleSound}
            className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-full border text-xs transition cursor-pointer ${
              isMuted
                ? 'bg-[#210604] border-[#CF4A4A]/50 text-[#CF4A4A] hover:bg-[#CF4A4A]/20'
                : 'bg-[#160504] border-[#4CAF7C]/40 text-[#4CAF7C] hover:border-[#4CAF7C] hover:bg-[#4CAF7C]/10'
            }`}
            title={isMuted ? 'Sons Mágicos Mutados (Clique para Ativar)' : 'Sons Mágicos Ativados (Clique para Mutar)'}
            aria-label={isMuted ? 'Desmutar áudio' : 'Mutar áudio'}
          >
            {isMuted ? (
              <>
                <VolumeX className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold hidden md:inline">Mudo</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 animate-pulse" />
                <span className="text-[10px] font-bold hidden md:inline">Som</span>
              </>
            )}
          </button>

          {user ? (
            <div className="flex items-center space-x-2 sm:space-x-3">
              {hasApplication ? (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={onOpenValidation}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[var(--house-primary)]/40 border border-[var(--house-border)] text-[#FFF0B2] hover:bg-[var(--house-primary)]/70 text-xs font-semibold transition cursor-pointer"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-[var(--house-accent)]" />
                    <span className="hidden sm:inline">Minha Validação</span>
                  </button>

                  <button
                    onClick={onViewTicket}
                    className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#210604] border border-[var(--house-border)] text-[#FFF0B2] hover:bg-[#5B1009] text-xs font-semibold transition cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[var(--house-accent)]" />
                    <span>Bilhete</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={onOpenForm}
                  className="hidden sm:flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg btn-accio-gold text-xs font-bold transition cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Preencher Ficha</span>
                </button>
              )}

              {/* Perfil do Bruxo */}
              <div className="flex items-center space-x-2 bg-[#210604] border border-[var(--house-border)] px-2.5 py-1.5 rounded-xl">
                {user.avatar ? (
                  <img
                    src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`}
                    alt={user.username}
                    className="w-7 h-7 rounded-full border border-[var(--house-accent)] select-none pointer-events-none"
                    draggable={false}
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-[var(--house-primary)] flex items-center justify-center text-xs font-bold text-white">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="hidden md:block text-left">
                  <span className="text-xs font-semibold text-[#FFF0B2] block leading-tight truncate max-w-[100px]">
                    {user.global_name || user.username}
                  </span>
                  <span className="text-[10px] text-[var(--house-accent)] font-mono block leading-none">
                    {userRole ? userRole.toUpperCase() : 'BRUXO'}
                  </span>
                </div>
              </div>

              <button
                onClick={onLogout}
                className="p-2 rounded-xl bg-[#210604] hover:bg-[#5B1009] text-[#FFF0B2]/60 hover:text-white transition cursor-pointer border border-white/5"
                title="Desconectar do Expresso"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onLogin}
              className="btn-accio-gold px-4 py-2 rounded-xl text-xs flex items-center space-x-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Entrar com Discord</span>
            </button>
          )}

        </div>

      </div>
    </header>
  );
};
