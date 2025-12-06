import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import './Styles.css';
import api from "../../services/api";

const Apresentacao = () => {
    const navigate = useNavigate();
    const [ranking, setRanking] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);

    useEffect(() => {
        const fetchRanking = async () => {
            setLoading(true);
            try {
                const response = await api.get("ranking_magistrados");
                setRanking(response.data.slice(0, 5)); // mostra só os top 5
            } catch (error) {
                setRanking([]);
            } finally {
                setLoading(false);
            }
        };
        fetchRanking();
    }, []);

    useEffect(() => {
        let isScrolling = false;
        let scrollTimeout;
        const sections = document.querySelectorAll('.apresentacao-header, .ranking-preview, .sobre-box');
        
        const handleScroll = () => {
            if (isScrolling) return;
            
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                const scrollPosition = window.scrollY + window.innerHeight / 2;
                
                sections.forEach((section) => {
                    const sectionTop = section.offsetTop;
                    const sectionHeight = section.offsetHeight;
                    
                    if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                        isScrolling = true;
                        window.scrollTo({
                            top: sectionTop,
                            behavior: 'smooth'
                        });
                        setTimeout(() => {
                            isScrolling = false;
                        }, 1000);
                    }
                });
            }, 150);
        };
        
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
            clearTimeout(scrollTimeout);
        };
    }, []);

    useEffect(() => {
        const searchMagistrados = async () => {
            if (searchTerm.trim().length === 0) {
                setSearchResults([]);
                return;
            }

            setSearchLoading(true);
            try {
                const response = await api.post("buscar_magistrado", { texto: searchTerm });
                console.log("Resposta da API:", response.data);
                console.log("Tipo de dados:", typeof response.data);
                console.log("É um array?", Array.isArray(response.data));
                
                // Se for um array, usa direto. Se for um objeto, converte para array
                const dados = Array.isArray(response.data) ? response.data : [response.data];
                setSearchResults(dados);
            } catch (error) {
                console.error("Erro ao buscar magistrados:", error);
                setSearchResults([]);
            } finally {
                setSearchLoading(false);
            }
        };

        const debounceTimer = setTimeout(() => {
            searchMagistrados();
        }, 300);

        return () => clearTimeout(debounceTimer);
    }, [searchTerm]);

    return (
        <div className="apresentacao-container">
            <div className="apresentacao-content">
                <div className="apresentacao-header apresentacao-bg-neon">
                    <div className="apresentacao-title">MagiScore</div>
                    <div className="apresentacao-desc">
                        A plataforma definitiva para avaliação e ranking de magistrados de São Paulo.<br/>
                        Transparência, colaboração e dados do TJSP ao seu alcance.
                    </div>
                    
                    <div className="search-section">
                        <div className="search-box">
                            <input 
                                type="text" 
                                placeholder="Buscar por nome ou comarca..." 
                                className="main-search-input"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <button className="main-search-btn" onClick={() => navigate('/inicial/')}>
                                Pesquisar
                            </button>
                        </div>
                        {searchTerm && (
                            <div className="search-results">
                                {searchLoading ? (
                                    <div className="search-result-item">Buscando...</div>
                                ) : searchResults.length > 0 ? (
                                    searchResults.map((magistrado, index) => (
                                        <div 
                                            key={index} 
                                            className="search-result-item"
                                            onClick={() => {
                                                navigate('/inicial/');
                                            }}
                                        >
                                            {magistrado.Descricao || magistrado.nome || `Magistrado ${index + 1}`}
                                        </div>
                                    ))
                                ) : (
                                    <div className="search-result-item">Nenhum magistrado encontrado</div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="features-section">
                        <div className="feature-item">
                            <div className="feature-icon">🛡️</div>
                            <div className="feature-title">Avaliações Seguras</div>
                        </div>
                        <div className="feature-item">
                            <div className="feature-icon">📊</div>
                            <div className="feature-title">Ranking Atualizado</div>
                        </div>
                        <div className="feature-item">
                            <div className="feature-icon">🏛️</div>
                            <div className="feature-title">Dados do TJSP</div>
                        </div>
                    </div>
                </div>

                <div className="ranking-preview">
                    <div className="ranking-content-wrapper">
                        <div className="ranking-info-section">
                            <h2 className="ranking-section-title">Por Que MagiScore?</h2>
                            <div className="info-card">
                                <h3 className="info-card-title">🎯 Redução da Incerteza</h3>
                                <p className="info-card-text">
                                    Conheça o perfil técnico e comportamental do julgador para melhor preparar 
                                    estratégias processuais e aumentar as chances de êxito.
                                </p>
                            </div>
                            <div className="info-card">
                                <h3 className="info-card-title">⚖️ Transparência Judicial</h3>
                                <p className="info-card-text">
                                    Promovemos accountability no Judiciário através de métricas qualitativas e 
                                    subjetivas sobre o "fator humano" do magistrado.
                                </p>
                            </div>
                            <div className="info-card">
                                <h3 className="info-card-title">📈 Inteligência de Dados</h3>
                                <p className="info-card-text">
                                    Análises estatísticas, mapas interativos e indicadores de tendência transformam 
                                    dados em estratégia jurídica eficiente.
                                </p>
                            </div>
                        </div>

                        <div className="ranking-table-section">
                            <h2 className="ranking-section-title">Top 5 Magistrados</h2>
                            {loading ? (
                                <p className="ranking-loading">Carregando ranking...</p>
                            ) : ranking.length === 0 ? (
                                <p className="ranking-empty">Nenhum magistrado avaliado ainda.</p>
                            ) : (
                                <>
                                    <div className="ranking-table-container">
                                        <table className="ranking-preview-table">
                                            <thead>
                                                <tr>
                                                    <th>#</th>
                                                    <th>Nome</th>
                                                    <th>Média</th>
                                                    <th>Avaliações</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {ranking.map((mag, idx) => (
                                                    <tr key={mag.id}>
                                                        <td className="ranking-position">{idx + 1}</td>
                                                        <td className="ranking-name">{mag.nome}</td>
                                                        <td className="ranking-score">
                                                            <span className="score-value">{mag.media.toFixed(1)}</span>
                                                            <span className="score-stars">⭐</span>
                                                        </td>
                                                        <td className="ranking-count">{mag.quantidade}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <button 
                                        className="btn-ver-ranking" 
                                        onClick={() => navigate('/ranking/')}
                                    >
                                        Ver Ranking Completo →
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="sobre-box sobre-bg-amarelo">
                    <div className="team-section">
                        <div className="team-title">Conheça a Equipe</div>
                        <div className="team-cards">
                            <div className="team-card">
                                <div className="team-photo">
                                    <div className="photo-placeholder">FM</div>
                                </div>
                                <div className="team-info">
                                    <h3 className="team-name">Felipe Oliveira Marçon Belchior</h3>
                                    <p className="team-role">Desenvolvedor Full Stack</p>
                                    <p className="team-description">
                                        Especialista em desenvolvimento web com foco em soluções inovadoras para o setor jurídico. 
                                        Apaixonado por tecnologia e transparência pública, trabalha para criar ferramentas que aproximem 
                                        cidadãos e instituições.
                                    </p>
                                </div>
                            </div>

                            <div className="team-card">
                                <div className="team-photo">
                                    <div className="photo-placeholder">AC</div>
                                </div>
                                <div className="team-info">
                                    <h3 className="team-name">Alice Conceição do Nascimento</h3>
                                    <p className="team-role">Desenvolvedora Full Stack</p>
                                    <p className="team-description">
                                        Desenvolvedora criativa com expertise em design de interfaces e experiência do usuário. 
                                        Comprometida em construir plataformas acessíveis e intuitivas que promovam a participação 
                                        cidadã no sistema judiciário.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="contact-section">
                        <div className="contact-title">Fale Conosco</div>
                        <div className="contact-info">
                            <p className="contact-text">
                                Tem alguma dúvida, sugestão ou quer saber mais sobre o MagiScore?
                            </p>
                            <div className="contact-details">
                                <div className="contact-item">
                                    <span className="contact-icon">📧</span>
                                    <span className="contact-label">contato@magiscore.com.br</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Apresentacao;
