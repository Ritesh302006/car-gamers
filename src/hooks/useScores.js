import { useEffect, useState } from "react";
import axios from "axios";

const BACKEND_URL = window.location.origin;
const API = `${BACKEND_URL}/api`;

export function useScores(limit = 10) {
    const [scores, setScores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError(null);
        axios.get(`${API}/scores?limit=${limit}`)
            .then((res) => { if (!cancelled) setScores(res.data || []); })
            .catch((e) => { if (!cancelled) setError(e?.message || "Failed to load scores"); })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [limit, refreshKey]);

    return { scores, loading, error, refresh: () => setRefreshKey((k) => k + 1) };
}
