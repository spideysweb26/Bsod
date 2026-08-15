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

        // 1. CURSOR KILLER: Hide the mouse permanently everywhere
        document.body.style.cursor = 'none';
        document.documentElement.style.cursor = 'none';
        prankOverlay.style.cursor = 'none';

        // 2. LOCK CLICKS
        document.body.style.pointerEvents = 'none';
        document.documentElement.style.overflow = 'hidden';
        prankOverlay.style.pointerEvents = 'auto';

        // 3. ACTIVATE TRUE NATIVE FULLSCREEN (Covers the OS Taskbar)
        const el = document.documentElement;
        if (el.requestFullscreen) el.requestFullscreen();
        else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    });

    // 4. ULTIMATE KEYBOARD LOCK (stopImmediatePropagation blocks everything)
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

        // Block F11, Ctrl+W, Ctrl+R, Alt+F4, etc.
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
    }, true);

    // 5. CANCEL ESCAPE IF RELEASED EARLY
    document.addEventListener('keyup', (e) => {
        if (!isLocked) return;
        if (e.key === 'Escape') {
            clearInterval(escTimer);
            escTimer = null;
            escTimerSpan.innerText = "0";
            e.preventDefault();
        }
    }, true);

    // 6. BLOCK RIGHT-CLICK & SCROLL
    document.addEventListener('contextmenu', (e) => { if (isLocked) e.preventDefault(); });
    document.addEventListener('wheel', (e) => { if (isLocked) e.preventDefault(); }, { passive: false });

    // 7. ANTI-CHEAT: Force back into fullscreen instantly if they tap Esc early
    document.addEventListener('fullscreenchange', () => {
        if (isLocked && !document.fullscreenElement) {
            setTimeout(() => {
                if (isLocked && !document.fullscreenElement) {
                    const el = document.documentElement;
                    if (el.requestFullscreen) el.requestFullscreen();
                }
            }, 0);
        }
    });

    // 8. EXIT PRANK
    function exitPrank() {
        isLocked = false;
        clearInterval(escTimer);
        escTimer = null;

        prankOverlay.style.display = 'none';
        escProgress.style.display = 'none';
        fakeTopBar.style.display = 'none';
        document.body.style.pointerEvents = 'auto';
        document.documentElement.style.overflow = 'auto';
        document.body.style.cursor = 'auto';
        document.documentElement.style.cursor = 'auto';
        startTrigger.style.display = 'none';

        if (document.exitFullscreen) document.exitFullscreen();

        alert("✅ Prank finished!\nYou held ESC for 10 seconds.\nSystem is now safe.");
        window.location.reload();
    }
});
