import React, { createContext, useEffect, useState } from "react";
import { api } from "../../lib/axios";
import Cookies from "js-cookie";

type UserContextType = {
    isAuthenticated: boolean;
    setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
    setUserId: React.Dispatch<React.SetStateAction<string | null>>;
    userId: string | null;
    userType: 'S' | 'T' | 'A' | null;
    setUserType: React.Dispatch<React.SetStateAction<'S' | 'T' | 'A' | null>>;
    userProfilePic: string | null;
    setUserProfilePic: React.Dispatch<React.SetStateAction<string | null>>;
};

export const ProfileContext = createContext<UserContextType | undefined>(undefined);

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

    const [userId, setUserId] = useState<string | null>(() => {
        const id = Cookies.get('userId');
        return id !== undefined ? id : null;
    });

    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
        const token = Cookies.get('token');
        if (token) {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            return true;
        }
        return false;
    });

    const [userType, setUserType] = useState<'S' | 'T' | 'A' | null>(() => {
        const type = Cookies.get('type');
        if (type === 'S' || type === 'T' || type === 'A') {
            return type;
        }
        return null;
    });

    const [userProfilePic, setUserProfilePic] = useState<string | null>(() => {

        const url = Cookies.get('pic');

        return url !== undefined ? url : null;
    })

    useEffect(() => {
        const handler = (e: Event) => {
            const custom = e as CustomEvent<{ userId: string }>;
            setUserId(custom.detail.userId);
            setIsAuthenticated(true);
        };
        window.addEventListener('userLoggedIn', handler);
        return () => window.removeEventListener('userLoggedIn', handler);
    }, []);

    console.log('autenticado? ' + isAuthenticated);
    return (
        <ProfileContext.Provider value={{ isAuthenticated, setIsAuthenticated, userId, setUserId, userType, setUserType, userProfilePic, setUserProfilePic }}>
            {children}
        </ProfileContext.Provider>
    );

};