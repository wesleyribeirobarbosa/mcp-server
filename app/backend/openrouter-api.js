const axios = require('axios');

class OpenRouterAPI {
    constructor() {
        this.apiKey = process.env.OPENROUTER_API_KEY;
        this.baseURL = 'https://openrouter.ai/api/v1';
        
        if (!this.apiKey) {
            console.warn('[OpenRouter] API Key não configurada. Use: export OPENROUTER_API_KEY=your_key');
        }
    }

    // Mapeamento de prompts para ferramentas MCP
    getToolMapping() {
        return {
            // Iluminação
            'luz|iluminação|lâmpada|lighting': {
                tools: ['listLightingDevices', 'getLightingTelemetry', 'analyzeEnergyConsumption']
            },
            
            // Água
            'água|water|vazamento|leak': {
                tools: ['detectWaterLeaks', 'getWaterQualityReport']
            },
            
            // Gás
            'gás|gas': {
                tools: ['analyzeGasConsumption']
            },
            
            // Dashboard/Estatísticas
            'dashboard|cidade|city|estatística|overview': {
                tools: ['getCityDashboard', 'getRegionalStatistics']
            },
            
            // Manutenção
            'manutenção|maintenance|saúde|health': {
                tools: ['predictMaintenance', 'getDeviceHealthReport']
            },
            
            // Anomalias
            'anomalia|problema|erro|alert': {
                tools: ['getAnomalyDetection']
            },
            
            // Eficiência
            'eficiência|efficiency|consumo|consumption': {
                tools: ['getEnergyEfficiencyReport', 'analyzeEnergyConsumption']
            },
            
            // Correlação
            'correlação|análise cruzada|cross': {
                tools: ['getCrossDeviceAnalysis']
            }
        };
    }

    // Análise básica do prompt sem OpenRouter (fallback)
    analyzePromptBasic(prompt) {
        const mapping = this.getToolMapping();
        const promptLower = prompt.toLowerCase();
        
        for (const [keywords, config] of Object.entries(mapping)) {
            const keywordList = keywords.split('|');
            if (keywordList.some(keyword => promptLower.includes(keyword))) {
                const selectedTool = config.tools[0]; // Pegar primeira ferramenta da lista
                const params = this.extractParams(prompt);
                
                return {
                    tool: selectedTool,
                    params: this.addDefaultParams(selectedTool, params),
                    confidence: 0.7,
                    method: 'basic_analysis',
                    originalPrompt: prompt
                };
            }
        }
        
        // Fallback padrão
        return {
            tool: 'getCityDashboard',
            params: this.addDefaultParams('getCityDashboard', {}),
            confidence: 0.5,
            method: 'fallback',
            originalPrompt: prompt
        };
    }

    // Método para adicionar parâmetros padrão baseado na ferramenta
    addDefaultParams(toolName, params = {}) {
        const now = Math.floor(Date.now() / 1000);
        const oneDayAgo = now - (24 * 60 * 60);
        const oneWeekAgo = now - (7 * 24 * 60 * 60);
        const oneMonthAgo = now - (30 * 24 * 60 * 60);

        // Definir períodos padrão baseado no timeRange
        let startTime, endTime;
        if (params.timeRange === 'day' || !params.timeRange) {
            startTime = oneDayAgo;
            endTime = now;
        } else if (params.timeRange === 'week') {
            startTime = oneWeekAgo;
            endTime = now;
        } else if (params.timeRange === 'month') {
            startTime = oneMonthAgo;
            endTime = now;
        }

        // Adicionar parâmetros específicos por ferramenta
        switch (toolName) {
            case 'detectWaterLeaks':
                return {
                    startTime: params.startTime || startTime,
                    endTime: params.endTime || endTime,
                    limit: params.limit || 100,
                    offset: params.offset || 0,
                    ...params
                };

            case 'analyzeEnergyConsumption':
                return {
                    deviceId: params.deviceId,
                    startTime: params.startTime || startTime,
                    endTime: params.endTime || endTime,
                    ...params
                };

            case 'analyzeGasConsumption':
                return {
                    region: params.region,
                    startTime: params.startTime || startTime,
                    endTime: params.endTime || endTime,
                    ...params
                };

            case 'getLightingTelemetry':
                return {
                    deviceId: params.deviceId,
                    startTime: params.startTime || startTime,
                    endTime: params.endTime || endTime,
                    limit: params.limit || 100,
                    offset: params.offset || 0,
                    ...params
                };

            case 'getRegionalStatistics':
                return {
                    regions: params.regions || ['norte', 'sul', 'leste', 'oeste', 'centro'],
                    timeRange: params.timeRange || 'day',
                    includeAlerts: params.includeAlerts !== undefined ? params.includeAlerts : true,
                    ...params
                };

            case 'predictMaintenance':
                return {
                    deviceType: params.deviceType || 'all',
                    predictionDays: params.predictionDays || 30,
                    riskThreshold: params.riskThreshold || 70,
                    ...params
                };

            case 'getAnomalyDetection':
                return {
                    deviceType: params.deviceType || 'all',
                    sensitivity: params.sensitivity || 'medium',
                    timeRange: params.timeRange || 'day',
                    ...params
                };

            case 'getEnergyEfficiencyReport':
                return {
                    startTime: params.startTime || startTime,
                    endTime: params.endTime || endTime,
                    deviceType: params.deviceType || 'lighting',
                    includeRecommendations: params.includeRecommendations !== undefined ? params.includeRecommendations : true,
                    ...params
                };

            case 'getWaterQualityReport':
                return {
                    startTime: params.startTime || startTime,
                    endTime: params.endTime || endTime,
                    region: params.region,
                    includeAlerts: params.includeAlerts !== undefined ? params.includeAlerts : true,
                    ...params
                };

            case 'getCrossDeviceAnalysis':
                return {
                    deviceTypes: params.deviceTypes || ['lighting', 'water', 'gas'],
                    analysisType: params.analysisType || 'correlation',
                    timeRange: params.timeRange || 'day',
                    ...params
                };

            default:
                // Para outras ferramentas, retornar parâmetros como estão
                return params;
        }
    }

