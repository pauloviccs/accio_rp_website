import { CharacterApplication } from '../types';
import { DISCORD_WEBHOOK_URL, HOUSES } from './constants';
import { formatTicketNumber } from './ticketFormat';

export const sendRegistrationToDiscord = async (app: CharacterApplication): Promise<boolean> => {
  try {
    const house = HOUSES[app.preferred_house] || HOUSES.gryffindor;
    const registrationCode = formatTicketNumber(app);

    // Mapeamento cromático para os embeds do Discord
    const houseColors: Record<string, number> = {
      gryffindor: 0x9C1B28,
      slytherin: 0x1A6B3C,
      ravenclaw: 0x0B4F8A,
      hufflepuff: 0xD4A844,
    };
    const embedColor = houseColors[app.preferred_house] || 0xFFC34F;

    // Resumo da história (primeiros 450 caracteres)
    const previewStory = app.character_backstory.length > 450
      ? app.character_backstory.slice(0, 450).trim() + `...\n\n*(📜 Crônica completa com **${app.word_count.toLocaleString('pt-BR')}** palavras disponível no Painel Ministerial)*`
      : app.character_backstory;

    const bloodStatusLabel =
      app.blood_status === 'pure-blood' ? 'Sangue Puro 🩸' :
        app.blood_status === 'half-blood' ? 'Mestiço ⚖️' : 'Nascido Trouxa 📜';

    const payload = {
      username: 'ACCIO Roleplay — Ministério da Magia',
      avatar_url: 'https://btxwhsbccfwhajrmopzm.supabase.co/storage/v1/object/public/assets/logohigh.jpg',
      embeds: [
        {
          title: `📜 NOVO PRÉ-REGISTRO SUBMETIDO — ${registrationCode}`,
          description: `Um novo bruxo garantiu seu lugar no Expresso de Hogwarts e submeteu sua crônica oficial para o servidor **ACCIO Roleplay (Arcane MP)**!`,
          color: embedColor,
          thumbnail: {
            url: app.discord_avatar || 'https://btxwhsbccfwhajrmopzm.supabase.co/storage/v1/object/public/assets/logohigh.jpg'
          },
          fields: [
            {
              name: '🎫 Bilhete do Expresso',
              value: `\`${registrationCode}\``,
              inline: true
            },
            {
              name: '👤 Bruxo (Discord)',
              value: `**${app.discord_username}**\n<@${app.discord_id}>\n\`ID: ${app.discord_id}\``,
              inline: true
            },
            {
              name: '🏰 Casa Solicitada',
              value: `**${house.name}**\n*${house.motto}*`,
              inline: true
            },
            {
              name: '🧙 Nome do Personagem',
              value: `**${app.first_name} ${app.last_name}**`,
              inline: true
            },
            {
              name: '🩸 Linhagem Mágica',
              value: bloodStatusLabel,
              inline: true
            },
            {
              name: '🎂 Nascimento & Origem',
              value: `${app.birth_date} em **${app.birth_place}**`,
              inline: true
            },
            {
              name: '🪄 Varinha Escolhida',
              value: `Madeira: **${app.wand_wood}**\nNúcleo: **${app.wand_core}**\nComprimento: **${app.wand_length}**\nFlexibilidade: **${app.wand_flexibility}**`,
              inline: false
            },
            {
              name: `📖 Crônica do Personagem (${app.word_count.toLocaleString('pt-BR')} palavras)`,
              value: previewStory,
              inline: false
            },
            {
              name: '⚖️ Status Ministerial',
              value: '⏳ **Em Análise da Magizoologia & Whitelist**',
              inline: true
            },
            {
              name: '🎮 Framework do Servidor',
              value: '⚡ **Arcane MP (Hogwarts Legacy)**',
              inline: true
            }
          ],
          footer: {
            text: 'ACCIO Roleplay • Sistema de Pré-Registro & Whitelist Oficial'
          },
          timestamp: new Date().toISOString()
        }
      ]
    };

    const res = await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    return res.ok || res.status === 204;
  } catch (err) {
    console.error('Falha ao despachar webhook para o Discord:', err);
    return false;
  }
};

