
const evaluate = ( predicateMap, providers = [] ) => appContext => {
	const providersInContext = providers.map( p => p( appContext ) );

	return condition => {
		let evaluateSub = prevEvalContext => condition => {
			prevEvalContext = { ...prevEvalContext, condition, evaluate: undefined };

			let evalContext = providersInContext.reduce(
				( evalContext, provider ) => provider( evalContext ),
				prevEvalContext
			);

			// Bind evaluateSub to context.evaluate so predicates can evaluate sub-conditions.
			evalContext.evaluate = evaluateSub( evalContext );

			let results = evalPredicates( predicateMap, evalContext );

			// Having no predicates should return undefined rather than erroring.
			return results.reduce(
				( result, predResult ) => result && predResult,
				true
			);
		};

		// create first context, then pass to evaluateSub.
		let initialContextLayer = { context: appContext };

		return evaluateSub( initialContextLayer )( condition );
	}
};

const evalPredicates = ( predicateMap, evalContext ) => {
	let { condition } = evalContext;
	let predicatesOnCondition = Object.keys( condition );

	return predicatesOnCondition.map(
		predicateName =>
			predicateMap[ predicateName ]({
				...evalContext,
				parameter: condition[ predicateName ],
			})
	);
}

export default evaluate;
