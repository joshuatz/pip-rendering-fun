interface Settings {
	videoElement?: HTMLVideoElement;
	canvasElement?: HTMLCanvasElement;
	startOpen?: boolean;
}

class PipRenderer {
	public videoElement: HTMLVideoElement;
	public canvasElement: HTMLCanvasElement | null;
	public pipWindow: PictureInPictureWindow | null;
	public stream: MediaStream;
	public isAttached = false;
	public isOpen = false;
	private runningTimers: number[] = [];
	private _closeListeners: Array<() => void> = [];
	public hasRegularJSAPI = false;
	/**
	 * Firefox does not support the JS web API / interface,
	 * but does have partial support, via their own injected controls
	 * @see https://support.mozilla.org/en-US/kb/about-picture-picture-firefox
	 * @see https://github.com/mozilla/gecko-dev/tree/c37038c592a352eda0f5e77dfb58c4929bf8bcd3/testing/web-platform/meta/picture-in-picture
	 */
	public hasGeckoPartialSupport = false;
	public isFirefox = false;
	public isAndroid = false;
	public hasAndroidOSSupport = false;

	constructor(settings: Settings) {
		if (document.pictureInPictureEnabled) {
			this.hasRegularJSAPI = true;
		} else {
			const androidMatches = /Android (\d{1,});/.exec(navigator.userAgent);
			const ffVerMatches = /Firefox\/(\d{2,}\.\d+)$/.exec(navigator.userAgent);
			this.isFirefox = ffVerMatches && !!ffVerMatches[1];
			this.isAndroid = androidMatches && !!androidMatches[1];
			if (this.isFirefox && parseFloat(ffVerMatches[1]) >= 81) {
				this.hasGeckoPartialSupport = true;
				console.warn(
					'You are using a version of Firefox that supports PiP, but it has to be manually launched.'
				);
			}
			if (this.isAndroid && parseFloat(androidMatches[1]) >= 8) {
				this.hasAndroidOSSupport = true;
			}

			if (!this.hasGeckoPartialSupport && !this.hasAndroidOSSupport && !this.hasRegularJSAPI) {
				throw new Error(`${navigator.userAgent} bowser does not support PiP`);
			}
		}
		let { videoElement, canvasElement } = settings;
		if (!canvasElement) {
			this.getCanvas();
		}

		if (!videoElement) {
			videoElement = document.createElement('video');
			videoElement.controls = true;
			// Helps with auto-play / non-interacted starts
			videoElement.muted = true;
			// Seems like it needs to be in DOM to load, but we can hide (non-FF)
			if (!this.hasRegularJSAPI && (this.hasGeckoPartialSupport || this.hasAndroidOSSupport)) {
				videoElement.autoplay = true;
			} else {
				videoElement.style.display = 'none';
			}
			document.body.appendChild(videoElement);
		}
		videoElement.addEventListener('leavepictureinpicture', () => {
			this.pipWindow = null;
			this.isOpen = false;
			this._closeListeners.forEach((f) => f());
		});
		if (this.hasAndroidOSSupport) {
			videoElement.addEventListener('fullscreenchange', () => {
				if (!document.fullscreenElement) {
					this.pipWindow = null;
					this.isOpen = false;
					this._closeListeners.forEach((f) => f());
				}
			});
		}
		this.videoElement = videoElement;

		if (settings.startOpen) {
			this.streamCanvas();
			this.setPipOpen(true);
		}
	}

	/**
	 * Needed due to quirk - first frame in stream is not sent,
	 * when capturing from canvas
	 * @param canvas The canvas to force a re-paint on
	 * @see https://stackoverflow.com/a/50950837/11447682
	 */
	private forcePaint(canvas?: HTMLCanvasElement) {
		canvas = canvas || this.canvasElement;
		const ctx = canvas.getContext('2d');
		const gCO = ctx.globalCompositeOperation;
		ctx.globalCompositeOperation = 'copy';
		ctx.drawImage(ctx.canvas, 0, 0);
		ctx.globalCompositeOperation = gCO;
	}

	private delay(delayMs: number) {
		return new Promise((res) => {
			setTimeout(res, delayMs);
		});
	}

	/**
	 * Reconnect stream to video PIP
	 */
	private reconnect() {
		this.videoElement.srcObject = this.stream;
		this.videoElement.play();
		this.isAttached = true;
	}

	public addCloseListener(cb: () => void) {
		this._closeListeners.push(cb);
	}

