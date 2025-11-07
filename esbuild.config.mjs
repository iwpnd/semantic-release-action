// esbuild.config.mjs
import * as esbuild from "esbuild";

await esbuild.build({
    entryPoints: ["src/index.ts"],
    bundle: true,
    platform: "node",
    target: "node20",
    outfile: "dist/index.cjs",
    format: "cjs",
    sourcemap: true,
    external: ["semantic-release"],
    banner: {
        js: `
      if (typeof __filename === 'undefined') {
        global.__filename = __filename;
      }
      if (typeof __dirname === 'undefined') {
        global.__dirname = __dirname;
      }
    `.trim(),
    },
});
