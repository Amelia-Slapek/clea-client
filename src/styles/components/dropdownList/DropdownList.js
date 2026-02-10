import React, { useState, useEffect, useRef } from 'react';
import './DropdownList.scss';

const ArrowIcon = ({ className }) => (
    <svg
        className={className}
        width="14"
        height="9"
        viewBox="0 0 14 9"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            d="M1 1L7 7L13 1"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

const DropdownList = ({
    data,
    options,
    selected,
    onSelect,
    defaultText
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleOptionClick = (option) => {
        setIsOpen(false);
        if (onSelect) onSelect(option);
    };
    if (options) {
        return (
            <div className="dropdown-select" ref={dropdownRef}>
                <div
                    className={`dropdown-select__header ${isOpen ? 'open' : ''}`}
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <span className="dropdown-select__value">
                        {selected || defaultText || 'Wybierz'}
                    </span>
                    <ArrowIcon className={`arrow-icon ${isOpen ? 'arrow-icon--rotated' : ''}`} />
                </div>

                {isOpen && (
                    <div className="dropdown-select__list">
                        {options.map((option, index) => (
                            <div
                                key={index}
                                className={`dropdown-select__item ${selected === option ? 'selected' : ''}`}
                                onClick={() => handleOptionClick(option)}
                            >
                                {option}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [expandedCategory, setExpandedCategory] = useState('');
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [selectedCategory, setSelectedCategory] = useState('');
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [selectedSubcategory, setSelectedSubcategory] = useState('');

    const handleCategoryClick = (category) => {
        if (expandedCategory === category) {
            setExpandedCategory('');
            setSelectedCategory('');
            setSelectedSubcategory('');
            if (onSelect) onSelect('', '');
        } else {
            setExpandedCategory(category);
            setSelectedCategory(category);
            setSelectedSubcategory('');
            if (onSelect) onSelect(category, '');
        }
    };

    const handleSubcategoryClick = (category, subcategory, e) => {
        e.stopPropagation();
        setSelectedSubcategory(subcategory);
        if (onSelect) onSelect(category, subcategory);
    };

    if (!data) return null;

    return (
        <nav className="category-nav">
            {Object.keys(data).map((category) => (
                <div key={category} className="category-nav__item">
                    <div
                        className={`category-nav__header ${selectedCategory === category ? 'category-nav__header--active' : ''}`}
                        onClick={() => handleCategoryClick(category)}
                    >
                        <span>{category}</span>
                        <ArrowIcon
                            className={`arrow-icon ${expandedCategory === category ? 'arrow-icon--rotated' : ''}`}
                        />
                    </div>

                    {expandedCategory === category && (
                        <div className="category-nav__sub-list">
                            {data[category].map((subcategory) => (
                                <div
                                    key={subcategory}
                                    className={`category-nav__sub-item ${selectedSubcategory === subcategory ? 'category-nav__sub-item--active' : ''}`}
                                    onClick={(e) => handleSubcategoryClick(category, subcategory, e)}
                                >
                                    {subcategory}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </nav>
    );
};

export default DropdownList;