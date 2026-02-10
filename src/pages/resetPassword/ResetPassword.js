import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import './ResetPassword.scss';
import CleaMenu from '../../styles/components/menu/Menu';
import Footer from '../../styles/components/footer/Footer';
import eyeIcon from "../../assets/EYE.svg";
import SuccessIcon from '../../assets/SUCCESS.svg';
export const ResetPasswordPage = () => {
    const { token } = useParams();
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [status, setStatus] = useState('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setStatus('error');
            setMessage('Hasła nie są identyczne.');
            return;
        }

        if (password.length < 8) {
            setStatus('error');
            setMessage('Hasło musi mieć minimum 8 znaków.');
            return;
        }

        setStatus('loading');
        setMessage('');

        try {
            const response = await fetch('https://clea-client-backend-bjdna9f5eug4a9fd.polandcentral-01.azurewebsites.net/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword: password })
            });

            const data = await response.json();

            if (response.ok) {
                setStatus('success');
                setMessage(data.message);
                setTimeout(() => navigate('/login'), 3000);
            } else {
                setStatus('error');
                setMessage(data.message || 'Wystąpił błąd.');
            }
        } catch (error) {
            setStatus('error');
            setMessage('Błąd połączenia z serwerem.');
        }
    };

    return (
        <div className="clea">
            <div className="clea-page">
                <CleaMenu onNavigate={(path) => navigate(path)} currentPath="/reset-password" />

                <main className="reset-password">
                    <section className="reset-password__card">
                        <header className="reset-password__header">
                            <h1 className="reset-password__title">Ustaw nowe hasło</h1>
                            <p className="reset-password__subtitle">Wprowadź nowe hasło dla swojego konta.</p>
                        </header>

                        {status === 'success' ? (
                            <article className="reset-password__success">
                                <img class="reset-password__success-img"
                                    src={SuccessIcon}
                                    alt="Udana zmiana hasła"
                                    width="80"
                                    height="80"
                                />
                                <h3 className="reset-password__success-title">Hasło zmienione!</h3>
                                <p className="reset-password__text">{message}</p>
                                <p className="reset-password__text">Za chwilę zostaniesz przekierowany do logowania...</p>
                                <Link to="/login" className="reset-password__button">Zaloguj się teraz</Link>
                            </article>
                        ) : (
                            <form onSubmit={handleSubmit} className="reset-password__form">
                                {status === 'error' && (
                                    <div className="reset-password__error-msg">{message}</div>
                                )}

                                <div className="reset-password__field">
                                    <label className="reset-password__label">Nowe hasło</label>
                                    <div className="reset-password__input-wrapper">
                                        <input
                                            className="reset-password__input"
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            placeholder="Min. 8 znaków"
                                        />
                                        <button
                                            type="button"
                                            className="reset-password__toggle-btn"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            <img src={eyeIcon} alt="Pokaż" />
                                        </button>
                                    </div>
                                </div>

                                <div className="reset-password__field">
                                    <label className="reset-password__label">Potwierdź hasło</label>
                                    <div className="reset-password__input-wrapper">
                                        <input
                                            className="reset-password__input"
                                            type={showConfirmPassword ? "text" : "password"}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                            placeholder="Powtórz hasło"
                                        />
                                        <button
                                            type="button"
                                            className="reset-password__toggle-btn"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        >
                                            <img src={eyeIcon} alt="Pokaż" />
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="reset-password__button"
                                    disabled={status === 'loading'}
                                >
                                    {status === 'loading' ? 'Zapisywanie...' : 'Zmień hasło'}
                                </button>
                            </form>
                        )}
                    </section>
                </main>
            </div>
            <Footer />
        </div>
    );
};