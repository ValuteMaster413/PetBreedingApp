import React, { useEffect, useState } from "react";
import axios from "axios";
import "./LikesModal.css";
import PhotoPreviewGrid from "./PhotoPreviewGrid";

const LikesModal = ({ petId, onClose }) => {
    const [likes, setLikes] = useState([]);
    const [error, setError] = useState(null);
    const [ignored, setIgnored] = useState([]);

    useEffect(() => {
        axios.get(`http://localhost:8000/matching/likes_to_me/${petId}/`, { withCredentials: true })
            .then(res => setLikes(res.data.likes_to_me))
            .catch(err => {
                console.error("Помилка при завантаженні лайків", err);
                setError("Помилка при отриманні лайків");
            });
    }, [petId]);

    const handleLikeBack = async (likedPetId) => {
        try {
            await axios.post(`http://localhost:8000/matching/like/${petId}/${likedPetId}/`, {}, {
                withCredentials: true,
                headers: {
                    "X-CSRFToken": await (await fetch('http://localhost:8000/api/csrf/', {
                        credentials: 'include'
                    })).text()
                }
            });
            alert("Ви вподобали у відповідь!");
        } catch (err) {
            console.error("Помилка при лайку у відповідь", err);
        }
    };

    const handleIgnore = (id) => {
        setIgnored(prev => [...prev, id]);
    };

    const visibleLikes = likes.filter(like => !ignored.includes(like.from));

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-container scrollable" onClick={e => e.stopPropagation()}>
                <h3 className="modal-title">Тварини, які вас вподобали</h3>
                {error && <p>{error}</p>}
                {visibleLikes.length === 0 && <p>Немає нових вподобань</p>}

                {visibleLikes.map((like, idx) => (
                    <LikeEntry key={idx} petId={like.from} onLikeBack={handleLikeBack} onIgnore={handleIgnore} />
                ))}

                <button className="btn-modal-cancel" onClick={onClose}>Закрити</button>
            </div>
        </div>
    );
};

const LikeEntry = ({ petId, onLikeBack, onIgnore }) => {
    const [pet, setPet] = useState(null);
    const [openPreview, setOpenPreview] = useState(false);

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
            .catch(err => console.error("Не вдалося завантажити тварину", err));
    }, [petId]);

    if (!pet) return <div className="like-item">Завантаження...</div>;

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
                    <p><strong>{pet.species}</strong> — {pet.gender}</p>
                    <p>Порода: {pet.breed || "Невідомо"}</p>
                    <p>Вік: {pet.age} міс.</p>

                    <div className="like-buttons">
                        <button onClick={() => onLikeBack(petId)} className="btn-modal-small">❤️ Вподобати</button>
                        <button onClick={() => onIgnore(petId)} className="btn-modal-ignore">✖ Ігнор</button>
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
