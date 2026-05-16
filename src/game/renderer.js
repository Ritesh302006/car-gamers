import { VIEW, ROAD, COLORS } from "./constants";

function roundedRect(ctx, x, y, w, h, r) {
    const rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
}

export function drawBackdrop(ctx) {
    const grad = ctx.createLinearGradient(0, 0, 0, VIEW.height);
    grad.addColorStop(0, "#100726");
    grad.addColorStop(0.45, "#1a0a3a");
    grad.addColorStop(1, "#06030f");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, VIEW.width, VIEW.height);

    const sunX = VIEW.width / 2, sunY = 130, sunR = 80;
    const sunGrad = ctx.createRadialGradient(sunX, sunY, 8, sunX, sunY, sunR);
    sunGrad.addColorStop(0, "#ffe65a");
    sunGrad.addColorStop(0.45, "#ff2bd6");
    sunGrad.addColorStop(1, "rgba(255,43,214,0)");
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#100726";
    for (let i = 0; i < 5; i++) ctx.fillRect(sunX - sunR, sunY + 14 + i * 14, sunR * 2, 4);
}

export function drawGrass(ctx) {
    ctx.fillStyle = COLORS.grass;
    ctx.fillRect(0, 0, ROAD.left, VIEW.height);
    ctx.fillRect(ROAD.right, 0, VIEW.width - ROAD.right, VIEW.height);
}

export function drawRoad(ctx, state) {
    ctx.fillStyle = COLORS.road;
    ctx.fillRect(ROAD.left, 0, ROAD.width, VIEW.height);

    ctx.fillStyle = COLORS.roadEdge;
    ctx.shadowColor = COLORS.roadEdge; ctx.shadowBlur = 14;
    ctx.fillRect(ROAD.left - 3, 0, 3, VIEW.height);
    ctx.fillRect(ROAD.right, 0, 3, VIEW.height);
    ctx.shadowBlur = 0;

    ctx.fillStyle = COLORS.laneDash;
    ctx.shadowColor = COLORS.laneDash; ctx.shadowBlur = 10;
    const dashH = 28, gap = 32, period = dashH + gap;
    for (let lane = 1; lane < ROAD.laneCount; lane++) {
        const x = ROAD.left + lane * ROAD.laneWidth - 2;
        let y = -period + (state.roadOffset % period);
        while (y < VIEW.height) { ctx.fillRect(x, y, 4, dashH); y += period; }
    }
    ctx.shadowBlur = 0;
}

export function drawCar(ctx, x, y, w, h, color, accent, decalType = 'none') {
    ctx.save();
    ctx.shadowColor = color; ctx.shadowBlur = 14;
    ctx.fillStyle = color;
    roundedRect(ctx, x, y, w, h, 8); ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = accent || "#ffffff";
    if (decalType === 'stripe_single') {
        ctx.fillRect(x + w / 2 - 4, y, 8, h);
    } else if (decalType === 'stripe_double') {
        ctx.fillRect(x + w / 2 - 8, y, 4, h);
        ctx.fillRect(x + w / 2 + 4, y, 4, h);
    } else if (decalType === 'flame') {
        ctx.beginPath();
        ctx.moveTo(x + w / 2, y + h);
        ctx.quadraticCurveTo(x, y + h / 2, x + w / 2, y + 12);
        ctx.quadraticCurveTo(x + w, y + h / 2, x + w / 2, y + h);
        ctx.fill();
    } else if (decalType === 'chevrons') {
        ctx.beginPath();
        for (let i=0; i<3; i++) {
           let cy = y + h - 16 - i * 16;
           ctx.moveTo(x + 6, cy);
           ctx.lineTo(x + w / 2, cy - 8);
           ctx.lineTo(x + w - 6, cy);
           ctx.lineTo(x + w / 2, cy - 4);
        }
        ctx.fill();
    }

    ctx.fillStyle = "rgba(8,4,20,0.85)";
    roundedRect(ctx, x + 6, y + 14, w - 12, 22, 4); ctx.fill();
    roundedRect(ctx, x + 6, y + h - 26, w - 12, 14, 4); ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(x + w / 2 - 2, y + 4, 4, 8);
    ctx.fillRect(x + w / 2 - 2, y + h - 12, 4, 8);

    ctx.fillStyle = "#000";
    ctx.fillRect(x - 3, y + 10, 5, 16);
    ctx.fillRect(x + w - 2, y + 10, 5, 16);
    ctx.fillRect(x - 3, y + h - 26, 5, 16);
    ctx.fillRect(x + w - 2, y + h - 26, 5, 16);

    ctx.fillStyle = "#fffae0";
    ctx.fillRect(x + 4, y + 2, 8, 3);
    ctx.fillRect(x + w - 12, y + 2, 8, 3);
    ctx.restore();
}

