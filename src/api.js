import axios from 'axios';
const accessToken = localStorage.getItem('accessToken');
const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
    },
});

const deviceApi = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
    },
});

const authApi = axios.create({
    baseURL: import.meta.env.VITE_API_AUTH_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

const login = async (username, password) => {
    try {
        const response = await authApi.post('/auth/login-basic', { username, password });
        return response.data;
    } catch (error) {
        console.error('Error during login:', error);
        throw error;
    }
};

const dailyData = async (deviceId) => {
    try {
        const response = await apiClient.get(`/today/${deviceId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
};

const listDevice = async () => {
    try {
        const response = await deviceApi.get('/devices');
        return response.data;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
};

const weeklyData = async (deviceId) => {
    try {
        const response = await apiClient.get(`/last-week/${deviceId}`);

        return response.data;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}

export default { dailyData, weeklyData, login, listDevice }

