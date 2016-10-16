Type Descriptions
=================

```
Evaluator: ( PredicateMap, Array<EvaluationContextProvider> ) => AppContext => Condition => Result
```

Then, supply the PredicateMap, EvaluationContextProviders, and AppContext and we get a (Condition => Result).

```
PredicateMap: { [PredicateName: string]: Predicate }

Predicate: EvaluationContextLayer => Result

EvaluationContextProvider: AppContext => BaseEvaluationContextLayer => BaseEvaluationContextLayer

AppContext: Any

BaseEvaluationContextLayer: {
	context: AppContext,
	condition: Condiiton,
	...(anything added by an EvaluationContextProvider)
}

EvaluationContextLayer: {
	...BaseEvaluationContextLayer,
	evaluate: Condition => Result,
	parameter: PredicateParameter,
}

Condition: Any

Result: Any (though commonly boolean)
```



EvaluationContextProvider
-------------------------

An EvaluationContextProvider extends the a BaseEvaluationContextLayer, and is the way to ease writing succinct queries.  Normally, you don't hand a plain Provider straight to the Evaluator factory, rather you use a EvaluationContextProvider Factory to configure that Provider before handing it off.


### Referents

The Referents EvaluationContextProvider adds `referent: Any` and `referentType: ReferentType` to the EvaluationContextLayer of a Condition.  The exposed function is a Factory that you pass configuration to.

```
Referents: ReferentsProviderParamaters => EvaluationContextProvider

ReferentsProviderParamaters: {
	default: {
		[type: ReferentType]: DefaultReferentSelector
	},
	[type: ReferentType]: ReferentSelector
}

ReferentType: string

ReferentSelector: ( AppContext, ConditionReferentParameter ) => Any

DefaultReferentSelector: AppContext => Any
```

A ReferentSelector is a selector function you provide which picks out a certain referent object from the given AppContext (usually a state tree) based on the provided parameter.

The DefaultReferentSelector is a particular one which does not receive a parameter, just the AppContext.  Usually, this refers to a current object of some sort, such as a current page or current scene.



Examples
--------

Most Predicates will probably be written like:

```js
const isHoopyFrood = ({ parameter }) => {
	return checkIfWereAHoopyFrood() === parameter;
};

// Using the Referrents EvaluationContextProvider...
const isHoopyFrood = ({ parameter, referent, referentType }) => {
	return checkIfIsHoopyFrood( referent ) === parameter;
};
```

However, maybe you have an `or` predicate...

```js
const or = ({ parameter, evaluate }) => {
	return parameter.some( evaluate );
}
```

### Referents
