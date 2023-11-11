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
		fontFamily: {
			grotesk: "var(--font-grotesk)",
		},
		colors: {
			textHighContrast: "var(--color-text-high-contrast)",
			textPrimary: "var(--color-text-primary)",
			textSecondary: "var(--color-text-secondary)",
			textMuted: "var(--color-text-muted)",
			textDisabled: "var(--color-text-disabled)",
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
