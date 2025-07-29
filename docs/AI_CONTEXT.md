# Contexto para IA - Servidor MCP Smart Cities

## O que é este projeto
Este é um servidor MCP (Model Context Protocol) que atua como uma ponte entre IAs e dados de dispositivos IoT de uma cidade inteligente. O servidor permite consultar e analisar dados de iluminação pública, medidores de água e gás.

## Como funciona a interação

### VSCode com GitHub Copilot 🆕
1. **VSCode** carrega configuração de `.vscode/mcp.json` automaticamente
2. **GitHub Copilot** lê instruções de `.github/copilot-instructions.md`
3. **Agent Mode** no Chat do Copilot acessa as 13 ferramentas MCP
4. **Servidor MCP** traduz solicitações em consultas MongoDB otimizadas
5. **MongoDB** retorna dados simulados de dispositivos IoT
6. **Resposta** formatada em JSON é exibida no Chat do Copilot

### Cursor (Tradicional)
1. **Cursor** conecta ao servidor MCP via `.cursor/mcp.json`
2. **Servidor MCP** traduz solicitações de linguagem natural em consultas MongoDB
3. **MongoDB** contém dados simulados de N dispositivos IoT
4. **Resposta** é formatada em JSON e retornada para o Cursor

### Integração de Contexto IA
- **`.github/copilot-instructions.md`**: Instruções específicas para GitHub Copilot
- **`.cursorrules`**: Contexto automático para Cursor
- **`docs/AI_CONTEXT.md`**: Este arquivo, para todas as IAs
- **`.vscode/mcp.json`**: Configuração técnica do MCP para VSCode

## Exemplos de Prompts Naturais

### Consultas de Dispositivos
- "Liste todos os dispositivos de iluminação no Sudeste"
- "Quantos medidores de água temos ativos?"
- "Me dê um mapa GeoJSON dos postes de luz do Centro-Oeste"

### Análises de Dados
- "Qual o consumo de energia do dispositivo LIGHT-000001 no último mês?"
- "Detecte vazamentos de água nas últimas 24 horas"
- "Compare o consumo de gás entre Norte e Sul"

### Dados Temporais
- "Mostre a telemetria do poste LIGHT-000001 de ontem"
- "Analise o padrão de consumo dos últimos 30 dias"
- "Identifique picos de energia na última semana"

### Análises Avançadas (Novas Ferramentas)
- "Gere um dashboard completo da cidade para hoje"
- "Quais dispositivos precisam de manutenção urgente?"
- "Detecte anomalias na iluminação com alta sensibilidade"
- "Compare estatísticas regionais dos últimos 7 dias"
- "Analise a saúde dos dispositivos de água no Sudeste"
- "Gere relatório de eficiência energética com recomendações"
- "Verifique a qualidade da água em todas as regiões"
- "Analise correlações entre consumo de energia e água"
- "Prediga quais dispositivos de gás falharão nos próximos 30 dias"
- "Encontre padrões anômalos nos dados da última semana"

### Prompts Específicos para VSCode/Copilot 🆕
- "Implementar função que monitora eficiência em tempo real"
- "Criar alerta automático para vazamentos críticos com threshold personalizado"
- "Desenvolver análise preditiva para manutenção preventiva"
- "Gerar dashboard interativo com métricas de sustentabilidade"
- "Implementar sistema de notificação para anomalias detectadas"

## Estrutura dos Dados

### Dispositivos de Iluminação
```json
{
  "deviceId": "LIGHT-000001",
  "latitude": -23.5505,
  "longitude": -46.6333,
  "region": "Sudeste",
  "status": "ativo",
  "installationDate": "2021-01-15"
}
```

### Telemetria
```json
{
  "deviceId": "LIGHT-000001",
  "timestamp": 1672531200,
  "temperature": 25.5,
  "isOn": true,
  "current": 0.45,
  "voltage": 220,
  "power": 99,
  "energy": 1250.75
}
```

## Limitações e Considerações

### Timestamps
- Sempre usar formato UNIX (segundos desde 1970)
- Para consultas recentes: `Date.now() / 1000 - (24 * 60 * 60)` (ontem)

### Paginação
- Grandes consultas retornam dados paginados
- Use `limit` e `offset` para navegar pelos resultados
- `hasNext: true` indica mais dados disponíveis

### Performance
- Consultas de telemetria podem ser lentas para períodos longos
- Prefira períodos menores (dias/semanas vs meses/anos)
- Use filtros específicos (deviceId, região) quando possível

## Cenários de Uso Comum

### 1. Monitoramento de Eficiência
Analise padrões de consumo para identificar dispositivos com comportamento anômalo.

