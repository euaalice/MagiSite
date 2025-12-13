import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, requiredType }) => {
    const { isAuthenticated, user, loading } = useAuth();

    // Aguarda carregar dados do usuário
    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                fontSize: '18px',
                color: '#666'
            }}>
                Carregando...
            </div>
        );
    }

    // Se não está autenticado, redireciona para login
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Se requer um tipo específico e o usuário não tem esse tipo
    if (requiredType && user.tipo !== requiredType) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                padding: '20px',
                textAlign: 'center'
            }}>
                <h2 style={{ color: '#355169', marginBottom: '20px' }}>
                    Acesso Negado
                </h2>
                <p style={{ color: '#666', marginBottom: '30px' }}>
                    Você não tem permissão para acessar esta página.
                    <br />
                    Esta área é restrita para usuários do tipo: <strong>{requiredType}</strong>
                </p>
                <button 
                    onClick={() => window.history.back()}
                    style={{
                        background: '#355169',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '12px 30px',
                        fontSize: '16px',
                        cursor: 'pointer'
                    }}
                >
                    Voltar
                </button>
            </div>
        );
    }

    return children;
};

export default ProtectedRoute;
