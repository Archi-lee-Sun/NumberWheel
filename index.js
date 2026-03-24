const canvas = document.getElementById('wheel');
const ctx = canvas.getContext('2d');
const spinBtn = document.getElementById('spinBtn');
const resultEl = document.getElementById('resultNumber');
const resultDisplay = document.getElementById('resultDisplay');
const historyList = document.getElementById('historyList');
const minInput = document.getElementById('minValue');
const maxInput = document.getElementById('maxValue');

const COLORS = ['#60A5FA','#34D399','#FBBF24','#F87171','#A78BFA','#F472B6','#22D3EE','#FB923C'];

const cx = canvas.width / 2;
const cy = canvas.height / 2;
const radius = 200;

let currentAngle = 0;
let isSpinning = false;
let segmentNumbers = [];
let history = [];

// ── Read min/max from inputs ──────────────────────────────
function getRange() {
    const min = parseInt(minInput.value);
    const max = parseInt(maxInput.value);
    return { min, max, count: max - min + 1 };
}

// ── Fill segment numbers array ────────────────────────────
function fillSegments(min, max) {
    segmentNumbers = [];
    for (let i = min; i <= max; i++) {
        segmentNumbers.push(i);
    }
}

// ── Draw the wheel ────────────────────────────────────────
function drawWheel(rotationAngle) {
    const { min, max, count } = getRange();

    if (isNaN(min) || isNaN(max) || count < 1) return;

    fillSegments(min, max);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const sliceAngle = (2 * Math.PI) / count;

    for (let i = 0; i < count; i++) {
        const startAngle = rotationAngle + i * sliceAngle;
        const endAngle = startAngle + sliceAngle;

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, radius, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = COLORS[i % COLORS.length];
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.lineWidth = 2;
        ctx.stroke();

        if (count <= 36) {
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(startAngle + sliceAngle / 2);
            ctx.textAlign = 'right';
            ctx.fillStyle = 'rgba(255,255,255,0.9)';
            const fontSize = count <= 10 ? 16 : count <= 20 ? 13 : 10;
            ctx.font = `bold ${fontSize}px Inter, sans-serif`;
            ctx.fillText(segmentNumbers[i], radius - 12, 6);
            ctx.restore();
        }
    }
}

// ── Add result to history chips ───────────────────────────
function addHistory(n) {
    history.unshift(n);
    if (history.length > 7) history.pop();
    historyList.innerHTML = history
        .map(h => `<span class="history-chip">${h}</span>`)
        .join('');
}

// ── Easing function ───────────────────────────────────────
function easeOut(t) {
    return 1 - Math.pow(1 - t, 4);
}

// ── Spin ──────────────────────────────────────────────────
function spin() {
    if (isSpinning) return;

    const { min, max, count } = getRange();
    if (isNaN(min) || isNaN(max) || count < 1) return;

    const resultIndex = Math.floor(Math.random() * count);
    const result = min + resultIndex;

    const sliceAngle = (2 * Math.PI) / count;
    const segmentCenter = resultIndex * sliceAngle + sliceAngle / 2;
    const targetAngle = -Math.PI / 2 - segmentCenter;

    const fullSpins = 2 * Math.PI * (6 + Math.floor(Math.random() * 4));
    const finalAngle = targetAngle + fullSpins;

    const duration = 3000 + Math.random() * 800;
    const startAngle = currentAngle;
    const startTime = performance.now();

    isSpinning = true;
    spinBtn.disabled = true;

    // Hide result box while spinning
    resultDisplay.classList.remove('visible');

    function frame(now) {
        const elapsed = now - startTime;
        const t = Math.min(elapsed / duration, 1);

        currentAngle = startAngle + (finalAngle - startAngle) * easeOut(t);
        drawWheel(currentAngle);

        if (t < 1) {
            requestAnimationFrame(frame);
        } else {
            isSpinning = false;
            spinBtn.disabled = false;

            // Show result box with number and pop animation
            resultEl.textContent = result;
            resultDisplay.classList.add('visible');
            resultEl.classList.remove('pop');
            // Force reflow so animation retriggers even on same number
            void resultEl.offsetWidth;
            resultEl.classList.add('pop');
            resultEl.addEventListener('animationend', () => {
                resultEl.classList.remove('pop');
            }, { once: true });

            addHistory(result);
        }
    }

    requestAnimationFrame(frame);
}

// ── Event listeners ───────────────────────────────────────
spinBtn.addEventListener('click', spin);

minInput.addEventListener('input', () => {
    if (!isSpinning) drawWheel(currentAngle);
});

maxInput.addEventListener('input', () => {
    if (!isSpinning) drawWheel(currentAngle);
});

// ── Initial draw ──────────────────────────────────────────
drawWheel(0);