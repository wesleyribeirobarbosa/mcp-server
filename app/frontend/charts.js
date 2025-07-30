/**
 * Charts.js - Configuração e gerenciamento de gráficos Chart.js
 * Sistema de gráficos simples para Smart Cities Dashboard
 */

class ChartManager {
    constructor() {
        this.charts = new Map();
        this.chartContainer = null;
        this.initChartDefaults();
    }

    /**
     * Inicializa configurações padrão do Chart.js
     */
    initChartDefaults() {
        // Configuração global do Chart.js
        Chart.defaults.font.family = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif';
        Chart.defaults.color = getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim();
        Chart.defaults.borderColor = getComputedStyle(document.documentElement).getPropertyValue('--border-color').trim();
        Chart.defaults.backgroundColor = 'rgba(99, 179, 237, 0.1)';
        
        // Plugin para tema responsivo
        Chart.register({
            id: 'themeResponsive',
            beforeUpdate: (chart) => {
                const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim();
                const borderColor = getComputedStyle(document.documentElement).getPropertyValue('--border-color').trim();
                
                chart.options.scales.x.ticks.color = textColor;
                chart.options.scales.y.ticks.color = textColor;
                chart.options.scales.x.grid.color = borderColor;
                chart.options.scales.y.grid.color = borderColor;
                chart.options.plugins.legend.labels.color = textColor;
            }
        });
    }

    /**
     * Define o container onde os gráficos serão renderizados
     */
    setContainer(container) {
        this.chartContainer = container;
    }

    /**
     * Limpa todos os gráficos existentes
     */
    clearCharts() {
        // Destroi todos os gráficos Chart.js
        this.charts.forEach(chart => {
            chart.destroy();
        });
        this.charts.clear();
        
        // Limpa o HTML do container
        if (this.chartContainer) {
            this.chartContainer.innerHTML = '';
        }
    }

