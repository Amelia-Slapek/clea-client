import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import CleaMenu from '../../styles/components/menu/Menu';
import Footer from '../../styles/components/footer/Footer';
import './SkinCare.scss';
import plusIcon from '../../assets/PLUS.svg';
import minusIcon from '../../assets/MINUS.svg';
import warningIcon from '../../assets/WARNING.svg';
import DropdownList from '../../styles/components/dropdownList/DropdownList';
import SearchBar from '../../styles/components/searchBar/SearchBar';

export const SkinCarePage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, token, loading: authLoading, isAuthenticated } = useAuth();

    const [timeOfDay, setTimeOfDay] = useState('');
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [showAddProductModal, setShowAddProductModal] = useState(false);

    const [showLoginModal, setShowLoginModal] = useState(false);

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [compatibilityReport, setCompatibilityReport] = useState(null);
    const [loading, setLoading] = useState(false);
    const [routineName, setRoutineName] = useState('');
    const [routineDescription, setRoutineDescription] = useState('');
    const [editingRoutineId, setEditingRoutineId] = useState(null);

    const handleNavigation = (path) => {
        navigate(path);
    };
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            setShowLoginModal(true);
        } else {
            setShowLoginModal(false);
        }
    }, [authLoading, isAuthenticated]);

    const checkCompatibility = useCallback(async () => {
        if (!user || !token || selectedProducts.length < 2) return;

        setLoading(true);
        try {
            const productIds = selectedProducts.map(p => p._id);
            const response = await fetch(
                'https://clea-client-backend-bjdna9f5eug4a9fd.polandcentral-01.azurewebsites.net/api/products/check-compatibility',
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ productIds })
                }
            );

            if (response.ok) {
                const data = await response.json();
                setCompatibilityReport(data);
            }
        } catch (error) {
            console.error('Błąd analizy:', error);
        } finally {
            setLoading(false);
        }
    }, [user, token, selectedProducts]);
    useEffect(() => {
        if (location.state?.editRoutine) {
            const routine = location.state.editRoutine;
            setEditingRoutineId(routine._id);
            setRoutineName(routine.name);
            setRoutineDescription(routine.description || '');
            setTimeOfDay(routine.timeOfDay);

            if (routine.products && routine.products.length > 0) {
                setSelectedProducts(routine.products);
            }
        }
    }, [location.state]);

    useEffect(() => {
        if (selectedProducts.length < 2) {
            setCompatibilityReport(null);
            return;
        }

        const timeoutId = setTimeout(() => {
            checkCompatibility();
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [selectedProducts, checkCompatibility]);

    const handleSearchProducts = async (query) => {
        setSearchQuery(query);

        if (!query || query.trim().length === 0) {
            setSearchResults([]);
            return;
        }

        try {
            const response = await fetch(`https://clea-client-backend-bjdna9f5eug4a9fd.polandcentral-01.azurewebsites.net/api/products/search?q=${encodeURIComponent(query)}`);

            if (response.ok) {
                const data = await response.json();
                setSearchResults(data.products || []);
            } else {
                console.error("Błąd wyszukiwania:", response.status);
            }
        } catch (error) {
            console.error('Błąd połączenia:', error);
        }
    };

    const handleAddProduct = (product) => {
        if (!selectedProducts.find(p => p._id === product._id)) {
            setSelectedProducts([...selectedProducts, product]);
            setShowAddProductModal(false);
            setSearchQuery('');
            setSearchResults([]);
        }
    };

    const handleRemoveProduct = (productId) => {
        setSelectedProducts(selectedProducts.filter(p => p._id !== productId));
    };

    const handleSaveRoutine = async () => {
        if (!user || !token) {
            setShowLoginModal(true);
            return;
        }
        if (!routineName.trim()) { alert('Podaj nazwę pielęgnacji'); return; }
        if (!timeOfDay) { alert('Wybierz porę dnia'); return; }
        if (selectedProducts.length === 0) { alert('Dodaj min. 1 produkt'); return; }

        try {
            const url = editingRoutineId
                ? `https://clea-client-backend-bjdna9f5eug4a9fd.polandcentral-01.azurewebsites.net/api/skincare-routines/${editingRoutineId}`
                : 'https://clea-client-backend-bjdna9f5eug4a9fd.polandcentral-01.azurewebsites.net/api/skincare-routines';
            const method = editingRoutineId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: routineName,
                    description: routineDescription,
                    timeOfDay,
                    products: selectedProducts.map(p => p._id)
                })
            });

            if (response.ok) {
                alert('Zapisano pielęgnację!');
                navigate('/profile/pielęgnacje');
            } else {
                alert('Błąd zapisu');
            }
        } catch (error) {
            alert('Błąd serwera');
        }
    };

    const timeOptions = ['Pora dnia', 'Na dzień', 'Na noc'];
    const handleTimeChange = (selected) => {
        setTimeOfDay((!selected || selected === 'Pora dnia') ? '' : selected);
    };

    const getConflictColor = (level) => {
        switch (level) {
            case 'lekki konflikt': return '#D9BC19';
            case 'silny konflikt': return '#D97319';
            case 'zakazany': return '#CE0A0A';
            default: return '#6C9535';
        }
    };

    const hasIssues = compatibilityReport && (
        (compatibilityReport.conflicts && compatibilityReport.conflicts.length > 0) ||
        (compatibilityReport.allergenWarnings && compatibilityReport.allergenWarnings.length > 0)
    );

    if (authLoading) return <div className="clea"><CleaMenu /><main style={{ padding: '2rem', textAlign: 'center' }}>Ładowanie...</main><Footer /></div>;

    return (
        <div className="clea">
            <div className="clea-page">
                <CleaMenu onNavigate={handleNavigation} currentPath={location.pathname} />
                <main className="skincare">
                    <div className="skincare__container">
                        <section className="skincare__builder">
                            <header className="skincare__builder-header">
                                <h1 className="skincare__builder-title">{editingRoutineId ? 'Edytuj Pielęgnację' : 'Kreator Pielęgnacji'}</h1>
                            </header>
                            <div className="skincare__builder-controls">
                                <div className="skincare__builder-time">
                                    <DropdownList options={timeOptions} selected={timeOfDay || 'Pora dnia'} onSelect={handleTimeChange} defaultText="Wybierz porę dnia" />
                                </div>
                                <button className="skincare__builder-add-btn" onClick={() => setShowAddProductModal(true)}>
                                    <img src={plusIcon} alt="" className="skincare__builder-add-icon" />
                                    <span className="skincare__builder-add-text">Dodaj produkt</span>
                                </button>
                            </div>
                            <div className="skincare__builder-list">
                                {selectedProducts.map((product, index) => (
                                    <article key={product._id} className="skincare-step">
                                        <header className="skincare-step__header"><span className="skincare-step__number">Krok {index + 1}</span></header>
                                        <div className="skincare-step__body">
                                            <figure className="skincare-step__image-wrapper">
                                                {product.imageData ? <img src={product.imageData} alt={product.name} className="skincare-step__img" /> : <div>Brak</div>}
                                            </figure>
                                            <div className="skincare-step__info">
                                                <h4 className="skincare-step__product-name">{product.name}</h4>
                                                <p className="skincare-step__ingredients">
                                                    {product.ingredients?.length > 0 ? product.ingredients.map(s => s.name).join(' • ') : 'Brak info'}
                                                </p>
                                            </div>
                                            <button className="skincare-step__remove-btn" onClick={() => handleRemoveProduct(product._id)}>
                                                <img src={minusIcon} alt="Usuń" className="skincare-step__remove-icon" />
                                            </button>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </section>

                        <section className="skincare__report">
                            <header className="skincare__report-header"><h2 className="skincare__report-title">Kompatybilność</h2></header>
                            {selectedProducts.length < 2 ? (
                                <p className="skincare__report-status skincare__report-status--empty">Dodaj min. 2 produkty...</p>
                            ) : loading ? (
                                <p className="skincare__report-status skincare__report-status--loading">Analizuję...</p>
                            ) : compatibilityReport ? (
                                <div className="skincare__report-content">
                                    <div className="skincare-report__card">
                                        <h3 className="skincare-report__card-title">Analiza</h3>
                                        {compatibilityReport.allergenWarnings?.length > 0 && (
                                            <div className="skincare-report__alert">
                                                <img src={warningIcon} alt="!" />
                                                <div>
                                                    <h4 className="skincare-report__alert--alergen">Wykrytolergeny!</h4>
                                                    {compatibilityReport.allergenWarnings.map((w, i) => <p className="skincare-report__alert--name" key={i}><strong>{w.ingredientName}</strong> w {w.productName}</p>)}
                                                </div>
                                            </div>
                                        )}
                                        {compatibilityReport.conflicts?.length > 0 ? (
                                            compatibilityReport.conflicts.map((c, i) => {
                                                const idx1 = selectedProducts.findIndex(p => p.name === c.product1) + 1;
                                                const idx2 = selectedProducts.findIndex(p => p.name === c.product2) + 1;

                                                return (
                                                    <article key={i} className="skincare-report__conflict">
                                                        <img src={warningIcon} alt="!" />
                                                        <div className="skincare-report__conflict-info">
                                                            <p
                                                                className="skincare-report__conflict-pair"
                                                                style={{ color: getConflictColor(c.conflictLevel) }}
                                                            >
                                                                {c.ingredient1} & {c.ingredient2}
                                                            </p>
                                                            <p className="skincare-report__conflict-desc">{c.description}</p>
                                                            <p className="skincare-report__conflict-steps">
                                                                Krok {idx1 || '?'} + Krok {idx2 || '?'}
                                                            </p>
                                                        </div>
                                                    </article>
                                                );
                                            })
                                        ) : !hasIssues && <div className="skincare-report__safe"><p>Bezpieczne połączenie.</p></div>}
                                    </div>
                                    <div className="skincare-report__form">
                                        <input type="text" placeholder="Nazwa pielęgnacji" value={routineName} onChange={(e) => setRoutineName(e.target.value)} className="skincare-report__input" />
                                        <textarea placeholder="Opis" value={routineDescription} onChange={(e) => setRoutineDescription(e.target.value)} className="skincare-report__textarea" />
                                        <button className="skincare-report__save-btn" onClick={handleSaveRoutine}>{editingRoutineId ? 'Aktualizuj' : 'Zapisz'}</button>
                                    </div>
                                </div>
                            ) : null}
                        </section>
                    </div>
                </main>
            </div>

            {showLoginModal && (
                <div className="skincare-modal">
                    <div className="skincare-modal__content" style={{ textAlign: 'center', maxWidth: '400px' }}>
                        <h3 className="skincare-modal__title">Dostępne tylko dla zalogowanych</h3>
                        <p style={{ marginBottom: '1.5rem' }}>
                            Aby stworzyć i zapisać swoją rutynę pielęgnacyjną, musisz się zalogować.
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <button
                                className="skincare__builder-add-btn"
                                style={{ height: '50px', justifyContent: 'center' }}
                                onClick={() => navigate('/login', { state: { from: location } })}
                            >
                                <span className="skincare__builder-add-text">Zaloguj się</span>
                            </button>
                            <button
                                className="skincare-modal__close"
                                style={{ marginTop: 0 }}
                                onClick={() => navigate('/')}
                            >
                                Powrót do strony głównej
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showAddProductModal && (
                <div className="skincare-modal" onClick={() => setShowAddProductModal(false)}>
                    <div className="skincare-modal__content" onClick={(e) => e.stopPropagation()}>
                        <h3 className="skincare-modal__title">Dodaj produkt</h3>
                        <SearchBar placeholder="Szukaj..." value={searchQuery} onChange={(e) => handleSearchProducts(e.target.value)} className="skincare-modal__search" />
                        <div className="skincare-modal__results">
                            {searchResults.map(p => (
                                <div key={p._id} className="skincare-modal__item" onClick={() => handleAddProduct(p)}>
                                    <figure className="skincare-modal__item-img-wrapper">
                                        {p.imageData ? <img src={p.imageData} alt="" className="skincare-modal__item-img" /> : <div>Img</div>}
                                    </figure>
                                    <div className="skincare-modal__item-info">
                                        <p className="skincare-modal__item-name">{p.name}</p>
                                        <p className="skincare-modal__item-cat">{p.brand}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="skincare-modal__close" onClick={() => setShowAddProductModal(false)}>Anuluj</button>
                    </div>
                </div>
            )}
            <Footer />
        </div>
    );
};