import typescript from '@rollup/plugin-typescript';

export default {
  input: ['src/index.ts', 'src/worker.ts'],
  output: {
    dir: 'dist',
    format: 'esm',
    sourcemap: true,
    banner: '// @ts-nocheck',
  },
  preserveModules: true,
  plugins: [typescript()],
};
