import { defineConfig } from "vite";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// On GitHub Pages the site is served from /<repo>/, locally from /.
const repo = process.env.GITHUB_REPOSITORY?.split("/")[1];
const isGitHubActions = process.env.GITHUB_ACTIONS === "true";
const isUserOrOrgSite = Boolean(repo?.endsWith(".github.io"));
const base = isGitHubActions && repo && !isUserOrOrgSite ? `/${repo}/` : "/";

// GitHub Pages can't run json-server, so the build emits one static JSON file
// per top-level array in db.json (dist/api/<name>.json) and the api client
// reads those in static mode.
const isStaticApiMode = process.env.VITE_API_MODE === "static";

function staticJsonServerEmitter({ source = "db.json", outDir = "api" } = {}) {
  return {
    name: "static-json-server-emitter",
    apply: "build",
    generateBundle() {
      const raw = readFileSync(resolve(process.cwd(), source), "utf8");
      const data = JSON.parse(raw);
      for (const [collectionName, value] of Object.entries(data)) {
        if (!Array.isArray(value)) continue;
        this.emitFile({
          type: "asset",
          fileName: `${outDir}/${collectionName}.json`,
          source: JSON.stringify(value),
        });
      }
    },
  };
}

export default defineConfig({
  base,
  plugins: [staticJsonServerEmitter()],
  server: {
    port: 5173,
    // Dev: proxy /api/* to the local json-server so the front-end calls one origin.
    proxy: isStaticApiMode
      ? undefined
      : {
          "/api": {
            target: "http://127.0.0.1:3001",
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api/, ""),
          },
        },
  },
});