### 2. Detecção de Problemas
Identifique vazamentos, falhas de energia ou dispositivos offline.

### 3. Planejamento Urbano
Use dados geográficos para otimizar instalação de novos dispositivos.

### 4. Relatórios de Sustentabilidade
Calcule economia de energia e impacto ambiental.

### 5. Manutenção Preditiva
Identifique dispositivos que precisarão de manutenção antes que falhem.

### 6. Detecção de Anomalias
Encontre comportamentos suspeitos ou padrões anômalos nos dados.

### 7. Análises Correlacionadas
Encontre relações entre diferentes tipos de dispositivos e consumos.

### 8. Dashboards Executivos
Visão geral da cidade para tomada de decisões estratégicas.

### 9. Desenvolvimento de Código 🆕 (VSCode/Copilot)
- Implementação de novas funcionalidades de análise
- Criação de sistemas de alerta personalizados
- Desenvolvimento de dashboards interativos
- Otimização de consultas MongoDB

## Formato de Respostas

### Dados Tabulares
```json
{
  "devices": [...],
  "total": 1500,
  "offset": 0,
  "limit": 100,
  "hasNext": true
}
```

### GeoJSON
```json
{
  "type": "FeatureCollection",
  "features": [...],
  "pagination": {
    "total": 1500,
    "offset": 0,
    "limit": 100
  }
}
```

### Análises
```json
{
  "totalEnergy": 15420.5,
  "averagePower": 95.2,
  "maxPower": 120,
  "minPower": 85,
  "period": "2024-01-01 to 2024-01-31"
}
```

## Dicas para Melhor Interação

### Geral (Todas as IAs)
1. **Seja específico** com períodos de tempo
2. **Use nomes de regiões** reconhecidos (Norte, Sul, Sudeste, etc.)
3. **Combine consultas** para análises mais ricas
4. **Considere paginação** para grandes datasets
5. **Verifique disponibilidade** de dados antes de análises profundas

### Específicas para VSCode/Copilot 🆕
6. **Use Agent Mode** no Chat para acessar ferramentas MCP automaticamente
7. **Aproveite autocompletar** - Copilot sugere baseado em .github/copilot-instructions.md
8. **Teste incrementalmente** - Implemente e teste funcionalidades passo a passo
9. **Explore pattern matching** - Copilot reconhece padrões de código do projeto
10. **Use linguagem natural** - Descreva o que quer implementar em português

### Específicas para Cursor
6. **Use prompts longos** - Cursor processa contexto extenso bem
7. **Seja explícito** sobre o que espera como resposta
8. **Combine múltiplas ferramentas** em uma única solicitação

## Configuração de Contexto por IDE

### VSCode com GitHub Copilot
- **Arquivo de contexto**: `.github/copilot-instructions.md`
- **Configuração MCP**: `.vscode/mcp.json`
- **Vantagens**: Integração nativa, inputs seguros, sugestões automáticas
- **Melhor para**: Desenvolvimento, implementação de código, testes

### Cursor
- **Arquivo de contexto**: `.cursorrules`
- **Configuração MCP**: `.cursor/mcp.json`
- **Vantagens**: IA conversacional avançada, análise de dados
- **Melhor para**: Análise exploratória, consultas complexas

## Exemplos Específicos por IDE

### VSCode/Copilot - Implementação de Código
```typescript
// Digite: "Implementar função para detectar dispositivos com consumo anômalo"

// Copilot sugere automaticamente (baseado em .github/copilot-instructions.md):
async function detectAnomalousConsumption(threshold: number = 2.0) {
    const anomalies = await getAnomalyDetection({
        deviceType: 'lighting',
        sensitivity: 'high',
        timeRange: 'week'
    });
    
    return anomalies.filter(device => device.anomalyScore > threshold);
}
```

### Cursor - Análise de Dados
```
Prompt: "Analise correlação entre falhas de iluminação e vazamentos de água por região nos últimos 30 dias, considerando fatores climáticos"

Cursor: (Usa .cursorrules para contexto) Executa análise complexa com múltiplas ferramentas MCP
```

## Integração com Arquivos de Configuração

- **`.vscode/mcp.json`**: Configuração técnica para VSCode
- **`.github/copilot-instructions.md`**: Instruções detalhadas para Copilot
- **`.cursorrules`**: Contexto básico para Cursor
- **`docs/AI_CONTEXT.md`**: Este arquivo - contexto universal
- **`docs/DEVELOPMENT.md`**: Padrões técnicos de desenvolvimento
- **`QUICKSTART.md`**: Guia rápido de configuração 