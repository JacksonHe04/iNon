'use client';

import { InstancedAsset } from '@/components/world/ArchiveAsset';
import { QUATERNIUS_NATURE_ROOT } from '@/components/world/QuaterniusForest';
import { archiveHomeGroundTransform } from '@/components/world/archiveHomeGroundMath';

type Placement = readonly [x: number, z: number, rotation: number, scale: number];

function transforms(placements: readonly Placement[]) {
  return placements.map(([x, z, rotation, scale]) => (
    archiveHomeGroundTransform(x, z, rotation, scale)
  ));
}

const FLOWERING_SHRUBS = transforms([
  [4.2, -6.8, 0.2, 0.76], [7.1, -7.1, -0.5, 0.86],
  [10.2, -6.1, 0.8, 0.72], [12.9, -4.2, -0.3, 0.82],
]);

const FLOWER_GROUPS_3 = transforms([
  [3.8, -8.8, 0.12, 0.7], [5.8, -8.6, -0.16, 0.76],
  [7.8, -8.4, 0.3, 0.68], [9.8, -7.7, -0.42, 0.78],
  [11.8, -6.7, 0.52, 0.72], [13.7, -5.1, -0.22, 0.74],
  [-14.4, -6.8, 0.7, 0.58], [-14.1, -2.8, -0.2, 0.64],
]);

const FLOWER_GROUPS_4 = transforms([
  [4, 17.4, -0.18, 0.4], [5.6, 18.2, 0.48, 0.36],
  [7.7, 16.9, -0.38, 0.42], [10.8, 18.1, 0.72, 0.38],
  [14.4, 16.5, -0.1, 0.4], [-14.2, 3.2, 0.34, 0.44],
]);

const CLOVER_1 = transforms([
  [-13.8, -8.6, 0.2, 0.64], [-11.2, -8.9, -0.5, 0.72],
  [-8.2, -9.1, 0.8, 0.62], [-5.3, -8.7, -0.3, 0.7],
  [14.6, -8.2, 0.4, 0.68], [15.1, -5.1, -0.7, 0.72],
]);

const CLOVER_2 = transforms([
  [-14.2, 7.1, -0.4, 0.72], [-14.6, 10.2, 0.6, 0.64],
  [-14.8, 19.2, -0.2, 0.68], [-12.7, 22.7, 0.8, 0.7],
  [14.8, 19.6, -0.5, 0.64], [12.7, 22.8, 0.3, 0.7],
]);

const COMMON_TALL_GRASS = transforms([
  [-15.1, -7.4, 0.2, 0.72], [-15.2, -4.4, -0.5, 0.8],
  [-15, -0.8, 0.8, 0.68], [-15.2, 6.1, -0.3, 0.74],
  [-15.1, 9.4, 0.4, 0.8], [-15.2, 20.4, -0.7, 0.74],
  [15.8, -7.4, 0.3, 0.78], [15.9, -3.8, -0.2, 0.7],
  [16, 0, 0.6, 0.76], [15.9, 18.1, -0.4, 0.72],
  [15.6, 21.7, 0.8, 0.8], [8.7, 24.9, -0.5, 0.68],
]);

const WISPY_TALL_GRASS = transforms([
  [-14.5, -5.8, 0.4, 0.78], [-14.7, -1.8, -0.6, 0.86],
  [-14.4, 2.1, 0.7, 0.74], [-14.6, 5.2, -0.3, 0.8],
  [-14.8, 8.7, 0.2, 0.84], [-14.6, 21.5, -0.7, 0.78],
  [-10.1, 24.5, 0.5, 0.72], [-6.3, 24.7, -0.2, 0.76],
]);

const EDGE_PLANTS_1 = transforms([
  [-13.4, -9.4, 0.2, 0.72], [-9.5, -9.5, -0.5, 0.82],
  [-5.8, -9.3, 0.8, 0.7], [5.7, -9.2, -0.3, 0.8],
  [9.6, -9.1, 0.4, 0.74], [13.4, -8.8, -0.7, 0.78],
]);

const EDGE_PLANTS_7 = transforms([
  [-15.1, 12.2, 0.2, 0.66], [-15, 18.1, -0.5, 0.72],
  [15.5, 2.8, 0.8, 0.7], [15.7, 17.2, -0.3, 0.68],
  [15.3, 23.2, 0.4, 0.74], [4.8, 24.8, -0.7, 0.66],
]);

const PATH_SMALL_1 = transforms([
  [-2.1, 8.1, 0.1, 0.82], [-2.2, 14.5, -0.18, 0.76], [-1.9, 20.7, 0.24, 0.8],
]);
const PATH_SMALL_2 = transforms([
  [-2.3, 10.3, -0.2, 0.78], [-1.9, 16.6, 0.18, 0.82], [-2.2, 22.8, -0.12, 0.78],
]);
const PATH_SMALL_3 = transforms([
  [-1.9, 12.4, 0.16, 0.8], [-2.2, 18.7, -0.2, 0.76], [-1.8, 24.7, 0.1, 0.82],
]);
const PATH_THRESHOLD = transforms([[-2.2, 6.3, 0.03, 0.86]]);
const PATH_GATE = transforms([[-2, 25.8, -0.05, 0.82]]);

function natureAsset(file: string, placements: import('three').Matrix4[]) {
  return <InstancedAsset src={`${QUATERNIUS_NATURE_ROOT}/${file}.gltf`} transforms={placements} />;
}

export default function ArchiveHomeEcology() {
  return (
    <group name="layered-coastal-home-ecology">
      {natureAsset('Bush_Common_Flowers', FLOWERING_SHRUBS)}
      {natureAsset('Flower_3_Group', FLOWER_GROUPS_3)}
      {natureAsset('Flower_4_Group', FLOWER_GROUPS_4)}
      {natureAsset('Clover_1', CLOVER_1)}
      {natureAsset('Clover_2', CLOVER_2)}
      {natureAsset('Grass_Common_Tall', COMMON_TALL_GRASS)}
      {natureAsset('Grass_Wispy_Tall', WISPY_TALL_GRASS)}
      {natureAsset('Plant_1_Big', EDGE_PLANTS_1)}
      {natureAsset('Plant_7_Big', EDGE_PLANTS_7)}
      {natureAsset('RockPath_Round_Small_1', PATH_SMALL_1)}
      {natureAsset('RockPath_Round_Small_2', PATH_SMALL_2)}
      {natureAsset('RockPath_Round_Small_3', PATH_SMALL_3)}
      {natureAsset('RockPath_Round_Thin', PATH_THRESHOLD)}
      {natureAsset('RockPath_Round_Wide', PATH_GATE)}
    </group>
  );
}
