import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { MongoClient, Db } from 'mongodb';
import * as fs from 'fs/promises';
import * as path from 'path';
import { z } from 'zod';
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

// Configuração
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/admin';
const PDF_DIR = path.join(__dirname, '../docs');
const client = new MongoClient(MONGO_URI);
let db: Db;

// Configuração do logger com rotação por tamanho (1000 linhas ~ 100KB)
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => `${timestamp} [${level}]: ${message}`)
    ),
    transports: [
        new DailyRotateFile({
            filename: path.join(__dirname, '../logs/server.log'),
            maxSize: '100k', // Aproximadamente 1000 linhas
            maxFiles: '10',
            zippedArchive: true
        })
    ]
});

logger.info('Arquivo de Logs Criados com Sucesso!');

// Inicializa o servidor MCP
const server = new McpServer({
    name: 'SmartCityIotServer',
    version: '1.0.0'
});

logger.info('Servidor MCP criado');

// Conexão ao MongoDB
async function connectToMongo() {
    try {
        await client.connect();
        db = client.db('smart_city_iot');
        logger.info('Conectado ao MongoDB');
    } catch (error) {
        logger.error('Erro ao conectar ao MongoDB:', error);
        process.exit(1);
    }
}

// Implementa o método de descoberta
server.resource(
    'listOfferings',
    'mcp://listOfferings',
    async () => {
        logger.info('ListOfferings chamado');
        return {
            contents: [{
                uri: 'mcp://listOfferings',
                text: JSON.stringify({
                    server: {
                        name: 'SmartCityIotServer',
                        version: '1.0.0'
                    },
                    tools: [
                        {
                            name: 'listLightingDevices',
                            description: 'Lista dispositivos de iluminação',
                            parameters: {
                                type: 'object',
                                properties: {
                                    region: { type: 'string', optional: true },
                                    geoJson: { type: 'boolean', optional: true }
                                }
                            }
                        },
                        {
                            name: 'getLightingTelemetry',
                            description: 'Consulta telemetria de iluminação',
                            parameters: {
                                type: 'object',
                                properties: {
                                    deviceId: { type: 'string' },
                                    startTime: { type: 'number' },
                                    endTime: { type: 'number' }
                                }
                            }
                        },
                        {
                            name: 'analyzeEnergyConsumption',
                            description: 'Analisa consumo de energia',
                            parameters: {
                                type: 'object',
                                properties: {
                                    deviceId: { type: 'string' },
                                    startTime: { type: 'number' },
                                    endTime: { type: 'number' }
                                }
                            }
                        },
                        {
                            name: 'detectWaterLeaks',
                            description: 'Detecta vazamentos de água',
                            parameters: {
                                type: 'object',
                                properties: {
                                    startTime: { type: 'number' },
                                    endTime: { type: 'number' }
                                }
                            }
                        },
                        {
                            name: 'analyzeGasConsumption',
                            description: 'Analisa consumo de gás',
                            parameters: {
                                type: 'object',
                                properties: {
                                    region: { type: 'string' },
                                    startTime: { type: 'number' },
                                    endTime: { type: 'number' }
                                }
                            }
                        },
                        {
                            name: 'getRegionalStatistics',
                            description: 'Estatísticas regionais comparativas entre todos os tipos de dispositivos',
                            parameters: {
                                type: 'object',
                                properties: {
                                    startTime: { type: 'number' },
                                    endTime: { type: 'number' },
                                    includeComparison: { type: 'boolean', optional: true }
                                }
                            }
                        },
                        {
                            name: 'getDeviceHealthReport',
                            description: 'Relatório detalhado de saúde dos dispositivos com scores e métricas',
                            parameters: {
                                type: 'object',
                                properties: {
                                    deviceType: { type: 'string', enum: ['lighting', 'water', 'gas', 'all'], optional: true },
                                    region: { type: 'string', optional: true },
                                    healthThreshold: { type: 'number', optional: true }
                                }
                            }
                        },
                        {
                            name: 'getCityDashboard',
                            description: 'Dashboard completo da cidade com visão geral e alertas inteligentes',
                            parameters: {
                                type: 'object',
                                properties: {
                                    timeRange: { type: 'string', enum: ['hour', 'day', 'week', 'month'], optional: true },
                                    includeAlerts: { type: 'boolean', optional: true }
                                }
                            }
                        },
                        {
                            name: 'predictMaintenance',
                            description: 'Predição de manutenção baseada em análise de riscos e padrões',
                            parameters: {
                                type: 'object',
                                properties: {
                                    deviceType: { type: 'string', enum: ['lighting', 'water', 'gas', 'all'], optional: true },
                                    predictionDays: { type: 'number', optional: true },
                                    riskThreshold: { type: 'number', optional: true }
                                }
                            }
                        },
                        {
                            name: 'getAnomalyDetection',
                            description: 'Detecção inteligente de anomalias com sensibilidade configurável',
                            parameters: {
                                type: 'object',
                                properties: {
                                    deviceType: { type: 'string', enum: ['lighting', 'water', 'gas', 'all'], optional: true },
                                    sensitivity: { type: 'string', enum: ['low', 'medium', 'high'], optional: true },
                                    timeRange: { type: 'string', enum: ['hour', 'day', 'week'], optional: true }
                                }
                            }
                        },
                        {
                            name: 'getEnergyEfficiencyReport',
                            description: 'Relatório completo de eficiência energética com recomendações',
                            parameters: {
                                type: 'object',
                                properties: {
                                    startTime: { type: 'number' },
                                    endTime: { type: 'number' },
                                    includeRecommendations: { type: 'boolean', optional: true },
                                    region: { type: 'string', optional: true }
                                }
                            }
                        },
                        {
                            name: 'getWaterQualityReport',
                            description: 'Relatório detalhado de qualidade da água com alertas de segurança',
                            parameters: {
                                type: 'object',
                                properties: {
                                    startTime: { type: 'number' },
                                    endTime: { type: 'number' },
                                    region: { type: 'string', optional: true },
                                    includeAlerts: { type: 'boolean', optional: true }
                                }
                            }
                        },
                        {
                            name: 'getCrossDeviceAnalysis',
                            description: 'Análise correlacionada entre diferentes tipos de dispositivos',
                            parameters: {
                                type: 'object',
                                properties: {
                                    startTime: { type: 'number' },
                                    endTime: { type: 'number' },
                                    region: { type: 'string', optional: true },
                                    analysisType: { type: 'string', enum: ['consumption', 'efficiency', 'maintenance', 'environmental'], optional: true }
                                }
                            }
                        }
                    ]
                }),
                mimeType: 'application/json'
            }]
        };
    }
);

// Ferramenta: Lista dispositivos de iluminação
server.tool(
    'listLightingDevices',
    {
        region: z.string().optional(),
        geoJson: z.boolean().optional(),
        limit: z.number().optional(),
        offset: z.number().optional()
    },
    async ({ region, geoJson, limit = 100, offset = 0 }) => {
        logger.info(`listLightingDevices chamada com region=${region}, geoJson=${geoJson}, limit=${limit}, offset=${offset}`);
        const REGIONS: Record<string, number[][]> = {
            'norte': [
                [-73.99, -0.5], [-50.0, -0.5], [-50.0, 5.5], [-73.99, 5.5], [-73.99, -0.5]
            ],
            'nordeste': [
                [-50.0, -10.0], [-34.8, -10.0], [-34.8, 5.5], [-50.0, 5.5], [-50.0, -10.0]
            ],
            'centro-oeste': [
                [-60.0, -20.0], [-50.0, -20.0], [-50.0, -10.0], [-60.0, -10.0], [-60.0, -20.0]
            ],
            'sudeste': [
                [-50.0, -24.0], [-40.0, -24.0], [-40.0, -20.0], [-50.0, -20.0], [-50.0, -24.0]
            ],
            'sul': [
                [-57.0, -34.0], [-48.0, -34.0], [-48.0, -24.0], [-57.0, -24.0], [-57.0, -34.0]
            ]
        };
        const query: any = {};
        if (region && REGIONS[region.toLowerCase()]) {
            query.latitude = { $exists: true };
            query.longitude = { $exists: true };
        }
        logger.info(`Query para MongoDB: ${JSON.stringify(query)}`);
        const total = await db.collection('lighting_devices').countDocuments(query);
        let devices = await db.collection('lighting_devices')
            .find(query)
            .skip(offset)
            .limit(limit)
            .toArray();
        logger.info(`Dispositivos encontrados no banco (paginados): ${devices.length}`);
        let filtered = devices;
        if (region && REGIONS[region.toLowerCase()]) {
            const polygon = REGIONS[region.toLowerCase()];
            filtered = devices.filter((d: any) => {
                if (typeof d.latitude !== 'number' || typeof d.longitude !== 'number') return false;
                let x = d.longitude, y = d.latitude;
                let inside = false;
                for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
                    let xi = polygon[i][0], yi = polygon[i][1];
                    let xj = polygon[j][0], yj = polygon[j][1];
                    let intersect = ((yi > y) !== (yj > y)) &&
                        (x < (xj - xi) * (y - yi) / (yj - yi + 0.0000001) + xi);
                    if (intersect) inside = !inside;
                }
                return inside;
            });
            logger.info(`Dispositivos após filtro de polígono: ${filtered.length}`);
        }
        if (geoJson) {
            const features = filtered.map((d: any) => ({
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: [d.longitude, d.latitude]
                },
                properties: { ...d, latitude: undefined, longitude: undefined }
            }));
            logger.info(`Retornando FeatureCollection com ${features.length} features`);
            return {
                content: [{
                    type: 'text',
                    mimeType: 'application/geo+json',
                    text: JSON.stringify({
                        type: 'FeatureCollection',
                        features,
                        pagination: {
                            total,
                            offset,
                            limit,
                            hasNext: offset + filtered.length < total
                        }
                    }, null, 2)
                }]
            };
        } else {
            logger.info(`Retornando lista de dispositivos filtrados: ${filtered.length}`);
            return {
                content: [{
                    type: 'text',
                    text: JSON.stringify({
                        devices: filtered,
                        total,
                        offset,
                        limit,
                        hasNext: offset + filtered.length < total
                    }, null, 2)
                }]
            };
        }
    }
);