    /**
     * Cria um gráfico de linha para dados temporais
     */
    createLineChart(data, options = {}) {
        const chartId = `chart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const chartElement = this.createChartElement(chartId, options.title || 'Gráfico de Linha');
        
        const ctx = chartElement.querySelector('canvas').getContext('2d');
        
        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels || [],
                datasets: data.datasets.map(dataset => ({
                    label: dataset.label || 'Dados',
                    data: dataset.data || [],
                    borderColor: dataset.color || '#3182ce',
                    backgroundColor: dataset.color ? `${dataset.color}20` : '#3182ce20',
                    borderWidth: 2,
                    fill: options.fill || false,
                    tension: 0.3,
                    pointBackgroundColor: dataset.color || '#3182ce',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }))
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: {
                        display: data.datasets.length > 1,
                        position: 'top',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: '#3182ce',
                        borderWidth: 1,
                        cornerRadius: 8,
                        padding: 12
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: true,
                            drawBorder: false
                        },
                        ticks: {
                            maxTicksLimit: 8
                        }
                    },
                    y: {
                        grid: {
                            display: true,
                            drawBorder: false
                        },
                        beginAtZero: options.beginAtZero !== false,
                        ticks: {
                            callback: function(value) {
                                return options.yAxisFormatter ? 
                                    options.yAxisFormatter(value) : 
                                    value.toLocaleString();
                            }
                        }
                    }
                },
                ...options.chartOptions
            }
        });

        this.charts.set(chartId, chart);
        return chart;
    }

    /**
     * Cria um gráfico de barras para comparações
     */
    createBarChart(data, options = {}) {
        const chartId = `chart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const chartElement = this.createChartElement(chartId, options.title || 'Gráfico de Barras');
        
        const ctx = chartElement.querySelector('canvas').getContext('2d');
        
        const chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.labels || [],
                datasets: data.datasets.map((dataset, index) => ({
                    label: dataset.label || 'Dados',
                    data: dataset.data || [],
                    backgroundColor: dataset.color || this.getColorPalette()[index % this.getColorPalette().length],
                    borderColor: dataset.color || this.getColorPalette()[index % this.getColorPalette().length],
                    borderWidth: 1,
                    borderRadius: 4,
                    borderSkipped: false
                }))
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: data.datasets.length > 1,
                        position: 'top',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: '#3182ce',
                        borderWidth: 1,
                        cornerRadius: 8,
                        padding: 12
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false,
                            drawBorder: false
                        }
                    },
                    y: {
                        grid: {
                            display: true,
                            drawBorder: false
                        },
                        beginAtZero: options.beginAtZero !== false,
                        ticks: {
                            callback: function(value) {
                                return options.yAxisFormatter ? 
                                    options.yAxisFormatter(value) : 
                                    value.toLocaleString();
                            }
                        }
                    }
                },
                ...options.chartOptions
            }
        });

        this.charts.set(chartId, chart);
        return chart;
    }

    /**
     * Cria um gráfico de pizza para distribuições
     */
    createPieChart(data, options = {}) {
        const chartId = `chart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const chartElement = this.createChartElement(chartId, options.title || 'Gráfico de Pizza');
        
        const ctx = chartElement.querySelector('canvas').getContext('2d');
        
        const chart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: data.labels || [],
                datasets: [{
                    data: data.values || [],
                    backgroundColor: data.colors || this.getColorPalette(),
                    borderColor: '#ffffff',
                    borderWidth: 2,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '60%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: '#3182ce',
                        borderWidth: 1,
                        cornerRadius: 8,
                        padding: 12,
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${label}: ${value.toLocaleString()} (${percentage}%)`;
                            }
                        }
                    }
                },
                ...options.chartOptions
            }
        });

        this.charts.set(chartId, chart);
        return chart;
    }

    /**
     * Cria um gráfico de área para dados cumulativos
     */
    createAreaChart(data, options = {}) {
        return this.createLineChart(data, {
            ...options,
            fill: true,
            chartOptions: {
                ...options.chartOptions,
                elements: {
                    line: {
                        tension: 0.4
                    }
                }
            }
        });
    }

    /**
     * Cria o elemento HTML do gráfico
     */
    createChartElement(chartId, title) {
        const chartCard = document.createElement('div');
        chartCard.className = 'chart-card';
        chartCard.innerHTML = `
            <h3 class="chart-title">${title}</h3>
            <div class="chart-wrapper">
                <canvas id="${chartId}"></canvas>
            </div>
        `;
        
        if (this.chartContainer) {
            this.chartContainer.appendChild(chartCard);
        }
        
        return chartCard;
    }

    /**
     * Retorna paleta de cores para gráficos
     */
    getColorPalette() {
        return [
            '#3182ce', // Azul
            '#38a169', // Verde
            '#d69e2e', // Amarelo
            '#e53e3e', // Vermelho
            '#805ad5', // Roxo
            '#dd6b20', // Laranja
            '#319795', // Teal
            '#d53f8c'  // Rosa
        ];
    }

    /**
     * Converte dados do MCP para formato Chart.js
     */
    convertMCPData(mcpData, chartType = 'line') {
        if (!mcpData || !mcpData.data) {
            return { labels: [], datasets: [] };
        }

        // Formato esperado do MCP
        if (mcpData.charts && mcpData.charts.length > 0) {
            // Se já vem formatado para Chart.js
            return mcpData.charts[0].data;
        }

        // Conversão automática baseada na estrutura dos dados
        const data = mcpData.data;
        
        if (Array.isArray(data)) {
            // Array de objetos com timestamp e valores
            const labels = data.map(item => {
                if (item.timestamp) {
                    return new Date(item.timestamp * 1000).toLocaleDateString();
                }
                return item.label || item.name || '';
            });

            const datasets = [{
                label: mcpData.label || 'Dados',
                data: data.map(item => item.value || item.count || 0),
                borderColor: '#3182ce',
                backgroundColor: '#3182ce20'
            }];

            return { labels, datasets };
        }

        // Objeto com múltiplas séries
        if (typeof data === 'object') {
            const series = Object.keys(data);
            const labels = [];
            const datasets = [];

            series.forEach((seriesName, index) => {
                const seriesData = data[seriesName];
                if (Array.isArray(seriesData)) {
                    // Primeira série define os labels
                    if (index === 0) {
                        labels.push(...seriesData.map(item => 
                            item.label || item.timestamp ? 
                            new Date(item.timestamp * 1000).toLocaleDateString() : 
                            item.name || ''
                        ));
                    }

                    datasets.push({
                        label: seriesName,
                        data: seriesData.map(item => item.value || item.count || 0),
                        borderColor: this.getColorPalette()[index % this.getColorPalette().length],
                        backgroundColor: this.getColorPalette()[index % this.getColorPalette().length] + '20'
                    });
                }
            });

            return { labels, datasets };
        }

        return { labels: [], datasets: [] };
    }

    /**
     * Atualiza tema dos gráficos quando tema da página muda
     */
    updateTheme() {
        this.charts.forEach(chart => {
            chart.update();
        });
    }

    /**
     * Redimensiona todos os gráficos
     */
    resizeCharts() {
        this.charts.forEach(chart => {
            chart.resize();
        });
    }

    /**
     * Cria um gráfico com configuração completa
     */
    createChart(canvasId, config) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.error('Canvas não encontrado:', canvasId);
            return null;
        }

        const ctx = canvas.getContext('2d');
        
        // Destruir gráfico anterior se existir
        if (this.charts.has(canvasId)) {
            this.charts.get(canvasId).destroy();
        }

        try {
            const chart = new Chart(ctx, config);
            this.charts.set(canvasId, chart);
            
            console.log(`✅ Gráfico criado: ${canvasId} (${config.type})`);
            return chart;
        } catch (error) {
            console.error('❌ Erro ao criar gráfico:', error);
            return null;
        }
    }
}

// Exporta instância global do gerenciador de gráficos
window.chartManager = new ChartManager();
