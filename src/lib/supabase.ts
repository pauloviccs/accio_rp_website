import { createClient } from '@supabase/supabase-js';
import { CharacterApplication } from '../types';
import { sendRegistrationToDiscord } from './discordWebhook';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://btxwhsbccfwhajrmopzm.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0eHdoc2JjY2Z3aGFqcm1vcHptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyMjIyOTQsImV4cCI6MjA4NTc5ODI5NH0.kzmICdyH1OtIiymfl-zwWK8Rur3BxKKzfOU8tNO_TC0';

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
