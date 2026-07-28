// Void//Run — physics + rendering engine (serverless, canvas-based).
// All simulation is deterministic per frame given dt; no external state or network.

export type Phase = "start" | "playing" | "paused" | "gameover";

export type PowerupKind = "shield" | "triple" | "rapid";

export type Star = {
  x: number;
  y: number;
  size: number;
  depth: number;
  twinkle: number;
};

export type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  drag: number;
  spin?: number;
  angle?: number;
  streak?: boolean;
};

export type Ring = {
  x: number;
  y: number;
  radius: number;
  targetRadius: number;
  life: number;
  maxLife: number;
  color: string;
  width: number;
};

export type Bullet = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  radius: number;
  power: number;
  color: string;
};

export type Asteroid = {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  hp: number;
  maxHp: number;
  mass: number;
  rotation: number;
  spin: number;
  points: number[];
  hue: "amber" | "coral" | "boss";
  tier: 0 | 1 | 2 | 3; // 0=shard, 1=small, 2=big, 3=boss
  hitFlash: number;
};

export type Powerup = {
  id: number;
  kind: PowerupKind;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  bob: number;
};

export type ScorePopup = {
  x: number;
  y: number;
  vy: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
  scale: number;
};

export type Shockwave = {
  x: number;
  y: number;
  radius: number;
  targetRadius: number;
  strength: number;
  life: number;
  maxLife: number;
  color: string;
};

export type InputState = {
  keys: Set<string>;
  aimX: number;
  aimY: number;
  pointerDown: boolean;
  touchFire: boolean;
  joystickX: number;
  joystickY: number;
  boostRequested: boolean;
};

export type Player = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  radius: number;
  mass: number;
  cooldown: number;
  invulnerable: number;
  recoil: number;
  boostEnergy: number;
  boostRegenDelay: number;
  shieldTime: number;
  tripleTime: number;
  rapidTime: number;
  isBoosting: boolean;
};

export type GameWorld = {
  width: number;
  height: number;
  dpr: number;
  time: number;
  timeScale: number;
  timeScaleTarget: number;
  chromaticAberration: number;
  phase: Phase;
  player: Player;
  bullets: Bullet[];
  asteroids: Asteroid[];
  particles: Particle[];
  rings: Ring[];
  shockwaves: Shockwave[];
  powerups: Powerup[];
  popups: ScorePopup[];
  stars: Star[];
  input: InputState;
  score: number;
  best: number;
  health: number;
  maxHealth: number;
  combo: number;
  comboTimer: number;
  elapsed: number;
  spawnTimer: number;
  spawnBudget: number;
  wave: number;
  waveKills: number;
  waveTarget: number;
  waveBannerTime: number;
  shake: number;
  flash: number;
  damageFlash: number;
  runSaved: boolean;
  nextEntityId: number;
  killsThisSecond: number;
  killTimerReset: number;
};

export const TAU = Math.PI * 2;
export const MAX_ASTEROIDS = 44;

export const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

export const distanceSquared = (x1: number, y1: number, x2: number, y2: number) => {
  const dx = x1 - x2;
  const dy = y1 - y2;
  return dx * dx + dy * dy;
};

export const formatScore = (score: number) =>
  String(Math.max(0, Math.floor(score))).padStart(6, "0");

export const createStars = (width: number, height: number): Star[] =>
  Array.from({ length: Math.max(90, Math.floor((width * height) / 8500)) }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    size: Math.random() * 1.8 + 0.35,
    depth: Math.random() * 0.85 + 0.15,
    twinkle: Math.random() * TAU,
  }));

export const createWorld = (): GameWorld => ({
  width: 1280,
  height: 760,
  dpr: 1,
  time: 0,
  timeScale: 1,
  timeScaleTarget: 1,
  chromaticAberration: 0,
  phase: "start",
  player: {
    x: 640,
    y: 380,
    vx: 0,
    vy: 0,
    angle: -Math.PI / 2,
    radius: 17,
    mass: 3.2,
    cooldown: 0,
    invulnerable: 0,
    recoil: 0,
    boostEnergy: 1,
    boostRegenDelay: 0,
    shieldTime: 0,
    tripleTime: 0,
    rapidTime: 0,
    isBoosting: false,
  },
  bullets: [],
  asteroids: [],
  particles: [],
  rings: [],
  shockwaves: [],
  powerups: [],
  popups: [],
  stars: createStars(1280, 760),
  input: {
    keys: new Set<string>(),
    aimX: 640,
    aimY: 200,
    pointerDown: false,
    touchFire: false,
    joystickX: 0,
    joystickY: 0,
    boostRequested: false,
  },
  score: 0,
  best: 0,
  health: 3,
  maxHealth: 3,
  combo: 0,
  comboTimer: 0,
  elapsed: 0,
  spawnTimer: 0.6,
  spawnBudget: 4,
  wave: 1,
  waveKills: 0,
  waveTarget: 8,
  waveBannerTime: 2.6,
  shake: 0,
  flash: 0,
  damageFlash: 0,
  runSaved: false,
  nextEntityId: 1,
  killsThisSecond: 0,
  killTimerReset: 0,
});

const createShape = (sides: number) =>
  Array.from({ length: sides }, (_, index) => 0.78 + Math.random() * 0.2 + Math.sin(index * 3.17) * 0.11);

const computeMass = (radius: number) => (radius * radius) / 90 + 0.6;

const addParticle = (
  world: GameWorld,
  x: number,
  y: number,
  color: string,
  speed: number,
  size: number,
  life: number,
  angle?: number,
  streak = false,
) => {
  const direction = angle ?? Math.random() * TAU;
  const velocity = speed * (0.45 + Math.random() * 0.8);
  world.particles.push({
    x,
    y,
    vx: Math.cos(direction) * velocity,
    vy: Math.sin(direction) * velocity,
    life: life * (0.7 + Math.random() * 0.45),
    maxLife: life,
    size: size * (0.65 + Math.random() * 0.7),
    color,
    drag: 0.68 + Math.random() * 0.2,
    angle: direction,
    streak,
  });
};

export const burst = (
  world: GameWorld,
  x: number,
  y: number,
  color: string,
  count: number,
  speed: number,
  size = 3,
  life = 0.5,
  streak = false,
) => {
  for (let index = 0; index < count; index += 1) {
    addParticle(world, x, y, color, speed, size, life, undefined, streak);
  }
  // core flash puff
  world.particles.push({
    x,
    y,
    vx: 0,
    vy: 0,
    life: 0.22,
    maxLife: 0.22,
    size: size * 3.6,
    color,
    drag: 1,
  });
  if (world.particles.length > 620) {
    world.particles.splice(0, world.particles.length - 620);
  }
};

export const addRing = (
  world: GameWorld,
  x: number,
  y: number,
  color: string,
  radius = 12,
  targetRadius = 90,
  width = 2.5,
  life = 0.5,
) => {
  world.rings.push({ x, y, radius, targetRadius, life, maxLife: life, color, width });
};

export const addShockwave = (
  world: GameWorld,
  x: number,
  y: number,
  strength: number,
  targetRadius: number,
  color = "rgba(255,200,120,0.6)",
) => {
  world.shockwaves.push({
    x,
    y,
    radius: 8,
    targetRadius,
    strength,
    life: 0.45,
    maxLife: 0.45,
    color,
  });
  addRing(world, x, y, color, 12, targetRadius, 3, 0.45);
};

