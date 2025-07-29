# Servidor MCP para Smart Cities

Este servidor MCP (Model Context Protocol) permite que IAs interajam com dados de dispositivos IoT de uma cidade inteligente, incluindo iluminação pública, medidores de água e gás.

> **Atenção:**
> - Este servidor MCP permite atualmente apenas conexão via Stdio (entrada/saída padrão).
> - Foi testado e validado utilizando Cursor e GitHub Copilot no VSCode como MCP Clients.

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

## 📚 Documentação do Projeto

Este projeto possui uma documentação estruturada e específica para diferentes necessidades e públicos. Cada arquivo foi criado com um propósito específico para maximizar a produtividade e facilitar o entendimento do projeto.

### 🎯 Visão Geral dos Documentos

| Arquivo | Público Alvo | Propósito | Leitura |
|---------|--------------|-----------|---------|
| **`.cursorrules`** | Cursor AI | Contexto automático | Automática |
| **`.github/copilot-instructions.md`** | GitHub Copilot | Instruções para VSCode | Automática |
| **`.vscode/mcp.json`** | VSCode/Copilot | Configuração MCP | Manual/Automática |
| **`QUICKSTART.md`** | Todos | Setup rápido | Primeiro acesso |
| **`docs/DEVELOPMENT.md`** | Desenvolvedores | Padrões e arquitetura | Durante desenvolvimento |
| **`docs/AI_CONTEXT.md`** | IAs/Cursor | Interação otimizada | Consulta automática |
| **`README.md`** | Geral | Documentação completa | Referência |

---

### 🤖 `.cursorrules` - Contexto Automático para IA

**Propósito:** Arquivo lido automaticamente pelo Cursor para entender o contexto do projeto sem necessidade de explicações manuais.

**Quando usar:**
- ✅ **Sempre** - O Cursor lê automaticamente ao abrir o projeto
- ✅ Ao fazer perguntas sobre o projeto pela primeira vez
- ✅ Quando o Cursor precisa entender convenções específicas

**Como será usado:**
- **Cursor:** Lê automaticamente e mantém contexto durante toda a sessão
- **Desenvolvedores:** Consulta manual quando precisar entender convenções
- **Novas IAs:** Primeiro arquivo a ser consultado para contexto

**Conteúdo:**
- Estrutura do projeto e tecnologias
- Convenções de código (IDs, timestamps, logs)
- Comandos importantes
- Considerações específicas do MCP

**Exemplo de uso:**
```
Você: "Crie uma nova ferramenta MCP para monitorar tráfego"
Cursor: (lê .cursorrules) "Entendo que preciso seguir o padrão Zod, usar logs em arquivo, e registrar no server.ts..."
```

---

### 🆕 `.github/copilot-instructions.md` - Instruções para GitHub Copilot

**Propósito:** Arquivo de instruções específicas para GitHub Copilot no VSCode, fornecendo contexto detalhado do projeto.

**Quando usar:**
- 🎯 **VSCode com Copilot** - Lido automaticamente pelo GitHub Copilot
- 🔧 **Desenvolvimento em VSCode** - Para sugestões contextualizadas
- 📋 **Padrões de código** - Segue automaticamente as convenções do projeto

**Como será usado:**
- **GitHub Copilot:** Contexto automático para sugestões inteligentes
- **VSCode:** Integração nativa com o ambiente de desenvolvimento
- **Desenvolvedores:** Consulta para entender padrões específicos

**Conteúdo:**
- Contexto completo do projeto Smart Cities
- Convenções de desenvolvimento específicas
- Estrutura das ferramentas MCP implementadas
- Padrões para implementação de novas funcionalidades
- Instruções de validação e tratamento de erros

**Exemplo de uso:**
```
Você: Começa a digitar uma nova função MCP no VSCode
Copilot: (lê .github/copilot-instructions.md) Sugere automaticamente padrão Zod, timestamps UNIX, logs em arquivo
```

---

### 🔧 `.vscode/mcp.json` - Configuração MCP para VSCode

**Propósito:** Configuração específica do VSCode para conexão com o servidor MCP, otimizada para GitHub Copilot.

**Quando usar:**
- 🖥️ **VSCode** - Configuração automática do MCP
- 🤝 **GitHub Copilot** - Integração direta com as ferramentas
- ⚙️ **Desenvolvimento** - Setup automático do ambiente

**Como será usado:**
- **VSCode:** Carrega automaticamente as configurações MCP
- **GitHub Copilot:** Acesso direto às ferramentas do servidor
- **Desenvolvedores:** Setup simplificado sem configuração manual

