import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Styles.css';

const Login = () => {
    const navigate = useNavigate();
    const { login, register, loginWithGoogle } = useAuth();
    
    const [isLogin, setIsLogin] = useState(true);
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

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
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

            if (formData.tipo === 'advogado' && !formData.oab) {
                setError('OAB é obrigatória para advogados');
                setLoading(false);
                return;
            }

            if (formData.tipo === 'magistrado' && !formData.cnj) {
                setError('CNJ é obrigatório para magistrados');
                setLoading(false);
                return;
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
                                    </select>
                                </div>

                                {formData.tipo === 'advogado' && (
                                    <div className="form-group">
                                        <input
                                            type="text"
                                            name="oab"
                                            value={formData.oab}
                                            onChange={handleChange}
                                            placeholder="OAB Number (e.g., SP123456)"
                                            required
                                        />
                                    </div>
                                )}

                                {formData.tipo === 'magistrado' && (
                                    <div className="form-group">
                                        <input
                                            type="text"
                                            name="cnj"
                                            value={formData.cnj}
                                            onChange={handleChange}
                                            placeholder="CNJ Number (e.g., CNJ123456)"
                                            required
                                        />
                                    </div>
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
                        onClick={loginWithGoogle} 
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
        </div>
    );
};

export default Login;
