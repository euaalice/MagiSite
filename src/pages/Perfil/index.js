import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import './Styles.css';
import '../Inicial/Styles.css'; // Importar estilos da Inicial para a sidebar

const Perfil = () => {
    const { tipo, id } = useParams(); // tipo: 'magistrado' ou 'advogado'
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [perfil, setPerfil] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('sobre');
    const [showChat, setShowChat] = useState(false);
    const [rightPanelOpen, setRightPanelOpen] = useState(false);

    useEffect(() => {
        carregarPerfil();
    }, [tipo, id]);

    const carregarPerfil = async () => {
        try {
            setLoading(true);
            console.log('Carregando perfil:', tipo, id);
            
            // Buscar dados do magistrado/advogado
            let response;
            if (tipo === 'magistrado') {
                // Primeiro tenta buscar por ID no banco
                try {
                    response = await api.get(`/buscar_magistrado/${id}`);
                } catch (err) {
                    // Se não encontrar, busca pelo nome decodificado
                    const nomeDecoded = decodeURIComponent(id);
                    response = await api.post('/buscar_magistrado', { texto: nomeDecoded });
                }
            } else if (tipo === 'advogado') {
                try {
                    response = await api.get(`/buscar_advogado/${id}`);
                } catch (err) {
                    const nomeDecoded = decodeURIComponent(id);
                    response = await api.post('/buscar_advogado', { texto: nomeDecoded });
                }
            }
            
            console.log('Resposta da API:', response.data);
            
            // Processa a resposta
            let dadosPerfil;
            if (Array.isArray(response.data)) {
                dadosPerfil = response.data[0];
            } else if (response.data.magistrado) {
                dadosPerfil = response.data.magistrado;
            } else if (response.data.advogado) {
                dadosPerfil = response.data.advogado;
            } else {
                dadosPerfil = response.data;
            }
            
            console.log('Dados do perfil:', dadosPerfil);
            setPerfil(dadosPerfil);
        } catch (error) {
            console.error('Erro ao carregar perfil:', error);
            // Define dados padrão para evitar tela em branco
            setPerfil({
                nome: decodeURIComponent(id),
                avaliacoes: [],
                cargo: 'Magistrado',
                sobre: 'Informações em atualização'
            });
        } finally {
            setLoading(false);
        }
    };

    const renderStars = (nota) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <span key={i} className={i <= nota ? 'star filled' : 'star'}>
                    ★
                </span>
            );
        }
        return stars;
    };

    const calcularMediaAvaliacoes = () => {
        if (!perfil?.avaliacoes || perfil.avaliacoes.length === 0) return 0;
        const soma = perfil.avaliacoes.reduce((acc, av) => acc + av.nota, 0);
        return (soma / perfil.avaliacoes.length).toFixed(1);
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const renderIcon = (iconName) => {
        const icons = {
            'dashboard': <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
            'search': <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        };
        return icons[iconName] || null;
    };

    if (loading) {
        return (
            <div className="perfil-loading">
                <div className="spinner"></div>
                <p>Carregando perfil...</p>
            </div>
        );
    }

    if (!perfil) {
        return (
            <div className="perfil-error">
                <h2>Perfil não encontrado</h2>
                <button onClick={() => navigate('/inicial')}>Voltar para Pesquisar</button>
            </div>
        );
    }

    const mediaAvaliacoes = calcularMediaAvaliacoes();

    return (
        <div className="inicial-dashboard">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <img src="/MagisIcon.png" alt="MagiScore" className="sidebar-logo" />
                    <span className="sidebar-brand">MagiScore</span>
                </div>

                <div className="sidebar-nav">
                    <div className="nav-section">
                        <span className="nav-section-label">PRINCIPAL</span>
                        <button
                            className="nav-item"
                            onClick={() => navigate('/inicial')}
                        >
                            <span className="nav-icon">{renderIcon('dashboard')}</span>
                            <span className="nav-label">Dashboard</span>
                        </button>
                        <button
                            className="nav-item active"
                            onClick={() => navigate('/inicial')}
                        >
                            <span className="nav-icon">{renderIcon('search')}</span>
                            <span className="nav-label">Pesquisar</span>
                        </button>
                    </div>
                </div>

                {/* User Profile at Bottom */}
                <div className="sidebar-footer">
                    <div className="sidebar-user-profile" style={{ cursor: 'pointer' }}>
                        {user?.foto ? (
                            <img 
                                src={user.foto} 
                                alt={user.nome} 
                                className="sidebar-avatar"
                                referrerPolicy="no-referrer"
                            />
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
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                                <polyline points="16 17 21 12 16 7"/>
                                <line x1="21" y1="12" x2="9" y2="12"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                {/* Internal Navbar */}
                <div className="internal-navbar">
                    <div className="navbar-left">
                        <div className="breadcrumb">
                            <span className="breadcrumb-item" onClick={() => navigate('/inicial')} style={{ cursor: 'pointer' }}>
                                Pesquisar
                            </span>
                            <span className="breadcrumb-separator">›</span>
                            <span className="breadcrumb-current">
                                Perfil {tipo === 'magistrado' ? 'do Magistrado' : 'do Advogado'} {perfil.nome}
                            </span>
                        </div>
                        <h1 className="page-title">
                            Perfil {tipo === 'magistrado' ? 'do Magistrado' : 'do Advogado'}
                        </h1>
                    </div>
                    <div className="navbar-right">
                        <button 
                            className="navbar-notification-btn"
                            onClick={() => setRightPanelOpen(!rightPanelOpen)}
                            title="Notificações e Suporte"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                            </svg>
                        </button>
                    </div>
                </div>
                
                {/* Conteúdo do Perfil */}
                <div className="perfil-content-wrapper">
                    {/* Header com informações principais */}
                    <div className="perfil-header">
                        <div className="perfil-header-content">
                            <div className="perfil-photo-section">
                                <div className="perfil-photo">
                                    {perfil.foto ? (
                                        <img src={perfil.foto} alt={perfil.nome} />
                                    ) : (
                                        <div className="perfil-photo-placeholder">
                                            {perfil.nome?.charAt(0)}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="perfil-main-info">
                                <h1 className="perfil-nome">{perfil.nome}</h1>
                                {tipo === 'magistrado' && (
                                    <>
                                        <p className="perfil-cargo">{perfil.cargo || 'Magistrado'}</p>
                                        {perfil.lotacao && (
                                            <p className="perfil-lotacao">{perfil.lotacao}</p>
                                        )}
                                        {perfil.setor && (
                                            <p className="perfil-setor">{perfil.setor}</p>
                                        )}
                                    </>
                                )}
                                {tipo === 'advogado' && (
                                    <>
                                        <p className="perfil-oab">OAB: {perfil.oab}{perfil.uf ? `/${perfil.uf}` : ''}</p>
                                        {perfil.especialidade && (
                                            <p className="perfil-especialidade">{perfil.especialidade}</p>
                                        )}
                                    </>
                                )}

                                <div className="perfil-rating">
                                    <div className="rating-stars">
                                        {renderStars(Math.round(mediaAvaliacoes))}
                                    </div>
                                    <span className="rating-number">{mediaAvaliacoes}</span>
                                    <span className="rating-count">({perfil.avaliacoes?.length || 0} avaliações)</span>
                                </div>
                            </div>

                            <div className="perfil-actions">
                                <button 
                                    className="btn-primary"
                                    onClick={() => navigate(`/inicial?section=avaliar-${tipo}&id=${id}`)}
                                >
                                    Avaliar
                                </button>
                                <button 
                                    className="btn-secondary"
                                    onClick={() => setShowChat(!showChat)}
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                                    </svg>
                                    Mensagem
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="perfil-body">
                <div className="perfil-sidebar">
                    {/* Informações de Contato */}
                    <div className="info-card">
                        <h3>Informações de Contato</h3>
                        {perfil.telefone && (
                            <div className="info-item">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                                </svg>
                                <span>{perfil.telefone}</span>
                            </div>
                        )}
                        {perfil.email && (
                            <div className="info-item">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                                    <polyline points="22,6 12,13 2,6"/>
                                </svg>
                                <span>{perfil.email}</span>
                            </div>
                        )}
                        {perfil.endereco && (
                            <div className="info-item">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                                    <circle cx="12" cy="10" r="3"/>
                                </svg>
                                <span>{perfil.endereco}</span>
                            </div>
                        )}
                    </div>

                    {/* Informações para Despachar (magistrado) */}
                    {tipo === 'magistrado' && (
                        <div className="info-card">
                            <h3>Informações para Despachar</h3>
                            {perfil.horarioAtendimento && (
                                <div className="info-item">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10"/>
                                        <polyline points="12 6 12 12 16 14"/>
                                    </svg>
                                    <span>{perfil.horarioAtendimento}</span>
                                </div>
                            )}
                            {perfil.formaDespacho && (
                                <div className="info-item">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                        <polyline points="14 2 14 8 20 8"/>
                                    </svg>
                                    <span>{perfil.formaDespacho}</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Funcionários do Gabinete */}
                    {tipo === 'magistrado' && perfil.funcionarios && perfil.funcionarios.length > 0 && (
                        <div className="info-card">
                            <h3>Equipe do Gabinete</h3>
                            <div className="funcionarios-list">
                                {perfil.funcionarios.map((func, index) => (
                                    <div key={index} className="funcionario-item">
                                        <div className="funcionario-avatar">
                                            {func.nome?.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="funcionario-nome">{func.nome}</p>
                                            <p className="funcionario-cargo">{func.cargo}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="perfil-main">
                    {/* Tabs */}
                    <div className="perfil-tabs">
                        <button 
                            className={`tab-btn ${activeTab === 'sobre' ? 'active' : ''}`}
                            onClick={() => setActiveTab('sobre')}
                        >
                            Sobre
                        </button>
                        <button 
                            className={`tab-btn ${activeTab === 'avaliacoes' ? 'active' : ''}`}
                            onClick={() => setActiveTab('avaliacoes')}
                        >
                            Avaliações
                        </button>
                        {tipo === 'magistrado' && (
                            <button 
                                className={`tab-btn ${activeTab === 'curriculo' ? 'active' : ''}`}
                                onClick={() => setActiveTab('curriculo')}
                            >
                                Currículo
                            </button>
                        )}
                    </div>

                    {/* Conteúdo das Tabs */}
                    <div className="tab-panel">
                        {activeTab === 'sobre' && (
                            <div className="sobre-section">
                                <h2>Sobre</h2>
                                <p>{perfil.sobre || 'Nenhuma informação disponível.'}</p>
                                
                                {tipo === 'magistrado' && perfil.areas && (
                                    <div className="areas-atuacao">
                                        <h3>Áreas de Atuação</h3>
                                        <div className="tags-list">
                                            {perfil.areas.map((area, index) => (
                                                <span key={index} className="tag">{area}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'avaliacoes' && (
                            <div className="avaliacoes-section">
                                <div className="avaliacoes-header">
                                    <h2>Avaliações</h2>
                                    <button 
                                        className="btn-avaliar"
                                        onClick={() => navigate(`/inicial?section=avaliar-${tipo}&id=${id}`)}
                                    >
                                        Escrever avaliação
                                    </button>
                                </div>

                                {perfil.avaliacoes && perfil.avaliacoes.length > 0 ? (
                                    <div className="avaliacoes-list">
                                        {perfil.avaliacoes.map((avaliacao, index) => (
                                            <div key={index} className="avaliacao-card">
                                                <div className="avaliacao-header">
                                                    <div className="avaliacao-user">
                                                        <div className="user-avatar">
                                                            {avaliacao.anonima ? '?' : avaliacao.usuario?.nome?.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="user-name">
                                                                {avaliacao.anonima ? 'Anônimo' : avaliacao.usuario?.nome}
                                                            </p>
                                                            <div className="avaliacao-stars">
                                                                {renderStars(avaliacao.nota)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <span className="avaliacao-data">
                                                        {new Date(avaliacao.createdAt).toLocaleDateString('pt-BR')}
                                                    </span>
                                                </div>
                                                {avaliacao.comentario && (
                                                    <p className="avaliacao-comentario">{avaliacao.comentario}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="no-avaliacoes">Ainda não há avaliações.</p>
                                )}
                            </div>
                        )}

                        {activeTab === 'curriculo' && tipo === 'magistrado' && (
                            <div className="curriculo-section">
                                <h2>Currículo</h2>
                                
                                {perfil.formacao && (
                                    <div className="curriculo-item">
                                        <h3>Formação</h3>
                                        <p>{perfil.formacao}</p>
                                    </div>
                                )}

                                {perfil.experiencia && (
                                    <div className="curriculo-item">
                                        <h3>Experiência</h3>
                                        <p>{perfil.experiencia}</p>
                                    </div>
                                )}

                                {perfil.publicacoes && (
                                    <div className="curriculo-item">
                                        <h3>Publicações</h3>
                                        <p>{perfil.publicacoes}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                </div>
                </div>
            </main>

            {/* Right Panel */}
            <aside className={`right-panel ${rightPanelOpen ? 'open' : ''}`}>
                <button 
                    className="right-panel-close-btn"
                    onClick={() => setRightPanelOpen(false)}
                    title="Fechar painel"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
                <div className="right-panel-content">
                    <h3>Notificações</h3>
                    <p>Nenhuma notificação no momento.</p>
                </div>
            </aside>

            {/* Chat Modal */}
            {showChat && (
                <div className="chat-modal">
                    <div className="chat-header">
                        <h3>Mensagem para {perfil.nome}</h3>
                        <button onClick={() => setShowChat(false)}>×</button>
                    </div>
                    <div className="chat-body">
                        <p>Funcionalidade de chat em desenvolvimento...</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Perfil;
