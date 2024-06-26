// @ts-check
const util = require("util");
const path = require("path");
const bundlerPlugin = require("@11ty/eleventy-plugin-bundle");
const eleventyImage = require("@11ty/eleventy-img");
const getImageSize = require("image-size").default;
const anchor = require("markdown-it-anchor").default;
const faviconsPlugin = require("eleventy-plugin-gen-favicons");
const pluginRss = require("@11ty/eleventy-plugin-rss");
const markdownIt = require("markdown-it");
const { readFile } = require("fs/promises");
const md = markdownIt({
	html: true,
});

/** @param {import("@11ty/eleventy").UserConfig} eleventyConfig */
module.exports = (eleventyConfig) => {
	const monthDayYearFormat = new Intl.DateTimeFormat("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
		timeZone: "America/Los_Angeles",
	});

	eleventyConfig.addFilter(
		"readableDate",
		/** @param {Date} dateObj */ (dateObj) => {
			return monthDayYearFormat.format(utcToPacific(dateObj));
		},
	);

	eleventyConfig.addFilter(
		"htmlDateString",
		/** @param {Date} dateObj */ (dateObj) => {
			// dateObj input: https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-date-string
			return utcToPacific(dateObj).toISOString().slice(0, 10);
		},
	);

	eleventyConfig.addFilter("inspect", (value) => `<pre>${util.inspect(value)}</pre>`);

	eleventyConfig.addPlugin(bundlerPlugin);
	eleventyConfig.addPlugin(pluginRss);
	eleventyConfig.addPassthroughCopy("content/images");
	eleventyConfig.addPassthroughCopy("content/styles/fonts");
	eleventyConfig.addPassthroughCopy("content/_redirects");
	eleventyConfig.addPassthroughCopy({
		"node_modules/katex/dist/fonts": "bundle/fonts",
	});

	eleventyConfig.addWatchTarget("./content/styles/*.css");

	eleventyConfig.addShortcode("md", (/** @type {string} */ content) => {
		return md.renderInline(content);
	});
	eleventyConfig.addAsyncShortcode("ogImage", async function (src) {
		if (src) {
			const originalPath = relativeToInputPath(this.page.inputPath, src);
			const metadata = await eleventyImage(originalPath, {
				widths: [1200],
				formats: ["jpeg"],
				outputDir: "public/img",
			});
			const jpeg = metadata.jpeg[0];
			const url = new URL(jpeg.url, new URL("https://blog.andrewbran.ch"));
			return `<meta property="og:image" content="${url.toString()}" />`;
		} else {
			const metadata = await eleventyImage(path.join(__dirname, "content/images/logo.svg"), {
				widths: [1200],
				formats: ["png"],
				outputDir: "public/img",
			});
			const png = metadata.png[0];
			const url = new URL(png.url, new URL("https://blog.andrewbran.ch"));
			return `<meta property="og:image" content="${url.toString()}" />`;
		}
	});
	eleventyConfig.addAsyncShortcode("image", async function (src, alt, className, widths, sizes) {
		widths = Array.isArray(widths) ? widths : [widths || "auto"];
		const originalPath = relativeToInputPath(this.page.inputPath, src);
		const { width, type } = getImageSize(originalPath);
		const bodyWidth = 768; // TODO: integrate with CSS theme
		const generatePhotoLink = type === "jpg" && (width ?? 0) > bodyWidth * 2;
		if (generatePhotoLink) {
			widths = [bodyWidth * 2, "auto"];
			sizes = `(max-width: ${bodyWidth}px) 100vw, ${bodyWidth}px`;
		}

		// TODO: this wastes the full-size webp image.
		// Could use sharp directly to save a bit.
		const metadata = await eleventyImage(originalPath, {
			widths,
			formats: ["webp", "auto"],
			outputDir: "public/img",
		});

		// Only generate picture HTML for body-sized images.
		// The full size one is only for linking to.
		const renderableMetadata = generatePhotoLink
			? Object.fromEntries(
					Object.entries(metadata).map(([type, sizes]) => {
						return [type, [sizes[0]]];
					}),
			  )
			: metadata;

		const pictureHtml = eleventyImage.generateHTML(renderableMetadata, {
			alt,
			class: className || "",
			sizes,
			loading: "lazy",
			decoding: "async",
		});

		return generatePhotoLink
			? `<a class="photo-link" target="_blank" href="${
					/** @type {any} */ (metadata.jpeg).at(-1).url
			  }">${pictureHtml}</a>`
			: pictureHtml;
	});

	eleventyConfig.setLibrary("md", md);
	eleventyConfig.amendLibrary("md", async (/** @type {import("markdown-it")} */ md) => {
		const { getHighlighter } = await import("shikiji");
		const { fromHighlighter } = await import("markdown-it-shikiji/core");
		const { transformerNotationDiff } = await import("shikiji-transformers");
		const highlighter = await getHighlighter({
			langAlias: { kdl: "KDL" },
		});
		const theme = JSON.parse(await readFile(path.join(__dirname, "dark_modern.json"), "utf8"));
		const kdl = JSON.parse(await readFile(require.resolve("kdl/syntaxes/kdl.tmLanguage.json"), "utf8"));
		await highlighter.loadTheme(theme);
		await highlighter.loadLanguage("css", kdl, "js", "json", "shell", "tsx", "typescript");
		md.use(require("markdown-it-footnote"));
		md.use(require("@ryanxcharles/markdown-it-katex"));
		md.use(anchor, {
			permalink: anchor.permalink.headerLink({
				class: "no-underline",
			}),
		});
		md.use(
			fromHighlighter(highlighter, {
				theme: "dark-modern",
				transformers: [transformerNotationDiff()],
			}),
		);
	});

	eleventyConfig.addPlugin(faviconsPlugin, {
		outputDir: "public",
	});

	return {
		dir: {
			input: "content",
			includes: "../_includes",
			layouts: "../_layouts",
			data: "../_data",
			output: "public",
		},
	};
};

/**
 * @param {string} inputPath
 * @param {string} relativeFilePath
 */
function relativeToInputPath(inputPath, relativeFilePath) {
	let split = inputPath.split("/");
	split.pop();

	return path.resolve(split.join(path.sep), relativeFilePath);
}

/**
 * Frontmatter dates are specified as date-only but interpreted
 * as midnight UTC. Since rendered dates include a datetime serialization,
 * we want to adjust the date to a time that has the written date
 * in Pacific time, where the posts are actually written.
 *
 * @param {Date} date
 */
function utcToPacific(date) {
	const pacificOffset = 8 * 60 * 60 * 1000;
	return new Date(date.getTime() + pacificOffset);
}