export const addPopup = (
  world: GameWorld,
  x: number,
  y: number,
  text: string,
  color: string,
  scale = 1,
) => {
  world.popups.push({
    x,
    y,
    vy: -55 - Math.random() * 15,
    text,
    color,
    life: 0.95,
    maxLife: 0.95,
    scale,
  });
  if (world.popups.length > 24) world.popups.shift();
};

export const spawnAsteroid = (world: GameWorld, opening = false, forcedTier?: 0 | 1 | 2 | 3) => {
  if (world.asteroids.length >= MAX_ASTEROIDS) return;
  const difficulty = Math.min(2.4, world.elapsed / 40);
  const tier: 0 | 1 | 2 | 3 =
    forcedTier ??
    (Math.random() < 0.06 + difficulty * 0.05 ? 2 : Math.random() < 0.72 ? 1 : 2);
  const radius =
    tier === 3
      ? 58 + Math.random() * 12
      : tier === 2
        ? 32 + Math.random() * 12
        : tier === 1
          ? 18 + Math.random() * 10
          : 11 + Math.random() * 6;
  const side = Math.floor(Math.random() * 4);
  const padding = radius + 44;
  let x = 0;
  let y = 0;
  if (side === 0) {
    x = -padding;
    y = Math.random() * world.height;
  } else if (side === 1) {
    x = world.width + padding;
    y = Math.random() * world.height;
  } else if (side === 2) {
    x = Math.random() * world.width;
    y = -padding;
  } else {
    x = Math.random() * world.width;
    y = world.height + padding;
  }

  const targetX = world.player.x + (Math.random() - 0.5) * world.width * 0.3;
  const targetY = world.player.y + (Math.random() - 0.5) * world.height * 0.3;
  const aim = Math.atan2(targetY - y, targetX - x) + (Math.random() - 0.5) * 0.42;
  const baseSpeed = opening
    ? 55 + Math.random() * 25
    : 48 + difficulty * 26 + Math.random() * 46;
  const speed = tier === 3 ? baseSpeed * 0.55 : tier === 2 ? baseSpeed * 0.8 : baseSpeed;
  const hp = tier === 3 ? 14 : tier === 2 ? 3 : tier === 1 ? 1 : 1;
  const hue: Asteroid["hue"] = tier === 3 ? "boss" : Math.random() > 0.78 ? "amber" : "coral";
  world.asteroids.push({
    id: world.nextEntityId++,
    x,
    y,
    vx: Math.cos(aim) * speed,
    vy: Math.sin(aim) * speed,
    radius,
    hp,
    maxHp: hp,
    mass: computeMass(radius),
    rotation: Math.random() * TAU,
    spin: (Math.random() - 0.5) * (tier === 3 ? 0.6 : 1.5),
    points: createShape(tier === 3 ? 11 : tier === 2 ? 9 : 7),
    hue,
    tier,
    hitFlash: 0,
  });
};

const spawnPowerup = (world: GameWorld, x: number, y: number) => {
  const kinds: PowerupKind[] = ["shield", "triple", "rapid"];
  const kind = kinds[Math.floor(Math.random() * kinds.length)];
  world.powerups.push({
    id: world.nextEntityId++,
    kind,
    x,
    y,
    vx: (Math.random() - 0.5) * 40,
    vy: (Math.random() - 0.5) * 40,
    life: 11,
    bob: Math.random() * TAU,
  });
};

export const resetWorld = (world: GameWorld) => {
  world.phase = "playing";
  world.time = 0;
  world.timeScale = 1;
  world.timeScaleTarget = 1;
  world.chromaticAberration = 0;
  world.score = 0;
  world.health = 3;
  world.maxHealth = 3;
  world.combo = 0;
  world.comboTimer = 0;
  world.elapsed = 0;
  world.spawnTimer = 0.5;
  world.spawnBudget = 6;
  world.wave = 1;
  world.waveKills = 0;
  world.waveTarget = 8;
  world.waveBannerTime = 2.4;
  world.shake = 0;
  world.flash = 0;
  world.damageFlash = 0;
  world.runSaved = false;
  world.killsThisSecond = 0;
  world.killTimerReset = 1;

  world.bullets.length = 0;
  world.asteroids.length = 0;
  world.particles.length = 0;
  world.rings.length = 0;
  world.shockwaves.length = 0;
  world.powerups.length = 0;
  world.popups.length = 0;

  world.player.x = world.width / 2;
  world.player.y = world.height / 2;
  world.player.vx = 0;
  world.player.vy = 0;
  world.player.angle = -Math.PI / 2;
  world.player.cooldown = 0;
  world.player.invulnerable = 1.2;
  world.player.recoil = 0;
  world.player.boostEnergy = 1;
  world.player.boostRegenDelay = 0;
  world.player.shieldTime = 0;
  world.player.tripleTime = 0;
  world.player.rapidTime = 0;
  world.player.isBoosting = false;

  world.input.pointerDown = false;
  world.input.touchFire = false;
  world.input.joystickX = 0;
  world.input.joystickY = 0;
  world.input.boostRequested = false;
  world.input.aimX = world.player.x;
  world.input.aimY = world.player.y - 180;

  for (let index = 0; index < 4; index += 1) spawnAsteroid(world, true, 1);
};

const emitBullet = (
  world: GameWorld,
  originX: number,
  originY: number,
  angle: number,
  speed: number,
  color: string,
) => {
  const player = world.player;
  world.bullets.push({
    x: originX,
    y: originY,
    vx: Math.cos(angle) * speed + player.vx * 0.18,
    vy: Math.sin(angle) * speed + player.vy * 0.18,
    life: 1.1,
    radius: 3.4,
    power: 1,
    color,
  });
  addParticle(world, originX, originY, "#e2ffff", 55, 2.4, 0.18, angle);
  addParticle(world, originX, originY, color, 22, 1.6, 0.28, angle + Math.PI);
};

const fireBullet = (world: GameWorld) => {
  const player = world.player;
  const direction = player.angle;
  const muzzleDistance = player.radius + 10;
  const x = player.x + Math.cos(direction) * muzzleDistance;
  const y = player.y + Math.sin(direction) * muzzleDistance;
  const speed = 830;
  const color = player.tripleTime > 0 ? "#c0ffb0" : player.rapidTime > 0 ? "#ffe08a" : "#d7ffff";

  if (player.tripleTime > 0) {
    emitBullet(world, x, y, direction, speed, color);
    emitBullet(world, x, y, direction - 0.18, speed * 0.95, color);
    emitBullet(world, x, y, direction + 0.18, speed * 0.95, color);
  } else {
    emitBullet(world, x, y, direction, speed, color);
  }

  const kickback = player.tripleTime > 0 ? 120 : 65;
  player.vx -= Math.cos(direction) * (kickback / player.mass) * 0.06;
  player.vy -= Math.sin(direction) * (kickback / player.mass) * 0.06;

  player.cooldown = player.rapidTime > 0 ? 0.055 : 0.11;
  player.recoil = 0.12;
  world.shake = Math.max(world.shake, 1.6);
};

const grantPowerup = (world: GameWorld, kind: PowerupKind) => {
  const duration = 9;
  const player = world.player;
  if (kind === "shield") {
    player.shieldTime = Math.max(player.shieldTime, duration);
    addPopup(world, player.x, player.y - 20, "SHIELD", "#66e6ff", 1.15);
  } else if (kind === "triple") {
    player.tripleTime = Math.max(player.tripleTime, duration);
    addPopup(world, player.x, player.y - 20, "TRIPLE", "#a4ff9a", 1.15);
  } else if (kind === "rapid") {
    player.rapidTime = Math.max(player.rapidTime, duration);
    addPopup(world, player.x, player.y - 20, "RAPID", "#ffd670", 1.15);
  }
  addRing(world, player.x, player.y, powerupColor(kind), 14, 90, 3, 0.6);
};

