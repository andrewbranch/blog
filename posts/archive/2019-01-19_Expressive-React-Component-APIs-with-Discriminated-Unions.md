---
title: Expressive React Component APIs with Discriminated Unions
date: 2019-02-06
slug: expressive-react-component-apis-with-discriminated-unions
globalPreamble: "declare var onChange: () => void;declare var console: { log: Function };\n"
template: CodePost
preambles:
  - file: select-1.tsx
    text: "import React from 'react';\n"
  - file: select-2.tsx
    text: "import React from 'react';\n"
  - file: select-3.tsx
    text: "import React from 'react';\n"
lib:
  - react
note: '
When I wrote this piece, I realized it would be much easier to explain if I could show you how the TypeScript compiler handles the code I’m talking about, as if we were both sitting in front of your favorite code editor with language support. So, I built this blog to imitate that experience. Hover (or tap) on code underlined in red to see errors, hover identifiers to see type information, and even edit the samples if you want. I also <a href="/overengineering-a-blog-prologue-an-ode-to-red-squigglies/">wrote more</a> about why I did this.


Disclaimer: I wrote this before joining the TypeScript team. I’m not speaking officially for TypeScript or Microsoft in
any post on this blog, but I’m especially not in this one.'
---

One of TypeScript’s most underrated features is _discriminated union types_. Borrowed primarily from functional programming (FP) languages, they match an elegant FP concept to a pattern people intuitively write in JavaScript. Discriminated unions also enable a useful pattern for typing complex React component props more safely and expressively. But first, we’ll review what discriminated unions look like independent of React.


## Setting the Stage
A simple union type in TypeScript looks like this:

```ts
let x: string | number = 42;

x = 0; // fine
x = 'Hiya!'; // also fine
x = true; // not fine
```

Riveting, right? Things get more interesting with object types:

<!--@
name: shapes.ts
-->
```ts
interface Polygon {
  numberOfSides: number;
  sideLengths: number[];
}

enum TriangleKind {
  Accute = 'Accute',
  Right = 'Right',
  Obtuse = 'Obtuse'
}

interface Triangle extends Polygon {
  numberOfSides: 3;
  triangleKind: TriangleKind;
}

interface Quadrilateral extends Polygon {
  numberOfSides: 4;
  isRectangle: boolean;
}
```

We have a base type `Polygon`, and two specializations that specify a number literal type for `numberOfSides`, along with some extra properties that are specific to polygons of their kind. This allows us to write a function that accepts either a `Triangle` or `Quadrilateral` and _discriminate_ between them based on the shape’s `numberOfSides`:

<!--@
name: shapes.ts
-->
```ts
function addShape(shape: Triangle | Quadrilateral) {
  if (shape.numberOfSides === 3) {
    // In here, the compiler knows that `shape` is a `Triangle`,
    // so we can access triangle-specific properties.
    // See for yourself: hover each occurance of “shape” and
    // compare the typing info.
    console.log(shape.triangleKind);
  } else {
    // In here, the compiler knows that `shape` is a `Quadrilateral`.
    console.log(shape.isRectangle);
  }
}
```

When we have a union (like `Triangle | Quadrilateral`) that can be narrowed by a literal member (like `numberOfSides`), that union is called a _discriminated union_ and that property is called the _discriminant property_.

