import axios from "axios";

const API_URL = "http://localhost:8000/users";

// Функция получения CSRF-токена
export const getCsrfToken = async () => {
    try {
        const response = await axios.get(`${API_URL}/csrf/`, { withCredentials: true });
        return response.data.csrfToken;
    } catch (error) {
        console.error("Ошибка получения CSRF-токена", error);
        return null;
    }
};

// Функция регистрации пользователя
export const registerUser = async ({ username, password, email, phone }) => {
    try {
        const csrfToken = await getCsrfToken();
        const response = await axios.post(
            `${API_URL}/register/`,
            { username, password, email, phone },
            {
                withCredentials: true,
                headers: { "X-CSRFToken": csrfToken },
            }
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: "Ошибка при регистрации" };
    }
};

// Функция входа пользователя
export const loginUser = async ({ username, password }) => {
    try {
        const csrfToken = await getCsrfToken();
        const response = await axios.post(
            `${API_URL}/login/`,
            { username, password },
            {
                withCredentials: true,
                headers: { "X-CSRFToken": csrfToken },
            }
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: "Ошибка при входе" };
    }
};

// Функция выхода пользователя
export const logoutUser = async () => {
    try {
        const csrfToken = await getCsrfToken();
        const response = await axios.post(
            `${API_URL}/logout/`,
            {},
            {
                withCredentials: true,
                headers: { "X-CSRFToken": csrfToken },
            }
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: "Ошибка при выходе" };
    }
};
