import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import defaultAvatar from "../../../assets/AVATAR.jpeg";
import './ArticleComments.scss';

const ArticleComments = ({ articleId, user, token, onCommentAdded }) => {
    const navigate = useNavigate();
    const [comments, setComments] = useState([]);
    const [newCommentContent, setNewCommentContent] = useState("");
    const [commentSubmitting, setCommentSubmitting] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [loading, setLoading] = useState(true);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = date.getDate();
        const month = date.toLocaleString('pl-PL', { month: 'long' });
        const year = date.getFullYear();
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${day} ${month} ${year} • ${hours}:${minutes}`;
    };

    const fetchComments = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch(
                `https://clea-client-backend-bjdna9f5eug4a9fd.polandcentral-01.azurewebsites.net/api/articles/${articleId}/comments`
            );

            if (response.ok) {
                const data = await response.json();
                setComments(data);
            }
        } catch (error) {
            console.error("Błąd pobierania komentarzy:", error);
        } finally {
            setLoading(false);
        }
    }, [articleId]);

    useEffect(() => {
        fetchComments();
    }, [fetchComments]);

    const handleTextareaFocus = () => {
        if (!user || !token) {
            setShowLoginModal(true);
        }
    };

    const handleGoToLogin = () => {
        navigate('/login', { state: { from: `/article/${articleId}` } });
    };

    const handleCancelModal = () => {
        setShowLoginModal(false);
    };

    const handleCommentSubmit = async () => {
        if (!user || !token) {
            setShowLoginModal(true);
            return;
        }

        if (!newCommentContent.trim()) {
            alert("Proszę wpisać treść komentarza.");
            return;
        }

        setCommentSubmitting(true);
        try {
            const response = await fetch(`https://clea-client-backend-bjdna9f5eug4a9fd.polandcentral-01.azurewebsites.net/api/articles/${articleId}/comments`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ content: newCommentContent })
            });

            if (response.ok) {
                setNewCommentContent("");
                await fetchComments();
                if (onCommentAdded) onCommentAdded();
            } else {
                const errData = await response.json();
                alert(errData.message || "Błąd dodawania komentarza");
            }
        } catch (error) {
            console.error("Błąd wysyłania komentarza:", error);
        } finally {
            setCommentSubmitting(false);
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm("Czy na pewno chcesz usunąć ten komentarz?")) return;

        try {
            const response = await fetch(`https://clea-client-backend-bjdna9f5eug4a9fd.polandcentral-01.azurewebsites.net/api/articles/${articleId}/comments/${commentId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                await fetchComments();
                if (onCommentAdded) onCommentAdded();
            } else {
                const errData = await response.json();
                alert(errData.message || "Błąd usuwania komentarza");
            }
        } catch (error) {
            console.error("Błąd usuwania komentarza:", error);
        }
    };

    const getCurrentUserAvatar = () => {
        if (!user) return defaultAvatar;
        if (user.avatarImageData && typeof user.avatarImageData === 'string') return user.avatarImageData;
        if (user.avatarImageId?.imageData) return user.avatarImageId.imageData;
        return defaultAvatar;
    };

    const getCommentAuthorAvatar = (comment) => {
        if (!comment.userId) return defaultAvatar;
        if (comment.userId.avatarImageId?.imageData) return comment.userId.avatarImageId.imageData;
        if (comment.userId.avatarImageData) return comment.userId.avatarImageData;
        return defaultAvatar;
    };

    return (
        <>
            <section className="article-comments">
                <header className="article-comments__header">
                    <h2 className="article-comments__title">
                        Komentarze <span className="article-comments__title-parens">(<span className="article-comments__title-count">{comments.length}</span>)</span>
                    </h2>
                </header>

                <div className="article-comments__form-container">
                    <div className="article-comments__form">
                        <div className="article-comments__user-avatar">
                            <figure className="article-comments__avatar-circle">
                                <img
                                    src={getCurrentUserAvatar()}
                                    alt="Twój avatar"
                                    className="article-comments__avatar-img"
                                    onError={(e) => { e.target.onerror = null; e.target.src = defaultAvatar; }}
                                />
                            </figure>
                        </div>

                        <div className="article-comments__input-section">
                            <textarea
                                className="article-comments__input"
                                placeholder={user ? "Twój komentarz..." : "Zaloguj się, aby dodać komentarz"}
                                value={newCommentContent}
                                onChange={(e) => setNewCommentContent(e.target.value)}
                                onFocus={handleTextareaFocus}
                                disabled={!user || !token}
                            />
                        </div>

                        <div className="article-comments__submit-section">
                            <button
                                className="article-comments__submit-btn"
                                onClick={handleCommentSubmit}
                                disabled={!user || !token || commentSubmitting || !newCommentContent.trim()}
                            >
                                {commentSubmitting ? '...' : 'Dodaj'}
                            </button>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <p className="article-comments__status article-comments__status--loading">Ładowanie komentarzy...</p>
                ) : comments.length > 0 ? (
                    <div className="article-comments__list">
                        {comments.map((comment) => {
                            const isOwner = user && comment.userId && comment.userId._id === user.id;

                            return (
                                <article key={comment._id} className="article-comments__item">
                                    <div className="article-comments__card">
                                        <div className="article-comments__author-col">
                                            <figure className="article-comments__author-avatar">
                                                <img
                                                    src={getCommentAuthorAvatar(comment)}
                                                    alt={`Avatar ${comment.userId?.username || ''}`}
                                                    className="article-comments__author-img"
                                                    onError={(e) => { e.target.onerror = null; e.target.src = defaultAvatar; }}
                                                />
                                            </figure>
                                            <p className="article-comments__author-name">
                                                {comment.userId?.username || 'Użytkownik'}
                                            </p>
                                        </div>

                                        <div className="article-comments__content-col">
                                            <time className="article-comments__date">
                                                {formatDate(comment.createdAt)}
                                            </time>
                                            <p className="article-comments__text">
                                                {comment.content}
                                            </p>
                                            {isOwner && (
                                                <button
                                                    className="article-comments__delete-btn"
                                                    onClick={() => handleDeleteComment(comment._id)}
                                                >
                                                    Usuń
                                                </button>
                                            )}
                                        </div>

                                        <div className="article-comments__brand-col">
                                            CLEA
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                ) : (
                    <p className="article-comments__status article-comments__status--empty">Brak komentarzy. Bądź pierwszy!</p>
                )}
            </section>
            {showLoginModal && (
                <div className="article-comments-modal">
                    <div className="article-comments-modal__overlay">
                        <article className="article-comments-modal__content article-comments-modal__content--login">
                            <h3 className="article-comments-modal__title">Wymagane logowanie</h3>
                            <p className="article-comments-modal__message">
                                Aby dodać komentarz do artykułu, musisz być zalogowany.
                            </p>
                            <div className="article-comments-modal__actions">
                                <button
                                    className="article-comments-modal__btn article-comments-modal__btn--primary"
                                    onClick={handleGoToLogin}
                                >
                                    Przejdź do logowania
                                </button>
                                <button
                                    className="article-comments-modal__btn article-comments-modal__btn--secondary"
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

export default ArticleComments;