(async () => {
	let startMs = new Date().getTime();
	const localState = {
		elapsedMs: 0,
		elapsedStr: '',
		hasStarted: false
	};
	const state = window.demoState;
	state.onOpen = () => {
		localState.hasStarted = true;
		startMs = new Date().getTime();
	};
	const {leftPad, msToParts} = window.demoUtils;
	const demoLoader = new PipDemoLoader(state.renderer);
	const demoController = await demoLoader.loadToggl(document.querySelector('canvas'));

	demoController.overrideInfoSource(() => {
		localState.elapsedMs = (new Date().getTime()) - startMs;
		const parts = msToParts(localState.elapsedMs);
		localState.elapsedStr = `${parts.hrs}:${leftPad(parts.mins, 2, '0')}:${leftPad(parts.secs, 2, '0')}`
		if (localState.hasStarted) {
			return {
				entryDescription: 'Working on PiP Renderer',
				isRunning: true,
				timeFormatted: localState.elapsedStr
			}
		} else {
			return {
				entryDescription: 'Timer has not started',
				isRunning: false,
				timeFormatted: '0:00:00'
			}
		}
		
	})
})();