export const powerupColor = (kind: PowerupKind) =>
  kind === "shield" ? "#66e6ff" : kind === "triple" ? "#a4ff9a" : "#ffd670";

const applyShockwaveForces = (world: GameWorld, dt: number) => {
  for (const wave of world.shockwaves) {
    const strength = wave.strength * (wave.life / wave.maxLife);
    const radius = wave.radius;
    const radiusSq = radius * radius;
    for (const asteroid of world.asteroids) {
      const dx = asteroid.x - wave.x;
      const dy = asteroid.y - wave.y;
      const distSq = dx * dx + dy * dy;
      if (distSq > radiusSq || distSq < 0.5) continue;
      const dist = Math.sqrt(distSq);
      const falloff = 1 - dist / radius;
      const force = (strength * falloff * dt) / asteroid.mass;
      asteroid.vx += (dx / dist) * force;
      asteroid.vy += (dy / dist) * force;
      asteroid.spin += falloff * 0.3 * (Math.random() - 0.5);
    }
    // Also push the player a bit for immersion (feathered)
    const dxp = world.player.x - wave.x;
    const dyp = world.player.y - wave.y;
    const distSqP = dxp * dxp + dyp * dyp;
    if (distSqP < radiusSq && distSqP > 0.5) {
      const dist = Math.sqrt(distSqP);
      const falloff = 1 - dist / radius;
      const force = (strength * falloff * dt * 0.35) / world.player.mass;
      world.player.vx += (dxp / dist) * force;
      world.player.vy += (dyp / dist) * force;
    }
  }
};

const resolveAsteroidCollisions = (world: GameWorld) => {
  const list = world.asteroids;
  for (let i = 0; i < list.length; i += 1) {
    const a = list[i];
    for (let j = i + 1; j < list.length; j += 1) {
      const b = list[j];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const rSum = a.radius + b.radius;
      const distSq = dx * dx + dy * dy;
      if (distSq >= rSum * rSum || distSq < 0.0001) continue;
      const dist = Math.sqrt(distSq);
      const nx = dx / dist;
      const ny = dy / dist;
      const overlap = rSum - dist;
      const totalMass = a.mass + b.mass;
      // Positional correction
      a.x -= nx * overlap * (b.mass / totalMass);
      a.y -= ny * overlap * (b.mass / totalMass);
      b.x += nx * overlap * (a.mass / totalMass);
      b.y += ny * overlap * (a.mass / totalMass);
      // Impulse
      const rvx = b.vx - a.vx;
      const rvy = b.vy - a.vy;
      const velAlongNormal = rvx * nx + rvy * ny;
      if (velAlongNormal > 0) continue;
      const restitution = 0.7;
      const jImpulse = (-(1 + restitution) * velAlongNormal) / (1 / a.mass + 1 / b.mass);
      const impulseX = jImpulse * nx;
      const impulseY = jImpulse * ny;
      a.vx -= impulseX / a.mass;
      a.vy -= impulseY / a.mass;
      b.vx += impulseX / b.mass;
      b.vy += impulseY / b.mass;
      // Tangential friction feeds spin
      const tx = -ny;
      const ty = nx;
      const tv = rvx * tx + rvy * ty;
      a.spin -= tv * 0.0022;
      b.spin += tv * 0.0022;

      if (Math.abs(velAlongNormal) > 90) {
        const hitX = a.x + nx * a.radius;
        const hitY = a.y + ny * a.radius;
        burst(world, hitX, hitY, "#ffb680", 3, 55, 1.6, 0.24);
      }
    }
  }
};

const enforceAsteroidBounds = (world: GameWorld) => {
  for (let index = world.asteroids.length - 1; index >= 0; index -= 1) {
    const asteroid = world.asteroids[index];
    if (
      asteroid.x < -asteroid.radius * 3.4 ||
      asteroid.x > world.width + asteroid.radius * 3.4 ||
      asteroid.y < -asteroid.radius * 3.4 ||
      asteroid.y > world.height + asteroid.radius * 3.4
    ) {
      world.asteroids.splice(index, 1);
    }
  }
  // Speed cap to keep sim stable
  for (const asteroid of world.asteroids) {
    const cap = asteroid.tier === 3 ? 200 : 340;
    const speed = Math.hypot(asteroid.vx, asteroid.vy);
    if (speed > cap) {
      asteroid.vx = (asteroid.vx / speed) * cap;
      asteroid.vy = (asteroid.vy / speed) * cap;
    }
    // Gentle spin damping
    asteroid.spin *= 0.995;
    asteroid.hitFlash = Math.max(0, asteroid.hitFlash - 0.06);
  }
};

const killAsteroid = (
  world: GameWorld,
  asteroid: Asteroid,
  index: number,
  bulletVx: number,
  bulletVy: number,
) => {
  const basePoints =
    asteroid.tier === 3 ? 900 : asteroid.tier === 2 ? 180 : asteroid.tier === 1 ? 90 : 40;
  const comboBoost = 1 + world.combo * 0.18;
  const points = Math.round(basePoints * comboBoost);
  world.score += points;
  world.combo = Math.min(12, world.combo + 1);
  world.comboTimer = 2.6;
  world.waveKills += 1;
  world.killsThisSecond += 1;

  const color =
    asteroid.hue === "boss" ? "#ffb15c" : asteroid.hue === "amber" ? "#ffd082" : "#ff654f";
  burst(world, asteroid.x, asteroid.y, color, asteroid.tier === 3 ? 46 : 18, 210, 4.2, 0.65, true);
  addShockwave(
    world,
    asteroid.x,
    asteroid.y,
    asteroid.tier === 3 ? 780 : asteroid.tier === 2 ? 380 : 190,
    asteroid.tier === 3 ? 260 : asteroid.tier === 2 ? 160 : 90,
    asteroid.hue === "boss" ? "rgba(255,180,120,0.8)" : "rgba(255,140,110,0.8)",
  );
  world.shake = Math.max(world.shake, asteroid.tier === 3 ? 18 : asteroid.tier === 2 ? 9 : 5);
  addPopup(
    world,
    asteroid.x,
    asteroid.y - asteroid.radius,
    `+${points}${world.combo > 1 ? `  x${world.combo}` : ""}`,
    world.combo > 3 ? "#ffd670" : "#e6faff",
    asteroid.tier === 3 ? 1.5 : 1,
  );

  // Split into shards
  if (asteroid.tier >= 2) {
    const shardCount = asteroid.tier === 3 ? 5 : 3;
    const shardRadius = asteroid.tier === 3 ? 20 : asteroid.radius * 0.42;
    for (let shard = 0; shard < shardCount; shard += 1) {
      const shardAngle = Math.random() * TAU;
      const shardSpeed = 110 + Math.random() * 90;
      const shardTier: 0 | 1 = asteroid.tier === 3 ? 1 : 0;
      world.asteroids.push({
        id: world.nextEntityId++,
        x: asteroid.x + Math.cos(shardAngle) * (asteroid.radius * 0.4),
        y: asteroid.y + Math.sin(shardAngle) * (asteroid.radius * 0.4),
        vx: Math.cos(shardAngle) * shardSpeed + asteroid.vx * 0.3 + bulletVx * 0.02,
        vy: Math.sin(shardAngle) * shardSpeed + asteroid.vy * 0.3 + bulletVy * 0.02,
        radius: shardRadius,
        hp: shardTier === 1 ? 1 : 1,
        maxHp: 1,
        mass: computeMass(shardRadius),
        rotation: Math.random() * TAU,
        spin: (Math.random() - 0.5) * 2.4,
        points: createShape(6),
        hue: asteroid.hue === "boss" ? "amber" : asteroid.hue,
        tier: shardTier,
        hitFlash: 0,
      });
    }
  }

  // Powerup chance scales with tier
  const dropChance = asteroid.tier === 3 ? 1 : asteroid.tier === 2 ? 0.28 : 0.06;
  if (Math.random() < dropChance) {
    spawnPowerup(world, asteroid.x, asteroid.y);
  }

  world.asteroids.splice(index, 1);
};

