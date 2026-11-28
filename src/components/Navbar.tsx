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
  Plus,
  ArrowUpRight,
  MessagesSquare,
} from 'lucide-react';
import { soundManager } from '../lib/audio';
import { DISCORD_INVITE_URL, HOUSES } from '../lib/constants';
import { resolveDiscordAvatarUrl } from '../lib/supabase';

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

const HOUSE_THEME_INFO: Record<HouseId, { name: string; emblemImg: string; color: string }> = {
  gryffindor: { name: 'Grifinória', emblemImg: HOUSES.gryffindor.emblemImg, color: '#b5675e' },
  slytherin: { name: 'Sonserina', emblemImg: HOUSES.slytherin.emblemImg, color: '#6e9e81' },
  ravenclaw: { name: 'Corvinal', emblemImg: HOUSES.ravenclaw.emblemImg, color: '#7e98bd' },
  hufflepuff: { name: 'Lufa-Lufa', emblemImg: HOUSES.hufflepuff.emblemImg, color: '#c7ac63' },
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
  const [avatarFailed, setAvatarFailed] = useState(false);

  const userAvatarUrl = user ? resolveDiscordAvatarUrl(user.id, user.avatar) : null;

  useEffect(() => {
    setAvatarFailed(false);
  }, [user?.id, user?.avatar]);

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

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav aria-label="Navegação principal" className="site-nav">
      <div className="relative flex h-16 sm:h-18 items-center justify-between gap-1.5 sm:gap-3 px-2.5 sm:px-5 xl:h-20 xl:px-7">

        {/* Brand Tipográfico (Sem Isotipo no Header) */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex shrink-0 items-center text-white"
          aria-label="Início ACCIO Roleplay"
        >
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
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">

          {/* Seletor de Casa Dinâmico */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsHouseDropdownOpen(!isHouseDropdownOpen)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-[#0d1422] border border-[var(--house-border)] text-xs text-[#ece7da] hover:border-[var(--house-accent)] transition cursor-pointer"
              title="Trocar o tema da Casa de Hogwarts"
            >
              <img
                src={currentTheme.emblemImg}
                alt={currentTheme.name}
                draggable={false}
                className="w-4 h-4 object-contain select-none pointer-events-none"
              />
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
                      <img
                        src={h.emblemImg}
                        alt={h.name}
                        draggable={false}
                        className="w-4 h-4 object-contain flex-shrink-0 select-none pointer-events-none"
                      />
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
                  <button
                    type="button"
                    onClick={onOpenForm}
                    className="hidden 2xl:inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0d1422] border border-[var(--house-border)] text-[var(--house-accent)] hover:border-[var(--house-accent)] text-xs font-semibold transition cursor-pointer"
                    title="Criar nova ficha de personagem para sincronizar in-game"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Nova Ficha</span>
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

              <div className="flex items-center gap-1.5 sm:gap-2 bg-[#0d1422] border border-[var(--house-border)] px-1.5 sm:px-2 py-1">
                {userAvatarUrl && !avatarFailed ? (
                  <img
                    src={userAvatarUrl}
                    alt={user.username}
                    onError={() => setAvatarFailed(true)}
                    className="w-6 h-6 rounded-full border border-[var(--house-accent)] object-cover select-none pointer-events-none"
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
                className="p-1.5 sm:p-2 bg-[#0d1422] hover:bg-[#172033] text-[#b6bbc5] hover:text-white transition cursor-pointer border border-[var(--house-border)]"
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
