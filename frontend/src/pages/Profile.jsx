import {useContext, useEffect, useState} from "react";
import AuthContext from "../store/AuthContext";
import axios from "axios";
import {getCsrfToken} from "../api/authService";

const Profile = () => {
    const {user, signOut} = useContext(AuthContext);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({username: "", email: "", phone: "", password: ""});
    const [successMessage, setSuccessMessage] = useState("");


    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await axios.get("http://localhost:8000/users/user_info/", {withCredentials: true});
                if (response.data.chats && Array.isArray(response.data.chats) && response.data.chats.length > 0) {
                    setProfile(response.data.chats[0]); // Берем первый элемент массива
                    setEditData({
                        id: response.data.chats[0].id,
                        username: response.data.chats[0].username,
                        email: response.data.chats[0].email,
                        phone: response.data.chats[0].phone,
                        password: "", // Пароль не передаем, чтобы не показывать текущий
                    });
                } else {
                    setError("Помилка: профіль не знайдено");
                }
            } catch (err) {
                setError("Помилка при завантаженні профілю");
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);


    const handleLogout = async () => {
        try {
            await signOut();
            window.location.href = "/login"; // Перенаправляем после выхода
        } catch (error) {
            console.error("Ошибка при выходе:", error);
        }
    };

    const handleEdit = async () => {
        if (!profile || !profile.user_id) {
            console.error("Ошибка: отсутствует ID пользователя");
            setError("Помилка: відсутній ID користувача");
            return;
        }

        try {
            const csrfToken = await getCsrfToken();

            // Создаем копию данных и исключаем пароль, если поле пустое
            const payload = {...editData};
            if (!editData.password.trim()) {
                delete payload.password;
            }

            const response = await axios.post(
                `http://localhost:8000/users/user_edit/${profile.user_id}/`,
                payload,
                {
                    withCredentials: true,
                    headers: {
                        "X-CSRFToken": csrfToken
                    }
                }
            );

            if (response.data.success) {
                setProfile({...profile, ...payload});
                setSuccessMessage("Профіль успішно оновлено!");
                setTimeout(() => setSuccessMessage(""), 3000);
                setIsEditing(false);
            }
        } catch (err) {
            setError("Помилка при оновленні профілю");
        }
    };


    if (loading) return <p className="text-center text-gray-500">Завантаження...</p>;
    if (error) return <p className="text-center text-red-500">{error}</p>;
    if (!profile) return <p className="text-center text-gray-500">Профіль не знайдено</p>;

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-xl font-bold mb-4 text-center">Профіль користувача</h2>
                {successMessage && <p className="text-green-500 text-center">{successMessage}</p>}
                <p className="text-gray-700"><strong>Ім'я користувача:</strong> {profile.username}</p>
                <p className="text-gray-700"><strong>Email:</strong> {profile.email || "Не вказано"}</p>
                <p className="text-gray-700"><strong>Телефон:</strong> {profile.phone || "Не вказано"}</p>
                <p className="text-gray-700"><strong>Premium
                    статус:</strong> {profile.is_premium ? "Активний" : "Не активний"}</p>
                <button
                    onClick={() => setIsEditing(true)}
                    className="mt-4 w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-300"
                >
                    Редагувати
                </button>
                <button
                    onClick={handleLogout}
                    className="mt-4 w-full bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition duration-300"
                >
                    Вийти
                </button>
            </div>

            {isEditing && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Редагування профілю</h2>
                        <input
                            type="text"
                            value={editData.username}
                            onChange={(e) => setEditData({...editData, username: e.target.value})}
                            placeholder="Ім'я користувача"
                            className="w-full p-2 border border-gray-300 rounded mb-2"
                        />
                        <input
                            type="email"
                            value={editData.email}
                            onChange={(e) => setEditData({...editData, email: e.target.value})}
                            placeholder="Email"
                            className="w-full p-2 border border-gray-300 rounded mb-2"
                        />
                        <input
                            type="text"
                            value={editData.phone}
                            onChange={(e) => setEditData({...editData, phone: e.target.value})}
                            placeholder="Телефон"
                            className="w-full p-2 border border-gray-300 rounded mb-2"
                        />
                        <input
                            type="password"
                            value={editData.password}
                            onChange={(e) => setEditData({...editData, password: e.target.value})}
                            placeholder="Новий пароль"
                            className="w-full p-2 border border-gray-300 rounded mb-1"
                        />
                        <small className="text-gray-500 text-sm block mb-4">
                            Залиште порожнім, якщо не хочете змінювати пароль
                        </small>

                        <div className="flex justify-between">
                            <button
                                onClick={handleEdit}
                                className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition duration-300"
                            >
                                Зберегти
                            </button>
                            <button
                                onClick={() => setIsEditing(false)}
                                className="bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition duration-300"
                            >
                                Скасувати
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
