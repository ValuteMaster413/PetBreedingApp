import {useNavigate, useParams} from "react-router-dom";
import React, {useEffect, useState} from "react";
import axios from "axios";
import PhotoPreviewGrid from "../shared/components/PhotoPreviewGrid";
import {useTranslation} from "react-i18next";
import "./PetProfile.css";
import Header from "../shared/components/Header";
import ChatButton from "../chats/ChatButton";

const PetProfile = () => {
    const {t} = useTranslation();
    const {petId} = useParams();
    const [pet, setPet] = useState(null);
    const [error, setError] = useState(null);
    const [showGallery, setShowGallery] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    const navigate = useNavigate();

    const formatAge = (months) => {
        if (months < 1) return t("petcard.age.less_than_month");
        if (months === 6) return t("petcard.age.half_year");
        if (months < 12) return t("petcard.age.months", {count: months});
        if (months % 12 === 0) {
            const years = months / 12;
            return t("petcard.age.years", {count: years});
        }
        const years = Math.floor(months / 12);
        const remainingMonths = months % 12;
        return t("petcard.age.years_months", {years, months: remainingMonths});
    };

    useEffect(() => {
        const fetchPet = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/pets/get_pet/${petId}/`, {
                    withCredentials: true,
                });
                const data = response.data.report;
                const transformed = {
                    ...data,
                    photos: data.photos.map(p => ({url: p}))
                };
                setPet(transformed);

                const likesResponse = await axios.get(
                    `http://localhost:8000/matching/likes_to_me/${petId}/`,
                    {withCredentials: true}
                );
                if (Array.isArray(likesResponse.data.likes_to_me)) {
                    setLikesCount(likesResponse.data.likes_to_me.length);
                }
            } catch (e) {
                console.error("Failed to fetch pet profile", e);
                setError(t("errors.pets.load"));
            }
        };

        fetchPet();
    }, [petId, t]);

    if (error) return <p className="text-red-500 text-center mt-6">{error}</p>;
    if (!pet) return <p className="text-center mt-6">{t("likes.loading")}</p>;

    return (
        <>
            <Header/>
            <div className="pet-profile-container">
                <div className="pet-card">
                    <div className="pet-header">
                        <h2 className="text-2xl font-bold mb-4 text-center">{t("pet.profile_title")}</h2>
                    </div>

                    {pet.photos?.length > 0 && (
                        <>
                            <div className="pet-photo-preview" style={{position: "relative"}}>
                                <img
                                    src={`http://localhost:8000${pet.photos[0].url}`}
                                    alt="preview"
                                    className="pet-photo"
                                    onClick={() => setShowGallery(true)}
                                />
                                {pet.photos.length > 1 && (
                                    <div className="photo-count-overlay">
                                        +{pet.photos.length - 1}
                                    </div>
                                )}
                            </div>

                            {showGallery && (
                                <PhotoPreviewGrid
                                    photos={pet.photos}
                                    onClose={() => setShowGallery(false)}
                                />
                            )}
                        </>
                    )}

                    <div className="pet-details">
                        <p>
                            <strong>{t("petcard.species")}:</strong> {t(`species.${pet.species.toLowerCase()}`, { defaultValue: pet.species })}
                        </p>
                        <p>
                            <strong>{t("petcard.gender")}:</strong> {t(`petcard.gender.${pet.gender.toLowerCase()}`, { defaultValue: pet.gender })}
                        </p>
                        <p>
                            <strong>{t("petcard.breed")}:</strong> {
                            pet.breed
                                ? t(`breed.${pet.species.toLowerCase()}.${pet.breed.toLowerCase()}`, { defaultValue: pet.breed })
                                : t("petcard.unknown")
                        }
                        </p>
                        <p>
                            <strong>{t("petcard.coat_color")}:</strong> {
                            pet.coat_color
                                ? t(`coat.${pet.species.toLowerCase()}.${pet.coat_color.toLowerCase()}`, { defaultValue: pet.coat_color })
                                : t("petcard.unknown")
                        }
                        </p>
                        <div className="button-row">
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

                            <ChatButton
                                targetUserId={pet.owner_id}
                                targetUsername={pet.owner_username}
                                className="btn-modal-small"
                            />
                        </div>


                    </div>


                </div>
            </div>
        </>
    );
};

export default PetProfile;