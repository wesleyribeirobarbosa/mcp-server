// Dados da dashboard obtidos da API MCP
const dashboardData = {
    "timestamp": 1753788130,
    "timeRange": "day",
    "overview": {
        "lighting": {
            "_id": null,
            "deviceCount": 10000,
            "totalEnergyConsumption": 14792773.11,
            "avgTemperature": 25.04,
            "uptimePercentage": 90.03
        },
        "water": {
            "_id": null,
            "deviceCount": 285,
            "totalConsumption": 575941.2,
            "avgPressure": 3.52,
            "leakCount": 65,
            "lowBatteryCount": 0
        },
        "gas": {}
    },
    "totals": {
        "devices": 10285,
        "energyConsumption": 14792773.11,
        "waterConsumption": 575941.2,
        "gasConsumption": 0,
        "totalLeaks": 65,
        "lowBatteryDevices": 0
    },
    "alerts": {
        "critical": [
            {
                "type": "leaks",
                "message": "65 vazamentos detectados",
                "priority": "high"
            }
        ],
        "warning": [],
        "info": []
    }
};

// Função para formatar números
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString('pt-BR');
}

// Função para formatar energia
function formatEnergy(kwh) {
    if (kwh >= 1000000) {
        return (kwh / 1000000).toFixed(1) + 'M kWh';
    } else if (kwh >= 1000) {
        return (kwh / 1000).toFixed(1) + 'K kWh';
    }
    return kwh.toLocaleString('pt-BR') + ' kWh';
}

// Função para formatar volume de água
function formatWater(liters) {
    if (liters >= 1000000) {
        return (liters / 1000000).toFixed(1) + 'M L';
    } else if (liters >= 1000) {
        return (liters / 1000).toFixed(1) + 'K L';
    }
    return liters.toLocaleString('pt-BR') + ' L';
}

// Função para trocar tema
function toggleTheme() {
    const body = document.body;
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);

    const themeIcon = document.querySelector('.theme-toggle i');
    themeIcon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

// Função para carregar tema salvo
function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.setAttribute('data-theme', savedTheme);

    const themeIcon = document.querySelector('.theme-toggle i');
    themeIcon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

// Função para carregar dados na dashboard
function loadDashboardData() {
    // Atualizar timestamp
    const timestamp = new Date(dashboardData.timestamp * 1000);
    document.getElementById('last-update').textContent = timestamp.toLocaleString('pt-BR');

    // Métricas principais
    document.getElementById('total-devices').textContent = formatNumber(dashboardData.totals.devices);
    document.getElementById('energy-consumption').textContent = formatEnergy(dashboardData.totals.energyConsumption);
    document.getElementById('water-consumption').textContent = formatWater(dashboardData.totals.waterConsumption);
    document.getElementById('total-leaks').textContent = dashboardData.totals.totalLeaks;

    // Sistema de Iluminação
    const lighting = dashboardData.overview.lighting;
    if (lighting && lighting.deviceCount) {
        document.getElementById('lighting-devices').textContent = formatNumber(lighting.deviceCount);
        document.getElementById('lighting-energy').textContent = formatEnergy(lighting.totalEnergyConsumption);
        document.getElementById('lighting-temp').textContent = lighting.avgTemperature + '°C';
        document.getElementById('lighting-uptime').textContent = lighting.uptimePercentage + '%';

        // Status baseado no uptime
        const lightingStatus = document.querySelector('#lighting-status .status-text');
        if (lighting.uptimePercentage >= 95) {
            lightingStatus.textContent = 'Excelente';
        } else if (lighting.uptimePercentage >= 90) {
            lightingStatus.textContent = 'Bom';
        } else {
            lightingStatus.textContent = 'Atenção';
        }
    }

    // Sistema de Água
    const water = dashboardData.overview.water;
    if (water && water.deviceCount) {
        document.getElementById('water-devices').textContent = formatNumber(water.deviceCount);
        document.getElementById('water-total').textContent = formatWater(water.totalConsumption);
        document.getElementById('water-pressure').textContent = water.avgPressure + ' bar';
        document.getElementById('water-leaks').textContent = water.leakCount;

        // Status baseado em vazamentos
        const waterStatus = document.querySelector('#water-status .status-text');
        if (water.leakCount === 0) {
            waterStatus.textContent = 'Normal';
        } else if (water.leakCount <= 10) {
            waterStatus.textContent = 'Atenção';
        } else {
            waterStatus.textContent = 'Crítico';
        }
    }

    // Sistema de Gás (inativo)
    document.getElementById('gas-devices').textContent = '0';
    document.getElementById('gas-total').textContent = '0 m³';
    document.getElementById('gas-leaks').textContent = '0';
    document.getElementById('gas-status-text').textContent = 'Offline';
}

