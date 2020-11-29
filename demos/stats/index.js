(async () => {
	const state = window.demoState;
	const demoLoader = new PipDemoLoader(state.renderer);
	/** @type {HTMLImageElement} */
	// prettier-ignore
	const bg = (document.getElementById('bg'));
	/** @type {HTMLImageElement} */
	// prettier-ignore
	const graphTile = (document.getElementById('graphTile'));
	const demoController = await demoLoader.loadStats(bg, graphTile);
})();
