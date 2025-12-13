import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import './Styles.css';

const Inicial = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState('dashboard');
    const [busca, setBusca] = useState("");
    const [magistrados, setMagistrados] = useState([]);
    const [buscando, setBuscando] = useState(false);
    const [selectedMagistrado, setSelectedMagistrado] = useState(null);
    const [avaliacaoForm, setAvaliacaoForm] = useState({
        nota: 5,
        comentario: ""
    });
    const [minhasAvaliacoes, setMinhasAvaliacoes] = useState([]);
    const [ranking, setRanking] = useState([]);
    const [loadingAvaliacoes, setLoadingAvaliacoes] = useState(false);

    useEffect(() => {
        if (activeSection === 'minhas-avaliacoes') {
            carregarMinhasAvaliacoes();
        } else if (activeSection === 'ranking') {
            carregarRanking();
        }
    }, [activeSection]);

    const carregarMinhasAvaliacoes = async () => {
        setLoadingAvaliacoes(true);
        try {
            const response = await api.get('/usuario/minhas_avaliacoes');
            setMinhasAvaliacoes(response.data);
        } catch (error) {
            console.error('Erro ao carregar avaliações:', error);
        } finally {
            setLoadingAvaliacoes(false);
        }
    };

    const carregarRanking = async () => {
        setLoadingAvaliacoes(true);
        try {
            const response = await api.get('/ranking_magistrados');
            setRanking(response.data);
        } catch (error) {
            console.error('Erro ao carregar ranking:', error);
        } finally {
            setLoadingAvaliacoes(false);
        }
    };

    const handleBuscar = async (e) => {
        e.preventDefault();
        if (!busca.trim()) return;

        setBuscando(true);
        try {
            const response = await api.post("buscar_magistrado", { texto: busca });
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

    const handleSelectMagistrado = (magistrado) => {
        setSelectedMagistrado(magistrado);
        setAvaliacaoForm({ nota: 5, comentario: "" });
    };

    const handleSubmitAvaliacao = async (e) => {
        e.preventDefault();

        try {
            await api.post("avaliar_magistrado", {
                nomeMagistrado: selectedMagistrado.Descricao || selectedMagistrado.nome,
                idadeMagistrado: selectedMagistrado.idade || "Não informado",
                nota: parseInt(avaliacaoForm.nota),
                comentario: avaliacaoForm.comentario
            });

            alert("Avaliação registrada com sucesso!");
            setSelectedMagistrado(null);
            setBusca("");
            setMagistrados([]);
            setAvaliacaoForm({ nota: 5, comentario: "" });
        } catch (error) {
            console.error("Erro ao avaliar:", error);
            alert("Erro ao registrar avaliação");
        }
    };

    const renderStars = (nota) => {
        return '⭐'.repeat(nota);
    };

    const getMenuItems = () => {
        const baseItems = [
            { id: 'dashboard', icon: '📊', label: 'Dashboard' },
            { id: 'avaliar', icon: '⭐', label: 'Avaliar Magistrado' },
            { id: 'minhas-avaliacoes', icon: '📝', label: 'Minhas Avaliações' },
            { id: 'ranking', icon: '🏆', label: 'Ranking' }
        ];

        if (user?.tipo === 'advogado') {
            baseItems.push({ id: 'clientes', icon: '👥', label: 'Meus Clientes' });
        }

        if (user?.tipo === 'magistrado') {
            baseItems.push({ id: 'estatisticas', icon: '📈', label: 'Estatísticas' });
        }

        return baseItems;
    };

    const renderContent = () => {
        switch (activeSection) {
            case 'dashboard':
                return renderDashboard();
            case 'avaliar':
                return renderAvaliar();
            case 'minhas-avaliacoes':
                return renderMinhasAvaliacoes();
            case 'ranking':
                return renderRanking();
            case 'clientes':
                return renderClientes();
            case 'estatisticas':
                return renderEstatisticas();
            default:
                return renderDashboard();
        }
    };

    const renderDashboard = () => (
        <div className="dashboard-content">
            <h2>Bem-vindo, {user?.nome}! 👋</h2>
            <p className="dashboard-subtitle">
                {user?.tipo === 'comum' && 'Avalie magistrados e veja rankings'}
                {user?.tipo === 'advogado' && 'Gerencie seus clientes e avalie magistrados'}
                {user?.tipo === 'magistrado' && 'Veja suas estatísticas e avaliações'}
            </p>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">⭐</div>
                    <div className="stat-info">
                        <h3>{minhasAvaliacoes.length || 0}</h3>
                        <p>Avaliações Feitas</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">🏆</div>
                    <div className="stat-info">
                        <h3>{ranking.length || 0}</h3>
                        <p>Magistrados Cadastrados</p>
                    </div>
                </div>

                {user?.tipo === 'advogado' && (
                    <div className="stat-card">
                        <div className="stat-icon">👥</div>
                        <div className="stat-info">
                            <h3>0</h3>
                            <p>Clientes Ativos</p>
                        </div>
                    </div>
                )}

                <div className="stat-card">
                    <div className="stat-icon">📊</div>
                    <div className="stat-info">
                        <h3 style={{textTransform: 'capitalize'}}>{user?.tipo}</h3>
                        <p>Tipo de Conta</p>
                    </div>
                </div>
            </div>

            <div className="quick-actions">
                <h3>Ações Rápidas</h3>
                <div className="actions-grid">
                    <button onClick={() => setActiveSection('avaliar')} className="action-btn">
                        <span className="action-icon">⭐</span>
                        <span>Avaliar Magistrado</span>
                    </button>
                    <button onClick={() => setActiveSection('ranking')} className="action-btn">
                        <span className="action-icon">🏆</span>
                        <span>Ver Ranking</span>
                    </button>
                    <button onClick={() => setActiveSection('minhas-avaliacoes')} className="action-btn">
                        <span className="action-icon">📝</span>
                        <span>Minhas Avaliações</span>
                    </button>
                </div>
            </div>
        </div>
    );

    const renderAvaliar = () => (
        <div className="avaliar-content">
            {!selectedMagistrado ? (
                <>
                    <h2>Buscar Magistrado</h2>
                    <form onSubmit={handleBuscar} className="search-form">
                        <div className="search-input-group">
                            <input
                                type="text"
                                value={busca}
                                onChange={(e) => setBusca(e.target.value)}
                                placeholder="Digite o nome do magistrado..."
                                className="search-input"
                            />
                            <button type="submit" disabled={buscando} className="search-button">
                                {buscando ? "Buscando..." : "Buscar"}
                            </button>
                        </div>
                    </form>

                    {magistrados.length > 0 && (
                        <div className="resultados-lista">
                            <h3>Resultados ({magistrados.length})</h3>
                            {magistrados.map((mag, index) => (
                                <div key={index} className="resultado-item" onClick={() => handleSelectMagistrado(mag)}>
                                    <div className="resultado-info">
                                        <h4>{mag.Descricao || mag.nome}</h4>
                                        <p>{mag.Descricao2 || ''}</p>
                                    </div>
                                    <button className="select-btn">Avaliar</button>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            ) : (
                <div className="avaliacao-form-container">
                    <button onClick={() => setSelectedMagistrado(null)} className="back-btn">← Voltar</button>
                    
                    <h2>Avaliar: {selectedMagistrado.Descricao || selectedMagistrado.nome}</h2>
                    
                    <form onSubmit={handleSubmitAvaliacao} className="avaliacao-form">
                        <div className="form-group">
                            <label>Nota (1-5 estrelas)</label>
                            <div className="rating-input">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        className={`star-btn ${avaliacaoForm.nota >= star ? 'active' : ''}`}
                                        onClick={() => setAvaliacaoForm({ ...avaliacaoForm, nota: star })}
                                    >
                                        ⭐
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Comentário (opcional)</label>
                            <textarea
                                value={avaliacaoForm.comentario}
                                onChange={(e) => setAvaliacaoForm({ ...avaliacaoForm, comentario: e.target.value })}
                                placeholder="Conte sua experiência..."
                                rows="4"
                            />
                        </div>

                        <button type="submit" className="submit-btn">Enviar Avaliação</button>
                    </form>
                </div>
            )}
        </div>
    );

    const renderMinhasAvaliacoes = () => (
        <div className="avaliacoes-content">
            <h2>Minhas Avaliações</h2>
            {loadingAvaliacoes ? (
                <p>Carregando...</p>
            ) : minhasAvaliacoes.length === 0 ? (
                <div className="empty-state">
                    <p>Você ainda não fez nenhuma avaliação</p>
                    <button onClick={() => setActiveSection('avaliar')} className="cta-btn">
                        Fazer primeira avaliação
                    </button>
                </div>
            ) : (
                <div className="avaliacoes-lista">
                    {minhasAvaliacoes.map((item, index) => (
                        <div key={index} className="avaliacao-card">
                            <h3>{item.magistrado.nome}</h3>
                            <div className="avaliacao-nota">{renderStars(item.avaliacao.nota)}</div>
                            {item.avaliacao.comentario && (
                                <p className="avaliacao-comentario">{item.avaliacao.comentario}</p>
                            )}
                            <p className="avaliacao-data">
                                {new Date(item.avaliacao.criadoEm).toLocaleDateString()}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    const renderRanking = () => (
        <div className="ranking-content">
            <h2>Ranking de Magistrados</h2>
            {loadingAvaliacoes ? (
                <p>Carregando...</p>
            ) : (
                <div className="ranking-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Posição</th>
                                <th>Nome</th>
                                <th>Média</th>
                                <th>Avaliações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ranking.map((mag, index) => (
                                <tr key={mag.id}>
                                    <td className="ranking-position">{index + 1}º</td>
                                    <td>{mag.nome}</td>
                                    <td>{renderStars(Math.round(mag.media))} ({mag.media})</td>
                                    <td>{mag.quantidade}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );

    const renderClientes = () => (
        <div className="clientes-content">
            <h2>Meus Clientes</h2>
            <p className="feature-coming-soon">Funcionalidade em desenvolvimento para advogados</p>
        </div>
    );

    const renderEstatisticas = () => (
        <div className="estatisticas-content">
            <h2>Estatísticas</h2>
            <p className="feature-coming-soon">Funcionalidade em desenvolvimento para magistrados</p>
        </div>
    );

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="inicial-dashboard">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <h2>MagiScore</h2>
                </div>

                {/* User Profile in Sidebar */}
                <div className="sidebar-user-profile">
                    {user?.foto ? (
                        <img src={user.foto} alt={user.nome} className="sidebar-avatar" />
                    ) : (
                        <div className="sidebar-avatar-placeholder">
                            {user?.nome?.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <div className="sidebar-user-info">
                        <h4>{user?.nome}</h4>
                        <span className="sidebar-user-badge">{user?.tipo}</span>
                    </div>
                    <button onClick={handleLogout} className="sidebar-logout-btn" title="Sair">
                        🚪
                    </button>
                </div>

                <div className="sidebar-nav">
                    {getMenuItems().map((item) => (
                        <button
                            key={item.id}
                            className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
                            onClick={() => setActiveSection(item.id)}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            <span className="nav-label">{item.label}</span>
                        </button>
                    ))}
                </div>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                {renderContent()}
            </main>

            {/* Right Panel */}
            <aside className="right-panel">
                <div className="user-profile-card">
                    {user?.foto ? (
                        <img src={user.foto} alt={user.nome} className="profile-avatar" />
                    ) : (
                        <div className="profile-avatar-placeholder">
                            {user?.nome?.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <h3>{user?.nome}</h3>
                    <p className="user-email">{user?.email}</p>
                    <span className="user-badge">{user?.tipo}</span>
                    {user?.oab && <p className="user-credential">OAB: {user.oab}</p>}
                    {user?.cnj && <p className="user-credential">CNJ: {user.cnj}</p>}
                </div>

                <div className="notifications-card">
                    <h4>Notificações</h4>
                    <div className="notification-item">
                        <span className="notif-icon">🔔</span>
                        <p>Bem-vindo ao MagiScore!</p>
                    </div>
                </div>
            </aside>
        </div>
    );
};

export default Inicial;