**Conteúdo:**
- Configuração do servidor MCP para stdio
- Variáveis de ambiente seguras (com inputs)
- Caminho para o servidor compilado
- Configurações específicas do MongoDB

**Exemplo de uso:**
```
1. Abrir projeto no VSCode
2. VSCode detecta .vscode/mcp.json automaticamente
3. Solicita credenciais do MongoDB (primeira vez)
4. Copilot tem acesso às 13 ferramentas MCP
```

---

### ⚡ `QUICKSTART.md` - Guia de Início Rápido

**Propósito:** Colocar o projeto funcionando em menos de 5 minutos, sem precisar ler documentação extensa.

**Quando usar:**
- 🚀 **Primeira vez** que acessa o projeto
- 🔧 **Problemas** - quando algo não está funcionando
- 👥 **Demonstrações** - setup rápido para mostrar funcionando
- 🧪 **Testes** - validação rápida após mudanças
- 📅 **Futuro** - quando você esquecer como rodar (6 meses depois)

**Como será usado:**
- **Novos desenvolvedores:** Primeiro arquivo a ler
- **Você mesmo:** Referência rápida de comandos
- **Demonstrações:** Setup para clientes/colegas
- **CI/CD:** Base para scripts de automação

**Conteúdo:**
- 3 passos para setup completo
- Comandos de teste e validação
- Troubleshooting básico
- Prompts de exemplo prontos
- IDs e timestamps de referência
- **NOVO:** Configuração VSCode/Copilot

**Exemplo de uso:**
```
Cenário: Novo membro da equipe
1. Lê QUICKSTART.md (3 min)
2. Executa 3 comandos
3. Configura VSCode/Copilot
4. Testa com prompts prontos
5. Projeto funcionando ✅
```

---

### 🏗️ `docs/DEVELOPMENT.md` - Guia de Desenvolvimento

**Propósito:** Padrões de código, arquitetura e boas práticas para desenvolvimento e manutenção.

**Quando usar:**
- 🔨 **Desenvolvimento ativo** - ao escrever/modificar código
- 🏗️ **Arquitetura** - entender estrutura e design patterns
- ➕ **Novas features** - adicionar ferramentas MCP
- 🐛 **Debugging** - entender fluxo e logs
- 📖 **Code review** - verificar aderência aos padrões

**Como será usado:**
- **Desenvolvedores:** Consulta durante codificação
- **Code reviews:** Verificação de padrões
- **Refatoração:** Guia para manter consistência
- **Onboarding:** Entendimento técnico profundo

**Conteúdo:**
- Arquitetura detalhada do projeto
- Padrões de validação com Zod
- Estrutura de resposta MCP
- Convenções de paginação
- Como adicionar novas ferramentas
- Exemplos de código
- **NOVO:** Configuração VSCode e Copilot

**Exemplo de uso:**
```
Tarefa: Adicionar ferramenta de monitoramento de temperatura
1. Consulta DEVELOPMENT.md para padrões
2. Segue estrutura de validação Zod
3. Implementa paginação conforme exemplo
4. Registra no server.ts seguindo convenção
5. Testa com VSCode/Copilot
```

---

### 🧠 `docs/AI_CONTEXT.md` - Contexto para Interação com IA

**Propósito:** Otimizar interação entre humanos, IA e dados IoT com exemplos específicos e limitações conhecidas.

**Quando usar:**
- 💬 **Prompts complexos** - consultas avançadas de dados
- 📊 **Análises** - quando precisar de insights dos dados
- 🗺️ **Consultas geográficas** - dados por região
- ⏰ **Dados temporais** - análises históricas
- 🤔 **Dúvidas sobre capacidades** - o que é possível fazer

**Como será usado:**
- **Cursor:** Consultado automaticamente para prompts mais eficazes
- **GitHub Copilot:** Contexto para sugestões de código
- **Usuários:** Exemplos de como fazer perguntas
- **Outras IAs:** Contexto sobre estrutura de dados
- **Desenvolvimento:** Entender casos de uso comuns

**Conteúdo:**
- Exemplos de prompts naturais eficazes
- Estrutura detalhada dos dados
- Limitações e considerações de performance
- Cenários de uso comum
- Formatos de resposta esperados
- Dicas para melhor interação
- **NOVO:** Exemplos específicos para VSCode/Copilot

**Exemplo de uso:**
```
Você: "Quero analisar eficiência energética"
Cursor/Copilot: (consulta AI_CONTEXT.md) "Baseado nos exemplos, sugiro consultar consumo por período específico..."
Resultado: Prompt mais eficaz e dados mais relevantes
```

---

### 📖 `README.md` - Documentação Completa

**Propósito:** Documentação completa e oficial do projeto, referência principal para todas as informações.

