import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
	build: { outDir: "docs", emptyOutDir: true, target: "esnext", minify: true },
	plugins: [tailwindcss()],
	base: "",
});
