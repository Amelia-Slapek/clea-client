import React from 'react';
import { useNavigate } from 'react-router-dom';
import calendarIcon from '../../../assets/CALENDAR.svg';
import eyeIcon from '../../../assets/EYE.svg';
import likeIcon from '../../../assets/LIKE.svg';
import commentIcon from '../../../assets/COMMENT.svg';
import './ArticleCard.scss';

const ArticleCard = ({
    article,
    onRemove = null,
    showRemoveButton = false
}) => {
    const navigate = useNavigate();
    const API_URL = 'https://clea-client-backend-bjdna9f5eug4a9fd.polandcentral-01.azurewebsites.net/api/images';

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const months = [
            'stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca',
            'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia'
        ];

        const day = date.getDate();
        const month = months[date.getMonth()];
        const year = date.getFullYear();

        return `${day} ${month} ${year}`;
    };

    const getCategoryColor = (category) => {
        if (!category) return '#999';
        const categoryLower = category.toLowerCase();
        const colors = {
            'recenzje': '#0A5CCE',
            'analiza': '#CE0A79',
            'bezpieczeństwo': '#CE8D0A',
            'trendy': '#CE0A0A'
        };
        return colors[categoryLower] || '#999';
    };

    const handleArticleClick = () => {
        navigate(`/article/${article._id}`);
    };

    const handleRemoveClick = (e) => {
        e.stopPropagation();
        if (onRemove) onRemove(article._id);
    };

    const getImageUrl = (imageId) => {
        if (!imageId) return null;
        const id = typeof imageId === 'object' ? imageId._id : imageId;
        return `${API_URL}/${id}`;
    };

    const coverUrl = getImageUrl(article.coverImageId);
    const avatarUrl = getImageUrl(article.author_id?.avatarImageId);

    return (
        <div className="article-card">
            {showRemoveButton && (
                <button
                    className="article-card__remove"
                    onClick={handleRemoveClick}
                    aria-label="Usuń z zapisanych"
                >
                    Usuń
                </button>
            )}

            <div className="article-card__image" onClick={handleArticleClick}>
                {coverUrl ? (
                    <img
                        src={coverUrl}
                        alt={article.title}
                        loading="lazy"
                        onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/400x250?text=Brak+zdjęcia';
                        }}
                    />
                ) : (
                    <div className="article-card__no-image">Brak zdjęcia</div>
                )}

                {article.category && (
                    <div
                        className="article-card__category-badge"
                        style={{ backgroundColor: getCategoryColor(article.category) }}
                    >
                        {article.category}
                    </div>
                )}
            </div>

            <div className="article-card__info" onClick={handleArticleClick}>
                <div className="article-card__meta">
                    <div className="article-card__author">
                        <div className="article-card__avatar">
                            {avatarUrl ? (
                                <img
                                    src={avatarUrl}
                                    alt={article.author_id?.firstName || 'Avatar'}
                                    loading="lazy"
                                />
                            ) : (
                                <div className="article-card__avatar-placeholder">
                                    {article.author_id?.firstName?.[0]?.toUpperCase() || 'A'}
                                </div>
                            )}
                        </div>
                        <span className="article-card__author-name">
                            {article.author_id?.firstName} {article.author_id?.lastName}
                        </span>
                    </div>

                    <div className="article-card__date">
                        <img src={calendarIcon} alt="Data" className="article-card__calendar-icon" />
                        <span className="article-card__date-text">
                            {formatDate(article.createdAt)}
                        </span>
                    </div>
                </div>

                <h3 className="article-card__title">{article.title}</h3>

                <div className="article-card__stats">
                    <div className="article-card__stat">
                        <img src={eyeIcon} alt="Wyświetlenia" className="article-card__stat-icon" />
                        <span className="article-card__stat-value">{article.views || 0}</span>
                    </div>
                    <div className="article-card__stat">
                        <img src={likeIcon} alt="Polubienia" className="article-card__stat-icon" />
                        <span className="article-card__stat-value">{article.likes || 0}</span>
                    </div>
                    <div className="article-card__stat">
                        <img src={commentIcon} alt="Komentarze" className="article-card__stat-icon" />
                        <span className="article-card__stat-value">{article.comments_count || 0}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ArticleCard;