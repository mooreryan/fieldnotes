---
title: Event-Driven XML Parsing in Gleam
description: A tutorial for event-driven (SAX) parsing of XML files in Gleam using the xmlm package, targeted to beginners.
publishDate: 2026-01-30
lastUpdated: 2026-01-30
sidebar:
  badge: Tutorial
  label: Event-Driven XML Parsing
tableOfContents:
  maxHeadingLevel: 4
---

:::note

This guide is still incomplete! Here is how it's going so far:

- [x] Handling different signals in a signal stream
- [ ] Tracking depth of the cursor within the XML tree
- [ ] Some more realistic parsing examples

:::

In this tutorial, we will take a look at parsing XML files in in [Gleam](https://gleam.run/) using the [xmlm](https://hexdocs.pm/xmlm/) package. `xmlm` provides an API to do pull-based XML parsing. That is, your application is in charge of moving the cursor forward when you need it. You might see this called [StAX](https://en.wikipedia.org/wiki/StAX) (Streaming API for XML). However, I think it can sometimes be simpler to use a push-based style of parsing instead, often known as [SAX](https://en.wikipedia.org/wiki/Simple_API_for_XML) (Simple API for XML).

Regardless of whether the parsing is push- or pull-based, it is event-driven. Rather than building a Document Object Model (DOM), so that you can work on the whole XML tree at once, a event-driven XML parser works on each piece of the XML document in order, making a single pass through the input stream.

There are a couple of ways use `xmlm` as a push-based parser. For most of the examples, let's use the [fold_signals](https://hexdocs.pm/xmlm/xmlm.html#fold_signals) function. This function is pretty convenient, as it will take care of "pushing" each of the signals in the input to the handler or accumulator function. Let's see it in action!

:::note
This tutorial doesn't assume you know too much about Gleam or about event-driven XML parsing. It's aimed at beginners to both, and so it will move pretty slowly and methodically, and teach some Gleam concepts along with the XML parsing. If you are an experienced Gleamlin, you may want to skip the tutorial and go straight to the code, which can be found on [GitHub](https://github.com/mooreryan/gleam_xmlm/tree/main/test/sax_parsing_guide).
:::

## Handling Signals in an Event Stream

Using a push-based SAX-style approach to parsing XML is all about handling the signals (or events) emitted by the parser, and tracking some data while doing so. For example, you will need to consider what to do when you see the start of a new element, or its data, or the end of an element. Additionally, you will need to decide what data to "carry along" as you progress through the stream. (For these first examples, we will be really explicit about planning this out.)

To get started, we will work through some simple examples showing how to count some stuff in XML documents, like total signals, total elements, and the number of specific elements present in a document. These examples will help you learn how to handle signals from an event stream.

But first, a note on terminology.

- We use [Signal](https://hexdocs.pm/xmlm/xmlm.html#Signal) as the name of an event in the stream of events that represent the XML document.
- Sometimes I will say event-driven, sometimes I might say event-based. (Earlier versions of this doc used event-based, so you may still see it if I miss it somewhere.)

:::caution[WIP]{icon="seti:todo"}
Maybe this is a good place to discuss document "well-formedness"?
:::

### Count Signals

Let's start by counting the total number of signals present in an XML document. This will be a good starting point for thinking about how to do event-driven XML parsing.

First, let's think about what we need to do with different types of signals. Do we need to differentiate between different types of signals? No, we can treat them all the same, since we only care about tracking how many we have seen in the document.

Next, what kind of data do we need to keep track of as we progress through the signal stream? (In other words, what state do we need to track)? In this case, the data we need to track is the number of signals that we have seen up until that point.

We are going to use the [fold_signals](https://hexdocs.pm/xmlm/xmlm.html#fold_signals) function to manage looping through all the signals of the document. It's type signature looks like this:

```gleam
fn(Input, acc, fn(acc, Signal) -> acc) -> Result(#(acc, Input), InputError)
```

:::note
If you're new to Gleam (or to any typed language really) getting used to reading type signatures can feel like a bit of a hurdle. If the above signature looks unfamiliar to you, take a little diversion to check out [this page](/gleam/fold.md) breaking down the fold function from Gleam's stdlib.
:::

If you squint, it's pretty similar to Gleam's [list.fold](https://hexdocs.pm/gleam_stdlib/gleam/list.html#fold) function: you have the source data (`Input`), an accumulated value (`acc`), and an accumulator/reducer/handler function (`fn(acc, Signal) -> acc`).

The first argument to `fold_signals` is a value of type [Input](https://hexdocs.pm/xmlm/xmlm.html#Input), which is the type used by `xmlm` to represent "input" abstractions for XML documents.

:::tip
Do you see how `Input` type name starts with a capital letter? That's how you know it represents a concrete type, as opposed to a type variable, which would start with a lower case letter. And speaking of type variables...
:::

The second argument represents the accumulated value (or state) that we want to track as we progress through the signals. The type of this argument is represented by the type variable called `acc`. Because it is a type variable rather than a concrete type, we won't know what the type might be just from looking at the signature. Instead, it's a stand in for the specific type of value being used at the time. What types of values can `acc` stand in for? Well, anything really, as long as it follows the rules of the type signature.

:::tip
The Gleam Language Tour has a [section](https://tour.gleam.run/functions/generic-functions/) that discusses type variables if you want to learn more about them.

Also, there is some more discussion about type variables on the page talking about [fold](/gleam/fold.md) functions.
:::

The return value is a little bit obscure. Because Gleam doesn't allow mutation of values, `fold_signals` needs to return an "updated" input back to the caller[^1]. Let's break it down a bit:

```gleam
Result(#(acc, Input), InputError)
```

- The return value is a [Result](https://hexdocs.pm/gleam_stdlib/gleam/result.html).
- The `Ok` value is a tuple: `#(acc, Input)`
  - The first value of the tuple is the accumulated value (`acc`)
  - The second value is the `Input` abstraction, whose internal state accounts for the actions taken by `xmlm` in the `fold_signals` function. (Because `fold_signals` processes signals to the end of the stream, it is likely you may not use this part of the return value.)
- The `Error` value is [InputError](https://hexdocs.pm/xmlm/xmlm.html#InputError), which is the type `xmlm` uses to represent errors that can occur in any "inputting" functions.[^2]

You could imagine dealing with that result value something like this:

```gleam
case xmlm.fold_signals(...) {
  Ok(#(value, _input)) -> Ok(value)
  Error(_) -> ...
}
```

Now that we have gone through the type signature, and the process of thinking about handling signals and what state we need to track, we're ready to sketch out an implementation:

```gleam
fn count_signals(input: Input) -> Result(Int, InputError) {
  let handle_signal = todo

  // We start by seeing 0 signals, so that's the initial value for our
  // the state.
  let result = xmlm.fold_signals(input, 0, handle_signal)

  case result {
    // If there were no parsing errors, return just the count.
    Ok(#(count, _input)) -> Ok(count)

    // If there was some parsing error, return it.
    Error(error) -> Error(error)
  }
}
```

This code is mostly straightforward. We set up a function to handle the signals, we call `fold_signals` using `0` for the initial state, since we haven't yet counted any signals, and at the end we return the count if everything went okay.

Now let's fill in the `todo`. The handler function in a [fold](/gleam/fold.md) will take the current state, the current signal, and return the updated state. In this case, the state is the current signal count. Here it is:

```gleam
  let handle_signal = fn(count, signal) {
    case signal {
      // Whatever the signal may be, increment the count.
      _ -> count + 1
    }
  }
```

Not much to going on here! Since we want to count literally every signal in the input, whatever signal we encounter, simply return the incremented count.

#### Code Listing

With that out of the way, let's check out the full code for this example:

```gleam
fn count_signals(input: Input) -> Result(Int, InputError) {
  let handle_signal = fn(count, signal) {
    case signal {
      _ -> count + 1
    }
  }

  let result = xmlm.fold_signals(input, 0, handle_signal)

  case result {
    Ok(#(count, _input)) -> Ok(count)
    Error(error) -> Error(error)
  }
}
```

#### Manually Counting Signals

Let's take a minute to look at an example XML document and count the signals.

Take a look at this xml data:

```xml
<Books>
  <Book>
    The Gleam Programming Language
  </Book>
</Books>
```

The type for signals in `xmlm` looks like this:

```gleam
pub type Signal {
  Dtd(Option(String))
  ElementStart(Tag)
  ElementEnd
  Data(String)
}
```

That is the, optional document type definition (DTD), element start (like `<Book>`), element end (like `</Book>`), and data associated with an element (e.g., the data of the element `<Book>The Gleam Programming Language</Book>`, would be `"The Gleam Programming Language"`).

Okay cool. So how many signals do you think there would be?

```xml
<Books>                              -- 1st signal (ElementStart)
  <Book>                             -- 2nd signal (ElementStart)
    The Gleam Programming Language   -- 3rd signal (Data)
  </Book>                            -- 4th signal (ElementEnd)
</Books>                             -- 5th signal (ElementEnd)
```

Looks like five right? Since I'm making sort of a big deal about this, you can probably guess the answer is not five....

In `xmlm`, if you start processing an `Input` from the beginning, the first signal will always be `Dtd`. Because DTDs are optional, the above XML doc would have a first signal of `Dtd(None)`. So really, the counting is like this:

```xml
                                     -- 0th signal (Dtd(None))
<Books>                              -- 1st signal (ElementStart)
  <Book>                             -- 2nd signal (ElementStart)
    The Gleam Programming Language   -- 3rd signal (Data)
  </Book>                            -- 4th signal (ElementEnd)
</Books>                             -- 5th signal (ElementEnd)
```

So that's six signals! The fact that `Dtd` will be the first signal when starting at the beginning of an XML doc can be a bit of a gotcha. It's something to keep in mind when using `xmlm`!

#### Summary

In this example, we went over the basics of event-driven (SAX) parsing, and used `xmlm.fold_signals` to "push" the signals to a handler function, which incremented a count for every signal encountered.

### Count Elements

In the previous example (count signals), our handler function was very simple: it did not even need to differentiate between signals!

Let's extend that example a bit. This time, our task is to count the number of elements in the XML document. An element consists of a start tag, and end tag, and the "stuff" between them, whether that is plain data or other nested elements.

Similar to the last example, let's think about two important things before writing any code: what we need to do with the stream of signals that are pushed to the handler function, and what sort of state we need to track along the way.

In order to count the number of elements in the document, we can simply count the number of element start signals we receive. That means that we need to know whether a signal is an `ElementStart`. The other signals we can ignore.

For state, it's just as simple as the last example. We need to track the number of element start signals we see, and for that, we can use a single `Int`.

Finally, we will use `xmlm.fold_signals` again to manage the signal stream for us.

Let's sketch out the implementation:

```gleam
fn count_elements(input: Input) -> Result(Int, InputError) {
  let handle_signal = fn(count, signal) {
    case signal {
      _ -> todo
    }
  }

  let result = xmlm.fold_signals(input, 0, handle_signal)

  case result {
    Ok(#(count, _input)) -> Ok(count)
    Error(error) -> Error(error)
  }
}
```

It looks very similar to the last example! All we need to do is to fill in the `case` expression there. Earlier we said that we need to increment the count whenever we see an element start, and return the count unchanged for any other signal:

```gleam
case signal {
  ElementStart(_) -> count + 1
  _ -> count
}
```

#### Code Listing

Great! Here is the full code listing with some comments:

```gleam
fn count_elements(input: Input) -> Result(Int, InputError) {
  // This function is called for every signal in the input.
  // It counts the number of ElementStart signals.
  let handle_signal = fn(count, signal) {
    case signal {
      ElementStart(_) -> count + 1
      _ -> count
    }
  }

  // - Zero is the count before we start handling signals.
  // - `fold_signals` manages the signal stream so that we don't have to do
  //   it manually.
  let result = xmlm.fold_signals(input, 0, handle_signal)

  // We only care about returning the count to the caller.
  case result {
    Ok(#(count, _input)) -> Ok(count)

    // Return any InputErrors, which occur when something unexpected happens
    // during parsing, to the caller.
    Error(error) -> Error(error)
  }
}
```

#### Summary

In this example, we saw how to make decisions based on the type of signal received by the handler function.

### Count Specific Elements

Let's keep going with these "counting stuff" examples. This time we need an actual XML doc to look at. Here's one:

```xml
<Bookstore>
  <Book>
    <Title>The Gleam Programming Language</Title>
  </Book>
  <Book>
    <Title>Gleam in Action</Title>
  </Book>
</Bookstore>
```

For this example, we're going to count the number of books in the bookstore. Like the previous examples, we start by thinking about what we need to do with the signals and what state to track. It's a "counting" problem again, so we will need to track when we see element start signals, but this time we will also need to make sure we are only counting the ones with the name `Book`. As for the state, it's again a single `Int` to track the running count of book elements.

Here is the outline of the code:

```gleam
fn count_books(input: Input) -> Result(Int, InputError) {
  let handle_signal = fn(book_count: Int, signal: Signal) {
    case signal {
      _ -> todo
    }
  }

  let result = xmlm.fold_signals(input, 0, handle_signal)

  case result {
    Ok(#(book_count, _input)) -> Ok(book_count)
    Error(error) -> Error(error)
  }
}
```

Is this starting to feel a bit repetitive? That's good, it means it is starting to sink in!

Let's start with the `case` expression from the previous example and adapt it to our new requirements:

```gleam
case signal {
  ElementStart(tag) -> count + 1
  _ -> count
}
```

It's not quite correct, since we only want to count the `Book` elements in the document. To do that we need to be more specific with the pattern matching to take into account the name of the element. If you check out the type definition for `Signal`, you will see something like this:

```gleam
pub type Signal {
  ElementStart(Tag)
  // ... other types ...
}
```

That is, an `ElementStart` has a `Tag` payload. In `xmlm` a [Tag](https://hexdocs.pm/xmlm/xmlm.html#Tag) contains the name and attributes of the element's starting tag:

```gleam
/// The type for an element tag.
///
pub type Tag {
  Tag(
    /// Name of the tag
    ///
    name: Name,
    /// Attribute list of the tag
    ///
    attributes: List(Attribute),
  )
}
```

One more level down, we see [Name](https://hexdocs.pm/xmlm/xmlm.html#Name), which looks something like this:

```gleam
pub type Name {
  Name(
    uri: String,
    local: String,
  )
}
```

We won't go into specifics about the `uri` and `local` parts of a name, but in this example `"Book"` is the local name of the start tag `<Book>`. That's all we need to know about that for this example.

Okay, so those are the types. which is a bit of a mouthful to type, but Gleam has a really great code-action to [pattern match on a variable](https://gleam.run/language-server/#Pattern-match). We can use this code-action to handle the pattern matching, and make sure we don't mess up the types at the same time. Here is the starting code again:

```gleam
case signal {
  ElementStart(tag) -> count + 1
  _ -> count
}
```

Hover of the variable `tag`, and activate the code action, and you'll get something like this:

```gleam
case signal {
  ElementStart(Tag(name:, attributes:)) -> count + 1
  _ -> count
}
```

Now, we care about the name, but not the attributes, so adjust the output a bit:

```gleam
case signal {
  ElementStart(Tag(name:, attributes: _)) -> count + 1
  _ -> count
}
```

The `attributes: _` says something like, "whatever the attributes are, I don't care, anything will match". Let's use the code action again to pattern match on the `name` variable. Hover over `name:` and run the code action to get something like this:

```gleam
case signal {
  ElementStart(Tag(name: Name(uri:, local:), attributes: _)) -> count + 1
  _ -> count
}
```

Isn't that neat?

Finally, we care about matching tags whose local name is `"Book"`, so adjust the pattern once more.

```gleam
case signal {
  ElementStart(Tag(name: Name(uri:, local: "Book"), attributes: _)) -> count + 1
  _ -> count
}
```

#### Code Listing

And with that, we're pretty much done! Just need to slot that expression into our boilerplate:

```gleam
fn count_books(input: Input) -> Result(Int, InputError) {
  let handle_signal = fn(book_count: Int, signal: Signal) {
    case signal {
      ElementStart(Tag(name: Name(local: "Book", uri: _), attributes: _)) ->
        book_count + 1
      _ -> book_count
    }
  }

  let result = xmlm.fold_signals(input, 0, handle_signal)

  case result {
    Ok(#(book_count, _input)) -> Ok(book_count)
    Error(error) -> Error(error)
  }
}
```

#### Summary

We expanded on the previous examples by only counting certain elements in the document. This required learning about how `xmlm` encodes data in the signals, namely, using the [Tag](https://hexdocs.pm/xmlm/xmlm.html#Tag) and [Name](https://hexdocs.pm/xmlm/xmlm.html#Name) types.

## Tracking Depth in an XML Tree

Now that we've covered basic signal stream handling, let's move on to examples requiring more careful state management. In the following examples, we'll need to track the depth of the cursor for each signal within the XML tree.

:::caution[WIP]{icon="seti:todo"}
This section is still a work in progress!
:::

---

[^1]: You may argue that returning the input back to the caller in `fold_signals` isn't really necessary. Since the point of the function is to loop through all the signals, you probably won't be using the updated input returned by this function. While that is true, I was going for uniformity of API in `xmlm`: all functions return the input. It does make the API more complicated, so in a future version, there's a good chance this will change.

[^2]: This type is opaque, meaning that you don't have access to its internals. However, I think making the error type opaque may have been a mistake to do, so a future version of xmlm might change this.
