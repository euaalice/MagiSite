import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import './Styles.css';

const ValidacaoCadastro = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { updateProfile } = useAuth();
    
    const [tipo, setTipo] = useState('');
    const [buscando, setBuscando] = useState(false);
    const [nome, setNome] = useState('');
    const [oabCnj, setOabCnj] = useState('');
    const [error, setError] = useState('');
    const [resultados, setResultados] = useState([]);
    const [selecionado, setSelecionado] = useState(null);
    const [loading, setLoading] = useState(false);
    
    // Expor funções globalmente para debug
    useEffect(() => {
        window.testarTJSP = async (codigo) => {
            console.log('🧪 TESTE MANUAL - Buscando código:', codigo);
            try {
                const response = await api.get(`/tjsp/detalhes_magistrado/${codigo}`);
                console.log('🧪 TESTE MANUAL - Resposta:', response.data);
                return response.data;
            } catch (error) {
                console.error('🧪 TESTE MANUAL - Erro:', error);
                return error;
            }
        };
        console.log('🧪 Função window.testarTJSP() disponível! Use: window.testarTJSP("codigo_aqui")');
    }, []);
    
    // Estados para autocomplete TJSP
    const [sugestoesTJSP, setSugestoesTJSP] = useState([]);
    const [showSugestoes, setShowSugestoes] = useState(false);
    const [dadosTJSP, setDadosTJSP] = useState(null);
    
    // Debug: monitorar mudanças no dadosTJSP
    useEffect(() => {
        console.log('📊 Estado dadosTJSP mudou:', dadosTJSP);
    }, [dadosTJSP]);
    
    // Debug: monitorar mudanças no tipo
    useEffect(() => {
        console.log('📊 Estado tipo mudou:', tipo);
    }, [tipo]);

    useEffect(() => {
        const tipoParam = searchParams.get('tipo');
        console.log('🎯 PÁGINA VALIDAÇÃO CARREGADA');
        console.log('🎯 Tipo de usuário:', tipoParam);
        if (tipoParam) {
            setTipo(tipoParam);
        } else {
            navigate('/login');
        }
    }, [searchParams, navigate]);

    // Buscar sugestões do TJSP enquanto digita
    const buscarSugestoesTJSP = async (nomeDigitado) => {
        if (!nomeDigitado || nomeDigitado.trim().length < 3) {
            setSugestoesTJSP([]);
            setShowSugestoes(false);
            return;
        }

        try {
            const response = await api.get('/tjsp/autocomplete_magistrado', {
                params: { nome: nomeDigitado.trim() }
            });
            
            if (response.data.success) {
                console.log('🔍 Sugestões TJSP recebidas:', response.data.magistrados?.length || 0);
                console.log('🔍 Primeira sugestão:', response.data.magistrados?.[0]);
                setSugestoesTJSP(response.data.magistrados || []);
                setShowSugestoes(true);
            }
        } catch (error) {
            console.error('Erro ao buscar sugestões TJSP:', error);
            setSugestoesTJSP([]);
        }
    };

    // Selecionar magistrado do TJSP
    const selecionarMagistradoTJSP = async (sugestao) => {
        try {
            console.log('===========================================');
            console.log('🚀 DISPARANDO REQUISIÇÃO PARA TJSP');
            console.log('🚀 Código:', sugestao.value);
            console.log('🚀 URL:', `/tjsp/detalhes_magistrado/${sugestao.value}`);
            console.log('===========================================');
            
            // Se já tem os dados na sugestão, usa direto
            if (sugestao.cargo) {
                const detalhes = {
                    nome: sugestao.label,
                    cargo: sugestao.cargo,
                    setor: sugestao.setor,
                    lotacao: sugestao.lotacao,
                    codigoTJSP: sugestao.value,
                    tribunal: 'TJSP'
                };
                console.log('📥 Usando dados da sugestão:', detalhes);
                setDadosTJSP(detalhes);
                setNome(detalhes.nome);
                setSelecionado({
                    nome: detalhes.nome,
                    cargo: detalhes.cargo,
                    setor: detalhes.setor,
                    lotacao: detalhes.lotacao,
                    codigoTJSP: detalhes.codigoTJSP
                });
                setSugestoesTJSP([]);
                setShowSugestoes(false);
                setResultados([]);
                return;
            }
            
            // Se não tem, busca do servidor
            const response = await api.get(`/tjsp/detalhes_magistrado/${sugestao.value}`);
            
            console.log('📥 Recebeu detalhes do TJSP:', response.data);
            
            if (response.data.success) {
                const detalhes = response.data.detalhes;
                console.log('💾 Salvando dados TJSP no estado:', detalhes);
                setDadosTJSP(detalhes);
                setNome(detalhes.nome);
                setSelecionado({
                    nome: detalhes.nome,
                    cargo: detalhes.cargo,
                    setor: detalhes.setor,
                    lotacao: detalhes.lotacao,
                    codigoTJSP: detalhes.codigoTJSP
                });
                setSugestoesTJSP([]);
                setShowSugestoes(false);
                setResultados([]);
            }
        } catch (error) {
            console.error('===========================================');
            console.error('❌ ERRO AO BUSCAR DETALHES DO TJSP');
            console.error('❌ Erro:', error);
            console.error('❌ Response:', error.response?.data);
            console.error('❌ Status:', error.response?.status);
            console.error('===========================================');
            setError('Erro ao buscar detalhes do magistrado');
        }
    };

    const handleBuscar = async () => {
        if (nome.length < 3) {
            setError('Digite pelo menos 3 caracteres do nome');
            return;
        }

        setBuscando(true);
        setError('');

        try {
            if (tipo === 'advogado') {
                const response = await api.post('/oab/buscar_advogado', {
                    nomeAdv: nome
                });

                if (response.data.success && response.data.data.length > 0) {
                    setResultados(response.data.data);
                } else {
                    setError('Nenhum advogado encontrado na OAB');
                    setResultados([]);
                }
            } else if (tipo === 'magistrado') {
                const response = await api.post('/buscar_magistrado', {
                    texto: nome
                });

                const dados = Array.isArray(response.data) ? response.data : [response.data];
                if (dados.length > 0) {
                    setResultados(dados);
                } else {
                    setError('Nenhum magistrado encontrado');
                    setResultados([]);
                }
            }
        } catch (err) {
            console.error('Erro ao buscar:', err);
            setError('Erro ao buscar. Tente novamente.');
        } finally {
            setBuscando(false);
        }
    };

    const handleSelecionar = (item) => {
        setSelecionado(item);
        setResultados([]);
        
        if (tipo === 'advogado') {
            setNome(item.nome);
            setOabCnj(item.inscricao);
        } else {
            setNome(item.Descricao || item.nome);
        }
    };

    const handleConfirmar = async () => {
        if (!selecionado) {
            setError('Por favor, busque e selecione seu cadastro');
            return;
        }

        if (tipo === 'magistrado' && !oabCnj) {
            setError('CNJ é obrigatório para magistrados');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const dados = {
                tipo: tipo,
                ...(tipo === 'advogado' && { oab: oabCnj }),
                ...(tipo === 'magistrado' && { 
                    cnj: oabCnj,
                    // Dados do TJSP se disponíveis
                    ...(dadosTJSP && {
                        dadosMagistrado: {
                            nome: dadosTJSP.nome,
                            cargo: dadosTJSP.cargo,
                            setor: dadosTJSP.setor,
                            lotacao: dadosTJSP.lotacao,
                            codigoTJSP: dadosTJSP.codigoTJSP,
                            tribunal: 'TJSP'
                        }
                    })
                })
            };
            
            console.log('📤 Enviando dados para backend:', JSON.stringify(dados, null, 2));

            const response = await api.put('/auth/update-tipo', dados);
            
            console.log('📥 Resposta do backend:', response.data);

            if (response.data.success) {
                // Atualiza o token
                localStorage.setItem('token', response.data.token);
                
                // Atualiza o perfil
                await updateProfile();
                
                // Redireciona para página inicial
                navigate('/inicial/');
            } else {
                setError('Erro ao validar cadastro');
            }
        } catch (err) {
            console.error('Erro ao confirmar:', err);
            setError(err.response?.data?.error || 'Erro ao validar cadastro');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="validacao-container">
            <div className="validacao-box">
                <div className="validacao-header">
                    <div className="validacao-icon">
                        {tipo === 'advogado' ? '⚖️' : '⚖️'}
                    </div>
                    <h1>Validar Cadastro de {tipo === 'advogado' ? 'Advogado' : 'Magistrado'}</h1>
                    <p>Para continuar, valide seu cadastro profissional</p>
                </div>

                {error && <div className="validacao-error">{error}</div>}

                <div className="validacao-form">
                    {!selecionado ? (
                        <>
                            <div className="form-group" style={{ position: 'relative' }}>
                                <label>Nome Completo</label>
                                <input
                                    type="text"
                                    value={nome}
                                    onChange={(e) => {
                                        const valor = e.target.value;
                                        console.log('⌨️ Digitando nome:', valor);
                                        setNome(valor);
                                        if (tipo === 'magistrado') {
                                            console.log('⌨️ Buscando sugestões TJSP para:', valor);
                                            buscarSugestoesTJSP(valor);
                                        }
                                    }}
                                    placeholder={tipo === 'magistrado' ? "Digite o nome do magistrado (TJSP)" : "Digite seu nome (mínimo 3 caracteres)"}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter' && tipo !== 'magistrado') {
                                            handleBuscar();
                                        }
                                    }}
                                />
                                
                                {/* Dropdown de Sugestões TJSP */}
                                {tipo === 'magistrado' && showSugestoes && sugestoesTJSP.length > 0 && (
                                    <div className="autocomplete-dropdown">
                                        {sugestoesTJSP.map((sugestao, index) => (
                                            <div 
                                                key={index}
                                                className="autocomplete-item"
                                                onClick={() => {
                                                    console.log('🖱️ CLICOU em sugestão:', sugestao);
                                                    selecionarMagistradoTJSP(sugestao);
                                                }}
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

                            {tipo !== 'magistrado' && (
                                <button 
                                    className="btn-buscar"
                                    onClick={handleBuscar}
                                    disabled={buscando || nome.length < 3}
                                >
                                    {buscando ? 'Buscando..' : `Buscar ${tipo === 'advogado' ? 'na OAB' : 'Magistrado'}`}
                                </button>
                            )}

                            {resultados.length > 0 && (
                                <div className="resultados-box">
                                    <h3>Selecione seu cadastro:</h3>
                                    {resultados.map((item, index) => (
                                        <div 
                                            key={index}
                                            className="resultado-item"
                                            onClick={() => handleSelecionar(item)}
                                        >
                                            {tipo === 'advogado' ? (
                                                <>
                                                    <div className="resultado-info">
                                                        <strong>{item.nome}</strong>
                                                        <p>OAB: {item.inscricao}/{item.uf}</p>
                                                        <p className="tipo-inscricao">{item.tipoInscricao}</p>
                                                    </div>
                                                    <button className="btn-selecionar-item">Selecionar</button>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="resultado-info">
                                                        <strong>{item.Descricao || item.nome}</strong>
                                                        {item.Descricao2 && <p>{item.Descricao2}</p>}
                                                    </div>
                                                    <button className="btn-selecionar-item">Selecionar</button>
                                                </>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <div className="selecionado-box">
                                <div className="selecionado-badge">✓ Selecionado</div>
                                <h3>{nome}</h3>
                                {tipo === 'advogado' && <p>OAB: {oabCnj}</p>}
                                
                                {/* Mostrar dados do TJSP para magistrado */}
                                {(() => {
                                    console.log('🎨 Renderizando selecionado - tipo:', tipo, 'dadosTJSP:', dadosTJSP);
                                    return null;
                                })()}
                                {tipo === 'magistrado' && dadosTJSP && (
                                    <div className="dados-tjsp-box">
                                        {dadosTJSP.cargo && (
                                            <div className="dado-tjsp-row">
                                                <strong>Cargo:</strong>
                                                <span>{dadosTJSP.cargo}</span>
                                            </div>
                                        )}
                                        {dadosTJSP.setor && (
                                            <div className="dado-tjsp-row">
                                                <strong>Setor:</strong>
                                                <span>{dadosTJSP.setor}</span>
                                            </div>
                                        )}
                                        {dadosTJSP.lotacao && (
                                            <div className="dado-tjsp-row">
                                                <strong>Lotação:</strong>
                                                <span>{dadosTJSP.lotacao}</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                                
                                <button 
                                    className="btn-alterar-small"
                                    onClick={() => {
                                        setSelecionado(null);
                                        setOabCnj('');
                                        setDadosTJSP(null);
                                    }}
                                >
                                    Alterar
                                </button>
                            </div>

                            {tipo === 'magistrado' && (
                                <div className="form-group">
                                    <label>Número CNJ</label>
                                    <input
                                        type="text"
                                        value={oabCnj}
                                        onChange={(e) => setOabCnj(e.target.value)}
                                        placeholder="Digite o número do CNJ"
                                        required
                                    />
                                </div>
                            )}

                            <button 
                                className="btn-confirmar"
                                onClick={handleConfirmar}
                                disabled={loading || (tipo === 'magistrado' && !oabCnj)}
                            >
                                {loading ? 'Confirmando...' : 'Confirmar e Continuar'}
                            </button>
                        </>
                    )}
                </div>

                <button 
                    className="btn-voltar"
                    onClick={() => navigate('/login')}
                >
                    ← Voltar para Login
                </button>
            </div>
        </div>
    );
};

export default ValidacaoCadastro;
