import { NavLink, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import './Styles.css';

const NavBar = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [activeSection, setActiveSection] = useState('home');
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scroll para baixo
        setIsVisible(false);
      } else {
        // Scroll para cima
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);

      // Detectar seção ativa apenas na página inicial
      if (location.pathname === '/' || location.pathname === '') {
        const sections = document.querySelectorAll('.apresentacao-header, .ranking-preview, .sobre-box');
        const scrollPosition = window.scrollY + 200;

        sections.forEach((section, index) => {
          const sectionTop = section.offsetTop;
          const sectionHeight = section.offsetHeight;
          
          if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            if (index === 0) setActiveSection('home');
            else if (index === 1) setActiveSection('ranking');
            else if (index === 2) setActiveSection('sobre');
          }
        });
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY, location.pathname]);

  const scrollToSection = (sectionClass) => {
    const section = document.querySelector(`.${sectionClass}`);
    if (section) {
      window.scrollTo({
        top: section.offsetTop,
        behavior: 'smooth'
      });
    }
  };

  const isHomePage = location.pathname === '/' || location.pathname === '';

  return (
    <nav className={isVisible ? "navbar-visible" : "navbar-hidden"}>
      <div className="nav-container">
        <NavLink to="/" className="nav-logo">
          <img src="/MagisIcon.png" alt="MagiScore" className="nav-icon" />
        </NavLink>
        
        <ul className="nav-menu">
          {isHomePage ? (
            <>
              <li>
                <button 
                  onMouseEnter={() => scrollToSection('apresentacao-header')}
                  className={`nav-section-btn ${activeSection === 'home' ? 'active' : ''}`}
                >
                  Início
                </button>
              </li>
              <li>
                <button 
                  onMouseEnter={() => scrollToSection('ranking-preview')}
                  className={`nav-section-btn ${activeSection === 'ranking' ? 'active' : ''}`}
                >
                  Ranking
                </button>
              </li>
              <li>
                <button 
                  onMouseEnter={() => scrollToSection('sobre-box')}
                  className={`nav-section-btn ${activeSection === 'sobre' ? 'active' : ''}`}
                >
                  Sobre
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <NavLink to="/inicial/">Inicial</NavLink>
              </li>
              <li>
                <NavLink to="/ranking/">Ranking</NavLink>
              </li>
            </>
          )}
        </ul>

        <div className="nav-login">
          <NavLink to="/main/" className="nav-login-btn">Login / Cadastrar</NavLink>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
