'use client';

import {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type MutableRefObject,
} from 'react';
import { Html, useGLTF, useTexture } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import {
  BallCollider,
  CapsuleCollider,
  CuboidCollider,
  Physics,
  RigidBody,
  TrimeshCollider,
  useRapier,
  type RapierRigidBody,
} from '@react-three/rapier';
import {
  BackSide,
  BufferAttribute,
  BufferGeometry,
  Color,
  DoubleSide,
  DynamicDrawUsage,
  Fog,
  Group,
  InstancedMesh,
  Matrix4,
  Mesh,
  Object3D,
  PointLight,
  Quaternion,
  RepeatWrapping,
  ShaderMaterial,
  SRGBColorSpace,
  Vector3,
  type Material,
} from 'three';
import type { BlockType } from '@/types/layout';
import { getBlockTitle } from '@/lib/blocks/registry';
import FirstPersonExplorer from '@/components/world/FirstPersonExplorer';
import QuaterniusForest, {
  collectQuaterniusParts,
} from '@/components/world/QuaterniusForest';
import QuaterniusGroundCover from '@/components/world/QuaterniusGroundCover';
import ArchiveWildlife from '@/components/world/ArchiveWildlife';
import {
  WORLD_TRAIL_SEGMENTS,
  isInsideWorldTrail,
} from '@/components/world/archiveWorldTrails';

export interface GameDestination {
  blockType: BlockType;
  position: [number, number, number];
  number: string;
  subtitle: string;
  siteKind: 'camp' | 'workshop' | 'station' | 'watchtower' | 'sawmill' | 'record' | 'cinema' | 'cabin' | 'post';
}

export interface GameTelemetry {
  x: number;
  y: number;
  z: number;
  heading: number;
  speed: number;
  stamina: number;
  inWater: boolean;
  mounted: boolean;
  canMount: boolean;
  terrain: 'village' | 'forest' | 'mountain' | 'river';
}

export interface GameTravelRequest {
  id: number;
  position: [number, number, number];
  yaw?: number;
}

interface ArchiveGameSceneProps {
  entered: boolean;
  destinations: GameDestination[];
  playerPosition: MutableRefObject<Vector3>;
  travelRequest: GameTravelRequest | null;
  onOpen: (type: BlockType) => void;
  onNearby: (destination: GameDestination | null) => void;
  onTelemetry: (telemetry: GameTelemetry) => void;
  onDiagnostics: (message: string) => void;
  collectedKeepsakes: string[];
  onCollectKeepsake: (id: string) => void;
}

const WATER_LEVEL = -1.05;
const TERRAIN_CHUNK_SIZE = 84;
const TERRAIN_SEGMENTS = 22;
const HORSE_POSITION = new Vector3(3.4, 0, 19);
export const WORLD_KEEPSAKE_COUNT = 18;
export const RIVER_BRIDGE_POSITION = [59, 2.5, -160] as const;

const WORLD_INFRASTRUCTURE_CLEARINGS = [
  [RIVER_BRIDGE_POSITION[0], RIVER_BRIDGE_POSITION[2], 18],
] as const;

const WORLD_TRAIL_GLSL = WORLD_TRAIL_SEGMENTS.map(
  ({ start, end, halfWidth }) =>
    `distance = min(distance, segmentDistance(point, vec2(${start[0].toFixed(1)}, ${start[1].toFixed(1)}), vec2(${end[0].toFixed(1)}, ${end[1].toFixed(1)})) / ${halfWidth.toFixed(2)});`,
).join('\n');

