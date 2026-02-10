import React from 'react';
import searchIcon from '../../../assets/SEARCH.svg'
import './SearchBar.scss';

const SearchBar = ({ value, onChange, placeholder = "Szukaj...", className = '', ...props }) => {
    return (
        <div className={`search-box ${className}`}>
            <img src={searchIcon} alt="Szukaj" className="search-icon" />
            <input
                type="text"
                className="search-input"
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                autoComplete="off"
                {...props}
            />
        </div>
    );
};

export default SearchBar;