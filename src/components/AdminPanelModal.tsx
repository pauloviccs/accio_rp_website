import React, { useState, useEffect } from 'react';
import { 
  X, Shield, Clock, 
  Search, RefreshCw, BookOpen, Check, Ban, UserCheck, Lock, FileDown,
  Crown, Scale, Wand2, User
} from 'lucide-react';
import { CharacterApplication, UserRole, UserRoleRecord } from '../types';
import { 
  getAllApplications, 
  updateApplicationStatus, 
  getAllUserRoles, 
  updateUserRole,
  subscribeToAllApplications
} from '../lib/supabase';
import { resolveEffectiveHouse } from '../lib/houseResolution';
import { formatTicketNumber } from '../lib/ticketFormat';
import { soundManager, musicPlayer } from '../lib/audio';
import { generateAndDownloadCharacterPdf } from '../lib/pdfGenerator';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserRole?: string | null;
  onOpenTimerModal: () => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  currentUserRole = 'super_admin',
  onOpenTimerModal,
}) => {
  const [activeTab, setActiveTab] = useState<'applications' | 'roles'>('applications');
  
  // Estado de Inscrições
  const [applications, setApplications] = useState<CharacterApplication[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHouse, setSelectedHouse] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedApp, setSelectedApp] = useState<CharacterApplication | null>(null);
  const [reviewerNotes, setReviewerNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Estado de Cargos
  const [rolesList, setRolesList] = useState<UserRoleRecord[]>([]);
  const [roleSearchTerm, setRoleSearchTerm] = useState('');
  const [roleUpdatingId, setRoleUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    musicPlayer.setContextTheme('dungeon');
    loadApplications();
    loadRoles();
    const unsub = subscribeToAllApplications(() => {
      void loadApplications();
    });
    return () => {
      unsub();
    };
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

  const loadRoles = async () => {
    try {
      const roles = await getAllUserRoles();
      setRolesList(roles);
    } catch (err) {
      console.warn('Erro ao carregar lista de cargos:', err);
    }
  };

  const handleUpdateStatus = async (status: 'pending' | 'approved' | 'rejected') => {
    if (!selectedApp?.id) return;
    setIsUpdating(true);
    try {
      soundManager.playClick();
      const updated = await updateApplicationStatus(
        selectedApp.id,
        status,
        reviewerNotes,
        'Gabinete Ministerial'
      );
      if (updated) {
        soundManager.playSparkle();
        setApplications((prev) =>
          prev.map((app) => (app.id === updated.id ? updated : app))
        );
        setSelectedApp(null);
        setReviewerNotes('');
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRoleChange = async (discordId: string, newRole: UserRole) => {
    setRoleUpdatingId(discordId);
    soundManager.playClick();
    try {
      const ok = await updateUserRole(discordId, newRole, 'Administrador Ministerial');
      if (ok) {
        soundManager.playSparkle();
        setRolesList((prev) =>
          prev.map((r) => (r.discord_id === discordId ? { ...r, role: newRole } : r))
        );
      }
    } finally {
      setRoleUpdatingId(null);
    }
  };

  if (!isOpen) return null;

  // Verificação de Acesso: Apenas admin, super_admin ou mod
  const hasAccess = ['super_admin', 'admin', 'mod'].includes(currentUserRole || '');

  if (!hasAccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-start justify-center p-2.5 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
        <div className="w-full max-w-md my-auto max-h-[92dvh] overflow-y-auto custom-scrollbar bg-[#160504] border border-[#CF4A4A]/50 rounded-3xl p-5 sm:p-6 text-center space-y-4 shadow-2xl animate-apple-modal">
          <div className="w-12 h-12 rounded-2xl bg-[#CF4A4A]/20 border border-[#CF4A4A]/40 flex items-center justify-center mx-auto text-[#CF4A4A]">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="font-cinzel text-xl font-bold text-[#FFF0B2]">
            Acesso Restrito ao Gabinete
          </h3>
          <p className="text-xs text-[#FFF0B2]/70 leading-relaxed">
            Seu cargo atual no Mundo Bruxo ({currentUserRole || 'visitante'}) não possui outorga ministerial para visualizar o Livro da Admissão. Contate a Diretoria de Hogwarts para solicitar autorização.
          </p>
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-[#5B1009] text-xs font-bold text-[#FFF0B2] hover:bg-[#8B1A0E] transition"
          >
            Retornar ao Salão Principal
          </button>
        </div>
      </div>
    );
  }

  // Filtros de Inscrições
  const filteredApps = applications.filter((app) => {
    const ticketLabel = formatTicketNumber(app);
    const matchesSearch =
      `${app.first_name} ${app.last_name} ${app.discord_username} ${ticketLabel}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesHouse = selectedHouse === 'all' || resolveEffectiveHouse(app).houseKey === selectedHouse;
    const matchesStatus = selectedStatus === 'all' || app.status === selectedStatus;
    return matchesSearch && matchesHouse && matchesStatus;
  });

  const totalCount = applications.length;
  const approvedCount = applications.filter((a) => a.status === 'approved').length;
  const pendingCount = applications.filter((a) => a.status === 'pending' || !a.status).length;
  const rejectedCount = applications.filter((a) => a.status === 'rejected').length;
  const totalWords = applications.reduce((acc, a) => acc + (a.word_count || 0), 0);

  // Filtro de Cargos
  const filteredRoles = rolesList.filter((r) =>
    `${r.discord_username} ${r.discord_id} ${r.role}`
      .toLowerCase()
      .includes(roleSearchTerm.toLowerCase())
  );

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'super_admin':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#A855F7]/20 border border-[#A855F7]/40 text-[#D8B4FE]"><Crown className="w-3 h-3" /><span>Super Admin</span></span>;
      case 'admin':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FFC34F]/20 border border-[#FFC34F]/40 text-[#FFC34F]"><Shield className="w-3 h-3" /><span>Admin</span></span>;
      case 'mod':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#3B82F6]/20 border border-[#3B82F6]/40 text-[#93C5FD]"><Scale className="w-3 h-3" /><span>Moderador</span></span>;
      case 'student':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#10B981]/20 border border-[#10B981]/40 text-[#6EE7B7]"><Wand2 className="w-3 h-3" /><span>Aluno</span></span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/10 border border-white/20 text-[#FFF0B2]/70"><User className="w-3 h-3" /><span>Usuário</span></span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-2 sm:p-4 bg-[#05080f]/85 backdrop-blur-md overflow-y-auto">
      <div className="w-full sm:max-w-6xl my-auto max-h-[92dvh] bg-[#0a0f19] border border-[var(--house-border)] shadow-2xl flex flex-col overflow-hidden animate-apple-modal">
        
        {/* Topo do Painel */}
        <div className="px-4 sm:px-6 py-4 border-b border-[var(--hair-soft)] flex flex-wrap items-center justify-between gap-3 bg-[#090e17]">
          
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 bg-[#0d1422] border border-[var(--house-border)] flex items-center justify-center shadow-lg">
              <Shield className="w-5 h-5 text-[var(--house-accent)]" />
            </div>
            <div>
              <span className="eyebrow text-[10px] block">
                Gabinete de Governança · {currentUserRole?.toUpperCase()}
              </span>
              <h2 className="font-display text-lg sm:text-2xl text-[#ece7da]">
                Ministério da Magia — O Livro da Admissão
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Botão de Ajustar Timer Apple (Aciona o modal na raiz) */}
            <button
              onClick={() => {
                soundManager.playClick();
                onOpenTimerModal();
              }}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#0d1422] border border-[var(--house-border)] text-xs text-[var(--house-accent)] hover:border-[var(--house-accent)] hover:text-white transition cursor-pointer"
              title="Ajustar o cronômetro oficial do pré-registro (Roleta Apple)"
            >
              <Clock className="w-3.5 h-3.5 text-[var(--house-accent)]" />
              <span className="hidden sm:inline">Ajustar Cronômetro</span>
            </button>

            <button
              onClick={() => {
                soundManager.playClick();
                loadApplications();
                loadRoles();
              }}
              disabled={isLoading}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#0d1422] border border-[var(--house-border)] text-xs text-[#ece7da] hover:bg-[#172033] transition disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Sincronizar</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white/10 text-[#b6bbc5] hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* NAVEGAÇÃO POR ABAS: INSCRIÇÕES vs CARGOS */}
        <div className="flex items-center px-3 sm:px-6 pt-3 border-b border-[var(--hair-soft)] bg-[#0a0f19] gap-2 overflow-x-auto whitespace-nowrap">
          <button
            onClick={() => {
              soundManager.playClick();
              setActiveTab('applications');
            }}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition flex items-center space-x-1.5 cursor-pointer ${
              activeTab === 'applications'
                ? 'border-[#FFC34F] text-[#FFC34F]'
                : 'border-transparent text-[#FFF0B2]/60 hover:text-[#FFF0B2]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Inscrições no Livro ({totalCount})</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              setActiveTab('roles');
            }}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition flex items-center space-x-1.5 cursor-pointer ${
              activeTab === 'roles'
                ? 'border-[#FFC34F] text-[#FFC34F]'
                : 'border-transparent text-[#FFF0B2]/60 hover:text-[#FFF0B2]'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Cargos & Permissões ({rolesList.length})</span>
          </button>
        </div>

        {/* CONTEÚDO DA ABA 1: INSCRIÇÕES NO LIVRO */}
        {activeTab === 'applications' && (
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 flex flex-col space-y-4">
            
            {/* Barra de Métricas */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="bg-[#090e17] border border-[var(--hair-soft)] p-3">
                <span className="text-[11px] text-[#8b93a1] block mb-0.5">Total Inscritos</span>
                <span className="font-mono text-xl font-bold text-[#ece7da]">{totalCount}</span>
              </div>
              <div className="bg-[#090e17] border border-[#6e9e81]/40 p-3">
                <span className="text-[11px] text-[#7fd29a] block mb-0.5">Aprovados</span>
                <span className="font-mono text-xl font-bold text-[#7fd29a]">{approvedCount}</span>
              </div>
              <div className="bg-[#090e17] border border-[var(--house-border)] p-3">
                <span className="text-[11px] text-[var(--house-accent)] block mb-0.5">Pendentes</span>
                <span className="font-mono text-xl font-bold text-[var(--house-accent)]">{pendingCount}</span>
              </div>
              <div className="bg-[#090e17] border border-[#b5675e]/40 p-3">
                <span className="text-[11px] text-[#b5675e] block mb-0.5">Rejeitados</span>
                <span className="font-mono text-xl font-bold text-[#b5675e]">{rejectedCount}</span>
              </div>
              <div className="bg-[#090e17] border border-[var(--hair-soft)] p-3 col-span-2 sm:col-span-1">
                <span className="text-[11px] text-[#8b93a1] block mb-0.5">Palavras Totais</span>
                <span className="font-mono text-xl font-bold text-gold-gradient">{totalWords.toLocaleString('pt-BR')}</span>
              </div>
            </div>

            {/* Filtros */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#8b93a1] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar por Personagem, Discord ou Bilhete..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#0d1422] border border-[var(--house-border)] pl-9 pr-4 py-2 text-xs text-[#ece7da] placeholder-[#8b93a1] focus:border-[var(--house-accent)] focus:outline-none"
                />
              </div>

              <select
                value={selectedHouse}
                onChange={(e) => setSelectedHouse(e.target.value)}
                className="bg-[#0d1422] border border-[var(--house-border)] px-3 py-2 text-xs text-[#ece7da] focus:border-[var(--house-accent)] focus:outline-none"
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
                className="bg-[#0d1422] border border-[var(--house-border)] px-3 py-2 text-xs text-[#ece7da] focus:border-[var(--house-accent)] focus:outline-none"
              >
                <option value="all">Todos os Status</option>
                <option value="pending">Pendente</option>
                <option value="approved">Aprovado</option>
                <option value="rejected">Rejeitado</option>
              </select>
            </div>

            {/* Tabela de Inscrições */}
            <div className="bg-[#090e17] border border-[var(--house-border)] overflow-x-auto flex-1">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0d1422] border-b border-[var(--house-border)] text-[var(--house-accent)] font-semibold">
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
                      const { houseInfo: house, isSortedOfficial, preferredHouseInfo, differsFromPreferred } = resolveEffectiveHouse(app);
                      const regCode = formatTicketNumber(app);
                      const appStatus = app.status || 'pending';

                      return (
                        <tr key={app.id || app.discord_id} className="hover:bg-white/[0.02] transition">
                          <td className="py-3 px-3 font-mono font-bold text-gold-gradient">
                            {regCode}
                            {app.game_character_id ? (
                              <span className="block text-[9px] text-[#7fd29a] font-normal">ID #{app.game_character_id}</span>
                            ) : null}
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-semibold block">{app.discord_username}</span>
                            <span className="text-[10px] text-[#FFF0B2]/40 font-mono">{app.discord_id}</span>
                          </td>
                          <td className="py-3 px-3 font-medium">{app.first_name} {app.last_name}</td>
                          <td className="py-3 px-3">
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold text-white" style={{ backgroundColor: house.color }}>
                              <img
                                src={house.emblemImg}
                                alt={house.name}
                                draggable={false}
                                className="w-3.5 h-3.5 object-contain select-none pointer-events-none"
                              />
                              <span>{house.name}</span>
                            </span>
                            {isSortedOfficial && (
                              <span className="block text-[9px] text-[#7fd29a] mt-0.5">
                                {differsFromPreferred ? `Chapéu (Site: ${preferredHouseInfo.name})` : 'Confirmada in-game'}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-[11px] text-[#FFF0B2]/70">{app.wand_wood} • {app.wand_core}</td>
                          <td className="py-3 px-3 font-mono font-bold">{app.word_count?.toLocaleString('pt-BR')}</td>
                          <td className="py-3 px-3">
                            {appStatus === 'approved' && <span className="text-[#4CAF7C] font-semibold">Aprovado</span>}
                            {appStatus === 'rejected' && <span className="text-[#CF4A4A] font-semibold">Rejeitado</span>}
                            {appStatus === 'pending' && <span className="text-[#FFC34F] font-semibold">Pendente</span>}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end space-x-1.5">
                              <button
                                onClick={async () => {
                                  soundManager.playSparkle();
                                  await generateAndDownloadCharacterPdf(app);
                                }}
                                className="p-1.5 rounded-lg bg-[#210604] hover:bg-[#5B1009] border border-[#FFC34F]/30 text-[#FFC34F] text-xs transition cursor-pointer"
                                title="Baixar Ficha Oficial em Pergaminho (PDF)"
                              >
                                <FileDown className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  soundManager.playClick();
                                  setSelectedApp(app);
                                  setReviewerNotes(app.reviewer_notes || '');
                                }}
                                className="px-2.5 py-1 rounded-lg bg-[#5B1009] hover:bg-[#8B1A0E] text-[#FFF0B2] font-semibold text-xs transition cursor-pointer"
                              >
                                Julgar
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* CONTEÚDO DA ABA 2: GERENCIAMENTO DE CARGOS NO BANCO */}
        {activeTab === 'roles' && (
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 flex flex-col space-y-4">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#100303] border border-[#B83A0C]/30 p-4 rounded-2xl">
              <div>
                <h3 className="font-cinzel text-base font-bold text-[#FFF0B2]">
                  Cargos Ministeriais Registrados na Tabela <code className="text-[#FFC34F]">user_roles</code>
                </h3>
                <p className="text-xs text-[#FFF0B2]/60 mt-0.5">
                  Defina quais bruxos possuem acesso ao Painel de Administração e permissões de julgamento de fichas.
                </p>
              </div>

              <div className="w-full sm:w-64 relative">
                <Search className="w-4 h-4 text-[#FFF0B2]/40 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar bruxo por nome ou ID..."
                  value={roleSearchTerm}
                  onChange={(e) => setRoleSearchTerm(e.target.value)}
                  className="w-full bg-[#160504] border border-[#B83A0C]/30 rounded-xl pl-9 pr-3 py-1.5 text-xs text-[#FFF0B2] placeholder-[#FFF0B2]/30 focus:border-[#FFC34F] focus:outline-none"
                />
              </div>
            </div>

            <div className="bg-[#100303] border border-[#B83A0C]/30 rounded-2xl overflow-x-auto flex-1">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#160504] border-b border-[#B83A0C]/30 text-[#FFC34F] font-semibold">
                  <tr>
                    <th className="py-3 px-3">Bruxo (Discord)</th>
                    <th className="py-3 px-3">Discord ID</th>
                    <th className="py-3 px-3">Cargo Atual</th>
                    <th className="py-3 px-3">Atribuído Por</th>
                    <th className="py-3 px-3 text-right">Alterar Cargo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-[#FFF0B2]">
                  {filteredRoles.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-[#FFF0B2]/40">
                        Nenhum registro de cargo encontrado no banco de dados.
                      </td>
                    </tr>
                  ) : (
                    filteredRoles.map((r) => (
                      <tr key={r.discord_id} className="hover:bg-white/[0.02] transition">
                        <td className="py-3 px-3 font-semibold text-[#FFF0B2] flex items-center space-x-2">
                          <div className="w-7 h-7 rounded-full bg-[#5B1009] flex items-center justify-center font-bold text-xs">
                            {r.discord_username.charAt(0).toUpperCase()}
                          </div>
                          <span>{r.discord_username}</span>
                        </td>
                        <td className="py-3 px-3 font-mono text-[11px] text-[#FFF0B2]/60">{r.discord_id}</td>
                        <td className="py-3 px-3">{getRoleBadge(r.role)}</td>
                        <td className="py-3 px-3 text-[11px] text-[#FFF0B2]/60">{r.assigned_by || 'Sistema'}</td>
                        <td className="py-3 px-3 text-right">
                          <select
                            value={r.role}
                            disabled={roleUpdatingId === r.discord_id}
                            onChange={(e) => handleRoleChange(r.discord_id, e.target.value as UserRole)}
                            className="bg-[#160504] border border-[#B83A0C]/40 rounded-xl px-2.5 py-1 text-xs text-[#FFF0B2] focus:border-[#FFC34F] focus:outline-none cursor-pointer disabled:opacity-50"
                          >
                            <option value="user">Usuário (Padrão)</option>
                            <option value="student">Aluno</option>
                            <option value="mod">Moderador</option>
                            <option value="admin">Administrador</option>
                            <option value="super_admin">Super Admin</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* MODAL DE JULGAMENTO DE FICHA */}
        {selectedApp && (
          <div className="fixed inset-0 z-[60] flex items-start justify-center p-2.5 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
            <div className="w-full max-w-2xl my-auto bg-[#160504] border border-[#B83A0C]/50 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4 max-h-[92dvh] overflow-y-auto custom-scrollbar">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h3 className="font-cinzel text-lg font-bold text-[#FFF0B2]">
                  Julgamento Ministerial: {selectedApp.first_name} {selectedApp.last_name}
                </h3>
                <button
                  onClick={() => setSelectedApp(null)}
                  className="p-1 rounded-full hover:bg-white/10 text-[#FFF0B2]/60 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2 text-[#FFF0B2]/70">
                  <span>Discord: <strong>{selectedApp.discord_username}</strong> ({selectedApp.discord_id})</span>
                  <span>Palavras: <strong className="text-gold-gradient">{selectedApp.word_count}</strong></span>
                </div>
                {(() => {
                  const resolved = resolveEffectiveHouse(selectedApp);
                  return (
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#FFF0B2]/75">
                      <span>
                        {resolved.isSortedOfficial ? 'Casa Oficial (Jogo): ' : 'Casa Solicitada: '}
                        <strong className="text-[#FFF0B2]">{resolved.houseInfo.name}</strong>
                        {resolved.differsFromPreferred ? ` (Pré-seleção no portal: ${resolved.preferredHouseInfo.name})` : ''}
                      </span>
                      {selectedApp.game_character_id ? (
                        <span className="font-mono text-[#7fd29a]">Personagem #{selectedApp.game_character_id}</span>
                      ) : null}
                    </div>
                  );
                })()}
                <div className="p-3 bg-[#100303] rounded-xl border border-white/5 max-h-48 overflow-y-auto leading-relaxed text-[#FFF0B2]/80 font-serif">
                  {selectedApp.character_backstory}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#FFC34F] block mb-1">
                  Parecer do Conselho / Notas de Revisão:
                </label>
                <textarea
                  rows={3}
                  value={reviewerNotes}
                  onChange={(e) => setReviewerNotes(e.target.value)}
                  placeholder="Insira observações canônicas para o bruxo (se houver ajustes ou motivo da recusa)..."
                  className="w-full bg-[#100303] border border-[#B83A0C]/30 rounded-xl p-3 text-xs text-[#FFF0B2] placeholder-[#FFF0B2]/30 focus:border-[#FFC34F] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={async () => {
                    soundManager.playSparkle();
                    await generateAndDownloadCharacterPdf(selectedApp);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-[#210604] hover:bg-[#5B1009] border border-[#FFC34F]/40 text-[#FFF0B2] text-xs font-semibold transition flex items-center space-x-1.5 cursor-pointer"
                  title="Baixar a Ficha Oficial do Aluno em PDF"
                >
                  <FileDown className="w-3.5 h-3.5 text-[#FFC34F]" />
                  <span>Baixar Ficha em PDF</span>
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleUpdateStatus('rejected')}
                    disabled={isUpdating}
                    className="px-3.5 py-2 rounded-xl bg-[#CF4A4A]/20 hover:bg-[#CF4A4A]/40 border border-[#CF4A4A]/40 text-[#CF4A4A] text-xs font-bold transition flex items-center space-x-1"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    <span>Rejeitar</span>
                  </button>

                  <button
                    onClick={() => handleUpdateStatus('approved')}
                    disabled={isUpdating}
                    className="px-4 py-2 rounded-xl bg-[#1A6B3C] hover:bg-[#1A6B3C]/80 text-white text-xs font-bold transition flex items-center space-x-1 shadow-lg shadow-[#1A6B3C]/30"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Aprovar Inscrição</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
