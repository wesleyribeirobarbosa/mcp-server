# Instruções para GitHub Copilot - Servidor MCP Smart Cities

## Contexto do Projeto
Este é um servidor MCP (Model Context Protocol) que permite interação com dados IoT de cidades inteligentes. O projeto utiliza TypeScript, Node.js e MongoDB para fornecer ferramentas analíticas avançadas para gestão urbana.

## Estrutura Principal
- `/src/server.ts` - Servidor MCP principal
- `/src/tools/` - Ferramentas MCP disponíveis (13 ferramentas implementadas)
- `/db-init/` - Scripts de inicialização do banco MongoDB com dados simulados
- `/dist/` - Arquivos TypeScript compilados
- `/.vscode/mcp.json` - Configuração MCP para VSCode

## Tecnologias e Dependências
- **TypeScript** - Linguagem principal
- **Node.js** - Runtime
- **MongoDB** - Banco de dados (porta 27017)
- **MCP SDK** - @modelcontextprotocol/sdk
- **Zod** - Validação de schemas
- **Winston** - Sistema de logging

## Banco de Dados
- **Database**: `smart_city_iot`
- **Usuário**: `cursor-mcp-client`
- **Collections**: lighting_devices, water_devices, gas_devices, *_telemetry
- **Conexão**: MongoDB local na porta 27017

## Ferramentas MCP Implementadas

### Ferramentas Básicas
1. `listLightingDevices` - Lista dispositivos de iluminação com filtros opcionais
2. `getLightingTelemetry` - Obtém dados de telemetria de dispositivos específicos
3. `analyzeEnergyConsumption` - Análise detalhada de consumo energético
4. `detectWaterLeaks` - Sistema de detecção de vazamentos de água
5. `analyzeGasConsumption` - Monitoramento de consumo de gás por região

### Ferramentas Avançadas
6. `getRegionalStatistics` - Estatísticas comparativas entre regiões
7. `getDeviceHealthReport` - Relatório de saúde e status dos dispositivos
8. `getCityDashboard` - Dashboard completo com métricas da cidade
9. `predictMaintenance` - Predição de manutenção baseada em ML
10. `getAnomalyDetection` - Detecção de anomalias em tempo real
11. `getEnergyEfficiencyReport` - Relatório completo de eficiência energética
12. `getWaterQualityReport` - Análise de qualidade da água
13. `getCrossDeviceAnalysis` - Análise correlacionada entre tipos de dispositivos

## Convenções de Código e Desenvolvimento

### Timestamps e Dados
- **SEMPRE** usar timestamps em formato UNIX (segundos, não milissegundos)
- IDs de dispositivos seguem padrão: `LIGHT-000001`, `WATER-000001`, `GAS-000001`
- Coordenadas geográficas sempre em formato [longitude, latitude]

### Validação e Erros
- **OBRIGATÓRIO**: Validar todas as entradas com Zod schemas
- Implementar tratamento robusto de erros de conexão MongoDB
- Retornar mensagens de erro claras e estruturadas

### Logging e Comunicação
- Logs DEVEM ser salvos em arquivos (não console) devido ao protocolo MCP
- Comunicação exclusivamente via Stdio (não HTTP para este projeto)
- Usar Winston para logging estruturado

### Paginação e Performance
- Sempre implementar paginação para consultas grandes (limit/offset)
- Usar índices MongoDB apropriados para queries frequentes
- Limitar resultados padrão para evitar sobrecarga

## Comandos de Desenvolvimento
```bash
npm run build        # Compila TypeScript
npm start           # Inicia servidor MCP
npm run dev         # Modo desenvolvimento com watch
cd db-init && docker-compose up -d  # Inicia MongoDB com dados
```

## Padrões de Implementação

### Estrutura de Ferramentas MCP
```typescript
// Sempre seguir este padrão para novas ferramentas
server.tool(
  'toolName',
  'Descrição clara da funcionalidade',
  {
    // Schema Zod para validação
    param: z.string().describe('Descrição do parâmetro')
  },
  async ({ param }) => {
    // Implementação com tratamento de erros
    try {
      // Lógica da ferramenta
      return { content: [{ type: 'text', text: resultado }] };
    } catch (error) {
      // Log e tratamento de erro
    }
  }
);
```

### Queries MongoDB
- Sempre usar try/catch para operações de banco
- Implementar timeouts apropriados
- Usar aggregation pipelines para análises complexas

### Respostas das Ferramentas
- Formato JSON estruturado e consistente
- Incluir metadados quando relevante (timestamps, contadores, etc.)
- Respostas em português brasileiro
- Formatar números com separadores apropriados

## Contexto de Domínio - Smart Cities
- Foco em sustentabilidade e eficiência energética
- Monitoramento ambiental e qualidade de vida urbana
- Análise preditiva para manutenção preventiva
- Otimização de recursos públicos
- Integração entre diferentes sistemas urbanos (iluminação, água, gás)

## Quando Sugerir Melhorias
- Propor otimizações de performance para queries MongoDB
- Sugerir novos índices quando apropriado
- Recomendar ferramentas MCP adicionais baseadas no contexto
- Melhorar análises estatísticas e algoritmos preditivos

---

**Lembre-se**: Este projeto visa fornecer insights acionáveis para gestores urbanos através de dados IoT, sempre priorizando performance, confiabilidade e facilidade de uso das ferramentas MCP. 