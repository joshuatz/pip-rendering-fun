const tsPlugin = require('@rollup/plugin-typescript');
/** @type {import('rollup').RollupOptions} */
const config = {
	input: [
		'index.ts',
		'demo-loader.ts'
	],
	plugins: [tsPlugin()],
	output: {
		dir: './dist',
		format: 'iife',
		globals: {
			PipRenderer: 'PipRenderer',
			PipDemoLoader: 'PipDemoLoader'
		},
	}
}

export default config;