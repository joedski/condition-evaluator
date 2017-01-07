// @flow

// TODO: Get actual types for these...
type BaseEvaluationContextLayer = any;
type AppContext = any;
type EvaluationContextProvider =
	( appContext: AppContext ) =>
	( evaulationContextLayer: BaseEvaluationContextLayer ) =>
		BaseEvaluationContextLayer
		;

// TODO: These could probably use some refinement...
// Maybe I should just mark them as `any` and let ESLint flag them?
export type DefaultReferentSelector = ( appContext: mixed ) => mixed;
export type ReferentSelector = ( appContext: mixed, parameter: mixed ) => mixed;

export type DefaultReferentsMapping = { [referentKey: string]: DefaultReferentSelector };
export type ReferentsKeySelectorMap = { [referentKey: string]: ReferentSelector };

export type ReferentsConfig = {
	nameInContext?: string,
	defaults: DefaultReferentsMapping,
	selectors: ReferentsKeySelectorMap,
};


export const defaultConfig = {
	nameInContext: 'refs',
};


/**
 * Creates an EvaluationContextProvider which converts certain Condition Properties into Referents.
 * This provides a way to access parts of the app state within your Predicates, which would otherwise
 * be rather boring or else have to reach for state in a variety of messy ways.
 * @param  {ReferentsConfig} _config
 *         The configuration for the created Referents EvaluationContextProvider.
 * @param  {[string=refs]} nameInContext
 *         The property name used to attach the generated referents to the enhannced EvaluatioContextLayer.
 * @param  {{[referentKey: string]: ( appContext: mixed ) => mixed}} defaults
 *         Default referent selectors to always add to the referents generated.
 *         They will be added to every EvaluationContextLayer regardless of whether the
 *         Condition in that Layer has any Referent Keys on it or not.
 *         However, adding a Referent Key to a Condition will override the value selected
 *         by the Default Selector.
 * @param  {{[referentKey: string]: ( appContext: mixed, parameter: mixed ) => mixed}} selectors
 *         Referent Selectors to use whenever a given referentKey is encountered on a Condition.
 *         Once a Condition has matched a Selector, all Sub-Conditions under that Condition will
 *         also have that value for that Referent Key.  That is, Sub-Conditions inherit the
 *         EvaluationContextLayer of their parent Conditions.
 * @return {EvaluationContextProvider} The provider to use with your ConditionEvaluator.
 */
export default ( _config: ReferentsConfig ): EvaluationContextProvider => {
	const config: ReferentsConfig = { ...defaultConfig, ..._config };
	const { defaults, nameInContext, selectors } = config;
	const defaultReferentTypes = Object.keys( defaults );
	const referentTypes = Object.keys( selectors );

	return appContext => {
		const defaultRefs = {};

		defaultReferentTypes.forEach( refType => {
			defaultRefs[ refType ] = defaults[ refType ]( appContext );
		});

		return evalContextLayer => {
			const condition = { ...evalContextLayer.condition };
			const prevRefs = evalContextLayer[ nameInContext ];
			const nextRefs = { ...defaultRefs, ...prevRefs };

			const refsTypesOnCondition = referentTypes.filter( refType => refType in condition );

			refsTypesOnCondition.forEach( refType => {
				// We don't check `refType in condition` here because we just did that
				// when getting refTypesOnCondition.
				nextRefs[ refType ] = selectors[ refType ]( appContext, condition[ refType ] );
				delete condition[ refType ];
			});

			// Clear off any lingering ref keys if they're ones that only show up in the defaults.
			defaultReferentTypes.forEach( refType => {
				if( refType in condition ) delete condition[ refType ];
			});

			return {
				...evalContextLayer,
				[ nameInContext ]: nextRefs,
				condition,
			};
		};
	};
};
