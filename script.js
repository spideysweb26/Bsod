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

        // LOCK MOUSE: Prevent clicking anything in the background
        document.body.style.pointerEvents = 'none';
        // Allow clicking within the prank overlay so buttons still work
        prankOverlay.style.pointerEvents = 'auto';

        // Force fullscreen
        const el = document.documentElement;
        if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
        else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
        else if (el.msRequestFullscreen) el.msRequestFullscreen();
    });

    // 2. COMPLETE KEYBOARD LOCKDOWN
    document.addEventListener('keydown', (e) => {
        if (!isLocked) return;

        // Only exception: holding ESC for 10 seconds
        if (e.key === 'Escape') {
            if (!escTimer) {
                escStartTime = Date.now();
                escTimer = setInterval(() => {
                    const elapsed = Math.floor((Date.now() - escStartTime) / 1000);
                    escTimerSpan.innerText = elapsed;
                    if (elapsed >= 10) {
                        exitPrank(); // Trigger escape
                    }
                }, 100);
            }
            e.preventDefault();
            return false;
        }

        // BLOCK EVERY SINGLE OTHER KEY (F11, Alt+F4, Ctrl+W, Ctrl+R, etc.)
        e.preventDefault();
        e.stopPropagation();
        return false;
    });

    // 3. CANCEL ESCAPE IF KEY IS RELEASED
    document.addEventListener('keyup', (e) => {
        if (!isLocked) return;
        if (e.key === 'Escape') {
            clearInterval(escTimer);
            escTimer = null;
            escTimerSpan.innerText = "0";
            e.preventDefault();
        }
    });

    // 4. BLOCK CONTEXT MENU (Right click)
    document.addEventListener('contextmenu', (e) => {
        if (isLocked) e.preventDefault();
    });

    // 5. ANTI-CHEAT: FORCE FULLSCREEN BACK IF THEY ESCAPE IT EARLY
    document.addEventListener('fullscreenchange', () => {
        if (isLocked && !document.fullscreenElement) {
            setTimeout(() => {
                if(isLocked && !document.fullscreenElement) {
                    document.documentElement.requestFullscreen();
                }
            }, 100);
        }
    });
    document.addEventListener('webkitfullscreenchange', () => {
        if (isLocked && !document.webkitFullscreenElement) {
            setTimeout(() => {
                if(isLocked && !document.webkitFullscreenElement) {
                    document.documentElement.webkitRequestFullscreen();
                }
            }, 100);
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
        startTrigger.style.display = 'none';

        // Exit fullscreen
        if (document.exitFullscreen) document.exitFullscreen();
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
        else if (document.msExitFullscreen) document.msExitFullscreen();

        alert("✅ Prank finished!\nYou held ESC for 10 seconds.\nSystem is now safe.");
        window.location.reload();
    }
});