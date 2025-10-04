import React, { createContext, useEffect, useState } from "react";
import { api } from "../../lib/axios";

type UserContextType = {
    isAuthenticated: boolean;
    setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
    setUserId: React.Dispatch<React.SetStateAction<string | null>>;
    userId: string | null;
    userType: 'S' | 'T' | 'A' | null;
    setUserType: React.Dispatch<React.SetStateAction<'S' | 'T' | 'A' | null>>;
    userXp: number | null;
    setUserXp: React.Dispatch<React.SetStateAction<number | null>>;
};

export const ProfileContext = createContext<UserContextType | undefined>(undefined);

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

    const [userId, setUserId] = useState<string | null>(() => {
        return localStorage.getItem('userId');
    });

    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
        const token = localStorage.getItem('token');
        if (token) {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            return true;
        }
        return false;
    });

    const [userType, setUserType] = useState<'S' | 'T' | 'A' | null>(null);
    const [userXp, setUserXp] = useState<number | null>(null);

    useEffect(() => {
        const handler = (e: Event) => {
            const custom = e as CustomEvent<{ userId: string }>;
            setUserId(custom.detail.userId);
            setIsAuthenticated(true);
        };
        window.addEventListener('userLoggedIn', handler);
        return () => window.removeEventListener('userLoggedIn', handler);
    }, []);

    console.log('AUTHENTICATED:', isAuthenticated);
    return (
        <ProfileContext.Provider value={{ isAuthenticated, setIsAuthenticated, userId, setUserId, userType, setUserType, userXp, setUserXp }}>
            {children}
        </ProfileContext.Provider>
    );

};