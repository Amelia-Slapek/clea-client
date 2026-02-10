import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import './Alergens.scss';
import CleaMenu from '../../../styles/components/menu/Menu';
import Footer from '../../../styles/components/footer/Footer';
import ProfileSidebar from '../../../styles/components/profileSidebar/ProfileSidebar';
import minusIcon from '../../../assets/MINUS.svg';
import SearchBar from '../../../styles/components/searchBar/SearchBar';

export const ProfileAlergens = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, token, updateUser, loading: authLoading, isAuthenticated } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedIngredient, setSelectedIngredient] = useState(null);
    const [allergies, setAllergies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const searchContainerRef = useRef(null);

    const handleNavigation = (path) => {
        navigate(path);
    };

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate('/login');
        }
    }, [authLoading, isAuthenticated, navigate]);

    useEffect(() => {
        const loadAllergies = async () => {
            setLoading(true);
            try {
                if (user?.allergies?.length > 0) {
                    const ingredientsResponse = await fetch('https://clea-client-backend-bjdna9f5eug4a9fd.polandcentral-01.azurewebsites.net/api/ingredients');
                    if (!ingredientsResponse.ok) throw new Error('Błąd pobierania składników');

                    const allIngredients = await ingredientsResponse.json();
                    const userAllergens = allIngredients.filter(ingredient =>
                        user.allergies.some(id =>
                            id === ingredient._id || id.toString() === ingredient._id.toString()
                        )
                    );
                    setAllergies(userAllergens);
                } else {
                    const profileResponse = await fetch('https://clea-client-backend-bjdna9f5eug4a9fd.polandcentral-01.azurewebsites.net/api/auth/profile', {
                        headers: { Authorization: `Bearer ${token}` }
                    });

                    const userData = await profileResponse.json();

                    if (userData.allergies?.length > 0) {
                        const ingredientsResponse = await fetch('https://clea-client-backend-bjdna9f5eug4a9fd.polandcentral-01.azurewebsites.net/api/ingredients');
                        const allIngredients = await ingredientsResponse.json();

                        const userAllergens = allIngredients.filter(ingredient =>
                            userData.allergies.includes(ingredient._id)
                        );
                        setAllergies(userAllergens);
                    } else {
                        setAllergies([]);
                    }
                }
            } catch (error) {
                console.error(error);
                setError('Nie udało się załadować listy alergenów');
            } finally {
                setLoading(false);
            }
        };

        if (user && token) {
            loadAllergies();
        }
    }, [user, token]);



    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = async (query) => {
        setSearchQuery(query);

        if (!query) setSelectedIngredient(null);

        if (query.trim().length < 2) {
            setSearchResults([]);
            setShowDropdown(false);
            return;
        }

        console.log("Szukam:", query);
        try {
            const response = await fetch('https://clea-client-backend-bjdna9f5eug4a9fd.polandcentral-01.azurewebsites.net/api/ingredients');
            if (response.ok) {
                const allIngredients = await response.json();

                const filtered = allIngredients.filter(ingredient =>
                    ingredient.name.toLowerCase().includes(query.toLowerCase()) &&
                    !allergies.some(allergy => allergy._id.toString() === ingredient._id.toString())
                );

                console.log("Znaleziono:", filtered.length);

                setSearchResults(filtered);
                setShowDropdown(true);
            }
        } catch (error) {
            console.error('Błąd wyszukiwania:', error);
        }
    };

    const handleSelectIngredient = (ingredient) => {
        setSelectedIngredient(ingredient);
        setSearchQuery(ingredient.name);
        setShowDropdown(false);
        setError('');
    };

    const handleAddAllergen = async () => {
        if (!selectedIngredient) {
            setError('Wybierz składnik z listy');
            return;
        }

        if (allergies.some(a => a._id.toString() === selectedIngredient._id.toString())) {
            setError('Ten alergen jest już na liście');
            return;
        }

        try {
            const response = await fetch(`https://clea-client-backend-bjdna9f5eug4a9fd.polandcentral-01.azurewebsites.net/api/auth/allergies/${selectedIngredient._id}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setAllergies([...allergies, selectedIngredient]);
                updateUser({ ...user, allergies: data.allergies });
                setSearchQuery('');
                setSelectedIngredient(null);
                setError('');
            } else {
                const err = await response.json();
                setError(err.message || 'Błąd dodawania');
            }
        } catch (error) {
            setError('Błąd serwera');
        }
    };

    const handleRemoveAllergen = async (id) => {
        try {
            const response = await fetch(`https://clea-client-backend-bjdna9f5eug4a9fd.polandcentral-01.azurewebsites.net/api/auth/allergies/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setAllergies(allergies.filter(a => a._id !== id));
                updateUser({ ...user, allergies: data.allergies });
            }
        } catch (error) {
            console.error(error);
        }
    };

    if (authLoading) return <div>Ładowanie...</div>;
    if (!user) return null;

    return (
        <div className="clea">
            <div className="clea-page">
                <CleaMenu onNavigate={handleNavigation} currentPath={location.pathname} />
                <main className="profile-layout">
                    <ProfileSidebar user={user} currentPath={location.pathname} onNavigate={handleNavigation} />

                    <div className="profile-layout-content">
                        <div className="profile-alergens">

                            <div className="profile-alergens__search">
                                <div className="search-container" ref={searchContainerRef}>
                                    <SearchBar
                                        value={searchQuery}
                                        onChange={(e) => handleSearch(e.target.value)}
                                        onFocus={() => {
                                            if (searchResults.length > 0) setShowDropdown(true);
                                        }}
                                        placeholder="Wpisz nazwę alergenu"
                                    />

                                    {showDropdown && (
                                        <div className="profile-alergens__search-dropdown">
                                            {searchResults.length > 0 ? (
                                                searchResults.map((ingredient) => (
                                                    <div
                                                        key={ingredient._id}
                                                        className="profile-alergens__search-dropdown-item"
                                                        onClick={() => handleSelectIngredient(ingredient)}
                                                    >
                                                        {ingredient.name}
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="profile-alergens__search-dropdown-empty">
                                                    Brak wyników
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <button
                                    className="profile-alergens__search-button"
                                    onClick={handleAddAllergen}
                                    disabled={!selectedIngredient}
                                >
                                    Dodaj
                                </button>
                            </div>

                            {error && <div className="profile-alergens__error">{error}</div>}

                            <div className="profile-alergens__list">
                                {loading ? (
                                    <p>Ładowanie...</p>
                                ) : allergies.length === 0 ? (
                                    <p className="profile-alergens__list-empty">Brak alergenów</p>
                                ) : (
                                    allergies.map((allergy) => (
                                        <div key={allergy._id} className="profile-alergens__list-item">
                                            <hr className="profile-alergens__list-item-divider" />
                                            <div className="profile-alergens__list-item-content">
                                                <div className="profile-alergens__list-item-info">
                                                    <h3 className="profile-alergens__list-item-name">{allergy.name}</h3>
                                                    <p className="profile-alergens__list-item-description">{allergy.description}</p>
                                                </div>
                                                <button
                                                    className="profile-alergens__list-item-remove"
                                                    onClick={() => handleRemoveAllergen(allergy._id)}
                                                >
                                                    <img src={minusIcon} alt="Usuń" />
                                                </button>
                                            </div>
                                        </div>
                                    ))
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