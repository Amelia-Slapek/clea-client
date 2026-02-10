import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import "./Menu.scss";
import logo from "../../../assets/logo.svg";
import accountUser from "../../../assets/ACOUNTUSER.svg";

const MENU_ITEMS = [
    { id: 'home', label: 'Strona Główna', path: '/' },
    { id: 'cosmeticsAnalysis', label: 'Analiza', path: '/cosmeticsAnalysis' },
    { id: 'products', label: 'Produkty', path: '/products' },
    { id: 'skinCare', label: 'Pielęgnacja', path: '/skinCare' },
    { id: 'articles', label: 'Artykuły', path: '/articles' },
];

export const CleaMenu = ({ onNavigate }) => {
    const { user, logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const location = useLocation();
    const currentPath = location.pathname;

    const dropdownRef = useRef(null);
    const menuRef = useRef(null);

    const toggleMenu = () => {
        setIsMenuOpen(prev => !prev);
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
        setIsDropdownOpen(false);
    };

    const handleNavigation = (path) => {
        if (onNavigate) {
            onNavigate(path);
        }
        closeMenu();
    };

    const handleLogout = () => {
        logout();
        closeMenu();
        if (onNavigate) onNavigate('/');
    };

    const checkIsActive = (itemPath, currentPath) => {
        const safeCurrent = currentPath || '';
        if (itemPath === '/') {
            return safeCurrent === '/';
        }

        if (itemPath === '/products' && safeCurrent.startsWith('/product/')) {
            return true;
        }

        if (itemPath === '/articles' && safeCurrent.startsWith('/article/')) {
            return true;
        }

        return safeCurrent === itemPath || safeCurrent.startsWith(itemPath + '/');
    };

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 992 && isMenuOpen) {
                closeMenu();
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isMenuOpen]);

    useEffect(() => {
        if (isMenuOpen && window.innerWidth <= 992) {
            document.body.style.overflow = 'hidden';
            document.body.classList.add('menu-open');
        } else {
            document.body.style.overflow = '';
            document.body.classList.remove('menu-open');
        }
        return () => {
            document.body.style.overflow = '';
            document.body.classList.remove('menu-open');
        };
    }, [isMenuOpen]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                closeMenu();
            }
        };
        if (isMenuOpen || isDropdownOpen) {
            document.addEventListener('keydown', handleEscape);
        }
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isMenuOpen, isDropdownOpen]);

    return (
        <header className="clea-menu" ref={menuRef}>
            <div className="clea-menu__container">
                <div
                    className="clea-menu__logo"
                    onClick={() => handleNavigation('/')}
                    role="button"
                    tabIndex={0}
                >
                    <img src={logo} alt="Clea Logo" className="clea-menu__logo-img" />
                    <span className="clea-menu__logo-text">Clea</span>
                </div>

                <button
                    className={`clea-menu__toggle ${isMenuOpen ? 'clea-menu__toggle--active' : ''}`}
                    onClick={toggleMenu}
                    aria-label={isMenuOpen ? 'Zamknij menu' : 'Otwórz menu'}
                    aria-expanded={isMenuOpen}
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
                <nav
                    className={`clea-menu__nav ${isMenuOpen ? 'clea-menu__nav--open' : ''}`}
                >
                    <ul className="clea-menu__list">
                        {MENU_ITEMS.map((item) => {
                            const isActive = checkIsActive(item.path, currentPath);

                            return (
                                <li key={item.id} className="clea-menu__item">
                                    <button
                                        className={`clea-menu__link ${isActive ? 'clea-menu__link--active' : ''}`}
                                        onClick={() => handleNavigation(item.path)}
                                    >
                                        {item.label}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>

                    <div className="clea-menu__actions">
                        {user ? (
                            <div className="clea-menu__profile" ref={dropdownRef}>
                                <button
                                    className="clea-menu__profile-trigger"
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                >
                                    <img src={accountUser} alt="" />
                                    <span className="clea-menu__profile-name">
                                        {user.username}
                                    </span>
                                </button>
                                {isDropdownOpen && (
                                    <div className="clea-menu__dropdown">
                                        <button
                                            className="clea-menu__dropdown-item"
                                            onClick={() => handleNavigation('/profile')}
                                        >
                                            Profil
                                        </button>
                                        <button
                                            className="clea-menu__dropdown-item"
                                            onClick={handleLogout}
                                        >
                                            Wyloguj się
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <button
                                className="clea-menu__login-btn"
                                onClick={() => handleNavigation('/login')}
                            >
                                Zaloguj się
                            </button>
                        )}
                    </div>
                </nav>
            </div>
        </header>
    );
};

export default CleaMenu;