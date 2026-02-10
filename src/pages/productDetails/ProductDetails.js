import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import CleaMenu from '../../styles/components/menu/Menu';
import Footer from '../../styles/components/footer/Footer';
import CircleProgress from '../../styles/components/circle/Circle';
import ProductReviews from '../../styles/components/productReviews/ProductReviews';
import heartEmpty from '../../assets/HEART_EMPTY.svg';
import heartFilled from '../../assets/HEART_FILLED.svg';
import arrowDown from "../../assets/ARROWDOWN.svg";
import './ProductDetails.scss';

const renderStars = (rating, reviewsList) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const partialStar = rating - fullStars;

    for (let i = 0; i < 5; i++) {
        if (i < fullStars) {
            stars.push(<span key={i} className="product-details__star product-details__star--full">★</span>);
        } else if (i === fullStars && partialStar > 0) {
            stars.push(
                <span key={i} className="product-details__star product-details__star--partial" style={{ '--fill': partialStar }}>
                    <span className="product-details__star-fill">★</span>
                    <span className="product-details__star-empty">★</span>
                </span>
            );
        } else {
            stars.push(<span key={i} className="product-details__star product-details__star--empty">★</span>);
        }
    }
    const reviewCount = reviewsList ? reviewsList.length : 0;
    return (
        <div className="product-details__rating-container">
            <div className="product-details__stars">{stars}</div>
            <span className="product-details__rating-text">{rating.toFixed(1)} na 5,0</span>
            <span className="product-details__review-count">({reviewCount} opinii)</span>
        </div>
    );
};

const getSafetyColor = (level) => {
    switch (level) {
        case 'bezpieczny': return '#6C9535';
        case 'akceptowalny': return '#D9BC19';
        case 'lepiej unikać': return '#D97319';
        case 'niebezpieczny': return '#CE0A0A';
        default: return '#4B4B4B';
    }
};