const updateInputVectors = (world: GameWorld) => {
  const input = world.input;
  const kbX =
    (input.keys.has("KeyD") || input.keys.has("ArrowRight") ? 1 : 0) -
    (input.keys.has("KeyA") || input.keys.has("ArrowLeft") ? 1 : 0);
  const kbY =
    (input.keys.has("KeyS") || input.keys.has("ArrowDown") ? 1 : 0) -
    (input.keys.has("KeyW") || input.keys.has("ArrowUp") ? 1 : 0);
  let moveX = kbX + input.joystickX;
  let moveY = kbY + input.joystickY;
  const moveLength = Math.hypot(moveX, moveY);
  if (moveLength > 1) {
    moveX /= moveLength;
    moveY /= moveLength;
  }
  return { moveX, moveY, moveMag: Math.min(1, moveLength) };
};

const updatePlayer = (world: GameWorld, dt: number) => {
  const player = world.player;
  const input = world.input;
  const { moveX, moveY, moveMag } = updateInputVectors(world);
  const boostKey = input.keys.has("ShiftLeft") || input.keys.has("ShiftRight") || input.boostRequested;
  const canBoost = boostKey && player.boostEnergy > 0.05 && moveMag > 0.05;
  player.isBoosting = canBoost;

  if (canBoost) {
    player.boostEnergy = Math.max(0, player.boostEnergy - dt * 0.45);
    player.boostRegenDelay = 0.35;
  } else {
    player.boostRegenDelay = Math.max(0, player.boostRegenDelay - dt);
    if (player.boostRegenDelay <= 0) {
      player.boostEnergy = Math.min(1, player.boostEnergy + dt * 0.32);
    }
  }

  const thrust = canBoost ? 1020 : 720;
  const drag = Math.pow(0.03, dt);
  player.vx += moveX * thrust * dt;
  player.vy += moveY * thrust * dt;
  player.vx *= drag;
  player.vy *= drag;

  const maxSpeed = canBoost ? 520 : 380;
  const speed = Math.hypot(player.vx, player.vy);
  if (speed > maxSpeed) {
    player.vx = (player.vx / speed) * maxSpeed;
    player.vy = (player.vy / speed) * maxSpeed;
  }

  player.x += player.vx * dt;
  player.y += player.vy * dt;
  const edge = player.radius + 18;
  if (player.x < edge) {
    player.x = edge;
    player.vx = Math.abs(player.vx) * 0.32;
  } else if (player.x > world.width - edge) {
    player.x = world.width - edge;
    player.vx = -Math.abs(player.vx) * 0.32;
  }
  if (player.y < edge) {
    player.y = edge;
    player.vy = Math.abs(player.vy) * 0.32;
  } else if (player.y > world.height - edge) {
    player.y = world.height - edge;
    player.vy = -Math.abs(player.vy) * 0.32;
  }

  // Aim
  let aimX = input.aimX;
  let aimY = input.aimY;
  if (input.touchFire) {
    let nearest: Asteroid | undefined;
    let nearestDistance = Number.POSITIVE_INFINITY;
    for (const asteroid of world.asteroids) {
      const dSq = distanceSquared(player.x, player.y, asteroid.x, asteroid.y);
      if (dSq < nearestDistance) {
        nearest = asteroid;
        nearestDistance = dSq;
      }
    }
    if (nearest) {
      aimX = nearest.x + nearest.vx * 0.16;
      aimY = nearest.y + nearest.vy * 0.16;
    }
  }
  const targetAngle = Math.atan2(aimY - player.y, aimX - player.x);
  // Smooth rotation for buttery feel
  let da = targetAngle - player.angle;
  while (da > Math.PI) da -= TAU;
  while (da < -Math.PI) da += TAU;
  player.angle += da * Math.min(1, dt * 22);

  // Firing
  player.cooldown = Math.max(0, player.cooldown - dt);
  const firing = input.pointerDown || input.touchFire || input.keys.has("Space");
  if (firing && player.cooldown <= 0) fireBullet(world);

  // Trail particles
  if (moveMag > 0.1 && Math.random() < dt * (canBoost ? 60 : 34)) {
    const trailAngle = Math.atan2(-moveY, -moveX);
    addParticle(
      world,
      player.x - Math.cos(player.angle) * 14,
      player.y - Math.sin(player.angle) * 14,
      canBoost ? "#ffd28a" : "#22c8dc",
      canBoost ? 110 : 66,
      canBoost ? 4.2 : 2.9,
      canBoost ? 0.44 : 0.32,
      trailAngle + (Math.random() - 0.5) * 0.6,
      true,
    );
  }

  player.invulnerable = Math.max(0, player.invulnerable - dt);
  player.recoil = Math.max(0, player.recoil - dt);
  player.shieldTime = Math.max(0, player.shieldTime - dt);
  player.tripleTime = Math.max(0, player.tripleTime - dt);
  player.rapidTime = Math.max(0, player.rapidTime - dt);
};

const updateBullets = (world: GameWorld, dt: number) => {
  for (let index = world.bullets.length - 1; index >= 0; index -= 1) {
    const bullet = world.bullets[index];
    bullet.x += bullet.vx * dt;
    bullet.y += bullet.vy * dt;
    bullet.life -= dt;
    if (
      bullet.life <= 0 ||
      bullet.x < -60 ||
      bullet.x > world.width + 60 ||
      bullet.y < -60 ||
      bullet.y > world.height + 60
    ) {
      world.bullets.splice(index, 1);
    }
  }
};

const updateAsteroids = (world: GameWorld, dt: number) => {
  for (const asteroid of world.asteroids) {
    asteroid.x += asteroid.vx * dt;
    asteroid.y += asteroid.vy * dt;
    asteroid.rotation += asteroid.spin * dt;
    // Very light damping so momentum feels persistent but not runaway
    asteroid.vx *= 0.998;
    asteroid.vy *= 0.998;
  }
  applyShockwaveForces(world, dt);
  resolveAsteroidCollisions(world);
  enforceAsteroidBounds(world);
};

const collideBulletsAsteroids = (world: GameWorld) => {
  for (let bulletIndex = world.bullets.length - 1; bulletIndex >= 0; bulletIndex -= 1) {
    const bullet = world.bullets[bulletIndex];
    for (let asteroidIndex = world.asteroids.length - 1; asteroidIndex >= 0; asteroidIndex -= 1) {
      const asteroid = world.asteroids[asteroidIndex];
      const hitRadius = asteroid.radius + bullet.radius;
      if (distanceSquared(bullet.x, bullet.y, asteroid.x, asteroid.y) >= hitRadius * hitRadius) continue;

      // Momentum transfer to asteroid
      const impulseMag = 3.4; // bullet "mass" in arbitrary units
      asteroid.vx += (bullet.vx * impulseMag) / (asteroid.mass * 60);
      asteroid.vy += (bullet.vy * impulseMag) / (asteroid.mass * 60);
      // Torque based on cross product of arm × velocity
      const armX = bullet.x - asteroid.x;
      const armY = bullet.y - asteroid.y;
      asteroid.spin += (armX * bullet.vy - armY * bullet.vx) * 0.0000045;

      asteroid.hitFlash = 1;
      asteroid.hp -= bullet.power;
      burst(world, bullet.x, bullet.y, "#ffcf8c", 5, 90, 2, 0.28);
      world.shake = Math.max(world.shake, 1.8);

      const bulletVx = bullet.vx;
      const bulletVy = bullet.vy;
      world.bullets.splice(bulletIndex, 1);

      if (asteroid.hp <= 0) {
        killAsteroid(world, asteroid, asteroidIndex, bulletVx, bulletVy);
      }
      break;
    }
  }
};