const WORLD_KEEPSAKES = [
  ['field-01', 0, 16],
  ['field-02', -10, 7],
  ['field-03', 18, -7],
  ['field-04', 39, -24],
  ['field-05', -31, -18],
  ['field-06', -82, -48],
  ['field-07', 76, -88],
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

function smoothstep(edge0: number, edge1: number, value: number) {
  const amount = Math.max(0, Math.min(1, (value - edge0) / (edge1 - edge0)));
  return amount * amount * (3 - 2 * amount);
}

const FIELD_SITE_PLATEAUS = [
  [-18, 13],
  [54, -34],
  [-112, -62],
  [96, -122],
  [-158, -148],
  [146, -176],
  [-206, 116],
  [214, 132],
  [18, -258],
] as const;

function rawTerrainHeightAt(x: number, z: number) {
  const villageDistance = Math.hypot(x, z + 3);
  const wilderness = smoothstep(16, 44, villageDistance);
  const broad =
    Math.sin(x * 0.027) * 2.3 +
    Math.cos(z * 0.031) * 1.85 +
    Math.sin((x + z) * 0.014) * 3.1;
  const ridges = Math.pow(Math.max(0, Math.sin(x * 0.009 - z * 0.012)), 3) * 8.8;
  const mountainMass = Math.pow(
    Math.max(0, Math.sin(x * 0.011 + 0.7) + Math.cos(z * 0.008 - 0.4) - 0.58),
    2,
  ) * 7.5;
  const riverCenter = 78 + Math.sin(z * 0.018) * 38 + Math.sin(z * 0.004) * 16;
  const riverDistance = Math.abs(x - riverCenter);
  const riverInfluence = 1 - smoothstep(3.5, 17, riverDistance);
  const riverCut = riverInfluence * 7.2;
  const rollingGround = 0.4 + broad + ridges + mountainMass - riverCut;
  const dryGround = Math.max(-0.42, rollingGround);
  return (dryGround * (1 - riverInfluence) + rollingGround * riverInfluence) * wilderness;
}

export function terrainHeightAt(x: number, z: number) {
  let height = rawTerrainHeightAt(x, z);

  for (const [siteX, siteZ] of FIELD_SITE_PLATEAUS) {
    const distance = Math.hypot(x - siteX, z - siteZ);
    if (distance >= 16) continue;

    const siteHeight = rawTerrainHeightAt(siteX, siteZ);
    const flattening = 1 - smoothstep(7, 16, distance);
    height += (siteHeight - height) * flattening;
  }

  return height;
}

function terrainKindAt(x: number, z: number, height: number): GameTelemetry['terrain'] {
  if (height <= WATER_LEVEL + 0.18) return 'river';
  if (Math.hypot(x, z + 3) < 58) return 'village';
  if (height > 4.5) return 'mountain';
  return 'forest';
}

const terrainVertex = /* glsl */ `
  uniform float uTime;
  varying vec3 vWorld;
  varying float vGrain;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorld = world.xyz;
    vGrain = hash(floor(world.xz * 1.8) + floor(uTime * 4.0));
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const waterVertex = /* glsl */ `
  uniform float uTime;
  varying float vWave;
  varying vec3 vWorld;

  void main() {
    vec3 displaced = position;
    float wave = sin(position.x * 0.07 + uTime * 0.48) * 0.07;
    wave += cos(position.y * 0.09 - uTime * 0.34) * 0.055;
    displaced.z += wave;
    vWave = wave;
    vec4 world = modelMatrix * vec4(displaced, 1.0);
    vWorld = world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const waterFragment = /* glsl */ `
  uniform float uTime;
  varying float vWave;
  varying vec3 vWorld;

  void main() {
    float ripple = 0.5 + 0.5 * sin(vWorld.x * 0.11 + vWorld.z * 0.08 + uTime * 0.32);
    vec3 deep = vec3(0.075, 0.18, 0.15);
    vec3 faded = vec3(0.28, 0.42, 0.34);
    vec3 color = mix(deep, faded, 0.25 + ripple * 0.24 + vWave * 1.8);
    gl_FragColor = vec4(color, 0.82);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

const terrainFragment = /* glsl */ `
  uniform float uTime;
  uniform sampler2D uGround;
  uniform vec3 uMoss;
  uniform vec3 uForest;
  uniform vec3 uPath;
  varying vec3 vWorld;
  varying float vGrain;

  float segmentDistance(vec2 point, vec2 start, vec2 end) {
    vec2 segment = end - start;
    float amount = clamp(dot(point - start, segment) / dot(segment, segment), 0.0, 1.0);
    return length(point - (start + segment * amount));
  }

  float worldTrailDistance(vec2 point) {
    float distance = 9999.0;
    ${WORLD_TRAIL_GLSL}
    return distance;
  }

  void main() {
    float waves = sin(vWorld.x * 0.035 + uTime * 0.04) * cos(vWorld.z * 0.04);
    float trailDistance = worldTrailDistance(vWorld.xz);
    float pathMask = 1.0 - smoothstep(0.72, 1.22, trailDistance);
    float pathCore = 1.0 - smoothstep(0.22, 0.76, trailDistance);
    float pathWear = 0.82 + 0.18 * sin(vWorld.x * 1.7 + vWorld.z * 2.1);
    vec3 ground = mix(uForest, uMoss, 0.52 + waves * 0.14);
    ground = mix(ground, uPath, pathMask * (0.26 + pathCore * 0.16) * pathWear);
    vec3 forestFloor = texture2D(uGround, vWorld.xz * 0.035).rgb;
    forestFloor *= vec3(0.50, 0.82, 0.54);
    ground = mix(ground, forestFloor, 0.52);
    ground += (vGrain - 0.5) * 0.055;
    gl_FragColor = vec4(ground, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

const weatherVertex = /* glsl */ `
  uniform float uTime;
  varying float vPulse;

  void main() {
    vec3 origin = (instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
    vec3 localVertex = (instanceMatrix * vec4(position, 0.0)).xyz;
    float phase = origin.x * 0.71 + origin.y * 1.13 + origin.z * 0.53;
    origin.x += sin(uTime * 0.24 + phase) * 0.8;
    origin.y = mod(origin.y - uTime * (0.7 + fract(phase) * 0.8) + 18.0, 20.0) - 2.0;
    origin.z += cos(uTime * 0.19 + phase) * 0.55;
    vPulse = 0.42 + 0.58 * sin(uTime * 5.7 + phase * 4.0);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(origin + localVertex, 1.0);
  }
`;

const weatherFragment = /* glsl */ `
  uniform vec3 uPaper;
  uniform vec3 uOchre;
  varying float vPulse;

  void main() {
    vec3 color = mix(uPaper, uOchre, max(0.0, vPulse) * 0.18);
    gl_FragColor = vec4(color, 0.08 + max(0.0, vPulse) * 0.42);
  }
`;

const campfireVertex = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const campfireFragment = /* glsl */ `
  uniform float uTime;
  varying vec2 vUv;

  float hash(vec2 point) {
    return fract(sin(dot(point, vec2(127.1, 311.7))) * 43758.5453);
  }

  void main() {
    float height = clamp(vUv.y, 0.0, 1.0);
    float sway = sin(uTime * 4.1 + height * 8.0) * 0.055 * height;
    sway += sin(uTime * 7.7 - height * 12.0) * 0.024;
    float width = mix(0.45, 0.055, pow(height, 1.28));
    float edge = abs(vUv.x - 0.5 + sway);
    float flame = 1.0 - smoothstep(width * 0.72, width, edge);
    flame *= smoothstep(0.0, 0.08, height) * (1.0 - smoothstep(0.8, 1.0, height));
    float grain = hash(floor(vUv * vec2(18.0, 26.0)) + floor(uTime * 10.0));
    flame *= 0.78 + grain * 0.22;
    if (flame < 0.025) discard;
    vec3 ember = vec3(0.66, 0.16, 0.045);
    vec3 gold = vec3(1.0, 0.64, 0.19);
    vec3 color = mix(gold, ember, smoothstep(0.12, 0.88, height));
    gl_FragColor = vec4(color, flame * 0.88);
  }
`;

function seededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function coordinateSeed(x: number, z: number) {
  return ((x * 73856093) ^ (z * 19349663) ^ 0x9e3779b9) >>> 0;
}

interface TerrainTileData {
  key: string;
  centerX: number;
  centerZ: number;
  vertices: Float32Array;
  indices: Uint32Array;
  geometry: BufferGeometry;
}

function buildTerrainTile(chunkX: number, chunkZ: number): TerrainTileData {
  const centerX = chunkX * TERRAIN_CHUNK_SIZE;
  const centerZ = chunkZ * TERRAIN_CHUNK_SIZE;
  const row = TERRAIN_SEGMENTS + 1;
  const vertices = new Float32Array(row * row * 3);
  const indices = new Uint32Array(TERRAIN_SEGMENTS * TERRAIN_SEGMENTS * 6);
  let vertexIndex = 0;
  for (let zIndex = 0; zIndex <= TERRAIN_SEGMENTS; zIndex += 1) {
    const localZ = (zIndex / TERRAIN_SEGMENTS - 0.5) * TERRAIN_CHUNK_SIZE;
    for (let xIndex = 0; xIndex <= TERRAIN_SEGMENTS; xIndex += 1) {
      const localX = (xIndex / TERRAIN_SEGMENTS - 0.5) * TERRAIN_CHUNK_SIZE;
      vertices[vertexIndex] = localX;
      vertices[vertexIndex + 1] = terrainHeightAt(centerX + localX, centerZ + localZ);
      vertices[vertexIndex + 2] = localZ;
      vertexIndex += 3;
    }
  }
  let index = 0;
  for (let zIndex = 0; zIndex < TERRAIN_SEGMENTS; zIndex += 1) {
    for (let xIndex = 0; xIndex < TERRAIN_SEGMENTS; xIndex += 1) {
      const a = zIndex * row + xIndex;
      const b = a + 1;
      const c = a + row;
      const d = c + 1;
      indices[index] = a;
      indices[index + 1] = c;
      indices[index + 2] = b;
      indices[index + 3] = b;
      indices[index + 4] = c;
      indices[index + 5] = d;
      index += 6;
    }
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(vertices, 3));
  geometry.setIndex(new BufferAttribute(indices, 1));
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  return { key: `${chunkX}:${chunkZ}`, centerX, centerZ, vertices, indices, geometry };
}

function terrainTilesAround(chunkX: number, chunkZ: number) {
  const tiles: TerrainTileData[] = [];
  for (let offsetX = -1; offsetX <= 1; offsetX += 1) {
    for (let offsetZ = -1; offsetZ <= 1; offsetZ += 1) {
      tiles.push(buildTerrainTile(chunkX + offsetX, chunkZ + offsetZ));
    }
  }
  return tiles;
}

function InfiniteTerrain({ playerPosition }: { playerPosition: MutableRefObject<Vector3> }) {
  const [chunk, setChunk] = useState({ x: 0, z: 0 });
  const chunkRef = useRef(chunk);
  const material = useRef<ShaderMaterial>(null);
  const groundTexture = useTexture('/archive-world/forest-floor-albedo-v2.webp');
  groundTexture.wrapS = RepeatWrapping;
  groundTexture.wrapT = RepeatWrapping;
  groundTexture.colorSpace = SRGBColorSpace;
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uGround: { value: groundTexture },
      uMoss: { value: new Color('#62785c') },
      uForest: { value: new Color('#243d2d') },
      uPath: { value: new Color('#9a8b67') },
    }),
    [groundTexture],
  );
  const tiles = useMemo(() => terrainTilesAround(chunk.x, chunk.z), [chunk.x, chunk.z]);

  useFrame(({ clock }) => {
    if (material.current) material.current.uniforms.uTime.value = clock.elapsedTime;
    const x = Math.round(playerPosition.current.x / TERRAIN_CHUNK_SIZE);
    const z = Math.round(playerPosition.current.z / TERRAIN_CHUNK_SIZE);
    if (x !== chunkRef.current.x || z !== chunkRef.current.z) {
      chunkRef.current = { x, z };
      setChunk({ x, z });
    }
  });

  useEffect(() => () => tiles.forEach((tile) => tile.geometry.dispose()), [tiles]);

  return (
    <group>
      {tiles.map((tile, index) => (
        <RigidBody key={tile.key} type="fixed" colliders={false} position={[tile.centerX, 0, tile.centerZ]}>
          <TrimeshCollider args={[tile.vertices, tile.indices]} friction={1.15} />
          <mesh receiveShadow geometry={tile.geometry}>
            <shaderMaterial
              ref={index === 4 ? material : undefined}
              uniforms={uniforms}
              vertexShader={terrainVertex}
              fragmentShader={terrainFragment}
            />
          </mesh>
        </RigidBody>
      ))}
    </group>
  );
}

function MountainPanorama({ playerPosition }: { playerPosition: MutableRefObject<Vector3> }) {
  const texture = useTexture('/archive-world/verdant-mountain-panorama-v2.webp');
  const group = useRef<Group>(null);
  texture.colorSpace = SRGBColorSpace;

  useFrame(() => {
    if (!group.current) return;
    group.current.position.x = playerPosition.current.x;
    group.current.position.z = playerPosition.current.z;
  });

  return (
    <group ref={group} position={[0, 18, 0]}>
      <mesh rotation-y={Math.PI * 0.58}>
        <sphereGeometry args={[255, 64, 32]} />
        <meshBasicMaterial map={texture} side={BackSide} fog={false} toneMapped={false} />
      </mesh>
    </group>
  );
}

function InfiniteWater({ playerPosition }: { playerPosition: MutableRefObject<Vector3> }) {
  const mesh = useRef<Group>(null);
  const material = useRef<ShaderMaterial>(null);
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);

  useFrame(({ clock }) => {
    if (material.current) material.current.uniforms.uTime.value = clock.elapsedTime;
    if (!mesh.current) return;
    mesh.current.position.x = Math.round(playerPosition.current.x / 160) * 160;
    mesh.current.position.z = Math.round(playerPosition.current.z / 160) * 160;
  });

  return (
    <group ref={mesh} position={[0, WATER_LEVEL, 0]}>
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[720, 720, 96, 96]} />
        <shaderMaterial
          ref={material}
          uniforms={uniforms}
          vertexShader={waterVertex}
          fragmentShader={waterFragment}
          transparent
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

function InfiniteForest({
  playerPosition,
  destinations,
}: {
  playerPosition: MutableRefObject<Vector3>;
  destinations: GameDestination[];
}) {
  const chunkSize = 38;
  const radius = 3;
  const treesPerChunk = 18;
  const count = (radius * 2 + 1) ** 2 * treesPerChunk;
  const trunks = useRef<InstancedMesh>(null);
  const lowerCrowns = useRef<InstancedMesh>(null);
  const middleCrowns = useRef<InstancedMesh>(null);
  const upperCrowns = useRef<InstancedMesh>(null);
  const deciduousA = useRef<InstancedMesh>(null);
  const deciduousB = useRef<InstancedMesh>(null);
  const deciduousC = useRef<InstancedMesh>(null);
  const lastChunk = useRef('');
  const dummy = useMemo(() => new Object3D(), []);
  const position = useMemo(() => new Vector3(), []);
  const rotation = useMemo(() => new Quaternion(), []);
  const scale = useMemo(() => new Vector3(), []);
  const crownMatrix = useMemo(() => new Matrix4(), []);

  useFrame(() => {
    const centerX = Math.floor(playerPosition.current.x / chunkSize);
    const centerZ = Math.floor(playerPosition.current.z / chunkSize);
    const key = `${centerX}:${centerZ}`;
    if (
      key === lastChunk.current ||
      !trunks.current ||
      !lowerCrowns.current ||
      !middleCrowns.current ||
      !upperCrowns.current ||
      !deciduousA.current ||
      !deciduousB.current ||
      !deciduousC.current
    ) return;
    lastChunk.current = key;
    let instance = 0;

    for (let chunkX = centerX - radius; chunkX <= centerX + radius; chunkX += 1) {
      for (let chunkZ = centerZ - radius; chunkZ <= centerZ + radius; chunkZ += 1) {
        const random = seededRandom(coordinateSeed(chunkX, chunkZ));
        for (let tree = 0; tree < treesPerChunk; tree += 1) {
          const x = chunkX * chunkSize + random() * chunkSize;
          const z = chunkZ * chunkSize + random() * chunkSize;
          const villageDistance = Math.hypot(x, z + 2);
          const roadClearance = Math.abs(x) < 6 && z > -110 && z < 80;
          const siteClearance = destinations.some((site) => Math.hypot(x - site.position[0], z - site.position[2]) < 15);
          const visible = villageDistance > 49 && !roadClearance && !siteClearance;
          const height = 4.5 + random() * 7.5;
          const width = 0.62 + random() * 0.7;
          const isDeciduous = coordinateSeed(Math.floor(x * 8), Math.floor(z * 8)) % 10 < 4;

          const groundHeight = terrainHeightAt(x, z);
          dummy.position.set(x, visible ? groundHeight + height * 0.5 : -100, z);
          dummy.scale.set(width, height, width);
          dummy.rotation.set(0, random() * Math.PI, (random() - 0.5) * 0.025);
          dummy.updateMatrix();
          trunks.current.setMatrixAt(instance, dummy.matrix);

          dummy.matrix.decompose(position, rotation, scale);
          crownMatrix.compose(
            new Vector3(position.x, visible && !isDeciduous ? groundHeight + height * 0.62 : -100, position.z),
            rotation,
            new Vector3(width * 3.9, height * 0.36, width * 3.9),
          );
          lowerCrowns.current.setMatrixAt(instance, crownMatrix);
          crownMatrix.compose(
            new Vector3(position.x, visible && !isDeciduous ? groundHeight + height * 0.85 : -100, position.z),
            rotation,
            new Vector3(width * 3.15, height * 0.32, width * 3.15),
          );
          middleCrowns.current.setMatrixAt(instance, crownMatrix);
          crownMatrix.compose(
            new Vector3(position.x, visible && !isDeciduous ? groundHeight + height * 1.07 : -100, position.z),
            rotation,
            new Vector3(width * 2.25, height * 0.3, width * 2.25),
          );
          upperCrowns.current.setMatrixAt(instance, crownMatrix);

          const deciduousY = visible && isDeciduous ? groundHeight + height * 0.92 : -100;
          crownMatrix.compose(
            new Vector3(position.x - width * 0.95, deciduousY, position.z + width * 0.35),
            rotation,
            new Vector3(width * 2.6, height * 0.23, width * 2.35),
          );
          deciduousA.current.setMatrixAt(instance, crownMatrix);
          crownMatrix.compose(
            new Vector3(position.x + width * 0.9, deciduousY + height * 0.05, position.z),
            rotation,
            new Vector3(width * 2.45, height * 0.26, width * 2.6),
          );
          deciduousB.current.setMatrixAt(instance, crownMatrix);
          crownMatrix.compose(
            new Vector3(position.x, deciduousY + height * 0.17, position.z - width * 0.65),
            rotation,
            new Vector3(width * 2.35, height * 0.24, width * 2.3),
          );
          deciduousC.current.setMatrixAt(instance, crownMatrix);

          const shade = (coordinateSeed(Math.floor(x), Math.floor(z)) % 100) / 100;
          trunks.current.setColorAt(instance, new Color().setHSL(0.08, 0.26, 0.2 + shade * 0.08));
          const evergreen = new Color().setHSL(0.33, 0.22 + shade * 0.12, 0.2 + shade * 0.11);
          lowerCrowns.current.setColorAt(instance, evergreen);
          middleCrowns.current.setColorAt(instance, evergreen.clone().offsetHSL(0.015, 0, 0.035));
          upperCrowns.current.setColorAt(instance, evergreen.clone().offsetHSL(0.025, -0.02, 0.065));
          const leaf = new Color().setHSL(0.22 + shade * 0.08, 0.22, 0.28 + shade * 0.12);
          deciduousA.current.setColorAt(instance, leaf);
          deciduousB.current.setColorAt(instance, leaf.clone().offsetHSL(0.02, 0.02, 0.035));
          deciduousC.current.setColorAt(instance, leaf.clone().offsetHSL(-0.015, -0.01, -0.025));
          instance += 1;
        }
      }
    }

    for (const mesh of [trunks.current, lowerCrowns.current, middleCrowns.current, upperCrowns.current, deciduousA.current, deciduousB.current, deciduousC.current]) {
      mesh.instanceMatrix.setUsage(DynamicDrawUsage);
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      mesh.computeBoundingSphere();
    }
  });

  return (
    <group>
      <instancedMesh ref={trunks} args={[undefined, undefined, count]} castShadow receiveShadow>
        <cylinderGeometry args={[0.13, 0.22, 1, 7]} />
        <meshStandardMaterial vertexColors roughness={1} />
      </instancedMesh>
      <instancedMesh ref={lowerCrowns} args={[undefined, undefined, count]} castShadow receiveShadow>
        <coneGeometry args={[1, 1, 10]} />
        <meshStandardMaterial vertexColors roughness={0.98} />
      </instancedMesh>
      <instancedMesh ref={middleCrowns} args={[undefined, undefined, count]} castShadow receiveShadow>
        <coneGeometry args={[1, 1, 10]} />
        <meshStandardMaterial vertexColors roughness={0.98} />
      </instancedMesh>
      <instancedMesh ref={upperCrowns} args={[undefined, undefined, count]} castShadow receiveShadow>
        <coneGeometry args={[1, 1, 10]} />
        <meshStandardMaterial vertexColors roughness={0.98} />
      </instancedMesh>
      {[deciduousA, deciduousB, deciduousC].map((ref, index) => (
        <instancedMesh key={index} ref={ref} args={[undefined, undefined, count]} castShadow receiveShadow>
          <dodecahedronGeometry args={[1, 1]} />
          <meshStandardMaterial vertexColors roughness={0.99} />
        </instancedMesh>
      ))}
    </group>
  );
}

interface ForestColliderData {
  key: string;
  x: number;
  y: number;
  z: number;
  halfHeight: number;
  halfWidth: number;
}

function forestCollidersAround(centerX: number, centerZ: number, destinations: GameDestination[]) {
  const chunkSize = 38;
  const colliders: ForestColliderData[] = [];
  for (let chunkX = centerX - 2; chunkX <= centerX + 2; chunkX += 1) {
    for (let chunkZ = centerZ - 2; chunkZ <= centerZ + 2; chunkZ += 1) {
      const random = seededRandom(coordinateSeed(chunkX, chunkZ));
      for (let tree = 0; tree < 15; tree += 1) {
        const x = chunkX * chunkSize + random() * chunkSize;
        const z = chunkZ * chunkSize + random() * chunkSize;
        const heightScale = 0.78 + random() * 0.54;
        const widthScale = heightScale * (0.88 + random() * 0.22);
        const roadClearance = isInsideWorldTrail(x, z, 1.75);
        const siteClearance = destinations.some((site) => Math.hypot(x - site.position[0], z - site.position[2]) < 12);
        const infrastructureClearance = WORLD_INFRASTRUCTURE_CLEARINGS.some(
          ([clearX, clearZ, radius]) => Math.hypot(x - clearX, z - clearZ) < radius,
        );
        const spawnClearance = Math.hypot(x, z + 2) < 12;
        const groundHeight = terrainHeightAt(x, z);
        if (roadClearance || siteClearance || infrastructureClearance || spawnClearance || groundHeight < -0.78) continue;
        random();
        random();
        if (tree >= 11) continue;
        const halfHeight = 3.2 * heightScale;
        colliders.push({
          key: `${chunkX}:${chunkZ}:${tree}`,
          x,
          y: groundHeight + halfHeight,
          z,
          halfHeight,
          halfWidth: Math.max(0.34, widthScale * 0.44),
        });
      }
    }
  }
  return colliders;
}

function InfiniteForestColliders({
  playerPosition,
  destinations,
}: {
  playerPosition: MutableRefObject<Vector3>;
  destinations: GameDestination[];
}) {
  const [chunk, setChunk] = useState({ x: 0, z: 0 });
  const chunkRef = useRef(chunk);
  const colliders = useMemo(
    () => forestCollidersAround(chunk.x, chunk.z, destinations),
    [chunk.x, chunk.z, destinations],
  );

  useFrame(() => {
    const x = Math.floor(playerPosition.current.x / 38);
    const z = Math.floor(playerPosition.current.z / 38);
    if (x === chunkRef.current.x && z === chunkRef.current.z) return;
    chunkRef.current = { x, z };
    setChunk({ x, z });
  });

  return (
    <RigidBody type="fixed" colliders={false}>
      {colliders.map((collider) => (
        <CuboidCollider
          key={collider.key}
          args={[collider.halfWidth, collider.halfHeight, collider.halfWidth]}
          position={[collider.x, collider.y, collider.z]}
          friction={1.2}
        />
      ))}
    </RigidBody>
  );
}

function InfiniteGroundCover({
  playerPosition,
  destinations,
}: {
  playerPosition: MutableRefObject<Vector3>;
  destinations: GameDestination[];
}) {
  const chunkSize = 30;
  const radius = 2;
  const itemsPerChunk = 28;
  const count = (radius * 2 + 1) ** 2 * itemsPerChunk;
  const grass = useRef<InstancedMesh>(null);
  const shrubs = useRef<InstancedMesh>(null);
  const lastChunk = useRef('');
  const dummy = useMemo(() => new Object3D(), []);

  useFrame(() => {
    const centerX = Math.floor(playerPosition.current.x / chunkSize);
    const centerZ = Math.floor(playerPosition.current.z / chunkSize);
    const key = `${centerX}:${centerZ}`;
    if (key === lastChunk.current || !grass.current || !shrubs.current) return;
    lastChunk.current = key;
    let instance = 0;
    for (let chunkX = centerX - radius; chunkX <= centerX + radius; chunkX += 1) {
      for (let chunkZ = centerZ - radius; chunkZ <= centerZ + radius; chunkZ += 1) {
        const random = seededRandom(coordinateSeed(chunkX + 911, chunkZ - 337));
        for (let item = 0; item < itemsPerChunk; item += 1) {
          const x = chunkX * chunkSize + random() * chunkSize;
          const z = chunkZ * chunkSize + random() * chunkSize;
          const y = terrainHeightAt(x, z);
          const pathClear = Math.abs(x) < 3.2 && z > -15 && z < 25;
          const siteClear = destinations.some((site) => Math.hypot(x - site.position[0], z - site.position[2]) < 8);
          const visible = !pathClear && !siteClear && y > WATER_LEVEL + 0.2;
          const shrub = random() > 0.72;
          const scale = 0.42 + random() * 0.9;
          dummy.position.set(x, visible && !shrub ? y + scale * 0.13 : -100, z);
          dummy.scale.set(scale * 0.34, scale * 0.16, scale * 0.34);
          dummy.rotation.set((random() - 0.5) * 0.12, random() * Math.PI, (random() - 0.5) * 0.16);
          dummy.updateMatrix();
          grass.current.setMatrixAt(instance, dummy.matrix);
          grass.current.setColorAt(instance, new Color().setHSL(0.25 + random() * 0.09, 0.28, 0.3 + random() * 0.13));

          dummy.position.set(x, visible && shrub ? y + scale * 0.38 : -100, z);
          dummy.scale.set(scale * 0.7, scale * 0.42, scale * 0.7);
          dummy.rotation.set(0, random() * Math.PI, 0);
          dummy.updateMatrix();
          shrubs.current.setMatrixAt(instance, dummy.matrix);
          shrubs.current.setColorAt(instance, new Color().setHSL(0.3 + random() * 0.06, 0.2, 0.2 + random() * 0.1));
          instance += 1;
        }
      }
    }
    for (const mesh of [grass.current, shrubs.current]) {
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      mesh.computeBoundingSphere();
    }
  });

  return (
    <group>
      <instancedMesh ref={grass} args={[undefined, undefined, count]} castShadow>
        <sphereGeometry args={[1, 5, 4]} />
        <meshStandardMaterial vertexColors roughness={1} />
      </instancedMesh>
      <instancedMesh ref={shrubs} args={[undefined, undefined, count]} castShadow receiveShadow>
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial vertexColors roughness={1} />
      </instancedMesh>
    </group>
  );
}

function SnowMountainRing({ playerPosition }: { playerPosition: MutableRefObject<Vector3> }) {
  const count = 20;
  const group = useRef<Group>(null);
  const bases = useRef<InstancedMesh>(null);
  const snow = useRef<InstancedMesh>(null);
  const matrices = useMemo(() => {
    const random = seededRandom(24681357);
    const dummy = new Object3D();
    return Array.from({ length: count }, (_, index) => {
      const angle = (index / count) * Math.PI * 2 + (random() - 0.5) * 0.09;
      const distance = 118 + random() * 58;
      const height = 56 + random() * 48;
      const width = 34 + random() * 32;
      dummy.position.set(Math.cos(angle) * distance, height * 0.48 - 1.5, Math.sin(angle) * distance);
      dummy.scale.set(width, height, width);
      dummy.rotation.set(0, random() * Math.PI, 0);
      dummy.updateMatrix();
      return { base: dummy.matrix.clone(), position: dummy.position.clone(), height, width };
    });
  }, []);

  useEffect(() => {
    const dummy = new Object3D();
    matrices.forEach((item, index) => {
      bases.current?.setMatrixAt(index, item.base);
      dummy.position.set(item.position.x, item.position.y + item.height * 0.33, item.position.z);
      dummy.scale.set(item.width * 0.46, item.height * 0.3, item.width * 0.46);
      dummy.rotation.set(0, index * 0.37, 0);
      dummy.updateMatrix();
      snow.current?.setMatrixAt(index, dummy.matrix);
    });
    if (bases.current) bases.current.instanceMatrix.needsUpdate = true;
    if (snow.current) snow.current.instanceMatrix.needsUpdate = true;
  }, [matrices]);

  useFrame(() => {
    if (!group.current) return;
    group.current.position.x = Math.round(playerPosition.current.x / 90) * 90;
    group.current.position.z = Math.round(playerPosition.current.z / 90) * 90;
  });

  return (
    <group ref={group}>
      <instancedMesh ref={bases} args={[undefined, undefined, count]} receiveShadow>
        <coneGeometry args={[1, 1, 7]} />
        <meshStandardMaterial color="#45594b" roughness={1} />
      </instancedMesh>
      <instancedMesh ref={snow} args={[undefined, undefined, count]}>
        <coneGeometry args={[1, 1, 7]} />
        <meshStandardMaterial color="#eee9d5" emissive="#b7bba9" emissiveIntensity={0.12} roughness={0.94} />
      </instancedMesh>
    </group>
  );
}

function DynamicWeather({ playerPosition, count = 980 }: { playerPosition: MutableRefObject<Vector3>; count?: number }) {
  const group = useRef<Group>(null);
  const mesh = useRef<InstancedMesh>(null);
  const material = useRef<ShaderMaterial>(null);
  const dummy = useMemo(() => new Object3D(), []);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPaper: { value: new Color('#e7e4d2') },
      uOchre: { value: new Color('#c4a45d') },
    }),
    [],
  );

  useEffect(() => {
    if (!mesh.current) return;
    const random = seededRandom(3141592);
    for (let index = 0; index < count; index += 1) {
      dummy.position.set((random() - 0.5) * 76, random() * 20, (random() - 0.5) * 76);
      const scale = 0.075 + random() * 0.19;
      dummy.scale.set(scale, scale * (0.42 + random() * 0.88), scale);
      dummy.rotation.set(random() * Math.PI, random() * Math.PI, random() * Math.PI);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(index, dummy.matrix);
    }
    mesh.current.instanceMatrix.setUsage(DynamicDrawUsage);
    mesh.current.instanceMatrix.needsUpdate = true;
  }, [count, dummy]);

  useFrame(({ clock }) => {
    if (material.current) material.current.uniforms.uTime.value = clock.elapsedTime;
    if (!group.current) return;
    group.current.position.x = playerPosition.current.x;
    group.current.position.z = playerPosition.current.z;
  });

  return (
    <group ref={group}>
      <instancedMesh ref={mesh} args={[undefined, undefined, count]} frustumCulled={false}>
        <planeGeometry args={[1, 0.54]} />
        <shaderMaterial
          ref={material}
          uniforms={uniforms}
          vertexShader={weatherVertex}
          fragmentShader={weatherFragment}
          transparent
          depthWrite={false}
          side={DoubleSide}
        />
      </instancedMesh>
    </group>
  );
}

