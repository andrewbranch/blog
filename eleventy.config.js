// @ts-check
const path = require("path");
const bundlerPlugin = require("@11ty/eleventy-plugin-bundle");
const eleventyImage = require("@11ty/eleventy-img");

/** @param {import("@11ty/eleventy").UserConfig} eleventyConfig */
module.exports = (eleventyConfig) => {
	const monthDayYearFormat = new Intl.DateTimeFormat("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});

	eleventyConfig.addFilter(
		"readableDate",
		/** @param {Date} dateObj */ (dateObj) => {
			return monthDayYearFormat.format(dateObj);
		},
	);

	eleventyConfig.addFilter(
		"htmlDateString",
		/** @param {Date} dateObj */ (dateObj) => {
			// dateObj input: https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-date-string
			return dateObj.toISOString().slice(0, 10);
		},
	);

	eleventyConfig.addFilter("inspect", (value) => `<pre>${JSON.stringify(value, null, 2)}</pre>`);

	eleventyConfig.addPlugin(bundlerPlugin);
	eleventyConfig.addPassthroughCopy("content/fonts");
	eleventyConfig.addPassthroughCopy("content/_redirects");

	eleventyConfig.addWatchTarget("./content/*.css");

	eleventyConfig.addAsyncShortcode("image", async function (src, alt, className, widths, sizes) {
		// Full list of formats here: https://www.11ty.dev/docs/plugins/image/#output-formats
		let formats = ["webp", "auto"];
		let file = relativeToInputPath(this.page.inputPath, src);
		let metadata = await eleventyImage(file, {
			widths: Array.isArray(widths) ? widths : [widths || "auto"],
			formats,
			outputDir: "public/img",
		});

		return eleventyImage.generateHTML(metadata, {
			alt,
			class: className,
			sizes,
			loading: "lazy",
			decoding: "async",
		});
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
