/**
 * Padrões e configurações para gráficos do Smart Cities Dashboard
 * Define cores, formatação, escalas e tipos apropriados para cada contexto
 */

class ChartStandards {
    constructor() {
        this.initializeStandards();
    }

    initializeStandards() {
        // Paleta de cores contextual
        this.colors = {
            // Cores principais por categoria
            energy: '#FCD34D',      // Amarelo/Dourado - Energia
            water: '#3B82F6',       // Azul - Água  
            gas: '#EF4444',         // Vermelho - Gás
            devices: '#10B981',     // Verde - Dispositivos
            alerts: '#F59E0B',      // Laranja - Alertas
            
            // Estados e status
            success: '#10B981',     // Verde
            warning: '#F59E0B',     // Laranja
            danger: '#EF4444',      // Vermelho
            info: '#3B82F6',        // Azul
            
            // Gradações para gráficos
            primary: ['#3B82F6', '#1D4ED8', '#1E40AF'],
            secondary: ['#10B981', '#059669', '#047857'],
            accent: ['#F59E0B', '#D97706', '#B45309'],
            
            // Paleta completa para múltiplas séries
            palette: [
                '#3B82F6', // Azul
                '#10B981', // Verde
                '#F59E0B', // Laranja
                '#EF4444', // Vermelho
                '#8B5CF6', // Roxo
                '#06B6D4', // Ciano
                '#84CC16', // Lima
                '#F97316', // Laranja escuro
                '#EC4899', // Rosa
                '#6B7280'  // Cinza
            ]
        };

        // Formatters para diferentes tipos de dados
        this.formatters = {
            // Valores numéricos
            number: (value) => value.toLocaleString('pt-BR'),
            
            // Porcentagem
            percentage: (value) => `${value.toFixed(1)}%`,
            
            // Energia (kWh)
            energy: (value) => `${value.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} kWh`,
            
            // Consumo de água (L)
            water: (value) => `${value.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} L`,
            
            // Consumo de gás (m³)
            gas: (value) => `${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} m³`,
            
            // Pressão (bar)
            pressure: (value) => `${value.toFixed(2)} bar`,
            
            // Temperatura (°C)
            temperature: (value) => `${value.toFixed(1)}°C`,
            
            // Tempo (horas)
            hours: (value) => `${value.toFixed(1)}h`,
            
            // Data e hora
            datetime: (timestamp) => {
                if (typeof timestamp === 'number') {
                    return new Date(timestamp * 1000).toLocaleString('pt-BR');
                }
                return new Date(timestamp).toLocaleString('pt-BR');
            },
            
            // Data apenas
            date: (timestamp) => {
                if (typeof timestamp === 'number') {
                    return new Date(timestamp * 1000).toLocaleDateString('pt-BR');
                }
                return new Date(timestamp).toLocaleDateString('pt-BR');
            },

            // Vazamentos
            leaks: (value) => `${value} vazamento${value !== 1 ? 's' : ''}`,
            
            // Dispositivos
            devices: (value) => `${value} dispositivo${value !== 1 ? 's' : ''}`
        };

        // Configurações por tipo de gráfico
        this.chartTypes = {
            // Gráficos de linha - para dados temporais
            line: {
                suitable: ['time_series', 'trends', 'continuous_data'],
                defaultOptions: {
                    responsive: true,
                    maintainAspectRatio: false,
                    tension: 0.3,
                    fill: false,
                    pointRadius: 3,
                    pointHoverRadius: 6
                }
            },
            
            // Gráficos de barras - para comparações categóricas
            bar: {
                suitable: ['comparisons', 'categories', 'rankings'],
                defaultOptions: {
                    responsive: true,
                    maintainAspectRatio: false,
                    borderRadius: 4,
                    borderWidth: 1
                }
            },
            
            // Gráficos de barras horizontais - para rankings
            horizontalBar: {
                suitable: ['rankings', 'top_lists', 'comparisons'],
                defaultOptions: {
                    responsive: true,
                    maintainAspectRatio: false,
                    indexAxis: 'y',
                    borderRadius: 4,
                    borderWidth: 1
                }
            },
            
            // Gráficos de pizza/rosca - para distribuições
            doughnut: {
                suitable: ['distributions', 'proportions', 'parts_of_whole'],
                defaultOptions: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '60%',
                    hoverOffset: 6
                }
            },
            
            // Gráficos de área - para dados cumulativos
            area: {
                suitable: ['cumulative_data', 'stacked_data', 'filled_trends'],
                defaultOptions: {
                    responsive: true,
                    maintainAspectRatio: false,
                    tension: 0.4,
                    fill: true,
                    stacked: true
                }
            }
        };

