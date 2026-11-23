import React, { useState, useEffect } from 'react';
import { 
  X, Shield, Users, CheckCircle2, Clock, AlertTriangle, 
  Search, RefreshCw, BookOpen, Check, Ban, Eye, Wand2
} from 'lucide-react';
import { CharacterApplication } from '../types';
import { getAllApplications, updateApplicationStatus, CountdownTimerData } from '../lib/supabase';
import { HOUSES } from '../lib/constants';
import { AppleTimerModal } from './AppleTimerModal';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTimerUpdated?: (newTimer: CountdownTimerData) => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  onTimerUpdated,
}) => {
  const [applications, setApplications] = useState<CharacterApplication[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHouse, setSelectedHouse] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedApp, setSelectedApp] = useState<CharacterApplication | null>(null);
  const [reviewerNotes, setReviewerNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isTimerModalOpen, setIsTimerModalOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadApplications();
    }
  }, [isOpen]);

  const loadApplications = async () => {
    setIsLoading(true);
    try {
      const data = await getAllApplications();
      setApplications(data);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (status: 'pending' | 'approved' | 'rejected') => {
    if (!selectedApp?.id) return;
    setIsUpdating(true);
    try {
      const updated = await updateApplicationStatus(
        selectedApp.id,
        status,
        reviewerNotes || selectedApp.reviewer_notes
      );
      if (updated) {
        setApplications((prev) =>
          prev.map((app) => (app.id === updated.id ? updated : app))
        );
        setSelectedApp(updated);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  if (!isOpen) return null;

  // Filtragem
  const filteredApps = applications.filter((app) => {
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      app.first_name.toLowerCase().includes(search) ||
      app.last_name.toLowerCase().includes(search) ||
      app.discord_username.toLowerCase().includes(search) ||
      app.discord_id.includes(search) ||
      String(app.registration_number).includes(search);

    const matchesHouse = selectedHouse === 'all' || app.preferred_house === selectedHouse;
    const matchesStatus = selectedStatus === 'all' || (app.status || 'pending') === selectedStatus;

    return matchesSearch && matchesHouse && matchesStatus;
  });

  // Métricas
  const totalCount = applications.length;
  const approvedCount = applications.filter((a) => a.status === 'approved').length;
  const pendingCount = applications.filter((a) => (a.status || 'pending') === 'pending').length;
  const rejectedCount = applications.filter((a) => a.status === 'rejected').length;
  const totalWords = applications.reduce((acc, curr) => acc + (curr.word_count || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/90 backdrop-blur-2xl transition-all duration-300 overflow-y-auto">
      <div className="relative w-full max-w-6xl bg-[#100303]/95 border border-[#B83A0C]/40 rounded-3xl p-4 sm:p-8 shadow-2xl backdrop-blur-2xl text-left my-auto max-h-[94vh] flex flex-col justify-between overflow-hidden">
        
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-white/10 gap-4 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FFC34F] via-[#F47A16] to-[#5B1009] p-0.5 shadow-lg shadow-[#F47A16]/20">
              <div className="w-full h-full rounded-[14px] bg-[#160504] flex items-center justify-center">
                <Shield className="w-6 h-6 text-[#FFC34F]" />
              </div>
            </div>
            <div>
              <span className="text-[10px] tracking-[0.25em] text-[#FFC34F] font-bold block uppercase">
                Painel Administrativo & Whitelist
              </span>
              <h2 className="font-cinzel text-xl sm:text-2xl font-bold text-[#FFF0B2]">
                Ministério da Magia — O Livro da Admissão
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Botão de Ajustar Timer Apple */}
            <button
              onClick={() => setIsTimerModalOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#FFC34F]/15 border border-[#FFC34F]/40 text-xs text-[#FFF0B2] hover:bg-[#FFC34F]/25 hover:text-white transition cursor-pointer"
              title="Ajustar o cronômetro oficial do pré-registro (Roleta Apple)"
            >
              <Clock className="w-3.5 h-3.5 text-[#FFC34F]" />
              <span className="hidden sm:inline">Ajustar Cronômetro</span>
            </button>

            <button
              onClick={loadApplications}
              disabled={isLoading}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#210604] border border-[#B83A0C]/40 text-xs text-[#FFF0B2] hover:bg-[#5B1009] transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Consultar Livro</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/5 text-[#FFF0B2]/60 hover:text-[#FFF0B2] transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Barra de KPIs / Métricas Rápidas */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 my-5 flex-shrink-0">
          <div className="bg-[#160504] border border-[#B83A0C]/20 p-3 rounded-2xl">
            <div className="flex items-center justify-between text-xs text-[#FFF0B2]/60 mb-1">
              <span>Total Inscritos</span>
              <Users className="w-3.5 h-3.5 text-[#FFC34F]" />
            </div>
            <span className="font-mono text-xl font-bold text-[#FFF0B2]">{totalCount}</span>
          </div>

          <div className="bg-[#160504] border border-[#1A6B3C]/30 p-3 rounded-2xl">
            <div className="flex items-center justify-between text-xs text-[#4CAF7C] mb-1">
              <span>Aprovados</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-[#4CAF7C]" />
            </div>
            <span className="font-mono text-xl font-bold text-[#4CAF7C]">{approvedCount}</span>
          </div>

          <div className="bg-[#160504] border border-[#FFC34F]/30 p-3 rounded-2xl">
            <div className="flex items-center justify-between text-xs text-[#FFC34F] mb-1">
              <span>Pendentes</span>
              <Clock className="w-3.5 h-3.5 text-[#FFC34F]" />
            </div>
            <span className="font-mono text-xl font-bold text-[#FFC34F]">{pendingCount}</span>
          </div>

          <div className="bg-[#160504] border border-[#CF4A4A]/30 p-3 rounded-2xl">
            <div className="flex items-center justify-between text-xs text-[#CF4A4A] mb-1">
              <span>Rejeitados</span>
              <AlertTriangle className="w-3.5 h-3.5 text-[#CF4A4A]" />
            </div>
            <span className="font-mono text-xl font-bold text-[#CF4A4A]">{rejectedCount}</span>
          </div>

          <div className="col-span-2 sm:col-span-1 bg-[#160504] border border-[#B83A0C]/20 p-3 rounded-2xl">
            <div className="flex items-center justify-between text-xs text-[#FFF0B2]/60 mb-1">
              <span>Palavras Totais</span>
              <BookOpen className="w-3.5 h-3.5 text-[#FFC34F]" />
            </div>
            <span className="font-mono text-base sm:text-lg font-bold text-gold-gradient truncate block">
              {totalWords.toLocaleString('pt-BR')}
            </span>
          </div>
        </div>

        {/* Barra de Filtros e Busca */}
        <div className="flex flex-col sm:flex-row gap-2.5 mb-4 flex-shrink-0">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#FFF0B2]/40 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por Personagem, Discord ou Bilhete..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#160504] border border-[#B83A0C]/30 rounded-xl pl-9 pr-3 py-2 text-xs text-[#FFF0B2] placeholder-[#FFF0B2]/30 focus:border-[#FFC34F] outline-none"
            />
          </div>

          <select
            value={selectedHouse}
            onChange={(e) => setSelectedHouse(e.target.value)}
            className="bg-[#160504] border border-[#B83A0C]/30 rounded-xl px-3 py-2 text-xs text-[#FFF0B2] outline-none"
          >
            <option value="all">Todas as Casas</option>
            <option value="gryffindor">Grifinória</option>
            <option value="slytherin">Sonserina</option>
            <option value="ravenclaw">Corvinal</option>
            <option value="hufflepuff">Lufa-Lufa</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-[#160504] border border-[#B83A0C]/30 rounded-xl px-3 py-2 text-xs text-[#FFF0B2] outline-none"
          >
            <option value="all">Todos os Status</option>
            <option value="pending">⏳ Pendente</option>
            <option value="approved">✅ Aprovado</option>
            <option value="rejected">❌ Rejeitado</option>
          </select>
        </div>

        {/* Tabela de Candidaturas */}
        <div className="flex-1 overflow-y-auto border border-[#B83A0C]/20 rounded-2xl bg-[#160504]/60">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 bg-[#210604] border-b border-[#B83A0C]/30 text-[#FFC34F] font-semibold">
              <tr>
                <th className="py-3 px-3">Bilhete</th>
                <th className="py-3 px-3">Bruxo (Discord)</th>
                <th className="py-3 px-3">Personagem</th>
                <th className="py-3 px-3">Casa</th>
                <th className="py-3 px-3">Varinha</th>
                <th className="py-3 px-3">Palavras</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-[#FFF0B2]">
              {filteredApps.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[#FFF0B2]/40">
                    Nenhuma inscrição encontrada no Livro da Admissão para os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredApps.map((app) => {
                  const house = HOUSES[app.preferred_house] || HOUSES.gryffindor;
                  const regCode = `#ACCIO-${String(app.registration_number || 1).padStart(4, '0')}`;
                  const appStatus = app.status || 'pending';

                  return (
                    <tr key={app.id || app.discord_id} className="hover:bg-white/[0.02] transition">
                      <td className="py-3 px-3 font-mono font-bold text-gold-gradient">
                        {regCode}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center space-x-2">
                          {app.discord_avatar ? (
                            <img src={app.discord_avatar} alt="" className="w-6 h-6 rounded-full border border-white/10" />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-[#5B1009] flex items-center justify-center font-bold text-[10px]">
                              {app.first_name.charAt(0)}
                            </div>
                          )}
                          <div className="truncate max-w-[120px]">
                            <span className="block font-medium truncate">{app.discord_username}</span>
                            <span className="block text-[10px] text-white/40 font-mono truncate">{app.discord_id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-medium">
                        {app.first_name} {app.last_name}
                      </td>
                      <td className="py-3 px-3">
                        <span 
                          className="px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-sm inline-block"
                          style={{ backgroundColor: house.color }}
                        >
                          {house.name}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-[11px] text-[#FFF0B2]/70 truncate max-w-[140px]">
                        {app.wand_wood} • {app.wand_core}
                      </td>
                      <td className="py-3 px-3 font-mono font-semibold text-[#4CAF7C]">
                        {app.word_count.toLocaleString('pt-BR')}
                      </td>
                      <td className="py-3 px-3">
                        {appStatus === 'approved' && (
                          <span className="px-2 py-0.5 rounded-full bg-[#1A6B3C]/20 border border-[#1A6B3C]/40 text-[#4CAF7C] font-semibold text-[10px]">
                            Aprovado
                          </span>
                        )}
                        {appStatus === 'pending' && (
                          <span className="px-2 py-0.5 rounded-full bg-[#FFC34F]/20 border border-[#FFC34F]/40 text-[#FFC34F] font-semibold text-[10px]">
                            Pendente
                          </span>
                        )}
                        {appStatus === 'rejected' && (
                          <span className="px-2 py-0.5 rounded-full bg-[#CF4A4A]/20 border border-[#CF4A4A]/40 text-[#CF4A4A] font-semibold text-[10px]">
                            Rejeitado
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => {
                            setSelectedApp(app);
                            setReviewerNotes(app.reviewer_notes || '');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-[#5B1009]/60 hover:bg-[#5B1009] border border-[#B83A0C]/40 text-[#FFF0B2] text-[11px] font-semibold transition inline-flex items-center space-x-1"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Julgar</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Modal Detalhado de Julgamento / Leitura da História */}
        {selectedApp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md">
            <div className="relative w-full max-w-3xl bg-[#160504] border border-[#B83A0C]/50 rounded-3xl p-5 sm:p-7 shadow-2xl max-h-[90vh] overflow-y-auto text-left">
              <button
                onClick={() => setSelectedApp(null)}
                className="absolute top-4 right-4 text-[#FFF0B2]/60 hover:text-[#FFF0B2] p-1.5 rounded-full hover:bg-white/5 transition"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center space-x-3 mb-4">
                <span className="font-mono text-lg font-bold text-gold-gradient">
                  #ACCIO-{String(selectedApp.registration_number || 1).padStart(4, '0')}
                </span>
                <span className="text-[#FFF0B2]/40">•</span>
                <h3 className="text-base font-bold text-[#FFF0B2]">
                  {selectedApp.first_name} {selectedApp.last_name}
                </h3>
              </div>

              {/* Informações Resumidas */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-2xl bg-[#210604] border border-white/5 mb-4 text-xs">
                <div>
                  <span className="text-[#FFF0B2]/60 block text-[10px]">Jogador Discord</span>
                  <span className="font-semibold text-white">{selectedApp.discord_username}</span>
                </div>
                <div>
                  <span className="text-[#FFF0B2]/60 block text-[10px]">Casa</span>
                  <span className="font-semibold text-[#FFC34F]">{HOUSES[selectedApp.preferred_house]?.name}</span>
                </div>
                <div>
                  <span className="text-[#FFF0B2]/60 block text-[10px]">Palavras</span>
                  <span className="font-mono font-bold text-[#4CAF7C]">{selectedApp.word_count.toLocaleString('pt-BR')}</span>
                </div>
                <div>
                  <span className="text-[#FFF0B2]/60 block text-[10px]">Nascimento</span>
                  <span className="font-medium text-white">{selectedApp.birth_date}</span>
                </div>
              </div>

              {/* Detalhes da Varinha */}
              <div className="flex items-center space-x-2 text-xs text-[#FFF0B2]/80 bg-[#100303] p-2.5 rounded-xl border border-white/5 mb-4">
                <Wand2 className="w-4 h-4 text-[#FFC34F] flex-shrink-0" />
                <span>
                  <strong>Varinha:</strong> {selectedApp.wand_wood}, {selectedApp.wand_core}, {selectedApp.wand_length}, flexibilidade {selectedApp.wand_flexibility}.
                </span>
              </div>

              {/* Texto Completo da História de 3.000+ Palavras */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs font-bold text-[#FFC34F] flex items-center space-x-1">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Crônica Completa ({selectedApp.word_count} palavras):</span>
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-[#100303] border border-[#B83A0C]/20 max-h-72 overflow-y-auto text-xs text-[#FFF0B2]/90 font-crimson leading-relaxed whitespace-pre-line select-text">
                  {selectedApp.character_backstory}
                </div>
              </div>

              {/* Notas do Revisor */}
              <div className="mb-5">
                <label className="text-xs font-semibold text-[#FFF0B2]/70 block mb-1">
                  Anotações da Moderação / Motivo de Revisão:
                </label>
                <textarea
                  rows={2}
                  value={reviewerNotes}
                  onChange={(e) => setReviewerNotes(e.target.value)}
                  placeholder="Ex: História excelente e bem fundamentada, aprovado para o 1º lote..."
                  className="w-full bg-[#100303] border border-[#B83A0C]/30 rounded-xl p-2.5 text-xs text-[#FFF0B2] placeholder-[#FFF0B2]/30 focus:border-[#FFC34F] outline-none"
                />
              </div>

              {/* Ações de Moderação */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10">
                <span className="text-xs text-[#FFF0B2]/60">
                  Status Atual: <strong className="text-[#FFC34F] uppercase">{selectedApp.status || 'pending'}</strong>
                </span>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleUpdateStatus('rejected')}
                    disabled={isUpdating}
                    className="px-3.5 py-2 rounded-xl bg-[#CF4A4A]/20 hover:bg-[#CF4A4A]/40 border border-[#CF4A4A]/50 text-[#CF4A4A] text-xs font-bold flex items-center space-x-1 transition disabled:opacity-50"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    <span>Rejeitar</span>
                  </button>

                  <button
                    onClick={() => handleUpdateStatus('pending')}
                    disabled={isUpdating}
                    className="px-3.5 py-2 rounded-xl bg-[#FFC34F]/20 hover:bg-[#FFC34F]/30 border border-[#FFC34F]/50 text-[#FFC34F] text-xs font-bold flex items-center space-x-1 transition disabled:opacity-50"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Manter Pendente</span>
                  </button>

                  <button
                    onClick={() => handleUpdateStatus('approved')}
                    disabled={isUpdating}
                    className="px-4 py-2 rounded-xl bg-[#1A6B3C] hover:bg-[#1A6B3C]/80 text-white text-xs font-bold flex items-center space-x-1 transition shadow-lg shadow-[#1A6B3C]/30 disabled:opacity-50"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Aprovar Ficha</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Ajuste de Cronômetro Estilo Roleta Apple */}
        <AppleTimerModal
          isOpen={isTimerModalOpen}
          onClose={() => setIsTimerModalOpen(false)}
          onTimerSaved={(newTimer) => {
            if (onTimerUpdated) onTimerUpdated(newTimer);
          }}
        />
      </div>
    </div>
  );
};

