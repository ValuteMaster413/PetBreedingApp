import {useContext, useEffect, useState} from "react";
import AuthContext from "../../store/AuthContext";
import axios from "axios";
import {getCsrfToken} from "../../api/authService";
import {useNavigate} from "react-router-dom";

import "./Profile.css";


import PetCard from "./PetCard";
import PhotoGallery from "./PhotoGallery";
import ProfileEditor from "./ProfileEditor";
import Modal from "./Modal";
import PetForm from "./PetForm";
import PetEditor from "./PetEditor";


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
    const navigate = useNavigate();

    const fetchPets = async () => {
        try {
            const response = await axios.get("http://localhost:8000/pets/all_my_pets/", { withCredentials: true });
            setPets(response.data.reports);
        } catch (e) {
            console.error("Не вдалося завантажити тварин:", e);
        }
    };

    useEffect(() => {
        if (!loading && profile) {
            fetchPets();
        }
    }, [loading, profile]);


        useEffect(() => {
            const fetchProfile = async () => {
                try {
                    const response = await axios.get("http://localhost:8000/users/my_info/", {withCredentials: true});
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
            <div className="profile-container">
                <div className="profile-card">
                    <h2 className="profile-title">Профіль користувача</h2>
                    {successMessage && <p className="success-message">{successMessage}</p>}
                    <p><strong>Ім'я:</strong> {profile.username}</p>
                    <p><strong>Email:</strong> {profile.email}</p>
                    <p><strong>Телефон:</strong> {profile.phone}</p>
                    <p><strong>Premium:</strong> {profile.is_premium ? "Активний" : "Не активний"}</p>
                    <button
                        className="profile-button btn-blue"
                        onClick={() => setIsEditing(true)}
                    >
                        Редагувати
                    </button>

                    <button
                        className="profile-button btn-red"
                        onClick={handleLogout}
                    >
                        Вийти
                    </button>
                </div>

                {isEditing && (
                    <ProfileEditor
                        editData={editData}
                        setEditData={setEditData}
                        onSave={handleEdit}
                        onCancel={() => setIsEditing(false)}
                        errorMessage={error}
                        successMessage={successMessage}
                    />
                )}

                <div className="mt-6 w-full max-w-md">
                    <h3 className="text-lg font-semibold mb-2">Ваші тварини</h3>
                    <button
                        onClick={() => setIsCreating(true)}
                        className="bg-green-500 text-white py-1.5 px-3 text-sm rounded hover:bg-green-600"
                    >
                        ➕ Додати тварину
                    </button>

                    {pets.length === 0 ? (
                        <p className="text-gray-500">Ви поки що не додали жодної тварини 🐾</p>
                    ) : (
                        <div className="space-y-4">
                            {pets.map((pet, index) => (
                                <PetCard
                                    key={index}
                                    pet={pet}
                                    onDelete={async () => {
                                        const csrf = await getCsrfToken();
                                        await axios.delete(`http://localhost:8000/pets/delete_pet/${pet.id}/`, {
                                            headers: {"X-CSRFToken": csrf},
                                            withCredentials: true
                                        });
                                        setPets(pets.filter(p => p.id !== pet.id));
                                    }}
                                    onEdit={() => {
                                        setPetToEdit({...pet});
                                        setIsEditingPet(true);
                                    }}
                                    onMatch={() => navigate(`/match/${pet.id}`)}
                                />
                            ))}
                        </div>
                    )}

                </div>

                {isCreating && (
                    <Modal onClose={() => {
                        setIsCreating(false);
                        setFormErrors({});
                        setNewPetPhotos([]);
                    }}>
                        <PetForm
                            title="Нова тварина"
                            initialPet={newPet}
                            initialPhotos={newPetPhotos}
                            formErrors={formErrors}
                            onCancel={() => {
                                setIsCreating(false);
                                setFormErrors({});
                                setNewPetPhotos([]);
                            }}
                            onSave={async (petData, photos) => {
                                const validateNewPet = () => {
                                    const errors = {};
                                    if (!petData.species?.trim()) errors.species = "Вид є обов'язковим";
                                    if (!petData.gender?.trim()) errors.gender = "Стать є обов'язковою";
                                    if (petData.price === "") errors.price = "Ціна обов'язкова";
                                    else if (isNaN(petData.price)) errors.price = "Ціна повинна бути числом";
                                    if (petData.age === "") errors.age = "Вік обов'язковий";
                                    else if (isNaN(petData.age)) errors.age = "Вік повинен бути числом";
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
                                    Object.entries(petData).forEach(([key, value]) => formData.append(key, value));
                                    photos.forEach(photo => formData.append("photos", photo));

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
                        />
                    </Modal>
                )}

                {isEditingPet && petToEdit && (
                    <Modal onClose={() => {
                        setIsEditingPet(false);
                        setPetToEdit(null);
                        setNewPhotos([]);
                        setDeletePhotoIds([]);
                    }}>
                        <PetEditor
                            pet={petToEdit}
                            onUpdate={fetchPets}
                            onClose={() => {
                                setIsEditingPet(false);
                                setPetToEdit(null);
                                setNewPhotos([]);
                                setDeletePhotoIds([]);
                            }}
                        />
                    </Modal>
                )}


            </div>

        );
    };


export default Profile;
