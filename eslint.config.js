import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import reactTypedConfig from '@liangqingda/eslint-config/react-typed';

const rootDir = dirname(fileURLToPath(import.meta.url));

export default [
  ...reactTypedConfig,
  {
    ignores: ["dist/**", "eslint.config.js", ".prettierrc.js"],
  },
  {
    files: ['vite.config.ts'],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json'],
        projectService: false,
        tsconfigRootDir: rootDir,
      },
    },
  },
  {
    files: ['**/*.d.ts'],
    rules: {
      // .d.ts 文件不检查注释前后空格格式
      'spaced-comment': 'off',
    },
  },
];