const damagePlayer = (world: GameWorld, impactX: number, impactY: number) => {
  const player = world.player;
  if (player.shieldTime > 0) {
    player.shieldTime = 0;
    player.invulnerable = 1.4;
    burst(world, player.x, player.y, "#66e6ff", 24, 210, 4, 0.6);
    addRing(world, player.x, player.y, "#66e6ff", 14, 130, 3, 0.5);
    addShockwave(world, player.x, player.y, 380, 160, "rgba(102,230,255,0.65)");
    world.shake = 10;
    world.damageFlash = 0.6;
    world.chromaticAberration = 6;
    addPopup(world, player.x, player.y - 20, "SHIELD BREAK", "#66e6ff", 1.15);
    return;
  }

  world.health -= 1;
  player.invulnerable = 1.4;
  world.combo = 0;
  world.comboTimer = 0;
  world.shake = 22;
  world.flash = 0.8;
  world.damageFlash = 1;
  world.chromaticAberration = 12;
  burst(world, impactX, impactY, "#f45f57", 34, 260, 5, 0.85, true);
  addRing(world, player.x, player.y, "#ff7766", 17, 150, 3, 0.55);
  addShockwave(world, player.x, player.y, 460, 200, "rgba(255,120,110,0.8)");

  if (world.health <= 0) {
    world.phase = "gameover";
    burst(world, player.x, player.y, "#ffb15c", 46, 300, 5.5, 1.1, true);
    addShockwave(world, player.x, player.y, 900, 320, "rgba(255,170,110,0.85)");
    world.shake = 26;
    world.timeScaleTarget = 0.35;
  }
};

const collideAsteroidsPlayer = (world: GameWorld) => {
  const player = world.player;
  if (player.invulnerable > 0) return;
  for (let index = world.asteroids.length - 1; index >= 0; index -= 1) {
    const asteroid = world.asteroids[index];
    const hitRadius = player.radius + asteroid.radius * 0.82;
    if (distanceSquared(player.x, player.y, asteroid.x, asteroid.y) >= hitRadius * hitRadius) continue;
    // If shield is up we bounce the asteroid instead of destroying it
    if (player.shieldTime > 0) {
      const dx = asteroid.x - player.x;
      const dy = asteroid.y - player.y;
      const dist = Math.max(0.001, Math.hypot(dx, dy));
      const nx = dx / dist;
      const ny = dy / dist;
      const push = 320;
      asteroid.vx += nx * push;
      asteroid.vy += ny * push;
      asteroid.spin += (Math.random() - 0.5) * 3;
      damagePlayer(world, asteroid.x, asteroid.y);
      return;
    }
    damagePlayer(world, asteroid.x, asteroid.y);
    // Break the offending asteroid to give the player breathing room
    burst(world, asteroid.x, asteroid.y, "#ffb680", 22, 220, 3.5, 0.6);
    world.asteroids.splice(index, 1);
    return;
  }
};

const updatePowerups = (world: GameWorld, dt: number) => {
  for (let index = world.powerups.length - 1; index >= 0; index -= 1) {
    const powerup = world.powerups[index];
    powerup.x += powerup.vx * dt;
    powerup.y += powerup.vy * dt;
    powerup.vx *= Math.pow(0.6, dt);
    powerup.vy *= Math.pow(0.6, dt);
    powerup.life -= dt;
    powerup.bob += dt * 3.2;
    // Magnetic pull toward player when close
    const dx = world.player.x - powerup.x;
    const dy = world.player.y - powerup.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 130) {
      const pull = (1 - dist / 130) * 320;
      powerup.vx += (dx / dist) * pull * dt;
      powerup.vy += (dy / dist) * pull * dt;
    }
    if (dist < world.player.radius + 14) {
      grantPowerup(world, powerup.kind);
      burst(world, powerup.x, powerup.y, powerupColor(powerup.kind), 18, 160, 3, 0.5);
      world.powerups.splice(index, 1);
      continue;
    }
    if (powerup.life <= 0) world.powerups.splice(index, 1);
  }
};

const updateShockwaves = (world: GameWorld, dt: number) => {
  for (let index = world.shockwaves.length - 1; index >= 0; index -= 1) {
    const wave = world.shockwaves[index];
    wave.life -= dt;
    const t = 1 - wave.life / wave.maxLife;
    wave.radius = wave.targetRadius * (1 - Math.pow(1 - t, 2.5));
    if (wave.life <= 0) world.shockwaves.splice(index, 1);
  }
};

const updateParticles = (world: GameWorld, dt: number) => {
  for (let index = world.particles.length - 1; index >= 0; index -= 1) {
    const particle = world.particles[index];
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
    particle.vx *= Math.pow(particle.drag, dt);
    particle.vy *= Math.pow(particle.drag, dt);
    particle.life -= dt;
    if (particle.life <= 0) world.particles.splice(index, 1);
  }
  for (let index = world.rings.length - 1; index >= 0; index -= 1) {
    const ring = world.rings[index];
    ring.life -= dt;
    const t = 1 - ring.life / ring.maxLife;
    ring.radius = ring.radius + (ring.targetRadius - ring.radius) * Math.min(1, dt * 7);
    if (ring.life <= 0) world.rings.splice(index, 1);
    void t;
  }
  for (let index = world.popups.length - 1; index >= 0; index -= 1) {
    const popup = world.popups[index];
    popup.y += popup.vy * dt;
    popup.vy *= Math.pow(0.4, dt);
    popup.life -= dt;
    if (popup.life <= 0) world.popups.splice(index, 1);
  }
};

const advanceWaves = (world: GameWorld, dt: number) => {
  world.spawnTimer -= dt;
  world.waveBannerTime = Math.max(0, world.waveBannerTime - dt);
  // Combo timer decay
  if (world.comboTimer > 0) {
    world.comboTimer -= dt;
    if (world.comboTimer <= 0) world.combo = 0;
  }
  world.killTimerReset -= dt;
  if (world.killTimerReset <= 0) {
    if (world.killsThisSecond >= 3) {
      // Multi-kill dilation
      world.timeScaleTarget = 0.42;
      world.chromaticAberration = Math.max(world.chromaticAberration, 5);
    }
    world.killsThisSecond = 0;
    world.killTimerReset = 0.75;
  }

  // Ease time scale
  world.timeScale += (world.timeScaleTarget - world.timeScale) * Math.min(1, dt * 4);
  if (Math.abs(world.timeScale - world.timeScaleTarget) < 0.02) {
    world.timeScaleTarget = 1;
  }

  // Chromatic aberration decays
  world.chromaticAberration = Math.max(0, world.chromaticAberration - dt * 22);
  world.damageFlash = Math.max(0, world.damageFlash - dt * 2.2);

  // Wave progression
  if (world.waveKills >= world.waveTarget && world.asteroids.length <= 2) {
    world.wave += 1;
    world.waveKills = 0;
    world.waveTarget = Math.round(6 + world.wave * 2.4);
    world.spawnBudget = Math.min(9, 4 + Math.floor(world.wave * 1.2));
    world.waveBannerTime = 2.4;
    addPopup(
      world,
      world.width / 2,
      world.height / 2 + 40,
      `WAVE ${world.wave}`,
      "#66e6ff",
      1.8,
    );
    // Boss spawn every 4 waves
    if (world.wave % 4 === 0) {
      spawnAsteroid(world, false, 3);
    }
  }

  // Regular spawning
  if (world.spawnTimer <= 0 && world.asteroids.length < world.spawnBudget * 2 + 6) {
    spawnAsteroid(world);
    const pressure = Math.min(0.55, world.elapsed * 0.006 + world.wave * 0.04);
    world.spawnTimer = Math.max(0.22, 0.95 - pressure) * (0.75 + Math.random() * 0.55);
  }
};

