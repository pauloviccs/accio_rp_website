import React, { useState, useEffect } from 'react';
import { DiscordUser, HouseId } from '../types';
import {
  LogIn,
  LogOut,
  Sparkles,
  Mail,
  ShieldCheck,
  Shield,
  Volume2,
  VolumeX,
  ChevronDown,
  Flame,
  Crown,
  Feather,
  Plus,
  ArrowUpRight,
  MessagesSquare,
} from 'lucide-react';
import { soundManager } from '../lib/audio';
import { DISCORD_INVITE_URL } from '../lib/constants';
import { AccioEmblem } from './ArcaneOrnaments';

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

const HOUSE_THEME_INFO: Record<HouseId, { name: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  gryffindor: { name: 'Grifinória', icon: Flame, color: '#b5675e' },
  slytherin: { name: 'Sonserina', icon: Crown, color: '#6e9e81' },
  ravenclaw: { name: 'Corvinal', icon: Feather, color: '#7e98bd' },
  hufflepuff: { name: 'Lufa-Lufa', icon: Shield, color: '#c7ac63' },
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
  const CurrentHouseIcon = currentTheme.icon;

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav aria-label="Navegação principal" className="site-nav">
      <div className="relative flex h-16 sm:h-18 items-center justify-between gap-3 px-4 sm:px-5 xl:h-20 xl:px-7">

        {/* Logo & Brand (IDV ACCIO + Tipografia ArcaneMP) */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex shrink-0 items-center gap-3 text-white"
          aria-label="Início ACCIO Roleplay"
        >
          <AccioEmblem className="size-9 shrink-0 drop-shadow-[0_0_12px_rgba(244,122,22,0.45)]" />
          <span className="nav-brand-name">
            ACCIO RP
            <small className="max-xl:hidden">A magia é melhor junta</small>
          </span>
        </a>

        {/* Links Centrais Estilo Capítulo ArcaneMP */}
        <div className="hidden lg:flex items-center">
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="nav-chapter is-active"
          >
            Início
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('castle-exploration')}
            className="nav-chapter"
          >
            Estandartes
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('features')}
            className="nav-chapter"
          >
            Sistemas
          </button>
          <button
            type="button"
            onClick={onOpenLetter}
            className="nav-chapter"
          >
            Carta
          </button>
          <button
            type="button"
            onClick={hasApplication ? onOpenValidation : onOpenForm}
            className="nav-chapter"
          >
            {hasApplication ? 'Validação' : 'Pré-Registro'}
          </button>
          {canAccessAdmin && (
            <button
              type="button"
              onClick={onOpenAdmin}
              className="nav-chapter text-[var(--house-accent)]"
            >
              Painel ADM
            </button>
          )}
        </div>

        {/* Ações à Direita */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">

          {/* Seletor de Casa Dinâmico */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsHouseDropdownOpen(!isHouseDropdownOpen)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-[#0d1422] border border-[var(--house-border)] text-xs text-[#ece7da] hover:border-[var(--house-accent)] transition cursor-pointer"
              title="Trocar o tema da Casa de Hogwarts"
            >
              <CurrentHouseIcon className="w-3.5 h-3.5 text-[var(--house-accent)]" />
              <span className="font-display text-[11px] uppercase tracking-wider hidden xl:inline text-[var(--house-accent)]">
                {currentTheme.name}
              </span>
              <ChevronDown className="w-3 h-3 text-[var(--house-accent)] opacity-75" />
            </button>

            {isHouseDropdownOpen && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-[#0a0f19] border border-[var(--house-border)] p-1.5 shadow-2xl z-50 animate-apple-modal">
                <span className="eyebrow text-[9px] px-2.5 py-1 block border-b border-white/10 mb-1">
                  Tema da Casa
                </span>
                {(Object.keys(HOUSE_THEME_INFO) as HouseId[]).map((hId) => {
                  const h = HOUSE_THEME_INFO[hId];
                  const HouseIcon = h.icon;
                  const isCur = activeHouseTheme === hId;
                  return (
                    <button
                      key={hId}
                      type="button"
                      onClick={() => handleHouseChange(hId)}
                      className={`w-full text-left px-2.5 py-1.5 text-xs font-display tracking-wide flex items-center gap-2 transition cursor-pointer ${
                        isCur
                          ? 'bg-[var(--house-secondary)] text-[var(--house-accent)] border border-[var(--house-border)]'
                          : 'text-[#b6bbc5] hover:bg-white/5 hover:text-[#ece7da]'
                      }`}
                    >
                      <HouseIcon className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{h.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Controle Global de Áudio */}
          <button
            type="button"
            onClick={handleToggleSound}
            className={`flex items-center gap-1 px-2.5 py-1.5 border text-xs transition cursor-pointer ${
              isMuted
                ? 'bg-[#0d1422] border-[#b5675e]/50 text-[#b5675e] hover:bg-[#b5675e]/15'
                : 'bg-[#0d1422] border-[#6e9e81]/50 text-[#7fd29a] hover:bg-[#6e9e81]/15'
            }`}
            title={isMuted ? 'Sons Mágicos Mutados (Clique para Ativar)' : 'Sons Mágicos Ativados (Clique para Mutar)'}
            aria-label={isMuted ? 'Desmutar áudio' : 'Mutar áudio'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            <span className="text-[10px] font-semibold uppercase tracking-wider hidden 2xl:inline">
              {isMuted ? 'Mudo' : 'Som'}
            </span>
          </button>

          {user ? (
            <div className="flex items-center gap-2">
              {hasApplication ? (
                <>
                  <button
                    type="button"
                    onClick={onOpenValidation}
                    className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0d1422] border border-[var(--house-border)] text-[#ece7da] hover:border-[var(--house-accent)] text-xs font-semibold transition cursor-pointer"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-[var(--house-accent)]" />
                    <span className="hidden md:inline">Validação</span>
                  </button>
                  <button
                    type="button"
                    onClick={onViewTicket}
                    className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0d1422] border border-[var(--house-border)] text-[#ece7da] hover:border-[var(--house-accent)] text-xs font-semibold transition cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[var(--house-accent)]" />
                    <span>Bilhete</span>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={onOpenForm}
                  className="hidden sm:inline-flex btn-primary btn-sm"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Ficha</span>
                </button>
              )}

              <div className="flex items-center gap-2 bg-[#0d1422] border border-[var(--house-border)] px-2 py-1">
                {user.avatar ? (
                  <img
                    src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`}
                    alt={user.username}
                    className="w-6 h-6 rounded-full border border-[var(--house-accent)] select-none pointer-events-none"
                    draggable={false}
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-[var(--house-secondary)] flex items-center justify-center text-[11px] font-bold text-[#ece7da]">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="hidden md:block text-left">
                  <span className="text-[11px] font-semibold text-[#ece7da] block leading-tight truncate max-w-[95px]">
                    {user.global_name || user.username}
                  </span>
                  <span className="text-[9px] text-[var(--house-accent)] font-mono block leading-none">
                    {userRole ? userRole.toUpperCase() : 'BRUXO'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={onLogout}
                className="p-2 bg-[#0d1422] hover:bg-[#172033] text-[#b6bbc5] hover:text-white transition cursor-pointer border border-[var(--house-border)]"
                title="Desconectar"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <a
                href={DISCORD_INVITE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex btn-secondary btn-sm shrink-0"
              >
                <MessagesSquare className="w-4 h-4" />
                <span className="max-md:hidden">Discord</span>
              </a>
              <button
                type="button"
                onClick={onLogin}
                className="btn-primary btn-sm shrink-0"
              >
                <LogIn className="w-4 h-4" />
                <span className="max-sm:hidden">Entrar</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Menu Mobile Estilo ArcaneMP */}
      <details className="mobile-menu relative lg:hidden">
        <summary>
          <span>Explorar o Portal</span>
          <span className="menu-toggle grid size-6 place-items-center transition-[rotate]">
            <Plus className="w-4 h-4" />
          </span>
        </summary>
        <div className="mobile-links">
          <button type="button" onClick={() => scrollToSection('castle-exploration')}>
            <span>Estandartes 3D</span>
            <ArrowUpRight className="w-4 h-4 text-[var(--house-accent)]" />
          </button>
          <button type="button" onClick={() => scrollToSection('features')}>
            <span>Sistemas</span>
            <ArrowUpRight className="w-4 h-4 text-[var(--house-accent)]" />
          </button>
          <button type="button" onClick={onOpenLetter}>
            <span>Carta de Hogwarts</span>
            <Mail className="w-4 h-4 text-[var(--house-accent)]" />
          </button>
          <button type="button" onClick={hasApplication ? onOpenValidation : onOpenForm}>
            <span>{hasApplication ? 'Minha Validação' : 'Pré-Registro'}</span>
            <ArrowUpRight className="w-4 h-4 text-[var(--house-accent)]" />
          </button>
          {canAccessAdmin && (
            <button type="button" onClick={onOpenAdmin}>
              <span>Painel ADM</span>
              <Shield className="w-4 h-4 text-[var(--house-accent)]" />
            </button>
          )}
          <a href={DISCORD_INVITE_URL} target="_blank" rel="noopener noreferrer">
            <span>Discord Oficial</span>
            <ArrowUpRight className="w-4 h-4 text-[var(--house-accent)]" />
          </a>
        </div>
      </details>
    </nav>
  );
};