## The Problem: Overly Permissive Props
You’re writing a Select component (i.e., a fancy replacement for an HTMLSelectElement) with React and TypeScript. You want it to support both single-selection and multiple-selection, just like a native select element. Perhaps you look at the [`SelectHTMLAttributes` interface](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/eda212cfd64119cf2edc2f4ab12e53c4654a9b87/types/react/index.d.ts#L1979-L1990) from [`@types/react`](https://www.npmjs.com/package/@types/react)  for inspiration, and notice that a native select element, in React, can have a `value` of type `string | string[] | number`. From TypeScript’s perspective, you can pass a single value or an array of values indiscriminately, but you know that an array of values is really only meaningful if the `multiple` prop is set. Nonetheless, you try this approach for your component:

<!--@
name: select-1.tsx
-->
```ts
interface SelectProps {
  placeholder?: string;
  options: string[];
  multiple?: boolean;
  value: string | string[];
  onChange: (newValue: string | string[]) => void;
}

class Select extends React.Component<SelectProps> {
  // ...
}
```

The idea is that when `multiple` is `true`, the consumer should set `value` to an array and expect an array back as `newValue` in `onChange`. You’ll quickly realize that this looseness of your API allows for some invalid configurations and headaches for your consumers:

<!--@
name: select-1.tsx
-->
```tsx
// Value is an array, but it’s missing the `multiple`
// prop, but no compiler error
<Select
  options={['Red', 'Green', 'Blue']}
  value={['Red', 'Blue']}
  onChange={onChange}
/>

// Value should be an array, but no compiler error
<Select
  multiple
  options={['Red', 'Green', 'Blue']}
  value="Red"
  onChange={onChange}
/>

// Everything is right, but the compiler complains
// because technically `newValue` could be an array
<Select
  options={['Red', 'Green', 'Blue']}
  value="Red"
  onChange={newValue => {
    console.log(newValue.toLowerCase())
  }}
/>
```

Sure, you could add some validation in your runtime code, like fancy custom `propTypes` validators, but wouldn’t it be nice if TypeScript could infer the correct types based on the component’s usage? After all, a type system isn’t just for catching bugs early, it should also guide developers unfamiliar with your API _as they type_, surfacing correct patterns and hiding invalid ones—a developer experience that runtime validation can’t provide.

## Props Unions to the Rescue
Since you care deeply about developer experience, you decide to iterate on your initial API by applying what you know about union types to these props. It occurs to you that where you initially wrote _multiple unions_ within a _single interface_, your intent is actually better expressed by _one union_ of _multiple interfaces_:

<!--@
name: select-2.tsx
-->
```tsx
interface CommonSelectProps {
  placeholder?: string;
  options: string[];
}

interface SingleSelectProps extends CommonSelectProps {
  multiple?: false;
  value: string;
  onChange: (newValue: string) => void;
}

interface MultipleSelectProps extends CommonSelectProps {
  multiple: true;
  value: string[];
  onChange: (newValue: string[]) => void;
}

type SelectProps = SingleSelectProps | MultipleSelectProps;

class Select extends React.Component<SelectProps> {
  // ...
}
```

As triangles and quadrilaterals can be distinguished by their number of sides, the union type `SelectProps` can be discriminated by its `multiple` property. And as luck would have it, TypeScript will do exactly that when you pass (or don’t pass) the `multiple` prop to your new and improved component: [^1]

<!--@
name: select-2.tsx
-->
```tsx
// Compiler knows that `value` shouldn’t be an array
<Select
  options={['Red', 'Green', 'Blue']}
  value={['Red', 'Blue']}
  onChange={onChange}
/>

// Compiler knows that `value` should be an array
<Select
  multiple
  options={['Red', 'Green', 'Blue']}
  value="Red"
  onChange={onChange}
/>

// Compiler knows that `newValue` will be a string
<Select
  multiple={false}
  options={['Red', 'Green', 'Blue']}
  value="Red"
  onChange={newValue => {
    console.log(newValue.toLowerCase())
  }}
/>
```

Whoa, this is a bazillion times better! Nice work; consumers of your component will thank you for coaching them down the right path _before_ they run their code in a browser. 🎉

## Going Deeper with the Distributive Law of Sets
Time goes by. Your Select component was a big hit with the other developers who were using it. But then, the design team shows you specs for a Select component with _groups_ of options, with customizable titles for each group. You start prototyping the props you’ll have to add in your head:

```ts
type OptionGroup = {
  title: string;
  options: string[];
};

interface YourMentalModelOfChangesToSelectProps {
  grouped?: boolean;
  options: string[] | OptionGroup[];
  renderGroupTitle?: (group: OptionGroup) => React.ReactNode;
}
```

Does this feel familiar? You have two distinct subsets of functionality, manifested over multiple props, discriminated by a single prop. The value of  `grouped` controls the type of `options` and the validity of having a `renderGroupTitle` prop at all. You recognize that you could make these buckets of functionality a discriminated union of two separate interfaces, but how do you reconcile that with the API you already have, which is a discriminated union on `multiple`?

With two different choices to make (multiple and grouped), each with two options (true and false), there are four distinct options:

1. single selection, not grouped
2. multiple selection, not grouped
3. single selection, grouped
4. multiple selection, grouped.

Writing each of those options out as a complete interface of possible Select props and creating a union of all four isn’t unthinkably tedious, but the relationship is exponential: three boolean choices makes a union of $2^3 = 8$, four choices is 16, and so on. Rather sooner than later, it becomes unwieldy to express every combination of essentially unrelated choices explicitly.

You can avoid repeating yourself and writing out every combination by taking advantage of some set theory. Instead of writing four complete interfaces that repeat props from each other, you can write interfaces for each discrete piece of functionality and combine them via intersection:

<!--@
name: select-3.tsx
-->
```ts
interface CommonSelectProps {
  placeholder?: string;
}

interface SingleSelectPropsFragment {
  multiple: false;
  value: string;
  onChange: (newValue: string[]) => void;
}

interface MultipleSelectPropsFragment {
  multiple: true;
  value: string[];
  onChange: (newValue: string[]) => void;
}

interface UngroupedSelectPropsFragment {
  grouped?: false;
  options: string[];
}

type OptionGroup = {
  title: string;
  options: string[];
};

interface GroupedSelectPropsFragment {
  grouped: true;
  options: OptionGroup[];
  renderGroup: (group: OptionGroup) => React.ReactNode;
}

// All together now...
type SelectProps = CommonSelectProps &
  (SingleSelectPropsFragment | MultipleSelectPropsFragment) &
  (UngroupedSelectPropsFragment | GroupedSelectPropsFragment);

class Select extends React.Component<SelectProps> {
  // ...
}
```

Let’s break down what happened here:

1. For each constituent in the union, we removed its `extends` clause so the interface reflects only a discrete subset of functionality that can be intersected cleanly with anything else. (In this example, that’s not strictly necessary, but I think it’s cleaner, and I have an unverified theory that it’s less work for the compiler.[^2]) To reflect this change in our naming, we also suffixed each interface with `Fragment` to be clear that it’s not a complete working set of Select props.
2. We broke down grouped and non-grouped selects into two interfaces discriminated on `grouped`, just like we did before with `multiple`.
3. We combined everything together with an intersection of unions. In plain English, SelectProps is made up of:
	- `CommonSelectProps`, along with
	- either `SingleSelectPropsFragment` or `MultipleSelectPropsFragment`, along with
	- either `UngroupedSelectPropsFragment` or `GroupedSelectPropsFragment`.

The expression is evaluated according to set theory’s distributive law, which in a nutshell says that unions are like adding numbers and intersections are like multiplying numbers. In algebra, the distributive properties of multiplication and addition give us

$$
Z(A + B)(C + D) = ZAC + ZAD + ZBC + ZBD
$$

and set theory says the exact same thing about unions and intersections:

$$
Z \cap (A \cup B) \cap (C \cup D) = (Z \cap A \cap B) \cup (Z \cap A \cap D) \cup (Z \cap B \cap C) \cup (Z \cap B \cap D)
$$

If, like me, you haven’t studied computer science in an academic setting, this may look intimidatingly theoretical, but quickly make the following mental substitutions:

- Set theory’s union operator, $\cup$, is written as `|` in TypeScript
- Set theory’s intersection operator, $\cap$, is written as `&` in TypeScript[^3]
- Let $Z =$ `CommonSelectProps`
- Let $A =$ `SingleSelectPropsFragment`
- Let $B =$ `MultipleSelectPropsFragment`
- Let $C =$ `UngroupedSelectPropsFragment`
- Let $D =$ `GroupedSelectPropsFragment`


So, the resulting type of `SelectProps` expands to every possible combination that we outlined earlier. And TypeScript will discriminate between each of those four constituents based on the props you pass to `Select`[^3]:

<!--@
name: select-3.tsx
-->
```tsx
// `renderGroupTitle` doesn’t exist unless `grouped` is set
<Select
  options={['Red', 'Green', 'Blue']}
  value="Red"
  onChange={onChange}
  renderGroup={group => group.title}
/>

// Everything together, looking good 👍🏽
<Select
  grouped
  options={[{
    title: 'Colors',
    options: ['Red', 'Green', 'Blue']
  }]}
  multiple
  value={['Red']}
  renderGroup={group => group.title}
  onChange={newValue => {
    // `multiple` still works, `newValue` is an array
    newValue.forEach(value => {
      // ...
    });
  }}
/>
```

## Choosing the Right Tool for the Job
Discriminated unions can be a powerful tool for writing better React component typings, but it’s not always the only way or the best way to write safe and expressive APIs. Swapping between `string` and `string[]` in multiple type positions, like we did with `multiple`, could be done with generics.  But more poignantly, building a component with tons of unions could be a sign that the component is getting bloated and should be split into multiple components that can be composed via render props, higher order components, or any other means of component composition.

## Further Reading
- [Discriminated Unions · TypeScript Deep Dive](https://basarat.gitbooks.io/typescript/docs/types/discriminated-unions.html)
- [Tagged union - Wikipedia](https://en.wikipedia.org/wiki/Tagged_union)

[^1]:
  Interestingly, in the final case here, the explicit value `multiple={false}` is required not to pass type checking, but to get accurate inference on the argument to `onChange`. This seems like a limitation/bug to me.
[^2]:
  My hypothesis is that in calculating the intersection of _N_ types that all include common properties, the compiler must calculate for each of _n_ common properties of type _T_ that _T_ intersected with itself _N_ times is still _T_. This is surely not a computationally expensive code path, but unless there’s a clever short circuit early in the calculation,  it still has to happen _N ⨉ n_ times, all of which are unnecessary. This is purely unscientific speculation, and I would be happy for someone to correct or corroborate this theory.
[^3]:
  This statement applies only in the type declaration space. `|` and `&` are bitwise operators in the variable declaration space. E.g., `|` is the union operator in `var x: string | number` but the bitwise _or_ operator in `var x = 0xF0 | 0x0F`.
[^4]:
  TypeScript does successfully discriminate between these constituents, but type inference [is currently broken](https://github.com/Microsoft/TypeScript/issues/29340) for properties that have different function signatures in different constituents when any of those constituents are an intersection type.
