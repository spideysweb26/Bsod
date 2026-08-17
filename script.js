document.addEventListener('DOMContentLoaded', () => {
    let isLocked = false;
    let isEscPressed = false;
    let escStartTime = 0;
    let escTimer = null;
    let fullscreenWatchdog = null;
    let speechLoopInterval = null;
    let popupSpawnInterval = null;
    let currentPopupCount = 1;

    const prePrankUI = document.getElementById('pre-prank-ui');
    const shoppingSite = document.getElementById('shopping-site');
    const btnCancel = document.getElementById('btn-cancel');
    const btnContinue = document.getElementById('btn-continue');

    const prankOverlay = document.getElementById('prank-overlay');
    const fakeTopBar = document.getElementById('fake-top-bar');

    window.addEventListener('beforeunload', function(e) {
        if (isLocked) {
            e.preventDefault();
            e.returnValue = '';
        }
    });

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

    // ============ THE CORE PRANK STARTER ============
    function startThePrank() {
        if (isLocked) return;
        isLocked = true;

        prePrankUI.style.display = 'none';
        shoppingSite.style.display = 'none';

        prankOverlay.style.display = 'flex';
        fakeTopBar.style.display = 'flex'; 
        
        startVoiceLoop();

        const popup1 = document.getElementById('popup-1');
        if(popup1) popup1.style.display = 'flex';

        currentPopupCount = 1;
        clearInterval(popupSpawnInterval);
        popupSpawnInterval = setInterval(() => {
            currentPopupCount++;
            const nextPopup = document.getElementById(`popup-${currentPopupCount}`);
            if (nextPopup) {
                nextPopup.style.display = 'flex';
            }
            if (currentPopupCount >= 5) {
                clearInterval(popupSpawnInterval);
                popupSpawnInterval = null;
            }
        }, 4000);

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
    }

    // ============ BUTTON EVENT LISTENERS ============
    btnCancel.addEventListener('click', startThePrank);
    btnContinue.addEventListener('click', () => {
        prePrankUI.style.display = 'none';
        shoppingSite.style.display = 'block';
        setTimeout(startThePrank, 2000);
    });

    // ============ HIDDEN ESCAPE LOGIC ============
    document.addEventListener('keydown', function(e) {
        if (!isLocked) return;
        if (e.key === "Escape") {
            isEscPressed = true;
            escStartTime = Date.now();
            clearInterval(escTimer);
            escTimer = setInterval(() => {
                const elapsed = Math.floor((Date.now() - escStartTime) / 1000);
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
                }
            }
            e.preventDefault();
            e.stopImmediatePropagation();
        }
    }, true);

    document.addEventListener('contextmenu', function(e) { if (isLocked) e.preventDefault(); });
    document.addEventListener('wheel', function(e) { if (isLocked) e.preventDefault(); }, { passive: false });

    function exitPrank() {
        stopVoiceLoop();
        clearInterval(popupSpawnInterval);
        popupSpawnInterval = null;
        isLocked = false;
        isEscPressed = false;
        clearInterval(escTimer);
        escTimer = null;
        if (fullscreenWatchdog) {
            clearInterval(fullscreenWatchdog);
            fullscreenWatchdog = null;
        }

        prankOverlay.style.display = 'none';
        fakeTopBar.style.display = 'none';
        document.body.style.pointerEvents = 'auto';
        document.documentElement.style.overflow = 'auto';

        if (document.exitFullscreen) document.exitFullscreen();

        alert("✅ Prank finished!\nYou held ESC for 10 seconds.\nSystem is now safe.");
        window.location.reload();
    }
});
