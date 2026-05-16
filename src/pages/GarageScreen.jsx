import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Droplet, Brush, Play } from "lucide-react";
import { useCarProfile } from "@/hooks/useCarProfile";
import { drawCar } from "@/game/renderer";

const PAINTS = [
    { id: "cyan", hex: "#21f4ff", label: "Neon Cyan" },
    { id: "hotpink", hex: "#ff2bd6", label: "Hot Pink" },
    { id: "electric", hex: "#4d4dff", label: "Electric Blue" },
    { id: "acid", hex: "#ccff00", label: "Acid Green" },
    { id: "yellow", hex: "#ffe65a", label: "Sunburst" },
    { id: "violet", hex: "#9b4dff", label: "Deep Violet" },
    { id: "crimson", hex: "#ff1133", label: "Crimson Red" },
    { id: "white", hex: "#ffffff", label: "Titanium" }
];

const DECALS = [
    { id: "none", label: "None" },
    { id: "stripe_single", label: "Single Stripe" },
    { id: "stripe_double", label: "Double Stripe" },
    { id: "flame", label: "Flame" },
    { id: "chevrons", label: "Chevrons" }
];

const DECAL_COLORS = [
    { id: "white", hex: "#ffffff", label: "White" },
    { id: "black", hex: "#100726", label: "Midnight" },
    { id: "cyan", hex: "#21f4ff", label: "Cyan" },
    { id: "hotpink", hex: "#ff2bd6", label: "Hot Pink" },
    { id: "yellow", hex: "#ffe65a", label: "Yellow" }
];

export default function GarageScreen() {
    const navigate = useNavigate();
    const [profile, updateProfile] = useCarProfile();
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // draw background floor
        ctx.fillStyle = "#0f0a22";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // draw underglow
        ctx.shadowColor = profile.paint;
        ctx.shadowBlur = 40;
        ctx.fillStyle = profile.paint;
        ctx.beginPath();
        ctx.ellipse(canvas.width / 2, canvas.height / 2, 70, 100, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        drawCar(ctx, canvas.width / 2 - 44, canvas.height / 2 - 78, 88, 156, profile.paint, profile.decalColor, profile.decal);

    }, [profile]);

    return (
        <div className="relative min-h-screen overflow-hidden" data-testid="garage-screen">
            <div className="sun-halo opacity-30" />
            
            <div className="relative z-10 max-w-5xl mx-auto px-6 py-10">
                <div className="flex items-center justify-between mb-8 reveal-up">
                    <button className="btn-ghost" onClick={() => navigate("/")} data-testid="back-home-btn">
                        <ArrowLeft size={14} className="mr-2" /> Home
                    </button>
                    <div className="font-display tracking-[0.2em] text-white/50 text-sm">GARAGE</div>
                </div>

                <div className="grid lg:grid-cols-2 gap-10">
                    <div className="reveal-up glass-panel flex flex-col items-center justify-center p-8 border-cyan-400/30 shadow-[0_0_40px_rgba(33,244,255,0.1)]">
                        <canvas 
                            ref={canvasRef} 
                            width={300} 
                            height={400} 
                            className="rounded-xl border border-white/5 bg-black/50 mx-auto"
                            style={{ boxShadow: 'inset 0 0 40px rgba(0,0,0,0.8)' }}
                        />
                    </div>
                    
                    <div className="reveal-up space-y-8" style={{ animationDelay: '0.1s' }}>
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <Droplet size={18} className="text-cyan-400" />
                                <h2 className="font-display text-xl">Paint Color</h2>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                {PAINTS.map(p => (
                                    <button 
                                        key={p.id}
                                        className={`w-12 h-12 rounded-full border-2 transition-transform duration-200 ${profile.paint === p.hex ? 'border-white scale-110 shadow-[0_0_15px_currentColor]' : 'border-black/50 hover:scale-105'}`}
                                        style={{ backgroundColor: p.hex, color: p.hex }}
                                        onClick={() => updateProfile({ paint: p.hex })}
                                        title={p.label}
                                    />
                                ))}
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <Brush size={18} className="text-pink-400" />
                                <h2 className="font-display text-xl">Decal Pattern</h2>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {DECALS.map(d => (
                                    <button
                                        key={d.id}
                                        className={`p-3 rounded-lg border text-sm font-display tracking-wide transition-all ${profile.decal === d.id ? 'bg-pink-500/20 border-pink-400 text-pink-300 shadow-[0_0_15px_rgba(255,43,214,0.3)]' : 'border-white/10 text-white/60 hover:bg-white/5 hover:border-white/30'}`}
                                        onClick={() => updateProfile({ decal: d.id })}
                                    >
                                        {d.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {profile.decal !== 'none' && (
                            <div className="reveal-up" style={{ animationDelay: '0s' }}>
                                <div className="text-sm font-display text-white/50 mb-3">Decal Color</div>
                                <div className="flex flex-wrap gap-3">
                                    {DECAL_COLORS.map(c => (
                                        <button 
                                            key={c.id}
                                            className={`w-8 h-8 rounded-full border-2 transition-transform duration-200 ${profile.decalColor === c.hex ? 'border-white scale-110 shadow-[0_0_10px_currentColor]' : 'border-black/50 hover:scale-105'}`}
                                            style={{ backgroundColor: c.hex, color: c.hex }}
                                            onClick={() => updateProfile({ decalColor: c.hex })}
                                            title={c.label}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="pt-6 border-t border-white/10">
                            <button className="btn-neon w-full sm:w-auto" onClick={() => navigate("/play")} data-testid="drive-btn">
                                <Play size={16} className="mr-2 inline" /> Save & Drive
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
