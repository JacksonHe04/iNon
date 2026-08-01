'use client';

import {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import {
  CuboidCollider,
  Physics,
  RigidBody,
  type RapierRigidBody,
} from '@react-three/rapier';
import {
  ACESFilmicToneMapping,
  AdditiveBlending,
  Color,
  DynamicDrawUsage,
  Fog,
  Group,
  InstancedMesh,
  Matrix4,
  Object3D,
  Quaternion,
  ShaderMaterial,
  SRGBColorSpace,
  Vector3,
} from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import type { ReadmeData } from '@/types';
import type { BlockConfig, BlockType, LayoutConfig } from '@/types/layout';
import { DEFAULT_LAYOUT_CONFIG } from '@/lib/content/default-layout';
import { getBlockTitle } from '@/lib/blocks/registry';
import BlockRenderer from '@/components/blocks/BlockRenderer';
import BlockCanvasEngine from '@/components/blocks/BlockCanvasEngine';
import ArchiveGameScene, {
  type GameDestination,
  type GameTelemetry,
  type GameTravelRequest,
} from '@/components/world/ArchiveGameScene';
import ArchiveInteriorWorld, {
  type ArchiveRealm,
} from '@/components/world/ArchiveInteriorWorld';

interface ArchiveWorldProps {
  data: ReadmeData;
  layoutConfig?: LayoutConfig;
}

type LandmarkDefinition = GameDestination;

const LANDMARKS: GameDestination[] = [
  { blockType: 'bio', position: [-18, 0, 13], number: '01', subtitle: '旅行营地 · 身份与此刻', siteKind: 'camp' },
  { blockType: 'projects', position: [54, 0, -34], number: '02', subtitle: '木工作坊 · 正在生长的事物', siteKind: 'workshop' },
  { blockType: 'timeline', position: [-112, 0, -62], number: '03', subtitle: '旧车站 · 地点与年份', siteKind: 'station' },
  { blockType: 'education', position: [96, 0, -122], number: '04', subtitle: '山地观测塔 · 学习与自然', siteKind: 'watchtower' },
  { blockType: 'work', position: [-158, 0, -148], number: '05', subtitle: '河谷锯木场 · 工作与批注', siteKind: 'sawmill' },
  { blockType: 'music', position: [146, 0, -176], number: '06', subtitle: '流动唱片车 · 声音与节拍', siteKind: 'wagon' },
  { blockType: 'movies', position: [-206, 0, 116], number: '07', subtitle: '露天放映场 · 影片与导演', siteKind: 'cinema' },
  { blockType: 'books', position: [214, 0, 132], number: '08', subtitle: '林间书屋 · 页边痕迹', siteKind: 'cabin' },
  { blockType: 'messages', position: [18, 0, -258], number: '09', subtitle: '边地邮局 · 来信与回声', siteKind: 'post' },
];

const vertexNoise = /* glsl */ `
  uniform float uTime;
  varying vec3 vWorld;
  varying float vGrain;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  void main() {
    vec3 displaced = position;
    float grain = hash(position.xz * 0.37 + floor(uTime * 4.0) * 0.013);
    displaced.y += sin(position.x * 0.18 + uTime * 0.12) * 0.11;
    displaced.y += sin(position.z * 0.16 - uTime * 0.09) * 0.08;
    vec4 world = modelMatrix * vec4(displaced, 1.0);
    vWorld = world.xyz;
    vGrain = grain;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const fragmentNoise = /* glsl */ `
  uniform float uTime;
  uniform vec3 uSage;
  uniform vec3 uForest;
  varying vec3 vWorld;
  varying float vGrain;

  void main() {
    float bands = sin(vWorld.x * 0.075) * sin(vWorld.z * 0.09);
    float pulse = 0.5 + 0.5 * sin(uTime * 0.32 + vWorld.x * 0.08 + vWorld.z * 0.06);
    vec3 color = mix(uForest, uSage, 0.48 + bands * 0.12 + pulse * 0.05);
    color += (vGrain - 0.5) * 0.075;
    gl_FragColor = vec4(color, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

const particleVertex = /* glsl */ `
  uniform float uTime;
  varying float vPulse;

  void main() {
    vec4 instancePosition = instanceMatrix * vec4(position, 1.0);
    float phase = instancePosition.x * 1.37 + instancePosition.y * 2.11 + instancePosition.z * 0.93;
    instancePosition.y += sin(uTime * 0.36 + phase) * 0.28;
    vPulse = 0.5 + 0.5 * sin(uTime * 5.2 + phase * 3.0);
    gl_Position = projectionMatrix * modelViewMatrix * instancePosition;
  }
`;

const particleFragment = /* glsl */ `
  uniform vec3 uSage;
  uniform vec3 uOchre;
  varying float vPulse;

  void main() {
    vec3 color = mix(uSage, uOchre, vPulse * 0.32);
    float alpha = 0.18 + vPulse * 0.72;
    gl_FragColor = vec4(color, alpha);
  }
`;

function seededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function VerdantGround() {
  const material = useRef<ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSage: { value: new Color('#7d8972') },
      uForest: { value: new Color('#26362b') },
    }),
    [],
  );

  useFrame(({ clock }) => {
    if (material.current) material.current.uniforms.uTime.value = clock.elapsedTime;
  });

  return (
    <mesh rotation-x={-Math.PI / 2} receiveShadow>
      <planeGeometry args={[90, 90, 128, 128]} />
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        vertexShader={vertexNoise}
        fragmentShader={fragmentNoise}
      />
    </mesh>
  );
}

