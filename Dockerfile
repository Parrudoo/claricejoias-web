# Estágio 1: Build (Compilando o projeto)
FROM node:18-alpine AS build
WORKDIR /app

# Copia os arquivos de dependência e instala (ajuda no cache)
COPY package*.json ./
RUN npm install

# Copia o resto do código e gera a versão de produção
COPY . .
RUN npm run build

# Estágio 2: Nginx (Servidor Web Leve)
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Limpa os arquivos padrão do Nginx
RUN rm -rf ./*

# Copia os arquivos compilados do estágio 1 (se for Create React App, mude 'dist' para 'build')
COPY --from=build /app/build .

# CONFIGURAÇÃO MÁGICA: Garante que as rotas do React não deem erro 404 ao atualizar a página (F5)
RUN echo 'server { listen 80; location / { root /usr/share/nginx/html; index index.html index.htm; try_files $uri $uri/ /index.html; } }' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]