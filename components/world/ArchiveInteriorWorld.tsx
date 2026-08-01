'use client';

import { Suspense, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html, useGLTF } from '@react-three/drei';
import { CuboidCollider, Physics, RigidBody } from '@react-three/rapier';
import {
  ACESFilmicToneMapping,
  DoubleSide,
  Fog,
  Group,
  InstancedMesh,
  Object3D,
  SRGBColorSpace,
  Vector3,
} from 'three';
import type { ReadmeData } from '@/types';
import type { BlockType } from '@/types/layout';
import FirstPersonExplorer from '@/components/world/FirstPersonExplorer';

export type ArchiveRealm = Extract<
  BlockType,
  'bio' | 'projects' | 'timeline' | 'education' | 'work' | 'music' | 'movies' | 'books' | 'messages'
>;

interface ArchiveArtifact {
  id: string;
  categoryName: string;
  name: string;
  creator: string;
  link: string;
  comment: string;
  imageUrl: string | null;
}

const REALM_COPY: Record<ArchiveRealm, { eyebrow: string; title: string; note: string }> = {
  bio: {
    eyebrow: 'FIELD JOURNAL / 01',
    title: '旅行者的营火手记',
    note: '身份、此刻和在意的事，被写进散落在长桌上的田野手记。',
  },
  projects: {
    eyebrow: 'OPEN WORKSHOP / 02',
    title: '生长中的项目工坊',
    note: '项目不是名片，而是可取下查看的图纸、工具痕迹和工作记录。',
  },
  timeline: {
    eyebrow: 'WAYBILL STATION / 03',
    title: '旧车站的年份与地点',
    note: '每段经历成为一张旧车票，按时间散落在候车室里。',
  },
  education: {
    eyebrow: 'SURVEY ROOM / 04',
    title: '山地观测与学习室',
    note: '学校、专业与师承像测绘记录一样被保存。',
  },
  work: {
    eyebrow: 'RIVER WORKS / 05',
    title: '河谷工作间',
    note: '职位、产品和产出被保存在带有磨损痕迹的工作单中。',
  },
  music: {
    eyebrow: 'LISTENING CHAMBER / 06',
    title: '雾中唱片室',
    note: '靠近墙上的唱片封套，点击即可取下翻阅。',
  },
  movies: {
    eyebrow: 'FOREST CINEMA / 07',
    title: '林间暗房影院',
    note: '海报不是列表，它们是这座暗房里的放映入口。',
  },
  books: {
    eyebrow: 'MARGINALIA LIBRARY / 08',
    title: '页边痕迹图书室',
    note: '书架保存作品，批注保存人与作品相遇的时刻。',
  },
  messages: {
    eyebrow: 'BORDER POST / 09',
    title: '边地邮路与来信',
    note: '每一条留言都是从世界另一端送抵的信件。',
  },
};

