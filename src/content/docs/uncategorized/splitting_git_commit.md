---
title: Splitting a Git Commit with Interactive Rebase
description: How to split a up a git commit that is a few commits back using interactive rebase.
publishDate: 2026-07-20
lastUpdated: 2026-07-20
sidebar:
  label: Splitting a Git Commit
---

I like to make lots of little commits, and then reorganize them once a feature comes together.

Sometimes I make a mistake and accidentally include some files or changes in a commit that don't really fit in with the rest of the stuff in the commit. And often, I don't realize it until a few commits later.

This is a great use case for the git's [interactive rebase](https://git-scm.com/book/en/v2/Git-Tools-Rewriting-History).

Let's say that you have a commit is five commits back. We need to start the rebase six commits back so that the one we want to split (the fifth one) shows up in the list.

_Note: If you're feeling nervous, it can be a good idea to create a backup branch before starting the operation. That way, you can feel confident that even if you completely mess something up, you can always apply the backup._

Start the rebase:

```
git rebase -i HEAD~6
```

You should see some editor pop up or in the terminal. The commit you're looking for should be right near the top of the list.

In front of that commit, you should see `pick`. Change that to say `edit` instead, then save/exit the editor.

Now, we're in a position where we can edit things. We want to split up the commit into two. That is, take some of the files (or chunks) and put them in one commit, and put the others in another commit. So, unstage and uncommit the changes in the commit we're editing.

```
git reset HEAD~1
```

(That does a `mixed` reset by default.)

And now we can create the new commits. Stage the first files and commit:

```
git add a.txt b.txt
git commit -m 'First part of the changes'
```

Stage the second set of files and commit

```
git add c.txt d.txt
git commit -m 'Second part of the changes'
```

Cool! Now we can finish the rebase.

```
git rebase --continue
```

This will replay the remaining commits on top of the two new ones we just made.

By the way, if something goes horribly wrong, or you run into nasty conflicts, you can cancel and start over:

```
git rebase --abort
```
