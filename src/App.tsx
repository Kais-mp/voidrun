import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  clamp,
  createWorld,
  drawWorld,
  formatScore,
  powerupColor,
  resetWorld,
  updateGame,
  createStars,
  type GameWorld,
  type Phase,
  type PowerupKind,
} from "./game/engine";

type ScoreEntry = { score: number; wave: number; date: string };

type HudState = {
  score: number;
  best: number;
  health: number;
  maxHealth: number;
  combo: number;
  wave: number;
  waveKills: number;
  waveTarget: number;
  boost: number;
  shield: number;
  triple: number;
  rapid: number;
  chromatic: number;
  timeScale: number;
  bannerTime: number;
};

const STORAGE_KEY = "void-run-local-scores-v2";

const initialHud: HudState = {
  score: 0,
  best: 0,
  health: 3,
  maxHealth: 3,
  combo: 0,
  wave: 1,
  waveKills: 0,
  waveTarget: 8,
  boost: 1,
  shield: 0,
  triple: 0,
  rapid: 0,
  chromatic: 0,
  timeScale: 1,
  bannerTime: 0,
};

const loadScores = (): ScoreEntry[] => {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (entry): entry is ScoreEntry =>
          typeof entry?.score === "number" &&
          typeof entry?.date === "string" &&
          typeof entry?.wave === "number",
      )
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  } catch {
    return [];
  }
};

// ---------- Icons ----------
const LogoMark = () => (
  <span className="logo-mark" aria-hidden="true">
    <svg viewBox="0 0 36 36" fill="none">
      <circle cx="18" cy="18" r="12" stroke="currentColor" strokeWidth="1.6" opacity=".5" />
      <path
        d="M18 5v7M18 24v7M5 18h7M24 18h7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="18" cy="18" r="3.6" fill="currentColor" />
    </svg>
  </span>
);
const PauseIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <rect x="5" y="4" width="3" height="12" rx="1" />
    <rect x="12" y="4" width="3" height="12" rx="1" />
  </svg>
);
const PlayIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path d="M6 4.7a1 1 0 0 1 1.55-.83l7.5 5.3a1 1 0 0 1 0 1.66l-7.5 5.3A1 1 0 0 1 6 15.3V4.7Z" />
  </svg>
);
const RefreshIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
    <path d="M16 6.3A6.4 6.4 0 1 0 17 12" strokeLinecap="round" />
    <path d="M16 3.8v3.7h-3.7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const ShieldIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
    <path d="M10 2.5 4 4.7v5c0 3.8 2.6 6.8 6 7.8 3.4-1 6-4 6-7.8v-5L10 2.5Z" strokeLinejoin="round" />
  </svg>
);
const TripleIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
    <path d="M4 15 10 5l6 10" strokeLinejoin="round" />
    <path d="M10 5v10" strokeLinejoin="round" />
  </svg>
);
const RapidIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
    <path d="M11 3 4 12h5l-1 5 7-9h-5l1-5Z" strokeLinejoin="round" />
  </svg>
);

const POWERUP_ICON: Record<PowerupKind, () => React.ReactElement> = {
  shield: ShieldIcon,
  triple: TripleIcon,
  rapid: RapidIcon,
};

const POWERUP_LABEL: Record<PowerupKind, string> = {
  shield: "SHIELD",
  triple: "TRIPLE",
  rapid: "RAPID",
};

const Scoreboard = ({ scores }: { scores: ScoreEntry[] }) => (
  <section className="scoreboard" aria-label="Local high scores">
    <div className="scoreboard-heading">
      <div>
        <span className="section-kicker">LOCAL SIGNALS</span>
        <h3>Best runs</h3>
      </div>
      <span className="score-count">{scores.length}/5</span>
    </div>
    <div className="score-list">
      {scores.length === 0 ? (
        <div className="empty-scores">
          <span>--</span>
          <p>No runs logged yet.</p>
          <small>Put a mark in the drift.</small>
        </div>
      ) : (
        scores.map((entry, index) => (
          <div className="score-row" key={`${entry.date}-${entry.score}-${index}`}>
            <span className="score-rank">0{index + 1}</span>
            <div className="score-value">
              <strong>{formatScore(entry.score)}</strong>
              <span>WAVE {String(entry.wave).padStart(2, "0")}</span>
            </div>
            <time>{entry.date}</time>
          </div>
        ))
      )}
    </div>
    <p className="score-note">Stored on this device only</p>
  </section>
);

