import React, { useEffect, useState } from "react";
import axios from "axios";
import "./LikesModal.css";
import PhotoPreviewGrid from "../../shared/components/PhotoPreviewGrid";
import { getCsrfToken } from "../../../api/authService";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const LikesModal = ({ petId, onClose, onDislike }) => {
    const { t } = useTranslation();
    const [likes, setLikes] = useState([]);
    const [error, setError] = useState(null);
    const [ignoredIds, setIgnoredIds] = useState([]);

    useEffect(() => {
        axios.get(`http://localhost:8000/matching/likes_to_me/${petId}/`, { withCredentials: true })
            .then(res => setLikes(res.data.likes_to_me))
            .catch(err => {
                console.error("Error loading likes", err);
                setError(t("errors.pets.load"));
            });
    }, [petId, t]);

    const handleLikeBack = async (likedPetId) => {
        try {
            const csrf = await getCsrfToken();
            await axios.post(`http://localhost:8000/matching/like/${petId}/${likedPetId}/`, {}, {
                withCredentials: true,
                headers: { "X-CSRFToken": csrf }
            });
            alert(t("likes.message"));
        } catch (err) {
            console.error("Error liking back", err);
        }
    };

    const handleIgnore = (id) => {
        setIgnoredIds(prev => [...prev, id]);
        setLikes(prev => prev.filter(like => like.from !== id));
        onDislike?.();
    };

    const visibleLikes = likes.filter(like => !ignoredIds.includes(like.from));

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-container scrollable" onClick={e => e.stopPropagation()}>
                <h3 className="modal-title">{t("likes.title")}</h3>
                {error && <p>{error}</p>}
                {visibleLikes.length === 0 && <p>{t("likes.none")}</p>}

                {visibleLikes.map((like, idx) => (
                    <LikeEntry
                        key={idx}
                        petId={like.from}
                        viewerPetId={petId}
                        onLikeBack={handleLikeBack}
                        onIgnore={handleIgnore}
                    />
                ))}

                <button className="btn-modal-cancel" onClick={onClose}>{t("chatroom.cancel")}</button>
            </div>
        </div>
    );
};

const LikeEntry = ({ viewerPetId, petId, onLikeBack, onIgnore }) => {
    const { t } = useTranslation();
    const [pet, setPet] = useState(null);
    const [openPreview, setOpenPreview] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        axios.get(`http://localhost:8000/pets/get_pet/${petId}/`, { withCredentials: true })
            .then(res => {
                const data = res.data.report;
                const transformed = {
                    ...data,
                    photos: data.photos.map(p => typeof p === "string" ? { url: p } : p)
                };
                setPet(transformed);
            })
            .catch(err => console.error("Failed to load pet", err));
    }, [petId]);

    const handleDislike = async () => {
        try {
            const csrf = await getCsrfToken();
            const res = await axios.post(
                `http://localhost:8000/matching/match/${viewerPetId}/dislike/${pet.id}/`,
                {},
                {
                    headers: { "X-CSRFToken": csrf },
                    withCredentials: true
                }
            );

            if (res.data.success) {
                onIgnore(pet.id);
            } else {
                console.warn("Dislike already exists or another error:", res.data.message);
            }

        } catch (err) {
            console.error("Error disliking", err);
        }
    };

    if (!pet) return <div className="like-item">{t("likes.loading")}</div>;

    return (
        <>
            <div className="like-item">
                <div className="like-photo-block" onClick={() => setOpenPreview(true)} style={{ cursor: "pointer" }}>
                    {pet.photos?.length > 0 && (
                        <img
                            src={`http://localhost:8000${pet.photos[0].url}`}
                            alt="pet"
                            className="like-thumb"
                        />
                    )}
                </div>
                <div className="like-info">
                    <p><strong>{pet.species}</strong> — {t(`petcard.gender.${pet.gender}`)}</p>
                    <p>{t("likes.breed")}: {pet.breed || t("match.unknown")}</p>
                    <p>{t("likes.age")}: {t("petcard.age.months", { count: Number(pet.age) })}</p>

                    <div className="like-buttons">
                        <button onClick={handleDislike} className="btn-modal-ignore">👎 {t("likes.ignore")}</button>
                        <button onClick={() => alert(t("chat_button.send_message"))} className="btn-modal-small">✉ {t("likes.message")}</button>
                        <button
                            onClick={() => {
                                if (pet.owner_id) {
                                    navigate(`/profile/${pet.owner_id}`);
                                } else {
                                    alert("Owner ID not loaded");
                                }
                            }}
                            className="btn-modal-small"
                        >
                            👤 {t("likes.owner")}
                        </button>
                    </div>
                </div>
            </div>

            {openPreview && (
                <PhotoPreviewGrid
                    photos={pet.photos}
                    onClose={() => setOpenPreview(false)}
                />
            )}
        </>
    );
};

export default LikesModal;
