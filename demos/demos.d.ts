import '../index';
import '../globals';
import '../demo-loader';

declare global {
	interface Window {
		demoState: {
			isOpen: boolean;
			renderer: PipRenderer;
			toggleButton?: HTMLButtonElement;
			onOpen: () => void;
			onClose: () => void;
		},
		demoUtils: {
			msToParts: (t: number) => {
				days: number,
				hrs: number,
				mins: number,
				secs: number,
				ms: number
			},
			leftPad: (input: number | string, length: number, padWith: string) => string;
		}
		PipDemoLoader: PipDemoLoader
	}
}