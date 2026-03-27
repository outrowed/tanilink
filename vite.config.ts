import path from "path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

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
})
