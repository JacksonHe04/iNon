export type AnimalSpecies =
  | 'alpaca'
  | 'bull'
  | 'cow'
  | 'deer'
  | 'donkey'
  | 'fox'
  | 'husky'
  | 'stag'
  | 'wolf';

export interface AnimalConfig {
  id: string;
  species: AnimalSpecies;
  offset: readonly [number, number];
  scale: number;
  phase: number;
}

export const ANIMAL_FILES: Record<AnimalSpecies, string> = {
  alpaca: 'Alpaca.glb',
  bull: 'Bull.glb',
  cow: 'Cow.glb',
  deer: 'Deer.glb',
  donkey: 'Donkey.glb',
  fox: 'Fox.glb',
  husky: 'Husky.glb',
  stag: 'Stag.glb',
  wolf: 'Wolf.glb',
};

export const ANIMAL_BEHAVIOUR: Record<AnimalSpecies, {
  fleeDistance: number;
  roamingSpeed: number;
  fleeingSpeed: number;
  materialTone: number;
}> = {
  alpaca: { fleeDistance: 10, roamingSpeed: 0.92, fleeingSpeed: 5.2, materialTone: 0.82 },
  bull: { fleeDistance: 15, roamingSpeed: 0.78, fleeingSpeed: 5.6, materialTone: 0.72 },
  cow: { fleeDistance: 10, roamingSpeed: 0.76, fleeingSpeed: 4.9, materialTone: 0.8 },
  deer: { fleeDistance: 12, roamingSpeed: 1.05, fleeingSpeed: 7.1, materialTone: 0.76 },
  donkey: { fleeDistance: 8, roamingSpeed: 0.84, fleeingSpeed: 4.8, materialTone: 0.78 },
  fox: { fleeDistance: 9, roamingSpeed: 1.28, fleeingSpeed: 6.2, materialTone: 0.72 },
  husky: { fleeDistance: 7, roamingSpeed: 1.18, fleeingSpeed: 6.4, materialTone: 0.76 },
  stag: { fleeDistance: 14, roamingSpeed: 1.02, fleeingSpeed: 7.4, materialTone: 0.72 },
  wolf: { fleeDistance: 8, roamingSpeed: 1.2, fleeingSpeed: 6.6, materialTone: 0.68 },
};

export const WORLD_ANIMALS: readonly AnimalConfig[] = [
  { id: 'bull-lowland', species: 'bull', offset: [38, -18], scale: 0.82, phase: 2.2 },
  { id: 'cow-lowland', species: 'cow', offset: [46, -12], scale: 0.8, phase: 5.3 },
  { id: 'husky-trail', species: 'husky', offset: [-54, 28], scale: 0.66, phase: 3.7 },
  { id: 'doe-near', species: 'deer', offset: [63, -43], scale: 0.78, phase: 0.3 },
  { id: 'doe-far', species: 'deer', offset: [71, -49], scale: 0.72, phase: 1.7 },
  { id: 'doe-young', species: 'deer', offset: [58, -51], scale: 0.6, phase: 3.1 },
  { id: 'fox-ridge', species: 'fox', offset: [-31, 26], scale: 0.62, phase: 4.4 },
  { id: 'fox-wood', species: 'fox', offset: [-39, 38], scale: 0.56, phase: 5.8 },
  { id: 'stag-north', species: 'stag', offset: [46, 62], scale: 0.86, phase: 2.5 },
  { id: 'stag-mist', species: 'stag', offset: [54, 69], scale: 0.8, phase: 5.1 },
  { id: 'wolf-high', species: 'wolf', offset: [-74, -62], scale: 0.68, phase: 1.2 },
  { id: 'wolf-pine', species: 'wolf', offset: [-81, -56], scale: 0.64, phase: 3.8 },
  { id: 'alpaca-meadow', species: 'alpaca', offset: [32, 30], scale: 0.72, phase: 0.8 },
  { id: 'alpaca-young', species: 'alpaca', offset: [38, 35], scale: 0.61, phase: 4.7 },
  { id: 'donkey-home', species: 'donkey', offset: [-24, 15], scale: 0.7, phase: 2.9 },
] as const;
