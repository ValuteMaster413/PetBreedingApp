import axios from "axios";
import { getCsrfToken } from "./authService";

export const sendLike = async (fromId, toId) => {
    const csrf = await getCsrfToken();
    return axios.post(`http://localhost:8000/matching/like/${fromId}/${toId}/`, null, {
        headers: { "X-CSRFToken": csrf },
        withCredentials: true,
    });
};

export const checkSympathy = async (petId) => {
    const csrf = await getCsrfToken();
    const response = await axios.post(
        `http://localhost:8000/matching/sympathy/${petId}/`,
        {},
        {
            headers: { "X-CSRFToken": csrf },
            withCredentials: true
        }
    );
    return response.data.success;
};