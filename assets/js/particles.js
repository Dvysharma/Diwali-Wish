/**
 * Diwali Cinematic Particle & Visual FX Engine
 * Manages:
 * 1. Background golden glowing embers & bokeh
 * 2. Drifting festive marigold petals
 * 3. Interactive click/tap firework sparkle bursts
 * 4. Realistic canvas Diya flame simulation
 */

class DiwaliParticleSystem {
    constructor() {
        this.canvas = document.getElementById('particle-canvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.width = window.innerWidth;
        this.height = window.innerHeight;

        this.particles = [];
        this.petals = [];
        this.bursts = [];

        this.maxParticles = window.innerWidth < 768 ? 40 : 80;
        this.maxPetals = window.innerWidth < 768 ? 15 : 30;

        this.init();
        this.bindEvents();
        this.animate();
    }

    init() {
        this.resize();
        this.particles = [];
        for (let i = 0; i < this.maxParticles; i++) {
            this.particles.push(this.createEmber());
        }

        this.petals = [];
        for (let i = 0; i < this.maxPetals; i++) {
            this.petals.push(this.createPetal(true));
        }
    }

    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width * window.devicePixelRatio;
        this.canvas.height = this.height * window.devicePixelRatio;
        this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }

    bindEvents() {
        window.addEventListener('resize', () => this.resize());

        // Sparkle burst on touch / click
        window.addEventListener('pointerdown', (e) => {
            // Ignore if clicking on interactive controls
            if (e.target.closest('button, input, select, a, .no-sparkle')) return;
            this.createBurst(e.clientX, e.clientY);
            if (window.cinematicAudio) {
                window.cinematicAudio.playSparkleChime();
            }
        });
    }

    createEmber() {
        return {
            x: Math.random() * this.width,
            y: Math.random() * this.height,
            size: Math.random() * 2.5 + 1.0,
            speedY: -(Math.random() * 0.8 + 0.3),
            speedX: (Math.random() - 0.5) * 0.4,
            opacity: Math.random() * 0.7 + 0.2,
            fadeSpeed: Math.random() * 0.008 + 0.003,
            color: Math.random() > 0.4 ? 'rgba(255, 215, 0,' : 'rgba(255, 140, 0,'
        };
    }

    createPetal(randomY = false) {
        return {
            x: Math.random() * this.width,
            y: randomY ? Math.random() * this.height : -20,
            size: Math.random() * 8 + 6,
            speedY: Math.random() * 1.2 + 0.8,
            speedX: Math.random() * 0.8 - 0.2,
            angle: Math.random() * 360,
            angularSpeed: (Math.random() - 0.5) * 2,
            color: Math.random() > 0.5 ? '#ff9900' : '#ff5500',
            opacity: Math.random() * 0.6 + 0.3
        };
    }

    createBurst(x, y, count = 24) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 4.5 + 1.5;
            this.bursts.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: Math.random() * 3.5 + 1.5,
                color: ['#ffd700', '#ffaa00', '#ffffff', '#ff6600'][Math.floor(Math.random() * 4)],
                life: 1.0,
                decay: Math.random() * 0.03 + 0.018
            });
        }
    }

    createDiyaCelebrationBurst(x, y) {
        const clusters = [
            { x: x - 40, y: y - 20, count: 26, colors: ['#ffd700', '#ff8c00', '#fff2a8'] },
            { x: x + 35, y: y - 10, count: 22, colors: ['#ff6600', '#ffd700', '#ffffff'] },
            { x: x, y: y - 55, count: 30, colors: ['#ff3300', '#ffb000', '#fff3b0'] },
            { x: x - 18, y: y + 35, count: 18, colors: ['#7cff6b', '#ffd700', '#ffffff'] },
            { x: x + 22, y: y + 28, count: 18, colors: ['#ff4d4d', '#ffaa00', '#ffe082'] }
        ];

        clusters.forEach((cluster, index) => {
            setTimeout(() => {
                for (let i = 0; i < cluster.count; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    const speed = Math.random() * 4.2 + 1.8;
                    const color = cluster.colors[Math.floor(Math.random() * cluster.colors.length)];

                    this.bursts.push({
                        x: cluster.x,
                        y: cluster.y,
                        vx: Math.cos(angle) * speed,
                        vy: Math.sin(angle) * speed - 0.7,
                        size: Math.random() * 4 + 2,
                        color,
                        life: 1.0,
                        decay: Math.random() * 0.03 + 0.022
                    });
                }
            }, index * 100);
        });
    }

    animate() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        // 1. Draw glowing Embers
        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            p.y += p.speedY;
            p.x += p.speedX;
            p.opacity += p.fadeSpeed;

            if (p.opacity > 0.9 || p.opacity < 0.15) {
                p.fadeSpeed = -p.fadeSpeed;
            }

            if (p.y < -10) {
                p.y = this.height + 10;
                p.x = Math.random() * this.width;
            }

            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fillStyle = p.color + p.opacity + ')';
            this.ctx.shadowBlur = 8;
            this.ctx.shadowColor = '#ffb300';
            this.ctx.fill();
        }

        // 2. Draw Marigold Petals
        for (let i = 0; i < this.petals.length; i++) {
            const petal = this.petals[i];
            petal.y += petal.speedY;
            petal.x += Math.sin(petal.y * 0.02) * 0.6 + petal.speedX;
            petal.angle += petal.angularSpeed;

            if (petal.y > this.height + 20) {
                Object.assign(petal, this.createPetal(false));
            }

            this.ctx.save();
            this.ctx.translate(petal.x, petal.y);
            this.ctx.rotate((petal.angle * Math.PI) / 180);
            this.ctx.globalAlpha = petal.opacity;

            // Draw petal shape
            this.ctx.beginPath();
            this.ctx.fillStyle = petal.color;
            this.ctx.shadowBlur = 4;
            this.ctx.shadowColor = '#ff6b00';
            this.ctx.ellipse(0, 0, petal.size * 0.6, petal.size * 0.35, 0, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        }

        // 3. Draw Sparkle Bursts
        for (let i = this.bursts.length - 1; i >= 0; i--) {
            const b = this.bursts[i];
            b.x += b.vx;
            b.y += b.vy;
            b.vy += 0.08; // gravity
            b.vx *= 0.96; // drag
            b.life -= b.decay;

            if (b.life <= 0) {
                this.bursts.splice(i, 1);
                continue;
            }

            this.ctx.beginPath();
            this.ctx.arc(b.x, b.y, b.size * b.life, 0, Math.PI * 2);
            this.ctx.fillStyle = b.color;
            this.ctx.globalAlpha = b.life;
            this.ctx.shadowBlur = 12;
            this.ctx.shadowColor = '#fff';
            this.ctx.fill();
            this.ctx.globalAlpha = 1.0;
        }

        requestAnimationFrame(() => this.animate());
    }
}

