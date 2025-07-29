# Guia de Desenvolvimento - Servidor MCP Smart Cities

## Arquitetura do Projeto

### Estrutura de Arquivos
```
mcp-server/
├── src/
│   ├── server.ts          # Ponto de entrada do servidor MCP
│   ├── tools/             # Implementação das ferramentas MCP
│   │   ├── lighting.ts    # Ferramentas de iluminação
│   │   ├── water.ts       # Ferramentas de água
│   │   └── gas.ts         # Ferramentas de gás
│   └── utils/             # Utilitários compartilhados
├── .vscode/               # 🆕 Configurações do VSCode
│   └── mcp.json          # Configuração MCP para VSCode/Copilot
├── .github/               # 🆕 Configurações do GitHub
│   └── copilot-instructions.md # Instruções para GitHub Copilot
├── docs/                  # Documentação técnica
│   ├── DEVELOPMENT.md     # Este arquivo
│   └── AI_CONTEXT.md      # Contexto para interação com IA
├── db-init/               # Scripts de inicialização do MongoDB
├── logs/                  # Logs do servidor (criado automaticamente)
├── dist/                  # Código TypeScript compilado
├── .cursorrules           # Instruções para Cursor AI
└── QUICKSTART.md          # Guia de início rápido
```

## Configuração de Ambiente de Desenvolvimento

### Opção 1: VSCode com GitHub Copilot (Recomendado) 🆕

1. **Abrir projeto no VSCode:**
```bash
code .
```

2. **Configuração automática:**
- VSCode detecta `.vscode/mcp.json` automaticamente
- GitHub Copilot carrega instruções de `.github/copilot-instructions.md`
- Na primeira execução, solicita configuração do MongoDB

3. **Vantagens:**
- ✅ Setup automático
- ✅ Contexto de IA integrado
- ✅ Segurança (inputs interativos)
- ✅ Integração nativa com ferramentas MCP

### Opção 2: Cursor (Tradicional)

1. **Configuração manual:**
- Editar `.cursor/mcp.json` com caminho absoluto
- Cursor lê `.cursorrules` automaticamente

## Padrões de Código

### Validação com Zod
Todas as entradas de ferramentas MCP devem ser validadas:
```typescript
const schema = z.object({
  deviceId: z.string().describe('ID do dispositivo (ex: LIGHT-000001)'),
  startTime: z.number().describe('Timestamp inicial UNIX em segundos'),
  endTime: z.number().describe('Timestamp final UNIX em segundos')
});
```

### Estrutura de Resposta
Respostas devem seguir o padrão MCP:
```typescript
return {
  content: [
    {
      type: "text" as const,
      text: JSON.stringify(resultado, null, 2)
    }
  ]
};
```

### Paginação
Para consultas que podem retornar muitos dados:
```typescript
interface PaginatedResponse<T> {
  data: T[];
  total: number;
  offset: number;
  limit: number;
  hasNext: boolean;
}
```

## Configuração de Desenvolvimento

### Variáveis de Ambiente
```bash
MONGO_URI=mongodb://cursor-mcp-client:cursor-mcp-password@localhost:27017/smart_city_iot?authSource=admin
READ_ONLY=false
LOG_LEVEL=info
```

### Scripts NPM
- `npm run build` - Compila TypeScript para JavaScript
- `npm start` - Executa o servidor compilado
- `npm run dev` - Desenvolvimento com watch mode (se configurado)

## Debugging

### Logs
Logs são salvos em `logs/server.log` devido ao protocolo MCP (não pode usar console).

### Testando Ferramentas com VSCode/Copilot 🆕
1. Abrir Chat do Copilot
2. Selecionar "Agent Mode"
3. Usar linguagem natural para testar ferramentas
4. Copilot sugere código automaticamente baseado em `.github/copilot-instructions.md`

### Testando Ferramentas com Cursor
Use o Cursor com a configuração MCP para testar as ferramentas em tempo real.

## Arquivos de Configuração e Contexto

