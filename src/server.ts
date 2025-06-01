import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { MongoClient, Db } from 'mongodb';
import * as fs from 'fs/promises';
import * as path from 'path';
import pdfParse from 'pdf-parse';
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
            filename: 'logs/server.log',
            maxSize: '100k', // Aproximadamente 1000 linhas
            maxFiles: '10',
            zippedArchive: true
        })
    ]
});

// Log explícito para testar criação do arquivo
logger.info('Teste de criação de log: Winston está funcionando!');

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
                                    status: { type: 'string', optional: true }
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
        status: z.string().optional()
    },
    async ({ region, status }) => {
        const query: any = {};
        if (region) query.region = region;
        if (status) query.status = status;

        const devices = await db.collection('lighting_devices').find(query).toArray();
        return {
            content: [{ type: 'text', text: JSON.stringify(devices, null, 2) }]
        };
    }
);

// Ferramenta: Consulta telemetria de iluminação
server.tool(
    'getLightingTelemetry',
    {
        deviceId: z.string(),
        startTime: z.number(),
        endTime: z.number()
    },
    async ({ deviceId, startTime, endTime }) => {
        const telemetry = await db.collection('lighting_telemetry')
            .find({
                deviceId,
                timestamp: { $gte: startTime, $lte: endTime }
            })
            .sort({ timestamp: 1 })
            .toArray();

        return {
            content: [{ type: 'text', text: JSON.stringify(telemetry, null, 2) }]
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
        endTime: z.number()
    },
    async ({ startTime, endTime }) => {
        const leaks = await db.collection('water_telemetry')
            .find({
                timestamp: { $gte: startTime, $lte: endTime },
                leakDetected: true
            })
            .toArray();

        return {
            content: [{ type: 'text', text: JSON.stringify(leaks, null, 2) }]
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