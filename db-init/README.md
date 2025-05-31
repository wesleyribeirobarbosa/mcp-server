# Banco de Dados IoT para Smart Cities

Este banco de dados simula dados de dispositivos IoT para uma cidade inteligente, incluindo iluminação pública, medidores de água e gás.

## Estrutura do Banco de Dados

O banco de dados `smart_city_iot` contém as seguintes coleções:

### Dispositivos
- `lighting_devices`: 10.000 dispositivos de iluminação pública
- `water_devices`: 50.000 medidores de água
- `gas_devices`: 50.000 medidores de gás

### Telemetria
- `lighting_telemetry`: Dados de telemetria dos postes de iluminação
- `water_telemetry`: Dados de telemetria dos medidores de água
- `gas_telemetry`: Dados de telemetria dos medidores de gás

## Esquema dos Dados

### Dispositivos de Iluminação Pública
```javascript
{
    deviceId: String,        // Formato: "LIGHT-XXXXXX"
    type: String,           // "street_light"
    installationDate: Date,
    lastMaintenance: Date,
    coords: {
        latitude: Number,
        longitude: Number
    },
    status: String          // "active"
}
```

### Telemetria de Iluminação
```javascript
{
    deviceId: String,
    timestamp: Date,
    temp: Number,           // Temperatura em °C (20-30°C)
    state: Number,          // 1 = ligado, 0 = desligado
    current: Number,        // Corrente em A (mínimo 0.1A)
    voltage: Number,        // Tensão em V (220V ±5V)
    energyAcc: Number,      // Energia acumulada em kWh
    powerFactor: Number,    // Fator de potência (0.85-0.95)
    coords: {
        latitude: Number,
        longitude: Number
    },
    lux: Number,            // Nível de iluminação (100-1000 lux)
    powerConsumption: Number, // Consumo de potência em W
    operatingHours: Number  // Horas de operação acumuladas
}
```

### Dispositivos de Água
```javascript
{
    deviceId: String,       // Formato: "WATER-XXXXXX"
    type: String,          // "water_meter"
    installationDate: Date,
    lastMaintenance: Date,
    coords: {
        latitude: Number,
        longitude: Number
    },
    status: String         // "active"
}
```

### Telemetria de Água
```javascript
{
    deviceId: String,
    timestamp: Date,
    pulseCounter: Number,  // Contador de pulsos acumulado
    flowRate: Number,      // Vazão em L/s (0-2 L/s)
    battery: Number,       // Nível de bateria (80-100%)
    pressure: Number,      // Pressão em bar (2-5 bar)
    temperature: Number,   // Temperatura em °C (15-25°C)
    coords: {
        latitude: Number,
        longitude: Number
    },
    consumption: Number,   // Consumo em litros
    leakDetected: Boolean  // Detecção de vazamento
}
```

### Dispositivos de Gás
```javascript
{
    deviceId: String,      // Formato: "GAS-XXXXXX"
    type: String,         // "gas_meter"
    installationDate: Date,
    lastMaintenance: Date,
    coords: {
        latitude: Number,
        longitude: Number
    },
    status: String        // "active"
}
```

### Telemetria de Gás
```javascript
{
    deviceId: String,
    timestamp: Date,
    pulseCounter: Number, // Contador de pulsos acumulado
    flowRate: Number,     // Vazão em m³/h (0-1.5 m³/h)
    battery: Number,      // Nível de bateria (80-100%)
    pressure: Number,     // Pressão em bar (0.5-1 bar)
    temperature: Number,  // Temperatura em °C (20-25°C)
    coords: {
        latitude: Number,
        longitude: Number
    },
    consumption: Number,  // Consumo em m³
    leakDetected: Boolean // Detecção de vazamento
}
```

## Índices

O banco de dados possui os seguintes índices para otimização de consultas:
- `lighting_telemetry`: { deviceId: 1, timestamp: 1 }
- `water_telemetry`: { deviceId: 1, timestamp: 1 }
- `gas_telemetry`: { deviceId: 1, timestamp: 1 }

## Características dos Dados

- Cada dispositivo gera 24 registros de telemetria (dados horários)
- Os dados são gerados de forma realista e consistente
- Valores acumulados (energia, contadores) são incrementados gradualmente
- Coordenadas são geradas em uma área realista de São Paulo
- Inclui detecção de anomalias (vazamentos)
- Dados de bateria, temperatura e pressão são monitorados

## Exemplos de Consultas Úteis

```javascript
// Encontrar postes com consumo anormal de energia
db.lighting_telemetry.find({
    powerConsumption: { $gt: 1000 }
})

// Identificar medidores de água com possível vazamento
db.water_telemetry.find({
    leakDetected: true
})

// Calcular consumo médio de gás por região
db.gas_telemetry.aggregate([
    {
        $group: {
            _id: "$deviceId",
            avgConsumption: { $avg: "$consumption" }
        }
    }
])
``` 