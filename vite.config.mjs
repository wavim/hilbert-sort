import { defineConfig } from "vite";

export default defineConfig({
	server: { port: 3000 },
	build: {
		emptyOutDir: true,
		outDir: "docs",
		target: "esnext",
		minify: true,
		cssMinify: true,
	},
	css: { preprocessorOptions: { scss: { api: "modern-compiler" } } },
	base: "",
});
