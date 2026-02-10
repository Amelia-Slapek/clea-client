import React, { useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import "./ProfileLayout.scss";
import CleaMenu from '../../../styles/components/menu/Menu';
import Footer from '../../../styles/components/footer/Footer';
import ProfileSidebar from '../../../styles/components/profileSidebar/ProfileSidebar';

export const ProfileLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, loading, isAuthenticated } = useAuth();

    const handleNavigation = (path) => {
        navigate(path);
    };

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            navigate('/login');
        }
    }, [loading, isAuthenticated, navigate]);

    if (loading) {
        return (
            <div className="clea">
                <div className="clea-page">
                    <CleaMenu onNavigate={handleNavigation} currentPath={location.pathname} />
                    <main className="profile-layout">
                        <div style={{ textAlign: 'center' }}>
                            <p>Ładowanie...</p>
                        </div>
                    </main>
                </div>
                <Footer />
            </div>
        );
    }

    if (!user) return null;

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
                        <Outlet />
                    </div>
                </main>
            </div>
            <Footer />
        </div>
    );
};