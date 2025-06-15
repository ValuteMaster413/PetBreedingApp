import React, { useEffect, useState } from "react";
import "./PetCard.css";
import PhotoPreviewGrid from "../shared/components/PhotoPreviewGrid";
import LikesModal from "./modals/LikesModal";
import { useTranslation } from "react-i18next";

const PetCard = ({ pet, onEdit, onDelete, onMatch }) => {
    const { t } = useTranslation();
    const [openPreview, setOpenPreview] = useState(false);
    const [showLikesModal, setShowLikesModal] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const capitalize = (str) => str?.charAt(0).toUpperCase() + str?.slice(1).toLowerCase();

    const formatAge = (months) => {


        if (months < 12) {
            return t("petcard.age.months", { count: months });
        }

        const years = Math.floor(months / 12);
        const remainingMonths = months % 12;

        if (remainingMonths === 0) {
            return t("petcard.age.years", { count: years });
        }

        return t("petcard.age.years_months", { years, months: remainingMonths });
    };

    useEffect(() => {
        fetch(`http://localhost:8000/matching/likes_to_me/${pet.id}/`, { credentials: "include" })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data.likes_to_me)) {
                    setLikesCount(data.likes_to_me.length);
                }
            })
            .catch(err => {
                console.error(t("petcard.error_loading_likes"), err);
            });
    }, [pet.id]);

    return (
        <div className="pet-card">
            <p><strong>{t("petcard.species")}:</strong> {t(`species.${pet.species.toLowerCase()}`)}</p>
            <p><strong>{t("petcard.gender")}:</strong> {t(`petcard.gender.${pet.gender?.toLowerCase()}`)}</p>
            <p><strong>{t("petcard.breed")}:</strong> {
                pet.breed ? t(`breed.${pet.species.toLowerCase()}.${pet.breed.toLowerCase()}`) : t("petcard.unknown")
            }</p>

            <p><strong>{t("petcard.coat_color")}:</strong> {
                pet.coat_color ? t(`coat.${pet.species.toLowerCase()}.${pet.coat_color.toLowerCase()}`) : t("petcard.unknown")
            }</p>
            <p><strong>{t("petcard.price")}:</strong> {pet.price || t("petcard.free")}</p>
            <p><strong>{t("petcard.age")}:</strong> {formatAge(pet.age)}</p>

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
                <button className="btn-delete" onClick={() => setShowDeleteConfirm(true)}>
                    🗑 {t("petcard.delete")}
                </button>
                <button className="btn-edit" onClick={onEdit}>✏️ {t("petcard.edit")}</button>
                <button className="btn-match" onClick={onMatch}>🔍 {t("petcard.match")}</button>

                <div style={{ position: "relative" }}>
                    <button className="btn-likes" onClick={() => setShowLikesModal(true)}>
                        ❤️ {t("petcard.who_liked")}
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

            {showDeleteConfirm && (
                <div className="modal-backdrop" onClick={() => setShowDeleteConfirm(false)}>
                    <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                        <h3>{t("chatlist.confirm_delete_pet") || "Ви точно хочете видалити тварину?"}</h3>
                        <div className="modal-actions">
                            <button
                                className="btn-confirm"
                                onClick={() => {
                                    onDelete();
                                    setShowDeleteConfirm(false);
                                }}
                            >
                                {t("yes") || "Так"}
                            </button>
                            <button
                                className="btn-cancel"
                                onClick={() => setShowDeleteConfirm(false)}
                            >
                                {t("no") || "Ні"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default PetCard;
