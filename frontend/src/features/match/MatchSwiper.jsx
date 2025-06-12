import {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import axios from "axios";
import {getCsrfToken} from "../../api/authService";
import SympathyModal from "./modals/SympathyModal";
import PhotoPreviewGrid from "../shared/components/PhotoPreviewGrid";
import "./MatchSwiper.css";
import {useTranslation} from "react-i18next";
import {useContext} from "react";
import AuthContext from "../../app/context/AuthContext";

const MatchSwiper = () => {
    const {t} = useTranslation();
    const {pet_id} = useParams();
    const [matches, setMatches] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [error, setError] = useState(null);
    const [matchMessage, setMatchMessage] = useState("");
    const [showSympathyModal, setShowSympathyModal] = useState(false);
    const [sympathyPetData, setSympathyPetData] = useState(null);
    const [showPreview, setShowPreview] = useState(false);
    const {user} = useContext(AuthContext);
    const [isPremium, setIsPremium] = useState(true);
    const [viewCount, setViewCount] = useState(0);
    const [limitReached, setLimitReached] = useState(false);

    useEffect(() => {
        const fetchMatches = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/matching/match/${pet_id}/`);
                setMatches(response.data.matches);
            } catch (err) {
                console.error("Match fetch error:", err);
                setError(t("errors.pets.load"));
            }
        };
        fetchMatches();
    }, [pet_id, t]);
    useEffect(() => {
        resetViewLimitIfExpired(); // 👈 ДО запроса пользователя

        const fetchUserInfo = async () => {
            try {
                const response = await axios.get("http://localhost:8000/users/my_info/", {
                    withCredentials: true
                });

                const info = response.data.chats?.[0];
                setIsPremium(info?.is_premium);

                const count = Number(localStorage.getItem("nonPremiumViewCount") || "0");
                setViewCount(count);
            } catch (e) {
                console.error("Ошибка загрузки профиля пользователя", e);
            }
        };

        fetchUserInfo();
    }, []);

    useEffect(() => {
        setMatchMessage("");
    }, [currentIndex]);

    const resetViewLimitIfExpired = () => {
        const lastViewTime = localStorage.getItem("nonPremiumViewTimestamp");
        const now = Date.now();


        if (!lastViewTime || now - Number(lastViewTime) > 21600000) {
            localStorage.setItem("nonPremiumViewCount", "0");
            localStorage.setItem("nonPremiumViewTimestamp", now.toString());
            setViewCount(0);
        }
    };

    const incrementNonPremiumView = () => {
        const newCount = viewCount + 1;
        localStorage.setItem("nonPremiumViewCount", newCount.toString());
        localStorage.setItem("nonPremiumViewTimestamp", Date.now().toString());
        setViewCount(newCount);
    };

    const handleLike = async () => {
        const match = matches[currentIndex];
        try {
            const csrf = await getCsrfToken();

            await axios.post(
                `http://localhost:8000/matching/like/${pet_id}/${match.id}/`,
                {},
                { headers: { "X-CSRFToken": csrf }, withCredentials: true }
            );

            const res = await axios.post(
                `http://localhost:8000/matching/sympathy/${pet_id}/`,
                {},
                { headers: { "X-CSRFToken": csrf }, withCredentials: true }
            );

            if (res.data.success) {
                const { pet1, pet2 } = res.data;

                const isMutual = (pet1 === Number(pet_id) && pet2 === match.id) ||
                    (pet2 === Number(pet_id) && pet1 === match.id);

                if (isMutual) {
                    const petInfoRes = await axios.get(`http://localhost:8000/pets/get_pet/${match.id}/`, {
                        withCredentials: true
                    });
                    setSympathyPetData(petInfoRes.data.report);
                    setShowSympathyModal(true);
                } else {
                    if (!isPremium) incrementNonPremiumView();
                    setCurrentIndex(prev => prev + 1);
                    console.log(setCurrentIndex)
                }
            } else {
                if (!isPremium) incrementNonPremiumView();
                setCurrentIndex(prev => prev + 1);
                console.log(setCurrentIndex)
            }

        } catch (e) {
            console.error("Like error:", e);
            if (!isPremium) incrementNonPremiumView();
            setCurrentIndex(prev => prev + 1);
            console.log(setCurrentIndex)
        }
    };

    const handleSkip = () => {
        if (!isPremium) incrementNonPremiumView();
        setCurrentIndex(prev => prev + 1);
            console.log(setCurrentIndex)
    };

    const handleDislike = async () => {
        const match = matches[currentIndex];
        try {
            const csrf = await getCsrfToken();
            await axios.post(
                `http://localhost:8000/matching/match/${pet_id}/dislike/${match.id}/`,
                {},
                {headers: {"X-CSRFToken": csrf}, withCredentials: true}
            );
        } catch (e) {
            console.error("Dislike error:", e);
        } finally {
            setCurrentIndex(prev => prev + 1);
        }
        if (!isPremium) incrementNonPremiumView();
    };

    if (error) return <p className="text-red-500 text-center">{error}</p>;
    if (matches.length === 0)
        return (
            <div className="match-card">
                <p className="text-center">{t("match.no_matches")}</p>
                <div className="match-back-wrapper">
                    <button className="match-btn match-btn-back" onClick={() => window.location.href = '/profile'}>
                        {t("match.back_to_profile")}
                    </button>
                </div>
            </div>
        );
    if (currentIndex >= matches.length)
        return (
            <div className="match-card">
                <p className="text-center">{t("match.all_seen")}</p>
                <div className="match-back-wrapper">
                    <button className="match-btn match-btn-back" onClick={() => window.location.href = '/profile'}>
                        {t("match.back_to_profile")}
                    </button>
                </div>
            </div>
        );
    if (!isPremium && viewCount >= 5) {
        return (
            <div className="match-card">
                <p className="text-center text-red-500 font-semibold mb-4">
                    {t("match.limit_reached") || "Вы достигли лимита просмотров"}
                </p>
                <p className="text-center mb-4">
                    {t("match.premium_offer") || "Купите премиум, чтобы просматривать больше анкет."}
                </p>
                <div className="match-back-wrapper">
                    <button className="match-btn match-btn-back" onClick={() => window.location.href = "/profile"}>
                        {t("match.back_to_profile")}
                    </button>
                </div>
            </div>
        );
    }
    const match = matches[currentIndex];

    return (
        <div className="match-card">
            <h2>{match.species} ({t(`petcard.gender.${match.gender}`)})</h2>
            <p><strong>{t("match.breed")}:</strong> {match.breed || t("match.unknown")}</p>
            <p><strong>{t("match.color")}:</strong> {match.coat_color || t("match.unknown")}</p>
            <p><strong>{t("match.age")}:</strong> {match.age} міс.</p>
            <p><strong>{t("match.price")}:</strong> {match.price || t("match.free")}</p>

            {match.photos?.length > 0 && (
                <div className="match-photo-wrapper" onClick={() => setShowPreview(true)}>
                    <img
                        src={`http://localhost:8000${match.photos[0]}`}
                        alt="pet"
                        className="match-photo"
                    />
                </div>
            )}

            {matchMessage && <p className="match-info-message">{matchMessage}</p>}

            <div className="match-buttons">
                <button onClick={handleDislike} className="match-btn match-btn-dislike">
                    {t("match.dislike")}
                </button>
                <button onClick={handleSkip} className="match-btn match-btn-skip">
                    {t("match.skip")}
                </button>
                <button onClick={handleLike} className="match-btn match-btn-like">
                    {t("match.like")}
                </button>
            </div>
            <div className="match-back-wrapper">
                <button className="match-btn match-btn-back" onClick={() => window.location.href = '/profile'}>
                    {t("match.back_to_profile")}
                </button>
            </div>
            {showPreview && (
                <PhotoPreviewGrid photos={match.photos} onClose={() => setShowPreview(false)}/>
            )}
            {showSympathyModal && (
                <SympathyModal
                    pet={sympathyPetData}
                    onNext={() => {
                        setShowSympathyModal(false);
                        setCurrentIndex(prev => prev + 1);
                    }}
                />
            )}
        </div>
    );
};

export default MatchSwiper;
