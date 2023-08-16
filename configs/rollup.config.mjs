// rollup.config.js
import typescript from "@rollup/plugin-typescript";

export default [
  {
    input: "src/index.ts",
    output: [
      {
        file: "dist/esm/index.mjs",
        format: "es",
        sourcemap: false,
        exports: "named",
      },
    ],
    plugins: [
      typescript({
        tsconfig: "./configs/tsconfig.esm.json",
        sourceMap: false,
      }),
    ],
  },
];
