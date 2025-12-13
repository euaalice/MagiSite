import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    // Verifica se o usuário está autenticado ao carregar
    useEffect(() => {
        const checkAuth = async () => {
            const storedToken = localStorage.getItem('token');
            
            if (storedToken) {
                try {
                    const response = await api.get('/auth/status');
                    if (response.data.authenticated) {
                        setUser(response.data.user);
                        setToken(storedToken);
                    } else {
                        logout();
                    }
                } catch (error) {
                    console.error('Erro ao verificar autenticação:', error);
                    logout();
                }
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

    // Atualiza o token no axios quando mudar
    useEffect(() => {
        if (token) {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            delete api.defaults.headers.common['Authorization'];
        }
    }, [token]);

    // Login tradicional
    const login = async (email, senha) => {
        try {
            const response = await api.post('/entrar_usuario', { email, senha });
            
            if (response.data.token) {
                const { token, user } = response.data;
                localStorage.setItem('token', token);
                setToken(token);
                setUser(user);
                return { success: true };
            }
            
            return { success: false, error: 'Token não recebido' };
        } catch (error) {
            console.error('Erro no login:', error);
            return { 
                success: false, 
                error: error.response?.data?.error || 'Erro ao fazer login' 
            };
        }
    };

    // Cadastro
    const register = async (dados) => {
        try {
            const response = await api.post('/cria_usuario', dados);
            
            if (response.data.token) {
                const { token, user } = response.data;
                localStorage.setItem('token', token);
                setToken(token);
                setUser(user);
                return { success: true };
            }
            
            return { success: false, error: 'Token não recebido' };
        } catch (error) {
            console.error('Erro no cadastro:', error);
            return { 
                success: false, 
                error: error.response?.data?.error || 'Erro ao criar conta' 
            };
        }
    };

    // Login com Google
    const loginWithGoogle = () => {
        const backendUrl = api.defaults.baseURL.replace('/server/', '');
        window.location.href = `${backendUrl}/server/auth/google`;
    };

    // Logout
    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    // Atualizar perfil
    const updateProfile = async () => {
        try {
            const response = await api.get('/perfil');
            setUser(response.data);
            return { success: true };
        } catch (error) {
            console.error('Erro ao atualizar perfil:', error);
            return { success: false, error: 'Erro ao atualizar perfil' };
        }
    };

    // Atualizar tipo de usuário
    const updateUserType = async (tipo, dados) => {
        try {
            const response = await api.put('/atualizar_tipo', { tipo, ...dados });
            
            if (response.data.token) {
                const { token, user } = response.data;
                localStorage.setItem('token', token);
                setToken(token);
                setUser(user);
                return { success: true };
            }
            
            return { success: false, error: 'Erro ao atualizar tipo' };
        } catch (error) {
            console.error('Erro ao atualizar tipo:', error);
            return { 
                success: false, 
                error: error.response?.data?.error || 'Erro ao atualizar tipo de usuário' 
            };
        }
    };

    const value = {
        user,
        token,
        loading,
        isAuthenticated: !!token && !!user,
        login,
        register,
        loginWithGoogle,
        logout,
        updateProfile,
        updateUserType
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// Hook customizado para usar o contexto
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
};
