/**
 * App.js - Lógica principal da Smart Cities Dashboard
 * Coordena toda a funcionalidade da aplicação web
 */

class SmartCitiesApp {
    constructor() {
        this.isLoading = false;
        this.currentTheme = 'light';
        this.initializeApp();
    }

    /**
     * Inicializa a aplicação
     */
    async initializeApp() {
        this.setupEventListeners();
        this.setupChartManager();
        this.loadTheme();
        await this.testBackendConnection();
        
        console.log('🏙️ Smart Cities Dashboard iniciado');
    }

    /**
     * Configura todos os event listeners
     */
    setupEventListeners() {
        // Formulário de prompt
        const promptForm = document.getElementById('promptForm');
        const promptInput = document.getElementById('promptInput');
        
        if (promptForm) {
            promptForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const prompt = promptInput.value.trim();
                if (prompt) {
                    this.processPrompt(prompt);
                }
            });
        }

        // Botões de consulta rápida
        const quickButtons = document.querySelectorAll('.quick-btn');
        quickButtons.forEach(button => {
            button.addEventListener('click', () => {
                const prompt = button.getAttribute('data-prompt');
                if (prompt) {
                    promptInput.value = prompt;
                    this.processPrompt(prompt);
                }
            });
        });

        // Toggle de tema
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }

        // Botão de teste de conectividade
        const testConnection = document.getElementById('testConnection');
        if (testConnection) {
            testConnection.addEventListener('click', () => {
                this.testConnectivity();
            });
        }

        // Fechar erro
        const errorDismiss = document.getElementById('errorDismiss');
        if (errorDismiss) {
            errorDismiss.addEventListener('click', () => {
                this.hideError();
            });
        }

        // Redimensionamento da janela
        window.addEventListener('resize', () => {
            if (window.chartManager) {
                window.chartManager.resizeCharts();
            }
        });

        // Teclas de atalho
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                // Ctrl+Enter para submeter prompt
                const prompt = promptInput.value.trim();
                if (prompt) {
                    this.processPrompt(prompt);
                }
            }
        });

        // Device Report Form
        const deviceReportForm = document.getElementById('deviceReportForm');
        if (deviceReportForm) {
            deviceReportForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.processDeviceReport();
            });
        }

        // Device Report Controls
        const copyReportBtn = document.getElementById('copyReportBtn');
        const downloadReportBtn = document.getElementById('downloadReportBtn');
        const closeReportBtn = document.getElementById('closeReportBtn');

        if (copyReportBtn) {
            copyReportBtn.addEventListener('click', () => {
                this.copyReportToClipboard();
            });
        }

        if (downloadReportBtn) {
            downloadReportBtn.addEventListener('click', () => {
                this.downloadReport();
            });
        }

        if (closeReportBtn) {
            closeReportBtn.addEventListener('click', () => {
                this.closeDeviceReport();
            });
        }
    }

    /**
     * Configura o gerenciador de gráficos
     */
    setupChartManager() {
        if (window.chartManager) {
            const chartsContainer = document.getElementById('chartsContainer');
            window.chartManager.setContainer(chartsContainer);
        }
    }

    /**
     * Processa um prompt do usuário
     */
    async processPrompt(prompt) {
        if (this.isLoading) return;

        // Validação de entrada
        if (!prompt || prompt.trim().length === 0) {
            this.showError('Por favor, digite uma consulta');
            return;
        }

        if (prompt.length > 1000) {
            this.showError('Consulta muito longa (máximo 1000 caracteres)');
            return;
        }

        this.setLoading(true);
        this.hideError();
        this.clearResults();

        try {
            console.log('🔄 Processando prompt:', prompt);
            
            // Verificar conectividade do backend
            await this.checkBackendHealth();
            
            // Processa prompt via backend
            const result = await window.mcpClient.processPrompt(prompt);
            
            if (result.success) {
                // Validar se há dados para exibir
                if (!result.data && !result.processedData) {
                    this.showError('Nenhum dado foi retornado para a consulta');
                    return;
                }
                
                this.displayResults(result);
                this.showResults();
                console.log('✅ Prompt processado com sucesso');
            } else {
                this.handleApiError(result);
            }
        } catch (error) {
            console.error('❌ Erro inesperado:', error);
            this.handleUnexpectedError(error);
        } finally {
            this.setLoading(false);
        }
    }

    /**
     * Verifica saúde do backend
     */
    async checkBackendHealth() {
        try {
            const response = await fetch('http://localhost:3001/api/health');
            if (!response.ok) {
                throw new Error('Backend indisponível');
            }
        } catch (error) {
            throw new Error('Não foi possível conectar ao servidor. Verifique se o backend está rodando.');
        }
    }

    /**
     * Trata erros da API de forma específica
     */
    handleApiError(result) {
        const errorType = result.errorType || 'unknown';
        let message = result.message || 'Erro desconhecido';
        
        switch (errorType) {
            case 'tool_not_found':
                message = '🔧 Ferramenta não encontrada para esta consulta. Tente reformular sua pergunta.';
                break;
            case 'timeout':
                message = '⏱️ Timeout na consulta. Tente novamente em alguns segundos.';
                break;
            case 'service_unavailable':
                message = '🔌 Serviço temporariamente indisponível. Verifique se o MongoDB está rodando.';
                break;
            case 'validation_error':
                message = '📝 Erro de validação: ' + message;
                break;
            default:
                message = '❌ Erro ao processar consulta: ' + message;
        }
        
        this.showError(message);
        console.error('❌ Erro da API:', result);
    }

    /**
     * Trata erros inesperados
     */
    handleUnexpectedError(error) {
        let message = 'Erro inesperado ao processar consulta';
        
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            message = '🔌 Não foi possível conectar ao servidor. Verifique se o backend está rodando.';
        } else if (error.name === 'SyntaxError') {
            message = '📄 Erro ao processar resposta do servidor.';
        } else if (error.message.includes('timeout')) {
            message = '⏱️ Timeout na conexão. Tente novamente.';
        } else if (error.message) {
            message = '❌ ' + error.message;
        }
        
        this.showError(message);
    }

    /**
     * Exibe os resultados na interface
     */
    displayResults(responseData) {
        console.log('📊 Exibindo resultados:', responseData);
        
        // Limpa resultados anteriores
        this.clearResults();

        // Verifica estrutura de dados - pode estar em responseData.processedData ou responseData.data.processedData
        const processedData = responseData.processedData || responseData.data?.processedData;
        
        // Verifica se há dados processados válidos
        const hasProcessedCharts = processedData && 
                                 processedData.charts && 
                                 processedData.charts.length > 0;
        
        const hasProcessedCards = processedData && 
                                processedData.cards && 
                                processedData.cards.length > 0;

        console.log('🔍 Debug processedData:', {
            hasProcessedData: !!processedData,
            hasProcessedCharts,
            hasProcessedCards,
            chartsCount: processedData?.charts?.length || 0,
            cardsCount: processedData?.cards?.length || 0,
            dataStructure: {
                hasDirectProcessedData: !!responseData.processedData,
                hasNestedProcessedData: !!responseData.data?.processedData
            }
        });

        // PRIORIDADE 1: Usa dados processados do backend se disponíveis
        if (hasProcessedCharts || hasProcessedCards) {
            console.log('✅ Usando dados processados do backend (PRIORIDADE 1)');
            
            // Exibe cards de métricas
            if (hasProcessedCards) {
                console.log('📋 Exibindo cards processados:', processedData.cards.length);
                this.displayMetricCards(processedData.cards);
            }
            
            // Exibe gráficos
            if (hasProcessedCharts) {
                console.log('📊 Exibindo gráficos processados:', processedData.charts.length);
                this.displayProcessedCharts(processedData.charts);
            }
            
            // Exibe dados brutos mesmo quando há processedData
            this.displayRawData(responseData);
            return;
        }

        console.log('⚠️ Dados processados não encontrados, usando fallbacks');
        
        // PRIORIDADE 2: Fallbacks para dados não processados
        // Exibe métricas em cards (formato antigo)
        if (responseData.metrics) {
            console.log('📋 Usando métricas formato antigo');
            this.displayMetrics(responseData.metrics);
        }

        // Exibe gráficos (formato antigo)
        if (responseData.charts && responseData.charts.length > 0) {
            console.log('📊 Usando gráficos formato antigo');
            this.displayCharts(responseData.charts);
        } else if (responseData.data) {
            console.log('🔧 Tentando gerar gráficos a partir dos dados brutos');
            // Tenta gerar gráficos automaticamente a partir dos dados brutos
            this.generateChartsFromData(responseData);
        }

        // Exibe dados brutos
        this.displayRawData(responseData);
    }

    /**
     * Exibe cards de métricas estruturados
     */
    displayMetricCards(cards) {
        const metricsContainer = document.getElementById('metricsCards');
        if (!metricsContainer) return;

        cards.forEach(cardData => {
            const card = this.createStructuredMetricCard(cardData);
            metricsContainer.appendChild(card);
        });
    }

    /**
     * Exibe gráficos processados pelo backend
     */
    displayProcessedCharts(charts) {
        const chartsContainer = document.getElementById('chartsContainer');
        if (!chartsContainer) return;

        charts.forEach((chartConfig, index) => {
            // Cria container para o gráfico
            const chartContainer = document.createElement('div');
            chartContainer.className = 'chart-container';
            chartContainer.style.cssText = `
                background: white;
                border-radius: 12px;
                padding: 24px;
                margin-bottom: 24px;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                border: 1px solid #E5E7EB;
                min-height: 400px;
                position: relative;
            `;

            // Cria canvas para o gráfico
            const canvas = document.createElement('canvas');
            canvas.id = `processedChart${index}`;
            canvas.style.cssText = `
                max-height: 350px;
                width: 100% !important;
                height: 350px !important;
            `;
            
            chartContainer.appendChild(canvas);
            chartsContainer.appendChild(chartContainer);

            // Configuração completa do Chart.js
            const fullConfig = {
                type: chartConfig.type,
                data: chartConfig.data,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                            display: true,
                            text: chartConfig.title,
                            color: '#1F2937',
                            font: {
                                size: 18,
                                weight: 'bold'
                            },
                            padding: {
                                top: 10,
                                bottom: 30
                            }
                        },
                        legend: {
                            display: true,
                            position: chartConfig.type === 'doughnut' || chartConfig.type === 'pie' ? 'right' : 'top',
                            labels: {
                                color: '#374151',
                                padding: 20,
                                usePointStyle: chartConfig.type === 'doughnut' || chartConfig.type === 'pie',
                                font: {
                                    size: 12
                                }
                            }
                        },
                        tooltip: {
                            backgroundColor: 'rgba(31, 41, 55, 0.95)',
                            titleColor: '#F9FAFB',
                            bodyColor: '#F9FAFB',
                            borderColor: '#6B7280',
                            borderWidth: 1,
                            cornerRadius: 8,
                            padding: 12,
                            titleFont: {
                                size: 14,
                                weight: 'bold'
                            },
                            bodyFont: {
                                size: 13
                            },
                            callbacks: {
                                label: (context) => {
                                    const label = context.dataset.label || '';
                                    const value = context.parsed.y !== undefined ? context.parsed.y : context.parsed;
                                    
                                    // Para gráficos de pizza/doughnut, mostrar percentual
                                    if (chartConfig.type === 'doughnut' || chartConfig.type === 'pie') {
                                        const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
                                        const percentage = ((value / total) * 100).toFixed(1);
                                        return `${context.label}: ${value.toLocaleString('pt-BR')} (${percentage}%)`;
                                    }
                                    
                                    return `${label}: ${value.toLocaleString('pt-BR')}`;
                                }
                            }
                        }
                    },
                    // Merge com configurações específicas do backend se existirem
                    ...chartConfig.options
                }
            };

            // Configurações específicas por tipo de gráfico
            if (chartConfig.type === 'bar') {
                fullConfig.options.scales = {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#6B7280',
                            font: {
                                size: 12
                            }
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: '#F3F4F6'
                        },
                        ticks: {
                            color: '#6B7280',
                            font: {
                                size: 12
                            },
                            callback: function(value) {
                                return value.toLocaleString('pt-BR');
                            }
                        }
                    }
                };
            }

            if (chartConfig.type === 'horizontalBar') {
                fullConfig.type = 'bar';
                fullConfig.options.indexAxis = 'y';
                fullConfig.options.scales = {
                    x: {
                        beginAtZero: true,
                        grid: {
                            color: '#F3F4F6'
                        },
                        ticks: {
                            color: '#6B7280',
                            font: {
                                size: 12
                            },
                            callback: function(value) {
                                return value.toLocaleString('pt-BR');
                            }
                        }
                    },
                    y: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#6B7280',
                            font: {
                                size: 11
                            }
                        }
                    }
                };
            }

            if (chartConfig.type === 'line') {
                fullConfig.options.scales = {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#6B7280',
                            font: {
                                size: 12
                            }
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: '#F3F4F6'
                        },
                        ticks: {
                            color: '#6B7280',
                            font: {
                                size: 12
                            },
                            callback: function(value) {
                                return value.toLocaleString('pt-BR');
                            }
                        }
                    }
                };
                
                fullConfig.options.elements = {
                    line: {
                        tension: 0.3
                    },
                    point: {
                        radius: 4,
                        hoverRadius: 6
                    }
                };
            }

            if (chartConfig.type === 'doughnut') {
                fullConfig.options.cutout = '60%';
                fullConfig.options.plugins.legend.position = 'right';
            }

            // Cria o gráfico
            try {
                window.chartManager.createChart(canvas.id, fullConfig);
                console.log(`✅ Gráfico processado criado: ${chartConfig.title}`);
            } catch (error) {
                console.error('❌ Erro ao criar gráfico:', error);
            }
        });
    }

    /**
     * Exibe métricas em cards (formato legado)
     */
    displayMetrics(metrics) {
        const metricsContainer = document.getElementById('metricsCards');
        if (!metricsContainer) return;

        // Converte métricas para formato de cards
        const metricsData = window.mcpClient.formatMetricsData({ metrics });
        
        metricsData.forEach(metric => {
            const card = this.createMetricCard(metric);
            metricsContainer.appendChild(card);
        });
    }

    /**
     * Cria um card de métrica estruturado
     */
    createStructuredMetricCard(cardData) {
        const card = document.createElement('div');
        card.className = `metric-card ${cardData.status ? `status-${cardData.status}` : ''}`;
        
        // Ícones baseados no tipo
        const icons = {
            'lightbulb': '💡',
            'droplet': '💧',
            'flame': '🔥',
            'zap': '⚡',  
            'activity': '📊',
            'check-circle': '✅',
            'alert-triangle': '⚠️',
            'number': '📊',
            'text': '📝'
        };
        
        const icon = cardData.icon ? icons[cardData.icon] || '📊' : '📊';
        
        // Formatação do valor
        let displayValue = cardData.value;
        if (cardData.type === 'number' && typeof cardData.value === 'number') {
            displayValue = cardData.value.toLocaleString('pt-BR');
        }
        
        // Adiciona cor se especificada
        const colorStyle = cardData.color ? `border-left: 4px solid ${cardData.color};` : '';
        const statusClass = cardData.status ? `status-${cardData.status}` : '';
        
        card.innerHTML = `
            <div class="metric-icon" ${cardData.color ? `style="color: ${cardData.color};"` : ''}>${icon}</div>
            <div class="metric-value">${displayValue}</div>
            <div class="metric-label">${cardData.title}</div>
            ${cardData.subtitle ? `<div class="metric-subtitle">${cardData.subtitle}</div>` : ''}
        `;
        
        if (colorStyle) {
            card.style.cssText += colorStyle;
        }
        
        if (statusClass) {
            card.classList.add(statusClass);
        }
        
        return card;
    }

    /**
     * Cria um card de métrica (formato legado)
     */
    createMetricCard(metric) {
        const card = document.createElement('div');
        card.className = 'metric-card';
        card.innerHTML = `
            <div class="metric-icon">${metric.icon}</div>
            <div class="metric-value" style="color: ${metric.color}">${metric.value}</div>
            <div class="metric-label">${metric.label}</div>
        `;
        return card;
    }

    /**
     * Exibe gráficos
     */
    displayCharts(charts) {
        if (!window.chartManager) return;

        charts.forEach(chartConfig => {
            this.createChart(chartConfig);
        });
    }

    /**
     * Cria um gráfico baseado na configuração
     */
    createChart(chartConfig) {
        const { type, data, options = {} } = chartConfig;

        switch (type) {
            case 'line':
                window.chartManager.createLineChart(data, options);
                break;
            case 'bar':
                window.chartManager.createBarChart(data, options);
                break;
            case 'pie':
            case 'doughnut':
                window.chartManager.createPieChart(data, options);
                break;
            case 'area':
                window.chartManager.createAreaChart(data, options);
                break;
            default:
                console.warn('⚠️ Tipo de gráfico não suportado:', type);
                // Fallback para gráfico de linha
                window.chartManager.createLineChart(data, options);
        }
    }

    /**
     * Gera gráficos automaticamente a partir dos dados
     */
    generateChartsFromData(responseData) {
        if (!window.chartManager) return;

        console.log('🔧 Gerando gráficos automaticamente para responseData:', responseData);
        
        // Extrai dados brutos do MCP Server
        let data = responseData.data;
        
        // Se os dados estão em formato MCP (data.content[0].text), fazer parse
        if (data && data.content && data.content[0] && data.content[0].text) {
            console.log('🔍 Detectado formato MCP, fazendo parse do JSON');
            try {
                data = JSON.parse(data.content[0].text);
                console.log('✅ Parse JSON realizado com sucesso:', data);
            } catch (error) {
                console.error('❌ Erro ao fazer parse dos dados MCP:', error);
                data = responseData.data;
            }
        }
        
        console.log('🔧 Dados finais para processamento:', data);
        
        // Verifica se são dados do MCP Server com estrutura específica
        if (this.isMCPStructuredData(data)) {
            console.log('📊 Detectados dados estruturados do MCP Server');
            this.generateMCPStructuredCharts(data, responseData);
            return;
        }
        
        // Lógica original para outros tipos de dados
        if (Array.isArray(data)) {
            console.log('📈 Processando array de dados');
            // Array de dados - gráfico de linha temporal
            const chartData = window.chartManager.convertMCPData({ data }, 'line');
            if (chartData.labels.length > 0) {
                window.chartManager.createLineChart(chartData, {
                    title: responseData.title || 'Dados Temporais',
                    yAxisFormatter: (value) => value.toLocaleString()
                });
            }
        } else if (typeof data === 'object') {
            console.log('📊 Processando objeto de dados');
            // Objeto com múltiplas séries
            const keys = Object.keys(data);
            
            if (keys.length > 0) {
                const firstKey = keys[0];
                const firstData = data[firstKey];
                
                if (Array.isArray(firstData)) {
                    console.log('📈 Detectados dados temporais em objeto');
                    // Dados temporais
                    const chartData = window.chartManager.convertMCPData({ data }, 'line');
                    if (chartData.labels.length > 0) {
                        window.chartManager.createLineChart(chartData, {
                            title: responseData.title || 'Comparação de Dados'
                        });
                    }
                } else {
                    // Dados categóricos simples - só usar para dados realmente categóricos
                    console.log('📊 Gerando gráfico categórico para dados simples');
                    const chartData = {
                        labels: keys,
                        datasets: [{
                            label: 'Valores',
                            data: keys.map(key => data[key]),
                            backgroundColor: window.chartManager.getColorPalette()
                        }]
                    };
                    
                    window.chartManager.createBarChart(chartData, {
                        title: responseData.title || 'Dados Categóricos'
                    });
                }
            }
        } else {
            console.log('⚠️ Tipo de dados não suportado:', typeof data);
        }
    }

    /**
     * Verifica se os dados têm estrutura típica do MCP Server
     */
    isMCPStructuredData(data) {
        console.log('🔍 isMCPStructuredData - Verificando dados:', data);
        console.log('🔍 Tipo dos dados:', typeof data);
        console.log('🔍 É array:', Array.isArray(data));
        
        if (!data || typeof data !== 'object') {
            console.log('❌ Dados inválidos ou não é objeto');
            return false;
        }
        
        // Verifica padrões típicos do MCP Server
        const hasOverview = data.overview && typeof data.overview === 'object';
        const hasTotals = data.totals && typeof data.totals === 'object';
        const hasAlerts = data.alerts && typeof data.alerts === 'object';
        const hasTimestamp = typeof data.timestamp === 'number';
        
        console.log('🔍 Estrutura detectada:', {
            hasOverview,
            hasTotals,
            hasAlerts,
            hasTimestamp,
            keys: Object.keys(data)
        });
        
        // Dashboard da cidade
        if (hasOverview && hasTotals) {
            console.log('✅ Detectado: Dashboard da cidade');
            return true;
        }
        
        // Dados de telemetria (array com deviceId, timestamp, etc.)
        if (Array.isArray(data) && data.length > 0 && data[0].deviceId && data[0].timestamp) {
            console.log('✅ Detectado: Telemetria temporal');
            return true;
        }
        
        // Dados de análise (com startTime, endTime, etc.)
        if (data.analysis || data.statistics || data.report) {
            console.log('✅ Detectado: Dados de análise');
            return true;
        }
        
        console.log('❌ Estrutura não reconhecida');
        return false;
    }

    /**
     * Gera gráficos específicos para dados estruturados do MCP Server
     */
    generateMCPStructuredCharts(data, responseData) {
        console.log('🎯 Gerando gráficos específicos do MCP Server');
        console.log('🎯 Dados recebidos:', data);
        console.log('🎯 ResponseData completo:', responseData);
        
        // Dashboard da cidade
        if (data.overview && data.totals) {
            console.log('🏙️ Processando dashboard da cidade');
            this.generateCityDashboardCharts(data);
            return;
        }
        
        // Dados de telemetria temporal
        if (Array.isArray(data) && data.length > 0 && data[0].timestamp) {
            console.log('📈 Processando telemetria temporal');
            this.generateTelemetryCharts(data, responseData);
            return;
        }
        
        // Dados de análise/relatório
        if (data.analysis || data.statistics || data.report) {
            console.log('📊 Processando dados de análise');
            this.generateAnalysisCharts(data, responseData);
            return;
        }
        
        // Fallback para dados estruturados não reconhecidos
        console.log('⚠️ Dados estruturados não reconhecidos, usando fallback categórico');
        console.log('⚠️ Estrutura dos dados:', {
            keys: Object.keys(data),
            hasOverview: !!data.overview,
            hasTotals: !!data.totals,
            overviewType: typeof data.overview,
            totalsType: typeof data.totals
        });
        this.generateCategoricalFallback(data, responseData);
    }

    /**
     * Gera gráficos para dashboard da cidade
     */
    generateCityDashboardCharts(data) {
        console.log('🏙️ Gerando gráficos do dashboard da cidade');
        
        // Gráfico de consumo total
        if (data.totals) {
            const consumptionData = {
                labels: ['Energia (kWh)', 'Água (L)', 'Gás (m³)'],
                datasets: [{
                    label: 'Consumo Total',
                    data: [
                        data.totals.energyConsumption || 0,
                        data.totals.waterConsumption || 0,
                        data.totals.gasConsumption || 0
                    ],
                    backgroundColor: ['#FF6B6B', '#4ECDC4', '#45B7D1']
                }]
            };
            
            window.chartManager.createBarChart(consumptionData, {
                title: 'Consumo Total por Tipo',
                yAxisFormatter: (value) => value.toLocaleString()
            });
        }
        
        // Gráfico de distribuição de dispositivos
        if (data.overview) {
            const deviceData = {
                labels: ['Iluminação', 'Água', 'Gás'],
                datasets: [{
                    label: 'Dispositivos',
                    data: [
                        data.overview.lighting?.deviceCount || 0,
                        data.overview.water?.deviceCount || 0,
                        data.overview.gas?.deviceCount || 0
                    ],
                    backgroundColor: ['#FFD93D', '#6BCF7F', '#FF8A65']
                }]
            };
            
            window.chartManager.createPieChart(deviceData, {
                title: 'Distribuição de Dispositivos'
            });
        }
        
        // Gráfico de vazamentos se houver
        if (data.overview && (data.overview.water?.leakCount > 0 || data.overview.gas?.leakCount > 0)) {
            const leakData = {
                labels: ['Água', 'Gás'],
                datasets: [{
                    label: 'Vazamentos Detectados',
                    data: [
                        data.overview.water?.leakCount || 0,
                        data.overview.gas?.leakCount || 0
                    ],
                    backgroundColor: ['#FF6B6B', '#FFA500']
                }]
            };
            
            window.chartManager.createBarChart(leakData, {
                title: 'Vazamentos por Tipo'
            });
        }
    }

    /**
     * Gera gráficos para dados de telemetria temporal
     */
    generateTelemetryCharts(data, responseData) {
        console.log('📈 Gerando gráficos de telemetria temporal');
        
        // Agrupa dados por timestamp
        const timeData = data.reduce((acc, reading) => {
            const time = new Date(reading.timestamp * 1000).toLocaleTimeString();
            if (!acc[time]) acc[time] = [];
            acc[time].push(reading);
            return acc;
        }, {});
        
        const timestamps = Object.keys(timeData).sort();
        
        // Detecta qual tipo de dado usar (powerConsumption, pressure, flow, etc.)
        const firstReading = data[0];
        const numericFields = Object.keys(firstReading).filter(key => 
            typeof firstReading[key] === 'number' && 
            key !== 'timestamp' && 
            key !== 'state'
        );
        
        numericFields.forEach(field => {
            const chartData = {
                labels: timestamps,
                datasets: [{
                    label: this.getFieldLabel(field),
                    data: timestamps.map(time => {
                        const readings = timeData[time];
                        return readings.reduce((sum, r) => sum + (r[field] || 0), 0) / readings.length;
                    }),
                    borderColor: this.getFieldColor(field),
                    backgroundColor: this.getFieldColor(field) + '20',
                    fill: true
                }]
            };
            
            window.chartManager.createLineChart(chartData, {
                title: `${this.getFieldLabel(field)} ao Longo do Tempo`,
                yAxisFormatter: (value) => value.toFixed(2)
            });
        });
    }

    /**
     * Gera gráficos para dados de análise
     */
    generateAnalysisCharts(data, responseData) {
        console.log('📊 Gerando gráficos de análise');
        
        // Para dados de análise, extrair campos numéricos relevantes
        const analysisData = data.analysis || data.statistics || data.report || data;
        
        Object.keys(analysisData).forEach(key => {
            const value = analysisData[key];
            
            if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object') {
                // Array de objetos - criar gráfico temporal ou categórico
                this.createChartFromArray(key, value);
            } else if (typeof value === 'object' && value !== null) {
                // Objeto com métricas - criar gráfico categórico
                this.createChartFromObject(key, value);
            }
        });
    }

    /**
     * Cria gráfico a partir de array de objetos
     */
    createChartFromArray(title, data) {
        if (data[0].timestamp) {
            // Dados temporais
            const chartData = window.chartManager.convertMCPData({ data }, 'line');
            if (chartData.labels.length > 0) {
                window.chartManager.createLineChart(chartData, { title });
            }
        } else {
            // Dados categóricos
            const labels = data.map((item, index) => item.name || item.label || `Item ${index + 1}`);
            const values = data.map(item => item.value || item.count || 0);
            
            const chartData = {
                labels,
                datasets: [{
                    label: title,
                    data: values,
                    backgroundColor: window.chartManager.getColorPalette()
                }]
            };
            
            window.chartManager.createBarChart(chartData, { title });
        }
    }

    /**
     * Cria gráfico a partir de objeto com métricas
     */
    createChartFromObject(title, data) {
        const keys = Object.keys(data).filter(key => typeof data[key] === 'number');
        
        if (keys.length > 0) {
            const chartData = {
                labels: keys.map(key => this.getFieldLabel(key)),
                datasets: [{
                    label: title,
                    data: keys.map(key => data[key]),
                    backgroundColor: window.chartManager.getColorPalette()
                }]
            };
            
            window.chartManager.createBarChart(chartData, { title });
        }
    }

    /**
     * Fallback categórico melhorado
     */
    generateCategoricalFallback(data, responseData) {
        console.log('📊 Usando fallback categórico melhorado');
        
        const keys = Object.keys(data).filter(key => {
            const value = data[key];
            return typeof value === 'number' || 
                   (typeof value === 'string' && !isNaN(parseFloat(value)));
        });
        
        if (keys.length > 0) {
            const chartData = {
                labels: keys.map(key => this.getFieldLabel(key)),
                datasets: [{
                    label: 'Valores',
                    data: keys.map(key => {
                        const value = data[key];
                        return typeof value === 'number' ? value : parseFloat(value) || 0;
                    }),
                    backgroundColor: window.chartManager.getColorPalette()
                }]
            };
            
            window.chartManager.createBarChart(chartData, {
                title: responseData.title || 'Dados Categóricos'
            });
        }
    }

    /**
     * Obtém label amigável para campo
     */
    getFieldLabel(field) {
        const labels = {
            powerConsumption: 'Consumo de Energia (kWh)',
            temp: 'Temperatura (°C)',
            pressure: 'Pressão (bar)',
            flow: 'Fluxo (L/min)',
            energyConsumption: 'Consumo de Energia',
            waterConsumption: 'Consumo de Água',
            gasConsumption: 'Consumo de Gás',
            deviceCount: 'Quantidade de Dispositivos',
            leakCount: 'Vazamentos',
            uptimePercentage: 'Uptime (%)'
        };
        
        return labels[field] || field.charAt(0).toUpperCase() + field.slice(1);
    }

    /**
     * Obtém cor para campo
     */
    getFieldColor(field) {
        const colors = {
            powerConsumption: '#FF6B6B',
            temp: '#FFA500',
            pressure: '#4ECDC4',
            flow: '#45B7D1',
            energyConsumption: '#FF6B6B',
            waterConsumption: '#4ECDC4',
            gasConsumption: '#45B7D1'
        };
        
        return colors[field] || '#6366F1';
    }

    /**
     * Exibe dados brutos
     */
    displayRawData(data) {
        const rawDataContent = document.getElementById('rawDataContent');
        if (rawDataContent) {
            rawDataContent.textContent = JSON.stringify(data, null, 2);
        }
    }

    /**
     * Limpa todos os resultados da interface
     */
    clearResults() {
        // Limpar cards de métricas
        const metricsCards = document.getElementById('metricsCards');
        if (metricsCards) {
            metricsCards.innerHTML = '';
        }

        // Limpar gráficos
        const chartsContainer = document.getElementById('chartsContainer');
        if (chartsContainer) {
            chartsContainer.innerHTML = '';
        }

        // Limpar dados brutos
        const rawDataContent = document.getElementById('rawDataContent');
        if (rawDataContent) {
            rawDataContent.textContent = '';
        }

        // Esconder seções
        this.hideResults();
        this.hideError();
        this.hideDeviceReport();
    }

    /**
     * Processa relatório de dispositivo específico
     */
    async processDeviceReport() {
        if (this.isLoading) return;

        const deviceType = document.getElementById('deviceTypeSelect').value;
        const deviceId = document.getElementById('deviceIdInput').value.trim();
        const reportType = document.getElementById('reportTypeSelect').value;

        // Validação
        if (!deviceType || !deviceId || !reportType) {
            this.showError('Por favor, preencha todos os campos obrigatórios.');
            return;
        }

        // Validar formato do device ID
        if (!this.validateDeviceId(deviceType, deviceId)) {
            return;
        }

        console.log('📱 Processando relatório de dispositivo:', { deviceType, deviceId, reportType });

        // Mostrar loading
        this.setDeviceReportLoading(true);
        this.hideError();
        this.hideResults();

        try {
            // Fazer requisição para o backend
            const response = await fetch(`${window.mcpClient.baseURL}/device-report`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    deviceType,
                    deviceId,
                    reportType
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erro ao gerar relatório');
            }

            console.log('📄 Relatório gerado:', data);

            // Exibir relatório
            this.displayDeviceReport(data);

        } catch (error) {
            console.error('❌ Erro ao processar relatório:', error);
            this.handleDeviceReportError(error);
        } finally {
            this.setDeviceReportLoading(false);
        }
    }

    /**
     * Valida o formato do device ID
     */
    validateDeviceId(deviceType, deviceId) {
        const patterns = {
            'lighting': /^LIGHT-\d{6}$/,
            'water': /^WATER-\d{6}$/,
            'gas': /^GAS-\d{6}$/
        };

        const pattern = patterns[deviceType];
        if (pattern && !pattern.test(deviceId.toUpperCase())) {
            const examples = {
                'lighting': 'LIGHT-000001',
                'water': 'WATER-000001', 
                'gas': 'GAS-000001'
            };
            
            this.showError(`Formato inválido do ID. Use o formato: ${examples[deviceType]}`);
            return false;
        }

        return true;
    }

    /**
     * Define estado de loading do botão de relatório
     */
    setDeviceReportLoading(isLoading) {
        const button = document.getElementById('deviceReportBtn');
        const btnText = button?.querySelector('.btn-text');
        const btnLoading = button?.querySelector('.btn-loading');

        if (button && btnText && btnLoading) {
            this.isLoading = isLoading;
            button.disabled = isLoading;

            if (isLoading) {
                btnText.style.display = 'none';
                btnLoading.style.display = 'inline';
                btnLoading.classList.remove('hidden');
            } else {
                btnText.style.display = 'inline';
                btnLoading.style.display = 'none';
                btnLoading.classList.add('hidden');
            }
        }
    }

    /**
     * Exibe o relatório de dispositivo
     */
    displayDeviceReport(reportData) {
        const reportDisplay = document.getElementById('deviceReportDisplay');
        const reportTitle = document.getElementById('deviceReportTitle');
        const reportText = document.getElementById('deviceReportText');

        if (!reportDisplay || !reportTitle || !reportText) {
            console.error('Elementos de exibição de relatório não encontrados');
            return;
        }

        // Configurar título
        const deviceTypeLabel = this.getDeviceTypeLabel(reportData.deviceType);
        const reportTypeLabel = this.getReportTypeLabel(reportData.reportType);
        reportTitle.textContent = `📱 ${reportTypeLabel} - ${reportData.deviceId}`;

        // Configurar conteúdo
        reportText.textContent = reportData.report;

        // Armazenar dados para ações posteriores
        this.currentReport = reportData;

        // Mostrar a seção de resultados (necessário porque o deviceReportDisplay está dentro dela)
        this.showResults();

        // Mostrar relatório
        reportDisplay.style.display = 'block';

        // Scroll suave para o relatório
        reportDisplay.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });

        console.log('📄 Relatório exibido com sucesso');
    }

    /**
     * Trata erros de relatório de dispositivo
     */
    handleDeviceReportError(error) {
        let message = 'Erro ao gerar relatório do dispositivo';

        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            message = '🔌 Não foi possível conectar ao servidor. Verifique se o backend está rodando.';
        } else if (error.message.includes('timeout')) {
            message = '⏱️ Timeout na geração do relatório. Tente novamente.';
        } else if (error.message.includes('não encontrado')) {
            message = '🔍 Dispositivo não encontrado. Verifique o ID informado.';
        } else if (error.message) {
            message = '❌ ' + error.message;
        }

        this.showError(message);
    }

    /**
     * Copia o relatório para a área de transferência
     */
    async copyReportToClipboard() {
        if (!this.currentReport) {
            this.showError('Nenhum relatório disponível para copiar');
            return;
        }

        try {
            await navigator.clipboard.writeText(this.currentReport.report);
            
            // Feedback visual
            const copyBtn = document.getElementById('copyReportBtn');
            const originalText = copyBtn.textContent;
            copyBtn.textContent = '✅ Copiado!';
            copyBtn.style.background = '#10b981';
            
            setTimeout(() => {
                copyBtn.textContent = originalText;
                copyBtn.style.background = '';
            }, 2000);

            console.log('📋 Relatório copiado para área de transferência');

        } catch (error) {
            console.error('Erro ao copiar:', error);
            this.showError('Erro ao copiar relatório para área de transferência');
        }
    }

    /**
     * Baixa o relatório como arquivo TXT
     */
    downloadReport() {
        if (!this.currentReport) {
            this.showError('Nenhum relatório disponível para download');
            return;
        }

        try {
            const filename = `relatorio_${this.currentReport.deviceId}_${this.currentReport.reportType}_${new Date().toISOString().split('T')[0]}.txt`;
            
            const blob = new Blob([this.currentReport.report], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            // Feedback visual
            const downloadBtn = document.getElementById('downloadReportBtn');
            const originalText = downloadBtn.textContent;
            downloadBtn.textContent = '✅ Baixado!';
            downloadBtn.style.background = '#10b981';
            
            setTimeout(() => {
                downloadBtn.textContent = originalText;
                downloadBtn.style.background = '';
            }, 2000);

            console.log('💾 Relatório baixado:', filename);

        } catch (error) {
            console.error('Erro ao baixar:', error);
            this.showError('Erro ao baixar relatório');
        }
    }

    /**
     * Fecha o relatório de dispositivo
     */
    closeDeviceReport() {
        const reportDisplay = document.getElementById('deviceReportDisplay');
        if (reportDisplay) {
            reportDisplay.style.display = 'none';
        }
        
        this.currentReport = null;
        console.log('📱 Relatório de dispositivo fechado');
    }

    /**
     * Esconde o relatório de dispositivo
     */
    hideDeviceReport() {
        const reportDisplay = document.getElementById('deviceReportDisplay');
        if (reportDisplay) {
            reportDisplay.style.display = 'none';
        }
    }

    /**
     * Obter label do tipo de dispositivo
     */
    getDeviceTypeLabel(deviceType) {
        const labels = {
            'lighting': '🔆 Iluminação',
            'water': '💧 Água',
            'gas': '🔥 Gás'
        };
        return labels[deviceType] || deviceType;
    }

    /**
     * Obter label do tipo de relatório
     */
    getReportTypeLabel(reportType) {
        const labels = {
            'full': '🔍 Relatório Completo',
            'health': '🏥 Saúde do Dispositivo',
            'telemetry': '📊 Telemetria',
            'maintenance': '🔧 Manutenção'
        };
        return labels[reportType] || reportType;
    }

    /**
     * Mostra a seção de resultados
     */
    showResults() {
        const resultsSection = document.getElementById('resultsSection');
        if (resultsSection) {
            resultsSection.style.display = 'block';
            // Smooth scroll para os resultados
            resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    /**
     * Esconde a seção de resultados
     */
    hideResults() {
        const resultsSection = document.getElementById('resultsSection');
        if (resultsSection) {
            resultsSection.style.display = 'none';
        }
    }

    /**
     * Mostra erro
     */
    showError(message) {
        const errorSection = document.getElementById('errorSection');
        const errorMessage = document.getElementById('errorMessage');
        
        if (errorSection && errorMessage) {
            errorMessage.textContent = message;
            errorSection.style.display = 'block';
            // Smooth scroll para o erro
            errorSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    /**
     * Esconde erro
     */
    hideError() {
        const errorSection = document.getElementById('errorSection');
        if (errorSection) {
            errorSection.style.display = 'none';
        }
    }

    /**
     * Define estado de loading
     */
    setLoading(loading) {
        this.isLoading = loading;
        
        const submitBtn = document.getElementById('submitBtn');
        const btnText = submitBtn?.querySelector('.btn-text');
        const btnLoading = submitBtn?.querySelector('.btn-loading');
        
        if (submitBtn) {
            submitBtn.disabled = loading;
            
            if (btnText && btnLoading) {
                if (loading) {
                    btnText.classList.add('hidden');
                    btnLoading.classList.remove('hidden');
                } else {
                    btnText.classList.remove('hidden');
                    btnLoading.classList.add('hidden');
                }
            }
        }

        // Loading state visual para toda a interface
        const promptCard = document.querySelector('.prompt-card');
        if (promptCard) {
            if (loading) {
                promptCard.classList.add('loading');
            } else {
                promptCard.classList.remove('loading');
            }
        }
    }

    /**
     * Alterna entre tema claro e escuro
     */
    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme();
        this.saveTheme();
    }

    /**
     * Aplica o tema atual
     */
    applyTheme() {
        const body = document.body;
        const themeBtn = document.getElementById('themeToggle');
        
        if (this.currentTheme === 'dark') {
            body.setAttribute('data-theme', 'dark');
            if (themeBtn) themeBtn.textContent = '☀️';
        } else {
            body.removeAttribute('data-theme');
            if (themeBtn) themeBtn.textContent = '🌙';
        }

        // Atualiza gráficos para o novo tema
        if (window.chartManager) {
            setTimeout(() => {
                window.chartManager.updateTheme();
            }, 100);
        }
    }

    /**
     * Carrega tema salvo
     */
    loadTheme() {
        const savedTheme = localStorage.getItem('smartcities-theme');
        if (savedTheme && ['light', 'dark'].includes(savedTheme)) {
            this.currentTheme = savedTheme;
        }
        this.applyTheme();
    }

    /**
     * Salva tema atual
     */
    saveTheme() {
        localStorage.setItem('smartcities-theme', this.currentTheme);
    }

    /**
     * Testa conexão com o backend
     */
    async testBackendConnection() {
        try {
            const result = await window.mcpClient.testConnection();
            if (result.success) {
                console.log('✅ Conexão com backend OK');
            } else {
                console.warn('⚠️ Erro de conexão:', result.message);
                this.showError('Erro de conexão com o servidor. Verifique se o backend está rodando na porta 3001.');
            }
        } catch (error) {
            console.error('❌ Erro ao testar conexão:', error);
        }
    }

    /**
     * Testa conectividade completa com backend e MCP
     */
    async testConnectivity() {
        const testBtn = document.getElementById('testConnection');
        const testIcon = testBtn?.querySelector('.test-icon');
        const testText = testBtn?.querySelector('.test-text');
        
        if (!testBtn) return;

        // Estado de loading
        testBtn.classList.add('loading');
        testBtn.classList.remove('success', 'error');
        if (testIcon) testIcon.textContent = '🔄';
        if (testText) testText.textContent = 'Testando...';

        try {
            // Testar backend
            const backendResponse = await fetch('http://localhost:3001/api/health');
            if (!backendResponse.ok) {
                throw new Error('Backend indisponível');
            }

            // Testar MCP
            const mcpResponse = await fetch('http://localhost:3001/api/test-mcp');
            const mcpResult = await mcpResponse.json();

            if (mcpResult.success) {
                // Sucesso total
                testBtn.classList.remove('loading', 'error');
                testBtn.classList.add('success');
                if (testIcon) testIcon.textContent = '✅';
                if (testText) testText.textContent = `OK (${mcpResult.data.toolsCount} tools)`;
                
                console.log('✅ Conectividade OK:', mcpResult.data);
                
                // Resetar após 3 segundos
                setTimeout(() => {
                    testBtn.classList.remove('success');
                    if (testIcon) testIcon.textContent = '📶';
                    if (testText) testText.textContent = 'Status';
                }, 3000);
            } else {
                throw new Error('MCP indisponível: ' + mcpResult.error);
            }

        } catch (error) {
            // Erro
            testBtn.classList.remove('loading', 'success');
            testBtn.classList.add('error');
            if (testIcon) testIcon.textContent = '❌';
            if (testText) testText.textContent = 'Erro';
            
            console.error('❌ Erro no teste de conectividade:', error);
            
            // Resetar após 5 segundos
            setTimeout(() => {
                testBtn.classList.remove('error');
                if (testIcon) testIcon.textContent = '📶';
                if (testText) testText.textContent = 'Status';
            }, 5000);
        }
    }

    /**
     * Utilitários para debug
     */
    debug() {
        return {
            app: this,
            mcpClient: window.mcpClient,
            chartManager: window.chartManager,
            currentTheme: this.currentTheme,
            isLoading: this.isLoading
        };
    }
}

// Inicializa a aplicação quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    window.app = new SmartCitiesApp();
    
    // Expõe para debug no console
    window.debug = () => window.app.debug();
    
    console.log('🚀 Smart Cities Dashboard carregado');
    console.log('💡 Digite debug() no console para informações de debug');
});
