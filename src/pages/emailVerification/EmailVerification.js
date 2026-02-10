import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import './EmailVerification.scss';
import CleaMenu from '../../styles/components/menu/Menu';
import Footer from '../../styles/components/footer/Footer';
import ErrorIcon from '../../assets/ERROR.svg';
import SuccessIcon from '../../assets/SUCCESS.svg';

export const EmailVerificationPage = () => {
    const [status, setStatus] = useState('loading');
    const [message, setMessage] = useState('');
    const { token } = useParams();
    const navigate = useNavigate();

    const effectRan = useRef(false);

    useEffect(() => {
        if (effectRan.current === true) return;

        const verifyEmail = async () => {
            try {
                const response = await fetch(`https://clea-client-backend-bjdna9f5eug4a9fd.polandcentral-01.azurewebsites.net/api/auth/verify-email/${token}`);
                const data = await response.json();

                if (response.ok) {
                    setStatus('success');
                    setMessage(data.message);

                    if (data.token && data.user) {
                        localStorage.setItem('token', data.token);
                        const userToSave = { ...data.user };
                        delete userToSave.avatarImageData;
                        localStorage.setItem('user', JSON.stringify(userToSave));
                        window.dispatchEvent(new Event('authChange'));
                    }
                } else {
                    setStatus('error');
                    setMessage(data.message || 'Weryfikacja nie powiodła się.');
                }
            } catch (error) {
                setStatus('error');
                setMessage('Wystąpił błąd podczas łączenia z serwerem.');
            }
        };

        verifyEmail();
        return () => { effectRan.current = true; };
    }, [token]);

    const handleNavigation = (path) => {
        navigate(path);
    };

    return (
        <div className="clea">
            <div className="clea-page">
                <CleaMenu onNavigate={handleNavigation} />

                <main className="verification-page">
                    <section className="verification-page__card">
                        {status === 'loading' && (
                            <div className="verification-page__content verification-page__content--loading">
                                <div className="verification-page__spinner" aria-hidden="true"></div>
                                <p className="verification-page__text">Trwa weryfikacja Twojego adresu e-mail...</p>
                            </div>
                        )}

                        {status === 'success' && (
                            <article className="verification-page__content">
                                <header className="verification-page__icon verification-page__icon--success">
                                    <img
                                        src={SuccessIcon}
                                        alt="Błąd weryfikacji"
                                        width="80"
                                        height="80"
                                    />
                                </header>
                                <h1 className="verification-page__title">E-mail zweryfikowany!</h1>
                                <p className="verification-page__text">{message}</p>
                                <div className="verification-page__actions">
                                    <Link to="/" className="verification-page__button">
                                        Przejdź do strony głównej
                                    </Link>
                                </div>
                            </article>
                        )}

                        {status === 'error' && (
                            <article className="verification-page__content">
                                <header className="verification-page__icon verification-page__icon--error">
                                    <img
                                        src={ErrorIcon}
                                        alt="Błąd weryfikacji"
                                        width="80"
                                        height="80"
                                    />
                                </header>
                                <h1 className="verification-page__title">Weryfikacja nieudana</h1>
                                <p className="verification-page__text">{message}</p>
                                <div className="verification-page__actions">
                                    <Link to="/login" className="verification-page__button">
                                        Przejdź do logowania
                                    </Link>
                                </div>
                            </article>
                        )}
                    </section>
                </main>
            </div>
            <Footer />
        </div>
    );
};