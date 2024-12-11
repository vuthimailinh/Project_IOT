import axios from 'axios';
const device = import.meta.env.VITE_DEVICE;

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

const dailyData = async () => {
    try {
        const response = await apiClient.get(`/today/${device}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
};

const weeklyData = async () => {
    try {
        const response = await apiClient.get(`/last-week/${device}`);

        return response.data;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}

export default { dailyData, weeklyData }

