import React from 'react';
import { DiscordUser } from '../types';
import { LogIn, LogOut, Sparkles, Mail } from 'lucide-react';

interface NavbarProps {
  user: DiscordUser | null;
  onLogin: () => void;
  onLogout: () => void;
  onOpenForm: () => void;
  hasApplication: boolean;
  onViewTicket: () => void;
  onOpenLetter: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onLogin,
  onLogout,
  onOpenForm,
  hasApplication,
  onViewTicket,
  onOpenLetter,
}) => {
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
        <div className="flex items-center space-x-2 sm:space-x-4">
          
          {/* Botão para Rever a Carta de Admissão */}
          <button
            onClick={onOpenLetter}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-[#5B1009]/40 border border-[#B83A0C]/40 text-xs text-[#FFF0B2] hover:bg-[#5B1009]/80 transition cursor-pointer"
            title="Abrir Carta Oficial de Hogwarts"
          >
            <Mail className="w-3.5 h-3.5 text-[#FFC34F]" />
            <span className="hidden sm:inline">Carta de Hogwarts</span>
          </button>

          {user ? (
            <div className="flex items-center space-x-2 sm:space-x-3">
              {hasApplication ? (
                <button
                  onClick={onViewTicket}
                  className="hidden sm:flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-[#FFC34F]/15 border border-[#FFC34F]/40 text-[#FFF0B2] hover:bg-[#FFC34F]/25 text-xs font-semibold transition"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#FFC34F]" />
                  <span>Meu Bilhete</span>
                </button>
              ) : (
                <button
                  onClick={onOpenForm}
                  className="hidden sm:flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg btn-accio-gold text-xs font-bold transition"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Preencher Ficha</span>
                </button>
              )}

              {/* User profile dropdown / info */}
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
                <span className="text-xs font-medium text-[#FFF0B2] hidden sm:inline max-w-[100px] truncate">
                  {user.global_name || user.username}
                </span>
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
