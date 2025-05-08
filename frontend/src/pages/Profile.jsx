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
    const [pets, setPets] = useState([]);
    const [isCreating, setIsCreating] = useState(false);
    const [newPet, setNewPet] = useState({
        species: "",
        gender: "",
        breed: "",
        price: "",
        coat_color: "",
        age: "",
    });
    const [formErrors, setFormErrors] = useState({});
    const [isEditingPet, setIsEditingPet] = useState(false);
    const [petToEdit, setPetToEdit] = useState(null);
    const [newPhotos, setNewPhotos] = useState([]);
    const [deletePhotoIds, setDeletePhotoIds] = useState([]);
    const [newPetPhotos, setNewPetPhotos] = useState([]);

    useEffect(() => {
        const fetchPets = async () => {
            try {
                const response = await axios.get("http://localhost:8000/pets/all_pets/", {withCredentials: true});
                setPets(response.data.reports);
            } catch (e) {
                console.error("Не вдалося завантажити тварин:", e);
            }
        };

        if (!loading && profile) {
            fetchPets();
        }
    }, [loading, profile]);


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

    const handleSaveTextData = async () => {
        const formData = new FormData();
        ["species", "gender", "breed", "price", "coat_color", "age"].forEach(field =>
            formData.append(field, petToEdit[field])
        );

        const csrf = await getCsrfToken();
        await axios.post(
            `http://localhost:8000/pets/edit_pet/${petToEdit.id}/`,
            formData,
            {
                headers: {
                    "X-CSRFToken": csrf,
                    "Content-Type": "multipart/form-data",
                },
                withCredentials: true,
            }
        );
    }

    const handleAddPhotos = async () => {
        const formData = new FormData();
        newPhotos.forEach(photo => formData.append("photos", photo));

        const csrf = await getCsrfToken();
        await axios.post(
            `http://localhost:8000/pets/edit_pet/${petToEdit.id}/`,
            formData,
            {
                headers: {
                    "X-CSRFToken": csrf,
                    "Content-Type": "multipart/form-data",
                },
                withCredentials: true,
            }
        );
    }

    const handleDeletePhoto = async (photoUrlOrId) => {
        try {
            let photoId;

            // Якщо прийшов вже числовий id
            if (typeof photoUrlOrId === "number") {
                photoId = photoUrlOrId;
                console.log("photoId:", photoUrlOrId);
            } else if (typeof photoUrlOrId === "string") {
                // Витягуємо id з URL, наприклад /media/pet_photos/42.png
                const filename = photoUrlOrId.split("/").pop();        // "42.png"
                photoId = parseInt(filename.split(".")[0], 10);        // 42
                console.log("photoId:", photoUrlOrId);
            }

            if (isNaN(photoId)) {
                console.error("Невірний photoId:", photoUrlOrId);
                return;
            }

            const formData = new FormData();
            formData.append("delete_photo", photoId);

            const csrf = await getCsrfToken();
            const res = await axios.post(
                `http://localhost:8000/pets/edit_pet/${petToEdit.id}/`,
                formData,
                {
                    headers: {
                        "X-CSRFToken": csrf,
                        "Content-Type": "multipart/form-data"
                    },
                    withCredentials: true,
                }
            );

            if (res.data.success) {
                // оновлюємо локальний список фото після видалення
                setPetToEdit({
                    ...petToEdit,
                    photos: petToEdit.photos.filter((photo) => photo.id !== photoId),
                });
            }
        } catch (error) {
            console.error("Помилка при видаленні фото:", error);
        }
    };

    const confirmDeletePhotos = async () => {
        try {
            const csrf = await getCsrfToken();
            const formData = new FormData();
            deletePhotoIds.forEach(id => formData.append("delete_photo", id));

            const res = await axios.post(
                `http://localhost:8000/pets/edit_pet/${petToEdit.id}/`,
                formData,
                {
                    headers: {
                        "X-CSRFToken": csrf,
                        "Content-Type": "multipart/form-data"
                    },
                    withCredentials: true,
                }
            );

            if (res.data.success) {
                setPetToEdit({
                    ...petToEdit,
                    photos: petToEdit.photos.filter(photo => !deletePhotoIds.includes(photo.id)),
                });
                setDeletePhotoIds([]); // очистка
            }
        } catch (error) {
            console.error("Помилка при видаленні фото:", error);
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
                <p><strong>Ім'я:</strong> {profile.username}</p>
                <p><strong>Email:</strong> {profile.email}</p>
                <p><strong>Телефон:</strong> {profile.phone}</p>
                <p><strong>Premium:</strong> {profile.is_premium ? "Активний" : "Не активний"}</p>
                <button onClick={() => setIsEditing(true)}
                        className="mt-4 w-full bg-blue-500 text-white py-2 rounded">Редагувати
                </button>
                <button onClick={handleLogout} className="mt-2 w-full bg-red-500 text-white py-2 rounded">Вийти</button>
            </div>

            {isEditing && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Редагування профілю</h2>
                        {["username", "email", "phone"].map(field => (
                            <input
                                key={field}
                                type="text"
                                placeholder={field}
                                value={editData[field]}
                                onChange={e => setEditData({...editData, [field]: e.target.value})}
                                className="w-full p-2 border mb-2 rounded"
                            />
                        ))}
                        <input
                            type="password"
                            placeholder="Новий пароль"
                            value={editData.password}
                            onChange={e => setEditData({...editData, password: e.target.value})}
                            className="w-full p-2 border mb-1 rounded"
                        />
                        <small className="text-gray-500 block mb-4">Залиште порожнім, якщо не хочете змінювати
                            пароль</small>
                        <div className="flex justify-between">
                            <button onClick={handleEdit}
                                    className="bg-green-500 text-white px-4 py-2 rounded">Зберегти
                            </button>
                            <button onClick={() => setIsEditing(false)}
                                    className="bg-gray-500 text-white px-4 py-2 rounded">Скасувати
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="mt-6 w-full max-w-md">
                <h3 className="text-lg font-semibold mb-2">Ваші тварини</h3>
                {pets.length === 0 ? (
                    <p className="text-gray-500">Ви поки що не додали жодної тварини 🐾</p>
                ) : (
                    <div className="space-y-4">
                        {pets.map((pet, index) => (
                            <div key={index} className="border p-4 bg-white rounded shadow">
                                <p><strong>Вид:</strong> {pet.species}</p>
                                <p><strong>Стать:</strong> {pet.gender}</p>
                                <p><strong>Порода:</strong> {pet.breed || "Невідомо"}</p>
                                <p><strong>Колір шерсті:</strong> {pet.coat_color || "Невідомо"}</p>
                                <p><strong>Ціна:</strong> {pet.price || "Безкоштовно"}</p>
                                <p><strong>Вік:</strong> {pet.age} міс.</p>
                                {pet.photos?.length > 0 && (
                                    <div className="flex gap-2 mt-2">
                                        {pet.photos.map((photo, i) => (
                                            <img
                                                key={i}
                                                src={`http://localhost:8000${photo.url}`}
                                                className="h-16 w-16 object-cover rounded border shadow"
                                                alt="pet"
                                                style={{
                                                    width: '40%',
                                                    height: '40%',
                                                    objectFit: 'cover',
                                                    borderRadius: '0.5rem',
                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                                }}
                                            />
                                        ))}
                                    </div>
                                )}

                                <button
                                    onClick={async () => {
                                        try {
                                            const csrf = await getCsrfToken();
                                            await axios.delete(`http://localhost:8000/pets/delete_pet/${pet.id}/`, {
                                                headers: {"X-CSRFToken": csrf},
                                                withCredentials: true
                                            });
                                            setPets(pets.filter(p => p.id !== pet.id));
                                        } catch (e) {
                                            console.error("Помилка при видаленні", e);
                                        }
                                    }}
                                    className="mt-2 text-sm text-red-600 hover:underline"
                                >
                                    🗑 Видалити
                                </button>
                                <button
                                    onClick={() => {
                                        setPetToEdit({...pet});
                                        setIsEditingPet(true);
                                    }}
                                    className="mt-2 text-sm text-blue-600 hover:underline"
                                >
                                    ✏️ Редагувати
                                </button>
                            </div>
                        ))}
                    </div>
                )}
                <button
                    onClick={() => setIsCreating(true)}
                    className="mt-4 w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
                >
                    ➕ Додати тварину
                </button>
            </div>

            {isCreating && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Нова тварина</h2>

                        {["species", "gender", "breed", "price", "coat_color", "age"].map((field) => (
                            <div key={field} className="mb-2">
                                <input
                                    type="text"
                                    placeholder={field}
                                    value={newPet[field]}
                                    onChange={(e) => setNewPet({...newPet, [field]: e.target.value})}
                                    className="w-full p-2 border rounded"
                                />
                                {formErrors[field] && (
                                    <p className="text-red-600 text-sm mt-1">{formErrors[field]}</p>
                                )}
                            </div>
                        ))}

                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) => setNewPetPhotos([...e.target.files])}
                            className="w-full mb-2"
                        />

                        <div className="flex justify-between mt-4">
                            <button
                                onClick={async () => {
                                    const validateNewPet = () => {
                                        const errors = {};
                                        if (!newPet.species.trim()) errors.species = "Вид є обов'язковим";
                                        if (!newPet.gender.trim()) errors.gender = "Стать є обов'язковою";
                                        if (newPet.price.trim() === "") errors.price = "Ціна обов'язкова";
                                        else if (!/^\d+$/.test(newPet.price)) errors.price = "Ціна повинна містити лише цифри";
                                        if (newPet.age.trim() === "") errors.age = "Вік обов'язковий";
                                        else if (!/^\d+$/.test(newPet.age)) errors.age = "Вік повинен бути числом";
                                        return errors;
                                    };

                                    const errors = validateNewPet();
                                    if (Object.keys(errors).length > 0) {
                                        setFormErrors(errors);
                                        return;
                                    }

                                    try {
                                        const csrf = await getCsrfToken();
                                        const formData = new FormData();
                                        Object.keys(newPet).forEach((key) => formData.append(key, newPet[key]));
                                        newPetPhotos.forEach((photo) => formData.append("photos", photo));

                                        const res = await axios.post("http://localhost:8000/pets/create_pet/", formData, {
                                            headers: {
                                                "X-CSRFToken": csrf,
                                                "Content-Type": "multipart/form-data"
                                            },
                                            withCredentials: true
                                        });

                                        if (res.data.success) {
                                            setIsCreating(false);
                                            setNewPet({
                                                species: "",
                                                gender: "",
                                                breed: "",
                                                price: "",
                                                coat_color: "",
                                                age: ""
                                            });
                                            setNewPetPhotos([]);
                                            setFormErrors({});
                                            window.location.reload();
                                        }
                                    } catch (e) {
                                        console.error("Помилка створення тварини", e);
                                    }
                                }}
                                className="bg-green-500 text-white px-4 py-2 rounded"
                            >
                                Зберегти
                            </button>
                            <button
                                onClick={() => {
                                    setIsCreating(false);
                                    setFormErrors({});
                                    setNewPetPhotos([]);
                                }}
                                className="bg-gray-500 text-white px-4 py-2 rounded"
                            >
                                Скасувати
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isEditingPet && petToEdit && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Редагувати тварину</h2>

                        {["species", "gender", "breed", "price", "coat_color", "age"].map((field) => (
                            <div key={field} className="mb-2">
                                <input
                                    type="text"
                                    placeholder={field}
                                    value={petToEdit[field] || ""}
                                    onChange={(e) => setPetToEdit({...petToEdit, [field]: e.target.value})}
                                    className="w-full p-2 border rounded"
                                />
                                {formErrors[field] && (
                                    <p className="text-red-600 text-sm mt-1">{formErrors[field]}</p>
                                )}
                            </div>
                        ))}

                        <div className="flex gap-2 mt-2 flex-wrap">
                            {petToEdit.photos.map((photo, i) => (
                                <div key={i} className="relative inline-block">
                                    <img


                                        style={{
                                            width: '40%',
                                            height: '40%',
                                            objectFit: 'cover',
                                            borderRadius: '0.5rem',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                        }}

                                        src={`http://localhost:8000${photo.url}`}
                                        alt="pet"
                                        className={`h-16 w-16 object-cover rounded border shadow cursor-pointer transition duration-150 ease-in-out ${
                                            deletePhotoIds.includes(photo.id) ? 'opacity-50 ring-2 ring-red-500' : ''

                                        }`}
                                        onClick={() => {
                                            setDeletePhotoIds(prev =>
                                                prev.includes(photo.id)
                                                    ? prev.filter(id => id !== photo.id)
                                                    : [...prev, photo.id]
                                            );
                                        }}
                                    />
                                    {deletePhotoIds.includes(photo.id) && (
                                        <div
                                            className="absolute top-0 right-0 bg-red-600 text-white rounded-full px-1 text-xs shadow">
                                            ✓
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        {deletePhotoIds.length > 0 && (
                            <button
                                onClick={confirmDeletePhotos}
                                className="mt-2 px-4 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                            >
                                Видалити вибрані фото
                            </button>
                        )}
                        <label className="block mt-4 mb-2 font-medium">Додати нові фото</label>
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) => setNewPhotos([...e.target.files])}
                            className="w-full mb-4"
                        />

                        <div className="flex justify-between">
                            <button
                                onClick={async () => {
                                    try {
                                        const formData = new FormData();
                                        for (const key in petToEdit) {
                                            if (typeof petToEdit[key] !== "object" && petToEdit[key] !== null) {
                                                formData.append(key, petToEdit[key]);
                                            }
                                        }
                                        newPhotos.forEach(photo => formData.append("photos", photo));
                                        deletePhotoIds.forEach(id => formData.append("delete_photo", id));

                                        const csrf = await getCsrfToken();
                                        const res = await axios.post(
                                            `http://localhost:8000/pets/edit_pet/${petToEdit.id}/`,
                                            formData,
                                            {
                                                headers: {
                                                    "X-CSRFToken": csrf,
                                                    "Content-Type": "multipart/form-data"
                                                },
                                                withCredentials: true,
                                            }
                                        );

                                        if (res.data.success) {
                                            setIsEditingPet(false);
                                            setPetToEdit(null);
                                            setNewPhotos([]);
                                            setDeletePhotoIds([]);
                                            window.location.reload(); // або оновити pets
                                        }
                                    } catch (e) {
                                        console.error("Помилка редагування тварини", e);
                                    }
                                }}
                                className="bg-green-500 text-white px-4 py-2 rounded"
                            >
                                Зберегти
                            </button>
                            <button
                                onClick={() => {
                                    setIsEditingPet(false);
                                    setPetToEdit(null);
                                    setNewPhotos([]);
                                    setDeletePhotoIds([]);
                                }}
                                className="bg-gray-500 text-white px-4 py-2 rounded"
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
