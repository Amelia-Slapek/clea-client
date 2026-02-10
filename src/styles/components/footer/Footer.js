import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Footer.scss";

const Footer = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const scrollToSection = (sectionId) => {
        if (location.pathname !== '/') {
            navigate('/');
            setTimeout(() => {
                const element = document.getElementById(sectionId);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                }
            }, 100);
        } else {
            const element = document.getElementById(sectionId);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }
    };

    const navigateToPage = (path) => {
        navigate(path);
        window.scrollTo(0, 0);
    };

    const openMail = () => {
        window.location.href = 'mailto:cela.kontakt@gmail.com';
    };

    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-links-grid">
                    <div className="footer-column">
                        <h3 className="footer-center-links-part-header">Funkcje</h3>
                        <div className="footer-column-links">
                            <span className="footer-center-links-part-box-link" onClick={() => navigateToPage('/cosmeticsAnalysis')}>
                                Analiza
                            </span>
                            <span className="footer-center-links-part-box-link" onClick={() => navigateToPage('/products')}>
                                Produkty
                            </span>
                            <span className="footer-center-links-part-box-link" onClick={() => navigateToPage('/skinCare')}>
                                Ułóż pielęgnację
                            </span>
                            <span className="footer-center-links-part-box-link" onClick={() => navigateToPage('/articles')}>
                                Artykuły
                            </span>
                        </div>
                    </div>
                    <div className="footer-column">
                        <h3 className="footer-center-links-part-header">Clea</h3>
                        <div className="footer-column-links">
                            <span className="footer-center-links-part-box-link" onClick={() => scrollToSection('about-us')}>
                                Poznaj nas
                            </span>
                            <span className="footer-center-links-part-box-link" onClick={() => scrollToSection('how-to-join')}>
                                Jak dołączyć?
                            </span>
                            <span className="footer-center-links-part-box-link" onClick={() => scrollToSection('faq')}>
                                FAQ
                            </span>
                        </div>
                    </div>
                    <div className="footer-column">
                        <h3 className="footer-center-links-part-header">Kontakt</h3>
                        <div className="footer-column-links">
                            <a
                                href="mailto:clea@gmail.com"
                                className="footer-center-links-part-mail"
                                onClick={(e) => {
                                    e.preventDefault();
                                    openMail();
                                }}
                            >
                                cela.kontakt@gmail.com
                            </a>
                        </div>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>&copy; {new Date().getFullYear()} Clea. Wszelkie prawa zastrzeżone.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;