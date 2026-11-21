import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Features } from './components/Features';
import { Footer } from './components/Footer';
import { ParticleCanvas } from './components/ParticleCanvas';
import { WhitelistFormModal } from './components/WhitelistFormModal';
import { TicketModal } from './components/TicketModal';
import { HogwartsLetterModal } from './components/HogwartsLetterModal';
import { CharacterApplication, DiscordUser } from './types';
import { LOCAL_STORAGE_LETTER_KEY } from './lib/constants';
import {
  supabase,
  signInWithDiscord,
  signOut,
  getExistingApplication,
  submitApplication,
  getTotalApplicationsCount,
} from './lib/supabase';

export const App: React.FC = () => {
  const [user, setUser] = useState<DiscordUser | null>(null);
  const [application, setApplication] = useState<CharacterApplication | null>(null);
  const [totalRegistered, setTotalRegistered] = useState<number>(0);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isTicketOpen, setIsTicketOpen] = useState(false);
  const [isLetterOpen, setIsLetterOpen] = useState(false);

  // Inicialização e Verificação de 1ª Visita
  useEffect(() => {
    // 1. Verificar se é a 1ª vez do usuário para abrir a Carta de Hogwarts 3D
    const hasSeenLetter = localStorage.getItem(LOCAL_STORAGE_LETTER_KEY);
    if (!hasSeenLetter) {
      setIsLetterOpen(true);
    }

    // 2. Obter contagem real de inscritos do Supabase
    getTotalApplicationsCount().then((count) => {
      setTotalRegistered(count);
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
        loadUserApplication(discordUser.id);
      } else {
        setUser(null);
        setApplication(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadUserApplication = async (discordId: string) => {
    const existing = await getExistingApplication(discordId);
    if (existing) {
      setApplication(existing);
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
    setApplication(null);
  };

  const handleSubmitApplication = async (appData: CharacterApplication) => {
    const created = await submitApplication(appData);
    setApplication(created);
    setTotalRegistered((prev) => prev + 1);
    setIsFormOpen(false);
    setIsTicketOpen(true);
  };

  const handleCloseLetter = () => {
    localStorage.setItem(LOCAL_STORAGE_LETTER_KEY, 'true');
    setIsLetterOpen(false);
  };

  return (
    <div className="min-h-screen bg-accio-deep relative overflow-hidden flex flex-col justify-between">
      {/* Efeito de Poeira Mágica Estelar */}
      <ParticleCanvas />

      {/* Navbar Superior */}
      <Navbar
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onOpenForm={() => setIsFormOpen(true)}
        hasApplication={!!application}
        onViewTicket={() => setIsTicketOpen(true)}
        onOpenLetter={() => setIsLetterOpen(true)}
      />

      {/* Conteúdo Principal */}
      <main className="relative z-10 flex-1">
        <Hero
          onOpenForm={() => {
            if (!user) {
              handleLogin();
            } else {
              setIsFormOpen(true);
            }
          }}
          totalRegistered={totalRegistered}
          hasApplication={!!application}
          onViewTicket={() => setIsTicketOpen(true)}
          onOpenLetter={() => setIsLetterOpen(true)}
        />

        <Features />
      </main>

      {/* Rodapé */}
      <Footer />

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
      />

      {/* Modal / Bottom Sheet do Formulário de 3.000 Palavras */}
      <WhitelistFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        user={user}
        onLogin={handleLogin}
        onSubmit={handleSubmitApplication}
      />

      {/* Modal do Bilhete de Embarque do Expresso de Hogwarts */}
      <TicketModal
        isOpen={isTicketOpen}
        onClose={() => setIsTicketOpen(false)}
        application={application}
      />
    </div>
  );
};

export default App;