function realmArtifacts(realm: ArchiveRealm, data: ReadmeData): ArchiveArtifact[] {
  if (realm === 'music') return data.library.music.works;
  if (realm === 'movies') return data.library.film.works;
  if (realm === 'books') return data.library.book.works;
  if (realm === 'projects') {
    return data.development.projects.map((project, index) => ({
      id: `project-${index}`,
      categoryName: project.tech_stack.join(' · '),
      name: project.project_name,
      creator: project.role.join(' / '),
      link: project.link || project.github || project.report_link || '',
      comment: `${project.description}${project.start_date || project.end_date ? ` · ${project.start_date} — ${project.end_date || '现在'}` : ''}`,
      imageUrl: null,
    }));
  }
  if (realm === 'timeline') {
    return data.experience.experience.map((experience, index) => ({
      id: `timeline-${index}`,
      categoryName: experience.date,
      name: experience.city,
      creator: 'WAYBILL / FIELD MEMORY',
      link: '',
      comment: experience.description,
      imageUrl: null,
    }));
  }
  if (realm === 'education') {
    const schools = data.education.schools.map((school, index) => ({
      id: `school-${index}`,
      categoryName: `${school.start_date} — ${school.end_date}`,
      name: school.institution,
      creator: `${school.degree} · ${school.major}`,
      link: '',
      comment: school.major,
      imageUrl: null,
    }));
    return [
      ...schools,
      {
        id: 'undergraduate-field-note',
        categoryName: 'UNDERGRADUATE FIELD NOTE',
        name: data.education.undergraduate_major || '本科记录',
        creator: data.education.undergraduate_advisor,
        link: '',
        comment: '专业与师承记录',
        imageUrl: null,
      },
    ].filter((item) => item.name || item.creator);
  }
  if (realm === 'work') {
    return data.work.jobs.map((job, index) => ({
      id: `work-${index}`,
      categoryName: `${job.start_date} — ${job.end_date || '现在'}`,
      name: job.company_name,
      creator: `${job.position} · ${job.position_type}`,
      link: '',
      comment: [job.job_summary, job.products_responsible_for, job.work_output].filter(Boolean).join(' · '),
      imageUrl: null,
    }));
  }
  if (realm === 'messages') {
    return data.messages.map((message) => ({
      id: message.id,
      categoryName: message.created_at,
      name: message.nickname,
      creator: 'LETTER FROM THE BORDER',
      link: '',
      comment: message.content,
      imageUrl: null,
    }));
  }
  return [
    {
      id: 'identity',
      categoryName: data.life.current_city || 'CURRENT FIELD',
      name: data.basic.name,
      creator: data.basic.current_status,
      link: '',
      comment: data.basic.intro,
      imageUrl: null,
    },
    {
      id: 'values',
      categoryName: 'VALUES',
      name: '持有的价值',
      creator: data.basic.values.join(' · '),
      link: '',
      comment: data.thoughts.personal_philosophy.join(' · '),
      imageUrl: null,
    },
    {
      id: 'field-keywords',
      categoryName: 'FIELD KEYWORDS',
      name: '此刻的关键词',
      creator: data.basic.keywords.join(' · '),
      link: '',
      comment: data.basic.tags.join(' · '),
      imageUrl: null,
    },
  ];
}

function RealmShelf({ position, rotation = 0, scale = 1.45 }: {
  position: [number, number, number];
  rotation?: number;
  scale?: number;
}) {
  const { scene } = useGLTF('/archive-world/polyhaven/Shelf_01/Shelf_01_1k.gltf');
  const clone = useMemo(() => scene.clone(true), [scene]);
  return <primitive object={clone} position={position} rotation={[0, rotation, 0]} scale={scale} />;
}

function RealmProp({
  path,
  position,
  rotation = 0,
  scale = 1,
}: {
  path: string;
  position: [number, number, number];
  rotation?: number;
  scale?: number;
}) {
  const { scene } = useGLTF(path);
  const clone = useMemo(() => scene.clone(true), [scene]);
  return <primitive object={clone} position={position} rotation={[0, rotation, 0]} scale={scale} />;
}