function drawPlayer(ctx, state) {
    const p = state.player;
    if (state.timers.shield > 0) {
        ctx.save();
        ctx.strokeStyle = COLORS.shield;
        ctx.shadowColor = COLORS.shield; ctx.shadowBlur = 16; ctx.lineWidth = 2;
        const pad = 6 + Math.sin(state.elapsed * 8) * 2;
        roundedRect(ctx, p.x - pad, p.y - pad, p.width + pad * 2, p.height + pad * 2, 14);
        ctx.stroke();
        ctx.restore();
    }
    drawCar(ctx, p.x, p.y, p.width, p.height, p.color, p.decalColor, p.decal);

    if (state.timers.boost > 0) {
        const fx = p.x + p.width / 2, fy = p.y + p.height;
        ctx.save();
        const grad = ctx.createLinearGradient(0, fy, 0, fy + 28);
        grad.addColorStop(0, "#ffe65a");
        grad.addColorStop(0.5, "#ff8a3d");
        grad.addColorStop(1, "rgba(255,43,214,0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(fx - 10, fy);
        ctx.quadraticCurveTo(fx, fy + 30 + Math.sin(state.elapsed * 30) * 4, fx + 10, fy);
        ctx.closePath(); ctx.fill();
        ctx.restore();
    }
}

function drawEnemies(ctx, state) {
    for (const e of state.enemies) {
        drawCar(ctx, e.x, e.y, e.width, e.height,
                COLORS.enemy[e.colorIdx % COLORS.enemy.length], "#000", "none");
    }
}

function drawPowerups(ctx, state) {
    for (const p of state.powerups) {
        const cx = p.x + p.width / 2, cy = p.y + p.height / 2;
        const color = p.type === "boost" ? COLORS.boost
                    : p.type === "shield" ? COLORS.shield : COLORS.multiplier;
        ctx.save();
        ctx.shadowColor = color; ctx.shadowBlur = 18;
        ctx.fillStyle = "rgba(8,4,20,0.85)";
        ctx.beginPath(); ctx.arc(cx, cy, p.width / 2, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke();
        ctx.fillStyle = color;
        ctx.font = "bold 16px 'Audiowide', sans-serif";
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        const label = p.type === "boost" ? "B" : p.type === "shield" ? "S" : "x2";
        ctx.fillText(label, cx, cy + 1);
        ctx.restore();
    }
}

function drawParticles(ctx, state) {
    for (const pt of state.particles) {
        ctx.fillStyle = pt.color;
        ctx.globalAlpha = Math.max(0, 1 - pt.age / pt.life);
        ctx.fillRect(pt.x, pt.y, 3, 3);
    }
    ctx.globalAlpha = 1;
}

export function render(ctx, state) {
    drawBackdrop(ctx);
    drawGrass(ctx);
    drawRoad(ctx, state);
    drawPowerups(ctx, state);
    drawEnemies(ctx, state);
    drawPlayer(ctx, state);
    drawParticles(ctx, state);
}
