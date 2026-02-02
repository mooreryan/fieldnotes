---
title: Fold
description: Talking about the fold function from Gleam's standard library.
sidebar:
  badge: Concept
publishDate: 2026-02-01
lastUpdated: 2026-02-01
---

"Fold" is a common pattern in functional-style programming. A `fold` function is used to process some data structure and produce some value as a result.

Depending on the language, `fold` might be called other things like `reduce` or `inject`. While they generally work in a similar way, sometimes a distinction is made between `fold` and `reduce`. For example, Gleam's [list.fold](https://hexdocs.pm/gleam_stdlib/gleam/list.html#fold) function takes an initial value for the initial state, whereas the [list.reduce](https://hexdocs.pm/gleam_stdlib/gleam/list.html#reduce) function uses the first item in the list as the initial state.

Let's take a look at the type signature of [list.fold](https://hexdocs.pm/gleam_stdlib/gleam/list.html#fold) from Gleam's standard library. Here is a slightly simplified version:

```gleam
fn fold(List(a), acc, fn(acc, a) -> acc) -> acc
```

It's a function of three arguments: a list, some value, and a function. In this signature, `a` and `acc` are type variables, which stand in for the specific types of the values passed in to the function.

These can stand in for any type of value, as long as those values don't break the rules or contract specified in the type signature. That is, every occurrence of `a` in the type signature must be filled in with values of the same type, and the same goes for `b`.

For example, let's fill in the type variables `a` and `acc`, say `String` for `a` and `Int` for `acc`. Then we could write:

```gleam
fn fold(List(String), Int, fn(Int, String) -> Int) -> Int
//           a        acc     acc  a          acc     acc
```

We could use a function with this type signature to get the total length of all strings in the input list.

```gleam
let total_length = fold(["apple", "pie"], 0, fn(acc, str) {
  acc + string.length(str)
})
```

Here, `["apple", "pie"]` is the source data (type `List(String)`), `0` is the initial value (type `Int`), and the `fun(acc, str) { ... }` is the folding function (or reducer, handler, accumulator, combining function, etc.)

Anyway, the version of `fold` that we specified with concrete types satisfies the original type signature that uses type variables. However, this next type signature would not, since it doesn't follow the rules specified by `fold`'s type signature.

```gleam
fn(List(String), Int, fn(Float, Bool) -> String -> Float)
```

If you're feeling brave, you can check out the Wikipedia entry for [fold](https://en.wikipedia.org/wiki/Fold_(higher-order_function). It does get a bit dense though.

## See Also

- [Generic Functions in Gleam](https://tour.gleam.run/functions/generic-functions/)
- The [tutorial](/gleam/event_driven_xml_parsing.md) on event-driven XML parsing in Gleam, which uses a `fold_signals` function similar to this one.
- The HaskellWiki entry for [Fold](https://wiki.haskell.org/index.php?title=Fold)
  - This one is pretty dense!
