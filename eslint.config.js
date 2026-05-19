import reactTypedConfig from "@liangqingda/eslint-config/react-typed";

export default [
  ...reactTypedConfig,
  {
    ignores: ["dist/**", "eslint.config.js", ".prettierrc.js"],
  },
  {
    files: ["**/*.d.ts"],
    rules: {
      // .d.ts 文件不检查注释前后空格格式
      "spaced-comment": "off",
    },
  },
];
