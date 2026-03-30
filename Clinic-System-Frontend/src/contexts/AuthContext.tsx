import React, { createContext, useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { loginUser, logoutUser, type User } from '../services/AuthService';

export interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    isLoading: boolean;
    isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_DATA_COOKIE_NAME = 'userData';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    /** Khôi phục trạng thái đăng nhập từ cookie */
    const getInitialAuthState = () => {
        const userJsonFromCookie = Cookies.get(USER_DATA_COOKIE_NAME);
        const userFromCookie = userJsonFromCookie ? JSON.parse(userJsonFromCookie) : null;

        if (userFromCookie) {
            return {
                user: userFromCookie as User,
            };
        }

        Cookies.remove(USER_DATA_COOKIE_NAME, { path: '/' });
        return {
            user: null,
        };
    };

    const { user: initialUser } = getInitialAuthState();

    const [user, setUser] = useState<User | null>(initialUser);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    /** Xử lý đăng nhập */
    const login = useCallback(async (email: string, password: string) => {
        try {
            setIsLoading(true);
            const userObject = await loginUser(email, password);

            Cookies.set(USER_DATA_COOKIE_NAME, JSON.stringify(userObject), {
                expires: 7,
                path: '/'
            });

            setUser(userObject);
        } catch (err: any) {
            console.error('Lỗi đăng nhập:', err);
            let message = 'Lỗi đăng nhập';
            
            if (axios.isAxiosError && axios.isAxiosError(err)) {
                const resp = err.response as any;
                if (resp && resp.data) {
                    const data = resp.data;
                    if (typeof data === 'object' && data.message) {
                        message = String(data.message);
                    } else if (typeof data === 'string') {
                        message = data;
                    }
                } else if (err.message) {
                    message = err.message;
                }
            } else if (err instanceof Error && err.message) {
                message = err.message;
            }

            throw new Error(message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    /** Xử lý đăng xuất */
    const logout = useCallback(async () => {
        setIsLoading(true);
        try {
            await logoutUser();
            console.log("Đã đăng xuất thành công.");
        } catch (error) {
            console.error('Lỗi khi đăng xuất:', error);
        } finally {
            setUser(null);
            Cookies.remove(USER_DATA_COOKIE_NAME, { path: '/' });
            setIsLoading(false);
        }
    }, []);

    const value = useMemo(
        () => ({
            user,
            login,
            logout,
            isLoading,
            isAuthenticated: !!user
        }),
        [user, login, logout, isLoading]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/** Hook để sử dụng AuthContext */
export const useAuth = () => {
    const context = React.useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
