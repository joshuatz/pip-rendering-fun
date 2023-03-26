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
			ms: Math.floor((((e % 864e5) % 36e5) % 6e4) % 1e3),
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

	// prettier-ignore
	const pipToggleButton = /** @type {HTMLButtonElement | undefined} */ (document.getElementById('pipToggleButton'));
	window.demoState = {
		isOpen: false,
		renderer,
		pipToggleButton,
		onOpen: () => {},
		handleOpen: null,
		onClose: () => {},
	};
	window.demoUtils = {
		msToParts,
		leftPad,
	};
	const localState = {
		canvasVisible: false,
		vidVisible: false,
	};

	const handleRunningStateChange = () => {
		const isOpen = window.demoState.isOpen;
		console.log(`Running state changed. Running = `, isOpen);
		pipToggleButton.setAttribute('data-running', isOpen.toString());
		const cb = isOpen ? window.demoState.onOpen : window.demoState.onClose;
		if (renderer.isOpen !== isOpen) {
			if (window.demoState.handleOpen) {
				window.demoState.handleOpen();
				cb();
			} else {
				renderer.setPipOpen(isOpen).then(() => {
					cb();
				});
			}
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
 * Inject UI control buttons
 * @param {PipRenderer} renderer
 */
const injectButtons = (renderer) => {
	const showPipButton = `
<button id="pipToggleButton" title="Toggle PiP popout!" class="toggleButton" data-running="false">
	<span class="stopped"><span aria-hidden="true">🛸</span> Open PiP!</span>
	<span class="running"><span aria-hidden="true">🛑</span> Close PiP!</span>
</button>
`;
	let pipDisclaimerText = 'Your browser does not support PiP, in any capacity :(';
	if (renderer.hasGeckoPartialSupport && !renderer.isAndroid) {
		pipDisclaimerText =
			'Your browser does not support the JS PiP API, but you should be able to right click the video on this page and manually open and close a PiP window.';
	}
	if (renderer.hasAndroidOSSupport) {
		pipDisclaimerText =
			'Your browser does not support the JS PiP API, but you might be able to get it to work by full-screening the video, and then pressing the home button.';
	}
	const pipDisclaimer = `
<p>${pipDisclaimerText}</p>
`;
	const disclaimerHtml =
		!renderer.hasRegularJSAPI || renderer.isFirefox
			? `<div style="width: 100%; text-align:center;">${pipDisclaimer}</div>`
			: '';

	// Build controls bar
	const controls = `
${renderer.hasRegularJSAPI ? showPipButton : ''}
<button id="showCanvas" title="Toggle <canvas> element display" class="toggleButton" data-bool="false">
	<span class="hideOnTrue"><span aria-hidden="true">🎨</span> Show Canvas</span>
	<span class="hideOnFalse"><span aria-hidden="true">🙈</span> Hide Canvas</span>
</button>
<button id="showVideo" title="Toggle <video> element display" class="toggleButton" data-bool="false">
	<span class="hideOnTrue"><span aria-hidden="true">📺</span> Show Video Element</span>
	<span class="hideOnFalse"><span aria-hidden="true">🙈</span> Hide Video Element</span>
</button>
`;
	document.querySelectorAll('.controls.template').forEach((d) => (d.innerHTML = controls));
	document.querySelector('.controls').insertAdjacentHTML('afterend', disclaimerHtml);
};

const injectMenuBar = () => {
	if (document.title === 'Page Title') {
		const dirName = document.location.pathname
			.split('/')
			.filter((f) => !!f)
			.pop();
		document.title = `PiP Render Demo | ${dirName}`;
	}
	const menuBar = `
<div class="menuBar">
	<div class="menuButton"><a href="..">Back 🔙 / 🏠</a></div>
	<div class="menuButton"><a href="https://github.com/joshuatz/pip-rendering-fun" rel="noopener" target="_blank">Git Repo 👩‍💻</a></div>
	
	<div class="menuTitle">${document.title}</div>
</div>`;
	document.querySelector('.menuBar').outerHTML = menuBar;
};

// Run everything
(async () => {
	/**
	 * Main renderer init
	 */
	injectMenuBar();
	try {
		const renderer = new PipRenderer({ startOpen: false });
		injectButtons(renderer);
		commonSetup(renderer);
	} catch (e) {
		console.error(`Error in common.js, setting up main Renderer`, e);
		alert('Something went wrong setting up the demo! Your device might not support PiP.');
	}
})();
