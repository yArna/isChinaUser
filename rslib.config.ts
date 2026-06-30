import { defineConfig } from '@rslib/core';

export default defineConfig({
  lib: [
    {
      format: 'esm',
      syntax: 'es2021',
      dts: true,
    },
    {
      format: 'cjs',
      syntax: 'es2021',
    },
    {
      format: 'umd',
      syntax: 'es2021',
      umdName: 'isChinaUser',
      dts: false,
      output: {
        target: 'web',
        cleanDistPath: false,
        distPath: {
          root: 'docs',
          js: '',
        },
        filename: {
          js: 'index.js',
        },
      },
    },
  ],
  output: { target: 'node' },
});