function WorldKeepsakes({
  enabled,
  playerPosition,
  collected,
  onCollect,
}: {
  enabled: boolean;
  playerPosition: MutableRefObject<Vector3>;
  collected: string[];
  onCollect: (id: string) => void;
}) {
  const mesh = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);
  const collectedSet = useMemo(() => new Set(collected), [collected]);
  const announced = useRef(new Set<string>());

  useEffect(() => {
    mesh.current?.instanceMatrix.setUsage(DynamicDrawUsage);
  }, []);

  useFrame(({ clock }) => {
    if (!mesh.current) return;
    WORLD_KEEPSAKES.forEach(([id, x, z], index) => {
      if (collectedSet.has(id)) {
        dummy.position.set(0, -200, 0);
        dummy.scale.setScalar(0.001);
      } else {
        const ground = terrainHeightAt(x, z);
        dummy.position.set(x, ground + 1.15 + Math.sin(clock.elapsedTime * 1.7 + index) * 0.22, z);
        dummy.rotation.set(
          -0.22 + Math.sin(clock.elapsedTime * 0.7 + index) * 0.12,
          clock.elapsedTime * 0.42 + index * 0.9,
          Math.sin(clock.elapsedTime * 0.55 + index * 0.6) * 0.32,
        );
        const pulse = 0.42 + Math.sin(clock.elapsedTime * 2.1 + index) * 0.055;
        dummy.scale.set(pulse, pulse * 0.68, pulse);
        if (
          enabled
          && !announced.current.has(id)
          && Math.hypot(playerPosition.current.x - x, playerPosition.current.z - z) < 1.65
        ) {
          announced.current.add(id);
          onCollect(id);
        }
      }
      dummy.updateMatrix();
      mesh.current?.setMatrixAt(index, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={mesh}
      args={[undefined, undefined, WORLD_KEEPSAKE_COUNT]}
      name="collectible-field-pages"
      frustumCulled={false}
    >
      <planeGeometry args={[1, 0.72]} />
      <meshStandardMaterial
        color="#d8cca2"
        emissive="#8b7746"
        emissiveIntensity={0.72}
        roughness={0.92}
        side={DoubleSide}
      />
    </instancedMesh>
  );
}

function ArchiveLodge() {
  const { scene } = useGLTF('/archive-world/archive-lodge.glb?v=2');
  const clone = useMemo(() => scene.clone(true), [scene]);

  useEffect(() => {
    clone.traverse((object) => {
      if ('castShadow' in object) object.castShadow = true;
      if ('receiveShadow' in object) object.receiveShadow = true;
    });
  }, [clone]);

  return <primitive object={clone} position={[0, 0, -8]} />;
}

function LodgeApproach() {
  return (
    <group>
      <mesh position={[0, 0.045, 7]} rotation={[-Math.PI / 2, 0, -0.025]} receiveShadow>
        <planeGeometry args={[3.4, 27]} />
        <meshStandardMaterial color="#77694f" roughness={1} transparent opacity={0.64} />
      </mesh>
      {[-1.8, 1.8].map((x) => (
        <mesh key={x} position={[x, 0.18, -2]} rotation-x={Math.PI / 2} castShadow>
          <cylinderGeometry args={[0.12, 0.16, 7.5, 7]} />
          <meshStandardMaterial color="#463326" roughness={1} />
        </mesh>
      ))}
    </group>
  );
}

function TrailheadCamp() {
  return (
    <group position={[0, 0, -8]}>
      <group position={[-4.5, 0, -0.4]} rotation-y={0.18}>
        {[-2.2, 2.2].flatMap((x) => [-1.5, 1.5].map((z) => (
          <mesh key={`${x}:${z}`} position={[x, 1.65, z]}><cylinderGeometry args={[0.08, 0.12, 3.3, 7]} /><meshStandardMaterial color="#493528" /></mesh>
        )))}
        <mesh position={[0, 3.25, 0]} rotation-z={-0.04} castShadow><boxGeometry args={[5.4, 0.12, 3.8]} /><meshStandardMaterial color="#85795d" roughness={1} /></mesh>
        <mesh position={[-1.2, 0.55, 0.5]} castShadow><boxGeometry args={[1.45, 1.1, 1.2]} /><meshStandardMaterial color="#4d3a2b" roughness={1} /></mesh>
        <mesh position={[0.5, 0.38, 0.8]} castShadow><boxGeometry args={[1.1, 0.75, 0.9]} /><meshStandardMaterial color="#66513a" roughness={1} /></mesh>
      </group>
      {[0, Math.PI / 2, Math.PI / 4].map((rotation) => (
        <mesh key={rotation} position={[0, 0.2, 2]} rotation={[0, rotation, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.12, 0.16, 1.7, 7]} />
          <meshStandardMaterial color="#34271f" roughness={1} />
        </mesh>
      ))}
      <pointLight position={[0, 1, 2]} intensity={9} distance={14} color="#d69b50" />
      <mesh position={[0, 0.17, 2]} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[0.72, 1, 14]} />
        <meshStandardMaterial color="#5c5e53" roughness={1} />
      </mesh>
    </group>
  );
}

function OutdoorCrates() {
  const { scene } = useGLTF('/archive-world/polyhaven/CheeseBox_01/CheeseBox_01_1k.gltf');
  const crates = useMemo(
    () => [
      { position: [-5.6, 0.02, -7.1] as [number, number, number], rotation: -0.25, scale: 4.4 },
      { position: [-3.8, 0.02, -6.6] as [number, number, number], rotation: 0.42, scale: 3.8 },
      { position: [2.2, 0.02, -6.8] as [number, number, number], rotation: -0.54, scale: 3.3 },
    ],
    [],
  );
  return (
    <group>
      {crates.map((crate, index) => (
        <primitive
          key={index}
          object={scene.clone(true)}
          position={crate.position}
          rotation={[0, crate.rotation, 0]}
          scale={crate.scale}
        />
      ))}
    </group>
  );
}

const MEDIEVAL_ASSET_ROOT = '/archive-world/quaternius-medieval';
const FANTASY_PROP_ROOT = '/archive-world/quaternius-props';

function TintedGltfAsset({
  src,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  tint = '#8a9680',
}: {
  src: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
  tint?: string;
}) {
  const { scene } = useGLTF(src);
  const clone = useMemo(() => {
    const root = scene.clone(true);
    root.traverse((object) => {
      if (!(object instanceof Mesh)) return;
      const tintMaterial = (material: Material) => {
        const copy = material.clone();
        if ('color' in copy && copy.color instanceof Color) copy.color.multiply(new Color(tint));
        copy.needsUpdate = true;
        return copy;
      };
      object.material = Array.isArray(object.material)
        ? object.material.map((material) => tintMaterial(material))
        : tintMaterial(object.material);
      object.castShadow = true;
      object.receiveShadow = true;
    });
    return root;
  }, [scene, tint]);

  return <primitive object={clone} position={position} rotation={rotation} scale={scale} />;
}

function MedievalAsset({ name, ...props }: Omit<ComponentProps<typeof TintedGltfAsset>, 'src'> & { name: string }) {
  return <TintedGltfAsset src={`${MEDIEVAL_ASSET_ROOT}/${name}.gltf`} {...props} />;
}

function FantasyProp({ name, ...props }: Omit<ComponentProps<typeof TintedGltfAsset>, 'src'> & { name: string }) {
  return <TintedGltfAsset src={`${FANTASY_PROP_ROOT}/${name}.gltf`} tint="#a2ad98" {...props} />;
}

function InstancedGltfAsset({ src, transforms }: { src: string; transforms: Matrix4[] }) {
  const { scene } = useGLTF(src);
  const parts = useMemo(() => collectQuaterniusParts(scene), [scene]);
  const meshes = useRef<Array<InstancedMesh | null>>([]);

  useEffect(() => {
    parts.forEach((part, partIndex) => {
      const mesh = meshes.current[partIndex];
      if (!mesh) return;
      transforms.forEach((transform, index) => {
        mesh.setMatrixAt(index, new Matrix4().multiplyMatrices(transform, part.localMatrix));
      });
      mesh.count = transforms.length;
      mesh.instanceMatrix.needsUpdate = true;
      mesh.computeBoundingSphere();
    });
  }, [parts, transforms]);

  return parts.map((part, index) => (
    <instancedMesh
      key={`${src}:${index}`}
      ref={(mesh) => { meshes.current[index] = mesh; }}
      args={[part.geometry, part.material, transforms.length]}
      castShadow
      receiveShadow
    />
  ));
}

function RiverFootbridge() {
  const floorTransforms = useMemo(
    () => Array.from({ length: 14 }, (_, index) => {
      const x = -13 + index * 2;
      return [-1, 1].map((z) => new Matrix4().makeTranslation(x, 0, z));
    }).flat(),
    [],
  );
  const fenceTransforms = useMemo(
    () => Array.from({ length: 14 }, (_, index) => {
      const x = -13 + index * 2;
      return [-2.05, 2.05].map((z) => new Matrix4().makeTranslation(x, 0.12, z));
    }).flat(),
    [],
  );
  const evenFences = useMemo(() => fenceTransforms.filter((_, index) => Math.floor(index / 2) % 2 === 0), [fenceTransforms]);
  const oddFences = useMemo(() => fenceTransforms.filter((_, index) => Math.floor(index / 2) % 2 === 1), [fenceTransforms]);

  return (
    <RigidBody
      type="fixed"
      colliders={false}
      position={[...RIVER_BRIDGE_POSITION]}
      rotation={[0, 0, -0.04]}
    >
      <CuboidCollider args={[14, 0.18, 2]} position={[0, 0, 0]} />
      <InstancedGltfAsset src={`${MEDIEVAL_ASSET_ROOT}/Floor_WoodDark.gltf`} transforms={floorTransforms} />
      <InstancedGltfAsset src={`${MEDIEVAL_ASSET_ROOT}/Prop_WoodenFence_Single.gltf`} transforms={evenFences} />
      <InstancedGltfAsset src={`${MEDIEVAL_ASSET_ROOT}/Prop_WoodenFence_Extension1.gltf`} transforms={oddFences} />
      {[-9, -3, 3, 9].flatMap((x) => [-1.55, 1.55].map((z) => (
        <mesh key={`${x}:${z}`} position={[x, -1.5, z]} castShadow>
          <cylinderGeometry args={[0.18, 0.28, 3.2, 8]} />
          <meshStandardMaterial color="#3e3026" roughness={1} />
        </mesh>
      )))}
      <FantasyProp name="Lantern_Wall" position={[-10.7, 1.05, -2.18]} rotation={[0, Math.PI / 2, 0]} scale={1.05} />
      <FantasyProp name="Lantern_Wall" position={[8.9, 1.05, 2.18]} rotation={[0, -Math.PI / 2, 0]} scale={1.05} />
    </RigidBody>
  );
}

function ArchiveBookCottage() {
  return (
    <group>
      <MedievalAsset name="Wall_Plaster_Door_Round" position={[-1, 0, 3]} />
      <MedievalAsset name="Wall_Plaster_Window_Wide_Round" position={[1, 0, 3]} />
      <MedievalAsset name="Door_1_Round" position={[-1.52, 0, 3.05]} />
      <MedievalAsset name="Window_Wide_Round1" position={[1, 0, 3.06]} />
      <MedievalAsset name="WindowShutters_Wide_Round_Open" position={[1, 0, 3.05]} />
      {[-1, 1].map((x) => <MedievalAsset key={`rear-${x}`} name="Wall_Plaster_Straight" position={[x, 0, -3]} rotation={[0, Math.PI, 0]} />)}
      {[-2, 0, 2].map((z) => <MedievalAsset key={`left-${z}`} name="Wall_Plaster_Straight" position={[-2, 0, z]} rotation={[0, Math.PI / 2, 0]} />)}
      {[-2, 0, 2].map((z) => <MedievalAsset key={`right-${z}`} name="Wall_Plaster_Straight" position={[2, 0, z]} rotation={[0, -Math.PI / 2, 0]} />)}
      <MedievalAsset name="Roof_RoundTiles_4x6" position={[0, 3, 0]} />
      <MedievalAsset name="Roof_Front_Brick4" position={[0, 3, 3]} />
      <MedievalAsset name="Roof_Front_Brick4" position={[0, 3, -3]} rotation={[0, Math.PI, 0]} />
      <MedievalAsset name="Prop_Chimney" position={[-1.35, 3.8, -0.8]} scale={0.82} />
      <MedievalAsset name="Stairs_Exterior_Straight" position={[-1, 0, 4]} rotation={[0, Math.PI, 0]} />
      <MedievalAsset name="Prop_Vine1" position={[1.8, 2.3, 3.13]} />
      <pointLight position={[1, 2, 3.8]} intensity={7} distance={10} color="#c5a15d" />
    </group>
  );
}

function TrailToDestination({ destination }: { destination: GameDestination }) {
  const [x, , z] = destination.position;
  const y = terrainHeightAt(x, z);

  return (
    <mesh
      position={[x, y + 0.035, z + 8]}
      rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow
    >
      <planeGeometry args={[2.3, 18]} />
      <meshStandardMaterial color="#6f634c" roughness={1} transparent opacity={0.44} />
    </mesh>
  );
}

function TimberCabin({ postOffice = false }: { postOffice?: boolean }) {
  return (
    <group>
      <mesh position={[0, 2.45, 0]} castShadow receiveShadow>
        <boxGeometry args={[6.4, 4.4, 5.2]} />
        <meshStandardMaterial color={postOffice ? '#7b735c' : '#66745f'} roughness={0.96} />
      </mesh>
      {[-2.35, 0, 2.35].map((beam) => (
        <mesh key={beam} position={[beam, 2.55, 2.66]} castShadow>
          <boxGeometry args={[0.25, 4.7, 0.2]} />
          <meshStandardMaterial color="#3f3024" roughness={1} />
        </mesh>
      ))}
      <mesh position={[-1.7, 4.95, 0]} rotation-z={-0.62} castShadow>
        <boxGeometry args={[4.7, 0.34, 6.4]} />
        <meshStandardMaterial color="#26362c" roughness={1} />
      </mesh>
      <mesh position={[1.7, 4.95, 0]} rotation-z={0.62} castShadow>
        <boxGeometry args={[4.7, 0.34, 6.4]} />
        <meshStandardMaterial color="#26362c" roughness={1} />
      </mesh>
      <mesh position={[0, 1.65, 2.67]} castShadow>
        <boxGeometry args={[1.3, 2.9, 0.2]} />
        <meshStandardMaterial color="#34261d" roughness={1} />
      </mesh>
      {[-1.9, 1.9].map((windowX) => (
        <mesh key={windowX} position={[windowX, 2.7, 2.68]}>
          <boxGeometry args={[1.25, 1.35, 0.15]} />
          <meshStandardMaterial color="#d5b66d" emissive="#b8904c" emissiveIntensity={0.55} />
        </mesh>
      ))}
    </group>
  );
}

function FieldCampfire({ position }: { position: [number, number, number] }) {
  const flame = useRef<Mesh>(null);
  const flameMaterial = useRef<ShaderMaterial>(null);
  const glow = useRef<PointLight>(null);
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);

  useFrame(({ camera, clock }) => {
    const pulse = 0.88 + Math.sin(clock.elapsedTime * 7.4) * 0.1 + Math.sin(clock.elapsedTime * 13.1) * 0.04;
    if (flame.current) {
      flame.current.scale.set(0.92 + pulse * 0.08, pulse, 1);
      flame.current.lookAt(camera.position);
    }
    if (flameMaterial.current) flameMaterial.current.uniforms.uTime.value = clock.elapsedTime;
    if (glow.current) glow.current.intensity = 7.4 + pulse * 2.8;
  });

  return (
    <group position={position}>
      {[0, Math.PI / 2, Math.PI / 4].map((rotation) => (
        <mesh key={rotation} position={[0, 0.18, 0]} rotation={[0, rotation, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.11, 0.15, 1.5, 7]} />
          <meshStandardMaterial color="#3b2b20" roughness={1} />
        </mesh>
      ))}
      <mesh ref={flame} position={[0, 0.74, 0]}>
        <planeGeometry args={[1.35, 1.65]} />
        <shaderMaterial ref={flameMaterial} uniforms={uniforms} vertexShader={campfireVertex} fragmentShader={campfireFragment} transparent depthWrite={false} side={DoubleSide} />
      </mesh>
      <pointLight ref={glow} position={[0, 0.8, 0]} intensity={8} distance={12} color="#d49b55" />
    </group>
  );
}

const WORKSHOP_FIELD_SHEETS = [
  [-4.2, 2.55, -2.32, 0.78, 0.52, -0.11, '#c6b989'],
  [-3.05, 2.36, -2.26, 1.08, 0.68, 0.08, '#87936f'],
  [-1.62, 2.54, -2.3, 0.72, 0.92, -0.07, '#d1c59a'],
  [-3.48, 1.34, -2.28, 0.92, 0.6, 0.13, '#a79b72'],
  [-2.12, 1.22, -2.34, 1.18, 0.72, -0.04, '#c7bd96'],
  [0.98, 1.38, -2.2, 0.82, 0.56, 0.09, '#7e8c69'],
  [2.18, 1.53, -2.25, 1.15, 0.8, -0.1, '#c9bb88'],
] as const;

function WorkshopFieldSheets() {
  const papers = useRef<InstancedMesh>(null);
  const annotations = useRef<InstancedMesh>(null);
  const stamps = useRef<InstancedMesh>(null);
  const clips = useRef<InstancedMesh>(null);

  useEffect(() => {
    if (!papers.current || !annotations.current || !stamps.current || !clips.current) return;
    papers.current.instanceColor = null;
    const paperMaterials = Array.isArray(papers.current.material)
      ? papers.current.material
      : [papers.current.material];
    paperMaterials.forEach((material) => {
      material.needsUpdate = true;
    });
    const base = new Object3D();
    const instance = new Object3D();
    const matrix = new Matrix4();
    let annotationIndex = 0;
    let stampIndex = 0;

    WORKSHOP_FIELD_SHEETS.forEach(([x, y, z, width, height, tilt], index) => {
      const yaw = (index % 3 - 1) * 0.05;
      base.position.set(x, y, z);
      base.rotation.set(0, yaw, tilt);
      base.scale.set(1, 1, 1);
      base.updateMatrix();

      instance.position.set(x, y, z);
      instance.rotation.set(0, yaw, tilt);
      instance.scale.set(width, height, 1);
      instance.updateMatrix();
      papers.current?.setMatrixAt(index, instance.matrix);

      Array.from({ length: 2 + (index % 3) }, (_, line) => {
        instance.position.set(
          -width * 0.11 + line * width * 0.035,
          height * 0.18 - line * height * 0.2,
          0.012,
        );
        instance.rotation.set(0, 0, (line - 1) * 0.025);
        instance.scale.set(width * (0.48 + ((index + line) % 3) * 0.12), 0.022, 0.012);
        instance.updateMatrix();
        matrix.multiplyMatrices(base.matrix, instance.matrix);
        annotations.current?.setMatrixAt(annotationIndex, matrix);
        annotationIndex += 1;
      });

      if (index % 3 === 1) {
        const stampScale = Math.min(width, height) * 0.12;
        instance.position.set(width * 0.28, -height * 0.27, 0.018);
        instance.rotation.set(0, 0, 0);
        instance.scale.setScalar(stampScale);
        instance.updateMatrix();
        matrix.multiplyMatrices(base.matrix, instance.matrix);
        stamps.current?.setMatrixAt(stampIndex, matrix);
        stampIndex += 1;
      }

      instance.position.set(0, height * 0.5 + 0.025, 0.025);
      instance.rotation.set(0, 0, Math.PI / 2);
      instance.scale.set(1, 0.18, 1);
      instance.updateMatrix();
      matrix.multiplyMatrices(base.matrix, instance.matrix);
      clips.current?.setMatrixAt(index, matrix);
    });

    for (const mesh of [papers.current, annotations.current, stamps.current, clips.current]) {
      mesh.instanceMatrix.needsUpdate = true;
      mesh.computeBoundingSphere();
    }
  }, []);

  return (
    <group name="misaligned-field-drawings">
      <instancedMesh ref={papers} args={[undefined, undefined, WORKSHOP_FIELD_SHEETS.length]} castShadow>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial color="#b6aa7d" side={DoubleSide} />
      </instancedMesh>
      <instancedMesh ref={annotations} args={[undefined, undefined, 20]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color="#514d3d" />
      </instancedMesh>
      <instancedMesh ref={stamps} args={[undefined, undefined, 2]}>
        <torusGeometry args={[1, 0.14, 5, 18]} />
        <meshBasicMaterial color="#6e4739" />
      </instancedMesh>
      <instancedMesh ref={clips} args={[undefined, undefined, WORKSHOP_FIELD_SHEETS.length]}>
        <cylinderGeometry args={[0.035, 0.035, 1, 6]} />
        <meshStandardMaterial color="#493b2d" roughness={1} />
      </instancedMesh>
    </group>
  );
}

function SiteStructure({ kind }: { kind: GameDestination['siteKind'] }) {
  if (kind === 'camp') {
    return (
      <group>
        <MedievalAsset name="Prop_Crate" position={[-1.8, 0.12, -0.9]} rotation={[0, 0.28, 0]} scale={0.82} />
        <FantasyProp name="Bag" position={[-0.35, 0.02, -1.2]} rotation={[0, -0.4, 0]} scale={0.9} />
        <FantasyProp name="Bucket_Wooden_1" position={[-2.85, 0.02, 0.65]} rotation={[0, 0.25, 0]} scale={1.25} />
        <FantasyProp name="Scroll_2" position={[-1.75, 0.98, -0.88]} rotation={[0, 0.65, 0]} scale={3.2} />
        <mesh position={[1.85, 0.11, -1]} rotation-y={-0.18} castShadow>
          <boxGeometry args={[2.3, 0.16, 0.92]} />
          <meshStandardMaterial color="#59644f" roughness={1} />
        </mesh>
        <mesh position={[2.72, 0.24, -1]} rotation-z={Math.PI / 2} castShadow>
          <cylinderGeometry args={[0.26, 0.26, 0.65, 12]} />
          <meshStandardMaterial color="#77725b" roughness={1} />
        </mesh>
        <FieldCampfire position={[0.9, 0, 1.1]} />
      </group>
    );
  }
  if (kind === 'station') {
    return (
      <group>
        <mesh position={[0, 0.22, 0]} receiveShadow><boxGeometry args={[13, 0.44, 4.8]} /><meshStandardMaterial color="#555244" roughness={1} /></mesh>
        <mesh position={[-4.35, 2.45, -1.25]} rotation-z={-0.035} castShadow>
          <cylinderGeometry args={[0.13, 0.22, 4.9, 8]} />
          <meshStandardMaterial color="#3f392f" roughness={1} />
        </mesh>
        <mesh position={[-4.35, 3.45, -1.25]} rotation-z={Math.PI / 2} castShadow>
          <boxGeometry args={[2.45, 0.15, 0.18]} />
          <meshStandardMaterial color="#39443a" roughness={1} />
        </mesh>
        <mesh position={[-3.2, 3.44, -1.26]} rotation-y={Math.PI / 2}>
          <circleGeometry args={[0.36, 24]} />
          <meshStandardMaterial color="#a7664e" emissive="#6a2f26" emissiveIntensity={0.35} roughness={0.8} />
        </mesh>
        <mesh position={[-5.5, 3.44, -1.26]} rotation-y={Math.PI / 2}>
          <circleGeometry args={[0.36, 24]} />
          <meshStandardMaterial color="#6b785f" roughness={0.8} />
        </mesh>
        <MedievalAsset name="Prop_Crate" position={[3.9, 0.45, -0.45]} scale={1.5} />
        <FantasyProp name="Bench" position={[-0.1, 0.45, 1.2]} rotation={[0, -0.03, 0]} scale={1.18} />
        <FantasyProp name="Stall_Cart_Empty" position={[3.2, 0.45, -2.05]} rotation={[0, -0.3, 0]} scale={0.78} />
        <FantasyProp name="Bag" position={[1.8, 0.47, 1.05]} rotation={[0, 0.55, 0]} scale={0.78} />
        <FantasyProp name="Lantern_Wall" position={[-4.35, 2.5, -1.12]} rotation={[0, Math.PI / 2, 0]} scale={1.15} />
        <mesh position={[1.4, 1.1, -1.85]} rotation={[0.12, -0.2, 0.04]} castShadow><boxGeometry args={[3.1, 1.5, 0.16]} /><meshStandardMaterial color="#77725e" roughness={1} /></mesh>
        {[-2.1, 2.1].map((rail) => <mesh key={rail} position={[rail, 0.1, 8]}><boxGeometry args={[0.12, 0.12, 28]} /><meshStandardMaterial color="#31352f" metalness={0.5} /></mesh>)}
        {[-4, 0, 4, 8, 12, 16, 20].map((z) => <mesh key={`tie-${z}`} position={[0, 0.04, z]}><boxGeometry args={[5.2, 0.12, 0.24]} /><meshStandardMaterial color="#4a382d" roughness={1} /></mesh>)}
      </group>
    );
  }
  if (kind === 'watchtower') {
    const surveyPosts = [
      [-1.75, -0.85, -0.035],
      [2.05, 0.45, 0.025],
      [0.75, -2.05, 0.045],
    ] as const;
    return (
      <group>
        {surveyPosts.map(([x, z, lean]) => <mesh key={`${x}:${z}`} position={[x, 2.35, z]} rotation-z={lean} castShadow><cylinderGeometry args={[0.15, 0.28, 4.7, 8]} /><meshStandardMaterial color="#493629" roughness={1} /></mesh>)}
        <mesh position={[0.25, 4.72, -0.2]} rotation-z={0.035} castShadow><boxGeometry args={[5.5, 0.3, 4.2]} /><meshStandardMaterial color="#40382b" roughness={1} /></mesh>
        {[-1.95, 2.32].map((x, index) => <mesh key={`rail-x-${x}`} position={[x, 5.65, -0.2]} rotation-z={index ? 0.03 : -0.02}><boxGeometry args={[0.1, 1.7, 4]} /><meshStandardMaterial color="#514032" /></mesh>)}
        <mesh position={[0.35, 5.57, -0.55]} rotation={[0.18, 0.5, Math.PI / 2]} castShadow><cylinderGeometry args={[0.18, 0.26, 2.3, 12]} /><meshStandardMaterial color="#667061" metalness={0.46} roughness={0.66} /></mesh>
        <mesh position={[0.97, 5.78, 0.08]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.4, 0.08, 8, 24]} /><meshStandardMaterial color="#b0a269" metalness={0.35} roughness={0.68} /></mesh>
        <MedievalAsset name="Stairs_Exterior_Straight" position={[-0.4, 0, 2.5]} rotation={[0, -0.18, 0]} scale={1.3} />
        <MedievalAsset name="Prop_Crate" position={[2.7, 0.15, -1.6]} rotation={[0, 0.4, 0]} scale={0.85} />
      </group>
    );
  }
  if (kind === 'sawmill') {
    return (
      <group>
        {[-2.2, 0, 2.2].map((z, index) => <mesh key={z} position={[4.3 + index * 0.15, 0.55, z]} rotation-z={Math.PI / 2} castShadow><cylinderGeometry args={[0.48, 0.55, 5.5 - index * 0.45, 10]} /><meshStandardMaterial color="#61462f" roughness={1} /></mesh>)}
        {[-3.4, 3.4].map((x) => <mesh key={x} position={[x, 1.35, 0]} castShadow><boxGeometry args={[0.24, 2.7, 0.3]} /><meshStandardMaterial color="#493426" roughness={1} /></mesh>)}
        <mesh position={[0, 2.58, 0]} rotation-z={0.045} castShadow><boxGeometry args={[7.2, 0.24, 0.3]} /><meshStandardMaterial color="#493426" roughness={1} /></mesh>
        <FantasyProp name="Workbench" position={[0, 0, 0]} scale={[1.85, 1.45, 1.3]} />
        <mesh position={[0, 1.65, 0]} rotation-y={Math.PI / 2}><cylinderGeometry args={[1.35, 1.35, 0.18, 26]} /><meshStandardMaterial color="#77796e" metalness={0.58} roughness={0.5} /></mesh>
        {Array.from({ length: 14 }, (_, index) => {
          const angle = (index / 14) * Math.PI * 2;
          return <mesh key={`saw-${index}`} position={[Math.cos(angle) * 1.48, 1.65 + Math.sin(angle) * 1.48, 0]} rotation-z={angle}><boxGeometry args={[0.34, 0.52, 0.12]} /><meshStandardMaterial color="#77796e" metalness={0.58} roughness={0.5} /></mesh>;
        })}
        <MedievalAsset name="Prop_Crate" position={[-4.7, 0.15, -2.1]} rotation={[0, -0.3, 0]} />
        <FantasyProp name="Axe_Bronze" position={[-2.5, 1.05, 0.2]} rotation={[0.08, 0.25, -0.28]} scale={1.6} />
        <FantasyProp name="Rope_1" position={[-4.2, 0.05, 1.5]} rotation={[0, 0.35, 0]} scale={1.7} />
        <FantasyProp name="Bucket_Metal" position={[2.55, 0.02, -1.65]} rotation={[0, -0.2, 0]} scale={1.35} />
      </group>
    );
  }
  if (kind === 'record') {
    return (
      <group>
        {[-2.7, 0, 2.55].map((x, index) => (
          <group key={x} position={[x, 1.6 + index * 0.28, index === 1 ? -0.6 : 0.35]} rotation-y={(index - 1) * 0.28}>
            <mesh rotation-y={Math.PI / 2} castShadow>
              <torusGeometry args={[1.38 - index * 0.12, 0.1, 8, 42]} />
              <meshStandardMaterial color="#242923" roughness={0.78} />
            </mesh>
            <mesh rotation-y={Math.PI / 2}>
              <circleGeometry args={[1.28 - index * 0.12, 42]} />
              <meshStandardMaterial color={index === 1 ? '#1d241e' : '#292d26'} roughness={0.72} />
            </mesh>
            <mesh position={[0, 0, 0.025]} rotation-y={Math.PI / 2}>
              <circleGeometry args={[0.22, 24]} />
              <meshStandardMaterial color={index === 1 ? '#b6a260' : '#6d775c'} roughness={0.95} />
            </mesh>
          </group>
        ))}
        {[-2.7, 0, 2.55].map((x, index) => (
          <mesh key={`spindle-${x}`} position={[x, 0.72, index === 1 ? -0.6 : 0.35]} castShadow>
            <cylinderGeometry args={[0.1, 0.16, 1.45, 8]} />
            <meshStandardMaterial color="#4a382b" roughness={1} />
          </mesh>
        ))}
        <mesh position={[0, 0.38, -1.9]} rotation-z={-0.025} castShadow>
          <boxGeometry args={[7.2, 0.42, 1.1]} />
          <meshStandardMaterial color="#59654f" roughness={1} />
        </mesh>
        <MedievalAsset name="Prop_Wagon" position={[0, 0, -3.15]} rotation={[0, Math.PI / 2, 0]} scale={0.78} />
      </group>
    );
  }
  if (kind === 'cinema') {
    return (
      <group>
        <mesh position={[0, 3.4, -1]} castShadow><boxGeometry args={[9.8, 5.5, 0.28]} /><meshStandardMaterial color="#d4ceb3" roughness={0.92} /></mesh>
        <mesh position={[0, 3.4, -1.18]}><planeGeometry args={[8.7, 4.45]} /><meshStandardMaterial color="#b8b69f" emissive="#817c68" emissiveIntensity={0.2} /></mesh>
        {[-3.4, 0, 3.4].map((x, index) => <FantasyProp key={x} name="Bench" position={[x, 0, 4]} rotation={[0, (index - 1) * 0.05, 0]} scale={1.05} />)}
        <mesh position={[0, 1, 7]} castShadow><boxGeometry args={[1.3, 1.25, 1.9]} /><meshStandardMaterial color="#2d332e" roughness={0.85} /></mesh>
        <FantasyProp name="Lantern_Wall" position={[-5.2, 2.2, -0.65]} rotation={[0, Math.PI / 2, 0]} scale={1.3} />
      </group>
    );
  }
  if (kind === 'workshop') {
    return (
      <group>
        {[[-2.65, 0.15, 0.18], [0.2, -0.5, -0.08], [2.8, 0.65, 0.12]].map(([x, z, rotation], index) => (
          <group key={`draft-table-${index}`} position={[x, 0, z]} rotation-y={rotation}>
            <FantasyProp name="Workbench" scale={index === 1 ? [1.15, 1, 1.05] : [1.1, 1, 1.08]} />
            {index === 1 && <FantasyProp name="Workbench_Drawers" scale={[1.15, 1, 1.05]} />}
            <FantasyProp name={index === 2 ? 'Scroll_2' : 'Scroll_1'} position={[index === 1 ? -0.32 : 0.2, 0.93, index === 0 ? 0.05 : -0.12]} rotation={[0, index * 0.55 - 0.35, 0]} scale={3.8} />
          </group>
        ))}
        {[-4.75, -0.48, 3.35].map((x, index) => (
          <mesh key={`drawing-line-post-${x}`} position={[x, 1.72 + index * 0.08, -2.22]} rotation-z={(index - 1) * 0.035} castShadow>
            <cylinderGeometry args={[0.1, 0.16, 3.45 + index * 0.16, 7]} />
            <meshStandardMaterial color="#433326" roughness={1} />
          </mesh>
        ))}
        {[1.66, 2.88].map((y, index) => (
          <mesh key={`drawing-line-${y}`} position={[-0.7, y, -2.25]} rotation={[0, 0, Math.PI / 2 + (index ? -0.012 : 0.018)]}>
            <cylinderGeometry args={[0.025, 0.025, 8.15, 6]} />
            <meshStandardMaterial color="#79664d" roughness={1} />
          </mesh>
        ))}
        <WorkshopFieldSheets />
        <MedievalAsset name="Prop_Crate" position={[4.2, 0.12, -1.6]} rotation={[0, 0.32, 0]} />
        <MedievalAsset name="Prop_Crate" position={[4.6, 0.12, -0.3]} rotation={[0, -0.18, 0]} scale={0.76} />
        <FantasyProp name="Bag" position={[3.65, 0.02, 1.65]} rotation={[0, -0.4, 0]} scale={0.82} />
        <FantasyProp name="Rope_2" position={[-1.4, 0.04, 1.6]} rotation={[0, 0.8, 0]} scale={1.7} />
      </group>
    );
  }
  if (kind === 'post') {
    return (
      <group>
        {[-3.2, 3.2].map((x) => (
          <mesh key={x} position={[x, 2.7, 0]} castShadow>
            <cylinderGeometry args={[0.13, 0.2, 5.4, 8]} />
            <meshStandardMaterial color="#493529" roughness={1} />
          </mesh>
        ))}
        <mesh position={[0, 4.7, 0]} rotation-z={Math.PI / 2} castShadow>
          <cylinderGeometry args={[0.08, 0.08, 7, 8]} />
          <meshStandardMaterial color="#3a3128" roughness={1} />
        </mesh>
        {[-2.4, -1.2, 0, 1.2, 2.4].map((x, index) => (
          <mesh key={x} position={[x, 4.18 - (index % 2) * 0.18, 0]} rotation-z={(index - 2) * 0.08} castShadow>
            <planeGeometry args={[0.65, 0.44]} />
            <meshStandardMaterial color={index % 2 ? '#b7ad87' : '#d0c498'} side={DoubleSide} roughness={1} />
          </mesh>
        ))}
        <mesh position={[0, 0.9, 0]} castShadow>
          <boxGeometry args={[2.1, 1.5, 1.35]} />
          <meshStandardMaterial color="#6b704f" roughness={1} />
        </mesh>
        <FantasyProp name="Bag" position={[1.7, 0.02, 0.8]} rotation={[0, -0.3, 0]} scale={0.9} />
        <FantasyProp name="Barrel" position={[-1.85, 0.02, -0.65]} rotation={[0, 0.2, 0]} scale={0.95} />
      </group>
    );
  }
  return <ArchiveBookCottage />;
}

function DestinationSite({
  destination,
  onOpen,
}: {
  destination: GameDestination;
  onOpen: (type: BlockType) => void;
}) {
  const [x, , z] = destination.position;
  const groundHeight = terrainHeightAt(x, z);
  const rotation = Math.atan2(-x, -z);

  return (
    <RigidBody type="fixed" colliders={false} position={[x, groundHeight, z]} rotation={[0, rotation, 0]}>
      <SiteColliders kind={destination.siteKind} />
      <group
        onClick={(event) => {
          event.stopPropagation();
          onOpen(destination.blockType);
        }}
      >
        <SiteStructure kind={destination.siteKind} />
      </group>
    </RigidBody>
  );
}

function SiteColliders({ kind }: { kind: GameDestination['siteKind'] }) {
  if (kind === 'station') return <><CuboidCollider args={[6.5, 0.22, 2.4]} position={[0, 0.22, 0]} /><CuboidCollider args={[0.24, 2.45, 0.24]} position={[-4.35, 2.45, -1.25]} /></>;
  if (kind === 'watchtower') return <><CuboidCollider args={[0.28, 2.35, 0.28]} position={[-1.75, 2.35, -0.85]} /><CuboidCollider args={[0.28, 2.35, 0.28]} position={[2.05, 2.35, 0.45]} /><CuboidCollider args={[0.28, 2.35, 0.28]} position={[0.75, 2.35, -2.05]} /><CuboidCollider args={[2.75, 0.15, 2.1]} position={[0.25, 4.72, -0.2]} /></>;
  if (kind === 'sawmill') return <><CuboidCollider args={[3.7, 0.15, 0.7]} position={[0, 0.78, 0]} /><CuboidCollider args={[0.7, 1.1, 3.3]} position={[4.4, 0.8, 0]} /></>;
  if (kind === 'cinema') return <><CuboidCollider args={[4.9, 2.75, 0.2]} position={[0, 3.4, -1]} />{[-3.4, 0, 3.4].map((x) => <CuboidCollider key={x} args={[1.5, 0.4, 0.45]} position={[x, 0.4, 4]} />)}</>;
  if (kind === 'cabin') return <CuboidCollider args={[2.2, 3.2, 3.2]} position={[0, 3.2, 0]} />;
  if (kind === 'workshop') return <>{[[-2.65, 0.15], [0.2, -0.5], [2.8, 0.65]].map(([x, z]) => <CuboidCollider key={`${x}:${z}`} args={[1.25, 0.55, 0.75]} position={[x, 0.55, z]} />)}{[-4.75, -0.48, 3.35].map((x) => <CuboidCollider key={`line-post-${x}`} args={[0.14, 1.75, 0.14]} position={[x, 1.75, -2.22]} />)}</>;
  if (kind === 'record') return <CuboidCollider args={[3.7, 1.7, 0.85]} position={[0, 1.7, 0]} />;
  if (kind === 'post') return <CuboidCollider args={[1.1, 0.75, 0.75]} position={[0, 0.9, 0]} />;
  if (kind === 'camp') return <><CuboidCollider args={[0.72, 0.58, 0.62]} position={[-1.8, 0.58, -0.9]} /><CuboidCollider args={[1.15, 0.12, 0.46]} position={[1.85, 0.12, -1]} /></>;
  return <CuboidCollider args={[2.2, 1.1, 1.9]} position={[0, 1.1, 0]} />;
}

function VillageObstacles() {
  const obstacles = useMemo(() => {
    const random = seededRandom(987654);
    return Array.from({ length: 34 }, (_, index) => {
      const angle = (index / 34) * Math.PI * 2 + (random() - 0.5) * 0.18;
      const radius = 45 + random() * 9;
      return {
        position: [Math.cos(angle) * radius, 0, Math.sin(angle) * radius] as [number, number, number],
        height: 5 + random() * 5,
        width: 0.45 + random() * 0.35,
      };
    });
  }, []);
  const boulders = useMemo(
    () => [
      [-8, 0.72, 13, 1.3],
      [10, 0.55, 14, 1.0],
      [-14, 0.48, -1, 0.9],
      [15, 0.68, -11, 1.2],
      [4, 0.48, -22, 0.85],
    ] as const,
    [],
  );

  return (
    <group>
      {obstacles.map((tree, index) => (
        <RigidBody key={index} type="fixed" colliders={false} position={tree.position}>
          <CuboidCollider args={[tree.width, tree.height * 0.5, tree.width]} position={[0, tree.height * 0.5, 0]} />
          <mesh position={[0, tree.height * 0.5, 0]} castShadow>
            <cylinderGeometry args={[tree.width * 0.55, tree.width, tree.height, 7]} />
            <meshStandardMaterial color="#493729" roughness={1} />
          </mesh>
          {[0.62, 0.84, 1.03].map((heightRatio, crown) => (
            <mesh key={heightRatio} position={[0, tree.height * heightRatio, 0]} castShadow>
              <coneGeometry args={[tree.width * (4.2 - crown * 0.7), tree.height * 0.38, 8]} />
              <meshStandardMaterial color={crown === 1 ? '#435d45' : '#354d3a'} roughness={0.98} />
            </mesh>
          ))}
        </RigidBody>
      ))}
      {boulders.map(([x, y, z, radius], index) => (
        <RigidBody key={index} type="fixed" colliders={false} position={[x, y, z]}>
          <BallCollider args={[radius]} />
          <mesh castShadow receiveShadow scale={[1.2, 0.76, 1]} rotation={[0.1, index, -0.08]}>
            <dodecahedronGeometry args={[radius, 0]} />
            <meshStandardMaterial color="#596054" roughness={1} />
          </mesh>
        </RigidBody>
      ))}
    </group>
  );
}

function WorldLandmarks({
  destinations,
  onOpen,
}: {
  destinations: GameDestination[];
  onOpen: (type: BlockType) => void;
}) {
  return (
    <group>
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[3.2, 1.7, 2.2]} position={[-4.5, 1.7, -8.4]} />
        <TrailheadCamp />
      </RigidBody>
      <Suspense fallback={null}><OutdoorCrates /></Suspense>
      {destinations.map((destination) => (
        <group key={destination.blockType}>
          <DestinationSite destination={destination} onOpen={onOpen} />
        </group>
      ))}
      <pointLight position={[0, 7, -2]} intensity={10} distance={28} color="#d1ad64" />
    </group>
  );
}

