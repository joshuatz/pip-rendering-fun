(async () => {
	const state = window.demoState;

	// @ts-ignore
	if (adapter.browserDetails.browser == 'firefox' || state.renderer.isFirefox) {
		try {
			// @ts-ignore
			adapter.browserShim.shimGetDisplayMedia(window, 'screen');
		} catch (e) {
			console.error('Something went wrong shimming Firefox getDisplayMedia support. Please check console');
			console.error(e);
		}
	}

	/** @type {MediaStream | null} */
	let stream = null;

	// Since FF doesn't support PiP API, we'll add new button and attach on that
	if (state.renderer.isFirefox && state.renderer.hasGeckoPartialSupport) {
		const controlsWrapper = document.querySelector('.controls');
		const ffStartButtonHtml = `
<button id="ffStart" title="Start desktop capture stream!" class="toggleButton">
	<span><span aria-hidden="true">🚀</span> Start Desktop Stream</span>
</button>
`;
		controlsWrapper.insertAdjacentHTML('beforeend', ffStartButtonHtml);
		const ffStartButton = document.getElementById('ffStart');
		ffStartButton.addEventListener('click', () => {
			getStream(false);
		});
	}

	const getStream = async (openPip = true) => {
		try {
			if (!stream || !stream.active) {
				stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
			}
			state.renderer.renderScreenShare(stream);
			if (openPip) {
				state.renderer.setPipOpen(true);
			}
		} catch (e) {
			alert(`Something went wrong getting screen. Check console`);
			console.error(e);
		}
	};

	state.handleOpen = getStream;
})();
