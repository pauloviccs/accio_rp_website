import React, { useState, useEffect, useRef } from 'react';
import { X, Clock, Check, Wand2, RefreshCw, ChevronUp, ChevronDown, Zap, Hourglass, Target, AlertTriangle } from 'lucide-react';
import { CountdownTimerData, updateCountdownTimer, getCountdownTimer } from '../lib/supabase';
import { soundManager } from '../lib/audio';

interface AppleTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTimerSaved?: (newTimer: CountdownTimerData) => void;
}

interface WheelColumnProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (val: number) => void;
  padZero?: boolean;
}

const WheelColumn: React.FC<WheelColumnProps> = ({
  label,
  value,
  min,
  max,
  onChange,
  padZero = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startY = useRef(0);
  const startVal = useRef(value);
  const lastSoundVal = useRef(value);

  const ITEM_HEIGHT = 34; // Altura ergonômica ideal para mobile e desktop

  const step = (delta: number) => {
    let next = value + delta;
    if (next > max) next = min;
    if (next < min) next = max;
    soundManager.playWheelTick();
    onChange(next);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY > 0) {
      step(1);
    } else if (e.deltaY < 0) {
      step(-1);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    startY.current = e.clientY;
    startVal.current = value;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const deltaY = startY.current - e.clientY;
    const itemsScrolled = Math.round(deltaY / ITEM_HEIGHT);
    let nextVal = startVal.current + itemsScrolled;

    const range = max - min + 1;
    nextVal = ((((nextVal - min) % range) + range) % range) + min;

    if (nextVal !== lastSoundVal.current) {
      soundManager.playWheelTick();
      lastSoundVal.current = nextVal;
      onChange(nextVal);
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const visibleItems = [-2, -1, 0, 1, 2].map((offset) => {
    const range = max - min + 1;
    let val = value + offset;
    val = ((((val - min) % range) + range) % range) + min;
    return { val, offset };
  });

  return (
    <div className="flex flex-col items-center select-none flex-1 min-w-[50px] max-w-[70px]">
      <button
        onClick={() => step(-1)}
        className="p-1 text-[#FFF0B2]/40 hover:text-[#FFC34F] hover:bg-white/5 rounded-full transition mb-0.5 cursor-pointer"
        title={`Diminuir ${label}`}
      >
        <ChevronUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </button>

      {/* Roda Cilíndrica Apple com Altura Controlada e Lente de Aumento */}
      <div
        ref={containerRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="relative w-full h-[135px] sm:h-[155px] flex items-center justify-center cursor-grab active:cursor-grabbing overflow-hidden rounded-xl sm:rounded-2xl bg-[#0D0202] border border-[#B83A0C]/30 shadow-inner"
        style={{ perspective: '500px' }}
      >
        {/* Lente Central Apple com Vidro Fosco */}
        <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-[34px] sm:h-[38px] bg-[#FFC34F]/10 border-y border-[#FFC34F]/40 pointer-events-none z-10 backdrop-blur-[1px]" />

        {/* Gradientes Superior e Inferior para Efeito 3D de Cilindro */}
        <div className="absolute inset-x-0 top-0 h-10 sm:h-12 bg-gradient-to-b from-[#0D0202] via-[#0D0202]/90 to-transparent pointer-events-none z-20" />
        <div className="absolute inset-x-0 bottom-0 h-10 sm:h-12 bg-gradient-to-t from-[#0D0202] via-[#0D0202]/90 to-transparent pointer-events-none z-20" />

        <div className="relative w-full h-full flex flex-col items-center justify-center pointer-events-none">
          {visibleItems.map(({ val, offset }) => {
            const isCenter = offset === 0;
            const rotateX = offset * 26;
            const translateY = offset * 30;
            const scale = isCenter ? 1.15 : 1 - Math.abs(offset) * 0.2;
            const opacity = isCenter ? 1 : 1 - Math.abs(offset) * 0.45;

            return (
              <div
                key={offset}
                className={`absolute font-mono transition-transform duration-75 flex items-center justify-center ${
                  isCenter
                    ? 'text-lg sm:text-2xl font-black text-gold-gradient drop-shadow-[0_0_10px_rgba(255,195,79,0.5)]'
                    : 'text-sm sm:text-base font-medium text-[#FFF0B2]/40'
                }`}
                style={{
                  transform: `translateY(${translateY}px) rotateX(${rotateX}deg) scale(${scale})`,
                  opacity,
                }}
              >
                {padZero ? String(val).padStart(2, '0') : val}
              </div>
            );
          })}
        </div>
      </div>

      <button
        onClick={() => step(1)}
        className="p-1 text-[#FFF0B2]/40 hover:text-[#FFC34F] hover:bg-white/5 rounded-full transition mt-0.5 cursor-pointer"
        title={`Aumentar ${label}`}
      >
        <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </button>

      <span className="text-[9px] sm:text-[11px] font-bold tracking-widest uppercase text-[#FFC34F] mt-0.5">
        {label}
      </span>
    </div>
  );
};

export const AppleTimerModal: React.FC<AppleTimerModalProps> = ({
  isOpen,
  onClose,
  onTimerSaved,
}) => {
  const [days, setDays] = useState(60);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [calculatedEnd, setCalculatedEnd] = useState<Date>(new Date());

  useEffect(() => {
    if (!isOpen) return;

    getCountdownTimer().then((data) => {
      if (data) {
        setDays(data.days ?? 60);
        setHours(data.hours ?? 0);
        setMinutes(data.minutes ?? 0);
        setSeconds(data.seconds ?? 0);
      }
    });
  }, [isOpen]);

  useEffect(() => {
    const now = Date.now();
    const totalMs =
      days * 24 * 60 * 60 * 1000 +
      hours * 60 * 60 * 1000 +
      minutes * 60 * 1000 +
      seconds * 1000;
    setCalculatedEnd(new Date(now + totalMs));
  }, [days, hours, minutes, seconds]);

  if (!isOpen) return null;

  const applyPreset = (d: number, h: number = 0, m: number = 0) => {
    soundManager.playSparkle();
    setDays(d);
    setHours(h);
    setMinutes(m);
    setSeconds(0);
  };

  const handleSave = async () => {
    setIsSaving(true);
    soundManager.playClick();

    const targetDate = calculatedEnd.toISOString();
    const payload: CountdownTimerData = {
      target_date: targetDate,
      days,
      hours,
      minutes,
      seconds,
      updated_by: 'Gabinete Ministerial de Hogwarts',
    };

    const ok = await updateCountdownTimer(payload);
    setIsSaving(false);

    if (ok) {
      soundManager.playSparkle();
      setSaveSuccess(true);
      if (onTimerSaved) {
        onTimerSaved(payload);
      }
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center p-2.5 sm:p-4 bg-[#05080f]/90 backdrop-blur-2xl overflow-y-auto">
      <div className="relative w-full max-w-lg max-h-[92dvh] flex flex-col bg-[#0a0f19] border border-[var(--house-border)] p-4 sm:p-6 shadow-2xl overflow-y-auto custom-scrollbar my-auto animate-apple-modal">
        
        {/* Glow de fundo */}
        <div className="absolute top-0 right-1/4 w-60 h-60 bg-[var(--house-glow)] rounded-full blur-[80px] pointer-events-none opacity-25" />

        {/* Topo do Modal */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-[#0d1422] border border-[var(--house-border)] flex items-center justify-center shadow-md">
              <Clock className="w-4 h-4 text-[var(--house-accent)] animate-pulse" />
            </div>
            <div>
              <span className="eyebrow text-[10px] block">
                Livro da Admissão · Configuração
              </span>
              <h3 className="font-display text-base sm:text-lg text-[#ece7da]">
                Cronômetro de Lançamento
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-[#FFF0B2]/60 hover:text-white transition cursor-pointer"
            title="Fechar"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Atalhos Rápidos com Quebra Suave */}
        <div className="mb-4">
          <span className="text-[10px] uppercase tracking-wider text-[#FFF0B2]/60 font-semibold block mb-1.5 text-center">
            Prazos Canônicos Predefinidos:
          </span>
          <div className="flex flex-wrap justify-center gap-1.5">
            {[
              { label: '60 Dias (Padrão)', d: 60, icon: Zap },
              { label: '30 Dias', d: 30, icon: Hourglass },
              { label: '15 Dias', d: 15, icon: Clock },
              { label: '7 Dias', d: 7, icon: Target },
              { label: '24 Horas', d: 1, icon: AlertTriangle },
            ].map((preset) => {
              const PresetIcon = preset.icon;
              return (
              <button
                key={preset.label}
                onClick={() => applyPreset(preset.d)}
                className={`inline-flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-semibold border transition cursor-pointer ${
                  days === preset.d && hours === 0
                    ? 'bg-[#FFC34F] text-[#160504] border-[#FFC34F] font-bold shadow-md shadow-[#FFC34F]/20'
                    : 'bg-[#210604] text-[#FFF0B2]/80 border-[#B83A0C]/30 hover:border-[#FFC34F]/50 hover:text-white'
                }`}
              >
                <PresetIcon className="w-3 h-3" />
                <span>{preset.label}</span>
              </button>
              );
            })}
          </div>
        </div>

        {/* ROLETA APPLE DE 4 COLUNAS: DIAS, HORAS, MINUTOS, SEGUNDOS (100% RESPONSIVA) */}
        <div className="bg-[#090e17] border border-[var(--house-border)] p-2.5 sm:p-4 mb-4 shadow-2xl">
          <div className="flex items-center justify-center space-x-1 sm:space-x-2 md:space-x-3">
            <WheelColumn
              label="Dias"
              value={days}
              min={0}
              max={99}
              onChange={setDays}
              padZero={false}
            />

            <span className="text-base sm:text-xl font-mono text-[#FFC34F]/40 font-bold -mt-4">:</span>

            <WheelColumn
              label="Horas"
              value={hours}
              min={0}
              max={23}
              onChange={setHours}
            />

            <span className="text-base sm:text-xl font-mono text-[#FFC34F]/40 font-bold -mt-4">:</span>

            <WheelColumn
              label="Minutos"
              value={minutes}
              min={0}
              max={59}
              onChange={setMinutes}
            />

            <span className="text-base sm:text-xl font-mono text-[#FFC34F]/40 font-bold -mt-4">:</span>

            <WheelColumn
              label="Segundos"
              value={seconds}
              min={0}
              max={59}
              onChange={setSeconds}
            />
          </div>
        </div>

        {/* Previsão de Encerramento */}
        <div className="bg-[#0d1422]/85 border border-[var(--house-border)] p-3 mb-4 text-center text-xs">
          <span className="text-[#FFF0B2]/60 block mb-0.5 text-[11px]">
            Data Estimada de Término no Livro da Admissão:
          </span>
          <span className="font-mono text-xs sm:text-sm font-bold text-gold-gradient block">
            {calculatedEnd.toLocaleDateString('pt-BR', {
              weekday: 'short',
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}{' '}
            às {calculatedEnd.toLocaleTimeString('pt-BR')}
          </span>
          <span className="text-[10px] text-[#4CAF7C] flex items-center justify-center gap-1 mt-1">
            <Zap className="w-3 h-3" />
            <span>Sincronizado instantaneamente via Supabase Realtime para todos os jogadores.</span>
          </span>
        </div>

        {/* Ações */}
        <div className="flex items-center justify-end space-x-2.5 pt-1 border-t border-white/5">
          <button
            onClick={onClose}
            className="px-3.5 py-2 rounded-xl bg-[#210604] border border-[#B83A0C]/30 text-xs text-[#FFF0B2]/70 hover:text-white hover:bg-[#5B1009] transition cursor-pointer"
          >
            Cancelar
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving || saveSuccess}
            className="px-4 sm:px-5 py-2 rounded-xl btn-accio-gold text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer disabled:opacity-60 shadow-lg"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Gravando...</span>
              </>
            ) : saveSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#160504]" />
                <span>Encantamento Salvo!</span>
              </>
            ) : (
              <>
                <Wand2 className="w-3.5 h-3.5" />
                <span>Salvar & Encantar Cronômetro</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
