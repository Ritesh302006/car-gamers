import React from "react";
import { Gauge, Trophy, Route, Zap, Shield, Sparkles } from "lucide-react";

const Pill = ({ icon: Icon, label, value, color = "#21f4ff", testId }) => (
    <div className="hud-chip" data-testid={testId} style={{ borderColor: `${color}55` }}>
        <Icon size={14} style={{ color }} />
        <span style={{ color: "#cfd6ff" }}>{label}</span>
        <strong style={{ color }}>{value}</strong>
    </div>
);

const TimerBadge = ({ icon: Icon, color, seconds, testId, label }) => {
    if (seconds <= 0) return null;
    return (
        <div className="hud-chip" data-testid={testId} style={{ borderColor: color, color }} title={label}>
            <Icon size={14} />
            <span className="mono">{seconds.toFixed(1)}s</span>
        </div>
    );
};

export default function HUD({ state }) {
    const speedKmh = Math.round((state.player.speed / 9.5) * 240);
    const distance = Math.round(state.distance);
    const score = Math.round(state.score);

    return (
        <div className="absolute inset-x-0 top-0 p-4 z-10 pointer-events-none">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap gap-2">
                    <Pill icon={Trophy} label="SCORE" value={score.toLocaleString()} color="#ff2bd6" testId="hud-score" />
                    <Pill icon={Route}  label="DIST"  value={`${distance}m`} color="#21f4ff" testId="hud-distance" />
                    <Pill icon={Gauge}  label="SPD"   value={`${speedKmh}`} color="#ffe65a" testId="hud-speed" />
                </div>
                <Pill icon={Sparkles} label="LV" value={state.level} color="#9b4dff" testId="hud-level" />
            </div>
            <div className="flex gap-2 mt-2">
                <TimerBadge icon={Zap}      color="#ffe65a" seconds={state.timers.boost}       label="Boost"  testId="hud-boost" />
                <TimerBadge icon={Shield}   color="#21f4ff" seconds={state.timers.shield}      label="Shield" testId="hud-shield" />
                <TimerBadge icon={Sparkles} color="#ff2bd6" seconds={state.timers.multiplier}  label="x2"     testId="hud-multiplier" />
            </div>
        </div>
    );
}
