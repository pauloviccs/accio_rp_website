import React, { useState, useEffect, useRef } from 'react';
import { X, Clock, Check, Wand2, RefreshCw, ChevronUp, ChevronDown } from 'lucide-react';
import { CountdownTimerData, updateCountdownTimer, getCountdownTimer } from '../lib/supabase';
import { soundManager } from '../lib/audio';

interface AppleTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTimerSaved?: (newTimer: CountdownTimerData) => void;
}

// Coluna individual estilo Roleta Cilindrica da Apple (iOS Wheel Drum)
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

  const ITEM_HEIGHT = 44; // Altura exata da lente central iOS

  // Incrementar / decrementar com som
  const step = (delta: number) => {
    let next = value + delta;
    if (next > max) next = min;
    if (next < min) next = max;
    soundManager.playWheelTick();
    onChange(next);
  };

  // Tratar rolagem por roda do mouse (Wheel event)
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY > 0) {
      step(1);
    } else if (e.deltaY < 0) {
      step(-1);
    }
  };

  // Tratar toque / arrasto (Touch / Mouse drag)
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

    // Wrap around
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

  // Gerar itens visíveis: [value - 2, value - 1, value, value + 1, value + 2]
  const visibleItems = [-2, -1, 0, 1, 2].map((offset) => {
    const range = max - min + 1;
    let val = value + offset;
    val = ((((val - min) % range) + range) % range) + min;
    return { val, offset };
  });

  return (
    <div className="flex flex-col items-center select-none">
      {/* Botão de incremento rápido superior */}
      <button
        onClick={() => step(-1)}
        className="p-1 text-[#FFF0B2]/40 hover:text-[#FFC34F] hover:bg-white/5 rounded-full transition mb-1"
        title={`Diminuir ${label}`}
      >
        <ChevronUp className="w-4 h-4" />
      </button>

      {/* Roda cilíndrica com lente central */}
      <div
        ref={containerRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="relative w-16 sm:w-20 h-[220px] flex items-center justify-center cursor-grab active:cursor-grabbing overflow-hidden rounded-2xl bg-[#100303]/90 border border-[#B83A0C]/25 shadow-inner"
        style={{ perspective: '600px' }}
      >
        {/* Lente Central Apple (Highlight Bar com vidro fosco) */}
        <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-[44px] bg-[#FFC34F]/10 border-y border-[#FFC34F]/40 pointer-events-none z-10 backdrop-blur-[1px]" />

        {/* Gradiente superior e inferior para profundidade cilíndrica 3D */}
        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[#100303] via-[#100303]/80 to-transparent pointer-events-none z-20" />
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#100303] via-[#100303]/80 to-transparent pointer-events-none z-20" />

        {/* Itens do tambor */}
        <div className="relative w-full h-full flex flex-col items-center justify-center pointer-events-none">
          {visibleItems.map(({ val, offset }) => {
            const isCenter = offset === 0;
            const rotateX = offset * 26; // Rotação 3D cilíndrica
            const translateY = offset * 42;
            const scale = isCenter ? 1.15 : 1 - Math.abs(offset) * 0.18;
            const opacity = isCenter ? 1 : 1 - Math.abs(offset) * 0.42;

            return (
              <div
                key={offset}
                className={`absolute font-mono transition-transform duration-100 flex items-center justify-center ${
                  isCenter
                    ? 'text-2xl sm:text-3xl font-black text-gold-gradient drop-shadow-[0_0_12px_rgba(255,195,79,0.5)]'
                    : 'text-lg sm:text-xl font-medium text-[#FFF0B2]/40'
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

      {/* Botão de incremento rápido inferior */}
      <button
        onClick={() => step(1)}
        className="p-1 text-[#FFF0B2]/40 hover:text-[#FFC34F] hover:bg-white/5 rounded-full transition mt-1"
        title={`Aumentar ${label}`}
      >
        <ChevronDown className="w-4 h-4" />
      </button>

      {/* Legenda inferior */}
      <span className="text-[10px] sm:text-xs font-bold tracking-widest uppercase text-[#FFC34F] mt-1">
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

  // Carregar dados salvos no Supabase ao abrir
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

  // Recalcular data final ao alterar qualquer roleta
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

  // Aplicar atalhos rápidos
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
      }, 1200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl animate-apple-modal">
      <div className="relative w-full max-w-xl bg-[#160504] border border-[#B83A0C]/50 rounded-3xl shadow-2xl p-6 sm:p-8 overflow-hidden">
        
        {/* Glow de fundo */}
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-[#FFC34F]/10 rounded-full blur-[100px] pointer-events-none" />

        {/* Topo do Modal */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFC34F] to-[#5B1009] p-0.5 shadow-md">
              <div className="w-full h-full rounded-[10px] bg-[#160504] flex items-center justify-center">
                <Clock className="w-5 h-5 text-[#FFC34F] animate-pulse" />
              </div>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-widest text-[#FFC34F] font-bold block">
                Gabinete da Diretoria · Livro da Admissão
              </span>
              <h3 className="font-cinzel text-lg sm:text-xl font-bold text-[#FFF0B2]">
                Ajustar Cronômetro de Lançamento
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-[#FFF0B2]/60 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Atalhos Rápidos de Dias */}
        <div className="mb-6">
          <span className="text-[11px] uppercase tracking-wider text-[#FFF0B2]/60 font-semibold block mb-2 text-center">
            Prazos Canônicos Predefinidos:
          </span>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              { label: '⚡ 60 Dias (Padrão)', d: 60 },
              { label: '⏳ 30 Dias', d: 30 },
              { label: '⌛ 15 Dias', d: 15 },
              { label: '🎯 7 Dias', d: 7 },
              { label: '🚨 24 Horas', d: 1 },
            ].map((preset) => (
              <button
                key={preset.label}
                onClick={() => applyPreset(preset.d)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                  days === preset.d && hours === 0
                    ? 'bg-[#FFC34F] text-[#160504] border-[#FFC34F] font-bold shadow-md shadow-[#FFC34F]/20'
                    : 'bg-[#210604] text-[#FFF0B2]/80 border-[#B83A0C]/30 hover:border-[#FFC34F]/50 hover:text-white'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* ROLETA APPLE DE 4 COLUNAS: DIAS, HORAS, MINUTOS, SEGUNDOS */}
        <div className="bg-[#0D0202] border border-[#B83A0C]/40 rounded-2xl p-4 sm:p-6 mb-6 shadow-2xl">
          <div className="flex items-center justify-center space-x-2 sm:space-x-4">
            <WheelColumn
              label="Dias"
              value={days}
              min={0}
              max={99}
              onChange={setDays}
              padZero={false}
            />

            <span className="text-xl font-mono text-[#FFC34F]/40 font-bold -mt-6">:</span>

            <WheelColumn
              label="Horas"
              value={hours}
              min={0}
              max={23}
              onChange={setHours}
            />

            <span className="text-xl font-mono text-[#FFC34F]/40 font-bold -mt-6">:</span>

            <WheelColumn
              label="Minutos"
              value={minutes}
              min={0}
              max={59}
              onChange={setMinutes}
            />

            <span className="text-xl font-mono text-[#FFC34F]/40 font-bold -mt-6">:</span>

            <WheelColumn
              label="Segundos"
              value={seconds}
              min={0}
              max={59}
              onChange={setSeconds}
            />
          </div>
        </div>

        {/* Prévia da Data de Término */}
        <div className="bg-[#210604]/80 border border-[#B83A0C]/30 rounded-xl p-3.5 mb-6 text-center text-xs">
          <span className="text-[#FFF0B2]/60 block mb-1">
            Data e Hora Estimadas de Encerramento:
          </span>
          <span className="font-mono text-sm sm:text-base font-bold text-gold-gradient block">
            {calculatedEnd.toLocaleDateString('pt-BR', {
              weekday: 'long',
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            })}{' '}
            às {calculatedEnd.toLocaleTimeString('pt-BR')}
          </span>
          <span className="text-[10px] text-[#4CAF7C] block mt-1">
            ⚡ Todos os usuários conectados verão a contagem atualizar em tempo real.
          </span>
        </div>

        {/* Ações */}
        <div className="flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-[#210604] border border-[#B83A0C]/30 text-xs text-[#FFF0B2]/70 hover:text-white hover:bg-[#5B1009] transition cursor-pointer"
          >
            Cancelar
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving || saveSuccess}
            className="px-6 py-2.5 rounded-xl btn-accio-gold text-xs font-bold transition flex items-center space-x-2 cursor-pointer disabled:opacity-60"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Gravando no Livro...</span>
              </>
            ) : saveSuccess ? (
              <>
                <Check className="w-4 h-4 text-[#160504]" />
                <span>Encantamento Salvo!</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                <span>Salvar & Encantar Cronômetro</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