export const updateGame = (world: GameWorld, dtRaw: number) => {
  if (world.phase !== "playing" && world.phase !== "gameover") {
    // On start screen, still animate stars slowly
    world.time += dtRaw;
    updateParticles(world, dtRaw);
    return;
  }

  const dt = dtRaw * (world.phase === "gameover" ? Math.max(0.15, world.timeScale) : world.timeScale);
  world.time += dtRaw;
  world.elapsed += world.phase === "playing" ? dt : 0;
  world.shake = Math.max(0, world.shake - dtRaw * 22);
  world.flash = Math.max(0, world.flash - dtRaw * 3.5);

  if (world.phase === "playing") {
    updatePlayer(world, dt);
    advanceWaves(world, dt);
  } else {
    // ease time to normal for restart readiness
    world.timeScale += (1 - world.timeScale) * Math.min(1, dtRaw * 1.5);
  }

  updateBullets(world, dt);
  updateAsteroids(world, dt);
  updatePowerups(world, dt);
  updateShockwaves(world, dt);
  if (world.phase === "playing") {
    collideBulletsAsteroids(world);
    collideAsteroidsPlayer(world);
  }
  updateParticles(world, dt);
};

// =====================================================================
// Rendering
// =====================================================================

const drawBackground = (ctx: CanvasRenderingContext2D, world: GameWorld) => {
  const { width, height } = world;
  ctx.fillStyle = "#050d17";
  ctx.fillRect(0, 0, width, height);

  const nebula = ctx.createRadialGradient(
    width * 0.52,
    height * 0.46,
    0,
    width * 0.52,
    height * 0.46,
    Math.max(width, height) * 0.82,
  );
  nebula.addColorStop(0, "rgba(18, 82, 96, 0.28)");
  nebula.addColorStop(0.45, "rgba(6, 30, 45, 0.22)");
  nebula.addColorStop(1, "rgba(1, 5, 10, 0.95)");
  ctx.fillStyle = nebula;
  ctx.fillRect(0, 0, width, height);

  const nebula2 = ctx.createRadialGradient(
    width * 0.22,
    height * 0.78,
    0,
    width * 0.22,
    height * 0.78,
    Math.max(width, height) * 0.55,
  );
  nebula2.addColorStop(0, "rgba(180, 82, 110, 0.09)");
  nebula2.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = nebula2;
  ctx.fillRect(0, 0, width, height);

  // Perspective grid
  const horizon = height * 0.6;
  ctx.strokeStyle = "rgba(58, 173, 184, 0.055)";
  ctx.lineWidth = 1;
  for (let x = -width; x < width * 2; x += 78) {
    ctx.beginPath();
    ctx.moveTo(width / 2 + (x - width / 2) * 0.14, horizon);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = horizon; y < height + 130; y += 44) {
    const offset = (y - horizon) * 0.03;
    ctx.beginPath();
    ctx.moveTo(0, y + offset);
    ctx.lineTo(width, y + offset);
    ctx.stroke();
  }

  // Parallax stars with slow drift
  for (const star of world.stars) {
    const alpha = (0.28 + Math.sin(world.time * (0.9 + star.depth) + star.twinkle) * 0.18) * star.depth;
    const drift = (world.time * 6 * star.depth) % width;
    const px = (star.x + drift) % width;
    ctx.fillStyle = `rgba(179, 232, 237, ${Math.max(0.05, alpha)})`;
    ctx.fillRect(px, star.y, star.size, star.size);
  }

  ctx.strokeStyle = "rgba(77, 206, 212, 0.09)";
  ctx.setLineDash([2, 12]);
  ctx.beginPath();
  ctx.arc(width * 0.5, height * 0.5, Math.min(width, height) * 0.38, 0, TAU);
  ctx.stroke();
  ctx.setLineDash([]);
};

const drawAsteroid = (ctx: CanvasRenderingContext2D, asteroid: Asteroid) => {
  ctx.save();
  ctx.translate(asteroid.x, asteroid.y);
  ctx.rotate(asteroid.rotation);
  const glow =
    asteroid.hue === "boss"
      ? "rgba(255, 170, 100, 0.35)"
      : asteroid.hue === "amber"
        ? "rgba(255, 185, 91, 0.28)"
        : "rgba(255, 83, 63, 0.28)";
  ctx.shadowColor = glow;
  ctx.shadowBlur = 18 + asteroid.hitFlash * 24;
  ctx.beginPath();
  asteroid.points.forEach((scale, index) => {
    const angle = (index / asteroid.points.length) * TAU;
    const pointX = Math.cos(angle) * asteroid.radius * scale;
    const pointY = Math.sin(angle) * asteroid.radius * scale;
    if (index === 0) ctx.moveTo(pointX, pointY);
    else ctx.lineTo(pointX, pointY);
  });
  ctx.closePath();

  const gradient = ctx.createLinearGradient(
    -asteroid.radius,
    -asteroid.radius,
    asteroid.radius,
    asteroid.radius,
  );
  if (asteroid.hue === "boss") {
    gradient.addColorStop(0, "#c48856");
    gradient.addColorStop(0.5, "#6d3625");
    gradient.addColorStop(1, "#141a26");
  } else if (asteroid.hue === "amber") {
    gradient.addColorStop(0, "#a66338");
    gradient.addColorStop(0.55, "#633127");
    gradient.addColorStop(1, "#171c28");
  } else {
    gradient.addColorStop(0, "#9a3e36");
    gradient.addColorStop(0.55, "#52252a");
    gradient.addColorStop(1, "#171c28");
  }
  ctx.fillStyle = gradient;
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.strokeStyle =
    asteroid.hue === "boss"
      ? "rgba(255, 200, 140, 0.95)"
      : asteroid.hue === "amber"
        ? "rgba(255, 191, 111, 0.85)"
        : "rgba(255, 111, 94, 0.78)";
  ctx.lineWidth = asteroid.tier === 3 ? 2 : 1.4;
  ctx.stroke();

  if (asteroid.hitFlash > 0) {
    ctx.globalAlpha = asteroid.hitFlash;
    ctx.fillStyle = "rgba(255, 240, 220, 0.5)";
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  // Detail scratches
  ctx.globalAlpha = 0.42;
  ctx.strokeStyle = asteroid.hue === "amber" ? "#e69a5e" : "#d8564e";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-asteroid.radius * 0.42, -asteroid.radius * 0.08);
  ctx.lineTo(asteroid.radius * 0.15, asteroid.radius * 0.14);
  ctx.lineTo(asteroid.radius * 0.34, asteroid.radius * 0.5);
  ctx.moveTo(-asteroid.radius * 0.08, -asteroid.radius * 0.65);
  ctx.lineTo(asteroid.radius * 0.18, -asteroid.radius * 0.17);
  ctx.stroke();
  ctx.restore();

  // HP bar for tough asteroids
  if (asteroid.maxHp > 1 && asteroid.hp < asteroid.maxHp) {
    const barW = asteroid.radius * 1.6;
    const barY = asteroid.y - asteroid.radius - 10;
    ctx.save();
    ctx.fillStyle = "rgba(20, 30, 42, 0.75)";
    ctx.fillRect(asteroid.x - barW / 2, barY, barW, 3);
    ctx.fillStyle = asteroid.tier === 3 ? "#ffb670" : "#ff8874";
    ctx.fillRect(asteroid.x - barW / 2, barY, barW * (asteroid.hp / asteroid.maxHp), 3);
    ctx.restore();
  }
};

