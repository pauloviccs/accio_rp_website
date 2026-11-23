import React, { useState, useEffect } from 'react';
import { DiscordUser } from '../types';
import { LogIn, LogOut, Sparkles, Mail, ShieldCheck, Shield, Volume2, VolumeX } from 'lucide-react';
import { soundManager } from '../lib/audio';

interface NavbarProps {
  user: DiscordUser | null;
  userRole?: string | null;
  canAccessAdmin?: boolean;
  onLogin: () => void;
  onLogout: () => void;
  onOpenForm: () => void;
  hasApplication: boolean;
  onViewTicket: () => void;
  onOpenLetter: () => void;
  onOpenValidation: () => void;
  onOpenAdmin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  userRole,
  canAccessAdmin = false,
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

  useEffect(() => {
    const unsubscribe = soundManager.subscribe((muted) => {
      setIsMuted(muted);
    });
    return unsubscribe;
  }, []);

  const handleToggleSound = () => {
    soundManager.toggleMute();
  };
  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#B83A0C]/20 bg-[#160504]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">

        {/* Logo & Brand */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#FFC34F] via-[#F47A16] to-[#5B1009] p-0.5 shadow-lg shadow-[#F47A16]/20">
            <div className="w-full h-full rounded-[10px] bg-[#160504] flex items-center justify-center overflow-hidden">
              <span className="font-cinzel text-xl font-black text-gold-gradient">A</span>
            </div>
          </div>
          <div>
            <span className="font-cinzel text-lg sm:text-xl font-extrabold tracking-wider text-[#FFF0B2] block leading-none">
              ACCIO
            </span>
            <span className="text-[10px] tracking-[0.25em] text-[#FFC34F] font-semibold block mt-0.5">
              ROLEPLAY
            </span>
          </div>
        </div>

        {/* Status Pill & User Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3">

          {/* Botão de Acesso ao Painel ADM (Exclusivo para admin, super_admin e mod) */}
          {canAccessAdmin && (
            <button
              onClick={onOpenAdmin}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-[#160504] border border-[#FFC34F]/50 text-xs text-[#FFC34F] hover:bg-[#5B1009]/60 transition cursor-pointer shadow-md shadow-[#FFC34F]/10"
              title="Abrir Painel Administrativo do Ministério da Magia"
            >
              <Shield className="w-3.5 h-3.5 text-[#FFC34F]" />
              <span className="hidden md:inline">Painel ADM</span>
            </button>
          )}

          {/* Botão para Rever a Carta de Admissão */}
          <button
            onClick={onOpenLetter}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-[#5B1009]/40 border border-[#B83A0C]/40 text-xs text-[#FFF0B2] hover:bg-[#5B1009]/80 transition cursor-pointer"
            title="Abrir Carta Oficial de Hogwarts"
          >
            <Mail className="w-3.5 h-3.5 text-[#FFC34F]" />
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
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#FFC34F]/15 border border-[#FFC34F]/40 text-[#FFF0B2] hover:bg-[#FFC34F]/25 text-xs font-semibold transition cursor-pointer"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-[#FFC34F]" />
                    <span className="hidden sm:inline">Minha Validação</span>
                  </button>

                  <button
                    onClick={onViewTicket}
                    className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#210604] border border-[#B83A0C]/40 text-[#FFF0B2] hover:bg-[#5B1009] text-xs font-semibold transition cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#FFC34F]" />
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

              {/* User profile info */}
              <div className="flex items-center space-x-2 bg-[#210604] border border-[#B83A0C]/30 px-2.5 py-1.5 rounded-xl">
                {user.avatar ? (
                  <img
                    src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`}
                    alt={user.username}
                    className="w-7 h-7 rounded-full border border-[#FFC34F]/40"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-[#5B1009] flex items-center justify-center text-xs font-bold text-[#FFF0B2]">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="hidden sm:flex flex-col">
                  <span className="text-xs font-medium text-[#FFF0B2] max-w-[110px] truncate leading-tight">
                    {user.global_name || user.username}
                  </span>
                  {userRole && (
                    <span className="text-[9px] uppercase tracking-wider text-[#FFC34F] font-bold leading-none">
                      {userRole.replace('_', ' ')}
                    </span>
                  )}
                </div>
                <button
                  onClick={onLogout}
                  title="Desconectar"
                  className="text-[#FFF0B2]/60 hover:text-[#F47A16] p-1 transition cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={onLogin}
              className="flex items-center space-x-2 px-3.5 sm:px-4 py-2 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white text-xs sm:text-sm font-semibold transition shadow-lg shadow-[#5865F2]/20 active:scale-95 cursor-pointer"
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