        // Templates de gráficos por contexto
        this.templates = {
            // Dashboard da cidade
            cityDashboard: {
                consumption: {
                    type: 'bar',
                    title: 'Consumo por Tipo de Recurso',
                    colors: [this.colors.energy, this.colors.water, this.colors.gas],
                    formatter: 'number',
                    yAxisLabel: 'Consumo'
                },
                distribution: {
                    type: 'doughnut',
                    title: 'Distribuição de Dispositivos',
                    colors: [this.colors.energy, this.colors.water, this.colors.gas],
                    formatter: 'number'
                },
                alerts: {
                    type: 'doughnut',
                    title: 'Status dos Alertas',
                    colors: [this.colors.danger, this.colors.warning, this.colors.info],
                    formatter: 'number'
                }
            },
            
            // Predição de manutenção
            maintenance: {
                riskByType: {
                    type: 'bar',
                    title: 'Dispositivos em Risco por Tipo',
                    colors: [this.colors.energy, this.colors.water, this.colors.gas],
                    formatter: 'number',
                    yAxisLabel: 'Quantidade de Dispositivos'
                },
                topRiskyDevices: {
                    type: 'horizontalBar',
                    title: 'Top 10 Dispositivos com Maior Risco',
                    colorFunction: (risk) => {
                        if (risk >= 95) return this.colors.danger;
                        if (risk >= 85) return this.colors.warning; 
                        return this.colors.info;
                    },
                    formatter: 'percentage',
                    xAxisLabel: 'Risco de Manutenção (%)'
                }
            },
            
            // Eficiência energética
            efficiency: {
                regional: {
                    type: 'bar',
                    title: 'Eficiência Energética por Região',
                    colors: [this.colors.success],
                    formatter: 'percentage',
                    yAxisLabel: 'Eficiência (%)'
                },
                performance: {
                    type: 'bar',
                    title: 'Comparação de Performance',
                    colors: [this.colors.success, this.colors.danger],
                    formatter: 'percentage',
                    yAxisLabel: 'Eficiência Média (%)'
                }
            },
            
            // Análise de energia
            energy: {
                trend: {
                    type: 'line',
                    title: 'Tendência de Consumo Energético',
                    colors: [this.colors.energy],
                    formatter: 'energy',
                    yAxisLabel: 'Consumo (kWh)'
                },
                comparison: {
                    type: 'bar',
                    title: 'Comparação de Consumo',
                    colors: this.colors.primary,
                    formatter: 'energy',
                    yAxisLabel: 'Consumo (kWh)'
                }
            },
            
            // Análise de água
            water: {
                leaks: {
                    type: 'bar',
                    title: 'Vazamentos por Região',
                    colors: [this.colors.danger],
                    formatter: 'number',
                    yAxisLabel: 'Número de Vazamentos'
                },
                consumption: {
                    type: 'line',
                    title: 'Consumo de Água ao Longo do Tempo',
                    colors: [this.colors.water],
                    formatter: 'water',
                    yAxisLabel: 'Consumo (L)'
                }
            },

            // Vazamentos de água
            waterLeaks: {
                byDevice: {
                    type: 'horizontalBar',
                    title: 'Top 10 Dispositivos com Mais Vazamentos',
                    colors: [this.colors.danger],
                    formatter: 'number',
                    xAxisLabel: 'Número de Vazamentos'
                },
                timeline: {
                    type: 'line',
                    title: 'Vazamentos ao Longo do Tempo',
                    colors: [this.colors.danger],
                    formatter: 'number',
                    yAxisLabel: 'Número de Vazamentos'
                },
                byRegion: {
                    type: 'bar',
                    title: 'Vazamentos por Região',
                    colors: [this.colors.danger],
                    formatter: 'number',
                    yAxisLabel: 'Número de Vazamentos'
                }
            }
        };
    }

    /**
     * Cria configuração padronizada para um gráfico
     */
    createChartConfig(templateKey, data, options = {}) {
        const template = this.getTemplate(templateKey);
        if (!template) {
            throw new Error(`Template '${templateKey}' não encontrado`);
        }

        const config = {
            type: template.type,
            title: options.title || template.title,
            data: this.formatChartData(data, template, options)
        };

        // Adicionar configurações completas de Chart.js
        config.options = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: config.title,
                    color: '#1F2937',
                    font: {
                        size: 16,
                        weight: 'bold'
                    },
                    padding: {
                        top: 10,
                        bottom: 30
                    }
                },
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: '#374151',
                        padding: 20,
                        usePointStyle: template.type === 'doughnut' || template.type === 'pie'
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
                    callbacks: {
                        label: (context) => {
                            const label = context.dataset.label || '';
                            const value = context.parsed.y !== undefined ? context.parsed.y : context.parsed;
                            
                            if (template.formatter && this.formatters[template.formatter]) {
                                return `${label}: ${this.formatters[template.formatter](value)}`;
                            }
                            return `${label}: ${value.toLocaleString('pt-BR')}`;
                        }
                    }
                }
            }
        };

        // Configurações específicas para gráficos de barras
        if (template.type === 'bar' || template.type === 'horizontalBar') {
            config.options.scales = this.generateAxisConfig(template).scales;
            
            // Configurações específicas para barras horizontais
            if (template.type === 'horizontalBar') {
                config.options.indexAxis = 'y';
                config.options.elements = {
                    bar: {
                        borderWidth: 1,
                        borderRadius: 4
                    }
                };
            }
        }

        // Configurações específicas para gráficos de linha
        if (template.type === 'line') {
            config.options.scales = this.generateAxisConfig(template).scales;
            config.options.elements = {
                line: {
                    tension: 0.3
                },
                point: {
                    radius: 4,
                    hoverRadius: 6
                }
            };
        }

        // Configurações específicas para gráficos de pizza/doughnut
        if (template.type === 'doughnut' || template.type === 'pie') {
            config.options.cutout = template.type === 'doughnut' ? '60%' : 0;
            config.options.plugins.legend.position = 'right';
            
            // Configurar tooltips para mostrar percentual
            config.options.plugins.tooltip.callbacks = {
                label: (context) => {
                    const label = context.label || '';
                    const value = context.parsed;
                    const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
                    const percentage = ((value / total) * 100).toFixed(1);
                    
                    if (template.formatter && this.formatters[template.formatter]) {
                        return `${label}: ${this.formatters[template.formatter](value)} (${percentage}%)`;
                    }
                    return `${label}: ${value.toLocaleString('pt-BR')} (${percentage}%)`;
                }
            };
        }

        return config;
    }

    /**
     * Obtém template por chave
     */
    getTemplate(templateKey) {
        const keys = templateKey.split('.');
        let template = this.templates;
        
        for (const key of keys) {
            template = template[key];
            if (!template) return null;
        }
        
        return template;
    }

    /**
     * Formata dados para Chart.js seguindo o template
     */
    formatChartData(data, template, options = {}) {
        const chartData = {
            labels: data.labels || [],
            datasets: []
        };

        if (!data.datasets || !Array.isArray(data.datasets)) {
            console.warn('Dados inválidos para gráfico:', data);
            return chartData;
        }

        chartData.datasets = data.datasets.map((dataset, index) => {
            const formattedDataset = {
                label: dataset.label || 'Dados',
                data: dataset.data || [],
                // Configurações padrão para responsividade
                responsive: true,
                maintainAspectRatio: false
            };

            // Aplicar cores baseadas no template
            if (template.colors) {
                if (typeof template.colorFunction === 'function') {
                    // Função personalizada de cor baseada no valor
                    formattedDataset.backgroundColor = dataset.data.map(value => 
                        template.colorFunction.call(this, value)
                    );
                    formattedDataset.borderColor = formattedDataset.backgroundColor;
                } else if (Array.isArray(template.colors)) {
                    // Array de cores
                    if (template.type === 'doughnut' || template.type === 'pie') {
                        formattedDataset.backgroundColor = template.colors;
                        formattedDataset.borderColor = template.colors.map(color => color);
                        formattedDataset.borderWidth = 1;
                        formattedDataset.cutout = '60%';
                        formattedDataset.hoverOffset = 6;
                    } else {
                        formattedDataset.backgroundColor = template.colors[index % template.colors.length];
                        formattedDataset.borderColor = template.colors[index % template.colors.length];
                        formattedDataset.borderWidth = 1;
                        if (template.type === 'bar' || template.type === 'horizontalBar') {
                            formattedDataset.borderRadius = 4;
                        }
                    }
                } else {
                    // Cor única
                    formattedDataset.backgroundColor = template.colors;
                    formattedDataset.borderColor = template.colors;
                    formattedDataset.borderWidth = 1;
                }
            } else {
                // Usar paleta padrão
                const color = this.colors.palette[index % this.colors.palette.length];
                formattedDataset.backgroundColor = color;
                formattedDataset.borderColor = color;
                formattedDataset.borderWidth = 1;
            }

            // Aplicar configurações específicas do tipo de gráfico
            const chartTypeConfig = this.chartTypes[template.type];
            if (chartTypeConfig && chartTypeConfig.defaultOptions) {
                Object.assign(formattedDataset, chartTypeConfig.defaultOptions);
            }

            // Configurações específicas por tipo
            if (template.type === 'horizontalBar') {
                formattedDataset.indexAxis = 'y';
            }

            return formattedDataset;
        });

        return chartData;
    }

    /**
     * Gera configurações de eixos baseadas no template
     */
    generateAxisConfig(template) {
        const config = {
            scales: {
                x: {
                    title: {
                        display: !!template.xAxisLabel,
                        text: template.xAxisLabel || ''
                    }
                },
                y: {
                    title: {
                        display: !!template.yAxisLabel,
                        text: template.yAxisLabel || ''
                    },
                    ticks: {
                        callback: (value) => {
                            if (template.formatter && this.formatters[template.formatter]) {
                                return this.formatters[template.formatter](value);
                            }
                            return value.toLocaleString('pt-BR');
                        }
                    }
                }
            }
        };

        // Configurações específicas para gráficos horizontais
        if (template.type === 'horizontalBar') {
            config.scales = {
                x: config.scales.y,
                y: config.scales.x
            };
        }

        return config;
    }

    /**
     * Obtém cor contextual baseada no tipo de dados
     */
    getContextualColor(context, value = null) {
        switch (context) {
            case 'energy':
                return this.colors.energy;
            case 'water':
                return this.colors.water;
            case 'gas':
                return this.colors.gas;
            case 'devices':
                return this.colors.devices;
            case 'risk':
                if (value >= 95) return this.colors.danger;
                if (value >= 85) return this.colors.warning;
                return this.colors.info;
            case 'status':
                if (value === 'success') return this.colors.success;
                if (value === 'warning') return this.colors.warning;
                if (value === 'danger') return this.colors.danger;
                return this.colors.info;
            default:
                return this.colors.palette[0];
        }
    }
}

module.exports = ChartStandards; 