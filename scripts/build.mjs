import { build } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// usage: node scripts/build.mjs [chrome|firefox] [--watch]
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const args = process.argv.slice(2);
const watch = args.includes('--watch');
const targets = args.filter((a) => !a.startsWith('--'));
if (!targets.length) targets.push('chrome', 'firefox');

for (const target of targets) {
  const outDir = path.join(root, 'dist', target);
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });

  const define = {
    __TARGET__: JSON.stringify(target),
    __VERSION__: JSON.stringify(pkg.version),
    'process.env.NODE_ENV': JSON.stringify(watch ? 'development' : 'production')
  };
  const common = { configFile: false, logLevel: 'warn', define };
  const w = watch ? { watch: {} } : {};

  // manifest first so the folder can be loaded into the browser immediately
  const manifest = JSON.parse(fs.readFileSync(path.join(root, `manifests/manifest.${target}.json`), 'utf8'));
  manifest.version = pkg.version;
  fs.writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2));

  // 1) viewer page (React + Tailwind) – this is where your UI lives
  await build({
    ...common,
    root: path.join(root, 'src/viewer'),
    base: './',
    publicDir: path.join(root, 'public'),
    plugins: [react()],
    resolve: { alias: { '@core': path.join(root, 'src/core'), '@': path.join(root, 'src/app') } },
    css: { postcss: root },
    build: {
      outDir, emptyOutDir: false, target: 'es2022', modulePreload: false, minify: !watch, ...w,
      rollupOptions: { input: { viewer: path.join(root, 'src/viewer/viewer.html') } }
    }
  });

  // 2) content script + 3) background → single-file IIFE bundles
  for (const [entry, file] of [['src/content/content.js', 'content.js'], ['src/background/background.js', 'background.js']]) {
    await build({
      ...common,
      build: {
        outDir, emptyOutDir: false, target: 'es2022', minify: !watch, ...w,
        lib: { entry: path.join(root, entry), formats: ['iife'], name: 'RDT', fileName: () => file }
      }
    });
  }
  console.log(`✔ ${watch ? 'watching' : 'built'} ${target} → dist/${target}`);
}
