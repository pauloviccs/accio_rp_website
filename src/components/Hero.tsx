import React, { useState, useEffect } from 'react';
import { Sparkles, Users, ArrowRight, CheckCircle2, Clock, ShieldCheck, Ticket } from 'lucide-react';
import { TOTAL_PIONEER_SLOTS, TARGET_PHASE_END_DATE } from '../lib/constants';

interface HeroProps {
  onOpenForm: () => void;
  totalRegistered: number;
  hasApplication: boolean;
  onViewTicket: () => void;
  onOpenLetter: () => void;
  onOpenValidation: () => void;
  targetEndDate?: string | null;
}

export const Hero: React.FC<HeroProps> = ({
  onOpenForm,
  totalRegistered,
  hasApplication,
  onViewTicket,
  onOpenLetter,
  onOpenValidation,
  targetEndDate,
}) => {
  // Contagem regressiva sincronizada em tempo real com o Livro da Admissão
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const target = targetEndDate ? new Date(targetEndDate).getTime() : new Date(TARGET_PHASE_END_DATE).getTime();

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
  }, [targetEndDate]);

  const percentage = Math.min(Math.round((totalRegistered / TOTAL_PIONEER_SLOTS) * 100), 100);

  return (
    <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
      
      {/* Glow Superior Adaptativo da Casa */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[350px] sm:w-[650px] h-[350px] bg-gradient-to-b from-[var(--house-primary)]/35 to-transparent rounded-full blur-[100px] pointer-events-none transition-all duration-700" />

      {/* Badge de Urgência / FOMO */}
      <button
        onClick={onOpenLetter}
        className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[var(--house-pill-bg)] hover:brightness-125 border border-[var(--house-border)] text-xs sm:text-sm text-[#FFF0B2] mb-8 shadow-lg transition cursor-pointer"
      >
        <Sparkles className="w-4 h-4 text-[var(--house-accent)]" />
        <span className="font-semibold text-[var(--house-accent)]">Carta Oficial de Convocação</span>
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

      {/* Progress Bar de Vagas (FOMO 100% Real do Livro da Admissão) */}
      <div className="w-full max-w-md bg-[var(--house-card-bg)] border border-[var(--house-border)] rounded-2xl p-5 mb-8 shadow-2xl backdrop-blur-xl transition-all duration-700">
        <div className="flex justify-between items-center text-xs sm:text-sm font-semibold mb-3">
          <span className="text-[#FFF0B2] flex items-center space-x-1.5">
            <Users className="w-4 h-4 text-[var(--house-accent)]" />
            <span>Bruxos Inscritos no Livro da Admissão:</span>
          </span>
          <span className="text-[var(--house-accent)] font-mono text-base font-bold">
            {totalRegistered} / {TOTAL_PIONEER_SLOTS} ({percentage}%)
          </span>
        </div>

        {/* Barra de Progresso */}
        <div className="w-full h-3 bg-[#100303] rounded-full overflow-hidden p-0.5 border border-[var(--house-border)]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[var(--house-primary)] via-[var(--house-btn-start)] to-[var(--house-btn-end)] transition-all duration-1000 relative"
            style={{ width: `${Math.max(percentage, totalRegistered > 0 ? 5 : 0)}%` }}
          >
            {totalRegistered > 0 && (
              <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/60 blur-[2px] animate-pulse"></div>
            )}
          </div>
        </div>

        <p className="text-[11px] text-[#FFF0B2]/60 mt-3 text-left">
          ⚠️ O Pré-Registro de Pioneiros possui prazo estipulado (ou até o limite de 100 vagas no Livro da Admissão).
        </p>
      </div>

      {/* Indicador e Cronômetro */}
      <div className="flex flex-col items-center mb-10">
        <div className="flex items-center space-x-1.5 text-xs text-[var(--house-accent)] font-semibold mb-3">
          <Clock className="w-3.5 h-3.5 text-[var(--house-accent)]" />
          <span>Contagem Regressiva para Encerramento do Pré-Registro:</span>
        </div>

        <div className="grid grid-cols-4 gap-2 sm:gap-4 max-w-xs sm:max-w-sm">
          {[
            { label: 'DIAS', value: timeLeft.days },
            { label: 'HORAS', value: timeLeft.hours },
            { label: 'MINUTOS', value: timeLeft.minutes },
            { label: 'SEGUNDOS', value: timeLeft.seconds },
          ].map((item, index) => (
            <div key={index} className="bg-[var(--house-card-bg)] border border-[var(--house-border)] rounded-xl p-2 sm:p-3 text-center min-w-[65px] sm:min-w-[75px] transition-all duration-700">
              <span className="font-mono text-xl sm:text-2xl font-bold text-gold-gradient block">
                {String(item.value).padStart(2, '0')}
              </span>
              <span className="text-[9px] sm:text-[10px] text-[#FFF0B2]/60 font-semibold tracking-wider">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Buttons */}
      {hasApplication ? (
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={onOpenValidation}
            className="btn-accio-gold px-8 sm:px-10 py-4 rounded-2xl text-base sm:text-lg flex items-center space-x-3 cursor-pointer group shadow-xl"
          >
            <ShieldCheck className="w-5 h-5 text-[#160504]" />
            <span>Validação de Pré-Registro</span>
            <ArrowRight className="w-5 h-5 text-[#160504] group-hover:translate-x-1 transition" />
          </button>

          <button
            onClick={onViewTicket}
            className="px-6 py-4 rounded-2xl bg-[#210604] hover:bg-[#5B1009] border border-[#FFC34F]/40 text-[#FFF0B2] text-sm sm:text-base flex items-center space-x-2 font-semibold transition"
          >
            <Ticket className="w-4 h-4 text-[#FFC34F]" />
            <span>Meu Bilhete</span>
          </button>
        </div>
      ) : (
        <button
          onClick={onOpenForm}
          className="btn-accio-gold px-8 sm:px-10 py-4 rounded-2xl text-base sm:text-lg flex items-center space-x-3 cursor-pointer group shadow-xl"
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
          <span>Inscrição Lavrada no Livro da Admissão</span>
        </span>
        <span className="flex items-center space-x-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#4CAF7C]" />
          <span>Notificação Instantânea no Discord</span>
        </span>
      </div>
    </section>
  );
};
