(() => {
	const state = window.demoState;
	const localState = {
		dimensions: {
			width: 0,
			height: 0
		},
		isOpen: false
	}
	const canvas = document.createElement('canvas');
	const sqLen = 260;
	canvas.style.backgroundColor = 'black';
	canvas.width = sqLen;
	canvas.height = sqLen;
	const ctx = canvas.getContext('2d');
	// Draw white background
	ctx.fillStyle = 'black';
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	// Prep for text
	ctx.fillStyle = 'white';
	ctx.font = 'normal 54px sans-serif';
	ctx.textBaseline = 'top';
	state.renderer.streamCanvas(canvas);

	let scrollText = `=-=-----===----=-`.split('');

	const renderDimensions = () => {
		const pipWindow = state.renderer.pipWindow;
		if (pipWindow) {
			localState.dimensions = pipWindow;
		}
		scrollText.unshift(scrollText.pop());
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		const y = (canvas.height / 2) - 60 / 2;
		const x = 10;
		if (state.isOpen) {
			ctx.fillText(scrollText.join(''), 0, y - 65);
			ctx.fillText(`${localState.dimensions.width} x ${localState.dimensions.height}`, x, y);
			ctx.fillText(scrollText.join(''), 0, y + 65);
		} else {
			ctx.fillText(`CLOSED!`, x, y);
		}
	}
	renderDimensions();

	// Run it on an animation loop, even when res is not changing, just for scroll effect
	setInterval(renderDimensions, 200);

	state.onOpen = () => {
		renderDimensions();
		state.renderer.pipWindow.onresize = () => {
			localState.isOpen = true;
			renderDimensions();
		}
	}
	state.onClose = () => {
		localState.isOpen = false;
	}
})();