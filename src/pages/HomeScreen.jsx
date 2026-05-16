import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Play, Trophy, Keyboard, Zap, Shield, Sparkles, Wrench } from "lucide-react";

const ControlKey = ({ label }) => (
    <span className="inline-flex items-center justify-center px-2 py-1 rounded-md mono text-xs"
          style={{
              border: "1px solid rgba(155,77,255,.4)",
              background: "rgba(20,12,40,.65)", color: "#f4f4ff",
              boxShadow: "inset 0 -2px 0 rgba(155,77,255,.35)", minWidth: 28,
          }}>
        {label}
    </span>
);

const PowerRow = ({ icon: Icon, color, name, desc }) => (
    <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
             style={{ border: `1px solid ${color}66`, background: "rgba(8,4,20,.6)", boxShadow: `0 0 16px ${color}44` }}>
            <Icon size={16} style={{ color }} />
        </div>
        <div>
            <div className="font-display text-sm" style={{ color }}>{name}</div>
            <div className="text-xs text-white/60">{desc}</div>
        </div>
    </div>
);

export default function HomeScreen() {
    const navigate = useNavigate();
    const [showHelp, setShowHelp] = useState(false);

    useEffect(() => {
        const onKey = (e) => {
            if (e.code === "Space" || e.code === "Enter") {
                e.preventDefault();
                navigate("/play");
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [navigate]);

    return (
        <div className="relative min-h-screen overflow-hidden" data-testid="home-screen">
            <video 
                autoPlay 
                loop 
                muted 
                playsInline 
                className="absolute inset-0 w-full h-full object-cover pointer-events-none opacity-30 z-0"
                style={{ maskImage: 'linear-gradient(to bottom, black 0%, transparent 80%)', WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 80%)' }}
                src="https://labs.google/fx/api/og-video/shared/a83d4a2c-6dbd-4ddc-acad-603a0ff91b0a"
            />
            <div className="sun-halo" />
            <div className="grid-horizon" />

            <div className="relative z-10 max-w-6xl mx-auto px-6 py-10">
                <div className="flex items-center justify-between mb-12 reveal-up">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                             style={{ background: "linear-gradient(135deg, #ff2bd6, #21f4ff)", boxShadow: "0 0 20px rgba(255,43,214,.55)" }}>
                            <span className="font-display text-black">C</span>
                        </div>
                        <span className="font-display tracking-widest text-sm text-white/80">CAR · GAMER</span>
                    </div>
                    <div className="flex gap-2">
                        <button className="btn-ghost" onClick={() => navigate("/garage")} data-testid="nav-garage-btn">
                            <Wrench size={14} className="mr-2" /> <span className="hidden sm:inline">Garage</span>
                        </button>
                        <button className="btn-ghost" onClick={() => navigate("/leaderboard")} data-testid="nav-leaderboard-btn">
                            <Trophy size={14} className="mr-2" /> <span className="hidden sm:inline">Leaderboard</span>
                        </button>
                    </div>
                </div>

                <div className="grid lg:grid-cols-12 gap-10 items-center">
                    <div className="lg:col-span-7 reveal-up" style={{ animationDelay: ".05s" }}>
                        <div className="mono text-xs tracking-[0.4em] text-cyan-300/80 mb-4">
                            // ARCADE · HIGHWAY · INFINITE
                        </div>
                        <h1 className="font-display leading-none"
                            style={{
                                fontSize: "clamp(48px, 9vw, 112px)",
                                background: "linear-gradient(180deg, #ffffff 0%, #ffe65a 35%, #ff2bd6 75%, #21f4ff 100%)",
                                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                                filter: "drop-shadow(0 0 22px rgba(255,43,214,.55)) drop-shadow(0 0 6px rgba(33,244,255,.35))",
                            }}>
                            CAR GAMER
                        </h1>
                        <p className="mt-6 max-w-xl text-white/70 text-lg leading-relaxed">
                            Dodge traffic across an infinite synthwave highway. Chain power-ups,
                            survive escalating levels, and carve your name into the leaderboard.
                        </p>

                        <div className="mt-10 flex flex-wrap items-center gap-3">
                            <button className="btn-neon" onClick={() => navigate("/play")} data-testid="start-game-btn">
                                <Play size={16} className="mr-2" /> Start Driving
                            </button>
                            <button className="btn-ghost" onClick={() => setShowHelp((s) => !s)} data-testid="toggle-controls-btn">
                                <Keyboard size={14} className="mr-2" />
                                Controls
                            </button>
                        </div>

                        {showHelp && (
                            <div className="glass-panel p-5 mt-6 max-w-md reveal-up" data-testid="controls-panel">
                                <div className="mono text-xs text-cyan-200/80 mb-3">// CONTROLS</div>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div className="flex items-center gap-2"><ControlKey label="W" /> <ControlKey label="↑" /> <span className="text-white/70">Accelerate</span></div>
                                    <div className="flex items-center gap-2"><ControlKey label="S" /> <ControlKey label="↓" /> <span className="text-white/70">Brake</span></div>
                                    <div className="flex items-center gap-2"><ControlKey label="A" /> <ControlKey label="←" /> <span className="text-white/70">Steer Left</span></div>
                                    <div className="flex items-center gap-2"><ControlKey label="D" /> <ControlKey label="→" /> <span className="text-white/70">Steer Right</span></div>
                                    <div className="flex items-center gap-2 col-span-2"><ControlKey label="P" /> <span className="text-white/70">Pause / Resume</span></div>
                                    <div className="col-span-2 text-xs text-white/50 mt-2 border-t border-white/10 pt-2 text-center">
                                        Playing on Mobile? Touch controls will appear automatically!
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="lg:col-span-5 reveal-up" style={{ animationDelay: ".15s" }}>
                        <div className="glass-panel p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <div className="mono text-xs text-cyan-200/80">// POWER-UPS</div>
                                    <div className="font-display text-xl mt-1">Grab. Survive. Score.</div>
                                </div>
                                <div className="mono text-xs text-white/50">3 TYPES</div>
                            </div>
                            <div className="space-y-4">
                                <PowerRow icon={Zap}      color="#ffe65a" name="BOOST"         desc="Top speed +45% for 4.5s — escape jams." />
                                <PowerRow icon={Shield}   color="#21f4ff" name="SHIELD"        desc="Absorb one crash. Auto-vaporises the enemy." />
                                <PowerRow icon={Sparkles} color="#ff2bd6" name="X2 MULTIPLIER" desc="Double score for 6s. Stack the leaderboard." />
                            </div>
                            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                                <span className="mono text-xs text-white/50">Press</span>
                                <ControlKey label="SPACE" />
                                <span className="mono text-xs text-white/50">to start</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
