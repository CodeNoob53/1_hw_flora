import { defineConfig } from "vite";

// On GitHub Pages the site is served from /<repo>/, locally from /.
const repo = process.env.GITHUB_REPOSITORY?.split("/")[1];
const isGitHubActions = process.env.GITHUB_ACTIONS === "true";
const isUserOrOrgSite = Boolean(repo?.endsWith(".github.io"));
const base = isGitHubActions && repo && !isUserOrOrgSite ? `/${repo}/` : "/";

export default defineConfig({
  base,
  server: {
    port: 5173,
    // Dev: proxy /api/* to the local backend.
    proxy: {
      "/api": {
        target: "http://127.0.0.1:3000",
        changeOrigin: true,
      },
    },
  },
});
