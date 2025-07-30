// Carregar variáveis de ambiente
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const mcpBridge = require('./mcp-bridge');
const openRouterAPI = require('./openrouter-api');
const ChartStandards = require('./chart-standards');

const app = express();
const PORT = process.env.PORT || 3001;

// Instância global dos padrões de gráficos
const chartStandards = new ChartStandards();

// Configuração CORS mais específica
const corsOptions = {
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:3001', 'http://127.0.0.1:3001', 'http://localhost:5500', 'http://127.0.0.1:5500', 'http://localhost:8080', 'http://127.0.0.1:8080'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Servir arquivos estáticos do frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Headers adicionais para CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// Logging simples
const log = (message) => {
    console.log(`[${new Date().toISOString()}] ${message}`);
};

// Função para processar dados MCP para visualização
function processDataForVisualization(mcpResult, mcpAction) {
    try {
        const charts = [];
        const cards = [];
        
        // Verificar se há dados nos resultados
        if (!mcpResult || !mcpResult.content) {
            return { charts, cards };
        }

        const content = mcpResult.content[0];
        if (!content || !content.text) {
            return { charts, cards };
        }

        // Tentar parsear dados JSON do resultado
        let data;
        try {
            data = JSON.parse(content.text);
        } catch (e) {
            // Se não for JSON, retornar estrutura básica
            return {
                charts: [],
                cards: [{
                    title: 'Resultado',
                    value: content.text.substring(0, 200) + '...',
                    type: 'text'
                }]
            };
        }

        // Processar dados baseado no tipo de ferramenta
        switch (mcpAction.tool) {
            case 'getCityDashboard':
                return processCityDashboardData(data);
            
            case 'analyzeEnergyConsumption':
                return processEnergyConsumptionData(data);
            
            case 'detectWaterLeaks':
                return processWaterLeaksData(data);
            
            case 'getRegionalStatistics':
                return processRegionalStatisticsData(data);
            
            case 'listLightingDevices':
                return processLightingDevicesData(data);
            
            case 'predictMaintenance':
                return processPredictMaintenanceData(data);
            
            case 'getEnergyEfficiencyReport':
                return processEnergyEfficiencyData(data);
            
            default:
                return processGenericData(data);
        }
        
    } catch (error) {
        log(`Erro ao processar dados para visualização: ${error.message}`);
        return { charts: [], cards: [] };
    }
}

// Processadores específicos para cada tipo de dados
function processCityDashboardData(data) {
    const charts = [];
    const cards = [];
    
    // Dados do dashboard têm estrutura: { overview: { lighting, water, gas }, totals, alerts }
    if (data.overview) {
        // Cards de resumo
        if (data.overview.lighting) {
            cards.push({
                title: 'Dispositivos de Iluminação',
                value: data.overview.lighting.deviceCount || 0,
                type: 'number',
                icon: 'lightbulb',
                subtitle: `Consumo: ${chartStandards.formatters.energy(data.overview.lighting.totalEnergyConsumption || 0)}`,
                color: chartStandards.colors.energy
            });
        }
        
        if (data.overview.water) {
            const leakCount = data.overview.water.leakCount || 0;
            cards.push({
                title: 'Dispositivos de Água',
                value: data.overview.water.deviceCount || 0,
                type: 'number',
                icon: 'droplet',
                subtitle: `Vazamentos: ${leakCount}`,
                status: leakCount > 0 ? 'danger' : 'success',
                color: chartStandards.colors.water
            });
        }
        
        if (data.overview.gas) {
            const leakCount = data.overview.gas.leakCount || 0;
            cards.push({
                title: 'Dispositivos de Gás',
                value: data.overview.gas.deviceCount || 0,
                type: 'number',
                icon: 'flame',
                subtitle: `Vazamentos: ${leakCount}`,
                status: leakCount > 0 ? 'danger' : 'success',
                color: chartStandards.colors.gas
            });
        }

        // Card de totais
        if (data.totals) {
            cards.push({
                title: 'Total de Dispositivos',
                value: data.totals.devices || 0,
                type: 'number',
                icon: 'activity',
                color: chartStandards.colors.devices
            });
        }
    }

    // Gráfico de consumo por tipo usando template padronizado
    if (data.totals) {
        const consumptionChartData = {
            labels: ['Energia (kWh)', 'Água (L)', 'Gás (m³)'],
            datasets: [{
                label: 'Consumo Total',
                data: [
                    data.totals.energyConsumption || 0,
                    data.totals.waterConsumption || 0,
                    data.totals.gasConsumption || 0
                ]
            }]
        };
        
        const consumptionChart = chartStandards.createChartConfig(
            'cityDashboard.consumption', 
            consumptionChartData
        );
        charts.push(consumptionChart);
    }

    // Gráfico de distribuição de dispositivos usando template padronizado
    if (data.overview) {
        const distributionChartData = {
            labels: ['Iluminação', 'Água', 'Gás'],
            datasets: [{
                data: [
                    data.overview.lighting?.deviceCount || 0,
                    data.overview.water?.deviceCount || 0,
                    data.overview.gas?.deviceCount || 0
                ]
            }]
        };
        
        const distributionChart = chartStandards.createChartConfig(
            'cityDashboard.distribution', 
            distributionChartData
        );
        charts.push(distributionChart);
    }

    // Gráfico de alertas usando template padronizado (se existirem)
    if (data.alerts && (data.alerts.critical?.length > 0 || data.alerts.warning?.length > 0 || data.alerts.info?.length > 0)) {
        const alertsChartData = {
            labels: ['Críticos', 'Avisos', 'Informativos'],
            datasets: [{
                data: [
                    data.alerts.critical?.length || 0,
                    data.alerts.warning?.length || 0,
                    data.alerts.info?.length || 0
                ]
            }]
        };
        
        const alertsChart = chartStandards.createChartConfig(
            'cityDashboard.alerts', 
            alertsChartData
        );
        charts.push(alertsChart);
    }
    
    return { charts, cards };
}

function processEnergyConsumptionData(data) {
    const charts = [];
    const cards = [];
    
    if (data.totalConsumption) {
        cards.push({
            title: 'Consumo Total',
            value: chartStandards.formatters.energy(data.totalConsumption),
            type: 'text',
            icon: 'zap',
            color: chartStandards.colors.energy
        });
    }
    
    if (data.trend && Array.isArray(data.trend)) {
        const trendChartData = {
            labels: data.trend.map(item => chartStandards.formatters.date(item.timestamp)),
            datasets: [{
                label: 'Consumo (kWh)',
                data: data.trend.map(item => item.consumption)
            }]
        };
        
        const trendChart = chartStandards.createChartConfig(
            'energy.trend', 
            trendChartData
        );
        charts.push(trendChart);
    }
    
    return { charts, cards };
}

function processWaterLeaksData(data) {
    const charts = [];
    const cards = [];
    
    // Processar dados de vazamentos com estrutura: { leaks: [...], total: number, ... }
    if (data.leaks && Array.isArray(data.leaks)) {
        const leakCount = data.leaks.length;
        
        // Card principal com número de vazamentos
        cards.push({
            title: 'Vazamentos Detectados',
            value: leakCount,
            type: 'number',
            icon: 'alert-triangle',
            status: leakCount > 0 ? 'danger' : 'success',
            color: chartStandards.getContextualColor('status', leakCount > 0 ? 'danger' : 'success'),
            subtitle: `Total de registros: ${data.total || leakCount}`
        });

        // Card com total de dispositivos afetados
        const uniqueDevices = new Set(data.leaks.map(leak => leak.deviceId));
        cards.push({
            title: 'Dispositivos Afetados',
            value: uniqueDevices.size,
            type: 'number',
            icon: 'droplet',
            color: chartStandards.colors.water
        });

        // Gráfico de vazamentos por dispositivo (top 10)
        if (data.leaks.length > 0) {
            const deviceLeakCounts = {};
            data.leaks.forEach(leak => {
                deviceLeakCounts[leak.deviceId] = (deviceLeakCounts[leak.deviceId] || 0) + 1;
            });

            const sortedDevices = Object.entries(deviceLeakCounts)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 10);

            if (sortedDevices.length > 0) {
                const deviceChartData = {
                    labels: sortedDevices.map(([deviceId]) => deviceId),
                    datasets: [{
                        label: 'Vazamentos por Dispositivo',
                        data: sortedDevices.map(([, count]) => count)
                    }]
                };
                
                const deviceChart = chartStandards.createChartConfig(
                    'waterLeaks.byDevice', 
                    deviceChartData
                );
                charts.push(deviceChart);
            }
        }

        // Análise temporal dos vazamentos se houver dados suficientes
        if (data.leaks.length > 1) {
            // Agrupar vazamentos por dia
            const leaksByDay = {};
            data.leaks.forEach(leak => {
                const date = new Date(leak.timestamp * 1000);
                const dayKey = date.toISOString().split('T')[0];
                leaksByDay[dayKey] = (leaksByDay[dayKey] || 0) + 1;
            });

            const sortedDays = Object.entries(leaksByDay).sort(([a], [b]) => a.localeCompare(b));
            
            if (sortedDays.length > 1) {
                const timelineChartData = {
                    labels: sortedDays.map(([day]) => chartStandards.formatters.date(new Date(day).getTime() / 1000)),
                    datasets: [{
                        label: 'Vazamentos por Dia',
                        data: sortedDays.map(([, count]) => count)
                    }]
                };
                
                const timelineChart = chartStandards.createChartConfig(
                    'waterLeaks.timeline', 
                    timelineChartData
                );
                charts.push(timelineChart);
            }
        }

        // Card com informações adicionais se houver paginação
        if (data.hasNext) {
            cards.push({
                title: 'Dados Parciais',
                value: `${data.offset + data.leaks.length}/${data.total}`,
                type: 'text',
                icon: 'info',
                subtitle: 'Existem mais resultados disponíveis',
                color: chartStandards.colors.info
            });
        }
    } else if (data.leaksDetected !== undefined) {
        // Fallback para estrutura antiga
        const leakCount = data.leaksDetected;
        cards.push({
            title: 'Vazamentos Detectados',
            value: leakCount,
            type: 'number',
            icon: 'alert-triangle',
            status: leakCount > 0 ? 'danger' : 'success',
            color: chartStandards.getContextualColor('status', leakCount > 0 ? 'danger' : 'success')
        });
    }
    
    return { charts, cards };
}