const drawPlayer = (ctx: CanvasRenderingContext2D, world: GameWorld) => {
  const player = world.player;
  const isBlinking = player.invulnerable > 0 && Math.floor(world.time * 22) % 2 === 0;

  // Shield bubble
  if (player.shieldTime > 0) {
    ctx.save();
    const pulse = 1 + Math.sin(world.time * 6) * 0.06;
    const alpha = Math.min(1, player.shieldTime) * (0.35 + Math.sin(world.time * 10) * 0.1);
    ctx.strokeStyle = `rgba(102, 230, 255, ${alpha})`;
    ctx.lineWidth = 2.2;
    ctx.shadowColor = "#66e6ff";
    ctx.shadowBlur = 22;
    ctx.beginPath();
    ctx.arc(player.x, player.y, (player.radius + 12) * pulse, 0, TAU);
    ctx.stroke();
    ctx.setLineDash([3, 6]);
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.arc(player.x, player.y, (player.radius + 16) * pulse, 0, TAU);
    ctx.stroke();
    ctx.restore();
  }

  if (isBlinking) return;

  ctx.save();
  ctx.translate(player.x, player.y);
  ctx.rotate(player.angle);
  ctx.shadowColor = player.isBoosting ? "rgba(255, 210, 138, 0.85)" : "rgba(37, 214, 226, 0.75)";
  ctx.shadowBlur = player.isBoosting ? 28 : 22;

  const thrustLen =
    12 + Math.min(11, Math.hypot(player.vx, player.vy) / 40) + (player.recoil > 0 ? 6 : 0);
  // Flame layers
  ctx.fillStyle = player.isBoosting ? "#ffd28a" : "#20c6d6";
  ctx.beginPath();
  ctx.moveTo(-11, -5);
  ctx.lineTo(-11 - thrustLen, 0);
  ctx.lineTo(-11, 5);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = player.isBoosting ? "#fff2c8" : "#c8fdff";
  ctx.beginPath();
  ctx.moveTo(-11, -2.5);
  ctx.lineTo(-11 - thrustLen * 0.6, 0);
  ctx.lineTo(-11, 2.5);
  ctx.closePath();
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.beginPath();
  ctx.moveTo(21, 0);
  ctx.lineTo(-10, -12);
  ctx.lineTo(-5, 0);
  ctx.lineTo(-10, 12);
  ctx.closePath();
  const body = ctx.createLinearGradient(-10, -12, 18, 10);
  body.addColorStop(0, "#f0ffff");
  body.addColorStop(0.35, "#6adbe2");
  body.addColorStop(1, "#127080");
  ctx.fillStyle = body;
  ctx.fill();
  ctx.strokeStyle = "rgba(211, 255, 255, 0.9)";
  ctx.lineWidth = 1.3;
  ctx.stroke();
  // Inner cockpit
  ctx.fillStyle = "#08232e";
  ctx.beginPath();
  ctx.moveTo(8, 0);
  ctx.lineTo(-2, -5);
  ctx.lineTo(-4, 0);
  ctx.lineTo(-2, 5);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#d4ffff";
  ctx.fillRect(0, -1.1, 10, 2.2);
  ctx.restore();

  // Powerup halos
  if (player.tripleTime > 0) {
    ctx.save();
    ctx.strokeStyle = `rgba(164, 255, 154, ${0.35 + Math.sin(world.time * 7) * 0.15})`;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius + 9, 0, TAU);
    ctx.stroke();
    ctx.restore();
  }
  if (player.rapidTime > 0) {
    ctx.save();
    ctx.strokeStyle = `rgba(255, 214, 112, ${0.35 + Math.sin(world.time * 9) * 0.15})`;
    ctx.setLineDash([2, 4]);
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius + 13, 0, TAU);
    ctx.stroke();
    ctx.restore();
  }
};

const drawBullets = (ctx: CanvasRenderingContext2D, world: GameWorld) => {
  for (const bullet of world.bullets) {
    ctx.save();
    ctx.shadowColor = bullet.color;
    ctx.shadowBlur = 14;
    ctx.strokeStyle = "rgba(220, 255, 255, 0.42)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(bullet.x - bullet.vx * 0.02, bullet.y - bullet.vy * 0.02);
    ctx.lineTo(bullet.x, bullet.y);
    ctx.stroke();
    ctx.fillStyle = bullet.color;
    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, bullet.radius, 0, TAU);
    ctx.fill();
    ctx.restore();
  }
};

const drawParticles = (ctx: CanvasRenderingContext2D, world: GameWorld) => {
  for (const particle of world.particles) {
    const alpha = clamp(particle.life / particle.maxLife, 0, 1);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.shadowColor = particle.color;
    ctx.shadowBlur = particle.size * 3;
    ctx.fillStyle = particle.color;
    if (particle.streak && particle.angle !== undefined) {
      ctx.strokeStyle = particle.color;
      ctx.lineWidth = Math.max(0.6, particle.size * alpha);
      ctx.beginPath();
      const tailX = particle.x - Math.cos(particle.angle) * particle.size * 3.5;
      const tailY = particle.y - Math.sin(particle.angle) * particle.size * 3.5;
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(particle.x, particle.y);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, Math.max(0.5, particle.size * alpha), 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }
};

const drawRings = (ctx: CanvasRenderingContext2D, world: GameWorld) => {
  for (const ring of world.rings) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, ring.life / ring.maxLife) * 0.75;
    ctx.strokeStyle = ring.color;
    ctx.lineWidth = ring.width;
    ctx.beginPath();
    ctx.arc(ring.x, ring.y, ring.radius, 0, TAU);
    ctx.stroke();
    ctx.restore();
  }
};

const drawShockwaves = (ctx: CanvasRenderingContext2D, world: GameWorld) => {
  for (const wave of world.shockwaves) {
    ctx.save();
    const alpha = Math.max(0, wave.life / wave.maxLife) * 0.4;
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = wave.color;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(wave.x, wave.y, wave.radius, 0, TAU);
    ctx.stroke();
    ctx.restore();
  }
};

const drawPowerups = (ctx: CanvasRenderingContext2D, world: GameWorld) => {
  for (const powerup of world.powerups) {
    const color = powerupColor(powerup.kind);
    const bob = Math.sin(powerup.bob) * 3;
    const alpha = clamp(powerup.life / 2, 0, 1);
    ctx.save();
    ctx.translate(powerup.x, powerup.y + bob);
    ctx.shadowColor = color;
    ctx.shadowBlur = 18;
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(0, 0, 14, 0, TAU);
    ctx.stroke();
    ctx.fillStyle = "rgba(6, 20, 30, 0.6)";
    ctx.fill();
    // Glyph
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.6;
    if (powerup.kind === "shield") {
      ctx.beginPath();
      ctx.arc(0, 0, 6, 0, TAU);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, 2, 0, TAU);
      ctx.fill();
    } else if (powerup.kind === "triple") {
      for (let i = -1; i <= 1; i += 1) {
        ctx.beginPath();
        ctx.moveTo(i * 4, -5);
        ctx.lineTo(i * 4, 5);
        ctx.stroke();
      }
    } else {
      ctx.beginPath();
      ctx.moveTo(-4, -5);
      ctx.lineTo(3, -1);
      ctx.lineTo(-1, 0);
      ctx.lineTo(4, 5);
      ctx.lineTo(-3, 1);
      ctx.lineTo(1, 0);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }
};

