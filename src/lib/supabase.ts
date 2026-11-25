import { createClient } from '@supabase/supabase-js';
import { CharacterApplication, DiscordUser, UserRole, UserRoleRecord } from '../types';
import { sendRegistrationToDiscord } from './discordWebhook';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://siwjyavftankitbdagzo.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpd2p5YXZmdGFua2l0YmRhZ3pvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTUyNzU3NjcsImV4cCI6MjExMDg1MTc2N30.wnRe2Pk2f0PQbY4JT-iKjN27_xKot88QO3WY-YkphtU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function signInWithDiscord() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'discord',
    options: {
      redirectTo: `${window.location.origin}/`,
      scopes: 'identify email'
    }
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getExistingApplication(discordId: string): Promise<CharacterApplication | null> {
  try {
    const { data, error } = await supabase
      .from('character_applications')
      .select('*')
      .eq('discord_id', discordId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.warn('Erro ao consultar candidatura existente:', error.message);
      return null;
    }
    return data as CharacterApplication | null;
  } catch (err) {
    console.error('Falha ao buscar candidatura no Supabase:', err);
    return null;
  }
}

export async function submitApplication(app: CharacterApplication): Promise<CharacterApplication> {
  const { data, error } = await supabase
    .from('character_applications')
    .insert([app])
    .select()
    .single();

  if (error) throw error;
  const created = data as CharacterApplication;

  // Notificar canal do Discord com embed diagramado
  sendRegistrationToDiscord(created).catch((err) => {
    console.warn('Falha assíncrona ao disparar webhook do Discord:', err);
  });

  return created;
}

export async function getAllApplications(): Promise<CharacterApplication[]> {
  try {
    const { data, error } = await supabase
      .from('character_applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Erro ao listar todas as candidaturas:', error.message);
      return [];
    }
    return (data || []) as CharacterApplication[];
  } catch (err) {
    console.error('Falha ao buscar todas as candidaturas no Supabase:', err);
    return [];
  }
}

export async function updateApplicationStatus(
  id: string,
  status: 'pending' | 'approved' | 'rejected',
  reviewerNotes?: string,
  reviewedBy: string = 'Ministério da Magia'
): Promise<CharacterApplication | null> {
  try {
    const { data, error } = await supabase
      .from('character_applications')
      .update({
        status,
        reviewer_notes: reviewerNotes,
        reviewed_by: reviewedBy,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar status da candidatura:', error.message);
      return null;
    }
    return data as CharacterApplication;
  } catch (err) {
    console.error('Falha de rede ao atualizar status:', err);
    return null;
  }
}

export async function getTotalApplicationsCount(): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('character_applications')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.warn('Falha na consulta de contagem:', error.message);
      return 0;
    }
    return count ?? 0;
  } catch (err) {
    console.error('Falha de rede ao consultar contagem:', err);
    return 0;
  }
}

export interface CountdownTimerData {
  target_date: string;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  updated_by?: string;
}

export async function getCountdownTimer(): Promise<CountdownTimerData | null> {
  try {
    const { data, error } = await supabase
      .from('accio_settings')
      .select('value')
      .eq('key', 'countdown_timer')
      .maybeSingle();

    if (error || !data) {
      console.warn('Erro ao consultar cronômetro de accio_settings:', error?.message);
      return null;
    }
    return data.value as CountdownTimerData;
  } catch (err) {
    console.error('Falha de rede ao consultar cronômetro:', err);
    return null;
  }
}

export async function updateCountdownTimer(timer: CountdownTimerData): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('accio_settings')
      .upsert({
        key: 'countdown_timer',
        value: timer,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'key' });

    if (error) {
      console.error('Erro ao atualizar cronômetro em accio_settings:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Falha de rede ao salvar cronômetro:', err);
    return false;
  }
}

export function subscribeToCountdownTimer(onUpdate: (timer: CountdownTimerData) => void): () => void {
  const channel = supabase
    .channel('accio_settings_timer_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'accio_settings',
        filter: 'key=eq.countdown_timer',
      },
      (payload) => {
        if (payload.new && (payload.new as any).value) {
          onUpdate((payload.new as any).value as CountdownTimerData);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// -------------------------------------------------------------
// SISTEMA DE CARGOS & RBAC (Role-Based Access Control)
// Cargos permitidos: user, student, mod, admin, super_admin
// -------------------------------------------------------------

export async function getUserRole(discordId: string): Promise<UserRoleRecord | null> {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('*')
      .eq('discord_id', discordId)
      .maybeSingle();

    if (error) {
      console.warn('Erro ao consultar cargo do usuário:', error.message);
      return null;
    }
    return data as UserRoleRecord | null;
  } catch (err) {
    console.error('Falha de rede ao consultar cargo:', err);
    return null;
  }
}

export function resolveDiscordAvatarUrl(discordId: string, avatar?: string | null): string | null {
  if (!avatar) return null;
  if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
    return avatar;
  }
  return `https://cdn.discordapp.com/avatars/${discordId}/${avatar}.png`;
}

export async function syncUserRole(user: DiscordUser): Promise<UserRoleRecord> {
  // Se for o fundador (PauloViccs) ou ID cadastrado, concede super_admin
  const isFounder =
    user.id === '149567984597466064' ||
    user.id === '1466833236213891085' ||
    user.username.toLowerCase() === 'pauloviccs';

  const defaultRole: UserRole = isFounder ? 'super_admin' : 'user';

  try {
    const existing = await getUserRole(user.id);
    if (existing) {
      // Se for fundador e ainda não for super_admin, eleva
      if (isFounder && existing.role !== 'super_admin') {
        await updateUserRole(user.id, 'super_admin', 'Fundador');
        return { ...existing, role: 'super_admin' };
      }
      return existing;
    }

    const newRecord: UserRoleRecord = {
      discord_id: user.id,
      discord_username: user.global_name || user.username,
      discord_avatar: resolveDiscordAvatarUrl(user.id, user.avatar),
      role: defaultRole,
      assigned_by: isFounder ? 'Fundador' : 'Primeiro Login Discord',
    };

    const { data, error } = await supabase
      .from('user_roles')
      .insert([newRecord])
      .select()
      .single();

    if (error) {
      console.warn('Erro ao inserir cargo inicial:', error.message);
      return newRecord;
    }
    return data as UserRoleRecord;
  } catch (err) {
    console.error('Falha de rede ao sincronizar cargo:', err);
    return {
      discord_id: user.id,
      discord_username: user.username,
      role: defaultRole,
    };
  }
}

export async function getAllUserRoles(): Promise<UserRoleRecord[]> {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Erro ao listar cargos de usuários:', error.message);
      return [];
    }
    return (data || []) as UserRoleRecord[];
  } catch (err) {
    console.error('Falha de rede ao buscar todos os cargos:', err);
    return [];
  }
}

export async function updateUserRole(
  discordId: string,
  role: UserRole,
  assignedBy: string = 'Ministério da Magia'
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_roles')
      .update({
        role,
        assigned_by: assignedBy,
        updated_at: new Date().toISOString(),
      })
      .eq('discord_id', discordId);

    if (error) {
      console.error('Erro ao atualizar cargo no Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Falha de rede ao atualizar cargo:', err);
    return false;
  }
}

export function subscribeToUserRoles(onUpdate: (roleRecord: UserRoleRecord) => void): () => void {
  const channel = supabase
    .channel('user_roles_realtime_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'user_roles',
      },
      (payload) => {
        if (payload.new) {
          onUpdate(payload.new as UserRoleRecord);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
