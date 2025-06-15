import {useContext, useEffect, useState} from "react";
import AuthContext from "../../../app/context/AuthContext";
import axios from "axios";
import {getCsrfToken} from "../../../api/authService";
import {useNavigate} from "react-router-dom";
import {useTranslation} from "react-i18next";
import "./Profile.css";
import PetCard from "../PetCard";
import PhotoGallery from "../PhotoGallery";
import ProfileEditor from "../ProfileEditor";
import Modal from "../Modal";
import PetForm from "../PetForm";
import PetEditor from "../PetEditor";
import Header from "../../shared/components/Header.jsx";


const Profile = () => {
    const {t} = useTranslation();
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
    const [reviews, setReviews] = useState([]);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

    const fetchPets = async () => {
        try {
            const response = await axios.get("http://localhost:8000/pets/all_my_pets/", {
                withCredentials: true
            });

            const normalizedPets = response.data.reports.map(pet => ({
                ...pet,
                photos: pet.photos || []
            }));
            setPets(normalizedPets);
        } catch (e) {
            console.error(t("errors.pets.load"), e);
        }
    };
    const fetchReviews = async () => {
        try {
            const res = await axios.get(`http://localhost:8000/users/all_review/${profile.user_id}/`, {
                withCredentials: true
            });
            setReviews(res.data.reports);
        } catch (e) {
            console.error("Ошибка загрузки отзывов", e);
        }
    };

    useEffect(() => {
        if (!loading && profile) {
            fetchPets();
        }
    }, [loading, profile]);
    useEffect(() => {
        if (profile?.user_id) {
            fetchReviews();
        }
    }, [profile]);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await axios.get("http://localhost:8000/users/my_info/", {withCredentials: true});
                if (response.data.chats?.length > 0) {
                    setProfile(response.data.chats[0]);
                    setEditData({
                        id: response.data.chats[0].id,
                        username: response.data.chats[0].username,
                        email: response.data.chats[0].email,
                        phone: response.data.chats[0].phone,
                        password: "",
                    });
                } else {
                    setProfile(null);
                    setError(null);
                }
            } catch (err) {
                setError(t("errors.profile.load"));
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleLogout = async () => {
        try {
            await signOut();
            window.location.href = "/login";
        } catch (error) {
            console.error(t("errors.logout"), error);
        }
    };

    const handleEdit = async () => {
        if (!profile?.user_id) {
            setError(t("errors.profile.missing_id"));
            return;
        }

        try {
            const csrfToken = await getCsrfToken();
            const payload = {...editData};
            if (!editData.password.trim()) delete payload.password;

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
                setSuccessMessage(t("profile.update_success"));
                setTimeout(() => setSuccessMessage(""), 3000);
                setIsEditing(false);
            }
        } catch (err) {
            setError(t("errors.profile.update"));
        }
    };

    if (loading) return <p className="text-center text-gray-500">{t("loading")}</p>;
    if (error) return <p className="text-center text-red-500">{error}</p>;
    if (!profile && !loading && !error) {
        return (
            <div className="text-center text-gray-500">
                {t("profile.not_found")}
            </div>
        );
    }


    return (
        <>
            <Header/>
            <div className="profile-container">
                <div className="profile-card">
                    <h2 className="profile-title">{t("profile.title")}</h2>
                    {successMessage && <p className="success-message">{successMessage}</p>}
                    <p><strong>{t("profile.username")}:</strong> {profile.username}</p>
                    <p><strong>Email:</strong> {profile.email}</p>
                    <p><strong>{t("profile.phone")}:</strong> {profile.phone}</p>
                    <p>
                        <strong>Premium:</strong> {profile.is_premium ? t("profile.premium_active") : t("profile.premium_inactive")}
                    </p>
                    <button className="profile-button btn-blue" onClick={() => setIsEditing(true)}>
                        {t("buttons.edit")}
                    </button>
                    <button className="profile-button btn-red" onClick={handleLogout}>
                        {t("buttons.logout")}
                    </button>
                    <button className="profile-button btn-gray" onClick={() => setIsReviewModalOpen(true)}>
                        {t("buttons.show_reviews") || "Показать отзывы"}
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
                    <div className="pet-header">
                        <h3 className="text-lg font-semibold mb-2">{t("profile.your_pets")}</h3>
                        <button onClick={() => setIsCreating(true)} className="btn-add-pet">
                            ➕ {t("buttons.add_pet")}
                        </button>
                    </div>

                    {pets.length === 0 ? (
                        <p className="text-gray-500">{t("profile.no_pets")}</p>
                    ) : (
                        <div className="pet-scroll-area space-y-4 overflow-y-auto pr-2">

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
                            title={t("pet.new")}
                            initialPet={newPet}
                            initialPhotos={newPetPhotos}
                            formErrors={formErrors}
                            onCancel={() => {
                                setIsCreating(false);
                                setFormErrors({});
                                setNewPetPhotos([]);
                            }}
                            onSave={async (petData, photos) => {
                                const errors = {};
                                if (!petData.species?.trim()) errors.species = t("errors.required");
                                if (!petData.gender?.trim()) errors.gender = t("errors.required");
                                if (petData.price === "") errors.price = t("errors.required");
                                else if (isNaN(petData.price)) errors.price = t("errors.must_be_number");
                                if (petData.age === "") errors.age = t("errors.required");
                                else if (isNaN(petData.age)) errors.age = t("errors.must_be_number");

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
                                            species: "", gender: "", breed: "", price: "", coat_color: "", age: ""
                                        });
                                        setNewPetPhotos([]);
                                        setFormErrors({});
                                        window.location.reload();
                                    }
                                } catch (e) {
                                    console.error(t("errors.pets.create"), e);
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

                {isReviewModalOpen && (
                    <Modal onClose={() => setIsReviewModalOpen(false)}>
                        <div className="modal-content-box">
                            <h3 className="text-xl font-semibold mb-4">{t("profile.reviews_title") || "Отзывы о вас"}</h3>
                            {reviews.length === 0 ? (
                                <p className="text-gray-500">{t("profile.no_reviews") || "Нет отзывов"}</p>
                            ) : (
                                <ul className="space-y-4 max-h-[400px] overflow-y-auto">
                                    {reviews.map((review) => (
                                        <li key={review.id} className="border p-4 rounded shadow">
                                            <p><strong>{t("profile.rating") || "Оценка"}:</strong> {review.rating} / 5
                                            </p>
                                            <p>
                                                <strong>{t("profile.comment") || "Комментарий"}:</strong> {review.comment || t("profile.no_comment") || "Без комментария"}
                                            </p>
                                            <p><strong>{t("profile.from") || "От"}:</strong> {review.reviewer_username}
                                            </p>
                                            <p><small>{new Date(review.created_at).toLocaleString()}</small></p>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </Modal>
                )}

            </div>
        </>
    );
};

export default Profile;
