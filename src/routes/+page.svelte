<script>
	import { _sound } from '../sound.svelte';
	import Splash from '../Splash.svelte';
	import { post } from '../utils';

	$effect(() => {
		const disable = (e) => {
			e.preventDefault();
		};

		const toggleMusic = () => {
			_sound.music = -_sound.music;
			_sound.playMusic();
		};

		const onBlur = () => {
			if (_sound.music > 0) {
				toggleMusic();
			}
		};

		const onFocus = () => {
			if (_sound.music < 0) {
				toggleMusic();
			}
		};

		window.addEventListener('contextmenu', disable);
		window.addEventListener('dblclick', disable);
		window.addEventListener('blur', onBlur);
		window.addEventListener('focus', onFocus);

		return () => {
			window.removeEventListener('contextmenu', disable);
			window.removeEventListener('dblclick', disable);
			document.removeEventListener('blur', onBlur);
			document.removeEventListener('focus', onFocus);
		};
	});

	let splash = $state(true);
	post(() => (splash = false), 2000);
</script>

<div class="app">
	{#if splash}
		<Splash />
	{:else}
		<div class="content bg">
			<!-- <GamePage />
			<Home /> -->
		</div>
	{/if}
</div>

<style>
	.app {
		height: 100dvh;
		display: grid;
		place-content: center;
		box-sizing: border-box;
	}

	.content {
		grid-area: 1/1;
		place-self: center;
		display: grid;
		touch-action: none;
		box-sizing: border-box;
		border: 1px dotted var(--text);
	}
</style>
