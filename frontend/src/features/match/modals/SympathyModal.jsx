import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./SympathyModal.css";

const SympathyModal = ({ pet, onClose, onNext }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    if (!pet) return null;

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                <h2 className="modal-title">💞 {t("match.mutual_sympathy")}</h2>
                <p>
                    {t("match.mutual_message", {
                        species: pet.species,
                        gender: t(`petcard.gender.${pet.gender}`) || pet.gender
                    })}
                </p>

                {pet.photos?.length > 0 && (
                    <img
                        src={`http://localhost:8000${pet.photos[0]}`}
                        alt="sympathy-pet"
                        className="modal-photo"
                    />
                )}

                <div className="modal-buttons">
                    <button onClick={() => navigate(`/pets/${pet.id}`)} className="btn-modal">
                        {t("pet.owner_profile")}
                    </button>
                    <button onClick={() => navigate(`/chat?to=${pet.owner_id}`)} className="btn-modal">
                        ✉ {t("chat_button.send_message")}
                    </button>
                    <button onClick={onNext} className="btn-modal-cancel">
                        ▶ {t("match.back_to_profile")}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SympathyModal;
