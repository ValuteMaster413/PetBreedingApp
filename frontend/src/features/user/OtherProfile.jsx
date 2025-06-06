import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { getCsrfToken } from "../../api/authService";
import "../profile/pages/Profile.css";
import "./OtherProfile.css";
import PhotoPreviewGrid from "../shared/components/PhotoPreviewGrid";
import ReviewsModal from "../profile/modals/ReviewsModal";
import ChatButton from "../chats/ChatButton";

const OtherProfile = () => {
    const { t } = useTranslation();
    const { userId } = useParams();
    const [profile, setProfile] = useState(null);
    const [pets, setPets] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showReviews, setShowReviews] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        axios.get(`http://localhost:8000/users/user_info/${userId}/`, { withCredentials: true })
            .then(res => {
                if (res.data.chats && Array.isArray(res.data.chats) && res.data.chats.length > 0) {
                    setProfile(res.data.chats[0]);
                } else {
                    setError(t("errors.profile.not_found"));
                }
            })
            .catch(() => setError(t("errors.profile.load")));

        axios.get(`http://localhost:8000/pets/all_pets/${userId}/`, { withCredentials: true })
            .then(res => {
                if (Array.isArray(res.data.reports)) {
                    setPets(res.data.reports);
                }
            })
            .catch(() => console.error(t("errors.pets.load")))
            .finally(() => setLoading(false));
    }, [userId, t]);

    if (loading) return <p>{t("likes.loading")}</p>;
    if (error) return <p className="text-red-500">{error}</p>;
    if (!profile) return <p>{t("errors.profile.not_found")}</p>;

    return (
        <div className="profile-container">
            <div className="profile-card">
                <h2 className="profile-title">{profile.username}</h2>

                <div className="other-profile-buttons">
                    <ChatButton targetUserId={userId} targetUsername={profile.username} />
                    <button
                        className="btn-modal-small"
                        onClick={() => setShowReviews(true)}
                    >
                        {t("otherprofile.reviews")}
                    </button>
                </div>
            </div>

            {showReviews && (
                <ReviewsModal
                    userId={userId}
                    onClose={() => setShowReviews(false)}
                />
            )}

            <div className="mt-6 w-full max-w-md">
                <h3 className="text-lg font-semibold mb-2" style={{ textAlign: 'center' }}>
                    {t("otherprofile.pets.title", { username: profile.username })}
                </h3>
                {pets.length === 0 ? (
                    <p className="text-gray-500">{t("otherprofile.pets.none")}</p>
                ) : (
                    <div className="space-y-4">
                        {pets.map((pet, index) => (
                            <PetReadonlyCard key={index} pet={pet} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const PetReadonlyCard = ({ pet }) => {
    const { t } = useTranslation();
    const [openPreview, setOpenPreview] = useState(false);

    return (
        <div className="pet-card">
            <p><strong>{t("petcard.species")}:</strong> {pet.species}</p>
            <p><strong>{t("petcard.gender")}:</strong> {pet.gender}</p>
            <p><strong>{t("petcard.breed")}:</strong> {pet.breed || t("match.unknown")}</p>
            <p><strong>{t("petcard.color")}:</strong> {pet.coat_color || t("match.unknown")}</p>
            <p><strong>{t("petcard.price")}:</strong> {pet.price || t("match.free")}</p>
            <p><strong>{t("petcard.age")}:</strong> {pet.age} міс.</p>

            {pet.photos?.length > 0 && (
                <>
                    <div className="pet-photo-preview" style={{ position: "relative" }}>
                        <img
                            src={`http://localhost:8000${pet.photos[0]}`}
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
                            photos={pet.photos.map(url => ({ url }))}
                            onClose={() => setOpenPreview(false)}
                        />
                    )}
                </>
            )}
        </div>
    );
};

export default OtherProfile;
