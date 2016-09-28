
import Evaluate from 'condition-evaluator';
import Referents from 'condition-evaluator/providers/referents';
import * as basicPredicates from '../src/predicates';

import { page, currentPage } from '../selectors';
import * as predicates from './predicates';

export default Evaluate({
  ...basicPredicates,
  ...predicates
}, [
  Referents({
    default: { page: currentPage },
    page: page
  })
]);
