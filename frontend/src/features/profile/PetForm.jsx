import React, { useState, useEffect } from "react";
import Select from "react-select";
import { useTranslation } from "react-i18next";
import "./PetForm.css";

const PetForm = ({ initialPet, initialPhotos, formErrors, onSave, onCancel, title }) => {
    const { t } = useTranslation();
    const [petData, setPetData] = useState(initialPet || {});
    const [photos, setPhotos] = useState(initialPhotos || []);
    const [localErrors, setLocalErrors] = useState({});

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



    const handleChange = (selectedOption, { name }) => {
        if (name === "species") {
            setPetData({
                ...petData,
                species: selectedOption.value,
                breed: "",
                coatColor: ""
            });
        } else {
            setPetData({ ...petData, [name]: selectedOption.value });
        }
    };

    const handlePhotoChange = (e) => {
        setPhotos([...e.target.files]);
    };

    const handleSubmit = () => {
        const availableBreeds = BreedOptions[petData.species] || [];
        const availableColors = CoatColorOptions[petData.species] || [];

        const breedValid = availableBreeds.some(opt => opt.value === petData.breed);
        const coatColorValid = !petData.coatColor || availableColors.some(opt => opt.value === petData.coatColor);

        const newErrors = {};

        if (!breedValid) newErrors.breed = t("petform.error_invalid_breed");
        if (!coatColorValid) newErrors.coatColor = t("petform.error_invalid_coat_color");

        if (Object.keys(newErrors).length > 0) {
            setLocalErrors(newErrors);
            return;
        }

        setLocalErrors({}); // очистити локальні помилки

        const formattedData = Object.fromEntries(
            Object.entries(petData).map(([key, value]) => [
                key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`),
                value
            ])
        );
        onSave(formattedData, photos);
    };

    const fields = [
        { label: t("pet.age"), name: "age", required: true, type: "number" },
        { label: t("pet.price"), name: "price", required: true, type: "number" },
    ];

    return (
        <div className="pet-form centered-form">
            <h2 className="form-title">{title || t("pet.new")}</h2>

            <div className="form-group">
                <label className="form-label">{t("pet.species")} <span style={{ color: "red" }}>*</span></label>
                <Select
                    options={SpeciesOptions}
                    value={SpeciesOptions.find(opt => opt.value === petData.species)}
                    onChange={(option) => handleChange(option, { name: "species" })}
                    placeholder={t("pet.select_species")}
                />
                {formErrors?.species && <p className="form-error">{formErrors.species}</p>}
            </div>

            {petData.species && (
                <>
                    <div className="form-group">
                        <label className="form-label">{t("pet.breed")}</label>
                        <Select
                            options={BreedOptions[petData.species]}
                            value={BreedOptions[petData.species]?.find(opt => opt.value === petData.breed)}
                            onChange={(option) => handleChange(option, { name: "breed" })}
                            placeholder={t("pet.select_breed")}
                            isSearchable
                        />
                        {localErrors.breed && <p className="form-error">{localErrors.breed}</p>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">{t("pet.gender")} <span style={{ color: "red" }}>*</span></label>
                        <Select
                            options={GenderOptions}
                            value={GenderOptions.find(opt => opt.value === petData.gender)}
                            onChange={(option) => handleChange(option, { name: "gender" })}
                            placeholder={t("pet.select_gender")}
                        />
                        {formErrors?.gender && <p className="form-error">{formErrors.gender}</p>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">{t("pet.coat_color")}</label>
                        <Select
                            options={CoatColorOptions[petData.species]}
                            value={CoatColorOptions[petData.species]?.find(opt => opt.value === petData.coatColor)}
                            onChange={(option) => handleChange(option, { name: "coatColor" })}
                            placeholder={t("pet.select_coat_color")}
                            isSearchable
                        />
                        {localErrors.coatColor && <p className="form-error">{localErrors.coatColor}</p>}
                    </div>
                </>
            )}

            {fields.map(({ label, name, required, type }) => (
                <div className="form-group" key={name}>
                    <label className="form-label">
                        {label} {required && <span style={{ color: "red" }}>*</span>}
                    </label>
                    <input
                        type={type}
                        name={name}
                        value={petData[name] || ""}
                        onChange={(e) => setPetData({ ...petData, [name]: e.target.value })}
                        placeholder={label}
                        className="form-input"
                    />
                    {formErrors?.[name] && <p className="form-error">{formErrors[name]}</p>}
                    {name === "age" && <small className="form-hint">{t("pet.age_hint")}</small>}
                </div>
            ))}

            <input type="file" accept="image/*" multiple onChange={handlePhotoChange} className="form-file" />

            <div className="form-actions">
                <button onClick={handleSubmit} className="btn-save">{t("common.save")}</button>
                <button onClick={onCancel} className="btn-cancel">{t("common.cancel")}</button>
            </div>
        </div>
    );
};

export default PetForm;
