import {useEffect, useState} from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const MatchSwiper = () => {
    const {pet_id} = useParams();
    const [matches, setMatches] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [error, setError] = useState(null);

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

    const handleLike = () => {
        setCurrentIndex((prev) => prev + 1);
        // можно добавить запрос на отметку "лайк" или "свайп"
    };

    const handleSkip = () => {
        setCurrentIndex((prev) => prev + 1);
    };

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

            <div className="flex gap-4 mt-4">
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
        </div>
    );
};

export default MatchSwiper;
