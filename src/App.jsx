import React from "react";
import "@/index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import HomeScreen from "@/pages/HomeScreen";
import GameScreen from "@/pages/GameScreen";
import Leaderboard from "@/pages/Leaderboard";
import GarageScreen from "@/pages/GarageScreen";

const TOASTER_OPTIONS = {
    style: {
        background: "rgba(10,4,30,0.9)",
        border: "1px solid rgba(155,77,255,0.4)",
        color: "#f4f4ff",
    },
};

function App() {
    return (
        <div className="App">
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<HomeScreen />} />
                    <Route path="/play" element={<GameScreen />} />
                    <Route path="/leaderboard" element={<Leaderboard />} />
                    <Route path="/garage" element={<GarageScreen />} />
                </Routes>
            </BrowserRouter>
            <Toaster theme="dark" position="top-right" toastOptions={TOASTER_OPTIONS} />
        </div>
    );
}

export default App;
