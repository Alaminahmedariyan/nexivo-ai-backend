import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/server.ts", "src/app.ts"],
  format: ["esm"],
  target: "esnext",
  outDir: "dist",
  clean: true,
  bundle: true,
  splitting: false,
  sourcemap: true,
  external: [
    "@prisma/client",
    "@prisma/client-runtime-utils",
    "@prisma/adapter-pg",
    "prisma",
  ],
  banner: {
    js: `
      import { createRequire } from "module";
      const require = createRequire(import.meta.url);
    `,
  },
});