// Ferramenta: Consulta telemetria de iluminação
server.tool(
    'getLightingTelemetry',
    {
        deviceId: z.string(),
        startTime: z.number(),
        endTime: z.number(),
        limit: z.number().optional(),
        offset: z.number().optional()
    },
    async ({ deviceId, startTime, endTime, limit = 100, offset = 0 }) => {
        logger.info(`getLightingTelemetry chamada com deviceId=${deviceId}, startTime=${startTime}, endTime=${endTime}, limit=${limit}, offset=${offset}`);
        const total = await db.collection('lighting_telemetry')
            .countDocuments({
                deviceId,
                timestamp: { $gte: startTime, $lte: endTime }
            });
        const telemetry = await db.collection('lighting_telemetry')
            .find({
                deviceId,
                timestamp: { $gte: startTime, $lte: endTime }
            })
            .sort({ timestamp: 1 })
            .skip(offset)
            .limit(limit)
            .toArray();
        logger.info(`Registros de telemetria encontrados (paginados): ${telemetry.length}`);
        logger.info(`Retornando telemetria paginada`);
        return {
            content: [{
                type: 'text',
                text: JSON.stringify({
                    telemetry,
                    total,
                    offset,
                    limit,
                    hasNext: offset + telemetry.length < total
                }, null, 2)
            }]
        };
    }
);

// Ferramenta: Análise de consumo de energia
server.tool(
    'analyzeEnergyConsumption',
    {
        deviceId: z.string(),
        startTime: z.number(),
        endTime: z.number()
    },
    async ({ deviceId, startTime, endTime }) => {
        logger.info(`analyzeEnergyConsumption chamada com deviceId=${deviceId}, startTime=${startTime}, endTime=${endTime}`);
        const result = await db.collection('lighting_telemetry')
            .aggregate([
                {
                    $match: {
                        deviceId,
                        timestamp: { $gte: startTime, $lte: endTime }
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalEnergy: { $sum: '$energyAcc' },
                        avgPower: { $avg: '$powerConsumption' },
                        maxPower: { $max: '$powerConsumption' },
                        minPower: { $min: '$powerConsumption' }
                    }
                }
            ]).toArray();
        logger.info(`Resultado da agregação: ${JSON.stringify(result[0])}`);
        logger.info(`Retornando análise de consumo de energia`);
        return {
            content: [{ type: 'text', text: JSON.stringify(result[0], null, 2) }]
        };
    }
);

// Ferramenta: Detectar vazamentos de água
server.tool(
    'detectWaterLeaks',
    {
        startTime: z.number(),
        endTime: z.number(),
        limit: z.number().optional(),
        offset: z.number().optional()
    },
    async ({ startTime, endTime, limit = 100, offset = 0 }) => {
        logger.info(`detectWaterLeaks chamada com startTime=${startTime}, endTime=${endTime}, limit=${limit}, offset=${offset}`);
        const total = await db.collection('water_telemetry')
            .countDocuments({
                timestamp: { $gte: startTime, $lte: endTime },
                leakDetected: true
            });
        const leaks = await db.collection('water_telemetry')
            .find({
                timestamp: { $gte: startTime, $lte: endTime },
                leakDetected: true
            })
            .skip(offset)
            .limit(limit)
            .toArray();
        logger.info(`Vazamentos encontrados (paginados): ${leaks.length}`);
        logger.info(`Retornando lista de vazamentos paginada`);
        return {
            content: [{
                type: 'text',
                text: JSON.stringify({
                    leaks,
                    total,
                    offset,
                    limit,
                    hasNext: offset + leaks.length < total
                }, null, 2)
            }]
        };
    }
);

// Ferramenta: Análise de consumo de gás
server.tool(
    'analyzeGasConsumption',
    {
        region: z.string().optional(),
        startTime: z.number(),
        endTime: z.number()
    },
    async ({ region, startTime, endTime }) => {
        logger.info(`analyzeGasConsumption chamada com region=${region}, startTime=${startTime}, endTime=${endTime}`);
        const result = await db.collection('gas_telemetry')
            .aggregate([
                {
                    $match: {
                        timestamp: { $gte: startTime, $lte: endTime }
                    }
                },
                {
                    $lookup: {
                        from: 'gas_devices',
                        localField: 'deviceId',
                        foreignField: 'deviceId',
                        as: 'device'
                    }
                },
                {
                    $match: {
                        'device.region': region
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalConsumption: { $sum: '$consumption' },
                        avgFlowRate: { $avg: '$flowRate' },
                        leakCount: {
                            $sum: { $cond: [{ $eq: ['$leakDetected', true] }, 1, 0] }
                        }
                    }
                }
            ]).toArray();
        logger.info(`Resultado da agregação: ${JSON.stringify(result[0])}`);
        logger.info(`Retornando análise de consumo de gás`);
        return {
            content: [{ type: 'text', text: JSON.stringify(result[0], null, 2) }]
        };
    }
);

// ===== NOVAS FERRAMENTAS AVANÇADAS =====

// Ferramenta: Estatísticas regionais comparativas
server.tool(
    'getRegionalStatistics',
    {
        startTime: z.number(),
        endTime: z.number(),
        includeComparison: z.boolean().optional()
    },
    async ({ startTime, endTime, includeComparison = true }) => {
        logger.info(`getRegionalStatistics chamada com startTime=${startTime}, endTime=${endTime}, includeComparison=${includeComparison}`);

        // Estatísticas de iluminação por região
        const lightingStats = await db.collection('lighting_telemetry')
            .aggregate([
                {
                    $match: { timestamp: { $gte: startTime, $lte: endTime } }
                },
                {
                    $lookup: {
                        from: 'lighting_devices',
                        localField: 'deviceId',
                        foreignField: 'deviceId',
                        as: 'device'
                    }
                },
                { $unwind: '$device' },
                {
                    $group: {
                        _id: '$device.region',
                        totalDevices: { $addToSet: '$deviceId' },
                        avgEnergyConsumption: { $avg: '$powerConsumption' },
                        totalEnergy: { $sum: '$energyAcc' },
                        avgTemperature: { $avg: '$temp' },
                        avgLuminosity: { $avg: '$lux' },
                        operationalHours: { $sum: '$operatingHours' },
                        uptime: { $avg: { $cond: [{ $eq: ['$state', 1] }, 1, 0] } }
                    }
                },
                {
                    $project: {
                        region: '$_id',
                        deviceCount: { $size: '$totalDevices' },
                        avgEnergyConsumption: { $round: ['$avgEnergyConsumption', 2] },
                        totalEnergy: { $round: ['$totalEnergy', 2] },
                        avgTemperature: { $round: ['$avgTemperature', 2] },
                        avgLuminosity: { $round: ['$avgLuminosity', 2] },
                        operationalHours: { $round: ['$operationalHours', 2] },
                        uptimePercentage: { $round: [{ $multiply: ['$uptime', 100] }, 2] }
                    }
                }
            ]).toArray();

        // Estatísticas de água por região
        const waterStats = await db.collection('water_telemetry')
            .aggregate([
                {
                    $match: { timestamp: { $gte: startTime, $lte: endTime } }
                },
                {
                    $lookup: {
                        from: 'water_devices',
                        localField: 'deviceId',
                        foreignField: 'deviceId',
                        as: 'device'
                    }
                },
                { $unwind: '$device' },
                {
                    $group: {
                        _id: '$device.region',
                        totalDevices: { $addToSet: '$deviceId' },
                        totalConsumption: { $sum: '$consumption' },
                        avgFlowRate: { $avg: '$flowRate' },
                        avgPressure: { $avg: '$pressure' },
                        leakCount: { $sum: { $cond: [{ $eq: ['$leakDetected', true] }, 1, 0] } },
                        avgBattery: { $avg: '$battery' }
                    }
                },
                {
                    $project: {
                        region: '$_id',
                        deviceCount: { $size: '$totalDevices' },
                        totalConsumption: { $round: ['$totalConsumption', 2] },
                        avgFlowRate: { $round: ['$avgFlowRate', 2] },
                        avgPressure: { $round: ['$avgPressure', 2] },
                        leakCount: '$leakCount',
                        avgBattery: { $round: ['$avgBattery', 2] }
                    }
                }
            ]).toArray();

        // Estatísticas de gás por região
        const gasStats = await db.collection('gas_telemetry')
            .aggregate([
                {
                    $match: { timestamp: { $gte: startTime, $lte: endTime } }
                },
                {
                    $lookup: {
                        from: 'gas_devices',
                        localField: 'deviceId',
                        foreignField: 'deviceId',
                        as: 'device'
                    }
                },
                { $unwind: '$device' },
                {
                    $group: {
                        _id: '$device.region',
                        totalDevices: { $addToSet: '$deviceId' },
                        totalConsumption: { $sum: '$consumption' },
                        avgFlowRate: { $avg: '$flowRate' },
                        avgPressure: { $avg: '$pressure' },
                        leakCount: { $sum: { $cond: [{ $eq: ['$leakDetected', true] }, 1, 0] } },
                        avgBattery: { $avg: '$battery' }
                    }
                },
                {
                    $project: {
                        region: '$_id',
                        deviceCount: { $size: '$totalDevices' },
                        totalConsumption: { $round: ['$totalConsumption', 2] },
                        avgFlowRate: { $round: ['$avgFlowRate', 2] },
                        avgPressure: { $round: ['$avgPressure', 2] },
                        leakCount: '$leakCount',
                        avgBattery: { $round: ['$avgBattery', 2] }
                    }
                }
            ]).toArray();

        const result = {
            period: { startTime, endTime },
            lighting: lightingStats,
            water: waterStats,
            gas: gasStats,
            summary: {
                totalRegions: new Set([...lightingStats.map(s => s.region), ...waterStats.map(s => s.region), ...gasStats.map(s => s.region)]).size,
                totalLightingDevices: lightingStats.reduce((sum, s) => sum + s.deviceCount, 0),
                totalWaterDevices: waterStats.reduce((sum, s) => sum + s.deviceCount, 0),
                totalGasDevices: gasStats.reduce((sum, s) => sum + s.deviceCount, 0)
            }
        };

        logger.info(`Retornando estatísticas regionais para ${result.summary.totalRegions} regiões`);
        return {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
        };
    }
);

