import React from "react";
import Layout from "../components/Layout";
import { Link } from "gatsby";

export default function About() {
	return (
		<Layout>
			<h1>Hi! I’m Andrew.</h1>
			<p>
				I live in San Francisco. I moved here in 2015 to work for{" "}
				<a href="https://web.archive.org/web/20160801084220/https://www.xamarin.com/">Xamarin</a>, which was acquired by
				Microsoft in 2016. Since then, I’ve been working on developer tools at Microsoft, and since April 2019, the{" "}
				<a href="https://www.typescriptlang.org">TypeScript</a> language and compiler.
			</p>
			<p>
				I started programming poorly and building very bad web sites at around the age of eleven, and then I stopped for
				a long time until college, where I took a job in which sometimes I would break down cardboard boxes and other
				times would write very bad PHP and SQL. Eventually I moved on to writing very bad C# and JavaScript, stopped
				breaking down cardboard boxes, and did that until I got less bad at it. (My SQL has not improved.)
			</p>
			<p>
				At the same time, I earned a degree in electrical engineering, which I neither use nor regret. Vaguely knowing
				how electricity works is pretty fun, and I still sometimes start hobby electronics projects that are totally
				impractical and will never get finished.
			</p>
			<p>
				These days, I write a lot of TypeScript (go figure), and not long ago, a lot of{" "}
				<a href="https://reactjs.org">React</a>. (Now, my time with React is mostly spent just dreaming up bizarre and
				horrifying edge cases where it breaks our type system.) Aside from that, I try to spend my time doing things
				outside. One time I walked <a href="https://appalachiantrail.org">really far</a>, and I’ve biked across{" "}
				<Link to="/one-does-not-simply-walk-into-mordor">a few small countries</Link>. Once a year or so I struggle to
				use up all 36 exposures on a roll of color film. I’ve also been trying to get better at{" "}
				<a href="https://www.instagram.com/p/Bv50vBFFXzd/">drawing</a> recently, although I don’t spend enough time on
				it. And very occasionally, I vastly underestimate the ambitiousness of a project like this blog and pour dozens
				of hours into it for dubious gain. This happens to be one of the few that I’ve finished, so, hope you enjoy. ❤️
			</p>
		</Layout>
	);
}
