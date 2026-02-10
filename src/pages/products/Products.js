import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import CleaMenu from '../../styles/components/menu/Menu';
import Footer from '../../styles/components/footer/Footer';
import './Products.scss';
import ProductCard from '../../styles/components/productCard/ProductCard';
import DropdownList from '../../styles/components/dropdownList/DropdownList';
import SearchBar from '../../styles/components/searchBar/SearchBar';

export const ProductsPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, token, updateUser } = useAuth();

    const KATEGORIE_PODKATEGORIE = {
        'Pielęgnacja twarzy': ['Krem do twarzy', 'Serum', 'Oczyszczanie', 'Tonizacja twarzy', 'Maska', 'Peeling', 'Krem pod oczy', 'Esencja', 'Olejek do twarzy'],
        'Makijaż': ['Podkład', 'Baza pod makijaż', 'Róż', 'Bronzer', 'Puder', 'Korektor', 'Cień do powiek', 'Tusz do rzęs', 'Pomadka'],
        'Ciało': ['Balsam do ciała', 'Peeling do ciała', 'Żel pod prysznic', 'Olejek do ciała', 'Mydło', 'Mleczko do ciała', 'Masło do ciała'],
        'Dłonie': ['Krem do rąk', 'Serum do rąk', 'Peeling do rąk', 'Maska do rąk', 'Odżywka do paznokci'],
        'Stopy': ['Krem do stóp', 'Peeling do stóp', 'Maska do stóp', 'Dezodorant do stóp', 'Serum do stóp'],
        'Włosy': ['Szampon', 'Odżywka do włosów', 'Maska do włosów', 'Serum do włosów', 'Olejek do włosów', 'Peeling skóry głowy', 'Tonik do włosów', 'Lakier do włosów', 'Pianka do włosów']
    };

    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [favorites, setFavorites] = useState([]);

    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedSubcategory, setSelectedSubcategory] = useState('');
    const [selectedBrand, setSelectedBrand] = useState('');
    const [selectedSkinType, setSelectedSkinType] = useState('');
    const [selectedPurpose, setSelectedPurpose] = useState('');
    const [availableBrands, setAvailableBrands] = useState([]);

    const handleNavigation = (path) => navigate(path);

    useEffect(() => {
        if (user && user.favoriteProducts) {
            setFavorites(user.favoriteProducts);
        }
    }, [user]);
    const fetchProducts = useCallback(async (pageNum = 1, shouldAppend = false) => {
        try {
            if (shouldAppend) setLoadingMore(true);
            else setLoading(true);

            const response = await fetch(`https://clea-client-backend-bjdna9f5eug4a9fd.polandcentral-01.azurewebsites.net/api/products?page=${pageNum}&limit=12`);
            const data = await response.json();

            if (response.ok) {
                const newProducts = data.products || [];

                setProducts(prev => shouldAppend ? [...prev, ...newProducts] : newProducts);
                setHasMore(data.hasMore);

                if (pageNum === 1) {
                    const brands = [...new Set(newProducts.map(p => p.brand).filter(Boolean))];
                    setAvailableBrands(brands.sort());
                }
            }
        } catch (error) {
            console.error('Błąd pobierania produktów:', error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, []);

    useEffect(() => {
        fetchProducts(1, false);
    }, [fetchProducts]);

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchProducts(nextPage, true);
    };

    useEffect(() => {
        let filtered = [...products];
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(p =>
                (p.name && p.name.toLowerCase().includes(query)) ||
                (p.brand && p.brand.toLowerCase().includes(query))
            );
        }

        if (selectedCategory) filtered = filtered.filter(p => p.category === selectedCategory);
        if (selectedSubcategory) filtered = filtered.filter(p => p.subcategory === selectedSubcategory);
        if (selectedBrand) filtered = filtered.filter(p => p.brand === selectedBrand);
        if (selectedSkinType) filtered = filtered.filter(p => p.skinType && p.skinType.includes(selectedSkinType));
        if (selectedPurpose) filtered = filtered.filter(p => p.purpose === selectedPurpose);

        setFilteredProducts(filtered);
    }, [searchQuery, selectedCategory, selectedSubcategory, selectedBrand, selectedSkinType, selectedPurpose, products]);

    const toggleFavorite = async (productId) => {
        if (!user || !token) {
            navigate('/login');
            return;
        }

        const isFavorite = favorites.includes(productId);
        try {
            const method = isFavorite ? 'DELETE' : 'POST';
            const response = await fetch(`https://clea-client-backend-bjdna9f5eug4a9fd.polandcentral-01.azurewebsites.net/api/auth/favorites/${productId}`, {
                method: method,
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
            });

            if (response.ok) {
                const data = await response.json();
                setFavorites(data.favoriteProducts);
                updateUser({ ...user, favoriteProducts: data.favoriteProducts });
            }
        } catch (error) {
            console.error('Błąd obsługi ulubionych:', error);
        }
    };

    const handleCategorySelect = (category, subcategory) => {
        setSelectedCategory(category);
        setSelectedSubcategory(subcategory);
    };

    const handleBrandChange = (selected) => {
        setSelectedBrand(selected === 'Wszystkie marki' ? '' : selected);
    };

    const handleSkinTypeChange = (selected) => {
        setSelectedSkinType(selected === 'Typ skóry' ? '' : selected);
    };

    const handlePurposeChange = (selected) => {
        setSelectedPurpose(selected === 'Przeznaczenie' ? '' : selected);
    };

    const typySkoryOptions = ['Typ skóry', 'normalna', 'sucha', 'tłusta', 'mieszana', 'wrażliwa', 'dojrzała', 'problematyczna'];
    const przeznaczeniaOptions = ['Przeznaczenie', 'na dzień', 'na noc', 'cały dzień'];
    const brandOptions = ['Wszystkie marki', ...availableBrands];

    return (
        <div className="clea">
            <div className="clea-page">
                <CleaMenu onNavigate={handleNavigation} currentPath={location.pathname} />

                <main className="products-page">
                    <div className="products-page__container">

                        <aside className="products-page__sidebar">
                            <h2 className="products-page__sidebar-header">Filtry wyszukiwania</h2>
                            <section className="products-page__filter-group">
                                <SearchBar
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Wpisz nazwę produktu..."
                                />
                            </section>

                            <section className="products-page__filter-group">
                                <DropdownList
                                    data={KATEGORIE_PODKATEGORIE}
                                    onSelect={handleCategorySelect}
                                />
                            </section>
                        </aside>

                        <section className="products-page__main-content">
                            <header className="products-page__filters-top">
                                <div className="products-page__dropdown-wrapper">
                                    <DropdownList
                                        options={brandOptions}
                                        selected={selectedBrand || 'Wszystkie marki'}
                                        onSelect={handleBrandChange}
                                        defaultText="Wybierz markę"
                                    />
                                </div>
                                <div className="products-page__dropdown-wrapper">
                                    <DropdownList
                                        options={typySkoryOptions}
                                        selected={selectedSkinType || 'Typ skóry'}
                                        onSelect={handleSkinTypeChange}
                                        defaultText="Wybierz typ skóry"
                                    />
                                </div>
                                <div className="products-page__dropdown-wrapper">
                                    <DropdownList
                                        options={przeznaczeniaOptions}
                                        selected={selectedPurpose || 'Przeznaczenie'}
                                        onSelect={handlePurposeChange}
                                        defaultText="Wybierz przeznaczenie"
                                    />
                                </div>
                            </header>

                            {loading && page === 1 ? (
                                <div className="products-page__status-msg products-page__status-msg--loading">
                                    Ładowanie produktów...
                                </div>
                            ) : filteredProducts.length === 0 ? (
                                <div className="products-page__status-msg">
                                    Nie znaleziono produktów spełniających kryteria.
                                    Spróbuj zmienić filtry lub wyszukiwaną frazę.
                                </div>
                            ) : (
                                <>
                                    <div className="products-page__grid">
                                        {filteredProducts.map((product) => (
                                            <ProductCard
                                                key={product._id}
                                                product={product}
                                                isFavorite={favorites.includes(product._id)}
                                                onToggleFavorite={toggleFavorite}
                                                showButton={true}
                                            />
                                        ))}
                                    </div>

                                    {hasMore && (
                                        <div className="products-page__load-more-container">
                                            <button
                                                className="products-page__load-more-btn"
                                                onClick={handleLoadMore}
                                                disabled={loadingMore}
                                            >
                                                {loadingMore ? 'Ładowanie...' : 'Załaduj więcej'}
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </section>
                    </div>
                </main>
            </div>
            <Footer />
        </div>
    );
};