    extractParams(prompt) {
        const params = {};
        const promptLower = prompt.toLowerCase();
        
        // Período temporal
        if (promptLower.includes('hoje') || promptLower.includes('day')) {
            params.timeRange = 'day';
        } else if (promptLower.includes('semana') || promptLower.includes('week')) {
            params.timeRange = 'week';
        } else if (promptLower.includes('mês') || promptLower.includes('month')) {
            params.timeRange = 'month';
        }
        
        // Região
        const regions = ['norte', 'sul', 'leste', 'oeste', 'centro', 'sudeste', 'nordeste', 'centro-oeste'];
        for (const region of regions) {
            if (promptLower.includes(region)) {
                params.region = region;
                break;
            }
        }
        
        // Incluir alertas por padrão
        params.includeAlerts = true;
        
        return params;
    }

    // Processar prompt com OpenRouter (quando disponível) ou fallback básico
    async processPrompt(prompt) {
        console.log('[OpenRouter] Processando prompt:', prompt);
        
        // Se não há API key, usar análise básica
        if (!this.apiKey) {
            console.log('[OpenRouter] Usando análise básica (sem API key)');
            return this.analyzePromptBasic(prompt);
        }

        try {
            // Tentar usar OpenRouter API
            const response = await this.callOpenRouter(prompt);
            return this.parseOpenRouterResponse(response, prompt);
            
        } catch (error) {
            console.warn('[OpenRouter] Erro na API, usando fallback:', error.message);
            return this.analyzePromptBasic(prompt);
        }
    }

    async callOpenRouter(prompt) {
        const systemPrompt = `Você é um assistente para análise de dados IoT de cidades inteligentes.

Ferramentas disponíveis:
- listLightingDevices: Lista dispositivos de iluminação
- getLightingTelemetry: Dados de telemetria de iluminação
- analyzeEnergyConsumption: Análise de consumo de energia
- detectWaterLeaks: Detecção de vazamentos de água
- analyzeGasConsumption: Análise de consumo de gás
- getRegionalStatistics: Estatísticas regionais
- getDeviceHealthReport: Relatório de saúde dos dispositivos
- getCityDashboard: Dashboard completo da cidade
- predictMaintenance: Predição de manutenção
- getAnomalyDetection: Detecção de anomalias
- getEnergyEfficiencyReport: Relatório de eficiência energética
- getWaterQualityReport: Relatório de qualidade da água
- getCrossDeviceAnalysis: Análise correlacionada entre dispositivos

Responda APENAS com um JSON no formato:
{
  "tool": "nome_da_ferramenta",
  "params": {
    "timeRange": "day|week|month",
    "region": "opcional",
    "includeAlerts": true
  }
}`;

        const response = await axios.post(`${this.baseURL}/chat/completions`, {
            model: 'meta-llama/llama-3.1-8b-instruct:free',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: prompt }
            ],
            max_tokens: 200,
            temperature: 0.1
        }, {
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });

        return response.data;
    }

    parseOpenRouterResponse(response, originalPrompt) {
        try {
            const content = response.choices[0].message.content;
            const parsed = JSON.parse(content);
            
            return {
                tool: parsed.tool,
                params: this.addDefaultParams(parsed.tool, parsed.params || {}),
                confidence: 0.9,
                method: 'openrouter_api',
                originalPrompt: originalPrompt
            };
            
        } catch (error) {
            console.warn('[OpenRouter] Erro ao parsear resposta, usando fallback');
            return this.analyzePromptBasic(originalPrompt);
        }
    }
}

module.exports = new OpenRouterAPI();
