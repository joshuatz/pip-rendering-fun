/** @type {import('esbuild').BuildOptions} */
const config = {
	entryPoints: ['index.ts', 'demo-loader.ts'],
	bundle: false,
	outdir: './dist'
};
require('esbuild').build(config).catch((err) => {
	console.error(err);
	process.exit(1);
});