// Diya Flame Simulator
class DiyaFlameSimulator {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.isLit = false;
        this.particles = [];
        this.time = 0;
        this.init();
    }

    init() {
        this.canvas.width = 140;
        this.canvas.height = 180;
        this.animate();
    }

    light() {
        this.isLit = true;
        this.canvas.classList.add('lit');
    }

    extinguish() {
        this.isLit = false;
        this.canvas.classList.remove('lit');
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.isLit) {
            this.time += 0.08;
            const cx = this.canvas.width / 2;
            const cy = this.canvas.height - 30;

            // Wobble
            const wobbleX = Math.sin(this.time * 2.5) * 2.2 + Math.cos(this.time * 4) * 1.5;
            const flameHeight = 65 + Math.sin(this.time * 3.5) * 6;

            // Outer Golden Aura
            const radialGrad = this.ctx.createRadialGradient(cx + wobbleX, cy - flameHeight * 0.4, 5, cx, cy - flameHeight * 0.4, 60);
            radialGrad.addColorStop(0, 'rgba(255, 200, 50, 0.5)');
            radialGrad.addColorStop(0.5, 'rgba(255, 120, 20, 0.2)');
            radialGrad.addColorStop(1, 'rgba(255, 80, 0, 0)');

            this.ctx.fillStyle = radialGrad;
            this.ctx.beginPath();
            this.ctx.arc(cx, cy - flameHeight * 0.4, 60, 0, Math.PI * 2);
            this.ctx.fill();

            // Main Flame teardrop
            this.ctx.beginPath();
            this.ctx.moveTo(cx - 14, cy);
            this.ctx.quadraticCurveTo(cx - 18, cy - flameHeight * 0.5, cx + wobbleX, cy - flameHeight);
            this.ctx.quadraticCurveTo(cx + 18, cy - flameHeight * 0.5, cx + 14, cy);
            this.ctx.closePath();

            const flameGrad = this.ctx.createLinearGradient(cx, cy, cx + wobbleX, cy - flameHeight);
            flameGrad.addColorStop(0, '#ff4500');
            flameGrad.addColorStop(0.3, '#ff9900');
            flameGrad.addColorStop(0.7, '#ffd700');
            flameGrad.addColorStop(1, '#ffffff');

            this.ctx.fillStyle = flameGrad;
            this.ctx.shadowBlur = 25;
            this.ctx.shadowColor = '#ffa500';
            this.ctx.fill();

            // Inner intense white-blue core
            this.ctx.beginPath();
            this.ctx.moveTo(cx - 6, cy);
            this.ctx.quadraticCurveTo(cx - 8, cy - flameHeight * 0.35, cx + wobbleX * 0.5, cy - flameHeight * 0.5);
            this.ctx.quadraticCurveTo(cx + 8, cy - flameHeight * 0.35, cx + 6, cy);
            this.ctx.closePath();

            const coreGrad = this.ctx.createLinearGradient(cx, cy, cx, cy - flameHeight * 0.5);
            coreGrad.addColorStop(0, 'rgba(100, 200, 255, 0.8)');
            coreGrad.addColorStop(0.4, 'rgba(255, 255, 255, 0.95)');
            coreGrad.addColorStop(1, 'rgba(255, 230, 150, 0.8)');

            this.ctx.fillStyle = coreGrad;
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = '#fff';
            this.ctx.fill();
        }

        requestAnimationFrame(() => this.animate());
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.diwaliParticles = new DiwaliParticleSystem();
});