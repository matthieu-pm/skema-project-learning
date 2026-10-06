import { build } from 'vite';
import { fileURLToPath } from 'node:url';
await build({
  configFile: false, publicDir: false, logLevel: 'warn',
  build: {
    outDir: fileURLToPath(new URL('../public/landing/', import.meta.url)),
    emptyOutDir: false,
    lib: { entry: fileURLToPath(new URL('../landing/hero-scene.js', import.meta.url)), formats: ['es'], fileName: () => 'hero-scene.js' },
    minify: true,
  },
});
console.log('Built standalone Three.js landing scene.');
