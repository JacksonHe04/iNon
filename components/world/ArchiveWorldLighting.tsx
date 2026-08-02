'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { AmbientLight, Color, DirectionalLight, Fog, HemisphereLight } from 'three';
import { worldLightFrame, type WorldTimeSnapshot } from '@/components/world/archiveWorldTime';

function blendColor(from: string, to: string, mix: number) {
  return new Color(from).lerp(new Color(to), mix);
}

export function useWorldLightTarget(worldTime: WorldTimeSnapshot) {
  return useMemo(() => {
    const { lower, upper, mix } = worldLightFrame(worldTime.minuteOfDay);
    const blend = (key: 'background' | 'fog' | 'ambient' | 'hemisphere' | 'ground' | 'sun' | 'panorama') => (
      blendColor(lower[key], upper[key], mix)
    );
    const number = (key: 'ambientIntensity' | 'hemisphereIntensity' | 'sunIntensity' | 'exposure') => (
      lower[key] + (upper[key] - lower[key]) * mix
    );
    return {
      background: blend('background'), fog: blend('fog'), ambient: blend('ambient'),
      hemisphere: blend('hemisphere'), ground: blend('ground'), sun: blend('sun'),
      panorama: blend('panorama'), ambientIntensity: number('ambientIntensity'),
      hemisphereIntensity: number('hemisphereIntensity'), sunIntensity: number('sunIntensity'),
      exposure: number('exposure'),
    };
  }, [worldTime.minuteOfDay]);
}

export default function ArchiveWorldLighting({ worldTime }: { worldTime: WorldTimeSnapshot }) {
  const ambient = useRef<AmbientLight>(null);
  const hemisphere = useRef<HemisphereLight>(null);
  const sun = useRef<DirectionalLight>(null);
  const { scene, gl } = useThree();
  const target = useWorldLightTarget(worldTime);

  useEffect(() => {
    const background = new Color('#919d8b');
    scene.background = background;
    scene.fog = new Fog('#667565', 24, 215);
    return () => {
      scene.background = null;
      scene.fog = null;
    };
  }, [scene]);

  useFrame(() => {
    const easing = 0.025;
    if (scene.background instanceof Color) scene.background.lerp(target.background, easing);
    if (scene.fog instanceof Fog) scene.fog.color.lerp(target.fog, easing);
    if (ambient.current) {
      ambient.current.color.lerp(target.ambient, easing);
      ambient.current.intensity += (target.ambientIntensity - ambient.current.intensity) * easing;
    }
    if (hemisphere.current) {
      hemisphere.current.color.lerp(target.hemisphere, easing);
      hemisphere.current.groundColor.lerp(target.ground, easing);
      hemisphere.current.intensity += (target.hemisphereIntensity - hemisphere.current.intensity) * easing;
    }
    if (sun.current) {
      sun.current.color.lerp(target.sun, easing);
      sun.current.intensity += (target.sunIntensity - sun.current.intensity) * easing;
    }
    gl.toneMappingExposure += (target.exposure - gl.toneMappingExposure) * easing;
  });

  return (
    <>
      <ambientLight ref={ambient} intensity={0.85} color="#d8d2b8" />
      <hemisphereLight ref={hemisphere} args={['#cbd0bd', '#24392c', 1.3]} />
      <directionalLight
        ref={sun}
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
    </>
  );
}
