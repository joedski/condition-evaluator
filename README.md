Condition Evaluator
===================

An Evaluator for Simple Declarative Condition DSLs.

It was written with the intention to abstract the creation and use of conditions in serialized configuration files, such as story or slideshow descriptions.



API
-----

### Evaluator

> `( PredicateMap, Array<EvaluationContextProvider> ) => AppContext => Condition => Result`

Creates the condition evaluator using the supplied PredicateMap and EvaluationContextProviders.

> Note: Given the above definition, the proper way to apply a context and a condition is `evaluator( someAppContext )( condition )`.

- PredicateMap: `{ [PredicateName: string]: Predicate }`
  - An object which maps the PredicateNames that will appear on Conditions to actual Predicate implementations.
  - Predicate: `EvaluationContextLayer => Result`
    - A function which takes a context and returns a result.  Many times that Result is a boolean value, but it does not need to be.
- EvaluationContextProvider: `AppContext => BaseEvaluationContextLayer => BaseEvaluationContextLayer`
  - A function which creates an enhanced BaseEvaluationContextLayer from an unenhanced one by providing some meaningful extra props on that Layer.
- AppContext can be anything, and is usually a state tree from your app.
- Condition is an object which describes some sort of condition someone wants to test.


### Predicate

> TODO: Finish this part


### Referents and ReferentSelectors

> TODO: Finish this part


### Basic Use

#### ES6

> If you're unfamiliar with ES6 and ES2015 features, pore through the excellent [Learn ES2015 on Babel's Site](https://babeljs.io/docs/learn-es2015/).

```js
import Evaluate from 'condition-evaluator';
import Referents from 'condition-evaluator/providers/referents';
import * as basicPredicates from 'condition-evaluator/predicates';

import * as predicates from 'my-app/condition/predicates';
import { page, currentPage } from 'my-app/selectors';

export default Evaluate({
  ...basicPredicates,
  ...predicates
}, [
  Referents({
    default: { page: currentPage },
    page: page
  })
]);
```

#### ES5

```js
// Dealing with importing transpiled es6 default exports into an es5 environment.
var Evaluate = require( 'condition-evaluator' ).default;
var Referents = require( 'condition-evaluator/providers/referents' ).default;
var basicPredicates = require( 'condition-evaluator/predicates' );

var predicates = require( 'my-app/condition/predicates' );
var selectors = require( 'my-app/selectors' );

module.exports = Evaluate( Object.assign(
  {},
  basicPredicates,
  predicates
), [
  Referents({
    default: { page: selectors.currentPage },
    page: selectors.page
  })
]);
```


Conditions
----------

The Conditions read by this Evaluator are simple and easily written in either JSON or Yaml.  They simply consist of keys which name Predicates, and values which are parameters to those Predicates.  Each Predicate can only accept one parameter, though that parameter could be an array or another object (map) or anything else.

Even an empty object is a Condition, though one which always returns `undefined`.

Suppose you needed somewhere else in a story to check if the reader has visited a certain page, and whether or not they're a hoopy frood.  You might write something like this:

```json
{ "every": [
  { "page": 254, "isVisited": true },
  { "isHoopyFrood": true }
]}
```

```yaml
every:
  - page: 254
    isVisited: yes
  - isHoopyFrood: yes
```

And these read, more or less "Every of (page 254 is visited; [reader] is a hoopy frood) is true".

Of course, for your Application to understand this, you'll need to write Predicates for `isVisited` and `isHoopyFrood`.  You'll also probably want to use the Referents EvaluationContextProvider, giving it ReferentSelectors for `page` and a default one which points to the Reader.



Legacy Environment Use
----------------------

The following need polyfills or shims:
- Object.assign
- Object.keys
- Array.isArray
- Array.prototype.some
- Array.prototype.every
- Array.prototype.find
- Array.prototype.slice
- Array.prototype.reduce



Quick Example
-------------

> Note: Written in ES6.

```js
//////// Predicates

const isVisited = ({ referent, parameter }) => {
  return referent.visited === parameter;
};

//////// Selectors

const page = ( state, pageId ) => {
  return state.pages[ pageId ];
}

const currentPage = ( state ) => {
  return page( state, state.interaction.currentPage );
}

//////// Our Evaluator

import Evaluate from 'condition-evaluator';
import Referents from 'condition-evaluator/providers/referents';
import * as basicPredicates from 'condition-evaluator/predicates';

const evaluate = Evaluate({
  // adds `any`, `every`, and `not`.
  ...basicPredicates,
  page, currentPage
}, [
  Referents({
    default: { page: currentPage },
    page: page
  })
]);

//////// Trial Run

let state = {
  pages: {
    '1': { visited: true },
    '2': { visited: true },
    '3': { visited: false }
  },
  interaction: {
    currentPage: '2'
  }
};

let evalCurrentCondition = evalCondition( state );

evalCurrentCondition( { page: 3, isVisited: false }) // => true!
evalCurrentCondition( { isVisited: false }) // => false!  page 2 .visited === true.
```

### Another Amusing Predicate

```js
const which = ({ parameter, evaluate }) => {
  let keys = Object.keys( parameter );
  return keys.find( key => evaluate( parameter[ key ] ) )
}

const evaluate = Evaluate({ ...basicPredicates, which });

let state = {};

evaluate( state )({
  which: {
    "good": { always: false },
    "okay": { always: true },
    "bad": { always: false },
  }
});
// => "okay"
```
