'use client';

import type { MutableRefObject, RefObject } from 'react';
import { CapsuleCollider, CuboidCollider, RigidBody, type RapierRigidBody } from '@react-three/rapier';
import type { Group } from 'three';
import ArchiveHorse, { type HorseMotion } from '@/components/world/ArchiveHorse';

export default function ExplorerRigs({
  enabled,
  mounted,
  body,
  mountedHorse,
  horsePosition,
  horseYaw,
  waitingMotion,
  mountMotion,
  spawn,
}: {
  enabled: boolean;
  mounted: boolean;
  body: RefObject<RapierRigidBody | null>;
  mountedHorse: RefObject<Group | null>;
  horsePosition: [number, number, number];
  horseYaw: MutableRefObject<number>;
  waitingMotion: MutableRefObject<HorseMotion>;
  mountMotion: MutableRefObject<HorseMotion>;
  spawn: [number, number, number];
}) {
  return (
    <>
      {enabled && !mounted && (
        <RigidBody type="fixed" colliders={false} position={horsePosition} rotation={[0, horseYaw.current, 0]}>
          <CuboidCollider args={[0.62, 1.18, 1.45]} position={[0, 1.18, 0]} />
          <ArchiveHorse motion={waitingMotion} />
        </RigidBody>
      )}
      <RigidBody
        ref={body}
        position={spawn}
        colliders={false}
        enabledRotations={[false, false, false]}
        linearDamping={9}
        friction={1.05}
        canSleep={false}
        ccd
      >
        <CapsuleCollider
          key={mounted ? 'mounted' : 'foot'}
          args={mounted ? [0.82, 0.48] : [0.52, 0.34]}
          position={[0, mounted ? 1.18 : 0.84, 0]}
        />
        {enabled && mounted && (
          <group ref={mountedHorse} rotation-y={horseYaw.current}>
            <ArchiveHorse motion={mountMotion} />
          </group>
        )}
      </RigidBody>
    </>
  );
}
