(async () => {
	const localState = {
		elapsedMs: 0,
		elapsedStr: ''
	}
	const state = window.demoState;
	const {leftPad, msToParts} = window.demoUtils;
	const demoLoader = new PipDemoLoader(state.renderer);
	const demoController = await demoLoader.loadToggl(null);
	const startMs = new Date().getTime();
	const timer = setInterval(() => {
		localState.elapsedMs = (new Date().getTime()) - startMs;
		const parts = msToParts(localState.elapsedMs);
		localState.elapsedStr = `${parts.hrs}:${leftPad(parts.mins, 2, '0')}:${leftPad(parts.secs, 2, '0')}`
	});
	demoController.overrideInfoSource(() => {
		return {
			entryDescription: 'Working on PiP Renderer',
			isRunning: true,
			timeFormatted: localState.elapsedStr
		}
	})
})();