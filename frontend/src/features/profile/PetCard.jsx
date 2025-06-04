import React, { useEffect, useState } from "react";
import "./PetCard.css";
import PhotoPreviewGrid from "../shared/components/PhotoPreviewGrid";
import LikesModal from "./modals/LikesModal";

const PetCard = ({ pet, onEdit, onDelete, onMatch }) => {
    const [openPreview, setOpenPreview] = useState(false);
    const [showLikesModal, setShowLikesModal] = useState(false);
    const [likesCount, setLikesCount] = useState(0);

    // завантажити кількість лайків
    useEffect(() => {
        fetch(`http://localhost:8000/matching/likes_to_me/${pet.id}/`, { credentials: "include" })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data.likes_to_me)) {
                    setLikesCount(data.likes_to_me.length);
                }
            })
            .catch(err => {
                console.error("Не вдалося отримати кількість лайків:", err);
            });
    }, [pet.id]);

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
                            src={`http://localhost:8000${pet.photos[0].url}`}
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
                            photos={pet.photos}
                            onClose={() => setOpenPreview(false)}
                        />
                    )}
                </>
            )}

            <div className="pet-buttons">
                <button className="btn-delete" onClick={onDelete}>🗑 Видалити</button>
                <button className="btn-edit" onClick={onEdit}>✏️ Редагувати</button>
                <button className="btn-match" onClick={onMatch}>🔍 Пошук пари</button>

                <div style={{ position: "relative" }}>
                    <button className="btn-likes" onClick={() => setShowLikesModal(true)}>
                        ❤️ Хто вподобав?
                    </button>
                    {likesCount > 0 && (
                        <div className="likes-badge">{likesCount}</div>
                    )}
                </div>

                {showLikesModal && (
                    <LikesModal
                        petId={pet.id}
                        onClose={() => setShowLikesModal(false)}
                        onDislike={() => setLikesCount(prev => prev - 1)}
                    />
                )}
            </div>
        </div>
    );
};

export default PetCard;
