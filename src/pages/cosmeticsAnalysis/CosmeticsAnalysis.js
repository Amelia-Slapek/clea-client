import "./CosmeticsAnalysis.scss";
import cosmetics from "../../assets/COSMETICSAN.png";
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import CleaMenu from '../../styles/components/menu/Menu';
import Footer from '../../styles/components/footer/Footer';
import CircleProgress from "../../styles/components/circle/Circle";
import arrowDown from "../../assets/ARROWDOWN.svg";
export const CosmeticsAnalysisPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [composition, setComposition] = useState("");
    const [analysisResult, setAnalysisResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [expandedIngredients, setExpandedIngredients] = useState({});

    const handleNavigation = (path) => {
        navigate(path);
    };

    const handleAnalyze = async () => {
        if (!composition.trim()) {
            setError("Proszę wprowadzić skład kosmetyku");
            return;
        }

        setLoading(true);
        setError("");
        setAnalysisResult(null);

        try {
            const response = await fetch('https://clea-client-backend-bjdna9f5eug4a9fd.polandcentral-01.azurewebsites.net/api/cosmetics/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ composition: composition.trim() }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Błąd podczas analizy');
            }

            setAnalysisResult(data);
            setExpandedIngredients(new Set());
        } catch (error) {
            console.error('Błąd analizy:', error);
            setError(error.message || 'Wystąpił błąd podczas analizy składników');
        } finally {
            setLoading(false);
        }
    };

    const toggleIngredientExpansion = (ingredientId) => {
        setExpandedIngredients(prev => ({
            ...prev,
            [ingredientId]: !prev[ingredientId]
        }));
    };
    const getSafetyColor = (level) => {
        switch (level) {
            case 'bezpieczny':
                return '#6C9535';
            case 'akceptowalny':
                return '#D9BC19';
            case 'lepiej unikać':
                return '#D97319';
            case 'niebezpieczny':
                return '#CE0A0A';
            default:
                return '#4B4B4B';
        }
    };

    return (
        <div className="clea">
            <div className="clea-page">
                <CleaMenu
                    onNavigate={handleNavigation}
                    currentPath={location.pathname}
                />
                <main className="analysis-main">
                    <section className="analysis-image">
                        <img className="analysis-image-photo" src={cosmetics} alt="cosmetics" />
                    </section>
                    <section className="analysis-form">
                        <header className="analysis-form-header">
                            <h1 className="analysis-form-header-title">
                                Rozpocznij{" "}
                                <span className="analysis-form-header-title-highlight">
                                    analizę
                                </span>
                            </h1>
                        </header>
                        <div className="analysis-form-description">
                            <p className="analysis-form-description-text">
                                Wyszukaj kosmetyki idealne dla siebie, korzystając z analizy
                                składu! Wystarczy wpisać lub wkleić listę składników ze swojego
                                kosmetyku, aby odkryć alternatywne produkty spełniające Twoje
                                potrzeby.
                            </p>
                        </div>
                        <textarea
                            className="analysis-form-input"
                            placeholder="Podaj skład kosmetyku w formie listy składników oddzielonych przecinkami"
                            value={composition}
                            onChange={(e) => setComposition(e.target.value)}
                            aria-label="Składniki kosmetyku"
                        />
                        {error && (
                            <div className="analysis-form-error" role="alert">
                                {error}
                            </div>
                        )}
                        <button
                            className="analysis-form-button"
                            onClick={handleAnalyze}
                            disabled={loading}
                            aria-describedby={error ? "error-message" : undefined}
                        >
                            {loading ? 'Analizuję...' : 'Analizuj'}
                        </button>
                    </section>
                </main>

                {analysisResult && (
                    <section className="results" aria-label="Wyniki analizy">
                        <div className="results-summary">
                            <header className="results-summary-info">
                                <h2 className="results-summary-info-title">Podsumowanie</h2>
                                <p className="results-summary-info-subtitle">składu</p>
                                <p className="results-summary-info-stats">
                                    Znaleziono: <span className="results-summary-info-stats-count">
                                        {analysisResult.identifiedIngredients ?? (analysisResult.totalIngredients - (analysisResult.safetyStats?.niezidentyfikowany || 0))}
                                    </span> / {analysisResult.totalIngredients}
                                </p>
                            </header>
                            <div className="results-summary-charts">
                                <div className="results-summary-charts-item results-summary-charts-item--safe">
                                    <CircleProgress current={analysisResult.safetyStats.bezpieczny} total={analysisResult.totalIngredients} size={128} color="#6C9535" />
                                    <div className="results-summary-charts-item-label">Bezpieczne</div>
                                </div>
                                <div className="results-summary-charts-item results-summary-charts-item--acceptable">
                                    <CircleProgress current={analysisResult.safetyStats.akceptowalny} total={analysisResult.totalIngredients} size={128} color="#D9BC19" />
                                    <div className="results-summary-charts-item-label">Akceptowalny</div>
                                </div>
                                <div className="results-summary-charts-item results-summary-charts-item--caution">
                                    <CircleProgress current={analysisResult.safetyStats['lepiej unikać']} total={analysisResult.totalIngredients} size={128} color="#D97319" />
                                    <div className="results-summary-charts-item-label">Lepiej unikać</div>
                                </div>
                                <div className="results-summary-charts-item results-summary-charts-item--dangerous">
                                    <CircleProgress current={analysisResult.safetyStats.niebezpieczny} total={analysisResult.totalIngredients} size={128} color="#CE0A0A" />
                                    <div className="results-summary-charts-item-label">Niebezpieczny</div>
                                </div>
                            </div>
                        </div>

                        <div className="ingredients">
                            <header className="ingredients-header">
                                <div className="ingredients-header-main">
                                    <div className="ingredients-header-main-item">Bezpieczeństwo</div>
                                    <div className="ingredients-header-main-item">Składnik</div>
                                    <div className="ingredients-header-main-item">Pochodzenie</div>
                                </div>
                                <div className="ingredients-header-description">
                                    <div className="ingredients-header-description-item">Opis</div>
                                </div>
                            </header>

                            <div className="ingredients-list">
                                {analysisResult.ingredients.map((ingredient) => (
                                    <article key={ingredient._id} className={`ingredients-list-item ${expandedIngredients[ingredient._id] ? 'ingredients-list-item--expanded' : ''}`}>
                                        <div
                                            className="ingredients-list-item-summary"
                                            onClick={() => toggleIngredientExpansion(ingredient._id)}
                                            role="button"
                                            tabIndex={0}
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                    toggleIngredientExpansion(ingredient._id);
                                                }
                                            }}
                                            aria-expanded={expandedIngredients[ingredient._id]}
                                            aria-controls={`ingredient-details-${ingredient._id}`}
                                        >
                                            <div className="ingredients-list-item-summary-content">
                                                <div className="ingredients-list-item-summary-content-safety">
                                                    <div
                                                        className="ingredients-list-item-summary-content-safety-badge"
                                                        style={{ backgroundColor: getSafetyColor(ingredient.safetyLevel) }}
                                                    >
                                                        {ingredient.safetyLevel}
                                                    </div>
                                                </div>
                                                <div className="ingredients-list-item-summary-content-name">
                                                    {ingredient.name}
                                                </div>
                                                <div className="ingredients-list-item-summary-content-origin">
                                                    {ingredient.origin}
                                                </div>
                                            </div>
                                            <img
                                                className="ingredients-list-item-summary-arrow"
                                                src={arrowDown}
                                                alt="arrow"
                                            />
                                        </div>

                                        <div
                                            id={`ingredient-details-${ingredient._id}`}
                                            className="ingredients-list-item-details"
                                        >
                                            <div className="ingredients-list-item-details-description">
                                                {ingredient.description}
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>

                            {analysisResult.unidentifiedIngredients.length > 0 && (
                                <>

                                    <header className="unidentified-header" >Nie znaleziono:<span className="unidentified-header-count"> {analysisResult.safetyStats.niezidentyfikowany}</span>/{analysisResult.totalIngredients}</header>

                                    {analysisResult.unidentifiedIngredients.map((ingredientName, index) => (
                                        <div key={`unidentified-${index}`} className="unidentified-ingredient-item">
                                            <div className="unidentified-ingredient-item-name">
                                                {ingredientName}
                                            </div>
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>
                    </section>
                )}
            </div>
            <Footer />
        </div>
    );
};