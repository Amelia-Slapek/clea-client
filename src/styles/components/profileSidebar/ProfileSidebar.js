import React from 'react';
import './ProfileSidebar.scss';
import arrowIcon from '../../../assets/ARROWTORIGHT.svg';

const PROFILE_MENU_ITEMS = [
    { id: 'account', label: 'Moje konto', path: '/profile/konto' },
    { id: 'favorites', label: 'Ulubione produkty', path: '/profile/ulubione-produkty' },
    { id: 'articles', label: 'Zapisane artykuły', path: '/profile/ulubione-artykuły' },
    { id: 'allergens', label: 'Alergeny', path: '/profile/alergeny' },
    { id: 'care', label: 'Pielęgnacje', path: '/profile/pielęgnacje' },
];

const ProfileSidebar = ({ user, currentPath, onNavigate }) => {
    const handleMenuClick = (path) => {
        if (path !== currentPath) {
            onNavigate(path);
        }
    };
    const isActive = (itemPath) => {
        if (!currentPath) return false;
        try {
            const normalizedCurrent = decodeURIComponent(currentPath).replace(/\/+$/, '');
            const normalizedItem = itemPath.replace(/\/+$/, '');
            return normalizedCurrent === normalizedItem;
        } catch (e) {
            return currentPath === itemPath;
        }
    };

    const avatarSrc = user?.avatarImageData ? user.avatarImageData : '';

    return (
        <aside className="profile-sidebar">
            <div className="profile-sidebar__user">
                <figure className="profile-sidebar__avatar">
                    <img
                        src={avatarSrc}
                        alt={`Avatar użytkownika ${user?.username}`}
                        className="profile-sidebar__avatar-img"
                        onError={(e) => {
                            e.target.style.display = 'none';
                        }}
                    />
                </figure>
                <div className="profile-sidebar__greeting">
                    <p className="profile-sidebar__greeting-text">
                        Witaj, <span className="profile-sidebar__greeting-username">
                            {user?.username || 'Użytkowniku'}
                        </span>
                    </p>
                </div>
            </div>
            <nav className="profile-sidebar__nav">
                {PROFILE_MENU_ITEMS.map((item) => {
                    const active = isActive(item.path);
                    return (
                        <div className="profile-sidebar__nav-container" key={item.id}>
                            <button
                                className={`profile-sidebar__nav-item ${active ? 'profile-sidebar__nav-item--active' : ''}`}
                                onClick={() => handleMenuClick(item.path)}
                            >
                                <span className="profile-sidebar__nav-label">{item.label}</span>
                                <img src={arrowIcon} alt="" className="profile-sidebar__nav-icon" />
                            </button>
                            <hr className="profile-sidebar__nav-divider" />
                        </div>
                    );
                })}
            </nav>
        </aside>
    );
};

export default ProfileSidebar;