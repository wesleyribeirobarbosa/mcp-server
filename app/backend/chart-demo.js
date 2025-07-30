/**
 * Demonstração das melhorias na formatação de gráficos
 * Este arquivo mostra exemplos de como os dados dos gráficos são formatados
 */

const ChartStandards = require('./chart-standards');

class ChartDemo {
    constructor() {
        this.chartStandards = new ChartStandards();
    }

    /**
     * Exemplo de dashboard da cidade formatado
     */
    generateCityDashboardExample() {
        // Dados simulados do dashboard
        const mockData = {
            overview: {
                lighting: {
                    deviceCount: 500,
                    totalEnergyConsumption: 1596538.03,
                    avgTemperature: 25,
                    uptimePercentage: 89.59
                },
                water: {
                    deviceCount: 500,
                    totalConsumption: 2175779.5,
                    avgPressure: 3.48,
                    leakCount: 276,
                    lowBatteryCount: 0
                },
                gas: {
                    deviceCount: 500,
                    totalConsumption: 96767.3,
                    avgPressure: 0.75,
                    leakCount: 111,
                    lowBatteryCount: 0
                }
            },
            totals: {
                devices: 1500,
                energyConsumption: 1596538.03,
                waterConsumption: 2175779.5,
                gasConsumption: 96767.3,
                totalLeaks: 387,
                lowBatteryDevices: 0
            },
            alerts: {
                critical: [
                    {
                        type: "leaks",
                        message: "387 vazamentos detectados",
                        priority: "high"
                    },
                    {
                        type: "lighting_uptime",
                        message: "Uptime da iluminação abaixo de 90%: 89.59%",
                        priority: "high"
                    }
                ],
                warning: [],
                info: []
            }
        };

        // Gráfico de consumo por tipo
        const consumptionChartData = {
            labels: ['Energia (kWh)', 'Água (L)', 'Gás (m³)'],
            datasets: [{
                label: 'Consumo Total',
                data: [
                    mockData.totals.energyConsumption,
                    mockData.totals.waterConsumption,
                    mockData.totals.gasConsumption
                ]
            }]
        };

        const consumptionChart = this.chartStandards.createChartConfig(
            'cityDashboard.consumption',
            consumptionChartData
        );

        // Gráfico de distribuição de dispositivos
        const distributionChartData = {
            labels: ['Iluminação', 'Água', 'Gás'],
            datasets: [{
                data: [
                    mockData.overview.lighting.deviceCount,
                    mockData.overview.water.deviceCount,
                    mockData.overview.gas.deviceCount
                ]
            }]
        };

        const distributionChart = this.chartStandards.createChartConfig(
            'cityDashboard.distribution',
            distributionChartData
        );

        // Gráfico de alertas
        const alertsChartData = {
            labels: ['Críticos', 'Avisos', 'Informativos'],
            datasets: [{
                data: [
                    mockData.alerts.critical.length,
                    mockData.alerts.warning.length,
                    mockData.alerts.info.length
                ]
            }]
        };

        const alertsChart = this.chartStandards.createChartConfig(
            'cityDashboard.alerts',
            alertsChartData
        );

        return {
            charts: [consumptionChart, distributionChart, alertsChart],
            cards: [
                {
                    title: 'Dispositivos de Iluminação',
                    value: mockData.overview.lighting.deviceCount,
                    type: 'number',
                    icon: 'lightbulb',
                    subtitle: `Consumo: ${this.chartStandards.formatters.energy(mockData.overview.lighting.totalEnergyConsumption)}`,
                    color: this.chartStandards.colors.energy
                },
                {
                    title: 'Dispositivos de Água',
                    value: mockData.overview.water.deviceCount,
                    type: 'number',
                    icon: 'droplet',
                    subtitle: `Vazamentos: ${mockData.overview.water.leakCount}`,
                    status: 'danger',
                    color: this.chartStandards.colors.water
                },
                {
                    title: 'Dispositivos de Gás',
                    value: mockData.overview.gas.deviceCount,
                    type: 'number',
                    icon: 'flame',
                    subtitle: `Vazamentos: ${mockData.overview.gas.leakCount}`,
                    status: 'danger',
                    color: this.chartStandards.colors.gas
                },
                {
                    title: 'Total de Dispositivos',
                    value: mockData.totals.devices,
                    type: 'number',
                    icon: 'activity',
                    color: this.chartStandards.colors.devices
                }
            ]
        };
    }

