import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import CleaMenu from '../../styles/components/menu/Menu';
import Footer from '../../styles/components/footer/Footer';
import './Articles.scss';
import ArticleCard from '../../styles/components/articleCard/ArticleCard';
import SearchBar from '../../styles/components/searchBar/SearchBar';
import DropdownList from '../../styles/components/dropdownList/DropdownList';

export const ArticlesPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [articles, setArticles] = useState([]);
    const [filteredArticles, setFilteredArticles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const CATEGORIES = ['analiza', 'trendy', 'recenzje', 'bezpieczeństwo'];
    const ARTICLES_PER_PAGE = 12;

    const handleNavigation = (path) => {
        navigate(path);
    };

    const fetchArticles = async (page) => {
        try {
            setLoading(true);
            const response = await fetch(`https://clea-client-backend-bjdna9f5eug4a9fd.polandcentral-01.azurewebsites.net/api/articles?page=${page}&limit=${ARTICLES_PER_PAGE}`);
            const data = await response.json();

            if (response.ok) {
                const newArticles = data.articles || [];
                setTotalPages(data.totalPages);

                setArticles(prevArticles => {
                    if (page === 1) {
                        return newArticles;
                    } else {
                        const existingIds = new Set(prevArticles.map(a => a._id));
                        const uniqueNewArticles = newArticles.filter(a => !existingIds.has(a._id));
                        return [...prevArticles, ...uniqueNewArticles];
                    }
                });
            } else {
                console.error('Błąd odpowiedzi serwera:', data);
            }
        } catch (error) {
            console.error('Błąd pobierania artykułów:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchArticles(1);
    }, []);

    useEffect(() => {
        let filtered = [...articles];
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

        setFilteredArticles(filtered);
    }, [searchQuery, selectedCategory, articles]);

    const handleLoadMore = () => {
        if (currentPage < totalPages) {
            const nextPage = currentPage + 1;
            setCurrentPage(nextPage);
            fetchArticles(nextPage);
        }
    };

    const categoryOptions = [
        'Wszystkie kategorie',
        ...CATEGORIES.map(c => c.charAt(0).toUpperCase() + c.slice(1))
    ];

    const handleCategoryChange = (selected) => {
        if (!selected || selected === 'Wszystkie kategorie') {
            setSelectedCategory('');
        } else {
            setSelectedCategory(selected);
        }
    };

    return (
        <div className="clea">
            <div className="clea-page">
                <CleaMenu
                    onNavigate={handleNavigation}
                    currentPath={location.pathname}
                />

                <main className="articles-page">
                    <div className="articles-page__container">
                        <header className="articles-page__filters">
                            <div className="articles-page__search-wrapper">
                                <SearchBar
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Wyszukaj artykuł..."
                                />
                            </div>

                            <div className="articles-page__dropdown-wrapper">
                                <DropdownList
                                    options={categoryOptions}
                                    selected={selectedCategory || 'Wszystkie kategorie'}
                                    onSelect={handleCategoryChange}
                                    defaultText="Wybierz kategorię"
                                />
                            </div>
                        </header>

                        <section className="articles-page__results-info">
                            <span>Znaleziono artykułów: <strong>{filteredArticles.length}</strong> (z załadowanych)</span>
                        </section>

                        <section className="articles-page__content">
                            {articles.length === 0 && loading ? (
                                <div className="articles-page__loading">Ładowanie artykułów...</div>
                            ) : filteredArticles.length === 0 ? (
                                <div className="articles-page__no-results">
                                    Nie znaleziono artykułów spełniających kryteria
                                </div>
                            ) : (
                                <>
                                    <div className="articles-page__grid">
                                        {filteredArticles.map((article) => (
                                            <ArticleCard
                                                key={article._id}
                                                article={article}
                                                showRemoveButton={false}
                                            />
                                        ))}
                                    </div>
                                    {currentPage < totalPages && (
                                        <div className="articles-page__load-more-container">
                                            <button
                                                className="articles-page__load-more-btn"
                                                onClick={handleLoadMore}
                                                disabled={loading}
                                            >
                                                {loading ? 'Ładowanie...' : 'Załaduj więcej'}
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