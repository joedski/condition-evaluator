
import evalCondition from './condition/evaluate';

let state = {
	pages: {
		'1': { visited: true },
		'2': { visited: true },
		'3': { visited: false }
	},
	interaction: {
		currentPage: '2'
	}
};

console.log( evalCondition( state, { page: '3', isVisited: false }) ); // => true, because pages['3'].visited is indeed false.
console.log( evalCondition( state, { isVisited: true }) ); // => true, because the current page, pages['2'], has .visited = true.
