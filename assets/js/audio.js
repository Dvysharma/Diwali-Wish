/**
 * Gentle Background Music Engine
 * Soft toddler-friendly musical loop for the film and story experience.
 * 100% offline, zero external dependencies.
 */

class CinematicAudioEngine {
    constructor(options = {}) {
        this.ctx = null;
        this.isPlaying = false;
        this.masterGain = null;
        this.reverbNode = null;
        this.tempo = options.tempo || 118; // Fast, playful toddler pace (BPM)
        this.beatLen = 60 / this.tempo; // ~0.508s per beat
        this.barLen = this.beatLen * 4;  // ~2.03s per bar
        this.loopTimer = null;
        this.onStateChange = null;
        this.audio = null;
        this.audioPath = options.audioPath || null;

        if (this.audioPath) {
            this.audio = new Audio(this.audioPath);
            this.audio.loop = true;
            this.audio.preload = 'auto';
            this.audio.volume = 0.5;
            this.audio.crossOrigin = 'anonymous';
        }

        // Fast, playful toddler melody in a happy sing-along range.
        this.energeticMelody = [
            { note: 261.63, dur: 0.22, time: 0.00, type: 'santoor' }, // C4
            { note: 329.63, dur: 0.20, time: 0.28, type: 'sitar' },   // E4
            { note: 392.00, dur: 0.22, time: 0.56, type: 'santoor' }, // G4
            { note: 440.00, dur: 0.20, time: 0.84, type: 'sitar' },   // A4
            { note: 392.00, dur: 0.22, time: 1.12, type: 'santoor' }, // G4
            { note: 329.63, dur: 0.22, time: 1.40, type: 'sitar' },   // E4
            { note: 293.66, dur: 0.30, time: 1.68, type: 'santoor' }, // D4
            { note: 261.63, dur: 0.36, time: 1.96, type: 'sitar' },   // C4

            { note: 329.63, dur: 0.18, time: 2.40, type: 'santoor' }, // E4
            { note: 392.00, dur: 0.18, time: 2.68, type: 'sitar' },   // G4
            { note: 523.25, dur: 0.20, time: 2.96, type: 'santoor' }, // C5
            { note: 587.33, dur: 0.22, time: 3.24, type: 'sitar' },   // D5
            { note: 523.25, dur: 0.20, time: 3.52, type: 'santoor' }, // C5
            { note: 392.00, dur: 0.20, time: 3.80, type: 'sitar' },   // G4
            { note: 329.63, dur: 0.34, time: 4.08, type: 'santoor' }, // E4
            { note: 261.63, dur: 0.42, time: 4.36, type: 'sitar' }    // C4
        ];

        this.cycleDuration = 5.2; // ~5.2s per fast loop
    }

    init() {
        if (this.audioPath && !this.audio) {
            this.audio = new Audio(this.audioPath);
            this.audio.loop = true;
            this.audio.preload = 'auto';
            this.audio.volume = 0.5;
            this.audio.crossOrigin = 'anonymous';
        }

        if (this.ctx) return;
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        this.ctx = new AudioContext();

        // Master Gain
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.14, this.ctx.currentTime);

        // Light reflective ambience for a bright playful feel.
        this.reverbNode = this.createReverb(1.7, 0.016);
        this.masterGain.connect(this.reverbNode);
        this.reverbNode.connect(this.ctx.destination);

