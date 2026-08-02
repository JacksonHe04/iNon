# Quaternius Ultimate Animated Animal Pack

The alpaca, bull, cow, deer, donkey, fox, horse, Husky, Shiba Inu, stag, and
wolf models in this directory come from the **Ultimate Animated Animal Pack**
by Quaternius.

- Source: https://quaternius.com/packs/ultimateanimatedanimals.html
- License: CC0 1.0 Universal
- Original formats include glTF, FBX, OBJ, and Blend.
- Included here: only the animal files used by the archive-world wildlife
  system. The original embedded glTF files were losslessly repacked as GLB with
  `scripts/convert-embedded-gltf-to-glb.mjs`; geometry, materials, skins, and all
  animation clips are unchanged.

The models are redistributed without converting or removing their animation
clips. Runtime movement, animation state changes, material treatment, and animal
behaviour are implemented in the project.

## Quaternius Farm Animal Pack

The llama, pig, pug, sheep, and zebra models come from Quaternius' **Farm
Animal Pack**. Poly Pizza publishes the same authored pack as optimized GLB
files, which are used here directly with their original skins and animation
clips.

- Official source: https://quaternius.com/packs/farmanimal.html
- GLB bundle: https://poly.pizza/bundle/Farm-Animal-Pack-1kUvRTPLzT
- License: CC0 1.0 Universal

## Bird by Quaternius

The bird model is Quaternius' CC0 bird distributed by Poly Pizza.

- Source: https://poly.pizza/m/gYYC0gYMnw
- License: CC0 1.0 Universal
- Included here: the original GLB used by the instanced high-altitude flock.

## Additional CC0 species by Quaternius

The following original GLB models are published by Quaternius through Poly
Pizza under CC0 1.0 Universal:

- Bunny: https://poly.pizza/m/irZjWFARyl
- Frog: https://poly.pizza/m/37wofOCOzG
- Chicken: https://poly.pizza/m/Z3RCoCYss4
- Bee: https://poly.pizza/m/HvfIku26CK

The bunny, frog, and chicken retain their original skeletons and animation
clips. The bee is an authored static model whose free-flight path is controlled
by the same player-relative infinite-world anchoring used by other wildlife.
