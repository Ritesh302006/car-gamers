import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Trophy, Play, RefreshCw } from "lucide-react";
import { useScores } from "@/hooks/useScores";

const RankBadge = ({ rank }) => {
    const styles = [
        { bg: "linear-gradient(135deg,#ffe65a,#ff8a3d)", color: "#06030f" },
        { bg: "linear-gradient(135deg,#d4d4ff,#9b4dff)", color: "#06030f" },
        { bg: "linear-gradient(135deg,#ff8a3d,#ff2bd6)", color: "#06030f" },
    ];
    const style = styles[rank - 1] || { bg: "rgba(155,77,255,.2)", color: "#cfd6ff" };
    return (
        <div className="w-9 h-9 rounded-full flex items-center justify-center font-display"
             style={{ background: style.bg, color: style.color }}>
            {rank}
        </div>
    );
};

export default function Leaderboard() {
    const navigate = useNavigate();
    const { scores, loading, error, refresh } = useScores(10);

    return (
        <div className="relative min-h-screen overflow-hidden" data-testid="leaderboard-screen">
            <div className="sun-halo" />
            <div className="grid-horizon" />
            <div className="relative z-10 max-w-3xl mx-auto px-6 py-10">
                <div className="flex items-center justify-between mb-8 reveal-up">
                    <button className="btn-ghost" onClick={() => navigate("/")} data-testid="back-home-btn">
                        <ArrowLeft size={14} className="mr-2" /> Home
                    </button>
                    <div className="flex gap-2">
                        <button className="btn-ghost" onClick={refresh} data-testid="refresh-btn">
                            <RefreshCw size={14} className="mr-2" /> Refresh
                        </button>
                        <button className="btn-neon" onClick={() => navigate("/play")} data-testid="play-from-board-btn">
                            <Play size={14} className="mr-2" /> Drive
                        </button>
                    </div>
                </div>

                <div className="reveal-up" style={{ animationDelay: ".05s" }}>
                    <div className="mono text-xs tracking-[0.4em] text-cyan-300/80 mb-3">// HALL · OF · FAME</div>
                    <h1 className="font-display"
                        style={{
                            fontSize: "clamp(40px, 7vw, 76px)",
                            background: "linear-gradient(180deg, #ffffff 0%, #ff2bd6 60%, #9b4dff 100%)",
                            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                        }}>
                        LEADERBOARD
                    </h1>
                </div>

                <div className="glass-panel mt-8 reveal-up" style={{ animationDelay: ".15s" }}>
                    {loading ? (
                        <div className="p-10 text-center text-white/60 mono" data-testid="leaderboard-loading">Loading...</div>
                    ) : error ? (
                        <div className="p-10 text-center text-red-300 mono" data-testid="leaderboard-error">{error}</div>
                    ) : scores.length === 0 ? (
                        <div className="p-10 text-center" data-testid="leaderboard-empty">
                            <Trophy size={28} className="mx-auto mb-3 text-pink-400" />
                            <div className="font-display text-xl">No scores yet</div>
                            <p className="text-white/60 mt-1 text-sm">Be the first to set a record.</p>
                            <button className="btn-neon mt-5" onClick={() => navigate("/play")} data-testid="empty-play-btn">
                                <Play size={14} className="mr-2" /> Start Driving
                            </button>
                        </div>
                    ) : (
                        <div className="divide-y divide-white/10" data-testid="leaderboard-list">
                            {scores.map((s, idx) => (
                                <div key={s.id} className="flex items-center gap-4 p-4" data-testid={`leaderboard-row-${idx}`}>
                                    <RankBadge rank={idx + 1} />
                                    <div className="flex-1 min-w-0">
                                        <div className="font-display text-lg truncate">{s.player_name}</div>
                                        <div className="text-xs text-white/55 mono">
                                            LV {s.level} · {s.distance}m · {s.duration_seconds?.toFixed?.(1) ?? s.duration_seconds}s
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-display text-xl neon-glow-magenta">{s.score.toLocaleString()}</div>
                                        <div className="text-[10px] text-white/40 mono">SCORE</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
