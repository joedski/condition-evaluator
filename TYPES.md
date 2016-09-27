Condition DSL Algorithm: Musing
===============================

```
Evaluator: ( Predicates, Array<EvaluationContextProvider> ) => AppContext => Condition => Result
```

Then, supply the Predicates, EvaluationContextProviders, and AppContext and we get a (Condition => Result).

```
Predicates: { [PredicateName: string]: Predicate }

Predicate: EvaluationContextLayer => Result

EvaluationContextProvider: ProviderParameters => Context => BaseEvaluationContextLayer => BaseEvaluationContextLayer

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



Referents
---------

The Referents EvaluationContextProvider adds `referent: Any` and `referentType: ReferentType` to the EvaluationContextLayer of a Condition.

```
Referents: EvaluationContextProvider

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
