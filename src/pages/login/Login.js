import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from '../../contexts/AuthContext';
import './Login.scss';
import CleaMenu from '../../styles/components/menu/Menu';
import Footer from '../../styles/components/footer/Footer';
import eyeIcon from "../../assets/EYE.svg";

export const LoginPage = () => {
    const [formData, setFormData] = useState({ login: '', password: '' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [showResetModal, setShowResetModal] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetLoading, setResetLoading] = useState(false);
    const [resetMessage, setResetMessage] = useState('');
    const [resetError, setResetError] = useState('');

    const [needsVerification, setNeedsVerification] = useState(false);
    const [unverifiedEmail, setUnverifiedEmail] = useState('');
    const [resendingEmail, setResendingEmail] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    const handleNavigation = (path) => navigate(path);
    const togglePasswordVisibility = () => setShowPassword(prev => !prev);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (error) setError('');
        if (needsVerification) setNeedsVerification(false);
    };

    const handleResetPasswordSubmit = async (e) => {
        e.preventDefault();
        if (!resetEmail) return;
        setResetLoading(true);
        setResetError('');
        setResetMessage('');
        try {
            const response = await fetch('https://clea-client-backend-bjdna9f5eug4a9fd.polandcentral-01.azurewebsites.net/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: resetEmail })
            });
            const data = await response.json();
            if (response.ok) {
                setResetMessage(data.message);
                setResetEmail('');
            } else {
                setResetError(data.message || 'Wystąpił błąd');
            }
        } catch (err) {
            setResetError('Błąd połączenia z serwerem');
        } finally {
            setResetLoading(false);
        }
    };

    const closeResetModal = () => {
        setShowResetModal(false);
        setResetEmail('');
        setResetMessage('');
        setResetError('');
    };

    const handleResendVerification = async () => {
        setResendingEmail(true);
        setError('');
        try {
            const response = await fetch('https://clea-client-backend-bjdna9f5eug4a9fd.polandcentral-01.azurewebsites.net/api/auth/resend-verification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: unverifiedEmail })
            });

            if (response.ok) {
                alert('Email weryfikacyjny został wysłany ponownie na adres: ' + unverifiedEmail);
            } else {
                const data = await response.json();
                setError(data.message || 'Nie udało się wysłać emaila ponownie');
            }
        } catch (err) {
            setError('Błąd połączenia z serwerem');
        } finally {
            setResendingEmail(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setNeedsVerification(false);

        try {
            const result = await login(formData.login, formData.password);

            if (result.success) {
                const from = location.state?.from || '/';
                navigate(from, { replace: true });
            } else {
                if (result.requiresVerification) {
                    setNeedsVerification(true);
                    setUnverifiedEmail(result.email);
                    setError(result.message);
                } else {
                    setError(result.message || 'Błąd podczas logowania');
                }
            }
        } catch (err) {
            setError('Błąd połączenia z serwerem');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="clea">
            <div className="clea-page">
                <CleaMenu onNavigate={handleNavigation} currentPath={location.pathname} />

                <main className="login-page">
                    <section className='login-page__card'>
                        <header className="login-page__header">
                            <h1 className="login-page__title">Witaj ponownie</h1>
                            <p className="login-page__subtitle">Cieszymy się, że wracasz! Zaloguj się, aby kontynuować.</p>
                        </header>

                        <form onSubmit={handleSubmit} className="login-page__form">
                            <fieldset className="login-page__field">
                                <label className="login-page__label" htmlFor="login">Email lub nazwa użytkownika</label>
                                <input
                                    className="login-page__input"
                                    type="text"
                                    id="login"
                                    name="login"
                                    value={formData.login}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="twój.adres@gmail.com lub nazwa_użytkownika"
                                />
                            </fieldset>

                            <fieldset className="login-page__field">
                                <label className="login-page__label" htmlFor="password">Hasło</label>
                                <div className="login-page__password-wrapper">
                                    <input
                                        className="login-page__input"
                                        type={showPassword ? "text" : "password"}
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="wprowadź hasło"
                                    />
                                    <button
                                        type="button"
                                        className="login-page__password-toggle"
                                        onClick={togglePasswordVisibility}
                                        aria-label={showPassword ? "Ukryj hasło" : "Pokaż hasło"}
                                    >
                                        <img
                                            src={eyeIcon}
                                            alt=""
                                            className={`login-page__password-icon ${showPassword ? 'login-page__password-icon--visible' : ''}`}
                                        />
                                    </button>
                                </div>
                            </fieldset>

                            <div className="login-page__actions">
                                {error && (
                                    <aside className="login-page__error" role="alert">
                                        {error}
                                    </aside>
                                )}

                                {needsVerification && (
                                    <aside className="login-page__verification" role="alert">
                                        <p>Twoje konto nie zostało jeszcze zweryfikowane.</p>
                                        <p>Link wysłano na: <strong>{unverifiedEmail}</strong></p>
                                        <button
                                            type="button"
                                            onClick={handleResendVerification}
                                            disabled={resendingEmail}
                                            className="login-page__resend-btn"
                                        >
                                            {resendingEmail ? 'Wysyłanie...' : 'Wyślij link ponownie'}
                                        </button>
                                    </aside>
                                )}

                                <button
                                    type="button"
                                    className="login-page__forgot-link"
                                    onClick={() => setShowResetModal(true)}
                                >
                                    Nie pamiętasz hasła?
                                </button>
                            </div>

                            <button
                                type="submit"
                                className="login-page__submit-btn"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Logowanie...' : 'Zaloguj się'}
                            </button>
                        </form>

                        <footer className="login-page__footer">
                            <p className="login-page__footer-text">
                                Nie masz konta?{' '}
                                <Link to="/registration" className="login-page__footer-link">
                                    Zarejestruj się
                                </Link>
                            </p>
                        </footer>
                    </section>
                    <aside className="login-page__image" aria-hidden="true"></aside>
                </main>

                {showResetModal && (
                    <div className="login-page__modal-overlay">
                        <div className="login-page__modal-content">
                            <h3 className="login-page__modal-title">Resetowanie hasła</h3>
                            {!resetMessage ? (
                                <>
                                    <p className="login-page__modal-desc">Wprowadź swój adres email, a wyślemy Ci link do zresetowania hasła.</p>
                                    {resetError && <div className="login-page__modal-error">{resetError}</div>}
                                    <form onSubmit={handleResetPasswordSubmit}>
                                        <input
                                            type="email"
                                            className="login-page__modal-input"
                                            placeholder="Twój adres email"
                                            value={resetEmail}
                                            onChange={(e) => setResetEmail(e.target.value)}
                                            required
                                        />
                                        <div className="login-page__modal-btns">
                                            <button type="submit" className="login-page__modal-btn login-page__modal-btn--submit" disabled={resetLoading}>
                                                {resetLoading ? 'Wysyłanie...' : 'Wyślij link resetujący'}
                                            </button>
                                            <button type="button" className="login-page__modal-btn login-page__modal-btn--cancel" onClick={closeResetModal}>
                                                Anuluj
                                            </button>
                                        </div>
                                    </form>
                                </>
                            ) : (
                                <div className="login-page__modal-success">
                                    <p>{resetMessage}</p>
                                    <button type="button" className="login-page__modal-btn login-page__modal-btn--submit" onClick={closeResetModal}>
                                        Zamknij
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
};