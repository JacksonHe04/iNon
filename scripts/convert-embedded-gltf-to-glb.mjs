#!/usr/bin/env node

import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const [, , sourcePath, outputPath] = process.argv;

if (!sourcePath || !outputPath) {
  console.error('Usage: node scripts/convert-embedded-gltf-to-glb.mjs <source.gltf> <output.glb>');
  process.exit(1);
}

const source = JSON.parse(await readFile(sourcePath, 'utf8'));
if (source.buffers?.length !== 1) {
  throw new Error('Only glTF files with exactly one embedded buffer are supported.');
}

const uri = source.buffers[0].uri;
const match = /^data:application\/octet-stream;base64,(.+)$/s.exec(uri ?? '');
if (!match) {
  throw new Error('The source glTF buffer is not an embedded base64 octet stream.');
}
if (source.images?.some((image) => image.uri?.startsWith('data:'))) {
  throw new Error('Embedded images are not supported by this focused converter.');
}

const binary = Buffer.from(match[1], 'base64');
if (binary.byteLength !== source.buffers[0].byteLength) {
  throw new Error(`Decoded buffer length mismatch: expected ${source.buffers[0].byteLength}, got ${binary.byteLength}.`);
}

delete source.buffers[0].uri;

function pad(buffer, fill) {
  const padding = (4 - (buffer.byteLength % 4)) % 4;
  if (padding === 0) return buffer;
  return Buffer.concat([buffer, Buffer.alloc(padding, fill)]);
}

const jsonChunk = pad(Buffer.from(JSON.stringify(source)), 0x20);
const binaryChunk = pad(binary, 0x00);
const totalLength = 12 + 8 + jsonChunk.byteLength + 8 + binaryChunk.byteLength;
const glb = Buffer.allocUnsafe(totalLength);

let offset = 0;
glb.writeUInt32LE(0x46546c67, offset); offset += 4;
glb.writeUInt32LE(2, offset); offset += 4;
glb.writeUInt32LE(totalLength, offset); offset += 4;
glb.writeUInt32LE(jsonChunk.byteLength, offset); offset += 4;
glb.writeUInt32LE(0x4e4f534a, offset); offset += 4;
jsonChunk.copy(glb, offset); offset += jsonChunk.byteLength;
glb.writeUInt32LE(binaryChunk.byteLength, offset); offset += 4;
glb.writeUInt32LE(0x004e4942, offset); offset += 4;
binaryChunk.copy(glb, offset);

await writeFile(outputPath, glb);
console.log(`${path.basename(sourcePath)} -> ${path.basename(outputPath)} (${glb.byteLength} bytes)`);
