import React from 'react';
import { useNavigate } from 'react-router-dom';
import heartEmpty from '../../../assets/HEART_EMPTY.svg';
import heartFilled from '../../../assets/HEART_FILLED.svg';
import './ProductCard.scss';

const API_URL = 'https://clea-client-backend-bjdna9f5eug4a9fd.polandcentral-01.azurewebsites.net';

const ProductCard = ({
    product,
    isFavorite = false,
    onToggleFavorite,
    showButton = true
}) => {
    const navigate = useNavigate();
    const getImageSource = () => {
        if (product.imageId) {
            const id = typeof product.imageId === 'object' ? product.imageId._id : product.imageId;
            return `${API_URL}/api/images/${id}`;
        }
        if (product.imageData) {
            return product.imageData;
        }
        return null;
    };

    const imageSrc = getImageSource();

    const renderStars = (rating, reviewCount) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const partialStar = rating - fullStars;

        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars.push(<span key={i} className="star star--full">★</span>);
            } else if (i === fullStars && partialStar > 0) {
                stars.push(
                    <span key={i} className="star star--partial" style={{ '--fill': partialStar }}>
                        <span className="star__fill">★</span>
                        <span className="star__empty">★</span>
                    </span>
                );
            } else {
                stars.push(<span key={i} className="star star--empty">★</span>);
            }
        }

        return (
            <div className="product-card__rating">
                <div className="stars-container">{stars}</div>
                <span className="product-card__reviews-count">({reviewCount || 0})</span>
            </div>
        );
    };

    const handleCardClick = () => {
        navigate(`/product/${product._id}`);
    };

    const handleFavoriteClick = (e) => {
        e.stopPropagation();
        if (onToggleFavorite) {
            onToggleFavorite(product._id);
        }
    };

    return (
        <article className="product-card">
            <button
                className="product-card__fav-btn"
                onClick={handleFavoriteClick}
                aria-label={isFavorite ? 'Usuń z ulubionych' : 'Dodaj do ulubionych'}
            >
                <img
                    src={isFavorite ? heartFilled : heartEmpty}
                    alt=""
                    className="heart-icon"
                />
            </button>
            <div
                className="product-card__image-wrapper"
                onClick={handleCardClick}
                style={{ cursor: 'pointer' }}
            >
                {imageSrc ? (
                    <img
                        src={imageSrc}
                        alt={product.name}
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/200x200?text=Brak+zdjęcia';
                        }}
                    />
                ) : (
                    <div className="product-card__image-placeholder">Brak zdjęcia</div>
                )}
            </div>

            <header className="product-card__header">
                <h3 className="product-card__title">{product.name}</h3>
                {product.subcategory ? (
                    <p className="product-card__subtitle">{product.subcategory}</p>
                ) : product.category && (
                    <p className="product-card__subtitle">{product.category}</p>
                )}
            </header>

            {renderStars(product.rating || 0, product.reviewCount || 0)}

            {product.skinType && product.skinType.length > 0 && (
                <div className="product-card__tags">
                    {product.skinType.join(' • ')}
                </div>
            )}

            {showButton && (
                <footer className="product-card__footer">
                    <button
                        className="btn btn--product-check"
                        onClick={handleCardClick}
                    >
                        Sprawdź
                    </button>
                </footer>
            )}
        </article>
    );
};

export default ProductCard;