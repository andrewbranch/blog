// @ts-check
import { defineConfig } from "unocss";
import presetUno from "@unocss/preset-uno";

export default defineConfig({
	cli: {
		entry: {
			patterns: ["{content,_layouts}/**/*.{html,md,liquid}"],
			outFile: "content/uno.css",
		},
	},
	presets: [
		presetUno({
			dark: "media",
		}),
	],
});
