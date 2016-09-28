
export default referents => {
	referents = { ...referents };

	let defaultReferentDefinition = referents.default;
	delete referents.default;

	let defaultReferentDefinitionType;
	let defaultReferent;

	if( defaultReferentDefinition ) {
		// NOTE: This supports only one default.
		defaultReferentDefinitionType = Object.keys( defaultReferentDefinition )[ 0 ];

		defaultReferent = {
			type: defaultReferentDefinitionType,
			selector: defaultReferentDefinition[ defaultReferentDefinitionType ],
		};
	}

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
			if( defaultReferent ) {
				nextReferent = {
					referent: defaultReferent.selector( appContext ),
					referentType: defaultReferent.type
				};
			}
			else {
				nextReferent = {};
			}
		}
		else {
			nextReferent = prevReferent;
		}

		// Lastly, delete all referent keys from the condition.
		let conditionWithoutRefs = referentTypes.reduce(
			( condition, refType ) => {
				delete condition[ refType ];
				return condition;
			},
			{ ...condition }
		);

		return {
			...evalContext,
			condition: conditionWithoutRefs,
			...nextReferent
		};
	};
};
