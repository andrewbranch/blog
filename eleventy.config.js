// @ts-check
const bundlerPlugin = require("@11ty/eleventy-plugin-bundle");

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