// Função para carregar alertas
function loadAlerts() {
    const alertsContainer = document.getElementById('alerts-container');
    const alerts = dashboardData.alerts;

    alertsContainer.innerHTML = '';

    // Alertas críticos
    alerts.critical.forEach(alert => {
        const alertElement = document.createElement('div');
        alertElement.className = 'alert critical';
        alertElement.innerHTML = `
            <i class="fas fa-exclamation-triangle alert-icon"></i>
            <div class="alert-content">
                <h4>Alerta Crítico</h4>
                <p>${alert.message}</p>
            </div>
        `;
        alertsContainer.appendChild(alertElement);
    });

    // Alertas de aviso
    alerts.warning.forEach(alert => {
        const alertElement = document.createElement('div');
        alertElement.className = 'alert warning';
        alertElement.innerHTML = `
            <i class="fas fa-exclamation-circle alert-icon"></i>
            <div class="alert-content">
                <h4>Aviso</h4>
                <p>${alert.message}</p>
            </div>
        `;
        alertsContainer.appendChild(alertElement);
    });

    // Se não há alertas, esconder seção
    if (alerts.critical.length === 0 && alerts.warning.length === 0) {
        document.getElementById('alerts-section').style.display = 'none';
    }
}

// Função para criar gráfico de dispositivos
function createDevicesChart() {
    const ctx = document.getElementById('devicesChart').getContext('2d');

    const lightingCount = dashboardData.overview.lighting?.deviceCount || 0;
    const waterCount = dashboardData.overview.water?.deviceCount || 0;
    const gasCount = 0; // Sistema inativo

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Iluminação', 'Água', 'Gás'],
            datasets: [{
                data: [lightingCount, waterCount, gasCount],
                backgroundColor: [
                    '#eab308',
                    '#3b82f6',
                    '#6b7280'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true,
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary')
                    }
                }
            }
        }
    });
}

// Função para criar gráfico de consumo
function createConsumptionChart() {
    const ctx = document.getElementById('consumptionChart').getContext('2d');

    const energyConsumption = dashboardData.totals.energyConsumption / 1000; // Converter para MWh para melhor visualização
    const waterConsumption = dashboardData.totals.waterConsumption / 1000; // Converter para m³
    const gasConsumption = 0;

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Energia (MWh)', 'Água (m³)', 'Gás (m³)'],
            datasets: [{
                label: 'Consumo Hoje',
                data: [energyConsumption, waterConsumption, gasConsumption],
                backgroundColor: [
                    '#f59e0b',
                    '#3b82f6',
                    '#6b7280'
                ],
                borderRadius: 8,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--border-color')
                    },
                    ticks: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary')
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary')
                    }
                }
            }
        }
    });
}

// Função para atualizar gráficos quando trocar tema
function updateChartsTheme() {
    Chart.defaults.color = getComputedStyle(document.documentElement).getPropertyValue('--text-primary');
    Chart.defaults.borderColor = getComputedStyle(document.documentElement).getPropertyValue('--border-color');
}

// Função de inicialização
function initDashboard() {
    loadTheme();
    loadDashboardData();
    loadAlerts();

    // Aguardar um pouco para garantir que o DOM está pronto
    setTimeout(() => {
        createDevicesChart();
        createConsumptionChart();
    }, 100);
}

// Função para simular atualização de dados (opcional)
function refreshData() {
    // Aqui você poderia fazer uma nova chamada para a API MCP
    // Por enquanto, apenas recarrega os dados atuais
    loadDashboardData();
    loadAlerts();

    // Atualizar timestamp
    const now = new Date();
    document.getElementById('last-update').textContent = now.toLocaleString('pt-BR');
}

// Event listeners
document.addEventListener('DOMContentLoaded', initDashboard);

// Auto-refresh a cada 5 minutos (opcional)
setInterval(refreshData, 5 * 60 * 1000);

// Tornar funções globais para uso no HTML
window.toggleTheme = toggleTheme;
window.refreshData = refreshData; 