        // Direct warm signal
        const dryGain = this.ctx.createGain();
        dryGain.gain.setValueAtTime(0.82, this.ctx.currentTime);
        this.masterGain.connect(dryGain);
        dryGain.connect(this.ctx.destination);
    }

    createReverb(duration, decay) {
        const sampleRate = this.ctx.sampleRate;
        const length = sampleRate * duration;
        const impulse = this.ctx.createBuffer(2, length, sampleRate);
        const left = impulse.getChannelData(0);
        const right = impulse.getChannelData(1);

        for (let i = 0; i < length; i++) {
            const n = i / length;
            left[i] = (Math.random() * 2 - 1) * Math.pow(1 - n, 2) * 0.35;
            right[i] = (Math.random() * 2 - 1) * Math.pow(1 - n, 2) * 0.35;
        }

        const convolver = this.ctx.createConvolver();
        convolver.buffer = impulse;
        return convolver;
    }

    // High-energy plucked instruments (Santoor / Sitar)
    playPluck(freq, startTime, duration, type = 'santoor') {
        if (!this.ctx || !this.isPlaying) return;

        const osc = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        if (type === 'santoor') {
            osc.type = 'triangle';
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(freq * 1.6, startTime);
            filter.frequency.exponentialRampToValueAtTime(freq * 1.08, startTime + duration);
            filter.Q.setValueAtTime(2.8, startTime);

            noteGain.gain.setValueAtTime(0.0001, startTime);
            noteGain.gain.linearRampToValueAtTime(0.22, startTime + 0.016);
            noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
        } else {
            osc.type = 'sine';
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(2200, startTime);
            filter.frequency.exponentialRampToValueAtTime(500, startTime + duration);

            noteGain.gain.setValueAtTime(0.0001, startTime);
            noteGain.gain.linearRampToValueAtTime(0.26, startTime + 0.014);
            noteGain.gain.exponentialRampToValueAtTime(0.06, startTime + 0.12);
            noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
        }

        osc.frequency.setValueAtTime(freq, startTime);
        osc.connect(filter);
        filter.connect(noteGain);
        noteGain.connect(this.masterGain);

        osc.start(startTime);
        osc.stop(startTime + duration + 0.05);
    }

    // Punchy Dhol / Bass Drum (Energetic Kick)
    playDholBass(startTime) {
        if (!this.ctx || !this.isPlaying) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(120, startTime);
        osc.frequency.exponentialRampToValueAtTime(46, startTime + 0.18);

        gain.gain.setValueAtTime(0.001, startTime);
        gain.gain.linearRampToValueAtTime(0.26, startTime + 0.008);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.18);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(startTime);
        osc.stop(startTime + 0.28);
    }

    // Soft clap-like percussive accent
    playDholakSlap(startTime) {
        if (!this.ctx || !this.isPlaying) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(260, startTime);

        filter.type = 'highpass';
        filter.frequency.setValueAtTime(700, startTime);

        gain.gain.setValueAtTime(0.001, startTime);
        gain.gain.linearRampToValueAtTime(0.14, startTime + 0.005);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.05);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        osc.start(startTime);
        osc.stop(startTime + 0.07);
    }

    // Cheerful little bell sparkle
    playManjiraBell(startTime) {
        if (!this.ctx || !this.isPlaying) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(3296.3, startTime);

        gain.gain.setValueAtTime(0.0001, startTime);
        gain.gain.linearRampToValueAtTime(0.06, startTime + 0.0035);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.14);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(startTime);
        osc.stop(startTime + 0.18);
    }

    // Schedule the gentle toddler-style background loop
    scheduleEnergeticCycle() {
        if (this.audio) return;
        if (!this.isPlaying || !this.ctx) return;
        const now = this.ctx.currentTime;

        this.energeticMelody.forEach(item => {
            this.playPluck(item.note, now + item.time, item.dur, item.type);
        });

        const numBars = 2;
        for (let b = 0; b < numBars; b++) {
            const barStart = now + (b * this.barLen);

            this.playDholBass(barStart);
            this.playDholBass(barStart + (this.beatLen * 2));

            this.playDholakSlap(barStart + this.beatLen);
            this.playDholakSlap(barStart + (this.beatLen * 3.5));

            for (let i = 0; i < 4; i++) {
                this.playManjiraBell(barStart + (i * (this.beatLen * 0.8)));
            }
        }

        this.loopTimer = setTimeout(() => {
            this.scheduleEnergeticCycle();
        }, this.cycleDuration * 1000);
    }

    // Sparkle Chime on User Interaction
    playSparkleChime() {
        if (!this.ctx) this.init();
        if (this.ctx.state === 'suspended') this.ctx.resume();

        const now = this.ctx.currentTime;
        const freqs = [1046.50, 1318.51, 1567.98, 2093.00, 2637.02];
        freqs.forEach((f, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(f, now + (idx * 0.03));

            gain.gain.setValueAtTime(0.0001, now + (idx * 0.03));
            gain.gain.linearRampToValueAtTime(0.08, now + (idx * 0.03) + 0.008);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + (idx * 0.03) + 0.45);

            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(now + (idx * 0.03));
            osc.stop(now + (idx * 0.03) + 0.5);
        });
    }

    // Diya Ignition Resonance
    playDiyaIgnitionSound() {
        if (!this.ctx) this.init();
        if (this.ctx.state === 'suspended') this.ctx.resume();

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(261.63, now);
        osc.frequency.exponentialRampToValueAtTime(523.25, now + 0.35);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.24, now + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.0);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 2.1);

        setTimeout(() => this.playSparkleChime(), 150);
    }

    async start() {
        this.init();

        if (this.audio) {
            try {
                if (this.audio.paused) {
                    await this.audio.play();
                }
            } catch (e) {
                // Audio playback may be blocked until user interaction; retry on next click.
            }
        }

        if (this.ctx && this.ctx.state === 'suspended') {
            try {
                await this.ctx.resume();
            } catch (e) {}
        }

        if (this.isPlaying) return;
        this.isPlaying = true;

        if (this.masterGain && this.ctx) {
            try {
                this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
                this.masterGain.gain.setValueAtTime(0.22, this.ctx.currentTime);
            } catch (e) {}
        }

        if (!this.audio) {
            this.scheduleEnergeticCycle();
        }

        if (this.onStateChange) this.onStateChange(true);
    }

    stop() {
        if (this.audio) {
            this.audio.pause();
        }

        if (!this.isPlaying) return;
        this.isPlaying = false;

        if (this.loopTimer) {
            clearTimeout(this.loopTimer);
            this.loopTimer = null;
        }

        // Instantly and completely silence audio output
        if (this.masterGain && this.ctx) {
            try {
                this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
                this.masterGain.gain.setValueAtTime(0.00001, this.ctx.currentTime);
            } catch (e) {}
        }

        if (this.ctx && this.ctx.state === 'running') {
            try {
                this.ctx.suspend();
            } catch (e) {}
        }

        if (this.onStateChange) this.onStateChange(false);
    }

    toggle() {
        if (this.isPlaying) {
            this.stop();
        } else {
            this.start();
        }
    }
}

window.cinematicAudio = new CinematicAudioEngine({
    audioPath: 'assets/audio/Children%20Background%20Music.mp3'
});

window.themeAudio = new CinematicAudioEngine({
    tempo: 112
});

window.diyaSongPlayer = new Audio('assets/audio/Jethalal%20Happy%20Diwali%20Song!.mp3');
window.diyaSongPlayer.preload = 'auto';
window.diyaSongPlayer.loop = false;
window.diyaSongPlayer.volume = 0.55;

window.playDiyaSong = function() {
    if (!window.diyaSongPlayer) return;

    try {
        window.diyaSongPlayer.currentTime = 0;
    } catch (e) {}

    const playPromise = window.diyaSongPlayer.play();
    if (playPromise && typeof playPromise.then === 'function') {
        playPromise.catch(() => {});
    }
};