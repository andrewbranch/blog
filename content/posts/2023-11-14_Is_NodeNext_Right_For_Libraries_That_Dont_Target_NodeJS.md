---
title: Is `nodenext` right for libraries that don’t target Node.js?
description: "Settling a Twitter debate the only way I know how: you’re both right, but not as right as me."
permalink: is-nodenext-right-for-libraries-that-dont-target-node-js/
date: 2023-11-14
layout: post
tags: post
---

I started to reply to [this tweet](https://twitter.com/mattpocockuk/status/1724495021745860793), but I think it deserves more than a hasty string of 240-character concatenations:

<blockquote class="rounded-lg bg-[var(--color-fg05)] p2 md:p4">
<div class="font-grotesk">

**Matt Pocock**  
<a class="text-textSecondary" href="https://twitter.com/mattpocockuk">@mattpocockuk</a>

</div>

cc [@atcb](https://twitter.com/atcb) in case I've got something drastically wrong.

Summary:

I think that if you transpile TS code with `NodeNext`, that will be compatible with any modern bundler (any `moduleResolution: Bundler` environment).

[@tpillard](https://twitter.com/tpillard) thinks that there are issues which mean you should transpile one export with `moduleResolution: Bundler` and another with `moduleResolution: NodeNext` if you plan to support both.

<small class="font-grotesk text-textSecondary">
<a href="https://twitter.com/mattpocockuk/status/1724495021745860793">10:30 AM · Nov 14, 2023</a>
</small>
</blockquote>

I _mostly_ agree with Matt, and his advice earlier in the thread more or less matches what I published in TypeScript’s [Choosing Compiler Options](https://www.typescriptlang.org/docs/handbook/modules/guides/choosing-compiler-options.html#im-writing-a-library) guide for modules.

It’s worth unpacking some of the nuances here. Something important about Tim’s position, and about how `tsc` works, is lost to the Twitter shorthand in Matt’s characterization above. `moduleResolution` doesn’t affect `tsc`’s emit, so producing two different outputs toggling that option alone would do nothing for consumers. But as Matt and Tim both know, it’s not possible to toggle _just_ `moduleResolution` between `bundler` and `nodenext`, because each of these enforces a corresponding `module` option, which _does_ affect emit:

- `moduleResolution: bundler` requires `module: esnext`
- `moduleResolution: nodenext` requires `module: nodenext`

So at face value, the real question posed in Matt’s tweet is whether there are differences in emit between `module: esnext` and `module: nodenext` that might cause bundlers to trip over `nodenext` code.

## Emit differences

The most important thing to understand about `module: nodenext` is it doesn’t just emit ESM; it emits whatever format it _has_ to in order for Node.js not to crash; each output filename is inherently either ESM or CommonJS according to [Node.js’s rules](https://www.typescriptlang.org/docs/handbook/modules/theory.html#module-format-detection) and `tsc` chooses its emit format for each file based on those rules. So depending on the context, we might be asking be asking about the difference between CommonJS and ESM, or the difference between `module: esnext` and the particular flavor of ESM produced by `module: nodenext`.

Bundlers are capable of processing (and typically willing to process) both CommonJS and ESM constructs wherever they appear (unlike Node.js, which _parses_ ES modules and CommonJS scripts differently), so it’s fair to say that the potential difference in module format between `module: esnext` and `module: nodenext` will not itself break bundlers (although most bundlers have more difficulty tree-shaking CommonJS than ESM).

There is, however, one specifically Node.js-flavored emit construct that could derail a bundler. In `module: nodenext`, a TypeScript `import`/`require` inside an ESM-format file:

```ts
// @Filename: index.mts
import fs = require("dep");
```

has a special Node.js-specific emit:

```js
// @Filename: index.mjs
import { createRequire as _createRequire } from "module";
const __require = _createRequire(import.meta.url);
const fs = __require("dep");
```

I _assume_ this won’t work in most bundlers, though some have built-in Node.js shims, so I could be proven wrong. But this is a clear case where `module: nodenext` would allow Node.js-specific code to be emitted; it’s just not something someone is likely to write by mistake.

## Module resolution

Continuing `import`/`require` shows another way to frame the question. Suppose we had our input code:

```ts
// @Filename: index.mts
import fs = require("dep");
```

and in order to avoid the potential for Node.js-specific emit to crash a user’s bundler, we decided to produce two outputs—one for Node.js and one for bundlers. When switching to `module: esnext` and `moduleResolution: bundler`, our input code errors:

<pre class="shiki dark-modern" style="background-color: #1F1F1F; white-space: normal"><code style="color: #D4D4D4">
ts1202: Import assignment cannot be used when targeting ECMAScript modules. Consider using 'import * as ns from "dep"', 'import {a} from "dep"', 'import d from "dep"', or another module format instead.
</code></pre>

So the question isn’t fully answered just by looking at the transforms applied by these `module` modes; we also need to ask whether valid input code in `module: nodenext` is also valid in `module: esnext` and `moduleResolution: bundler`. If there are compilation errors, that’s a strong signal that the output code will be a problem.

Beyond this one emit incompatibility, what other compilation errors are possible? Earlier in the Twitter thread, the theory was that module resolution is the problem. Let’s define exactly what that would mean. Imagine we have an output file like:

```js
// @Filename: utils.mjs
import { sayHello } from "greetings";
sayHello(["Matt", "Tim"]);
```

Suppose we generated this file from a TypeScript input that compiled error-free under `module: nodenext`, meaning that TypeScript did its best to model how Node.js will resolve the specifier `"greetings"`, found type declarations for the resolved module, and verified that the usage of the API was correct. The theory that this analysis does not provide a similar level of confidence that this code will work in a bundler due to module resolution differences presupposes that at least one of these outcomes is possible:

1. A bundler will not be able to resolve `"greetings"`
2. A bundler will resolve `"greetings"` to a module that has a sufficiently different shape, such that, if the types for that module were known, TypeScript would report an error for the usage of the API

These are both **absolutely possible** via conditional package.json `"exports"`. For example, `"greetings"` could define `"exports"` like:

```json
{
	"exports": {
		"module": "./contains-only-say-goodbye.js",
		"node": "./contains-only-say-hello.js"
	}
}
```

This would direct bundlers to one module and Node.js to another, each having a completely different API. In this case, it would be impossible to write a single import declaration that works in both contexts, and TypeScript could be used to catch an error like this by type checking the input code under multiple `module`/`moduleResolution`/`customConditions` settings. But this is terrible, terrible practice! I don’t think I’ve ever seen this in a real npm package (and I have looked at a _lot_ of package.jsons in the last year).

Indeed, the _only_ difference between `moduleResolution: bundler` and the CommonJS `moduleResolution: nodenext` algorithm in TypeScript is import conditions, and every resolution that can be made in the ESM `moduleResolution: nodenext` algorithm will be made the same way in `moduleResolution: bundler`, with the exception of where import conditions cause them to diverge. (If there are other differences in the _real_ resolution algorithms of bundlers and Node.js, they are not reflected in TypeScript’s algorithm, so additional checking with TypeScript won’t help.) Keep in mind that bundlers came about in large part so that modules on npm, written under the assumption that only Node.js would be able to use them, could be used in the browser, which lacked a module system at the time. Bundlers would not be doing their job if their module resolution algorithms choked on Node.js code. Conditional exports _can_ be used to redirect a bundler, but doing this in a way that breaks the contract of the module that Node.js would see is arguably a bug.

In other words, module resolution is not an issue unless a package is doing something extra terrible with `"exports"`.

## Module interop

The last possible incompatibility (that TypeScript can catch) is how modules of different formats interoperate with each other. I’ve written about this [extensively elsewhere](https://www.typescriptlang.org/docs/handbook/modules/appendices/esm-cjs-interop.html), so suffice it to say that it is possible to have a default import:

```ts
import sayHello from "greetings";
```

that _must_ be called one way in a bundler:

```ts
sayHello();
```

and another, unintentionally different way in Node.js:

```ts
sayHello.default();
```

even though both module systems resolved to the same module. If you are writing a library, compiling to ESM, checking with `module: nodenext`, and find yourself needing to write `.default()` on something you default-imported, there is a possibility that your output code [will not work in a bundler](https://github.com/arethetypeswrong/arethetypeswrong.github.io/blob/main/docs/problems/CJSOnlyExportsDefault.md). (There is also a possibility that the type declarations for the library are incorrectly telling TypeScript that `.default` is needed, when in fact it is either not needed or [not present](https://github.com/arethetypeswrong/arethetypeswrong.github.io/blob/main/docs/problems/FalseExportDefault.md)!)

## Conclusion

Matt’s advice, my usual advice, and the [TypeScript documentation’s advice](https://www.typescriptlang.org/docs/handbook/modules/guides/choosing-compiler-options.html#im-writing-a-library) is that you’re _usually basically_ fine to use `nodenext` for all libraries:

> Choosing compilation settings as a library author is a fundamentally different process from choosing settings as an app author. When writing an app, settings are chosen that reflect the runtime environment or bundler—typically a single entity with known behavior. When writing a library, you would ideally check your code under _all possible_ library consumer compilation settings. Since this is impractical, you can instead use the strictest possible settings, since satisfying those tends to satisfy all others.

But Tim is right that this is imperfect. It’s definitely possible to construct examples that break. In reality, breaks only occur in the face of packages that are behaving badly. (Unfortunately, a fair number of packages behave badly.)

I think I would summarize as:

- `nodenext` is the right option for authoring libraries, because it prevents you from emitting ESM with module specifiers that _only_ work in bundlers but will crash in Node.js. When writing conventional code, using common sense, and relying on high-quality dependencies, its output is usually highly compatible with bundlers and other runtimes.
- There is no TypeScript option specifically meant to enforce patterns that result in maximum cross-environment portability.
- When stronger guarantees of portability are needed, there is no substitute for runtime testing your output.
- However, a lower effort and reasonably good confidence booster would be to run `tsc --noEmit` under different `module`/`moduleResolution` options.
