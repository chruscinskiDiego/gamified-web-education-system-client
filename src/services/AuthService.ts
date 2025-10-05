
import type { ISignIn, ISignUp } from "../interfaces/user.interfaces";
import { api } from "../lib/axios";
import Cookies from "js-cookie";

export const signIn = async (data: ISignIn) => {

    try {

        const response = await api.post('/auth/login', data);

        const token = response.data.access_token;
        const userId = response.data.user_id;
        const userType = response.data.user_type;
        const profilePicture = response.data.user_profile_pic || null;

        if (!token || !userId) {
            throw new Error('Authentication failed: Missing token or user ID');
        }

        Cookies.set('token', token);
        Cookies.set('userId', String(userId));
        Cookies.set('type', userType);

        if (profilePicture) {
            Cookies.set('pic', profilePicture)
        }


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
    Cookies.remove('cookie');
    Cookies.remove('type');

    delete api.defaults.headers.common['Authorization'];
    location.reload();

};
