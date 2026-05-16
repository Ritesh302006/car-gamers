import { useState } from "react";

const DEFAULT_PROFILE = {
    paint: "#21f4ff",
    decal: "none",
    decalColor: "#ffffff"
};

export function useCarProfile() {
    const [profile, setProfile] = useState(() => {
        const saved = localStorage.getItem("car_gamer_car_profile");
        return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
    });

    const updateProfile = (updates) => {
        const newProfile = { ...profile, ...updates };
        setProfile(newProfile);
        localStorage.setItem("car_gamer_car_profile", JSON.stringify(newProfile));
    };

    return [profile, updateProfile];
}

export function getCarProfile() {
    const saved = localStorage.getItem("car_gamer_car_profile");
    return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
}
