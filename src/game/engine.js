import { VIEW, ROAD, PLAYER, ENEMY, POWERUP, DIFFICULTY } from "./constants";

const rand = (min, max) => Math.random() * (max - min) + min;
const randInt = (min, max) => Math.floor(rand(min, max + 1));

function laneCenterX(lane) {
    return ROAD.left + ROAD.laneWidth * (lane + 0.5);
}

function rectOverlap(a, b) {
    return a.x < b.x + b.width && a.x + a.width > b.x &&
           a.y < b.y + b.height && a.y + a.height > b.y;
}

function pushEvent(state, type, payload = {}) {
    state.events.push({ type, payload });
}

export function createInitialState(options = {}) {
    const pCfg = options.playerProfile || { paint: COLORS.player, decalColor: COLORS.playerAccent, decal: 'none' };
    return {
        running: false, gameOver: false,
        distance: 0, roadOffset: 0,
        worldSpeed: PLAYER.startSpeed, level: 1,
        player: {
            x: laneCenterX(1), y: VIEW.height - PLAYER.height - 40,
            vx: 0, speed: PLAYER.startSpeed,
            width: PLAYER.width, height: PLAYER.height,
            color: pCfg.paint, decalColor: pCfg.decalColor, decal: pCfg.decal
        },
        enemies: [], powerups: [], particles: [],
        score: 0, scoreMultiplier: 1,
        timers: { boost: 0, shield: 0, multiplier: 0 },
        spawnTimer: 0, powerupTimer: POWERUP.spawnEverySec,
        input: { left: false, right: false, up: false, down: false },
        elapsed: 0, lastLevelDistance: 0, events: [],
    };
}

function spawnEnemy(state) {
    const lane = randInt(0, ROAD.laneCount - 1);
    state.enemies.push({
        x: laneCenterX(lane) - ENEMY.width / 2,
        y: -ENEMY.height - rand(0, 60),
        width: ENEMY.width, height: ENEMY.height,
        relSpeed: rand(ENEMY.minRelSpeed, ENEMY.maxRelSpeed),
        colorIdx: randInt(0, 4),
    });
}

function spawnPowerup(state) {
    const lane = randInt(0, ROAD.laneCount - 1);
    const types = ["boost", "shield", "multiplier"];
    state.powerups.push({
        x: laneCenterX(lane) - POWERUP.size / 2, y: -POWERUP.size,
        width: POWERUP.size, height: POWERUP.size,
        type: types[randInt(0, types.length - 1)],
    });
}

function addCrashParticles(state, x, y) {
    for (let i = 0; i < 22; i++) {
        state.particles.push({
            x, y, vx: rand(-4, 4), vy: rand(-6, 2),
            life: rand(0.5, 1.1), age: 0,
            color: ["#ff2bd6", "#21f4ff", "#ffe65a", "#ffffff"][randInt(0, 3)],
        });
    }
}

function updatePlayer(state, dt) {
    const input = state.input;
    const maxSpd = state.timers.boost > 0 ? PLAYER.maxSpeed * 1.45 : PLAYER.maxSpeed;
    const p = state.player;
    if (input.up) p.speed = Math.min(maxSpd, p.speed + PLAYER.accel * dt * 60);
    else if (input.down) p.speed = Math.max(PLAYER.minSpeed, p.speed - PLAYER.brake * dt * 60);
    else p.speed = Math.max(PLAYER.minSpeed, p.speed - PLAYER.drag * dt * 60);
    const lateral = PLAYER.lateralSpeed * dt * 60;
    if (input.left) p.x -= lateral;
    if (input.right) p.x += lateral;
    const minX = ROAD.left + 4, maxX = ROAD.right - p.width - 4;
    if (p.x < minX) p.x = minX;
    if (p.x > maxX) p.x = maxX;
}

