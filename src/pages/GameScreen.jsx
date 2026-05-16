import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Pause, Play, Home as HomeIcon, Volume2, VolumeX } from "lucide-react";
import { createInitialState, step, setInput, startRun } from "@/game/engine";
import { render } from "@/game/renderer";
import { VIEW } from "@/game/constants";
import {
    resumeAudio, startEngine, stopEngine, setEngineIntensity,
    sfxPickup, sfxBoost, sfxShield, sfxMultiplier, sfxCrash, sfxLevelUp,
    setMuted, isMuted,
} from "@/game/audio";
import HUD from "@/components/HUD";
import GameOverModal from "@/components/GameOverModal";
import { getCarProfile } from "@/hooks/useCarProfile";

const BACKEND_URL = window.location.origin;
const API = `${BACKEND_URL}/api`;

const KEY_MAP = {
    ArrowUp: "up", KeyW: "up",
    ArrowDown: "down", KeyS: "down",
    ArrowLeft: "left", KeyA: "left",
    ArrowRight: "right", KeyD: "right",
};

export default function GameScreen() {
    const navigate = useNavigate();
    const canvasRef = useRef(null);
    const stateRef = useRef(createInitialState({ playerProfile: getCarProfile() }));
    const animRef = useRef(0);
    const lastTimeRef = useRef(0);
    const huddTickRef = useRef(0);
    const [paused, setPaused] = useState(false);
    const [gameOverData, setGameOverData] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [muted, setMutedUI] = useState(isMuted());
    const [, force] = useState(0);

    const handleEvents = useCallback((state) => {
        if (!state.events.length) return;
        for (const ev of state.events) {
            if (ev.type === "pickup") {
                if (ev.payload.type === "boost")      { sfxBoost();      toast("Boost activated", { description: "+45% top speed" }); }
                else if (ev.payload.type === "shield"){ sfxShield();     toast("Shield up", { description: "Next crash absorbed" }); }
                else if (ev.payload.type === "multiplier"){ sfxMultiplier(); toast("x2 Multiplier", { description: "Double score" }); }
                else sfxPickup();
            } else if (ev.type === "level-up") {
                sfxLevelUp();
                toast(`Level ${ev.payload.level}`, { description: "Speed increasing" });
            } else if (ev.type === "shield-break") {
                sfxShield();
            } else if (ev.type === "game-over") {
                sfxCrash(); stopEngine();
                setGameOverData({
                    score: state.score, distance: state.distance,
                    level: state.level, duration: state.elapsed,
                });
            }
        }
        state.events.length = 0;
    }, []);

    const loop = useCallback((t) => {
        const state = stateRef.current;
        const lastT = lastTimeRef.current || t;
        let dt = (t - lastT) / 1000;
        if (dt > 0.05) dt = 0.05;
        lastTimeRef.current = t;

        if (state.running) step(state, dt);
        handleEvents(state);

        const ctx = canvasRef.current?.getContext("2d");
        if (ctx) render(ctx, state);

        setEngineIntensity(state.running ? state.player.speed / 9.5 : 0);

        huddTickRef.current += dt;
        if (huddTickRef.current > 0.1) {
            huddTickRef.current = 0;
            force((n) => (n + 1) & 0xffff);
        }

        animRef.current = requestAnimationFrame(loop);
    }, [handleEvents]);

    const beginRun = useCallback(() => {
        const profile = getCarProfile();
        stateRef.current = createInitialState({ playerProfile: profile });
        startRun(stateRef.current);
        setGameOverData(null);
        setSubmitted(false);
        setPaused(false);
        resumeAudio();
        startEngine();
    }, []);

    useEffect(() => {
        beginRun();
        animRef.current = requestAnimationFrame(loop);

        const onDown = (e) => {
            if (e.code === "KeyP") {
                setPaused((p) => {
                    const next = !p;
                    stateRef.current.running = !next && !stateRef.current.gameOver;
                    return next;
                });
                return;
            }
            if (e.code === "KeyM") {
                const newMuted = !isMuted();
                setMuted(newMuted);
                setMutedUI(newMuted);
                return;
            }
            const key = KEY_MAP[e.code];
            if (key) { e.preventDefault(); setInput(stateRef.current, key, true); }
        };
        const onUp = (e) => {
            const key = KEY_MAP[e.code];
            if (key) { e.preventDefault(); setInput(stateRef.current, key, false); }
        };
        window.addEventListener("keydown", onDown);
        window.addEventListener("keyup", onUp);

        return () => {
            cancelAnimationFrame(animRef.current);
            window.removeEventListener("keydown", onDown);
            window.removeEventListener("keyup", onUp);
            stopEngine();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const togglePause = () => {
        if (stateRef.current.gameOver) return;
        setPaused((p) => {
            const next = !p;
            stateRef.current.running = !next;
            return next;
        });
    };

    const toggleMute = () => {
        const newMuted = !isMuted();
        setMuted(newMuted);
        setMutedUI(newMuted);
    };

    const handleSubmitScore = async (playerName) => {
        try {
            await axios.post(`${API}/scores`, {
                player_name: playerName,
                score: Math.round(gameOverData.score),
                distance: Math.round(gameOverData.distance),
                level: gameOverData.level,
                duration_seconds: gameOverData.duration,
            });
            setSubmitted(true);
            toast.success("Score saved", { description: "View the leaderboard to see your rank." });
        } catch (e) {
            toast.error("Failed to save score", { description: e?.message || "Try again." });
        }
    };

    const state = stateRef.current;

    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center p-4" data-testid="game-screen">
            <div className="sun-halo" />

            <div className="relative w-full max-w-3xl flex items-center justify-between mb-3 z-10">
                <button className="btn-ghost" onClick={() => navigate("/")} data-testid="back-home-btn">
                    <HomeIcon size={14} className="mr-2" /> Home
                </button>
                <div className="flex items-center gap-2">
                    <button className="btn-ghost" onClick={toggleMute} data-testid="mute-btn">
                        {muted ? <VolumeX size={14} className="mr-2" /> : <Volume2 size={14} className="mr-2" />}
                        {muted ? "Unmute" : "Mute"}
                    </button>
                    <button className="btn-ghost" onClick={togglePause} data-testid="pause-btn">
                        {paused ? <Play size={14} className="mr-2" /> : <Pause size={14} className="mr-2" />}
                        {paused ? "Resume" : "Pause"}
                    </button>
                </div>
            </div>

            <div className="relative canvas-frame scanlines" style={{ width: VIEW.width, maxWidth: "100%" }}>
                <HUD state={state} />
                <canvas
                    ref={canvasRef}
                    width={VIEW.width} height={VIEW.height}
                    style={{ width: "100%", height: "auto", display: "block" }}
                    data-testid="game-canvas"
                />
                {paused && !gameOverData && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/55 backdrop-blur-sm" data-testid="pause-overlay">
                        <div className="glass-panel p-6 text-center">
                            <div className="font-display text-3xl neon-glow-cyan">PAUSED</div>
                            <p className="text-sm text-white/70 mt-2">Press P or Resume to continue</p>
                            <button className="btn-neon mt-4" onClick={togglePause} data-testid="resume-btn">
                                <Play size={14} className="mr-2" /> Resume
                            </button>
                        </div>
                    </div>
                )}
                {gameOverData && (
                    <GameOverModal
                        score={gameOverData.score}
                        distance={gameOverData.distance}
                        level={gameOverData.level}
                        duration={gameOverData.duration}
                        submitted={submitted}
                        onRestart={beginRun}
                        onSubmit={handleSubmitScore}
                        onHome={() => navigate("/")}
                    />
                )}
            </div>

            {/* Mobile Controls */}
            <div className="mt-6 w-full max-w-sm sm:hidden grid grid-cols-3 gap-4 px-2">
                <button 
                    className="p-4 rounded-xl glass-panel active:bg-cyan-500/20 active:border-cyan-400 touch-none select-none flex items-center justify-center font-display"
                    onPointerDown={() => setInput(stateRef.current, "left", true)}
                    onPointerUp={() => setInput(stateRef.current, "left", false)}
                    onPointerCancel={() => setInput(stateRef.current, "left", false)}
                >
                    &larr; L
                </button>
                <div className="grid grid-rows-2 gap-2">
                    <button 
                        className="p-2 rounded-xl glass-panel active:bg-cyan-500/20 active:border-cyan-400 touch-none select-none flex items-center justify-center font-display text-sm"
                        onPointerDown={() => setInput(stateRef.current, "up", true)}
                        onPointerUp={() => setInput(stateRef.current, "up", false)}
                        onPointerCancel={() => setInput(stateRef.current, "up", false)}
                    >
                        ACCEL
                    </button>
                    <button 
                        className="p-2 rounded-xl glass-panel active:bg-pink-500/20 active:border-pink-400 touch-none select-none flex items-center justify-center font-display text-sm"
                        onPointerDown={() => setInput(stateRef.current, "down", true)}
                        onPointerUp={() => setInput(stateRef.current, "down", false)}
                        onPointerCancel={() => setInput(stateRef.current, "down", false)}
                    >
                        BRAKE
                    </button>
                </div>
                <button 
                    className="p-4 rounded-xl glass-panel active:bg-cyan-500/20 active:border-cyan-400 touch-none select-none flex items-center justify-center font-display"
                    onPointerDown={() => setInput(stateRef.current, "right", true)}
                    onPointerUp={() => setInput(stateRef.current, "right", false)}
                    onPointerCancel={() => setInput(stateRef.current, "right", false)}
                >
                    R &rarr;
                </button>
            </div>

            <div className="mt-3 text-xs text-white/50 mono hidden sm:block">
                WASD / ARROWS to drive · P to pause · M to mute
            </div>
        </div>
    );
}
