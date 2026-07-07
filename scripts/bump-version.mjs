import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const packageJsonPath = path.resolve('package.json');
const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

const versionParts = pkg.version.split('.');
if (versionParts.length === 3) {
  versionParts[2] = String(Number(versionParts[2]) + 1);
  pkg.version = versionParts.join('.');
  fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
  console.log(`[Version Bump] package.json version automatically bumped to ${pkg.version}`);
  
  // Stage the modified package.json so it is included in the current commit
  try {
    execSync('git add package.json');
    console.log('[Version Bump] staged package.json changes');
  } catch (error) {
    console.error('[Version Bump] failed to stage package.json:', error.message);
  }
} else {
  console.error('[Version Bump] invalid version format in package.json:', pkg.version);
}