    /**
     * Exemplo de predição de manutenção formatado
     */
    generateMaintenanceExample() {
        const mockData = {
            summary: {
                totalDevicesAtRisk: 868,
                urgentMaintenance: 774,
                byType: [
                    { type: 'lighting', count: 0 },
                    { type: 'water', count: 499 },
                    { type: 'gas', count: 369 }
                ]
            },
            predictions: [
                {
                    type: 'water',
                    devices: [
                        { deviceId: 'WATER-000269', maintenanceRisk: 100 },
                        { deviceId: 'WATER-000043', maintenanceRisk: 100 },
                        { deviceId: 'WATER-000375', maintenanceRisk: 100 },
                        { deviceId: 'WATER-000167', maintenanceRisk: 100 },
                        { deviceId: 'WATER-000197', maintenanceRisk: 100 },
                        { deviceId: 'WATER-000421', maintenanceRisk: 100 },
                        { deviceId: 'WATER-000102', maintenanceRisk: 100 },
                        { deviceId: 'WATER-000311', maintenanceRisk: 100 },
                        { deviceId: 'WATER-000064', maintenanceRisk: 100 },
                        { deviceId: 'WATER-000399', maintenanceRisk: 100 }
                    ]
                }
            ]
        };

        // Gráfico de risco por tipo
        const riskByTypeData = {
            labels: mockData.summary.byType.map(item => 
                item.type.charAt(0).toUpperCase() + item.type.slice(1)
            ),
            datasets: [{
                label: 'Dispositivos em Risco',
                data: mockData.summary.byType.map(item => item.count)
            }]
        };

        const riskChart = this.chartStandards.createChartConfig(
            'maintenance.riskByType',
            riskByTypeData
        );

        // Gráfico de top dispositivos
        const topDevicesData = {
            labels: mockData.predictions[0].devices.map(device => device.deviceId),
            datasets: [{
                label: 'Risco de Manutenção (%)',
                data: mockData.predictions[0].devices.map(device => device.maintenanceRisk)
            }]
        };

        const topDevicesChart = this.chartStandards.createChartConfig(
            'maintenance.topRiskyDevices',
            topDevicesData
        );

        return {
            charts: [riskChart, topDevicesChart],
            cards: [
                {
                    title: 'Dispositivos em Risco',
                    value: mockData.summary.totalDevicesAtRisk,
                    type: 'number',
                    icon: 'alert-triangle',
                    status: 'warning',
                    color: this.chartStandards.colors.warning
                },
                {
                    title: 'Manutenção Urgente',
                    value: mockData.summary.urgentMaintenance,
                    type: 'number',
                    icon: 'alert-circle',
                    status: 'danger',
                    color: this.chartStandards.colors.danger
                }
            ]
        };
    }

    /**
     * Demonstra a formatação completa
     */
    demonstrateFormatting() {
        console.log('🎨 === DEMONSTRAÇÃO DE FORMATAÇÃO DE GRÁFICOS ===\n');

        // Exemplo 1: Dashboard da cidade
        console.log('📊 1. DASHBOARD DA CIDADE');
        const cityExample = this.generateCityDashboardExample();
        console.log('Charts gerados:', cityExample.charts.length);
        console.log('Cards gerados:', cityExample.cards.length);
        
        cityExample.charts.forEach((chart, index) => {
            console.log(`  Chart ${index + 1}:`, {
                type: chart.type,
                title: chart.title,
                hasData: !!chart.data,
                hasOptions: !!chart.options,
                datasets: chart.data?.datasets?.length || 0
            });
        });

        console.log('\n📈 2. PREDIÇÃO DE MANUTENÇÃO');
        const maintenanceExample = this.generateMaintenanceExample();
        console.log('Charts gerados:', maintenanceExample.charts.length);
        console.log('Cards gerados:', maintenanceExample.cards.length);
        
        maintenanceExample.charts.forEach((chart, index) => {
            console.log(`  Chart ${index + 1}:`, {
                type: chart.type,
                title: chart.title,
                hasData: !!chart.data,
                hasOptions: !!chart.options,
                datasets: chart.data?.datasets?.length || 0
            });
        });

        console.log('\n✅ Formatação aplicada com sucesso!');
        console.log('   - Cores contextuais aplicadas');
        console.log('   - Formatadores de dados configurados');
        console.log('   - Tooltips personalizados');
        console.log('   - Escalas e eixos configurados');
        console.log('   - Legendas e títulos estilizados');

        return {
            cityDashboard: cityExample,
            maintenancePrediction: maintenanceExample
        };
    }
}

// Para uso em testes
if (require.main === module) {
    const demo = new ChartDemo();
    demo.demonstrateFormatting();
}

module.exports = ChartDemo;