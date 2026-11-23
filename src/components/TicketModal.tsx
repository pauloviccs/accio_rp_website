import React, { useEffect, useState } from 'react';
import { X, MessageSquare, Check, FileDown } from 'lucide-react';
import confetti from 'canvas-confetti';
import { CharacterApplication } from '../types';
import { HOUSES } from '../lib/constants';
import { generateAndDownloadCharacterPdf } from '../lib/pdfGenerator';
import { soundManager } from '../lib/audio';

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: CharacterApplication | null;
}

export const TicketModal: React.FC<TicketModalProps> = ({
  isOpen,
  onClose,
  application,
}) => {
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [pdfProgress, setPdfProgress] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Efeito de confetes dourados celebrando a admissão
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFF0B2', '#FFC34F', '#F47A16', '#B83A0C'],
      });
    }
  }, [isOpen]);

  if (!isOpen || !application) return null;

  const house = HOUSES[application.preferred_house] || HOUSES.gryffindor;
  const ticketCode = application.registration_number
    ? `#ACCIO-${String(application.registration_number).padStart(4, '0')}`
    : '#ACCIO-PIONEER';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      
      <div className="w-full max-w-lg bg-[#160504] border-2 border-[#FFC34F]/40 rounded-3xl shadow-2xl overflow-hidden animate-apple-modal relative">
        
        {/* Glow Superior */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-[#FFC34F]/20 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-[#5B1009]/60 hover:bg-[#5B1009] text-[#FFF0B2] flex items-center justify-center transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Bilhete do Expresso de Hogwarts */}
        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Header do Bilhete */}
          <div className="text-center space-y-2 border-b border-[#B83A0C]/30 pb-5">
            <span className="text-[10px] uppercase font-bold tracking-[0.3em] text-[#FFC34F]">
              Expresso de Hogwarts · 1º Lote de Admissão
            </span>
            <h2 className="font-cinzel text-2xl sm:text-3xl font-extrabold text-[#FFF0B2]">
              Passe de Embarque Oficial
            </h2>
            <div className="inline-block px-3 py-1 rounded-full bg-[#FFC34F]/15 border border-[#FFC34F]/40 font-mono text-xs font-bold text-[#FFC34F]">
              {ticketCode}
            </div>
          </div>

          {/* Dados do Personagem */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="bg-[#210604] p-3 rounded-xl border border-[#B83A0C]/20">
              <span className="text-[10px] text-[#FFF0B2]/60 uppercase tracking-wider block">Bruxo(a)</span>
              <span className="font-cinzel text-sm font-bold text-[#FFF0B2] block truncate">
                {application.first_name} {application.last_name}
              </span>
            </div>

            <div className="bg-[#210604] p-3 rounded-xl border border-[#B83A0C]/20">
              <span className="text-[10px] text-[#FFF0B2]/60 uppercase tracking-wider block">Casa Selecionada</span>
              <span className="font-cinzel text-sm font-bold block" style={{ color: house.secondaryColor }}>
                {house.name}
              </span>
            </div>

            <div className="bg-[#210604] p-3 rounded-xl border border-[#B83A0C]/20">
              <span className="text-[10px] text-[#FFF0B2]/60 uppercase tracking-wider block">Varinha</span>
              <span className="text-xs font-semibold text-[#FFF0B2] block truncate">
                {application.wand_wood} ({application.wand_core})
              </span>
            </div>

            <div className="bg-[#210604] p-3 rounded-xl border border-[#B83A0C]/20">
              <span className="text-[10px] text-[#FFF0B2]/60 uppercase tracking-wider block">Status da Admissão</span>
              <span className="text-xs font-bold text-[#4CAF7C] flex items-center space-x-1">
                <Check className="w-3.5 h-3.5" />
                <span>Inscrito no Livro da Admissão</span>
              </span>
            </div>
          </div>

          {/* Código de Barras / Emblema Mágico */}
          <div className="p-4 rounded-2xl bg-[#100303] border border-[#B83A0C]/30 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-[#FFF0B2]/50 block">Discord Vinculado</span>
              <span className="text-xs font-mono font-bold text-[#FFC34F]">
                {application.discord_username}
              </span>
            </div>
            <div className="h-8 flex items-center space-x-1 opacity-70">
              <div className="w-1 h-6 bg-[#FFC34F]" />
              <div className="w-0.5 h-6 bg-[#FFC34F]" />
              <div className="w-1.5 h-6 bg-[#FFC34F]" />
              <div className="w-0.5 h-6 bg-[#FFC34F]" />
              <div className="w-1 h-6 bg-[#FFC34F]" />
              <div className="w-2 h-6 bg-[#FFC34F]" />
            </div>
          </div>

          {/* Call to Actions */}
          <div className="space-y-3 pt-2">
            <button
              onClick={async () => {
                setIsDownloadingPdf(true);
                soundManager.playSparkle();
                await generateAndDownloadCharacterPdf(application, (msg) => setPdfProgress(msg));
                setIsDownloadingPdf(false);
                setPdfProgress(null);
              }}
              disabled={isDownloadingPdf}
              className="w-full py-3 rounded-xl btn-accio-gold text-xs sm:text-sm font-bold flex items-center justify-center space-x-2 transition shadow-lg shadow-[#FFC34F]/20 cursor-pointer disabled:opacity-50"
            >
              <FileDown className="w-4 h-4 text-[#160504]" />
              <span>{isDownloadingPdf ? (pdfProgress || 'Gerando Pergaminho...') : 'Baixar Ficha Oficial de Hogwarts (PDF)'}</span>
            </button>

            <a
              href="https://discord.gg"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white text-xs sm:text-sm font-bold flex items-center justify-center space-x-2 transition shadow-lg shadow-[#5865F2]/25"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Entrar no Discord & Reivindicar Cargo de Fundador</span>
            </a>

            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-[#210604] hover:bg-[#5B1009] text-xs font-semibold text-[#FFF0B2]/80 hover:text-[#FFF0B2] transition border border-[#B83A0C]/30"
            >
              Concluir
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