function processRegionalStatisticsData(data) {
    const charts = [];
    const cards = [];
    
    if (data.regions && Array.isArray(data.regions)) {
        charts.push({
            type: 'bar',
            title: 'Estatísticas por Região',
            data: {
                labels: data.regions.map(r => r.name),
                datasets: [{
                    label: 'Dispositivos',
                    data: data.regions.map(r => r.totalDevices),
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            }
        });
    }
    
    return { charts, cards };
}

function processLightingDevicesData(data) {
    const charts = [];
    const cards = [];
    
    if (data.devices && Array.isArray(data.devices)) {
        cards.push({
            title: 'Total de Dispositivos',
            value: data.devices.length,
            type: 'number',
            icon: 'lightbulb'
        });
        
        const activeDevices = data.devices.filter(d => d.status === 'active').length;
        cards.push({
            title: 'Dispositivos Ativos',
            value: activeDevices,
            type: 'number',
            icon: 'check-circle',
            status: 'success'
        });
    }
    
    return { charts, cards };
}

function processGenericData(data) {
    const cards = [];
    
    // Tentar extrair informações básicas
    if (typeof data === 'object') {
        Object.keys(data).slice(0, 4).forEach(key => {
            const value = data[key];
            if (typeof value === 'number' || typeof value === 'string') {
                cards.push({
                    title: key.charAt(0).toUpperCase() + key.slice(1),
                    value: value,
                    type: typeof value
                });
            }
        });
    }
    
    return { charts: [], cards };
}

// Rota de saúde
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Rota de saúde para API (compatibilidade com frontend)
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Rota principal para processar prompts
app.post('/api/prompt', async (req, res) => {
    try {
        const { prompt } = req.body;
        
        // Validação de entrada
        if (!prompt) {
            return res.status(400).json({ 
                success: false,
                error: 'Prompt é obrigatório' 
            });
        }

        if (prompt.length > 1000) {
            return res.status(400).json({ 
                success: false,
                error: 'Prompt muito longo (máximo 1000 caracteres)' 
            });
        }

        log(`Recebido prompt: ${prompt}`);

        // 1. Processar prompt com OpenRouter para determinar ferramenta MCP
        const mcpAction = await openRouterAPI.processPrompt(prompt);
        log(`Ação MCP determinada: ${JSON.stringify(mcpAction)}`);

        // 2. Validar ferramenta antes de executar
        await mcpBridge.validateTool(mcpAction.tool);

        // 3. Executar ferramenta MCP via ponte
        const mcpResult = await mcpBridge.executeTool(mcpAction.tool, mcpAction.params);
        log(`Resultado MCP obtido`);

        // 4. Processar dados para visualização
        const processedData = processDataForVisualization(mcpResult, mcpAction);

        // 5. Retornar dados estruturados para frontend
        res.json({
            success: true,
            prompt: prompt,
            mcpAction: mcpAction,
            data: mcpResult,
            processedData: processedData,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        log(`Erro ao processar prompt: ${error.message}`);
        
        // Determinar tipo de erro para resposta apropriada
        let statusCode = 500;
        let errorType = 'internal_error';
        
        if (error.message.includes('não encontrada')) {
            statusCode = 404;
            errorType = 'tool_not_found';
        } else if (error.message.includes('Timeout')) {
            statusCode = 408;
            errorType = 'timeout';
        } else if (error.message.includes('conexão')) {
            statusCode = 503;
            errorType = 'service_unavailable';
        }

        res.status(statusCode).json({
            success: false,
            error: 'Erro ao processar prompt',
            errorType: errorType,
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Rota para listar ferramentas MCP disponíveis
app.get('/api/tools', async (req, res) => {
    try {
        const tools = await mcpBridge.listTools();
        res.json({ 
            success: true,
            tools,
            count: tools.length 
        });
    } catch (error) {
        log(`Erro ao listar ferramentas: ${error.message}`);
        res.status(500).json({ 
            success: false,
            error: 'Erro ao listar ferramentas',
            message: error.message 
        });
    }
});

// Rota para testar conectividade MCP
app.get('/api/test-mcp', async (req, res) => {
    try {
        const testResult = await mcpBridge.testConnection();
        
        if (testResult.success) {
            res.json({
                success: true,
                message: 'Conectividade MCP OK',
                data: testResult
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Falha na conectividade MCP',
                error: testResult.error
            });
        }
    } catch (error) {
        log(`Erro no teste MCP: ${error.message}`);
        res.status(500).json({
            success: false,
            error: 'Erro interno no teste MCP',
            message: error.message
        });
    }
});

// Rota para servir o frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Rota para health check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Servidor funcionando',
        timestamp: new Date().toISOString()
    });
});

// Inicializar servidor
app.listen(PORT, async () => {
    log(`Servidor Express rodando na porta ${PORT}`);
    
    // Inicializar ponte MCP
    try {
        await mcpBridge.initialize();
        log('Ponte MCP inicializada com sucesso');
    } catch (error) {
        log(`Erro ao inicializar ponte MCP: ${error.message}`);
    }
});

// Função para processar dados de predição de manutenção
function processPredictMaintenanceData(data) {
    const charts = [];
    const cards = [];
    
    // Cards de resumo
    if (data.summary) {
        cards.push({
            title: 'Dispositivos em Risco',
            value: data.summary.totalDevicesAtRisk || 0,
            type: 'number',
            icon: 'alert-triangle',
            status: 'warning',
            color: chartStandards.colors.warning
        });

        cards.push({
            title: 'Manutenção Urgente',
            value: data.summary.urgentMaintenance || 0,
            type: 'number',
            icon: 'alert-circle',
            status: 'danger',
            color: chartStandards.colors.danger
        });
    }

    // Gráfico de distribuição de risco por tipo usando template padronizado
    if (data.summary && data.summary.byType) {
        const riskByTypeData = {
            labels: data.summary.byType.map(item => 
                item.type.charAt(0).toUpperCase() + item.type.slice(1)
            ),
            datasets: [{
                label: 'Dispositivos em Risco',
                data: data.summary.byType.map(item => item.count)
            }]
        };
        
        const riskChart = chartStandards.createChartConfig(
            'maintenance.riskByType', 
            riskByTypeData
        );
        charts.push(riskChart);
    }

    // Gráfico de top dispositivos com maior risco usando template padronizado
    if (data.predictions) {
        const allDevices = [];
        data.predictions.forEach(typeGroup => {
            if (typeGroup.devices && typeGroup.devices.length > 0) {
                typeGroup.devices.slice(0, 10).forEach(device => {
                    allDevices.push({
                        id: device.deviceId,
                        risk: device.maintenanceRisk,
                        type: typeGroup.type
                    });
                });
            }
        });

        // Ordenar por risco e pegar os top 10
        allDevices.sort((a, b) => b.risk - a.risk);
        const topRiskyDevices = allDevices.slice(0, 10);

        if (topRiskyDevices.length > 0) {
            const topDevicesData = {
                labels: topRiskyDevices.map(device => device.id),
                datasets: [{
                    label: 'Risco de Manutenção (%)',
                    data: topRiskyDevices.map(device => device.risk)
                }]
            };
            
            const topDevicesChart = chartStandards.createChartConfig(
                'maintenance.topRiskyDevices', 
                topDevicesData
            );
            charts.push(topDevicesChart);
        }
    }

    return { charts, cards };
}

// Função para processar dados de eficiência energética
function processEnergyEfficiencyData(data) {
    const charts = [];
    const cards = [];
    
    // Cards de resumo
    if (data.summary) {
        cards.push({
            title: 'Dispositivos Analisados',
            value: data.summary.totalDevices || 0,
            type: 'number',
            icon: 'activity',
            color: chartStandards.colors.devices
        });

        cards.push({
            title: 'Consumo Total',
            value: chartStandards.formatters.energy(data.summary.totalEnergyConsumption || 0),
            type: 'text',
            icon: 'zap',
            color: chartStandards.colors.energy
        });

        const avgEfficiency = data.summary.avgEfficiencyScore || 0;
        cards.push({
            title: 'Eficiência Média',
            value: chartStandards.formatters.percentage(avgEfficiency),
            type: 'text',
            icon: 'trending-up',
            status: avgEfficiency > 80 ? 'success' : 
                   avgEfficiency > 60 ? 'warning' : 'danger',
            color: chartStandards.getContextualColor('status', 
                avgEfficiency > 80 ? 'success' : 
                avgEfficiency > 60 ? 'warning' : 'danger')
        });
    }

    // Gráfico de eficiência por região usando template padronizado
    if (data.regionalAnalysis && data.regionalAnalysis.length > 0) {
        const regionalChartData = {
            labels: data.regionalAnalysis.map(region => region.region),
            datasets: [{
                label: 'Eficiência (%)',
                data: data.regionalAnalysis.map(region => region.avgEfficiency)
            }]
        };
        
        const regionalChart = chartStandards.createChartConfig(
            'efficiency.regional', 
            regionalChartData
        );
        charts.push(regionalChart);
    }

    // Gráfico de melhores vs piores performers usando template padronizado
    if (data.summary && data.summary.bestPerformers && data.summary.worstPerformers) {
        const performanceChartData = {
            labels: ['Melhores', 'Piores'],
            datasets: [{
                label: 'Eficiência Média (%)',
                data: [
                    data.summary.bestPerformers.reduce((sum, device) => sum + device.efficiencyScore, 0) / data.summary.bestPerformers.length,
                    data.summary.worstPerformers.reduce((sum, device) => sum + device.efficiencyScore, 0) / data.summary.worstPerformers.length
                ]
            }]
        };
        
        const performanceChart = chartStandards.createChartConfig(
            'efficiency.performance', 
            performanceChartData
        );
        charts.push(performanceChart);
    }

    return { charts, cards };
}

module.exports = app;
