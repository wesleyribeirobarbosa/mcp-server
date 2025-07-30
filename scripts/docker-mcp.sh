#!/bin/bash

# Script para executar o servidor MCP em Docker
# Permite comunicação via stdio para Cursor e VSCode

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Iniciando servidor MCP Smart City IoT em Docker${NC}"

# Função para verificar se Docker está rodando
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        echo -e "${RED}❌ Docker não está rodando. Por favor, inicie o Docker e tente novamente.${NC}"
        exit 1
    fi
}

# Função para construir e iniciar os containers
start_services() {
    echo -e "${YELLOW}📦 Construindo containers...${NC}"
    docker-compose build --no-cache
    
    echo -e "${YELLOW}🐳 Iniciando serviços...${NC}"
    docker-compose up -d mongo
    
    echo -e "${YELLOW}⏳ Aguardando MongoDB inicializar...${NC}"
    sleep 10
    
    echo -e "${YELLOW}🗄️  Inicializando banco de dados...${NC}"
    # O MongoDB já inicializa com mongo-init.js automaticamente
    
    echo -e "${YELLOW}📊 Populando banco de dados com dados de teste...${NC}"
    ./scripts/populate-db.sh populate
    
    echo -e "${YELLOW}🚀 Iniciando servidor MCP...${NC}"
    docker-compose up -d mcp-server
}

# Função para executar servidor MCP em modo stdio
run_mcp_stdio() {
    echo -e "${GREEN}🔌 Executando servidor MCP em modo stdio para Cursor/VSCode${NC}"
    echo -e "${YELLOW}📝 Para usar no Cursor, adicione ao .cursor/mcp.json:${NC}"
    echo -e "${GREEN}   \"command\": \"docker\", \"args\": [\"exec\", \"-i\", \"smart-city-mcp-server\", \"node\", \"dist/server.js\"]${NC}"
    echo ""
    
    # Executar servidor MCP via stdio
    docker exec -i smart-city-mcp-server node dist/server.js
}

# Função para mostrar logs
show_logs() {
    echo -e "${YELLOW}📋 Logs do servidor MCP:${NC}"
    docker-compose logs -f mcp-server
}

# Função para parar serviços
stop_services() {
    echo -e "${YELLOW}🛑 Parando serviços...${NC}"
    docker-compose down
    echo -e "${GREEN}✅ Serviços parados${NC}"
}

# Função para limpar tudo
cleanup() {
    echo -e "${YELLOW}🧹 Limpando containers e volumes...${NC}"
    docker-compose down -v
    docker system prune -f
    echo -e "${GREEN}✅ Limpeza concluída${NC}"
}

# Função para mostrar status
show_status() {
    echo -e "${YELLOW}📊 Status dos containers:${NC}"
    docker-compose ps
    echo ""
    echo -e "${YELLOW}🌐 URLs de acesso:${NC}"
    echo -e "${GREEN}   MongoDB: mongodb://localhost:27017${NC}"
    echo -e "${GREEN}   MCP Server: stdio (via Docker exec)${NC}"
}

# Menu principal
case "${1:-start}" in
    "start")
        check_docker
        start_services
        show_status
        ;;
    "stdio")
        check_docker
        run_mcp_stdio
        ;;
    "logs")
        show_logs
        ;;
    "stop")
        stop_services
        ;;
    "cleanup")
        cleanup
        ;;
    "status")
        show_status
        ;;
    "restart")
        stop_services
        start_services
        show_status
        ;;
    *)
        echo -e "${GREEN}Uso: $0 [comando]${NC}"
        echo ""
        echo "Comandos disponíveis:"
        echo "  start    - Iniciar todos os serviços"
        echo "  stdio    - Executar servidor MCP em modo stdio"
        echo "  logs     - Mostrar logs do servidor"
        echo "  stop     - Parar todos os serviços"
        echo "  restart  - Reiniciar todos os serviços"
        echo "  cleanup  - Limpar containers e volumes"
        echo "  status   - Mostrar status dos containers"
        ;;
esac 