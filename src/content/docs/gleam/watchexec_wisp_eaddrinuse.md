---
title: Using watchexec with Wisp
description: How to set up a nice dev server like experience that restarts the Gleam Wisp server on code changes while avoiding the EADDRINUSE errors that may occur.
publishDate: 2026-02-06
lastUpdated: 2026-02-06
sidebar:
  label: Using watchexec with Wisp
---

[Wisp](https://hexdocs.pm/wisp/) is a web framework for [Gleam](https://gleam.run/).

There is no hot-reloading out of the box for Gleam or for Wisp. But, it's not a big deal, as you could use [watchexec](https://github.com/watchexec/watchexec) or [fswatch](https://github.com/emcrisostomo/fswatch) (or I'm sure other tools too) to set up some file watching. I've used both and they're both fine.

If you set a basic `watchexec` command like `watchexec --restart --watch src -- gleam run`, you will likely see some errors that look something like this, `Error! Failed to eval: abc@@main:run(abc)` and this, `{init_failed,<<"Failed to start socket listener: Eaddrinuse">>}`.

That error is `EADDRINUSE`. If you check out the linux [manpage](https://man7.org/linux/man-pages/man7/unix.7.html), you will see something like, "The specified local address is already in use or the filesystem socket object already exists."

Yes, so the `watchexec` isn't really giving the server process enough time to clean up properly. (At least, I _expect_ that's what's going on after doing some experimenting.)

So, add a `sleep 2` in front of the command that `watchexec` is to run:

```
watchexec \
 --debounce 500ms \
 --restart \
 --watch src \
 --watch test \
 --watch gleam.toml \
 -- 'sleep 2 && gleam run'
```

You might look at that and think: "Oh! That `sleep X && blah` pattern is no good, `watchexec` even has an option for it!" I did try that first, and for whatever reason, it wasn't working for me. Here are a couple things that I tried that didn't work:

- `--delay-run 2s`: According to the `watchexec` manpage, 'This is like using "sleep 5 && command" in a shell, but portable and slightly more efficient.'. However, it didn't work for me.
- Setting `--stop-timeout`: Didn't work, but I also didn't try to figure out why.

I think it may be possible to figure out what is going wrong with those two options by looking through the `watchexec` logs if you set the verbosity high enough.

Anyway, the above command works fine. You may need to play around with different combinations of debounce time and sleep seconds to really dial it in.
