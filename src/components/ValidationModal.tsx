import React, { useState } from 'react';
import { X, CheckCircle2, Clock, AlertTriangle, ExternalLink, Ticket, BookOpen, Wand2, Shield, Calendar, MapPin } from 'lucide-react';
import { CharacterApplication } from '../types';
import { HOUSES } from '../lib/constants';

interface ValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: CharacterApplication | null;
  onViewTicket: () => void;
}

export const ValidationModal: React.FC<ValidationModalProps> = ({
  isOpen,
  onClose,
  application,
  onViewTicket,
}) => {
  const [isReadingStory, setIsReadingStory] = useState(false);

  if (!isOpen || !application) return null;

  const house = HOUSES[application.preferred_house] || HOUSES.gryffindor;
  const registrationCode = `#ACCIO-${String(application.registration_number || 1).padStart(4, '0')}`;
  const status = application.status || 'pending';

  const bloodStatusMap: Record<string, string> = {
    'pure-blood': 'Sangue Puro',
    'half-blood': 'Mestiço',
    'muggle-born': 'Nascido Trouxa',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl transition-all duration-300 overflow-y-auto">

      {/* Luz ambiente de feitiço */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[650px] h-[350px] sm:h-[650px] rounded-full blur-[120px] pointer-events-none opacity-30"
        style={{ backgroundColor: house.color }}
      />

      <div className="relative w-full max-w-2xl bg-[#160504]/95 border border-[#B83A0C]/40 rounded-3xl p-5 sm:p-8 shadow-2xl backdrop-blur-2xl text-left my-auto max-h-[92vh] overflow-y-auto">

        {/* Botão de Fechar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 text-[#FFF0B2]/60 hover:text-[#FFF0B2] p-1.5 rounded-full hover:bg-white/5 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Cabeçalho de Validação */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FFC34F] via-[#F47A16] to-[#5B1009] p-0.5 shadow-lg shadow-[#F47A16]/20">
            <div className="w-full h-full rounded-[14px] bg-[#160504] flex items-center justify-center">
              <Shield className="w-6 h-6 text-[#FFC34F]" />
            </div>
          </div>
          <div>
            <span className="text-[10px] tracking-[0.25em] text-[#FFC34F] font-bold block uppercase">
              Ministério da Magia • ACCIO RP
            </span>
            <h2 className="font-cinzel text-xl sm:text-2xl font-bold text-[#FFF0B2]">
              Validação de Pré-Registro
            </h2>
          </div>
        </div>

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

        {/* Cartão de Identificação do Bruxo */}
        <div className="bg-[#210604]/80 border border-[#B83A0C]/30 rounded-2xl p-4 sm:p-5 mb-6">
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
              <span className="text-xs text-[#FFF0B2]/60">Número do Bilhete</span>
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
              <span className="text-[#FFF0B2]/60 block mb-0.5">Casa Designada:</span>
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-md font-bold text-white shadow-sm" style={{ backgroundColor: house.color }}>
                <span>{house.name}</span>
              </span>
            </div>

            <div>
              <span className="text-[#FFF0B2]/60 block mb-0.5">Linhagem:</span>
              <span className="text-[#FFF0B2] font-medium">
                {bloodStatusMap[application.blood_status] || application.blood_status}
              </span>
            </div>

            <div>
              <span className="text-[#FFF0B2]/60 block mb-0.5">Nascimento & Local:</span>
              <span className="text-[#FFF0B2] font-medium flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-[#FFC34F]" />
                <span>{application.birth_date}</span>
                <span className="text-white/40">•</span>
                <MapPin className="w-3.5 h-3.5 text-[#FFC34F]" />
                <span>{application.birth_place}</span>
              </span>
            </div>

            <div className="sm:col-span-2 pt-2 border-t border-white/5">
              <span className="text-[#FFF0B2]/60 block mb-1 flex items-center space-x-1">
                <Wand2 className="w-3.5 h-3.5 text-[#FFC34F]" />
                <span>Varinha Mágica Registrada:</span>
              </span>
              <p className="text-xs text-[#FFF0B2]/90 font-medium">
                Madeira de <strong>{application.wand_wood}</strong>, com núcleo de <strong>{application.wand_core}</strong>, medindo <strong>{application.wand_length}</strong> e flexibilidade <strong>{application.wand_flexibility}</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Leitor da História de 3.000+ Palavras */}
        <div className="bg-[#100303]/90 border border-[#B83A0C]/30 rounded-2xl p-4 sm:p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-[#FFC34F]" />
              <h4 className="text-xs sm:text-sm font-bold text-[#FFF0B2]">
                Crônica do Personagem
              </h4>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-[#1A6B3C]/20 border border-[#1A6B3C]/40 text-[#4CAF7C] text-[11px] font-mono font-semibold">
              ✓ {application.word_count.toLocaleString('pt-BR')} palavras validadas
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
          <button
            onClick={onViewTicket}
            className="w-full sm:w-auto btn-accio-gold px-5 py-2.5 rounded-xl text-xs sm:text-sm flex items-center justify-center space-x-2 font-bold cursor-pointer"
          >
            <Ticket className="w-4 h-4" />
            <span>Ver Bilhete do Expresso</span>
          </button>

          <a
            href="https://discord.gg"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white text-xs sm:text-sm font-semibold flex items-center justify-center space-x-2 transition"
          >
            <span>Comunidade Discord</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};
