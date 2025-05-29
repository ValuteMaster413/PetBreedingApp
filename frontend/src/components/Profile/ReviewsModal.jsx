import React, {useEffect, useState} from "react";
import "./ReviewsModal.css";
import {getCsrfToken} from "../../api/authService";

const ReviewsModal = ({userId, onClose}) => {
    const [reviews, setReviews] = useState([]);
    const [error, setError] = useState(null);
    const [newRating, setNewRating] = useState(5);
    const [newComment, setNewComment] = useState("");
    const [editingReviewId, setEditingReviewId] = useState(null);
    const [editRating, setEditRating] = useState(5);
    const [editComment, setEditComment] = useState("");
    const [currentUserId, setCurrentUserId] = useState(null);

    useEffect(() => {
        fetchReviews();
    }, [userId]);

    useEffect(() => {
        fetch("http://localhost:8000/users/my_info/", {credentials: "include"})
            .then(res => res.json())
            .then(data => {
                if (data.chats && data.chats.length > 0) {
                    setCurrentUserId(data.chats[0].user_id);
                }
            })
            .catch(() => console.error("Не вдалося отримати ID поточного користувача"));
    }, []);

    const fetchReviews = () => {
        fetch(`http://localhost:8000/users/all_review/${userId}/`, {
            credentials: "include"
        })
            .then(res => res.json())
            .then(data => {
                if (data.reports) {
                    setReviews(data.reports);
                    console.log("Reviews response:", data.reports);
                } else {
                    setError("Не вдалося завантажити відгуки");
                }
            })
            .catch(() => setError("Помилка при отриманні відгуків"));
    };

    const handleAddReview = async () => {
        const csrf = await getCsrfToken();

        const res = await fetch(`http://localhost:8000/users/create_review/${userId}/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": csrf
            },
            credentials: "include",
            body: JSON.stringify({
                rating: newRating,
                comment: newComment
            })
        });

        const data = await res.json();
        if (data.success) {
            setNewComment("");
            setNewRating(5);
            fetchReviews();
        } else {
            alert("Не вдалося додати відгук");
        }
    };

    const handleDeleteReview = async (reviewId) => {
        const csrf = await getCsrfToken();

        const res = await fetch(`http://localhost:8000/users/delete_review/${reviewId}/`, {
            method: "DELETE",
            headers: {
                "X-CSRFToken": csrf
            },
            credentials: "include"
        });

        const data = await res.json();
        if (data.success) {
            fetchReviews();
        } else {
            alert("Не вдалося видалити відгук");
        }
    };

    const handleEditReview = async () => {
        const csrf = await getCsrfToken();

        const res = await fetch(`http://localhost:8000/users/edit_review/${editingReviewId}/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": csrf
            },
            credentials: "include",
            body: JSON.stringify({
                rating: editRating,
                comment: editComment
            })
        });

        const data = await res.json();
        if (data.success) {
            setEditingReviewId(null);
            setEditRating(5);
            setEditComment("");
            fetchReviews();
        } else {
            alert("Не вдалося оновити відгук");
        }
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-container scrollable" onClick={e => e.stopPropagation()}>
                <h3 className="modal-title">Відгуки про користувача</h3>
                {error && <p className="text-red-500">{error}</p>}
                {reviews.length === 0 && <p>Відгуків ще немає.</p>}

                <div className="reviews-list">
                    {reviews.map((review, idx) => (
                        <div key={idx} className="review-entry">
                            {editingReviewId === review.id ? (
                                <>
                                    <label>Оцінка:
                                        <select value={editRating} onChange={e => setEditRating(Number(e.target.value))}>
                                            {[1, 2, 3, 4, 5].map(val => (
                                                <option key={val} value={val}>{val}</option>
                                            ))}
                                        </select>
                                    </label>
                                    <label>Коментар:
                                        <textarea
                                            value={editComment}
                                            onChange={e => setEditComment(e.target.value)}
                                        />
                                    </label>
                                    <button className="btn-save-review" onClick={handleEditReview}>
                                        💾 Зберегти
                                    </button>
                                    <button className="btn-cancel-review" onClick={() => setEditingReviewId(null)}>
                                        ❌ Скасувати
                                    </button>
                                </>
                            ) : (
                                <>
                                    <p><strong>Оцінка:</strong> {review.rating} ⭐</p>
                                    <p><strong>Коментар:</strong> {review.comment || "Без коментаря"}</p>
                                    <p className="review-date">{new Date(review.created_at).toLocaleString()}</p>

                                    {review.reviewer === currentUserId && (
                                        <>
                                            <button className="btn-delete-review" onClick={() => handleDeleteReview(review.id)}>
                                                🗑 Видалити
                                            </button>
                                            <button className="btn-edit-review" onClick={() => {
                                                setEditingReviewId(review.id);
                                                setEditRating(review.rating);
                                                setEditComment(review.comment || "");
                                            }}>
                                                ✏️ Редагувати
                                            </button>
                                        </>
                                    )}
                                    <hr />
                                </>
                            )}
                        </div>
                    ))}
                </div>

                <div className="add-review-form">
                    <h4>Залишити відгук</h4>
                    <label>Оцінка:
                        <select value={newRating} onChange={e => setNewRating(Number(e.target.value))}>
                            {[1, 2, 3, 4, 5].map(val => (
                                <option key={val} value={val}>{val}</option>
                            ))}
                        </select>
                    </label>
                    <label>Коментар:
                        <textarea
                            value={newComment}
                            onChange={e => setNewComment(e.target.value)}
                            placeholder="Ваш коментар..."
                        />
                    </label>
                    <button className="btn-add-review" onClick={handleAddReview}>
                        Додати відгук
                    </button>
                </div>

                <button className="btn-modal-cancel" onClick={onClose}>Закрити</button>
            </div>
        </div>
    );
};

export default ReviewsModal;
