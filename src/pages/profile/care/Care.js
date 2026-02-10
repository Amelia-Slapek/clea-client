import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import './Care.scss';
import CleaMenu from '../../../styles/components/menu/Menu';
import Footer from '../../../styles/components/footer/Footer';
import ProfileSidebar from '../../../styles/components/profileSidebar/ProfileSidebar';
import flowerDayIcon from '../../../assets/FLOWERDAY.png';
import flowerNightIcon from '../../../assets/FLOWERNIGHT.png';
import dotsIcon from '../../../assets/DOTS.svg';

const RoutineMenu = ({ routineId, onDelete }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div
            className="routine-menu"
            ref={menuRef}
            onClick={(e) => e.stopPropagation()}
        >
            <img
                src={dotsIcon}
                alt="Menu"
                className="routine-menu__icon"
                onClick={() => setIsOpen(!isOpen)}
            />
            {isOpen && (
                <div className="routine-menu__dropdown">
                    <button
                        className="routine-menu__option routine-menu__option--delete"
                        onClick={() => {
                            onDelete(routineId);
                            setIsOpen(false);
                        }}
                    >
                        Usuń
                    </button>
                </div>
            )}
        </div>
    );
};

export const ProfileCare = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, token, loading: authLoading, isAuthenticated } = useAuth();
    const [routines, setRoutines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const handleNavigation = (path) => {
        navigate(path);
    };

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate('/login');
        }
    }, [authLoading, isAuthenticated, navigate]);

    const loadRoutines = useCallback(async () => {
        setLoading(true);
        setError('');

        try {
            const response = await fetch('https://clea-client-backend-bjdna9f5eug4a9fd.polandcentral-01.azurewebsites.net/api/skincare-routines', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Nie udało się pobrać pielęgnacji');
            }

            const data = await response.json();
            setRoutines(data);
        } catch (error) {
            console.error('Błąd ładowania pielęgnacji:', error);
            setError('Nie udało się załadować listy pielęgnacji');
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (token) {
            loadRoutines();
        }
    }, [token, loadRoutines]);

    const handleEdit = (routineId) => {
        const routine = routines.find(r => r._id === routineId);
        navigate('/skinCare', {
            state: {
                editRoutine: routine
            }
        });
    };

    const handleDelete = async (routineId) => {
        if (!window.confirm('Czy na pewno chcesz usunąć tę pielęgnację?')) {
            return;
        }

        try {
            const response = await fetch(`https://clea-client-backend-bjdna9f5eug4a9fd.polandcentral-01.azurewebsites.net/api/skincare-routines/${routineId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                setRoutines(routines.filter(r => r._id !== routineId));
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Nie udało się usunąć pielęgnacji');
            }
        } catch (error) {
            console.error('Błąd usuwania pielęgnacji:', error);
            setError('Wystąpił błąd podczas usuwania pielęgnacji');
        }
    };

    const dayRoutines = routines.filter(r => r.timeOfDay === 'Na dzień');
    const nightRoutines = routines.filter(r => r.timeOfDay === 'Na noc');

    if (authLoading) {
        return (
            <div className="clea">
                <div className="clea-page">
                    <CleaMenu
                        onNavigate={handleNavigation}
                        currentPath={location.pathname}
                    />
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
                <CleaMenu
                    onNavigate={handleNavigation}
                    currentPath={location.pathname}
                />

                <main className="profile-layout">
                    <ProfileSidebar
                        user={user}
                        currentPath={location.pathname}
                        onNavigate={handleNavigation}
                    />

                    <div className="profile-layout-content">
                        <div className="profile-care">
                            {error && (
                                <div className="profile-care__error">
                                    {error}
                                </div>
                            )}

                            {loading ? (
                                <p className="profile-care__loading">Ładowanie...</p>
                            ) : (
                                <>
                                    {dayRoutines.length > 0 && (
                                        <section className="profile-care__section">
                                            <h2 className="profile-care__title">Dzień</h2>
                                            <div className="profile-care__grid">
                                                {dayRoutines.map((routine) => (
                                                    <div
                                                        key={routine._id}
                                                        className="routine-card"
                                                        onClick={() => handleEdit(routine._id)}
                                                    >
                                                        <div className="routine-card__icon">
                                                            <img src={flowerDayIcon} alt="Dzień" />
                                                        </div>
                                                        <div className="routine-card__content">
                                                            <h3 className="routine-card__name">
                                                                {routine.name}
                                                            </h3>
                                                            <p className="routine-card__description">
                                                                {routine.description || 'Brak opisu'}
                                                            </p>
                                                        </div>
                                                        <RoutineMenu
                                                            routineId={routine._id}
                                                            onDelete={handleDelete}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </section>
                                    )}

                                    {nightRoutines.length > 0 && (
                                        <section className="profile-care__section">
                                            <h2 className="profile-care__title">Noc</h2>
                                            <div className="profile-care__grid">
                                                {nightRoutines.map((routine) => (
                                                    <div
                                                        key={routine._id}
                                                        className="routine-card"
                                                        onClick={() => handleEdit(routine._id)}
                                                    >
                                                        <div className="routine-card__icon">
                                                            <img src={flowerNightIcon} alt="Noc" />
                                                        </div>
                                                        <div className="routine-card__content">
                                                            <h3 className="routine-card__name">
                                                                {routine.name}
                                                            </h3>
                                                            <p className="routine-card__description">
                                                                {routine.description || 'Brak opisu'}
                                                            </p>
                                                        </div>
                                                        <RoutineMenu
                                                            routineId={routine._id}
                                                            onDelete={handleDelete}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </section>
                                    )}
                                    {routines.length === 0 && (
                                        <div className="profile-care__empty">
                                            <p className="profile-care__empty--paragraph">Nie masz jeszcze żadnych zapisanych pielęgnacji</p>
                                            <button
                                                className="profile-care__create-btn"
                                                onClick={() => navigate('/skinCare')}
                                            >
                                                Stwórz pierwszą pielęgnację
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </main>
            </div>
            <Footer />
        </div>
    );
};