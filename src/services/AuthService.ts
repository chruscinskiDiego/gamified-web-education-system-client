
import type { ISignIn, ISignUp } from "../interfaces/user.interfaces";
import { api } from "../lib/axios";
import Cookies from "js-cookie";

export const signIn = async (data: ISignIn) => {

    try {

        const response = await api.post('/auth/login', data);

        const token = response.data.access_token;
        const userId = response.data.user_id;

        if (!token || !userId) {
            throw new Error('Authentication failed: Missing token or user ID');
        }

        Cookies.set('token', token, { secure: true, sameSite: 'strict' });
        Cookies.set('userId', String(userId), { secure: true, sameSite: 'strict' });

        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        window.dispatchEvent(
            new CustomEvent('userLoggedIn', { detail: { userId } })
        );

        return response;

    } catch (error) {
        console.error('signIn failed', error);
        throw error;
    }
};

export const signUp = async (data: ISignUp) => {
    try {
        return await api.post('/user-profile/create', data);
    } catch (error: any) {
        return error.response;
    }
};

export const logout = () => {

    Cookies.remove('token');
    Cookies.remove('userId');

    delete api.defaults.headers.common['Authorization'];
    location.reload();
    
};
