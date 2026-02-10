import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from '../../contexts/AuthContext';
import './Registration.scss';
import CleaMenu from '../../styles/components/menu/Menu';
import Footer from '../../styles/components/footer/Footer';
import eyeIcon from "../../assets/EYE.svg";

export const RegistrationPage = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        username: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const [needsVerification, setNeedsVerification] = useState(false);
    const [resendingEmail, setResendingEmail] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const { register } = useAuth();

    const handleNavigation = (path) => navigate(path);
    const togglePasswordVisibility = () => setShowPassword(prev => !prev);
    const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(prev => !prev);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        if (error) setError('');
        if (needsVerification) setNeedsVerification(false);
    };

    const handleResendVerification = async () => {
        setResendingEmail(true);
        setError('');
        try {
            const response = await fetch('https://clea-client-backend-bjdna9f5eug4a9fd.polandcentral-01.azurewebsites.net/api/auth/resend-verification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email })
            });

            const data = await response.json();

            if (response.ok) {
                alert('Email weryfikacyjny został wysłany ponownie.');
                setNeedsVerification(false);
                setIsSuccess(true);
            } else {
                setError(data.message || 'Nie udało się wysłać emaila ponownie');
            }
        } catch (err) {
            setError('Błąd połączenia z serwerem');
        } finally {
            setResendingEmail(false);
        }
    };

    const validateForm = () => {
        if (!formData.firstName.trim()) { setError('Imię jest wymagane'); return false; }
        if (!formData.lastName.trim()) { setError('Nazwisko jest wymagane'); return false; }
        if (!formData.email) { setError('Email jest wymagany'); return false; }
        if (!formData.username.trim()) { setError('Nazwa użytkownika jest wymagana'); return false; }
        if (formData.password.length < 8) { setError('Hasło musi mieć co najmniej 8 znaków'); return false; }
        if (formData.password !== formData.confirmPassword) { setError('Hasła nie są identyczne'); return false; }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsLoading(true);
        setError('');
        setNeedsVerification(false);

        try {
            const result = await register({
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                username: formData.username,
                password: formData.password
            });

            if (result.success) {
                setIsSuccess(true);
            } else {
                if (result.requiresVerification) {
                    setNeedsVerification(true);
                    setError(result.message);
                } else {
                    setError(result.message || 'Błąd podczas rejestracji');
                }
            }
        } catch (err) {
            if (err.requiresVerification) {
                setNeedsVerification(true);
                setError(err.message);
            } else {
                setError('Błąd połączenia z serwerem lub użytkownik już istnieje');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="clea">
            <div className="clea-page">
                <CleaMenu onNavigate={handleNavigation} currentPath={location.pathname} />

                {isSuccess && (
                    <div className="register-page__overlay">
                        <article className="register-page__success-card">
                            <header className="register-page__success-icon">
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                            </header>
                            <h3 className="register-page__success-title">Sprawdź swój email!</h3>
                            <p className="register-page__success-text">
                                Na adres <span className="register-page__success-email"><strong>{formData.email}</strong></span> wysłaliśmy link aktywacyjny.<br />
                                Kliknij w niego, aby zweryfikować konto.
                            </p>
                            <div className="register-page__success-actions">
                                <Link to="/login" className="register-page__success-button">
                                    Przejdź do logowania
                                </Link>
                            </div>
                            <footer className="register-page__success-footer">
                                <p className="register-page__success-footer-text">Nie otrzymałeś wiadomości? Sprawdź folder Spam.</p>
                            </footer>
                        </article>
                    </div>
                )}

                <main className="register-page">
                    <section className='register-page__card'>
                        <header className="register-page__header">
                            <h1 className="register-page__title">
                                Zarejestruj <span className="register-page__title--accent">się</span>
                            </h1>
                            <p className="register-page__subtitle">Dołącz do społeczności Clea!</p>
                        </header>

                        {error && (
                            <aside className="register-page__error" role="alert">
                                {error}
                            </aside>
                        )}
                        {needsVerification && (
                            <aside className="register-page__verification" role="alert">
                                <p className="register-page__verification--paragraph" >Nie otrzymałeś linku?</p>
                                <button className="register-page__verification--button"
                                    type="button"
                                    onClick={handleResendVerification}
                                    disabled={resendingEmail}>
                                    {resendingEmail ? 'Wysyłanie...' : 'Wyślij link ponownie'}
                                </button>
                            </aside>
                        )}

                        <form onSubmit={handleSubmit} className="register-page__form">
                            <div className="register-page__form-row">
                                <fieldset className="register-page__field">
                                    <label className="register-page__label" htmlFor="firstName">Imię</label>
                                    <input
                                        className="register-page__input"
                                        type="text"
                                        id="firstName"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="Imię"
                                    />
                                </fieldset>

                                <fieldset className="register-page__field">
                                    <label className="register-page__label" htmlFor="lastName">Nazwisko</label>
                                    <input
                                        className="register-page__input"
                                        type="text"
                                        id="lastName"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="Nazwisko"
                                    />
                                </fieldset>
                            </div>

                            <div className="register-page__form-row">
                                <fieldset className="register-page__field">
                                    <label className="register-page__label" htmlFor="email">Email</label>
                                    <input
                                        className="register-page__input"
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="twójAdres@gmail.com"
                                    />
                                </fieldset>

                                <fieldset className="register-page__field">
                                    <label className="register-page__label" htmlFor="username">Nazwa użytkownika</label>
                                    <input
                                        className="register-page__input"
                                        type="text"
                                        id="username"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="Nazwa"
                                    />
                                </fieldset>
                            </div>

                            <div className="register-page__form-row">
                                <fieldset className="register-page__field">
                                    <label className="register-page__label" htmlFor="password">Hasło</label>
                                    <div className="register-page__password-wrapper">
                                        <input
                                            className="register-page__input"
                                            type={showPassword ? "text" : "password"}
                                            id="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="Hasło (min. 8 znaków)"
                                        />
                                        <button
                                            type="button"
                                            className="register-page__password-toggle"
                                            onClick={togglePasswordVisibility}
                                        >
                                            <img
                                                src={eyeIcon}
                                                alt=""
                                                className={`register-page__password-icon ${showPassword ? 'register-page__password-icon--visible' : ''}`}
                                            />
                                        </button>
                                    </div>
                                </fieldset>

                                <fieldset className="register-page__field">
                                    <label className="register-page__label" htmlFor="confirmPassword">Potwierdź hasło</label>
                                    <div className="register-page__password-wrapper">
                                        <input
                                            className="register-page__input"
                                            type={showConfirmPassword ? "text" : "password"}
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="Potwierdź hasło"
                                        />
                                        <button
                                            type="button"
                                            className="register-page__password-toggle"
                                            onClick={toggleConfirmPasswordVisibility}
                                        >
                                            <img
                                                src={eyeIcon}
                                                alt=""
                                                className={`register-page__password-icon ${showConfirmPassword ? 'register-page__password-icon--visible' : ''}`}
                                            />
                                        </button>
                                    </div>
                                </fieldset>
                            </div>

                            <button type="submit" className="register-page__submit-btn" disabled={isLoading}>
                                {isLoading ? 'Tworzenie konta...' : 'Utwórz konto'}
                            </button>
                        </form>

                        <footer className="register-page__footer">
                            <p className="register-page__footer-text">
                                Masz już konto?{' '}
                                <Link to="/login" className="register-page__footer-link">
                                    Zaloguj się
                                </Link>
                            </p>
                        </footer>
                    </section>

                    <aside className="register-page__image" aria-hidden="true"></aside>
                </main>
            </div>
            <Footer />
        </div>
    );
};