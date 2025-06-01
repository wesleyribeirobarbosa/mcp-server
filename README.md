# Servidor MCP para Smart Cities

Este servidor MCP (Model Context Protocol) permite que IAs interajam com dados de dispositivos IoT de uma cidade inteligente, incluindo iluminação pública, medidores de água e gás.

> **Atenção:**
> - Este servidor MCP permite atualmente apenas conexão via Stdio (entrada/saída padrão).
> - Foi testado e validado utilizando a ferramenta Cursor como MCP Cliente.

## Logs da Aplicação

Os logs do servidor MCP são salvos em arquivos na pasta `logs` do projeto (por padrão, `logs/server.log` e arquivos rotacionados).

> **Motivo:**
> - Como a comunicação entre MCP Client e MCP Server é feita via Stdio (entrada/saída padrão), qualquer saída de log no console pode interferir na troca de mensagens entre cliente e servidor.
> - Por isso, todos os logs são direcionados para arquivos, garantindo que a comunicação MCP funcione corretamente.

Para consultar os logs, basta abrir os arquivos na pasta `logs` com qualquer editor de texto ou usar comandos como:
```bash
cat logs/server.log
```

Os arquivos são rotacionados automaticamente para evitar crescimento excessivo.

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
    region?: string,    // Filtro opcional por região (nome ou busca geoespacial)
    status?: string,    // Filtro opcional por status
    geoJson?: boolean  // Se true, retorna FeatureCollection GeoJSON
})
```
- Retorna uma lista de dispositivos de iluminação pública.
- Se region for fornecida, filtra por proximidade geográfica (usando coordenadas e polígono da região).
- Se geoJson=true, retorna no formato GeoJSON (FeatureCollection).

#### Exemplos de prompts:
- "Liste todos os dispositivos de iluminação na região Sudeste"
- "Me retorne os dispositivos de iluminação próximos ao Centro-Oeste em GeoJSON"
- "Quais dispositivos de iluminação estão ativos no Sul?"
- "Me dê um GeoJSON dos dispositivos de iluminação do Nordeste"

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

## Observação Importante sobre o Banco de Dados

É necessário que o banco de dados `smart_city_iot` exista em uma instância MongoDB local para o funcionamento do servidor.

Para popular o banco com dados de exemplo, utilize o script `populate_mongodb.js` disponível na pasta `db-init`.

### Como executar o script de população:

1. Abra um terminal e navegue até a pasta `db-init`:
   ```bash
   cd db-init
   ```
2. Execute o script:
   ```bash
   node populate_mongodb.js
   ```

O script irá criar e popular as seguintes coleções no banco `smart_city_iot`:
- `lighting_devices`: dispositivos de iluminação pública, cada um com campos como `deviceId`, `latitude`, `longitude`, `status`, etc.
- `water_devices`: medidores de água
- `gas_devices`: medidores de gás
- `lighting_telemetry`, `water_telemetry`, `gas_telemetry`: dados de telemetria simulados para cada tipo de dispositivo

> **Atenção:**
> - Certifique-se de que o MongoDB está rodando localmente antes de executar o script.
> - Os dados criados são exemplos para testes e desenvolvimento.

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

# Paginação de Resultados nas Ferramentas MCP

Algumas ferramentas deste servidor MCP podem retornar grandes volumes de dados. Para evitar timeouts e melhorar a performance, foi implementada paginação nas seguintes ferramentas:

- `listLightingDevices`
- `getLightingTelemetry`
- `detectWaterLeaks`

## Como utilizar a paginação

Essas ferramentas aceitam os seguintes parâmetros opcionais:

- `limit` (número): Quantidade máxima de registros a serem retornados por requisição. Valor padrão: 100.
- `offset` (número): Quantidade de registros a serem pulados antes de começar a retornar os resultados. Valor padrão: 0.

### Exemplo de chamada
```json
{
  "limit": 100,
  "offset": 200
}
```

## Formato da resposta paginada
A resposta dessas ferramentas será um objeto JSON contendo:

- Os dados solicitados (ex: `devices`, `telemetry`, `leaks`)
- `total`: total de registros disponíveis para a consulta
- `offset`: offset utilizado na consulta
- `limit`: limite utilizado na consulta
- `hasNext`: booleano indicando se há mais páginas de dados

### Exemplo de resposta
```json
{
  "devices": [ ... ],
  "total": 60819,
  "offset": 200,
  "limit": 100,
  "hasNext": true
}
```

> **Observação:**
> Caso utilize o parâmetro `geoJson` em `listLightingDevices`, a resposta será um objeto GeoJSON com um campo adicional `pagination` contendo os metadados acima.

## Recomendações
- Para obter todos os dados, faça múltiplas requisições, incrementando o `offset` de acordo com o `limit` até que `hasNext` seja `false`.
- Não utilize valores de `limit` muito altos para evitar sobrecarga no servidor.

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

## Utilização com outros MCP Clients e Autenticação

Caso seja necessário utilizar outros MCP Clients (diferentes do Cursor) ou integrar com aplicações externas, pode ser necessário habilitar um transporte HTTP e autenticação via Token (preferencialmente OAuth 2.1).

### Como habilitar HTTP e autenticação

1. **Adicionar transporte HTTP:**
   - No arquivo `src/server.ts`, após a criação do servidor MCP (`const server = new McpServer(...)`), adicione a importação e inicialização do transporte HTTP, por exemplo:
     ```typescript
     import { HttpServerTransport } from "@modelcontextprotocol/sdk/server/http.js";
     // ...
     const httpTransport = new HttpServerTransport({ port: 3000 });
     await server.connect(httpTransport);
     ```
   - Isso permitirá que o servidor aceite conexões HTTP na porta especificada.

2. **Adicionar autenticação via Token (OAuth 2.1):**
   - Implemente um middleware de autenticação no ponto de inicialização do transporte HTTP.
   - Consulte a documentação do MCP SDK e do seu provedor OAuth para detalhes de integração.
   - Exemplo de local para adicionar:
     ```typescript
     // Após criar o httpTransport, adicione lógica de autenticação antes de aceitar requisições
     // (Consulte a documentação do SDK para detalhes de hooks ou middlewares)
     ```

> **Importante:**
> - O suporte a HTTP e autenticação não está habilitado por padrão neste projeto.
> - A implementação de autenticação segura é fundamental para ambientes de produção.