// Ferramenta: Relatório de saúde dos dispositivos
server.tool(
    'getDeviceHealthReport',
    {
        deviceType: z.enum(['lighting', 'water', 'gas', 'all']).optional(),
        region: z.string().optional(),
        healthThreshold: z.number().min(0).max(100).optional()
    },
    async ({ deviceType = 'all', region, healthThreshold = 80 }) => {
        logger.info(`getDeviceHealthReport chamada com deviceType=${deviceType}, region=${region}, healthThreshold=${healthThreshold}`);

        const healthReports = [];

        // Função para calcular saúde dos dispositivos de iluminação
        const getLightingHealth = async () => {
            const pipeline = [
                {
                    $lookup: {
                        from: 'lighting_devices',
                        localField: 'deviceId',
                        foreignField: 'deviceId',
                        as: 'device'
                    }
                },
                { $unwind: '$device' },
                ...(region ? [{ $match: { 'device.region': region } }] : []),
                {
                    $group: {
                        _id: '$deviceId',
                        region: { $first: '$device.region' },
                        lastSeen: { $max: '$timestamp' },
                        avgVoltage: { $avg: '$voltage' },
                        avgCurrent: { $avg: '$current' },
                        avgTemperature: { $avg: '$temp' },
                        totalReadings: { $sum: 1 },
                        uptime: { $avg: { $cond: [{ $eq: ['$state', 1] }, 1, 0] } },
                        powerEfficiency: { $avg: '$powerFactor' },
                        operatingHours: { $max: '$operatingHours' }
                    }
                },
                {
                    $project: {
                        deviceId: '$_id',
                        region: 1,
                        lastSeen: 1,
                        health: {
                            $min: [
                                100,
                                {
                                    $multiply: [
                                        {
                                            $add: [
                                                { $multiply: ['$uptime', 40] },
                                                { $cond: [{ $and: [{ $gte: ['$avgVoltage', 210] }, { $lte: ['$avgVoltage', 230] }] }, 25, 10] },
                                                { $cond: [{ $lte: ['$avgTemperature', 35] }, 20, 5] },
                                                { $multiply: ['$powerEfficiency', 15] }
                                            ]
                                        },
                                        1
                                    ]
                                }
                            ]
                        },
                        metrics: {
                            uptime: { $round: [{ $multiply: ['$uptime', 100] }, 2] },
                            avgVoltage: { $round: ['$avgVoltage', 2] },
                            avgCurrent: { $round: ['$avgCurrent', 2] },
                            avgTemperature: { $round: ['$avgTemperature', 2] },
                            powerEfficiency: { $round: [{ $multiply: ['$powerEfficiency', 100] }, 2] },
                            operatingHours: { $round: ['$operatingHours', 2] },
                            totalReadings: '$totalReadings'
                        }
                    }
                },
                { $match: { health: { $lte: healthThreshold } } },
                { $sort: { health: 1 } }
            ];

            return await db.collection('lighting_telemetry').aggregate(pipeline).toArray();
        };

        // Função para calcular saúde dos dispositivos de água
        const getWaterHealth = async () => {
            const pipeline = [
                {
                    $lookup: {
                        from: 'water_devices',
                        localField: 'deviceId',
                        foreignField: 'deviceId',
                        as: 'device'
                    }
                },
                { $unwind: '$device' },
                ...(region ? [{ $match: { 'device.region': region } }] : []),
                {
                    $group: {
                        _id: '$deviceId',
                        region: { $first: '$device.region' },
                        lastSeen: { $max: '$timestamp' },
                        avgBattery: { $avg: '$battery' },
                        avgPressure: { $avg: '$pressure' },
                        avgTemperature: { $avg: '$temperature' },
                        leakCount: { $sum: { $cond: [{ $eq: ['$leakDetected', true] }, 1, 0] } },
                        totalReadings: { $sum: 1 }
                    }
                },
                {
                    $project: {
                        deviceId: '$_id',
                        region: 1,
                        lastSeen: 1,
                        health: {
                            $min: [
                                100,
                                {
                                    $subtract: [
                                        100,
                                        {
                                            $add: [
                                                { $cond: [{ $lt: ['$avgBattery', 20] }, 40, 0] },
                                                { $cond: [{ $lt: ['$avgBattery', 50] }, 20, 0] },
                                                { $cond: [{ $or: [{ $lt: ['$avgPressure', 1] }, { $gt: ['$avgPressure', 4] }] }, 25, 0] },
                                                { $multiply: ['$leakCount', 10] }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        },
                        metrics: {
                            avgBattery: { $round: ['$avgBattery', 2] },
                            avgPressure: { $round: ['$avgPressure', 2] },
                            avgTemperature: { $round: ['$avgTemperature', 2] },
                            leakCount: '$leakCount',
                            totalReadings: '$totalReadings'
                        }
                    }
                },
                { $match: { health: { $lte: healthThreshold } } },
                { $sort: { health: 1 } }
            ];

            return await db.collection('water_telemetry').aggregate(pipeline).toArray();
        };

        // Função para calcular saúde dos dispositivos de gás
        const getGasHealth = async () => {
            const pipeline = [
                {
                    $lookup: {
                        from: 'gas_devices',
                        localField: 'deviceId',
                        foreignField: 'deviceId',
                        as: 'device'
                    }
                },
                { $unwind: '$device' },
                ...(region ? [{ $match: { 'device.region': region } }] : []),
                {
                    $group: {
                        _id: '$deviceId',
                        region: { $first: '$device.region' },
                        lastSeen: { $max: '$timestamp' },
                        avgBattery: { $avg: '$battery' },
                        avgPressure: { $avg: '$pressure' },
                        avgTemperature: { $avg: '$temperature' },
                        leakCount: { $sum: { $cond: [{ $eq: ['$leakDetected', true] }, 1, 0] } },
                        totalReadings: { $sum: 1 }
                    }
                },
                {
                    $project: {
                        deviceId: '$_id',
                        region: 1,
                        lastSeen: 1,
                        health: {
                            $min: [
                                100,
                                {
                                    $subtract: [
                                        100,
                                        {
                                            $add: [
                                                { $cond: [{ $lt: ['$avgBattery', 20] }, 40, 0] },
                                                { $cond: [{ $lt: ['$avgBattery', 50] }, 20, 0] },
                                                { $cond: [{ $or: [{ $lt: ['$avgPressure', 0.3] }, { $gt: ['$avgPressure', 1] }] }, 25, 0] },
                                                { $multiply: ['$leakCount', 15] }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        },
                        metrics: {
                            avgBattery: { $round: ['$avgBattery', 2] },
                            avgPressure: { $round: ['$avgPressure', 2] },
                            avgTemperature: { $round: ['$avgTemperature', 2] },
                            leakCount: '$leakCount',
                            totalReadings: '$totalReadings'
                        }
                    }
                },
                { $match: { health: { $lte: healthThreshold } } },
                { $sort: { health: 1 } }
            ];

            return await db.collection('gas_telemetry').aggregate(pipeline).toArray();
        };

        // Executar análises baseadas no tipo solicitado
        if (deviceType === 'all' || deviceType === 'lighting') {
            const lightingHealth = await getLightingHealth();
            healthReports.push({
                type: 'lighting',
                count: lightingHealth.length,
                devices: lightingHealth
            });
        }

        if (deviceType === 'all' || deviceType === 'water') {
            const waterHealth = await getWaterHealth();
            healthReports.push({
                type: 'water',
                count: waterHealth.length,
                devices: waterHealth
            });
        }

        if (deviceType === 'all' || deviceType === 'gas') {
            const gasHealth = await getGasHealth();
            healthReports.push({
                type: 'gas',
                count: gasHealth.length,
                devices: gasHealth
            });
        }

        const result = {
            parameters: { deviceType, region, healthThreshold },
            summary: {
                totalUnhealthyDevices: healthReports.reduce((sum, report) => sum + report.count, 0),
                byType: healthReports.map(report => ({ type: report.type, count: report.count }))
            },
            reports: healthReports
        };

        logger.info(`Retornando relatório de saúde para ${result.summary.totalUnhealthyDevices} dispositivos com problemas`);
        return {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
        };
    }
);

// Ferramenta: Dashboard completo da cidade
server.tool(
    'getCityDashboard',
    {
        timeRange: z.enum(['hour', 'day', 'week', 'month']).optional(),
        includeAlerts: z.boolean().optional()
    },
    async ({ timeRange = 'day', includeAlerts = true }) => {
        logger.info(`getCityDashboard chamada com timeRange=${timeRange}, includeAlerts=${includeAlerts}`);

        const timeRanges = {
            hour: 60 * 60,
            day: 24 * 60 * 60,
            week: 7 * 24 * 60 * 60,
            month: 30 * 24 * 60 * 60
        };

        const now = Math.floor(Date.now() / 1000);
        const startTime = now - timeRanges[timeRange];

        // Estatísticas gerais de iluminação
        const lightingOverview = await db.collection('lighting_telemetry')
            .aggregate([
                { $match: { timestamp: { $gte: startTime, $lte: now } } },
                {
                    $group: {
                        _id: null,
                        totalDevices: { $addToSet: '$deviceId' },
                        totalEnergyConsumption: { $sum: '$powerConsumption' },
                        avgTemperature: { $avg: '$temp' },
                        activeDevices: { $sum: { $cond: [{ $eq: ['$state', 1] }, 1, 0] } },
                        totalReadings: { $sum: 1 }
                    }
                },
                {
                    $project: {
                        deviceCount: { $size: '$totalDevices' },
                        totalEnergyConsumption: { $round: ['$totalEnergyConsumption', 2] },
                        avgTemperature: { $round: ['$avgTemperature', 2] },
                        uptimePercentage: { $round: [{ $multiply: [{ $divide: ['$activeDevices', '$totalReadings'] }, 100] }, 2] }
                    }
                }
            ]).toArray();

        // Estatísticas gerais de água
        const waterOverview = await db.collection('water_telemetry')
            .aggregate([
                { $match: { timestamp: { $gte: startTime, $lte: now } } },
                {
                    $group: {
                        _id: null,
                        totalDevices: { $addToSet: '$deviceId' },
                        totalConsumption: { $sum: '$consumption' },
                        avgPressure: { $avg: '$pressure' },
                        leakCount: { $sum: { $cond: [{ $eq: ['$leakDetected', true] }, 1, 0] } },
                        lowBatteryCount: { $sum: { $cond: [{ $lt: ['$battery', 20] }, 1, 0] } }
                    }
                },
                {
                    $project: {
                        deviceCount: { $size: '$totalDevices' },
                        totalConsumption: { $round: ['$totalConsumption', 2] },
                        avgPressure: { $round: ['$avgPressure', 2] },
                        leakCount: '$leakCount',
                        lowBatteryCount: '$lowBatteryCount'
                    }
                }
            ]).toArray();

        // Estatísticas gerais de gás
        const gasOverview = await db.collection('gas_telemetry')
            .aggregate([
                { $match: { timestamp: { $gte: startTime, $lte: now } } },
                {
                    $group: {
                        _id: null,
                        totalDevices: { $addToSet: '$deviceId' },
                        totalConsumption: { $sum: '$consumption' },
                        avgPressure: { $avg: '$pressure' },
                        leakCount: { $sum: { $cond: [{ $eq: ['$leakDetected', true] }, 1, 0] } },
                        lowBatteryCount: { $sum: { $cond: [{ $lt: ['$battery', 20] }, 1, 0] } }
                    }
                },
                {
                    $project: {
                        deviceCount: { $size: '$totalDevices' },
                        totalConsumption: { $round: ['$totalConsumption', 2] },
                        avgPressure: { $round: ['$avgPressure', 2] },
                        leakCount: '$leakCount',
                        lowBatteryCount: '$lowBatteryCount'
                    }
                }
            ]).toArray();

        const dashboard: any = {
            timestamp: now,
            timeRange: timeRange,
            overview: {
                lighting: lightingOverview[0] || {},
                water: waterOverview[0] || {},
                gas: gasOverview[0] || {}
            },
            totals: {
                devices: (lightingOverview[0]?.deviceCount || 0) + (waterOverview[0]?.deviceCount || 0) + (gasOverview[0]?.deviceCount || 0),
                energyConsumption: lightingOverview[0]?.totalEnergyConsumption || 0,
                waterConsumption: waterOverview[0]?.totalConsumption || 0,
                gasConsumption: gasOverview[0]?.totalConsumption || 0,
                totalLeaks: (waterOverview[0]?.leakCount || 0) + (gasOverview[0]?.leakCount || 0),
                lowBatteryDevices: (waterOverview[0]?.lowBatteryCount || 0) + (gasOverview[0]?.lowBatteryCount || 0)
            }
        };

        // Adicionar alertas se solicitado
        if (includeAlerts) {
            dashboard.alerts = {
                critical: [],
                warning: [],
                info: []
            };

            // Alertas críticos
            if (dashboard.totals.totalLeaks > 0) {
                dashboard.alerts.critical.push({
                    type: 'leaks',
                    message: `${dashboard.totals.totalLeaks} vazamentos detectados`,
                    priority: 'high'
                });
            }

            if (lightingOverview[0]?.uptimePercentage < 90) {
                dashboard.alerts.critical.push({
                    type: 'lighting_uptime',
                    message: `Uptime da iluminação abaixo de 90%: ${lightingOverview[0]?.uptimePercentage}%`,
                    priority: 'high'
                });
            }

            // Alertas de aviso
            if (dashboard.totals.lowBatteryDevices > 0) {
                dashboard.alerts.warning.push({
                    type: 'low_battery',
                    message: `${dashboard.totals.lowBatteryDevices} dispositivos com bateria baixa`,
                    priority: 'medium'
                });
            }

            if (lightingOverview[0]?.avgTemperature > 35) {
                dashboard.alerts.warning.push({
                    type: 'high_temperature',
                    message: `Temperatura média alta nos dispositivos de iluminação: ${lightingOverview[0]?.avgTemperature}°C`,
                    priority: 'medium'
                });
            }
        }

        logger.info(`Dashboard gerado para período de ${timeRange} com ${dashboard.totals.devices} dispositivos`);
        return {
            content: [{ type: 'text', text: JSON.stringify(dashboard, null, 2) }]
        };
    }
);

// Ferramenta: Predição de manutenção
server.tool(
    'predictMaintenance',
    {
        deviceType: z.enum(['lighting', 'water', 'gas', 'all']).optional(),
        predictionDays: z.number().min(1).max(90).optional(),
        riskThreshold: z.number().min(0).max(100).optional()
    },
    async ({ deviceType = 'all', predictionDays = 30, riskThreshold = 70 }) => {
        logger.info(`predictMaintenance chamada com deviceType=${deviceType}, predictionDays=${predictionDays}, riskThreshold=${riskThreshold}`);

        const now = Math.floor(Date.now() / 1000);
        const lookbackPeriod = 30 * 24 * 60 * 60; // 30 dias
        const startTime = now - lookbackPeriod;

        const predictions: any[] = [];

        // Predição para dispositivos de iluminação
        if (deviceType === 'all' || deviceType === 'lighting') {
            const lightingPredictions = await db.collection('lighting_telemetry')
                .aggregate([
                    { $match: { timestamp: { $gte: startTime, $lte: now } } },
                    {
                        $group: {
                            _id: '$deviceId',
                            avgVoltage: { $avg: '$voltage' },
                            voltageVariance: { $stdDevSamp: '$voltage' },
                            avgCurrent: { $avg: '$current' },
                            currentVariance: { $stdDevSamp: '$current' },
                            avgTemperature: { $avg: '$temp' },
                            maxTemperature: { $max: '$temp' },
                            powerFactorAvg: { $avg: '$powerFactor' },
                            operatingHours: { $max: '$operatingHours' },
                            uptimePercentage: { $avg: { $cond: [{ $eq: ['$state', 1] }, 1, 0] } },
                            readingCount: { $sum: 1 }
                        }
                    },
                    {
                        $project: {
                            deviceId: '$_id',
                            maintenanceRisk: {
                                $min: [
                                    100,
                                    {
                                        $add: [
                                            // Alto risco se voltagem está instável
                                            { $cond: [{ $gt: ['$voltageVariance', 10] }, 25, 0] },
                                            // Alto risco se corrente está muito alta ou baixa
                                            { $cond: [{ $or: [{ $gt: ['$avgCurrent', 2] }, { $lt: ['$avgCurrent', 0.1] }] }, 20, 0] },
                                            // Alto risco se temperatura muito alta
                                            { $cond: [{ $gt: ['$avgTemperature', 40] }, 30, 0] },
                                            { $cond: [{ $gt: ['$maxTemperature', 50] }, 15, 0] },
                                            // Alto risco se uptime baixo
                                            { $cond: [{ $lt: ['$uptimePercentage', 0.9] }, 25, 0] },
                                            // Alto risco se fator de potência baixo
                                            { $cond: [{ $lt: ['$powerFactorAvg', 0.8] }, 15, 0] },
                                            // Risco baseado em horas de operação
                                            { $cond: [{ $gt: ['$operatingHours', 8760] }, 10, 0] } // 1 ano
                                        ]
                                    }
                                ]
                            },
                            metrics: {
                                avgVoltage: { $round: ['$avgVoltage', 2] },
                                voltageStability: { $round: [{ $subtract: [100, { $multiply: ['$voltageVariance', 5] }] }, 2] },
                                avgCurrent: { $round: ['$avgCurrent', 3] },
                                avgTemperature: { $round: ['$avgTemperature', 2] },
                                maxTemperature: { $round: ['$maxTemperature', 2] },
                                powerFactor: { $round: [{ $multiply: ['$powerFactorAvg', 100] }, 2] },
                                operatingHours: { $round: ['$operatingHours', 2] },
                                uptime: { $round: [{ $multiply: ['$uptimePercentage', 100] }, 2] }
                            },
                            predictedFailureDays: {
                                $cond: [
                                    { $gt: ['$maintenanceRisk', 80] },
                                    { $multiply: [{ $subtract: [100, '$maintenanceRisk'] }, 0.5] },
                                    { $multiply: [{ $subtract: [100, '$maintenanceRisk'] }, 2] }
                                ]
                            }
                        }
                    },
                    { $match: { maintenanceRisk: { $gte: riskThreshold } } },
                    { $sort: { maintenanceRisk: -1 } }
                ]).toArray();

            predictions.push({
                type: 'lighting',
                count: lightingPredictions.length,
                devices: lightingPredictions
            });
        }

        // Predição para dispositivos de água
        if (deviceType === 'all' || deviceType === 'water') {
            const waterPredictions = await db.collection('water_telemetry')
                .aggregate([
                    { $match: { timestamp: { $gte: startTime, $lte: now } } },
                    {
                        $group: {
                            _id: '$deviceId',
                            avgBattery: { $avg: '$battery' },
                            minBattery: { $min: '$battery' },
                            avgPressure: { $avg: '$pressure' },
                            pressureVariance: { $stdDevSamp: '$pressure' },
                            leakCount: { $sum: { $cond: [{ $eq: ['$leakDetected', true] }, 1, 0] } },
                            avgFlowRate: { $avg: '$flowRate' },
                            flowVariance: { $stdDevSamp: '$flowRate' },
                            readingCount: { $sum: 1 }
                        }
                    },
                    {
                        $project: {
                            deviceId: '$_id',
                            maintenanceRisk: {
                                $min: [
                                    100,
                                    {
                                        $add: [
                                            // Alto risco se bateria baixa
                                            { $cond: [{ $lt: ['$avgBattery', 30] }, 35, 0] },
                                            { $cond: [{ $lt: ['$minBattery', 15] }, 25, 0] },
                                            // Alto risco se pressão instável
                                            { $cond: [{ $gt: ['$pressureVariance', 1] }, 20, 0] },
                                            // Alto risco se muitos vazamentos
                                            { $multiply: ['$leakCount', 8] },
                                            // Alto risco se fluxo muito variável
                                            { $cond: [{ $gt: ['$flowVariance', 0.5] }, 15, 0] }
                                        ]
                                    }
                                ]
                            },
                            metrics: {
                                avgBattery: { $round: ['$avgBattery', 2] },
                                minBattery: { $round: ['$minBattery', 2] },
                                avgPressure: { $round: ['$avgPressure', 2] },
                                pressureStability: { $round: [{ $subtract: [100, { $multiply: ['$pressureVariance', 20] }] }, 2] },
                                leakCount: '$leakCount',
                                avgFlowRate: { $round: ['$avgFlowRate', 3] }
                            },
                            predictedFailureDays: {
                                $cond: [
                                    { $gt: ['$maintenanceRisk', 80] },
                                    { $multiply: [{ $subtract: [100, '$maintenanceRisk'] }, 0.3] },
                                    { $multiply: [{ $subtract: [100, '$maintenanceRisk'] }, 1.5] }
                                ]
                            }
                        }
                    },
                    { $match: { maintenanceRisk: { $gte: riskThreshold } } },
                    { $sort: { maintenanceRisk: -1 } }
                ]).toArray();

            predictions.push({
                type: 'water',
                count: waterPredictions.length,
                devices: waterPredictions
            });
        }

        // Predição para dispositivos de gás
        if (deviceType === 'all' || deviceType === 'gas') {
            const gasPredictions = await db.collection('gas_telemetry')
                .aggregate([
                    { $match: { timestamp: { $gte: startTime, $lte: now } } },
                    {
                        $group: {
                            _id: '$deviceId',
                            avgBattery: { $avg: '$battery' },
                            minBattery: { $min: '$battery' },
                            avgPressure: { $avg: '$pressure' },
                            pressureVariance: { $stdDevSamp: '$pressure' },
                            leakCount: { $sum: { $cond: [{ $eq: ['$leakDetected', true] }, 1, 0] } },
                            avgFlowRate: { $avg: '$flowRate' },
                            flowVariance: { $stdDevSamp: '$flowRate' },
                            readingCount: { $sum: 1 }
                        }
                    },
                    {
                        $project: {
                            deviceId: '$_id',
                            maintenanceRisk: {
                                $min: [
                                    100,
                                    {
                                        $add: [
                                            // Alto risco se bateria baixa
                                            { $cond: [{ $lt: ['$avgBattery', 30] }, 35, 0] },
                                            { $cond: [{ $lt: ['$minBattery', 15] }, 25, 0] },
                                            // Alto risco se pressão instável
                                            { $cond: [{ $gt: ['$pressureVariance', 0.2] }, 25, 0] },
                                            // Alto risco se muitos vazamentos (mais crítico para gás)
                                            { $multiply: ['$leakCount', 12] },
                                            // Alto risco se fluxo muito variável
                                            { $cond: [{ $gt: ['$flowVariance', 0.3] }, 20, 0] }
                                        ]
                                    }
                                ]
                            },
                            metrics: {
                                avgBattery: { $round: ['$avgBattery', 2] },
                                minBattery: { $round: ['$minBattery', 2] },
                                avgPressure: { $round: ['$avgPressure', 3] },
                                pressureStability: { $round: [{ $subtract: [100, { $multiply: ['$pressureVariance', 50] }] }, 2] },
                                leakCount: '$leakCount',
                                avgFlowRate: { $round: ['$avgFlowRate', 3] }
                            },
                            predictedFailureDays: {
                                $cond: [
                                    { $gt: ['$maintenanceRisk', 80] },
                                    { $multiply: [{ $subtract: [100, '$maintenanceRisk'] }, 0.2] },
                                    { $multiply: [{ $subtract: [100, '$maintenanceRisk'] }, 1.2] }
                                ]
                            }
                        }
                    },
                    { $match: { maintenanceRisk: { $gte: riskThreshold } } },
                    { $sort: { maintenanceRisk: -1 } }
                ]).toArray();

            predictions.push({
                type: 'gas',
                count: gasPredictions.length,
                devices: gasPredictions
            });
        }

        const result = {
            parameters: { deviceType, predictionDays, riskThreshold },
            summary: {
                totalDevicesAtRisk: predictions.reduce((sum, p) => sum + p.count, 0),
                byType: predictions.map(p => ({ type: p.type, count: p.count })),
                urgentMaintenance: predictions.reduce((sum, p) =>
                    sum + p.devices.filter((d: any) => d.maintenanceRisk > 90).length, 0)
            },
            predictions: predictions
        };

        logger.info(`Predição de manutenção: ${result.summary.totalDevicesAtRisk} dispositivos em risco`);
        return {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
        };
    }
);

// Ferramenta: Detecção de anomalias
server.tool(
    'getAnomalyDetection',
    {
        deviceType: z.enum(['lighting', 'water', 'gas', 'all']).optional(),
        sensitivity: z.enum(['low', 'medium', 'high']).optional(),
        timeRange: z.enum(['hour', 'day', 'week']).optional()
    },
    async ({ deviceType = 'all', sensitivity = 'medium', timeRange = 'day' }) => {
        logger.info(`getAnomalyDetection chamada com deviceType=${deviceType}, sensitivity=${sensitivity}, timeRange=${timeRange}`);

        const timeRanges = {
            hour: 60 * 60,
            day: 24 * 60 * 60,
            week: 7 * 24 * 60 * 60
        };

        const sensivityMultipliers = {
            low: 3,
            medium: 2,
            high: 1.5
        };

        const now = Math.floor(Date.now() / 1000);
        const startTime = now - timeRanges[timeRange];
        const multiplier = sensivityMultipliers[sensitivity];

        const anomalies: any[] = [];

        // Detecção de anomalias em iluminação
        if (deviceType === 'all' || deviceType === 'lighting') {
            const lightingAnomalies = await db.collection('lighting_telemetry')
                .aggregate([
                    { $match: { timestamp: { $gte: startTime, $lte: now } } },
                    {
                        $group: {
                            _id: '$deviceId',
                            avgPower: { $avg: '$powerConsumption' },
                            stdPower: { $stdDevSamp: '$powerConsumption' },
                            avgVoltage: { $avg: '$voltage' },
                            stdVoltage: { $stdDevSamp: '$voltage' },
                            avgTemp: { $avg: '$temp' },
                            maxTemp: { $max: '$temp' },
                            minTemp: { $min: '$temp' },
                            avgLux: { $avg: '$lux' },
                            readings: { $push: '$$ROOT' }
                        }
                    },
                    {
                        $project: {
                            deviceId: '$_id',
                            anomalies: {
                                $filter: {
                                    input: '$readings',
                                    cond: {
                                        $or: [
                                            // Consumo muito alto ou baixo
                                            { $gt: ['$$this.powerConsumption', { $add: ['$avgPower', { $multiply: ['$stdPower', multiplier] }] }] },
                                            { $lt: ['$$this.powerConsumption', { $subtract: ['$avgPower', { $multiply: ['$stdPower', multiplier] }] }] },
                                            // Voltagem anômala
                                            { $gt: ['$$this.voltage', { $add: ['$avgVoltage', { $multiply: ['$stdVoltage', multiplier] }] }] },
                                            { $lt: ['$$this.voltage', { $subtract: ['$avgVoltage', { $multiply: ['$stdVoltage', multiplier] }] }] },
                                            // Temperatura muito alta
                                            { $gt: ['$$this.temp', 45] },
                                            // Luminosidade estranha para horário
                                            {
                                                $and: [
                                                    { $gt: [{ $mod: [{ $divide: ['$$this.timestamp', 3600] }, 24] }, 18] },
                                                    { $gt: ['$$this.lux', 800] }
                                                ]
                                            }
                                        ]
                                    }
                                }
                            }
                        }
                    },
                    { $match: { 'anomalies.0': { $exists: true } } },
                    {
                        $project: {
                            deviceId: 1,
                            anomalyCount: { $size: '$anomalies' },
                            anomalies: { $slice: ['$anomalies', 10] } // Limitar a 10 exemplos
                        }
                    }
                ]).toArray();

            anomalies.push({
                type: 'lighting',
                count: lightingAnomalies.reduce((sum, device) => sum + device.anomalyCount, 0),
                devices: lightingAnomalies
            });
        }

        // Detecção de anomalias em água
        if (deviceType === 'all' || deviceType === 'water') {
            const waterAnomalies = await db.collection('water_telemetry')
                .aggregate([
                    { $match: { timestamp: { $gte: startTime, $lte: now } } },
                    {
                        $group: {
                            _id: '$deviceId',
                            avgFlow: { $avg: '$flowRate' },
                            stdFlow: { $stdDevSamp: '$flowRate' },
                            avgPressure: { $avg: '$pressure' },
                            stdPressure: { $stdDevSamp: '$pressure' },
                            avgConsumption: { $avg: '$consumption' },
                            stdConsumption: { $stdDevSamp: '$consumption' },
                            readings: { $push: '$$ROOT' }
                        }
                    },
                    {
                        $project: {
                            deviceId: '$_id',
                            anomalies: {
                                $filter: {
                                    input: '$readings',
                                    cond: {
                                        $or: [
                                            // Vazamento detectado
                                            { $eq: ['$$this.leakDetected', true] },
                                            // Fluxo anômalo
                                            { $gt: ['$$this.flowRate', { $add: ['$avgFlow', { $multiply: ['$stdFlow', multiplier] }] }] },
                                            // Pressão anômala
                                            { $gt: ['$$this.pressure', { $add: ['$avgPressure', { $multiply: ['$stdPressure', multiplier] }] }] },
                                            { $lt: ['$$this.pressure', { $subtract: ['$avgPressure', { $multiply: ['$stdPressure', multiplier] }] }] },
                                            // Consumo muito alto
                                            { $gt: ['$$this.consumption', { $add: ['$avgConsumption', { $multiply: ['$stdConsumption', multiplier] }] }] },
                                            // Bateria muito baixa
                                            { $lt: ['$$this.battery', 15] }
                                        ]
                                    }
                                }
                            }
                        }
                    },
                    { $match: { 'anomalies.0': { $exists: true } } },
                    {
                        $project: {
                            deviceId: 1,
                            anomalyCount: { $size: '$anomalies' },
                            anomalies: { $slice: ['$anomalies', 10] }
                        }
                    }
                ]).toArray();

            anomalies.push({
                type: 'water',
                count: waterAnomalies.reduce((sum, device) => sum + device.anomalyCount, 0),
                devices: waterAnomalies
            });
        }

        // Detecção de anomalias em gás
        if (deviceType === 'all' || deviceType === 'gas') {
            const gasAnomalies = await db.collection('gas_telemetry')
                .aggregate([
                    { $match: { timestamp: { $gte: startTime, $lte: now } } },
                    {
                        $group: {
                            _id: '$deviceId',
                            avgFlow: { $avg: '$flowRate' },
                            stdFlow: { $stdDevSamp: '$flowRate' },
                            avgPressure: { $avg: '$pressure' },
                            stdPressure: { $stdDevSamp: '$pressure' },
                            avgConsumption: { $avg: '$consumption' },
                            stdConsumption: { $stdDevSamp: '$consumption' },
                            readings: { $push: '$$ROOT' }
                        }
                    },
                    {
                        $project: {
                            deviceId: '$_id',
                            anomalies: {
                                $filter: {
                                    input: '$readings',
                                    cond: {
                                        $or: [
                                            // Vazamento detectado (crítico para gás)
                                            { $eq: ['$$this.leakDetected', true] },
                                            // Fluxo anômalo
                                            { $gt: ['$$this.flowRate', { $add: ['$avgFlow', { $multiply: ['$stdFlow', multiplier] }] }] },
                                            // Pressão anômala (muito crítico para gás)
                                            { $gt: ['$$this.pressure', { $add: ['$avgPressure', { $multiply: ['$stdPressure', { $multiply: [multiplier, 0.5] }] }] }] },
                                            { $lt: ['$$this.pressure', { $subtract: ['$avgPressure', { $multiply: ['$stdPressure', { $multiply: [multiplier, 0.5] }] }] }] },
                                            // Consumo muito alto
                                            { $gt: ['$$this.consumption', { $add: ['$avgConsumption', { $multiply: ['$stdConsumption', multiplier] }] }] },
                                            // Bateria muito baixa
                                            { $lt: ['$$this.battery', 15] }
                                        ]
                                    }
                                }
                            }
                        }
                    },
                    { $match: { 'anomalies.0': { $exists: true } } },
                    {
                        $project: {
                            deviceId: 1,
                            anomalyCount: { $size: '$anomalies' },
                            anomalies: { $slice: ['$anomalies', 10] }
                        }
                    }
                ]).toArray();

            anomalies.push({
                type: 'gas',
                count: gasAnomalies.reduce((sum, device) => sum + device.anomalyCount, 0),
                devices: gasAnomalies
            });
        }

        const result = {
            parameters: { deviceType, sensitivity, timeRange },
            summary: {
                totalAnomalies: anomalies.reduce((sum, a) => sum + a.count, 0),
                devicesAffected: anomalies.reduce((sum, a) => sum + a.devices.length, 0),
                byType: anomalies.map(a => ({ type: a.type, count: a.count, devices: a.devices.length }))
            },
            anomalies: anomalies
        };

        logger.info(`Detecção de anomalias: ${result.summary.totalAnomalies} anomalias encontradas`);
        return {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
        };
    }
);

// Ferramenta: Relatório completo de eficiência energética
server.tool(
    'getEnergyEfficiencyReport',
    {
        startTime: z.number(),
        endTime: z.number(),
        includeRecommendations: z.boolean().optional(),
        region: z.string().optional()
    },
    async ({ startTime, endTime, includeRecommendations = true, region }) => {
        logger.info(`getEnergyEfficiencyReport chamada com startTime=${startTime}, endTime=${endTime}, region=${region}`);

        // Análise detalhada de eficiência energética
        const efficiencyAnalysis = await db.collection('lighting_telemetry')
            .aggregate([
                { $match: { timestamp: { $gte: startTime, $lte: endTime } } },
                {
                    $lookup: {
                        from: 'lighting_devices',
                        localField: 'deviceId',
                        foreignField: 'deviceId',
                        as: 'device'
                    }
                },
                { $unwind: '$device' },
                ...(region ? [{ $match: { 'device.region': region } }] : []),
                {
                    $group: {
                        _id: {
                            deviceId: '$deviceId',
                            region: '$device.region'
                        },
                        totalEnergy: { $sum: '$energyAcc' },
                        avgPowerConsumption: { $avg: '$powerConsumption' },
                        maxPowerConsumption: { $max: '$powerConsumption' },
                        minPowerConsumption: { $min: '$powerConsumption' },
                        avgPowerFactor: { $avg: '$powerFactor' },
                        avgVoltage: { $avg: '$voltage' },
                        avgCurrent: { $avg: '$current' },
                        avgTemperature: { $avg: '$temp' },
                        avgLux: { $avg: '$lux' },
                        operatingHours: { $max: '$operatingHours' },
                        uptime: { $avg: { $cond: [{ $eq: ['$state', 1] }, 1, 0] } },
                        totalReadings: { $sum: 1 }
                    }
                },
                {
                    $project: {
                        deviceId: '$_id.deviceId',
                        region: '$_id.region',
                        totalEnergy: { $round: ['$totalEnergy', 2] },
                        avgPowerConsumption: { $round: ['$avgPowerConsumption', 2] },
                        powerRange: {
                            min: { $round: ['$minPowerConsumption', 2] },
                            max: { $round: ['$maxPowerConsumption', 2] },
                            variance: { $round: [{ $subtract: ['$maxPowerConsumption', '$minPowerConsumption'] }, 2] }
                        },
                        efficiency: {
                            powerFactor: { $round: [{ $multiply: ['$avgPowerFactor', 100] }, 2] },
                            energyPerHour: { $round: [{ $divide: ['$totalEnergy', '$operatingHours'] }, 3] },
                            uptimePercentage: { $round: [{ $multiply: ['$uptime', 100] }, 2] }
                        },
                        metrics: {
                            avgVoltage: { $round: ['$avgVoltage', 2] },
                            avgCurrent: { $round: ['$avgCurrent', 3] },
                            avgTemperature: { $round: ['$avgTemperature', 2] },
                            avgLuminosity: { $round: ['$avgLux', 2] },
                            operatingHours: { $round: ['$operatingHours', 2] }
                        },
                        efficiencyScore: {
                            $round: [
                                {
                                    $multiply: [
                                        {
                                            $add: [
                                                { $multiply: ['$avgPowerFactor', 30] },
                                                { $multiply: ['$uptime', 25] },
                                                { $cond: [{ $and: [{ $gte: ['$avgVoltage', 210] }, { $lte: ['$avgVoltage', 230] }] }, 20, 10] },
                                                { $cond: [{ $lte: ['$avgTemperature', 35] }, 15, 5] },
                                                { $cond: [{ $lt: [{ $subtract: ['$maxPowerConsumption', '$minPowerConsumption'] }, 20] }, 10, 0] }
                                            ]
                                        },
                                        1
                                    ]
                                },
                                1
                            ]
                        }
                    }
                },
                { $sort: { efficiencyScore: -1 } }
            ]).toArray();

        // Análise por região
        const regionalAnalysis = await db.collection('lighting_telemetry')
            .aggregate([
                { $match: { timestamp: { $gte: startTime, $lte: endTime } } },
                {
                    $lookup: {
                        from: 'lighting_devices',
                        localField: 'deviceId',
                        foreignField: 'deviceId',
                        as: 'device'
                    }
                },
                { $unwind: '$device' },
                ...(region ? [{ $match: { 'device.region': region } }] : []),
                {
                    $group: {
                        _id: '$device.region',
                        totalDevices: { $addToSet: '$deviceId' },
                        totalEnergyConsumption: { $sum: '$energyAcc' },
                        avgPowerConsumption: { $avg: '$powerConsumption' },
                        avgEfficiency: { $avg: '$powerFactor' },
                        avgUptime: { $avg: { $cond: [{ $eq: ['$state', 1] }, 1, 0] } },
                        totalOperatingHours: { $sum: '$operatingHours' }
                    }
                },
                {
                    $project: {
                        region: '$_id',
                        deviceCount: { $size: '$totalDevices' },
                        totalEnergyConsumption: { $round: ['$totalEnergyConsumption', 2] },
                        avgPowerConsumption: { $round: ['$avgPowerConsumption', 2] },
                        avgEfficiency: { $round: [{ $multiply: ['$avgEfficiency', 100] }, 2] },
                        avgUptime: { $round: [{ $multiply: ['$avgUptime', 100] }, 2] },
                        energyPerDevice: { $round: [{ $divide: ['$totalEnergyConsumption', { $size: '$totalDevices' }] }, 2] },
                        totalOperatingHours: { $round: ['$totalOperatingHours', 2] }
                    }
                },
                { $sort: { avgEfficiency: -1 } }
            ]).toArray();

        // Calcular métricas gerais
        const summary = {
            totalDevices: efficiencyAnalysis.length,
            totalEnergyConsumption: efficiencyAnalysis.reduce((sum, device) => sum + device.totalEnergy, 0),
            avgEfficiencyScore: Math.round(efficiencyAnalysis.reduce((sum, device) => sum + device.efficiencyScore, 0) / efficiencyAnalysis.length * 100) / 100,
            bestPerformers: efficiencyAnalysis.slice(0, 10),
            worstPerformers: efficiencyAnalysis.slice(-10).reverse(),
            periodDays: Math.ceil((endTime - startTime) / (24 * 60 * 60))
        };

        const result: any = {
            period: { startTime, endTime },
            summary,
            regionalAnalysis,
            deviceAnalysis: efficiencyAnalysis
        };

        // Adicionar recomendações se solicitado
        if (includeRecommendations) {
            result.recommendations = [];

            // Recomendações baseadas em dispositivos com baixa eficiência
            const lowEfficiencyDevices = efficiencyAnalysis.filter(d => d.efficiencyScore < 70);
            if (lowEfficiencyDevices.length > 0) {
                result.recommendations.push({
                    type: 'maintenance',
                    priority: 'high',
                    message: `${lowEfficiencyDevices.length} dispositivos com eficiência abaixo de 70% precisam de manutenção`,
                    devices: lowEfficiencyDevices.slice(0, 5).map(d => d.deviceId)
                });
            }

            // Recomendações baseadas em alto consumo
            const highConsumptionDevices = efficiencyAnalysis.filter(d => d.avgPowerConsumption > 150);
            if (highConsumptionDevices.length > 0) {
                result.recommendations.push({
                    type: 'optimization',
                    priority: 'medium',
                    message: `${highConsumptionDevices.length} dispositivos com consumo alto podem ser otimizados`,
                    estimatedSavings: Math.round(highConsumptionDevices.reduce((sum, d) => sum + (d.avgPowerConsumption - 100) * 24 * 30, 0)) + ' kWh/mês'
                });
            }

            // Recomendações baseadas em baixo uptime
            const lowUptimeDevices = efficiencyAnalysis.filter(d => d.efficiency.uptimePercentage < 90);
            if (lowUptimeDevices.length > 0) {
                result.recommendations.push({
                    type: 'reliability',
                    priority: 'high',
                    message: `${lowUptimeDevices.length} dispositivos com uptime baixo afetam a iluminação pública`,
                    devices: lowUptimeDevices.slice(0, 5).map(d => d.deviceId)
                });
            }
        }

        logger.info(`Relatório de eficiência energética gerado para ${summary.totalDevices} dispositivos`);
        return {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
        };
    }
);

// Ferramenta: Relatório de qualidade da água
server.tool(
    'getWaterQualityReport',
    {
        startTime: z.number(),
        endTime: z.number(),
        region: z.string().optional(),
        includeAlerts: z.boolean().optional()
    },
    async ({ startTime, endTime, region, includeAlerts = true }) => {
        logger.info(`getWaterQualityReport chamada com startTime=${startTime}, endTime=${endTime}, region=${region}`);

        // Análise detalhada da qualidade da água
        const qualityAnalysis = await db.collection('water_telemetry')
            .aggregate([
                { $match: { timestamp: { $gte: startTime, $lte: endTime } } },
                {
                    $lookup: {
                        from: 'water_devices',
                        localField: 'deviceId',
                        foreignField: 'deviceId',
                        as: 'device'
                    }
                },
                { $unwind: '$device' },
                ...(region ? [{ $match: { 'device.region': region } }] : []),
                {
                    $group: {
                        _id: {
                            deviceId: '$deviceId',
                            region: '$device.region'
                        },
                        avgPressure: { $avg: '$pressure' },
                        minPressure: { $min: '$pressure' },
                        maxPressure: { $max: '$pressure' },
                        pressureVariance: { $stdDevSamp: '$pressure' },
                        avgFlowRate: { $avg: '$flowRate' },
                        avgTemperature: { $avg: '$temperature' },
                        minTemperature: { $min: '$temperature' },
                        maxTemperature: { $max: '$temperature' },
                        totalConsumption: { $sum: '$consumption' },
                        leakCount: { $sum: { $cond: [{ $eq: ['$leakDetected', true] }, 1, 0] } },
                        avgBattery: { $avg: '$battery' },
                        readingCount: { $sum: 1 },
                        anomalousReadings: {
                            $sum: {
                                $cond: [
                                    {
                                        $or: [
                                            { $lt: ['$pressure', 1] },
                                            { $gt: ['$pressure', 5] },
                                            { $lt: ['$temperature', 0] },
                                            { $gt: ['$temperature', 40] },
                                            { $eq: ['$leakDetected', true] }
                                        ]
                                    },
                                    1,
                                    0
                                ]
                            }
                        }
                    }
                },
                {
                    $project: {
                        deviceId: '$_id.deviceId',
                        region: '$_id.region',
                        qualityMetrics: {
                            avgPressure: { $round: ['$avgPressure', 2] },
                            pressureStability: {
                                score: { $round: [{ $max: [0, { $subtract: [100, { $multiply: ['$pressureVariance', 30] }] }] }, 2] },
                                variance: { $round: ['$pressureVariance', 3] },
                                range: {
                                    min: { $round: ['$minPressure', 2] },
                                    max: { $round: ['$maxPressure', 2] }
                                }
                            },
                            flowConsistency: {
                                avgFlowRate: { $round: ['$avgFlowRate', 3] },
                                consumptionPattern: { $round: [{ $divide: ['$totalConsumption', '$readingCount'] }, 3] }
                            },
                            temperature: {
                                avg: { $round: ['$avgTemperature', 2] },
                                min: { $round: ['$minTemperature', 2] },
                                max: { $round: ['$maxTemperature', 2] },
                                withinNormalRange: {
                                    $and: [
                                        { $gte: ['$avgTemperature', 5] },
                                        { $lte: ['$avgTemperature', 25] }
                                    ]
                                }
                            },
                            reliability: {
                                batteryHealth: { $round: ['$avgBattery', 2] },
                                leakEvents: '$leakCount',
                                anomalyRate: { $round: [{ $multiply: [{ $divide: ['$anomalousReadings', '$readingCount'] }, 100] }, 2] }
                            }
                        },
                        overallQualityScore: {
                            $round: [
                                {
                                    $max: [
                                        0,
                                        {
                                            $min: [
                                                100,
                                                {
                                                    $subtract: [
                                                        100,
                                                        {
                                                            $add: [
                                                                // Penalizar pressão fora do normal
                                                                { $cond: [{ $or: [{ $lt: ['$avgPressure', 2] }, { $gt: ['$avgPressure', 4] }] }, 20, 0] },
                                                                // Penalizar alta variância de pressão
                                                                { $cond: [{ $gt: ['$pressureVariance', 0.5] }, 15, 0] },
                                                                // Penalizar temperatura fora do normal
                                                                { $cond: [{ $not: [{ $and: [{ $gte: ['$avgTemperature', 5] }, { $lte: ['$avgTemperature', 25] }] }] }, 15, 0] },
                                                                // Penalizar vazamentos
                                                                { $multiply: ['$leakCount', 10] },
                                                                // Penalizar muitas leituras anômalas
                                                                { $cond: [{ $gt: [{ $divide: ['$anomalousReadings', '$readingCount'] }, 0.1] }, 20, 0] },
                                                                // Penalizar bateria baixa
                                                                { $cond: [{ $lt: ['$avgBattery', 50] }, 10, 0] }
                                                            ]
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                },
                                1
                            ]
                        }
                    }
                },
                { $sort: { overallQualityScore: -1 } }
            ]).toArray();

        // Análise por região
        const regionalSummary = await db.collection('water_telemetry')
            .aggregate([
                { $match: { timestamp: { $gte: startTime, $lte: endTime } } },
                {
                    $lookup: {
                        from: 'water_devices',
                        localField: 'deviceId',
                        foreignField: 'deviceId',
                        as: 'device'
                    }
                },
                { $unwind: '$device' },
                ...(region ? [{ $match: { 'device.region': region } }] : []),
                {
                    $group: {
                        _id: '$device.region',
                        totalDevices: { $addToSet: '$deviceId' },
                        avgPressure: { $avg: '$pressure' },
                        avgTemperature: { $avg: '$temperature' },
                        totalConsumption: { $sum: '$consumption' },
                        totalLeaks: { $sum: { $cond: [{ $eq: ['$leakDetected', true] }, 1, 0] } },
                        avgBattery: { $avg: '$battery' }
                    }
                },
                {
                    $project: {
                        region: '$_id',
                        deviceCount: { $size: '$totalDevices' },
                        avgPressure: { $round: ['$avgPressure', 2] },
                        avgTemperature: { $round: ['$avgTemperature', 2] },
                        totalConsumption: { $round: ['$totalConsumption', 2] },
                        consumptionPerDevice: { $round: [{ $divide: ['$totalConsumption', { $size: '$totalDevices' }] }, 2] },
                        leakIncidents: '$totalLeaks',
                        avgBatteryHealth: { $round: ['$avgBattery', 2] }
                    }
                }
            ]).toArray();

        // Calcular estatísticas gerais
        const summary = {
            totalDevices: qualityAnalysis.length,
            avgQualityScore: Math.round(qualityAnalysis.reduce((sum, device) => sum + device.overallQualityScore, 0) / qualityAnalysis.length * 100) / 100,
            excellentQuality: qualityAnalysis.filter(d => d.overallQualityScore >= 90).length,
            goodQuality: qualityAnalysis.filter(d => d.overallQualityScore >= 70 && d.overallQualityScore < 90).length,
            poorQuality: qualityAnalysis.filter(d => d.overallQualityScore < 70).length,
            totalLeaks: qualityAnalysis.reduce((sum, device) => sum + device.qualityMetrics.reliability.leakEvents, 0),
            devicesNeedingAttention: qualityAnalysis.filter(d => d.overallQualityScore < 80).length
        };

        const result: any = {
            period: { startTime, endTime },
            summary,
            regionalSummary,
            qualityAnalysis: qualityAnalysis.slice(0, 100) // Limitar resultado
        };

        // Adicionar alertas se solicitado
        if (includeAlerts) {
            result.alerts = {
                critical: [],
                warning: [],
                info: []
            };

            // Alertas críticos
            const criticalDevices = qualityAnalysis.filter(d => d.overallQualityScore < 50);
            if (criticalDevices.length > 0) {
                result.alerts.critical.push({
                    type: 'water_quality_critical',
                    message: `${criticalDevices.length} dispositivos com qualidade crítica da água`,
                    devices: criticalDevices.slice(0, 5).map(d => d.deviceId),
                    priority: 'immediate'
                });
            }

            const leakDevices = qualityAnalysis.filter(d => d.qualityMetrics.reliability.leakEvents > 0);
            if (leakDevices.length > 0) {
                result.alerts.critical.push({
                    type: 'active_leaks',
                    message: `${leakDevices.length} dispositivos com vazamentos detectados`,
                    totalLeaks: leakDevices.reduce((sum, d) => sum + d.qualityMetrics.reliability.leakEvents, 0),
                    priority: 'immediate'
                });
            }

            // Alertas de aviso
            const lowBatteryDevices = qualityAnalysis.filter(d => d.qualityMetrics.reliability.batteryHealth < 30);
            if (lowBatteryDevices.length > 0) {
                result.alerts.warning.push({
                    type: 'low_battery',
                    message: `${lowBatteryDevices.length} dispositivos com bateria baixa`,
                    devices: lowBatteryDevices.slice(0, 10).map(d => d.deviceId),
                    priority: 'medium'
                });
            }

            const highAnomalyDevices = qualityAnalysis.filter(d => d.qualityMetrics.reliability.anomalyRate > 20);
            if (highAnomalyDevices.length > 0) {
                result.alerts.warning.push({
                    type: 'high_anomaly_rate',
                    message: `${highAnomalyDevices.length} dispositivos com alta taxa de anomalias`,
                    priority: 'medium'
                });
            }

            // Alertas informativos
            if (summary.avgQualityScore >= 85) {
                result.alerts.info.push({
                    type: 'good_performance',
                    message: `Qualidade geral da água está excelente: ${summary.avgQualityScore}%`,
                    priority: 'low'
                });
            }
        }

        logger.info(`Relatório de qualidade da água gerado para ${summary.totalDevices} dispositivos`);
        return {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
        };
    }
);

// Ferramenta: Análise correlacionada entre tipos de dispositivos
server.tool(
    'getCrossDeviceAnalysis',
    {
        startTime: z.number(),
        endTime: z.number(),
        region: z.string().optional(),
        analysisType: z.enum(['consumption', 'efficiency', 'maintenance', 'environmental']).optional()
    },
    async ({ startTime, endTime, region, analysisType = 'consumption' }) => {
        logger.info(`getCrossDeviceAnalysis chamada com startTime=${startTime}, endTime=${endTime}, region=${region}, analysisType=${analysisType}`);

        // Análise de correlação entre diferentes tipos de dispositivos
        const correlationAnalysis: any = {
            period: { startTime, endTime },
            region: region || 'all',
            analysisType,
            correlations: {}
        };

        if (analysisType === 'consumption') {
            // Correlação entre consumo de energia, água e gás
            const energyData = await db.collection('lighting_telemetry')
                .aggregate([
                    { $match: { timestamp: { $gte: startTime, $lte: endTime } } },
                    {
                        $lookup: {
                            from: 'lighting_devices',
                            localField: 'deviceId',
                            foreignField: 'deviceId',
                            as: 'device'
                        }
                    },
                    { $unwind: '$device' },
                    ...(region ? [{ $match: { 'device.region': region } }] : []),
                    {
                        $group: {
                            _id: {
                                region: '$device.region',
                                timeSlot: { $subtract: ['$timestamp', { $mod: ['$timestamp', 3600] }] } // Agrupado por hora
                            },
                            totalEnergyConsumption: { $sum: '$powerConsumption' },
                            avgTemperature: { $avg: '$temp' },
                            deviceCount: { $addToSet: '$deviceId' }
                        }
                    },
                    {
                        $project: {
                            region: '$_id.region',
                            timeSlot: '$_id.timeSlot',
                            totalEnergyConsumption: { $round: ['$totalEnergyConsumption', 2] },
                            avgTemperature: { $round: ['$avgTemperature', 2] },
                            deviceCount: { $size: '$deviceCount' }
                        }
                    }
                ]).toArray();

            const waterData = await db.collection('water_telemetry')
                .aggregate([
                    { $match: { timestamp: { $gte: startTime, $lte: endTime } } },
                    {
                        $lookup: {
                            from: 'water_devices',
                            localField: 'deviceId',
                            foreignField: 'deviceId',
                            as: 'device'
                        }
                    },
                    { $unwind: '$device' },
                    ...(region ? [{ $match: { 'device.region': region } }] : []),
                    {
                        $group: {
                            _id: {
                                region: '$device.region',
                                timeSlot: { $subtract: ['$timestamp', { $mod: ['$timestamp', 3600] }] }
                            },
                            totalWaterConsumption: { $sum: '$consumption' },
                            avgFlowRate: { $avg: '$flowRate' },
                            leakCount: { $sum: { $cond: [{ $eq: ['$leakDetected', true] }, 1, 0] } },
                            deviceCount: { $addToSet: '$deviceId' }
                        }
                    },
                    {
                        $project: {
                            region: '$_id.region',
                            timeSlot: '$_id.timeSlot',
                            totalWaterConsumption: { $round: ['$totalWaterConsumption', 2] },
                            avgFlowRate: { $round: ['$avgFlowRate', 3] },
                            leakCount: '$leakCount',
                            deviceCount: { $size: '$deviceCount' }
                        }
                    }
                ]).toArray();

            const gasData = await db.collection('gas_telemetry')
                .aggregate([
                    { $match: { timestamp: { $gte: startTime, $lte: endTime } } },
                    {
                        $lookup: {
                            from: 'gas_devices',
                            localField: 'deviceId',
                            foreignField: 'deviceId',
                            as: 'device'
                        }
                    },
                    { $unwind: '$device' },
                    ...(region ? [{ $match: { 'device.region': region } }] : []),
                    {
                        $group: {
                            _id: {
                                region: '$device.region',
                                timeSlot: { $subtract: ['$timestamp', { $mod: ['$timestamp', 3600] }] }
                            },
                            totalGasConsumption: { $sum: '$consumption' },
                            avgFlowRate: { $avg: '$flowRate' },
                            leakCount: { $sum: { $cond: [{ $eq: ['$leakDetected', true] }, 1, 0] } },
                            deviceCount: { $addToSet: '$deviceId' }
                        }
                    },
                    {
                        $project: {
                            region: '$_id.region',
                            timeSlot: '$_id.timeSlot',
                            totalGasConsumption: { $round: ['$totalGasConsumption', 3] },
                            avgFlowRate: { $round: ['$avgFlowRate', 3] },
                            leakCount: '$leakCount',
                            deviceCount: { $size: '$deviceCount' }
                        }
                    }
                ]).toArray();

            // Encontrar padrões de consumo correlacionados
            const consumptionPatterns = [];
            const regions = [...new Set([...energyData.map(d => d.region), ...waterData.map(d => d.region), ...gasData.map(d => d.region)])];

            for (const reg of regions) {
                const regionEnergyData = energyData.filter(d => d.region === reg);
                const regionWaterData = waterData.filter(d => d.region === reg);
                const regionGasData = gasData.filter(d => d.region === reg);

                const totalEnergy = regionEnergyData.reduce((sum, d) => sum + d.totalEnergyConsumption, 0);
                const totalWater = regionWaterData.reduce((sum, d) => sum + d.totalWaterConsumption, 0);
                const totalGas = regionGasData.reduce((sum, d) => sum + d.totalGasConsumption, 0);

                const energyPerDevice = regionEnergyData.length > 0 ? totalEnergy / regionEnergyData.reduce((sum, d) => sum + d.deviceCount, 0) : 0;
                const waterPerDevice = regionWaterData.length > 0 ? totalWater / regionWaterData.reduce((sum, d) => sum + d.deviceCount, 0) : 0;
                const gasPerDevice = regionGasData.length > 0 ? totalGas / regionGasData.reduce((sum, d) => sum + d.deviceCount, 0) : 0;

                consumptionPatterns.push({
                    region: reg,
                    totals: {
                        energy: Math.round(totalEnergy * 100) / 100,
                        water: Math.round(totalWater * 100) / 100,
                        gas: Math.round(totalGas * 1000) / 1000
                    },
                    perDevice: {
                        energy: Math.round(energyPerDevice * 100) / 100,
                        water: Math.round(waterPerDevice * 100) / 100,
                        gas: Math.round(gasPerDevice * 1000) / 1000
                    },
                    leaks: {
                        water: regionWaterData.reduce((sum, d) => sum + d.leakCount, 0),
                        gas: regionGasData.reduce((sum, d) => sum + d.leakCount, 0)
                    },
                    deviceCounts: {
                        lighting: regionEnergyData.reduce((sum, d) => sum + d.deviceCount, 0),
                        water: regionWaterData.reduce((sum, d) => sum + d.deviceCount, 0),
                        gas: regionGasData.reduce((sum, d) => sum + d.deviceCount, 0)
                    }
                });
            }

            correlationAnalysis.consumptionPatterns = consumptionPatterns;

            // Calcular correlações
            correlationAnalysis.correlations = {
                energyWaterRatio: consumptionPatterns.map(p => ({
                    region: p.region,
                    ratio: p.totals.water > 0 ? Math.round((p.totals.energy / p.totals.water) * 100) / 100 : 0,
                    classification: p.totals.water > 0 && (p.totals.energy / p.totals.water) > 100 ? 'high_energy_consumption' : 'balanced'
                })),
                leakImpact: consumptionPatterns.map(p => ({
                    region: p.region,
                    totalLeaks: p.leaks.water + p.leaks.gas,
                    leakDensity: Math.round(((p.leaks.water + p.leaks.gas) / (p.deviceCounts.water + p.deviceCounts.gas)) * 10000) / 10000,
                    riskLevel: ((p.leaks.water + p.leaks.gas) / (p.deviceCounts.water + p.deviceCounts.gas)) > 0.01 ? 'high' : 'low'
                })),
                efficiencyMetrics: consumptionPatterns.map(p => ({
                    region: p.region,
                    energyEfficiency: p.deviceCounts.lighting > 0 ? Math.round((p.totals.energy / p.deviceCounts.lighting) * 100) / 100 : 0,
                    waterEfficiency: p.deviceCounts.water > 0 ? Math.round((p.totals.water / p.deviceCounts.water) * 100) / 100 : 0,
                    gasEfficiency: p.deviceCounts.gas > 0 ? Math.round((p.totals.gas / p.deviceCounts.gas) * 1000) / 1000 : 0
                }))
            };

            // Adicionar insights baseados em padrões de consumo
            correlationAnalysis.insights = [];

            const highEnergyRegions = correlationAnalysis.correlations.energyWaterRatio.filter((r: any) => r.classification === 'high_energy_consumption');
            if (highEnergyRegions.length > 0) {
                correlationAnalysis.insights.push({
                    type: 'energy_optimization',
                    message: `${highEnergyRegions.length} região(ões) com alto consumo energético relativo`,
                    regions: highEnergyRegions.map((r: any) => r.region),
                    recommendation: 'Considerar otimização dos sistemas de iluminação nessas regiões'
                });
            }

            const highRiskRegions = correlationAnalysis.correlations.leakImpact.filter((r: any) => r.riskLevel === 'high');
            if (highRiskRegions.length > 0) {
                correlationAnalysis.insights.push({
                    type: 'leak_prevention',
                    message: `${highRiskRegions.length} região(ões) com alta densidade de vazamentos`,
                    regions: highRiskRegions.map((r: any) => r.region),
                    recommendation: 'Implementar manutenção preventiva prioritária nessas regiões'
                });
            }

            // Encontrar padrões de correlação temporal
            const timeBasedCorrelations = energyData.map((e: any) => {
                const correspondingWater = waterData.find((w: any) => w.timeSlot === e.timeSlot && w.region === e.region);
                const correspondingGas = gasData.find((g: any) => g.timeSlot === e.timeSlot && g.region === e.region);

                return {
                    timeSlot: e.timeSlot,
                    region: e.region,
                    energyConsumption: e.totalEnergyConsumption,
                    waterConsumption: correspondingWater?.totalWaterConsumption || 0,
                    gasConsumption: correspondingGas?.totalGasConsumption || 0,
                    hasCorrelation: correspondingWater && correspondingGas
                };
            }).filter((c: any) => c.hasCorrelation);

            correlationAnalysis.temporalCorrelations = timeBasedCorrelations.slice(0, 50); // Limitar resultado
        }

        logger.info(`Análise correlacionada entre dispositivos gerada para tipo ${analysisType}`);
        return {
            content: [{ type: 'text', text: JSON.stringify(correlationAnalysis, null, 2) }]
        };
    }
);

// Inicia o servidor
async function startServer() {
    try {
        logger.info('Conectando ao MongoDB...');
        await connectToMongo();
        logger.info('Criando transporte...');
        const transport = new StdioServerTransport();
        logger.info('Conectando servidor ao transporte...');
        await server.connect(transport);
        logger.info('Servidor MCP rodando...');

        // Mantém o processo rodando
        process.stdin.resume();

        // Adiciona handlers para debug
        process.on('SIGINT', () => {
            logger.info('Recebido SIGINT');
            process.exit(0);
        });

        process.on('SIGTERM', () => {
            logger.info('Recebido SIGTERM');
            process.exit(0);
        });

        process.on('uncaughtException', (error) => {
            logger.error('Erro não capturado:', error);
            process.exit(1);
        });
    } catch (error) {
        logger.error('Erro ao iniciar o servidor:', error);
        process.exit(1);
    }
}

startServer().catch(error => {
    logger.error('Erro ao iniciar o servidor:', error);
    process.exit(1);
});