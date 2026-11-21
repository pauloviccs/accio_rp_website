import React, { useState, useEffect } from 'react';
import { Sparkles, Users, ArrowRight, CheckCircle2 } from 'lucide-react';
import { TOTAL_PIONEER_SLOTS, TARGET_PHASE_END_DATE } from '../lib/constants';

interface HeroProps {
  onOpenForm: () => void;
  totalRegistered: number;
  hasApplication: boolean;
  onViewTicket: () => void;
  onOpenLetter: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onOpenForm,
  totalRegistered,
  hasApplication,
  onViewTicket,
  onOpenLetter,
}) => {
  // Contagem regressiva calculada contra a data alvo de encerramento da fase
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const target = new Date(TARGET_PHASE_END_DATE).getTime();

    const updateTimer = () => {
      const now = Date.now();
      const difference = Math.max(target - now, 0);

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  const percentage = Math.min(Math.round((totalRegistered / TOTAL_PIONEER_SLOTS) * 100), 100);

  return (
    <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
      
      {/* Glow Superior */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[350px] sm:w-[650px] h-[350px] bg-gradient-to-b from-[#B83A0C]/25 to-transparent rounded-full blur-[100px] pointer-events-none" />

      {/* Badge de Urgência / FOMO */}
      <button
        onClick={onOpenLetter}
        className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#5B1009]/60 hover:bg-[#5B1009] border border-[#FFC34F]/30 text-xs sm:text-sm text-[#FFF0B2] mb-8 shadow-lg shadow-[#5B1009]/50 transition cursor-pointer"
      >
        <Sparkles className="w-4 h-4 text-[#FFC34F]" />
        <span className="font-semibold text-[#FFC34F]">Carta Oficial de Convocação</span>
        <span className="text-[#FFF0B2]/60">·</span>
        <span>Clique para Abrir a Carta</span>
      </button>

      {/* Título Principal */}
      <h1 className="font-cinzel text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.15] max-w-4xl text-[#FFF0B2] mb-6">
        Sua Carta de Hogwarts <br />
        <span className="text-gold-gradient drop-shadow-md">Finalmente Chegou.</span>
      </h1>

      {/* Subtítulo */}
      <p className="font-crimson text-lg sm:text-2xl text-[#FFF0B2]/80 max-w-2xl mb-10 leading-relaxed">
        O primeiro servidor de Roleplay sério em Hogwarts Legacy construído com Arcane MP. 
        Escreva sua história, garanta seu assento no Expresso e viva o verdadeiro mundo bruxo.
      </p>

      {/* Progress Bar de Vagas (FOMO 100% Real do Banco) */}
      <div className="w-full max-w-md bg-[#210604]/90 border border-[#B83A0C]/40 rounded-2xl p-5 mb-10 shadow-2xl backdrop-blur-xl">
        <div className="flex justify-between items-center text-xs sm:text-sm font-semibold mb-3">
          <span className="text-[#FFF0B2] flex items-center space-x-1.5">
            <Users className="w-4 h-4 text-[#FFC34F]" />
            <span>Vagas Registradas no Supabase:</span>
          </span>
          <span className="text-[#FFC34F] font-mono text-base">
            {totalRegistered} / {TOTAL_PIONEER_SLOTS} ({percentage}%)
          </span>
        </div>

        {/* Barra de Progresso */}
        <div className="w-full h-3 bg-[#100303] rounded-full overflow-hidden p-0.5 border border-[#B83A0C]/30">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#B83A0C] via-[#F47A16] to-[#FFC34F] transition-all duration-1000 relative"
            style={{ width: `${Math.max(percentage, totalRegistered > 0 ? 5 : 0)}%` }}
          >
            {totalRegistered > 0 && (
              <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/60 blur-[2px] animate-pulse"></div>
            )}
          </div>
        </div>

        <p className="text-[11px] text-[#FFF0B2]/60 mt-3 text-left">
          ⚠️ As inscrições do 1º Lote encerram quando as 100 vagas forem atingidas ou no término do cronômetro.
        </p>
      </div>

      {/* Countdown Timer Real */}
      <div className="grid grid-cols-4 gap-2 sm:gap-4 max-w-xs sm:max-w-sm mb-10">
        {[
          { label: 'DIAS', value: timeLeft.days },
          { label: 'HORAS', value: timeLeft.hours },
          { label: 'MINUTOS', value: timeLeft.minutes },
          { label: 'SEGUNDOS', value: timeLeft.seconds },
        ].map((item, index) => (
          <div key={index} className="bg-[#160504]/90 border border-[#B83A0C]/30 rounded-xl p-2 sm:p-3 text-center">
            <span className="font-mono text-xl sm:text-2xl font-bold text-gold-gradient block">
              {String(item.value).padStart(2, '0')}
            </span>
            <span className="text-[9px] sm:text-[10px] text-[#FFF0B2]/60 font-semibold tracking-wider">
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {/* CTA Button */}
      {hasApplication ? (
        <button
          onClick={onViewTicket}
          className="btn-accio-gold px-8 sm:px-10 py-4 rounded-2xl text-base sm:text-lg flex items-center space-x-3 cursor-pointer group"
        >
          <Sparkles className="w-5 h-5 text-[#160504]" />
          <span>Visualizar Meu Bilhete de Embarque</span>
          <ArrowRight className="w-5 h-5 text-[#160504] group-hover:translate-x-1 transition" />
        </button>
      ) : (
        <button
          onClick={onOpenForm}
          className="btn-accio-gold px-8 sm:px-10 py-4 rounded-2xl text-base sm:text-lg flex items-center space-x-3 cursor-pointer group"
        >
          <Sparkles className="w-5 h-5 text-[#160504]" />
          <span>Garantir Minha Vaga de Pioneiro</span>
          <ArrowRight className="w-5 h-5 text-[#160504] group-hover:translate-x-1 transition" />
        </button>
      )}

      {/* Garantias / Checklist */}
      <div className="mt-8 flex flex-wrap justify-center gap-4 sm:gap-6 text-xs text-[#FFF0B2]/70">
        <span className="flex items-center space-x-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#4CAF7C]" />
          <span>Autenticação Real via Discord</span>
        </span>
        <span className="flex items-center space-x-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#4CAF7C]" />
          <span>Bilhete Numerado no Supabase</span>
        </span>
        <span className="flex items-center space-x-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#4CAF7C]" />
          <span>Auto-Save contra perda de texto</span>
        </span>
      </div>
    </section>
  );
};
