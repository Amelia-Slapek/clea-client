import React, { useState } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import "./Home.scss";
import CleaMenu from '../../styles/components/menu/Menu';
import Footer from '../../styles/components/footer/Footer';

import userBlue from "../../assets/USERBLUE.svg";
import mail from "../../assets/MAIL.svg";
import scale from "../../assets/SCALE.svg";
import science from "../../assets/SCIENCE.svg";
import blueuser from "../../assets/BLUEUSER.svg";
import blueScience from "../../assets/BLUESCIENCE.svg";
import blueDay from "../../assets/BLUEDAYNIGHT.svg";
import blueScale from "../../assets/BLUESCALE.svg";
import arrowDown from "../../assets/ARROWDOWN.svg";

export const HomePage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [openItems, setOpenItems] = useState(new Set());

    const handleNavigation = (path) => {
        navigate(path);
    };

    const toggleFaqItem = (index) => {
        const newOpenItems = new Set(openItems);
        if (newOpenItems.has(index)) {
            newOpenItems.delete(index);
        } else {
            newOpenItems.add(index);
        }
        setOpenItems(newOpenItems);
    };

    const faqData = [
        {
            question: "Jak działa analiza składów kosmetyków w serwisie?",
            answer: "Nasz serwis umożliwia analizę składu kosmetyków na podstawie składu produktu wklejonego przez użytkownika, w którym składniki są oddzielone przecinkami. Po zatwierdzeniu składu algorytm generuje ogólny raport prezentujący udział poszczególnych grup składników w formule oraz szczegółową listę składników. Każdy składnik opisany jest pod kątem poziomu bezpieczeństwa, nazwy, pochodzenia chemicznego oraz charakterystyki i funkcji w produkcie."
        },
        {
            question: "Czy analiza składu jest darmowa?",
            answer: "Tak, analiza składu jest całkowicie darmowa. Oferujemy również dostęp do kreatora rutyn pielęgnacyjnych dla zalogowanych użytkowników."
        },
        {
            question: "Jak często aktualizowana jest baza składników?",
            answer: "Nasza baza składników jest aktualizowana co miesiąc na podstawie najnowszych badań naukowych i regulacji prawnych."
        },
        {
            question: "Czy mogę zapisać moje rutyny pielęgnacyjne?",
            answer: "Tak, po utworzeniu darmowego konta możesz zapisywać wszystkie swoje rutyny pielęgnacyjne oraz dodawać produkty listy ulubionych."
        },
        {
            question: "Jak interpretować wyniki analizy?",
            answer: "Wyniki analizy są przedstawione w przejrzysty sposób z kolorowym kodowaniem: zielony - bezpieczne, żółty - akceptowalne, pomarańczowy - lepiej unikać, czerwony - niebezpieczne."
        },
    ];

    const guideSteps = [
        {
            icon: blueuser,
            title: "Załóż konto na naszej stronie",
            desc: "Tylko zalogowani użytkownicy mają dostęp do pełnej funkcji komponowania pielęgnacji i zapisywania swojego planu."
        },
        {
            icon: blueScience,
            title: "Wybierz składniki, których chcesz unikać",
            desc: "Zidentyfikuj składniki, na które jesteś uczulona lub których wolisz unikać (np. parabeny, silikony)."
        },
        {
            icon: blueDay,
            title: "Pielęgnacja dzienna czy wieczorna",
            desc: "Wybór pory pielęgnacji pozwoli w łatwy sposób zarządzać rutynami pielęgnacyjnymi zapiasanymi zapisanymi w profilu uzytkownika. Zapisuj, edytuj i opisuj swoje plany bez ograniczeń."
        },
        {
            icon: blueScale,
            title: "Sprawdzaj kompatybilność produktów",
            desc: "Po wybraniu produktu serwis automatycznie sprawdzi jego skład zgodnie z Twoimi preferencjami oraz jego kompatybilność z innymi kosmetykami."
        }
    ];

    const features = [
        { icon: mail, title: "Wsparcie", desc: "Zawsze chętnie służymy pomocą – możesz skontaktować się z nami mailowo, a odpowiemy tak szybko, jak to możliwe." },
        { icon: science, title: "Bogata baza", desc: "Posiadamy ogromną bazę składników kosmetycznych, którą nieustannie powiększamy." },
        { icon: scale, title: "Równowaga", desc: "Z łatwością dobierzesz produkty, które zadbają o skuteczność i utrzymanie naturalnej harmonii skóry." },
        { icon: userBlue, title: "Wygoda", desc: "Intuicyjny interfejs strony sprawia, że łatwo i szybko znajdziesz potrzebne informacje." }
    ];

    return (
        <div className="clea">
            <div className="clea-page">
                <CleaMenu
                    onNavigate={handleNavigation}
                    currentPath={location.pathname}
                />

                <main>
                    <section className="home-hero">
                        <div className="home-hero__content">
                            <header>
                                <h1 className="home-hero__title">
                                    chcesz dobrać <span className="home-hero__title--highlight">idealne kosmetyki?</span>
                                </h1>
                            </header>
                            <p className="home-hero__description">
                                Na naszej platformie sprawdzisz skład kosmetyków i stworzysz własne plany pielęgnacyjne, dopasowane do potrzeb Twojej skóry. Dzięki prostym narzędziom zrozumiesz działanie produktów i dopasujesz je do potrzeb swojej skóry.
                            </p>
                            <button className="home-hero__button" onClick={() => handleNavigation('/cosmeticsAnalysis')}>
                                Analiza składu
                            </button>
                        </div>
                        <div className="home-hero__image" role="img" aria-label="Kobieta dbająca o cerę"></div>
                    </section>
                    <section className="home-about" id="about-us">
                        <div className="home-about__image"></div>
                        <div className="home-about__content">
                            <header>
                                <h2 className="home-about__title">
                                    Poznaj <span className="home-about__title--highlight">Nas</span>
                                </h2>
                            </header>
                            <p className="home-about__description">
                                Nasza platforma powstała z pasji do świadomej pielęgnacji, aby pomóc osobom zagubionym w świecie skomplikowanych składów i kosmetyków. Ułatwiamy zrozumienie, co kryje się w produktach, i jak dopasować je do potrzeb Twojej skóry.
                            </p>

                            <ul className="home-about__features">
                                {features.map((feature, index) => (
                                    <li key={index} className="home-about__feature-item">
                                        <div className="home-about__feature-header">
                                            <img src={feature.icon} alt="" className="home-about__feature-icon" />
                                            <h3 className="home-about__feature-title">{feature.title}</h3>
                                        </div>
                                        <p className="home-about__feature-desc">{feature.desc}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </section>
                    <section className="home-guide">
                        <div className="home-guide__image"></div>
                        <div className="home-guide__content">
                            <header className="home-guide__header">
                                <h2 className="home-guide__title">
                                    Jak Ułożyć <span className="home-guide__title--highlight">Idealny Plan?</span>
                                </h2>
                                <p className="home-guide__description">
                                    Dzięki naszym wskazówkom skomponujesz spersonalizowany plan pielęgnacji krok po kroku, aby Twoja skóra wyglądała zdrowo i promiennie każdego dnia.
                                </p>
                            </header>

                            <ol className="home-guide__timeline">
                                {guideSteps.map((step, index) => (
                                    <li key={index} className="home-guide__step">
                                        <img src={step.icon} alt="" className="home-guide__step-icon" />
                                        <div className="home-guide__step-text">
                                            <h3 className="home-guide__step-title">{step.title}</h3>
                                            <p className="home-guide__step-desc">{step.desc}</p>
                                        </div>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    </section>
                    <section className="home-faq">
                        <header className="home-faq__header">
                            <h2 className="home-faq__title">
                                Najczęściej zadawane <span className="home-faq__title--highlight">Pytania</span>
                            </h2>
                        </header>

                        <div className="home-faq__list">
                            {faqData.map((item, index) => {
                                const isOpen = openItems.has(index);
                                return (
                                    <article
                                        key={index}
                                        className={`home-faq__item ${isOpen ? 'home-faq__item--active' : ''}`}
                                    >
                                        <div className="home-faq__item-container">
                                            <button
                                                className="home-faq__question-bar"
                                                onClick={() => toggleFaqItem(index)}
                                                aria-expanded={isOpen}
                                                aria-controls={`faq-answer-${index}`}
                                            >
                                                <span className="home-faq__question-text">{item.question}</span>
                                                <img
                                                    className="home-faq__arrow"
                                                    src={arrowDown}
                                                    alt={isOpen ? "Zwiń" : "Rozwiń"}
                                                />
                                            </button>
                                            <div
                                                id={`faq-answer-${index}`}
                                                className="home-faq__answer-block"
                                            >
                                                <hr className="home-faq__divider" />
                                                <p className="home-faq__answer-text">
                                                    {item.answer}
                                                </p>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    </section>
                </main>
            </div>
            <Footer />
        </div>
    );
};