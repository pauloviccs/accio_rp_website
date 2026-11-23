import React, { useState } from 'react';
import { X, Sparkles, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { DiscordUser } from '../types';
import { soundManager } from '../lib/audio';

interface HogwartsLetterModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: DiscordUser | null;
  onLogin: () => void;
  onProceedToForm: () => void;
  onExploreCastle?: () => void;
}

export const HogwartsLetterModal: React.FC<HogwartsLetterModalProps> = ({
  isOpen,
  onClose,
  user,
  onProceedToForm,
  onExploreCastle,
}) => {
  const [isBroken, setIsBroken] = useState(false);

  if (!isOpen) return null;

  const handleBreakSeal = () => {
    if (isBroken) return;
    setIsBroken(true);
    soundManager.playWaxBreak();

    // Efeito de estilhaços mágicos de cera e faíscas douradas
    confetti({
      particleCount: 65,
      spread: 60,
      origin: { y: 0.55 },
      colors: ['#FFF0B2', '#FFC34F', '#F47A16', '#5B1009'],
    });
  };

  const handleAcceptLetter = () => {
    soundManager.playClick();
    onClose();
    onProceedToForm();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-xl transition-all duration-500 overflow-y-auto">
      
      {/* Luz ambiente de velas e feitiço */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] sm:w-[600px] h-[320px] sm:h-[600px] bg-gradient-to-r from-[#B83A0C]/20 via-[#FFC34F]/15 to-[#5B1009]/25 rounded-full blur-[120px] pointer-events-none" />

      {/* Botão de Pular / Fechar no topo */}
      <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-50 flex items-center space-x-2">
        <button
          onClick={onClose}
          className="px-3.5 py-1.5 rounded-full bg-[#210604]/80 hover:bg-[#5B1009] border border-[#B83A0C]/40 text-[#FFF0B2]/70 hover:text-[#FFF0B2] text-xs font-semibold transition flex items-center space-x-1"
        >
          <span>Pular para o Portal</span>
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* CONTAINER DO ENVELOPE / CARTA 3D */}
      <div className="relative w-full max-w-lg my-auto py-8 transition-all duration-700">
        
        {/* ENVELOPE */}
        <div
          className={`relative w-full bg-[#EADBCE] border-2 border-[#8C6D58] rounded-2xl shadow-2xl transition-all duration-700 overflow-hidden ${
            isBroken ? 'shadow-[0_20px_60px_rgba(244,122,22,0.35)]' : 'shadow-2xl'
          }`}
          style={{
            backgroundImage: 'radial-gradient(ellipse at 50% 50%, rgba(255,255,255,0.4) 0%, rgba(200,175,150,0.3) 100%)',
          }}
        >
          
          {/* Aba Superior do Envelope (Dobra em 3D) */}
          <div
            className={`w-full h-24 sm:h-32 bg-[#DFCBB8] border-b-2 border-[#8C6D58] origin-top transition-transform duration-700 ease-in-out relative flex items-end justify-center pb-2 ${
              isBroken ? '-rotate-x-180 opacity-20 pointer-events-none' : 'rotate-x-0'
            }`}
            style={{
              clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
              boxShadow: 'inset 0 4px 12px rgba(0,0,0,0.1)',
            }}
          />

          {/* ESTADO 1: ENVELOPE FECHADO (Antes de quebrar o lacre) */}
          {!isBroken && (
            <div className="px-6 py-8 text-center space-y-6">
              
              {/* Carimbo Postal Coruja */}
              <div className="flex justify-between items-start text-[10px] sm:text-xs text-[#6B4E3D] font-mono tracking-widest uppercase border-b border-[#8C6D58]/30 pb-3">
                <span>CORUJA EXPRESSA · ANO 2000</span>
                <span>AGÊNCIA CORREIOS DE HOGSMEADE</span>
              </div>

              {/* Endereço em Caligrafia de Tinta */}
              <div className="py-4 space-y-1.5 font-crimson text-[#2E1A11] text-base sm:text-lg italic leading-snug">
                <p className="font-bold text-lg sm:text-xl not-italic font-cinzel text-[#160504]">
                  {user ? `Ao(À) Sr(a). ${user.global_name || user.username}` : 'Ao(À) Destinatário(a) Convocado(a)'}
                </p>
                <p>O Quarto Superior da Residência</p>
                <p>Rua dos Alfeneiros, Nº 4, Little Whinging</p>
                <p className="font-semibold text-xs tracking-wider not-italic uppercase text-[#8C2E16] pt-1">
                  Surrey · Grã-Bretanha
                </p>
              </div>

              {/* SELO DE CERA 3D (Botão interativo) */}
              <div className="pt-2 flex flex-col items-center">
                <button
                  type="button"
                  onClick={handleBreakSeal}
                  className="group relative cursor-pointer active:scale-95 transition-all duration-300"
                  title="Clique para romper o lacre"
                >
                  {/* Aura mágica pulsante */}
                  <div className="absolute -inset-2 bg-gradient-to-r from-[#FFC34F] to-[#F47A16] rounded-full blur-md opacity-75 group-hover:opacity-100 animate-pulse transition" />
                  
                  {/* Selo Físico */}
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-[#7A1D13] via-[#5B1009] to-[#2B0804] border-2 border-[#FFC34F]/60 shadow-[0_6px_20px_rgba(91,16,9,0.8)] flex items-center justify-center">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border border-[#FFF0B2]/30 flex items-center justify-center">
                      <span className="font-cinzel text-2xl sm:text-3xl font-black text-gold-gradient drop-shadow">
                        A
                      </span>
                    </div>
                  </div>
                </button>

                <span className="text-xs font-semibold text-[#8C2E16] mt-3 animate-bounce">
                  ✨ Toque no Selo de Cera para Abrir
                </span>
              </div>

            </div>
          )}

          {/* ESTADO 2: CARTA ABERTA (Deslizada para fora com a convocação oficial) */}
          {isBroken && (
            <div className="p-6 sm:p-8 space-y-5 animate-apple-modal bg-[#FDF9F3]">
              
              {/* Cabeçalho da Carta */}
              <div className="text-center space-y-1.5 border-b-2 border-[#8C6D58]/30 pb-4">
                <div className="w-11 h-11 rounded-full bg-[#160504] border border-[#FFC34F]/50 mx-auto flex items-center justify-center shadow-lg">
                  <span className="font-cinzel text-xl font-bold text-gold-gradient">A</span>
                </div>
                <h3 className="font-cinzel text-base sm:text-lg font-black tracking-wider text-[#160504] uppercase">
                  Escola de Magia e Bruxaria de Hogwarts
                </h3>
                <p className="text-[10px] text-[#6B4E3D] font-mono tracking-widest uppercase">
                  Gabinete da Diretoria · Ano Letivo 2000-2001
                </p>
                <p className="text-[9px] text-[#8C2E16] italic font-crimson">
                  Diretora: Minerva McGonagall · Ordem de Merlim, Primeira Classe
                </p>
              </div>

              {/* Corpo da Carta */}
              <div className="font-crimson text-sm sm:text-base text-[#2E1A11] space-y-3 leading-relaxed text-left">
                <p className="font-bold text-[#160504]">
                  Prezado(a) Bruxo(a),
                </p>
                <p>
                  Temos o imenso prazer de informar que V. Sa. possui uma vaga reservada na seleta convocação de pioneiros para o despertar de uma nova era nos salões do Castelo de Hogwarts.
                </p>
                <p>
                  Após a restauração da harmonia em nosso mundo no despontar deste novo milênio, as nobres torres escocesas voltam a acolher os herdeiros do dom arcano. Antes de cruzar os portões de ferro forjado e ocupar seu assento no Expresso de Hogwarts, faz-se imperativo lavrar em nossos registros a crônica detalhada de sua linhagem, aspirações de Casa e as virtudes de sua varinha mágica.
                </p>
                <p>
                  Aguardamos sua resposta oficial por coruja com brevidade. O Expresso de Hogwarts partirá rigorosamente às onze horas da manhã da Plataforma 9¾ na Estação de King's Cross.
                </p>
                
                <div className="pt-2 border-t border-[#8C6D58]/20 flex justify-between items-end text-xs text-[#6B4E3D]">
                  <span className="italic">"Draco Dormiens Nunquam Titillandus"</span>
                  <div className="text-right font-serif not-italic">
                    <span className="block font-bold text-[#160504]">Minerva McGonagall</span>
                    <span className="text-[10px]">Diretora de Hogwarts</span>
                  </div>
                </div>
              </div>

              {/* Ação Primária da Carta */}
              <div className="pt-3 space-y-2.5">
                <button
                  type="button"
                  onClick={handleAcceptLetter}
                  className="w-full py-3.5 px-6 rounded-xl btn-accio-gold text-xs sm:text-sm font-bold flex items-center justify-center space-x-2 shadow-xl shadow-[#F47A16]/30 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-[#160504]" />
                  <span>Aceitar Convocação & Redigir Ficha Oficial</span>
                  <ArrowRight className="w-4 h-4 text-[#160504]" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    soundManager.playHover();
                    if (onExploreCastle) {
                      onExploreCastle();
                    } else {
                      onClose();
                    }
                  }}
                  className="w-full py-2 text-xs text-[#6B4E3D] hover:text-[#160504] font-semibold transition cursor-pointer"
                >
                  Explorar os terrenos de Hogwarts primeiro
                </button>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
};
