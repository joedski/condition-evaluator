
export default referents => {
	let referents = { ...referents };

	let defaultReferentDefinition = referents.default;
	delete referents.default;

	// NOTE: This supports only one default.
	let defaultReferentDefinitionType = Object.keys( defaultReferentDefinition )[ 0 ];

	let defaultReferent = {
		type: defaultReferentDefinitionType,
		selector: defaultReferentDefinition[ defaultReferentDefinitionType ],
	};

	let referentTypes = Object.keys( referents );

	return appContext => evalContext => {
		let { condition } = evalContext;
		let conditionReferentType = referents.find( refType => refType in evalContext );
		let conditionReferentParameter;
		let nextReferent;
		let prevReferent = {
			referent: evalContext.referent,
			referentType: evalContext.referentType
		};

		if( conditionReferentType ) {
			conditionReferentParameter = evalContext[ conditionReferentType ];
			nextReferent = {
				referent: referents[ conditionReferentType ]( appContext, conditionReferentParameter ),
				referentType: conditionReferentType
			};
		}
		else if( ! prevReferent.referent ) {
			nextReferent = {
				referent: defaultReferent.selector( appContext ),
				referentType: defaultReferent.type
			};
		}
		else {
			nextReferent = prevReferent;
		}

		// Lastly, delete all referent keys from the condition.
		let conditionWithoutRefs = referents.reduce(
			( context, refType ) => {
				delete context[ refType ];
				return context;
			},
			{ ...condition }
		);

		return {
			...evalContext,
			{ condition: conditionWithoutRefs },
			nextReferent
		};
	};
};