function FlickeringSporeField({ count = 1100 }: { count?: number }) {
  const mesh = useRef<InstancedMesh>(null);
  const material = useRef<ShaderMaterial>(null);
  const dummy = useMemo(() => new Object3D(), []);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSage: { value: new Color('#c2c69f') },
      uOchre: { value: new Color('#c29a55') },
    }),
    [],
  );

  useEffect(() => {
    if (!mesh.current) return;
    const random = seededRandom(271828);
    for (let index = 0; index < count; index += 1) {
      const angle = random() * Math.PI * 2;
      const radius = 4 + random() * 35;
      dummy.position.set(
        Math.cos(angle) * radius,
        0.35 + random() * 9,
        Math.sin(angle) * radius,
      );
      const scale = 0.018 + random() * 0.055;
      dummy.scale.setScalar(scale);
      dummy.rotation.set(random() * Math.PI, random() * Math.PI, random() * Math.PI);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(index, dummy.matrix);
    }
    mesh.current.instanceMatrix.setUsage(DynamicDrawUsage);
    mesh.current.instanceMatrix.needsUpdate = true;
  }, [count, dummy]);

  useFrame(({ clock }, delta) => {
    if (material.current) material.current.uniforms.uTime.value = clock.elapsedTime;
    if (mesh.current) mesh.current.rotation.y += delta * 0.003;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]} frustumCulled={false}>
      <icosahedronGeometry args={[1, 0]} />
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        vertexShader={particleVertex}
        fragmentShader={particleFragment}
        transparent
        depthWrite={false}
        blending={AdditiveBlending}
      />
    </instancedMesh>
  );
}

function InstancedForest({ count = 260 }: { count?: number }) {
  const trunks = useRef<InstancedMesh>(null);
  const crowns = useRef<InstancedMesh>(null);
  const matrices = useMemo(() => {
    const random = seededRandom(161803);
    const items: Matrix4[] = [];
    const dummy = new Object3D();
    for (let index = 0; index < count; index += 1) {
      const angle = random() * Math.PI * 2;
      const radius = 21 + random() * 23;
      const height = 1.8 + random() * 4.8;
      dummy.position.set(Math.cos(angle) * radius, height * 0.5, Math.sin(angle) * radius);
      dummy.scale.set(0.55 + random() * 0.55, height, 0.55 + random() * 0.55);
      dummy.rotation.set(0, random() * Math.PI, (random() - 0.5) * 0.04);
      dummy.updateMatrix();
      items.push(dummy.matrix.clone());
    }
    return items;
  }, [count]);

  useEffect(() => {
    matrices.forEach((matrix, index) => {
      trunks.current?.setMatrixAt(index, matrix);
      const position = new Vector3();
      const rotation = new Quaternion();
      const scale = new Vector3();
      matrix.decompose(position, rotation, scale);
      const crownMatrix = new Matrix4().compose(
        new Vector3(position.x, scale.y + 1.25, position.z),
        rotation,
        new Vector3(scale.x * 2.2, 1.4 + scale.y * 0.16, scale.z * 2.2),
      );
      crowns.current?.setMatrixAt(index, crownMatrix);
    });
    if (trunks.current) trunks.current.instanceMatrix.needsUpdate = true;
    if (crowns.current) crowns.current.instanceMatrix.needsUpdate = true;
  }, [matrices]);

  return (
    <group>
      <instancedMesh ref={trunks} args={[undefined, undefined, count]} castShadow receiveShadow>
        <cylinderGeometry args={[0.14, 0.24, 1, 6]} />
        <meshStandardMaterial color="#3d3326" roughness={1} />
      </instancedMesh>
      <instancedMesh ref={crowns} args={[undefined, undefined, count]} castShadow receiveShadow>
        <coneGeometry args={[1.15, 2.8, 7]} />
        <meshStandardMaterial color="#334a39" roughness={0.96} />
      </instancedMesh>
    </group>
  );
}

function DistantHills({ count = 22 }: { count?: number }) {
  const hills = useRef<InstancedMesh>(null);
  const matrices = useMemo(() => {
    const random = seededRandom(141421);
    const dummy = new Object3D();
    return Array.from({ length: count }, (_, index) => {
      const angle = (index / count) * Math.PI * 2 + (random() - 0.5) * 0.18;
      const radius = 36 + random() * 9;
      const height = 7 + random() * 10;
      dummy.position.set(Math.cos(angle) * radius, height * 0.48 - 0.2, Math.sin(angle) * radius);
      dummy.scale.set(5.5 + random() * 6, height, 5.5 + random() * 6);
      dummy.rotation.set(0, random() * Math.PI, 0);
      dummy.updateMatrix();
      return dummy.matrix.clone();
    });
  }, [count]);

  useEffect(() => {
    matrices.forEach((matrix, index) => hills.current?.setMatrixAt(index, matrix));
    if (hills.current) hills.current.instanceMatrix.needsUpdate = true;
  }, [matrices]);

  return (
    <instancedMesh ref={hills} args={[undefined, undefined, count]} receiveShadow>
      <coneGeometry args={[1, 1, 7]} />
      <meshStandardMaterial color="#526552" roughness={1} />
    </instancedMesh>
  );
}

