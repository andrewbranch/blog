---
title: Default exports in CommonJS libraries
description: "TL;DR: don’t use them."
permalink: default-exports-in-commonjs-libraries/
date: 2024-04-28
layout: post
tags: post
---

Time for another Tweet analysis:

<blockquote class="rounded-lg bg-[var(--color-fg05)] p2 md:p4">
<div class="font-grotesk">

**Brandon McConnell**  
<a class="text-textSecondary" href="https://twitter.com/branmcconnell">@branmcconnell</a>

</div>

Apparently, I've been doing NPM package exports in TSC wrong my entire life. I usually use the ESM `export default _` if I'm doing a default export.

This generated CJS output appears to break when require'd in a CJS environment, requiring a property ref of `packageName.default` instead of simply `packageName`.

After much research, it appears the generally recommended fix is to use `module.exports =` in your main ESM file that TSC processes. WHAT. That's not a typo.

You can use any ESM imports or syntax you need in that file, but for the CJS output file to use `module.exports`, the ESM needs to use it too. Why can't TSC convert `export default` to `module.exports =` for the CJS target?

Doing this also appears to mess with the export types, so the `.d.ts` files sometimes get emptied out unless you export your exports with **_both_** ESM and CJS syntax together, even like this:

```js
export default myFunction;
module.exports = myFunction;
```

Has anyone else run into this? Twilight Zone moment with a simple fix? 🤞🏼

<small class="font-grotesk text-textSecondary">
<a href="https://twitter.com/mattpocockuk/status/1724495021745860793">10:30 AM · Nov 14, 2023</a>
</small>
</blockquote>

This is a great breakdown bringing up some interesting points. Everything in it is factually correct, but the “fix” Brandon heard recommended is wrong. Let’s get into the details.

## Background: CommonJS semantics
A CommonJS module can export any single value by assigning to `module.exports`:

```js
module.exports = "Hello, world";
```

Other CommonJS modules can access that value as the result of a `require` call of that module:

```js
const greetings = require("./greetings.cjs");
console.log(greetings); // "Hello, world"
```

`module.exports` is initialized to an empty object, and a free variable `exports` points to that same object. It’s common to simulate named exports by mutating that object with property assignments:

```js
exports.message = "Hello, world";
exports.sayHello = name => console.log(`Hello, ${name}`);
```

