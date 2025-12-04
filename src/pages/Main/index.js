
import React, { useState } from "react";
import api from "../../services/api";
import './Styles.css'
import {Link, useNavigate} from 'react-router-dom';

const Main = () => {
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await api.post("entrar_usuario", { email, senha });
            console.log("Login bem-sucedido:", response.data);
            
            // Salva o token no localStorage
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }
            
            // Redireciona para a página inicial
            navigate('/inicial/');
        } catch (error) {
            console.error("Erro no login:", error);
            alert("Erro ao fazer login. Verifique seus dados.");
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await api.post("cria_usuario", { nome, email, senha });
            console.log("Cadastro bem-sucedido:", response.data);
            alert("Cadastro realizado com sucesso! Faça login agora.");
            setIsLogin(true);
            setNome("");
            setEmail("");
            setSenha("");
        } catch (error) {
            console.error("Erro no cadastro:", error);
            alert("Erro ao cadastrar. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="main-container">
            <div className="auth-container">
                <div className="auth-box">
                    <h1 className="auth-title">
                        {isLogin ? "Entrar" : "Cadastrar"}
                    </h1>

                    <form onSubmit={isLogin ? handleLogin : handleRegister} className="auth-form">
                        {!isLogin && (
                            <div className="form-group">
                                <label htmlFor="nome">Nome</label>
                                <input
                                    type="text"
                                    id="nome"
                                    value={nome}
                                    onChange={(e) => setNome(e.target.value)}
                                    placeholder="Seu nome completo"
                                    required={!isLogin}
                                    className="form-input"
                                />
                            </div>
                        )}
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="seu@email.com"
                                required
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="senha">Senha</label>
                            <input
                                type="password"
                                id="senha"
                                value={senha}
                                onChange={(e) => setSenha(e.target.value)}
                                placeholder="Digite sua senha"
                                required
                                className="form-input"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-submit"
                        >
                            {loading ? "Carregando..." : (isLogin ? "Entrar" : "Cadastrar")}
                        </button>
                    </form>

                    <div className="auth-toggle">
                        <p>
                            {isLogin ? "Não tem conta? " : "Já tem conta? "}
                            <button
                                type="button"
                                onClick={() => {
                                    setIsLogin(!isLogin);
                                    setNome("");
                                    setEmail("");
                                    setSenha("");
                                }}
                                className="toggle-btn"
                            >
                                {isLogin ? "Cadastre-se" : "Faça login"}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Main;