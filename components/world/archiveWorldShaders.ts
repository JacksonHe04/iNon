import { WORLD_TRAIL_SEGMENTS } from '@/components/world/archiveWorldTrails';

const trailDistanceStatements = WORLD_TRAIL_SEGMENTS.map(
  ({ start, end, halfWidth }) =>
    `distance = min(distance, segmentDistance(point, vec2(${start[0].toFixed(1)}, ${start[1].toFixed(1)}), vec2(${end[0].toFixed(1)}, ${end[1].toFixed(1)})) / ${halfWidth.toFixed(2)});`,
).join('\n');

export const terrainVertex = /* glsl */ `
  varying vec3 vWorld;
  varying float vGrain;
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorld = world.xyz;
    vGrain = hash(floor(world.xz * 1.8));
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

export const terrainFragment = /* glsl */ `
  uniform sampler2D uGround;
  uniform vec3 uMoss;
  uniform vec3 uForest;
  uniform vec3 uPath;
  uniform vec3 uShore;
  varying vec3 vWorld;
  varying float vGrain;
  float segmentDistance(vec2 point, vec2 start, vec2 end) {
    vec2 segment = end - start;
    float amount = clamp(dot(point - start, segment) / dot(segment, segment), 0.0, 1.0);
    return length(point - (start + segment * amount));
  }
  float worldTrailDistance(vec2 point) {
    float distance = 9999.0;
    ${trailDistanceStatements}
    return distance;
  }
  void main() {
    float waves = sin(vWorld.x * 0.035) * cos(vWorld.z * 0.04);
    float trailDistance = worldTrailDistance(vWorld.xz);
    float pathMask = 1.0 - smoothstep(0.72, 1.22, trailDistance);
    float pathCore = 1.0 - smoothstep(0.22, 0.76, trailDistance);
    float pathWear = 0.82 + 0.18 * sin(vWorld.x * 1.7 + vWorld.z * 2.1);
    vec3 ground = mix(uForest, uMoss, 0.52 + waves * 0.14);
    ground = mix(ground, uPath, pathMask * (0.26 + pathCore * 0.16) * pathWear);
    vec3 forestFloor = texture2D(uGround, vWorld.xz * 0.035).rgb * vec3(0.50, 0.82, 0.54);
    ground = mix(ground, forestFloor, 0.52) + (vGrain - 0.5) * 0.055;
    float shoreline = -31.0 + sin(vWorld.z * 0.015) * 9.0 + sin(vWorld.z * 0.043) * 4.0;
    float shoreBand = 1.0 - smoothstep(4.0, 18.0, abs(vWorld.x - shoreline));
    ground = mix(ground, uShore, shoreBand * 0.48);
    gl_FragColor = vec4(ground, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export const waterVertex = /* glsl */ `
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

export const waterFragment = /* glsl */ `
  uniform float uTime;
  varying float vWave;
  varying vec3 vWorld;
  void main() {
    float ripple = 0.5 + 0.5 * sin(vWorld.x * 0.11 + vWorld.z * 0.08 + uTime * 0.32);
    vec3 color = mix(vec3(0.075, 0.18, 0.15), vec3(0.28, 0.42, 0.34), 0.25 + ripple * 0.24 + vWave * 1.8);
    gl_FragColor = vec4(color, 0.62);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export const weatherVertex = /* glsl */ `
  uniform float uTime;
  varying float vPulse;
  void main() {
    vec3 origin = (instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
    vec3 localVertex = (instanceMatrix * vec4(position, 0.0)).xyz;
    float phase = origin.x * 0.71 + origin.y * 1.13 + origin.z * 0.53;
    origin.x += sin(uTime * 0.24 + phase) * 0.8;
    origin.y = mod(origin.y - uTime * (0.7 + fract(phase) * 0.8) + 18.0, 20.0) - 2.0;
    origin.z += cos(uTime * 0.19 + phase) * 0.55;
    vPulse = 0.72 + 0.28 * sin(phase * 4.0);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(origin + localVertex, 1.0);
  }
`;

export const weatherFragment = /* glsl */ `
  uniform vec3 uPaper;
  uniform vec3 uOchre;
  varying float vPulse;
  void main() {
    vec3 color = mix(uPaper, uOchre, max(0.0, vPulse) * 0.18);
    gl_FragColor = vec4(color, 0.08 + max(0.0, vPulse) * 0.42);
  }
`;
