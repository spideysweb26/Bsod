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

        document.body.style.pointerEvents = 'none';       // Prevent clicks
        document.documentElement.style.overflow = 'hidden'; // Hide scrollbars
        prankOverlay.style.pointerEvents = 'auto';        // Allow clicks inside the popup

        // Force fullscreen
        const el = document.documentElement;
        if (el.requestFullscreen) el.requestFullscreen();
        else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
        else if (el.msRequestFullscreen) el.msRequestFullscreen();
    });

    // 2. KEYBOARD LOCKDOWN
    document.addEventListener('keydown', (e) => {
        if (!isLocked) return;

        if (e.key === 'Escape') {
            if (!escTimer) {
                escStartTime = Date.now();
                escTimer = setInterval(() => {
                    const elapsed = Math.floor((Date.now() - escStartTime) / 1000);
                    escTimerSpan.innerText = elapsed;
                    if (elapsed >= 10) {
                        exitPrank(); // Actually unlock
                    }
                }, 100);
            }
            e.preventDefault();
            e.stopPropagation();
            return false;
        }

        // Block every other key (F11, Ctrl+W, etc)
        e.preventDefault();
        e.stopPropagation();
        return false;
    }, true);

    // 3. CANCEL ESCAPE TIMER IF RELEASED EARLY
    document.addEventListener('keyup', (e) => {
        if (!isLocked) return;
        if (e.key === 'Escape') {
            clearInterval(escTimer);
            escTimer = null;
            escTimerSpan.innerText = "0";
            e.preventDefault();
        }
    }, true);

    // 4. BLOCK RIGHT-CLICK & SCROLL
    document.addEventListener('contextmenu', (e) => { if (isLocked) e.preventDefault(); });
    document.addEventListener('wheel', (e) => { if (isLocked) e.preventDefault(); }, { passive: false });

    // 5. ULTIMATE FULLSCREEN RECOVERY (INSTANT)
    document.addEventListener('fullscreenchange', () => {
        if (isLocked && !document.fullscreenElement) {
            const el = document.documentElement;
            if (el.requestFullscreen) el.requestFullscreen();
            
            setTimeout(() => {
                if (isLocked && !document.fullscreenElement) {
                    if (el.requestFullscreen) el.requestFullscreen();
                }
            }, 0);
        }
    });

    // 6. EXIT FUNCTION (Held ESC for 10s) - UPDATED WITH CURSOR RESET
    function exitPrank() {
        isLocked = false;
        clearInterval(escTimer);
        escTimer = null;

        prankOverlay.style.display = 'none';
        escProgress.style.display = 'none';
        document.body.style.pointerEvents = 'auto';
        document.documentElement.style.overflow = 'auto';
        startTrigger.style.display = 'none';
        
        // Reset cursor back to normal when exiting
        document.documentElement.style.cursor = 'auto';

        if (document.exitFullscreen) document.exitFullscreen();
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
        else if (document.msExitFullscreen) document.msExitFullscreen();

        alert("✅ Prank finished!\nYou held ESC for 10 seconds.\nSystem is now safe.");
        window.location.reload();
    }
});