const PowerupPill = ({ kind, time }: { kind: PowerupKind; time: number }) => {
  const Icon = POWERUP_ICON[kind];
  const pct = clamp(time / 9, 0, 1);
  return (
    <div className="powerup-pill" style={{ color: powerupColor(kind) }}>
      <span className="powerup-icon">
        <Icon />
      </span>
      <div className="powerup-body">
        <span className="powerup-label">{POWERUP_LABEL[kind]}</span>
        <div className="powerup-bar">
          <span style={{ width: `${pct * 100}%`, background: powerupColor(kind) }} />
        </div>
      </div>
      <span className="powerup-time">{time.toFixed(1)}s</span>
    </div>
  );
};

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const joystickRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<GameWorld>(createWorld());
  const [phase, setPhase] = useState<Phase>("start");
  const [scores, setScores] = useState<ScoreEntry[]>(loadScores);
  const [hud, setHud] = useState<HudState>(initialHud);
  const [joystick, setJoystick] = useState({ x: 0, y: 0 });
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    setIsTouch(window.matchMedia("(pointer: coarse)").matches);
  }, []);

  const saveScore = useCallback((score: number, wave: number) => {
    if (score <= 0) return;
    setScores((current) => {
      const next = [
        ...current,
        {
          score,
          wave,
          date: new Date().toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        },
      ]
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Storage may be blocked (private mode). Fail silently.
      }
      return next;
    });
  }, []);

  const beginRun = useCallback(() => {
    const world = worldRef.current;
    resetWorld(world);
    setPhase("playing");
    setHud({
      ...initialHud,
      best: world.best,
    });
  }, []);

  const togglePause = useCallback(() => {
    const world = worldRef.current;
    if (world.phase === "playing") {
      world.phase = "paused";
      setPhase("paused");
    } else if (world.phase === "paused") {
      world.phase = "playing";
      setPhase("playing");
    }
  }, []);

  useEffect(() => {
    worldRef.current.best = scores[0]?.score ?? 0;
  }, [scores]);

  // Main render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d", { alpha: false });
    if (!context) return;
    const world = worldRef.current;
    let animationFrame = 0;
    let previous = performance.now();
    let hudClock = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      world.width = rect.width;
      world.height = rect.height;
      world.dpr = dpr;
      world.stars = createStars(rect.width, rect.height);
      if (world.phase === "start" || world.phase === "gameover") {
        world.player.x = rect.width / 2;
        world.player.y = rect.height / 2;
        world.input.aimX = rect.width / 2;
        world.input.aimY = rect.height / 2 - 180;
      } else {
        world.player.x = clamp(world.player.x, 30, rect.width - 30);
        world.player.y = clamp(world.player.y, 30, rect.height - 30);
      }
    };

    const loop = (now: number) => {
      const dt = Math.min(0.033, Math.max(0.001, (now - previous) / 1000));
      previous = now;
      updateGame(world, dt);

      context.setTransform(world.dpr, 0, 0, world.dpr, 0, 0);
      drawWorld(context, world);

      hudClock += dt;
      if (hudClock > 0.06) {
        hudClock = 0;
        setHud({
          score: world.score,
          best: Math.max(world.best, world.score),
          health: world.health,
          maxHealth: world.maxHealth,
          combo: world.combo,
          wave: world.wave,
          waveKills: world.waveKills,
          waveTarget: world.waveTarget,
          boost: world.player.boostEnergy,
          shield: world.player.shieldTime,
          triple: world.player.tripleTime,
          rapid: world.player.rapidTime,
          chromatic: world.chromaticAberration,
          timeScale: world.timeScale,
          bannerTime: world.waveBannerTime,
        });
      }

      if (world.phase === "gameover" && !world.runSaved) {
        world.runSaved = true;
        saveScore(world.score, world.wave);
        setPhase("gameover");
      }

      animationFrame = requestAnimationFrame(loop);
    };

    resize();
    window.addEventListener("resize", resize);
    animationFrame = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
    };
  }, [saveScore]);

  // Keyboard input
  useEffect(() => {
    const world = worldRef.current;
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(event.code)
      ) {
        event.preventDefault();
      }
      if (event.code === "KeyP" || event.code === "Escape") {
        togglePause();
        return;
      }
      if (
        (event.code === "Enter" || event.code === "Space") &&
        (world.phase === "start" || world.phase === "gameover")
      ) {
        beginRun();
        return;
      }
      world.input.keys.add(event.code);
    };
    const onKeyUp = (event: KeyboardEvent) => {
      world.input.keys.delete(event.code);
    };
    const onBlur = () => world.input.keys.clear();
    window.addEventListener("keydown", onKeyDown, { passive: false });
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
    };
  }, [beginRun, togglePause]);

  // Auto-pause on tab hidden
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "hidden" && worldRef.current.phase === "playing") {
        worldRef.current.phase = "paused";
        setPhase("paused");
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  const pointerPosition = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };
  const handleCanvasPointerMove = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (event.pointerType === "mouse" || worldRef.current.input.pointerDown) {
      const position = pointerPosition(event);
      worldRef.current.input.aimX = position.x;
      worldRef.current.input.aimY = position.y;
    }
  };
  const handleCanvasPointerDown = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if (worldRef.current.phase === "start" || worldRef.current.phase === "gameover") {
      beginRun();
      return;
    }
    if (worldRef.current.phase !== "playing") return;
    const position = pointerPosition(event);
    worldRef.current.input.aimX = position.x;
    worldRef.current.input.aimY = position.y;
    worldRef.current.input.pointerDown = true;
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const handleCanvasPointerUp = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    worldRef.current.input.pointerDown = false;
  };

  const updateJoystick = (event: ReactPointerEvent<HTMLDivElement>) => {
    const element = joystickRef.current;
    if (!element) return;
    const rect = element.getBoundingClientRect();
    const dx = event.clientX - (rect.left + rect.width / 2);
    const dy = event.clientY - (rect.top + rect.height / 2);
    const radius = rect.width * 0.34;
    const length = Math.hypot(dx, dy);
    const scale = length > radius ? radius / length : 1;
    const x = clamp((dx * scale) / radius, -1, 1);
    const y = clamp((dy * scale) / radius, -1, 1);
    worldRef.current.input.joystickX = x;
    worldRef.current.input.joystickY = y;
    setJoystick({ x, y });
  };
  const handleJoystickDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (worldRef.current.phase === "start" || worldRef.current.phase === "gameover") beginRun();
    if (worldRef.current.phase !== "playing") return;
    event.currentTarget.setPointerCapture(event.pointerId);
    updateJoystick(event);
  };
  const resetJoystick = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    worldRef.current.input.joystickX = 0;
    worldRef.current.input.joystickY = 0;
    setJoystick({ x: 0, y: 0 });
  };
  const handleFireDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (worldRef.current.phase === "start" || worldRef.current.phase === "gameover") beginRun();
    if (worldRef.current.phase !== "playing") return;
    event.currentTarget.setPointerCapture(event.pointerId);
    worldRef.current.input.touchFire = true;
  };
  const handleFireUp = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    worldRef.current.input.touchFire = false;
  };
  const handleBoostDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (worldRef.current.phase !== "playing") return;
    event.currentTarget.setPointerCapture(event.pointerId);
    worldRef.current.input.boostRequested = true;
  };
  const handleBoostUp = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    worldRef.current.input.boostRequested = false;
  };

  const showHud = phase === "playing" || phase === "paused";
  const waveProgress = Math.min(1, hud.waveKills / Math.max(1, hud.waveTarget));

  const shellStyle = useMemo<React.CSSProperties>(
    () => ({
      filter:
        hud.chromatic > 0.5
          ? `hue-rotate(-${Math.min(6, hud.chromatic * 0.6)}deg)`
          : undefined,
    }),
    [hud.chromatic],
  );

  return (
    <main className="game-shell" style={shellStyle}>
      <canvas
        ref={canvasRef}
        className="game-canvas"
        aria-label="Void Run asteroid field"
        onPointerMove={handleCanvasPointerMove}
        onPointerDown={handleCanvasPointerDown}
        onPointerUp={handleCanvasPointerUp}
        onPointerCancel={handleCanvasPointerUp}
      />
      <div className="scanline" aria-hidden="true" />
      <div className="vignette" aria-hidden="true" />

      {showHud && hud.timeScale < 0.85 && (
        <div className="slowmo-badge" aria-hidden="true">
          <span>x{hud.timeScale.toFixed(2)}</span>
          <small>TIME DILATION</small>
        </div>
      )}

      <header className="topbar">
        <div className="brand-lockup">
          <LogoMark />
          <div>
            <div className="brand-name">
              VOID<span>//</span>RUN
            </div>
            <div className="brand-subtitle">kinetic flight protocol · v2</div>
          </div>
        </div>
        {showHud && (
          <div className="live-indicator">
            <span className="live-dot" />
            <span>LIVE FEED</span>
          </div>
        )}
        {showHud && (
          <button
            className="pause-button"
            type="button"
            onClick={togglePause}
            aria-label={phase === "paused" ? "Resume game" : "Pause game"}
          >
            {phase === "paused" ? <PlayIcon /> : <PauseIcon />}
            <span>{phase === "paused" ? "RESUME" : "PAUSE"}</span>
          </button>
        )}
      </header>

      {showHud && (
        <section className="hud" aria-label="Game status">
          <div className="hud-score">
            <span className="hud-label">SCORE</span>
            <strong>{formatScore(hud.score)}</strong>
            <span className="hud-best">BEST {formatScore(hud.best)}</span>
          </div>
          <div className="hud-center">
            <div className="wave-headline">
              <span className="sector-label">WAVE {String(hud.wave).padStart(2, "0")}</span>
              <span className="wave-progress-text">
                {hud.waveKills}/{hud.waveTarget}
              </span>
            </div>
            <div className="wave-bar">
              <span style={{ width: `${waveProgress * 100}%` }} />
            </div>
            <span className="sector-meta">DRIFT VELOCITY NOMINAL</span>
          </div>
          <div className="hud-right">
            <div className="combo-display">
              <span className="hud-label">STREAK</span>
              <strong className={hud.combo > 0 ? "is-hot" : ""}>
                x{Math.max(1, hud.combo)}
              </strong>
            </div>
            <div className="health-display" aria-label={`${hud.health} shields remaining`}>
              <span className="hud-label">HULL</span>
              <div className="health-bars">
                {Array.from({ length: hud.maxHealth }, (_, bar) => (
                  <i className={bar < hud.health ? "active" : ""} key={bar} />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {showHud && (
        <div className="left-stack">
          <div className="boost-meter">
            <span className="hud-label">BOOST</span>
            <div className="boost-bar">
              <span
                style={{
                  width: `${hud.boost * 100}%`,
                  background:
                    hud.boost > 0.4
                      ? "linear-gradient(90deg, #78ffe6, #ffd28a)"
                      : "#ff7f6f",
                }}
              />
            </div>
            <small>{isTouch ? "TAP ⚡ TO BURN" : "HOLD SHIFT"}</small>
          </div>
          <div className="powerup-stack">
            {hud.shield > 0 && <PowerupPill kind="shield" time={hud.shield} />}
            {hud.triple > 0 && <PowerupPill kind="triple" time={hud.triple} />}
            {hud.rapid > 0 && <PowerupPill kind="rapid" time={hud.rapid} />}
          </div>
        </div>
      )}

      {phase === "playing" && hud.bannerTime > 0.05 && (
        <div className="wave-banner" key={`wave-${hud.wave}`}>
          <span className="wave-banner-kicker">INCOMING</span>
          <strong>WAVE {String(hud.wave).padStart(2, "0")}</strong>
          <span className="wave-banner-meta">
            {hud.wave % 4 === 0 ? "BOSS FRAGMENT DETECTED" : "DEBRIS DENSITY RISING"}
          </span>
        </div>
      )}

      {phase === "playing" && (
        <div className="game-tip">
          <span className="tip-crosshair">+</span>
          <span>{isTouch ? "MOVE · AUTO-AIM · FIRE" : "AIM WITH MOUSE · HOLD TO FIRE"}</span>
        </div>
      )}

      {phase === "start" && (
        <div className="screen-overlay start-overlay">
          <div className="start-layout">
            <section className="start-copy">
              <div className="eyebrow">
                <span /> DEEP SPACE // LIVE SIMULATION
              </div>
              <h1>
                <span>VOID</span>
                <em>//</em>
                <strong>RUN</strong>
              </h1>
              <p className="hero-description">
                A physics-driven interceptor sim. Real momentum, real collisions,
                real consequences. Chain kills to bend time and rack up your score.
              </p>
              <button className="primary-button" type="button" onClick={beginRun}>
                <PlayIcon />
                INITIALIZE RUN
                <span className="button-key">ENTER</span>
              </button>
              <div className="controls-guide">
                <div>
                  <span className="control-icon">WASD</span>
                  <span>THRUST</span>
                </div>
                <div>
                  <span className="control-icon mouse-icon">◉</span>
                  <span>AIM · FIRE</span>
                </div>
                <div>
                  <span className="control-icon">SHIFT</span>
                  <span>BOOST</span>
                </div>
                <div>
                  <span className="control-icon">P</span>
                  <span>PAUSE</span>
                </div>
              </div>
              <div className="feature-grid">
                <div>
                  <strong>IMPULSE PHYSICS</strong>
                  <p>Mass-based collisions with momentum, spin, and shockwave feedback.</p>
                </div>
                <div>
                  <strong>POWER LOADOUTS</strong>
                  <p>Shield, triple-shot and rapid-fire drops break the tempo.</p>
                </div>
                <div>
                  <strong>WAVE PRESSURE</strong>
                  <p>Waves ramp density and unlock a boss fragment every fourth cycle.</p>
                </div>
              </div>
            </section>
            <Scoreboard scores={scores} />
          </div>
          <div className="start-footer">
            <span>NO DOWNLOAD // NO COMMS REQUIRED</span>
            <span>BUILD 08.02 · SERVERLESS</span>
          </div>
        </div>
      )}

      {phase === "paused" && (
        <div className="screen-overlay pause-overlay">
          <div className="modal-content pause-content">
            <div className="modal-orbit">
              <PauseIcon />
            </div>
            <div className="eyebrow">
              <span /> SIGNAL HELD
            </div>
            <h2>SYSTEM PAUSED</h2>
            <p>The field is frozen. Your trajectory is safe.</p>
            <div className="pause-stats">
              <div>
                <span>SCORE</span>
                <strong>{formatScore(hud.score)}</strong>
              </div>
              <div>
                <span>WAVE</span>
                <strong>{String(hud.wave).padStart(2, "0")}</strong>
              </div>
              <div>
                <span>STREAK</span>
                <strong>x{Math.max(1, hud.combo)}</strong>
              </div>
            </div>
            <div className="modal-actions">
              <button className="primary-button" type="button" onClick={togglePause}>
                <PlayIcon /> RESUME FLIGHT
              </button>
              <button className="text-button" type="button" onClick={beginRun}>
                <RefreshIcon /> RESTART RUN
              </button>
            </div>
          </div>
        </div>
      )}

      {phase === "gameover" && (
        <div className="screen-overlay gameover-overlay">
          <div className="gameover-layout">
            <section className="modal-content gameover-copy">
              <div className="eyebrow danger">
                <span /> SIGNAL TERMINATED
              </div>
              <h2>DRIFT ENDED</h2>
              <p className="gameover-line">
                The field won this pass. Your next run starts instantly.
              </p>
              <div className="final-grid">
                <div className="final-score">
                  <span>RUN SCORE</span>
                  <strong>{formatScore(hud.score)}</strong>
                </div>
                <div className="final-meta">
                  <div>
                    <span>WAVE</span>
                    <strong>{String(hud.wave).padStart(2, "0")}</strong>
                  </div>
                  <div>
                    <span>BEST</span>
                    <strong>{formatScore(Math.max(hud.best, hud.score))}</strong>
                  </div>
                  <div>
                    <span>STREAK</span>
                    <strong>x{Math.max(1, hud.combo)}</strong>
                  </div>
                </div>
              </div>
              <button className="primary-button" type="button" onClick={beginRun}>
                <RefreshIcon />
                RE-ENTER THE DRIFT
                <span className="button-key">ENTER</span>
              </button>
            </section>
            <Scoreboard scores={scores} />
          </div>
        </div>
      )}

      <div className="bottom-status">
        <span>
          <i className="status-pip" /> FLIGHT SYSTEMS ONLINE
        </span>
        <span className="desktop-hint">
          P PAUSE <b>/</b> SPACE FIRE <b>/</b> SHIFT BOOST
        </span>
      </div>

      <div className="touch-controls" aria-label="Touch controls">
        <div
          ref={joystickRef}
          className="touch-joystick"
          onPointerDown={handleJoystickDown}
          onPointerMove={(event) => {
            if (event.currentTarget.hasPointerCapture(event.pointerId)) updateJoystick(event);
          }}
          onPointerUp={resetJoystick}
          onPointerCancel={resetJoystick}
        >
          <span className="joystick-ring" />
          <span
            className="joystick-thumb"
            style={{ left: `${50 + joystick.x * 28}%`, top: `${50 + joystick.y * 28}%` }}
          />
          <span className="joystick-label">MOVE</span>
        </div>
        <div className="right-touch-cluster">
          <button
            className="touch-boost"
            type="button"
            onPointerDown={handleBoostDown}
            onPointerUp={handleBoostUp}
            onPointerCancel={handleBoostUp}
            aria-label="Boost"
          >
            <span>⚡</span>
          </button>
          <button
            className="touch-fire"
            type="button"
            onPointerDown={handleFireDown}
            onPointerUp={handleFireUp}
            onPointerCancel={handleFireUp}
            aria-label="Fire"
          >
            <span className="fire-core" />
            <span>FIRE</span>
          </button>
        </div>
      </div>
    </main>
  );
}
