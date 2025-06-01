const { MongoClient } = require('mongodb');
const ProgressBar = require('progress');
require('dotenv').config();

// Configurações
const MONGODB_URI = 'mongodb://cursor-mcp-client:cursor-mcp-password@localhost:27017/admin';
const DB_NAME = 'smart_city_iot';

// Quantidade de dispositivos
const LIGHTING_DEVICES = 10000;
const WATER_DEVICES = 50000;
const GAS_DEVICES = 50000;

// Configuração de tempo
const THREE_MONTHS_IN_DAYS = 90;
const READINGS_PER_DAY = 10;
const TOTAL_READINGS = THREE_MONTHS_IN_DAYS * READINGS_PER_DAY;

// Regiões do Brasil com suas coordenadas centrais
const BRAZIL_REGIONS = [
    // Sudeste
    { name: 'São Paulo', lat: -23.5505, lon: -46.6333, radius: 0.5 },
    { name: 'Rio de Janeiro', lat: -22.9068, lon: -43.1729, radius: 0.4 },
    { name: 'Belo Horizonte', lat: -19.9167, lon: -43.9345, radius: 0.3 },
    { name: 'Vitória', lat: -20.2976, lon: -40.2958, radius: 0.2 },

    // Sul
    { name: 'Curitiba', lat: -25.4284, lon: -49.2733, radius: 0.3 },
    { name: 'Porto Alegre', lat: -30.0346, lon: -51.2177, radius: 0.3 },
    { name: 'Florianópolis', lat: -27.5969, lon: -48.5495, radius: 0.2 },

    // Nordeste
    { name: 'Salvador', lat: -12.9714, lon: -38.5014, radius: 0.4 },
    { name: 'Recife', lat: -8.0476, lon: -34.8770, radius: 0.3 },
    { name: 'Fortaleza', lat: -3.7319, lon: -38.5267, radius: 0.3 },
    { name: 'Natal', lat: -5.7945, lon: -35.2010, radius: 0.2 },

    // Norte
    { name: 'Manaus', lat: -3.1190, lon: -60.0217, radius: 0.4 },
    { name: 'Belém', lat: -1.4557, lon: -48.4902, radius: 0.3 },
    { name: 'Porto Velho', lat: -8.7612, lon: -63.9004, radius: 0.2 },

    // Centro-Oeste
    { name: 'Brasília', lat: -15.7975, lon: -47.8919, radius: 0.4 },
    { name: 'Goiânia', lat: -16.6869, lon: -49.2648, radius: 0.3 },
    { name: 'Cuiabá', lat: -15.6014, lon: -56.0979, radius: 0.2 }
];

// Funções auxiliares
function generateDeviceId(prefix, index) {
    return `${prefix}-${String(index).padStart(6, '0')}`;
}

function generateUniqueCoordinates(usedCoordinates, region) {
    let attempts = 0;
    const maxAttempts = 100;

    while (attempts < maxAttempts) {
        // Gera coordenadas dentro do raio da região
        const lat = region.lat + (Math.random() * 2 - 1) * region.radius;
        const lon = region.lon + (Math.random() * 2 - 1) * region.radius;

        // Verifica se as coordenadas são únicas
        const coordKey = `${lat.toFixed(4)},${lon.toFixed(4)}`;
        if (!usedCoordinates.has(coordKey)) {
            usedCoordinates.add(coordKey);
            return { latitude: lat, longitude: lon };
        }

        attempts++;
    }

    // Se não conseguir coordenadas únicas, tenta outra região
    const newRegion = BRAZIL_REGIONS[Math.floor(Math.random() * BRAZIL_REGIONS.length)];
    return generateUniqueCoordinates(usedCoordinates, newRegion);
}

// Conjunto para armazenar coordenadas já utilizadas
const usedCoordinates = new Set();

function generateTimestamps() {
    const timestamps = [];
    const now = Math.floor(Date.now() / 1000);
    const threeMonthsAgo = now - (THREE_MONTHS_IN_DAYS * 24 * 60 * 60);

    for (let day = 0; day < THREE_MONTHS_IN_DAYS; day++) {
        const dayStart = threeMonthsAgo + (day * 24 * 60 * 60);
        for (let reading = 0; reading < READINGS_PER_DAY; reading++) {
            const timeOffset = Math.floor((reading * 24 * 60 * 60) / READINGS_PER_DAY);
            timestamps.push(dayStart + timeOffset);
        }
    }

    return timestamps;
}

function generateLightingTelemetry(deviceId, timestamp, coords, previousData = null) {
    const baseVoltage = 220 + (Math.random() * 10 - 5);
    const powerFactor = 0.85 + (Math.random() * 0.1);
    const current = (previousData?.current || 0.5) + (Math.random() * 0.2 - 0.1);
    const power = baseVoltage * current * powerFactor;
    const energyAcc = (previousData?.energyAcc || 0) + (power * 0.1);

    return {
        deviceId,
        timestamp,
        temp: 25 + (Math.random() * 10 - 5),
        state: Math.random() > 0.1 ? 1 : 0,
        current: Math.max(0.1, current),
        voltage: baseVoltage,
        energyAcc: Math.round(energyAcc * 100) / 100,
        powerFactor: Math.round(powerFactor * 100) / 100,
        coords,
        lux: 100 + (Math.random() * 900),
        powerConsumption: Math.round(power * 100) / 100,
        operatingHours: (previousData?.operatingHours || 0) + (Math.random() * 0.1)
    };
}

