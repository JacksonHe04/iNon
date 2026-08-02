export const WATER_LEVEL = -1.05;
export const TERRAIN_CHUNK_SIZE = 84;
export const TERRAIN_SEGMENTS = 32;
export const WORLD_KEEPSAKE_COUNT = 18;
export const RIVER_BRIDGE_POSITION = [59, 2.5, -160] as const;
export const WORLD_HOME_POSITION = [-11, 0, 3] as const;
export const WORLD_PLAYER_SPAWN = [-13, 1.45, 28] as const;
export const WORLD_MOUNTAIN_SUMMIT_POSITION = [105, 0, -58] as const;
export const WORLD_TIDAL_COVE_POSITION = [-27, 0, -98] as const;

export const WORLD_INFRASTRUCTURE_CLEARINGS = [
  [RIVER_BRIDGE_POSITION[0], RIVER_BRIDGE_POSITION[2], 18],
  [WORLD_HOME_POSITION[0], WORLD_HOME_POSITION[2], 34],
  [WORLD_TIDAL_COVE_POSITION[0], WORLD_TIDAL_COVE_POSITION[2], 18],
] as const;

export const WORLD_KEEPSAKES = [
  ['field-01', 0, 16],
  ['field-02', -10, 7],
  ['field-03', 18, -7],
  ['field-04', 39, -24],
  ['field-05', -31, -18],
  ['field-06', -82, -48],
  ['field-07', WORLD_MOUNTAIN_SUMMIT_POSITION[0], WORLD_MOUNTAIN_SUMMIT_POSITION[2]],
  ['field-08', -122, -112],
  ['field-09', 112, -142],
  ['field-10', 150, -162],
  ['field-11', -180, 94],
  ['field-12', 187, 116],
  ['field-13', 8, -217],
  ['field-14', 74, 48],
  ['field-15', 113, 26],
  ['field-16', -67, 82],
  ['field-17', -137, 32],
  ['field-18', 36, -118],
] as const;
