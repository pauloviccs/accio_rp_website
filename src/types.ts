export type HouseId = 'gryffindor' | 'slytherin' | 'ravenclaw' | 'hufflepuff';

export type BloodStatus = 'pure-blood' | 'half-blood' | 'muggle-born';

export type ApplicationStatus = 'pending' | 'approved' | 'rejected' | 'revision_requested';

export interface CharacterApplication {
  id?: string;
  user_id?: string;
  discord_id: string;
  discord_username: string;
  discord_avatar?: string;
  registration_number?: number;
  first_name: string;
  last_name: string;
  birth_date: string;
  birth_place: string;
  blood_status: BloodStatus;
  preferred_house: HouseId;
  wand_wood: string;
  wand_core: string;
  wand_length: string;
  wand_flexibility: string;
  patronus?: string;
  character_backstory: string;
  word_count: number;
  rp_experience?: string;
  rules_accepted: boolean;
  status?: ApplicationStatus;
  reviewer_notes?: string;
  reviewed_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DiscordUser {
  id: string;
  username: string;
  avatar: string | null;
  global_name?: string;
  email?: string;
}