	public getCanvas() {
		if (!this.canvasElement) {
			this.canvasElement = document.createElement('canvas');
			this.canvasElement.width = 480;
			this.canvasElement.height = 270;
		}

		return {
			canvas: this.canvasElement,
			ctx: this.canvasElement.getContext('2d'),
		};
	}

	public clearCanvas(canvas?: HTMLCanvasElement) {
		canvas = canvas || this.getCanvas().canvas;
		const ctx = canvas.getContext('2d');
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		return canvas;
	}

	public disconnect() {
		this.runningTimers.forEach(clearInterval);
		if (this.videoElement && this.isAttached) {
			this.videoElement.pause();
			this.videoElement.srcObject = null;
		}
		this.isAttached = false;
	}

	public setCanvasDimensions(dimensions: { width: number; height: number }) {
		this.canvasElement.width = dimensions.width;
		this.canvasElement.height = dimensions.height;
	}

	public async setPipOpen(setOpen: boolean) {
		if (setOpen && !document.pictureInPictureElement) {
			try {
				if (!this.hasRegularJSAPI && this.hasAndroidOSSupport) {
					// For Android, we have make video full screen and prompt user to press home button - this will trigger PiP
					alert(
						`To trigger PiP, press the "home" button on your Android device after the video fullscreens!`
					);
					await this.videoElement.requestFullscreen();
					this.isOpen = true;
				}
				// @ts-ignore
				this.pipWindow = await this.videoElement.requestPictureInPicture();
				this.isOpen = true;
			} catch (err) {
				if (/Metadata for the video element are not loaded yet/i.test(err.toString())) {
					this.videoElement.addEventListener('loadedmetadata', () => {
						this.setPipOpen(true);
					});
				}
			}
		} else if (!setOpen && document.pictureInPictureElement) {
			await document.exitPictureInPicture();
			this.pipWindow = null;
			this.isOpen = false;
		}
	}

	public injectAsset(url: string, type: 'script' | 'style') {
		let elem: HTMLScriptElement | HTMLLinkElement;
		if (type === 'script') {
			elem = document.createElement('script');
			elem.src = url;
		} else {
			elem = document.createElement('link');
			elem.rel = 'stylesheet';
			elem.href = url;
		}
		document.body.appendChild(elem);
	}

	public async renderDom(element: HTMLElement) {
		if (!document.querySelectorAll('script[src*="html2canvas.min.js"]').length) {
			this.injectAsset('https://cdn.jsdelivr.net/npm/html2canvas@1.0.0-rc.7/dist/html2canvas.min.js', 'script');
			await this.delay(3000);
		}

		const boundingRect = element.getBoundingClientRect();
		this.setCanvasDimensions(boundingRect);

		const result = await html2canvas(element, {
			canvas: this.canvasElement,
			removeContainer: true,
		});
		this.streamCanvas(result);
	}

	public async renderImage(image: HTMLImageElement | string) {
		this.disconnect();
		this.getCanvas();
		let imageElem: HTMLImageElement;
		if (typeof image === 'string') {
			imageElem = document.createElement('img');
			imageElem.src = image;
		} else {
			imageElem = image;
		}

		if (!imageElem.complete) {
			console.warn('Image is not yet loaded. Attaching load listener.');
			await new Promise((res) => {
				imageElem.onload = res;
			});
		}

		this.setCanvasDimensions(imageElem);
		this.clearCanvas();
		this.canvasElement.getContext('2d').drawImage(imageElem, 0, 0, imageElem.width, imageElem.height);
		this.streamCanvas();
	}

	public async renderScreenShare(screenStream?: MediaStream) {
		const onDetatched = () => {
			this.isAttached = false;
			console.warn('User stopped media / screen share!');
		};
		if (!screenStream) {
			screenStream = await navigator.mediaDevices.getDisplayMedia();
		}
		// Add listener
		screenStream.getVideoTracks()[0].addEventListener('ended', onDetatched);
		// Pipe
		this.stream = screenStream;
		this.reconnect();
	}

	/**
	 * "Stream" a canvas to the video element, used as source of PiP
	 * @param canvas The canvas element to stream from
	 */
	public async streamCanvas(canvas?: HTMLCanvasElement) {
		this.canvasElement = canvas || this.canvasElement;
		console.log(`Starting canvas streaming`, {
			canvasDimensions: {
				width: this.canvasElement.width,
				height: this.canvasElement.height,
			},
		});
		this.videoElement.width = this.canvasElement.width;
		this.videoElement.height = this.canvasElement.height;

		// Attach canvas to video element
		this.stream = this.canvasElement.captureStream(25);
		this.reconnect();

		// In case the canvas is not touched, we need to send the first frame
		this.forcePaint();
	}
}
