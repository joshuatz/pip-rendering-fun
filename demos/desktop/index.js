(async () => {
	// @ts-ignore
	if (adapter.browserDetails.browser == 'firefox') {
		// @ts-ignore
		adapter.browserShim.shimGetDisplayMedia(window, 'screen');
	}
	const state = window.demoState;
	/** @type {MediaStream | null} */
	let stream = null;
	state.handleOpen = async () => {
		try {
			if (!stream || !stream.active) {
				stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
			}
			state.renderer.renderScreenShare(stream);
			state.renderer.setPipOpen(true);
		} catch (e) {
			alert(`Something went wrong getting screen. Check console`);
			console.error(e);
		}
	};
})();
