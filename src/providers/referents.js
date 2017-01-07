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
				nextRefs[ refType ] = selectors[ refType ]( appContext, condition[ refType ] );
				delete condition[ refType ];
			});

			return {
				...evalContextLayer,
				[ nameInContext ]: nextRefs,
				condition,
			};
		};
	};
};
