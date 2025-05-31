const { MongoClient } = require('mongodb');
const ProgressBar = require('progress');
require('dotenv').config();

// Configurações
const MONGODB_URI = 'mongodb://cursor-mcp-client:cursor-mcp-password@localhost:27017/smart_city_iot?authSource=admin';
const DB_NAME = 'smart_city_iot';

// Quantidade de dispositivos
const LIGHTING_DEVICES = 50000;
const WATER_DEVICES = 50000;
const GAS_DEVICES = 50000;

// Funções auxiliares
function generateDeviceId(prefix, index) {
    return `${prefix}-${String(index).padStart(6, '0')}`;
}

function generateCoordinates() {
    return {
        latitude: -23.5505 + (Math.random() * 0.1),
        longitude: -46.6333 + (Math.random() * 0.1)
    };
}

function generateLightingTelemetry(deviceId, previousData = null) {
    const baseVoltage = 220 + (Math.random() * 10 - 5); // Variação de ±5V
    const powerFactor = 0.85 + (Math.random() * 0.1); // Entre 0.85 e 0.95
    const current = (previousData?.current || 0.5) + (Math.random() * 0.2 - 0.1); // Variação gradual
    const power = baseVoltage * current * powerFactor;
    const energyAcc = (previousData?.energyAcc || 0) + (power * 0.1); // Acumula energia

    return {
        deviceId,
        timestamp: new Date(),
        temp: 25 + (Math.random() * 10 - 5), // Temperatura entre 20-30°C
        state: Math.random() > 0.1 ? 1 : 0, // 90% de chance de estar ligado
        current: Math.max(0.1, current), // Mínimo de 0.1A
        voltage: baseVoltage,
        energyAcc: Math.round(energyAcc * 100) / 100,
        powerFactor: Math.round(powerFactor * 100) / 100,
        coords: generateCoordinates(),
        lux: 100 + (Math.random() * 900), // Nível de iluminação em lux
        powerConsumption: Math.round(power * 100) / 100,
        operatingHours: (previousData?.operatingHours || 0) + (Math.random() * 0.1)
    };
}

function generateWaterTelemetry(deviceId, previousData = null) {
    const pulseCount = (previousData?.pulseCounter || 0) + Math.floor(Math.random() * 10);
    return {
        deviceId,
        timestamp: new Date(),
        pulseCounter: pulseCount,
        flowRate: Math.random() * 2, // L/s
        battery: 80 + (Math.random() * 20), // 80-100%
        pressure: 2 + (Math.random() * 3), // 2-5 bar
        temperature: 15 + (Math.random() * 10), // 15-25°C
        coords: generateCoordinates(),
        consumption: pulseCount * 0.1, // Cada pulso = 0.1L
        leakDetected: Math.random() > 0.95 // 5% de chance de vazamento
    };
}

function generateGasTelemetry(deviceId, previousData = null) {
    const pulseCount = (previousData?.pulseCounter || 0) + Math.floor(Math.random() * 5);
    return {
        deviceId,
        timestamp: new Date(),
        pulseCounter: pulseCount,
        flowRate: Math.random() * 1.5, // m³/h
        battery: 80 + (Math.random() * 20), // 80-100%
        pressure: 0.5 + (Math.random() * 0.5), // 0.5-1 bar
        temperature: 20 + (Math.random() * 5), // 20-25°C
        coords: generateCoordinates(),
        consumption: pulseCount * 0.01, // Cada pulso = 0.01m³
        leakDetected: Math.random() > 0.98 // 2% de chance de vazamento
    };
}

async function populateDatabase() {
    const client = new MongoClient(MONGODB_URI);

    try {
        await client.connect();
        console.log('Conectado ao MongoDB');

        const db = client.db(DB_NAME);

        // Criar coleções
        await db.createCollection('lighting_devices');
        await db.createCollection('water_devices');
        await db.createCollection('gas_devices');
        await db.createCollection('lighting_telemetry');
        await db.createCollection('water_telemetry');
        await db.createCollection('gas_telemetry');

        // Criar índices
        await db.collection('lighting_telemetry').createIndex({ deviceId: 1, timestamp: 1 });
        await db.collection('water_telemetry').createIndex({ deviceId: 1, timestamp: 1 });
        await db.collection('gas_telemetry').createIndex({ deviceId: 1, timestamp: 1 });

        // Populando dispositivos de iluminação
        console.log('\nPopulando dispositivos de iluminação...');
        const lightingBar = new ProgressBar('Progresso [:bar] :percent :etas', { total: LIGHTING_DEVICES });

        for (let i = 0; i < LIGHTING_DEVICES; i++) {
            const deviceId = generateDeviceId('LIGHT', i);
            await db.collection('lighting_devices').insertOne({
                deviceId,
                type: 'street_light',
                installationDate: new Date(),
                lastMaintenance: new Date(),
                coords: generateCoordinates(),
                status: 'active'
            });

            // Gerar 24 registros de telemetria (um por hora)
            for (let j = 0; j < 24; j++) {
                const telemetry = generateLightingTelemetry(deviceId);
                await db.collection('lighting_telemetry').insertOne(telemetry);
            }

            lightingBar.tick();
        }

        // Populando dispositivos de água
        console.log('\nPopulando dispositivos de água...');
        const waterBar = new ProgressBar('Progresso [:bar] :percent :etas', { total: WATER_DEVICES });

        for (let i = 0; i < WATER_DEVICES; i++) {
            const deviceId = generateDeviceId('WATER', i);
            await db.collection('water_devices').insertOne({
                deviceId,
                type: 'water_meter',
                installationDate: new Date(),
                lastMaintenance: new Date(),
                coords: generateCoordinates(),
                status: 'active'
            });

            // Gerar 24 registros de telemetria
            for (let j = 0; j < 24; j++) {
                const telemetry = generateWaterTelemetry(deviceId);
                await db.collection('water_telemetry').insertOne(telemetry);
            }

            waterBar.tick();
        }

        // Populando dispositivos de gás
        console.log('\nPopulando dispositivos de gás...');
        const gasBar = new ProgressBar('Progresso [:bar] :percent :etas', { total: GAS_DEVICES });

        for (let i = 0; i < GAS_DEVICES; i++) {
            const deviceId = generateDeviceId('GAS', i);
            await db.collection('gas_devices').insertOne({
                deviceId,
                type: 'gas_meter',
                installationDate: new Date(),
                lastMaintenance: new Date(),
                coords: generateCoordinates(),
                status: 'active'
            });

            // Gerar 24 registros de telemetria
            for (let j = 0; j < 24; j++) {
                const telemetry = generateGasTelemetry(deviceId);
                await db.collection('gas_telemetry').insertOne(telemetry);
            }

            gasBar.tick();
        }

        console.log('\nPopulação do banco de dados concluída com sucesso!');

    } catch (error) {
        console.error('Erro:', error);
    } finally {
        await client.close();
    }
}

populateDatabase(); 