
// any: { are: any, of: Array<Condition> } => boolean
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

// every: { are: any, of: Array<Condition> } => boolean
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
export const not = ({ parameter, evaluate }) => {
	return ! evaluate( parameter );
};

// not: Condition => Any
export const always = ({ parameter }) => {
	return parameter;
};
