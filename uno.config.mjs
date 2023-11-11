// @ts-check
import { defineConfig, presetUno } from "unocss";

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
	theme: {
		colors: {
			textHighContrast: "var(--color-text-high-contrast)",
			textDisabled: "var(--color-text-disabled)",
			textSecondary: "var(--color-text-secondary)",
		},
		width: {
			content: "var(--width-content)",
		},
		breakpoints: {
			sm: "414px",
			md: "550px",
		},
	},
});
