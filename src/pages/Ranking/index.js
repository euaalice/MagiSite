import React, { useEffect, useState } from "react";
import api from "../../services/api";
import './Styles.css';

const Ranking = () => {
    const [ranking, setRanking] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMagistrado, setSelectedMagistrado] = useState(null);
    const [comentarios, setComentarios] = useState([]);
    const [loadingComentarios, setLoadingComentarios] = useState(false);

    useEffect(() => {
        const fetchRanking = async () => {
            setLoading(true);
            try {
                const response = await api.get("ranking_magistrados");
                setRanking(response.data);
            } catch (error) {
                setRanking([]);
                alert("Erro ao buscar ranking dos magistrados");
            } finally {
                setLoading(false);
            }
        };
        fetchRanking();
    }, []);

    const handleSelectMagistrado = async (mag) => {
        setSelectedMagistrado(mag);
        setLoadingComentarios(true);
        try {
            const response = await api.get(`avaliacoes_magistrado/${mag.id}`);
            setComentarios(response.data.avaliacoes || []);
        } catch (error) {
            setComentarios([]);
        } finally {
            setLoadingComentarios(false);
        }
    };

    return (
        <div className="ranking-container">
            <div className="ranking-content" style={{ display: 'flex', gap: 32 }}>
                <div style={{ flex: 2 }}>
                    <h1 className="ranking-title">Ranking dos Magistrados</h1>
                    {loading ? (
                        <p>Carregando ranking...</p>
                    ) : ranking.length === 0 ? (
                        <p>Nenhum magistrado avaliado ainda.</p>
                    ) : (
                        <table className="ranking-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Nome</th>
                                    <th>Média</th>
                                    <th>Qtd. Avaliações</th>
                                    <th>Idade</th>
                                </tr>
                            </thead>
                            <tbody>
                                {ranking.map((mag, idx) => (
                                    <tr key={mag.id} style={{ cursor: 'pointer' }} onClick={() => handleSelectMagistrado(mag)}>
                                        <td className="ranking-pos">{idx + 1}</td>
                                        <td className="ranking-nome">{mag.nome}</td>
                                        <td className="ranking-media">{mag.media.toFixed(2)}</td>
                                        <td className="ranking-quantidade">{mag.quantidade}</td>
                                        <td>{mag.idade}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
                <div style={{ flex: 1, minWidth: 280, maxWidth: 350 }}>
                    {selectedMagistrado && (
                        <div className="painel-comentarios">
                            <h2 style={{ color: '#764ba2', fontSize: 20, marginBottom: 12 }}>
                                Comentários de {selectedMagistrado.nome}
                            </h2>
                            {loadingComentarios ? (
                                <p>Carregando comentários...</p>
                            ) : comentarios.length === 0 ? (
                                <p>Nenhum comentário para este magistrado.</p>
                            ) : (
                                <ul className="lista-comentarios">
                                    {comentarios.map((c, i) => (
                                        <li key={i} className="comentario-item">
                                            <div style={{ fontWeight: 600, color: '#333' }}>
                                                {c.usuario?.nome || 'Usuário'}
                                                <span style={{ color: '#764ba2', marginLeft: 8 }}>
                                                    {"★".repeat(c.nota)}
                                                </span>
                                            </div>
                                            <div style={{ color: '#555', fontSize: 15, margin: '4px 0 8px' }}>
                                                {c.comentario || <i>Sem comentário</i>}
                                            </div>
                                            <div style={{ color: '#aaa', fontSize: 12 }}>
                                                {new Date(c.criadoEm).toLocaleDateString()}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Ranking;
