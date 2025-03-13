import { createContext, useState, useEffect } from "react";
import { loginUser, logoutUser, registerUser, getCsrfToken } from "../api/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [csrfToken, setCsrfToken] = useState("");

    useEffect(() => {
        getCsrfToken().then(setCsrfToken);
    }, []);

    const signIn = async (username, password) => {
        try {
            const response = await loginUser({ username, password });
            if (response.success) {
                setUser({ username });
            }
        } catch (error) {
            console.error("Ошибка входа:", error);
            throw error;
        }
    };

    const signUp = async (userData) => {
        try {
            const response = await registerUser(userData);
            return response;
        } catch (error) {
            console.error("Ошибка регистрации:", error);
            throw error;
        }
    };

    const signOut = async () => {
        try {
            const response = await logoutUser();
            if (response.success) {
                setUser(null);
            }
        } catch (error) {
            console.error("Ошибка выхода:", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, signIn, signUp, signOut, csrfToken }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
