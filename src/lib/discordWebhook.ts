import { CharacterApplication, HouseId } from '../types';
import { HOUSES } from './constants';
import { formatTicketNumber } from './ticketFormat';
import webhookConfigData from '../config/webhooks.json';

export type WebhookApplicationStatus = 'pending' | 'approved' | 'rejected';

export interface WebhookChannelConfig {
  enabled: boolean;
  url: string;
  username: string;
  avatarUrl: string;
}

export interface WebhookConfigSchema {
  enabled: boolean;
  notifyOnSubmitPending: boolean;
  notifyOnStatusTransitions: string[];
  channels: Record<WebhookApplicationStatus, WebhookChannelConfig>;
}

const DEFAULT_AVATAR_URL =
  'https://btxwhsbccfwhajrmopzm.supabase.co/storage/v1/object/public/assets/logohigh.jpg';

const HOUSE_COLORS: Record<string, number> = {
  gryffindor: 0x9c1b28,
  slytherin: 0x1a6b3c,
  ravenclaw: 0x0b4f8a,
  hufflepuff: 0xd4a844,
};

const STATUS_COLORS: Record<WebhookApplicationStatus, number> = {
  approved: 0x1fa463,
  rejected: 0x9c1b28,
  pending: 0xd4a844,
};

function readEnvOverride(status: WebhookApplicationStatus): string {
  const env = (import.meta as { env?: Record<string, string | undefined> }).env || {};
  if (status === 'approved') return String(env.VITE_DISCORD_WEBHOOK_APPROVED || '').trim();
  if (status === 'rejected') return String(env.VITE_DISCORD_WEBHOOK_REJECTED || '').trim();
  return String(env.VITE_DISCORD_WEBHOOK_PENDING || '').trim();
}

export function normalizeWebhookStatus(rawStatus?: string | null): WebhookApplicationStatus | null {
  const clean = String(rawStatus || '').trim().toLowerCase();
  if (clean === 'approved' || clean === 'rejected' || clean === 'pending') {
    return clean;
  }
  return null;
}

export function resolveWebhookChannelConfig(status: WebhookApplicationStatus): WebhookChannelConfig | null {
  const cfg = webhookConfigData as WebhookConfigSchema;
  if (cfg?.enabled === false) return null;

  const channel = cfg?.channels?.[status];
  if (!channel || channel.enabled === false) return null;

  const envUrl = readEnvOverride(status);
  const url = envUrl || String(channel.url || '').trim();
  if (!url) return null;

  return {
    enabled: true,
    url,
    username:
      String(channel.username || '').trim() ||
      (status === 'approved' ? 'Expresso de Hogwarts' : 'Ministério da Magia'),
    avatarUrl: String(channel.avatarUrl || DEFAULT_AVATAR_URL).trim() || DEFAULT_AVATAR_URL,
  };
}

function resolveHouseInfo(app: CharacterApplication) {
  const resolvedKey = (String(app.sorted_house || app.preferred_house || 'gryffindor')
    .trim()
    .toLowerCase() || 'gryffindor') as HouseId;
  return {
    key: resolvedKey,
    house: HOUSES[resolvedKey] || HOUSES.gryffindor,
    preferredHouse: HOUSES[app.preferred_house] || HOUSES.gryffindor,
  };
}

function formatBloodStatus(bloodStatus?: string | null): string {
  if (bloodStatus === 'pure-blood') return 'Sangue Puro';
  if (bloodStatus === 'half-blood') return 'Mestiço';
  return 'Nascido Trouxa';
}

function formatDormitory(dormitory?: string | null): string {
  return dormitory === 'witch' ? 'Bruxa (Ala Feminina)' : 'Bruxo (Ala Masculina)';
}

export interface BuildWebhookPayloadOptions {
  status?: WebhookApplicationStatus;
  previousStatus?: string | null;
  channelConfig?: WebhookChannelConfig | null;
}

