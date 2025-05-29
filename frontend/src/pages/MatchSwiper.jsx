import {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import axios from "axios";
import {sendLike, checkSympathy} from "../api/likeService";
import SympathyModal from "../components/matches/SympathyModal";
import {getCsrfToken} from "../api/authService";

const MatchSwiper = () => {
    const {pet_id} = useParams();
    const [matches, setMatches] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [error, setError] = useState(null);
    const [matchMessage, setMatchMessage] = useState("");

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
        try {
            const csrf = await getCsrfToken();

            await axios.post(
                `http://localhost:8000/matching/like/${pet_id}/${match.id}/`,
                {},
                {
                    headers: { "X-CSRFToken": csrf },
                    withCredentials: true
                }
            );

            const res = await axios.get(
                `http://localhost:8000/matching/sympathys/${pet_id}/`,
                { withCredentials: true }
            );

            const mutual = res.data.sympathys.find(sym =>
                (sym.pet1 === Number(pet_id) && sym.pet2 === match.id) ||
                (sym.pet2 === Number(pet_id) && sym.pet1 === match.id)
            );
            console.log("🎯 Взаємна симпатія знайдена:", mutual);

            if (mutual) {
                const petInfoRes = await axios.get(
                    `http://localhost:8000/pets/get_pet/${match.id}/`,
                    { withCredentials: true }
                );
                console.log("📦 Дані для модалки:", petInfoRes.data.report);
                setSympathyPetData(petInfoRes.data.report);
                setShowSympathyModal(true);
            } else {
                setCurrentIndex((prev) => prev + 1);
            }

        } catch (e) {
            console.error("Помилка при обробці лайку або симпатії:", e);
            setCurrentIndex((prev) => prev + 1);
        }
    };

    const handleSkip = () => {
        setMatchMessage("");
        setCurrentIndex((prev) => prev + 1);
    };
    const handleDislike = async () => {
        try {
            const csrf = await getCsrfToken();

            await axios.post(
                `http://localhost:8000/matching/match/${pet_id}/dislike/${match.id}/`,
                {},
                {
                    headers: { "X-CSRFToken": csrf },
                    withCredentials: true
                }
            );
        } catch (e) {
            console.error("Помилка при дизлайку:", e);
        } finally {
            setCurrentIndex(prev => prev + 1);
        }
    };
    const [showSympathyModal, setShowSympathyModal] = useState(false);
    const [sympathyPetData, setSympathyPetData] = useState(null);

    if (error) return <p className="text-red-500 text-center">{error}</p>;
    if (matches.length === 0) return <p className="text-center">Немає доступних тварин для пошуку 😢</p>;
    if (currentIndex >= matches.length) return <p className="text-center">Це були всі 🐾</p>;

    const match = matches[currentIndex];

    return (
        <div className="flex flex-col items-center bg-white p-4 rounded shadow max-w-sm mx-auto">
            <h2 className="text-xl font-bold mb-2">{match.species} ({match.gender})</h2>
            <p><strong>Порода:</strong> {match.breed || "Невідомо"}</p>
            <p><strong>Колір:</strong> {match.coat_color || "Невідомо"}</p>
            <p><strong>Вік:</strong> {match.age} міс.</p>
            <p><strong>Ціна:</strong> {match.price || "Безкоштовно"}</p>

            {match.photos?.length > 0 && (
                <img
                    src={`http://localhost:8000${match.photos[0]}`}
                    alt="pet"
                    className="w-64 h-64 object-cover rounded my-4"
                />
            )}

            {matchMessage && <p className="text-sm text-blue-500 mb-2">{matchMessage}</p>}

            <div className="flex gap-4 mt-4">
                <button
                    onClick={handleDislike}
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
                >
                    👎 Нецікаво
                </button>
                <button
                    onClick={handleSkip}
                    className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded"
                >
                    ❌ Пропустити
                </button>
                <button
                    onClick={handleLike}
                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
                >
                    ❤️ Підходить
                </button>
            </div>
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
