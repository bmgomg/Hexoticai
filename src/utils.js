
export const windowSize = () => {
    const d = document,
        e = d.documentElement,
        g = d.getElementsByTagName('body')[0],
        w = e.clientWidth || g.clientWidth,
        h = e.clientHeight || g.clientHeight;

    return { w, h };
};

export const clientRect = selector => {
    const ob = document.querySelector(selector);
    const r = ob?.getBoundingClientRect();

    return r;
};

export const rectCenter = selector => {
    const ob = document.querySelector(selector);
    const r = ob?.getBoundingClientRect();

    return r ? {
        x: r.left + r.width / 2,
        y: r.top + r.height / 2
    } : null;
};

export const underMouse = (event, selectors) => {
    for (const selector of selectors) {
        const r = clientRect(selector);

        if (!r) {
            continue;
        }

        const x = event.clientX;
        const y = event.clientY;

        if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) {
            return true;
        }
    }

    return false;
};

export const focusOnApp = () => {
    document.querySelector('.app')?.focus();
};

export const isTouchable = () => navigator.maxTouchPoints > 0;

export const tapOrClick = (lower = false) => {
    const verb = isTouchable() ? 'Tap' : 'Click';
    return lower ? verb.toLowerCase() : verb;
};

export const isAppleDevice = () => /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

export const scrollClass = () => `root-scroll ${isTouchable() ? 'root-scroll-mobile' : ''}`;

export const post = (fn, ms) => setTimeout(fn, ms);

export const _range = (start, end) => Array.from({ length: end + 1 - start }, (_, i) => start + i);
