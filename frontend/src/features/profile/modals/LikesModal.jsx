import React, {useEffect, useState} from "react";
import axios from "axios";
import "./LikesModal.css";
import PhotoPreviewGrid from "../../shared/components/PhotoPreviewGrid";
import {getCsrfToken} from "../../../api/authService";

const LikesModal = ({ petId, onClose, onDislike }) => {

    const [likes, setLikes] = useState([]);
    const [error, setError] = useState(null);
    const [ignoredIds, setIgnoredIds] = useState([]);

    useEffect(() => {
        axios.get(`http://localhost:8000/matching/likes_to_me/${petId}/`, {withCredentials: true})
            .then(res => setLikes(res.data.likes_to_me))
            .catch(err => {
                console.error("Помилка при завантаженні лайків", err);
                setError("Помилка при отриманні лайків");
            });
    }, [petId]);

    const handleLikeBack = async (likedPetId) => {
        try {
            const csrf = await getCsrfToken();

            await axios.post(`http://localhost:8000/matching/like/${petId}/${likedPetId}/`, {}, {
                withCredentials: true,
                headers: {
                    "X-CSRFToken": csrf
                }
            });
            alert("Ви вподобали у відповідь!");
        } catch (err) {
            console.error("Помилка при лайку у відповідь", err);
        }
    };

    const handleIgnore = (id) => {
        setIgnoredIds(prev => [...prev, id]);
        setLikes(prev => prev.filter(like => like.from !== id));
        onDislike?.(); // якщо передано
    };




const visibleLikes = likes.filter(like => !ignoredIds.includes(like.from));

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-container scrollable" onClick={e => e.stopPropagation()}>
                <h3 className="modal-title">Тварини, які вас вподобали</h3>
                {error && <p>{error}</p>}
                {visibleLikes.length === 0 && <p>Немає нових вподобань</p>}

                {visibleLikes.map((like, idx) => (
                    <LikeEntry
                        key={idx}
                        petId={like.from}
                        viewerPetId={petId}
                        onLikeBack={handleLikeBack}
                        onIgnore={handleIgnore}
                    />

                ))}

                <button className="btn-modal-cancel" onClick={onClose}>Закрити</button>
            </div>
        </div>
    );
};

const LikeEntry = ({ viewerPetId, petId, onLikeBack, onIgnore }) => {
    const [pet, setPet] = useState(null);
    const [openPreview, setOpenPreview] = useState(false);
    const handleDislike = async () => {
        try {
            const csrf = await getCsrfToken();

            const res = await axios.post(
                `http://localhost:8000/matching/match/${viewerPetId}/dislike/${pet.id}/`,
                {},
                {
                    headers: {"X-CSRFToken": csrf},
                    withCredentials: true
                }
            );

            if (res.data.success) {
                onIgnore(pet.id);  // Видалити з видимих
            } else {
                console.warn("Dislike already exists або інша помилка:", res.data.message);
            }

        } catch (err) {
            console.error("Помилка при дизлайку", err);
        }
    };

    useEffect(() => {
        axios.get(`http://localhost:8000/pets/get_pet/${petId}/`, {withCredentials: true})
            .then(res => {
                const data = res.data.report;
                const transformed = {
                    ...data,
                    photos: data.photos.map(p => typeof p === "string" ? {url: p} : p)
                };
                setPet(transformed);
            })
            .catch(err => console.error("Не вдалося завантажити тварину", err));
    }, [petId]);

    if (!pet) return <div className="like-item">Завантаження...</div>;

    return (
        <>
            <div className="like-item">
                <div className="like-photo-block" onClick={() => setOpenPreview(true)} style={{cursor: "pointer"}}>
                    {pet.photos?.length > 0 && (
                        <img
                            src={`http://localhost:8000${pet.photos[0].url}`}
                            alt="pet"
                            className="like-thumb"
                        />
                    )}
                </div>
                <div className="like-info">
                    <p><strong>{pet.species}</strong> — {pet.gender}</p>
                    <p>Порода: {pet.breed || "Невідомо"}</p>
                    <p>Вік: {pet.age} міс.</p>

                    <div className="like-buttons">
                        <button onClick={() => handleDislike(petId)} className="btn-modal-ignore">👎 Нецікаво</button>
                        <button onClick={() => alert("Чат недоступний (плейсхолдер)")} className="btn-modal-small">✉
                            Написати
                        </button>
                        <button onClick={() => window.location.href = `/profile/${pet.owner_id}`}
                                className="btn-modal-small">👤 Профіль власника
                        </button>
                    </div>

                </div>
            </div>

            {openPreview && (
                <PhotoPreviewGrid
                    photos={pet.photos}
                    onClose={() => setOpenPreview(false)}
                />
            )}
        </>
    );
};

export default LikesModal;
