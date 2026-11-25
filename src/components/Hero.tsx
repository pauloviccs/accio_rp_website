import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Ticket, AlertTriangle, Compass } from 'lucide-react';
import { TOTAL_PIONEER_SLOTS, TARGET_PHASE_END_DATE } from '../lib/constants';
import { ArcaneFrame } from './ArcaneOrnaments';

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

  const scrollToBanners = () => {
    const el = document.getElementById('castle-exploration');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header id="top" className="hero">
      {/* Camadas Atmosféricas ArcaneMP + Silhueta Gótica do Castelo + Emblema ACCIO */}
      <div
        className="hero-image pointer-events-none select-none overflow-hidden"
        aria-hidden="true"
      >
        <div
          className="absolute inset-0 opacity-20 mix-blend-screen bg-center bg-no-repeat bg-contain scale-110 blur-[1px]"
          style={{ backgroundImage: 'url(/assets/logohigh_4x.jpg)' }}
        />
        <svg
          viewBox="0 0 1440 720"
          preserveAspectRatio="xMidYMax slice"
          className="absolute inset-x-0 bottom-0 w-full h-full opacity-55"
          fill="#05080f"
        >
          <path d="M0 720V540l95-35 75 20 85-55 70 18 65-95 16-78 14 78 24 12 18-130 14 130 32-28 22-165 10-48 10 48 22 165 28 24 18-108 14 108 40 16 28-64 26 64 55-22 65 40 95-45 120 35 110-50 130 35 125-42 84 22V720H0z" />
          <g fill="#ead6a6" opacity="0.45">
            <rect x="466" y="340" width="4" height="10" rx="2" />
            <rect x="476" y="348" width="4" height="10" rx="2" />
            <rect x="524" y="295" width="4" height="12" rx="2" />
            <rect x="534" y="315" width="4" height="12" rx="2" />
            <rect x="576" y="355" width="4" height="10" rx="2" />
            <rect x="615" y="420" width="3" height="8" rx="1.5" />
          </g>
        </svg>
      </div>
      <div className="hero-shade" aria-hidden="true" />
      <div className="castle-mist" aria-hidden="true" />
      <div className="castle-mist castle-mist-near" aria-hidden="true" />
      <div className="castle-light" aria-hidden="true" />

      <div className="relative z-10 flex flex-1 flex-col">
        <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-6 pt-28 sm:pt-32 pb-10">

          {/* Bloco Principal Central */}
          <div className="mx-auto max-w-3xl text-center my-auto pb-8">
            <button
              type="button"
              onClick={onOpenLetter}
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#0a0f19]/85 hover:bg-[#0d1422] border border-[var(--house-border)] text-xs text-[#ece7da] mb-5 shadow-lg transition cursor-pointer backdrop-blur-md"
            >
              <Sparkles className="w-3.5 h-3.5 text-[var(--house-accent)]" />
              <span className="eyebrow text-[10px]">Carta Oficial de Convocação</span>
              <span className="text-[#8b93a1]">·</span>
              <span className="text-[#b6bbc5]">Abrir Carta</span>
            </button>

            <h1 className="hero-title">
              ACCIO
              <span className="hero-title-sub">Roleplay</span>
            </h1>

            <p className="font-display mt-7 text-[clamp(1.35rem,2vw,1.7rem)] text-[#f2ebde]">
              Sua Carta de Hogwarts Finalmente Chegou.
            </p>

            <p className="mx-auto mt-3 max-w-[54ch] text-pretty text-[#cdd2da]">
              O primeiro servidor de Roleplay sério em Hogwarts Legacy construído com Arcane MP.
              Escreva sua história, garanta seu assento no Expresso e viva o verdadeiro mundo bruxo.
            </p>

            {/* CTAs Chanfrados Hexagonais ArcaneMP */}
            <div className="mt-8 flex flex-wrap justify-center gap-3 max-sm:flex-col">
              {hasApplication ? (
                <>
                  <button type="button" onClick={onOpenValidation} className="btn-primary">
                    <ShieldCheck />
                    <span>Validação de Pré-Registro</span>
                  </button>
                  <button type="button" onClick={onViewTicket} className="btn-secondary">
                    <Ticket />
                    <span>Meu Bilhete</span>
                  </button>
                </>
              ) : (
                <>
                  <button type="button" onClick={onOpenForm} className="btn-primary">
                    <Sparkles />
                    <span>Garantir Vaga de Pioneiro</span>
                  </button>
                  <button type="button" onClick={scrollToBanners} className="btn-secondary">
                    <Compass />
                    <span>Explorar as Casas</span>
                  </button>
                </>
              )}
            </div>

            {/* Barra de Progresso Emoldurada do Livro da Admissão */}
            <div className="mt-7 mx-auto max-w-md text-left">
              <ArcaneFrame className="p-6 sm:p-7 bg-[#0a0f19]/90 backdrop-blur-md">
                <div className="flex justify-between items-center text-xs font-semibold mb-2.5">
                  <span className="eyebrow text-[10px]">Livro da Admissão · 1º Lote</span>
                  <span className="text-[var(--house-accent)] font-mono text-xs font-bold">
                    {totalRegistered} / {TOTAL_PIONEER_SLOTS} ({percentage}%)
                  </span>
                </div>

                <div className="w-full h-2.5 bg-[#05080f] overflow-hidden p-0.5 border border-[var(--house-border)]">
                  <div
                    className="h-full bg-gradient-to-r from-[var(--house-secondary)] via-[var(--house-btn-mid)] to-[var(--house-btn-start)] transition-all duration-1000 relative"
                    style={{ width: `${Math.max(percentage, totalRegistered > 0 ? 5 : 0)}%` }}
                  >
                    {totalRegistered > 0 && (
                      <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/70 blur-[2px] animate-pulse" />
                    )}
                  </div>
                </div>

                <p className="text-[11px] text-[#8b93a1] mt-2.5 flex items-start gap-1.5 leading-snug">
                  <AlertTriangle className="w-3.5 h-3.5 text-[var(--house-accent)] flex-shrink-0 mt-0.5" />
                  <span>Pré-Registro limitado por prazo estipulado ou até 100 vagas no Livro da Admissão.</span>
                </p>
              </ArcaneFrame>
            </div>
          </div>

          {/* Barra Inferior 3 Colunas Estilo hero-facts do ArcaneMP */}
          <dl className="hero-facts mx-auto mt-auto w-full max-w-4xl text-center">
            <div>
              <dt>
                <span className="live-dot" aria-hidden="true" />
                <span className="tabular-nums">{totalRegistered}</span> inscritos agora
              </dt>
              <dd>De {TOTAL_PIONEER_SLOTS} vagas do 1º Lote ({percentage}%)</dd>
            </div>
            <div>
              <dt className="tabular-nums">
                {String(timeLeft.days).padStart(2, '0')}d : {String(timeLeft.hours).padStart(2, '0')}h :{' '}
                {String(timeLeft.minutes).padStart(2, '0')}m : {String(timeLeft.seconds).padStart(2, '0')}s
              </dt>
              <dd>Encerramento do Pré-Registro em tempo real</dd>
            </div>
            <div>
              <dt className="inline-flex items-center gap-1.5">
                <span>Anos 2000 · Arcane MP</span>
                <ArrowRight className="w-4 h-4 text-[var(--house-accent)] hidden sm:inline" />
              </dt>
              <dd>Discord OAuth2, Varinha 3D &amp; Pergaminho PDF</dd>
            </div>
          </dl>
        </div>
      </div>
    </header>
  );
};
