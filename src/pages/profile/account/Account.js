import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import './Account.scss';
import CleaMenu from '../../../styles/components/menu/Menu';
import Footer from '../../../styles/components/footer/Footer';
import ProfileSidebar from '../../../styles/components/profileSidebar/ProfileSidebar';
import eyeIcon from '../../../assets/EYE.svg';

export const ProfileAccount = () => {
    const { user, updateUser, loading: authLoading, isAuthenticated, token } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const DEFAULT_AVATAR_ID_STRING = '691d02a135df80c6f8b7ba66';

    const [formData, setFormData] = useState({
        username: user?.username || '',
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [changePassword, setChangePassword] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [avatarPreview, setAvatarPreview] = useState(user?.avatarImageData || '');
    const [avatarBase64, setAvatarBase64] = useState(undefined);

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleNavigation = (path) => {
        navigate(path);
    };

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate('/login');
        }
    }, [authLoading, isAuthenticated, navigate]);

    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username || '',
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || '',
            });
            setAvatarPreview(user.avatarImageData || '');
            setAvatarBase64(undefined);
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
            setChangePassword(false);
        }
    }, [user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (error) setError('');
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
        if (error) setError('');
    };

    const convertFileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
            reader.readAsDataURL(file);
        });
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            setError('Nieprawidłowy format zdjęcia. Dozwolone: JPG, PNG, GIF, WEBP');
            return;
        }

        const maxSize = 1024 * 1024;
        if (file.size > maxSize) {
            setError('Zdjęcie jest zbyt duże. Maksymalny rozmiar to 1MB');
            return;
        }

        try {
            const base64 = await convertFileToBase64(file);
            setAvatarPreview(base64);
            setAvatarBase64(base64);
            setError('');
        } catch (error) {
            console.error('Błąd konwersji obrazu:', error);
            setError('Błąd podczas wczytywania zdjęcia');
        }
    };

    const handleRemoveAvatar = () => {
        setAvatarPreview('');
        setAvatarBase64(null);
        setError('');
    };

    const validateForm = () => {
        if (!formData.username.trim() || !formData.firstName.trim() || !formData.lastName.trim() || !formData.email) {
            setError('Wszystkie pola podstawowych danych są wymagane.');
            return false;
        }

        if (changePassword) {
            if (!passwordData.currentPassword) {
                setError('Bieżące hasło jest wymagane');
                return false;
            }
            if (!passwordData.newPassword) {
                setError('Nowe hasło jest wymagane');
                return false;
            }
            if (passwordData.newPassword.length < 8) {
                setError('Nowe hasło musi mieć co najmniej 8 znaków');
                return false;
            }
            if (passwordData.newPassword !== passwordData.confirmPassword) {
                setError('Nowe hasła nie są identyczne');
                return false;
            }
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        setError('');
        setSuccess('');

        if (!token) {
            setError('Błąd autoryzacji: brak tokena.');
            setLoading(false);
            return;
        }

        try {
            const updatePayload = {
                username: formData.username,
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
            };

            if (avatarBase64 !== undefined) {
                updatePayload.avatarBase64 = avatarBase64;
            }

            if (changePassword) {
                updatePayload.currentPassword = passwordData.currentPassword;
                updatePayload.newPassword = passwordData.newPassword;
            }

            const response = await fetch('https://clea-client-backend-bjdna9f5eug4a9fd.polandcentral-01.azurewebsites.net/api/auth/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updatePayload)
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess('Profil zaktualizowany pomyślnie');
                updateUser(data.user);

                setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
                setChangePassword(false);
                setAvatarBase64(undefined);
                setAvatarPreview(data.user?.avatarImageData || '');

            } else {
                setError(data.message || 'Błąd podczas aktualizacji profilu');
            }
        } catch (err) {
            setError('Błąd połączenia z serwerem');
            console.error('Update error:', err);
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) {
        return (
            <div className="clea">
                <div className="clea-page">
                    <CleaMenu onNavigate={handleNavigation} currentPath={location.pathname} />
                    <main className="profile-layout">
                        <div style={{ textAlign: 'center', padding: '2rem' }}>
                            <p>Ładowanie...</p>
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
                        <div className="profile-account">


                            {error && (
                                <div className="profile-account__error" role="alert">
                                    {error}
                                </div>
                            )}

                            {success && (
                                <div className="profile-account__success" role="alert">
                                    {success}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="profile-account__form">
                                <div className="profile-account__avatar-section">
                                    <div className="profile-account__avatar-circle-wrapper">
                                        {avatarPreview ? (
                                            <img
                                                src={avatarPreview}
                                                alt="Avatar"
                                                className="profile-account__avatar-img"
                                            />
                                        ) : (
                                            <div className="profile-account__avatar-placeholder">
                                                {formData.username?.charAt(0).toUpperCase() || '?'}
                                            </div>
                                        )}
                                    </div>

                                    <div className="profile-account__avatar-actions">
                                        <input
                                            type="file"
                                            id="avatar-upload"
                                            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                                            onChange={handleAvatarChange}
                                            style={{ display: 'none' }}
                                        />
                                        <label htmlFor="avatar-upload" className="profile-account__btn profile-account__btn--primary">
                                            Zmień zdjęcie
                                        </label>
                                        <button
                                            type="button"
                                            onClick={handleRemoveAvatar}
                                            className="profile-account__btn profile-account__btn--secondary"
                                            disabled={user?.avatarImageId === DEFAULT_AVATAR_ID_STRING}
                                        >
                                            Usuń zdjęcie
                                        </button>
                                    </div>
                                </div>

                                <div className={`profile-account__data-section ${changePassword ? 'profile-account__data-section--split' : ''}`}>
                                    <div className="profile-account__data-column">
                                        <div className="profile-account__field">
                                            <label htmlFor="username" className="profile-account__label">Nazwa użytkownika</label>
                                            <input
                                                id="username"
                                                type="text"
                                                name="username"
                                                value={formData.username}
                                                onChange={handleInputChange}
                                                className="profile-account__input"
                                                required
                                            />
                                        </div>

                                        <div className="profile-account__field">
                                            <label htmlFor="firstName" className="profile-account__label">Imię</label>
                                            <input
                                                id="firstName"
                                                type="text"
                                                name="firstName"
                                                value={formData.firstName}
                                                onChange={handleInputChange}
                                                className="profile-account__input"
                                                required
                                            />
                                        </div>

                                        <div className="profile-account__field">
                                            <label htmlFor="lastName" className="profile-account__label">Nazwisko</label>
                                            <input
                                                id="lastName"
                                                type="text"
                                                name="lastName"
                                                value={formData.lastName}
                                                onChange={handleInputChange}
                                                className="profile-account__input"
                                                required
                                            />
                                        </div>

                                        <div className="profile-account__field">
                                            <label htmlFor="email" className="profile-account__label">Email</label>
                                            <input
                                                id="email"
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                className="profile-account__input"
                                                required
                                            />
                                        </div>

                                        <div className="profile-account__checkbox-field">
                                            <input
                                                type="checkbox"
                                                id="change-password"
                                                checked={changePassword}
                                                onChange={(e) => setChangePassword(e.target.checked)}
                                                className="profile-account__checkbox"
                                            />
                                            <label htmlFor="change-password" className="profile-account__checkbox-label">
                                                Zmień hasło
                                            </label>
                                        </div>
                                    </div>

                                    {changePassword && (
                                        <div className="profile-account__password-column">
                                            <div className="profile-account__field">
                                                <label htmlFor="currentPassword" className="profile-account__label">Bieżące hasło</label>
                                                <div className="profile-account__input-wrapper">
                                                    <input
                                                        id="currentPassword"
                                                        type={showCurrentPassword ? "text" : "password"}
                                                        name="currentPassword"
                                                        value={passwordData.currentPassword}
                                                        onChange={handlePasswordChange}
                                                        className="profile-account__input profile-account__input--has-icon"
                                                        required
                                                    />
                                                    <button
                                                        type="button"
                                                        className="profile-account__password-toggle"
                                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                        tabIndex="-1"
                                                    >
                                                        <img src={eyeIcon} alt={showCurrentPassword ? "Ukryj" : "Pokaż"} />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="profile-account__field">
                                                <label htmlFor="newPassword" className="profile-account__label">Nowe hasło</label>
                                                <div className="profile-account__input-wrapper">
                                                    <input
                                                        id="newPassword"
                                                        type={showNewPassword ? "text" : "password"}
                                                        name="newPassword"
                                                        value={passwordData.newPassword}
                                                        onChange={handlePasswordChange}
                                                        className="profile-account__input profile-account__input--has-icon"
                                                        required
                                                    />
                                                    <button
                                                        type="button"
                                                        className="profile-account__password-toggle"
                                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                                        tabIndex="-1"
                                                    >
                                                        <img src={eyeIcon} alt={showNewPassword ? "Ukryj" : "Pokaż"} />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="profile-account__field">
                                                <label htmlFor="confirmPassword" className="profile-account__label">Potwierdź nowe hasło</label>
                                                <div className="profile-account__input-wrapper">
                                                    <input
                                                        id="confirmPassword"
                                                        type={showConfirmPassword ? "text" : "password"}
                                                        name="confirmPassword"
                                                        value={passwordData.confirmPassword}
                                                        onChange={handlePasswordChange}
                                                        className="profile-account__input profile-account__input--has-icon"
                                                        required
                                                    />
                                                    <button
                                                        type="button"
                                                        className="profile-account__password-toggle"
                                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                        tabIndex="-1"
                                                    >
                                                        <img src={eyeIcon} alt={showConfirmPassword ? "Ukryj" : "Pokaż"} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="profile-account__actions">
                                    <button
                                        type="submit"
                                        className="profile-account__btn-save"
                                        disabled={loading}
                                    >
                                        {loading ? 'Zapisywanie...' : 'Zapisz zmiany'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </main>
            </div>
            <Footer />
        </div>
    );
};