# Dockerfile para inicializador do banco de dados
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

# Instalar dependências
RUN npm ci --only=production

# Copiar scripts de inicialização
COPY populate_mongodb.js ./
COPY mongo-init.js ./

# Configurar variáveis de ambiente
ENV NODE_ENV=production

# Comando padrão
CMD ["npm", "start"] 