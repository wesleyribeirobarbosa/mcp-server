#!/bin/bash

# Script para testar a configuração Docker do servidor MCP

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 Testando Configuração Docker do MCP Server${NC}"

# Função para verificar se Docker está rodando
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        echo -e "${RED}❌ Docker não está rodando${NC}"
        return 1
    fi
    echo -e "${GREEN}✅ Docker está rodando${NC}"
    return 0
}

# Função para verificar se containers estão rodando
check_containers() {
    echo -e "${YELLOW}🔍 Verificando containers...${NC}"
    
    # Verificar MongoDB
    if docker ps --format "table {{.Names}}" | grep -q "smart-city-mongo"; then
        echo -e "${GREEN}✅ MongoDB container está rodando${NC}"
    else
        echo -e "${RED}❌ MongoDB container não está rodando${NC}"
        return 1
    fi
    
    # Verificar MCP Server
    if docker ps --format "table {{.Names}}" | grep -q "smart-city-mcp-server"; then
        echo -e "${GREEN}✅ MCP Server container está rodando${NC}"
    else
        echo -e "${RED}❌ MCP Server container não está rodando${NC}"
        return 1
    fi
    
    return 0
}

# Função para testar conexão com MongoDB
test_mongo_connection() {
    echo -e "${YELLOW}🗄️  Testando conexão com MongoDB...${NC}"
    
    if docker exec smart-city-mongo mongosh --eval "db.runCommand('ping')" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Conexão com MongoDB OK${NC}"
        return 0
    else
        echo -e "${RED}❌ Falha na conexão com MongoDB${NC}"
        return 1
    fi
}

# Função para testar execução do servidor MCP
test_mcp_execution() {
    echo -e "${YELLOW}🚀 Testando execução do servidor MCP...${NC}"
    
    # Testar se o servidor responde ao comando de listagem
    timeout 10s docker exec -i smart-city-mcp-server node dist/server.js <<< '{"jsonrpc": "2.0", "id": 1, "method": "tools/list"}' > /tmp/mcp_test.json 2>/dev/null || true
    
    if [ -s /tmp/mcp_test.json ]; then
        echo -e "${GREEN}✅ Servidor MCP respondeu corretamente${NC}"
        rm -f /tmp/mcp_test.json
        return 0
    else
        echo -e "${RED}❌ Servidor MCP não respondeu${NC}"
        rm -f /tmp/mcp_test.json
        return 1
    fi
}

# Função para testar configuração do Cursor
test_cursor_config() {
    echo -e "${YELLOW}📝 Verificando configuração do Cursor...${NC}"
    
    if [ -f ".cursor/mcp.json" ]; then
        echo -e "${GREEN}✅ Arquivo .cursor/mcp.json existe${NC}"
        
        # Verificar se a configuração Docker está presente
        if grep -q "docker" .cursor/mcp.json; then
            echo -e "${GREEN}✅ Configuração Docker encontrada${NC}"
            return 0
        else
            echo -e "${YELLOW}⚠️  Configuração Docker não encontrada em .cursor/mcp.json${NC}"
            return 1
        fi
    else
        echo -e "${RED}❌ Arquivo .cursor/mcp.json não existe${NC}"
        return 1
    fi
}

# Função para testar conectividade de rede
test_network() {
    echo -e "${YELLOW}🌐 Testando conectividade de rede...${NC}"
    
    # Testar se MongoDB está acessível na porta 27017
    if nc -z localhost 27017 2>/dev/null; then
        echo -e "${GREEN}✅ MongoDB acessível na porta 27017${NC}"
        return 0
    else
        echo -e "${RED}❌ MongoDB não acessível na porta 27017${NC}"
        return 1
    fi
}

# Função para mostrar informações do sistema
show_system_info() {
    echo -e "${BLUE}📊 Informações do Sistema:${NC}"
    echo -e "${YELLOW}   Docker Version:${NC} $(docker --version)"
    echo -e "${YELLOW}   Docker Compose Version:${NC} $(docker-compose --version)"
    echo -e "${YELLOW}   Node Version:${NC} $(node --version)"
    echo -e "${YELLOW}   NPM Version:${NC} $(npm --version)"
    echo ""
}

# Função para mostrar status dos containers
show_container_status() {
    echo -e "${BLUE}🐳 Status dos Containers:${NC}"
    docker-compose ps
    echo ""
}

# Função para mostrar logs recentes
show_recent_logs() {
    echo -e "${BLUE}📋 Logs Recentes do MCP Server:${NC}"
    docker-compose logs --tail=10 mcp-server
    echo ""
}

# Função principal de teste
run_tests() {
    local all_tests_passed=true
    
    echo -e "${BLUE}🧪 Iniciando testes...${NC}"
    echo ""
    
    # Teste 1: Docker
    if ! check_docker; then
        all_tests_passed=false
    fi
    echo ""
    
    # Teste 2: Containers
    if ! check_containers; then
        all_tests_passed=false
    fi
    echo ""
    
    # Teste 3: MongoDB
    if ! test_mongo_connection; then
        all_tests_passed=false
    fi
    echo ""
    
    # Teste 4: Rede
    if ! test_network; then
        all_tests_passed=false
    fi
    echo ""
    
    # Teste 5: MCP Server
    if ! test_mcp_execution; then
        all_tests_passed=false
    fi
    echo ""
    
    # Teste 6: Configuração Cursor
    if ! test_cursor_config; then
        all_tests_passed=false
    fi
    echo ""
    
    # Resultado final
    if [ "$all_tests_passed" = true ]; then
        echo -e "${GREEN}🎉 Todos os testes passaram!${NC}"
        echo -e "${GREEN}✅ O servidor MCP está pronto para uso com Cursor e VSCode${NC}"
        return 0
    else
        echo -e "${RED}❌ Alguns testes falharam${NC}"
        echo -e "${YELLOW}💡 Execute './scripts/docker-mcp.sh start' para iniciar os serviços${NC}"
        return 1
    fi
}

# Menu principal
case "${1:-all}" in
    "all")
        show_system_info
        run_tests
        show_container_status
        show_recent_logs
        ;;
    "docker")
        check_docker
        ;;
    "containers")
        check_containers
        ;;
    "mongo")
        test_mongo_connection
        ;;
    "network")
        test_network
        ;;
    "mcp")
        test_mcp_execution
        ;;
    "cursor")
        test_cursor_config
        ;;
    "status")
        show_container_status
        ;;
    "logs")
        show_recent_logs
        ;;
    *)
        echo -e "${GREEN}Uso: $0 [comando]${NC}"
        echo ""
        echo "Comandos disponíveis:"
        echo "  all       - Executar todos os testes"
        echo "  docker    - Testar Docker"
        echo "  containers - Testar containers"
        echo "  mongo     - Testar MongoDB"
        echo "  network   - Testar rede"
        echo "  mcp       - Testar servidor MCP"
        echo "  cursor    - Testar configuração Cursor"
        echo "  status    - Mostrar status dos containers"
        echo "  logs      - Mostrar logs recentes"
        ;;
esac 