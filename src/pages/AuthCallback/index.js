import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Styles.css';

const AuthCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { updateProfile } = useAuth();
    const [status, setStatus] = useState('loading');
    const [needsValidation, setNeedsValidation] = useState(false);
    const [userType, setUserType] = useState('comum');

    useEffect(() => {
        const processAuth = async () => {
            const token = searchParams.get('token');
            const tipo = searchParams.get('tipo');
            const validation = searchParams.get('needsValidation');
            
            if (token) {
                try {
                    // Salva o token
                    localStorage.setItem('token', token);
                    
                    // Verifica se precisa de validação
                    if (validation === 'true') {
                        setNeedsValidation(true);
                        setUserType(tipo || 'comum');
                        setStatus('validation_required');
                        return;
                    }
                    
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

    const handleValidationRedirect = () => {
        // Redireciona para página de validação
        navigate('/validacao-cadastro?tipo=' + userType);
    };

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
                
                {status === 'validation_required' && (
                    <>
                        <div className="callback-warning">⚠️</div>
                        <h2>Validação Necessária</h2>
                        <p>
                            Você selecionou se cadastrar como <strong>{userType === 'advogado' ? 'Advogado' : 'Magistrado'}</strong>.
                        </p>
                        <p>
                            Para continuar, você precisa validar seu cadastro {userType === 'advogado' ? 'na OAB' : 'como magistrado'}.
                        </p>
                        <button 
                            onClick={handleValidationRedirect}
                            className="callback-btn"
                        >
                            Validar Cadastro
                        </button>
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
