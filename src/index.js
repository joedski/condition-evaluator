
const evaluate = ( predicateMap, providers ) => appContext => condition => {
	let evaluateSub = prevEvalContext => condition => {
		prevEvalContext = { ...prevEvalContext, condition, evaluate: undefined };

		let evalContext = providers.reduce(
			( evalContext, provider ) => provider( appContext )( evalContext ),
			prevEvalContext
		);

		evalContext.evaluate = evaluateSub( evalContext );

		let results = evalPredicates( predicateMap, evalContext );

		// No predicates should return undefined rather than erroring.
		return results.slice( 1 ).reduce(
			( result, predResult ) => result && predResult,
			results[ 0 ]
		);
	};

	// create first context, then pass to evaluateSub.
	let initialContextLayer = { context: appContext };

	return evaluateSub( initialContextLayer )( condition );
}

const evalPredicates = ( predicateMap, evalContext ) => {
	let { condition } = evalContext;
	let predicatesOnCondition = Object.keys( condition );

	return predicatesOnCondition.map(
		predicateName =>
			predicateMap[ predicateName ]({
				...evalContext,
				parameter: condition[ parameter ]
			})
	);
}

export default evaluate;
