document.addEventListener('DOMContentLoaded', () => {
    let isLocked = false;
    let escTimer = null;
    let escStartTime = 0;

    const startTrigger = document.getElementById('start-trigger');
    const prankOverlay = document.getElementById('prank-overlay');
    const escProgress = document.getElementById('esc-progress');
    const escTimerSpan = document.getElementById('esc-timer');
    const fakeTopBar = document.getElementById('fake-top-bar');

    startTrigger.addEventListener('click', () => {
        if (isLocked) return;
        isLocked = true;

        startTrigger.style.display = 'none';
        prankOverlay.style.display = 'flex';
        escProgress.style.display = 'block';
        fakeTopBar.style.display = 'block';

        // Lock clicks and scrolling
        document.body.style.pointerEvents = 'none';
        document.documentElement.style.overflow = 'hidden';
        prankOverlay.style.pointerEvents = 'auto';

        // Activate Native Fullscreen
        const el = document.documentElement;
        if (el.requestFullscreen) el.requestFullscreen();
        else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    });

    // Block Keyboard Completely
    document.addEventListener('keydown', (e) => {
        if (!isLocked) return;

        if (e.key === 'Escape') {
            if (!escTimer) {
                escStartTime = Date.now();
                escTimer = setInterval(() => {
                    const elapsed = Math.floor((Date.now() - escStartTime) / 1000);
                    escTimerSpan.innerText = elapsed;
                    if (elapsed >= 10) {
                        exitPrank();
                    }
                }, 100);
            }
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            return false;
        }

        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
    }, true);

    document.addEventListener('keyup', (e) => {
        if (!isLocked) return;
        if (e.key === 'Escape') {
            clearInterval(escTimer);
            escTimer = null;
            escTimerSpan.innerText = "0";
            e.preventDefault();
        }
    }, true);

    // Block Right Click & Scroll
    document.addEventListener('contextmenu', (e) => { if (isLocked) e.preventDefault(); });
    document.addEventListener('wheel', (e) => { if (isLocked) e.preventDefault(); }, { passive: false });

    // ULTIMATE DEFENSE AGAINST THE TOP 'X' BUTTON
    // The browser exits fullscreen, but we instantly snap it back in 0ms
    document.addEventListener('fullscreenchange', () => {
        if (isLocked && !document.fullscreenElement) {
            setTimeout(() => {
                if (isLocked && !document.fullscreenElement) {
                    const el = document.documentElement;
                    if (el.requestFullscreen) el.requestFullscreen();
                }
            }, 0); // 0ms delay - essentially immediate.
        }
    });

    function exitPrank() {
        isLocked = false;
        clearInterval(escTimer);
        escTimer = null;

        prankOverlay.style.display = 'none';
        escProgress.style.display = 'none';
        fakeTopBar.style.display = 'none';
        document.body.style.pointerEvents = 'auto';
        document.documentElement.style.overflow = 'auto';
        startTrigger.style.display = 'none';

        if (document.exitFullscreen) document.exitFullscreen();

        alert("✅ Prank finished!\nYou held ESC for 10 seconds.\nSystem is now safe.");
        window.location.reload();
    }
});
