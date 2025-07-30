#!/bin/bash

# Script para desenvolvimento com hot reload usando Docker
# Monta o código fonte para desenvolvimento em tempo real

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔧 Modo Desenvolvimento com Docker${NC}"

# Função para verificar se Docker está rodando
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        echo -e "${RED}❌ Docker não está rodando. Por favor, inicie o Docker e tente novamente.${NC}"
        exit 1
    fi
}

# Função para criar docker-compose.dev.yml
create_dev_compose() {
    cat > docker-compose.dev.yml << 'EOF'
version: '3.8'

services:
  # MongoDB (mesmo que produção)
  mongo:
    image: mongo:6.0
    container_name: smart-city-mongo-dev
    environment:
      - MONGO_INITDB_ROOT_USERNAME=cursor-mcp-client
      - MONGO_INITDB_ROOT_PASSWORD=cursor-mcp-password
      - MONGO_INITDB_DATABASE=smart_city_iot
    volumes:
      - mongo_data_dev:/data/db
      - ./db-init:/docker-entrypoint-initdb.d:ro
    ports:
      - "27017:27017"
    networks:
      - mcp-network-dev
    restart: unless-stopped

  # Servidor MCP em modo desenvolvimento
  mcp-server-dev:
    build: 
      context: .
      dockerfile: Dockerfile.dev
    container_name: smart-city-mcp-server-dev
    environment:
      - NODE_ENV=development
      - MONGO_URI=mongodb://mongo:27017/admin
    volumes:
      # Montar código fonte para hot reload
      - ./src:/app/src:ro
      - ./dist:/app/dist
      - ./logs:/app/logs
      - ./docs:/app/docs
      - ./.cursor:/app/.cursor:ro
      - node_modules_dev:/app/node_modules
    depends_on:
      - mongo
    networks:
      - mcp-network-dev
    restart: unless-stopped
    stdin_open: true
    tty: true
    command: ["npm", "run", "dev:docker"]

  # Inicializador do banco de dados (removido - usa script separado)

networks:
  mcp-network-dev:
    driver: bridge

volumes:
  mongo_data_dev:
    driver: local
  node_modules_dev:
    driver: local
EOF
}