export function buildApplicationStatusWebhookPayload(
  app: CharacterApplication,
  options: BuildWebhookPayloadOptions = {}
) {
  const status = normalizeWebhookStatus(options.status || app.status || 'pending') || 'pending';
  const previousStatus = normalizeWebhookStatus(options.previousStatus);
  const channel = options.channelConfig || resolveWebhookChannelConfig(status);
  const registrationCode = formatTicketNumber(app);
  const { house, preferredHouse } = resolveHouseInfo(app);
  const fullName = `${app.first_name || ''} ${app.last_name || ''}`.trim() || 'Bruxo(a)';
  const wordCount = Number(app.word_count || 0);
  const backstory = String(app.character_backstory || '').trim();
  const previewStory =
    backstory.length > 420
      ? `${backstory.slice(0, 420).trim()}...\n\n*(Crônica completa com **${wordCount.toLocaleString('pt-BR')}** palavras disponível no Painel Ministerial)*`
      : backstory;
  const reviewerNotes = String(app.reviewer_notes || '').trim();
  const reviewedBy = String(app.reviewed_by || '').trim() || 'Ministério da Magia';
  const discordMention = app.discord_id ? `<@${app.discord_id}>` : app.discord_username;
  const thumbnailUrl = app.discord_avatar || channel?.avatarUrl || DEFAULT_AVATAR_URL;
  const timestamp = new Date().toISOString();

  if (status === 'approved') {
    const fields = [
      { name: '🎫 Bilhete do Expresso', value: `\`${registrationCode}\``, inline: true },
      {
        name: '🦉 Bruxo(a) Convocado(a)',
        value: `**${app.discord_username}**\n${discordMention}\n\`ID: ${app.discord_id}\``,
        inline: true,
      },
      { name: '🧙 Personagem', value: `**${fullName}**`, inline: true },
      {
        name: app.sorted_house ? '🎩 Casa Definida' : '🏰 Casa Pretendida',
        value: `**${house.name}**\n*${house.motto}*`,
        inline: true,
      },
      {
        name: '🩸 Linhagem & Ala',
        value: `${formatBloodStatus(app.blood_status)} • ${formatDormitory(app.dormitory)}`,
        inline: true,
      },
      {
        name: '🪄 Varinha Registrada',
        value: `**${app.wand_wood}** • ${app.wand_core}\n${app.wand_length} (${app.wand_flexibility})`,
        inline: true,
      },
      {
        name: '🚂 Próximo Passo de Embarque',
        value:
          'Acesse o portal **ACCIO Roleplay**, abra sua ficha aprovada e gere o **Código de Personagem (`ACCIO-XXXXXXXX`)** para entrar na Plataforma 9¾ e sincronizar seu perfil no servidor.',
        inline: false,
      },
      {
        name: '🔏 Selado por',
        value: `**${reviewedBy}**`,
        inline: true,
      },
    ];

    if (reviewerNotes) {
      fields.push({
        name: '📜 Despacho do Examinador',
        value: reviewerNotes.slice(0, 1000),
        inline: false,
      });
    }

    return {
      username: channel?.username || 'Expresso de Hogwarts',
      avatar_url: channel?.avatarUrl || DEFAULT_AVATAR_URL,
      content: app.discord_id ? `🚂 Passagem liberada para <@${app.discord_id}> — **${fullName}**!` : undefined,
      allowed_mentions: app.discord_id ? { users: [String(app.discord_id)] } : { parse: [] },
      embeds: [
        {
          title: `🚂 EMBARQUE AUTORIZADO NO EXPRESSO DE HOGWARTS — ${registrationCode}`,
          description: `A carta de admissão de **${fullName}** foi selada com louvor! Seu assento no **Expresso de Hogwarts** está oficialmente reservado no **ACCIO Roleplay (Arcane MP)**.`,
          color: HOUSE_COLORS[house.name ? (app.sorted_house || app.preferred_house) : 'gryffindor'] || STATUS_COLORS.approved,
          thumbnail: { url: thumbnailUrl },
          fields,
          footer: {
            text: 'Expresso de Hogwarts • Plataforma 9¾ — Passagem Oficial Emitida',
          },
          timestamp,
        },
      ],
    };
  }

  if (status === 'rejected') {
    const fields = [
      { name: '🎫 Bilhete de Registro', value: `\`${registrationCode}\``, inline: true },
      {
        name: '👤 Bruxo(a) (Discord)',
        value: `**${app.discord_username}**\n${discordMention}\n\`ID: ${app.discord_id}\``,
        inline: true,
      },
      { name: '🧙 Personagem', value: `**${fullName}**`, inline: true },
      {
        name: '🏰 Casa Solicitada',
        value: `**${preferredHouse.name}**`,
        inline: true,
      },
      {
        name: '⚖️ Parecer Oficial',
        value: `**${reviewedBy}**`,
        inline: true,
      },
      {
        name: '📋 Motivo / Devolutiva Ministerial',
        value:
          reviewerNotes
            ? reviewerNotes.slice(0, 1000)
            : 'Sua ficha não atendeu aos critérios vigentes do edital nesta avaliação. Revise o preenchimento e a coerência da crônica antes de uma nova submissão.',
        inline: false,
      },
      {
        name: '🕯️ Como Proceder',
        value:
          'Consulte os detalhes acima no portal **ACCIO Roleplay**, ajuste os pontos indicados e envie uma nova inscrição quando estiver pronto(a) para reavaliação.',
        inline: false,
      },
    ];

    return {
      username: channel?.username || 'Ministério da Magia',
      avatar_url: channel?.avatarUrl || DEFAULT_AVATAR_URL,
      content: app.discord_id ? `⚖️ Parecer emitido para <@${app.discord_id}> — **${fullName}**` : undefined,
      allowed_mentions: app.discord_id ? { users: [String(app.discord_id)] } : { parse: [] },
      embeds: [
        {
          title: `⚖️ DESPACHO MINISTERIAL: FICHA INDEFERIDA — ${registrationCode}`,
          description: `Após escrutínio do Departamento de Admissões do **Ministério da Magia**, o pré-registro de **${fullName}** não pôde ser homologado neste momento.`,
          color: STATUS_COLORS.rejected,
          thumbnail: { url: thumbnailUrl },
          fields,
          footer: {
            text: 'Ministério da Magia • Escritório de Registro e Admissão Arcana',
          },
          timestamp,
        },
      ],
    };
  }

  // status === 'pending'
  const isReturningToReview = previousStatus === 'approved' || previousStatus === 'rejected';
  const fields = [
    { name: '🎫 Bilhete do Expresso', value: `\`${registrationCode}\``, inline: true },
    {
      name: '👤 Bruxo(a) (Discord)',
      value: `**${app.discord_username}**\n${discordMention}\n\`ID: ${app.discord_id}\``,
      inline: true,
    },
    {
      name: '🏰 Casa Solicitada',
      value: `**${preferredHouse.name}**\n*${preferredHouse.motto}*`,
      inline: true,
    },
    { name: '🧙 Nome do Personagem', value: `**${fullName}**`, inline: true },
    {
      name: '🩸 Linhagem & Dormitório',
      value: `${formatBloodStatus(app.blood_status)} • ${formatDormitory(app.dormitory)}`,
      inline: true,
    },
    {
      name: '🎂 Nascimento & Origem',
      value: `${app.birth_date} em **${app.birth_place}**`,
      inline: true,
    },
    {
      name: '🪄 Varinha Escolhida',
      value: `Madeira: **${app.wand_wood}**\nNúcleo: **${app.wand_core}**\nComprimento: **${app.wand_length}**\nFlexibilidade: **${app.wand_flexibility}**`,
      inline: false,
    },
  ];

  if (previewStory) {
    fields.push({
      name: `📖 Crônica do Personagem (${wordCount.toLocaleString('pt-BR')} palavras)`,
      value: previewStory,
      inline: false,
    });
  }

  if (reviewerNotes) {
    fields.push({
      name: '📝 Nota do Cartório Ministerial',
      value: reviewerNotes.slice(0, 1000),
      inline: false,
    });
  }

  fields.push(
    {
      name: '⏳ Status Ministerial',
      value: isReturningToReview
        ? '**Retornada para Reanálise da Equipe**'
        : '**Em Análise da Magizoologia & Whitelist**',
      inline: true,
    },
    {
      name: '🎮 Servidor',
      value: '⚡ **ACCIO Roleplay (Arcane MP)**',
      inline: true,
    }
  );

  return {
    username: channel?.username || 'Ministério da Magia',
    avatar_url: channel?.avatarUrl || DEFAULT_AVATAR_URL,
    content: app.discord_id
      ? isReturningToReview
        ? `⏳ Ficha de <@${app.discord_id}> (**${fullName}**) retornou à fila de análise ministerial.`
        : `📜 Novo pergaminho recebido de <@${app.discord_id}> — **${fullName}** aguarda análise ministerial.`
      : undefined,
    allowed_mentions: app.discord_id ? { users: [String(app.discord_id)] } : { parse: [] },
    embeds: [
      {
        title: isReturningToReview
          ? `⏳ FICHA RETORNADA PARA ANÁLISE MINISTERIAL — ${registrationCode}`
          : `⏳ NOVO PRÉ-REGISTRO EM ANÁLISE MINISTERIAL — ${registrationCode}`,
        description: isReturningToReview
          ? `O pergaminho de **${fullName}** foi reencaminhado ao arquivo de pendências por **${reviewedBy}** e aguarda nova deliberação.`
          : `Um novo bruxo protocolou sua crônica oficial no **Ministério da Magia** e aguarda triagem para embarque no **Expresso de Hogwarts**!`,
        color: STATUS_COLORS.pending,
        thumbnail: { url: thumbnailUrl },
        fields,
        footer: {
          text: 'Ministério da Magia • Protocolo de Triagem & Whitelist Oficial',
        },
        timestamp,
      },
    ],
  };
}

export async function sendApplicationStatusToDiscord(
  app: CharacterApplication,
  options: BuildWebhookPayloadOptions = {}
): Promise<boolean> {
  const status = normalizeWebhookStatus(options.status || app.status || 'pending');
  if (!status) return false;

  const channel = resolveWebhookChannelConfig(status);
  if (!channel) return false;

  try {
    const payload = buildApplicationStatusWebhookPayload(app, {
      ...options,
      status,
      channelConfig: channel,
    });

    const res = await fetch(channel.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    return res.ok || res.status === 204;
  } catch (err) {
    console.error(`Falha ao despachar webhook (${status}) para o Discord:`, err);
    return false;
  }
}

export const sendRegistrationToDiscord = async (app: CharacterApplication): Promise<boolean> => {
  return sendApplicationStatusToDiscord(app, { status: 'pending' });
};
