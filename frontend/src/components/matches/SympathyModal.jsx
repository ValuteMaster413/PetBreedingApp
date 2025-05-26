import React from "react";
import { useNavigate } from "react-router-dom";
import "./SympathyModal.css";

const SympathyModal = ({ pet, onClose }) => {
    const navigate = useNavigate();

    if (!pet) return null;

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                <h2 className="modal-title">💞 У вас взаємна симпатія!</h2>
                <p>Ваша тварина і <strong>{pet.species}</strong> (стать: {pet.gender}) вподобали одне одного!</p>

                {pet.photos?.length > 0 && (
                    <img
                        src={`http://localhost:8000${pet.photos[0]}`}
                        alt="sympathy-pet"
                        className="modal-photo"
                    />
                )}

                <div className="modal-buttons">
                    <button onClick={() => navigate(`/pets/${pet.id}`)} className="btn-modal">
                        Профіль тварини
                    </button>
                    {/*<button onClick={() => navigate(`/owner/${pet.owner_id}`)} className="btn-modal">*/}
                    {/*    Профіль власника*/}
                    {/*</button>*/}
                    <button onClick={() => navigate(`/chat?to=${pet.owner_id}`)} className="btn-modal">
                        ✉ Написати повідомлення
                    </button>
                    <button onClick={onClose} className="btn-modal-cancel">✖ Закрити</button>
                </div>
            </div>
        </div>
    );
};

export default SympathyModal;
