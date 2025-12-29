const rawBase = import.meta.env.VITE_API_URL;
export const API_BASE_URL = rawBase || '/api'; // Use Vite Proxy by default locally
// Fallback for local dev if window.origin is not 8000
if (!rawBase && window.location.hostname === 'localhost') {
    // legacy fallback
}

// Helper to handle headers, including Auth
const getHeaders = (tokenOverride?: string) => {
    const headers: any = { 'Content-Type': 'application/json' };
    const token = tokenOverride || localStorage.getItem('token');
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};


export const apiService = {
    // --- AUTH ---
    async register(userData: any) {
        try {
            const res = await fetch(`${API_BASE_URL}/auth/register`, { // Ensure correct endpoint path
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(userData)
            });
            const text = await res.text();
            try {
                const data = JSON.parse(text);
                if (!res.ok) {
                    return { success: false, error: data.detail || `Error ${res.status}` };
                }
                return data;
            } catch (e) {
                return { success: false, error: `Server Error (${res.status}): ${text.substring(0, 50)}` };
            }
        } catch (e) {
            return { success: false, error: "Network Error - Verify connection" };
        }
    },


    async login(credentials: any) {
        try {
            const res = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(credentials)
            });
            const text = await res.text();
            try {
                const data = JSON.parse(text);
                if (!res.ok) {
                    return { success: false, error: data.detail || `Error ${res.status}` };
                }
                if (data.access_token) {
                    localStorage.setItem('token', data.access_token);
                }
                return data;
            } catch (e) {
                return { success: false, error: `Server Error (${res.status}): ${text.substring(0, 50)}` };
            }
        } catch (e) {
            return { success: false, error: "Network Error - Verify connection" };
        }
    },

    // --- GOOGLE ---
    async googleLogin(userData: any): Promise<any> {
        // Placeholder for real google endpoint if implemented
        return { success: false, error: "Not fully implemented on backend yet" };
    },

    // --- LMS Core ---
    async getCourses() {
        try {
            const res = await fetch(`${API_BASE_URL}/courses`, { headers: getHeaders() });
            return await res.json();
        } catch (e) { console.error(e); return { success: false }; }
    },

    async getSolarSystem(courseId: number) {
        try {
            const res = await fetch(`${API_BASE_URL}/courses/${courseId}/solar`, { headers: getHeaders() });
            return await res.json();
        } catch (e) { console.error(e); return { success: false }; }
    },

    async getMission(missionId: number) {
        try {
            const res = await fetch(`${API_BASE_URL}/missions/${missionId}`, { headers: getHeaders() });
            return await res.json();
        } catch (e) { console.error(e); return { success: false }; }
    },

    async submitMission(missionId: number, score: number, answers?: any) {
        try {
            const res = await fetch(`${API_BASE_URL}/missions/${missionId}/submit`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ score, answers })
            });
            return await res.json();
        } catch (e) { console.error(e); return { success: false }; }
    },

    async getStats() {
        try {
            const res = await fetch(`${API_BASE_URL}/stats`, { headers: getHeaders() });
            return await res.json();
        } catch (e) { console.error(e); return { success: false }; }
    },

    // --- USER SYNC (Legacy/Profile) ---
    async updateProfile(email: string, updates: any) {
        try {
            const payload: any = { ...updates };
            if (payload.coins !== undefined && payload.credits === undefined) {
                payload.credits = payload.coins;
                delete payload.coins;
            }
            const res = await fetch(`${API_BASE_URL}/profile/update`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ email, ...payload })
            });
            return await res.json();
        } catch (e) { console.error(e); }
    },
    async syncProgress(email: string, userProfile: any) {
        // Legacy sync, maybe deprecate or keep for safety
    }
};
