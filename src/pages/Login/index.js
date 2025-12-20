import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import './Styles.css';

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, register, loginWithGoogle } = useAuth();
    
    const [isLogin, setIsLogin] = useState(location.state?.isLogin !== false);
    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        senha: '',
        confirmarSenha: '',
        tipo: 'comum',
        oab: '',
        cnj: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [buscandoValidacao, setBuscandoValidacao] = useState(false);
    const [advogadosEncontrados, setAdvogadosEncontrados] = useState([]);
    const [advogadoSelecionado, setAdvogadoSelecionado] = useState(null);
    const [mostrarValidacao, setMostrarValidacao] = useState(false);
    const [magistradosEncontrados, setMagistradosEncontrados] = useState([]);
    const [magistradoSelecionado, setMagistradoSelecionado] = useState(null);
    const [mostrarValidacaoMagistrado, setMostrarValidacaoMagistrado] = useState(false);
    const [mostrarModalGoogle, setMostrarModalGoogle] = useState(false);
    const [tipoUsuarioGoogle, setTipoUsuarioGoogle] = useState('comum');
    const [nomeValidadoGoogle, setNomeValidadoGoogle] = useState('');
    const [buscaNomeGoogle, setBuscaNomeGoogle] = useState('');
    const [resultadosBuscaGoogle, setResultadosBuscaGoogle] = useState([]);
    const [buscandoNomeGoogle, setBuscandoNomeGoogle] = useState(false);
    const [sugestoesTJSPGoogle, setSugestoesTJSPGoogle] = useState([]);
    const [showSugestoesTJSP, setShowSugestoesTJSP] = useState(false);
    const [dadosTJSPSelecionado, setDadosTJSPSelecionado] = useState(null);

    // Captura erros da URL (quando redirecionado do callback do Google)
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const errorParam = searchParams.get('error');
        
        if (errorParam) {
            setError(decodeURIComponent(errorParam));
            // Remove o parâmetro de erro da URL
            navigate('/login', { replace: true });
        }
    }, [location.search, navigate]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
        
        // Limpa validação ao mudar tipo
        if (e.target.name === 'tipo') {
            setAdvogadosEncontrados([]);
            setAdvogadoSelecionado(null);
            setMostrarValidacao(false);
            setMagistradosEncontrados([]);
            setMagistradoSelecionado(null);
            setMostrarValidacaoMagistrado(false);
        }
    };

    const buscarAdvogado = async () => {
        if (!formData.nome || formData.nome.length < 3) {
            setError('Digite pelo menos 3 caracteres do nome');
            return;
        }

        setBuscandoValidacao(true);
        setError('');
        
        try {
            const response = await api.post('/oab/buscar_advogado', {
                nomeAdv: formData.nome
            });

            if (response.data.success && response.data.data.length > 0) {
                setAdvogadosEncontrados(response.data.data);
                setMostrarValidacao(true);
            } else {
                setError('Nenhum advogado encontrado com esse nome na OAB');
                setAdvogadosEncontrados([]);
            }
        } catch (err) {
            console.error('Erro ao buscar advogado:', err);
            setError('Erro ao buscar na OAB. Tente novamente.');
        } finally {
            setBuscandoValidacao(false);
        }
    };

    const selecionarAdvogado = (advogado) => {
        setAdvogadoSelecionado(advogado);
        setFormData({
            ...formData,
            nome: advogado.nome,
            oab: advogado.inscricao
        });
        setMostrarValidacao(false);
    };

    const buscarMagistrado = async () => {
        if (!formData.nome || formData.nome.length < 3) {
            setError('Digite pelo menos 3 caracteres do nome');
            return;
        }

        setBuscandoValidacao(true);
        setError('');
        
        try {
            const response = await api.post('/buscar_magistrado', {
                texto: formData.nome
            });

            const dados = Array.isArray(response.data) ? response.data : [response.data];
            if (dados.length > 0) {
                setMagistradosEncontrados(dados);
                setMostrarValidacaoMagistrado(true);
            } else {
                setError('Nenhum magistrado encontrado com esse nome');
                setMagistradosEncontrados([]);
            }
        } catch (err) {
            console.error('Erro ao buscar magistrado:', err);
            setError('Erro ao buscar magistrado. Tente novamente.');
        } finally {
            setBuscandoValidacao(false);
        }
    };

    const selecionarMagistrado = (magistrado) => {
        setMagistradoSelecionado(magistrado);
        setFormData({
            ...formData,
            nome: magistrado.Descricao || magistrado.nome
        });
        setMostrarValidacaoMagistrado(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (isLogin) {
            // Login
            const result = await login(formData.email, formData.senha);
            if (result.success) {
                navigate('/inicial/');
            } else {
                setError(result.error);
            }
        } else {
            // Cadastro
            if (formData.senha !== formData.confirmarSenha) {
                setError('As senhas não coincidem');
                setLoading(false);
                return;
            }

            if (formData.tipo === 'advogado') {
                if (!advogadoSelecionado) {
                    setError('Por favor, busque e selecione seu cadastro na OAB');
                    setLoading(false);
                    return;
                }
                if (!formData.oab) {
                    setError('OAB é obrigatória para advogados');
                    setLoading(false);
                    return;
                }
            }

            if (formData.tipo === 'magistrado') {
                if (!magistradoSelecionado) {
                    setError('Por favor, busque e selecione seu nome na lista de magistrados');
                    setLoading(false);
                    return;
                }
                if (!formData.cnj) {
                    setError('CNJ é obrigatório para magistrados');
                    setLoading(false);
                    return;
                }
            }

            const dados = {
                nome: formData.nome,
                email: formData.email,
                senha: formData.senha,
                tipo: formData.tipo
            };

            if (formData.oab) dados.oab = formData.oab;
            if (formData.cnj) dados.cnj = formData.cnj;

            const result = await register(dados);
            if (result.success) {
                navigate('/inicial/');
            } else {
                setError(result.error);
            }
        }

        setLoading(false);
    };

    const handleGoogleLogin = () => {
        setMostrarModalGoogle(true);
    };

    const buscarSugestoesTJSPGoogle = async (nomeDigitado) => {
        if (!nomeDigitado || nomeDigitado.trim().length < 3) {
            setSugestoesTJSPGoogle([]);
            setShowSugestoesTJSP(false);
            return;
        }

        try {
            const response = await api.get('/tjsp/autocomplete_magistrado', {
                params: { nome: nomeDigitado.trim() }
            });
            
            if (response.data.success) {
                setSugestoesTJSPGoogle(response.data.magistrados || []);
                setShowSugestoesTJSP(true);
            }
        } catch (error) {
            console.error('Erro ao buscar sugestões TJSP:', error);
            setSugestoesTJSPGoogle([]);
        }
    };

    const selecionarMagistradoTJSP = (sugestao) => {
        console.log('🖱️ SELECIONANDO MAGISTRADO TJSP:', sugestao);
        setNomeValidadoGoogle(sugestao.label);
        const dadosTJSP = {
            nome: sugestao.label,
            codigo: sugestao.value,
            cargo: sugestao.cargo,
            cargoFormatado: sugestao.cargoFormatado,
            lotacao: sugestao.lotacao,
            localFormatado: sugestao.localFormatado,
            setor: sugestao.setor
        };
        console.log('💾 SALVANDO dadosTJSPSelecionado:', dadosTJSP);
        setDadosTJSPSelecionado(dadosTJSP);
        setSugestoesTJSPGoogle([]);
        setShowSugestoesTJSP(false);
        setBuscaNomeGoogle(sugestao.label);
    };

    const buscarNomeParaGoogle = async () => {
        if (!buscaNomeGoogle || buscaNomeGoogle.length < 3) {
            setError('Digite pelo menos 3 caracteres do nome');
            return;
        }

        setBuscandoNomeGoogle(true);
        setError('');

        try {
            if (tipoUsuarioGoogle === 'advogado') {
                const response = await api.post('/oab/buscar_advogado', {
                    nomeAdv: buscaNomeGoogle
                });

                if (response.data.success && response.data.data.length > 0) {
                    setResultadosBuscaGoogle(response.data.data.map(adv => ({
                        nome: adv.nome,
                        info: `OAB: ${adv.inscricao} - ${adv.uf}`,
                        oab: adv.inscricao
                    })));
                } else {
                    setError('Nenhum advogado encontrado na OAB');
                    setResultadosBuscaGoogle([]);
                }
            }
        } catch (err) {
            console.error('Erro ao buscar:', err);
            setError('Erro ao buscar. Tente novamente.');
        } finally {
            setBuscandoNomeGoogle(false);
        }
    };

    const selecionarNomeGoogle = (resultado) => {
        setNomeValidadoGoogle(resultado.nome);
        setResultadosBuscaGoogle([]);
        setBuscaNomeGoogle(resultado.nome);
    };

    const confirmarLoginGoogle = () => {
        if ((tipoUsuarioGoogle === 'magistrado' || tipoUsuarioGoogle === 'advogado') && !nomeValidadoGoogle) {
            setError('Por favor, busque e selecione seu nome antes de continuar');
            return;
        }
        
        console.log('🚀 CONFIRMANDO LOGIN GOOGLE');
        console.log('   - Tipo:', tipoUsuarioGoogle);
        console.log('   - Nome validado:', nomeValidadoGoogle);
        console.log('   - Dados TJSP:', dadosTJSPSelecionado);
        
        setMostrarModalGoogle(false);
        loginWithGoogle(tipoUsuarioGoogle, nomeValidadoGoogle, dadosTJSPSelecionado);
    };

    return (
        <div className="login-container">
            <nav className="login-navbar">
                <div className="navbar-logo" onClick={() => navigate('/')}>
                    <img src="/Magisicon.png" alt="MagiScore" className="logo-icon" />
                    <span className="logo-text">MagiScore</span>
                </div>
                <button 
                    className="navbar-auth-btn"
                    onClick={() => setIsLogin(!isLogin)}
                >
                    {isLogin ? 'Cadastrar' : 'Entrar'}
                </button>
            </nav>

            <div className="login-content">
                <div className="login-box">
                    <h1 className="login-title">
                        {isLogin ? 'Bem-vindo de volta!' : 'Criar Conta'}
                    </h1>
                    <p className="login-subtitle">
                        {isLogin ? 'Entre com seu usuário e senha.' : 'Junte-se a nós e comece a avaliar magistrados.'}
                    </p>

                    {error && <div className="login-error">{error}</div>}

                    <form onSubmit={handleSubmit} className="login-form">
                        {!isLogin && (
                            <div className="form-group">
                                <input
                                    type="text"
                                    name="nome"
                                    value={formData.nome}
                                    onChange={handleChange}
                                    placeholder="Nome de Usuário"
                                    required
                                />
                            </div>
                        )}

                        <div className="form-group">
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder={isLogin ? "Usuário" : "Email"}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <input
                                type="password"
                                name="senha"
                                value={formData.senha}
                                onChange={handleChange}
                                placeholder="Senha"
                                required
                            />
                        </div>

                        {!isLogin && (
                            <>
                                <div className="form-group">
                                    <input
                                        type="password"
                                        name="confirmarSenha"
                                        value={formData.confirmarSenha}
                                        onChange={handleChange}
                                        placeholder="Confirmar Senha"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <select
                                        name="tipo"
                                        value={formData.tipo}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="comum">Usuário Comum</option>
                                        <option value="advogado">Advogado</option>
                                        <option value="magistrado">Magistrado</option>
                                        <option value="assistente">Assistente de Gabinete</option>
                                    </select>
                                </div>

                                {formData.tipo === 'advogado' && (
                                    <>
                                        {!advogadoSelecionado ? (
                                            <div className="validacao-box">
                                                <p className="validacao-instrucao">
                                                    ⚖️ Para se cadastrar como advogado, você precisa validar seu registro na OAB
                                                </p>
                                                <button 
                                                    type="button"
                                                    className="btn-buscar-validacao"
                                                    onClick={buscarAdvogado}
                                                    disabled={buscandoValidacao || formData.nome.length < 3}
                                                >
                                                    {buscandoValidacao ? 'Buscando...' : 'Buscar na OAB'}
                                                </button>
                                                
                                                {mostrarValidacao && advogadosEncontrados.length > 0 && (
                                                    <div className="resultados-validacao">
                                                        <h4>Selecione seu cadastro:</h4>
                                                        {advogadosEncontrados.map((adv, index) => (
                                                            <div 
                                                                key={index} 
                                                                className="item-validacao"
                                                                onClick={() => selecionarAdvogado(adv)}
                                                            >
                                                                <div>
                                                                    <strong>{adv.nome}</strong>
                                                                    <p>OAB: {adv.inscricao}/{adv.uf}</p>
                                                                    <p className="tipo-inscricao-small">{adv.tipoInscricao}</p>
                                                                </div>
                                                                <button type="button" className="btn-selecionar">Selecionar</button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="validacao-sucesso">
                                                <div className="validacao-badge">
                                                    ✓ Advogado Validado
                                                </div>
                                                <p><strong>{advogadoSelecionado.nome}</strong></p>
                                                <p>OAB: {advogadoSelecionado.inscricao}/{advogadoSelecionado.uf}</p>
                                                <button 
                                                    type="button" 
                                                    className="btn-alterar"
                                                    onClick={() => {
                                                        setAdvogadoSelecionado(null);
                                                        setFormData({...formData, oab: ''});
                                                    }}
                                                >
                                                    Alterar
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )}

                                {formData.tipo === 'magistrado' && (
                                    <>
                                        {!magistradoSelecionado ? (
                                            <div className="validacao-box">
                                                <p className="validacao-instrucao">
                                                    ⚖️ Para se cadastrar como magistrado, você precisa validar seu cadastro
                                                </p>
                                                <button 
                                                    type="button"
                                                    className="btn-buscar-validacao"
                                                    onClick={buscarMagistrado}
                                                    disabled={buscandoValidacao || formData.nome.length < 3}
                                                >
                                                    {buscandoValidacao ? 'Buscando...' : 'Buscar Magistrado'}
                                                </button>
                                                
                                                {mostrarValidacaoMagistrado && magistradosEncontrados.length > 0 && (
                                                    <div className="resultados-validacao">
                                                        <h4>Selecione seu cadastro:</h4>
                                                        {magistradosEncontrados.map((mag, index) => (
                                                            <div 
                                                                key={index} 
                                                                className="item-validacao"
                                                                onClick={() => selecionarMagistrado(mag)}
                                                            >
                                                                <div>
                                                                    <strong>{mag.Descricao || mag.nome}</strong>
                                                                    {mag.Descricao2 && <p>{mag.Descricao2}</p>}
                                                                </div>
                                                                <button type="button" className="btn-selecionar">Selecionar</button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="validacao-sucesso">
                                                <div className="validacao-badge">
                                                    ✓ Magistrado Validado
                                                </div>
                                                <p><strong>{magistradoSelecionado.Descricao || magistradoSelecionado.nome}</strong></p>
                                                {magistradoSelecionado.Descricao2 && <p className="magistrado-info-extra">{magistradoSelecionado.Descricao2}</p>}
                                                <button 
                                                    type="button" 
                                                    className="btn-alterar"
                                                    onClick={() => {
                                                        setMagistradoSelecionado(null);
                                                    }}
                                                >
                                                    Alterar
                                                </button>
                                            </div>
                                        )}
                                        <div className="form-group" style={{marginTop: '16px'}}>
                                            <input
                                                type="text"
                                                name="cnj"
                                                value={formData.cnj}
                                                onChange={handleChange}
                                                placeholder="CNJ Number (e.g., CNJ123456)"
                                                required
                                            />
                                        </div>
                                    </>
                                )}
                            </>
                        )}

                        {isLogin && (
                            <div className="forgot-password">
                                <a href="#">Esqueceu a senha?</a>
                            </div>
                        )}

                        <button 
                            type="submit" 
                            className="login-btn"
                            disabled={loading}
                        >
                            {loading ? 'Carregando...' : (isLogin ? 'Entrar' : 'Cadastrar')}
                        </button>
                    </form>

                    <div className="login-divider">
                        <span>ou entre com</span>
                    </div>

                    <button 
                        onClick={handleGoogleLogin} 
                        className="google-btn"
                        type="button"
                    >
                        <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                        </svg>
                        Entrar com Google
                    </button>

                    <button 
                        className="facebook-btn"
                        type="button"
                    >
                        <svg width="18" height="18" fill="#1877f2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                        Entrar com Facebook
                    </button>

                    <div className="login-switch">
                        {isLogin ? (
                            <p>
                                Não tem uma conta? <button 
                                    type="button"
                                    onClick={() => setIsLogin(false)}
                                    className="switch-btn"
                                >
                                    Cadastre-se Agora
                                </button>
                            </p>
                        ) : (
                            <p>
                                Já tem uma conta? <button 
                                    type="button"
                                    onClick={() => setIsLogin(true)}
                                    className="switch-btn"
                                >
                                    Entrar
                                </button>
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal de Seleção de Tipo de Usuário para Google */}
            {mostrarModalGoogle && (
                <div className="modal-overlay" onClick={() => setMostrarModalGoogle(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setMostrarModalGoogle(false)}>
                            ✕
                        </button>
                        <h2 className="modal-title">Selecione o tipo de conta</h2>
                        <p className="modal-subtitle">Como você deseja se cadastrar?</p>
                        
                        <div className="tipo-usuario-options">
                            <label className="tipo-option">
                                <input
                                    type="radio"
                                    name="tipoGoogle"
                                    value="comum"
                                    checked={tipoUsuarioGoogle === 'comum'}
                                    onChange={(e) => setTipoUsuarioGoogle(e.target.value)}
                                />
                                <div className="option-content">
                                    <span className="option-icon">👤</span>
                                    <div>
                                        <strong>Usuário Comum</strong>
                                        <p>Avaliar magistrados e advogados</p>
                                    </div>
                                </div>
                            </label>

                            <label className="tipo-option">
                                <input
                                    type="radio"
                                    name="tipoGoogle"
                                    value="advogado"
                                    checked={tipoUsuarioGoogle === 'advogado'}
                                    onChange={(e) => {
                                        setTipoUsuarioGoogle(e.target.value);
                                        setNomeValidadoGoogle('');
                                        setBuscaNomeGoogle('');
                                        setResultadosBuscaGoogle([]);
                                    }}
                                />
                                <div className="option-content">
                                    <span className="option-icon">⚖️</span>
                                    <div>
                                        <strong>Advogado</strong>
                                        <p>Busque seu nome na OAB para validar</p>
                                    </div>
                                </div>
                            </label>

                            <label className="tipo-option">
                                <input
                                    type="radio"
                                    name="tipoGoogle"
                                    value="magistrado"
                                    checked={tipoUsuarioGoogle === 'magistrado'}
                                    onChange={(e) => {
                                        setTipoUsuarioGoogle(e.target.value);
                                        setNomeValidadoGoogle('');
                                        setBuscaNomeGoogle('');
                                        setResultadosBuscaGoogle([]);
                                    }}
                                />
                                <div className="option-content">
                                    <span className="option-icon">⚖️</span>
                                    <div>
                                        <strong>Magistrado</strong>
                                        <p>Busque seu nome no sistema para validar</p>
                                    </div>
                                </div>
                            </label>

                            <label className="tipo-option">
                                <input
                                    type="radio"
                                    name="tipoGoogle"
                                    value="assistente"
                                    checked={tipoUsuarioGoogle === 'assistente'}
                                    onChange={(e) => setTipoUsuarioGoogle(e.target.value)}
                                />
                                <div className="option-content">
                                    <span className="option-icon">📋</span>
                                    <div>
                                        <strong>Assistente de Gabinete</strong>
                                        <p>Acesso ao sistema ADAM</p>
                                    </div>
                                </div>
                            </label>
                        </div>

                        {/* Campo de busca para magistrado ou advogado */}
                        {(tipoUsuarioGoogle === 'magistrado' || tipoUsuarioGoogle === 'advogado') && (
                            <div className="busca-validacao-google">
                                <label className="busca-label">
                                    Busque seu nome para validar:
                                </label>
                                <div className="busca-input-group" style={{ position: 'relative' }}>
                                    <input
                                        type="text"
                                        placeholder={tipoUsuarioGoogle === 'magistrado' ? 'Digite o nome do magistrado (TJSP)...' : `Digite seu nome como ${tipoUsuarioGoogle}...`}
                                        value={buscaNomeGoogle}
                                        onChange={(e) => {
                                            const valor = e.target.value;
                                            setBuscaNomeGoogle(valor);
                                            if (tipoUsuarioGoogle === 'magistrado') {
                                                buscarSugestoesTJSPGoogle(valor);
                                            }
                                        }}
                                        className="busca-input"
                                    />
                                    {tipoUsuarioGoogle === 'advogado' && (
                                        <button 
                                            onClick={buscarNomeParaGoogle}
                                            disabled={buscandoNomeGoogle || buscaNomeGoogle.length < 3}
                                            className="busca-btn"
                                        >
                                            {buscandoNomeGoogle ? 'Buscando...' : 'Buscar'}
                                        </button>
                                    )}

                                    {/* Autocomplete TJSP para magistrado */}
                                    {tipoUsuarioGoogle === 'magistrado' && showSugestoesTJSP && sugestoesTJSPGoogle.length > 0 && (
                                        <div className="autocomplete-dropdown-modal">
                                            {sugestoesTJSPGoogle.map((sugestao, index) => (
                                                <div 
                                                    key={index}
                                                    className="autocomplete-item"
                                                    onClick={() => selecionarMagistradoTJSP(sugestao)}
                                                >
                                                    <div className="autocomplete-item-content">
                                                        <div className="autocomplete-item-nome">
                                                            {sugestao.label}
                                                            <span className="badge-tjsp-inline">✓ TJSP</span>
                                                        </div>
                                                        {(sugestao.cargoFormatado || sugestao.localFormatado) && (
                                                            <div className="autocomplete-item-info">
                                                                {sugestao.cargoFormatado && <span className="cargo-badge">{sugestao.cargoFormatado}</span>}
                                                                {sugestao.localFormatado && <span className="local-info">{sugestao.localFormatado}</span>}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {nomeValidadoGoogle && (
                                    <div className="nome-validado">
                                        ✅ Nome validado: <strong>{nomeValidadoGoogle}</strong>
                                        {tipoUsuarioGoogle === 'magistrado' && dadosTJSPSelecionado && (
                                            <div className="dados-tjsp-resumo">
                                                {dadosTJSPSelecionado.cargoFormatado && (
                                                    <span className="cargo-badge-small">{dadosTJSPSelecionado.cargoFormatado}</span>
                                                )}
                                                {dadosTJSPSelecionado.localFormatado && (
                                                    <span className="local-small">{dadosTJSPSelecionado.localFormatado}</span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {tipoUsuarioGoogle === 'advogado' && resultadosBuscaGoogle.length > 0 && (
                                    <div className="resultados-busca-google">
                                        {resultadosBuscaGoogle.map((resultado, index) => (
                                            <div 
                                                key={index}
                                                className="resultado-item"
                                                onClick={() => selecionarNomeGoogle(resultado)}
                                            >
                                                <strong>{resultado.nome}</strong>
                                                <span>{resultado.info}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        <button 
                            className="modal-confirm-btn" 
                            onClick={confirmarLoginGoogle}
                            disabled={(tipoUsuarioGoogle === 'magistrado' || tipoUsuarioGoogle === 'advogado') && !nomeValidadoGoogle}
                        >
                            Continuar com Google
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Login;