export const ProductDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user, token, updateUser } = useAuth();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFavorite, setIsFavorite] = useState(false);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [expandedIngredients, setExpandedIngredients] = useState({});

    const handleNavigation = (path) => {
        navigate(path);
    };

    const toggleIngredientExpansion = (ingredientId) => {
        setExpandedIngredients(prev => ({
            ...prev,
            [ingredientId]: !prev[ingredientId]
        }));
    };

    const refreshProduct = useCallback(async () => {
        try {
            setLoading(true);

            const response = await fetch(`https://clea-client-backend-bjdna9f5eug4a9fd.polandcentral-01.azurewebsites.net/api/products/${id}`);
            if (!response.ok) throw new Error('Produkt nie został znaleziony');

            const data = await response.json();
            setProduct(data);

            if (data.ingredients && data.ingredients.length > 0) {
                const composition = data.ingredients.map(s => s.name).join(', ');
                analyzeComposition(composition);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [id]);
    useEffect(() => {
        refreshProduct();
    }, [refreshProduct]);

    const analyzeComposition = async (composition) => {
        try {
            const response = await fetch('https://clea-client-backend-bjdna9f5eug4a9fd.polandcentral-01.azurewebsites.net/api/cosmetics/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ composition }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Błąd analizy');
            setAnalysisResult(data);
        } catch (error) {
            console.error('Błąd analizy:', error);
        }
    };

    useEffect(() => {
        if (user && user.favoriteProducts && product) {
            setIsFavorite(user.favoriteProducts.includes(product._id));
        }
    }, [user, product]);

    const toggleFavorite = async () => {
        if (!user || !token) {
            navigate('/login');
            return;
        }
        try {
            const method = isFavorite ? 'DELETE' : 'POST';
            const response = await fetch(`https://clea-client-backend-bjdna9f5eug4a9fd.polandcentral-01.azurewebsites.net/api/auth/favorites/${id}`, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (response.ok) {
                const data = await response.json();
                setIsFavorite(!isFavorite);
                updateUser({ ...user, favoriteProducts: data.favoriteProducts });
            }
        } catch (error) {
            console.error('Błąd aktualizacji ulubionych', error);
        }
    };

    if (loading) {
        return (
            <div className="clea">
                <div className="clea-page">
                    <CleaMenu onNavigate={handleNavigation} currentPath={location.pathname} />
                    <main className="product-details">
                        <div className="product-details__loading">Ładowanie...</div>
                    </main>
                </div>
                <Footer />
            </div>
        );
    }

    if (error) {
        return (
            <div className="clea">
                <div className="clea-page">
                    <CleaMenu onNavigate={handleNavigation} currentPath={location.pathname} />
                    <main className="product-details">
                        <div className="product-details__error">Błąd: {error}</div>
                    </main>
                </div>
                <Footer />
            </div>
        );
    }

    if (!product) return null;

    return (
        <div className="clea">
            <div className="clea-page">
                <CleaMenu onNavigate={handleNavigation} currentPath={location.pathname} />

                <main className="product-details">
                    <section className="product-details__hero">
                        <figure className="product-details__image-wrapper">
                            <button
                                className="product-details__favorite-btn"
                                onClick={toggleFavorite}
                                aria-label={isFavorite ? "Usuń z ulubionych" : "Dodaj do ulubionych"}
                            >
                                <img src={isFavorite ? heartFilled : heartEmpty} alt="" />
                            </button>
                            {product.imageData ? (
                                <img
                                    src={product.imageData}
                                    alt={product.name}
                                    className="product-details__image"
                                />
                            ) : (
                                <div className="product-details__no-image">Brak zdjęcia</div>
                            )}
                        </figure>

                        <article className="product-details__info">
                            <header>
                                <h1 className="product-details__name">{product.name}</h1>
                            </header>
                            <div className="product-details__rating" role="img" aria-label={`Ocena ${product.rating || 0} na 5`}>
                                {renderStars(product.rating || 0, product.reviews)}
                            </div>

                            <dl className="product-details__attributes">
                                <div className="product-details__attribute">
                                    <dt className="product-details__attribute-label">Marka:</dt>
                                    <dd className="product-details__attribute-value">{product.brand || '-'}</dd>
                                </div>
                                <div className="product-details__attribute">
                                    <dt className="product-details__attribute-label">Kategoria:</dt>
                                    <dd className="product-details__attribute-value">{product.category || '-'}</dd>
                                </div>
                                <div className="product-details__attribute">
                                    <dt className="product-details__attribute-label">Typ Skóry:</dt>
                                    <dd className="product-details__attribute-value">{product.skinType?.join(', ') || '-'}</dd>
                                </div>
                                <div className="product-details__attribute">
                                    <dt className="product-details__attribute-label">Przeznaczenie:</dt>
                                    <dd className="product-details__attribute-value">{product.purpose || '-'}</dd>
                                </div>
                            </dl>

                            {analysisResult && (
                                <aside className="product-details__summary">
                                    <h2 className="product-details__summary-title">
                                        Podsumowanie <span className="product-details__summary-title--highlight">składu</span>
                                    </h2>
                                    <div className="product-details__summary-charts">
                                        <figure className="product-details__chart-item">
                                            <CircleProgress
                                                current={analysisResult.safetyStats.bezpieczny}
                                                total={analysisResult.totalIngredients}
                                                size={100}
                                                color="#6C9535"
                                            />
                                            <figcaption className="product-details__chart-label">Bezpieczne</figcaption>
                                        </figure>
                                        <figure className="product-details__chart-item">
                                            <CircleProgress
                                                current={analysisResult.safetyStats.akceptowalny}
                                                total={analysisResult.totalIngredients}
                                                size={100}
                                                color="#D9BC19"
                                            />
                                            <figcaption className="product-details__chart-label">Akceptowalny</figcaption>
                                        </figure>
                                        <figure className="product-details__chart-item">
                                            <CircleProgress
                                                current={analysisResult.safetyStats['lepiej unikać']}
                                                total={analysisResult.totalIngredients}
                                                size={100}
                                                color="#D97319"
                                            />
                                            <figcaption className="product-details__chart-label">Lepiej unikać</figcaption>
                                        </figure>
                                        <figure className="product-details__chart-item">
                                            <CircleProgress
                                                current={analysisResult.safetyStats.niebezpieczny}
                                                total={analysisResult.totalIngredients}
                                                size={100}
                                                color="#CE0A0A"
                                            />
                                            <figcaption className="product-details__chart-label">Niebezpieczny</figcaption>
                                        </figure>
                                    </div>
                                </aside>
                            )}
                        </article>
                    </section>

                    <section className="product-details__description">
                        <header>
                            <h2 className="product-details__description-title">
                                Opis <span className="product-details__description-title--highlight">produktu</span>
                            </h2>
                        </header>
                        <p className="product-details__description-text">{product.description || 'Brak opisu.'}</p>
                    </section>

                    {analysisResult && (
                        <section className="product-details__analysis" aria-labelledby="analysis-title">
                            <header>
                                <h2 id="analysis-title" className="product-details__analysis-title">
                                    Analiza <span className="product-details__analysis-title--highlight">produktu</span>
                                </h2>
                            </header>

                            <div className="product-details__ingredients-header" role="row">
                                <div className="product-details__ingredients-header-main" role="rowgroup">
                                    <div className="product-details__ingredients-header-item" role="columnheader">Bezpieczeństwo</div>
                                    <div className="product-details__ingredients-header-item" role="columnheader">Składnik</div>
                                    <div className="product-details__ingredients-header-item" role="columnheader">Pochodzenie</div>
                                </div>
                                <div className="product-details__ingredients-header-description" role="rowgroup">
                                    <div className="product-details__ingredients-header-item" role="columnheader">Opis</div>
                                </div>
                            </div>

                            <ul className="product-details__ingredients-list">
                                {analysisResult.ingredients.map((ingredient) => (
                                    <li
                                        key={ingredient._id}
                                        className={`product-details__ingredient ${expandedIngredients[ingredient._id] ? 'product-details__ingredient--expanded' : ''}`}
                                    >
                                        <button
                                            className="product-details__ingredient-summary"
                                            onClick={() => toggleIngredientExpansion(ingredient._id)}
                                            aria-expanded={expandedIngredients[ingredient._id]}
                                            aria-controls={`ingredient-details-${ingredient._id}`}
                                        >
                                            <div className="product-details__ingredient-content">
                                                <div className="product-details__ingredient-safety">
                                                    <span
                                                        className="product-details__ingredient-badge"
                                                        style={{ backgroundColor: getSafetyColor(ingredient.safetyLevel) }}
                                                    >
                                                        {ingredient.safetyLevel}
                                                    </span>
                                                </div>
                                                <div className="product-details__ingredient-name">{ingredient.name}</div>
                                                <div className="product-details__ingredient-origin">{ingredient.origin}</div>
                                            </div>
                                            <img
                                                className="product-details__ingredient-arrow"
                                                src={arrowDown}
                                                alt=""
                                                aria-hidden="true"
                                            />
                                        </button>
                                        <div
                                            id={`ingredient-details-${ingredient._id}`}
                                            className="product-details__ingredient-details"
                                            role="region"
                                        >
                                            <hr className="product-details__ingredient-divider" aria-hidden="true" />
                                            <p className="product-details__ingredient-description">{ingredient.description}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>

                            {analysisResult.unidentifiedIngredients.length > 0 && (
                                <aside className="product-details__unidentified">
                                    <h3 className="product-details__unidentified-header">
                                        Nie znaleziono:
                                        <span className="product-details__unidentified-count">
                                            {' '}{analysisResult.safetyStats.niezidentyfikowany}
                                        </span>
                                        /{analysisResult.totalIngredients}
                                    </h3>
                                    <ul className="product-details__unidentified-list">
                                        {analysisResult.unidentifiedIngredients.map((ingredientName, index) => (
                                            <li key={`unidentified-${index}`} className="product-details__unidentified-item">
                                                {ingredientName}
                                            </li>
                                        ))}
                                    </ul>
                                </aside>
                            )}
                        </section>
                    )}
                    <ProductReviews
                        productId={product._id}
                        reviews={product.reviews}
                        user={user}
                        token={token}
                        onReviewAdded={refreshProduct}
                    />
                </main>
            </div>
            <Footer />
        </div>
    );
};