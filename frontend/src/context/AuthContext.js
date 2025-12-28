import React, { createContext, useState, useContext, useEffect } from 'react';
import axiosInstance from '../api/axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [role, setRole] = useState(localStorage.getItem('role') || null);

    const fetchUserProfile = async () => {
        try {
            const response = await axiosInstance.get('/user/me');
            setUser(response.data);
            setIsAuthenticated(true);
        } catch (error) {
            console.error("Failed to fetch user profile", error);
            logout();
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token_key');
        if (token) {
            fetchUserProfile();
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (identifier, password) => {
        const formData = new URLSearchParams();
        formData.append('identifier', identifier);
        formData.append('password', password);

        const response = await axiosInstance.post('/auth/login', formData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        const { token_key, role } = response.data;
        localStorage.setItem('token_key', token_key);
        localStorage.setItem('role', role);
        setRole(role);
        await fetchUserProfile();
        return response.data;
    };

    const register = async (formData) => {
        const response = await axiosInstance.post('/auth/register', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    };

    const logout = () => {
        localStorage.removeItem('token_key');
        localStorage.removeItem('role');
        setUser(null);
        setIsAuthenticated(false);
        setRole(null);
    };

    const value = {
        user,
        isAuthenticated,
        role,
        loading,
        login,
        register,
        logout,
        fetchUserProfile
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
