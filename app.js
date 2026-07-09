// Timer Durations (in seconds)
const DURATIONS = {
    pomodoro: 25 * 60,
    short: 5 * 60,
    long: 15 * 60
};

const MODE_LABELS = {
    pomodoro: "GET TO WORK",
    short: "TAKE A BREATHER",
    long: "UNWIND A BIT"
};

// State Variables
let currentMode = 'pomodoro';
let timeRemaining = DURATIONS[currentMode];
let maxTime = DURATIONS[currentMode];
let isRunning = false;
let timerId = null;
let sessionsCompleted = 0;

// DOM Elements
const timerCountdown = document.getElementById('timer-countdown');
const timerStateLabel = document.getElementById('timer-state-label');
const btnToggle = document.getElementById('btn-toggle');
const btnReset = document.getElementById('btn-reset');
const playIcon = document.getElementById('play-icon');
const pauseIcon = document.getElementById('pause-icon');
const progressCircle = document.getElementById('timer-progress');
const sessionsCount = document.getElementById('sessions-count');
const modeButtons = document.querySelectorAll('.mode-btn');

// Progress Circle Setup
const radius = progressCircle.r.baseVal.value;
const circumference = 2 * Math.PI * radius;

progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;
progressCircle.style.strokeDashoffset = 0;

// Functions
function updateDisplay() {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');
    
    // Update main text
    timerCountdown.textContent = `${formattedMinutes}:${formattedSeconds}`;
    
    // Update browser tab title
    document.title = `${formattedMinutes}:${formattedSeconds} | ZenFocus`;
    
    // Update circular progress
    const progress = (timeRemaining / maxTime);
    const offset = circumference * (1 - progress);
    progressCircle.style.strokeDashoffset = offset;
}

function switchMode(newMode) {
    // Prevent switching mode when timer is running
    if (isRunning) {
        pauseTimer();
    }
    
    currentMode = newMode;
    timeRemaining = DURATIONS[newMode];
    maxTime = DURATIONS[newMode];
    
    // Update active class on buttons
    modeButtons.forEach(btn => {
        if (btn.dataset.mode === newMode) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    timerStateLabel.textContent = MODE_LABELS[newMode];
    updateDisplay();
}

function startTimer() {
    if (isRunning) return;
    
    isRunning = true;
    playIcon.classList.add('hidden');
    pauseIcon.classList.remove('hidden');
    
    timerId = setInterval(() => {
        timeRemaining--;
        updateDisplay();
        
        if (timeRemaining <= 0) {
            clearInterval(timerId);
            timerId = null;
            isRunning = false;
            
            // Play alert sound
            playBeep();
            
            if (currentMode === 'pomodoro') {
                sessionsCompleted++;
                sessionsCount.textContent = sessionsCompleted;
            }
            
            // Switch to appropriate break or work
            if (currentMode === 'pomodoro') {
                if (sessionsCompleted % 4 === 0) {
                    switchMode('long');
                } else {
                    switchMode('short');
                }
            } else {
                switchMode('pomodoro');
            }
            
            // Reset control icons
            playIcon.classList.remove('hidden');
            pauseIcon.classList.add('hidden');
        }
    }, 1000);
}

function pauseTimer() {
    if (!isRunning) return;
    
    isRunning = false;
    clearInterval(timerId);
    timerId = null;
    
    playIcon.classList.remove('hidden');
    pauseIcon.classList.add('hidden');
}

function resetTimer() {
    pauseTimer();
    timeRemaining = DURATIONS[currentMode];
    updateDisplay();
}

// Built-in Synthesizer Beep (Web Audio API)
function playBeep() {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        
        // Double beep pattern
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
        
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.4);
        
        // Second beep after 0.5s
        setTimeout(() => {
            const osc2 = audioCtx.createOscillator();
            const gain2 = audioCtx.createGain();
            
            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(880, audioCtx.currentTime);
            gain2.gain.setValueAtTime(0.1, audioCtx.currentTime);
            gain2.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
            
            osc2.connect(gain2);
            gain2.connect(audioCtx.destination);
            
            osc2.start();
            osc2.stop(audioCtx.currentTime + 0.4);
        }, 300);
        
    } catch (e) {
        console.warn("Audio Context error: ", e);
    }
}

// Event Listeners
btnToggle.addEventListener('click', () => {
    if (isRunning) {
        pauseTimer();
    } else {
        startTimer();
    }
});

btnReset.addEventListener('click', resetTimer);

modeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        switchMode(btn.dataset.mode);
    });
});

// Initial Setup
updateDisplay();
timerStateLabel.textContent = MODE_LABELS[currentMode];
