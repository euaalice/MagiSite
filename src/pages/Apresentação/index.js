import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from '../../services/api';
import './Styles.css';

const Apresentacao = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searchType, setSearchType] = useState("magistrado");
    const [ranking, setRanking] = useState([]);
    const [loadingRanking, setLoadingRanking] = useState(true);
    const [comentarios, setComentarios] = useState([]);
    const [loadingComentarios, setLoadingComentarios] = useState(true);
    const [modalAdvogado, setModalAdvogado] = useState(null);
    const [loadingDetalhes, setLoadingDetalhes] = useState(false);

    useEffect(() => {
        const performSearch = async () => {
            if (searchTerm.trim().length > 2) {
                setIsSearching(true);
                try {
                    if (searchType === 'magistrado') {
                        // Busca magistrados no TJSP com autocomplete
                        const response = await api.get('/tjsp/autocomplete_magistrado', {
                            params: { nome: searchTerm.trim() }
                        });
                        
                        if (response.data.success && response.data.magistrados) {
                            // Transforma os dados do TJSP para o formato esperado
                            const magistradosTJSP = response.data.magistrados.map(mag => ({
                                Descricao: mag.label,
                                Descricao2: mag.cargoFormatado && mag.localFormatado 
                                    ? `${mag.cargoFormatado} • ${mag.localFormatado}` 
                                    : mag.cargoFormatado || mag.localFormatado || '',
                                Codigo: mag.value,
                                cargo: mag.cargo,
                                cargoFormatado: mag.cargoFormatado,
                                lotacao: mag.lotacao,
                                localFormatado: mag.localFormatado,
                                setor: mag.setor,
                                tipo: 'magistrado',
                                origem: 'tjsp'
                            }));
                            setSearchResults(magistradosTJSP);
                        } else {
                            setSearchResults([]);
                        }
                    } else {
                        // Busca advogado na API da OAB
                        try {
                            const responseOAB = await api.post("/oab/buscar_advogado", { 
                                nomeAdv: searchTerm 
                            });
                            if (responseOAB.data.success && responseOAB.data.data.length > 0) {
                                const advogadosOAB = responseOAB.data.data.map(adv => ({
                                    nome: adv.nome,
                                    oab: adv.inscricao,
                                    uf: adv.uf,
                                    tipoInscricao: adv.tipoInscricao,
                                    nomeSocial: adv.nomeSocial,
                                    detailUrl: adv.detailUrl,
                                    tipo: 'advogado',
                                    origem: 'oab'
                                }));
                                setSearchResults(advogadosOAB);
                            } else {
                                // Fallback para busca local
                                const response = await api.post("buscar_advogado", { texto: searchTerm });
                                const dados = Array.isArray(response.data) ? response.data : [response.data];
                                setSearchResults(dados.map(item => ({ ...item, tipo: 'advogado', origem: 'local' })));
                            }
                        } catch (err) {
                            // Fallback para busca local em caso de erro
                            try {
                                const response = await api.post("buscar_advogado", { texto: searchTerm });
                                const dados = Array.isArray(response.data) ? response.data : [response.data];
                                setSearchResults(dados.map(item => ({ ...item, tipo: 'advogado', origem: 'local' })));
                            } catch (err2) {
                                console.error("Erro ao buscar advogados:", err2);
                                setSearchResults([]);
                            }
                        }
                    }
                } catch (error) {
                    console.error("Erro ao buscar:", error);
                    setSearchResults([]);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setSearchResults([]);
            }
        };

        const debounceTimer = setTimeout(performSearch, 300);
        return () => clearTimeout(debounceTimer);
    }, [searchTerm, searchType]);

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
        
        const carregarComentarios = async () => {
            try {
                const response = await api.get('/comentarios_aleatorios');
                setComentarios(response.data);
            } catch (error) {
                console.error('Erro ao carregar comentários:', error);
            } finally {
                setLoadingComentarios(false);
            }
        };
        
        carregarRanking();
        carregarComentarios();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/ranking?search=${searchTerm}`);
        }
    };

    const selectMagistrado = async (resultado) => {
        // Se for advogado da OAB, carrega detalhes completos em modal
        if (resultado.tipo === 'advogado' && resultado.origem === 'oab' && resultado.detailUrl) {
            await carregarDetalhesAdvogado(resultado);
        } else {
            // Para magistrados ou advogados locais, navega para ranking
            const nome = resultado.Descricao || resultado.nome;
            navigate(`/ranking?search=${nome}`);
        }
    };

    const carregarDetalhesAdvogado = async (advogado) => {
        setLoadingDetalhes(true);
        try {
            const response = await api.get(`/oab/detalhes_advogado?detailUrl=${encodeURIComponent(advogado.detailUrl)}`);
            if (response.data.success) {
                setModalAdvogado({
                    ...advogado,
                    detalhes: response.data.data
                });
            }
        } catch (error) {
            console.error('Erro ao carregar detalhes do advogado:', error);
            // Se falhar, apenas mostra os dados básicos
            setModalAdvogado(advogado);
        } finally {
            setLoadingDetalhes(false);
        }
    };

    const fecharModal = () => {
        setModalAdvogado(null);
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
                    <button className="navbar-entrar" onClick={() => navigate('/login', { state: { isLogin: true } })}>
                        Entrar
                    </button>
                    <button className="navbar-cadastrar" onClick={() => navigate('/login', { state: { isLogin: false } })}>
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
                                placeholder={`Buscar ${searchType} por nome...`}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input"
                            />
                            <select 
                                value={searchType} 
                                onChange={(e) => setSearchType(e.target.value)}
                                className="search-type-select"
                            >
                                <option value="magistrado">Magistrado</option>
                                <option value="advogado">Advogado</option>
                            </select>
                            <button type="submit" className="search-button">
                                Procurar
                            </button>
                        </form>
                        
                        {searchResults.length > 0 && (
                            <div className="search-results">
                                {searchResults.map((resultado, index) => (
                                    <div 
                                        key={index} 
                                        className="search-result-item"
                                        onClick={() => selectMagistrado(resultado)}
                                    >
                                        <div className="result-content">
                                            <div className="result-name">
                                                {resultado.Descricao || resultado.nome}
                                                {resultado.origem === 'oab' && (
                                                    <span className="badge-oab-small">✓ OAB</span>
                                                )}
                                                {resultado.origem === 'tjsp' && (
                                                    <span className="badge-tjsp-small">✓ TJSP</span>
                                                )}
                                            </div>
                                            {resultado.tipo === 'magistrado' && resultado.Descricao2 && (
                                                <div className="result-info">{resultado.Descricao2}</div>
                                            )}
                                            {resultado.tipo === 'advogado' && (
                                                <div className="result-info">
                                                    OAB: {resultado.oab}{resultado.uf ? `/${resultado.uf}` : ''}
                                                    {resultado.tipoInscricao && ` • ${resultado.tipoInscricao}`}
                                                </div>
                                            )}
                                        </div>
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

            {/* Seção ADAM */}
            <section id="adam" className="adam-section">
                <div className="adam-container">
                    <div className="adam-content">
                        <div className="adam-badge">NOVIDADE</div>
                        <h2 className="adam-title">
                            Conheça o <span className="adam-highlight">ADAM</span>
                        </h2>
                        <h3 className="adam-subtitle">
                            Assistente Desktop para Assistentes e Magistrados
                        </h3>
                        <p className="adam-description">
                            Uma solução completa de gerenciamento de gabinete com inteligência artificial para 
                            magistrados e seus assistentes. Organize tarefas, gerencie votos, colabore com sua 
                            equipe e encontre modelos de decisões com tecnologia de ponta.
                        </p>
                        
                        <div className="adam-features-grid">
                            <div className="adam-feature-card">
                                <div className="adam-feature-icon">
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M9 11l3 3L22 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </div>
                                <h4>Gestão de Tarefas</h4>
                                <p>Atribua tarefas aos funcionários do gabinete com prazos, prioridades e acompanhamento em tempo real</p>
                            </div>

                            <div className="adam-feature-card">
                                <div className="adam-feature-icon">
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </div>
                                <h4>Comunicação Integrada</h4>
                                <p>Sistema de mensagens individuais e em grupo para toda a equipe do gabinete</p>
                            </div>

                            <div className="adam-feature-card">
                                <div className="adam-feature-icon">
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </div>
                                <h4>Banco de Votos</h4>
                                <p>Armazene sentenças e acórdãos com editor avançado, controle de versões e sistema de revisão</p>
                            </div>

                            <div className="adam-feature-card">
                                <div className="adam-feature-icon">
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        <path d="M21 21l-4.35-4.35M11 8a3 3 0 0 1 3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </div>
                                <h4>IA para Modelos</h4>
                                <p>Encontre modelos de votos adequados ao seu caso usando inteligência artificial</p>
                            </div>

                            <div className="adam-feature-card">
                                <div className="adam-feature-icon">
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </div>
                                <h4>Controle de Acesso</h4>
                                <p>Defina permissões e organize documentos em pastas privadas ou compartilhadas do gabinete</p>
                            </div>

                            <div className="adam-feature-card">
                                <div className="adam-feature-icon">
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </div>
                                <h4>Equipe Colaborativa</h4>
                                <p>Convide assessores, escreventes e estagiários para trabalhar de forma integrada</p>
                            </div>
                        </div>

                        <div className="adam-cta">
                            <button className="adam-button-primary" onClick={() => navigate('/login')}>
                                Começar Gratuitamente
                            </button>
                            <button className="adam-button-secondary" onClick={() => document.getElementById('planos')?.scrollIntoView({ behavior: 'smooth' })}>
                                Ver Planos
                            </button>
                        </div>
                    </div>

                    <div className="adam-visual">
                        <div className="adam-image-placeholder">
                            <svg width="300" height="300" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="3" y="3" width="18" height="18" rx="2" stroke="#2563a8" strokeWidth="2" fill="none"/>
                                <path d="M3 9h18M9 21V9" stroke="#2563a8" strokeWidth="2"/>
                                <circle cx="12" cy="15" r="2" fill="#2563a8"/>
                            </svg>
                        </div>
                    </div>
                </div>
            </section>

            {/* Seção de Planos */}
            <section id="planos" className="planos-section">
                <div className="planos-header">
                    <span className="planos-badge">PLANOS E PREÇOS</span>
                    <h2 className="planos-title">Escolha o plano ideal para seu gabinete</h2>
                    <p className="planos-subtitle">Comece gratis e escale conforme suas necessidades</p>
                </div>

                <div className="planos-grid">
                    <div className="plano-card">
                        <div className="plano-header">
                            <h3>Gratuito</h3>
                            <div className="plano-price">
                                <span className="price-value">R$ 0</span>
                                <span className="price-period">/mês</span>
                            </div>
                        </div>
                        <ul className="plano-features">
                            <li>✓ Avaliações ilimitadas</li>
                            <li>✓ Busca de magistrados e advogados</li>
                            <li>✓ Rankings públicos</li>
                            <li>✓ Comentários e feedbacks</li>
                        </ul>
                        <button className="plano-button plano-button-outline" onClick={() => navigate('/login')}>
                            Começar Grátis
                        </button>
                    </div>

                    <div className="plano-card plano-featured">
                        <div className="plano-badge-popular">MAIS POPULAR</div>
                        <div className="plano-header">
                            <h3>ADAM Básico</h3>
                            <div className="plano-price">
                                <span className="price-value">R$ 99</span>
                                <span className="price-period">/mês</span>
                            </div>
                        </div>
                        <ul className="plano-features">
                            <li>✓ Tudo do plano Gratuito</li>
                            <li>✓ Gestão de Gabinete</li>
                            <li>✓ Até 5 assistentes</li>
                            <li>✓ 100 votos armazenados</li>
                            <li>✓ Sistema de tarefas</li>
                            <li>✓ Mensagens da equipe</li>
                            <li>✓ 5 GB de armazenamento</li>
                        </ul>
                        <button className="plano-button plano-button-primary" onClick={() => navigate('/login')}>
                            Assinar Agora
                        </button>
                    </div>

                    <div className="plano-card">
                        <div className="plano-header">
                            <h3>ADAM Premium</h3>
                            <div className="plano-price">
                                <span className="price-value">R$ 199</span>
                                <span className="price-period">/mês</span>
                            </div>
                        </div>
                        <ul className="plano-features">
                            <li>✓ Tudo do plano Básico</li>
                            <li>✓ Até 15 assistentes</li>
                            <li>✓ Votos ilimitados</li>
                            <li>✓ IA para busca de modelos</li>
                            <li>✓ Editor avançado</li>
                            <li>✓ Controle de versões</li>
                            <li>✓ 50 GB de armazenamento</li>
                            <li>✓ Suporte prioritário</li>
                        </ul>
                        <button className="plano-button plano-button-outline" onClick={() => navigate('/login')}>
                            Assinar Premium
                        </button>
                    </div>

                    <div className="plano-card">
                        <div className="plano-header">
                            <h3>Enterprise</h3>
                            <div className="plano-price">
                                <span className="price-value">Personalizado</span>
                            </div>
                        </div>
                        <ul className="plano-features">
                            <li>✓ Tudo do plano Premium</li>
                            <li>✓ Assistentes ilimitados</li>
                            <li>✓ Armazenamento ilimitado</li>
                            <li>✓ API personalizada</li>
                            <li>✓ Treinamento da equipe</li>
                            <li>✓ Gerente de conta dedicado</li>
                            <li>✓ SLA garantido</li>
                        </ul>
                        <button className="plano-button plano-button-outline" onClick={() => alert('Entre em contato: contato@magiscore.com.br')}>
                            Falar com Vendas
                        </button>
                    </div>
                </div>
            </section>

            <div id="funcionalidades" className="features-section">
                <div className="features-header">
                    <span className="features-badge">Como Funciona</span>
                    <h2 className="features-title">Tornando Sua Busca por Transparência Fácil</h2>
                    <p className="features-subtitle">O MagiScore mostra recomendações baseadas na sua busca e permite que você se candidate em segundos</p>
                </div>

                <div className="features-grid">
                    <div className="feature-step">
                        <span className="step-number">01</span>
                        <h3 className="step-title">Login ou Registro</h3>
                        <p className="step-description">Entre com email e cadastre-se com Facebook ou LinkedIn</p>
                    </div>

                    <div className="feature-step">
                        <span className="step-number">02</span>
                        <h3 className="step-title highlight-blue">Recomendação Personalizada</h3>
                        <p className="step-description">Usando nossos dados de correspondência, podemos recomendar magistrados baseados em suas pesquisas, avaliações anteriores e histórico</p>
                    </div>

                    <div className="feature-step">
                        <span className="step-number">03</span>
                        <h3 className="step-title">Avaliação Rápida</h3>
                        <p className="step-description">Avalie facilmente múltiplos magistrados com um clique! A Avaliação Rápida mostra os magistrados recomendados com base em sua busca mais recente</p>
                    </div>

                    <div className="feature-step">
                        <span className="step-number">04</span>
                        <h3 className="step-title">Alertas por Email</h3>
                        <p className="step-description">Acompanhe as avaliações que você está interessado inscrevendo-se para alertas por email</p>
                    </div>
                </div>

                <div className="features-visual">
                    <div className="visual-card">
                        <div className="visual-icon">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="#2563a8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <circle cx="12" cy="7" r="4" stroke="#2563a8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                        <div className="visual-content">
                            <h4 className="visual-title">Dados Pessoais</h4>
                            <div className="visual-progress">
                                <div className="progress-bar" style={{width: '60%'}}></div>
                            </div>
                            <div className="visual-progress">
                                <div className="progress-bar" style={{width: '40%'}}></div>
                            </div>
                        </div>
                    </div>
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
                                <div className="ranking-badge">
                                    <span className="badge-number">#{index + 1}</span>
                                </div>
                                <div className="ranking-info">
                                    <h4 className="magistrado-name">{magistrado.nome}</h4>
                                    <div className="magistrado-stats">
                                        <div className="stat-item">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#FFA500" stroke="#FFA500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                            <span className="rating-number">{magistrado.media.toFixed(1)}</span>
                                        </div>
                                        <div className="stat-divider"></div>
                                        <div className="stat-item">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="#5a6c7d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                            <span className="reviews-count">{magistrado.quantidade} avaliações</span>
                                        </div>
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

            <section id="feedback" className="feedback-section">
                <div className="feedback-header">
                    <span className="feedback-badge">FEEDBACK</span>
                    <h2 className="feedback-title">
                        O que os usuários ativos da plataforma dizem sobre nós— Veja os <span className="highlight-green">comentários.</span>
                    </h2>
                    <button className="check-all-btn">
                        Ver Todos <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                </div>

                {loadingComentarios ? (
                    <div className="ranking-loading">Carregando comentários...</div>
                ) : (
                    <div className="feedback-cards">
                        {comentarios.map((comentario) => (
                            <div key={comentario.id} className="feedback-card">
                                <div className="feedback-user">
                                    <div className="user-avatar" style={{background: comentario.avatar}}>
                                        <span>{comentario.iniciais}</span>
                                    </div>
                                    <div className="user-info">
                                        <h4 className="user-name">{comentario.nome}</h4>
                                        <span className="user-role">{comentario.cargo}</span>
                                    </div>
                                </div>
                                <div className="feedback-rating">
                                    {[...Array(5)].map((_, index) => (
                                        <svg 
                                            key={index} 
                                            width="18" 
                                            height="18" 
                                            viewBox="0 0 24 24" 
                                            fill={index < comentario.rating ? "#16a34a" : "#d1d5db"} 
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                        </svg>
                                    ))}
                                </div>
                                <p className="feedback-text">
                                    {comentario.comentario}
                                </p>
                                <div className="feedback-tag">{comentario.tag}</div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <section id="sobre" className="team-section">
                <div className="research-highlight">
                    <div className="research-icon">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" stroke="#2563a8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" stroke="#2563a8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                    <div className="research-content">
                        <span className="research-badge">PESQUISA ACADÊMICA</span>
                        <h3 className="research-title">Projeto de Mestrado</h3>
                        <p className="research-text">
                            O MagiScore teve início como um projeto de pesquisa de mestrado, focado em desenvolver soluções tecnológicas que promovam transparência e acessibilidade no sistema judiciário brasileiro. Nossa missão é utilizar dados e tecnologia para fortalecer a confiança pública nas instituições jurídicas.
                        </p>
                    </div>
                </div>

                <div className="team-header">
                    <h2 className="team-title">Nossa Equipe</h2>
                    <p className="team-subtitle">Profissionais dedicados à inovação tecnológica no direito</p>
                </div>

                <div className="team-cards">
                    <div className="team-card">
                        <div className="team-avatar-professional">
                            <img src="/default-avatar-male.png" alt="Felipe Belchior" onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                            }} />
                            <div className="avatar-placeholder" style={{display: 'none'}}>
                                <span>FB</span>
                            </div>
                        </div>
                        <h3>Felipe Belchior</h3>
                        <p className="team-role">Desenvolvedor Full Stack</p>
                        <p className="team-description">
                            Especialista em desenvolvimento web e arquitetura de sistemas, com foco em soluções jurídicas inovadoras e escaláveis.
                        </p>
                        <div className="team-social">
                            <a href="#" className="social-link" aria-label="LinkedIn">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                                    <rect x="2" y="9" width="4" height="12"/>
                                    <circle cx="4" cy="4" r="2"/>
                                </svg>
                            </a>
                            <a href="#" className="social-link" aria-label="GitHub">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
                                </svg>
                            </a>
                        </div>
                    </div>

                    <div className="team-card">
                        <div className="team-avatar-professional">
                            <img src="/default-avatar-female.png" alt="Alice Conceição" onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                            }} />
                            <div className="avatar-placeholder" style={{display: 'none'}}>
                                <span>AC</span>
                            </div>
                        </div>
                        <h3>Alice Conceição</h3>
                        <p className="team-role">Desenvolvedora Frontend</p>
                        <p className="team-description">
                            Especialista em design de interfaces e experiência do usuário, criando soluções digitais intuitivas e acessíveis.
                        </p>
                        <div className="team-social">
                            <a href="#" className="social-link" aria-label="LinkedIn">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                                    <rect x="2" y="9" width="4" height="12"/>
                                    <circle cx="4" cy="4" r="2"/>
                                </svg>
                            </a>
                            <a href="#" className="social-link" aria-label="GitHub">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
                                </svg>
                            </a>
                        </div>
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

            {/* Modal de Detalhes do Advogado */}
            {modalAdvogado && (
                <div className="modal-overlay" onClick={fecharModal}>
                    <div className="modal-advogado" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={fecharModal}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>
                        
                        {loadingDetalhes ? (
                            <div className="modal-loading">
                                <div className="spinner"></div>
                                <p>Carregando detalhes...</p>
                            </div>
                        ) : (
                            <div className="modal-content-adv">
                                <div className="modal-header-adv">
                                    {modalAdvogado.detalhes?.imagemUrl ? (
                                        <img 
                                            src={modalAdvogado.detalhes.imagemUrl} 
                                            alt={modalAdvogado.nome}
                                            className="advogado-foto"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.nextSibling.style.display = 'flex';
                                            }}
                                        />
                                    ) : null}
                                    <div className="advogado-foto-placeholder" style={{display: modalAdvogado.detalhes?.imagemUrl ? 'none' : 'flex'}}>
                                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    </div>
                                    <div className="advogado-header-info">
                                        <h2>{modalAdvogado.nome}</h2>
                                        {modalAdvogado.nomeSocial && (
                                            <p className="nome-social">Nome Social: {modalAdvogado.nomeSocial}</p>
                                        )}
                                        <span className="badge-oab">✓ Verificado pela OAB</span>
                                    </div>
                                </div>
                                
                                <div className="modal-body-adv">
                                    <div className="info-row">
                                        <div className="info-label">Inscrição OAB:</div>
                                        <div className="info-value">{modalAdvogado.oab}/{modalAdvogado.uf}</div>
                                    </div>
                                    
                                    {modalAdvogado.tipoInscricao && (
                                        <div className="info-row">
                                            <div className="info-label">Tipo de Inscrição:</div>
                                            <div className="info-value">{modalAdvogado.tipoInscricao}</div>
                                        </div>
                                    )}
                                    
                                    {modalAdvogado.detalhes?.situacao && (
                                        <div className="info-row">
                                            <div className="info-label">Situação:</div>
                                            <div className="info-value">{modalAdvogado.detalhes.situacao}</div>
                                        </div>
                                    )}
                                    
                                    {modalAdvogado.detalhes?.dataInscricao && (
                                        <div className="info-row">
                                            <div className="info-label">Data de Inscrição:</div>
                                            <div className="info-value">{modalAdvogado.detalhes.dataInscricao}</div>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="modal-footer-adv">
                                    <button className="btn-primary" onClick={() => navigate(`/ranking?search=${modalAdvogado.nome}`)}>
                                        Ver Avaliações
                                    </button>
                                    <button className="btn-secondary" onClick={fecharModal}>
                                        Fechar
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Apresentacao;
