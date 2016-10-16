
// any: ({ are: Any, of: Array<Condition> } | Array<Condition>) => boolean
//
// Evaluates to true if any one of the Conditions in the `of` Array evaluates to equal to the `are` value.
// Using the short hand syntax of passing only Array<Condition> rather than { are, of } is the same as
// defining `are: true`.
//
// Use:
//   { any: { are: value, of: [ ...conditions ] } }
//   { any: [ ...conditions ] }
//     equivalent to { any: { are: true, of: [ ...conditions ] } }
export const any = ({ parameter, evaluate }) => {
	let subConditions;
	let compareValue;

	if( Array.isArray( parameter ) ) {
		subConditions = parameter;
	}
	else {
		subConditions = parameter.of;
	}

	if( ! Array.isArray( parameter ) && 'are' in parameter ) {
		compareValue = parameter.are;

		return subConditions.some(
			condition => evaluate( condition ) === compareValue
		);
	}
	else {
		return subConditions.some( evaluate );
	}
};

// every: ({ are: Any, of: Array<Condition> } | Array<Condition>) => boolean
//
// Evaluates to true if every Condition in the `of` Array evaluates to equal to the `are` value.
// Using the short hand syntax of passing only Array<Condition> rather than { are, of } is the same as
// defining `are: true`.
//
// Use:
//   { every: { are: value, of: [ ...conditions ] } }
//   { every: [ ...conditions ] }
//     equivalent to { every: { are: true, of: [ ...conditions ] } }
export const every = ({ parameter, evaluate }) => {
	let subConditions;
	let compareValue;

	if( Array.isArray( parameter ) ) {
		subConditions = parameter;
	}
	else {
		subConditions = parameter.of;
	}

	if( ! Array.isArray( parameter ) && 'are' in parameter ) {
		compareValue = parameter.are;

		return subConditions.every(
			condition => evaluate( condition ) === compareValue
		);
	}
	else {
		return subConditions.every( evaluate );
	}
};

// not: Condition => boolean
//
// Evaluate to the opposite of whatever Condition is passed to it.
//
// Use:
//   { not: condition }
//   Fancy way of writing { always: true }:
//     { not: { always: false } }
//   Alternate way of writing { any: { are: false, of: [ ... ] } }:
//     { not: { every: [ ... ] } }
export const not = ({ parameter, evaluate }) => {
	return ! evaluate( parameter );
};

// always: Any => Any
//
// Evaluate to the provided value.  This is usually used for fallback cases.
//
// Use:
//   { always: anyValueHere }
//   Common cases:
//     { always: true }
//     { always: false }
export const always = ({ parameter }) => {
	return parameter;
};