**Quando usar:**
- 📚 **Referência completa** - informações detalhadas sobre todas as ferramentas
- 🔍 **Busca específica** - detalhes sobre parâmetros e respostas
- 📋 **Documentação oficial** - para links e referências externas
- 🎓 **Aprendizado profundo** - entender completamente o projeto
- 📝 **Documentação para terceiros** - material oficial

**Como será usado:**
- **Referência oficial:** Link para documentação externa
- **Consulta detalhada:** Quando QUICKSTART não é suficiente
- **Integração:** Informações para outros sistemas
- **Treinamento:** Material completo para equipe

**Conteúdo:**
- Todas as ferramentas MCP detalhadas
- Exemplos completos de uso
- Configuração detalhada
- **NOVO:** Integração com VSCode/Copilot
- Estrutura do banco de dados
- Limitações e considerações

---

### 🎯 Fluxo de Uso Recomendado

#### Para **Primeiro Acesso:**
1. **`QUICKSTART.md`** → Setup rápido e teste
2. **Configurar VSCode** → `.vscode/mcp.json` automático
3. **`README.md`** → Entendimento completo
4. **`docs/AI_CONTEXT.md`** → Exemplos de uso

#### Para **Desenvolvimento:**
1. **`.cursorrules`** → Contexto automático (Cursor)
2. **`.github/copilot-instructions.md`** → Contexto automático (VSCode/Copilot)
3. **`docs/DEVELOPMENT.md`** → Padrões e arquitetura
4. **`README.md`** → Referência de APIs

#### Para **Uso Diário:**
1. **VSCode/Copilot** → Integração automática com MCP
2. **`docs/AI_CONTEXT.md`** → Prompts eficazes
3. **`QUICKSTART.md`** → Comandos rápidos
4. **`README.md`** → Detalhes específicos

#### Para **Problemas:**
1. **`QUICKSTART.md`** → Troubleshooting básico
2. **`docs/DEVELOPMENT.md`** → Debugging avançado
3. **Logs** → `logs/server.log`
4. **VSCode** → Verificar configuração MCP

### 💡 Dicas de Produtividade

- **Cursor Users:** O `.cursorrules` e `AI_CONTEXT.md` trabalham juntos para dar contexto automático
- **VSCode Users:** O `.github/copilot-instructions.md` e `.vscode/mcp.json` fornecem integração completa
- **Desenvolvimento:** `DEVELOPMENT.md` evita quebrar convenções
- **Demonstrações:** `QUICKSTART.md` + configuração automática = setup em minutos
- **Manutenção:** Cada arquivo tem responsabilidade específica, facilitando atualizações

## Configuração

### Opção 1: VSCode com GitHub Copilot (Recomendado)

1. Instale as dependências:
```bash
npm install
```

2. Abra o projeto no VSCode:
```bash
code .
```

3. O VSCode detectará automaticamente o arquivo `.vscode/mcp.json` e solicitará a configuração do MongoDB

4. Inicie o banco de dados:
```bash
cd db-init && docker-compose up --build -d
```

5. Compile e inicie o servidor:
```bash
npm run build
npm start
```

### Opção 2: Cursor (Tradicional)

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

## 🚀 Ferramentas Avançadas (Novas)

### 6. Estatísticas Regionais Comparativas
```typescript
getRegionalStatistics({
    startTime: number,      // Timestamp inicial (UNIX)
    endTime: number,        // Timestamp final (UNIX)
    includeComparison?: boolean  // Se true, inclui comparações entre regiões
})
```
Retorna estatísticas detalhadas comparativas entre todas as regiões:
- Consumo de energia, água e gás por região
- Métricas de performance e eficiência
- Contagem de dispositivos e vazamentos
- Análise de uptime e confiabilidade

### 7. Relatório de Saúde dos Dispositivos
```typescript
getDeviceHealthReport({
    deviceType?: 'lighting' | 'water' | 'gas' | 'all',  // Tipo de dispositivo
    region?: string,        // Filtro por região
    healthThreshold?: number // Limiar de saúde (0-100)
})
```
Retorna análise detalhada da "saúde" dos dispositivos:
- Score de saúde calculado (0-100)
- Métricas específicas por tipo de dispositivo
- Dispositivos que precisam de manutenção
- Predição de tempo de vida útil

### 8. Dashboard Completo da Cidade
```typescript
getCityDashboard({
    timeRange?: 'hour' | 'day' | 'week' | 'month',  // Período de análise
    includeAlerts?: boolean  // Se true, inclui alertas inteligentes
})
```
Retorna visão geral completa da cidade:
- Estatísticas gerais de todos os sistemas
- Resumo de consumos e eficiência
- Alertas críticos, avisos e informativos
- KPIs principais da cidade inteligente

