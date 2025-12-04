import React, { useState } from "react";
import api from "../../services/api";
import './Styles.css';

const Inicial = () => {
    const [busca, setBusca] = useState("");
    const [magistrados, setMagistrados] = useState([]);
    const [loading, setLoading] = useState(false);
    const [buscando, setBuscando] = useState(false);
    const [selectedMagistrado, setSelectedMagistrado] = useState(null);
    const [avaliacaoForm, setAvaliacaoForm] = useState({
        nota: 5,
        comentario: ""
    });

    // Busca magistrados na API externa
    const handleBuscar = async (e) => {
        e.preventDefault();
        if (!busca.trim()) {
            alert("Digite um nome para buscar");
            return;
        }

        setBuscando(true);
        try {
            const response = await api.post("buscar_magistrado", { texto: busca });
            console.log("Resposta da API:", response.data);
            console.log("Tipo de dados:", typeof response.data);
            console.log("É um array?", Array.isArray(response.data));
            
            // Se for um array, usa direto. Se for um objeto, converte para array
            const dados = Array.isArray(response.data) ? response.data : [response.data];
            setMagistrados(dados);
        } catch (error) {
            console.error("Erro na busca:", error);
            alert("Erro ao buscar magistrados");
            setMagistrados([]);
        } finally {
            setBuscando(false);
        }
    };

    // Seleciona magistrado para avaliar
    const handleSelectMagistrado = (magistrado) => {
        setSelectedMagistrado(magistrado);
        setAvaliacaoForm({ nota: 5, comentario: "" });
    };

    // Submete avaliação
    const handleSubmitAvaliacao = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await api.post("avaliar_magistrado", {
                nomeMagistrado: selectedMagistrado.Descricao || selectedMagistrado.nome,
                idadeMagistrado: selectedMagistrado.idade || "Não informado",
                nota: parseInt(avaliacaoForm.nota),
                comentario: avaliacaoForm.comentario
            });

            console.log("Avaliação enviada:", response.data);
            alert("Avaliação registrada com sucesso!");
            setSelectedMagistrado(null);
            setBusca("");
            setMagistrados([]);
            setAvaliacaoForm({ nota: 5, comentario: "" });
        } catch (error) {
            console.error("Erro ao avaliar:", error);
            alert("Erro ao registrar avaliação");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="inicial-container">
            <div className="inicial-content">
                <h1>Avalie Magistrados</h1>
                <p className="subtitle">Busque por um magistrado e compartilhe sua avaliação</p>

                {!selectedMagistrado ? (
                    <>
                        {/* Formulário de Busca */}
                        <form onSubmit={handleBuscar} className="search-form">
                            <div className="search-input-group">
                                <input
                                    type="text"
                                    value={busca}
                                    onChange={(e) => setBusca(e.target.value)}
                                    placeholder="Digite o nome do magistrado..."
                                    className="search-input"
                                />
                                <button
                                    type="submit"
                                    disabled={buscando}
                                    className="search-button"
                                >
                                    {buscando ? "Buscando..." : "Buscar"}
                                </button>
                            </div>
                        </form>

                        {/* Lista de Magistrados */}
                        {magistrados.length > 0 ? (
                            <div className="magistrados-list">
                                <h2>Resultados encontrados ({magistrados.length})</h2>
                                {magistrados.map((magistrado, index) => (
                                    <div key={index} className="magistrado-card">
                                        <div className="magistrado-info">
                                            <h3>{magistrado.Descricao || magistrado.nome || `Magistrado ${index + 1}`}</h3>
                                            {magistrado.Codigo && (
                                                <p className="magistrado-descricao">
                                                    Código: {magistrado.Codigo}
                                                </p>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => handleSelectMagistrado(magistrado)}
                                            className="btn-avaliar"
                                        >
                                            Avaliar
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            busca && !buscando && (
                                <div className="no-results">
                                    <p>Nenhum magistrado encontrado</p>
                                </div>
                            )
                        )}
                    </>
                ) : (
                    <>
                        {/* Formulário de Avaliação */}
                        <div className="avaliacao-form-container">
                            <div className="avaliacao-header">
                                <button
                                    onClick={() => setSelectedMagistrado(null)}
                                    className="btn-voltar"
                                >
                                    ← Voltar
                                </button>
                                <h2>Avaliar {selectedMagistrado.Descricao || selectedMagistrado.nome || selectedMagistrado.id}</h2>
                            </div>

                            <form onSubmit={handleSubmitAvaliacao} className="avaliacao-form">
                                <div className="form-group">
                                    <label htmlFor="nota">Nota (Estrelas)</label>
                                    <div className="stars-container">
                                        <select
                                            id="nota"
                                            value={avaliacaoForm.nota}
                                            onChange={(e) =>
                                                setAvaliacaoForm({
                                                    ...avaliacaoForm,
                                                    nota: e.target.value
                                                })
                                            }
                                            className="stars-select"
                                        >
                                            <option value="1">⭐ - Muito Ruim</option>
                                            <option value="2">⭐⭐ - Ruim</option>
                                            <option value="3">⭐⭐⭐ - Bom</option>
                                            <option value="4">⭐⭐⭐⭐ - Muito Bom</option>
                                            <option value="5">⭐⭐⭐⭐⭐ - Excelente</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="comentario">Comentário (Opcional)</label>
                                    <textarea
                                        id="comentario"
                                        value={avaliacaoForm.comentario}
                                        onChange={(e) =>
                                            setAvaliacaoForm({
                                                ...avaliacaoForm,
                                                comentario: e.target.value
                                            })
                                        }
                                        placeholder="Compartilhe sua experiência..."
                                        className="form-textarea"
                                        rows="5"
                                        maxLength="500"
                                    />
                                    <span className="char-count">
                                        {avaliacaoForm.comentario.length}/500
                                    </span>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn-submit-avaliacao"
                                >
                                    {loading ? "Enviando..." : "Enviar Avaliação"}
                                </button>
                            </form>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Inicial;
