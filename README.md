Condition Evaluator
===================

An Evaluator for Simple Declarative Condition DSLs.

It was written with the intention to abstract the creation and use of conditions in serialized configuration files, such as story or slideshow descriptions.

In short, given this:

```json
{
  "isHoopyFrood": true,
  "isDeadForTaxReasons": false,
  "every": [
    { "page": "2a", "hasHipness": "hip" },
    { "page": "3b", "hasImprobability": "infinite" }
  ]
}
```

You only need to define the actual interesting meaningful parts: the testing functions `isHoopyFrood`, `isDeadForTaxReasons`, `hasHipness`, `hasImprobability`, and the selector function `page`.



API
-----

### Evaluator

`( PredicateMap, Array<EvaluationContextProvider> ) => AppContext => Condition => Result`

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

`EvaluationContextLayer => Result`

- EvaluationContextLayer: An Object with the following properties:
  - `context: AppContext` the context that you supplied to the Evaluator.
  - `condition: Condition` the current Condition under consideration.
    - It may be different from the one originally passed in if a EvaluationContextProvider modified it.
  - `evaluate: (Condition => Result)` evaluates a sub-condition.
  - `parameter: Any` the parameter for this Predicate specified in the Condition.

- If you use the Referents EvaluationContextProvider, you get two more props on the EvaluationContextLayer:
  - `referent?: Any` an object or value for use by your Predicates as additional context, usually pulled from provided AppContext.
  - `referentType?: string` the ReferentKey that was matched for this Referent.
  - Note: If you don't define a DefaultReferentSelector, you may end up with no referent conditions which do not specify one!  Sub-conditions still inherit the Referent of their parent-condition, though, at least if the parent has one.


### Referents and ReferentSelectors

Condition Evaluator comes with one EvaluationContextProvider: Referents, which has the following type:

`ReferentsConfig => EvaluationContextProvider`

- ReferentsConfig: `{ nameInContext?: string, default: DefaultReferentsMapping, selectors: ReferentsKeySelectorMap }`
  - nameInContext: The property name to assign to the context.  Default value is `refs`.
  - default: `DefaultReferentsMapping: { [ReferentKey: string]: DefaultReferentSelector }` A special key which provides a mapping to use in case there are no ReferentKeys on a Condition.
    - Usually, the ReferentKeys will be the same as some of the ReferentKeys in the ReferentsKeySelectorMap.
    - Omitting this means Conditions with no defined ReferentKeys will also have no Referents.
- ReferentsKeySelectorMap: `{ [ReferentKey: string]: ReferentSelector }` Object mapping keys on conditions to your Selectors.
- ReferentSelector: `( AppContext, ReferentSelectorParameter ) => Referent`
  - AppContext is the context you gave to the Evaluator.
  - ReferentSelectorParameter is the parameter value supplied on the Condition to that Key.
    - Example: `condition = { "page": "foo", "isVisited": true }`, if `page` is a ReferentKey, then the ReferentSelectorParameter here is `"foo"`.
- DefaultReferentSelector: `AppContext => Referent`
  - As DefaultReferentSelectors are used when there are no ReferentKeys on a Condition, they also don't have a parameter, instead receiving only the AppContext in which the Evaluator is operating.

The Referents EvaluationContextProvider removes any keys on a Condition which match one of its ReferentSelectors' keys, using any one it finds to select from the AppContext a concrete Referent.  Where a Condition does not have a key matching a ReferentSelector, and the DefaultReferentsMapping _does_ have one of those keys, the selector specified in the DefaultReferentsMapping will be used to select a concrete Referent from the AppContext.  If no DefaultReferentSelectors are provided, then Conditions without any Referent key will have no Referent!  Whether that's a bad thing or not depends on your use case.

Referents is exported as a Factory, so to get the actual EvaluationContextProvider that you give to Evaluator, you need to call the exported function with a parameter, in this case being the key-to-ReferentSelector mapping.




Basic Use
---------

### ES6

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

### ES5

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

Of course, for your Application to understand this, you'll need to write Predicates for `isVisited` and `isHoopyFrood`.  Maybe you even want slightly different behavior from the basic one for your `every` Predicate.  You'll also probably want to use the Referents EvaluationContextProvider, giving it ReferentSelectors for `page` and a default one which points to the Reader.



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
import Referent from 'condition-evaluator/providers/referent';
import * as basicPredicates from 'condition-evaluator/predicates';

import { page, currentPage } from '../selectors';
import * as predicates from './predicates';

const evaluate = Evaluate({
  // adds `any`, `every`, and `not`.
  ...basicPredicates,
  page, currentPage
}, [
  Referent({
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

evalCurrentCondition({ page: 3, isVisited: false }) // => true!
evalCurrentCondition({ isVisited: false }) // => false!  page 2 .visited === true.
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
