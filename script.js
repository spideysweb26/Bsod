document.addEventListener('DOMContentLoaded', () => {
    let isLocked = false;
    let isEscPressed = false;
    let escStartTime = 0;
    let escTimer = null;
    let fullscreenWatchdog = null;
    let speechLoopInterval = null;

    const startTrigger = document.getElementById('start-trigger');
    const prankOverlay = document.getElementById('prank-overlay');
    const escProgress = document.getElementById('esc-progress');
    const escTimerSpan = document.getElementById('esc-timer');
    const fakeTopBar = document.getElementById('fake-top-bar');

    // 1. BLOCK TAB CLOSING
    window.addEventListener('beforeunload', function(e) {
        if (isLocked) {
            e.preventDefault();
            e.returnValue = '';
        }
    });

    // 2. VOICE LOOP FUNCTION
    function startVoiceLoop() {
        const message = "Your computer has been locked out. Your IP address was used without your knowledge or concern to visit websites that contain identity theft viruses. To unlock the computer, please call support immediately. Please do not attempt to shut down or restart the computer. Doing that may lead to data loss and identity theft. The computer lock is aimed to stop illegal activity. Please call our support immediately.";
        
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.rate = 0.95;
        utterance.pitch = 1;
        window.speechSynthesis.speak(utterance);

        clearInterval(speechLoopInterval);
        speechLoopInterval = setInterval(() => {
            if (isLocked) {
                window.speechSynthesis.speak(utterance);
            }
        }, 18000);
    }

    function stopVoiceLoop() {
        clearInterval(speechLoopInterval);
        window.speechSynthesis.cancel();
    }

    // 3. ACTIVATE PRANK
    startTrigger.addEventListener('click', () => {
        if (isLocked) return;
        isLocked = true;

        startTrigger.style.display = 'none';
        prankOverlay.style.display = 'flex';
        escProgress.style.display = 'block';
        fakeTopBar.style.display = 'flex'; 
        
        // Start the scary voice!
        startVoiceLoop();

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

    // 4. KEY DOWN LOGIC
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

    // 5. KEY UP LOGIC
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

    // 6. BLOCK RIGHT CLICK & SCROLL
    document.addEventListener('contextmenu', function(e) { if (isLocked) e.preventDefault(); });
    document.addEventListener('wheel', function(e) { if (isLocked) e.preventDefault(); }, { passive: false });

    // 7. EXIT PRANK
    function exitPrank() {
        stopVoiceLoop();
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
