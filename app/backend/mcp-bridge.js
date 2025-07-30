const { spawn } = require('child_process');
const path = require('path');

class MCPBridge {
    constructor() {
        this.mcpProcess = null;
        this.isInitialized = false;
        this.messageId = 1;
        this.pendingRequests = new Map();
    }

    async initialize() {
        if (this.isInitialized) {
            return;
        }

        try {
            // Validar se o servidor MCP existe
            const serverPath = path.resolve(__dirname, '../../src/server.ts');
            const fs = require('fs');
            
            if (!fs.existsSync(serverPath)) {
                throw new Error(`Servidor MCP não encontrado em: ${serverPath}`);
            }
            
            console.log('[MCP Bridge] Iniciando servidor MCP...');
            
            // Iniciar processo do servidor MCP via ts-node
            this.mcpProcess = spawn('npx', ['ts-node', serverPath], {
                stdio: ['pipe', 'pipe', 'pipe'],
                cwd: path.resolve(__dirname, '../..')
            });

            // Aguardar processo inicializar
            await new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Timeout ao iniciar processo MCP'));
                }, 5000);

                this.mcpProcess.on('spawn', () => {
                    clearTimeout(timeout);
                    resolve();
                });

                this.mcpProcess.on('error', (error) => {
                    clearTimeout(timeout);
                    reject(error);
                });
            });

            // Configurar comunicação stdio
            this.setupStdioHandlers();
            
            // Aguardar um pouco para o servidor estar pronto
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Testar conexão com handshake
            await this.handshake();
            
            // Validar se ferramentas estão disponíveis
            const tools = await this.listTools();
            if (!tools || tools.length === 0) {
                throw new Error('Nenhuma ferramenta MCP encontrada');
            }
            
            console.log(`[MCP Bridge] ${tools.length} ferramentas MCP disponíveis`);
            
            this.isInitialized = true;
            console.log('[MCP Bridge] Inicializado com sucesso');
            
        } catch (error) {
            console.error('[MCP Bridge] Erro na inicialização:', error);
            this.cleanup();
            throw error;
        }
    }

    setupStdioHandlers() {
        // Buffer para mensagens parciais
        let buffer = '';

        this.mcpProcess.stdout.on('data', (data) => {
            buffer += data.toString();
            
            // Processar mensagens completas (JSON separados por newline)
            const lines = buffer.split('\n');
            buffer = lines.pop(); // Manter linha incompleta no buffer
            
            lines.forEach(line => {
                if (line.trim()) {
                    try {
                        const message = JSON.parse(line);
                        this.handleMCPMessage(message);
                    } catch (error) {
                        console.error('[MCP Bridge] Erro ao parsear mensagem:', error);
                    }
                }
            });
        });

        this.mcpProcess.stderr.on('data', (data) => {
            console.error('[MCP Bridge] Stderr:', data.toString());
        });

        this.mcpProcess.on('close', (code) => {
            console.log('[MCP Bridge] Processo MCP encerrado com código:', code);
            this.isInitialized = false;
        });
    }

    handleMCPMessage(message) {
        console.log('[MCP Bridge] Mensagem recebida:', JSON.stringify(message, null, 2));
        
        if (message.id && this.pendingRequests.has(message.id)) {
            const { resolve, reject } = this.pendingRequests.get(message.id);
            this.pendingRequests.delete(message.id);
            
            if (message.error) {
                reject(new Error(message.error.message || 'Erro MCP'));
            } else {
                resolve(message.result);
            }
        }
    }

    async sendMCPRequest(method, params = {}) {
        return new Promise((resolve, reject) => {
            const id = this.messageId++;
            const request = {
                jsonrpc: '2.0',
                id,
                method,
                params
            };

            this.pendingRequests.set(id, { resolve, reject });
            
            // Timeout de 30 segundos
            setTimeout(() => {
                if (this.pendingRequests.has(id)) {
                    this.pendingRequests.delete(id);
                    reject(new Error('Timeout na requisição MCP'));
                }
            }, 60000);

            const requestStr = JSON.stringify(request) + '\n';
            this.mcpProcess.stdin.write(requestStr);
            console.log('[MCP Bridge] Enviando:', requestStr.trim());
        });
    }

    async handshake() {
        try {
            const result = await this.sendMCPRequest('initialize', {
                protocolVersion: '2024-11-05',
                capabilities: {},
                clientInfo: {
                    name: 'smart-cities-web-client',
                    version: '1.0.0'
                }
            });
            console.log('[MCP Bridge] Handshake realizado:', result);
            return result;
        } catch (error) {
            console.error('[MCP Bridge] Erro no handshake:', error);
            throw error;
        }
    }

    async listTools() {
        try {
            const result = await this.sendMCPRequest('tools/list');
            return result.tools || [];
        } catch (error) {
            console.error('[MCP Bridge] Erro ao listar ferramentas:', error);
            throw error;
        }
    }

    async executeTool(toolName, params = {}) {
        try {
            const result = await this.sendMCPRequest('tools/call', {
                name: toolName,
                arguments: params
            });
            return result;
        } catch (error) {
            console.error(`[MCP Bridge] Erro ao executar ferramenta ${toolName}:`, error);
            throw error;
        }
    }

    cleanup() {
        if (this.mcpProcess) {
            this.mcpProcess.kill();
            this.mcpProcess = null;
        }
        this.isInitialized = false;
        this.pendingRequests.clear();
        console.log('[MCP Bridge] Limpeza realizada');
    }

    async destroy() {
        this.cleanup();
    }

    // Método para testar conectividade
    async testConnection() {
        try {
            if (!this.isInitialized) {
                throw new Error('Ponte MCP não inicializada');
            }

            // Testar listagem de ferramentas
            const tools = await this.listTools();
            console.log(`[MCP Bridge] Teste de conectividade: ${tools.length} ferramentas encontradas`);
            
            return {
                success: true,
                toolsCount: tools.length,
                tools: tools.map(t => t.name)
            };
        } catch (error) {
            console.error('[MCP Bridge] Erro no teste de conectividade:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Método para validar ferramenta
    async validateTool(toolName) {
        try {
            const tools = await this.listTools();
            const tool = tools.find(t => t.name === toolName);
            
            if (!tool) {
                throw new Error(`Ferramenta '${toolName}' não encontrada`);
            }
            
            return tool;
        } catch (error) {
            console.error(`[MCP Bridge] Erro ao validar ferramenta ${toolName}:`, error);
            throw error;
        }
    }
}

// Singleton instance
const mcpBridge = new MCPBridge();

module.exports = mcpBridge;
