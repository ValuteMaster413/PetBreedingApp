import { useState, useEffect } from "react";
import Select from "react-select";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { getCsrfToken } from "../../api/authService";
import "./PetEditor.css";

const PetEditor = ({ pet, onClose, onUpdate }) => {
    const { t } = useTranslation();
    const [newPhotos, setNewPhotos] = useState([]);
    const [formErrors, setFormErrors] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const [selectedPhotoIds, setSelectedPhotoIds] = useState([]);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [submitError, setSubmitError] = useState(null);

    const SpeciesOptions = [
        { value: "Dog", label: t("species.dog") },
        { value: "Cat", label: t("species.cat") },
        { value: "Rabbit", label: t("species.rabbit") },
        { value: "Parrot", label: t("species.parrot") },
    ];

    const GenderOptions = [
        { value: "Male", label: t("pet.male") },
        { value: "Female", label: t("pet.female") },
    ];

    const BreedOptions = {
        Dog: [
            { value: "Labrador", label: t("breed.dog.labrador") },
            { value: "Beagle", label: t("breed.dog.beagle") },
            { value: "Poodle", label: t("breed.dog.poodle") },
            { value: "Bulldog", label: t("breed.dog.bulldog") },
            { value: "Terrier", label: t("breed.dog.terrier") },
            { value: "Shiba", label: t("breed.dog.shiba") },
            { value: "Husky", label: t("breed.dog.husky") },
            { value: "Dachshund", label: t("breed.dog.dachshund") },
        ],
        Cat: [
            { value: "Persian", label: t("breed.cat.persian") },
            { value: "Siamese", label: t("breed.cat.siamese") },
            { value: "Mainecoon", label: t("breed.cat.mainecoon") },
            { value: "Sphynx", label: t("breed.cat.sphynx") },
            { value: "British", label: t("breed.cat.british") },
            { value: "Bengal", label: t("breed.cat.bengal") },
            { value: "Scottish", label: t("breed.cat.scottish") },
            { value: "Oriental", label: t("breed.cat.oriental") },
        ],
        Rabbit: [
            { value: "Lop", label: t("breed.rabbit.lop") },
            { value: "Dwarf", label: t("breed.rabbit.dwarf") },
            { value: "Rex", label: t("breed.rabbit.rex") },
            { value: "Angora", label: t("breed.rabbit.angora") },
            { value: "Flemish", label: t("breed.rabbit.flemish") },
            { value: "Lionhead", label: t("breed.rabbit.lionhead") },
            { value: "Silver", label: t("breed.rabbit.silver") },
            { value: "Californian", label: t("breed.rabbit.californian") },
        ],
        Parrot: [
            { value: "Budgie", label: t("breed.parrot.budgie") },
            { value: "Cockatiel", label: t("breed.parrot.cockatiel") },
            { value: "Canary", label: t("breed.parrot.canary") },
            { value: "Lovebird", label: t("breed.parrot.lovebird") },
            { value: "Finch", label: t("breed.parrot.finch") },
            { value: "Parrot", label: t("breed.parrot.parrot") },
            { value: "Macaw", label: t("breed.parrot.macaw") },
            { value: "Cockatoo", label: t("breed.parrot.cockatoo") },
        ]
    };

    const CoatColorOptions = {
        Dog: [
            { value: "Black", label: t("coat.dog.black") },
            { value: "White", label: t("coat.dog.white") },
            { value: "Brown", label: t("coat.dog.brown") },
            { value: "Golden", label: t("coat.dog.golden") },
            { value: "Gray", label: t("coat.dog.gray") },
            { value: "Spotted", label: t("coat.dog.spotted") },
            { value: "Brindle", label: t("coat.dog.brindle") },
            { value: "Tan", label: t("coat.dog.tan") },
        ],
        Cat: [
            { value: "Grey", label: t("coat.cat.grey") },
            { value: "Orange", label: t("coat.cat.orange") },
            { value: "White", label: t("coat.cat.white") },
            { value: "Black", label: t("coat.cat.black") },
            { value: "Calico", label: t("coat.cat.calico") },
            { value: "Tabby", label: t("coat.cat.tabby") },
            { value: "Point", label: t("coat.cat.point") },
            { value: "Blue", label: t("coat.cat.blue") },
        ],
        Rabbit: [
            { value: "White", label: t("coat.rabbit.white") },
            { value: "Grey", label: t("coat.rabbit.grey") },
            { value: "Black", label: t("coat.rabbit.black") },
            { value: "Brown", label: t("coat.rabbit.brown") },
            { value: "Blue", label: t("coat.rabbit.blue") },
            { value: "Fawn", label: t("coat.rabbit.fawn") },
            { value: "Chinchilla", label: t("coat.rabbit.chinchilla") },
            { value: "Broken", label: t("coat.rabbit.broken") },
        ],
        Parrot: [
            { value: "Green", label: t("coat.parrot.green") },
            { value: "Yellow", label: t("coat.parrot.yellow") },
            { value: "Blue", label: t("coat.parrot.blue") },
            { value: "White", label: t("coat.parrot.white") },
            { value: "Grey", label: t("coat.parrot.grey") },
            { value: "Red", label: t("coat.parrot.red") },
            { value: "Multicolor", label: t("coat.parrot.multicolor") },
            { value: "Orange", label: t("coat.parrot.orange") },
        ]
    };

    const [editedPet, setEditedPet] = useState({
        ...pet,
        breed: pet.breed || "",
        coatColor: pet.coatColor || "",
        photos: (pet.photos || []).map((p, i) =>
            typeof p === "string" ? { id: `url-${i}`, url: p } : p
        )
    });

    const handleSelectChange = (option, { name }) => {
        if (name === "species") {
            setEditedPet({
                ...editedPet,
                species: option.value,
                breed: "",
                coatColor: ""
            });
        } else {
            setEditedPet({ ...editedPet, [name]: option.value });
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedPet((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        const errors = {};
        const breedValid = BreedOptions[editedPet.species]?.some(opt => opt.value === editedPet.breed);
        const coatValid = !editedPet.coatColor || CoatColorOptions[editedPet.species]?.some(opt => opt.value === editedPet.coatColor);

        if (!editedPet.species) errors.species = t("form.required");
        if (!editedPet.gender) errors.gender = t("form.required");
        if (!breedValid) errors.breed = t("petform.error_invalid_breed");
        if (!coatValid) errors.coatColor = t("petform.error_invalid_coat_color");
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

            Object.entries(editedPet).forEach(([key, value]) => {
                if (typeof value !== "object") {
                    formData.append(key.replace(/[A-Z]/g, m => `_${m.toLowerCase()}`), value);
                }
            });

            newPhotos.forEach(file => formData.append("photos", file));
            selectedPhotoIds.forEach(id => {
                if (!String(id).startsWith("url-")) {
                    formData.append("delete_photo", id);
                }
            });

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
                onUpdate();
                onClose();
            }
        } catch (err) {
            setSubmitError(t("errors.save"));
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="pet-editor-wrapper">
            <div className="pet-editor-container">
                <h2 className="pet-editor-title">{t("pet.edit")}</h2>
                {submitError && <p className="form-error">{submitError}</p>}

                <div className="form-group">
                    <label>{t("pet.species")}*</label>
                    <Select
                        options={SpeciesOptions}
                        value={SpeciesOptions.find(opt => opt.value === editedPet.species)}
                        onChange={(option) => handleSelectChange(option, { name: "species" })}
                        placeholder={t("pet.select_species")}
                    />
                    {formErrors.species && <p className="form-error">{formErrors.species}</p>}
                </div>

                {editedPet.species && (
                    <>
                        <div className="form-group">
                            <label>{t("pet.breed")}</label>
                            <Select
                                options={BreedOptions[editedPet.species]}
                                value={BreedOptions[editedPet.species]?.find(opt => opt.value === editedPet.breed)}
                                onChange={(option) => handleSelectChange(option, { name: "breed" })}
                                isSearchable
                                placeholder={t("pet.select_breed")}
                            />
                            {formErrors.breed && <p className="form-error">{formErrors.breed}</p>}
                            <small className="form-hint">{t("pet.breed_hint")}</small>
                        </div>

                        <div className="form-group">
                            <label>{t("pet.gender")}*</label>
                            <Select
                                options={GenderOptions}
                                value={GenderOptions.find(opt => opt.value === editedPet.gender)}
                                onChange={(option) => handleSelectChange(option, { name: "gender" })}
                                placeholder={t("pet.select_gender")}
                            />
                            {formErrors.gender && <p className="form-error">{formErrors.gender}</p>}
                        </div>

                        <div className="form-group">
                            <label>{t("pet.coat_color")}</label>
                            <Select
                                options={CoatColorOptions[editedPet.species]}
                                value={CoatColorOptions[editedPet.species]?.find(opt => opt.value === editedPet.coatColor)}
                                onChange={(option) => handleSelectChange(option, { name: "coatColor" })}
                                isSearchable
                                placeholder={t("pet.select_coat_color")}
                            />
                            {formErrors.coatColor && <p className="form-error">{formErrors.coatColor}</p>}
                        </div>
                    </>
                )}

                <div className="form-group">
                    <label>{t("pet.price")}*</label>
                    <input
                        type="text"
                        name="price"
                        value={editedPet.price || ""}
                        onChange={handleInputChange}
                        className="form-input"
                    />
                    {formErrors.price && <p className="form-error">{formErrors.price}</p>}
                </div>

                <div className="form-group">
                    <label>{t("pet.age")}*</label>
                    <input
                        type="text"
                        name="age"
                        value={editedPet.age || ""}
                        onChange={handleInputChange}
                        className="form-input"
                    />
                    {formErrors.age && <p className="form-error">{formErrors.age}</p>}

                </div>

                <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => setNewPhotos([...e.target.files])}
                    className="form-file"
                />
                {editedPet.photos?.length > 0 && (
                    <div className="pet-photo-preview-grid">
                        {editedPet.photos.map(photo => (
                            <div
                                key={photo.id}
                                className={`pet-photo-wrapper ${selectedPhotoIds.includes(photo.id) ? "selected" : ""}`}
                                onClick={() => {
                                    setSelectedPhotoIds(prev =>
                                        prev.includes(photo.id)
                                            ? prev.filter(id => id !== photo.id)
                                            : [...prev, photo.id]
                                    );
                                }}
                            >
                                <img src={`http://localhost:8000${photo.url}`} alt="pet" className="pet-photo" />
                            </div>
                        ))}
                    </div>
                )}

                {selectedPhotoIds.length > 0 && (
                    <button onClick={() => setShowDeleteConfirm(true)} className="btn-delete-selected">
                        🗑 {t("pet.delete_selected", { count: selectedPhotoIds.length })}
                    </button>
                )}

                <div className="form-actions">
                    <button onClick={handleSubmit} disabled={isSaving} className="btn-save">
                        {isSaving ? t("common.saving") : t("common.save")}
                    </button>
                    <button onClick={onClose} className="btn-cancel">
                        {t("common.cancel")}
                    </button>
                </div>


                {showDeleteConfirm && (
                    <div className="modal-backdrop" onClick={() => setShowDeleteConfirm(false)}>
                        <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                            <h3>
                                {selectedPhotoIds.length === 1
                                    ? t("modal.delete_photo_singular")
                                    : selectedPhotoIds.length >= 2 && selectedPhotoIds.length <= 4
                                        ? t("modal.delete_photo_few", { count: selectedPhotoIds.length })
                                        : t("modal.delete_photo_many", { count: selectedPhotoIds.length })}
                            </h3>

                            <div className="modal-actions">
                                <button onClick={() => {
                                    setEditedPet(prev => ({
                                        ...prev,
                                        photos: prev.photos.filter(p => !selectedPhotoIds.includes(p.id))
                                    }));
                                    setSelectedPhotoIds([]);
                                    setShowDeleteConfirm(false);
                                }} className="btn-confirm">
                                    {t("yes")}
                                </button>
                                <button onClick={() => setShowDeleteConfirm(false)} className="btn-cancel">
                                    {t("no")}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                {/* Тут додай фото-прев’ю та кнопку видалення за аналогією з попередньою версією */}


            </div>
        </div>
    );
};

export default PetEditor;