function updateWorld(state, dt) {
    state.worldSpeed = state.player.speed + (state.level - 1) * DIFFICULTY.speedRampPerLevel;
    const scroll = state.worldSpeed * dt * 60;
    state.distance += scroll;
    state.roadOffset = (state.roadOffset + scroll) % 60;
    const mult = state.timers.multiplier > 0 ? 2 : 1;
    state.scoreMultiplier = mult;
    state.score += scroll * 0.6 * mult;
}

function updateTimers(state, dt) {
    for (const key of Object.keys(state.timers)) {
        if (state.timers[key] > 0) state.timers[key] = Math.max(0, state.timers[key] - dt);
    }
}

function updateLevel(state) {
    const target = 1 + Math.floor(state.distance / DIFFICULTY.levelEveryDistance);
    if (target > state.level) {
        state.level = target;
        pushEvent(state, "level-up", { level: target });
    }
}

function updateSpawns(state, dt) {
    const spawnInterval = Math.max(
        DIFFICULTY.minSpawnEverySec,
        DIFFICULTY.baseSpawnEverySec - (state.level - 1) * DIFFICULTY.spawnRamp
    );
    state.spawnTimer -= dt;
    if (state.spawnTimer <= 0) {
        spawnEnemy(state);
        state.spawnTimer = spawnInterval * rand(0.85, 1.15);
    }
    state.powerupTimer -= dt;
    if (state.powerupTimer <= 0) {
        spawnPowerup(state);
        state.powerupTimer = POWERUP.spawnEverySec * rand(0.8, 1.2);
    }
}

function updateEntities(state, dt) {
    for (let i = state.enemies.length - 1; i >= 0; i--) {
        const e = state.enemies[i];
        e.y += (state.worldSpeed - e.relSpeed) * dt * 60;
        if (e.y > VIEW.height + 40) state.enemies.splice(i, 1);
    }
    for (let i = state.powerups.length - 1; i >= 0; i--) {
        const p = state.powerups[i];
        p.y += (state.worldSpeed - POWERUP.fallSpeed) * dt * 60;
        if (p.y > VIEW.height + 40) state.powerups.splice(i, 1);
    }
    for (let i = state.particles.length - 1; i >= 0; i--) {
        const pt = state.particles[i];
        pt.age += dt; pt.x += pt.vx; pt.y += pt.vy; pt.vy += 0.25;
        if (pt.age > pt.life) state.particles.splice(i, 1);
    }
}

function resolveCollisions(state) {
    for (let i = state.powerups.length - 1; i >= 0; i--) {
        const p = state.powerups[i];
        if (rectOverlap(state.player, p)) {
            state.powerups.splice(i, 1);
            state.timers[p.type] = POWERUP.duration[p.type];
            pushEvent(state, "pickup", { type: p.type });
        }
    }
    for (let i = state.enemies.length - 1; i >= 0; i--) {
        const e = state.enemies[i];
        if (!rectOverlap(state.player, e)) continue;
        if (state.timers.shield > 0) {
            addCrashParticles(state, e.x + e.width / 2, e.y + e.height / 2);
            state.enemies.splice(i, 1);
            state.timers.shield = 0;
            pushEvent(state, "shield-break");
        } else {
            addCrashParticles(state, state.player.x + state.player.width / 2, state.player.y);
            state.gameOver = true; state.running = false;
            pushEvent(state, "game-over");
            return;
        }
    }
}

export function step(state, dt) {
    if (!state.running || state.gameOver) return;
    state.elapsed += dt;
    updatePlayer(state, dt);
    updateWorld(state, dt);
    updateTimers(state, dt);
    updateLevel(state);
    updateSpawns(state, dt);
    updateEntities(state, dt);
    resolveCollisions(state);
}

export function setInput(state, key, pressed) {
    if (!state.input) return;
    if (key in state.input) state.input[key] = pressed;
}

export function startRun(state) {
    state.running = true;
    state.gameOver = false;
}

export function resetState() {
    return createInitialState();
}
