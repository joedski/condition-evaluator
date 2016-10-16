
import Evaluate from 'condition-evaluator';
import Referent from 'condition-evaluator/providers/referent';
import * as basicPredicates from '../src/predicates';

import { page, currentPage } from '../selectors';
import * as predicates from './predicates';

export default Evaluate({
  ...basicPredicates,
  ...predicates
}, [
  Referent({
    default: { page: currentPage },
    page: page
  })
]);
