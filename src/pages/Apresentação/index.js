import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from '../../services/api';
import './Styles.css';

const Apresentacao = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [ranking, setRanking] = useState([]);
    const [loadingRanking, setLoadingRanking] = useState(true);

    useEffect(() => {
        const searchMagistrados = async () => {
            if (searchTerm.trim().length > 2) {
                setIsSearching(true);
                try {
                    const response = await api.post("buscar_magistrado", { texto: searchTerm });
                    const dados = Array.isArray(response.data) ? response.data : [response.data];
                    setSearchResults(dados);
                } catch (error) {
                    console.error("Erro ao buscar magistrados:", error);
                    setSearchResults([]);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setSearchResults([]);
            }
        };

        const debounceTimer = setTimeout(searchMagistrados, 300);
        return () => clearTimeout(debounceTimer);
    }, [searchTerm]);

    useEffect(() => {
        const carregarRanking = async () => {
            try {
                const response = await api.get('/ranking_magistrados');
                setRanking(response.data.slice(0, 5)); // Top 5
            } catch (error) {
                console.error('Erro ao carregar ranking:', error);
            } finally {
                setLoadingRanking(false);
            }
        };
        
        carregarRanking();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/ranking?search=${searchTerm}`);
        }
    };

    const selectMagistrado = (magistrado) => {
        const nomeMagistrado = magistrado.Descricao || magistrado.nome;
        navigate(`/ranking?search=${nomeMagistrado}`);
    };

    return (
        <div className="apresentacao-container">
            <nav className="apresentacao-navbar">
                <div className="navbar-logo">
                    <img src="/Magisicon.png" alt="MagiScore" className="logo-icon" />
                    <span className="logo-text">MagiScore</span>
                </div>
                <div className="navbar-links">
                    <a href="#pesquisar" className="navbar-link" onMouseEnter={() => document.getElementById('pesquisar')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>Pesquisar</a>
                    <a href="#funcionalidades" className="navbar-link" onMouseEnter={() => document.getElementById('funcionalidades')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>Funcionalidades</a>
                    <a href="#ranking" className="navbar-link" onMouseEnter={() => document.getElementById('ranking')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>Ranking</a>
                    <a href="#contato" className="navbar-link" onMouseEnter={() => document.getElementById('contato')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>Contato</a>
                </div>
                <div className="navbar-buttons">
                    <button className="navbar-entrar" onClick={() => navigate('/login')}>
                        Entrar
                    </button>
                    <button className="navbar-cadastrar" onClick={() => navigate('/login')}>
                        Cadastrar
                    </button>
                </div>
            </nav>

            <div id="pesquisar" className="apresentacao-hero">
                <div className="hero-top">
                    <h1 className="hero-title">Construindo transparência todos os dias</h1>
                    <div className="hero-keywords">
                        <span className="keyword-badge">transparência</span>
                        <span className="keyword-badge">conexão</span>
                        <span className="keyword-badge">justiça</span>
                        <span className="keyword-badge">avaliação</span>
                        <span className="keyword-badge">magistrados</span>
                        <span className="keyword-badge">comunidade</span>
                        <span className="keyword-badge">ética</span>
                    </div>
                </div>

                <div className="hero-center">
                    <div className="search-container">
                        <form className="search-bar" onSubmit={handleSearch}>
                            <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="#95a5a6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <input
                                type="text"
                                placeholder="Buscar magistrado por nome..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input"
                            />
                        </form>
                        
                        {searchResults.length > 0 && (
                            <div className="search-results">
                                {searchResults.map((magistrado, index) => (
                                    <div 
                                        key={index} 
                                        className="search-result-item"
                                        onClick={() => selectMagistrado(magistrado)}
                                    >
                                        <div className="result-name">{magistrado.Descricao || magistrado.nome}</div>
                                        {magistrado.Descricao2 && (
                                            <div className="result-info">{magistrado.Descricao2}</div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        {isSearching && (
                            <div className="search-loading">Buscando...</div>
                        )}
                    </div>
                </div>

                <div className="hero-bottom">
                    <p className="hero-subtitle">
                        Conecte-se com a comunidade jurídica, compartilhe experiências e contribua para um sistema judiciário mais transparente.
                    </p>

                    <button className="hero-cta" onClick={() => navigate('/login')}>
                        Começar Agora
                    </button>
                </div>
            </div>

            <div id="funcionalidades" className="features-section">
                <div className="feature-card">
                    <div className="feature-icon">🌍</div>
                    <h3>Alcance Global</h3>
                    <p>Acesse avaliações de magistrados de todo o Brasil</p>
                </div>

                <div className="feature-card">
                    <div className="feature-icon">⚡</div>
                    <h3>Experiência Simples</h3>
                    <p>Interface intuitiva para avaliar e consultar rapidamente</p>
                </div>

                <div className="feature-card">
                    <div className="feature-icon">🔮</div>
                    <h3>Visão do Futuro</h3>
                    <p>Dados e estatísticas para decisões mais informadas</p>
                </div>
            </div>

            <section id="ranking" className="ranking-section">
                <h2 className="ranking-title">Top Magistrados</h2>
                <p className="ranking-subtitle">Os magistrados mais bem avaliados pela comunidade</p>
                
                {loadingRanking ? (
                    <div className="ranking-loading">Carregando ranking...</div>
                ) : (
                    <div className="ranking-list">
                        {ranking.map((magistrado, index) => (
                            <div key={magistrado.id || index} className="ranking-item">
                                <div className="ranking-position">
                                    <span className="position-number">{index + 1}</span>
                                    {index === 0 && <span className="medal">🥇</span>}
                                    {index === 1 && <span className="medal">🥈</span>}
                                    {index === 2 && <span className="medal">🥉</span>}
                                </div>
                                <div className="ranking-info">
                                    <h4 className="magistrado-name">{magistrado.nome}</h4>
                                    <div className="magistrado-stats">
                                        <span className="rating">{'⭐'.repeat(Math.round(magistrado.media))}</span>
                                        <span className="rating-number">{magistrado.media.toFixed(1)}</span>
                                        <span className="reviews-count">({magistrado.quantidade} avaliações)</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                
                <button className="ver-ranking-completo" onClick={() => navigate('/ranking')}>
                    Ver Ranking Completo
                </button>
            </section>

            <section id="sobre" className="team-section">
                <h2 className="team-title">Nossa Equipe</h2>
                <div className="team-cards">
                    <div className="team-card">
                        <div className="team-avatar">👨‍💻</div>
                        <h3>Felipe Belchior</h3>
                        <p className="team-role">Desenvolvedor Full Stack</p>
                        <p className="team-description">
                            Especialista em desenvolvimento web com foco em soluções jurídicas inovadoras.
                        </p>
                    </div>
                    <div className="team-card">
                        <div className="team-avatar">👩‍💻</div>
                        <h3>Alice Conceição</h3>
                        <p className="team-role">Desenvolvedora Frontend</p>
                        <p className="team-description">
                            Criadora de interfaces intuitivas e experiências de usuário excepcionais.
                        </p>
                    </div>
                </div>
            </section>

            <footer id="contato" className="apresentacao-footer">
                <div className="footer-social">
                    <a href="#" aria-label="Twitter">🐦</a>
                    <a href="#" aria-label="LinkedIn">💼</a>
                    <a href="#" aria-label="Instagram">📷</a>
                </div>
                <p className="footer-text">© 2024 MagiScore. Todos os Direitos Reservados. Política de Privacidade</p>
            </footer>

            {/* Chatbot Support Button */}
            <button className="chatbot-button" aria-label="Abrir chat de suporte">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C6.48 2 2 6.48 2 12C2 13.54 2.36 14.99 3 16.26V22L8.74 19C9.79 19.33 10.87 19.5 12 19.5C17.52 19.5 22 15.02 22 9.5C22 4.48 17.52 2 12 2Z" fill="currentColor"/>
                    <circle cx="8.5" cy="11" r="1.5" fill="white"/>
                    <circle cx="12" cy="11" r="1.5" fill="white"/>
                    <circle cx="15.5" cy="11" r="1.5" fill="white"/>
                </svg>
            </button>
        </div>
    );
};

export default Apresentacao;
