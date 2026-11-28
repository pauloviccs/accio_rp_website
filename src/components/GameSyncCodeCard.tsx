import React, { useEffect, useState } from 'react';
import { Check, Copy, KeyRound, RefreshCw } from 'lucide-react';
import { CharacterApplication } from '../types';
import { issueServerLinkCode, ServerLinkCodeResult } from '../lib/supabase';
import { formatTicketNumber } from '../lib/ticketFormat';
import { soundManager } from '../lib/audio';

interface GameSyncCodeCardProps {
  application: CharacterApplication;
  isOpen: boolean;
  compact?: boolean;
}

/**
 * Cartão compartilhado que exibe/emite automaticamente o Código Único do Personagem (8 chars)
 * para fichas aprovadas, evitando confusão com o nº decorativo do Bilhete (#ACCIO-0001...).
 */
export const GameSyncCodeCard: React.FC<GameSyncCodeCardProps> = ({
  application,
  isOpen,
  compact = false,
}) => {
  const [isIssuing, setIsIssuing] = useState(false);
  const [result, setResult] = useState<ServerLinkCodeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const isApproved = application.status === 'approved';
  const ticketCode = formatTicketNumber(application);

  const fetchCode = async (forceNew: boolean) => {
    setIsIssuing(true);
    setError(null);
    setCopied(false);
    try {
      const data = await issueServerLinkCode(application.id, forceNew);
      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Entre com sua conta Discord no site para emitir o código de criação.'
      );
    } finally {
      setIsIssuing(false);
    }
  };

  useEffect(() => {
    setResult(null);
    setError(null);
    setCopied(false);

    if (!isOpen || !application.id || !isApproved || application.game_character_id) {
      return;
    }

    let cancelled = false;
    setIsIssuing(true);
    issueServerLinkCode(application.id, false)
      .then((data) => {
        if (!cancelled) setResult(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'Entre com seu Discord no site para visualizar ou gerar o código.'
          );
        }
      })
      .finally(() => {
        if (!cancelled) setIsIssuing(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, application.id, application.status, application.game_character_id]);

  if (application.game_character_id) {
    return (
      <div className="p-4 bg-[#0d1422] border border-[#4CAF7C]/40 text-left">
        <span className="text-[10px] uppercase tracking-[0.18em] text-[#7fd29a] block mb-1">
          Personagem Sincronizado no Servidor
        </span>
        <p className="text-xs text-[#ece7da]">
          Esta ficha já está vinculada ao personagem criado no ArcaneMP (<strong className="font-mono text-[#7fd29a]">ID #{application.game_character_id}</strong>). Para outro personagem, crie uma nova ficha no portal.
        </p>
      </div>
    );
  }

  return (
    <div className={`bg-[#0d1422] border border-[var(--house-accent)]/60 text-left space-y-2.5 ${compact ? 'p-3.5' : 'p-4 sm:p-5'}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-[var(--house-accent)] flex-shrink-0" />
          <span className="text-[11px] uppercase tracking-[0.16em] font-bold text-[var(--house-accent)]">
            Código do Personagem (Para Criar no Jogo)
          </span>
        </div>

        {isApproved && (
          <button
            type="button"
            disabled={isIssuing}
            onClick={() => {
              soundManager.playSparkle();
              void fetchCode(true);
            }}
            className="px-2.5 py-1 bg-[#121c30] hover:bg-[#192640] border border-white/15 text-[11px] text-[#b6bbc5] hover:text-white inline-flex items-center gap-1 transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${isIssuing ? 'animate-spin' : ''}`} />
            <span>{result ? 'Novo Código' : 'Gerar Código'}</span>
          </button>
        )}
      </div>

      {!isApproved ? (
        <p className="text-xs text-[#b6bbc5] leading-relaxed">
          O <strong className="text-[#ece7da]">Código Único de Criação</strong> será liberado automaticamente aqui assim que sua ficha ({ticketCode}) for aprovada pela moderação.
        </p>
      ) : isIssuing && !result ? (
        <div className="py-2 text-xs text-[#FFF0B2]/75 font-mono">
          Consultando pergaminho ministerial...
        </div>
      ) : result ? (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#080d17] border border-[var(--house-border)] px-3.5 py-2.5">
            <div>
              <span className="text-[10px] text-[#8b93a1] block">
                Use no Criador 3D do Servidor (válido por 30 min)
              </span>
              <span className="text-lg sm:text-xl font-mono font-extrabold tracking-[0.16em] text-[#FFC34F] select-all">
                {result.code}
              </span>
            </div>

            <button
              type="button"
              onClick={async () => {
                await navigator.clipboard?.writeText(result.code);
                setCopied(true);
                soundManager.playSparkle();
                setTimeout(() => setCopied(false), 2500);
              }}
              className="px-3.5 py-2 bg-[#121c30] hover:bg-[#192640] border border-[var(--house-border)] text-xs font-semibold text-[#ece7da] inline-flex items-center gap-1.5 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiado!' : 'Copiar Código'}</span>
            </button>
          </div>

          <p className="text-[11px] leading-relaxed text-[#b6bbc5]">
            <strong className="text-[#FFF0B2]">Atenção:</strong> cole este código de 8 caracteres (ex.: <span className="font-mono text-[#FFC34F]">{result.code}</span>) dentro do jogo — <strong className="text-amber-300">não digite</strong> o número decorativo do bilhete (<span className="font-mono">{ticketCode}</span>).
          </p>
        </>
      ) : error ? (
        <div className="space-y-2">
          <p className="text-xs text-rose-300">{error}</p>
          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              void fetchCode(false);
            }}
            className="px-3 py-1.5 bg-[#121c30] hover:bg-[#192640] border border-[var(--house-border)] text-xs text-[#ece7da] inline-flex items-center gap-1.5 cursor-pointer"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Tentar Emitir Código Agora</span>
          </button>
        </div>
      ) : null}
    </div>
  );
};

