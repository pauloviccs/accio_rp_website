import React, { useState, useEffect } from 'react';
import { CheckCircle2, Ticket, ShieldCheck, ArrowRight, X, Clock, Wand2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { CharacterApplication } from '../types';
import { HOUSES } from '../lib/constants';

interface EnchantedSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: CharacterApplication | null;
  onOpenValidation: () => void;
  onViewTicket: () => void;
}

export const EnchantedSubmissionModal: React.FC<EnchantedSubmissionModalProps> = ({
  isOpen,
  onClose,
  application,
  onOpenValidation,
  onViewTicket,
}) => {
  // Estágios da animação mágica:
  // 1. 'sealing' (carta dobrando e sendo selada com cera quente)
  // 2. 'flying' (carta levitando e voando com feitiço rumo a Hogwarts)
  // 3. 'confirmed' (mensagem ministerial de recebimento no banco de dados e dados do aluno)
  const [stage, setStage] = useState<'sealing' | 'flying' | 'confirmed'>('sealing');

  useEffect(() => {
    if (!isOpen) {
      setStage('sealing');
      return;
    }

    // Iniciar sequência mágica
    setStage('sealing');

    // 1. Efeito de selagem com cera aos 1.2s
    const timer1 = setTimeout(() => {
      // Disparo de faíscas douradas e brasas de lacre
      confetti({
        particleCount: 50,
        spread: 55,
        origin: { y: 0.55 },
        colors: ['#FFF0B2', '#FFC34F', '#F47A16', '#5B1009'],
      });
      setStage('flying');
    }, 1400);

    // 2. Transição para confirmação ministerial aos 3.2s
    const timer2 = setTimeout(() => {
      // Grande celebração estelar
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#FFC34F', '#F47A16', '#FFF0B2', '#4CAF7C'],
      });
      setStage('confirmed');
    }, 3200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [isOpen]);

  if (!isOpen || !application) return null;

  const house = HOUSES[application.preferred_house] || HOUSES.gryffindor;
  const registrationCode = `#ACCIO-${String(application.registration_number || 1).padStart(4, '0')}`;

  const bloodStatusMap: Record<string, string> = {
    'pure-blood': 'Sangue Puro',
    'half-blood': 'Mestiço',
    'muggle-born': 'Nascido Trouxa',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-2xl transition-all duration-500 overflow-y-auto">
      
      {/* Luz ambiente de feitiço */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[650px] h-[350px] sm:h-[650px] rounded-full blur-[120px] pointer-events-none opacity-40 transition-all duration-1000"
        style={{ backgroundColor: stage === 'confirmed' ? house.color : '#F47A16' }}
      />

      {/* Botão de Fechar / Pular */}
      <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-50">
        <button
          onClick={onClose}
          className="px-3.5 py-1.5 rounded-full bg-[#210604]/80 hover:bg-[#5B1009] border border-[#B83A0C]/40 text-[#FFF0B2]/70 hover:text-[#FFF0B2] text-xs font-semibold transition flex items-center space-x-1"
        >
          <span>{stage === 'confirmed' ? 'Fechar' : 'Pular Animação'}</span>
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="relative w-full max-w-xl my-auto text-center">
        
        {/* ESTÁGIOS 1 & 2: ANIMAÇÃO DA CARTA SENDO SELADA E ENVIADA */}
        {(stage === 'sealing' || stage === 'flying') && (
          <div className="flex flex-col items-center justify-center py-12 space-y-6">
            
            {/* O Envelope Mágico 3D */}
            <div 
              className={`relative w-80 sm:w-96 h-56 bg-[#EADBCE] border-2 border-[#8C6D58] rounded-2xl shadow-2xl transition-all duration-1000 flex items-center justify-center overflow-hidden ${
                stage === 'flying' 
                  ? '-translate-y-16 scale-90 rotate-2 opacity-90 shadow-[0_25px_60px_rgba(255,195,79,0.4)]' 
                  : 'translate-y-0 scale-100'
              }`}
            >
              {/* Aba Superior do Envelope (Dobra se fechando) */}
              <div 
                className={`absolute top-0 left-0 right-0 h-28 bg-[#DFCBB8] border-b-2 border-[#8C6D58] origin-top transition-transform duration-700 ease-in-out ${
                  stage === 'sealing' ? 'rotate-x-0' : 'rotate-x-0'
                }`}
                style={{
                  clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
                  boxShadow: 'inset 0 4px 12px rgba(0,0,0,0.15)',
                }}
              />

              {/* Rastro Mágico / Selo de Cera sendo carimbado */}
              <div className="relative z-10 flex flex-col items-center">
                <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-[#7A1D13] via-[#5B1009] to-[#2B0804] border-2 border-[#FFC34F]/70 shadow-[0_6px_20px_rgba(91,16,9,0.9)] flex items-center justify-center animate-pulse">
                  <span className="font-cinzel text-2xl font-black text-gold-gradient">
                    A
                  </span>
                </div>
                
                {/* Rastro de fumaça de cera */}
                <span className="text-[11px] font-mono tracking-widest text-[#6B4E3D] mt-2 uppercase">
                  {stage === 'sealing' ? '✦ Selando com Cera de Hogwarts ✦' : '✦ Partindo rumo às Terras Altas ✦'}
                </span>
              </div>

              {/* Marca D'Água / Selo Postal */}
              <div className="absolute bottom-3 left-4 text-[9px] font-mono text-[#8C6D58] uppercase tracking-widest">
                <span>HOGWARTS OWL POST · ANO 2000</span>
              </div>
            </div>

            {/* Texto de Status da Transição */}
            <div className="space-y-2">
              <h3 className="font-cinzel text-xl sm:text-2xl font-bold text-[#FFF0B2]">
                {stage === 'sealing' ? 'Selando Carta de Candidatura...' : 'Despachando Coruja para Hogwarts...'}
              </h3>
              <p className="text-xs sm:text-sm text-[#FFF0B2]/70 font-crimson italic">
                {stage === 'sealing' 
                  ? 'Consignando o selo ministerial em cera carmesim e encantando o pergaminho.' 
                  : 'A coruja alça voo sob o céu estrelado em direção ao Castelo.'}
              </p>
            </div>
          </div>
        )}

        {/* ESTÁGIO 3: CONFIRMAÇÃO DE RECEBIMENTO NO BACK-END (SUPABASE) */}
        {stage === 'confirmed' && (
          <div className="bg-[#160504]/95 border border-[#B83A0C]/40 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-2xl text-left animate-apple-modal">
            
            {/* Ícone de Sucesso Mágico */}
            <div className="text-center pb-5 border-b border-white/10">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FFC34F] via-[#F47A16] to-[#5B1009] p-0.5 mx-auto mb-4 shadow-xl shadow-[#F47A16]/20">
                <div className="w-full h-full rounded-[14px] bg-[#160504] flex items-center justify-center">
                  <CheckCircle2 className="w-9 h-9 text-[#4CAF7C]" />
                </div>
              </div>

              <span className="text-[10px] tracking-[0.3em] text-[#FFC34F] font-bold uppercase block mb-1">
                Gabinete de Matrículas de Hogwarts
              </span>
              <h2 className="font-cinzel text-2xl sm:text-3xl font-extrabold text-[#FFF0B2] leading-tight mb-2">
                Submissão enviada à Escola, aguarde retorno.
              </h2>
              <p className="font-crimson text-sm sm:text-base text-[#FFF0B2]/80 max-w-md mx-auto leading-relaxed">
                Sua crônica e antecedentes foram arquivados com sucesso no banco de dados ministerial. O Conselho de Magizoologia iniciará a análise formal de sua admissão.
              </p>
            </div>

            {/* Comprovante do Aluno / Recibo Oficial do Supabase */}
            <div className="my-5 p-4 sm:p-5 rounded-2xl bg-[#210604]/90 border border-[#B83A0C]/30 space-y-3.5">
              
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div>
                  <span className="text-[10px] text-[#FFF0B2]/50 uppercase tracking-wider block">
                    Protocolo Ministerial
                  </span>
                  <span className="font-mono text-lg font-extrabold text-gold-gradient">
                    {registrationCode}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-[#FFF0B2]/50 uppercase tracking-wider block">
                    Casa Solicitada
                  </span>
                  <span 
                    className="inline-block px-2.5 py-0.5 rounded text-xs font-bold text-white shadow-sm"
                    style={{ backgroundColor: house.color }}
                  >
                    {house.name}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[#FFF0B2]/50 block text-[11px]">Bruxo Convocado:</span>
                  <span className="text-sm font-bold text-[#FFF0B2]">
                    {application.first_name} {application.last_name}
                  </span>
                </div>

                <div>
                  <span className="text-[#FFF0B2]/50 block text-[11px]">Linhagem Mágica:</span>
                  <span className="text-sm font-medium text-[#FFF0B2]">
                    {bloodStatusMap[application.blood_status] || application.blood_status}
                  </span>
                </div>

                <div className="sm:col-span-2 pt-2 border-t border-white/5">
                  <span className="text-[#FFF0B2]/50 block text-[11px] flex items-center space-x-1 mb-0.5">
                    <Wand2 className="w-3.5 h-3.5 text-[#FFC34F]" />
                    <span>Varinha Registrada:</span>
                  </span>
                  <span className="text-xs text-[#FFF0B2]/90">
                    {application.wand_wood}, {application.wand_core}, {application.wand_length}, {application.wand_flexibility}.
                  </span>
                </div>

                <div className="sm:col-span-2 flex items-center justify-between pt-2 border-t border-white/5 text-[11px]">
                  <span className="text-[#4CAF7C] font-mono font-semibold">
                    ✓ {application.word_count.toLocaleString('pt-BR')} palavras registradas no Supabase
                  </span>
                  <span className="text-[#FFC34F] flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>Status: Em Análise</span>
                  </span>
                </div>
              </div>

            </div>

            {/* Ações Finais */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <button
                onClick={() => {
                  onClose();
                  onOpenValidation();
                }}
                className="w-full sm:w-auto btn-accio-gold px-5 py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center space-x-2 shadow-lg shadow-[#F47A16]/20 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-[#160504]" />
                <span>Ver Dossiê de Validação</span>
                <ArrowRight className="w-4 h-4 text-[#160504]" />
              </button>

              <button
                onClick={() => {
                  onClose();
                  onViewTicket();
                }}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#210604] hover:bg-[#5B1009] border border-[#FFC34F]/40 text-[#FFF0B2] text-xs sm:text-sm font-semibold flex items-center justify-center space-x-2 transition cursor-pointer"
              >
                <Ticket className="w-4 h-4 text-[#FFC34F]" />
                <span>Visualizar Bilhete do Expresso</span>
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
