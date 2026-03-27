import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vitest/config"

// function getBasePath() {
//   const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1]

//   if (process.env.GITHUB_ACTIONS !== "true" || !repositoryName) {
//     return "/"
//   }

//   return repositoryName.endsWith(".github.io") ? "/" : `/${repositoryName}/`
// }

// https://vite.dev/config/
export default defineConfig({
  base: "/",
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    globals: false,
    setupFiles: "./src/test/setup.ts",
  },
})