function InstancedUndergrowth({ count = 420 }: { count?: number }) {
  const plants = useRef<InstancedMesh>(null);
  const matrices = useMemo(() => {
    const random = seededRandom(173205);
    const dummy = new Object3D();
    return Array.from({ length: count }, () => {
      const angle = random() * Math.PI * 2;
      const radius = 7 + random() * 26;
      const height = 0.28 + random() * 0.82;
      dummy.position.set(Math.cos(angle) * radius, height * 0.45, Math.sin(angle) * radius);
      dummy.scale.set(0.4 + random() * 0.6, height, 0.4 + random() * 0.6);
      dummy.rotation.set((random() - 0.5) * 0.16, random() * Math.PI, (random() - 0.5) * 0.16);
      dummy.updateMatrix();
      return dummy.matrix.clone();
    });
  }, [count]);

  useEffect(() => {
    matrices.forEach((matrix, index) => plants.current?.setMatrixAt(index, matrix));
    if (plants.current) plants.current.instanceMatrix.needsUpdate = true;
  }, [matrices]);

  return (
    <instancedMesh ref={plants} args={[undefined, undefined, count]} receiveShadow>
      <coneGeometry args={[0.11, 1, 3]} />
      <meshStandardMaterial color="#778167" roughness={1} />
    </instancedMesh>
  );
}

function BirdFlock({ count = 24 }: { count?: number }) {
  const leftWings = useRef<InstancedMesh>(null);
  const rightWings = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);
  const birds = useMemo(() => {
    const random = seededRandom(223607);
    return Array.from({ length: count }, (_, index) => ({
      x: -16 + (index % 8) * 2.2 + random() * 1.4,
      y: 9 + Math.floor(index / 8) * 1.35 + random() * 1.6,
      z: -18 - Math.floor(index / 8) * 3.4 + random() * 2.4,
      phase: random() * Math.PI * 2,
      scale: 0.58 + random() * 0.72,
    }));
  }, [count]);

  useFrame(({ clock }) => {
    const time = clock.elapsedTime;
    birds.forEach((bird, index) => {
      const drift = ((time * 0.75 + index * 0.08) % 34) - 8;
      const y = bird.y + Math.sin(time * 0.7 + bird.phase) * 0.35;
      const flap = Math.sin(time * 5.2 + bird.phase) * 0.42;

      dummy.position.set(bird.x + drift, y, bird.z);
      dummy.scale.setScalar(bird.scale);
      dummy.rotation.set(0.08 + flap, -0.2, -0.35);
      dummy.updateMatrix();
      leftWings.current?.setMatrixAt(index, dummy.matrix);

      dummy.rotation.set(-0.08 - flap, -0.2, 0.35);
      dummy.updateMatrix();
      rightWings.current?.setMatrixAt(index, dummy.matrix);
    });
    if (leftWings.current) leftWings.current.instanceMatrix.needsUpdate = true;
    if (rightWings.current) rightWings.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      <instancedMesh ref={leftWings} args={[undefined, undefined, count]} frustumCulled={false}>
        <boxGeometry args={[0.5, 0.025, 0.12]} />
        <meshBasicMaterial color="#ede8d8" toneMapped={false} />
      </instancedMesh>
      <instancedMesh ref={rightWings} args={[undefined, undefined, count]} frustumCulled={false}>
        <boxGeometry args={[0.5, 0.025, 0.12]} />
        <meshBasicMaterial color="#ede8d8" toneMapped={false} />
      </instancedMesh>
    </group>
  );
}

function ArchiveSanctum() {
  const gltf = useLoader(GLTFLoader, '/archive-world/archive-sanctum.glb');
  const scene = useMemo(() => gltf.scene.clone(true), [gltf.scene]);

  useEffect(() => {
    scene.traverse((object) => {
      if ('castShadow' in object) object.castShadow = true;
      if ('receiveShadow' in object) object.receiveShadow = true;
    });
  }, [scene]);

  return <primitive object={scene} position={[0, 0, 0]} />;
}

function ArchiveLandmark({
  definition,
  showLabel,
  onOpen,
}: {
  definition: LandmarkDefinition;
  showLabel: boolean;
  onOpen: (type: BlockType) => void;
}) {
  const group = useRef<Group>(null);

  useFrame(({ clock }) => {
    if (group.current) group.current.position.y = 0.08 + Math.sin(clock.elapsedTime * 0.7 + Number(definition.number)) * 0.08;
  });

  return (
    <group ref={group} position={definition.position}>
      <mesh
        castShadow
        receiveShadow
        onClick={(event) => {
          event.stopPropagation();
          onOpen(definition.blockType);
        }}
      >
        <cylinderGeometry args={[1.35, 1.7, 0.72, 8]} />
        <meshStandardMaterial color="#465a48" roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.8, 0]} castShadow>
        <boxGeometry args={[2.5, 2.7, 0.26]} />
        <meshStandardMaterial color="#d8caa7" roughness={0.93} />
      </mesh>
      <mesh position={[0, 2.15, 0.15]}>
        <torusGeometry args={[0.54, 0.035, 8, 48]} />
        <meshStandardMaterial color="#6f7b63" roughness={0.8} />
      </mesh>
      {showLabel && (
        <Html position={[0, 1.76, 0.22]} center transform distanceFactor={3}>
          <button className="archive-world-landmark" onClick={() => onOpen(definition.blockType)}>
            <span>{definition.number}</span>
            <strong>{getBlockTitle(definition.blockType)}</strong>
            <small>{definition.subtitle}</small>
          </button>
        </Html>
      )}
    </group>
  );
}

