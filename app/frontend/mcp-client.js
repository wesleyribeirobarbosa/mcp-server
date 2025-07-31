/**
 * MCP Client - Comunicação HTTP com servidor backend
 * Cliente simplificado para Smart Cities Dashboard
 */

class MCPClient {
    constructor() {
        this.baseURL = 'http://localhost:3001/api';
        this.setupAxios();
    }

    /**
     * Configura o cliente Axios
     */
    setupAxios() {
        // Configuração global do Axios
        axios.defaults.timeout = 60000; // 30 segundos
        axios.defaults.headers.common['Content-Type'] = 'application/json';
        
        // Interceptor para requests
        axios.interceptors.request.use(
            (config) => {
                console.log('🚀 Request:', config.method?.toUpperCase(), config.url);
                return config;
            },
            (error) => {
                console.error('❌ Request Error:', error);
                return Promise.reject(error);
            }
        );

        // Interceptor para responses
        axios.interceptors.response.use(
            (response) => {
                console.log('✅ Response:', response.status, response.config.url);
                return response;
            },
            (error) => {
                console.error('❌ Response Error:', error.response?.status, error.response?.data || error.message);
                return Promise.reject(error);
            }
        );
    }

    /**
     * Processa um prompt do usuário
     */
    async processPrompt(prompt) {
        try {
            const response = await axios.post(`${this.baseURL}/prompt`, {
                prompt: prompt.trim()
            });

            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: this.handleError(error),
                message: error.response?.data?.message || 'Erro ao processar prompt'
            };
        }
    }

    /**
     * Lista dispositivos de iluminação
     */
    async listLightingDevices(limit = 10, offset = 0) {
        try {
            const response = await axios.get(`${this.baseURL}/lighting/devices`, {
                params: { limit, offset }
            });

            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: this.handleError(error),
                message: 'Erro ao listar dispositivos de iluminação'
            };
        }
    }

    /**
     * Obtém telemetria de iluminação
     */
    async getLightingTelemetry(deviceId, hours = 24) {
        try {
            const response = await axios.get(`${this.baseURL}/lighting/telemetry`, {
                params: { deviceId, hours }
            });

            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: this.handleError(error),
                message: 'Erro ao obter telemetria de iluminação'
            };
        }
    }

    /**
     * Analisa consumo de energia
     */
    async analyzeEnergyConsumption(timeRange = '7d', region = null) {
        try {
            const params = { timeRange };
            if (region) params.region = region;

            const response = await axios.get(`${this.baseURL}/energy/consumption`, {
                params
            });

            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: this.handleError(error),
                message: 'Erro ao analisar consumo de energia'
            };
        }
    }

    /**
     * Detecta vazamentos de água
     */
    async detectWaterLeaks(region = null, severity = null) {
        try {
            const params = {};
            if (region) params.region = region;
            if (severity) params.severity = severity;

            const response = await axios.get(`${this.baseURL}/water/leaks`, {
                params
            });

            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: this.handleError(error),
                message: 'Erro ao detectar vazamentos de água'
            };
        }
    }

    /**
     * Analisa consumo de gás
     */
    async analyzeGasConsumption(timeRange = '7d', region = null) {
        try {
            const params = { timeRange };
            if (region) params.region = region;

            const response = await axios.get(`${this.baseURL}/gas/consumption`, {
                params
            });

            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: this.handleError(error),
                message: 'Erro ao analisar consumo de gás'
            };
        }
    }

    /**
     * Obtém dashboard da cidade
     */
    async getCityDashboard(timeRange = 'day', includeAlerts = true) {
        try {
            const response = await axios.get(`${this.baseURL}/dashboard/city`, {
                params: { timeRange, includeAlerts }
            });

            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: this.handleError(error),
                message: 'Erro ao obter dashboard da cidade'
            };
        }
    }

    /**
     * Obtém estatísticas regionais
     */
    async getRegionalStatistics(timeRange = 'week') {
        try {
            const response = await axios.get(`${this.baseURL}/statistics/regional`, {
                params: { timeRange }
            });

            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: this.handleError(error),
                message: 'Erro ao obter estatísticas regionais'
            };
        }
    }

    /**
     * Obtém relatório de saúde dos dispositivos
     */
    async getDeviceHealthReport() {
        try {
            const response = await axios.get(`${this.baseURL}/devices/health`);

            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: this.handleError(error),
                message: 'Erro ao obter relatório de saúde dos dispositivos'
            };
        }
    }

    /**
     * Predição de manutenção
     */
    async predictMaintenance(deviceType = null, urgencyLevel = null) {
        try {
            const params = {};
            if (deviceType) params.deviceType = deviceType;
            if (urgencyLevel) params.urgencyLevel = urgencyLevel;

            const response = await axios.get(`${this.baseURL}/maintenance/predict`, {
                params
            });

            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: this.handleError(error),
                message: 'Erro ao predizer manutenção'
            };
        }
    }

    /**
     * Detecção de anomalias
     */
    async getAnomalyDetection(timeRange = '24h', deviceType = null) {
        try {
            const params = { timeRange };
            if (deviceType) params.deviceType = deviceType;

            const response = await axios.get(`${this.baseURL}/anomalies/detect`, {
                params
            });

            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: this.handleError(error),
                message: 'Erro ao detectar anomalias'
            };
        }
    }

    /**
     * Relatório de eficiência energética
     */
    async getEnergyEfficiencyReport(timeRange = 'month') {
        try {
            const response = await axios.get(`${this.baseURL}/energy/efficiency`, {
                params: { timeRange }
            });

            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: this.handleError(error),
                message: 'Erro ao obter relatório de eficiência energética'
            };
        }
    }

    /**
     * Relatório de qualidade da água
     */
    async getWaterQualityReport(region = null, timeRange = 'week') {
        try {
            const params = { timeRange };
            if (region) params.region = region;

            const response = await axios.get(`${this.baseURL}/water/quality`, {
                params
            });

            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: this.handleError(error),
                message: 'Erro ao obter relatório de qualidade da água'
            };
        }
    }

    /**
     * Análise correlacionada entre dispositivos
     */
    async getCrossDeviceAnalysis(timeRange = 'day', includeCorrelations = true) {
        try {
            const response = await axios.get(`${this.baseURL}/analysis/cross-device`, {
                params: { timeRange, includeCorrelations }
            });

            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: this.handleError(error),
                message: 'Erro ao obter análise correlacionada'
            };
        }
    }

    /**
     * Testa conectividade com o servidor
     */
    async testConnection() {
        try {
            const response = await axios.get(`${this.baseURL}/health`);
            return {
                success: true,
                data: response.data,
                message: 'Conexão com servidor OK'
            };
        } catch (error) {
            return {
                success: false,
                error: this.handleError(error),
                message: 'Erro de conexão com servidor'
            };
        }
    }

    /**
     * Trata erros das requisições HTTP
     */
    handleError(error) {
        if (error.response) {
            // Erro com resposta do servidor
            return {
                type: 'server_error',
                status: error.response.status,
                data: error.response.data,
                message: error.response.data?.message || `Erro ${error.response.status}`
            };
        } else if (error.request) {
            // Erro de rede
            return {
                type: 'network_error',
                message: 'Erro de conexão com o servidor. Verifique se o backend está rodando.'
            };
        } else {
            // Erro na configuração da requisição
            return {
                type: 'config_error',
                message: error.message || 'Erro na configuração da requisição'
            };
        }
    }

    /**
     * Formata dados para exibição nos cards de métricas
     */
    formatMetricsData(data) {
        if (!data || !data.metrics) return [];

        return Object.entries(data.metrics).map(([key, value]) => ({
            label: this.formatMetricLabel(key),
            value: this.formatMetricValue(value),
            icon: this.getMetricIcon(key),
            color: this.getMetricColor(key)
        }));
    }

    /**
     * Formata labels de métricas para exibição
     */
    formatMetricLabel(key) {
        const labels = {
            'total_devices': 'Total de Dispositivos',
            'active_devices': 'Dispositivos Ativos',
            'energy_consumption': 'Consumo de Energia',
            'water_leaks': 'Vazamentos Detectados',
            'gas_consumption': 'Consumo de Gás',
            'efficiency_score': 'Score de Eficiência',
            'alerts_count': 'Alertas Ativos',
            'avg_response_time': 'Tempo de Resposta'
        };
        return labels[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    /**
     * Formata valores de métricas para exibição
     */
    formatMetricValue(value) {
        if (typeof value === 'number') {
            if (value > 1000000) {
                return `${(value / 1000000).toFixed(1)}M`;
            } else if (value > 1000) {
                return `${(value / 1000).toFixed(1)}K`;
            }
            return value.toLocaleString();
        }
        return value;
    }

    /**
     * Retorna ícone para tipos de métricas
     */
    getMetricIcon(key) {
        const icons = {
            'total_devices': '📱',
            'active_devices': '✅',
            'energy_consumption': '⚡',
            'water_leaks': '💧',
            'gas_consumption': '🔥',
            'efficiency_score': '📊',
            'alerts_count': '⚠️',
            'avg_response_time': '⏱️'
        };
        return icons[key] || '📈';
    }

    /**
     * Retorna cor para tipos de métricas
     */
    getMetricColor(key) {
        const colors = {
            'total_devices': '#3182ce',
            'active_devices': '#38a169',
            'energy_consumption': '#d69e2e',
            'water_leaks': '#e53e3e',
            'gas_consumption': '#dd6b20',
            'efficiency_score': '#805ad5',
            'alerts_count': '#e53e3e',
            'avg_response_time': '#319795'
        };
        return colors[key] || '#3182ce';
    }
}

// Exporta instância global do cliente MCP
window.mcpClient = new MCPClient();
