import { CharacterApplication, HouseId } from '../types';
import { HOUSES } from './constants';

const VALID_HOUSE_IDS: HouseId[] = ['gryffindor', 'slytherin', 'ravenclaw', 'hufflepuff'];

export function normalizeHouseId(raw?: string | null): HouseId | null {
  if (!raw) return null;
  const clean = String(raw).trim().toLowerCase() as HouseId;
  return VALID_HOUSE_IDS.includes(clean) ? clean : null;
}

export interface EffectiveHouseResolution {
  houseKey: HouseId;
  houseInfo: (typeof HOUSES)[HouseId];
  isSortedOfficial: boolean;
  preferredHouseKey: HouseId;
  preferredHouseInfo: (typeof HOUSES)[HouseId];
  differsFromPreferred: boolean;
  secondaryHouseInfo: (typeof HOUSES)[HouseId] | null;
}

/**
 * Resolve a Casa ativa de uma candidatura priorizando a casa oficial confirmada in-game (`sorted_house`)
 * sobre a escolha inicial feita no pré-registro (`preferred_house`).
 */
export function resolveEffectiveHouse(app?: CharacterApplication | null): EffectiveHouseResolution {
  const preferredKey = normalizeHouseId(app?.preferred_house) || 'gryffindor';
  const sortedKey = normalizeHouseId(app?.sorted_house);
  const houseKey = sortedKey || preferredKey;
  const secondaryKey = normalizeHouseId(app?.secondary_house);

  return {
    houseKey,
    houseInfo: HOUSES[houseKey] || HOUSES.gryffindor,
    isSortedOfficial: Boolean(sortedKey),
    preferredHouseKey: preferredKey,
    preferredHouseInfo: HOUSES[preferredKey] || HOUSES.gryffindor,
    differsFromPreferred: Boolean(sortedKey && sortedKey !== preferredKey),
    secondaryHouseInfo: secondaryKey ? HOUSES[secondaryKey] : null,
  };
}

