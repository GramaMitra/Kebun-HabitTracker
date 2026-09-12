import raw from '../data/plantSpecies.json';

export const PLANT_SPECIES = raw;
export const SPECIES_BY_ID = Object.fromEntries(raw.map((s) => [s.id, s]));