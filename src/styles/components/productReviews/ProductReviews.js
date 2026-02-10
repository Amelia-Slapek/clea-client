import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import defaultAvatar from "../../../assets/AVATAR.jpeg";
import './ProductReviews.scss';

const ProductReviews = ({ productId, reviews, user, token, onReviewAdded }) => {
    const navigate = useNavigate();
    const [newReviewRating, setNewReviewRating] = useState(0);
    const [newReviewContent, setNewReviewContent] = useState("");
    const [hoverRating, setHoverRating] = useState(0);
    const [reviewSubmitting, setReviewSubmitting] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = date.getDate();
        const month = date.toLocaleString('pl-PL', { month: 'long' });
        const year = date.getFullYear();
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${day} ${month} ${year} • ${hours}:${minutes}`;
    };

    const getCurrentUserAvatar = () => {
        if (!user) return defaultAvatar;
        if (user.avatarImageData && typeof user.avatarImageData === 'string') return user.avatarImageData;
        if (user.avatarImageId?.imageData) return user.avatarImageId.imageData;
        return defaultAvatar;
    };

    const getReviewAuthorAvatar = (review) => {
        if (!review.userId) return defaultAvatar;
        if (review.userId.avatarImageId?.imageData) return review.userId.avatarImageId.imageData;
        if (review.userId.avatarImageData) return review.userId.avatarImageData;
        return defaultAvatar;
    };

    const handleStarClick = (starValue) => {
        if (!user || !token) {
            setShowLoginModal(true);
            return;
        }
        setNewReviewRating(starValue);
    };

    const handleStarHover = (starValue) => {
        if (!user || !token) return;
        setHoverRating(starValue);
    };

    const handleTextareaFocus = () => {
        if (!user || !token) {
            setShowLoginModal(true);
        }
    };

    const handleGoToLogin = () => {
        navigate('/login', { state: { from: `/product/${productId}` } });
    };

    const handleCancelModal = () => {
        setShowLoginModal(false);
    };

    const handleReviewSubmit = async () => {
        if (!user || !token) {
            setShowLoginModal(true);
            return;
        }

        if (newReviewRating === 0) {
            alert("Proszę zaznaczyć ocenę w gwiazdkach.");
            return;
        }
        if (!newReviewContent.trim()) {
            alert("Proszę wpisać treść opinii.");
            return;
        }

        setReviewSubmitting(true);
        try {
            const response = await fetch(`https://clea-client-backend-bjdna9f5eug4a9fd.polandcentral-01.azurewebsites.net/api/products/${productId}/reviews`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    rating: newReviewRating,
                    content: newReviewContent
                })
            });

            if (response.ok) {
                setNewReviewRating(0);
                setNewReviewContent("");
                if (onReviewAdded) onReviewAdded();
            } else {
                const errData = await response.json();
                alert(errData.message || "Błąd dodawania opinii");
            }
        } catch (error) {
            console.error("Błąd wysyłania opinii:", error);
        } finally {
            setReviewSubmitting(false);
        }
    };

    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm("Czy na pewno chcesz usunąć tę opinię?")) return;

        try {
            const response = await fetch(`https://clea-client-backend-bjdna9f5eug4a9fd.polandcentral-01.azurewebsites.net/api/products/${productId}/reviews/${reviewId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                if (onReviewAdded) onReviewAdded();
            } else {
                const errData = await response.json();
                alert(errData.message || "Błąd usuwania opinii");
            }
        } catch (error) {
            console.error("Błąd usuwania opinii:", error);
        }
    };

    return (
        <>
            <section className="product-reviews">
                <header className="product-reviews__header">
                    <h2 className="product-reviews__title">
                        Komentarze <span className="product-reviews__title-parens">(<span className="product-reviews__title-count">{reviews ? reviews.length : 0}</span>)</span>
                    </h2>
                </header>

                <div className="product-reviews__form-container">
                    <div className="product-reviews__form">
                        <div className="product-reviews__user-avatar">
                            <figure className="product-reviews__avatar-circle">
                                <img
                                    src={getCurrentUserAvatar()}
                                    alt="Twój avatar"
                                    className="product-reviews__avatar-img"
                                    onError={(e) => { e.target.onerror = null; e.target.src = defaultAvatar; }}
                                />
                            </figure>
                        </div>

                        <div className="product-reviews__form-content">
                            <div className="product-reviews__rating-input">
                                <div className="product-reviews__stars-wrapper">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            className={`product-reviews__star-btn ${star <= (hoverRating || newReviewRating) ? 'product-reviews__star-btn--active' : ''}`}
                                            onClick={() => handleStarClick(star)}
                                            onMouseEnter={() => handleStarHover(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            style={{ cursor: (user && token) ? 'pointer' : 'not-allowed' }}
                                        >
                                            ★
                                        </button>
                                    ))}
                                </div>
                                <span className="product-reviews__stars-label">Ocena w gwiazdkach</span>
                            </div>
                            <textarea
                                className="product-reviews__textarea"
                                placeholder={user ? "Treść opinii" : "Zaloguj się, aby dodać opinię"}
                                value={newReviewContent}
                                onChange={(e) => setNewReviewContent(e.target.value)}
                                onFocus={handleTextareaFocus}
                                disabled={!user || !token}
                                style={{ cursor: (user && token) ? 'text' : 'not-allowed' }}
                            />
                        </div>

                        <div className="product-reviews__submit-section">
                            <button
                                className="product-reviews__submit-btn"
                                onClick={handleReviewSubmit}
                                disabled={!user || !token || reviewSubmitting || newReviewRating === 0 || !newReviewContent.trim()}
                            >
                                {reviewSubmitting ? '...' : 'Dodaj'}
                            </button>
                        </div>
                    </div>
                </div>

                {reviews && reviews.length > 0 ? (
                    <div className="product-reviews__list">
                        {reviews.map((review) => {
                            const isOwner = user && review.userId && review.userId._id === user.id;

                            return (
                                <article key={review._id} className="product-reviews__item">
                                    <div className="product-reviews__card">
                                        <div className="product-reviews__author-col">
                                            <figure className="product-reviews__author-avatar">
                                                <img
                                                    src={getReviewAuthorAvatar(review)}
                                                    alt={`Avatar użytkownika ${review.userId?.username || ''}`}
                                                    className="product-reviews__author-img"
                                                    onError={(e) => { e.target.src = defaultAvatar }}
                                                />
                                            </figure>
                                            <p className="product-reviews__author-name">
                                                {review.userId?.username || 'Użytkownik'}
                                            </p>
                                            <div className="product-reviews__author-rating">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <span key={star} className={`product-reviews__static-star ${star <= review.rating ? 'product-reviews__static-star--filled' : ''}`}>★</span>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="product-reviews__content-col">
                                            <time className="product-reviews__date">
                                                {formatDate(review.createdAt)}
                                            </time>
                                            <p className="product-reviews__text">
                                                {review.content}
                                            </p>
                                            {isOwner && (
                                                <button
                                                    className="product-reviews__delete-btn"
                                                    onClick={() => handleDeleteReview(review._id)}
                                                >
                                                    Usuń
                                                </button>
                                            )}
                                        </div>

                                        <div className="product-reviews__brand-col">
                                            CLEA
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                ) : (
                    <p className="product-reviews__status product-reviews__status--empty">Brak opinii. Bądź pierwszy!</p>
                )}
            </section>
            {showLoginModal && (
                <div className="product-reviews-modal">
                    <div className="product-reviews-modal__overlay">
                        <article className="product-reviews-modal__content product-reviews-modal__content--login">
                            <h3 className="product-reviews-modal__title">Wymagane logowanie</h3>
                            <p className="product-reviews-modal__message">
                                Aby dodać opinię o produkcie, musisz być zalogowany.
                            </p>
                            <div className="product-reviews-modal__actions">
                                <button
                                    className="product-reviews-modal__btn product-reviews-modal__btn--primary"
                                    onClick={handleGoToLogin}
                                >
                                    Przejdź do logowania
                                </button>
                                <button
                                    className="product-reviews-modal__btn product-reviews-modal__btn--secondary"
                                    onClick={handleCancelModal}
                                >
                                    Anuluj
                                </button>
                            </div>
                        </article>
                    </div>
                </div>
            )}
        </>
    );
};

export default ProductReviews;