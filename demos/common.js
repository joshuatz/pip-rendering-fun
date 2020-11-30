/**
 * This is code to set up the renderer, handle state change, and listen
 * @param {PipRenderer} renderer
 */
const commonSetup = async (renderer) => {
	/**
	 * Delay to let per-demo code run and DOM init
	 * @type {number}
	 */
	const LOAD_DELAY_MS = 200;
	/**
	 * https://docs.joshuatz.com/snippets/js/
	 * @param {number} e
	 */
	const msToParts = (e) => {
		return {
			days: Math.floor(e / 864e5),
			hrs: Math.floor((e % 864e5) / 36e5),
			mins: Math.floor(((e % 864e5) % 36e5) / 6e4),
			secs: Math.floor((((e % 864e5) % 36e5) % 6e4) / 1e3),
			ms: Math.floor((((e % 864e5) % 36e5) % 6e4) % 1e3)
		};
	};
	/**
	 * Left pad a number or string
	 * https://docs.joshuatz.com/snippets/js/
	 * @param input {string | number}
	 * @param length {number} Length to pad to
	 * @param padWith {string} Char to pad with
	 */
	const leftPad = (input, length, padWith) => {
		let out = input.toString();
		while (out.length < length) {
			out = padWith + out;
		}
		return out;
	};

	/** @type {NodeListOf<HTMLParagraphElement>} */
	const infoOuts = document.querySelectorAll('p.debugInfo');
	/** @param {string} info */
	const setDebugInfo = (info) => {
		infoOuts.forEach((p) => {
			p.innerText = info;
		});
	};

	/** @type {HTMLButtonElement | undefined} */
	// prettier-ignore
	const pipToggleButton = (document.getElementById('pipToggleButton'));
	window.demoState = {
		isOpen: false,
		renderer,
		pipToggleButton,
		onOpen: () => {},
		onClose: () => {}
	};
	window.demoUtils = {
		msToParts,
		leftPad
	};
	const localState = {
		canvasVisible: false,
		vidVisible: false
	};

	const handleRunningStateChange = () => {
		const isOpen = window.demoState.isOpen;
		console.log(`Running state changed. Running = `, isOpen);
		pipToggleButton.setAttribute('data-running', isOpen.toString());
		const cb = isOpen ? window.demoState.onOpen : window.demoState.onClose;
		if (renderer.isOpen !== isOpen) {
			renderer.setPipOpen(isOpen).then(() => {
				cb();
			});
		} else {
			cb();
		}
	};
	// Update local state if renderer closes PiP
	renderer.addCloseListener(() => {
		window.demoState.isOpen = false;
		handleRunningStateChange();
	});
	// Let user toggle with button
	if (pipToggleButton) {
		pipToggleButton.addEventListener('click', () => {
			window.demoState.isOpen = !window.demoState.isOpen;
			handleRunningStateChange();
		});
	}

	/**
	 * Handle canvas visibility
	 * Canvas doesn't *have* to be in DOM, so it might not be, depending on demo
	 * Individual demos might muck with canvas, so delay check
	 */

	const showCanvasButton = document.querySelector('#showCanvas');
	if (showCanvasButton) {
		showCanvasButton.addEventListener('click', () => {
			localState.canvasVisible = !localState.canvasVisible;
			handleCanvasVisibleChange();
		});
		// Detect if canvas was never added to DOM
		let canvasIsInDom = !!renderer.canvasElement.parentElement;
		setTimeout(() => {
			canvasIsInDom = !!renderer.canvasElement.parentElement;
			localState.canvasVisible = canvasIsInDom && getComputedStyle(renderer.canvasElement).display !== 'none';
			handleCanvasVisibleChange();
		}, LOAD_DELAY_MS);
	}
	const handleCanvasVisibleChange = () => {
		let canvasIsInDom = !!renderer.canvasElement.parentElement;
		showCanvasButton.setAttribute('data-bool', localState.canvasVisible.toString());
		if (localState.canvasVisible && !canvasIsInDom) {
			document.body.appendChild(renderer.canvasElement);
		}
		renderer.canvasElement.style.display = localState.canvasVisible ? 'block' : 'none';
	};

	/**
	 * Handle Video Visibility
	 * Video element should always be in DOM
	 */
	const showVidButton = document.querySelector('#showVideo');
	localState.vidVisible = getComputedStyle(renderer.videoElement).display !== 'none';
	const handleVidVisibleChange = () => {
		showVidButton.setAttribute('data-bool', localState.vidVisible.toString());
		renderer.videoElement.style.display = localState.vidVisible ? 'block' : 'none';
	};
	if (showVidButton) {
		showVidButton.addEventListener('click', () => {
			localState.vidVisible = !localState.vidVisible;
			handleVidVisibleChange();
		});
		setTimeout(() => {
			localState.vidVisible = getComputedStyle(renderer.videoElement).display !== 'none';
			handleVidVisibleChange();
		}, LOAD_DELAY_MS);
	}
};

/**
 * This is UI injection code, so I don't have to compile templates
 * @param {PipRenderer} renderer
 */
const injectUi = (renderer) => {
	if (document.title === 'Page Title') {
		const dirName = document.location.pathname
			.split('/')
			.filter((f) => !!f)
			.pop();
		document.title = `PiP Render Demo | ${dirName}`;
	}
	const menuBar = `
<div class="menuBar">
	<div class="menuButton"><a href="..">Back 🔙</a></div>
	<div class="menuButton"><a href="/">Home 🏠</a></div>
	<div class="menuTitle">${document.title}</div>
</div>`;
	const showPipButton = `
<button id="pipToggleButton" title="Toggle PiP popout!" class="toggleButton" data-running="false">
	<span class="stopped"><span aria-hidden="true">🛸</span> Open PiP!</span>
	<span class="running"><span aria-hidden="true">🛑</span> Close PiP!</span>
</button>
`;
	const pipDisclaimer = `
<p>${renderer.hasGeckoPartialSupport ? 'Your browser does not support the PiP API, but you should be able to right click the video on this page and manually open and close a PiP window.' : 'Your browser does not support PiP, in any capacity :('}</p>
`;
	const controls = `
${!renderer.isFirefox ? showPipButton : ''}
<button id="showCanvas" title="Toggle <canvas> element display" class="toggleButton" data-bool="false">
	<span class="hideOnTrue"><span aria-hidden="true">🎨</span> Show Canvas</span>
	<span class="hideOnFalse"><span aria-hidden="true">🙈</span> Hide Canvas</span>
</button>
<button id="showVideo" title="Toggle <video> element display" class="toggleButton" data-bool="false">
	<span class="hideOnTrue"><span aria-hidden="true">📺</span> Show Video Element</span>
	<span class="hideOnFalse"><span aria-hidden="true">🙈</span> Hide Video Element</span>
</button>
${renderer.isFirefox ? pipDisclaimer : ''}
`;
	document.querySelector('.menuBar').outerHTML = menuBar;
	document.querySelectorAll('.controls.template').forEach((d) => (d.innerHTML = controls));
};

// Run everything
(async () => {
	/**
	 * Main renderer init
	 */
	const renderer = new PipRenderer({ startOpen: false });
	injectUi(renderer);
	commonSetup(renderer);
})();