function RangerAvatar({ moving }: { moving: MutableRefObject<boolean> }) {
  const group = useRef<Group>(null);
  const leftLeg = useRef<Group>(null);
  const rightLeg = useRef<Group>(null);
  const leftArm = useRef<Group>(null);
  const rightArm = useRef<Group>(null);

  useFrame(({ clock }) => {
    const stride = moving.current ? Math.sin(clock.elapsedTime * 10) * 0.58 : 0;
    if (leftLeg.current) leftLeg.current.rotation.x = stride;
    if (rightLeg.current) rightLeg.current.rotation.x = -stride;
    if (leftArm.current) leftArm.current.rotation.x = -stride * 0.72;
    if (rightArm.current) rightArm.current.rotation.x = stride * 0.72;
    if (group.current) group.current.position.y = moving.current ? Math.abs(Math.sin(clock.elapsedTime * 10)) * 0.045 : 0;
  });

  return (
    <group ref={group} position={[0, -0.82, 0]}>
      <mesh position={[0, 1.35, 0]} castShadow>
        <capsuleGeometry args={[0.34, 0.75, 5, 9]} />
        <meshStandardMaterial color="#465b48" roughness={0.95} />
      </mesh>
      <mesh position={[0, 2.18, 0]} castShadow>
        <sphereGeometry args={[0.31, 14, 10]} />
        <meshStandardMaterial color="#c2a982" roughness={0.92} />
      </mesh>
      <mesh position={[0, 2.39, 0]} castShadow>
        <coneGeometry args={[0.48, 0.36, 12]} />
        <meshStandardMaterial color="#293a2f" roughness={1} />
      </mesh>
      <mesh position={[0, 1.38, 0.31]} castShadow>
        <boxGeometry args={[0.62, 0.85, 0.25]} />
        <meshStandardMaterial color="#6a5137" roughness={1} />
      </mesh>
      <group ref={leftLeg} position={[-0.19, 0.78, 0]}>
        <mesh position={[0, -0.42, 0]} castShadow>
          <capsuleGeometry args={[0.12, 0.62, 4, 7]} />
          <meshStandardMaterial color="#2a332d" roughness={1} />
        </mesh>
      </group>
      <group ref={rightLeg} position={[0.19, 0.78, 0]}>
        <mesh position={[0, -0.42, 0]} castShadow>
          <capsuleGeometry args={[0.12, 0.62, 4, 7]} />
          <meshStandardMaterial color="#2a332d" roughness={1} />
        </mesh>
      </group>
      <group ref={leftArm} position={[-0.46, 1.65, 0]}>
        <mesh position={[0, -0.36, 0]} castShadow>
          <capsuleGeometry args={[0.1, 0.56, 4, 7]} />
          <meshStandardMaterial color="#536a55" roughness={1} />
        </mesh>
      </group>
      <group ref={rightArm} position={[0.46, 1.65, 0]}>
        <mesh position={[0, -0.36, 0]} castShadow>
          <capsuleGeometry args={[0.1, 0.56, 4, 7]} />
          <meshStandardMaterial color="#536a55" roughness={1} />
        </mesh>
      </group>
    </group>
  );
}

