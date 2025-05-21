import React, { useState } from "react";
import "./PetForm.css";
import PhotoGallery from "./PhotoGallery";

const PetForm = ({ initialPet, initialPhotos, formErrors, onSave, onCancel, title }) => {
    const [petData, setPetData] = useState(initialPet || {});
    const [photos, setPhotos] = useState(initialPhotos || []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setPetData({ ...petData, [name]: value });
    };

    const handlePhotoChange = (e) => {
        setPhotos([...e.target.files]);
    };

    const handleSubmit = () => {
        onSave(petData, photos);
    };

    return (
        <div className="pet-form">
            <h2 className="form-title">{title || "Нова тварина"}</h2>

            {["species", "gender", "breed", "coat_color", "age", "price"].map((field) => (
                <div className="form-group" key={field}>
                    <input
                        type="text"
                        name={field}
                        value={petData[field] || ""}
                        onChange={handleChange}
                        placeholder={field}
                        className="form-input"
                    />
                    {formErrors?.[field] && (
                        <p className="form-error">{formErrors[field]}</p>
                    )}
                </div>
            ))}

            <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoChange}
                className="form-file"
            />

            <div className="form-actions">
                <button onClick={handleSubmit} className="btn-save">Зберегти</button>
                <button onClick={onCancel} className="btn-cancel">Скасувати</button>
            </div>
        </div>
    );
};

export default PetForm;
