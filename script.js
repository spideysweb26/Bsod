document.addEventListener('DOMContentLoaded', () => {
    let isLocked = false;
    let escTimer = null;
    let escStartTime = 0;
    let fullscreenWatchdog = null;

    const startTrigger = document.getElementById('start-trigger');
    const prankOverlay = document.getElementById('prank-overlay');
    const escProgress = document.getElementById('esc-progress');
    const escTimerSpan = document.getElementById('esc-timer');
    const fakeTopBar = document.getElementById('fake-top-bar');

    // Start the aggressive re-entry loop
    function startFullscreenWatchdog() {
        if (fullscreenWatchdog) clearInterval(fullscreenWatchdog);
        fullscreenWatchdog = setInterval(() => {
            if (!isLocked) {
                clearInterval(fullscreenWatchdog);
                fullscreenWatchdog = null;
                return;
            }
            // If not in native fullscreen, force it back
            if (!document.fullscreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
                const el = document.documentElement;
                if (el.requestFullscreen) el.requestFullscreen();
                else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
                else if (el.msRequestFullscreen) el.msRequestFullscreen();
            }
        }, 200); // Check and force fullscreen every 200 milliseconds
    }

    // 1. ACTIVATE THE PRANK
    startTrigger.addEventListener('click', () => {
        if (isLocked) return;
        isLocked = true;

        startTrigger.style.display = 'none';
        prankOverlay.style.display = 'flex';
        escProgress.style.display = 'block';
        fakeTopBar.style.display = 'block';

        document.body.style.pointerEvents = 'none';
        document.documentElement.style.overflow = 'hidden';
        prankOverlay.style.pointerEvents = 'auto';

        // Initial fullscreen request
        const el = document.documentElement;
        if (el.requestFullscreen) el.requestFullscreen();
        else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();

        // Start the watchdog to instantly recapture fullscreen after the cooldown ends
        startFullscreenWatchdog();
    });

    // 2. BLOCK KEYBOARD
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

    // 3. BLOCK RIGHT CLICK & SCROLL
    document.addEventListener('contextmenu', (e) => { if (isLocked) e.preventDefault(); });
    document.addEventListener('wheel', (e) => { if (isLocked) e.preventDefault(); }, { passive: false });

    // 4. EXIT PRANK
    function exitPrank() {
        isLocked = false;
        clearInterval(escTimer);
        escTimer = null;
        
        // Kill the watchdog
        if (fullscreenWatchdog) {
            clearInterval(fullscreenWatchdog);
            fullscreenWatchdog = null;
        }

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
