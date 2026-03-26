<script>
	import favicon from '$lib/images/favicon.png';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}

<style>
	:global {
		body {
			margin: 0;
			padding: 0;
			height: 100dvh;
			width: 100%;
			--bg: #0e1218;
			--dark-slate: #1c2030;
			--slate-deep: #1e4868;
			--slate-fill: #2a5878;
			--slate-circle: #3a7898;
			--slate-stroke: #4a8aaa;
			--slate-avatar: #7ab8d8;
			--slate-shine: #9ad0e8;
			--amber-fill: #c4902a;
			--amber-shine: #f0d080;
			--light-tan: #d4bc8a;
			--text: #c8bfa8;
			background: var(--bg);
			color: var(--text);
			font-family: Cinzel;
			place-content: center;
		}

		.button-base {
			box-sizing: border-box;
			display: grid;
			place-content: center;
			transition: transform 0.1s;
			cursor: pointer;
		}

		.button-base:focus {
			outline: none !important;
		}

		.no-highlight {
			-webkit-tap-highlight-color: transparent;
			-webkit-touch-callout: none;
			-webkit-user-select: none;
			-khtml-user-select: none;
			-moz-user-select: none;
			-ms-user-select: none;
			user-select: none;
		}

		.root-scroll {
			display: grid;
			overflow: auto;
			-webkit-overflow-scrolling: touch;
		}

		.root-scroll::-webkit-scrollbar {
			width: 12px;
			height: 12px;
		}

		.root-scroll::-webkit-scrollbar-thumb {
			background: #ffffff20;
			border-radius: 10px;
		}

		.root-scroll::-webkit-scrollbar-thumb:hover {
			background: #ffffff30;
		}

		/* .root-scroll::-webkit-scrollbar-track {
			background: #fff2;
		} */

		.root-scroll::-webkit-scrollbar-track:hover {
			background: #ffffff05;
		}

		.root-scroll-mobile::-webkit-scrollbar {
			width: 2px;
			height: 2px;
		}

		.root-scroll-mobile::-webkit-scrollbar-thumb {
			border-radius: 1px;
		}

		@font-face {
			font-family: Cinzel;
			src: url('$lib/fonts/Cinzel.ttf');
		}

		@font-face {
			font-family: CD;
			src: url('$lib/fonts/Cinzel Decorative.ttf');
		}

		@font-face {
			font-family: Crimson;
			src: url('$lib/fonts/CrimsonPro.ttf');
		}

		@font-face {
			font-family: Florentina;
			src: url('$lib/fonts/Florentina.ttf');
		}
	}
</style>
