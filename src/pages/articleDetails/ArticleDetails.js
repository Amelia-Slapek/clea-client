import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import CleaMenu from '../../styles/components/menu/Menu';
import Footer from '../../styles/components/footer/Footer';
import ArticleComments from '../../styles/components/articleComments/ArticleComments';
import eyeIcon from '../../assets/EYE.svg';
import likeIcon from '../../assets/LIKE.svg';
import commentIcon from '../../assets/COMMENT.svg';
import calendarIcon from '../../assets/CALENDAR.svg';
import likeWhiteIcon from '../../assets/LIKE_WHITE.svg';
import saveIcon from '../../assets/SAVE.svg';
import './ArticleDetails.scss';

export const ArticleDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user, token, updateUser } = useAuth();

    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isLiked, setIsLiked] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [localLikes, setLocalLikes] = useState(0);
    const [commentsCount, setCommentsCount] = useState(0);

    const handleNavigation = (path) => {
        navigate(path);
    };

    const wasArticleViewedInSession = (articleId) => {
        const viewedArticles = sessionStorage.getItem('viewedArticles');
        if (!viewedArticles) return false;
        try {
            const parsed = JSON.parse(viewedArticles);
            return parsed.includes(articleId);
        } catch { return false; }
    };

    const markArticleAsViewed = (articleId) => {
        const viewedArticles = sessionStorage.getItem('viewedArticles');
        let parsed = [];
        if (viewedArticles) {
            try { parsed = JSON.parse(viewedArticles); } catch { parsed = []; }
        }
        if (!parsed.includes(articleId)) {
            parsed.push(articleId);
            sessionStorage.setItem('viewedArticles', JSON.stringify(parsed));
        }
    };

    const incrementViews = useCallback(async (articleId) => {
        if (wasArticleViewedInSession(articleId)) return;

        try {
            await fetch(`https://clea-client-backend-bjdna9f5eug4a9fd.polandcentral-01.azurewebsites.net/api/articles/${articleId}/view`, {
                method: 'POST',
            });
            markArticleAsViewed(articleId);
        } catch (error) {
            console.error('Błąd zwiększania wyświetleń:', error);
        }
    }, []);

    const fetchArticle = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch(`https://clea-client-backend-bjdna9f5eug4a9fd.polandcentral-01.azurewebsites.net/api/articles/${id}`);
            if (!response.ok) throw new Error('Artykuł nie został znaleziony');
            const data = await response.json();
            setArticle(data);
            setLocalLikes(data.likes || 0);
            setCommentsCount(data.comments_count || 0);
            await incrementViews(id);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [id, incrementViews]);

    useEffect(() => {
        fetchArticle();
    }, [fetchArticle]);

    useEffect(() => {
        if (user && article) {
            const likedArticles = JSON.parse(localStorage.getItem(`likedArticles_${user.id}`) || '[]');
            setIsLiked(likedArticles.includes(article._id));
            setIsSaved(user.savedArticles?.includes(article._id) || false);
        }
    }, [user, article]);

    const handleLike = async () => {
        if (!user || !token) { navigate('/login'); return; }
        try {
            const likedArticles = JSON.parse(localStorage.getItem(`likedArticles_${user.id}`) || '[]');
            const newIsLiked = !isLiked;
            if (newIsLiked) {
                likedArticles.push(article._id);
                setLocalLikes(prev => prev + 1);
                await fetch(`https://clea-client-backend-bjdna9f5eug4a9fd.polandcentral-01.azurewebsites.net/api/articles/${id}/like`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            } else {
                const index = likedArticles.indexOf(article._id);
                if (index > -1) likedArticles.splice(index, 1);
                setLocalLikes(prev => prev - 1);
                await fetch(`https://clea-client-backend-bjdna9f5eug4a9fd.polandcentral-01.azurewebsites.net/api/articles/${id}/unlike`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            }
            localStorage.setItem(`likedArticles_${user.id}`, JSON.stringify(likedArticles));
            setIsLiked(newIsLiked);
        } catch (error) { console.error('Błąd polubienia:', error); }
    };

    const handleSave = async () => {
        if (!user || !token) { navigate('/login'); return; }
        try {
            const method = isSaved ? 'DELETE' : 'POST';
            const response = await fetch(`https://clea-client-backend-bjdna9f5eug4a9fd.polandcentral-01.azurewebsites.net/api/auth/saved-articles/${id}`, {
                method: method,
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
            });
            if (response.ok) {
                const data = await response.json();
                setIsSaved(!isSaved);
                updateUser({ ...user, savedArticles: data.savedArticles });
            }
        } catch (error) { console.error('Błąd zapisywania artykułu:', error); }
    };

    const handleCommentAdded = async () => { await fetchArticle(); };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const months = ['stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca', 'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia'];
        return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
    };

    const getCategoryColor = (category) => {
        if (!category) return '#999';
        const colors = { 'recenzje': '#0A5CCE', 'analiza': '#CE0A79', 'bezpieczeństwo': '#CE8D0A', 'trendy': '#CE0A0A' };
        return colors[category.toLowerCase()] || '#999';
    };

    const renderBlock = (block) => {
        switch (block.type) {
            case 'heading': return <h2 key={block._id} className="article-details__heading">{block.content}</h2>;
            case 'paragraph': return <p key={block._id} className="article-details__paragraph">{block.content}</p>;
            case 'image': return (
                <figure key={block._id} className="article-details__image-wrapper">
                    <img src={block.content.imageData} alt={block.content.altText || 'Zdjęcie artykułu'} className="article-details__image" />
                </figure>
            );
            case 'list': return (
                <ul key={block._id} className="article-details__list">
                    {block.content.map((item, index) => (
                        <li key={index} className="article-details__list-item">
                            <div className="article-details__list-number">{index + 1}</div>
                            <span className="article-details__list-text">{item}</span>
                        </li>
                    ))}
                </ul>
            );
            default: return null;
        }
    };

    if (loading) return <div className="article-details__loading">Ładowanie artykułu...</div>;
    if (error) return <div className="article-details__error">Błąd: {error}</div>;
    if (!article) return null;

    return (
        <div className="clea">
            <div className="clea-page article-details">
                <CleaMenu onNavigate={handleNavigation} currentPath={location.pathname} />

                <main className="article-details__main">
                    <header className="article-details__cover-section">
                        <div className="article-details__cover">
                            {article.coverImageData ? (
                                <img src={article.coverImageData} alt={article.title} />
                            ) : (
                                <div className="article-details__no-cover">Brak zdjęcia</div>
                            )}
                        </div>
                    </header>

                    <article className="article-details__content-wrapper">
                        <div className="article-details__content">
                            <section className="article-details__meta">
                                {article.category && (
                                    <div
                                        className="article-details__category"
                                        style={{ backgroundColor: getCategoryColor(article.category) }}
                                    >
                                        {article.category}
                                    </div>
                                )}

                                <div className="article-details__stats">
                                    <div className="article-details__stat-item">
                                        <img src={eyeIcon} alt="" className="article-details__stat-icon" />
                                        <span className="article-details__stat-value">{article.views || 0}</span>
                                    </div>
                                    <div className="article-details__stat-item">
                                        <img src={likeIcon} alt="" className="article-details__stat-icon" />
                                        <span className="article-details__stat-value">{localLikes}</span>
                                    </div>
                                    <div className="article-details__stat-item">
                                        <img src={commentIcon} alt="" className="article-details__stat-icon" />
                                        <span className="article-details__stat-value">{commentsCount}</span>
                                    </div>
                                </div>
                            </section>

                            <h1 className="article-details__title">{article.title}</h1>

                            <div className="article-details__blocks">
                                {article.blocks && article.blocks.map(block => (
                                    <div key={block._id} className="article-details__block-elem">
                                        {renderBlock(block)}
                                    </div>
                                ))}
                            </div>

                            <section className="article-details__actions">
                                <button
                                    className={`article-details__btn article-details__btn--like ${isLiked ? 'article-details__btn--liked' : ''}`}
                                    onClick={handleLike}
                                >
                                    <img src={likeWhiteIcon} alt="" className="article-details__btn-icon" />
                                    <span>{isLiked ? 'Polubiono!' : 'Lubię to!'}</span>
                                </button>
                                <button
                                    className={`article-details__btn article-details__btn--save ${isSaved ? 'article-details__btn--saved' : ''}`}
                                    onClick={handleSave}
                                >
                                    <img src={saveIcon} alt="" className="article-details__btn-icon" />
                                    <span>{isSaved ? 'Zapisano!' : 'Zapisz!'}</span>
                                </button>
                            </section>

                            <footer className="article-details__author-section">
                                <div className="article-details__author-info">
                                    <div className="article-details__author-avatar">
                                        {article.author_id?.avatarImageId?.imageData || article.author_id?.avatarImageData ? (
                                            <img
                                                src={article.author_id?.avatarImageId?.imageData || article.author_id?.avatarImageData}
                                                alt="Avatar autora"
                                            />
                                        ) : (
                                            <div className="article-details__avatar-placeholder">
                                                {article.author_id?.firstName?.[0]?.toUpperCase() || 'A'}
                                            </div>
                                        )}
                                    </div>
                                    <div className="article-details__author-name">
                                        {article.author_id?.firstName} {article.author_id?.lastName}
                                    </div>
                                </div>
                                <div className="article-details__date-info">
                                    <img src={calendarIcon} alt="" className="article-details__calendar-icon" />
                                    <time dateTime={article.createdAt} className="article-details__date-text">
                                        {formatDate(article.createdAt)}
                                    </time>
                                </div>
                            </footer>
                        </div>

                        <ArticleComments
                            articleId={article._id}
                            user={user}
                            token={token}
                            onCommentAdded={handleCommentAdded}
                        />
                    </article>
                </main>
            </div>
            <Footer />
        </div>
    );
};