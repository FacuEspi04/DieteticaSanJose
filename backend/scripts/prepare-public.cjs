const fs = require('fs');
const path = require('path');

const backendRoot = path.resolve(__dirname, '..');
const projectRoot = path.resolve(backendRoot, '..');
const frontendDist = path.join(projectRoot, 'frontend', 'dist');
const backendPublic = path.join(backendRoot, 'public');

function removeDir(target) {
  if (fs.existsSync(target)) {
    fs.rmSync(target, { recursive: true, force: true });
  }
}

function copyDir(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const dstPath = path.join(dst, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, dstPath);
    } else {
      fs.copyFileSync(srcPath, dstPath);
    }
  }
}

if (!fs.existsSync(frontendDist)) {
  console.error(`[prepare:public] No existe ${frontendDist}. Ejecutá primero: npm --prefix ../frontend run build`);
  process.exit(1);
}

removeDir(backendPublic);
copyDir(frontendDist, backendPublic);
console.log(`[prepare:public] Copiado frontend/dist -> ${backendPublic}`);
