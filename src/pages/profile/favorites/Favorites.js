import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import './Favorites.scss';
import CleaMenu from '../../../styles/components/menu/Menu';
import Footer from '../../../styles/components/footer/Footer';
import ProfileSidebar from '../../../styles/components/profileSidebar/ProfileSidebar';
import ProductCard from '../../../styles/components/productCard/ProductCard';
import DropdownList from '../../../styles/components/dropdownList/DropdownList';
import SearchBar from '../../../styles/components/searchBar/SearchBar';

const CATEGORIES = [
    'Pielęgnacja twarzy',
    'Makijaż',
    'Ciało',
    'Dłonie',
    'Stopy',
    'Włosy'
];

const SORT_OPTIONS = {
    'Data dodania: malejąco': 'desc',
    'Data dodania: rosnąco': 'asc'
};

const SORT_LABELS = Object.keys(SORT_OPTIONS);

export const ProfileFavorites = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, token, updateUser, loading: authLoading, isAuthenticated } = useAuth();

    const [favoriteProducts, setFavoriteProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [sortOrder, setSortOrder] = useState('desc');
    const [sortLabel, setSortLabel] = useState('Data dodania: malejąco');

    const handleNavigation = (path) => {
        navigate(path);
    };

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate('/login');
        }
    }, [authLoading, isAuthenticated, navigate]);

    useEffect(() => {
        if (user && user.favoriteProducts) {
            loadFavoriteProducts(user.favoriteProducts);
        } else {
            setLoading(false);
        }
    }, [user]);

    // In src/components/Favorites.js

    const loadFavoriteProducts = async (productIds) => {
        if (!productIds || productIds.length === 0) {
            setFavoriteProducts([]);
            setFilteredProducts([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError('');

        try {
            const actualProductIds = productIds.map(item => {
                if (typeof item === 'object' && item._id) {
                    return item._id.toString();
                }
                return item.toString();
            });
            const response = await fetch('https://clea-client-backend-bjdna9f5eug4a9fd.polandcentral-01.azurewebsites.net/api/products?limit=1000');

            if (!response.ok) {
                throw new Error('Nie udało się pobrać produktów');
            }

            const data = await response.json();
            const allProductsList = data.products || [];

            const favorites = allProductsList.filter(product =>
                actualProductIds.includes(product._id.toString())
            );

            setFavoriteProducts(favorites);
            setFilteredProducts(favorites);
        } catch (error) {
            console.error('Błąd ładowania ulubionych produktów:', error);
            setError('Nie udało się załadować ulubionych produktów');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let filtered = [...favoriteProducts];

        if (searchQuery.trim()) {
            filtered = filtered.filter(product =>
                product.nazwa.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (selectedCategory && selectedCategory !== 'Wszystkie kategorie') {
            filtered = filtered.filter(product => product.kategoria === selectedCategory);
        }

        if (sortOrder === 'asc') {
            filtered.sort((a, b) => {
                const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
                const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
                return dateA - dateB;
            });
        } else {
            filtered.sort((a, b) => {
                const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
                const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
                return dateB - dateA;
            });
        }

        setFilteredProducts(filtered);
    }, [searchQuery, selectedCategory, sortOrder, favoriteProducts]);

    const handleRemoveFavorite = async (productId) => {
        if (!token) return;

        try {
            const response = await fetch(`https://clea-client-backend-bjdna9f5eug4a9fd.polandcentral-01.azurewebsites.net/api/auth/favorites/${productId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();

                setFavoriteProducts(prev => prev.filter(product => product._id !== productId));

                updateUser({
                    ...user,
                    favoriteProducts: data.favoriteProducts
                });
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Nie udało się usunąć produktu z ulubionych');
            }
        } catch (error) {
            console.error('Błąd usuwania z ulubionych:', error);
            setError('Wystąpił błąd podczas usuwania produktu');
        }
    };

    const handleCategoryChange = (selected) => {
        if (!selected || selected === 'Wszystkie kategorie') {
            setSelectedCategory('');
        } else {
            setSelectedCategory(selected);
        }
    };

    const handleSortChange = (selectedLabel) => {
        if (selectedLabel && SORT_OPTIONS[selectedLabel]) {
            setSortLabel(selectedLabel);
            setSortOrder(SORT_OPTIONS[selectedLabel]);
        }
    };

    if (authLoading) {
        return (
            <div className="clea">
                <div className="clea-page">
                    <CleaMenu onNavigate={handleNavigation} currentPath={location.pathname} />
                    <main className="profile-layout">
                        <ProfileSidebar
                            user={user}
                            currentPath={location.pathname}
                            onNavigate={handleNavigation}
                        />
                        <div className="profile-layout-content">
                            <div style={{ textAlign: 'center', padding: '2rem' }}>
                                <p>Ładowanie...</p>
                            </div>
                        </div>
                    </main>
                </div>
                <Footer />
            </div>
        );
    }

    if (!user) {
        return null;
    }

    const categoryOptions = ['Wszystkie kategorie', ...CATEGORIES];

    return (
        <div className="clea">
            <div className="clea-page">
                <CleaMenu onNavigate={handleNavigation} currentPath={location.pathname} />

                <main className="profile-layout">
                    <ProfileSidebar
                        user={user}
                        currentPath={location.pathname}
                        onNavigate={handleNavigation}
                    />

                    <div className="profile-layout-content">
                        <div className="profile-favorites">

                            <div className="profile-favorites__filters">
                                <SearchBar
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Wyszukaj po nazwie..."
                                />

                                <div className="profile-favorites__filter-item">
                                    <DropdownList
                                        options={categoryOptions}
                                        selected={selectedCategory || 'Wszystkie kategorie'}
                                        onSelect={handleCategoryChange}
                                        defaultText="Wybierz kategorię"
                                    />
                                </div>

                                <div className="profile-favorites__filter-item">
                                    <DropdownList
                                        options={SORT_LABELS}
                                        selected={sortLabel}
                                        onSelect={handleSortChange}
                                        defaultText="Sortowanie"
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="profile-favorites__error">
                                    {error}
                                </div>
                            )}

                            <div className="profile-favorites__products">
                                {loading ? (
                                    <p className="profile-favorites__empty">Ładowanie...</p>
                                ) : filteredProducts.length === 0 ? (
                                    <p className="profile-favorites__empty">
                                        {searchQuery || selectedCategory
                                            ? 'Nie znaleziono produktów spełniających kryteria'
                                            : 'Nie masz jeszcze ulubionych produktów'}
                                    </p>
                                ) : (
                                    <div className="profile-favorites__grid">
                                        {filteredProducts.map((product) => (
                                            <ProductCard
                                                key={product._id}
                                                product={product}
                                                isFavorite={true}
                                                onToggleFavorite={handleRemoveFavorite}
                                                showButton={true}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
            <Footer />
        </div>
    );
};