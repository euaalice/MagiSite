import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import './Styles.css';

const Inicial = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState('dashboard');
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [rightPanelOpen, setRightPanelOpen] = useState(false);
    const [busca, setBusca] = useState("");
    const [buscaAdvogado, setBuscaAdvogado] = useState("");
    const [magistrados, setMagistrados] = useState([]);
    const [advogados, setAdvogados] = useState([]);
    const [buscando, setBuscando] = useState(false);
    const [buscandoAdvogado, setBuscandoAdvogado] = useState(false);
    const [activeTab, setActiveTab] = useState('magistrado');
    const [selectedMagistrado, setSelectedMagistrado] = useState(null);
    const [selectedAdvogado, setSelectedAdvogado] = useState(null);
    const [avaliacaoForm, setAvaliacaoForm] = useState({
        nota: 5,
        comentario: "",
        anonima: false
    });
    const [minhasAvaliacoes, setMinhasAvaliacoes] = useState([]);
    const [ranking, setRanking] = useState([]);
    const [rankingAdvogados, setRankingAdvogados] = useState([]);
    const [loadingAvaliacoes, setLoadingAvaliacoes] = useState(false);
    const [perfilData, setPerfilData] = useState(null);
    const [loadingPerfil, setLoadingPerfil] = useState(false);
    const [chatMessage, setChatMessage] = useState('');
    const [chatMessages, setChatMessages] = useState([
        { id: 1, type: 'received', text: 'Olá! Como posso ajudar você hoje?', time: '10:30' }
    ]);
    const [showTrocarTipo, setShowTrocarTipo] = useState(false);
    const [novoTipo, setNovoTipo] = useState('');
    const [dadosValidacao, setDadosValidacao] = useState({ oab: '', cnj: '' });
    
    // Estados para autocomplete do TJSP
    const [sugestoesMagistrados, setSugestoesMagistrados] = useState([]);
    const [loadingSugestoes, setLoadingSugestoes] = useState(false);
    const [showSugestoes, setShowSugestoes] = useState(false);
    const [magistradoSelecionadoTJSP, setMagistradoSelecionadoTJSP] = useState(null);
    
    // Filtros de pesquisa
    const [filtros, setFiltros] = useState({
        tribunal: '',
        instancia: '',
        comarca: '',
        assunto: '',
        esfera: '',
        cargo: '',
        setor: '',
        mediaMin: '',
        avaliacoesMin: '',
        ordenarPor: 'relevancia'
    });
    const [filtrosAdvogado, setFiltrosAdvogado] = useState({
        uf: '',
        especialidade: '',
        experiencia: '',
        mediaMin: '',
        avaliacoesMin: '',
        ordenarPor: 'relevancia'
    });
    const [mostrarFiltros, setMostrarFiltros] = useState(false);
    
    // Convites
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [conviteEmail, setConviteEmail] = useState('');
    const [conviteMensagem, setConviteMensagem] = useState('');
    const [convitesEnviados, setConvitesEnviados] = useState([]);
    const [convitesPendentes, setConvitesPendentes] = useState([]);
    const [cargoDesejado, setCargoDesejado] = useState('assessor');
    
    // Gabinete
    const [gabineteData, setGabineteData] = useState(null);
    const [loadingGabinete, setLoadingGabinete] = useState(false);
    
    // Perfil inline (dentro da página Procurar)
    const [perfilInline, setPerfilInline] = useState(null);
    const [tipoPerfilInline, setTipoPerfilInline] = useState(null);
    const [loadingPerfilInline, setLoadingPerfilInline] = useState(false);
    const [activeTabPerfil, setActiveTabPerfil] = useState('sobre');
    
    // Estados para seções unificadas
    const [avaliarTipo, setAvaliarTipo] = useState('magistrado');
    const [rankingTipo, setRankingTipo] = useState('magistrado');
    const [rankingFiltro, setRankingFiltro] = useState({
        tribunal: '',
        uf: '',
        especialidade: '',
        mediaMin: ''
    });
    
    // Estados para chat
    const [conversas, setConversas] = useState([]);
    const [conversaAtiva, setConversaAtiva] = useState(null);
    const [mensagensChat, setMensagensChat] = useState([]);
    const [novaMensagem, setNovaMensagem] = useState('');
    
    // Estados para interações em avaliações
    const [respondendoAvaliacao, setRespondendoAvaliacao] = useState(null);
    const [textoResposta, setTextoResposta] = useState('');

    useEffect(() => {
        if (activeSection === 'minhas-avaliacoes') {
            carregarMinhasAvaliacoes();
        } else if (activeSection === 'ranking') {
            carregarRanking();
            carregarRankingAdvogados();
        } else if (activeSection === 'ranking-advogados') {
            carregarRankingAdvogados();
        } else if (activeSection === 'perfil' && (user?.tipo === 'magistrado' || user?.tipo === 'advogado')) {
            carregarPerfil();
        } else if (activeSection === 'avaliacoes-recebidas' && (user?.tipo === 'magistrado' || user?.tipo === 'advogado')) {
            carregarAvaliacoesRecebidas();
        } else if (activeSection === 'dashboard' && user?.tipo === 'comum') {
            carregarMinhasAvaliacoes();
            carregarRanking();
            carregarRankingAdvogados();
        }
    }, [activeSection]);

    // Carregar dados automaticamente para o dashboard do usuário comum
    useEffect(() => {
        if (user?.tipo === 'comum') {
            carregarMinhasAvaliacoes();
            carregarRanking();
            carregarRankingAdvogados();
        }
    }, [user?.tipo]);

    // Fechar menu quando clicar fora
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showUserMenu && !event.target.closest('.navbar-user-menu')) {
                setShowUserMenu(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [showUserMenu]);

    const carregarMinhasAvaliacoes = async () => {
        setLoadingAvaliacoes(true);
        try {
            const response = await api.get('/usuario/minhas_avaliacoes');
            setMinhasAvaliacoes(response.data);
        } catch (error) {
            console.error('Erro ao carregar avaliações:', error);
        } finally {
            setLoadingAvaliacoes(false);
        }
    };

    const carregarRanking = async () => {
        setLoadingAvaliacoes(true);
        try {
            const response = await api.get('/ranking_magistrados');
            setRanking(response.data);
        } catch (error) {
            console.error('Erro ao carregar ranking:', error);
        } finally {
            setLoadingAvaliacoes(false);
        }
    };

    const carregarRankingAdvogados = async () => {
        setLoadingAvaliacoes(true);
        try {
            const response = await api.get('/ranking_advogados');
            setRankingAdvogados(response.data);
        } catch (error) {
            console.error('Erro ao carregar ranking de advogados:', error);
        } finally {
            setLoadingAvaliacoes(false);
        }
    };

    const carregarPerfil = async () => {
        setLoadingPerfil(true);
        try {
            const endpoint = user?.tipo === 'magistrado' ? '/magistrado/perfil' : '/advogado/perfil';
            console.log('🔄 Carregando perfil de', user?.tipo);
            const response = await api.get(endpoint);
            console.log('📥 Dados do perfil recebidos:', response.data);
            setPerfilData(response.data);
        } catch (error) {
            console.error('❌ Erro ao carregar perfil:', error);
            // Se não encontrar perfil, cria objeto vazio para edição
            if (user?.tipo === 'magistrado') {
                setPerfilData({
                    nome: user.nome,
                    cnj: user.cnj,
                    curriculo: '',
                    instancia: '',
                    varaOuCamara: '',
                    contato: { email: '', telefone: '', endereco: '' },
                    despacho: { local: '', horario: '' }
                });
            } else {
                setPerfilData({
                    nome: user.nome,
                    oab: user.oab,
                    curriculo: '',
                    escritorio: '',
                    areasAtuacao: [],
                    contato: { email: '', telefone: '', endereco: '' }
                });
            }
        } finally {
            setLoadingPerfil(false);
        }
    };

    const carregarAvaliacoesRecebidas = async () => {
        setLoadingAvaliacoes(true);
        try {
            const endpoint = user?.tipo === 'magistrado' ? '/magistrado/perfil' : '/advogado/perfil';
            const response = await api.get(endpoint);
            setPerfilData(response.data);
        } catch (error) {
            console.error('Erro ao carregar avaliações:', error);
        } finally {
            setLoadingAvaliacoes(false);
        }
    };

    // Buscar sugestões de magistrados do TJSP
    const buscarSugestoesTJSP = async (nome) => {
        if (!nome || nome.trim().length < 3) {
            setSugestoesMagistrados([]);
            setShowSugestoes(false);
            return;
        }

        setLoadingSugestoes(true);
        try {
            const response = await api.get('/tjsp/autocomplete_magistrado', {
                params: { nome: nome.trim() }
            });
            
            if (response.data.success) {
                console.log('🔍 INICIAL - Sugestões TJSP recebidas:', response.data.magistrados?.length || 0);
                console.log('🔍 INICIAL - Primeira sugestão:', response.data.magistrados?.[0]);
                setSugestoesMagistrados(response.data.magistrados || []);
                setShowSugestoes(true);
            }
        } catch (error) {
            console.error('Erro ao buscar sugestões:', error);
            setSugestoesMagistrados([]);
        } finally {
            setLoadingSugestoes(false);
        }
    };

    // Selecionar magistrado do TJSP e buscar detalhes
    const selecionarMagistradoTJSP = async (sugestao) => {
        console.log('===========================================');
        console.log('🚀 INICIAL - DISPARANDO REQUISIÇÃO PARA TJSP');
        console.log('🚀 Sugestão:', sugestao);
        console.log('🚀 Código:', sugestao.value);
        console.log('🚀 URL:', `/tjsp/detalhes_magistrado/${sugestao.value}`);
        console.log('===========================================');
        
        try {
            const response = await api.get(`/tjsp/detalhes_magistrado/${sugestao.value}`);
            
            console.log('📥 INICIAL - Resposta recebida:', response.data);
            
            if (response.data.success) {
                console.log('📥 INICIAL - Detalhes do magistrado:', response.data.detalhes);
                setMagistradoSelecionadoTJSP(response.data.detalhes);
                setBusca(response.data.detalhes.nome);
                setSugestoesMagistrados([]);
                setShowSugestoes(false);
            }
        } catch (error) {
            console.error('===========================================');
            console.error('❌ INICIAL - ERRO AO BUSCAR DETALHES DO TJSP');
            console.error('❌ Erro:', error);
            console.error('❌ Response:', error.response?.data);
            console.error('❌ Status:', error.response?.status);
            console.error('===========================================');
            alert('Erro ao buscar detalhes do magistrado');
        }
    };

    const handleBuscar = async (e) => {
        e.preventDefault();
        
        setBuscando(true);
        try {
            // Se tem texto de busca, tenta primeiro no TJSP
            if (busca.trim()) {
                try {
                    const responseTJSP = await api.get('/tjsp/autocomplete_magistrado', {
                        params: { nome: busca.trim() }
                    });
                    
                    if (responseTJSP.data.success && responseTJSP.data.magistrados.length > 0) {
                        // Mapeia os dados do TJSP para o formato de lista
                        const magistradosTJSP = responseTJSP.data.magistrados.map(mag => ({
                            _id: mag.value || mag.label, // Usa o código ou nome como ID
                            nome: mag.label,
                            Descricao: mag.label,
                            Descricao2: `${mag.cargoFormatado || ''}${mag.cargoFormatado && mag.localFormatado ? ' • ' : ''}${mag.localFormatado || ''}`,
                            codigo: mag.value,
                            cargo: mag.cargoFormatado,
                            lotacao: mag.localFormatado,
                            setor: mag.setor,
                            tribunal: 'TJSP',
                            origem: 'tjsp'
                        }));
                        setMagistrados(magistradosTJSP);
                        setAdvogados([]);
                        setBuscando(false);
                        return;
                    }
                } catch (errTJSP) {
                    console.log('Erro na busca TJSP, tentando busca local:', errTJSP);
                }
            }
            
            // Busca local com filtros
            const params = {
                nome: busca.trim(),
                ...filtros
            };
            
            // Remove parâmetros vazios
            Object.keys(params).forEach(key => {
                if (!params[key]) delete params[key];
            });

            const response = await api.get("/listar_magistrados", { params });
            
            if (response.data.success) {
                setMagistrados(response.data.magistrados || []);
            } else {
                setMagistrados([]);
            }
            setAdvogados([]); // Limpa advogados
        } catch (error) {
            console.error("Erro na busca:", error);
            alert("Erro ao buscar magistrados");
            setMagistrados([]);
        } finally {
            setBuscando(false);
        }
    };

    const handleBuscarAdvogado = async (e) => {
        e.preventDefault();
        
        setBuscandoAdvogado(true);
        try {
            // Se tem texto de busca, tenta primeiro na OAB
            if (buscaAdvogado.trim()) {
                try {
                    const responseOAB = await api.post("/oab/buscar_advogado", { 
                        nomeAdv: buscaAdvogado 
                    });
                    
                    if (responseOAB.data.success && responseOAB.data.data.length > 0) {
                        // Mapeia os dados da OAB para o formato esperado
                        const advogadosOAB = responseOAB.data.data.map(adv => ({
                            nome: adv.nome,
                            oab: adv.inscricao,
                            uf: adv.uf,
                            tipoInscricao: adv.tipoInscricao,
                            nomeSocial: adv.nomeSocial,
                            detailUrl: adv.detailUrl,
                            origem: 'oab'
                        }));
                        setAdvogados(advogadosOAB);
                        setMagistrados([]);
                        setBuscandoAdvogado(false);
                        return;
                    }
                } catch (errOAB) {
                    console.log('Erro na busca OAB, tentando busca local:', errOAB);
                }
            }
            
            // Busca local com filtros
            const params = {
                nome: buscaAdvogado.trim(),
                ...filtrosAdvogado
            };
            
            // Remove parâmetros vazios
            Object.keys(params).forEach(key => {
                if (!params[key]) delete params[key];
            });

            const response = await api.get("/listar_advogados", { params });
            
            if (response.data.success) {
                setAdvogados((response.data.advogados || []).map(adv => ({ ...adv, origem: 'local' })));
            } else {
                setAdvogados([]);
            }
            setMagistrados([]);
        } catch (error) {
            console.error("Erro na busca:", error);
            alert("Erro ao buscar advogados");
            setAdvogados([]);
        } finally {
            setBuscandoAdvogado(false);
        }
    };

    const handleSelectMagistrado = (magistrado) => {
        setSelectedMagistrado(magistrado);
        setSelectedAdvogado(null);
        setAvaliacaoForm({ nota: 5, comentario: "", anonima: false });
    };

    const handleSelectAdvogado = (advogado) => {
        setSelectedAdvogado(advogado);
        setSelectedMagistrado(null);
        setAvaliacaoForm({ nota: 5, comentario: "", anonima: false });
    };

    const handleSubmitAvaliacao = async (e) => {
        e.preventDefault();

        try {
            if (selectedMagistrado) {
                await api.post("avaliar_magistrado", {
                    nomeMagistrado: selectedMagistrado.Descricao || selectedMagistrado.nome,
                    idadeMagistrado: selectedMagistrado.idade || "Não informado",
                    nota: parseInt(avaliacaoForm.nota),
                    comentario: avaliacaoForm.comentario,
                    anonima: avaliacaoForm.anonima
                });
            } else if (selectedAdvogado) {
                // Se o advogado veio da OAB, cria no banco primeiro
                let advogadoId = selectedAdvogado._id;
                
                if (selectedAdvogado.origem === 'oab' && !advogadoId) {
                    // Cria ou busca o advogado no banco local
                    const createResponse = await api.post("buscar_advogado", { 
                        texto: selectedAdvogado.oab 
                    });
                    
                    // Se não existir, será criado ao avaliar
                }

                await api.post("avaliar_advogado", {
                    advogadoId: advogadoId,
                    nomeAdvogado: selectedAdvogado.nome,
                    oab: selectedAdvogado.oab,
                    uf: selectedAdvogado.uf,
                    tipoInscricao: selectedAdvogado.tipoInscricao,
                    nomeSocial: selectedAdvogado.nomeSocial,
                    detailUrl: selectedAdvogado.detailUrl,
                    nota: parseInt(avaliacaoForm.nota),
                    comentario: avaliacaoForm.comentario,
                    anonima: avaliacaoForm.anonima
                });
            }

            alert("Avaliação registrada com sucesso!");
            setSelectedMagistrado(null);
            setSelectedAdvogado(null);
            setBusca("");
            setMagistrados([]);
            setAdvogados([]);
            setAvaliacaoForm({ nota: 5, comentario: "", anonima: false });
        } catch (error) {
            console.error("Erro ao avaliar:", error);
            alert("Erro ao registrar avaliação");
        }
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!chatMessage.trim()) return;

        const newMessage = {
            id: chatMessages.length + 1,
            type: 'sent',
            text: chatMessage,
            time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        };

        setChatMessages([...chatMessages, newMessage]);
        setChatMessage('');

        // Simula resposta automática
        setTimeout(() => {
            const autoReply = {
                id: chatMessages.length + 2,
                type: 'received',
                text: 'Obrigado pela sua mensagem! Em breve retornaremos.',
                time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
            };
            setChatMessages(prev => [...prev, autoReply]);
        }, 1000);
    };

    const handleTrocarTipo = async () => {
        if (!novoTipo) {
            alert('Selecione um tipo de conta');
            return;
        }

        if (novoTipo === 'advogado' && !dadosValidacao.oab) {
            alert('Informe o número da OAB');
            return;
        }

        if (novoTipo === 'magistrado' && !dadosValidacao.cnj) {
            alert('Informe o número do CNJ');
            return;
        }

        try {
            await api.put('/auth/update-tipo', {
                tipo: novoTipo,
                oab: dadosValidacao.oab,
                cnj: dadosValidacao.cnj
            });

            alert('Tipo de conta atualizado com sucesso! Por favor, faça login novamente.');
            logout();
            navigate('/login');
        } catch (error) {
            console.error('Erro ao trocar tipo:', error);
            alert(error.response?.data?.error || 'Erro ao atualizar tipo de conta');
        }
    };

    // Função para abrir perfil inline (dentro da página Procurar)
    const handleAbrirPerfil = async (tipo, dados) => {
        console.log('🔍 handleAbrirPerfil chamado:', { tipo, dados });
        
        // Muda para a seção procurar
        setActiveSection('procurar');
        setLoadingPerfilInline(true);
        setTipoPerfilInline(tipo);
        setActiveTabPerfil('sobre');
        
        try {
            const id = dados._id || dados.id || dados.codigo || dados.oab;
            console.log('🆔 ID identificado:', id);
            let response;
            
            if (tipo === 'magistrado') {
                // Se temos um ID válido, tenta buscar por GET
                if (id && typeof id !== 'string' || (typeof id === 'string' && id.length < 50)) {
                    try {
                        response = await api.get(`/buscar_magistrado/${encodeURIComponent(id)}`);
                    } catch (err) {
                        // Se GET falhar, tenta POST com o nome
                        try {
                            response = await api.post('/buscar_magistrado', { texto: dados.nome });
                        } catch (postErr) {
                            response = { data: dados };
                        }
                    }
                } else {
                    // Se não temos ID, usa POST com o nome
                    try {
                        response = await api.post('/buscar_magistrado', { texto: dados.nome });
                    } catch (err) {
                        response = { data: dados };
                    }
                }
            } else {
                // Para advogados
                if (id && typeof id !== 'string' || (typeof id === 'string' && id.length < 50)) {
                    try {
                        response = await api.get(`/buscar_advogado/${encodeURIComponent(id)}`);
                    } catch (err) {
                        try {
                            response = await api.post('/buscar_advogado', { texto: dados.nome || dados.oab });
                        } catch (postErr) {
                            response = { data: dados };
                        }
                    }
                } else {
                    try {
                        response = await api.post('/buscar_advogado', { texto: dados.nome || dados.oab });
                    } catch (err) {
                        response = { data: dados };
                    }
                }
            }
            
            console.log('📥 Resposta da API:', response.data);
            
            // Processa a resposta - pode vir como { magistrado: {...} } ou diretamente {...}
            let dadosPerfil = response.data;
            if (response.data.magistrado) {
                dadosPerfil = response.data.magistrado;
            } else if (response.data.advogado) {
                dadosPerfil = response.data.advogado;
            }
            
            console.log('📋 Dados do perfil processados:', dadosPerfil);
            
            // Formata os dados do perfil
            const perfilFormatado = {
                nome: dadosPerfil.nome || dadosPerfil.Descricao || dados.nome,
                cargo: dadosPerfil.cargo || dados.cargo,
                lotacao: dadosPerfil.lotacao || dados.lotacao,
                setor: dadosPerfil.setor || dados.setor,
                oab: dadosPerfil.oab || dados.oab,
                uf: dadosPerfil.uf || dados.uf,
                foto: dadosPerfil.foto,
                email: dadosPerfil.email,
                telefone: dadosPerfil.telefone,
                endereco: dadosPerfil.endereco,
                sobre: dadosPerfil.sobre,
                avaliacoes: dadosPerfil.avaliacoes || [],
                areas: dadosPerfil.areas || [],
                formacao: dadosPerfil.formacao,
                experiencia: dadosPerfil.experiencia,
                publicacoes: dadosPerfil.publicacoes
            };
            
            console.log('✅ Perfil formatado:', perfilFormatado);
            setPerfilInline(perfilFormatado);
            console.log('✅ perfilInline setado!');
        } catch (error) {
            console.error('❌ Erro ao carregar perfil:', error);
            alert('Erro ao carregar perfil');
        } finally {
            setLoadingPerfilInline(false);
        }
    };

    const handleVoltarParaResultados = () => {
        setPerfilInline(null);
        setTipoPerfilInline(null);
        setActiveTabPerfil('sobre');
    };

    const formatarNome = (nome) => {
        if (!nome) return '';
        
        const preposicoes = ['de', 'da', 'do', 'das', 'dos', 'e', 'a', 'o'];
        
        return nome
            .toLowerCase()
            .split(' ')
            .map((palavra, index) => {
                // Primeira palavra sempre com letra maiúscula
                if (index === 0) {
                    return palavra.charAt(0).toUpperCase() + palavra.slice(1);
                }
                // Preposições em minúscula
                if (preposicoes.includes(palavra)) {
                    return palavra;
                }
                // Outras palavras com primeira letra maiúscula
                return palavra.charAt(0).toUpperCase() + palavra.slice(1);
            })
            .join(' ');
    };

    const calcularMediaAvaliacoes = (avaliacoes) => {
        if (!avaliacoes || avaliacoes.length === 0) return 0;
        const soma = avaliacoes.reduce((acc, av) => acc + av.nota, 0);
        return (soma / avaliacoes.length).toFixed(1);
    };

    const renderRatingSlider = (nota, readOnly = true) => {
        const getColor = (rating) => {
            if (rating <= 1) return '#ef4444';
            if (rating <= 2) return '#f97316';
            if (rating <= 3) return '#eab308';
            if (rating <= 4) return '#84cc16';
            return '#22c55e';
        };

        const getLabel = (rating) => {
            if (rating === 0) return 'Sem avaliação';
            if (rating <= 1) return 'Muito ruim';
            if (rating <= 2) return 'Ruim';
            if (rating <= 3) return 'Regular';
            if (rating <= 4) return 'Bom';
            return 'Excelente';
        };

        return (
            <div className="rating-slider-display">
                <div className="rating-slider-track">
                    <div 
                        className="rating-slider-fill"
                        style={{ 
                            width: `${(nota / 5) * 100}%`,
                            background: getColor(nota)
                        }}
                    />
                </div>
                <div className="rating-slider-info">
                    <span className="rating-value" style={{ color: getColor(nota) }}>
                        {nota.toFixed(1)}
                    </span>
                    <span className="rating-label">{getLabel(nota)}</span>
                </div>
            </div>
        );
    };

    const renderStars = (nota) => {
        return renderRatingSlider(nota, true);
    };

    // Funções para convites
    const buscarMagistrados = async (termo) => {
        console.log('Buscando magistrados com termo:', termo);
        if (!termo || termo.length < 2) {
            setSearchResults([]);
            return;
        }

        try {
            const response = await api.get(`/gabinete/buscar-magistrados?termo=${termo}`);
            console.log('Magistrados encontrados:', response.data.magistrados);
            setSearchResults(response.data.magistrados || []);
        } catch (error) {
            console.error('Erro ao buscar magistrados:', error);
            setSearchResults([]);
        }
    };

    const carregarConvites = async () => {
        try {
            if (user?.tipo === 'assistente') {
                const response = await api.get('/gabinete/convites/enviados');
                setConvitesEnviados(response.data.convites || []);
            } else if (user?.tipo === 'magistrado') {
                const response = await api.get('/gabinete/convites/pendentes');
                setConvitesPendentes(response.data.convites || []);
            }
        } catch (error) {
            console.error('Erro ao carregar convites:', error);
        }
    };

    const enviarConvite = async () => {
        if (!selectedMagistrado && !conviteEmail) {
            alert('Selecione um magistrado ou informe o email');
            return;
        }

        try {
            const dados = {
                mensagem: conviteMensagem,
                cargoDesejado: cargoDesejado
            };

            if (selectedMagistrado) {
                dados.magistradoId = selectedMagistrado._id;
            } else {
                dados.email = conviteEmail;
            }

            await api.post('/gabinete/convite/enviar', dados);
            alert('Convite enviado com sucesso!');
            
            // Limpar formulário
            setSelectedMagistrado(null);
            setConviteEmail('');
            setConviteMensagem('');
            setSearchTerm('');
            setSearchResults([]);
            
            // Recarregar convites
            carregarConvites();
        } catch (error) {
            console.error('Erro ao enviar convite:', error);
            alert(error.response?.data?.error || 'Erro ao enviar convite');
        }
    };

    const responderConvite = async (conviteId, acao) => {
        try {
            await api.put(`/gabinete/convite/${conviteId}/${acao}`);
            alert(acao === 'aceitar' ? 'Convite aceito!' : 'Convite recusado');
            carregarConvites();
        } catch (error) {
            console.error('Erro ao responder convite:', error);
            alert(error.response?.data?.error || 'Erro ao responder convite');
        }
    };

    useEffect(() => {
        if (activeSection === 'convites') {
            carregarConvites();
        }
    }, [activeSection]);
    
    useEffect(() => {
        if (activeSection === 'gabinete' && user?.tipo === 'magistrado') {
            setLoadingGabinete(true);
            api.get('/gabinete/meu')
                .then(response => {
                    console.log('Gabinete carregado:', response.data);
                    setGabineteData(response.data.gabinete);
                })
                .catch(error => {
                    console.error('Erro ao carregar gabinete:', error);
                    if (error.response?.status !== 404) {
                        alert('Erro ao carregar gabinete');
                    }
                })
                .finally(() => {
                    setLoadingGabinete(false);
                });
        }
    }, [activeSection, user?.tipo]);

    useEffect(() => {
        const timer = setTimeout(() => {
            buscarMagistrados(searchTerm);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Funções para interações em avaliações (curtir e responder)
    const handleCurtirAvaliacao = async (tipo, perfilId, avaliacaoId) => {
        try {
            const response = await api.post(`/avaliacao/${tipo}/${perfilId}/${avaliacaoId}/curtir`);
            if (response.data.success) {
                // Atualiza a lista de avaliações
                await carregarMinhasAvaliacoes();
            }
        } catch (error) {
            console.error('Erro ao curtir avaliação:', error);
            alert('Erro ao curtir avaliação');
        }
    };

    const handleResponderAvaliacao = async (tipo, perfilId, avaliacaoId) => {
        if (!textoResposta.trim()) return;
        
        try {
            const response = await api.post(`/avaliacao/${tipo}/${perfilId}/${avaliacaoId}/responder`, {
                texto: textoResposta
            });
            if (response.data.success) {
                setTextoResposta('');
                setRespondendoAvaliacao(null);
                // Atualiza a lista de avaliações
                await carregarMinhasAvaliacoes();
            }
        } catch (error) {
            console.error('Erro ao responder avaliação:', error);
            alert('Erro ao responder avaliação');
        }
    };

    const getRatingLabel = (rating) => {
        if (rating === 0) return 'Sem avaliação';
        if (rating <= 1) return 'Muito ruim';
        if (rating <= 2) return 'Ruim';
        if (rating <= 3) return 'Regular';
        if (rating <= 4) return 'Bom';
        return 'Excelente';
    };

    const renderIcon = (iconName) => {
        const icons = {
            dashboard: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
            scale: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v18"/><path d="M5 7l7-4 7 4"/><path d="M5 7v13l7 4 7-4V7"/><path d="M5 7l7 4 7-4"/></svg>,
            star: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
            file: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
            trophy: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>,
            search: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
            award: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>,
            user: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
            message: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
            chart: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
            briefcase: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
            users: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
            clipboard: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>,
            folder: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>,
            mail: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
        };
        return icons[iconName] || null;
    };

    const getPageTitle = () => {
        const menuItem = getMenuItems().find(item => item.id === activeSection);
        return menuItem ? menuItem.label : 'Dashboard';
    };

    const getNavbarActions = () => {
        const actions = [];
        
        // Ações específicas por seção
        switch(activeSection) {
            case 'dashboard':
                if (user?.tipo === 'comum') {
                    actions.push(
                        { label: 'Nova Avaliação', icon: 'star', action: () => setActiveSection('avaliar-magistrado') }
                    );
                } else if (user?.tipo === 'magistrado' || user?.tipo === 'assistente') {
                    actions.push(
                        { label: 'Nova Tarefa', icon: 'plus', action: () => setActiveSection('adam-tarefas') }
                    );
                }
                break;
            case 'perfil':
                actions.push(
                    { label: 'Editar Perfil', icon: 'edit', action: () => console.log('Editar perfil') }
                );
                break;
            case 'gabinete':
                actions.push(
                    { label: 'Gerenciar Equipe', icon: 'users', action: () => console.log('Gerenciar') }
                );
                break;
            case 'adam-tarefas':
                actions.push(
                    { label: 'Nova Tarefa', icon: 'plus', action: () => console.log('Nova tarefa') }
                );
                break;
            case 'adam-votos':
                actions.push(
                    { label: 'Novo Voto', icon: 'plus', action: () => console.log('Novo voto') }
                );
                break;
        }
        
        return actions;
    };

    const getBreadcrumb = () => {
        const breadcrumb = [];

        // Mapeamento de seções para breadcrumbs
        const sectionMap = {
            'dashboard': [{ label: 'Principal', action: () => setActiveSection('dashboard') }],
            'procurar': [{ label: 'Principal', action: () => setActiveSection('dashboard') }, { label: 'Procurar', action: null }],
            'avaliar-magistrado': [{ label: 'Sistema', action: null }, { label: 'Avaliar Magistrado', action: null }],
            'avaliar-advogado': [{ label: 'Sistema', action: null }, { label: 'Avaliar Advogado', action: null }],
            'minhas-avaliacoes': [{ label: 'Sistema', action: null }, { label: 'Minhas Avaliações', action: null }],
            'ranking': [{ label: 'Sistema', action: null }, { label: 'Ranking Magistrados', action: null }],
            'ranking-advogados': [{ label: 'Sistema', action: null }, { label: 'Ranking Advogados', action: null }],
            'perfil': [{ label: 'Meu Perfil', action: null }],
            'avaliacoes-recebidas': [{ label: 'Avaliações Recebidas', action: null }],
            'estatisticas': [{ label: 'Estatísticas', action: null }],
            'gabinete': [{ label: 'Sistema ADAM', action: null }, { label: 'Meu Gabinete', action: null }],
            'adam-tarefas': [{ label: 'Sistema ADAM', action: null }, { label: 'Tarefas', action: null }],
            'adam-votos': [{ label: 'Sistema ADAM', action: null }, { label: 'Banco de Votos', action: null }],
            'adam-mensagens': [{ label: 'Sistema ADAM', action: null }, { label: 'Mensagens', action: null }],
            'convites': [{ label: 'Sistema ADAM', action: null }, { label: 'Convites', action: null }],
        };

        // Adicionar breadcrumbs da seção
        if (sectionMap[activeSection]) {
            breadcrumb.push(...sectionMap[activeSection]);
        }

        // Se estiver na seção procurar
        if (activeSection === 'procurar') {
            // Se estiver visualizando um perfil
            if (perfilInline) {
                breadcrumb.push({ 
                    label: activeTab === 'magistrado' ? 'Magistrado' : 'Advogado', 
                    action: handleVoltarParaResultados 
                });
                breadcrumb.push({ 
                    label: `Perfil`, 
                    action: null 
                });
            } else {
                // Se não estiver visualizando perfil, só mostra o tipo
                breadcrumb.push({ 
                    label: activeTab === 'magistrado' ? 'Magistrado' : 'Advogado', 
                    action: null 
                });
            }
        }

        return breadcrumb;
    };

    const getMenuItems = () => {
        const baseItems = [
            { id: 'dashboard', icon: 'dashboard', label: 'Dashboard' }
        ];

        // Itens específicos para usuário comum
        if (user?.tipo === 'comum') {
            baseItems.push(
                { id: 'procurar', icon: 'search', label: 'Procurar' },
                { id: 'avaliar', icon: 'scale', label: 'Avaliar' },
                { id: 'minhas-avaliacoes', icon: 'file', label: 'Minhas Avaliações' },
                { id: 'ranking', icon: 'trophy', label: 'Rankings' },
                { id: 'chat', icon: 'message', label: 'Mensagens' }
            );
        }

        // Itens específicos para advogado
        if (user?.tipo === 'advogado') {
            baseItems.push(
                { id: 'perfil', icon: 'user', label: 'Meu Perfil' },
                { id: 'avaliacoes-recebidas', icon: 'message', label: 'Avaliações Recebidas' },
                { id: 'avaliar', icon: 'scale', label: 'Avaliar Magistrado' },
                { id: 'ranking', icon: 'trophy', label: 'Rankings' },
                { id: 'chat', icon: 'mail', label: 'Mensagens' }
            );
        }

        // Itens específicos para magistrado
        if (user?.tipo === 'magistrado') {
            baseItems.push(
                { id: 'perfil', icon: 'user', label: 'Meu Perfil' },
                { id: 'avaliacoes-recebidas', icon: 'message', label: 'Avaliações Recebidas' },
                { id: 'estatisticas', icon: 'chart', label: 'Estatísticas' },
                { id: 'gabinete', icon: 'briefcase', label: 'Meu Gabinete' },
                { id: 'adam-tarefas', icon: 'clipboard', label: 'Tarefas' },
                { id: 'adam-votos', icon: 'folder', label: 'Banco de Votos' },
                { id: 'chat', icon: 'mail', label: 'Mensagens' },
                { id: 'convites', icon: 'users', label: 'Convites' }
            );
        }

        // Itens específicos para assistente
        if (user?.tipo === 'assistente') {
            baseItems.push(
                { id: 'gabinete', icon: 'briefcase', label: 'Meu Gabinete' },
                { id: 'adam-tarefas', icon: 'clipboard', label: 'Tarefas' },
                { id: 'adam-votos', icon: 'folder', label: 'Banco de Votos' },
                { id: 'chat', icon: 'mail', label: 'Mensagens' },
                { id: 'convites', icon: 'users', label: 'Convites' }
            );
        }

        return baseItems;
    };

    const renderContent = () => {
        switch (activeSection) {
            case 'dashboard':
                return renderDashboard();
            case 'procurar':
                return (
                    <>
                        {!perfilInline && (
                            <div className="search-type-selector">
                                <button 
                                    className={`type-selector-btn ${activeTab === 'magistrado' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('magistrado')}
                                >
                                    Magistrado
                                </button>
                                <button 
                                    className={`type-selector-btn ${activeTab === 'advogado' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('advogado')}
                                >
                                    Advogado
                                </button>
                            </div>
                        )}
                        {renderProcurar()}
                    </>
                );
            case 'avaliar':
                return renderAvaliar();
            case 'avaliar-magistrado':
                return renderAvaliarMagistrado();
            case 'avaliar-advogado':
                return renderAvaliarAdvogado();
            case 'minhas-avaliacoes':
                return renderMinhasAvaliacoes();
            case 'ranking':
                return renderRankingUnificado();
            case 'ranking-advogados':
                return renderRankingAdvogados();
            case 'perfil':
                return renderPerfil();
            case 'avaliacoes-recebidas':
                return renderAvaliacoesRecebidas();
            case 'clientes':
                return renderClientes();
            case 'estatisticas':
                return renderEstatisticas();
            case 'gabinete':
                return renderGabinete();
            case 'adam-tarefas':
                return renderTarefas();
            case 'adam-votos':
                return renderVotos();
            case 'chat':
                return renderChat();
            case 'adam-mensagens':
                return renderMensagensADAM();
            case 'convites':
                return renderConvites();
            default:
                return renderDashboard();
        }
    };

    const renderDashboard = () => (
        <div className="dashboard-content">
            {user?.tipo === 'comum' ? (
                <>
                    {/* Rankings lado a lado */}
                    <div className="dashboard-grid">
                        {/* Top Magistrados */}
                        <div className="dashboard-section">
                            <div className="section-header">
                                <h3>Magistrados Mais Bem Avaliados</h3>
                                <button 
                                    className="view-all-btn"
                                    onClick={() => setActiveSection('ranking')}
                                >
                                    Ver todos
                                </button>
                            </div>
                            <div className="top-list">
                                {ranking.slice(0, 5).map((mag, index) => (
                                    <div 
                                        key={index} 
                                        className="top-item"
                                        onClick={() => handleAbrirPerfil('magistrado', mag)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <div className="top-rank">{index + 1}</div>
                                        <div className="top-info">
                                            <h4>{formatarNome(mag.nome)}</h4>
                                            <div className="top-meta">
                                                <span className="top-tribunal">{mag.tribunal || 'Tribunal não informado'}</span>
                                                <div className="avaliacoes-badges">
                                                    <span className="badge-avaliacoes verified" title="Avaliações verificadas">
                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                                            <polyline points="22 4 12 14.01 9 11.01"/>
                                                        </svg>
                                                        {mag.avaliacoesVerificadas || 0}
                                                    </span>
                                                    <span className="badge-avaliacoes unverified" title="Avaliações não verificadas">
                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                                                        </svg>
                                                        {mag.avaliacoesNaoVerificadas || 0}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="top-rating">
                                            <span className="rating-value">{mag.media?.toFixed(1) || '0.0'}</span>
                                            <span className="rating-stars">
                                                {Array.from({ length: 5 }, (_, i) => (
                                                    <svg 
                                                        key={i} 
                                                        width="14" 
                                                        height="14" 
                                                        viewBox="0 0 24 24" 
                                                        fill={i < Math.round(mag.media || 0) ? '#667eea' : 'none'}
                                                        stroke="#667eea" 
                                                        strokeWidth="2" 
                                                        strokeLinecap="round" 
                                                        strokeLinejoin="round"
                                                    >
                                                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                                                    </svg>
                                                ))}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                                {ranking.length === 0 && (
                                    <p className="empty-message">Nenhum magistrado avaliado ainda</p>
                                )}
                            </div>
                        </div>

                        {/* Top Advogados */}
                        <div className="dashboard-section">
                            <div className="section-header">
                                <h3>Advogados Mais Bem Avaliados</h3>
                                <button 
                                    className="view-all-btn"
                                    onClick={() => setActiveSection('ranking')}
                                >
                                    Ver todos
                                </button>
                            </div>
                            <div className="top-list">
                                {rankingAdvogados.slice(0, 5).map((adv, index) => (
                                    <div key={index} className="top-item">
                                        <div className="top-rank">{index + 1}</div>
                                        <div className="top-info">
                                            <h4>{formatarNome(adv.nome)}</h4>
                                            <div className="top-meta">
                                                <span className="top-tribunal">OAB: {adv.oab || 'Não informado'}</span>
                                                <div className="avaliacoes-badges">
                                                    <span className="badge-avaliacoes verified" title="Avaliações verificadas">
                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                                            <polyline points="22 4 12 14.01 9 11.01"/>
                                                        </svg>
                                                        {adv.avaliacoesVerificadas || 0}
                                                    </span>
                                                    <span className="badge-avaliacoes unverified" title="Avaliações não verificadas">
                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                                                        </svg>
                                                        {adv.avaliacoesNaoVerificadas || 0}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="top-rating">
                                            <span className="rating-value">{adv.media?.toFixed(1) || '0.0'}</span>
                                            <span className="rating-stars">
                                                {Array.from({ length: 5 }, (_, i) => (
                                                    <svg 
                                                        key={i} 
                                                        width="14" 
                                                        height="14" 
                                                        viewBox="0 0 24 24" 
                                                        fill={i < Math.round(adv.media || 0) ? '#667eea' : 'none'}
                                                        stroke="#667eea" 
                                                        strokeWidth="2" 
                                                        strokeLinecap="round" 
                                                        strokeLinejoin="round"
                                                    >
                                                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                                                    </svg>
                                                ))}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                                {rankingAdvogados.length === 0 && (
                                    <p className="empty-message">Nenhum advogado avaliado ainda</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Acompanhamento de Minhas Avaliações */}
                    <div className="dashboard-section minhas-avaliacoes-section">
                        <div className="section-header">
                            <h3>Acompanhamento das Minhas Avaliações</h3>
                            <button 
                                className="view-all-btn"
                                onClick={() => setActiveSection('minhas-avaliacoes')}
                            >
                                Ver todas
                            </button>
                        </div>
                        <div className="avaliacoes-acompanhamento">
                            {minhasAvaliacoes.length > 0 ? (
                                <div className="avaliacoes-timeline">
                                    {minhasAvaliacoes.slice(0, 3).map((av, index) => (
                                        <div key={index} className="timeline-item">
                                            <div className="timeline-marker">
                                                {av.avaliacao?.respostas?.length > 0 ? (
                                                    <span className="has-response">💬</span>
                                                ) : (
                                                    <span className="no-response">📝</span>
                                                )}
                                            </div>
                                            <div className="timeline-content">
                                                <div className="timeline-header">
                                                    <h4>{av.perfilNome}</h4>
                                                    <span className={`tipo-badge ${av.tipo}`}>{av.tipo}</span>
                                                </div>
                                                <div className="timeline-rating">
                                                    <div className="rating-slider-inline">
                                                        <div 
                                                            className="slider-fill" 
                                                            style={{ width: `${(av.avaliacao?.nota || 0) * 20}%` }}
                                                        />
                                                    </div>
                                                    <span>{(av.avaliacao?.nota || 0).toFixed(1)}</span>
                                                </div>
                                                {av.avaliacao?.comentario && (
                                                    <p className="timeline-comment">"{av.avaliacao.comentario.substring(0, 100)}..."</p>
                                                )}
                                                <div className="timeline-meta">
                                                    <span className="timeline-date">
                                                        {new Date(av.avaliacao?.criadoEm).toLocaleDateString('pt-BR')}
                                                    </span>
                                                    {av.avaliacao?.respostas?.length > 0 && (
                                                        <span className="response-indicator">
                                                            {av.avaliacao.respostas.length} resposta(s)
                                                        </span>
                                                    )}
                                                    {av.avaliacao?.curtidas?.length > 0 && (
                                                        <span className="likes-indicator">
                                                            ❤️ {av.avaliacao.curtidas.length}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-avaliacoes">
                                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                        <polyline points="14 2 14 8 20 8"/>
                                    </svg>
                                    <p>Você ainda não fez nenhuma avaliação</p>
                                    <button 
                                        className="btn-primary"
                                        onClick={() => setActiveSection('avaliar')}
                                    >
                                        Fazer primeira avaliação
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Ações Rápidas */}
                    <div className="quick-actions">
                        <h3>Ações Rápidas</h3>
                        <div className="actions-grid">
                            <button onClick={() => setActiveSection('procurar')} className="action-btn">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="11" cy="11" r="8"/>
                                    <path d="m21 21-4.35-4.35"/>
                                </svg>
                                <span>Procurar</span>
                            </button>
                            <button onClick={() => setActiveSection('avaliar')} className="action-btn">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                </svg>
                                <span>Nova Avaliação</span>
                            </button>
                            <button onClick={() => setActiveSection('ranking')} className="action-btn">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
                                    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
                                    <path d="M4 22h16"/>
                                    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
                                    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
                                    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
                                </svg>
                                <span>Rankings</span>
                            </button>
                            <button onClick={() => setActiveSection('chat')} className="action-btn">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                                </svg>
                                <span>Mensagens</span>
                            </button>
                        </div>
                    </div>
                </>
            ) : (
                <>
                    {/* Dashboard para advogados e magistrados */}
                    <div className="stats-grid">
                        {(user?.tipo === 'advogado' || user?.tipo === 'magistrado') && (
                            <>
                                <div className="stat-card">
                                    <div className="stat-icon">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                                        </svg>
                                    </div>
                                    <div className="stat-info">
                                        <h3>{perfilData?.avaliacoes?.length || 0}</h3>
                                        <p>Avaliações Recebidas</p>
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                                        </svg>
                                    </div>
                                    <div className="stat-info">
                                        <h3>
                                            {perfilData?.avaliacoes?.length > 0 
                                                ? (perfilData.avaliacoes.reduce((sum, av) => sum + av.nota, 0) / perfilData.avaliacoes.length).toFixed(1)
                                                : '0.0'}
                                        </h3>
                                        <p>Média de Avaliação</p>
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                                        </svg>
                                    </div>
                                    <div className="stat-info">
                                        <h3>
                                            {perfilData?.avaliacoes?.filter(av => av.resposta).length || 0}
                                        </h3>
                                        <p>Comentários Respondidos</p>
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                                        </svg>
                                    </div>
                                    <div className="stat-info">
                                        <h3 style={{textTransform: 'capitalize'}}>{user?.tipo}</h3>
                                        <p>Tipo de Conta</p>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="quick-actions">
                        <h3>Ações Rápidas</h3>
                        <div className="actions-grid">
                            {(user?.tipo === 'advogado' || user?.tipo === 'magistrado') && (
                                <>
                                    <button onClick={() => setActiveSection('perfil')} className="action-btn">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                            <circle cx="12" cy="7" r="4"/>
                                        </svg>
                                        <span>Editar Perfil</span>
                                    </button>
                                    <button onClick={() => setActiveSection('avaliacoes-recebidas')} className="action-btn">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                                        </svg>
                                        <span>Ver Avaliações</span>
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );

    // Renderizar perfil inline (dentro da seção Procurar)
    const renderPerfilInline = () => {
        if (loadingPerfilInline) {
            return (
                <div className="procurar-content">
                    <div className="perfil-loading">
                        <div className="spinner"></div>
                        <p>Carregando perfil...</p>
                    </div>
                </div>
            );
        }

        const mediaAvaliacoes = calcularMediaAvaliacoes(perfilInline.avaliacoes);

        return (
            <div className="tab-content" style={{ background: 'rgba(255,255,255,0.7)', padding: 0 }}>
                {/* Botão Voltar */}
                <button className="voltar-perfil-btn" onClick={handleVoltarParaResultados}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 12H5M12 19l-7-7 7-7"/>
                    </svg>
                    Voltar
                </button>

                {/* Header do Perfil */}
                <div className="perfil-header-inline">
                    <div className="perfil-header-content">
                        <div className="perfil-photo-section">
                            <div className="perfil-photo">
                                {perfilInline.foto ? (
                                    <img src={perfilInline.foto} alt={perfilInline.nome} />
                                ) : (
                                    <div className="perfil-photo-placeholder">
                                        {perfilInline.nome?.charAt(0)}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="perfil-main-info">
                            <h1 className="perfil-nome">{formatarNome(perfilInline.nome)}</h1>
                            {tipoPerfilInline === 'magistrado' && (
                                <>
                                    <p className="perfil-cargo">{perfilInline.cargo || 'Magistrado'}</p>
                                    {perfilInline.lotacao && (
                                        <p className="perfil-lotacao">{perfilInline.lotacao}</p>
                                    )}
                                    {perfilInline.setor && (
                                        <p className="perfil-setor">{perfilInline.setor}</p>
                                    )}
                                </>
                            )}
                            {tipoPerfilInline === 'advogado' && (
                                <>
                                    <p className="perfil-oab">OAB: {perfilInline.oab}{perfilInline.uf ? `/${perfilInline.uf}` : ''}</p>
                                </>
                            )}

                            <div className="perfil-rating">
                                <div className="rating-stars">
                                    {renderStars(Math.round(mediaAvaliacoes))}
                                </div>
                                <span className="rating-number">{mediaAvaliacoes}</span>
                                <span className="rating-count">({perfilInline.avaliacoes?.length || 0} avaliações)</span>
                            </div>
                        </div>

                        <div className="perfil-actions">
                            <button 
                                className="btn-primary"
                                onClick={() => {
                                    setSelectedMagistrado(perfilInline);
                                    setActiveSection(tipoPerfilInline === 'magistrado' ? 'avaliar-magistrado' : 'avaliar-advogado');
                                }}
                            >
                                Avaliar
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tabs Horizontais Sticky */}
                <div className="perfil-tabs-horizontal">
                    <button 
                        className={`tab-btn-horizontal ${activeTabPerfil === 'sobre' ? 'active' : ''}`}
                        onClick={() => setActiveTabPerfil('sobre')}
                    >
                        Sobre
                    </button>
                    <button 
                        className={`tab-btn-horizontal ${activeTabPerfil === 'avaliacoes' ? 'active' : ''}`}
                        onClick={() => setActiveTabPerfil('avaliacoes')}
                    >
                        Avaliações
                    </button>
                    {tipoPerfilInline === 'magistrado' && (
                        <button 
                            className={`tab-btn-horizontal ${activeTabPerfil === 'curriculo' ? 'active' : ''}`}
                            onClick={() => setActiveTabPerfil('curriculo')}
                        >
                            Experiência
                        </button>
                    )}
                    <button 
                        className={`tab-btn-horizontal ${activeTabPerfil === 'contato' ? 'active' : ''}`}
                        onClick={() => setActiveTabPerfil('contato')}
                    >
                        Contato
                    </button>
                </div>

                {/* Body do Perfil */}
                <div className="perfil-body-inline">
                    <div className="perfil-main-inline">
                        {/* Conteúdo das Tabs */}
                        <div className="tab-panels">
                            {activeTabPerfil === 'sobre' && (
                                <div className="sobre-section">
                                    <h2>Sobre</h2>
                                    <p>{perfilInline.sobre || 'Nenhuma informação disponível.'}</p>
                                    {tipoPerfilInline === 'magistrado' && perfilInline.areas && perfilInline.areas.length > 0 && (
                                        <div className="areas-atuacao">
                                            <h3>Áreas de Atuação</h3>
                                            <div className="tags-list">
                                                {perfilInline.areas.map((area, index) => (
                                                    <span key={index} className="tag">{area}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                            {activeTabPerfil === 'avaliacoes' && (
                                <div className="avaliacoes-section">
                                    {/* Seção de Estatísticas de Avaliações */}
                                    {perfilInline.avaliacoes && perfilInline.avaliacoes.length > 0 && (
                                        <div className="avaliacoes-stats-section">
                                            <div className="stats-header">
                                                <h2>Avaliações dos Clientes</h2>
                                                <div className="overall-rating">
                                                    {renderRatingSlider(parseFloat(mediaAvaliacoes), true)}
                                                    <div className="rating-count-wrapper">
                                                        <div className="rating-count">({perfilInline.avaliacoes.length} avaliações)</div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="stats-content">
                                                {/* Distribuição de Estrelas */}
                                                <div className="stars-distribution">
                                                    {[5, 4, 3, 2, 1].map(stars => {
                                                        const count = perfilInline.avaliacoes.filter(av => Math.round(av.nota) === stars).length;
                                                        const percentage = perfilInline.avaliacoes.length > 0 
                                                            ? Math.round((count / perfilInline.avaliacoes.length) * 100) 
                                                            : 0;
                                                        return (
                                                            <div key={stars} className="star-row">
                                                                <span className="star-number">{stars}</span>
                                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="#FFA500">
                                                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                                                </svg>
                                                                <div className="star-bar-container">
                                                                    <div className="star-bar" style={{ width: `${percentage}%` }}></div>
                                                                </div>
                                                                <span className="star-percentage">{percentage}%</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                                {/* Aspectos Mais Comentados */}
                                                <div className="common-topics">
                                                    <h3>O que os clientes dizem</h3>
                                                    <div className="topics-list">
                                                        <div className="topic-item">
                                                            <div className="topic-rank">1</div>
                                                            <div className="topic-info">
                                                                <span className="topic-name">Conhecimento Técnico</span>
                                                                <span className="topic-votes" style={{ color: '#7c3aed' }}>62 menções</span>
                                                            </div>
                                                        </div>
                                                        <div className="topic-item">
                                                            <div className="topic-rank">2</div>
                                                            <div className="topic-info">
                                                                <span className="topic-name">Agilidade</span>
                                                                <span className="topic-votes" style={{ color: '#10b981' }}>44 menções</span>
                                                            </div>
                                                        </div>
                                                        <div className="topic-item">
                                                            <div className="topic-rank">3</div>
                                                            <div className="topic-info">
                                                                <span className="topic-name">Imparcialidade</span>
                                                                <span className="topic-votes" style={{ color: '#f59e0b' }}>95 menções</span>
                                                            </div>
                                                        </div>
                                                        <div className="topic-item">
                                                            <div className="topic-rank">4</div>
                                                            <div className="topic-info">
                                                                <span className="topic-name">Comunicação</span>
                                                                <span className="topic-votes" style={{ color: '#ec4899' }}>32 menções</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <div className="avaliacoes-header-inline">
                                        <h2>Todas as Avaliações</h2>
                                        <button 
                                            className="btn-avaliar"
                                            onClick={() => {
                                                setSelectedMagistrado(perfilInline);
                                                setActiveSection(tipoPerfilInline === 'magistrado' ? 'avaliar-magistrado' : 'avaliar-advogado');
                                            }}
                                        >
                                            Escrever avaliação
                                        </button>
                                    </div>
                                    {perfilInline.avaliacoes && perfilInline.avaliacoes.length > 0 ? (
                                        <div className="avaliacoes-list">
                                            {perfilInline.avaliacoes.map((avaliacao, index) => (
                                                <div key={index} className="avaliacao-card-review">
                                                    {/* Header com avatar e info do usuário */}
                                                    <div className="review-header">
                                                        <div className="review-user-info">
                                                            <div className="review-avatar">
                                                                {avaliacao.anonima ? (
                                                                    <span>?</span>
                                                                ) : (
                                                                    <span>{avaliacao.usuario?.nome?.charAt(0) || 'U'}</span>
                                                                )}
                                                            </div>
                                                            <div className="review-user-details">
                                                                <h4 className="review-user-name">
                                                                    {avaliacao.anonima ? 'Anônimo' : formatarNome(avaliacao.usuario?.nome || 'Usuário')}
                                                                </h4>
                                                                <span className="review-date">
                                                                    {new Date(avaliacao.createdAt || Date.now()).toLocaleDateString('pt-BR', { 
                                                                        day: '2-digit', 
                                                                        month: 'short', 
                                                                        year: 'numeric' 
                                                                    })}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="review-rating">
                                                            {renderStars(avaliacao.nota)}
                                                        </div>
                                                    </div>
                                                    {/* Comentário */}
                                                    {avaliacao.comentario && (
                                                        <p className="review-comment">{avaliacao.comentario}</p>
                                                    )}
                                                    {/* Resposta do magistrado/advogado */}
                                                    {avaliacao.resposta && (
                                                        <div className="review-response">
                                                            <div className="response-header">
                                                                <div className="response-avatar">
                                                                    {perfilInline.nome?.charAt(0)}
                                                                </div>
                                                                <div className="response-info">
                                                                    <h5>{formatarNome(perfilInline.nome)}</h5>
                                                                    <span className="response-date">
                                                                        {new Date(avaliacao.resposta.respondidoEm).toLocaleDateString('pt-BR', { 
                                                                            day: '2-digit', 
                                                                            month: 'short', 
                                                                            year: 'numeric' 
                                                                        })}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <p className="response-text">{avaliacao.resposta.texto}</p>
                                                        </div>
                                                    )}
                                                    {/* Footer com ações */}
                                                    <div className="review-footer">
                                                        <button 
                                                            className={`review-action-btn ${avaliacao.curtidas?.some(c => c.usuario === user?._id) ? 'liked' : ''}`}
                                                            onClick={() => handleCurtirAvaliacao(tipoPerfilInline, perfilInline._id, avaliacao._id)}
                                                        >
                                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                <path d="M7 10v12"/>
                                                                <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"/>
                                                            </svg>
                                                            <span>{avaliacao.curtidas?.length || 0}</span>
                                                        </button>
                                                        <button 
                                                            className="review-action-btn"
                                                            onClick={() => setRespondendoAvaliacao(respondendoAvaliacao === avaliacao._id ? null : avaliacao._id)}
                                                        >
                                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                                                            </svg>
                                                            <span>Responder</span>
                                                        </button>
                                                        <span className="review-time-ago">
                                                            {(() => {
                                                                const diff = Date.now() - new Date(avaliacao.createdAt || Date.now()).getTime();
                                                                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                                                                if (days === 0) return 'Hoje';
                                                                if (days === 1) return 'Ontem';
                                                                if (days < 7) return `${days} dias atrás`;
                                                                if (days < 30) return `${Math.floor(days / 7)} semanas atrás`;
                                                                return `${Math.floor(days / 30)} meses atrás`;
                                                            })()}
                                                        </span>
                                                    </div>
                                                    
                                                    {/* Formulário de resposta */}
                                                    {respondendoAvaliacao === avaliacao._id && (
                                                        <div className="responder-form">
                                                            <input
                                                                type="text"
                                                                placeholder="Escreva uma resposta..."
                                                                value={textoResposta}
                                                                onChange={(e) => setTextoResposta(e.target.value)}
                                                                onKeyPress={(e) => {
                                                                    if (e.key === 'Enter' && textoResposta.trim()) {
                                                                        handleResponderAvaliacao(tipoPerfilInline, perfilInline._id, avaliacao._id);
                                                                    }
                                                                }}
                                                            />
                                                            <button
                                                                onClick={() => handleResponderAvaliacao(tipoPerfilInline, perfilInline._id, avaliacao._id)}
                                                                disabled={!textoResposta.trim()}
                                                            >
                                                                Enviar
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="no-avaliacoes">Ainda não há avaliações.</p>
                                    )}
                                </div>
                            )}
                            {activeTabPerfil === 'curriculo' && tipoPerfilInline === 'magistrado' && (
                                <div className="curriculo-section">
                                    <h2>Experiência Profissional</h2>
                                    
                                    {/* Formação Acadêmica */}
                                    <div className="curriculo-item">
                                        <h3>Formação Acadêmica</h3>
                                        {perfilInline.formacao ? (
                                            <p>{perfilInline.formacao}</p>
                                        ) : (
                                            <div className="skeleton-content">
                                                <div className="skeleton-line" style={{width: '60%'}}></div>
                                                <div className="skeleton-line" style={{width: '40%'}}></div>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Experiência Profissional */}
                                    <div className="curriculo-item">
                                        <h3>Trajetória</h3>
                                        {perfilInline.experiencia ? (
                                            <p>{perfilInline.experiencia}</p>
                                        ) : (
                                            <div className="skeleton-content">
                                                <div className="skeleton-line" style={{width: '80%'}}></div>
                                                <div className="skeleton-line" style={{width: '70%'}}></div>
                                                <div className="skeleton-line" style={{width: '50%'}}></div>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Publicações */}
                                    <div className="curriculo-item">
                                        <h3>Publicações e Certificações</h3>
                                        {perfilInline.publicacoes ? (
                                            <p>{perfilInline.publicacoes}</p>
                                        ) : (
                                            <div className="skeleton-content">
                                                <div className="skeleton-line" style={{width: '65%'}}></div>
                                                <div className="skeleton-line" style={{width: '55%'}}></div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                            {activeTabPerfil === 'contato' && (
                                <div className="contato-section">
                                    <h2>Informações de Contato</h2>
                                    <div className="contato-cards">
                                        {perfilInline.telefone && (
                                            <div className="contato-card">
                                                <div className="contato-icon">
                                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                                                    </svg>
                                                </div>
                                                <div className="contato-details">
                                                    <h4>Telefone</h4>
                                                    <p>{perfilInline.telefone}</p>
                                                </div>
                                            </div>
                                        )}
                                        {perfilInline.email && (
                                            <div className="contato-card">
                                                <div className="contato-icon">
                                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                                                        <polyline points="22,6 12,13 2,6"/>
                                                    </svg>
                                                </div>
                                                <div className="contato-details">
                                                    <h4>E-mail</h4>
                                                    <p>{perfilInline.email}</p>
                                                </div>
                                            </div>
                                        )}
                                        {perfilInline.endereco && (
                                            <div className="contato-card">
                                                <div className="contato-icon">
                                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                                                        <circle cx="12" cy="10" r="3"/>
                                                    </svg>
                                                </div>
                                                <div className="contato-details">
                                                    <h4>Endereço</h4>
                                                    <p>{perfilInline.endereco}</p>
                                                </div>
                                            </div>
                                        )}
                                        {!perfilInline.telefone && !perfilInline.email && !perfilInline.endereco && (
                                            <p className="no-info">Informações de contato não disponíveis</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderProcurar = () => {
        // Se estiver visualizando um perfil, renderiza o perfil inline
        if (perfilInline) {
            return renderPerfilInline();
        }

        return (
            <>
                <div className="procurar-content">
                    {/* Barra de Filtros Horizontal */}
                    <div className="horizontal-filters-bar">
                        <div className="search-input-wrapper">
                            <svg className="search-icon-inline" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8"/>
                                <path d="m21 21-4.35-4.35"/>
                            </svg>
                            <input
                                type="text"
                                value={activeTab === 'magistrado' ? busca : buscaAdvogado}
                                onChange={(e) => {
                                    const valor = e.target.value;
                                    console.log('⌨️ INICIAL - Digitando:', valor);
                                    if (activeTab === 'magistrado') {
                                        setBusca(valor);
                                    } else {
                                        setBuscaAdvogado(valor);
                                    }
                                }}
                                placeholder={activeTab === 'magistrado' ? "Buscar magistrado..." : "Buscar advogado..."}
                                className="search-inline-input"
                            />
                        </div>

                        {activeTab === 'magistrado' ? (
                            <>
                                <select 
                                    className="filter-dropdown"
                                    value={filtros.tribunal} 
                                    onChange={(e) => setFiltros({...filtros, tribunal: e.target.value})}
                                >
                                    <option value="">Tribunal</option>
                                    <option value="TJSP">TJSP</option>
                                    <option value="TJRJ">TJRJ</option>
                                    <option value="TJRS">TJRS</option>
                                    <option value="TJMG">TJMG</option>
                                    <option value="TJPR">TJPR</option>
                                    <option value="TJSC">TJSC</option>
                                    <option value="STJ">STJ</option>
                                    <option value="STF">STF</option>
                                </select>

                                <select 
                                    className="filter-dropdown"
                                    value={filtros.instancia} 
                                    onChange={(e) => setFiltros({...filtros, instancia: e.target.value})}
                                >
                                    <option value="">Instância</option>
                                    <option value="primeira">1ª Instância</option>
                                    <option value="segunda">2ª Instância</option>
                                    <option value="stj">STJ</option>
                                    <option value="stf">STF</option>
                                </select>

                                <select 
                                className="filter-dropdown"
                                value={filtros.esfera} 
                                onChange={(e) => setFiltros({...filtros, esfera: e.target.value})}
                            >
                                <option value="">Esfera</option>
                                <option value="Cível">Cível</option>
                                <option value="Criminal">Criminal</option>
                                <option value="Trabalhista">Trabalhista</option>
                                <option value="Eleitoral">Eleitoral</option>
                            </select>

                            <select 
                                className="filter-dropdown"
                                value={filtros.mediaMin} 
                                onChange={(e) => setFiltros({...filtros, mediaMin: e.target.value})}
                            >
                                <option value="">Média</option>
                                <option value="4">4+ estrelas</option>
                                <option value="3">3+ estrelas</option>
                                <option value="2">2+ estrelas</option>
                            </select>

                            <select 
                                className="filter-dropdown"
                                value={filtros.ordenarPor} 
                                onChange={(e) => setFiltros({...filtros, ordenarPor: e.target.value})}
                            >
                                <option value="relevancia">Relevância</option>
                                <option value="media">Maior Média</option>
                                <option value="avaliacoes">Mais Avaliados</option>
                            </select>
                        </>
                    ) : (
                        <>
                            <select 
                                className="filter-dropdown"
                                value={filtrosAdvogado.uf} 
                                onChange={(e) => setFiltrosAdvogado({...filtrosAdvogado, uf: e.target.value})}
                            >
                                <option value="">Estado</option>
                                <option value="SP">SP</option>
                                <option value="RJ">RJ</option>
                                <option value="MG">MG</option>
                                <option value="RS">RS</option>
                                <option value="PR">PR</option>
                                <option value="SC">SC</option>
                            </select>

                            <select 
                                className="filter-dropdown"
                                value={filtrosAdvogado.experiencia} 
                                onChange={(e) => setFiltrosAdvogado({...filtrosAdvogado, experiencia: e.target.value})}
                            >
                                <option value="">Experiência</option>
                                <option value="10+">10+ anos</option>
                                <option value="5+">5+ anos</option>
                                <option value="2+">2+ anos</option>
                            </select>

                            <select 
                                className="filter-dropdown"
                                value={filtrosAdvogado.mediaMin} 
                                onChange={(e) => setFiltrosAdvogado({...filtrosAdvogado, mediaMin: e.target.value})}
                            >
                                <option value="">Média</option>
                                <option value="4">4+ estrelas</option>
                                <option value="3">3+ estrelas</option>
                                <option value="2">2+ estrelas</option>
                            </select>

                            <select 
                                className="filter-dropdown"
                                value={filtrosAdvogado.ordenarPor} 
                                onChange={(e) => setFiltrosAdvogado({...filtrosAdvogado, ordenarPor: e.target.value})}
                            >
                                <option value="relevancia">Relevância</option>
                                <option value="media">Maior Média</option>
                                <option value="avaliacoes">Mais Avaliados</option>
                            </select>
                        </>
                    )}

                    <button 
                        className="more-filters-btn"
                        onClick={() => setMostrarFiltros(!mostrarFiltros)}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
                        </svg>
                        {mostrarFiltros ? 'Menos' : 'Mais'}
                    </button>

                    <button 
                        className="search-btn-inline"
                        onClick={activeTab === 'magistrado' ? handleBuscar : handleBuscarAdvogado}
                        disabled={activeTab === 'magistrado' ? buscando : buscandoAdvogado}
                    >
                        {(activeTab === 'magistrado' ? buscando : buscandoAdvogado) ? "..." : "Buscar"}
                    </button>
                </div>

                {/* Filtros Adicionais (Expansível) */}
                {mostrarFiltros && (
                    <div className="additional-filters">
                        {activeTab === 'magistrado' ? (
                            <div className="additional-filters-grid">
                                <input
                                    type="text"
                                value={filtros.comarca}
                                    onChange={(e) => setFiltros({...filtros, comarca: e.target.value})}
                                    placeholder="Comarca"
                                    className="filter-input-small"
                                />
                                <input
                                    type="text"
                                    value={filtros.assunto}
                                    onChange={(e) => setFiltros({...filtros, assunto: e.target.value})}
                                    placeholder="Assunto"
                                    className="filter-input-small"
                                />
                                <input
                                    type="text"
                                    value={filtros.cargo}
                                    onChange={(e) => setFiltros({...filtros, cargo: e.target.value})}
                                    placeholder="Cargo (ex: Desembargador)"
                                    className="filter-input-small"
                                />
                                <input
                                    type="text"
                                    value={filtros.setor}
                                    onChange={(e) => setFiltros({...filtros, setor: e.target.value})}
                                    placeholder="Setor (ex: 31ª Câmara)"
                                    className="filter-input-small"
                                />
                                <select 
                                    className="filter-dropdown-small"
                                    value={filtros.avaliacoesMin} 
                                    onChange={(e) => setFiltros({...filtros, avaliacoesMin: e.target.value})}
                                >
                                    <option value="">Mín. Avaliações</option>
                                    <option value="10">10+</option>
                                    <option value="5">5+</option>
                                    <option value="1">1+</option>
                                </select>
                                <button 
                                    className="clear-filters-small"
                                    onClick={() => setFiltros({ tribunal: '', instancia: '', comarca: '', assunto: '', esfera: '', cargo: '', setor: '', mediaMin: '', avaliacoesMin: '', ordenarPor: 'relevancia' })}
                                >
                                    Limpar
                                </button>
                            </div>
                        ) : (
                            <div className="additional-filters-grid">
                                <input
                                    type="text"
                                    value={filtrosAdvogado.especialidade}
                                    onChange={(e) => setFiltrosAdvogado({...filtrosAdvogado, especialidade: e.target.value})}
                                    placeholder="Especialidade"
                                    className="filter-input-small"
                                />
                                <select 
                                    className="filter-dropdown-small"
                                    value={filtrosAdvogado.avaliacoesMin} 
                                    onChange={(e) => setFiltrosAdvogado({...filtrosAdvogado, avaliacoesMin: e.target.value})}
                                >
                                    <option value="">Mín. Avaliações</option>
                                    <option value="10">10+</option>
                                    <option value="5">5+</option>
                                    <option value="1">1+</option>
                                </select>
                                <button 
                                    className="clear-filters-small"
                                    onClick={() => setFiltrosAdvogado({ uf: '', especialidade: '', experiencia: '', mediaMin: '', avaliacoesMin: '', ordenarPor: 'relevancia' })}
                                >
                                    Limpar
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
                
            <div className="tab-content">
                {activeTab === 'magistrado' ? (
                    <div className="search-section">
                            {/* Card de Confirmação - Dados do TJSP */}
                            {magistradoSelecionadoTJSP && (
                                <div className="tjsp-confirmation-card">
                                    <div className="tjsp-card-header">
                                        <h3>Dados encontrados no TJSP</h3>
                                        <button 
                                            className="close-btn"
                                            onClick={() => setMagistradoSelecionadoTJSP(null)}
                                        >
                                            ×
                                        </button>
                                    </div>
                                    <div className="tjsp-card-body">
                                        <div className="tjsp-data-row">
                                            <strong>Nome:</strong>
                                            <span>{magistradoSelecionadoTJSP.nome}</span>
                                        </div>
                                        {magistradoSelecionadoTJSP.cargo && (
                                            <div className="tjsp-data-row">
                                                <strong>Cargo:</strong>
                                                <span>{magistradoSelecionadoTJSP.cargo}</span>
                                            </div>
                                        )}
                                        {magistradoSelecionadoTJSP.setor && (
                                            <div className="tjsp-data-row">
                                                <strong>Setor:</strong>
                                                <span>{magistradoSelecionadoTJSP.setor}</span>
                                            </div>
                                        )}
                                        {magistradoSelecionadoTJSP.lotacao && (
                                            <div className="tjsp-data-row">
                                                <strong>Lotação:</strong>
                                                <span>{magistradoSelecionadoTJSP.lotacao}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="tjsp-card-footer">
                                        <p className="tjsp-info-text">
                                            Estes dados serão automaticamente preenchidos ao avaliar este magistrado.
                                        </p>
                                        <button 
                                            className="confirm-tjsp-btn"
                                            onClick={() => {
                                                handleSelectMagistrado({
                                                    nome: magistradoSelecionadoTJSP.nome,
                                                    cargo: magistradoSelecionadoTJSP.cargo,
                                                    setor: magistradoSelecionadoTJSP.setor,
                                                    lotacao: magistradoSelecionadoTJSP.lotacao,
                                                    tribunal: 'TJSP',
                                                    codigoTJSP: magistradoSelecionadoTJSP.codigoTJSP
                                                });
                                                setActiveSection('avaliar-magistrado');
                                                setMagistradoSelecionadoTJSP(null);
                                            }}
                                        >
                                            Confirmar e Avaliar
                                        </button>
                                    </div>
                                </div>
                            )}
                            
                            {magistrados.length > 0 && (
                                <div className="resultados-lista">
                                    <h3>Resultados ({magistrados.length})</h3>
                                    {magistrados.map((mag, index) => (
                                        <div key={index} className="resultado-item" onClick={() => handleAbrirPerfil('magistrado', mag)}>
                                            <div className="resultado-content">
                                                <div className="resultado-name">
                                                    {mag.Descricao || mag.nome}
                                                    {mag.origem === 'tjsp' && (
                                                        <span className="badge-tjsp-small">✓ TJSP</span>
                                                    )}
                                                </div>
                                                {(mag.Descricao2 || mag.cargo || mag.lotacao) && (
                                                    <div className="resultado-info">
                                                        {mag.Descricao2 || `${mag.cargo || ''}${mag.cargo && mag.lotacao ? ' • ' : ''}${mag.lotacao || ''}`}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="search-section">
                            {advogados.length > 0 && (
                                <div className="resultados-lista">
                                    <h3>Resultados ({advogados.length})</h3>
                                    {advogados.map((adv, index) => (
                                        <div key={index} className="resultado-item" onClick={() => handleAbrirPerfil('advogado', adv)}>
                                            <div className="resultado-content">
                                                <div className="resultado-name">
                                                    {adv.nome}
                                                    {adv.origem === 'oab' && (
                                                        <span className="badge-oab-small">✓ OAB</span>
                                                    )}
                                                </div>
                                                <div className="resultado-info">
                                                    OAB: {adv.oab || 'Não informado'}{adv.uf ? `/${adv.uf}` : ''}
                                                    {adv.tipoInscricao && ` • ${adv.tipoInscricao}`}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </>
        );
    };

    const renderAvaliarMagistrado = () => (
        <div className="avaliar-content">
            {!selectedMagistrado ? (
                <>
                    <h2>Buscar Magistrado</h2>
                    <p className="section-description">
                        Busque por juízes, desembargadores e ministros do STJ/STF
                    </p>
                    <form onSubmit={handleBuscar} className="search-form">
                        <div className="search-input-group">
                            <input
                                type="text"
                                value={busca}
                                onChange={(e) => setBusca(e.target.value)}
                                placeholder="Digite o nome do magistrado..."
                                className="search-input"
                            />
                            <button type="submit" disabled={buscando} className="search-button">
                                {buscando ? "Buscando..." : "Buscar"}
                            </button>
                        </div>
                    </form>

                    {magistrados.length > 0 && (
                        <div className="resultados-lista">
                            <h3>Resultados ({magistrados.length})</h3>
                            {magistrados.map((mag, index) => (
                                <div key={index} className="resultado-item" onClick={() => handleSelectMagistrado(mag)}>
                                    <div className="resultado-content">
                                        <div className="resultado-name">
                                            {mag.Descricao || mag.nome}
                                            {mag.origem === 'tjsp' && (
                                                <span className="badge-tjsp-small">✓ TJSP</span>
                                            )}
                                        </div>
                                        {(mag.Descricao2 || mag.cargo || mag.lotacao) && (
                                            <div className="resultado-info">
                                                {mag.Descricao2 || `${mag.cargo || ''}${mag.cargo && mag.lotacao ? ' • ' : ''}${mag.lotacao || ''}`}
                                            </div>
                                        )}
                                    </div>
                                    <button className="select-btn">Selecionar</button>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            ) : (
                <div className="avaliacao-form-container">
                    <button onClick={() => setSelectedMagistrado(null)} className="back-btn">← Voltar</button>
                    
                    <h2>Avaliar: {selectedMagistrado.Descricao || selectedMagistrado.nome}</h2>
                    
                    <form onSubmit={handleSubmitAvaliacao} className="avaliacao-form">
                        <div className="form-group">
                            <label>Nota (1-5 estrelas)</label>
                            <div className="rating-input">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        className={`star-btn ${avaliacaoForm.nota >= star ? 'active' : ''}`}
                                        onClick={() => setAvaliacaoForm({ ...avaliacaoForm, nota: star })}
                                    >
                                        ⭐
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Comentário (opcional)</label>
                            <textarea
                                value={avaliacaoForm.comentario}
                                onChange={(e) => setAvaliacaoForm({ ...avaliacaoForm, comentario: e.target.value })}
                                placeholder="Conte sua experiência..."
                                rows="4"
                            />
                        </div>

                        {user?.tipo === 'comum' && (
                            <div className="form-group checkbox-group">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={avaliacaoForm.anonima}
                                        onChange={(e) => setAvaliacaoForm({ ...avaliacaoForm, anonima: e.target.checked })}
                                    />
                                    <span>Avaliar anonimamente</span>
                                </label>
                            </div>
                        )}

                        <button type="submit" className="submit-btn">Enviar Avaliação</button>
                    </form>
                </div>
            )}
        </div>
    );

    const renderAvaliarAdvogado = () => (
        <div className="avaliar-content">
            {!selectedAdvogado ? (
                <>
                    <h2>Buscar Advogado</h2>
                    <p className="section-description">
                        Busque advogados por nome ou número da OAB
                    </p>
                    <form onSubmit={handleBuscarAdvogado} className="search-form">
                        <div className="search-input-group">
                            <input
                                type="text"
                                value={busca}
                                onChange={(e) => setBusca(e.target.value)}
                                placeholder="Digite o nome ou OAB do advogado..."
                                className="search-input"
                            />
                            <button type="submit" disabled={buscando} className="search-button">
                                {buscando ? "Buscando..." : "Buscar"}
                            </button>
                        </div>
                    </form>

                    {advogados.length > 0 && (
                        <div className="resultados-lista">
                            <h3>Resultados ({advogados.length})</h3>
                            {advogados.map((adv, index) => (
                                <div key={index} className="resultado-item" onClick={() => handleSelectAdvogado(adv)}>
                                    <div className="resultado-info">
                                        <h4>{adv.nome}</h4>
                                        <p>OAB: {adv.oab}{adv.uf ? `/${adv.uf}` : ''}</p>
                                        {adv.tipoInscricao && <p className="tipo-inscricao">📋 {adv.tipoInscricao}</p>}
                                        {adv.nomeSocial && <p className="nome-social">👤 Nome Social: {adv.nomeSocial}</p>}
                                        {adv.escritorio && <p className="escritorio-info">📍 {adv.escritorio}</p>}
                                        {adv.origem === 'oab' && <span className="badge-oab">✓ Validado pela OAB</span>}
                                    </div>
                                    <button className="select-btn">Avaliar</button>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            ) : (
                <div className="avaliacao-form-container">
                    <button onClick={() => setSelectedAdvogado(null)} className="back-btn">← Voltar</button>
                    
                    <h2>Avaliar: {selectedAdvogado.nome}</h2>
                    <p className="oab-info">OAB: {selectedAdvogado.oab}{selectedAdvogado.uf ? `/${selectedAdvogado.uf}` : ''}</p>
                    {selectedAdvogado.tipoInscricao && <p className="tipo-inscricao-info">Tipo: {selectedAdvogado.tipoInscricao}</p>}
                    {selectedAdvogado.nomeSocial && <p className="nome-social-info">Nome Social: {selectedAdvogado.nomeSocial}</p>}
                    {selectedAdvogado.origem === 'oab' && <p className="validacao-oab">✓ Advogado validado pela OAB Nacional</p>}
                    
                    <form onSubmit={handleSubmitAvaliacao} className="avaliacao-form">
                        <div className="form-group">
                            <label>Nota (1-5 estrelas)</label>
                            <div className="rating-input">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        className={`star-btn ${avaliacaoForm.nota >= star ? 'active' : ''}`}
                                        onClick={() => setAvaliacaoForm({ ...avaliacaoForm, nota: star })}
                                    >
                                        ⭐
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Comentário (opcional)</label>
                            <textarea
                                value={avaliacaoForm.comentario}
                                onChange={(e) => setAvaliacaoForm({ ...avaliacaoForm, comentario: e.target.value })}
                                placeholder="Conte sua experiência..."
                                rows="4"
                            />
                        </div>

                        {user?.tipo === 'comum' && (
                            <div className="form-group checkbox-group">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={avaliacaoForm.anonima}
                                        onChange={(e) => setAvaliacaoForm({ ...avaliacaoForm, anonima: e.target.checked })}
                                    />
                                    <span>Avaliar anonimamente</span>
                                </label>
                            </div>
                        )}

                        <button type="submit" className="submit-btn">Enviar Avaliação</button>
                    </form>
                </div>
            )}
        </div>
    );

    const renderMinhasAvaliacoes = () => (
        <div className="avaliacoes-content">
            <h2>Minhas Avaliações</h2>
            {loadingAvaliacoes ? (
                <p>Carregando...</p>
            ) : minhasAvaliacoes.length === 0 ? (
                <div className="empty-state">
                    <p>Você ainda não fez nenhuma avaliação</p>
                    <button onClick={() => setActiveSection('avaliar')} className="cta-btn">
                        Fazer primeira avaliação
                    </button>
                </div>
            ) : (
                <div className="avaliacoes-twitter-list">
                    {minhasAvaliacoes.map((item, index) => (
                        <div key={index} className="avaliacao-twitter-item">
                            <div className="avaliacao-avatar">
                                {user?.nome?.charAt(0) || 'U'}
                            </div>
                            <div className="avaliacao-content">
                                <div className="avaliacao-header">
                                    <span className={`avaliacao-author ${item.avaliacao?.anonima ? 'anonimo' : ''}`}>
                                        {item.avaliacao?.anonima ? 'Anônimo' : user?.nome}
                                    </span>
                                    <span className="avaliacao-date">
                                        {new Date(item.avaliacao?.criadoEm).toLocaleDateString('pt-BR')}
                                    </span>
                                </div>
                                
                                <div className="avaliacao-target">
                                    Avaliou: <strong>{item.perfilNome}</strong> ({item.tipo})
                                </div>
                                
                                <div className="avaliacao-rating">
                                    <div className="rating-slider-inline">
                                        <div 
                                            className="slider-fill" 
                                            style={{ width: `${(item.avaliacao?.nota || 0) * 20}%` }}
                                        />
                                    </div>
                                    <span className="rating-text">
                                        {(item.avaliacao?.nota || 0).toFixed(1)} {getRatingLabel(item.avaliacao?.nota || 0)}
                                    </span>
                                </div>
                                
                                {item.avaliacao?.criterios && (
                                    <div className="avaliacao-criterios">
                                        {item.avaliacao.criterios.imparcialidade && (
                                            <div className="criterio-tag">
                                                Imparcialidade: <span>{item.avaliacao.criterios.imparcialidade}/5</span>
                                            </div>
                                        )}
                                        {item.avaliacao.criterios.consideracao && (
                                            <div className="criterio-tag">
                                                Consideração: <span>{item.avaliacao.criterios.consideracao}/5</span>
                                            </div>
                                        )}
                                        {item.avaliacao.criterios.fundamentacao && (
                                            <div className="criterio-tag">
                                                Fundamentação: <span>{item.avaliacao.criterios.fundamentacao}/5</span>
                                            </div>
                                        )}
                                        {item.avaliacao.criterios.dominioPortugues && (
                                            <div className="criterio-tag">
                                                Português: <span>{item.avaliacao.criterios.dominioPortugues}/5</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                                
                                {item.avaliacao?.comentario && (
                                    <p className="avaliacao-text">{item.avaliacao.comentario}</p>
                                )}
                                
                                <div className="avaliacao-actions">
                                    <button 
                                        className={`action-button ${
                                            item.avaliacao?.curtidas?.some(c => c.usuario === user?.id) ? 'liked' : ''
                                        }`}
                                        onClick={() => handleCurtirAvaliacao(item.tipo, item.perfilId, item.avaliacao?._id)}
                                    >
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                                        </svg>
                                        {item.avaliacao?.curtidas?.length || 0}
                                    </button>
                                    <button 
                                        className="action-button"
                                        onClick={() => setRespondendoAvaliacao(respondendoAvaliacao === item.avaliacao?._id ? null : item.avaliacao?._id)}
                                    >
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                                        </svg>
                                        {item.avaliacao?.respostas?.length || 0}
                                    </button>
                                </div>
                                
                                {/* Respostas */}
                                {item.avaliacao?.respostas && item.avaliacao.respostas.length > 0 && (
                                    <div className="avaliacao-respostas">
                                        {item.avaliacao.respostas.map((resp, idx) => (
                                            <div key={idx} className="resposta-item">
                                                <div className="resposta-avatar">
                                                    {resp.autor?.charAt(0) || 'P'}
                                                </div>
                                                <div className="resposta-content">
                                                    <div className="resposta-header">
                                                        <span className="resposta-author">{resp.autor}</span>
                                                        <span className="resposta-date">
                                                            {new Date(resp.criadoEm).toLocaleDateString('pt-BR')}
                                                        </span>
                                                    </div>
                                                    <p className="resposta-text">{resp.texto}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                
                                {/* Formulário de resposta */}
                                {respondendoAvaliacao === item.avaliacao?._id && (
                                    <div className="responder-form">
                                        <input 
                                            type="text"
                                            placeholder="Escreva uma resposta..."
                                            value={textoResposta}
                                            onChange={(e) => setTextoResposta(e.target.value)}
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') {
                                                    handleResponderAvaliacao(item.tipo, item.perfilId, item.avaliacao?._id);
                                                }
                                            }}
                                        />
                                        <button onClick={() => handleResponderAvaliacao(item.tipo, item.perfilId, item.avaliacao?._id)}>
                                            Responder
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    const renderRanking = () => (
        <div className="ranking-content">
            {loadingAvaliacoes ? (
                <p>Carregando...</p>
            ) : (
                <div className="ranking-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Posição</th>
                                <th>Nome</th>
                                <th>Média</th>
                                <th>Avaliações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ranking.map((mag, index) => (
                                <tr key={mag.id}>
                                    <td className="ranking-position">{index + 1}º</td>
                                    <td>{mag.nome}</td>
                                    <td>{renderStars(Math.round(mag.media))} ({mag.media})</td>
                                    <td>{mag.quantidade}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );

    const renderRankingAdvogados = () => (
        <div className="ranking-content">
            {loadingAvaliacoes ? (
                <p>Carregando...</p>
            ) : (
                <div className="ranking-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Posição</th>
                                <th>Nome</th>
                                <th>OAB</th>
                                <th>Média</th>
                                <th>Avaliações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rankingAdvogados.map((adv, index) => (
                                <tr key={adv.id}>
                                    <td className="ranking-position">{index + 1}º</td>
                                    <td>{adv.nome}</td>
                                    <td>{adv.oab}</td>
                                    <td>{renderStars(Math.round(adv.media))} ({adv.media})</td>
                                    <td>{adv.quantidade}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );

    const renderPerfil = () => {
        if (loadingPerfil) return <p>Carregando perfil...</p>;

        if (user?.tipo === 'magistrado') {
            return (
                <div className="perfil-content">
                    {/* Dados do TJSP - Somente Leitura */}
                    {(() => {
                        console.log('🎨 Renderizando perfil. user.perfilMagistrado:', user?.perfilMagistrado);
                        return null;
                    })()}
                    {user?.perfilMagistrado && (
                        <div className="perfil-tjsp-section">
                            <h3>Dados do TJSP</h3>
                            <div className="perfil-dados-grid">
                                {user.perfilMagistrado.cargo && (
                                    <div className="perfil-dado-item">
                                        <label>Cargo</label>
                                        <div className="perfil-dado-value">{user.perfilMagistrado.cargo}</div>
                                    </div>
                                )}
                                {user.perfilMagistrado.setor && (
                                    <div className="perfil-dado-item">
                                        <label>Setor</label>
                                        <div className="perfil-dado-value">{user.perfilMagistrado.setor}</div>
                                    </div>
                                )}
                                {user.perfilMagistrado.lotacao && (
                                    <div className="perfil-dado-item">
                                        <label>Lotação</label>
                                        <div className="perfil-dado-value">{user.perfilMagistrado.lotacao}</div>
                                    </div>
                                )}
                                {user.perfilMagistrado.tribunal && (
                                    <div className="perfil-dado-item">
                                        <label>Tribunal</label>
                                        <div className="perfil-dado-value">{user.perfilMagistrado.tribunal}</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    
                    <div className="perfil-form">
                        <h3>Dados Pessoais</h3>
                        <div className="form-group">
                            <label>Nome</label>
                            <input type="text" value={perfilData?.nome || user?.nome} readOnly />
                        </div>
                        <div className="form-group">
                            <label>CNJ</label>
                            <input type="text" value={perfilData?.cnj || user?.cnj} readOnly />
                        </div>
                        <div className="form-group">
                            <label>Instância</label>
                            <select 
                                value={perfilData?.instancia || ''} 
                                onChange={(e) => setPerfilData({...perfilData, instancia: e.target.value})}
                            >
                                <option value="">Selecione...</option>
                                <option value="primeira">Primeira Instância</option>
                                <option value="segunda">Segunda Instância</option>
                                <option value="stj">STJ</option>
                                <option value="stf">STF</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Vara/Câmara de Atuação</label>
                            <input 
                                type="text" 
                                value={perfilData?.varaOuCamara || ''} 
                                onChange={(e) => setPerfilData({...perfilData, varaOuCamara: e.target.value})}
                                placeholder="Ex: 1ª Vara Cível"
                            />
                        </div>
                        <div className="form-group">
                            <label>Currículo</label>
                            <textarea 
                                value={perfilData?.curriculo || ''} 
                                onChange={(e) => setPerfilData({...perfilData, curriculo: e.target.value})}
                                rows="5"
                                placeholder="Descreva sua formação e experiência..."
                            />
                        </div>
                        <h3>Informações de Contato</h3>
                        <div className="form-group">
                            <label>Email</label>
                            <input 
                                type="email" 
                                value={perfilData?.contato?.email || ''} 
                                onChange={(e) => setPerfilData({
                                    ...perfilData, 
                                    contato: {...perfilData?.contato, email: e.target.value}
                                })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Telefone</label>
                            <input 
                                type="text" 
                                value={perfilData?.contato?.telefone || ''} 
                                onChange={(e) => setPerfilData({
                                    ...perfilData, 
                                    contato: {...perfilData?.contato, telefone: e.target.value}
                                })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Endereço</label>
                            <input 
                                type="text" 
                                value={perfilData?.contato?.endereco || ''} 
                                onChange={(e) => setPerfilData({
                                    ...perfilData, 
                                    contato: {...perfilData?.contato, endereco: e.target.value}
                                })}
                            />
                        </div>
                        <h3>Informações de Despacho</h3>
                        <div className="form-group">
                            <label>Local do Despacho</label>
                            <input 
                                type="text" 
                                value={perfilData?.despacho?.local || ''} 
                                onChange={(e) => setPerfilData({
                                    ...perfilData, 
                                    despacho: {...perfilData?.despacho, local: e.target.value}
                                })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Horário de Despacho</label>
                            <input 
                                type="text" 
                                value={perfilData?.despacho?.horario || ''} 
                                onChange={(e) => setPerfilData({
                                    ...perfilData, 
                                    despacho: {...perfilData?.despacho, horario: e.target.value}
                                })}
                                placeholder="Ex: Segunda a Sexta, 9h às 12h"
                            />
                        </div>
                        
                        <div className="trocar-tipo-section">
                            <h3>Configurações da Conta</h3>
                            <p className="info-text">Altere o tipo da sua conta se necessário</p>
                            {!showTrocarTipo ? (
                                <button 
                                    className="trocar-tipo-btn"
                                    onClick={() => setShowTrocarTipo(true)}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
                                        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                                    </svg>
                                    Trocar Tipo de Conta
                                </button>
                            ) : (
                                <div className="trocar-tipo-form">
                                    <div className="form-group">
                                        <label>Novo Tipo de Conta</label>
                                        <select 
                                            value={novoTipo} 
                                            onChange={(e) => {
                                                setNovoTipo(e.target.value);
                                                setDadosValidacao({ oab: '', cnj: '' });
                                            }}
                                        >
                                            <option value="">Selecione...</option>
                                            <option value="comum">Usuário Comum</option>
                                            <option value="advogado">Advogado</option>
                                            <option value="magistrado">Magistrado</option>
                                            <option value="assistente">Assistente</option>
                                        </select>
                                    </div>
                                    
                                    {novoTipo === 'advogado' && (
                                        <div className="form-group">
                                            <label>Número da OAB</label>
                                            <input 
                                                type="text" 
                                                value={dadosValidacao.oab}
                                                onChange={(e) => setDadosValidacao({...dadosValidacao, oab: e.target.value})}
                                                placeholder="Ex: 123456"
                                            />
                                        </div>
                                    )}
                                    
                                    {novoTipo === 'magistrado' && (
                                        <div className="form-group">
                                            <label>Número do CNJ</label>
                                            <input 
                                                type="text" 
                                                value={dadosValidacao.cnj}
                                                onChange={(e) => setDadosValidacao({...dadosValidacao, cnj: e.target.value})}
                                                placeholder="Ex: 1234567"
                                            />
                                        </div>
                                    )}
                                    
                                    <div className="form-actions">
                                        <button 
                                            className="cancel-btn"
                                            onClick={() => {
                                                setShowTrocarTipo(false);
                                                setNovoTipo('');
                                                setDadosValidacao({ oab: '', cnj: '' });
                                            }}
                                        >
                                            Cancelar
                                        </button>
                                        <button 
                                            className="confirm-btn"
                                            onClick={handleTrocarTipo}
                                        >
                                            Confirmar Mudança
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <button 
                            className="submit-btn" 
                            onClick={async () => {
                                try {
                                    await api.put('/magistrado/perfil', perfilData);
                                    alert('Perfil atualizado com sucesso!');
                                } catch (error) {
                                    console.error('Erro ao atualizar:', error);
                                    alert('Erro ao atualizar perfil');
                                }
                            }}
                        >
                            Salvar Alterações
                        </button>
                    </div>
                </div>
            );
        }

        if (user?.tipo === 'advogado') {
            return (
                <div className="perfil-content">
                    <div className="perfil-form">
                        <div className="form-group">
                            <label>Nome</label>
                            <input type="text" value={perfilData?.nome || user?.nome} readOnly />
                        </div>
                        <div className="form-group">
                            <label>OAB</label>
                            <input type="text" value={perfilData?.oab || user?.oab} readOnly />
                        </div>
                        <div className="form-group">
                            <label>Escritório</label>
                            <input 
                                type="text" 
                                value={perfilData?.escritorio || ''} 
                                onChange={(e) => setPerfilData({...perfilData, escritorio: e.target.value})}
                                placeholder="Nome do escritório (se houver)"
                            />
                        </div>
                        <div className="form-group">
                            <label>Áreas de Atuação</label>
                            <input 
                                type="text" 
                                value={perfilData?.areasAtuacao?.join(', ') || ''} 
                                onChange={(e) => setPerfilData({
                                    ...perfilData, 
                                    areasAtuacao: e.target.value.split(',').map(a => a.trim())
                                })}
                                placeholder="Ex: Direito Civil, Direito Penal"
                            />
                            <small>Separe as áreas por vírgula</small>
                        </div>
                        <div className="form-group">
                            <label>Currículo</label>
                            <textarea 
                                value={perfilData?.curriculo || ''} 
                                onChange={(e) => setPerfilData({...perfilData, curriculo: e.target.value})}
                                rows="5"
                                placeholder="Descreva sua formação e experiência..."
                            />
                        </div>
                        <h3>Informações de Contato</h3>
                        <div className="form-group">
                            <label>Email</label>
                            <input 
                                type="email" 
                                value={perfilData?.contato?.email || ''} 
                                onChange={(e) => setPerfilData({
                                    ...perfilData, 
                                    contato: {...perfilData?.contato, email: e.target.value}
                                })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Telefone</label>
                            <input 
                                type="text" 
                                value={perfilData?.contato?.telefone || ''} 
                                onChange={(e) => setPerfilData({
                                    ...perfilData, 
                                    contato: {...perfilData?.contato, telefone: e.target.value}
                                })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Endereço</label>
                            <input 
                                type="text" 
                                value={perfilData?.contato?.endereco || ''} 
                                onChange={(e) => setPerfilData({
                                    ...perfilData, 
                                    contato: {...perfilData?.contato, endereco: e.target.value}
                                })}
                            />
                        </div>
                        
                        <div className="trocar-tipo-section">
                            <h3>Configurações da Conta</h3>
                            <p className="info-text">Altere o tipo da sua conta se necessário</p>
                            {!showTrocarTipo ? (
                                <button 
                                    className="trocar-tipo-btn"
                                    onClick={() => setShowTrocarTipo(true)}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
                                        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                                    </svg>
                                    Trocar Tipo de Conta
                                </button>
                            ) : (
                                <div className="trocar-tipo-form">
                                    <div className="form-group">
                                        <label>Novo Tipo de Conta</label>
                                        <select 
                                            value={novoTipo} 
                                            onChange={(e) => {
                                                setNovoTipo(e.target.value);
                                                setDadosValidacao({ oab: '', cnj: '' });
                                            }}
                                        >
                                            <option value="">Selecione...</option>
                                            <option value="comum">Usuário Comum</option>
                                            <option value="advogado">Advogado</option>
                                            <option value="magistrado">Magistrado</option>
                                            <option value="assistente">Assistente</option>
                                        </select>
                                    </div>
                                    
                                    {novoTipo === 'advogado' && (
                                        <div className="form-group">
                                            <label>Número da OAB</label>
                                            <input 
                                                type="text" 
                                                value={dadosValidacao.oab}
                                                onChange={(e) => setDadosValidacao({...dadosValidacao, oab: e.target.value})}
                                                placeholder="Ex: 123456"
                                            />
                                        </div>
                                    )}
                                    
                                    {novoTipo === 'magistrado' && (
                                        <div className="form-group">
                                            <label>Número do CNJ</label>
                                            <input 
                                                type="text" 
                                                value={dadosValidacao.cnj}
                                                onChange={(e) => setDadosValidacao({...dadosValidacao, cnj: e.target.value})}
                                                placeholder="Ex: 1234567"
                                            />
                                        </div>
                                    )}
                                    
                                    <div className="form-actions">
                                        <button 
                                            className="cancel-btn"
                                            onClick={() => {
                                                setShowTrocarTipo(false);
                                                setNovoTipo('');
                                                setDadosValidacao({ oab: '', cnj: '' });
                                            }}
                                        >
                                            Cancelar
                                        </button>
                                        <button 
                                            className="confirm-btn"
                                            onClick={handleTrocarTipo}
                                        >
                                            Confirmar Mudança
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <button 
                            className="submit-btn" 
                            onClick={async () => {
                                try {
                                    await api.put('/advogado/perfil', perfilData);
                                    alert('Perfil atualizado com sucesso!');
                                } catch (error) {
                                    console.error('Erro ao atualizar:', error);
                                    alert('Erro ao atualizar perfil');
                                }
                            }}
                        >
                            Salvar Alterações
                        </button>
                    </div>
                </div>
            );
        }

        // Perfil para usuário comum e assistente
        return (
            <div className="perfil-content">
                <div className="perfil-form">
                    <div className="form-group">
                        <label>Nome</label>
                        <input type="text" value={user?.nome || ''} readOnly />
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input type="email" value={user?.email || ''} readOnly />
                    </div>
                    <div className="form-group">
                        <label>Tipo de Conta</label>
                        <input type="text" value={user?.tipo || ''} readOnly style={{textTransform: 'capitalize'}} />
                    </div>
                    
                    <div className="trocar-tipo-section">
                        <h3>Configurações da Conta</h3>
                        <p className="info-text">Altere o tipo da sua conta se necessário</p>
                        {!showTrocarTipo ? (
                            <button 
                                className="trocar-tipo-btn"
                                onClick={() => setShowTrocarTipo(true)}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
                                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                                </svg>
                                Trocar Tipo de Conta
                            </button>
                        ) : (
                            <div className="trocar-tipo-form">
                                <div className="form-group">
                                    <label>Novo Tipo de Conta</label>
                                    <select 
                                        value={novoTipo} 
                                        onChange={(e) => {
                                            setNovoTipo(e.target.value);
                                            setDadosValidacao({ oab: '', cnj: '' });
                                        }}
                                    >
                                        <option value="">Selecione...</option>
                                        <option value="comum">Usuário Comum</option>
                                        <option value="advogado">Advogado</option>
                                        <option value="magistrado">Magistrado</option>
                                        <option value="assistente">Assistente</option>
                                    </select>
                                </div>
                                
                                {novoTipo === 'advogado' && (
                                    <div className="form-group">
                                        <label>Número da OAB</label>
                                        <input 
                                            type="text" 
                                            value={dadosValidacao.oab}
                                            onChange={(e) => setDadosValidacao({...dadosValidacao, oab: e.target.value})}
                                            placeholder="Ex: 123456"
                                        />
                                    </div>
                                )}
                                
                                {novoTipo === 'magistrado' && (
                                    <div className="form-group">
                                        <label>Número do CNJ</label>
                                        <input 
                                            type="text" 
                                            value={dadosValidacao.cnj}
                                            onChange={(e) => setDadosValidacao({...dadosValidacao, cnj: e.target.value})}
                                            placeholder="Ex: 1234567"
                                        />
                                    </div>
                                )}
                                
                                <div className="form-actions">
                                    <button 
                                        className="cancel-btn"
                                        onClick={() => {
                                            setShowTrocarTipo(false);
                                            setNovoTipo('');
                                            setDadosValidacao({ oab: '', cnj: '' });
                                        }}
                                    >
                                        Cancelar
                                    </button>
                                    <button 
                                        className="confirm-btn"
                                        onClick={handleTrocarTipo}
                                    >
                                        Confirmar Mudança
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const renderAvaliacoesRecebidas = () => {
        if (loadingAvaliacoes) return <p>Carregando...</p>;
        
        const avaliacoes = perfilData?.avaliacoes || [];

        const handleResponder = async (avaliacaoId, resposta) => {
            if (!resposta.trim()) {
                alert('Digite uma resposta');
                return;
            }

            try {
                const endpoint = user?.tipo === 'magistrado' 
                    ? `/magistrado/responder_comentario/${avaliacaoId}`
                    : `/advogado/responder_comentario/${avaliacaoId}`;
                
                await api.put(endpoint, { resposta });
                alert('Resposta enviada com sucesso!');
                carregarAvaliacoesRecebidas();
            } catch (error) {
                console.error('Erro ao responder:', error);
                alert('Erro ao enviar resposta');
            }
        };

        return (
            <div className="avaliacoes-recebidas-content">
                <h2>Avaliações Recebidas</h2>
                {avaliacoes.length === 0 ? (
                    <div className="empty-state">
                        <p>Você ainda não recebeu avaliações</p>
                    </div>
                ) : (
                    <div className="avaliacoes-lista">
                        {avaliacoes.map((avaliacao, index) => (
                            <div key={index} className="avaliacao-card-detail">
                                <div className="avaliacao-header">
                                    <div className="avaliacao-user">
                                        {avaliacao.anonima ? (
                                            <span className="anonimo-badge">👤 Anônimo</span>
                                        ) : (
                                            <span>{avaliacao.usuario?.nome || 'Usuário'}</span>
                                        )}
                                    </div>
                                    <div className="avaliacao-nota">{renderStars(avaliacao.nota)}</div>
                                </div>
                                {avaliacao.comentario && (
                                    <p className="avaliacao-comentario">{avaliacao.comentario}</p>
                                )}
                                <p className="avaliacao-data">
                                    {new Date(avaliacao.criadoEm).toLocaleDateString()}
                                </p>
                                
                                {avaliacao.resposta ? (
                                    <div className="resposta-box">
                                        <strong>Sua resposta:</strong>
                                        <p>{avaliacao.resposta.texto}</p>
                                        <small>
                                            Respondido em {new Date(avaliacao.resposta.respondidoEm).toLocaleDateString()}
                                        </small>
                                    </div>
                                ) : (
                                    <div className="responder-box">
                                        <textarea
                                            id={`resposta-${index}`}
                                            placeholder="Digite sua resposta..."
                                            rows="3"
                                        />
                                        <button
                                            className="btn-responder"
                                            onClick={() => {
                                                const textarea = document.getElementById(`resposta-${index}`);
                                                handleResponder(avaliacao._id, textarea.value);
                                            }}
                                        >
                                            Responder
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    const renderClientes = () => (
        <div className="clientes-content">
            <h2>Meus Clientes</h2>
            <p className="feature-coming-soon">Funcionalidade em desenvolvimento para advogados</p>
        </div>
    );

    const renderEstatisticas = () => (
        <div className="estatisticas-content">
            <h2>Estatísticas</h2>
            <p className="feature-coming-soon">Funcionalidade em desenvolvimento para magistrados</p>
        </div>
    );

    const renderGabinete = () => {
        if (loadingGabinete) {
            return (
                <div className="gabinete-content">
                    <h2>Meu Gabinete - Sistema ADAM</h2>
                    <div className="empty-state">
                        <p>Carregando...</p>
                    </div>
                </div>
            );
        }

        if (!gabineteData) {
            return (
                <div className="gabinete-content">
                    <h2>Meu Gabinete - Sistema ADAM</h2>
                    <div className="adam-info-box">
                        <p>🏢 Gerencie seu gabinete, equipe, tarefas e documentos em um só lugar</p>
                    </div>
                    <div className="empty-state">
                        <p>Você ainda não possui um gabinete. Ele será criado automaticamente quando você receber seu primeiro assistente.</p>
                    </div>
                </div>
            );
        }

        return (
            <div className="gabinete-content">
                <h2>Meu Gabinete - {gabineteData.nome || 'Sistema ADAM'}</h2>
                <div className="adam-info-box">
                    <p>🏢 Gerencie seu gabinete, equipe, tarefas e documentos em um só lugar</p>
                </div>

                <div className="convite-section">
                    <h3>Membros do Gabinete</h3>
                    <div className="gabinete-info">
                        <p><strong>Magistrado:</strong> {gabineteData.magistrado?.nome}</p>
                        <p><strong>Tipo:</strong> {gabineteData.tipo === 'juiz' ? 'Juiz' : 'Desembargador'}</p>
                        <p><strong>Assistentes:</strong> {gabineteData.assistentes?.length || 0} / {gabineteData.configuracoes?.limiteMembros || 5}</p>
                    </div>

                    {gabineteData.assistentes && gabineteData.assistentes.length > 0 ? (
                        <div className="membros-lista">
                            {gabineteData.assistentes.map((assistente) => (
                                <div key={assistente._id} className="membro-card">
                                    <div className="membro-header">
                                        <img 
                                            src={assistente.foto || '/default-avatar.png'} 
                                            alt={assistente.nome || 'Assistente'}
                                            className="membro-avatar"
                                            referrerPolicy="no-referrer"
                                        />
                                        <div>
                                            <strong>{assistente.nome}</strong>
                                            <span>{assistente.email}</span>
                                            <span className="cargo-badge">{assistente.cargoGabinete || 'Assessor'}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <p>Nenhum assistente no gabinete ainda</p>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderTarefas = () => {
        return (
            <div className="tarefas-content">
                <h2>Tarefas do Gabinete</h2>
                <div className="adam-info-box">
                    <p>✅ Atribua e acompanhe tarefas da sua equipe</p>
                </div>
                <div className="empty-state">
                    <p>Funcionalidade em desenvolvimento - Em breve você poderá gerenciar tarefas</p>
                </div>
            </div>
        );
    };

    const renderVotos = () => {
        return (
            <div className="votos-content">
                <h2>Banco de Votos</h2>
                <div className="adam-info-box">
                    <p>📁 Armazene e organize seus votos e decisões com busca inteligente por IA</p>
                </div>
                <div className="empty-state">
                    <p>Funcionalidade em desenvolvimento - Em breve você poderá gerenciar seu banco de votos</p>
                </div>
            </div>
        );
    };

    const renderMensagensADAM = () => {
        return (
            <div className="mensagens-adam-content">
                <h2>Mensagens do Gabinete</h2>
                <div className="adam-info-box">
                    <p>✉️ Comunique-se com sua equipe de forma organizada</p>
                </div>
                <div className="empty-state">
                    <p>Funcionalidade em desenvolvimento - Em breve você poderá enviar mensagens para sua equipe</p>
                </div>
            </div>
        );
    };

    const renderConvites = () => {
        if (user?.tipo === 'assistente') {
            return (
                <div className="convites-content">
                    <h2>Convites de Gabinete</h2>
                    <div className="adam-info-box">
                        <p>👥 Envie convites para magistrados para fazer parte de um gabinete</p>
                    </div>
                    
                    <div className="convite-section">
                        <h3>Enviar Convite</h3>
                        <div className="convite-form">
                            <div className="form-group">
                                <label>Buscar Magistrado</label>
                                <input 
                                    type="text" 
                                    placeholder="Digite o nome, email ou CNJ do magistrado..."
                                    className="form-control"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                {searchResults.length > 0 && (
                                    <div className="search-results">
                                        {searchResults.map((mag) => (
                                            <div 
                                                key={mag._id}
                                                className={`search-result-item ${selectedMagistrado?._id === mag._id ? 'selected' : ''}`}
                                                onClick={() => {
                                                    setSelectedMagistrado(mag);
                                                    setSearchTerm(mag.nome);
                                                    setSearchResults([]);
                                                }}
                                            >
                                                <img src={mag.foto || '/default-avatar.png'} alt={mag.nome} />
                                                <div className="result-info">
                                                    <strong>{mag.nome}</strong>
                                                    <span>{mag.email}</span>
                                                    {mag.cnj && <span className="cnj-badge">CNJ: {mag.cnj}</span>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="form-group">
                                <label>OU - Informar Email Diretamente</label>
                                <input 
                                    type="email" 
                                    placeholder="magistrado@email.com"
                                    className="form-control"
                                    value={conviteEmail}
                                    onChange={(e) => setConviteEmail(e.target.value)}
                                    disabled={!!selectedMagistrado}
                                />
                            </div>

                            <div className="form-group">
                                <label>Cargo Desejado</label>
                                <select 
                                    className="form-control"
                                    value={cargoDesejado}
                                    onChange={(e) => setCargoDesejado(e.target.value)}
                                >
                                    <option value="assessor">Assessor</option>
                                    <option value="estagiario">Estagiário</option>
                                    <option value="secretario">Secretário</option>
                                    <option value="assistente">Assistente</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Mensagem (opcional)</label>
                                <textarea 
                                    rows="3"
                                    placeholder="Gostaria de fazer parte do seu gabinete..."
                                    className="form-control"
                                    value={conviteMensagem}
                                    onChange={(e) => setConviteMensagem(e.target.value)}
                                />
                            </div>
                            <button className="submit-btn" onClick={enviarConvite}>
                                Enviar Convite
                            </button>
                        </div>
                    </div>

                    <div className="convites-lista">
                        <h3>Convites Enviados</h3>
                        {convitesEnviados.length === 0 ? (
                            <div className="empty-state">
                                <p>Você ainda não enviou nenhum convite</p>
                            </div>
                        ) : (
                            <div className="convites-grid">
                                {convitesEnviados.map((convite) => (
                                    <div key={convite._id} className="convite-card">
                                        <div className="convite-header">
                                            <img 
                                                src={convite.destinatario?.foto || '/default-avatar.png'} 
                                                alt={convite.destinatario?.nome}
                                                referrerPolicy="no-referrer"
                                            />
                                            <div>
                                                <strong>{convite.destinatario?.nome}</strong>
                                                <span>{convite.destinatario?.email}</span>
                                            </div>
                                        </div>
                                        <p className="convite-mensagem">{convite.mensagem}</p>
                                        <div className="convite-footer">
                                            <span className={`status-badge status-${convite.status}`}>
                                                {convite.status === 'pendente' ? '⏳ Pendente' :
                                                 convite.status === 'aceito' ? '✅ Aceito' : '❌ Recusado'}
                                            </span>
                                            <span className="convite-data">
                                                {new Date(convite.criadoEm).toLocaleDateString('pt-BR')}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            );
        } else if (user?.tipo === 'magistrado') {
            return (
                <div className="convites-content">
                    <h2>Convites Recebidos</h2>
                    <div className="adam-info-box">
                        <p>👥 Gerencie os convites de assistentes que desejam fazer parte do seu gabinete</p>
                    </div>
                    
                    {convitesPendentes.length === 0 ? (
                        <div className="empty-state">
                            <p>Você não possui convites pendentes no momento</p>
                        </div>
                    ) : (
                        <div className="convites-grid">
                            {convitesPendentes.map((convite) => (
                                <div key={convite._id} className="convite-card pendente">
                                    <div className="convite-header">
                                        <img 
                                            src={convite.remetente?.foto || '/default-avatar.png'} 
                                            alt={convite.remetente?.nome}
                                            referrerPolicy="no-referrer"
                                        />
                                        <div>
                                            <strong>{convite.remetente?.nome}</strong>
                                            <span>{convite.remetente?.email}</span>
                                            <span className="cargo-badge">
                                                {convite.remetente?.cargoGabinete || 'Assistente'}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="convite-mensagem">{convite.mensagem}</p>
                                    <div className="convite-acoes">
                                        <button 
                                            className="btn-aceitar"
                                            onClick={() => responderConvite(convite._id, 'aceitar')}
                                        >
                                            ✅ Aceitar
                                        </button>
                                        <button 
                                            className="btn-rejeitar"
                                            onClick={() => responderConvite(convite._id, 'rejeitar')}
                                        >
                                            ❌ Recusar
                                        </button>
                                    </div>
                                    <span className="convite-data">
                                        Enviado em {new Date(convite.criadoEm).toLocaleDateString('pt-BR')}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            );
        } else {
            return (
                <div className="convites-content">
                    <h2>Convites de Gabinete</h2>
                    <div className="empty-state">
                        <p>Esta funcionalidade está disponível apenas para assistentes e magistrados</p>
                    </div>
                </div>
            );
        }
    };

    // Seção de Avaliar Unificada (Magistrado + Advogado)
    const renderAvaliar = () => (
        <div className="avaliar-content">
            <div className="search-type-selector">
                <button 
                    className={`type-selector-btn ${avaliarTipo === 'magistrado' ? 'active' : ''}`}
                    onClick={() => setAvaliarTipo('magistrado')}
                >
                    Magistrado
                </button>
                <button 
                    className={`type-selector-btn ${avaliarTipo === 'advogado' ? 'active' : ''}`}
                    onClick={() => setAvaliarTipo('advogado')}
                >
                    Advogado
                </button>
            </div>
            
            {avaliarTipo === 'magistrado' ? renderAvaliarMagistrado() : renderAvaliarAdvogado()}
            
            {/* Minhas Avaliações Recentes */}
            <div className="minhas-avaliacoes-preview">
                <div className="section-header">
                    <h3>Minhas Avaliações Recentes</h3>
                    <button 
                        className="view-all-btn"
                        onClick={() => setActiveSection('minhas-avaliacoes')}
                    >
                        Ver todas
                    </button>
                </div>
                <div className="avaliacoes-preview-list">
                    {minhasAvaliacoes.slice(0, 3).map((av, index) => (
                        <div key={index} className="avaliacao-preview-item">
                            <div className="avaliacao-preview-info">
                                <h4>{av.perfilNome}</h4>
                                <span className="avaliacao-tipo-badge">{av.tipo}</span>
                            </div>
                            <div className="avaliacao-preview-nota">
                                {av.avaliacao?.nota?.toFixed(1) || '0.0'}
                            </div>
                        </div>
                    ))}
                    {minhasAvaliacoes.length === 0 && (
                        <p className="empty-message">Você ainda não fez nenhuma avaliação</p>
                    )}
                </div>
            </div>
        </div>
    );

    // Ranking Unificado (Magistrados + Advogados)
    const renderRankingUnificado = () => (
        <div className="ranking-content">
            <div className="ranking-header">
                <div className="search-type-selector">
                    <button 
                        className={`type-selector-btn ${rankingTipo === 'magistrado' ? 'active' : ''}`}
                        onClick={() => setRankingTipo('magistrado')}
                    >
                        Magistrados
                    </button>
                    <button 
                        className={`type-selector-btn ${rankingTipo === 'advogado' ? 'active' : ''}`}
                        onClick={() => setRankingTipo('advogado')}
                    >
                        Advogados
                    </button>
                </div>
            </div>

            {/* Filtros */}
            <div className="ranking-filtros">
                {rankingTipo === 'magistrado' ? (
                    <select 
                        value={rankingFiltro.tribunal}
                        onChange={(e) => setRankingFiltro({...rankingFiltro, tribunal: e.target.value})}
                    >
                        <option value="">Todos os Tribunais</option>
                        <option value="TJSP">TJSP</option>
                        <option value="TJRJ">TJRJ</option>
                        <option value="TJMG">TJMG</option>
                    </select>
                ) : (
                    <select 
                        value={rankingFiltro.uf}
                        onChange={(e) => setRankingFiltro({...rankingFiltro, uf: e.target.value})}
                    >
                        <option value="">Todos os Estados</option>
                        <option value="SP">São Paulo</option>
                        <option value="RJ">Rio de Janeiro</option>
                        <option value="MG">Minas Gerais</option>
                    </select>
                )}
                <select 
                    value={rankingFiltro.mediaMin}
                    onChange={(e) => setRankingFiltro({...rankingFiltro, mediaMin: e.target.value})}
                >
                    <option value="">Qualquer Média</option>
                    <option value="4">4+ estrelas</option>
                    <option value="3">3+ estrelas</option>
                    <option value="2">2+ estrelas</option>
                </select>
            </div>

            {/* Estatísticas Gerais */}
            <div className="ranking-stats">
                <div className="stat-card-mini">
                    <span className="stat-value">{rankingTipo === 'magistrado' ? ranking.length : rankingAdvogados.length}</span>
                    <span className="stat-label">Total de {rankingTipo === 'magistrado' ? 'Magistrados' : 'Advogados'}</span>
                </div>
                <div className="stat-card-mini">
                    <span className="stat-value">
                        {rankingTipo === 'magistrado' 
                            ? (ranking.reduce((sum, r) => sum + (r.media || 0), 0) / (ranking.length || 1)).toFixed(1)
                            : (rankingAdvogados.reduce((sum, r) => sum + (r.media || 0), 0) / (rankingAdvogados.length || 1)).toFixed(1)
                        }
                    </span>
                    <span className="stat-label">Média Geral</span>
                </div>
                <div className="stat-card-mini">
                    <span className="stat-value">
                        {rankingTipo === 'magistrado' 
                            ? ranking.reduce((sum, r) => sum + (r.quantidade || 0), 0)
                            : rankingAdvogados.reduce((sum, r) => sum + (r.quantidade || 0), 0)
                        }
                    </span>
                    <span className="stat-label">Total de Avaliações</span>
                </div>
            </div>

            {/* Lista do Ranking */}
            <div className="ranking-list">
                {(rankingTipo === 'magistrado' ? ranking : rankingAdvogados).map((item, index) => (
                    <div 
                        key={index} 
                        className={`ranking-item ${index < 3 ? 'top-' + (index + 1) : ''}`}
                        onClick={() => handleAbrirPerfil(rankingTipo, item)}
                        style={{ cursor: 'pointer' }}
                    >
                        <div className="ranking-position">
                            {index < 3 ? (
                                <span className="medal">{['🥇', '🥈', '🥉'][index]}</span>
                            ) : (
                                <span className="number">{index + 1}</span>
                            )}
                        </div>
                        <div className="ranking-info">
                            <h4>{formatarNome(item.nome)}</h4>
                            <p>
                                {rankingTipo === 'magistrado' 
                                    ? (item.tribunal || 'Tribunal não informado')
                                    : `OAB: ${item.oab || 'Não informado'}`
                                }
                            </p>
                        </div>
                        <div className="ranking-score">
                            <span className="score-value">{(item.media || 0).toFixed(1)}</span>
                            <span className="score-reviews">{item.quantidade || 0} avaliações</span>
                        </div>
                    </div>
                ))}
                {(rankingTipo === 'magistrado' ? ranking : rankingAdvogados).length === 0 && (
                    <p className="empty-message">Nenhum {rankingTipo} avaliado ainda</p>
                )}
            </div>
        </div>
    );

    // Funções de chat
    const carregarConversas = async () => {
        try {
            const response = await api.get('/conversas');
            if (response.data.success) {
                setConversas(response.data.conversas);
            }
        } catch (error) {
            console.error('Erro ao carregar conversas:', error);
        }
    };

    const carregarMensagensConversa = async (conversaId) => {
        try {
            const response = await api.get(`/conversa/${conversaId}/mensagens`);
            if (response.data.success) {
                setMensagensChat(response.data.mensagens);
            }
        } catch (error) {
            console.error('Erro ao carregar mensagens:', error);
        }
    };

    const enviarMensagemChat = async () => {
        if (!novaMensagem.trim() || !conversaAtiva) return;
        
        try {
            const response = await api.post(`/conversa/${conversaAtiva._id}/enviar`, {
                texto: novaMensagem
            });
            if (response.data.success) {
                setMensagensChat([...mensagensChat, response.data.mensagem]);
                setNovaMensagem('');
            }
        } catch (error) {
            console.error('Erro ao enviar mensagem:', error);
        }
    };

    const abrirConversa = (conversa) => {
        setConversaAtiva(conversa);
        carregarMensagensConversa(conversa._id);
    };

    const outroParticipante = (conversa) => {
        return conversa?.participantes?.find(p => p._id !== user?.id);
    };

    // Seção de Chat
    const renderChat = () => (
        <div className="chat-content">
            <div className="chat-layout">
                {/* Lista de Conversas */}
                <div className="chat-sidebar">
                    <div className="chat-sidebar-header">
                        <h3>Mensagens</h3>
                    </div>
                    <div className="chat-list">
                        {conversas.length === 0 ? (
                            <div className="empty-chat">
                                <p>Nenhuma conversa ainda</p>
                                <small>Inicie uma conversa a partir do perfil de um profissional</small>
                            </div>
                        ) : (
                            conversas.map((conversa) => {
                                const outro = outroParticipante(conversa);
                                return (
                                    <div 
                                        key={conversa._id}
                                        className={`chat-item ${conversaAtiva?._id === conversa._id ? 'active' : ''}`}
                                        onClick={() => abrirConversa(conversa)}
                                    >
                                        <div className="chat-avatar">
                                            {outro?.foto ? (
                                                <img src={outro.foto} alt={outro.nome} />
                                            ) : (
                                                <span>{outro?.nome?.charAt(0) || '?'}</span>
                                            )}
                                        </div>
                                        <div className="chat-info">
                                            <h4>{outro?.nome || 'Usuário'}</h4>
                                            <p>{conversa.ultimaMensagem?.texto || 'Nenhuma mensagem'}</p>
                                        </div>
                                        {conversa.ultimaMensagem?.criadoEm && (
                                            <span className="chat-time">
                                                {new Date(conversa.ultimaMensagem.criadoEm).toLocaleDateString('pt-BR', { 
                                                    day: '2-digit', 
                                                    month: '2-digit'
                                                })}
                                            </span>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Área de Mensagens */}
                <div className="chat-main">
                    {conversaAtiva ? (
                        <>
                            <div className="chat-header">
                                <div className="chat-header-info">
                                    <div className="chat-avatar">
                                        {outroParticipante(conversaAtiva)?.foto ? (
                                            <img src={outroParticipante(conversaAtiva).foto} alt="" />
                                        ) : (
                                            <span>{outroParticipante(conversaAtiva)?.nome?.charAt(0)}</span>
                                        )}
                                    </div>
                                    <div>
                                        <h4>{outroParticipante(conversaAtiva)?.nome}</h4>
                                        <span className="chat-user-type">{outroParticipante(conversaAtiva)?.tipo}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="chat-messages">
                                {mensagensChat.map((msg, index) => (
                                    <div 
                                        key={index}
                                        className={`message ${msg.remetente?._id === user?.id ? 'sent' : 'received'}`}
                                    >
                                        <div className="message-content">
                                            <p>{msg.texto}</p>
                                            <span className="message-time">
                                                {new Date(msg.criadoEm).toLocaleTimeString('pt-BR', { 
                                                    hour: '2-digit', 
                                                    minute: '2-digit'
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="chat-input">
                                <input 
                                    type="text"
                                    placeholder="Digite sua mensagem..."
                                    value={novaMensagem}
                                    onChange={(e) => setNovaMensagem(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && enviarMensagemChat()}
                                />
                                <button onClick={enviarMensagemChat}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="22" y1="2" x2="11" y2="13"/>
                                        <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                                    </svg>
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="chat-empty">
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                            </svg>
                            <h3>Selecione uma conversa</h3>
                            <p>Escolha uma conversa na lista ao lado ou inicie uma nova a partir do perfil de um profissional</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    const handleLogout = () => {
        logout();
        navigate('/');
    };

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
                        {getMenuItems().slice(0, user?.tipo === 'comum' ? 2 : user?.tipo === 'magistrado' ? 4 : 3).map((item) => (
                            <React.Fragment key={item.id}>
                                <button
                                    className={`nav-item ${(activeSection === item.id && !perfilInline) || (item.id === 'procurar' && perfilInline) ? 'active' : ''}`}
                                    onClick={() => {
                                        setActiveSection(item.id);
                                        if (item.id === 'procurar') {
                                            handleVoltarParaResultados();
                                        }
                                    }}
                                >
                                    <span className="nav-icon">{renderIcon(item.icon)}</span>
                                    <span className="nav-label">{item.label}</span>
                                </button>
                                {/* Mostrar subitem "Perfil" quando estiver visualizando um perfil */}
                                {item.id === 'procurar' && perfilInline && (
                                    <button
                                        className="nav-item nav-subitem"
                                        onClick={() => {}}
                                    >
                                        <span className="nav-label">Perfil</span>
                                    </button>
                                )}
                            </React.Fragment>
                        ))}
                    </div>

                    {getMenuItems().length > (user?.tipo === 'comum' ? 2 : user?.tipo === 'magistrado' ? 4 : 3) && (
                        <div className="nav-section">
                            <span className="nav-section-label">SISTEMA</span>
                            {getMenuItems().slice(user?.tipo === 'comum' ? 2 : user?.tipo === 'magistrado' ? 4 : 3).map((item) => (
                                <button
                                    key={item.id}
                                    className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
                                    onClick={() => setActiveSection(item.id)}
                                >
                                    <span className="nav-icon">{renderIcon(item.icon)}</span>
                                    <span className="nav-label">{item.label}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* User Profile at Bottom */}
                <div className="sidebar-footer">
                    <div className="sidebar-user-profile" onClick={() => setActiveSection('perfil')} style={{ cursor: 'pointer' }}>
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
                        <button onClick={(e) => { e.stopPropagation(); handleLogout(); }} className="sidebar-logout-btn" title="Sair">
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
                            {getBreadcrumb().map((item, index) => (
                                <React.Fragment key={index}>
                                    {index > 0 && <span className="breadcrumb-separator">›</span>}
                                    {item.action ? (
                                        <span 
                                            className="breadcrumb-item" 
                                            onClick={item.action} 
                                            style={{ cursor: 'pointer' }}
                                        >
                                            {item.label}
                                        </span>
                                    ) : (
                                        <span className="breadcrumb-current">{item.label}</span>
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                        <h1 className="page-title">{getPageTitle()}</h1>
                    </div>
                    <div className="navbar-right">
                        {getNavbarActions().map((action, index) => (
                            <button 
                                key={index}
                                className="navbar-action-btn"
                                onClick={action.action}
                                title={action.label}
                            >
                                {action.icon === 'plus' && (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="12" y1="5" x2="12" y2="19"/>
                                        <line x1="5" y1="12" x2="19" y2="12"/>
                                    </svg>
                                )}
                                {action.icon === 'star' && (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                                    </svg>
                                )}
                                {action.icon === 'edit' && (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                    </svg>
                                )}
                                {action.icon === 'users' && (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                        <circle cx="9" cy="7" r="4"/>
                                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                                        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                                    </svg>
                                )}
                                <span>{action.label}</span>
                            </button>
                        ))}
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
                
                {renderContent()}
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
                <div className="notifications-card">
                    <div className="card-header">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                        </svg>
                        <h4>Notificações</h4>
                    </div>
                    <div className="notification-item">
                        <div className="notif-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                <polyline points="22 4 12 14.01 9 11.01"/>
                            </svg>
                        </div>
                        <div className="notif-content">
                            <p>Bem-vindo ao MagiScore!</p>
                            <span className="notif-time">Agora</span>
                        </div>
                    </div>
                    <div className="notification-item">
                        <div className="notif-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                            </svg>
                        </div>
                        <div className="notif-content">
                            <p>Sistema seguro e protegido</p>
                            <span className="notif-time">2 min atrás</span>
                        </div>
                    </div>
                </div>

                <div className="chat-card">
                    <div className="card-header">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                        </svg>
                        <h4>Chat de Suporte</h4>
                    </div>
                    <div className="chat-messages">
                        {chatMessages.map(msg => (
                            <div key={msg.id} className={`chat-message ${msg.type}`}>
                                <p>{msg.text}</p>
                                <span className="message-time">{msg.time}</span>
                            </div>
                        ))}
                    </div>
                    <form className="chat-input-form" onSubmit={handleSendMessage}>
                        <input
                            type="text"
                            value={chatMessage}
                            onChange={(e) => setChatMessage(e.target.value)}
                            placeholder="Digite sua mensagem..."
                            className="chat-input"
                        />
                        <button type="submit" className="chat-send-btn">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="22" y1="2" x2="11" y2="13"/>
                                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                            </svg>
                        </button>
                    </form>
                </div>
            </aside>
        </div>
    );
};

export default Inicial;