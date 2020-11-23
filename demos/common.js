/**
 * This is code to set up the renderer, handle state change, and listen
 */
(() => {
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
	}
	/** @type {NodeListOf<HTMLParagraphElement>} */
	const infoOuts = document.querySelectorAll('p.debugInfo');
	/** @param {string} info */
	const setDebugInfo = (info) => {
		infoOuts.forEach(p => {
			p.innerText = info;
		});
	};
	/** @type {HTMLButtonElement | undefined} */
	const toggleButton = (document.getElementById('toggleButton'));
	const renderer = new PipRenderer({startOpen: false});
	window.demoState = {
		isOpen: false,
		renderer,
		toggleButton,
		onOpen: () => {},
		onClose: () => {}
	}
	window.demoUtils = {
		msToParts,
		leftPad
	}
	const handleRunningStateChange = () => {
		const isOpen = window.demoState.isOpen;
		console.log(`Running state changed. Running = `, isOpen);
		toggleButton.setAttribute('data-running', isOpen.toString());
		const cb = isOpen ? window.demoState.onOpen : window.demoState.onClose;
		if (renderer.isOpen !== isOpen) {
			renderer.setPipOpen(isOpen).then(() => {
				cb();
			});
		} else {
			cb();
		}
	}
	if (toggleButton) {
		toggleButton.addEventListener('click', () => {
			window.demoState.isOpen = !window.demoState.isOpen;
			handleRunningStateChange();
		});
	}
	renderer.addCloseListener(() => {
		window.demoState.isOpen = false;
		handleRunningStateChange();
	})
})();

/**
 * This is UI injection code, so I don't have to compile templates
 */
(() => {
	if (document.title === 'Page Title') {
		const dirName = document.location.pathname.split('/').filter(f => !!f).pop();
		document.title = `PiP Render Demo | ${dirName}`;
	}
	const menuBar = `
<div class="menuBar">
	<div class="menuButton"><a href="..">Back 🔙</a></div>
	<div class="menuButton"><a href="/">Home 🏠</a></div>
	<div class="menuTitle">${document.title}</div>
</div>`;
	document.querySelector('.menuBar').outerHTML = menuBar;
})();