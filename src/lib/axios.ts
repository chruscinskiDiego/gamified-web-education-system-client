import axios from "axios";
import Cookies from "js-cookie";
import { logout } from "../services/AuthService";

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        "Content-Type": "application/json"
    },
});

api.interceptors.request.use(config => {

    const token = Cookies.get('accessToken');

    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;

});

api.interceptors.response.use(
    response => response,
    error => {

        const status = error.response?.status;
        const req = error?.config;

        const isLoginRequest = req && req.url && req.url.includes('/auth/login');

        if (status === 401 && !isLoginRequest) {

            logout();

            window.location.reload();

        }

        return Promise.reject(error);
    }
);