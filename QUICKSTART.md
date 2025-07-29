# Guia de Início Rápido - MCP Smart Cities

## Setup em 3 Passos

### 1. Inicializar Banco de Dados
```bash
cd db-init
docker-compose up --build -d
```

### 2. Compilar o Servidor
```bash
npm install
npm run build
```

### 3A. Configurar VSCode com GitHub Copilot (Recomendado) 🆕
1. Abra o projeto no VSCode: `code .`
2. O VSCode detecta automaticamente `.vscode/mcp.json`
3. Na primeira execução, inserir URI do MongoDB quando solicitado
4. GitHub Copilot terá acesso às 13 ferramentas MCP automaticamente

### 3B. Configurar Cursor MCP (Tradicional)
Arquivo `.cursor/mcp.json` deve especificar o caminho absoluto para o server.js na pasta dist (resultante do npm run build).

## Teste Rápido de Funcionamento

### VSCode/GitHub Copilot
```
1. Abrir Chat do Copilot no VSCode
2. Selecionar "Agent Mode"  
3. Prompt: "Liste 5 dispositivos de iluminação"
4. Copilot executa automaticamente usando MCP tools
```

### Cursor
```
Prompt: "Liste 5 dispositivos de iluminação"
```

### Verificar Dados
```
Prompt: "Quantos dispositivos temos no total?"
```

### Verificar Telemetria
```
Prompt: "Mostre a telemetria do dispositivo LIGHT-000001 das últimas 2 horas"
```

### Testar Ferramentas Avançadas
```
Prompt: "Gere um dashboard da cidade para o último dia"
Prompt: "Quais dispositivos precisam de manutenção urgente?"
Prompt: "Detecte anomalias nos dados da última semana"
```

## Comandos Úteis

### Desenvolvimento
```bash
# Recompilar após mudanças
npm run build

# Ver logs
cat logs/server.log

# Reiniciar banco
cd db-init && docker-compose restart

# Abrir no VSCode
code .
```

### MongoDB
```bash
# Conectar ao banco
docker exec -it db-init_mongo_1 mongosh -u cursor-mcp-client -p cursor-mcp-password smart_city_iot

# Verificar collections
db.lighting_devices.countDocuments()
db.water_devices.countDocuments()
db.gas_devices.countDocuments()
```

## Prompts de Exemplo

### Básicos (Funcionam em VSCode Copilot e Cursor)
- "Lista dispositivos de iluminação no Sudeste"
- "Detecta vazamentos de água hoje"
- "Analisa consumo de gás na região Norte"

### Avançados
- "Gera um relatório de eficiência energética dos últimos 7 dias"
- "Cria um mapa GeoJSON dos dispositivos inativos"
- "Compara consumo de energia entre regiões"

### Super Avançados (Novas Ferramentas)
- "Dashboard completo da cidade com alertas para hoje"
- "Predição de manutenção para dispositivos de água em risco"
- "Relatório de qualidade da água com alertas de segurança"
- "Estatísticas regionais comparativas dos últimos 30 dias"
- "Detecção de anomalias de alta sensibilidade na iluminação"
- "Análise correlacionada entre consumo de energia e água"
- "Saúde dos dispositivos de gás abaixo de 80%"
- "Eficiência energética regional com recomendações"

### Prompts Específicos para VSCode/Copilot
- "Criar função que analisa eficiência energética por região"
- "Implementar alerta automático para vazamentos críticos"
- "Gerar código para dashboard em tempo real"

## Solução de Problemas

### Servidor não inicia
1. Verificar se MongoDB está rodando: `docker ps`
2. Compilar o código: `npm run build`
3. Verificar logs: `cat logs/server.log`

### VSCode/Copilot não conecta 🆕
1. Verificar se `.vscode/mcp.json` existe
2. Verificar se o caminho para `dist/server.js` está correto
3. Reiniciar VSCode
4. Verificar se o MongoDB está rodando
5. Ver logs do MCP no VSCode (View → Output → MCP)

### Cursor não conecta
1. Verificar caminho em `.cursor/mcp.json`
2. Reiniciar Cursor
3. Verificar se o servidor está rodando

### Dados não aparecem
1. Verificar se o banco foi populado: `docker logs db-init_mongo_1`
2. Testar conexão MongoDB
3. Verificar variáveis de ambiente

## Comparação de IDEs

| Característica | VSCode + Copilot | Cursor |
|----------------|------------------|---------|
| **Setup** | Automático (.vscode/mcp.json) | Manual (.cursor/mcp.json) |
| **Segurança** | ✅ Inputs seguros | ⚠️ Credenciais no arquivo |
| **AI Integration** | ✅ Nativo GitHub Copilot | ✅ IA integrada |
| **MCP Tools** | ✅ 13 ferramentas | ✅ 13 ferramentas |
| **Agent Mode** | ✅ Sim | ✅ Sim |
| **Autocomplete** | ✅ Copilot | ✅ Cursor AI |

## Estrutura de Timestamps

Para referências temporais, use:
- **Última hora**: `Date.now() / 1000 - 3600`
- **Últimas 24h**: `Date.now() / 1000 - 86400`
- **Última semana**: `Date.now() / 1000 - 604800`
- **Último mês**: `Date.now() / 1000 - 2592000`

## IDs de Dispositivos de Exemplo

```
Iluminação: LIGHT-000001 até LIGHT-010000
Água: WATER-000001 até WATER-050000
Gás: GAS-000001 até GAS-050000
```

## Status do Sistema

✅ **Funcionando**: IDE conectado, dados retornados
⚠️ **Parcial**: Conexão OK, mas alguns dados faltando
❌ **Erro**: Servidor não responde ou erro de conexão

## Arquivos de Configuração

### 🎯 Para começar rapidamente:
1. **VSCode**: Apenas abrir projeto (`code .`) 
2. **Cursor**: Configurar `.cursor/mcp.json` manualmente

### 📁 Arquivos importantes:
- `.vscode/mcp.json` → Configuração automática VSCode
- `.github/copilot-instructions.md` → Contexto para Copilot
- `.cursorrules` → Contexto para Cursor
- `docs/AI_CONTEXT.md` → Exemplos de prompts eficazes 