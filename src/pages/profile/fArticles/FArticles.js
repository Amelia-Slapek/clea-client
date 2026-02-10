import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import './FArticles.scss';
import CleaMenu from '../../../styles/components/menu/Menu';
import Footer from '../../../styles/components/footer/Footer';
import ProfileSidebar from '../../../styles/components/profileSidebar/ProfileSidebar';
import ArticleCard from '../../../styles/components/articleCard/ArticleCard';
import DropdownList from '../../../styles/components/dropdownList/DropdownList';
import SearchBar from '../../../styles/components/searchBar/SearchBar';

const CATEGORIES = ['analiza', 'trendy', 'recenzje', 'bezpieczeństwo'];

const SORT_OPTIONS = {
    'Data dodania: malejąco': 'desc',
    'Data dodania: rosnąco': 'asc'
};

const SORT_LABELS = Object.keys(SORT_OPTIONS);

export const ProfileArticles = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, token, updateUser, loading: authLoading, isAuthenticated } = useAuth();

    const [savedArticles, setSavedArticles] = useState([]);
    const [filteredArticles, setFilteredArticles] = useState([]);
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
        if (user && user.savedArticles) {
            loadSavedArticles(user.savedArticles);
        } else {
            setLoading(false);
        }
    }, [user]);

    const loadSavedArticles = async (articleIds) => {
        if (!articleIds || articleIds.length === 0) {
            setSavedArticles([]);
            setFilteredArticles([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError('');

        try {
            const actualArticleIds = articleIds.map(item => {
                if (typeof item === 'object' && item._id) {
                    return item._id.toString();
                }
                return item.toString();
            });

            const response = await fetch('https://clea-client-backend-bjdna9f5eug4a9fd.polandcentral-01.azurewebsites.net/api/articles/batch', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ ids: actualArticleIds })
            });

            if (!response.ok) {
                throw new Error('Nie udało się pobrać artykułów');
            }

            const savedArticlesData = await response.json();

            setSavedArticles(savedArticlesData);
            setFilteredArticles(savedArticlesData);
        } catch (error) {
            console.error('Błąd ładowania zapisanych artykułów:', error);
            setError('Nie udało się załadować zapisanych artykułów');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let filtered = [...savedArticles];

        if (searchQuery.trim()) {
            filtered = filtered.filter(article =>
                article.title.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (selectedCategory && selectedCategory !== 'Wszystkie kategorie') {
            filtered = filtered.filter(article =>
                article.category && article.category.toLowerCase() === selectedCategory.toLowerCase()
            );
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

        setFilteredArticles(filtered);
    }, [searchQuery, selectedCategory, sortOrder, savedArticles]);

    const handleRemoveSaved = async (articleId) => {
        if (!token) return;

        try {
            const response = await fetch(`https://clea-client-backend-bjdna9f5eug4a9fd.polandcentral-01.azurewebsites.net/api/auth/saved-articles/${articleId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setSavedArticles(prev => prev.filter(article => article._id !== articleId));

                updateUser({
                    ...user,
                    savedArticles: data.savedArticles
                });
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Nie udało się usunąć artykułu z zapisanych');
            }
        } catch (error) {
            console.error('Błąd usuwania z zapisanych:', error);
            setError('Wystąpił błąd podczas usuwania artykułu');
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

    const categoryOptions = [
        'Wszystkie kategorie',
        ...CATEGORIES.map(c => c.charAt(0).toUpperCase() + c.slice(1))
    ];

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
                        <div className="profile-farticles">
                            <div className="profile-farticles__filters">
                                <SearchBar
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Wyszukaj artykuł..."
                                />
                                <div className="profile-farticles__filter-item">
                                    <DropdownList
                                        options={categoryOptions}
                                        selected={selectedCategory || 'Wszystkie kategorie'}
                                        onSelect={handleCategoryChange}
                                        defaultText="Wybierz kategorię"
                                    />
                                </div>
                                <div className="profile-farticles__filter-item">
                                    <DropdownList
                                        options={SORT_LABELS}
                                        selected={sortLabel}
                                        onSelect={handleSortChange}
                                        defaultText="Sortowanie"
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="profile-farticles__error">
                                    {error}
                                </div>
                            )}
                            <div className="profile-farticles__articles">
                                {loading ? (
                                    <p className="profile-farticles__empty">Ładowanie...</p>
                                ) : filteredArticles.length === 0 ? (
                                    <p className="profile-farticles__empty">
                                        {searchQuery || selectedCategory
                                            ? 'Nie znaleziono artykułów spełniających kryteria'
                                            : 'Nie masz jeszcze zapisanych artykułów'}
                                    </p>
                                ) : (
                                    <div className="profile-farticles__grid">
                                        {filteredArticles.map((article) => (
                                            <ArticleCard
                                                key={article._id}
                                                article={article}
                                                showRemoveButton={true}
                                                onRemove={handleRemoveSaved}
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