# Função para criar Dockerfile.dev
create_dev_dockerfile() {
    cat > Dockerfile.dev << 'EOF'
# Dockerfile para desenvolvimento com hot reload
FROM node:18-alpine

# Instalar dependências do sistema
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    && rm -rf /var/cache/apk/*

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./
COPY tsconfig.json ./

# Instalar dependências (incluindo devDependencies)
RUN npm ci

# Criar diretórios necessários
RUN mkdir -p logs docs dist

# Configurar variáveis de ambiente
ENV NODE_ENV=development
ENV MONGO_URI=mongodb://mongo:27017/admin

# Comando para desenvolvimento com hot reload
CMD ["npm", "run", "dev:docker"]
EOF
}

# Função para adicionar script de desenvolvimento ao package.json
add_dev_script() {
    if ! grep -q "dev:docker" package.json; then
        # Adicionar script dev:docker ao package.json
        sed -i 's/"dev": "ts-node src\/server.ts",/"dev": "ts-node src\/server.ts",\n    "dev:docker": "ts-node --watch src\/server.ts",/' package.json
    fi
}

# Função para iniciar ambiente de desenvolvimento
start_dev() {
    echo -e "${YELLOW}🔧 Criando arquivos de desenvolvimento...${NC}"
    create_dev_compose
    create_dev_dockerfile
    add_dev_script
    
    echo -e "${YELLOW}📦 Construindo containers de desenvolvimento...${NC}"
    docker-compose -f docker-compose.dev.yml build --no-cache
    
    echo -e "${YELLOW}🐳 Iniciando serviços de desenvolvimento...${NC}"
    docker-compose -f docker-compose.dev.yml up -d mongo
    
    echo -e "${YELLOW}⏳ Aguardando MongoDB inicializar...${NC}"
    sleep 10
    
    echo -e "${YELLOW}🗄️  Inicializando banco de dados...${NC}"
    # O MongoDB já inicializa com mongo-init.js automaticamente
    
    echo -e "${YELLOW}📊 Populando banco de dados com dados de teste...${NC}"
    ./scripts/populate-db.sh populate
    
    echo -e "${YELLOW}🚀 Iniciando servidor MCP em modo desenvolvimento...${NC}"
    docker-compose -f docker-compose.dev.yml up -d mcp-server-dev
    
    echo -e "${GREEN}✅ Ambiente de desenvolvimento iniciado!${NC}"
    echo -e "${BLUE}📝 Para ver logs: ./scripts/dev-docker.sh logs${NC}"
    echo -e "${BLUE}📝 Para parar: ./scripts/dev-docker.sh stop${NC}"
}

# Função para mostrar logs
show_logs() {
    echo -e "${YELLOW}📋 Logs do servidor MCP (desenvolvimento):${NC}"
    docker-compose -f docker-compose.dev.yml logs -f mcp-server-dev
}

# Função para parar serviços
stop_dev() {
    echo -e "${YELLOW}🛑 Parando serviços de desenvolvimento...${NC}"
    docker-compose -f docker-compose.dev.yml down
    echo -e "${GREEN}✅ Serviços parados${NC}"
}

# Função para limpar tudo
cleanup_dev() {
    echo -e "${YELLOW}🧹 Limpando containers e volumes de desenvolvimento...${NC}"
    docker-compose -f docker-compose.dev.yml down -v
    docker system prune -f
    rm -f docker-compose.dev.yml Dockerfile.dev
    echo -e "${GREEN}✅ Limpeza concluída${NC}"
}

# Função para mostrar status
show_status() {
    echo -e "${YELLOW}📊 Status dos containers (desenvolvimento):${NC}"
    docker-compose -f docker-compose.dev.yml ps
    echo ""
    echo -e "${YELLOW}🌐 URLs de acesso:${NC}"
    echo -e "${GREEN}   MongoDB: mongodb://localhost:27017${NC}"
    echo -e "${GREEN}   MCP Server: stdio (via Docker exec)${NC}"
}

# Função para acessar shell do container
shell_dev() {
    echo -e "${YELLOW}🐚 Acessando shell do container de desenvolvimento...${NC}"
    docker exec -it smart-city-mcp-server-dev /bin/sh
}

# Função para reconstruir após mudanças
rebuild_dev() {
    echo -e "${YELLOW}🔨 Reconstruindo containers de desenvolvimento...${NC}"
    docker-compose -f docker-compose.dev.yml down
    docker-compose -f docker-compose.dev.yml build --no-cache
    docker-compose -f docker-compose.dev.yml up -d
    echo -e "${GREEN}✅ Reconstrução concluída${NC}"
}

# Menu principal
case "${1:-start}" in
    "start")
        check_docker
        start_dev
        show_status
        ;;
    "logs")
        show_logs
        ;;
    "stop")
        stop_dev
        ;;
    "cleanup")
        cleanup_dev
        ;;
    "status")
        show_status
        ;;
    "shell")
        shell_dev
        ;;
    "rebuild")
        check_docker
        rebuild_dev
        ;;
    *)
        echo -e "${GREEN}Uso: $0 [comando]${NC}"
        echo ""
        echo "Comandos disponíveis:"
        echo "  start    - Iniciar ambiente de desenvolvimento"
        echo "  logs     - Mostrar logs do servidor"
        echo "  stop     - Parar todos os serviços"
        echo "  rebuild  - Reconstruir containers"
        echo "  cleanup  - Limpar containers e volumes"
        echo "  status   - Mostrar status dos containers"
        echo "  shell    - Acessar shell do container"
        ;;
esac 