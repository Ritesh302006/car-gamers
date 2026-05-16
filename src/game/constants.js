export const VIEW = { width: 480, height: 720 };

export const ROAD = { left: 60, right: 420, laneCount: 4 };
ROAD.width = ROAD.right - ROAD.left;
ROAD.laneWidth = ROAD.width / ROAD.laneCount;

export const PLAYER = {
    width: 44, height: 78,
    maxSpeed: 9.5, accel: 0.12, brake: 0.22, drag: 0.04,
    lateralSpeed: 5.6, minSpeed: 1.6, startSpeed: 4.5,
};

export const ENEMY = {
    width: 44, height: 78,
    minRelSpeed: -2.5, maxRelSpeed: 1.5,
};

export const POWERUP = {
    size: 34, fallSpeed: 1.2,
    duration: { boost: 4.5, shield: 5.0, multiplier: 6.0 },
    spawnEverySec: 7.5,
};

export const DIFFICULTY = {
    baseSpawnEverySec: 1.35,
    minSpawnEverySec: 0.45,
    spawnRamp: 0.025,
    speedRampPerLevel: 0.55,
    levelEveryDistance: 1200,
};

export const COLORS = {
    bgDeep: "#06030f", road: "#0f0a22", roadEdge: "#ff2bd6",
    laneDash: "#21f4ff", grass: "#1a0a3a",
    player: "#21f4ff", playerAccent: "#ffffff",
    enemy: ["#ff5577", "#ffd23f", "#a16cff", "#56e39f", "#ff8a3d"],
    boost: "#ffe65a", shield: "#21f4ff", multiplier: "#ff2bd6",
};
