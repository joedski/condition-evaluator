Condition Evaluator
===================

An Evaluator for Simple Declarative Condition DSLs.

It was written with the intention to abstract the creation and use of conditions in serialized configuration files, such as story or slideshow descriptions.



API
-----

### Basic Use

#### ES6

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
var Evaluate = require( 'condition-evaluator' ).default;
var Referents = require( 'condition-evaluator/providers/referents' ).default;
var basicPredicates = require( 'condition-evaluator/predicates' );

var predicates = require( 'my-app/condition/predicates' );
var selectors = require( 'my-app/selectors' );

export default Evaluate( Object.assign(
  {},
  basicPredicates,
  predicates
), [
  Referents({
    default: { page: currentPage },
    page: page
  })
]);
```



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

import { page, currentPage } from '../selectors';
import * as predicates from './predicates';

const evaluate = Evaluate({
  // adds `any`, `every`, and `not`.
  ...basicPredicates,
  // adds our app-specific predicates.
  ...predicates
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

evalCondition( state, { page: 3, isVisited: false }) // => true!
evalCondition( state, { isVisited: false }) // => false!  page 2 .visited === true.
```

### Another Amusing Predicate

```js
const which = ({ parameter, evaluate }) => {
  let keys = Object.keys( parameter );
  return keys.find( key => evaluate( parameter[ key ] ) )
}

const evaluate = Evaluate({ which });

let state = {};

evaluate( state, {
  which: {
    "foo": { always: false },
    "bar": { always: true },
    "baz": { always: false },
  }
});
// => "bar"
```
