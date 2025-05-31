import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { MongoClient, Db } from 'mongodb';
import * as fs from 'fs/promises';
import * as path from 'path';
import pdfParse from 'pdf-parse';
import { z } from 'zod';

// Configuração
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/admin';
const PDF_DIR = path.join(__dirname, '../docs');
const client = new MongoClient(MONGO_URI);
let db: Db;

console.log('Iniciando servidor MCP...');

// Inicializa o servidor MCP
const server = new McpServer({
    name: 'SmartCityIotServer',
    version: '1.0.0'
});

console.log('Servidor MCP criado');

// Conexão ao MongoDB
async function connectToMongo() {
    try {
        await client.connect();
        db = client.db('smart_city_iot');
        console.log('Conectado ao MongoDB');
    } catch (error) {
        console.error('Erro ao conectar ao MongoDB:', error);
        process.exit(1);
    }
}

// Implementa o método de descoberta
server.resource(
    'listOfferings',
    'mcp://listOfferings',
    async () => {
        console.log('ListOfferings chamado');
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
        title: 'Listar Dispositivos de Iluminação',
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
        title: 'Consultar Telemetria de Iluminação',
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
        title: 'Analisar Consumo de Energia',
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
        title: 'Detectar Vazamentos de Água',
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
        title: 'Analisar Consumo de Gás',
        region: z.string(),
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
        console.log('Conectando ao MongoDB...');
        await connectToMongo();
        console.log('Criando transporte...');
        const transport = new StdioServerTransport();
        console.log('Conectando servidor ao transporte...');
        await server.connect(transport);
        console.log('Servidor MCP rodando...');

        // Mantém o processo rodando
        process.stdin.resume();

        // Adiciona handlers para debug
        process.on('SIGINT', () => {
            console.log('Recebido SIGINT');
            process.exit(0);
        });

        process.on('SIGTERM', () => {
            console.log('Recebido SIGTERM');
            process.exit(0);
        });

        process.on('uncaughtException', (error) => {
            console.error('Erro não capturado:', error);
            process.exit(1);
        });
    } catch (error) {
        console.error('Erro ao iniciar o servidor:', error);
        process.exit(1);
    }
}

startServer().catch(error => {
    console.error('Erro ao iniciar o servidor:', error);
    process.exit(1);
});