Story Conditions
================

A set of Predicates and Referent Selectors for a simple Story thinger.

`condition-evaluator` takes care of the boring parts of recursively evaluating conditions in the context of a given app state, leaving you to write the interesting things:
- Predicates, which are what actually determine whether a condition is fulfilled (true) or not (false).
- Selectors, which pull things out of your state.



Step by Step
------------


### Begin With the Data

First, we need to start with the data that describes our app's model.  In this example, we're building a simple story with a few pages in it, so we've got a few things here:
- Pages: Naturally, if we're going to have pages in our story, we'd better keep track of them.
  - For the sake of simplicity, we'll say that pages are stored by their page number, and that the reader goes through our pages in page order.
  - We also want to track if the reader has visited a particular page.  We're not going to worry about if they actually read anything, as that's incredibly hard to determine, we'll just stick with a flag indicating they visited a page.
- Where the Reader Currently Is: Presumably, the Reader doesn't want to just view the same page all the time, nor do we want them to see all pages at once as usually people only read one page at a time.  So, we'll also track what page the reader is currently on.

From this, we might make our model look something like this:

```json
{
  "pages": {
    "1": { "id": "1", "visited": false, "content": "A long journey begins." },
    "2": { "id": "2", "visited": false, "content": "Dramatic fight!" },
    "3": { "id": "3", "visited": false, "content": "The end." }
  },
  "interaction": {
    "currentPage": "2"
  }
}
```

Seems good enough for a short story with no chapters for now.  Next, we need to decide what Conditions we might have.


### Conditions

Here's a few things we might want to check while our app is running:
- Is the Reader currently on a certain page?
- Is the Reader currently past a certain page?
- Has the Reader visited the current page?
- Has the Reader visited a particular page?
- Has the Reader visited any page after a particular page?

Nothing complicated.  `condition-evaluator` is made to work with conditions that are made out of plain objects, though.  Usually JSON or YAML is a good way to represent them.  Since we're already working in JavaScript, let's see one way we might turn each of these conditions into JSON.

> Personal asside, I recommend writing the conditions in such a way that they make sense in English (or your native language if you're not writing them in English...) when you look at them and say "If..." followed by the condition.  These examples hopefully follow this recommendation.

#### Is the Reader on a Page...?

First let's look at these two:
- Is the Reader currently on a certain page?
- Is the Reader currently past a certain page?

For the first one, we might start by writing something like this:

```json
{ "currentPageIs": "2" }
```

Which hopefully we can come back to later and understand as "If current page is (page) '2'...".  The second then will look pretty similar.

```json
{ "currentPageIsPastPage": "2" }
```

Which should be readable as "If current page is past page '2'...".  So far so good.

#### Has the Reader Visited...?

Next let's look at those other three:
- Has the Reader visited the current page?
- Has the Reader visited a particular page?
- Has the Reader visited any page after a particular page?

First should be simple enough, though naturally we'll restate it as "If the Reader has visited the current page...".  Granted, no one else is going to be here reading unless we feel like including shoulder surfers.  Maybe in a future version... For now, we'll just leave out the "reader" part.

```json
{ "hasVisitedCurrentPage": true }
```

Okay, so that's slightly different from the other conditions.  Instead of a page number or page id, we get a boolean.  Well, it's easy enough to check if they have _not_ visited the current page, too, then, so there's that.

How about checking if they've visited a different page?

```json
{ "hasVisitedPage": "2" }
```

That looks good, except it's different from the "current page" one.  We can't just flip it, we'd need a separate "hasNotVisitedPage" condition, or else some sort of "not" condition.  Well, it'll work for now.  Let's move on to the last one, writing it more or less like the others.

```json
{ "hasVisitedAnyPageAfterPage": "2" }
```

Looks like this one uses a page number, too.  Hmm.  Well, come back to that one later, too.  We've got what we want our conditions to look like, let's actually write code for them.


### Predicates

A Predicate is just a function that takes some values and returns true or false (or yes or no depending on your programming language).  Our Conditions should be true or false, depending on if their various bits are true or false.  Those bits are the Predicates.

More exactly, in the Conditions we wrote out above we had one Predicate in each one.  How do we actually write our Predicates, though?

As I said just above, a Predicate just takes values and returns a true or false, a boolean.  In the case of `condition-evaluator` in particular, one of those values is named `context`, which is usually the current state of our app.  Predicates also receive a value named `parameter` which is the value their name points to in the Condition.

That is, for `{ "hasVisitedPage": "2" }`, the name of the Predicate is `hasVisitedPage` while the `parameter` is `"2"`.

When writing for `condition-evaluator` our Predicate may look something like this in ES6:

```js
function hasVisitedPage({ context, parameter }) {
  return context.pages[ parameter ].visited;
}
```

ES5:

```js
function hasVisitedPage( predicateParams ) {
  var context = predicateParams.context;
  var parameter = predicateParams.parameter;
  return context.pages[ parameter ].visited;
}
```

Remember that the Context will be the current state of our little story app here.
