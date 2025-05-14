import React from "react";
import "./PetCard.css";

const PetCard = ({ pet, onEdit, onDelete, onMatch }) => {
    return (
        <div className="pet-card">
            <p><strong>Вид:</strong> {pet.species}</p>
            <p><strong>Стать:</strong> {pet.gender}</p>
            <p><strong>Порода:</strong> {pet.breed || "Невідомо"}</p>
            <p><strong>Колір шерсті:</strong> {pet.coat_color || "Невідомо"}</p>
            <p><strong>Ціна:</strong> {pet.price || "Безкоштовно"}</p>
            <p><strong>Вік:</strong> {pet.age} міс.</p>

            {pet.photos?.length > 0 && (
                <div className="pet-photos">
                    {pet.photos.map((photo, i) => (
                        <img
                            key={i}
                            src={`http://localhost:8000${photo.url}`}
                            alt="pet"
                            className="pet-photo"
                        />
                    ))}
                </div>
            )}

            <div className="pet-buttons">
                <button className="btn-delete" onClick={onDelete}>🗑 Видалити</button>
                <button className="btn-edit" onClick={onEdit}>✏️ Редагувати</button>
                <button className="btn-match" onClick={onMatch}>🔍 Пошук пари</button>
            </div>
        </div>
    );
};

export default PetCard;
