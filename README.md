Condition Evaluator
===================

An Evaluator for Simple Declarative Condition DSLs.  Load Conditions from a story or configuration file, specify the Predicates and Selectors in your App, and Evaluate.



Quick Example
-------------

> Note: Written in ES6.

```js
// app/condition/predicates.js

export const isVisited = ({ referent, parameter }) => {
  return referent.visited === parameter;
};
```

```js
// app/selectors/index.js

export const page = ( state, pageId ) => {
  return state.pages[ pageId ];
}

export const currentPage = ( state ) => {
  return page( state, state.interaction.currentPage );
}
```

```js
// app/condition/evaluate.js
import Evaluate from 'condition-evaluator';
import Referent from 'condition-evaluator/providers/referent';
import basicPredicates from 'condition-evaluator/predicates';

import { page, currentPage } from '../selectors';
import * as predicates from './predicates';

export default Evaluate({
  // adds `any`, `every`, and `not`.
  ...basicPredicates,
  // adds our app-specific predicates.
  ...predicates
}, [
  Referent({
    default: { page: currentPage },
    page: page
  })
]);
```

With the above, you can do this:

```js
import evalCondition from './condition/evaluate';
import store from './store'

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

let condition = {
  page: '3',
  isVisited: false
};

evalCondition( state, condition ) // => true!
```

### Another Amusing Predicate

```js
export const which = ({ parameter, evaluate }) => {
  let keys = Object.keys( parameter );
  return keys.find( key => evaluate( parameter[ key ] ) )
}
```

```js
import evaluate from './condition/evaluate';

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
