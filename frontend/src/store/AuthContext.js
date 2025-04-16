import { createContext, useState, useEffect } from "react";
import { loginUser, logoutUser, registerUser, getCsrfToken, getUserInfo } from "../api/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        // Загружаем пользователя из локального хранилища при первом рендере
        const savedUser = localStorage.getItem("user");
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [csrfToken, setCsrfToken] = useState("");

    useEffect(() => {
        getCsrfToken().then(setCsrfToken);
        fetchUserInfo();
    }, []);

    const fetchUserInfo = async () => {
        try {
            const data = await getUserInfo();
            setUser(data);
            localStorage.setItem("user", JSON.stringify(data)); // Сохраняем в localStorage
        } catch (error) {
            console.error("Ошибка загрузки данных пользователя:", error);
            setUser(null);
            localStorage.removeItem("user"); // Удаляем из localStorage в случае ошибки
        }
    };

    const signIn = async (username, password) => {
        try {
            const response = await loginUser({ username, password });
            if (response.success) {
                await fetchUserInfo(); // Загружаем профиль после входа
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
                localStorage.removeItem("user"); // Удаляем данные пользователя
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