function RealmFurniture({ realm }: { realm: ArchiveRealm }) {
  return (
    <group>
      <mesh position={[0, 0.012, 1.4]} rotation-x={-Math.PI / 2} receiveShadow>
        <circleGeometry args={[realm === 'movies' ? 4.2 : 3.4, 48]} />
        <meshStandardMaterial color={realm === 'movies' ? '#282e29' : '#756c50'} roughness={1} />
      </mesh>
      <RealmProp
        path="/archive-world/polyhaven/chinese_tea_table/chinese_tea_table_1k.gltf"
        position={[0, 0, 1.2]}
        rotation={Math.PI / 2}
        scale={realm === 'movies' ? 1.55 : 2.2}
      />
      <RealmProp
        path="/archive-world/polyhaven/GothicCabinet_01/GothicCabinet_01_1k.gltf"
        position={[-6.8, 0, -8.9]}
        scale={0.88}
      />
      <RealmProp
        path="/archive-world/polyhaven/GothicCabinet_01/GothicCabinet_01_1k.gltf"
        position={[6.8, 0, -8.9]}
        rotation={Math.PI}
        scale={0.88}
      />
      {[-2.2, 2.2].map((x, index) => (
        <RealmProp
          key={x}
          path="/archive-world/polyhaven/CheeseBox_01/CheeseBox_01_1k.gltf"
          position={[x, 0.02, 3.1 + index * 0.35]}
          rotation={index ? -0.32 : 0.26}
          scale={2.7}
        />
      ))}
      {realm === 'music' && (
        <group position={[0, 1.08, 1.15]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.68, 0.68, 0.11, 48]} />
            <meshStandardMaterial color="#242621" roughness={0.72} />
          </mesh>
          <mesh position={[0, 0.068, 0]}>
            <cylinderGeometry args={[0.18, 0.18, 0.015, 32]} />
            <meshStandardMaterial color="#b19b5d" roughness={0.8} />
          </mesh>
          <mesh position={[0.72, 0.35, 0]} rotation-z={-0.52} castShadow>
            <coneGeometry args={[0.42, 0.95, 18, 1, true]} />
            <meshStandardMaterial color="#7f714e" side={DoubleSide} roughness={0.92} />
          </mesh>
        </group>
      )}
      {realm === 'movies' && (
        <group>
          {[-3.7, 0, 3.7].flatMap((x) => [3.2, 5.6].map((z) => (
            <mesh key={`${x}:${z}`} position={[x, 0.48, z]} castShadow>
              <boxGeometry args={[2.8, 0.75, 0.9]} />
              <meshStandardMaterial color="#38453a" roughness={0.97} />
            </mesh>
          )))}
          <mesh position={[0, 1.25, 7.8]} castShadow>
            <boxGeometry args={[1.25, 1.1, 1.9]} />
            <meshStandardMaterial color="#272e28" roughness={0.83} metalness={0.15} />
          </mesh>
          <pointLight position={[0, 2.1, 6.7]} intensity={8} distance={8} color="#b9c59f" />
        </group>
      )}
      {realm === 'books' && (
        <group position={[0, 1.05, 1.2]}>
          <mesh position={[0, 0.38, 0]} castShadow>
            <cylinderGeometry args={[0.045, 0.06, 0.75, 10]} />
            <meshStandardMaterial color="#4a392b" roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.82, 0]} rotation-x={Math.PI} castShadow>
            <coneGeometry args={[0.42, 0.36, 18, 1, true]} />
            <meshStandardMaterial color="#897a55" side={DoubleSide} roughness={0.95} />
          </mesh>
          <pointLight position={[0, 0.55, 0]} intensity={6} distance={5} color="#d2b36e" />
        </group>
      )}
      {realm === 'bio' && (
        <group position={[0, 1.08, 1.2]}>
          {[-0.55, 0.2, 0.72].map((x, index) => (
            <mesh key={x} position={[x, 0.08 + index * 0.018, (index - 1) * 0.18]} rotation={[-Math.PI / 2, 0, (index - 1) * 0.13]} castShadow>
              <planeGeometry args={[0.82, 1.08]} />
              <meshStandardMaterial color={index === 1 ? '#73806b' : '#b9ad82'} side={DoubleSide} roughness={1} />
            </mesh>
          ))}
          <pointLight position={[0, 0.7, 0]} intensity={5} distance={5} color="#d0ad68" />
        </group>
      )}
      {realm === 'projects' && (
        <group>
          {[-1.05, 0.25].map((x, index) => (
            <mesh key={x} position={[x, 1.13 + index * 0.02, 1.2]} rotation={[-Math.PI / 2, 0, index ? 0.08 : -0.12]} castShadow>
              <planeGeometry args={[1.45, 1.05]} />
              <meshStandardMaterial color={index ? '#839078' : '#c1b68e'} side={DoubleSide} roughness={1} />
            </mesh>
          ))}
          {[[-1.9, 0.2, 5.1], [2.2, 0.2, 4.5]].map((position, index) => (
            <RealmProp key={index} path="/archive-world/polyhaven/CheeseBox_01/CheeseBox_01_1k.gltf" position={position as [number, number, number]} rotation={index ? -0.28 : 0.34} scale={3.2} />
          ))}
        </group>
      )}
      {realm === 'timeline' && (
        <group>
          {[-1.55, 1.55].map((x) => <mesh key={x} position={[x, 0.04, 1.2]} castShadow><boxGeometry args={[0.1, 0.1, 18]} /><meshStandardMaterial color="#343a34" metalness={0.56} roughness={0.6} /></mesh>)}
          {[-5, -2.5, 0, 2.5, 5].map((z) => <mesh key={z} position={[0, 0.01, z]}><boxGeometry args={[4.1, 0.1, 0.22]} /><meshStandardMaterial color="#554332" roughness={1} /></mesh>)}
          <mesh position={[0, 2.5, -8.95]}><circleGeometry args={[0.62, 36]} /><meshStandardMaterial color="#c5b782" roughness={0.92} /></mesh>
        </group>
      )}
      {realm === 'education' && (
        <group position={[0, 1.55, 1.15]}>
          <mesh rotation={[0.15, 0.45, Math.PI / 2]} castShadow><cylinderGeometry args={[0.19, 0.28, 2.2, 16]} /><meshStandardMaterial color="#6c7569" metalness={0.42} roughness={0.62} /></mesh>
          <mesh position={[0.65, 0.28, 0.55]} rotation-x={Math.PI / 2}><torusGeometry args={[0.42, 0.08, 8, 28]} /><meshStandardMaterial color="#b9a565" metalness={0.32} roughness={0.7} /></mesh>
          <mesh position={[-0.3, -0.75, 0]}><cylinderGeometry args={[0.06, 0.1, 1.65, 9]} /><meshStandardMaterial color="#4b392c" roughness={1} /></mesh>
        </group>
      )}
      {realm === 'work' && (
        <group>
          {[-2.4, 0, 2.4].map((x, index) => <mesh key={x} position={[x, 0.42, 4.7 + index * 0.18]} rotation-z={Math.PI / 2} castShadow><cylinderGeometry args={[0.34, 0.42, 3.3, 10]} /><meshStandardMaterial color="#664a34" roughness={1} /></mesh>)}
          <mesh position={[0, 1.25, 1.2]} rotation-y={Math.PI / 2}><cylinderGeometry args={[0.76, 0.76, 0.08, 30]} /><meshStandardMaterial color="#777b71" metalness={0.55} roughness={0.48} /></mesh>
        </group>
      )}
      {realm === 'messages' && (
        <group position={[0, 0, -1]}>
          {[-4.7, 4.7].map((x) => <mesh key={x} position={[x, 2.75, 0]}><cylinderGeometry args={[0.09, 0.14, 5.5, 8]} /><meshStandardMaterial color="#49372b" roughness={1} /></mesh>)}
          <mesh position={[0, 4.5, 0]} rotation-z={Math.PI / 2}><cylinderGeometry args={[0.045, 0.045, 9.4, 7]} /><meshStandardMaterial color="#332b23" roughness={1} /></mesh>
          {[-3.4, -1.7, 0, 1.7, 3.4].map((x, index) => <mesh key={x} position={[x, 4.08 - (index % 2) * 0.18, 0]} rotation-z={(index - 2) * 0.045}><planeGeometry args={[1.15, 0.78]} /><meshStandardMaterial color={index % 2 ? '#a6a17f' : '#c7bc92'} side={DoubleSide} roughness={1} /></mesh>)}
        </group>
      )}
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[1.65, 0.7, 1.25]} position={[0, 0.7, 1.2]} />
      </RigidBody>
    </group>
  );
}

