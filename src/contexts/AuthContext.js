import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const logout = useCallback(() => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }, []);

    const saveUserToLocalStorage = (userData) => {
        try {
            const userToSave = {
                _id: userData._id,
                email: userData.email,
                firstName: userData.firstName,
                lastName: userData.lastName,
                username: userData.username,
                avatarImageId: userData.avatarImageId
            };
            localStorage.setItem('user', JSON.stringify(userToSave));
        } catch (error) {
            console.error("Krytyczny błąd zapisu w localStorage:", error);
            localStorage.clear();
        }
    };

    useEffect(() => {
        const checkAuth = async () => {
            const storedToken = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');

            if (storedToken && storedUser) {
                try {
                    const response = await fetch('https://clea-client-backend-bjdna9f5eug4a9fd.polandcentral-01.azurewebsites.net/api/auth/verify-token', {
                        headers: {
                            'Authorization': `Bearer ${storedToken}`
                        }
                    });

                    if (response.ok) {
                        setToken(storedToken);
                        setUser(JSON.parse(storedUser));
                    } else {
                        console.warn('Token nieprawidłowy lub sesja wygasła.');
                        logout();
                    }
                } catch (error) {
                    console.error('Błąd weryfikacji tokenu (serwer offline?):', error);
                    logout();
                }
            } else {
                logout();
            }
            setLoading(false);
        };

        checkAuth();
    }, [logout]);

    const login = async (loginData, password) => {
        try {
            const response = await fetch('https://clea-client-backend-bjdna9f5eug4a9fd.polandcentral-01.azurewebsites.net/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    login: loginData,
                    password: password
                })
            });

            const data = await response.json();

            if (response.ok) {
                setToken(data.token);
                setUser(data.user);

                localStorage.setItem('token', data.token);
                saveUserToLocalStorage(data.user);

                return { success: true, message: data.message };
            } else {
                return {
                    success: false,
                    message: data.message,
                    requiresVerification: data.requiresVerification,
                    email: data.email
                };
            }
        } catch (error) {
            console.error('Błąd logowania:', error);
            return { success: false, message: 'Błąd połączenia z serwerem' };
        }
    };

    const register = async (userData) => {
        try {
            const response = await fetch('https://clea-client-backend-bjdna9f5eug4a9fd.polandcentral-01.azurewebsites.net/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (response.ok) {
                return {
                    success: true,
                    message: data.message,
                    requiresVerification: data.requiresVerification,
                    email: data.email
                };
            } else {
                return {
                    success: false,
                    message: data.message,
                    requiresVerification: data.requiresVerification || false,
                    email: data.email
                };
            }
        } catch (error) {
            console.error('Błąd rejestracji:', error);
            return { success: false, message: 'Błąd połączenia z serwerem' };
        }
    };

    const updateUser = (updatedUserData) => {
        setUser(updatedUserData);
        saveUserToLocalStorage(updatedUserData);
    };

    const refreshUserData = async () => {
        if (!token) return;
        try {
            const response = await fetch('https://clea-client-backend-bjdna9f5eug4a9fd.polandcentral-01.azurewebsites.net/api/auth/profile', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const userData = await response.json();
                setUser(userData);
                saveUserToLocalStorage(userData);
                return { success: true, user: userData };
            } else {
                return { success: false, message: 'Nie udało się odświeżyć danych' };
            }
        } catch (error) {
            return { success: false, message: 'Błąd serwera' };
        }
    };

    const value = {
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateUser,
        refreshUserData,
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};