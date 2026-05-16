import React, { useState } from "react";
import { Trophy, RotateCcw, Save, Home as HomeIcon } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function GameOverModal({ score, distance, level, duration, onRestart, onSubmit, onHome, submitted }) {
    const [name, setName] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        setSubmitting(true);
        try { await onSubmit(name.trim() || "Anonymous"); }
        finally { setSubmitting(false); }
    };

    return (
        <div className="absolute inset-0 z-30 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm" data-testid="game-over-modal">
            <div className="glass-panel max-w-sm w-full p-6 reveal-up">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center"
                         style={{ background: "linear-gradient(135deg, #ff2bd6, #9b4dff)", boxShadow: "0 0 20px rgba(255,43,214,.55)" }}>
                        <Trophy size={22} color="#06030f" />
                    </div>
                    <div>
                        <h2 className="font-display text-2xl neon-glow-magenta">Run Complete</h2>
                        <p className="text-xs text-white/60 mono">SCORE BREAKDOWN</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-5">
                    <div className="glass-panel p-3" style={{ borderColor: "rgba(255,43,214,.4)" }}>
                        <div className="text-xs text-white/60 mono">SCORE</div>
                        <div className="font-display text-2xl neon-glow-magenta" data-testid="final-score">{Math.round(score).toLocaleString()}</div>
                    </div>
                    <div className="glass-panel p-3" style={{ borderColor: "rgba(33,244,255,.4)" }}>
                        <div className="text-xs text-white/60 mono">DISTANCE</div>
                        <div className="font-display text-2xl neon-glow-cyan" data-testid="final-distance">{Math.round(distance)}m</div>
                    </div>
                    <div className="glass-panel p-3">
                        <div className="text-xs text-white/60 mono">LEVEL</div>
                        <div className="font-display text-xl text-white">{level}</div>
                    </div>
                    <div className="glass-panel p-3">
                        <div className="text-xs text-white/60 mono">TIME</div>
                        <div className="font-display text-xl text-white">{duration.toFixed(1)}s</div>
                    </div>
                </div>

                {!submitted && (
                    <div className="mb-4">
                        <label className="text-xs text-white/60 mono">PILOT NAME</label>
                        <Input data-testid="player-name-input" placeholder="ANONYMOUS"
                               value={name} onChange={(e) => setName(e.target.value.slice(0, 16))}
                               className="mt-1 bg-black/40 border-white/10 text-white font-display tracking-widest"
                               maxLength={16} />
                    </div>
                )}

                <div className="flex flex-col gap-2">
                    {!submitted && (
                        <button className="btn-neon w-full" onClick={handleSubmit} disabled={submitting} data-testid="submit-score-btn">
                            <Save size={16} className="mr-2" />
                            {submitting ? "Saving..." : "Save Score"}
                        </button>
                    )}
                    <div className="flex gap-2">
                        <button className="btn-ghost flex-1" onClick={onRestart} data-testid="restart-btn">
                            <RotateCcw size={14} className="mr-2" /> Retry
                        </button>
                        <button className="btn-ghost flex-1" onClick={onHome} data-testid="home-btn">
                            <HomeIcon size={14} className="mr-2" /> Home
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
