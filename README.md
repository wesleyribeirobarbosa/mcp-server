# Servidor MCP para Smart Cities

Este servidor MCP (Model Context Protocol) permite que IAs interajam com dados de dispositivos IoT de uma cidade inteligente, incluindo iluminação pública, medidores de água e gás.

## Configuração

1. Instale as dependências:
```bash
npm install
```

2. Configure as variáveis de ambiente (opcional):
```bash
MONGO_URI=mongodb://cursor-mcp-client:cursor-mcp-password@localhost:27017/smart_city_iot
```

3. Inicie o servidor:
```bash
npm start
```

## Ferramentas Disponíveis

### 1. Listar Dispositivos de Iluminação
```typescript
listLightingDevices({
    region?: string,    // Filtro opcional por região
    status?: string     // Filtro opcional por status
})
```
Retorna uma lista de dispositivos de iluminação pública com suas informações básicas.

### 2. Consultar Telemetria de Iluminação
```typescript
getLightingTelemetry({
    deviceId: string,   // ID do dispositivo
    startTime: number,  // Timestamp inicial (UNIX)
    endTime: number     // Timestamp final (UNIX)
})
```
Retorna dados de telemetria de um dispositivo específico em um período, incluindo:
- Temperatura
- Estado (ligado/desligado)
- Corrente
- Tensão
- Energia acumulada
- Fator de potência
- Nível de iluminação
- Consumo de potência
- Horas de operação

### 3. Analisar Consumo de Energia
```typescript
analyzeEnergyConsumption({
    deviceId: string,   // ID do dispositivo
    startTime: number,  // Timestamp inicial (UNIX)
    endTime: number     // Timestamp final (UNIX)
})
```
Retorna análise detalhada do consumo de energia:
- Energia total consumida
- Potência média
- Potência máxima
- Potência mínima

### 4. Detectar Vazamentos de Água
```typescript
detectWaterLeaks({
    startTime: number,  // Timestamp inicial (UNIX)
    endTime: number     // Timestamp final (UNIX)
})
```
Retorna todos os registros de vazamentos detectados no período, incluindo:
- ID do dispositivo
- Localização
- Vazão
- Pressão
- Temperatura
- Consumo

### 5. Analisar Consumo de Gás
```typescript
analyzeGasConsumption({
    region: string,     // Nome da região
    startTime: number,  // Timestamp inicial (UNIX)
    endTime: number     // Timestamp final (UNIX)
})
```
Retorna análise detalhada do consumo de gás por região:
- Consumo total
- Vazão média
- Número de vazamentos detectados

## Exemplos de Uso

### Exemplo 1: Análise de Eficiência Energética
```typescript
// Consultar consumo de energia de um poste
const consumo = await analyzeEnergyConsumption({
    deviceId: "LIGHT-000001",
    startTime: 1609459200,  // 01/01/2021
    endTime: 1640995200     // 01/01/2022
});
```

### Exemplo 2: Monitoramento de Vazamentos
```typescript
// Detectar vazamentos de água
const vazamentos = await detectWaterLeaks({
    startTime: 1609459200,  // 01/01/2021
    endTime: 1640995200     // 01/01/2022
});
```

### Exemplo 3: Análise Regional
```typescript
// Analisar consumo de gás por região
const consumoGas = await analyzeGasConsumption({
    region: "São Paulo",
    startTime: 1609459200,  // 01/01/2021
    endTime: 1640995200     // 01/01/2022
});
```

## Estrutura do Banco de Dados

O servidor se conecta ao banco de dados MongoDB `smart_city_iot` com as seguintes coleções:

### Dispositivos
- `lighting_devices`: 10.000 dispositivos de iluminação
- `water_devices`: 50.000 medidores de água
- `gas_devices`: 50.000 medidores de gás

### Telemetria
- `lighting_telemetry`: Dados de iluminação
- `water_telemetry`: Dados de água
- `gas_telemetry`: Dados de gás

## Índices Otimizados

O banco de dados possui índices otimizados para consultas frequentes:
- `lighting_telemetry`: { deviceId: 1, timestamp: 1 }
- `water_telemetry`: { deviceId: 1, timestamp: 1 }
- `gas_telemetry`: { deviceId: 1, timestamp: 1 }

## Segurança

- Autenticação MongoDB com usuário dedicado
- Apenas operações de leitura permitidas
- Validação de entrada com Zod
- Tratamento de erros robusto

## Limitações

- Timestamps devem ser fornecidos em formato UNIX (segundos desde 1970)
- Consultas são limitadas a períodos de tempo específicos
- Algumas análises podem ser computacionalmente intensivas para grandes períodos

## Integração com Cursor

### Configuração do Cursor

1. Configure o arquivo `.cursor/mcp.json` com as seguintes configuraçõe:

```json
{
    "mcpServers": {
        "smart-city": {
            "command": "node",
            "args": [
                "/CAMINHO/ABSOLUTO/PARA/dist/server.js"
            ],
            "env": {
                "MONGO_URI": "mongodb://mongo_user:mongo-password@localhost:27017/smart_city_iot?authSource=admin",
                "READ_ONLY": "false"
            }
        }
    }
}
```

> **Importante:**
> - O caminho para o arquivo `server.js` deve ser absoluto (exemplo: `/home/usuario/projeto/dist/server.js`).
> - Se estiver usando TypeScript, execute `npm run build` antes e utilize o arquivo gerado em `dist/server.js` (ou conforme sua configuração de saída do build).

### Exemplos de Uso com Cursor

#### Exemplo 1: Consulta de Dispositivos
```typescript
// No Cursor, você pode usar o prompt para consultar dispositivos:
"Liste todos os dispositivos de iluminação na região Sudeste"

// O Cursor irá gerar e executar o código:
const dispositivos = await listLightingDevices({
    region: "Sudeste"
});
```

#### Exemplo 2: Análise de Dados
```typescript
// No Cursor, você pode solicitar análises específicas:
"Analise o consumo de energia do dispositivo LIGHT-000001 no último mês"

// O Cursor irá gerar e executar o código:
const consumo = await analyzeEnergyConsumption({
    deviceId: "LIGHT-000001",
    startTime: Date.now() - (30 * 24 * 60 * 60 * 1000),
    endTime: Date.now()
});
```

#### Exemplo 3: Monitoramento de Vazamentos
```typescript
// No Cursor, você pode solicitar monitoramento:
"Verifique se há vazamentos de água nas últimas 24 horas"

// O Cursor irá gerar e executar o código:
const vazamentos = await detectWaterLeaks({
    startTime: Date.now() - (24 * 60 * 60 * 1000),
    endTime: Date.now()
});
```

### Dicas de Uso

1. Use linguagem natural para descrever o que você precisa
2. O Cursor entenderá o contexto e gerará o código apropriado
3. Você pode combinar múltiplas consultas em uma única solicitação
4. O Cursor manterá o histórico de consultas para referência futura

### Recursos Avançados

- Análise de tendências: "Mostre a tendência de consumo de gás na região sul"
- Comparações: "Compare o consumo de energia entre dois dispositivos"
- Alertas: "Configure um alerta para vazamentos de água"
- Relatórios: "Gere um relatório de eficiência energética"