### `.vscode/mcp.json` - Configuração VSCode 🆕
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
            "args": ["~/caminho/para/dist/server.js"],
            "env": {
                "MONGO_URI": "${input:mongo-uri}",
                "READ_ONLY": "false"
            }
        }
    }
}
```

### `.github/copilot-instructions.md` - Instruções Copilot 🆕
- Contexto completo do projeto Smart Cities
- Padrões de código específicos
- Convenções de timestamps e IDs
- Estrutura das ferramentas MCP
- Instruções de validação e tratamento de erros

### `.cursorrules` - Instruções Cursor
- Contexto básico do projeto
- Tecnologias utilizadas
- Convenções principais
- Comandos importantes

### `docs/AI_CONTEXT.md` - Contexto para IAs
- Exemplos de prompts eficazes
- Estrutura detalhada dos dados
- Casos de uso comuns
- Limitações e considerações

## Convenções Específicas

### IDs de Dispositivos
- Iluminação: `LIGHT-XXXXXX`
- Água: `WATER-XXXXXX`
- Gás: `GAS-XXXXXX`

### Timestamps
Sempre usar UNIX timestamp em segundos (não milissegundos).

### Regiões Geográficas
- Norte, Sul, Sudeste, Centro-Oeste, Nordeste
- Coordenadas em formato [longitude, latitude]

## Adicionando Novas Ferramentas

1. Criar arquivo em `src/tools/`
2. Implementar validação Zod
3. Registrar no `server.ts`
4. Documentar no README.md
5. **NOVO:** Atualizar `.github/copilot-instructions.md` com contexto da nova ferramenta

### Exemplo de Nova Ferramenta
```typescript
server.tool(
    'novaFerramenta',
    'Descrição clara da nova funcionalidade para análise urbana',
    {
        parametro1: z.string().describe('Descrição específica do parâmetro'),
        parametro2: z.number().optional().describe('Parâmetro numérico opcional'),
        parametro3: z.enum(['opcao1', 'opcao2']).optional().describe('Enum para seleção')
    },
    async ({ parametro1, parametro2 = 100, parametro3 = 'opcao1' }) => {
        logger.info(`novaFerramenta chamada com ${parametro1}, ${parametro2}, ${parametro3}`);
        
        // Validação adicional se necessário
        if (parametro2 < 0 || parametro2 > 1000) {
            throw new Error('Parametro2 deve estar entre 0 e 1000');
        }
        
        try {
            // Lógica da ferramenta
            const resultado = await db.collection('collection')
                .aggregate([
                    { $match: { campo: parametro1 } },
                    { $group: { _id: null, total: { $sum: '$valor' } } }
                ]).toArray();
            
            // Formatação da resposta
            return {
                content: [{
                    type: 'text' as const,
                    text: JSON.stringify({
                        resultado: resultado[0],
                        parametros: { parametro1, parametro2, parametro3 },
                        timestamp: Math.floor(Date.now() / 1000)
                    }, null, 2)
                }]
            };
        } catch (error) {
            logger.error(`Erro na novaFerramenta: ${error.message}`);
            throw new Error(`Falha ao executar análise: ${error.message}`);
        }
    }
);
```

## Configuração para Diferentes IDEs

### Setup VSCode (Recomendado)
1. Abrir projeto: `code .`
2. VSCode detecta configuração automaticamente
3. Seguir prompts de configuração
4. GitHub Copilot ativo com contexto do projeto

### Setup Cursor
1. Configurar `.cursor/mcp.json` manualmente
2. Definir caminho absoluto para `dist/server.js`
3. Cursor lê `.cursorrules` automaticamente

### Comparação de Ferramentas

| Aspecto | VSCode + Copilot | Cursor |
|---------|------------------|---------|
| **Configuração** | 🟢 Automática | 🟡 Manual |
| **Segurança** | 🟢 Inputs seguros | 🟡 Hardcoded |
| **AI Context** | 🟢 Nativo GitHub | 🟢 Cursor AI |
| **MCP Integration** | 🟢 Nativo | 🟢 Nativo |
| **Debugging** | 🟢 Logs integrados | 🟢 Logs externos |

## Fluxo de Desenvolvimento Recomendado

### Para VSCode/Copilot
1. Abrir projeto no VSCode
2. Configurar MongoDB quando solicitado
3. Usar Chat Agent Mode para testar
4. Copilot sugere código baseado no contexto
5. Implementar seguindo padrões automaticamente

### Para Cursor
1. Configurar `.cursor/mcp.json`
2. Compilar e testar servidor
3. Usar prompts naturais para desenvolvimento
4. Cursor entende contexto via `.cursorrules`

## Padrões para Ferramentas Avançadas

### Análises Estatísticas
```typescript
// Padrão para análises com agregação MongoDB
const analise = await db.collection('telemetry')
    .aggregate([
        { $match: { timestamp: { $gte: startTime, $lte: endTime } } },
        {
            $group: {
                _id: '$deviceId',
                avg: { $avg: '$valor' },
                max: { $max: '$valor' },
                min: { $min: '$valor' },
                stdDev: { $stdDevSamp: '$valor' }
            }
        },
        {
            $project: {
                deviceId: '$_id',
                average: { $round: ['$avg', 2] },
                maximum: '$max',
                minimum: '$min',
                standardDeviation: { $round: ['$stdDev', 3] },
                anomalyScore: {
                    $cond: [
                        { $gt: ['$stdDev', 10] },
                        'high',
                        'normal'
                    ]
                }
            }
        }
    ]).toArray();
```

### Scores de Saúde/Qualidade
```typescript
// Padrão para calcular scores (0-100)
const healthScore = {
    $round: [
        {
            $max: [
                0,
                {
                    $min: [
                        100,
                        {
                            $subtract: [
                                100,
                                {
                                    $add: [
                                        // Penalizações baseadas em critérios
                                        { $cond: [{ $lt: ['$battery', 20] }, 30, 0] },
                                        { $cond: [{ $gt: ['$temperature', 40] }, 25, 0] },
                                        { $multiply: ['$errorCount', 5] }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        },
        1
    ]
};
```

### Predições e Alertas
```typescript
// Padrão para sistemas de alerta
const alerts = {
    critical: [],
    warning: [],
    info: []
};

// Adicionar alertas baseados em condições
if (criticalCondition) {
    alerts.critical.push({
        type: 'system_failure',
        message: 'Descrição do problema',
        priority: 'immediate',
        devices: affectedDevices,
        timestamp: Math.floor(Date.now() / 1000)
    });
}
```

### Correlações e Análises Cruzadas
```typescript
// Padrão para análises entre coleções
const correlationPipeline = [
    {
        $lookup: {
            from: 'other_collection',
            localField: 'deviceId',
            foreignField: 'deviceId',
            as: 'relatedData'
        }
    },
    { $unwind: '$relatedData' },
    {
        $group: {
            _id: '$region',
            correlation: {
                $avg: {
                    $multiply: ['$value1', '$relatedData.value2']
                }
            }
        }
    }
];
``` 