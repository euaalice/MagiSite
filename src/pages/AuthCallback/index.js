import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Styles.css';

const AuthCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { updateProfile } = useAuth();
    const [status, setStatus] = useState('loading');

    useEffect(() => {
        const processAuth = async () => {
            const token = searchParams.get('token');
            
            if (token) {
                try {
                    // Salva o token
                    localStorage.setItem('token', token);
                    
                    // Atualiza o perfil do usuário
                    const result = await updateProfile();
                    
                    if (result.success) {
                        setStatus('success');
                        setTimeout(() => {
                            navigate('/inicial/');
                        }, 1500);
                    } else {
                        setStatus('error');
                    }
                } catch (error) {
                    console.error('Erro ao processar autenticação:', error);
                    setStatus('error');
                }
            } else {
                setStatus('error');
            }
        };

        processAuth();
    }, [searchParams, navigate, updateProfile]);

    return (
        <div className="callback-container">
            <div className="callback-box">
                {status === 'loading' && (
                    <>
                        <div className="callback-spinner"></div>
                        <h2>Autenticando...</h2>
                        <p>Por favor, aguarde enquanto processamos seu login.</p>
                    </>
                )}
                
                {status === 'success' && (
                    <>
                        <div className="callback-success">✓</div>
                        <h2>Login realizado com sucesso!</h2>
                        <p>Você será redirecionado em instantes...</p>
                    </>
                )}
                
                {status === 'error' && (
                    <>
                        <div className="callback-error">✕</div>
                        <h2>Erro na autenticação</h2>
                        <p>Não foi possível completar o login com Google.</p>
                        <button 
                            onClick={() => navigate('/login')}
                            className="callback-btn"
                        >
                            Voltar para Login
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default AuthCallback;
