import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import './Styles.css';
import api from "../../services/api";

const Apresentacao = () => {
    const navigate = useNavigate();
    const [ranking, setRanking] = useState([]);
    const [loading, setLoading] = useState(true);

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

    return (
        <div className="apresentacao-container">
            <div className="apresentacao-content">
                <div className="apresentacao-header apresentacao-bg-neon">
                    <div className="apresentacao-title">MagiScore</div>
                    <div className="apresentacao-desc">
                        Bem-vindo à plataforma de avaliação e ranking de magistrados de São Paulo.<br/>
                        Aqui você pode consultar, avaliar e acompanhar o desempenho dos magistrados do TJSP de forma transparente e colaborativa.
                    </div>
                    <div className="apresentacao-btns">
                        <button className="apresentacao-btn" onClick={() => navigate('/main/')}>Login / Cadastrar</button>
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
