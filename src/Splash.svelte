<script>
    import { fade } from 'svelte/transition';

    let classes = $state('splash');

    const onPointerDown = () => {
        localStorage.clear();
        classes = 'splash dark';
    };
</script>

<div class={classes} out:fade={{ duration: 300 }} onpointerdown={onPointerDown}>
    <div class="bmg"></div>
</div>

<style>
    .splash {
        position: absolute;
        background: #8a0000;
        background-image: radial-gradient(transparent, black 100%);
        z-index: 300;
        transition: background-color 0.3s;
    }

    .dark {
        background-color: #500000;
    }

    .bmg {
        width: 100dvw;
        height: 100dvh;
        background-image: url($lib/images/BMG.webp);
        background-size: calc(min(300px, min(100dvh, 100dvw) * 0.6));
        background-repeat: no-repeat;
        background-attachment: fixed;
        background-position: center;
    }
</style>
