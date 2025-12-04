import { NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import './Styles.css';

const NavBar = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

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
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <nav className={isVisible ? "navbar-visible" : "navbar-hidden"}>
      <ul>
        <li>
          <NavLink to="/main/" className={({isActive}) => isActive ? "apresentacao-btn" : "apresentacao-btn"} style={{marginRight: 12}}>Login / Cadastrar</NavLink>
        </li>
        <li>
          <NavLink to="/inicial/">Inicial</NavLink>
        </li>
        <li>
          <NavLink to="/ranking/">Ranking</NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default NavBar;
