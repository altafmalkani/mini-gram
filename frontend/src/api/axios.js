import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:5000';
export const IMAGE_BASE_URL = `${API_BASE_URL}/static/images/`;

const axiosInstance = axios.create({
    baseURL: `${API_BASE_URL}/api`,
});

axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token_key');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Optional: Handle token expiration or unauthorized access
            // localStorage.removeItem('token_key');
            // localStorage.removeItem('role');
            // window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
