document.addEventListener('DOMContentLoaded', () => {
    let isLocked = false;
    let isEscPressed = false;
    let escStartTime = 0;
    let escTimer = null;
    let fullscreenWatchdog = null;

    const startTrigger = document.getElementById('start-trigger');
    const prankOverlay = document.getElementById('prank-overlay');
    const escProgress = document.getElementById('esc-progress');
    const escTimerSpan = document.getElementById('esc-timer');
    const fakeTopBar = document.getElementById('fake-top-bar');

    window.addEventListener('beforeunload', function(e) {
        if (isLocked) {
            e.preventDefault();
            e.returnValue = '';
        }
    });

    startTrigger.addEventListener('click', () => {
        if (isLocked) return;
        isLocked = true;

        startTrigger.style.display = 'none';
        prankOverlay.style.display = 'flex';
        escProgress.style.display = 'block';
        fakeTopBar.style.display = 'flex'; /* Changed to flex to match the new styling */
        
        const popups = document.querySelectorAll('.security-modal');
        popups.forEach(p => p.style.display = 'flex');

        document.body.style.pointerEvents = 'none';
        document.documentElement.style.overflow = 'hidden';
        prankOverlay.style.pointerEvents = 'auto';

        const el = document.documentElement;
        if (el.requestFullscreen) el.requestFullscreen();
        else if (el.mozRequestFullScreen) el.mozRequestFullScreen();
        else if (el.webkitRequestFullScreen) el.webkitRequestFullScreen();
        else if (el.msRequestFullscreen) el.msRequestFullscreen();

        if (fullscreenWatchdog) clearInterval(fullscreenWatchdog);
        fullscreenWatchdog = setInterval(() => {
            if (!isLocked) {
                clearInterval(fullscreenWatchdog);
                fullscreenWatchdog = null;
                return;
            }
            if (!document.fullscreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
                const el = document.documentElement;
                if (el.requestFullscreen) el.requestFullscreen();
                else if (el.mozRequestFullScreen) el.mozRequestFullScreen();
                else if (el.webkitRequestFullScreen) el.webkitRequestFullScreen();
                else if (el.msRequestFullscreen) el.msRequestFullscreen();
            }
        }, 150);
    });

    document.addEventListener('keydown', function(e) {
        if (!isLocked) return;

        if (e.key === "Escape") {
            isEscPressed = true;
            escStartTime = Date.now();

            clearInterval(escTimer);
            escTimer = setInterval(() => {
                const elapsed = Math.floor((Date.now() - escStartTime) / 1000);
                escTimerSpan.innerText = elapsed;
                if (elapsed >= 10) {
                    exitPrank();
                }
            }, 100);

            e.preventDefault();
            e.stopImmediatePropagation();
            return false;
        }

        e.preventDefault();
        e.stopImmediatePropagation();
        return false;
    }, true);

    document.addEventListener('keyup', function(e) {
        if (!isLocked) return;

        if (e.key === "Escape") {
            if (isEscPressed) {
                let endTime = Date.now();
                let timeDiff = endTime - escStartTime;

                if (timeDiff < 10000) {
                    clearInterval(escTimer);
                    escTimer = null;
                    isEscPressed = false;
                    escTimerSpan.innerText = "0";
                }
            }
            e.preventDefault();
            e.stopImmediatePropagation();
        }
    }, true);

    document.addEventListener('contextmenu', function(e) { if (isLocked) e.preventDefault(); });
    document.addEventListener('wheel', function(e) { if (isLocked) e.preventDefault(); }, { passive: false });

    function exitPrank() {
        isLocked = false;
        isEscPressed = false;
        clearInterval(escTimer);
        escTimer = null;
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
