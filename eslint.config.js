import reactTypedConfig from "@liangqingda/eslint-config/react-typed";

export default [
  ...reactTypedConfig,
  {
    ignores: ["dist/**", "eslint.config.js", ".prettierrc.js"],
  },
  {
    files: ["**/*.d.ts"],
    rules: {
      "spaced-comment": "off",
    },
  },
];
