import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { getCsrfToken } from "../../api/authService";
import axios from "axios";
import "./PetEditor.css";

const PetEditor = ({ pet, onClose, onUpdate }) => {
    const { t } = useTranslation();

    const [editedPet, setEditedPet] = useState({ ...pet });
    const [newPhotos, setNewPhotos] = useState([]);
    const [formErrors, setFormErrors] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const [selectedPhotoIds, setSelectedPhotoIds] = useState([]);
    const [viewerOpen, setViewerOpen] = useState(false);
    const [viewerIndex, setViewerIndex] = useState(0);

    const togglePhotoSelection = (id) => {
        setSelectedPhotoIds((prev) =>
            prev.includes(id)
                ? prev.filter((pid) => pid !== id)
                : [...prev, id]
        );
    };

    const openViewer = (index) => {
        setViewerIndex(index);
        setViewerOpen(true);
    };

    const handleDeleteSelected = async () => {
        try {
            const csrf = await getCsrfToken();
            const formData = new FormData();

            for (const key in editedPet) {
                if (editedPet[key] !== null && typeof editedPet[key] !== "object") {
                    formData.append(key, editedPet[key]);
                }
            }

            selectedPhotoIds.forEach((id) => formData.append("delete_photo", id));

            const res = await axios.post(
                `http://localhost:8000/pets/edit_pet/${pet.id}/`,
                formData,
                {
                    headers: {
                        "X-CSRFToken": csrf,
                        "Content-Type": "multipart/form-data"
                    },
                    withCredentials: true
                }
            );

            if (res.data.success) {
                setEditedPet((prev) => ({
                    ...prev,
                    photos: prev.photos.filter((p) => !selectedPhotoIds.includes(p.id)),
                }));
                setSelectedPhotoIds([]);
            }
        } catch (e) {
            console.error(t("errors.delete_photo"), e);
        }
    };

    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);
    }, [onClose]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditedPet((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setNewPhotos([...e.target.files]);
    };

    const handleSubmit = async () => {
        const errors = {};
        if (!editedPet.species?.trim()) errors.species = t("form.required");
        if (!editedPet.gender?.trim()) errors.gender = t("form.required");
        if (editedPet.price === "") errors.price = t("form.required");
        else if (!/^[0-9]+(\.[0-9]{1,2})?$/.test(editedPet.price)) errors.price = t("form.price_number");
        if (editedPet.age === "") errors.age = t("form.required");
        else if (!/^[0-9]+$/.test(editedPet.age)) errors.age = t("form.age_number");

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        try {
            setIsSaving(true);
            const csrf = await getCsrfToken();
            const formData = new FormData();

            for (const key in editedPet) {
                if (editedPet[key] !== null && typeof editedPet[key] !== "object") {
                    formData.append(key, editedPet[key]);
                }
            }

            newPhotos.forEach((file) => formData.append("photos", file));

            const res = await axios.post(
                `http://localhost:8000/pets/edit_pet/${pet.id}/`,
                formData,
                {
                    headers: {
                        "X-CSRFToken": csrf,
                        "Content-Type": "multipart/form-data",
                    },
                    withCredentials: true,
                }
            );

            if (res.data.success) {
                onUpdate();
                onClose();
            }
        } catch (err) {
            console.error(t("errors.save"), err);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="pet-editor-wrapper">
            <div className="pet-editor-container">
                <h2 className="pet-editor-title">{t("pet.edit")}</h2>

                {["species", "breed", "coat_color", "age", "price"].map((field) => (
                    <div key={field} className="form-group">
                        <input
                            type="text"
                            name={field}
                            placeholder={t(`pet.${field}`)}
                            value={editedPet[field] || ""}
                            onChange={handleChange}
                            className="form-input"
                        />
                        {formErrors[field] && (
                            <p className="form-error">{formErrors[field]}</p>
                        )}
                    </div>
                ))}

                <div className="form-group">
                    <select
                        name="gender"
                        value={editedPet.gender || ""}
                        onChange={handleChange}
                        className="form-input"
                    >
                        <option value="">{t("pet.select_gender")}</option>
                        <option value="male">{t("pet.male")}</option>
                        <option value="female">{t("pet.female")}</option>
                    </select>
                    {formErrors.gender && <p className="form-error">{formErrors.gender}</p>}
                </div>

                <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    className="form-file"
                />

                {editedPet.photos?.length > 0 && (
                    <div className="pet-photo-preview-grid">
                        {editedPet.photos.map((photo, index) => (
                            <div
                                key={photo.id}
                                className={`pet-photo-wrapper ${selectedPhotoIds.includes(photo.id) ? "selected" : ""}`}
                                onClick={() => togglePhotoSelection(photo.id)}
                                onDoubleClick={() => openViewer(index)}
                            >
                                <img
                                    src={`http://localhost:8000${photo.url}`}
                                    alt="pet"
                                    className="pet-photo"
                                />
                                {selectedPhotoIds.includes(photo.id) && (
                                    <div className="photo-check-overlay">✔</div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {selectedPhotoIds.length > 0 && (
                    <button
                        onClick={handleDeleteSelected}
                        className="btn-delete-selected"
                    >
                        🗑 {t("pet.delete_selected", { count: selectedPhotoIds.length })}
                    </button>
                )}
                <div className="pet-editor-actions">
                    <button
                        onClick={handleSubmit}
                        className="pet-editor-btn-save"
                        disabled={isSaving}
                    >
                        {isSaving ? t("common.saving") : t("common.save")}
                    </button>
                    <button
                        onClick={onClose}
                        className="pet-editor-btn-cancel"
                    >
                        ✖ {t("common.cancel")}
                    </button>
                </div>

                {viewerOpen && (
                    <div className="photo-viewer-backdrop" onClick={() => setViewerOpen(false)}>
                        <img
                            src={`http://localhost:8000${editedPet.photos[viewerIndex].url}`}
                            alt="fullscreen"
                            className="photo-viewer-img"
                        />
                        <button className="viewer-prev" onClick={(e) => {
                            e.stopPropagation();
                            setViewerIndex((viewerIndex - 1 + editedPet.photos.length) % editedPet.photos.length);
                        }}>‹</button>
                        <button className="viewer-next" onClick={(e) => {
                            e.stopPropagation();
                            setViewerIndex((viewerIndex + 1) % editedPet.photos.length);
                        }}>›</button>
                        <button className="viewer-close" onClick={() => setViewerOpen(false)}>×</button>
                    </div>
                )}

            </div>
        </div>
    );
};

export default PetEditor;