function Player({ enabled }: { enabled: boolean }) {
  const body = useRef<RapierRigidBody>(null);
  const keys = useRef(new Set<string>());
  const forward = useMemo(() => new Vector3(), []);
  const side = useMemo(() => new Vector3(), []);
  const direction = useMemo(() => new Vector3(), []);
  const cameraTarget = useMemo(() => new Vector3(), []);

  useEffect(() => {
    const down = (event: KeyboardEvent) => keys.current.add(event.code);
    const up = (event: KeyboardEvent) => keys.current.delete(event.code);
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, []);

  useFrame(({ camera }, delta) => {
    const rigidBody = body.current;
    if (!rigidBody || !enabled) return;
    const translation = rigidBody.translation();
    const velocity = rigidBody.linvel();
    forward.set(0, 0, -1).applyQuaternion(camera.quaternion).setY(0).normalize();
    side.set(1, 0, 0).applyQuaternion(camera.quaternion).setY(0).normalize();
    direction.set(0, 0, 0);
    if (keys.current.has('KeyW') || keys.current.has('ArrowUp')) direction.add(forward);
    if (keys.current.has('KeyS') || keys.current.has('ArrowDown')) direction.sub(forward);
    if (keys.current.has('KeyD') || keys.current.has('ArrowRight')) direction.add(side);
    if (keys.current.has('KeyA') || keys.current.has('ArrowLeft')) direction.sub(side);
    if (direction.lengthSq() > 0) direction.normalize().multiplyScalar(5.4);
    rigidBody.setLinvel({ x: direction.x, y: velocity.y, z: direction.z }, true);
    if (keys.current.has('Space') && Math.abs(velocity.y) < 0.08) {
      rigidBody.setLinvel({ x: direction.x, y: 4.5, z: direction.z }, true);
    }
    cameraTarget.set(translation.x, translation.y + 0.62, translation.z);
    camera.position.lerp(cameraTarget, Math.min(1, delta * 12));
  });

  return (
    <RigidBody
      ref={body}
      position={[0, 1.1, 14]}
      colliders={false}
      enabledRotations={[false, false, false]}
      linearDamping={8}
      friction={1}
      canSleep={false}
    >
      <CuboidCollider args={[0.34, 0.82, 0.34]} />
    </RigidBody>
  );
}

function CameraPrelude({ active }: { active: boolean }) {
  const { camera } = useThree();

  useEffect(() => {
    if (!active) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    camera.position.set(20, 15, 30);
    camera.lookAt(0, 2.8, 0);
    if (reduceMotion) {
      camera.position.set(0, 3.2, 14);
      camera.lookAt(0, 2, 0);
      return;
    }
    const positionTween = gsap.to(camera.position, {
      x: 0,
      y: 4.2,
      z: 16,
      duration: 5.2,
      ease: 'power3.inOut',
      onUpdate: () => camera.lookAt(0, 2.8, 0),
    });
    return () => {
      positionTween.kill();
    };
  }, [active, camera]);

  return null;
}

function DragLookControls({ enabled }: { enabled: boolean }) {
  const { camera, gl } = useThree();
  const dragging = useRef(false);
  const previous = useRef({ x: 0, y: 0 });
  const angles = useRef({ yaw: 0, pitch: -0.08 });

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
      angles.current.yaw -= dx * 0.0032;
      angles.current.pitch = Math.max(
        -Math.PI * 0.42,
        Math.min(Math.PI * 0.42, angles.current.pitch - dy * 0.0027),
      );
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

  useFrame(() => {
    if (!enabled) return;
    camera.rotation.order = 'YXZ';
    camera.rotation.y = angles.current.yaw;
    camera.rotation.x = angles.current.pitch;
  }, -1);

  return null;
}

function WorldScene({
  entered,
  onOpen,
  onDiagnostics,
}: {
  entered: boolean;
  onOpen: (type: BlockType) => void;
  onDiagnostics: (message: string) => void;
}) {
  const { scene } = useThree();

  useEffect(() => {
    scene.fog = new Fog('#65705d', 12, 62);
    return () => {
      scene.fog = null;
    };
  }, [scene]);

  return (
    <>
      <color attach="background" args={['#89947e']} />
      <WorldDiagnostics onReport={onDiagnostics} />
      <ambientLight intensity={1.15} color="#d9d3b7" />
      <directionalLight
        castShadow
        position={[-12, 18, 10]}
        intensity={2.1}
        color="#e2d3aa"
        shadow-mapSize={[1024, 1024]}
        shadow-camera-far={65}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
      />
      <hemisphereLight args={['#b9c1a4', '#283a2e', 1.35]} />
      <CameraPrelude active={!entered} />
      <DragLookControls enabled={entered} />
      <VerdantGround />
      <Suspense fallback={null}>
        <ArchiveSanctum />
      </Suspense>
      <Suspense fallback={null}>
        <Physics gravity={[0, -12, 0]} timeStep="vary">
          <RigidBody type="fixed" colliders={false}>
            <CuboidCollider args={[45, 0.25, 45]} position={[0, -0.25, 0]} />
            <CuboidCollider args={[0.5, 5, 45]} position={[45, 4.5, 0]} />
            <CuboidCollider args={[0.5, 5, 45]} position={[-45, 4.5, 0]} />
            <CuboidCollider args={[45, 5, 0.5]} position={[0, 4.5, 45]} />
            <CuboidCollider args={[45, 5, 0.5]} position={[0, 4.5, -45]} />
          </RigidBody>
          <Player enabled={entered} />
        </Physics>
      </Suspense>
      <DistantHills />
      <InstancedForest />
      <InstancedUndergrowth />
      <BirdFlock />
      <FlickeringSporeField />
      {LANDMARKS.map((definition) => (
        <ArchiveLandmark
          key={definition.blockType}
          definition={definition}
          showLabel={entered}
          onOpen={onOpen}
        />
      ))}
    </>
  );
}

function WorldDiagnostics({ onReport }: { onReport: (message: string) => void }) {
  const frame = useRef(0);

  useFrame(({ gl, scene, camera }) => {
    frame.current += 1;
    if (frame.current !== 90 && frame.current % 360 !== 0) return;
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

function WorldOverlay({ children }: { children: ReactNode }) {
  return <div className="archive-world-overlay">{children}</div>;
}

function WorldMinimap({
  telemetry,
  destinations,
  onTravel,
}: {
  telemetry: GameTelemetry;
  destinations: GameDestination[];
  onTravel: (destination: GameDestination) => void;
}) {
  const mapRadius = 72;
  const worldExtent = 285;
  const project = (x: number, z: number) => {
    const rawX = (x / worldExtent) * mapRadius;
    const rawY = (z / worldExtent) * mapRadius;
    const distance = Math.hypot(rawX, rawY);
    const clamp = distance > mapRadius ? mapRadius / distance : 1;
    return [90 + rawX * clamp, 90 + rawY * clamp] as const;
  };
  const [playerMapX, playerMapY] = project(telemetry.x, telemetry.z);
  return (
    <div className="archive-world-minimap" aria-label="世界小地图，点击目的地可传送">
      <div className="archive-world-minimap__heading">
        <span>FIELD MAP</span>
        <strong>{Math.round(telemetry.heading).toString().padStart(3, '0')}°</strong>
      </div>
      <svg viewBox="0 0 180 180" role="img" aria-label="玩家与世界目的地位置">
        <defs>
          <radialGradient id="archive-map-ground">
            <stop offset="0" stopColor="#89917a" />
            <stop offset="1" stopColor="#314637" />
          </radialGradient>
          <pattern id="archive-map-lines" width="12" height="12" patternUnits="userSpaceOnUse">
            <path d="M0 12 12 0" stroke="#e1d5ae" strokeOpacity=".08" strokeWidth=".6" />
          </pattern>
        </defs>
        <circle cx="90" cy="90" r="84" fill="url(#archive-map-ground)" stroke="#d5c58f" strokeOpacity=".55" />
        <circle cx="90" cy="90" r="84" fill="url(#archive-map-lines)" />
        <path d="M5 55 C48 25 118 148 176 106" fill="none" stroke="#2f6659" strokeWidth="12" strokeOpacity=".72" />
        <path d="M5 55 C48 25 118 148 176 106" fill="none" stroke="#a9c1a5" strokeWidth="1" strokeOpacity=".45" />
        {[32, 58].map((radius) => (
          <circle key={radius} cx="90" cy="90" r={radius} fill="none" stroke="#eadfbf" strokeOpacity=".12" strokeDasharray="3 5" />
        ))}
        {destinations.map((destination) => {
          const [mapX, mapY] = project(destination.position[0], destination.position[2]);
          return (
            <g
              key={destination.blockType}
              transform={`translate(${mapX} ${mapY})`}
            >
              <circle r="5.2" fill="#d6bd73" stroke="#24382b" strokeWidth="1.2" />
              <text x="7" y="3" fill="#f0e7cc" fontSize="7">{destination.number}</text>
              <title>{`传送到${getBlockTitle(destination.blockType)}`}</title>
            </g>
          );
        })}
        <g transform={`translate(${playerMapX} ${playerMapY}) rotate(${telemetry.heading})`}>
          <path d="M0 -10 6 8 0 5 -6 8Z" fill="#f0e5c5" stroke="#24372b" strokeWidth="1.2" />
        </g>
      </svg>
      <div className="archive-world-minimap__targets" aria-label="快速传送地点">
        {destinations.map((destination) => {
          const [mapX, mapY] = project(destination.position[0], destination.position[2]);
          return (
            <button
              key={destination.blockType}
              style={{ left: `${(mapX / 180) * 100}%`, top: `${(mapY / 180) * 100}%` }}
              aria-label={`传送到${getBlockTitle(destination.blockType)}`}
              title={`传送到${getBlockTitle(destination.blockType)}`}
              onClick={() => onTravel(destination)}
            />
          );
        })}
      </div>
      <div className="archive-world-minimap__coordinates">
        X {telemetry.x.toFixed(0)} · Z {telemetry.z.toFixed(0)}
      </div>
    </div>
  );
}

function WorldInventory({
  data,
  discovered,
  rations,
  onOpen,
  onClose,
  onUseRation,
}: {
  data: ReadmeData;
  discovered: Set<BlockType>;
  rations: number;
  onOpen: (type: BlockType) => void;
  onClose: () => void;
  onUseRation: () => void;
}) {
  const collections = [
    {
      type: 'projects' as BlockType,
      label: '工作笔记',
      count: data.development.projects.length,
      items: data.development.projects.slice(0, 5).map((item) => item.project_name),
    },
    {
      type: 'music' as BlockType,
      label: '随身唱片',
      count: data.library.music.works.length,
      items: data.library.music.works.slice(0, 5).map((item) => item.name),
    },
    {
      type: 'movies' as BlockType,
      label: '胶片盒',
      count: data.library.film.works.length,
      items: data.library.film.works.slice(0, 5).map((item) => item.name),
    },
    {
      type: 'books' as BlockType,
      label: '田野读物',
      count: data.library.book.works.length,
      items: data.library.book.works.slice(0, 5).map((item) => item.name),
    },
  ];

  return (
    <aside className="archive-world-inventory" aria-label="随身背包">
      <header>
        <div>
          <span>FIELD SATCHEL / B</span>
          <h2>随身背包</h2>
        </div>
        <button onClick={onClose}>收起 ×</button>
      </header>
      <p className="archive-world-inventory__note">
        背包会记录已经抵达的场域；收藏物件直接来自现有资料库，点击后会回到对应的空间陈列。
      </p>
      <div className="archive-world-inventory__supplies">
        <div>
          <span>已发现地标</span>
          <strong>{discovered.size} / {LANDMARKS.length}</strong>
        </div>
        <div>
          <span>田野口粮</span>
          <strong>{rations}</strong>
          <button onClick={onUseRation} disabled={rations <= 0}>使用并恢复体力</button>
        </div>
        <div>
          <span>收录藏品</span>
          <strong>{collections.reduce((total, collection) => total + collection.count, 0)}</strong>
        </div>
      </div>
      <div className="archive-world-inventory__grid">
        {collections.map((collection, index) => (
          <button
            key={collection.type}
            className={`archive-world-inventory__collection is-${index + 1}`}
            onClick={() => onOpen(collection.type)}
          >
            <span>{discovered.has(collection.type) ? '已抵达' : '未踏勘'} · {String(index + 1).padStart(2, '0')} / {collection.count}</span>
            <strong>{collection.label}</strong>
            <ul>
              {collection.items.map((item) => <li key={item}>{item}</li>)}
            </ul>
            <small>{discovered.has(collection.type) ? '回到空间陈列 →' : '在地图中发现该场域 →'}</small>
          </button>
        ))}
      </div>
    </aside>
  );
}

export default function ArchiveWorld({ data, layoutConfig }: ArchiveWorldProps) {
  const [entered, setEntered] = useState(false);
  const [selectedType, setSelectedType] = useState<BlockType | null>(null);
  const [codexOpen, setCodexOpen] = useState(false);
  const [diagnostics, setDiagnostics] = useState('WebGL initialising');
  const [nearbyDestination, setNearbyDestination] = useState<GameDestination | null>(null);
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [travelRequest, setTravelRequest] = useState<GameTravelRequest | null>(null);
  const [realm, setRealm] = useState<ArchiveRealm | null>(null);
  const [discoveredTypes, setDiscoveredTypes] = useState<BlockType[]>([]);
  const [rations, setRations] = useState(3);
  const [inventoryLoaded, setInventoryLoaded] = useState(false);
  const [telemetry, setTelemetry] = useState<GameTelemetry>({
    x: 0,
    y: 1.45,
    z: 22,
    heading: 0,
    speed: 0,
    stamina: 100,
    inWater: false,
    mounted: false,
    canMount: false,
    terrain: 'village',
  });
  const playerPosition = useRef(new Vector3(0, 1.45, 22));
  const intro = useRef<HTMLDivElement>(null);
  const transitionVeil = useRef<HTMLDivElement>(null);
  const config = layoutConfig ?? DEFAULT_LAYOUT_CONFIG;
  const discoveryStorageKey = `inon-world-discovery-${data.basic.name}`;
  const selectedBlock = useMemo<BlockConfig | null>(() => {
    if (!selectedType) return null;
    return (
      config.blocks.find((block) => block.blockType === selectedType) ??
      DEFAULT_LAYOUT_CONFIG.blocks.find((block) => block.blockType === selectedType) ??
      null
    );
  }, [config.blocks, selectedType]);

  useGSAP(
    () => {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduceMotion) return;
      gsap
        .timeline({ defaults: { ease: 'power3.out' } })
        .from('.archive-world-intro__kicker', { y: 16, autoAlpha: 0, duration: 0.7 })
        .from('.archive-world-intro h1', { y: 44, autoAlpha: 0, duration: 1.15 }, '-=0.42')
        .from('.archive-world-intro__copy', { y: 22, autoAlpha: 0, duration: 0.8 }, '-=0.62')
        .from('.archive-world-intro__actions', { y: 18, autoAlpha: 0, duration: 0.7 }, '-=0.48');
    },
    { scope: intro },
  );

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(discoveryStorageKey);
      if (saved) setDiscoveredTypes(JSON.parse(saved) as BlockType[]);
    } catch {
      // A blocked storage backend should not prevent exploration.
    }
    setInventoryLoaded(true);
  }, [discoveryStorageKey]);

  useEffect(() => {
    if (!inventoryLoaded) return;
    window.localStorage.setItem(discoveryStorageKey, JSON.stringify(discoveredTypes));
  }, [discoveredTypes, discoveryStorageKey, inventoryLoaded]);

  const markDiscovered = (type: BlockType) => {
    setDiscoveredTypes((current) => current.includes(type) ? current : [...current, type]);
  };

  const enterWorld = () => {
    gsap.to(intro.current, {
      autoAlpha: 0,
      y: -18,
      duration: 0.7,
      ease: 'power2.inOut',
      onComplete: () => setEntered(true),
    });
  };

  const releasePointerLock = () => {
    if (document.pointerLockElement) document.exitPointerLock();
  };

  useEffect(() => {
    const toggleInventory = (event: KeyboardEvent) => {
      if (event.code !== 'KeyB' || !entered || selectedType || codexOpen) return;
      setInventoryOpen((open) => !open);
    };
    window.addEventListener('keydown', toggleInventory);
    return () => window.removeEventListener('keydown', toggleInventory);
  }, [codexOpen, entered, selectedType]);

  const transitionToRealm = (nextRealm: ArchiveRealm | null) => {
    releasePointerLock();
    const veil = transitionVeil.current;
    if (!veil) {
      setRealm(nextRealm);
      return;
    }
    gsap.killTweensOf(veil);
    gsap
      .timeline({ defaults: { ease: 'power2.inOut' } })
      .set(veil, { display: 'grid', autoAlpha: 0 })
      .to(veil, { autoAlpha: 1, duration: 0.52 })
      .call(() => {
        setSelectedType(null);
        setRealm(nextRealm);
      })
      .to(veil, { autoAlpha: 0, duration: 0.72, delay: 0.16 })
      .set(veil, { display: 'none' });
  };

  const openLandmark = (type: BlockType) => {
    markDiscovered(type);
    if (type === 'music' || type === 'movies' || type === 'books') {
      transitionToRealm(type);
      return;
    }
    releasePointerLock();
    setSelectedType(type);
  };

  const travelTo = (destination: GameDestination) => {
    markDiscovered(destination.blockType);
    setSelectedType(null);
    setCodexOpen(false);
    setInventoryOpen(false);
    setNearbyDestination(null);
    const request: GameTravelRequest = {
      id: Date.now(),
      position: [
        destination.position[0],
        destination.position[1],
        destination.position[2] + 6,
      ],
    };
    setTravelRequest(request);
    window.dispatchEvent(new CustomEvent('archive-world:travel', { detail: request }));
  };

  return (
    <section className="archive-world" aria-label="iNon 绿迹开放世界">
      <div className="archive-world__canvas">
        <Canvas
          shadows
          dpr={[1, 1.5]}
          camera={{ position: [20, 15, 30], fov: 52, near: 0.1, far: 600 }}
          gl={{ antialias: false, powerPreference: 'high-performance', alpha: false }}
          onCreated={({ gl }) => {
            gl.toneMapping = ACESFilmicToneMapping;
            gl.toneMappingExposure = 0.92;
            gl.outputColorSpace = SRGBColorSpace;
          }}
        >
          <ArchiveGameScene
            entered={entered && !selectedBlock && !codexOpen && !inventoryOpen && !realm}
            destinations={LANDMARKS}
            playerPosition={playerPosition}
            travelRequest={travelRequest}
            onOpen={openLandmark}
            onNearby={setNearbyDestination}
            onTelemetry={setTelemetry}
            onDiagnostics={setDiagnostics}
          />
        </Canvas>
      </div>
      <output className="sr-only" aria-label="3D 运行状态">{diagnostics}</output>
      <div className="archive-world__grain" aria-hidden="true" />
      <div className="archive-world__vignette" aria-hidden="true" />

      {!entered && (
        <div ref={intro} className="archive-world-intro">
          <p className="archive-world-intro__kicker">iNon · Verdant world / field no. 001</p>
          <h1>{data.basic.name}的<br />开放档案世界</h1>
          <p className="archive-world-intro__copy">
            穿过雾、森林与不断闪烁的时间颗粒。这里没有从上到下的网页，只有可以抵达的经历、兴趣、项目与来信。
          </p>
          <div className="archive-world-intro__actions">
            <button onClick={enterWorld}>进入世界</button>
            <button
              className="is-secondary"
              onClick={() => {
                setCodexOpen(true);
                releasePointerLock();
              }}
            >
              直接翻阅档案
            </button>
          </div>
          <p className="archive-world-intro__note">第一人称 · WASD 快速移动 · 拖动鼠标环顾 · Shift 疾跑 · 点击地图传送 · E 进入场所</p>
        </div>
      )}

      {entered && (
        <WorldOverlay>
          <header className="archive-world-gamebar">
            <div className="archive-world-gamebar__brand">
              <span>INON / VERDANT FIELD</span>
              <strong>{data.basic.name}</strong>
            </div>
            <div className="archive-world-gamebar__mission">
              <span>当前探索</span>
              <strong>{nearbyDestination ? nearbyDestination.subtitle : '沿河谷寻找散落的档案场域'}</strong>
            </div>
            <nav aria-label="世界菜单">
              <button onClick={() => setInventoryOpen(true)}>背包 <kbd>B</kbd></button>
              <button
                onClick={() => {
                  releasePointerLock();
                  setCodexOpen(true);
                }}
              >
                档案总览
              </button>
              <button
                onClick={() => {
                  releasePointerLock();
                  setEntered(false);
                  gsap.set(intro.current, { autoAlpha: 1, y: 0 });
                }}
              >
                退出探索
              </button>
            </nav>
          </header>
          <div className="archive-world-hud">
            <div>
              <span>FIELD / LIVE</span>
              <strong>绿迹档案世界</strong>
            </div>
            <p>第一人称探索 · 拖动镜头 · WASD 移动 · Shift 疾跑 · 点击地图传送 · 空格跳跃</p>
          </div>
          <WorldMinimap telemetry={telemetry} destinations={LANDMARKS} onTravel={travelTo} />
          {nearbyDestination && (
            <button
              className="archive-world-interact"
              onClick={() => openLandmark(nearbyDestination.blockType)}
            >
              <kbd>E</kbd>
              进入{getBlockTitle(nearbyDestination.blockType)}场域
            </button>
          )}
          <div className="archive-world-mobile-controls" aria-label="移动控制">
            {[
              ['↑', 'KeyW'],
              ['←', 'KeyA'],
              ['↓', 'KeyS'],
              ['→', 'KeyD'],
            ].map(([label, code]) => (
              <button
                key={code}
                onPointerDown={() => window.dispatchEvent(new KeyboardEvent('keydown', { code }))}
                onPointerUp={() => window.dispatchEvent(new KeyboardEvent('keyup', { code }))}
                onPointerCancel={() => window.dispatchEvent(new KeyboardEvent('keyup', { code }))}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="archive-world-status" aria-label="玩家状态">
            <div className="archive-world-status__compass">
              <span>{telemetry.terrain === 'river' ? '河谷' : telemetry.terrain === 'mountain' ? '山地' : telemetry.terrain === 'forest' ? '森林' : '村落'}</span>
              <strong>{telemetry.inWater ? '涉水中' : telemetry.speed > 16 ? '疾跑中' : telemetry.speed > 0 ? '行进中' : '驻足'}</strong>
            </div>
            <div className="archive-world-status__bar">
              <label><span>体力</span><b>{Math.round(telemetry.stamina)}</b></label>
              <i><em style={{ width: `${telemetry.stamina}%` }} /></i>
            </div>
            <div className="archive-world-status__bar is-health">
              <label><span>状态</span><b>100</b></label>
              <i><em style={{ width: '100%' }} /></i>
            </div>
            <p>ALT {telemetry.y.toFixed(1)} m · SPD {telemetry.speed.toFixed(1)}</p>
          </div>
        </WorldOverlay>
      )}

      {inventoryOpen && (
        <WorldInventory
          data={data}
          discovered={new Set(discoveredTypes)}
          rations={rations}
          onClose={() => setInventoryOpen(false)}
          onUseRation={() => {
            if (rations <= 0) return;
            setRations((current) => Math.max(0, current - 1));
            window.dispatchEvent(new Event('archive-world:restore-stamina'));
          }}
          onOpen={(type) => {
            setInventoryOpen(false);
            openLandmark(type);
          }}
        />
      )}

      {selectedBlock && (
        <aside
          className="archive-world-dossier"
          data-block-type={selectedBlock.blockType}
          aria-label={`${getBlockTitle(selectedBlock.blockType)}档案`}
        >
          <header>
            <div>
              <p className="archive-kicker">Recovered from the field</p>
              <h2>{getBlockTitle(selectedBlock.blockType)}</h2>
            </div>
            <button onClick={() => setSelectedType(null)}>关闭 ×</button>
          </header>
          <div className="archive-world-dossier__content">
            <BlockRenderer block={selectedBlock} data={data} />
          </div>
        </aside>
      )}

      {realm && (
        <ArchiveInteriorWorld
          realm={realm}
          data={data}
          onExit={() => transitionToRealm(null)}
        />
      )}

      <div ref={transitionVeil} className="archive-world-transition" aria-hidden="true">
        <span>穿过雾与门槛</span>
      </div>

      {codexOpen && (
        <aside className="archive-world-codex" aria-label="完整档案总览">
          <header>
            <div>
              <p className="archive-kicker">All recovered records</p>
              <h2>完整档案总览</h2>
            </div>
            <button onClick={() => setCodexOpen(false)}>回到世界 ×</button>
          </header>
          <div className="archive-world-codex__scroll">
            <BlockCanvasEngine data={data} initialLayoutConfig={config} mode="readonly" />
          </div>
        </aside>
      )}
    </section>
  );
}
