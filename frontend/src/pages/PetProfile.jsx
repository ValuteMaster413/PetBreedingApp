import {useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import axios from "axios";
import PhotoPreviewGrid from "../components/Profile/PhotoPreviewGrid";
import "./PetProfile.css";

const PetProfile = () => {
    const {petId} = useParams();
    const [pet, setPet] = useState(null);
    const [error, setError] = useState(null);
    const [showGallery, setShowGallery] = useState(false);

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
            } catch (e) {
                console.error("Помилка при отриманні профілю тварини", e);
                setError("Не вдалося завантажити профіль тварини.");
            }
        };

        fetchPet();
    }, [petId]);

    if (error) return <p className="text-red-500 text-center mt-6">{error}</p>;
    if (!pet) return <p className="text-center mt-6">Завантаження...</p>;

    return (
        <div className="max-w-md mx-auto bg-white shadow rounded p-6 mt-8">
            <h2 className="text-2xl font-bold mb-4 text-center">Профіль тварини</h2>

            <p><strong>Вид:</strong> {pet.species}</p>
            <p><strong>Стать:</strong> {pet.gender}</p>
            <p><strong>Порода:</strong> {pet.breed || "Невідомо"}</p>
            <p><strong>Колір шерсті:</strong> {pet.coat_color || "Невідомо"}</p>
            <p><strong>Ціна:</strong> {pet.price || "Безкоштовно"}</p>
            <p><strong>Вік:</strong> {pet.age} міс.</p>
            <p>
                <strong>Власник:</strong>{" "}
                <a
                    href={`/user/${pet.owner_id}`}
                    className="text-blue-600 underline hover:text-blue-800"
                >
                    Переглянути профіль власника
                </a>
            </p>
            {pet.photos?.length > 0 && (
                <div
                    className="mt-4 cursor-pointer relative"
                    onClick={() => setShowGallery(true)}
                >
                    <img src={`http://localhost:8000${pet.photos[0].url}`} alt="pet" className="w-full h-64 object-cover rounded" />
                    {pet.photos.length > 1 && (
                        <div
                            className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                            +{pet.photos.length - 1}
                        </div>
                    )}
                </div>
            )}

            {showGallery && (
                <PhotoPreviewGrid
                    photos={pet.photos}
                    onClose={() => setShowGallery(false)}
                />
            )}
        </div>
    );
};

export default PetProfile;
