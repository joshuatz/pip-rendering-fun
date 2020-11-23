
import _html2canvas from 'html2canvas'
declare global {
/**
 * lib.dom.d.ts augmentation
 *  - Some of the stuff we are using is *experimental*
 */

interface Document {
	/**
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/DocumentOrShadowRoot/pictureInPictureElement
	 */
	pictureInPictureElement?: null | HTMLVideoElement;
	/**
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/Document/exitPictureInPicture
	 */
	exitPictureInPicture(): Promise<void>;
	/**
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/Document/pictureInPictureEnabled
	 */
	pictureInPictureEnabled?: boolean;
}

interface HTMLCanvasElement {
	// https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/captureStream
	captureStream(frameRate?: number): MediaStream;
}

interface HTMLVideoElement {
	// https://developer.mozilla.org/en-US/docs/Web/API/HTMLVideoElement/requestPictureInPicture
	requestPictureInPicture(): Promise<PictureInPictureWindow>;
}

// https://developer.mozilla.org/en-US/docs/Web/API/PictureInPictureWindow 
class PictureInPictureWindow {
	readonly width: number;
	readonly height: number;
	onresize(evt: {
		target: PictureInPictureWindow
	}): void;
}

interface PictureInPictureResizeEvent {
	target: PictureInPictureWindow;
}


interface MediaDevices {
	/**
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getDisplayMedia
	 */
	getDisplayMedia(constraints?: MediaStreamConstraints): Promise<MediaStream>;
}

/**
 * html2canvas
 */
const html2canvas: typeof _html2canvas;
}