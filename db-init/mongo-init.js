// Criar o banco de dados
db = db.getSiblingDB('smart_city_iot');

// Criar coleções
db.createCollection('lighting_devices');
db.createCollection('water_devices');
db.createCollection('gas_devices');
db.createCollection('lighting_telemetry');
db.createCollection('water_telemetry');
db.createCollection('gas_telemetry');

// Criar índices
db.lighting_telemetry.createIndex({ deviceId: 1, timestamp: 1 });
db.water_telemetry.createIndex({ deviceId: 1, timestamp: 1 });
db.gas_telemetry.createIndex({ deviceId: 1, timestamp: 1 });

// Mudar para o banco admin para criar o usuário
db = db.getSiblingDB('admin');

// Criar usuário com permissões para todos os bancos
db.createUser({
    user: 'cursor-mcp-client',
    pwd: 'cursor-mcp-password',
    roles: [
        { role: 'readWrite', db: 'smart_city_iot' },
        { role: 'dbAdmin', db: 'smart_city_iot' },
        { role: 'userAdmin', db: 'smart_city_iot' }
    ]
});
