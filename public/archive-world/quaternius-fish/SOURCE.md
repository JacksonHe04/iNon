# Quaternius Animated Fish Pack

The dolphin, three fish, manta ray, shark, and whale models in this directory
come from the **Animated Fish Pack** by Quaternius.

- Official source: https://quaternius.com/packs/animatedfish.html
- Download mirror: https://opengameart.org/content/animated-fish
- License: CC0 1.0 Universal
- Original formats: FBX, OBJ, and Blend

Only the animated FBX sources required by the world were extracted from the
official pack. They are loaded directly with Three.js `FBXLoader` because an
intermediate Assimp glTF conversion distorted the original skinning transforms.
Geometry, materials, rigging, and the original swim animation are retained.
