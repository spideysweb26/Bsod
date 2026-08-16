document.addEventListener('DOMContentLoaded', () => {
    let isLocked = false;
    let isEscPressed = false;
    let escStartTime = 0;

    const startTrigger = document.getElementById('start-trigger');
    const prankOverlay = document.getElementById('prank-overlay');
    const escProgress = document.getElementById('esc-progress');
    const escTimerSpan = document.getElementById('esc-timer');
    const fakeTopBar = document.getElementById('fake-top-bar');

    // 1. ACTIVATE PRANK
    startTrigger.addEventListener('click', () => {
        if (isLocked) return;
        isLocked = true;

        startTrigger.style.display = 'none';
        prankOverlay.style.display = 'flex';
        escProgress.style.display = 'block';
        fakeTopBar.style.display = 'block';

        document.body.style.pointerEvents = 'none';
        document.documentElement.style.overflow = 'hidden';
        prankOverlay.style.pointerEvents = 'auto'; // Allow click on prank box itself

        // Open Fullscreen
        const el = document.documentElement;
        if (el.requestFullscreen) el.requestFullscreen();
        else if (el.mozRequestFullScreen) el.mozRequestFullScreen();
        else if (el.webkitRequestFullScreen) el.webkitRequestFullScreen();
        else if (el.msRequestFullscreen) el.msRequestFullscreen();
    });

    // 2. PREVENT CLOSING WINDOW (Works for Ctrl+W / Alt+F4 / Clicking X) - BUT limited to native browser prompts
    window.addEventListener('beforeunload', function(e) {
        if (isLocked) {
            e.preventDefault();
            e.returnValue = '';
        }
    });

    // 3. BLOCK KEYBOARD (Based on user's code but fixed)
    document.addEventListener('keydown', function(e) {
        if (!isLocked) return;

        if (e.key === "Escape") {
            isEscPressed = true;
            escStartTime = Date.now();
            
            // Run timer to update the bottom indicator every 100ms
            if (!escTimer) {
                escTimer = setInterval(() => {
                    const elapsed = Math.floor((Date.now() - escStartTime) / 1000);
                    if(escTimerSpan) escTimerSpan.innerText = elapsed;
                    if (elapsed >= 10) {
                        exitPrank();
                    }
                }, 100);
            }
            
            e.preventDefault();
            e.stopImmediatePropagation();
            return false;
        }

        e.preventDefault();
        e.stopImmediatePropagation();
        return false;
    }, true);

    // 4. RELEASE ESC and CHECK TIME
    document.addEventListener('keyup', function(e) {
        if (!isLocked) return;
        if (e.key === "Escape") {
            if (isEscPressed) {
                let endTime = Date.now();
                let timeDiff = endTime - escStartTime;

                // If user tapped ESC quickly, it just stops the timer
                clearInterval(escTimer);
                escTimer = null;
                isEscPressed = false;
                if (escTimerSpan) escTimerSpan.innerText = "0";
            }
            e.preventDefault();
            e.stopImmediatePropagation();
        }
    }, true);

    // 5. BLOCK RIGHT CLICK & SCROLL
    document.addEventListener('contextmenu', function(e) { if (isLocked) e.preventDefault(); });
    document.addEventListener('wheel', function(e) { if (isLocked) e.preventDefault(); }, { passive: false });

    // 6. EXIT PRANK
    function exitPrank() {
        isLocked = false;
        isEscPressed = false;
        clearInterval(escTimer);
        escTimer = null;

        prankOverlay.style.display = 'none';
        escProgress.style.display = 'none';
        fakeTopBar.style.display = 'none';
        document.body.style.pointerEvents = 'auto';
        document.documentElement.style.overflow = 'auto';
        startTrigger.style.display = 'none';

        if (document.exitFullscreen) document.exitFullscreen();
        else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
        else if (document.msExitFullscreen) document.msExitFullscreen();

        alert("✅ Prank finished!\nYou held ESC for 10 seconds.\nSystem is now safe.");
        window.location.reload();
    }
});