function generateWaterTelemetry(deviceId, timestamp, coords, previousData = null) {
    const pulseCount = (previousData?.pulseCounter || 0) + Math.floor(Math.random() * 10);
    return {
        deviceId,
        timestamp,
        pulseCounter: pulseCount,
        flowRate: Math.random() * 2,
        battery: 80 + (Math.random() * 20),
        pressure: 2 + (Math.random() * 3),
        temperature: 15 + (Math.random() * 10),
        coords,
        consumption: pulseCount * 0.1,
        leakDetected: Math.random() > 0.95
    };
}

function generateGasTelemetry(deviceId, timestamp, coords, previousData = null) {
    const pulseCount = (previousData?.pulseCounter || 0) + Math.floor(Math.random() * 5);
    return {
        deviceId,
        timestamp,
        pulseCounter: pulseCount,
        flowRate: Math.random() * 1.5,
        battery: 80 + (Math.random() * 20),
        pressure: 0.5 + (Math.random() * 0.5),
        temperature: 20 + (Math.random() * 5),
        coords,
        consumption: pulseCount * 0.01,
        leakDetected: Math.random() > 0.98
    };
}

async function populateDatabase() {
    const client = new MongoClient(MONGODB_URI);

    try {
        await client.connect();
        console.log('Conectado ao MongoDB');

        const db = client.db(DB_NAME);

        // Populando dispositivos de iluminação
        console.log('\nPopulando dispositivos de iluminação...');
        const lightingBar = new ProgressBar('Progresso [:bar] :percent :etas', { total: LIGHTING_DEVICES });

        for (let i = 0; i < LIGHTING_DEVICES; i++) {
            const deviceId = generateDeviceId('LIGHT', i);
            const region = BRAZIL_REGIONS[Math.floor(Math.random() * BRAZIL_REGIONS.length)];
            const coords = generateUniqueCoordinates(usedCoordinates, region);

            await db.collection('lighting_devices').insertOne({
                deviceId,
                type: 'street_light',
                installationDate: new Date(),
                lastMaintenance: new Date(),
                coords,
                status: 'active',
                region: region.name
            });

            const timestamps = generateTimestamps();
            let previousData = null;

            for (const timestamp of timestamps) {
                const telemetry = generateLightingTelemetry(deviceId, timestamp, coords, previousData);
                await db.collection('lighting_telemetry').insertOne(telemetry);
                previousData = telemetry;
            }

            lightingBar.tick();
        }

        // Populando dispositivos de água
        console.log('\nPopulando dispositivos de água...');
        const waterBar = new ProgressBar('Progresso [:bar] :percent :etas', { total: WATER_DEVICES });

        for (let i = 0; i < WATER_DEVICES; i++) {
            const deviceId = generateDeviceId('WATER', i);
            const region = BRAZIL_REGIONS[Math.floor(Math.random() * BRAZIL_REGIONS.length)];
            const coords = generateUniqueCoordinates(usedCoordinates, region);

            await db.collection('water_devices').insertOne({
                deviceId,
                type: 'water_meter',
                installationDate: new Date(),
                lastMaintenance: new Date(),
                coords,
                status: 'active',
                region: region.name
            });

            const timestamps = generateTimestamps();
            let previousData = null;

            for (const timestamp of timestamps) {
                const telemetry = generateWaterTelemetry(deviceId, timestamp, coords, previousData);
                await db.collection('water_telemetry').insertOne(telemetry);
                previousData = telemetry;
            }

            waterBar.tick();
        }

        // Populando dispositivos de gás
        console.log('\nPopulando dispositivos de gás...');
        const gasBar = new ProgressBar('Progresso [:bar] :percent :etas', { total: GAS_DEVICES });

        for (let i = 0; i < GAS_DEVICES; i++) {
            const deviceId = generateDeviceId('GAS', i);
            const region = BRAZIL_REGIONS[Math.floor(Math.random() * BRAZIL_REGIONS.length)];
            const coords = generateUniqueCoordinates(usedCoordinates, region);

            await db.collection('gas_devices').insertOne({
                deviceId,
                type: 'gas_meter',
                installationDate: new Date(),
                lastMaintenance: new Date(),
                coords,
                status: 'active',
                region: region.name
            });

            const timestamps = generateTimestamps();
            let previousData = null;

            for (const timestamp of timestamps) {
                const telemetry = generateGasTelemetry(deviceId, timestamp, coords, previousData);
                await db.collection('gas_telemetry').insertOne(telemetry);
                previousData = telemetry;
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