---
title: Overengineering a Blog
date: 2019-02-16
template: CodePost
note: 'Disclaimer: I wrote this before joining the TypeScript team. I’m not speaking officially for TypeScript or Microsoft in any post on this blog, but I’m especially not in this one.'
lib:
  - react
preambles:
  - file: InteractiveCodeBlock.tsx
    text: "import React, { useState } from 'react';
      interface Point {
        key: string;
        offset: number;
      }
      interface Mark {
        type: string;
        data: Map<string, any>;
      }
      interface Decoration {
        anchor: Point;
        focus: Point;
        mark: Mark;
      }
      interface Value {}
      interface Node {}
      interface Operation{}
      interface CoreEditor {}
      interface EditorProps {
        value: Value;
        onChange: (change: { value: Value, operations: Operation[] }) => void;
        renderMark: (props: { mark: Mark, children: React.ReactChildren) => React.ReactNode;
        decorateNode: (node: Node, editor: CoreEditor) => Decoration[];
      }
      declare var Editor: React.ComponentType<EditorProps>;
      interface InteractiveCodeBlockProps {
        initialValue: Value;
        renderToken: (props: { mark: Mark, children: React.ReactChildren) => React.ReactNode;
        tokenize: (node: Node, editor: CoreEditor) => Decoration[];
      }\n"
  - file: silly.ts
    text: "declare var imaginaryObject: { sendMessage: (message: string) => void; }\n"
  - file: createSystem.ts
    text: "declare namespace ts {
      export interface System {
        args: string[];
        newLine: string;
        useCaseSensitiveFileNames: boolean;
        write(s: string): void;
        writeOutputIsTTY?(): boolean;
        readFile(path: string, encoding?: string): string | undefined;
        getFileSize?(path: string): number;
        writeFile(path: string, data: string, writeByteOrderMark?: boolean): void;
        watchFile?(path: string, callback: FileWatcherCallback, pollingInterval?: number): FileWatcher;
        watchDirectory?(path: string, callback: DirectoryWatcherCallback, recursive?: boolean): FileWatcher;
        resolvePath(path: string): string;
        fileExists(path: string): boolean;
        directoryExists(path: string): boolean;
        createDirectory(path: string): void;
        getExecutingFilePath(): string;
        getCurrentDirectory(): string;
        getDirectories(path: string): string[];
        readDirectory(path: string, extensions?: Array<string>, exclude?: Array<string>, include?: Array<string>, depth?: number): string[];
        getModifiedTime?(path: string): Date | undefined;
        setModifiedTime?(path: string, time: Date): void;
        deleteFile?(path: string): void;
        createHash?(data: string): string;
        createSHA256Hash?(data: string): string;
        getMemoryUsage?(): number;
        exit(exitCode?: number): void;
        realpath?(path: string): string;
        setTimeout?(callback: (...args: any[]) => void, ms: number, ...args: any[]): any;
        clearTimeout?(timeoutId: any): void;
        clearScreen?(): void;
        base64decode?(input: string): string;
        base64encode?(input: string): string;
    } }
    declare var otherStuffNotImportantToExample: Pick<ts.System, 'args' | 'newLine' | 'useCaseSensitiveFileNames' | 'write' | 'directoryExists' | 'resolvePath' | 'createDirectory' | 'getExecutingFilePath' | 'getDirectories' | 'exit'>;\n"
  - file: getReactTypings.ts
    text: "declare module '!raw-loader!*' { export default ('' as string); }\n"
---

I talked a little already about [why I wanted to build a blog with interactive code](/overengineering-a-blog-prologue), but I have to be honest: part of why I wanted to do this, and particularly why I chose not to use a prepackaged solution like [Monaco Editor](https://microsoft.github.io/monaco-editor/), was to see if I could do it. Compilers and text editors are two computing topics I find oddly fascinating. The chance to combine them in a practical and narrowly scoped project was alluring.

My goal was to build something that would:

- be lighter and feel more native than Monaco Editor (no custom scrollbar),
- have perfect syntax highlighting (no regex approximations),
- expose compiler diagnostics and type information of identifiers,
- be linkable to other code blocks so one can reference symbols defined in another,
- be able to reference outside libraries and other arbitrary unseen code.

I expressly did _not_ intended to build:

- a good code editor,
- something so complex that I never finish and publish this blog.

I knew I wasn’t setting out to build an editor. I was building a learning tool, 90% of whose value is not in editing—the type info and diagnostics tooltips were far more important. So I think choosing not to use Monaco was a reasonable decision after all. Having language support and great syntax highlighting, which Monaco could have provided better than I could do myself, was crucially important, but pushing an editor fully featured enough to power VS Code onto someone who just came to _read an article_ seemed like an irresponsible use of your bandwidth.

In other words, I had a moral imperative to half-ass an editor to lower your data usage.

## The Editor Itself
The editing experience was the least important aspect of the code blocks, but I also knew from a previous (unfinished) side project that the UI piece should be pretty easy with the help of [Slate](https://docs.slatejs.org). Slate is capable of handling some complex editing scenarios; it takes care of the nitty-gritty of working with [`contenteditable`](https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Editable_content) for you, and I assumed building components to render colors and tooltips would be simple. That’s mostly how it worked out. I give the Slate `Editor` a model that annotates spans of text with metadata (these annotated spans are called _Decorations_ in Slate), a function that renders a React component for a given span of text, and a simple `value` and `onChange` pair. In a greatly simplified version, this gist is:

<!--@
  name: InteractiveCodeBlock.tsx
-->
```tsx
function InteractiveCodeBlock(props: InteractiveCodeBlockProps) {
  const [value, setValue] = useState(props.initialValue);
  <Editor
    value={value}
    onChange={({ value }) => setValue(value)}
    decorateNode={props.tokenize}
    renderMark={props.renderToken}
  />
}
```

where

- `tokenize` takes the full text and returns a list of Decorations, tokens that describe how to syntax highlight each word, where to make compiler quick info available, and to underline in red; and,
- `renderToken` gets passed one of those words with its descriptive tokens, and renders that word with the correct syntax highlighting, and perhaps with tooltips attached to show information from the compiler.

My [real code](https://github.com/andrewbranch/blog/blob/c6cf1fd45a1191cb89ae6af73f7b0b1ced437303/src/components/InteractiveCodeBlock/InteractiveCodeBlock.tsx) is much more complex, but mostly due to performance hacks. This is a good representation of the actual architecture.

The biggest factor that makes this example an oversimplification is this: because in TypeScript, changing something on line 1 can change the state of something on line 10, I need to analyze the full text, every line, on every change. But if I use the new program state to build a new list of Decorations for the whole code sample, then every node (basically a React component for every word and punctuation mark) would re-render on every change. My solution involves a lot of caching, hashing, and memoization. I analyze the whole document on every change (well, that’s an oversimplification too—I’ll get there), then break the result down into tokens by line, and cache that. If I can tell that a whole line of new tokens are identical to a whole line of existing tokens by comparing line hashes, I can just return the existing Decoration objects. Slate will use this strict equality to bail out of re-rendering those lines, which removes a noticeable amount of latency on each keystroke.

## Static Rendering
I’m telling this piece of the story a little out of order, because I think it’s important context for everything that follows. I didn’t initially plan for this, but as I began to realized how much library code would be necessary to achieve editable code blocks with language support (the TypeScript compiler is larger than the rest of my blog’s assets combined), I once again felt a moral imperative to respect your data usage. Generally speaking, people don’t expect to have to download a compiler in order to read a blog post.

! ![A graphical representation of the blog’s assets by size, as provided by webpack-bundle-analyzer. TypeScript takes up the entire left half of the chart, plus some.](./images/bundle-analysis.png)
! [webpack-bundle-analyzer](https://github.com/webpack-contrib/webpack-bundle-analyzer) shows TypeScript’s size relative to everything else.

I also realized that none of the really heavy pieces are necessary until the moment a reader starts _editing_ a code sample. I could analyze the initial code at build time, generate syntax highlighting information, type information, and compiler diagnostics as static data, inject it with GraphQL, and reference it during render, all for a fraction of the weight of the compiler and syntax highlighter itself.

[Gatsby](https://www.gatsbyjs.org) made this fairly easy. During a build, I search the Markdown posts for TypeScript code blocks, run the static analysis on their contents, and inject the results into the [page context](https://www.gatsbyjs.org/docs/creating-and-modifying-pages/#pass-context-to-pages) (which becomes available as a prop in the [page template component](https://github.com/andrewbranch/blog/blob/c6cf1fd45a1191cb89ae6af73f7b0b1ced437303/src/templates/CodePost.tsx)).

Only when a reader clicks the edit button on a code block are the heavier dependencies downloaded, and the static analysis starts running in the browser. The huge majority of the analysis code is shared between the build-time process and the browser runtime process.

## The Language Service
If you’ve ever used the TypeScript compiler API, one of the first things you learn is that every important piece of the compiler interacts with the outside world via abstractions called _hosts_. Rather than calling into the file system directly with the `fs` module, the compiler asks for a `ts.CompilerHost` object that defines how to `readFile`, `writeFile`, and otherwise interact with its environment.

This makes it simple to provide an in-memory file system to the compiler such that it has no trouble running in the browser.  “File system” is an overstatement for the code I wrote, as the crucial functions are basically just aliases for Map methods:

<!--@
  name: createSystem.ts
-->
```ts
function createSystem(initialFiles: Map<string, string>): ts.System {
  const files = new Map(initialFiles);
  return {
    ...otherStuffNotImportantToExample,
    getCurrentDirectory: () => '/',
    readDirectory: () => Array.from(files.keys()),
    fileExists: fileName => files.has(fileName),
    readFile: fileName => files.get(fileName),
    writeFile: (fileName, contents) => {
      files.set(fileName, contents);
    },
  };
}
```

### Linked Code, Library Code, and Imaginary Code
The “source files” you see in the code blocks get pulled from Markdown source files. There’s a lot of code you _don’t_ see, though, like the default library typings, as well as typings for other libraries I want to reference, like React. In the browser, an async import with Webpack’s raw-loader does the trick, and ensures the lib files don’t get downloaded until they’re needed:

<!--@
  name: getReactTypings.ts
-->
```ts
async function getReactTypings(): Promise<string> {
  const typings = await import('!raw-loader!@types/react/index.d.ts');
  return typings.default;
}
```

During the static build, it’s just a `fs.readFileSync`. Plug the result into the virtual file system, and it Just Works™. Cool.

Recall the goal of being able to link code blocks together? Here’s what I mean. Suppose I’m explaining a concept and introduce some silly function:

<!--@
  name: silly.ts
-->
```ts
function someSillyFunction() {
  return 'It is silly, isn’t it!';
}
```

I might want to interrupt myself for a moment to set the stage before demonstrating how I might _use_ this function:

<!--@
  name: silly.ts
-->
```ts
// Hover these, and see that they’re real!
imaginaryObject.sendMessage(someSillyFunction());
```

Two things are in play here. First, `someSillyFunction` is being referenced from the previous block. In fact, if you edit the former and rename `someSillyFunction` or change its return type, then return focus to the latter, you’ll see compiler errors appear.

Second, I never defined `imaginaryObject` in visible code since it’s not important to the concept I’m trying to demonstrate, but I do need it to compile. (It turns out that aggressively checking example code requires you to get creative with how you write examples that are 100% valid, but still simple and to the point.)

These techniques are signaled by HTML comments and YAML frontmatter in the Markdown source:

<!--@
  lang: md
-->
    ---
    preambles:
      file: silly.ts
      text: "declare var imaginaryObject: {
        sendMessage: (message: string) => void;
      }\n"
    ---
    
    <!--@
      name: silly.ts
    -->
    ```ts
    function someSillyFunction() {
      return 'It is silly, isn’t it!';
    }
    ```
    
    I might want to interrupt myself for a moment to set the stage before
    demonstrating how I might _use_ this function:
    
    <!--@
      name: silly.ts
    -->
    ```ts
    // Hover these, and see that they’re real!
    imaginaryObject.sendMessage(someSillyFunction());
    ```

(That got pretty meta, huh?) The matching `name` field makes the two code blocks get concatenated into a single `ts.SourceFile` so they’re in the same lexical scope. The `preamble` field simply adds code to the beginning of the `ts.SourceFile` that doesn’t get shown in either editor.

### Tokenizing with the Language Service
Time to _do_ something with all this infrastructure. There’s not a ton of documentation out there on using the compiler API, so I spent a while fiddling with things, but in the end it came out pretty simple. Once you have a browser-compatible replacement for `ts.System`, you’re a tiny step away from having a `ts.CompilerHost`, and from there, a `ts.LanguageService` follows in short order. When the editor calls `tokenize`, asking for the text to be split up into annotated ranges, three language service functions are used:

1. [`getSyntacticClassifications`](https://github.com/andrewbranch/blog/blob/c6cf1fd45a1191cb89ae6af73f7b0b1ced437303/src/components/InteractiveCodeBlock/tokenizers/typescript.ts#L60) provides a sort of high-level classification of tokens (e.g. `className`, `jsxOpenTagName`, `identifier`), from which I pick [the name-y ones](https://github.com/andrewbranch/blog/blob/c6cf1fd45a1191cb89ae6af73f7b0b1ced437303/src/components/InteractiveCodeBlock/tokenizers/typescript.ts#L159-L174) to be candidates for “quick info” (the tooltip contents);
2. [`getSyntacticDiagnostics`](https://github.com/andrewbranch/blog/blob/c6cf1fd45a1191cb89ae6af73f7b0b1ced437303/src/components/InteractiveCodeBlock/tokenizers/typescript.ts#L61), which tells me the location and nature of a syntactic error, like putting a curly brace where it doesn’t belong; and finally,
3. [`getSemanticDiagnostics`](https://github.com/andrewbranch/blog/blob/c6cf1fd45a1191cb89ae6af73f7b0b1ced437303/src/components/InteractiveCodeBlock/tokenizers/typescript.ts#L62), which tells me the location and nature of type errors like _Object is possibly undefined_ or _Cannot find name 'Recat'_.

That’s about it. `getSemanticDiagnostics` can be a little slow  to run on every keypress, so I [wait for a few hundred milliseconds of inactivity](https://github.com/andrewbranch/blog/blob/c6cf1fd45a1191cb89ae6af73f7b0b1ced437303/src/components/InteractiveCodeBlock/tokenizers/typescript.ts#L134-L147) before reanalyzing the code.

## Syntax Highlighting
Here’s the sticky part.  The first tokenizer I tried for syntax highlighting was [Prism](https://prismjs.com), and it didn’t cut it. Prism may produce perfect results for simple grammars, but complex TypeScript samples just didn’t look right. (Part of this is due to Prism’s inherent limitations; part is due to its rather sparse [grammar definition](https://github.com/PrismJS/prism/blob/11695629f12925c586702453beaee5f4825d0ebd/components/prism-typescript.js). Other grammars are more complete.) By no means do I intend to disparage anyone else’s work. On the contrary, I knew that Prism doesn’t claim to be perfect, but rather aims to be light, fast, and good enough—I didn’t realize just how _much_ lighter and faster it is for its tradeoffs until seeking a higher fidelity alternative.

### Second Attempt: TypeScript
The obvious choice for perfect syntax highlighting, I thought, was the TypeScript compiler itself. I would already have access to it given what I was doing with the language service, and clearly it understands every character of the code in a markedly deeper, more semantic way than any regex engine. Using `getSyntacticClassifications` again did overall a little better than Prism on its own. Adding extra information from `getSemanticClassifications` improved things further.

However, one quirk of this approach was that referenced interface names and class names would only be colored as such if they actually existed. For instance:

![GIF showing the effect of editing an interface declaration on line one on the second line’s reference to that interface name. When the names match, both are highlighted like type names. When the names don’t match, the reference to the unknown identifier is colored darker, like a variable name.](./images/semantic-highlighting.gif)

`FirstInterface` in the second line becomes variable-colored when the identifier no longer exists. It was kind of interesting, but not necessarily desirable. A little distracting.

Besides, the code still just didn’t look quite right. At this point I started really taking note of how highlighting in real code editors works. Call expressions (e.g., `callingAFunction()`) are typically highlighted in a different color than other identifiers, and the classification APIs weren’t giving me that information. I tried augmenting their results by walking the AST, but that had a considerable performance impact. I was starting to feel like I could spend countless hours striving for something perfect only to end up with something that not only misses the mark, but is unusably slow too.

### Final Attempt: TextMate Grammar
I ultimately decided to try to use [the official TypeScript TextMate grammar](https://github.com/Microsoft/TypeScript-TmLanguage) used by VS Code and Atom. Like the TypeScript lib files, the grammar file contents are retrieved with `fs` at build time and an async raw-loader import in the browser (only once editing has begun). I found [the package VS Code uses](https://github.com/Microsoft/vscode-textmate) to parse the grammar file and tokenize code, and gave that a try.

Now, here’s the _most absolutely bananas_ thing I learned during this whole project: [TextMate](https://macromates.com) itself used the regular expression engine [Oniguruma](https://macromates.com/manual/en/regular_expressions#syntax_oniguruma) (which also happens to be Ruby’s regex engine), so TextMate grammars are written for that engine. It’s a _half megabyte_ binary, and it seems no one has bothered to make a serious attempt at syntax highlighting that works natively in JavaScript. Instead, people have just created [node bindings](https://github.com/atom/node-oniguruma) for Oniguruma, and, fortuitously for my attempt to use this in the browser, [ported it to Web Assembly](https://github.com/NeekSandhu/onigasm).

I have to pause briefly to express my bewildered exasperation. TextMate was great, but why are we jumping through such hoops to keep doing syntax highlighting exactly the way it was done in 2004? It feels like there’s an opportunity in the open source market to make an uncompromisingly good syntax highlighter with pure JavaScript.

Carrying on. The awkwardly but inevitably named Onigasm allows me to achieve the same quality of syntax highlighting in the browser as TextMate, Sublime Text, Atom, and VS Code achieve on your machine. And again, the WASM module isn’t loaded until you start editing—the initial code tokenization is done at build time. What a time to be writing for web! It feels not so long ago that `border-radius` was too new to be relied upon, and now I’m serving web assembly.

Download size wasn’t the only price to pay for accuracy, though—tokenizing a whole code sample with vscode-textmate was noticeably slower than doing the same with Prism. Onigasm’s author claims Web Assembly imparts a 2x performance penalty compared to running on v8, but it still makes me impressed with how fast VS Code can update the highlighting	as you type. I was able to implement an aggressive cache per-line that keeps the overall typing experience from being impacted too much, but you can still see the delay in formatting each time you insert a new character.

## Looking Forward
Honestly, I’m probably not going to put much more time and effort into improving the code blocks. They already stretched the anti-goal of being “so complex that I never finish and publish this blog.”

If I do invest any time, though, the next improvement will be to move the tokenizers to web workers. They already work asynchronously, so theoretically that should be within reach. My suspicion is that it will add a few milliseconds more latency to the tokenizing in exchange for making the typing and rendering itself snappier. Tokenizing is currently debounced and/or called in a `requestIdleCallback` so as to get out of the way of rendering text changes as quickly as possible, but if you type quickly, priorities can still collide easily with everything sharing a single process.

But first, more posts. I made a blog and put my name on it. Guess I’m stuck with it now. 😬