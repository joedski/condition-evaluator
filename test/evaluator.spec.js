
import test from 'ava';

import evaluator from '../src';
import Referents from '../src/providers/referents';
import * as basicPredicates from '../src/predicates';

test.beforeEach( t => {
	let selectors = {
		page: ( state, pageId ) => state.pages[ pageId ],
		currentPage: state => selectors.page( state, state.interaction.currentPage ),
	};

	let predicates = {
		isVisited: ({ refs, parameter }) => refs.page.visited === parameter,
	};

	let referentsProviderArgs = {
		defaults: {
			page: selectors.currentPage,
			// Provides an escape hatch to always have the current page available.
			// Some predicates may depend always on the current page, while
			// some may depend on whatever page is being talked about.
			// Which may very well still be the current page.
			currentPage: selectors.currentPage,
		},
		selectors: {
			page: selectors.page,
		},
	};

	let referentsProvider = Referents( referentsProviderArgs );

	let evaluate = evaluator({
		...basicPredicates,
		...predicates
	}, [
		referentsProvider,
	]);

	t.context.selectors = selectors;
	t.context.predicates = predicates;
	t.context.referentsProviderArgs = referentsProviderArgs;
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
	// let { page, currentPage } = t.context.selectors;
	let { referentsProviderArgs } = t.context;

	let referentsProviderArgsPassedIn = { ...referentsProviderArgs };
	Referents( referentsProviderArgsPassedIn );

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
		refs: {
			page: appContext.pages[ '3' ],
			currentPage: appContext.pages[ '2' ],
		},
	};

	let { referentsProvider } = t.context;
	let calculatedEnhacedContextLayer = referentsProvider( appContext )( baseContextLayer );

	t.deepEqual( expectedEnhacedContextLayer, calculatedEnhacedContextLayer,
		`should yield an enhanced EvaluationContextLayer, having referent and referentType` );

	t.is( expectedEnhacedContextLayer.refs.page, calculatedEnhacedContextLayer.refs.page,
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
	t.false( evalCurrent({ page: '3', isVisited: true }),
		`in the provided state, asking if page 3 is visited should return a negative result` );
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