const drawPopups = (ctx: CanvasRenderingContext2D, world: GameWorld) => {
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (const popup of world.popups) {
    const alpha = clamp(popup.life / popup.maxLife, 0, 1);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = popup.color;
    ctx.shadowColor = popup.color;
    ctx.shadowBlur = 10;
    const size = 14 * popup.scale;
    ctx.font = `700 ${size}px "Courier New", monospace`;
    ctx.fillText(popup.text, popup.x, popup.y);
  }
  ctx.restore();
};

const drawThreatArrows = (ctx: CanvasRenderingContext2D, world: GameWorld) => {
  const margin = 32;
  ctx.save();
  for (const asteroid of world.asteroids) {
    if (
      asteroid.x >= -margin &&
      asteroid.x <= world.width + margin &&
      asteroid.y >= -margin &&
      asteroid.y <= world.height + margin
    ) {
      continue;
    }
    if (asteroid.tier === 0) continue; // don't clutter with shards off-screen
    const clampedX = clamp(asteroid.x, margin, world.width - margin);
    const clampedY = clamp(asteroid.y, margin, world.height - margin);
    const dx = asteroid.x - world.player.x;
    const dy = asteroid.y - world.player.y;
    const angle = Math.atan2(dy, dx);
    ctx.translate(clampedX, clampedY);
    ctx.rotate(angle);
    const color =
      asteroid.hue === "boss" ? "#ffc27a" : asteroid.hue === "amber" ? "#ffb26f" : "#ff7f6f";
    ctx.globalAlpha = 0.85;
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 8;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(-8, -5);
    ctx.lineTo(6, 0);
    ctx.lineTo(-8, 5);
    ctx.closePath();
    ctx.fill();
    ctx.setTransform(world.dpr, 0, 0, world.dpr, 0, 0);
  }
  ctx.restore();
};

const drawRadar = (ctx: CanvasRenderingContext2D, world: GameWorld) => {
  const size = Math.min(150, Math.max(96, world.width * 0.11));
  const margin = 22;
  const cx = world.width - size / 2 - margin;
  const cy = world.height - size / 2 - margin - 12;
  const range = Math.max(world.width, world.height) * 0.7;

  ctx.save();
  ctx.globalAlpha = 0.85;
  // Backing
  ctx.fillStyle = "rgba(6, 22, 32, 0.55)";
  ctx.beginPath();
  ctx.arc(cx, cy, size / 2, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = "rgba(105, 220, 220, 0.35)";
  ctx.lineWidth = 1;
  ctx.stroke();
  // Cross
  ctx.strokeStyle = "rgba(105, 220, 220, 0.16)";
  ctx.beginPath();
  ctx.moveTo(cx - size / 2, cy);
  ctx.lineTo(cx + size / 2, cy);
  ctx.moveTo(cx, cy - size / 2);
  ctx.lineTo(cx, cy + size / 2);
  ctx.stroke();
  // Sweep
  const sweepAngle = (world.time * 1.4) % TAU;
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, size / 2);
  grad.addColorStop(0, "rgba(102, 230, 230, 0.35)");
  grad.addColorStop(1, "rgba(102, 230, 230, 0)");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.arc(cx, cy, size / 2, sweepAngle - 0.5, sweepAngle);
  ctx.closePath();
  ctx.fill();

  // Player at center
  ctx.fillStyle = "#c8fdff";
  ctx.beginPath();
  ctx.arc(cx, cy, 2.2, 0, TAU);
  ctx.fill();

  // Blip asteroids
  ctx.clip(); // stay within circle
  for (const asteroid of world.asteroids) {
    const dx = asteroid.x - world.player.x;
    const dy = asteroid.y - world.player.y;
    const rx = clamp((dx / range) * (size / 2), -size / 2, size / 2);
    const ry = clamp((dy / range) * (size / 2), -size / 2, size / 2);
    ctx.fillStyle =
      asteroid.hue === "boss" ? "#ffc27a" : asteroid.hue === "amber" ? "#ffb26f" : "#ff7f6f";
    const dot = asteroid.tier === 3 ? 3.2 : asteroid.tier === 2 ? 2.2 : 1.4;
    ctx.beginPath();
    ctx.arc(cx + rx, cy + ry, dot, 0, TAU);
    ctx.fill();
  }
  for (const powerup of world.powerups) {
    const dx = powerup.x - world.player.x;
    const dy = powerup.y - world.player.y;
    const rx = clamp((dx / range) * (size / 2), -size / 2, size / 2);
    const ry = clamp((dy / range) * (size / 2), -size / 2, size / 2);
    ctx.fillStyle = powerupColor(powerup.kind);
    ctx.beginPath();
    ctx.arc(cx + rx, cy + ry, 1.8, 0, TAU);
    ctx.fill();
  }

  ctx.restore();
};

export const drawWorld = (ctx: CanvasRenderingContext2D, world: GameWorld) => {
  ctx.save();
  const shake = world.shake;
  const shakeX = (Math.random() - 0.5) * shake;
  const shakeY = (Math.random() - 0.5) * shake;

  // Chromatic aberration: draw background layers with slight color offsets when world.chromaticAberration > 0
  const ca = world.chromaticAberration;
  ctx.translate(shakeX, shakeY);
  drawBackground(ctx, world);

  drawShockwaves(ctx, world);
  drawRings(ctx, world);
  drawPowerups(ctx, world);
  drawBullets(ctx, world);

  for (const asteroid of world.asteroids) drawAsteroid(ctx, asteroid);

  drawParticles(ctx, world);
  drawPlayer(ctx, world);
  drawPopups(ctx, world);
  ctx.restore();

  // Overlays (screen-space, no shake)
  drawThreatArrows(ctx, world);
  if (world.phase === "playing" || world.phase === "paused") {
    drawRadar(ctx, world);
  }

  // Cheap chromatic aberration overlay: two thin colored rims around edges
  if (ca > 0.1) {
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.globalAlpha = Math.min(0.35, ca * 0.05);
    ctx.fillStyle = "rgba(255, 60, 60, 1)";
    ctx.fillRect(-ca, 0, ca * 2, world.height);
    ctx.fillStyle = "rgba(60, 200, 255, 1)";
    ctx.fillRect(world.width - ca, 0, ca * 2, world.height);
    ctx.restore();
  }

  // Damage vignette flash
  if (world.damageFlash > 0.02) {
    const grad = ctx.createRadialGradient(
      world.width / 2,
      world.height / 2,
      Math.min(world.width, world.height) * 0.28,
      world.width / 2,
      world.height / 2,
      Math.max(world.width, world.height) * 0.7,
    );
    grad.addColorStop(0, "rgba(255,60,60,0)");
    grad.addColorStop(1, `rgba(255,60,60,${world.damageFlash * 0.55})`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, world.width, world.height);
  }

  if (world.flash > 0) {
    ctx.fillStyle = `rgba(255, 95, 77, ${world.flash * 0.09})`;
    ctx.fillRect(0, 0, world.width, world.height);
  }
};
