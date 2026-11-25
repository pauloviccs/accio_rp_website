import React, { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Features } from './components/Features';
import { Footer } from './components/Footer';
import { ParticleCanvas } from './components/ParticleCanvas';
import { WhitelistFormModal } from './components/WhitelistFormModal';
import { TicketModal } from './components/TicketModal';
import { HogwartsLetterModal } from './components/HogwartsLetterModal';
import { ValidationModal } from './components/ValidationModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { EnchantedSubmissionModal } from './components/EnchantedSubmissionModal';
import { CastleBanners3D } from './components/CastleBanners3D';
import { AppleTimerModal } from './components/AppleTimerModal';
import { MusicPlayerWidget } from './components/MusicPlayerWidget';
import { CharacterApplication, DiscordUser, UserRole, HouseId } from './types';
import { LOCAL_STORAGE_LETTER_KEY } from './lib/constants';
import {
  supabase,
  signInWithDiscord,
  signOut,
  getExistingApplication,
  submitApplication,
  getTotalApplicationsCount,
  getCountdownTimer,
  subscribeToCountdownTimer,
  syncUserRole,
} from './lib/supabase';

export const App: React.FC = () => {
  const [user, setUser] = useState<DiscordUser | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [application, setApplication] = useState<CharacterApplication | null>(null);
  const [totalRegistered, setTotalRegistered] = useState<number>(0);
  const [targetEndDate, setTargetEndDate] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isTicketOpen, setIsTicketOpen] = useState(false);
  const [isLetterOpen, setIsLetterOpen] = useState(false);
  const [isValidationOpen, setIsValidationOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isTimerModalOpen, setIsTimerModalOpen] = useState(false);
  const [isSubmissionSuccessOpen, setIsSubmissionSuccessOpen] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Motor de Tema Dinâmico das Quatro Casas de Hogwarts
  const [activeHouseTheme, setActiveHouseTheme] = useState<HouseId>(() => {
    return (localStorage.getItem('accio_house_theme') as HouseId) || 'gryffindor';
  });

  // Atualizar atributo data-house-theme no <html> para disparar animação universal de cores
  useEffect(() => {
    document.documentElement.setAttribute('data-house-theme', activeHouseTheme);
    localStorage.setItem('accio_house_theme', activeHouseTheme);
  }, [activeHouseTheme]);

  // Se o usuário logado tiver uma candidatura lavrada, manter o tema da sua Casa
  useEffect(() => {
    if (application?.preferred_house) {
      setActiveHouseTheme(application.preferred_house);
    }
  }, [application]);

  // Inicialização e Verificação de 1ª Visita
  useEffect(() => {
    // 0. Capturar possíveis erros de redirecionamento do OAuth (Discord / Supabase)
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const searchParams = new URLSearchParams(window.location.search);
    const errorDesc = hashParams.get('error_description') || searchParams.get('error_description');
    const error = hashParams.get('error') || searchParams.get('error');

    if (error || errorDesc) {
      const rawMsg = errorDesc || error || '';
      if (rawMsg.includes('exchange external code')) {
        setAuthError('O Discord não autorizou a troca de credenciais (Unable to exchange external code). É necessário sincronizar o Client Secret e a Redirect URL no painel do Supabase Auth e Discord Developer Portal. Você também pode vincular seu Discord diretamente na Ficha de Matrícula.');
      } else {
        setAuthError(decodeURIComponent(rawMsg));
      }
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // 1. Verificar se é a 1ª vez do usuário para abrir a Carta de Hogwarts 3D
    const hasSeenLetter = localStorage.getItem(LOCAL_STORAGE_LETTER_KEY);
    if (!hasSeenLetter) {
      setIsLetterOpen(true);
    }

    // 2. Obter contagem real de inscritos do Livro da Admissão
    getTotalApplicationsCount().then((count) => {
      setTotalRegistered(count);
    });

    // 2.1 Obter cronômetro configurado do Livro da Admissão
    getCountdownTimer().then((timer) => {
      if (timer?.target_date) {
        setTargetEndDate(timer.target_date);
      }
    });

    // 2.2 Sincronização Realtime de Cronômetro para todos os usuários
    const unsubTimer = subscribeToCountdownTimer((newTimer) => {
      if (newTimer?.target_date) {
        setTargetEndDate(newTimer.target_date);
      }
    });

    // 3. Monitorar sessão real do Discord via Supabase Auth
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const u = session.user;
        const discordUser: DiscordUser = {
          id: u.user_metadata?.provider_id || u.user_metadata?.sub || u.id,
          username: u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split('@')[0] || 'Bruxo',
          avatar: u.user_metadata?.avatar_url || null,
          global_name: u.user_metadata?.custom_claims?.global_name || u.user_metadata?.full_name,
          email: u.email,
        };
        setUser(discordUser);
        syncUserRole(discordUser).then((roleRec) => {
          setUserRole(roleRec.role);
        });
        loadUserApplication(discordUser.id);
      }
    });

    // 4. Ouvinte de mudanças de Auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const u = session.user;
        const discordUser: DiscordUser = {
          id: u.user_metadata?.provider_id || u.user_metadata?.sub || u.id,
          username: u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split('@')[0] || 'Bruxo',
          avatar: u.user_metadata?.avatar_url || null,
          global_name: u.user_metadata?.custom_claims?.global_name || u.user_metadata?.full_name,
          email: u.email,
        };
        setUser(discordUser);
        syncUserRole(discordUser).then((roleRec) => {
          setUserRole(roleRec.role);
        });
        loadUserApplication(discordUser.id);
      } else {
        setUser(null);
        setUserRole(null);
        setApplication(null);
        setIsValidationOpen(false);
      }
    });

    // Expor métodos globais de depuração e inspeção visual
    (window as any).__openTimerModal = () => setIsTimerModalOpen(true);
    (window as any).__openAdminModal = () => setIsAdminOpen(true);

    return () => {
      delete (window as any).__openTimerModal;
      delete (window as any).__openAdminModal;
      subscription.unsubscribe();
      unsubTimer();
    };
  }, []);

  const loadUserApplication = async (discordId: string) => {
    const existing = await getExistingApplication(discordId);
    if (existing) {
      setApplication(existing);
      setIsValidationOpen(true);
    }
  };

  const handleLogin = async () => {
    try {
      await signInWithDiscord();
    } catch (err: any) {
      console.error('Falha na autenticação com o Discord:', err);
      alert('Falha ao conectar com o Discord: ' + (err.message || 'Verifique sua conexão ou tente novamente.'));
    }
  };

  const handleLogout = async () => {
    await signOut();
    setUser(null);
    setUserRole(null);
    setApplication(null);
    setIsValidationOpen(false);
  };

  const handleSubmitApplication = async (appData: CharacterApplication) => {
    const created = await submitApplication(appData);
    setApplication(created);
    setTotalRegistered((prev) => prev + 1);
    setIsFormOpen(false);
    // Abre a transição mágica da carta sendo selada e enviada com comprovante do Supabase
    setIsSubmissionSuccessOpen(true);
  };

  const handleCloseLetter = () => {
    localStorage.setItem(LOCAL_STORAGE_LETTER_KEY, 'true');
    setIsLetterOpen(false);
  };

  return (
    <div className="min-h-screen bg-accio-deep relative overflow-hidden flex flex-col justify-between">
      {/* Efeito de Poeira Mágica Estelar */}
      <ParticleCanvas />

      {/* Toast de Alerta de Autenticação / OAuth */}
      {authError && (
        <div className="relative z-50 bg-[#5B1009]/95 border-b border-[#F47A16]/60 px-4 py-3 text-white backdrop-blur-md shadow-2xl transition-all">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-[#FFC34F] flex-shrink-0" />
              <div className="text-xs sm:text-sm font-medium text-[#FFF0B2]">
                <strong className="text-[#FFC34F]">Status da Conexão:</strong> {authError}
              </div>
            </div>
            <button
              onClick={() => setAuthError(null)}
              className="text-xs text-[#FFF0B2]/80 hover:text-white px-3 py-1 rounded-lg bg-black/40 border border-[#F47A16]/30 transition-colors flex-shrink-0"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* Navbar Superior com Proteção de Cargos RBAC & Seletor de Casa */}
      <Navbar
        user={user}
        userRole={userRole}
        activeHouseTheme={activeHouseTheme}
        onSelectHouseTheme={(h) => setActiveHouseTheme(h)}
        canAccessAdmin={['super_admin', 'admin', 'mod'].includes(userRole || '')}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onOpenForm={() => setIsFormOpen(true)}
        hasApplication={!!application}
        onViewTicket={() => setIsTicketOpen(true)}
        onOpenLetter={() => setIsLetterOpen(true)}
        onOpenValidation={() => setIsValidationOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* Conteúdo Principal */}
      <main className="relative z-10 flex-1">
        <Hero
          onOpenForm={() => {
            setIsFormOpen(true);
          }}
          totalRegistered={totalRegistered}
          hasApplication={!!application}
          onViewTicket={() => setIsTicketOpen(true)}
          onOpenLetter={() => setIsLetterOpen(true)}
          onOpenValidation={() => setIsValidationOpen(true)}
          targetEndDate={targetEndDate}
        />

        {/* Estandartes 3D das Quatro Casas & Exploração do Castelo */}
        <div id="castle-exploration">
          <CastleBanners3D
            onSelectHouse={(houseId) => {
              setActiveHouseTheme(houseId);
            }}
            onOpenFormWithHouse={(houseId) => {
              setActiveHouseTheme(houseId);
              setIsFormOpen(true);
            }}
          />
        </div>

        <Features />
      </main>

      {/* Rodapé */}
      <Footer
        onOpenLetter={() => setIsLetterOpen(true)}
        onOpenForm={() => setIsFormOpen(true)}
      />

      {/* Animação da Carta de Hogwarts 3D (Primeira Visita ou Chamada) */}
      <HogwartsLetterModal
        isOpen={isLetterOpen}
        onClose={handleCloseLetter}
        user={user}
        onLogin={handleLogin}
        onProceedToForm={() => {
          handleCloseLetter();
          setIsFormOpen(true);
        }}
        onExploreCastle={() => {
          handleCloseLetter();
          const el = document.getElementById('castle-exploration');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          }
        }}
      />

      {/* Modal / Bottom Sheet do Formulário de 3.000 Palavras */}
      <WhitelistFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        user={user}
        onLogin={handleLogin}
        onSubmit={handleSubmitApplication}
        onManualUserSet={(manualUser) => {
          setUser(manualUser);
          syncUserRole(manualUser).then((roleRec) => {
            setUserRole(roleRec.role);
          });
        }}
        activeHouseTheme={activeHouseTheme}
        onSelectHouseTheme={(h) => setActiveHouseTheme(h)}
      />

      {/* Transição Mágica da Carta Selada e Enviada à Escola */}
      <EnchantedSubmissionModal
        isOpen={isSubmissionSuccessOpen}
        onClose={() => setIsSubmissionSuccessOpen(false)}
        application={application}
        onOpenValidation={() => setIsValidationOpen(true)}
        onViewTicket={() => setIsTicketOpen(true)}
      />

      {/* Página / Modal de Validação de Pré-Registro */}
      <ValidationModal
        isOpen={isValidationOpen}
        onClose={() => setIsValidationOpen(false)}
        application={application}
        onViewTicket={() => {
          setIsValidationOpen(false);
          setIsTicketOpen(true);
        }}
      />

      {/* Modal do Bilhete de Embarque do Expresso de Hogwarts */}
      <TicketModal
        isOpen={isTicketOpen}
        onClose={() => setIsTicketOpen(false)}
        application={application}
      />

      {/* Painel Administrativo Ministerial (ADM com Controle de Acesso) */}
      <AdminPanelModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        currentUserRole={userRole}
        onOpenTimerModal={() => setIsTimerModalOpen(true)}
      />

      {/* Modal de Cronômetro Apple na Raiz (Layout 100% responsivo sem corte) */}
      <AppleTimerModal
        isOpen={isTimerModalOpen}
        onClose={() => setIsTimerModalOpen(false)}
        onTimerSaved={(newTimer) => {
          if (newTimer?.target_date) {
            setTargetEndDate(newTimer.target_date);
          }
        }}
      />

      {/* Reprodutor de Trilha Sonora Orquestral de Hogwarts (Contínua & Shuffle) */}
      <MusicPlayerWidget />
    </div>
  );
};

export default App;
