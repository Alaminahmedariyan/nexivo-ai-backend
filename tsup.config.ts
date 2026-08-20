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

  // Only keep packages external that ship native binaries/engines.
  // Pure JS runtime helpers should be bundled directly so Vercel's
  // dependency tracing doesn't need to find them separately.
  external: [
    "@prisma/client",
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