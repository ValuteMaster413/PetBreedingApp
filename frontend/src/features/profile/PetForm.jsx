import React, {useState} from "react";
import {useTranslation} from "react-i18next";
import "./PetForm.css";

const PetForm = ({initialPet, initialPhotos, formErrors, onSave, onCancel, title}) => {
    const {t} = useTranslation();
    const [petData, setPetData] = useState(initialPet || {});
    const [photos, setPhotos] = useState(initialPhotos || []);

    const handleChange = (e) => {
        const {name, value} = e.target;
        setPetData({...petData, [name]: value});
    };

    const handlePhotoChange = (e) => {
        setPhotos([...e.target.files]);
    };

    const handleSubmit = () => {
        onSave(petData, photos);
    };

    const fields = [
        {label: t("pet.species"), name: "species", required: true},
        {label: t("pet.breed"), name: "breed", required: false},
        {label: t("pet.coat_color"), name: "coat_color", required: false},
        {label: t("pet.age"), name: "age", required: true},
        {label: t("pet.price"), name: "price", required: true}
    ];

    return (
        <div className="pet-form centered-form">
            <h2 className="form-title">{title || t("pet.new")}</h2>

            {fields.map(({label, name, required}) => (
                <div className="form-group" key={name}>
                    <label className="form-label">
                        {label}
                        {required && <span style={{color: "red"}}> *</span>}
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

                    {/* 👉 Ремарка только для breed */}
                    {name === "breed" && (
                        <small className="form-hint">
                            {t("pet.breed_hint") || "Если указать породу, в поиске будут показаны только такие породы. Если не указывать — подойдут любые."}
                        </small>
                    )}
                </div>
            ))}

            <div className="form-group">
                <label className="form-label">
                    {t("pet.gender")}
                    <span style={{color: "red"}}> *</span>
                </label>
                <select
                    name="gender"
                    value={petData.gender || ""}
                    onChange={handleChange}
                    className="form-input-select"
                >
                    <option value="">{t("pet.select_gender")}</option>
                    <option value="male">{t("pet.male")}</option>
                    <option value="female">{t("pet.female")}</option>
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
                <button onClick={handleSubmit} className="btn-save">{t("common.save")}</button>
                <button onClick={onCancel} className="btn-cancel">{t("common.cancel")}</button>
            </div>
        </div>
    );
};

export default PetForm;
