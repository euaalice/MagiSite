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
                    <div className="ranking-preview-title">Top 5 Magistrados</div>
                    {loading ? (
                        <p>Carregando ranking...</p>
                    ) : ranking.length === 0 ? (
                        <p>Nenhum magistrado avaliado ainda.</p>
                    ) : (
                        <table className="ranking-preview-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Nome</th>
                                    <th>Média</th>
                                    <th>Qtd. Avaliações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {ranking.map((mag, idx) => (
                                    <tr key={mag.id}>
                                        <td>{idx + 1}</td>
                                        <td>{mag.nome}</td>
                                        <td>{mag.media.toFixed(2)}</td>
                                        <td>{mag.quantidade}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                    <div style={{ textAlign: 'right', marginTop: 10 }}>
                        <button className="apresentacao-btn" style={{padding: '6px 18px', fontSize: 15}} onClick={() => navigate('/ranking/')}>Ver ranking completo</button>
                    </div>
                </div>

                <div className="sobre-box sobre-bg-amarelo">
                    <div className="sobre-title">Sobre o Projeto</div>
                    <div className="sobre-text">
                        O MagiScore nasceu para promover transparência e participação cidadã no Judiciário paulista. Usuários podem avaliar magistrados, consultar comentários e visualizar o ranking atualizado.
                    </div>
                    <div className="sobre-text">
                        <b>Funcionalidades:</b> Cadastro/Login, busca de magistrados, avaliações, comentários, ranking e painel de reputação.
                    </div>
                    <div className="sobre-text">
                        <b>Equipe:</b> Projeto colaborativo, aberto a sugestões e melhorias. Entre em contato para saber mais!
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Apresentacao;
