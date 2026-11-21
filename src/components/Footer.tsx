import React from 'react';
import { ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-[#B83A0C]/20 bg-[#100303] py-12 px-4 sm:px-6 lg:px-8 text-center text-xs text-[#FFF0B2]/60">
      <div className="max-w-7xl mx-auto flex flex-col items-center space-y-6">
        
        {/* Monograma */}
        <div className="w-9 h-9 rounded-lg bg-[#5B1009] border border-[#FFC34F]/30 flex items-center justify-center">
          <span className="font-cinzel text-lg font-bold text-gold-gradient">A</span>
        </div>

        <div className="flex flex-wrap justify-center gap-6 text-[#FFF0B2]/80 font-medium">
          <a
            href="https://discord.gg"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#FFC34F] transition flex items-center space-x-1"
          >
            <span>Discord Oficial</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <a
            href="https://docs.arcane.mp"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#FFC34F] transition flex items-center space-x-1"
          >
            <span>Documentação Arcane MP</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <a
            href="https://github.com/pauloviccs/VICCS_ACCIO"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#FFC34F] transition flex items-center space-x-1"
          >
            <span>Repositório GitHub</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <p className="max-w-md text-[11px] leading-relaxed text-[#FFF0B2]/50">
          ACCIO Roleplay é uma modificação multiplayer comunitária sem fins lucrativos desenvolvida com o framework Arcane MP.
          Hogwarts Legacy e o Wizarding World são marcas registradas da Warner Bros. Entertainment Inc. e Avalanche Software.
        </p>

        <p className="flex items-center space-x-1 text-[11px] text-[#FFF0B2]/40">
          <span>Desenvolvido com maestria mágica por</span>
          <span className="text-[#FFC34F] font-semibold">VICCS Studios</span>
        </p>
      </div>
    </footer>
  );
};