```js
const greetings = require("./greetings.cjs");
console.log(greetings.message); // "Hello, world";
greetings.sayHello("Andrew");   // "Hello, Andrew";
```
## Background: Transforming ESM to CommonJS
ECMAScript modules are fundamentally different from CommonJS modules. Where CommonJS modules expose exactly one nameless value of any type, ES modules always expose a [Module Namespace Object](https://tc39.es/ecma262/#sec-module-namespace-objects)—a collection of named exports. This creates something of a paradox for translating between module systems. If you have an existing CommonJS module that exports a string:

```js
module.exports = "Hello, world";
```

and you want to translate it to ESM, then transform it back to equivalent CommonJS output, what input can you write? The only plausible answer is to use a default export:

```js
export default "Hello, world";
```

But if you ever add another named export to this module:

```js
export default "Hello, world";
export const anotherExport = "uh oh";
```

you now have a problem. The transformed output can’t be

```js
module.exports = "Hello, world";
module.exports.anotherExport = "uh oh";
```

because attempting to assign the property `anotherExport` on a primitive won’t do anything useful. Remembering that default exports are actually just named exports with special syntax, you’d probably conclude that the output has to be:

```js
exports.default = "Hello, world";
exports.anotherExport = "uh oh";
```

So does an `export default` become `module.exports` or `module.exports.default`? Should it really flip flop between them based on whether there are _other_ named exports? Unfortunately, different compilers have landed on different answers to this question over the years. `tsc` took the approach of always assigning ESM default exports to `exports.default`. So `export default "Hello, world"` becomes:

```js
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = "Hello, world";
```

(The `__esModule` marker, an ecosystem standard that first appeared in Traceur, is used by transformed default _imports_, but isn’t relevant for the rest of this post. A more complete discussion of ESM/CJS transforms and interoperability can be found in the [TypeScript modules documentation](https://www.typescriptlang.org/docs/handbook/modules/appendices/esm-cjs-interop.html).)

This answers one of the questions posed in the tweet:

> Why can't TSC convert `export default` to `module.exports =` for the CJS target?

There’s an argument for doing that—some compilers do, or expose options to do that—but every approach has tradeoffs, and `tsc` chose a lane extremely early in the life of ESM and stuck with it.
## Understanding the behavior with `export default` alone
With that background, it should be easy to interpret the behavior Brandon observed:

> I usually use the ESM `export default _` if I'm doing a default export... This generated CJS output appears to break when require'd in a CJS environment, requiring a property ref of `packageName.default` instead of simply `packageName`.

`export default _` turns into `exports.default = _`, so if someone writing a `require` wants to access `_`, of course they need to write a property access like `require("pkg").default` to get it.

This is only a “break” if you have a specific expectation about how to translate from ESM to CJS, and as I argued in the previous section, all such expectations are fraught with inconsistencies and incompatibilities. The ESM specification didn’t say anything about interoperability with CommonJS, so tools that wanted to support both module formats kind of just made it up as they went. This is not to say that the outcome was _good_ or even that `tsc`’s decision to always assign to `exports.default` looks like the best decision with the benefit of nine years of hindsight. It wasn’t mentioned in the tweet, but the `exports.default` output is also problematic when imported by true ES modules in Node.js:

```js
// node_modules/hello/index.js
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = "Hello, world";

// main.mjs
import hello from "hello";
console.log(hello);         // { default: "Hello, world" }
console.log(hello.default); // "Hello, world"
```

Our _real_ default import fails to bind to our _transformed_ default export—we still need to access the `.default` property! This can make it nearly impossible to write code that works both in Node.js and in all bundlers. So, while the behavior with transformed `export default` in `tsc` is understandable and predictable, it is indeed problematic for libraries.
## The problem with adding `module.exports =` to the input
Apparently, there is some conventional wisdom floating around that the way to solve this problem is to add a `module.exports =` assignment to the TypeScript module, along with the `export default` statement. This is a Bad Idea, and Brandon included a clue as to why:

> Doing this also appears to mess with the export types, so the `.d.ts` files sometimes get emptied out unless you export your exports with **both** ESM and CJS syntax together, even like this:
> 
> ```js
> export default myFunction;
> module.exports = myFunction;
> ```

The key is that TypeScript doesn’t understand `module.exports` in TypeScript files, so it passes that expression through verbatim to the output JavaScript file, while emitting nothing for it into the output `.d.ts` file. That’s why writing `module.exports` without `export default` emits an empty declaration file. Including them both, the resulting output files look like:

```ts
// myFunction.js
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function myFunction() { /* ... */ }
exports.default = myFunction;
module.exports = myFunction;
```

```ts
// myFunction.d.ts
declare function myFunction(): void;
export default myFunction;
```

In the JavaScript, the `module.exports = myFunction` completely overwrites the effect of `exports.default = myFunction`. But the compiler doesn’t know that; all it sees (from a type perspective) is the default export, so that’s what it includes in the declaration file. So the [JavaScript and TypeScript are out of sync](https://github.com/arethetypeswrong/arethetypeswrong.github.io/blob/main/docs/problems/FalseExportDefault.md): the types assert that the shape of the module is `{ default: () => void }`, when in reality, it’s `() => void`. If a JavaScript user were to `require` this module, IntelliSense would guide them to write:

```js
require("pkg/myFunction").default();
```

when they actually need to write

```js
require("pkg/myFunction")();
```

💥
## The simplest solution
The idea that the output JavaScript should use `module.exports =` instead of `exports.default =` is a good one; we just need to accomplish that in a way TypeScript understands, so the JavaScript and declaration output stay in sync with each other. Fortunately, there is a TypeScript-specific syntax for `module.exports =`:

```js
function myFunction() { /* ... */ }
export default myFunction; // [!code --]
export = myFunction;       // [!code ++]
```

This creates the output pair:

```js
// myFunction.js
"use strict";
function myFunction() { /* ... */ }
module.exports = myFunction;
```

```ts
// myFunction.d.ts
declare function myFunction(): void;
export = myFunction;
```

The JavaScript uses `module.exports` and the types agree. Success!

One inconvenience to this approach is that you’re not allowed to include other top-level named exports alongside the `export =`:

```ts
export interface MyFunctionOptions { /* ... */ }
export = myFunction;
// ^^^^^^^^^^^^^^^^
// ts2309: An export assignment cannot be used in a module with
//         other exported elements.
```

Doing this requires a somewhat unintuitive workaround:

```ts
function myFunction() { /* ... */ }
namespace myFunction {
  export interface MyFunctionOptions { /* ... */ }
}
export = myFunction;
```

## Why is such a footgun allowed to exist?
Default exports, even transformed to CommonJS, are not a problem as long as the only person importing them is _you_, within an app where all your files are written in ESM syntax and compiled with the same compiler with an internally consistent set of transformations. Tools to compile ESM to CommonJS started emerging in 2014, before the specification was even finalized. I’m not sure anyone thought very hard about the possible long-term consequences of pushing a huge amount of ESM-transformed-to-CommonJS code to the npm registry.

TypeScript library authors are now encouraged to compile with the `verbatimModuleSyntax` option, which prevents writing ESM syntax when generating CommonJS output (i.e., the compiler forces you to use `export =` instead of `export default`), completely sidestepping this compatibility confusion.
## Looking ahead
I see two reasons to be hopeful for the future.

[TypeScript 5.5](https://devblogs.microsoft.com/typescript/announcing-typescript-5-5-beta/), just released in beta, introduces an `--isolatedDeclarations` option, which lays the groundwork for third-party tools to implement their own fast, syntax-based declaration emit. I mentioned earlier that some existing third-party tools have options that solve this problem for JavaScript emit, but don’t generate declaration files, potentially creating a worse problem. Hopefully, the next generation of JavaScript and TypeScript tooling will generate declaration files that accurately represent the transformations they do to generate their JavaScript output.

Secondly, [Node.js v22](https://nodejs.org/en/blog/announcements/v22-release-announce) includes experimental support for being able to `require` ESM graphs. If that feature lands unflagged in the future, there will be _much_ less of a reason for library authors to continue shipping CommonJS to npm.
