document.addEventListener('DOMContentLoaded', () => {
    let isLocked = false;
    let escTimer = null;
    let escStartTime = 0;

    const startTrigger = document.getElementById('start-trigger');
    const prankOverlay = document.getElementById('prank-overlay');
    const escProgress = document.getElementById('esc-progress');
    const escTimerSpan = document.getElementById('esc-timer');

    // 1. ACTIVATE THE PRANK
    startTrigger.addEventListener('click', () => {
        if (isLocked) return;
        isLocked = true;

        startTrigger.style.display = 'none';
        prankOverlay.style.display = 'flex';
        escProgress.style.display = 'block';

        // LOCK MOUSE & SCROLL
        document.body.style.pointerEvents = 'none';       // Prevent clicks
        document.documentElement.style.overflow = 'hidden'; // Hide scrollbars
        prankOverlay.style.pointerEvents = 'auto';        // Allow clicks inside the popup

        // FORCE FULLSCREEN (Try twice for stubborn mobile browsers)
        const requestFullscreen = () => {
            const el = document.documentElement;
            if (el.requestFullscreen) el.requestFullscreen();
            else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
            else if (el.msRequestFullscreen) el.msRequestFullscreen();
        };
        requestFullscreen();
        setTimeout(requestFullscreen, 500); // Retry in half a second
    });

    // 2. ULTIMATE KEYBOARD LOCKDOWN (Capturing Phase)
    // The "true" at the end forces this to run BEFORE the browser handles F11 or shortcuts
    document.addEventListener('keydown', (e) => {
        if (!isLocked) return;

        // Handle the secret ESC exit (Hold for 10 seconds)
        if (e.key === 'Escape') {
            if (!escTimer) {
                escStartTime = Date.now();
                escTimer = setInterval(() => {
                    const elapsed = Math.floor((Date.now() - escStartTime) / 1000);
                    escTimerSpan.innerText = elapsed;
                    if (elapsed >= 10) {
                        exitPrank(); // Unlock only after 10s
                    }
                }, 100);
            }
            e.preventDefault();
            e.stopPropagation();
            return false;
        }

        // BLOCK EVERY SINGLE OTHER KEY (Including F11, Ctrl+W, Ctrl+R, Alt+F4)
        e.preventDefault();
        e.stopPropagation();
        return false;
    }, true); // <--- This "true" is the magic that fixes the Netlify issue!

    // 3. CANCEL ESCAPE TIMER IF KEY IS RELEASED EARLY
    document.addEventListener('keyup', (e) => {
        if (!isLocked) return;
        if (e.key === 'Escape') {
            clearInterval(escTimer);
            escTimer = null;
            escTimerSpan.innerText = "0";
            e.preventDefault();
        }
    }, true);

    // 4. BLOCK RIGHT-CLICK & MOUSE SCROLL WHEEL
    document.addEventListener('contextmenu', (e) => { if (isLocked) e.preventDefault(); });
    document.addEventListener('wheel', (e) => { if (isLocked) e.preventDefault(); }, { passive: false });

    // 5. ANTICHEAT: INSTANTLY FORCE FULLSCREEN BACK IF THEY EXIT EARLY
    document.addEventListener('fullscreenchange', () => {
        if (isLocked && !document.fullscreenElement) {
            // If they press Esc once, instantly force fullscreen back in 50 milliseconds
            setTimeout(() => {
                if(isLocked && !document.fullscreenElement) {
                    const el = document.documentElement;
                    if (el.requestFullscreen) el.requestFullscreen();
                }
            }, 50);
        }
    });

    // 6. EXIT FUNCTION (Held ESC for 10s)
    function exitPrank() {
        isLocked = false;
        clearInterval(escTimer);
        escTimer = null;

        prankOverlay.style.display = 'none';
        escProgress.style.display = 'none';
        document.body.style.pointerEvents = 'auto';
        document.documentElement.style.overflow = 'auto';
        startTrigger.style.display = 'none';

        // Exit fullscreen officially
        if (document.exitFullscreen) document.exitFullscreen();
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
        else if (document.msExitFullscreen) document.msExitFullscreen();

        alert("✅ Prank finished!\nYou held ESC for 10 seconds.\nSystem is now safe.");
        window.location.reload();
    }
});
