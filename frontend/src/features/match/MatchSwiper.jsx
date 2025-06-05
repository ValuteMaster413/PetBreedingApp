import React, {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import axios from "axios";
import {getCsrfToken} from "../../api/authService";
import SympathyModal from "./modals/SympathyModal";
import "./MatchSwiper.css";
import PhotoPreviewGrid from "../shared/components/PhotoPreviewGrid";

const MatchSwiper = () => {
    const {pet_id} = useParams();
    const [matches, setMatches] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [error, setError] = useState(null);
    const [matchMessage, setMatchMessage] = useState("");
    const [showSympathyModal, setShowSympathyModal] = useState(false);
    const [sympathyPetData, setSympathyPetData] = useState(null);
    const [showPreview, setShowPreview] = useState(false);


    useEffect(() => {
        const fetchMatches = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/matching/match/${pet_id}/`);
                setMatches(response.data.matches);
            } catch (err) {
                console.error("Помилка при завантаженні матчів:", err);
                setError("Не вдалося отримати список підходящих тварин.");
            }
        };
        fetchMatches();
    }, [pet_id]);

    const handleLike = async () => {
        const match = matches[currentIndex];
        try {
            const csrf = await getCsrfToken();

            await axios.post(
                `http://localhost:8000/matching/like/${pet_id}/${match.id}/`,
                {},
                {
                    headers: {"X-CSRFToken": csrf},
                    withCredentials: true
                }
            );


            const res = await axios.post(
                `http://localhost:8000/matching/sympathy/${pet_id}/`,
                {},
                {
                    headers: { "X-CSRFToken": csrf },
                    withCredentials: true
                }
            );

            const mutual = res.data.sympathys.find(sym =>
                (sym.pet1 === Number(pet_id) && sym.pet2 === match.id) ||
                (sym.pet2 === Number(pet_id) && sym.pet1 === match.id)
            );

            if (mutual) {
                const petInfoRes = await axios.get(
                    `http://localhost:8000/pets/get_pet/${match.id}/`,
                    {withCredentials: true}
                );
                setSympathyPetData(petInfoRes.data.report);
                setShowSympathyModal(true);
            } else {
                setCurrentIndex(prev => prev + 1);
            }
        } catch (e) {
            console.error("Помилка при обробці лайку або симпатії:", e);
            setCurrentIndex(prev => prev + 1);
        }
    };

    const handleSkip = () => {
        setMatchMessage("");
        setCurrentIndex(prev => prev + 1);
    };

    const handleDislike = async () => {
        const match = matches[currentIndex];
        try {
            const csrf = await getCsrfToken();
            await axios.post(
                `http://localhost:8000/matching/match/${pet_id}/dislike/${match.id}/`,
                {},
                {
                    headers: {"X-CSRFToken": csrf},
                    withCredentials: true
                }
            );
        } catch (e) {
            console.error("Помилка при дизлайку:", e);
        } finally {
            setCurrentIndex(prev => prev + 1);
        }
    };

    if (error) return <p className="text-red-500 text-center">{error}</p>;
    if (matches.length === 0)
        return (
            <div className="match-card">
                <p className="text-center">Немає доступних тварин для пошуку 😢</p>
                <div className="match-back-wrapper">
                    <button className="match-btn match-btn-back" onClick={() => window.location.href = '/profile'}>
                        ← Повернутись до профілю
                    </button>
                </div>
            </div>
        );
    if (currentIndex >= matches.length)
        return (
            <div className="match-card">
                <p className="text-center">Це були всі 🐾</p>
                <div className="match-back-wrapper">
                    <button className="match-btn match-btn-back" onClick={() => window.location.href = '/profile'}>
                        ← Повернутись до профілю
                    </button>
                </div>
            </div>
        );

    const match = matches[currentIndex];

    return (
        <div className="match-card">
            <h2>{match.species} ({match.gender})</h2>
            <p><strong>Порода:</strong> {match.breed || "Невідомо"}</p>
            <p><strong>Колір:</strong> {match.coat_color || "Невідомо"}</p>
            <p><strong>Вік:</strong> {match.age} міс.</p>
            <p><strong>Ціна:</strong> {match.price || "Безкоштовно"}</p>

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
                    👎 Нецікаво
                </button>
                <button onClick={handleSkip} className="match-btn match-btn-skip">
                    ❌ Пропустити
                </button>
                <button onClick={handleLike} className="match-btn match-btn-like">
                    ❤️ Підходить
                </button>
            </div>
            <div className="match-back-wrapper">
                <button className="match-btn match-btn-back" onClick={() => window.location.href = '/profile'}>
                    ← Повернутись до профілю
                </button>
            </div>
            {showPreview && (
                <PhotoPreviewGrid
                    photos={match.photos}
                    onClose={() => setShowPreview(false)}
                />
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
