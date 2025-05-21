import React, { useState } from "react";
import "./PetCard.css";
import PhotoGallery from "./PhotoGallery";
import PhotoViewer from "./PhotoViewer";
import PhotoPreviewGrid from "./PhotoPreviewGrid";



const PetCard = ({pet, onEdit, onDelete, onMatch}) => {
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
                    <div className="pet-photo-preview" style={{position: "relative"}}>
                        <img
                            src={`http://localhost:8000${pet.photos[0].url}`}
                            alt="preview"
                            className="pet-photo"
                            onClick={() => setOpenPreview(true)}
                            style={{
                                cursor: "pointer",
                                borderRadius: "0.5rem",
                                boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
                                width: "100%"
                            }}
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
            </div>
        </div>
    );
};

export default PetCard;
