import nextPlugin from "@next/eslint-plugin-next";

const eslintConfig = [
  ...nextPlugin.flatConfig.recommended,
  ...nextPlugin.flatConfig.coreWebVitals,
  {
    ignores: ["node_modules/**", ".next/**", "out/**", "build/**", "next-env.d.ts"],
  },
];

export default eslintConfig;
