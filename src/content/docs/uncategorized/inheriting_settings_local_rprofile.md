---
title: Inheriting Settings in Local R Project Profiles
description: If R finds a project-level settings file, it won't source the user-level settings file. Sometimes you need both of them.  This note shows you how to make sure that both files are sourced.
publishDate: 2026-07-21
lastUpdated: 2026-07-21
sidebar:
  label: Inheriting Settings in .Rprofile
---

Check it out. You're starting a beautiful new R package, and you've created an `.Rprofile` file local to that package. For example, you might want to turn off the R language server diagnostics, which can get a bit noisy, and give quite a lot of false positives, when you're working on a package.

`./.Rprofile`:

```r
options(
  languageserver.diagnostics = FALSE
)
```

Great! And now, you try to install your favorite package:

```
$ Rscript --vanilla -e 'install.packages("tictoc")'

Error in contrib.url(repos, "source") :
trying to use CRAN without setting a mirror
Calls: install.packages -> contrib.url
Execution halted
```

Hey, what gives!? I definitely told R which CRAN mirror to use. Look at this user-level R profile file here.

`~/.Rprofile`:

```r
options(
  repos = c(CRAN = "https://cloud.r-project.org/")
)
```

Oh, yes, R doesn't automatically merge the two `.Rprofile` files it finds. And it so happens that it first searches for a project-level config before searching the user-level one. (See the [Posit docs](https://docs.posit.co/ide/user/ide/guide/environments/r/managing-r.html#rprofile) for more info.)

Now, my real `~/.Rprofile` has some more stuff in it than just that one line, and I don't really want to have to paste it in to every R project that has some local config. Instead, we can check for the user-level `.Rprofile`, and if it exists, `source` it. Something like this:

```r
user_level_profile <- file.path(Sys.getenv("HOME"), ".Rprofile")

if (file.exists(user_level_profile)) {
  source(user_level_profile)
}
```

(By the way, it's a good idea to put that at the top of your project-local config. That way, you can override anything that you need to locally.)

Now, if you try to run the `Rscript` command again, everything will work out fine. (For fun, you can add some `cat` calls to the `~/.Rprofile` and `./.Rprofile` to see it in action.)

_Note: I believe that `Sys.getenv("HOME")` works on Windows, but I did not check that!_
