import React, { useState } from 'react';
import { X, CheckCircle2, Clock, AlertTriangle, ExternalLink, Ticket, BookOpen, Wand2, Shield, Calendar, MapPin, FileDown, Check, PlusCircle } from 'lucide-react';
import { CharacterApplication } from '../types';
import { DISCORD_INVITE_URL } from '../lib/constants';
import { resolveEffectiveHouse } from '../lib/houseResolution';
import { formatTicketNumber } from '../lib/ticketFormat';
import { generateAndDownloadCharacterPdf } from '../lib/pdfGenerator';
import { soundManager } from '../lib/audio';
import { ArcaneFrame } from './ArcaneOrnaments';
import { GameSyncCodeCard } from './GameSyncCodeCard';

interface ValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: CharacterApplication | null;
  applications?: CharacterApplication[];
  onSelectApplication?: (app: CharacterApplication) => void;
  onCreateNewCharacter?: () => void;
  onViewTicket: () => void;
}

export const ValidationModal: React.FC<ValidationModalProps> = ({
  isOpen,
  onClose,
  application,
  applications = [],
  onSelectApplication,
  onCreateNewCharacter,
  onViewTicket,
}) => {
  const [isReadingStory, setIsReadingStory] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [pdfProgress, setPdfProgress] = useState<string | null>(null);

  if (!isOpen || !application) return null;

  const {
    houseInfo: house,
    isSortedOfficial,
    preferredHouseInfo,
    differsFromPreferred,
  } = resolveEffectiveHouse(application);
  const registrationCode = formatTicketNumber(application);
  const status = application.status || 'pending';

  const bloodStatusMap: Record<string, string> = {
    'pure-blood': 'Sangue Puro',
    'half-blood': 'Mestiço',
    'muggle-born': 'Nascido Trouxa',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-2.5 sm:p-5 bg-[#05080f]/85 backdrop-blur-xl transition-all duration-300 overflow-y-auto">

      {/* Luz ambiente de feitiço */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[650px] h-[350px] sm:h-[650px] rounded-full blur-[120px] pointer-events-none opacity-25"
        style={{ backgroundColor: house.color }}
      />

      <ArcaneFrame
        scrollable
        className="w-full max-w-2xl bg-[#0a0f19]/95 shadow-2xl backdrop-blur-2xl text-left my-auto max-h-[92dvh]"
        bodyClassName="p-3.5 sm:p-6"
      >

        {/* Botão de Fechar */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 sm:top-5 sm:right-5 text-[#b6bbc5] hover:text-white p-1.5 hover:bg-white/5 transition cursor-pointer"
          aria-label="Fechar validação"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Cabeçalho de Validação */}
        <div className="flex items-center space-x-3 mb-5 pr-10">
          <div className="w-12 h-12 bg-[#0d1422] border border-[var(--house-border)] flex items-center justify-center shadow-lg">
            <Shield className="w-6 h-6 text-[var(--house-accent)]" />
          </div>
          <div>
            <span className="eyebrow text-[10px] block">
              Ministério da Magia · ACCIO RP
            </span>
            <h2 className="font-display text-xl sm:text-2xl text-[#ece7da]">
              Validação de Pré-Registro
            </h2>
          </div>
        </div>

        {/* Seletor de Personagens do Jogador + Botão Novo Personagem */}
        {(applications.length > 0 || onCreateNewCharacter) && (
          <div className="mb-5 flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-white/10">
            <div className="flex flex-wrap items-center gap-1.5">
              {applications.map((item) => {
                const isSelected = item.id === application.id;
                return (
                  <button
                    key={item.id || `${item.first_name}-${item.last_name}`}
                    type="button"
                    onClick={() => {
                      soundManager.playClick();
                      onSelectApplication?.(item);
                    }}
                    className={`px-3 py-1.5 text-xs font-semibold border transition cursor-pointer ${
                      isSelected
                        ? 'bg-[var(--house-secondary)] border-[var(--house-accent)] text-[#FFF0B2]'
                        : 'bg-[#0d1422] border-white/10 text-[#b6bbc5] hover:border-[var(--house-border)] hover:text-white'
                    }`}
                  >
                    {item.first_name} {item.last_name}
                    {item.game_character_id ? ' ✓' : ''}
                  </button>
                );
              })}
            </div>
            {onCreateNewCharacter && (
              <button
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  onClose();
                  onCreateNewCharacter();
                }}
                className="px-3 py-1.5 text-xs font-semibold bg-[#0d1422] border border-[var(--house-border)] hover:border-[var(--house-accent)] text-[var(--house-accent)] inline-flex items-center gap-1.5 transition cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Novo Personagem</span>
              </button>
            )}
          </div>
        )}

        {/* Banner de Status Dinâmico */}
        {status === 'approved' && (
          <div className="mb-6 p-4 rounded-2xl bg-[#1A6B3C]/20 border border-[#1A6B3C]/50 flex items-start space-x-3 shadow-lg">
            <CheckCircle2 className="w-6 h-6 text-[#4CAF7C] flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-[#4CAF7C]">
                Pré-Registro Aprovado com Louvor!
              </h4>
              <p className="text-xs text-[#FFF0B2]/80 mt-1 leading-relaxed">
                Sua ficha foi validada nos arquivos de Hogwarts. Seu assento no Expresso está oficialmente garantido e seu passaporte para o Arcane MP foi emitido.
              </p>
            </div>
          </div>
        )}

        {status === 'pending' && (
          <div className="mb-6 p-4 rounded-2xl bg-[#FFC34F]/10 border border-[#FFC34F]/40 flex items-start space-x-3 shadow-lg">
            <Clock className="w-6 h-6 text-[#FFC34F] flex-shrink-0 mt-0.5 animate-pulse" />
            <div>
              <h4 className="text-sm font-bold text-[#FFC34F]">
                Ficha em Análise pelo Conselho de Magizoologia
              </h4>
              <p className="text-xs text-[#FFF0B2]/80 mt-1 leading-relaxed">
                Sua história foi lavrada no Livro da Admissão pela Pena da Aceitação e transmitida por canal oficial à banca examinadora de Hogwarts. A aprovação final confirmará sua vaga no 1º lote de pioneiros.
              </p>
            </div>
          </div>
        )}

        {status === 'rejected' && (
          <div className="mb-6 p-4 rounded-2xl bg-[#CF4A4A]/20 border border-[#CF4A4A]/50 flex items-start space-x-3 shadow-lg">
            <AlertTriangle className="w-6 h-6 text-[#CF4A4A] flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-[#CF4A4A]">
                Ficha Requer Ajustes ou Revisão
              </h4>
              <p className="text-xs text-[#FFF0B2]/80 mt-1 leading-relaxed">
                {application.reviewer_notes || 'Verifique se sua história atendeu integralmente aos padrões de Roleplay e consistência do mundo bruxo.'}
              </p>
            </div>
          </div>
        )}

        {(status === 'approved' || application.game_character_id) && (
          <div className="mb-6">
            <GameSyncCodeCard application={application} isOpen={isOpen} />
          </div>
        )}

        {/* Cartão de Identificação do Bruxo */}
        <div className="bg-[#0d1422]/90 border border-[var(--house-border)] p-4 sm:p-5 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-3">
            <div className="flex items-center space-x-3">
              {application.discord_avatar ? (
                <img
                  src={application.discord_avatar}
                  alt={application.discord_username}
                  className="w-12 h-12 rounded-xl border border-[#FFC34F]/40 object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-[#5B1009] flex items-center justify-center font-bold text-[#FFC34F] text-lg">
                  {application.first_name.charAt(0)}
                </div>
              )}
              <div>
                <span className="text-xs text-[#FFF0B2]/60">Jogador Discord</span>
                <p className="text-sm font-bold text-[#FFF0B2]">
                  {application.discord_username}
                </p>
                <span className="text-[10px] font-mono text-[#FFC34F]/80">
                  ID: {application.discord_id}
                </span>
              </div>
            </div>

            <div className="sm:text-right">
              <span className="text-xs text-[#FFF0B2]/60">Bilhete de Registro</span>
              <p className="font-mono text-lg font-extrabold text-gold-gradient">
                {registrationCode}
              </p>
            </div>
          </div>

          {/* Grid de Detalhes do Personagem */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 text-xs">
            <div>
              <span className="text-[#FFF0B2]/60 block mb-0.5">Personagem Convocado:</span>
              <span className="text-sm font-bold text-[#FFF0B2]">
                {application.first_name} {application.last_name}
              </span>
            </div>

            <div>
              <span className="text-[#FFF0B2]/60 block mb-0.5">
                {isSortedOfficial ? 'Casa Oficial (Chapéu Seletor):' : 'Casa Solicitada (Pré-Registro):'}
              </span>
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md font-bold text-white shadow-sm" style={{ backgroundColor: house.color }}>
                <img
                  src={house.emblemImg}
                  alt={house.name}
                  draggable={false}
                  className="w-4 h-4 object-contain select-none pointer-events-none"
                />
                <span>{house.name}</span>
              </span>
              {isSortedOfficial && (
                <span className="block text-[10px] text-[#7fd29a] mt-1">
                  {differsFromPreferred
                    ? `Confirmada in-game (Pré-seleção no portal: ${preferredHouseInfo.name})`
                    : 'Confirmada pelo Chapéu Seletor em Hogwarts'}
                  {application.is_hatstall ? ' · Hatstall' : ''}
                </span>
              )}
            </div>

            <div>
              <span className="text-[#FFF0B2]/60 block mb-0.5">Linhagem:</span>
              <span className="text-[#FFF0B2] font-medium">
                {bloodStatusMap[application.blood_status] || application.blood_status}
              </span>
            </div>

            <div>
              <span className="text-[#FFF0B2]/60 block mb-0.5">Nascimento & Local:</span>
              <span className="text-[#FFF0B2] font-medium flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                <Calendar className="w-3.5 h-3.5 text-[#FFC34F] shrink-0" />
                <span>{application.birth_date}</span>
                <span className="text-white/40">•</span>
                <MapPin className="w-3.5 h-3.5 text-[#FFC34F] shrink-0" />
                <span className="break-words">{application.birth_place}</span>
              </span>
            </div>

            <div className="sm:col-span-2 pt-2 border-t border-white/5 flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-[#FFF0B2]/60 block mb-1 flex items-center space-x-1">
                  <Wand2 className="w-3.5 h-3.5 text-[#FFC34F]" />
                  <span>Varinha Mágica Registrada:</span>
                </span>
                <p className="text-xs text-[#FFF0B2]/90 font-medium">
                  Madeira de <strong>{application.wand_wood}</strong>, com núcleo de <strong>{application.wand_core}</strong>, medindo <strong>{application.wand_length}</strong> e flexibilidade <strong>{application.wand_flexibility}</strong>.
                </p>
              </div>
              <div className="text-[11px] text-[#b6bbc5]">
                Dormitório: <strong className="text-[#FFF0B2]">{application.dormitory === 'witch' ? 'Bruxa' : 'Bruxo'}</strong>
                {application.game_character_id ? (
                  <span className="ml-2 text-[#7fd29a] font-mono">· In-Game #{application.game_character_id}</span>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        {/* Leitor da História de 3.000+ Palavras */}
        <div className="bg-[#090e17] border border-[var(--house-border)] p-4 sm:p-5 mb-5">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-[#FFC34F]" />
              <h4 className="text-xs sm:text-sm font-bold text-[#FFF0B2]">
                Crônica do Personagem
              </h4>
            </div>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#1A6B3C]/20 border border-[#1A6B3C]/40 text-[#4CAF7C] text-[11px] font-mono font-semibold">
              <Check className="w-3 h-3" />
              <span>{application.word_count.toLocaleString('pt-BR')} palavras validadas</span>
            </span>
          </div>

          <p className="text-xs text-[#FFF0B2]/70 leading-relaxed font-crimson line-clamp-3">
            {application.character_backstory.slice(0, 240)}...
          </p>

          <button
            onClick={() => setIsReadingStory(!isReadingStory)}
            className="mt-3 text-xs text-[#FFC34F] hover:text-[#FFF0B2] font-semibold underline flex items-center space-x-1"
          >
            <span>{isReadingStory ? 'Recolher crônica' : 'Expandir e ler história completa'}</span>
          </button>

          {isReadingStory && (
            <div className="mt-4 p-4 rounded-xl bg-[#210604] border border-[#B83A0C]/20 max-h-64 overflow-y-auto text-xs text-[#FFF0B2]/85 font-crimson leading-relaxed whitespace-pre-line">
              {application.character_backstory}
            </div>
          )}
        </div>

        {/* Ações Inferiores */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={onViewTicket}
              className="w-full sm:w-auto btn-primary btn-sm"
            >
              <Ticket />
              <span>Ver Bilhete</span>
            </button>

            <button
              onClick={async () => {
                setIsDownloadingPdf(true);
                soundManager.playSparkle();
                await generateAndDownloadCharacterPdf(application, (msg) => setPdfProgress(msg));
                setIsDownloadingPdf(false);
                setPdfProgress(null);
              }}
              disabled={isDownloadingPdf}
              className="w-full sm:w-auto btn-secondary btn-sm"
              title="Baixar a Ficha Oficial do Aluno em Pergaminho com Selo de Cera (PDF)"
            >
              <FileDown />
              <span>{isDownloadingPdf ? (pdfProgress || 'Gerando PDF...') : 'Baixar PDF'}</span>
            </button>
          </div>

          <a
            href={DISCORD_INVITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto btn-secondary btn-sm"
          >
            <span>Discord Oficial</span>
            <ExternalLink />
          </a>
        </div>
      </ArcaneFrame>
    </div>
  );
};
