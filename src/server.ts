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