
import test from 'ava';

import Evaluate from '../src';
import Referents from '../src/providers/referents';
import * as basicPredicates from '../src/predicates';

test.beforeEach( t => {
	let selectors = {
		page: ( state, pageId ) => state.pages[ pageId ],
		currentPage: state => selectors.page( state, state.interaction.currentPage ),
	};

	let predicates = {
		isVisited: ({ referent, parameter }) => referent.visited === parameter,
	};

	let referentsProvider = Referents({
		default: { page: selectors.currentPage },
		page: selectors.page,
	});

	let evaluate = Evaluate({
		...basicPredicates,
		...predicates
	}, [
		referentsProvider,
	]);

	t.context.selectors = selectors;
	t.context.predicates = predicates;
	t.context.referentsProvider = referentsProvider;
	t.context.evaluate = evaluate;
});



//////// Smoke Test

test( `instantiating an evaluator with referents should complete successfully`, t => {
	t.truthy( t.context.evaluate );
	t.pass();
});



//////// Referents Provider

test( `referents provider should not modify its args object`, t => {
	let { page, currentPage } = t.context.selectors;

	let referentsProviderArgs = {
		default: { page: currentPage },
		page: page,
	};

	let referentsProviderArgsPassedIn = { ...referentsProviderArgs };

	let referentsProvider = Referents( referentsProviderArgsPassedIn );

	t.deepEqual( referentsProviderArgs, referentsProviderArgsPassedIn,
		`the args passed in should be identical, no deletions` );
});

// TODO: We should also test that it's actually calling functions with the correct values.
test.todo( `referents provider should call the provided selectors with the expected values` );

test( `referents provider should, given a proper context, return proper results`, t => {
	let appContext = {
		pages: {
			'1': { id: '1', visited: true },
			'2': { id: '2', visited: true },
			'3': { id: '3', visited: false }
		},
		interaction: {
			currentPage: '2'
		}
	};

	let baseContextLayer = {
		context: appContext,
		condition: { page: '3', isVisited: true }
	};

	let expectedEnhacedContextLayer = {
		context: appContext,
		condition: { isVisited: true },
		referent: appContext.pages[ '3' ],
		referentType: 'page'
	};

	let { referentsProvider } = t.context;
	let calculatedEnhacedContextLayer = referentsProvider( appContext )( baseContextLayer );

	t.deepEqual( expectedEnhacedContextLayer, calculatedEnhacedContextLayer,
		`should yield an enhanced EvaluationContextLayer, having referent and referentType` );

	t.is( expectedEnhacedContextLayer.referent, calculatedEnhacedContextLayer.referent,
		`referent should refer to the object in memory (at least, with the existing selector)` );
});



//////// Evaluator

test( `(smoke test) evaluator should evaluate conditions properly`, t => {
	let appContext = {
		pages: {
			'1': { id: '1', visited: true },
			'2': { id: '2', visited: true },
			'3': { id: '3', visited: false }
		},
		interaction: {
			currentPage: '2'
		}
	};

	let evalCurrent = t.context.evaluate( appContext );

	t.true( evalCurrent({ page: '3', isVisited: false }),
		`in the provided state, page '3' is unvisited` );
	t.true( evalCurrent({ isVisited: true }),
		`in the provided state, the current page (page '2') is visited` );
	t.true( evalCurrent({
		isVisited: true,
		every: [
			{ page: '1', isVisited: true },
			{ page: '3', isVisited: false },
			{ isVisited: true },
		]
	}), `subconditions` );
});