function HorseModel({
  moving,
  withRider = false,
}: {
  moving: MutableRefObject<boolean>;
  withRider?: boolean;
}) {
  const group = useRef<Group>(null);
  const legs = useRef<Array<Group | null>>([]);
  const riderStill = useRef(false);

  useFrame(({ clock }) => {
    const gait = moving.current ? Math.sin(clock.elapsedTime * 12) * 0.72 : 0;
    legs.current.forEach((leg, index) => {
      if (leg) leg.rotation.x = gait * (index % 2 === 0 ? 1 : -1);
    });
    if (group.current) {
      group.current.position.y = moving.current
        ? Math.abs(Math.sin(clock.elapsedTime * 12)) * 0.07
        : Math.sin(clock.elapsedTime * 1.8) * 0.012;
    }
  });

  return (
    <group ref={group}>
      <mesh position={[0, 1.55, 0]} rotation-x={Math.PI / 2} castShadow>
        <capsuleGeometry args={[0.58, 1.45, 7, 12]} />
        <meshStandardMaterial color="#584333" roughness={0.96} />
      </mesh>
      <mesh position={[0, 2.15, -1.25]} rotation-x={-0.48} castShadow>
        <capsuleGeometry args={[0.32, 0.72, 6, 10]} />
        <meshStandardMaterial color="#5e4735" roughness={0.96} />
      </mesh>
      <mesh position={[0, 2.82, -1.63]} rotation-x={Math.PI / 2} castShadow>
        <capsuleGeometry args={[0.28, 0.5, 6, 10]} />
        <meshStandardMaterial color="#624936" roughness={0.95} />
      </mesh>
      <mesh position={[0, 2.64, -2.18]} rotation-x={Math.PI / 2} castShadow>
        <capsuleGeometry args={[0.2, 0.28, 5, 9]} />
        <meshStandardMaterial color="#413328" roughness={0.98} />
      </mesh>
      {[-0.22, 0.22].map((x) => (
        <mesh key={x} position={[x, 3.2, -1.68]} rotation-z={x * 0.9} castShadow>
          <coneGeometry args={[0.12, 0.42, 7]} />
          <meshStandardMaterial color="#443429" roughness={1} />
        </mesh>
      ))}
      {[
        [-0.38, 0.86],
        [0.38, 0.86],
        [-0.38, -0.88],
        [0.38, -0.88],
      ].map(([x, z], index) => (
        <group
          key={`${x}:${z}`}
          ref={(leg) => {
            legs.current[index] = leg;
          }}
          position={[x, 1.15, z]}
        >
          <mesh position={[0, -0.58, 0]} castShadow>
            <capsuleGeometry args={[0.13, 0.88, 5, 8]} />
            <meshStandardMaterial color="#463529" roughness={1} />
          </mesh>
          <mesh position={[0, -1.16, -0.04]} scale={[1.1, 0.55, 1.35]} castShadow>
            <sphereGeometry args={[0.18, 8, 6]} />
            <meshStandardMaterial color="#25251f" roughness={1} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 2.04, 0.2]} castShadow>
        <boxGeometry args={[1.25, 0.22, 1.45]} />
        <meshStandardMaterial color="#755a3d" roughness={0.92} />
      </mesh>
      <mesh position={[0, 1.48, 1.72]} rotation-x={0.48} castShadow>
        <coneGeometry args={[0.17, 1.5, 8]} />
        <meshStandardMaterial color="#29271f" roughness={1} />
      </mesh>
      {withRider && (
        <group position={[0, 2.05, 0.25]} scale={0.78}>
          <RangerAvatar moving={riderStill} />
        </group>
      )}
    </group>
  );
}

function WaitingHorse({
  visible,
  position,
}: {
  visible: boolean;
  position: MutableRefObject<Vector3>;
}) {
  const idle = useRef(false);
  if (!visible) return null;
  const horsePosition = position.current;
  return (
    <RigidBody
      type="fixed"
      colliders={false}
      position={[
        horsePosition.x,
        terrainHeightAt(horsePosition.x, horsePosition.z),
        horsePosition.z,
      ]}
      rotation={[0, -0.8, 0]}
    >
      <CuboidCollider args={[0.65, 1.25, 1.55]} position={[0, 1.25, 0]} />
      <HorseModel moving={idle} />
    </RigidBody>
  );
}

function ThirdPersonRanger({
  enabled,
  destinations,
  playerPosition,
  onOpen,
  onNearby,
  onTelemetry,
  mounted,
  onMountedChange,
  horsePosition,
}: {
  enabled: boolean;
  destinations: GameDestination[];
  playerPosition: MutableRefObject<Vector3>;
  onOpen: (type: BlockType) => void;
  onNearby: (destination: GameDestination | null) => void;
  onTelemetry: (telemetry: GameTelemetry) => void;
  mounted: boolean;
  onMountedChange: (mounted: boolean) => void;
  horsePosition: MutableRefObject<Vector3>;
}) {
  const body = useRef<RapierRigidBody>(null);
  const avatar = useRef<Group>(null);
  const moving = useRef(false);
  const keys = useRef(new Set<string>());
  const dragging = useRef(false);
  const previous = useRef({ x: 0, y: 0 });
  const yaw = useRef(0);
  const pitch = useRef(0.22);
  const nearest = useRef<GameDestination | null>(null);
  const nearestKey = useRef<string | null>(null);
  const canMount = useRef(false);
  const stamina = useRef(100);
  const telemetryFrame = useRef(0);
  const { camera, gl } = useThree();
  const { world, rapier } = useRapier();
  const forward = useMemo(() => new Vector3(), []);
  const right = useMemo(() => new Vector3(), []);
  const direction = useMemo(() => new Vector3(), []);
  const desiredCamera = useMemo(() => new Vector3(), []);
  const lookTarget = useMemo(() => new Vector3(), []);
  const cameraRayDirection = useMemo(() => new Vector3(), []);

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      keys.current.add(event.code);
      if (event.code === 'KeyE' && nearest.current) onOpen(nearest.current.blockType);
      if (event.code === 'KeyF') {
        if (mounted) {
          const translation = body.current?.translation();
          if (translation) {
            horsePosition.current.set(translation.x + 1.5, translation.y, translation.z + 0.8);
          }
          onMountedChange(false);
        } else if (canMount.current) {
          onMountedChange(true);
        }
      }
    };
    const up = (event: KeyboardEvent) => keys.current.delete(event.code);
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, [horsePosition, mounted, onMountedChange, onOpen]);

  useEffect(() => {
    if (!enabled) return;
    const canvas = gl.domElement;
    const start = (event: PointerEvent) => {
      dragging.current = true;
      previous.current = { x: event.clientX, y: event.clientY };
      canvas.setPointerCapture?.(event.pointerId);
    };
    const move = (event: PointerEvent) => {
      if (!dragging.current) return;
      const dx = event.clientX - previous.current.x;
      const dy = event.clientY - previous.current.y;
      previous.current = { x: event.clientX, y: event.clientY };
      yaw.current -= dx * 0.0035;
      pitch.current = Math.max(-0.08, Math.min(0.62, pitch.current + dy * 0.0025));
    };
    const end = (event: PointerEvent) => {
      dragging.current = false;
      canvas.releasePointerCapture?.(event.pointerId);
    };
    canvas.addEventListener('pointerdown', start);
    canvas.addEventListener('pointermove', move);
    canvas.addEventListener('pointerup', end);
    canvas.addEventListener('pointercancel', end);
    return () => {
      canvas.removeEventListener('pointerdown', start);
      canvas.removeEventListener('pointermove', move);
      canvas.removeEventListener('pointerup', end);
      canvas.removeEventListener('pointercancel', end);
    };
  }, [enabled, gl]);

  useFrame((_, delta) => {
    const rigidBody = body.current;
    if (!rigidBody) return;
    const translation = rigidBody.translation();
    playerPosition.current.set(translation.x, translation.y, translation.z);
    if (!enabled) return;

    const velocity = rigidBody.linvel();
    const wantsToSprint = keys.current.has('ShiftLeft') || keys.current.has('ShiftRight');
    forward.set(-Math.sin(yaw.current), 0, -Math.cos(yaw.current));
    right.set(Math.cos(yaw.current), 0, -Math.sin(yaw.current));
    direction.set(0, 0, 0);
    if (keys.current.has('KeyW') || keys.current.has('ArrowUp')) direction.add(forward);
    if (keys.current.has('KeyS') || keys.current.has('ArrowDown')) direction.sub(forward);
    if (keys.current.has('KeyD') || keys.current.has('ArrowRight')) direction.add(right);
    if (keys.current.has('KeyA') || keys.current.has('ArrowLeft')) direction.sub(right);
    moving.current = direction.lengthSq() > 0;
    const height = terrainHeightAt(translation.x, translation.z);
    const inWater = height <= WATER_LEVEL + 0.18;
    const sprinting = wantsToSprint && moving.current && stamina.current > 2 && !inWater;
    stamina.current = Math.max(
      0,
      Math.min(100, stamina.current + (sprinting ? (mounted ? -17 : -24) : 15) * delta),
    );
    const speed = mounted
      ? inWater
        ? 4.4
        : sprinting
          ? 22
          : 13.5
      : inWater
        ? 3.25
        : sprinting
          ? 11.5
          : 7.2;
    if (moving.current) {
      direction.normalize().multiplyScalar(speed);
      if (avatar.current) {
        const desiredRotation = Math.atan2(direction.x, direction.z);
        avatar.current.rotation.y += (desiredRotation - avatar.current.rotation.y) * Math.min(1, delta * 12);
      }
    }
    rigidBody.setLinvel({ x: direction.x, y: velocity.y, z: direction.z }, true);
    if (keys.current.has('Space') && Math.abs(velocity.y) < 0.08) {
      rigidBody.setLinvel({ x: direction.x, y: mounted ? 6.2 : 5.2, z: direction.z }, true);
    }

    const distance = mounted ? 10.6 : 7.8;
    const horizontalDistance = Math.cos(pitch.current) * distance;
    desiredCamera.set(
      translation.x + Math.sin(yaw.current) * horizontalDistance,
      translation.y + (mounted ? 3.45 : 2.5) + Math.sin(pitch.current) * distance,
      translation.z + Math.cos(yaw.current) * horizontalDistance,
    );
    lookTarget.set(translation.x, translation.y + (mounted ? 2.15 : 1.25), translation.z);
    cameraRayDirection.copy(desiredCamera).sub(lookTarget);
    const desiredDistance = cameraRayDirection.length();
    cameraRayDirection.normalize();
    const ray = new rapier.Ray(
      { x: lookTarget.x, y: lookTarget.y, z: lookTarget.z },
      { x: cameraRayDirection.x, y: cameraRayDirection.y, z: cameraRayDirection.z },
    );
    const hit = world.castRay(ray, desiredDistance, true, undefined, undefined, undefined, rigidBody);
    if (hit && hit.timeOfImpact < desiredDistance) {
      const safeDistance = Math.max(1.5, hit.timeOfImpact - 0.38);
      desiredCamera.copy(lookTarget).addScaledVector(cameraRayDirection, safeDistance);
    }
    camera.position.lerp(desiredCamera, Math.min(1, delta * 8));
    camera.lookAt(lookTarget);

    if (translation.y < height - 5) {
      rigidBody.setTranslation({ x: translation.x, y: height + 1.45, z: translation.z }, true);
      rigidBody.setLinvel({ x: 0, y: 0, z: 0 }, true);
    }

    telemetryFrame.current += 1;
    canMount.current = !mounted && Math.hypot(
      translation.x - horsePosition.current.x,
      translation.z - horsePosition.current.z,
    ) < 4.8;
    if (telemetryFrame.current % 8 === 0) {
      onTelemetry({
        x: translation.x,
        y: translation.y,
        z: translation.z,
        heading: ((-yaw.current * 180) / Math.PI + 360) % 360,
        speed: Math.hypot(direction.x, direction.z),
        stamina: stamina.current,
        inWater,
        mounted,
        canMount: canMount.current,
        terrain: terrainKindAt(translation.x, translation.z, height),
      });
    }

    let candidate: GameDestination | null = null;
    let candidateDistance = 7.5;
    for (const destination of destinations) {
      const distanceToCabin = Math.hypot(
        translation.x - destination.position[0],
        translation.z - destination.position[2],
      );
      if (distanceToCabin < candidateDistance) {
        candidate = destination;
        candidateDistance = distanceToCabin;
      }
    }
    nearest.current = candidate;
    const key = candidate?.blockType ?? null;
    if (key !== nearestKey.current) {
      nearestKey.current = key;
      onNearby(candidate);
    }
  });

  return (
    <RigidBody
      ref={body}
      position={[0, 1.45, 22]}
      colliders={false}
      enabledRotations={[false, false, false]}
      linearDamping={10}
      friction={1}
      canSleep={false}
      ccd
    >
      <CapsuleCollider
        key={mounted ? 'mounted' : 'foot'}
        args={mounted ? [0.82, 0.48] : [0.52, 0.34]}
        position={[0, mounted ? 1.18 : 0.84, 0]}
      />
      <group ref={avatar}>
        {mounted ? <HorseModel moving={moving} withRider /> : <RangerAvatar moving={moving} />}
      </group>
    </RigidBody>
  );
}

