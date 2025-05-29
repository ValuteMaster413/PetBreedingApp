import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import "./Profile.css";
import "./OtherProfile.css";
import PhotoPreviewGrid from "./PhotoPreviewGrid";

const OtherProfile = () => {
    const { userId } = useParams();
    const [profile, setProfile] = useState(null);
    const [pets, setPets] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(`http://localhost:8000/users/user_info/${userId}/`, { withCredentials: true })
            .then(res => {
                if (res.data.chats && Array.isArray(res.data.chats) && res.data.chats.length > 0) {
                    setProfile(res.data.chats[0]);
                } else {
                    setError("Користувача не знайдено");
                }
            })
            .catch(() => setError("Помилка при завантаженні профілю"));

        axios.get(`http://localhost:8000/pets/all_pets/${userId}/`, { withCredentials: true })
            .then(res => {
                if (Array.isArray(res.data.reports)) {
                    setPets(res.data.reports);
                }
            })
            .catch(() => console.error("Помилка при завантаженні тварин"))
            .finally(() => setLoading(false));
    }, [userId]);

    if (loading) return <p>Завантаження...</p>;
    if (error) return <p className="text-red-500">{error}</p>;
    if (!profile) return <p>Профіль не знайдено</p>;

    return (
        <div className="profile-container">
            <div className="profile-card">
                <h2 className="profile-title">{profile.username}</h2>

                <div className="other-profile-buttons">
                    <button
                        className="btn-modal-small"
                        onClick={() => alert("Чат недоступний (плейсхолдер)")}
                    >
                        ✉ Написати повідомлення
                    </button>
                    <button
                        className="btn-modal-small"
                        onClick={() => alert("Перегляд відгуків недоступний (плейсхолдер)")}
                    >
                        ★ Переглянути відгуки
                    </button>
                    <div className="centered-feedback-button">
                        <button className="btn-feedback" onClick={() => alert("Залишити відгук (плейсхолдер)")}>
                            Залишити відгук
                        </button>
                    </div>
                </div>
            </div>

            <div className="mt-6 w-full max-w-md">
                <h3 className="text-lg font-semibold mb-2">Tварини {profile.username}</h3>
                {pets.length === 0 ? (
                    <p className="text-gray-500">Тварин не знайдено</p>
                ) : (
                    <div className="space-y-4">
                        {pets.map((pet, index) => (
                            <PetReadonlyCard key={index} pet={pet} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const PetReadonlyCard = ({ pet }) => {
    const [openPreview, setOpenPreview] = useState(false);

    return (
        <div className="pet-card">
            <p><strong>Вид:</strong> {pet.species}</p>
            <p><strong>Стать:</strong> {pet.gender}</p>
            <p><strong>Порода:</strong> {pet.breed || "Невідомо"}</p>
            <p><strong>Колір шерсті:</strong> {pet.coat_color || "Невідомо"}</p>
            <p><strong>Ціна:</strong> {pet.price || "Безкоштовно"}</p>
            <p><strong>Вік:</strong> {pet.age} міс.</p>

            {pet.photos?.length > 0 && (
                <>
                    <div className="pet-photo-preview" style={{ position: "relative" }}>
                        <img
                            src={`http://localhost:8000${pet.photos[0]}`}
                            alt="preview"
                            className="pet-photo"
                            onClick={() => setOpenPreview(true)}
                        />
                        {pet.photos.length > 1 && (
                            <div className="photo-count-overlay">
                                +{pet.photos.length - 1}
                            </div>
                        )}
                    </div>

                    {openPreview && (
                        <PhotoPreviewGrid
                            photos={pet.photos.map(url => ({ url }))}
                            onClose={() => setOpenPreview(false)}
                        />
                    )}
                </>
            )}
        </div>
    );
};

export default OtherProfile;
