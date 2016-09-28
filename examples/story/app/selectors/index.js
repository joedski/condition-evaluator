
export const page = ( state, pageId ) => {
	return state.pages[ pageId ];
};

export const currentPage = ( state ) => {
	return page( state, state.interaction.currentPage );
};
