
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
	if( Array.isArray( parameter ) ) {
		let subConditions = parameter;
		return subConditions.some( evaluate );
	}

	const {
		of: subConditions,
		are: compareValue
	} = parameter;

	return subConditions.some(
		condition => evaluate( condition ) === compareValue
	);
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
	if( Array.isArray( parameter ) ) {
		let subConditions = parameter;
		return subConditions.every( evaluate );
	}

	const {
		of: subConditions,
		are: compareValue
	} = parameter;

	return subConditions.every(
		condition => evaluate( condition ) === compareValue
	);
};

// not: Condition => boolean
//
// Evaluate to the opposite of whatever Condition is passed to it.
//
// Use:
//   { not: condition }
//   Fancy way of writing { always: true }:
//     { not: { always: false } }
//       Notice how this does not have the same meaning as the english "not always false"...
//       Which is probably a good reason not to do this.
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

// otherwise: Any => Any
//
// Provided as an alias of `always` that may be more meaninful in some cases.
//
// Use:
//   { otherwise: anyValueHere }
//   Common cases:
//     { otherwise: true }
//     { otherwise: false }
export const otherwise = always;
