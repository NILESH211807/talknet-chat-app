import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
    timeout: 10000,
    timeoutErrorMessage: 'Request timed out',
});

export default axiosInstance;