### 9. Predição de Manutenção
```typescript
predictMaintenance({
    deviceType?: 'lighting' | 'water' | 'gas' | 'all',  // Tipo de dispositivo
    predictionDays?: number,    // Dias para predição (1-90)
    riskThreshold?: number      // Limiar de risco (0-100)
})
```
Retorna predições baseadas em machine learning:
- Dispositivos em risco de falha
- Score de risco de manutenção
- Dias estimados até falha
- Manutenção urgente vs preventiva

### 10. Detecção de Anomalias
```typescript
getAnomalyDetection({
    deviceType?: 'lighting' | 'water' | 'gas' | 'all',  // Tipo de dispositivo
    sensitivity?: 'low' | 'medium' | 'high',            // Sensibilidade
    timeRange?: 'hour' | 'day' | 'week'                 // Período de análise
})
```
Retorna detecção inteligente de anomalias:
- Anomalias por desvio estatístico
- Padrões anômalos de consumo
- Comportamentos suspeitos
- Classificação por gravidade

### 11. Relatório Completo de Eficiência Energética
```typescript
getEnergyEfficiencyReport({
    startTime: number,      // Timestamp inicial (UNIX)
    endTime: number,        // Timestamp final (UNIX)
    includeRecommendations?: boolean,  // Se true, inclui recomendações
    region?: string         // Filtro por região
})
```
Retorna análise completa de eficiência energética:
- Score de eficiência por dispositivo
- Análise regional comparativa
- Melhores e piores performers
- Recomendações de otimização
- Estimativas de economia potencial

### 12. Relatório de Qualidade da Água
```typescript
getWaterQualityReport({
    startTime: number,      // Timestamp inicial (UNIX)
    endTime: number,        // Timestamp final (UNIX)
    region?: string,        // Filtro por região
    includeAlerts?: boolean // Se true, inclui alertas de segurança
})
```
Retorna análise detalhada da qualidade da água:
- Score de qualidade por dispositivo
- Métricas de pressão, temperatura, fluxo
- Estabilidade e confiabilidade
- Alertas de segurança e qualidade
- Classificação: excelente/boa/ruim

### 13. Análise Correlacionada Entre Dispositivos
```typescript
getCrossDeviceAnalysis({
    startTime: number,      // Timestamp inicial (UNIX)
    endTime: number,        // Timestamp final (UNIX)
    region?: string,        // Filtro por região
    analysisType?: 'consumption' | 'efficiency' | 'maintenance' | 'environmental'
})
```
Retorna correlações entre diferentes tipos de dispositivos:
- Padrões de consumo correlacionados
- Impacto de vazamentos no sistema
- Eficiência cruzada entre sistemas
- Insights e recomendações estratégicas
- Correlações temporais e geográficas

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

### Exemplo 4: Dashboard da Cidade
```typescript
// No Cursor, você pode solicitar um dashboard completo:
"Gere um dashboard da cidade com alertas para o último dia"

// O Cursor irá gerar e executar o código:
const dashboard = await getCityDashboard({
    timeRange: "day",
    includeAlerts: true
});
```

### Exemplo 5: Predição de Manutenção
```typescript
// No Cursor, você pode solicitar predições:
"Quais dispositivos de água precisam de manutenção urgente?"

// O Cursor irá gerar e executar o código:
const predicao = await predictMaintenance({
    deviceType: "water",
    riskThreshold: 80
});
```

### Exemplo 6: Detecção de Anomalias
```typescript
// No Cursor, você pode detectar comportamentos anômalos:
"Detecte anomalias na iluminação com alta sensibilidade na última semana"

// O Cursor irá gerar e executar o código:
const anomalias = await getAnomalyDetection({
    deviceType: "lighting",
    sensitivity: "high",
    timeRange: "week"
});
```

### Exemplo 7: Relatório de Eficiência Energética
```typescript
// No Cursor, você pode gerar relatórios completos:
"Gere um relatório de eficiência energética do último mês com recomendações"

// O Cursor irá gerar e executar o código:
const eficiencia = await getEnergyEfficiencyReport({
    startTime: Date.now()/1000 - (30 * 24 * 60 * 60),
    endTime: Date.now()/1000,
    includeRecommendations: true
});
```

