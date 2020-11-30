(async () => {
	const state = window.demoState;

	// @ts-ignore
	const drawingBoard = new DrawingBoard.Board('canvasContainer');
	setTimeout(() => {
		const canvas = document.querySelector('canvas');
		state.renderer.streamCanvas(canvas);
	}, 500);
})();
