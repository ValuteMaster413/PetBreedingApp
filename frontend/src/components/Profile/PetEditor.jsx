import React, { useState } from "react";
import "./PetEditor.css";

const PetEditor = ({
                       pet,
                       onSave,
                       onCancel,
                       onDeletePhotos,
                   }) => {
    const [editedPet, setEditedPet] = useState({ ...pet });
    const [newPhotos, setNewPhotos] = useState([]);
    const [deletePhotoIds, setDeletePhotoIds] = useState([]);
    const [confirmDelete, setConfirmDelete] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditedPet({ ...editedPet, [name]: value });
    };

    const handlePhotoClick = (photoId) => {
        setDeletePhotoIds((prev) =>
            prev.includes(photoId)
                ? prev.filter((id) => id !== photoId)
                : [...prev, photoId]
        );
    };

    const handleAddPhotos = (e) => {
        setNewPhotos([...e.target.files]);
    };

    const handlePriceChange = (e) => {
        const val = e.target.value;
        if (val === "") {
            setEditedPet({ ...editedPet, price: null });
        } else {
            setEditedPet({ ...editedPet, price: parseFloat(val) });
        }
    };

    const handleSubmit = async () => {
        await onSave(editedPet, newPhotos);
        setNewPhotos([]);
    };

    return (
        <div className="pet-editor">
            <h2 className="editor-title">Редагувати тварину</h2>

            {["species", "gender", "breed", "coat_color", "age"].map((field) => (
                <div key={field} className="editor-group">
                    <input
                        type="text"
                        name={field}
                        value={editedPet[field] || ""}
                        onChange={handleChange}
                        placeholder={field}
                        className="editor-input"
                    />
                </div>
            ))}

            <div className="editor-group">
                <input
                    type="number"
                    name="price"
                    value={editedPet.price ?? ""}
                    onChange={handlePriceChange}
                    placeholder="price"
                    className="editor-input"
                    step="0.01"
                    min="0"
                />
            </div>

            <div className="editor-gallery">
                {editedPet.photos.map((photo, i) => (
                    <div key={i} className="editor-photo-wrapper">
                        <img
                            src={`http://localhost:8000${photo.url}`}
                            className={`editor-photo ${
                                deletePhotoIds.includes(photo.id) ? "marked" : ""
                            }`}
                            alt="pet"
                            onClick={() => handlePhotoClick(photo.id)}
                        />
                        {deletePhotoIds.includes(photo.id) && (
                            <div className="photo-mark">✓</div>
                        )}
                    </div>
                ))}
            </div>

            {deletePhotoIds.length > 0 && (
                <button
                    className="btn-delete-confirm"
                    onClick={() => setConfirmDelete(true)}
                >
                    Видалити вибрані фото
                </button>
            )}

            {confirmDelete && (
                <div className="popup-backdrop" onClick={() => setConfirmDelete(false)}>
                    <div className="popup-content" onClick={(e) => e.stopPropagation()}>
                        <p>Ви точно хочете видалити ці фото?</p>
                        <div className="popup-buttons">
                            <button
                                className="btn-confirm"
                                onClick={async () => {
                                    await onDeletePhotos(deletePhotoIds);
                                    setEditedPet((prev) => ({
                                        ...prev,
                                        photos: prev.photos.filter(
                                            (photo) => !deletePhotoIds.includes(photo.id)
                                        ),
                                    }));
                                    setDeletePhotoIds([]);
                                    setConfirmDelete(false);
                                }}
                            >
                                Так, видалити
                            </button>
                            <button
                                className="btn-cancel"
                                onClick={() => setConfirmDelete(false)}
                            >
                                Скасувати
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleAddPhotos}
                className="editor-file"
            />

            <div className="editor-actions">
                <button onClick={handleSubmit} className="btn-save">
                    Зберегти
                </button>
                <button onClick={onCancel} className="btn-cancel">
                    Скасувати
                </button>
            </div>
        </div>
    );
};

export default PetEditor;
