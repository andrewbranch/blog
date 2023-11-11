// @ts-check
const path = require("path");
const bundlerPlugin = require("@11ty/eleventy-plugin-bundle");
const eleventyImage = require("@11ty/eleventy-img");
const getImageSize = require("image-size");

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

	eleventyConfig.addFilter("inspect", (value) => `<pre>${JSON.stringify(value, null, 2)}</pre>`);

	eleventyConfig.addPlugin(bundlerPlugin);
	eleventyConfig.addPassthroughCopy("content/fonts");
	eleventyConfig.addPassthroughCopy("content/_redirects");

	eleventyConfig.addWatchTarget("./content/*.css");

	eleventyConfig.addAsyncShortcode("image", async function (src, alt, className, widths, sizes) {
		widths = Array.isArray(widths) ? widths : [widths || "auto"];
		// Full list of formats here: https://www.11ty.dev/docs/plugins/image/#output-formats
		const formats = ["webp", "auto"];
		const originalPath = relativeToInputPath(this.page.inputPath, src);
		const { width, type } = getImageSize(originalPath);
		const bodyWidth = 768; // TODO: integrate with CSS theme
		const generatePhotoLink = type === "jpg" && width > bodyWidth * 2;
		if (generatePhotoLink) {
			widths = [bodyWidth * 2, "auto"];
			sizes = `(max-width: ${bodyWidth}px) 100vw, ${bodyWidth}px`;
		}

		// TODO: this wastes the full-size webp image.
		// Could use sharp directly to save a bit.
		const metadata = await eleventyImage(originalPath, {
			widths,
			formats,
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
			? `<a class="photo-link" target="_blank" href="${metadata.jpeg.at(-1).url}">${pictureHtml}</a>`
			: pictureHtml;
	});

	eleventyConfig.amendLibrary("md", (md) => {
		md.use(require("markdown-it-footnote"));
		md.use(require("@ryanxcharles/markdown-it-katex"));
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
	const pacificOffset = 7 * 60 * 60 * 1000;
	return new Date(date.getTime() + pacificOffset);
}
