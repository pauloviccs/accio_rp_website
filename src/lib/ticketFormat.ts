import { CharacterApplication } from '../types';

/**
 * Formata o número decorativo sequencial do Bilhete do Expresso (#ACCIO-0001, #ACCIO-0002, ...).
 * Não deve ser confundido com o Código Único de Sincronização in-game (ACCIO-XXXXXXXX).
 */
export function formatTicketNumber(
  app?: Pick<CharacterApplication, 'registration_number' | 'id'> | null
): string {
  const regNum = Number(app?.registration_number);
  if (Number.isFinite(regNum) && regNum > 0) {
    return `#ACCIO-${String(Math.trunc(regNum)).padStart(4, '0')}`;
  }
  const shortId = app?.id
    ? String(app.id).replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase()
    : '';
  return shortId ? `#ACCIO-${shortId}` : '#ACCIO-PIONEER';
}