function InteriorFragments({ count = 170 }: { count?: number }) {
  const mesh = useRef<InstancedMesh>(null);
  const group = useRef<Group>(null);
  const dummy = useMemo(() => new Object3D(), []);

  const fragments = useMemo(() => {
    let state = 9241357;
    const random = () => {
      state = (state * 1664525 + 1013904223) >>> 0;
      return state / 4294967296;
    };
    return Array.from({ length: count }, () => ({
      x: (random() - 0.5) * 21,
      y: random() * 7,
      z: (random() - 0.5) * 24,
      scale: 0.025 + random() * 0.055,
      phase: random() * Math.PI * 2,
      speed: 0.12 + random() * 0.25,
    }));
  }, [count]);

  useFrame(({ clock }) => {
    if (!mesh.current || !group.current) return;
    fragments.forEach((fragment, index) => {
      const y = ((fragment.y - clock.elapsedTime * fragment.speed + 8) % 8) - 0.5;
      dummy.position.set(
        fragment.x + Math.sin(clock.elapsedTime * 0.4 + fragment.phase) * 0.28,
        y,
        fragment.z,
      );
      dummy.rotation.set(
        clock.elapsedTime * 0.22 + fragment.phase,
        clock.elapsedTime * 0.31 + fragment.phase,
        fragment.phase,
      );
      dummy.scale.setScalar(fragment.scale);
      dummy.updateMatrix();
      mesh.current?.setMatrixAt(index, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group ref={group}>
      <instancedMesh ref={mesh} args={[undefined, undefined, count]} frustumCulled={false}>
        <planeGeometry args={[1, 0.5]} />
        <meshBasicMaterial color="#d8cfad" transparent opacity={0.34} side={DoubleSide} depthWrite={false} />
      </instancedMesh>
    </group>
  );
}

function ArtifactWall({
  realm,
  items,
  onSelect,
}: {
  realm: ArchiveRealm;
  items: ArchiveArtifact[];
  onSelect: (item: ArchiveArtifact) => void;
}) {
  const visibleItems = items.slice(0, 15);
  return (
    <group position={[0, 0, -9.25]}>
      {visibleItems.map((item, index) => {
        const fieldArchive = !['music', 'movies', 'books'].includes(realm);
        const columns = fieldArchive ? 3 : 5;
        const column = index % columns;
        const row = Math.floor(index / columns);
        const rowStart = row * columns;
        const itemsInRow = Math.min(columns, visibleItems.length - rowStart);
        const x = (column - (itemsInRow - 1) / 2) * (fieldArchive ? 3.55 : realm === 'movies' ? 2.15 : 2.05);
        const y = 5.25 - row * (fieldArchive ? 2.15 : 2.25);
        return (
          <Html
            key={item.id}
            position={[x, y, 0]}
            transform
            center
            distanceFactor={realm === 'movies' ? 6.8 : 7.4}
          >
            <button
              className={`archive-interior-artifact is-${realm}`}
              onClick={() => onSelect(item)}
              aria-label={`查看${item.name}`}
            >
              {item.imageUrl ? (
                <img src={item.imageUrl} alt="" />
              ) : (
                <span
                  className="archive-interior-artifact__missing"
                  style={{ background: `linear-gradient(${128 + index * 17}deg, #2b3e31, #77806a 62%, #b4a36f)` }}
                >
                  <i>{item.name.slice(0, 1)}</i>
                  <em>{item.creator || item.categoryName}</em>
                </span>
              )}
              <span className="archive-interior-artifact__caption">
                <strong>{item.name}</strong>
                <small>{item.creator || item.categoryName}</small>
              </span>
            </button>
          </Html>
        );
      })}
    </group>
  );
}

function RoomShell({ realm }: { realm: ArchiveRealm }) {
  const palette: Record<ArchiveRealm, { floor: string; wall: string; trim: string }> = {
    bio: { floor: '#394437', wall: '#69735f', trim: '#b7a669' },
    projects: { floor: '#29392f', wall: '#566451', trim: '#b29a58' },
    timeline: { floor: '#272f2a', wall: '#4b574a', trim: '#a8925f' },
    education: { floor: '#354239', wall: '#687362', trim: '#c0ac71' },
    work: { floor: '#303a30', wall: '#5a624f', trim: '#aa8e54' },
    music: { floor: '#26362c', wall: '#52604f', trim: '#b29b61' },
    movies: { floor: '#1c2822', wall: '#34443a', trim: '#a58e59' },
    books: { floor: '#334035', wall: '#697260', trim: '#c0ac71' },
    messages: { floor: '#313a31', wall: '#66705d', trim: '#bba76b' },
  };
  const colors = palette[realm];
  return (
    <group>
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[7.5, 0.2, 11]} position={[0, -0.2, 0]} />
        <CuboidCollider args={[0.25, 4, 11]} position={[-7.5, 4, 0]} />
        <CuboidCollider args={[0.25, 4, 11]} position={[7.5, 4, 0]} />
        <CuboidCollider args={[7.5, 4, 0.25]} position={[0, 4, -10.5]} />
        <CuboidCollider args={[7.5, 4, 0.25]} position={[0, 4, 10.5]} />
      </RigidBody>
      <mesh position={[0, -0.22, 0]} rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[15, 22]} />
        <meshStandardMaterial color={colors.floor} roughness={1} />
      </mesh>
      <mesh position={[0, 4, -10.48]} receiveShadow>
        <planeGeometry args={[15, 8]} />
        <meshStandardMaterial color={colors.wall} roughness={0.98} />
      </mesh>
      {[-7.48, 7.48].map((x) => (
        <mesh key={x} position={[x, 4, 0]} rotation-y={Math.PI / 2} receiveShadow>
          <planeGeometry args={[21, 8]} />
          <meshStandardMaterial color={colors.wall} roughness={0.98} side={DoubleSide} />
        </mesh>
      ))}
      {[1.25, 3.55, 5.85].map((y) => (
        <mesh key={y} position={[0, y, -10.2]} castShadow>
          <boxGeometry args={[14.6, 0.08, 0.12]} />
          <meshStandardMaterial color={colors.trim} roughness={1} />
        </mesh>
      ))}
    </group>
  );
}

function RealmScene({
  realm,
  items,
  onSelect,
}: {
  realm: ArchiveRealm;
  items: ArchiveArtifact[];
  onSelect: (item: ArchiveArtifact) => void;
}) {
  const playerPosition = useRef(new Vector3(0, 0.1, 7.3));
  return (
    <>
      <color attach="background" args={[realm === 'movies' ? '#18231d' : '#354337']} />
      <fog attach="fog" args={[realm === 'movies' ? '#18231d' : '#586354', 8, 34]} />
      <ambientLight intensity={1.35} color="#d9d0b4" />
      <directionalLight position={[-4, 8, 6]} intensity={2.4} color="#d9c68f" castShadow />
      <pointLight position={[0, 5.8, 2]} intensity={18} distance={24} color="#c9aa65" />
      <InteriorFragments />
      <Physics gravity={[0, -14, 0]}>
        <RoomShell realm={realm} />
        <Suspense fallback={null}>
          <RealmFurniture realm={realm} />
        </Suspense>
        <FirstPersonExplorer
          enabled
          destinations={[]}
          playerPosition={playerPosition}
          travelRequest={null}
          spawn={[0, 0.12, 7.3]}
          heightAt={() => 0}
          waterLevel={-100}
          onOpen={() => undefined}
          onNearby={() => undefined}
          onTelemetry={() => undefined}
        />
        <Suspense fallback={null}>
          {realm === 'books' ? (
            <>
              <RealmShelf position={[-5.2, 0, -9.7]} />
              <RealmShelf position={[0, 0, -9.7]} />
              <RealmShelf position={[5.2, 0, -9.7]} />
            </>
          ) : (
            <>
              <RealmShelf position={[-6.9, 0, -4.5]} rotation={Math.PI / 2} scale={1.2} />
              <RealmShelf position={[6.9, 0, -4.5]} rotation={-Math.PI / 2} scale={1.2} />
            </>
          )}
        </Suspense>
      </Physics>
      <ArtifactWall realm={realm} items={items} onSelect={onSelect} />
    </>
  );
}

export default function ArchiveInteriorWorld({
  realm,
  data,
  onExit,
}: {
  realm: ArchiveRealm;
  data: ReadmeData;
  onExit: () => void;
}) {
  const [selected, setSelected] = useState<ArchiveArtifact | null>(null);
  const copy = REALM_COPY[realm];
  const items = useMemo(() => realmArtifacts(realm, data), [data, realm]);

  return (
    <section className={`archive-interior-world is-${realm}`} aria-label={copy.title}>
      <div className="archive-interior-world__canvas">
        <Canvas
          shadows
          dpr={[1, 1.35]}
          camera={{ position: [0, 1.7, 7.3], fov: 55, near: 0.08, far: 90 }}
          gl={{ antialias: true, powerPreference: 'high-performance' }}
          onCreated={({ gl, scene }) => {
            gl.toneMapping = ACESFilmicToneMapping;
            gl.toneMappingExposure = 0.9;
            gl.outputColorSpace = SRGBColorSpace;
            scene.fog = new Fog('#435144', 9, 34);
          }}
        >
          <RealmScene realm={realm} items={items} onSelect={setSelected} />
        </Canvas>
      </div>
      <header className="archive-interior-world__header">
        <div>
          <span>{copy.eyebrow}</span>
          <h2>{copy.title}</h2>
          <p>{copy.note} · WASD 移动 · 拖动环顾</p>
        </div>
        <button onClick={onExit}>沿雾返回主世界</button>
      </header>
      <div className="archive-interior-world__counter">
        <span>RECOVERED OBJECTS</span>
        <strong>{String(items.length).padStart(2, '0')}</strong>
      </div>
      {selected && (
        <article
          className={`archive-interior-inspection${selected.imageUrl ? '' : ' is-text-only'}`}
          aria-label={`${selected.name}详情`}
        >
          {selected.imageUrl && <img src={selected.imageUrl} alt="" />}
          <div>
            <span>{selected.categoryName || copy.eyebrow}</span>
            <h3>{selected.name}</h3>
            <p className="archive-interior-inspection__creator">{selected.creator}</p>
            {selected.comment && <p>{selected.comment}</p>}
            <div>
              {selected.link && <a href={selected.link} target="_blank" rel="noreferrer">打开原始记录 ↗</a>}
              <button onClick={() => setSelected(null)}>放回原位</button>
            </div>
          </div>
        </article>
      )}
    </section>
  );
}

useGLTF.preload('/archive-world/polyhaven/Shelf_01/Shelf_01_1k.gltf');
