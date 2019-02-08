---
title: "Overengineering A Blog, Prologue: An Ode To Red Squigglies"
date: "2019-02-07"
template: PlainPost
---

It’s all about the red squigglies. Red squigglies in Microsoft products have been saving me from looking stupid since the second grade, and now they save me from writing stupid code on a minutely basis. Well, significantly less stupid code. You know the red squigglies I’m talking about? The red squigglies that tell you that no, it’s not spelled “bureauacracy,” and, more frequently for me lately, that object is possibly `undefined`.

And you _want_ the red squigglies. They might not feel like your friend in the moment, but you’d much rather them get on your case than drop the ball on you. Whenever I’m involved in an incident review at work, one of the things I look for is why red squigglies didn’t save us. If we wrote bad code, why are we catching it at runtime instead of at compile now? Ensuring red squigglies appear where they’re supposed to has consequential impact. It keeps App Center running.

I had been meaning to write my [first technical blog post](/expressive-react-component-apis-with-discriminated-unions) for a while, and I always figured that when I finally got around to writing it, I would publish it on Medium and be done with it. I had every intention of doing exactly that, until I thought about how I would explain the content to a colleague: red squigglies. You want to write React component APIs that make red squigglies appear when someone tries to use your component wrong. That’s the whole point. And by far the easiest way to explain that is to show, in a squigglies-enabled environment, broken code that doesn’t get caught.

So, this blog was born, not because I’m dedicated to blogging frequently, but because if I’m going to do it even once, I’m not going to write a whole post about how to get more red squigglies _without showing you the red squigglies_. Every code sample in this blog is interactive. You can hover identifiers to see their type information; you can hover incorrect code to see the compiler errors; you can even edit the samples and watch how those change. You can fix the broken code samples or break the working code samples. I learn best through hands-on experiences, and thought others might too.

I think it came out pretty cool, and I learned a ton while building it. This was also the first time I’ve _started_ a serious frontend web project from scratch in a couple years, so I got to catch up on all the new frontend fads the kids are talking about on Twitter these days. So, my next couple posts will be dedicated to how I built this, what I learned while building it, why I didn’t just use Monaco Editor or CodeMirror, and why I decided to compromise and make my squigglies straight lines.