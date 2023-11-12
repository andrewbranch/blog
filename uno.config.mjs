// @ts-check
import { defineConfig, presetUno, presetIcons } from "unocss";

export default defineConfig({
	cli: {
		entry: {
			patterns: ["{content,_layouts}/**/*.{html,md,liquid}", "eleventy.config.js"],
			outFile: "content/styles/uno.css",
		},
	},
	presets: [
		presetIcons(),
		presetUno({
			dark: "media",
		}),
	],
	theme: {
		spacing: {
			1: "calc(var(--rhythm) * .25rem * 1)",
			2: "calc(var(--rhythm) * .25rem * 2)",
			3: "calc(var(--rhythm) * .25rem * 3)",
			4: "calc(var(--rhythm) * .25rem * 4)",
			5: "calc(var(--rhythm) * .25rem * 5)",
			6: "calc(var(--rhythm) * .25rem * 6)",
			7: "calc(var(--rhythm) * .25rem * 7)",
			8: "calc(var(--rhythm) * .25rem * 8)",
		},
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
