import React, {useEffect, useState} from "react";
import "./ReviewsModal.css";
import {getCsrfToken} from "../../../api/authService";
import {useTranslation} from "react-i18next";

const ReviewsModal = ({userId, onClose}) => {
    const {t} = useTranslation();
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
            .catch(() => console.error(t("errors.user_info")));
    }, [t]);

    const fetchReviews = () => {
        fetch(`http://localhost:8000/users/all_review/${userId}/`, {credentials: "include"})
            .then(res => res.json())
            .then(data => {
                if (data.reports) setReviews(data.reports);
                else setError(t("reviews.load_fail"));
            })
            .catch(() => setError(t("reviews.load_error")));
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
            body: JSON.stringify({rating: newRating, comment: newComment})
        });
        const data = await res.json();
        if (data.success) {
            setNewComment("");
            setNewRating(5);
            fetchReviews();
        } else alert(t("reviews.add_fail"));
    };

    const handleDeleteReview = async (reviewId) => {
        const csrf = await getCsrfToken();
        const res = await fetch(`http://localhost:8000/users/delete_review/${reviewId}/`, {
            method: "DELETE",
            headers: {"X-CSRFToken": csrf},
            credentials: "include"
        });
        const data = await res.json();
        if (data.success) fetchReviews();
        else alert(t("reviews.delete_fail"));
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
            body: JSON.stringify({rating: editRating, comment: editComment})
        });
        const data = await res.json();
        if (data.success) {
            setEditingReviewId(null);
            setEditRating(5);
            setEditComment("");
            fetchReviews();
        } else alert(t("reviews.edit_fail"));
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-container scrollable" onClick={e => e.stopPropagation()}>
                <h3 className="modal-title">{t("reviews.title")}</h3>

                <div className="add-review-form">
                    <h4>{t("reviews.leave")}</h4>
                    <label>
                        {t("reviews.rating")}:
                        <select value={newRating} onChange={e => setNewRating(Number(e.target.value))}>
                            {[1, 2, 3, 4, 5].map(val => (
                                <option key={val} value={val}>{val}</option>
                            ))}
                        </select>
                    </label>
                    <label>
                        {t("reviews.comment")}:
                        <textarea
                            value={newComment}
                            onChange={e => setNewComment(e.target.value)}
                            placeholder={t("reviews.placeholder")}
                        />
                    </label>
                    <button className="btn-add-review" onClick={handleAddReview}>
                        {t("reviews.submit")}
                    </button>
                </div>

                {error && <p className="text-red-500">{error}</p>}

                <div className="reviews-list">
                    {reviews.length === 0 && <p>{t("reviews.empty")}</p>}
                    {reviews.map((review) => (
                        <div key={review.id} className="review-entry">
                            {editingReviewId === review.id ? (
                                <>
                                    <label>
                                        {t("reviews.rating")}:
                                        <select value={editRating}
                                                onChange={e => setEditRating(Number(e.target.value))}>
                                            {[1, 2, 3, 4, 5].map(val => (
                                                <option key={val} value={val}>{val}</option>
                                            ))}
                                        </select>
                                    </label>
                                    <label>
                                        {t("reviews.comment")}:
                                        <textarea
                                            value={editComment}
                                            onChange={e => setEditComment(e.target.value)}
                                        />
                                    </label>
                                    <button className="btn-save-review" onClick={handleEditReview}>
                                        💾 {t("reviews.save")}
                                    </button>
                                    <button className="btn-cancel-review" onClick={() => setEditingReviewId(null)}>
                                        ❌ {t("reviews.cancel")}
                                    </button>
                                </>
                            ) : (
                                <>
                                    <p><strong>{t("reviews.rating")}:</strong> {review.rating} ⭐</p>
                                    <p>
                                        <strong>{t("reviews.comment")}:</strong> {review.comment || t("reviews.no_comment")}
                                    </p>
                                    <p className="review-date">{new Date(review.created_at).toLocaleString()}</p>
                                    {review.reviewer === currentUserId && (
                                        <>
                                            <button className="btn-delete-review"
                                                    onClick={() => handleDeleteReview(review.id)}>🗑 {t("reviews.delete")}</button>
                                            <button className="btn-edit-review" onClick={() => {
                                                setEditingReviewId(review.id);
                                                setEditRating(review.rating);
                                                setEditComment(review.comment || "");
                                            }}>✏️ {t("reviews.edit")}</button>
                                        </>
                                    )}
                                </>
                            )}
                            <hr/>
                        </div>
                    ))}
                </div>

                <button className="btn-modal-cancel" onClick={onClose}>{t("chatroom.cancel")}</button>
            </div>
        </div>
    );
};

export default ReviewsModal;
