#!/bin/bash

# Script para popular o banco de dados com dados de teste
# Deve ser executado após o MongoDB estar rodando

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🗄️  Populando Banco de Dados com Dados de Teste${NC}"

# Função para verificar se MongoDB está rodando
check_mongo() {
    if ! docker ps --format "table {{.Names}}" | grep -q "smart-city-mongo"; then
        echo -e "${RED}❌ MongoDB container não está rodando${NC}"
        echo -e "${YELLOW}💡 Execute './scripts/docker-mcp.sh start' primeiro${NC}"
        return 1
    fi
    
    # Aguardar MongoDB estar pronto
    echo -e "${YELLOW}⏳ Aguardando MongoDB estar pronto...${NC}"
    for i in {1..30}; do
        if docker exec smart-city-mongo mongosh --eval "db.runCommand('ping')" > /dev/null 2>&1; then
            echo -e "${GREEN}✅ MongoDB está pronto${NC}"
            return 0
        fi
        sleep 2
    done
    
    echo -e "${RED}❌ Timeout aguardando MongoDB${NC}"
    return 1
}

# Função para popular banco de dados
populate_database() {
    echo -e "${YELLOW}📊 Populando banco de dados...${NC}"
    
    # Construir e executar container de população
    docker run --rm \
        --network mcp-server_mcp-network \
        --name smart-city-db-populator \
        -v "$(pwd)/db-init:/app" \
        -w /app \
        -e MONGO_URI="mongodb://cursor-mcp-client:cursor-mcp-password@mongo:27017/admin" \
        node:18-alpine \
        sh -c "npm ci --only=production && npm start"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Banco de dados populado com sucesso${NC}"
        return 0
    else
        echo -e "${RED}❌ Erro ao popular banco de dados${NC}"
        return 1
    fi
}

# Função para verificar dados populados
verify_data() {
    echo -e "${YELLOW}🔍 Verificando dados populados...${NC}"
    
    # Verificar collections
    collections=$(docker exec smart-city-mongo mongosh -u cursor-mcp-client -p cursor-mcp-password --eval "db.getCollectionNames()" --quiet)
    
    if echo "$collections" | grep -q "lighting_devices"; then
        echo -e "${GREEN}✅ Collection lighting_devices encontrada${NC}"
    else
        echo -e "${RED}❌ Collection lighting_devices não encontrada${NC}"
        return 1
    fi
    
    if echo "$collections" | grep -q "water_devices"; then
        echo -e "${GREEN}✅ Collection water_devices encontrada${NC}"
    else
        echo -e "${RED}❌ Collection water_devices não encontrada${NC}"
        return 1
    fi
    
    if echo "$collections" | grep -q "gas_devices"; then
        echo -e "${GREEN}✅ Collection gas_devices encontrada${NC}"
    else
        echo -e "${RED}❌ Collection gas_devices não encontrada${NC}"
        return 1
    fi
    
    # Verificar contagem de documentos
    lighting_count=$(docker exec smart-city-mongo mongosh -u cursor-mcp-client -p cursor-mcp-password --eval "db.lighting_devices.countDocuments()" --quiet)
    water_count=$(docker exec smart-city-mongo mongosh -u cursor-mcp-client -p cursor-mcp-password --eval "db.water_devices.countDocuments()" --quiet)
    gas_count=$(docker exec smart-city-mongo mongosh -u cursor-mcp-client -p cursor-mcp-password --eval "db.gas_devices.countDocuments()" --quiet)
    
    echo -e "${GREEN}📊 Documentos populados:${NC}"
    echo -e "${GREEN}   - lighting_devices: ${lighting_count}${NC}"
    echo -e "${GREEN}   - water_devices: ${water_count}${NC}"
    echo -e "${GREEN}   - gas_devices: ${gas_count}${NC}"
    
    return 0
}

# Função para mostrar estatísticas
show_stats() {
    echo -e "${BLUE}📈 Estatísticas do Banco de Dados:${NC}"
    
    # Estatísticas gerais
    echo -e "${YELLOW}📊 Collections disponíveis:${NC}"
    docker exec smart-city-mongo mongosh -u cursor-mcp-client -p cursor-mcp-password --eval "db.getCollectionNames().forEach(print)" --quiet
    
    echo ""
    echo -e "${YELLOW}📊 Tamanho das collections:${NC}"
    docker exec smart-city-mongo mongosh -u cursor-mcp-client -p cursor-mcp-password --eval "db.stats()" --quiet | grep -E "(collections|dataSize|storageSize)"
}

# Menu principal
case "${1:-populate}" in
    "populate")
        if check_mongo; then
            populate_database
            if [ $? -eq 0 ]; then
                verify_data
                show_stats
            fi
        fi
        ;;
    "verify")
        if check_mongo; then
            verify_data
        fi
        ;;
    "stats")
        if check_mongo; then
            show_stats
        fi
        ;;
    "reset")
        echo -e "${YELLOW}🔄 Resetando banco de dados...${NC}"
        docker exec smart-city-mongo mongosh -u cursor-mcp-client -p cursor-mcp-password --eval "db.dropDatabase()" --quiet
        echo -e "${GREEN}✅ Banco de dados resetado${NC}"
        ;;
    *)
        echo -e "${GREEN}Uso: $0 [comando]${NC}"
        echo ""
        echo "Comandos disponíveis:"
        echo "  populate  - Popular banco de dados (padrão)"
        echo "  verify    - Verificar dados populados"
        echo "  stats     - Mostrar estatísticas"
        echo "  reset     - Resetar banco de dados"
        ;;
esac 