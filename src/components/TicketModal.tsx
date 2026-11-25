import React, { useEffect, useState } from 'react';
import { X, MessageSquare, Check, FileDown } from 'lucide-react';
import confetti from 'canvas-confetti';
import { CharacterApplication } from '../types';
import { HOUSES, DISCORD_INVITE_URL } from '../lib/constants';
import { generateAndDownloadCharacterPdf } from '../lib/pdfGenerator';
import { soundManager } from '../lib/audio';
import { ArcaneFrame } from './ArcaneOrnaments';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#05080f]/85 backdrop-blur-md">
      
      <ArcaneFrame className="w-full max-w-lg bg-[#0a0f19] shadow-2xl overflow-hidden animate-apple-modal relative">
        
        {/* Glow Superior */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-[var(--house-glow)] rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 bg-[#0d1422] border border-[var(--house-border)] hover:border-[var(--house-accent)] text-[#ece7da] flex items-center justify-center transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Bilhete do Expresso de Hogwarts */}
        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Header do Bilhete */}
          <div className="text-center space-y-2 border-b border-[var(--hair-soft)] pb-5">
            <span className="eyebrow text-[10px]">
              Expresso de Hogwarts · 1º Lote de Admissão
            </span>
            <h2 className="font-display text-2xl sm:text-3xl text-[#ece7da]">
              Passe de Embarque Oficial
            </h2>
            <div className="inline-block px-3 py-1 bg-[#0d1422] border border-[var(--house-border)] font-mono text-xs font-bold text-[var(--house-accent)]">
              {ticketCode}
            </div>
          </div>

          {/* Dados do Personagem */}
          <div className="grid grid-cols-2 gap-3.5 text-xs">
            <div className="bg-[#0d1422] p-3 border border-[var(--hair-soft)]">
              <span className="text-[10px] text-[#8b93a1] uppercase tracking-wider block">Bruxo(a)</span>
              <span className="font-display text-sm text-[#ece7da] block truncate">
                {application.first_name} {application.last_name}
              </span>
            </div>

            <div className="bg-[#0d1422] p-3 border border-[var(--hair-soft)]">
              <span className="text-[10px] text-[#8b93a1] uppercase tracking-wider block">Casa Selecionada</span>
              <span className="font-display text-sm flex items-center gap-1.5 mt-0.5" style={{ color: house.secondaryColor }}>
                <img
                  src={house.emblemImg}
                  alt={house.name}
                  draggable={false}
                  className="w-5 h-5 object-contain select-none pointer-events-none"
                />
                <span>{house.name}</span>
              </span>
            </div>

            <div className="bg-[#0d1422] p-3 border border-[var(--hair-soft)]">
              <span className="text-[10px] text-[#8b93a1] uppercase tracking-wider block">Varinha</span>
              <span className="text-xs font-semibold text-[#ece7da] block truncate">
                {application.wand_wood} ({application.wand_core})
              </span>
            </div>

            <div className="bg-[#0d1422] p-3 border border-[var(--hair-soft)]">
              <span className="text-[10px] text-[#8b93a1] uppercase tracking-wider block">Status da Admissão</span>
              <span className="text-xs font-bold text-[#7fd29a] flex items-center space-x-1">
                <Check className="w-3.5 h-3.5" />
                <span>Inscrito no Livro</span>
              </span>
            </div>
          </div>

          {/* Código de Barras / Emblema Mágico */}
          <div className="p-4 bg-[#090e17] border border-[var(--house-border)] flex items-center justify-between">
            <div>
              <span className="text-[10px] text-[#8b93a1] block">Discord Vinculado</span>
              <span className="text-xs font-mono font-bold text-[var(--house-accent)]">
                {application.discord_username}
              </span>
            </div>
            <div className="h-8 flex items-center space-x-1 opacity-70">
              <div className="w-1 h-6 bg-[var(--house-accent)]" />
              <div className="w-0.5 h-6 bg-[var(--house-accent)]" />
              <div className="w-1.5 h-6 bg-[var(--house-accent)]" />
              <div className="w-0.5 h-6 bg-[var(--house-accent)]" />
              <div className="w-1 h-6 bg-[var(--house-accent)]" />
              <div className="w-2 h-6 bg-[var(--house-accent)]" />
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
              className="w-full btn-primary"
            >
              <FileDown />
              <span>{isDownloadingPdf ? (pdfProgress || 'Gerando Pergaminho...') : 'Baixar Ficha Oficial (PDF)'}</span>
            </button>

            <a
              href={DISCORD_INVITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full btn-secondary"
            >
              <MessageSquare />
              <span>Discord Oficial &amp; Cargo de Pioneiro</span>
            </a>

            <button
              onClick={onClose}
              className="w-full py-2.5 bg-[#0d1422] hover:bg-[#172033] text-xs font-semibold text-[#b6bbc5] hover:text-[#ece7da] transition border border-[var(--hair-soft)] cursor-pointer"
            >
              Concluir
            </button>
          </div>

        </div>

      </ArcaneFrame>

    </div>
  );
};