function CinematicCamera({ active }: { active: boolean }) {
  const { camera } = useThree();
  useFrame(({ clock }) => {
    if (!active) return;
    const time = clock.elapsedTime * 0.08;
    camera.position.set(Math.sin(time) * 43, 14 + Math.sin(time * 1.7) * 2, Math.cos(time) * 43 - 3);
    camera.lookAt(0, 3.1, -5);
  });
  return null;
}

function Diagnostics({ onReport }: { onReport: (message: string) => void }) {
  const frames = useRef(0);
  useFrame(({ gl, scene, camera }) => {
    frames.current += 1;
    if (frames.current !== 120 && frames.current % 420 !== 0) return;
    const context = gl.getContext();
    onReport(
      [
        context.isContextLost() ? 'WebGL context lost' : 'WebGL live',
        `${gl.info.render.calls} draw calls`,
        `${gl.info.render.triangles} triangles`,
        `${scene.children.length} scene nodes`,
        `camera ${camera.position.toArray().map((value) => value.toFixed(1)).join('/')}`,
      ].join(' · '),
    );
  });
  return null;
}

export default function ArchiveGameScene({
  entered,
  destinations,
  playerPosition,
  travelRequest,
  onOpen,
  onNearby,
  onTelemetry,
  onDiagnostics,
  collectedKeepsakes,
  onCollectKeepsake,
}: ArchiveGameSceneProps) {
  const { scene } = useThree();

  useEffect(() => {
    scene.fog = new Fog('#667565', 24, 215);
    return () => {
      scene.fog = null;
    };
  }, [scene]);

  return (
    <>
      <color attach="background" args={['#919d8b']} />
      <ambientLight intensity={0.85} color="#d8d2b8" />
      <hemisphereLight args={['#cbd0bd', '#24392c', 1.3]} />
      <directionalLight
        castShadow
        position={[-32, 42, 22]}
        intensity={2.6}
        color="#e2d4aa"
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={150}
        shadow-camera-left={-75}
        shadow-camera-right={75}
        shadow-camera-top={75}
        shadow-camera-bottom={-75}
      />
      <Diagnostics onReport={onDiagnostics} />
      <CinematicCamera active={!entered} />
      <Suspense fallback={null}>
        <MountainPanorama playerPosition={playerPosition} />
      </Suspense>
      <InfiniteWater playerPosition={playerPosition} />
      <Suspense fallback={null}>
        <QuaterniusForest
          playerPosition={playerPosition}
          destinations={destinations}
          clearings={WORLD_INFRASTRUCTURE_CLEARINGS}
          heightAt={terrainHeightAt}
        />
        <QuaterniusGroundCover
          playerPosition={playerPosition}
          destinations={destinations}
          clearings={WORLD_INFRASTRUCTURE_CLEARINGS}
          heightAt={terrainHeightAt}
          waterLevel={WATER_LEVEL}
        />
      </Suspense>
      <DynamicWeather playerPosition={playerPosition} />
      <Suspense fallback={null}>
        <ArchiveWildlife playerPosition={playerPosition} heightAt={terrainHeightAt} />
      </Suspense>
      <WorldKeepsakes
        enabled={entered}
        playerPosition={playerPosition}
        collected={collectedKeepsakes}
        onCollect={onCollectKeepsake}
      />
      <Suspense fallback={null}>
        <Physics gravity={[0, -14, 0]} timeStep="vary">
          <InfiniteTerrain playerPosition={playerPosition} />
          <InfiniteForestColliders playerPosition={playerPosition} destinations={destinations} />
          <RiverFootbridge />
          <WorldLandmarks destinations={destinations} onOpen={onOpen} />
          <FirstPersonExplorer
            enabled={entered}
            destinations={destinations}
            playerPosition={playerPosition}
            travelRequest={travelRequest}
            heightAt={terrainHeightAt}
            waterLevel={WATER_LEVEL}
            onOpen={onOpen}
            onNearby={onNearby}
            onTelemetry={onTelemetry}
          />
        </Physics>
      </Suspense>
    </>
  );
}

useGLTF.preload('/archive-world/archive-lodge.glb?v=2');