### Exemplo 8: Análise Correlacionada
```typescript
// No Cursor, você pode analisar correlações:
"Analise a correlação entre consumo de energia e água na região Sudeste"

// O Cursor irá gerar e executar o código:
const correlacao = await getCrossDeviceAnalysis({
    startTime: Date.now()/1000 - (7 * 24 * 60 * 60),
    endTime: Date.now()/1000,
    region: "Sudeste",
    analysisType: "consumption"
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

### Como inicializar o banco de dados:

1. Abra um terminal e navegue até a pasta `db-init`:
   ```bash
   cd db-init
   ```

2. Execute o docker-compose para inicializar o MongoDB e popular com dados de exemplo:
   ```bash
   docker-compose up --build -d
   ```

   Este comando irá:
   - Inicializar uma instância MongoDB local
   - Popular automaticamente o banco com dados de exemplo
   - Configurar as credenciais de acesso

### Alternativa: Popular manualmente o banco

Se você já possui uma instância MongoDB rodando, pode popular o banco manualmente com o script:
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

## Integração com IDEs

### 🆕 Configuração do VSCode com GitHub Copilot

O VSCode oferece integração nativa com MCP servers através da configuração `.vscode/mcp.json`:

```json
{
    "inputs": [
        {
            "type": "promptString",
            "id": "mongo-uri",
            "description": "MongoDB Connection URI",
            "default": "mongodb://cursor-mcp-client:cursor-mcp-password@localhost:27017/smart_city_iot?authSource=admin"
        }
    ],
    "servers": {
        "smart-city": {
            "type": "stdio",
            "command": "node",
            "args": [
                "~/Wesley/Github/mcp-server/dist/server.js"
            ],
            "env": {
                "MONGO_URI": "${input:mongo-uri}",
                "READ_ONLY": "false"
            }
        }
    }
}
```

**Vantagens da configuração VSCode:**
- ✅ **Segurança**: Solicita credenciais interativamente (não hardcoded)
- ✅ **Automático**: VSCode detecta e carrega configuração automaticamente
- ✅ **Copilot**: GitHub Copilot tem acesso direto às ferramentas MCP
- ✅ **Inputs seguros**: Variáveis de ambiente gerenciadas pelo VSCode

### Configuração do Cursor (Tradicional)

1. Configure o arquivo `.cursor/mcp.json` com as seguintes configurações:

```json
{
    "mcpServers": {
        "smart-city": {
            "command": "node",
            "args": [
                "/CAMINHO/ABSOLUTO/PARA/dist/server.js"
            ],
            "env": {
                "MONGO_URI": "mongodb://cursor-mcp-client:cursor-mcp-password@localhost:27017/smart_city_iot?authSource=admin",
                "READ_ONLY": "false"
            }
        }
    }
}
```

> **Importante:**
> - O caminho para o arquivo `server.js` deve ser absoluto (exemplo: `/home/usuario/projeto/dist/server.js`).
> - Se estiver usando TypeScript, execute `npm run build` antes e utilize o arquivo gerado em `dist/server.js` (ou conforme sua configuração de saída do build).

### Exemplos de Uso com VSCode/GitHub Copilot

#### Exemplo 1: Consulta de Dispositivos no VSCode
```typescript
// No VSCode com Copilot, você pode usar linguagem natural:
// Digite: "Liste dispositivos de iluminação no Sudeste"

// O Copilot sugere automaticamente:
const dispositivos = await listLightingDevices({
    region: "Sudeste",
    limit: 100
});
console.log(`Encontrados ${dispositivos.total} dispositivos`);
```

#### Exemplo 2: Análise Automática com Copilot
```typescript
// Digite: "Analise energia do LIGHT-000001 último mês"

// Copilot gera código otimizado baseado nas instruções:
const endTime = Math.floor(Date.now() / 1000);
const startTime = endTime - (30 * 24 * 60 * 60); // 30 dias em segundos

const analise = await analyzeEnergyConsumption({
    deviceId: "LIGHT-000001",
    startTime,
    endTime
});

// Copilot também sugere tratamento de erros e formatação
if (analise.totalEnergy > 0) {
    console.log(`Consumo total: ${analise.totalEnergy.toFixed(2)} kWh`);
}
```

#### Exemplo 3: Dashboard Inteligente
```typescript
// Digite: "Crie dashboard cidade com alertas hoje"

// Copilot gera solução completa:
const dashboard = await getCityDashboard({
    timeRange: "day",
    includeAlerts: true
});

// Copilot sugere análise dos alertas
const alertasCriticos = dashboard.alerts.critical.length;
if (alertasCriticos > 0) {
    console.log(`⚠️ ${alertasCriticos} alertas críticos detectados`);
    dashboard.alerts.critical.forEach(alert => {
        console.log(`- ${alert.type}: ${alert.message}`);
    });
}
```

### Exemplos de Uso com Cursor (Tradicional)

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

