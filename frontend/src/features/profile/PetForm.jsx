import React, { useState } from "react";
import "./PetForm.css";

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
    const fields = [
        { label: "Вид", name: "species", required: true },
        { label: "Порода", name: "breed", required: false },
        { label: "Забарвлення тварини", name: "coat_color", required: false },
        { label: "Вік", name: "age", required: true },
        { label: "Ціна", name: "price", required: true }
    ];

    return (
        <div className="pet-form centered-form">
        <h2 className="form-title">{title || "Нова тварина"}</h2>

            {fields.map(({ label, name, required }) => (
                <div className="form-group" key={name}>
                    <label className="form-label">
                        {label}
                        {required && <span style={{ color: "red" }}> *</span>}
                    </label>
                    <input
                        type="text"
                        name={name}
                        value={petData[name] || ""}
                        onChange={handleChange}
                        placeholder={label}
                        className="form-input"
                    />
                    {formErrors?.[name] && (
                        <p className="form-error">{formErrors[name]}</p>
                    )}
                </div>
            ))}

            <div className="form-group">
                <label className="form-label">
                    Стать<span style={{ color: "red" }}> *</span>
                </label>
                <select
                    name="gender"
                    value={petData.gender || ""}
                    onChange={handleChange}
                    className="form-input-select"
                >
                    <option value="">Оберіть стать</option>
                    <option value="male">Самець</option>
                    <option value="female">Самка</option>
                </select>
                {formErrors?.gender && <p className="form-error">{formErrors.gender}</p>}
            </div>


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
