# Dockerfile para o servidor MCP Smart City IoT
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

# Instalar dependências (incluindo devDependencies para build)
RUN npm ci

# Copiar código fonte
COPY src/ ./src/
COPY db-init/ ./db-init/

# Criar diretórios necessários
RUN mkdir -p logs docs

# Compilar TypeScript
RUN npm run build

# Expor porta para comunicação (opcional, para debug)
EXPOSE 3000

# Configurar variáveis de ambiente
ENV NODE_ENV=production
ENV MONGO_URI=mongodb://mongo:27017/admin

# Comando padrão
CMD ["node", "dist/server.js"] 