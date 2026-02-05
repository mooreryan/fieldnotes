---
title: Gleam Field Notes
description: Notes on the Gleam programming language
publishDate: 2026-02-01
lastUpdated: 2026-02-01
sidebar:
  order: 0
  label: Index
---

Gleam is a strongly typed, functional language that compiles to Erlang and JavaScript.

I would consider it to be part of the [ML-family](<https://en.wikipedia.org/wiki/ML_(programming_language)>) of languages. If you know [OCaml](https://ocaml.org/), you will probably be able to learn the basics of Gleam quite quickly, though, you will likely want to study up on [OTP](https://www.erlang.org/doc/system/design_principles.html) if you want to really take advantage of its actor-based concurrency system.[^1]

## Tutorials

- [Event-Driven XML Parsing](/gleam/event_driven_xml_parsing.md)

## Concepts

- [Fold](/gleam/fold.md)

---

[^1]: I really enjoyed the book _Elixir in Action_ by Saša Jurić for this, at least for Elixir (I'm still trying to work out OTP in Gleam). I have also heard good things about _Designing for Scalability with Erlang/OTP_ by Francesco Cesarini and Steve Vinoski, but I have not read that one yet.
