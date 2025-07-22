#!/bin/bash

# 🚀 Script de Instalação Automatizada do Whaticket na VPS
# Autor: Equipe 4Web
# Versão: 1.0

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERRO] $1${NC}"
    exit 1
}

warning() {
    echo -e "${YELLOW}[AVISO] $1${NC}"
}

info() {
    echo -e "${BLUE}[INFO] $1${NC}"
}

# Verificar se está rodando como root
if [[ $EUID -ne 0 ]]; then
   error "Este script deve ser executado como root"
fi

# Variáveis de configuração
DOMAIN=""
DB_PASSWORD=""
JWT_SECRET=""
EMAIL=""
EMAIL_PASSWORD=""

# Função para obter configurações
get_config() {
    log "Configuração inicial do Whaticket"
    
    read -p "Digite seu domínio (ex: meusite.com): " DOMAIN
    read -s -p "Digite uma senha forte para o banco de dados: " DB_PASSWORD
    echo
    read -s -p "Digite uma chave JWT secreta: " JWT_SECRET
    echo
    read -p "Digite seu email para SSL (opcional): " EMAIL
    read -s -p "Digite a senha do app do email (se aplicável): " EMAIL_PASSWORD
    echo
    
    # Gerar JWT_SECRET se não fornecido
    if [ -z "$JWT_SECRET" ]; then
        JWT_SECRET=$(openssl rand -base64 32)
        info "JWT_SECRET gerado automaticamente"
    fi
}

# Atualizar sistema
update_system() {
    log "Atualizando sistema..."
    apt update && apt upgrade -y
    apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release
}

# Instalar Node.js
install_nodejs() {
    log "Instalando Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt install -y nodejs
    
    # Verificar instalação
    NODE_VERSION=$(node --version)
    NPM_VERSION=$(npm --version)
    log "Node.js $NODE_VERSION e npm $NPM_VERSION instalados"
}

# Instalar PostgreSQL
install_postgresql() {
    log "Instalando PostgreSQL..."
    apt install -y postgresql postgresql-contrib
    
    # Configurar banco
    log "Configurando banco de dados..."
    sudo -u postgres psql -c "CREATE USER whaticket WITH PASSWORD '$DB_PASSWORD';"
    sudo -u postgres psql -c "CREATE DATABASE whaticket OWNER whaticket;"
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE whaticket TO whaticket;"
    
    # Configurar pg_hba.conf para conexão local
    sed -i "s/local   all             all                                     peer/local   all             all                                     md5/" /etc/postgresql/*/main/pg_hba.conf
    systemctl restart postgresql
}

# Instalar Redis
install_redis() {
    log "Instalando Redis..."
    apt install -y redis-server
    systemctl enable redis-server
    systemctl start redis-server
    
    # Testar Redis
    if redis-cli ping | grep -q "PONG"; then
        log "Redis instalado e funcionando"
    else
        error "Falha ao instalar Redis"
    fi
}

# Instalar Nginx
install_nginx() {
    log "Instalando Nginx..."
    apt install -y nginx
    
    # Configurar firewall
    ufw allow 'Nginx Full'
    ufw allow OpenSSH
    ufw --force enable
    
    systemctl enable nginx
    systemctl start nginx
}

# Instalar PM2
install_pm2() {
    log "Instalando PM2..."
    npm install -g pm2
}

# Clonar e configurar projeto
setup_project() {
    log "Configurando projeto..."
    
    # Criar diretório
    mkdir -p /var/www/whaticket
    cd /var/www/whaticket
    
    # Clonar repositório
    git clone https://github.com/equipe4web/whaticket.git .
    
    # Instalar dependências
    log "Instalando dependências do backend..."
    cd backend
    npm install
    
    log "Instalando dependências do frontend..."
    cd ../frontend
    npm install
    
    # Configurar .env do backend
    log "Configurando variáveis de ambiente..."
    cd ../backend
    cp .env.example .env
    
    # Substituir valores no .env
    sed -i "s/DB_HOST=.*/DB_HOST=localhost/" .env
    sed -i "s/DB_USER=.*/DB_USER=whaticket/" .env
    sed -i "s/DB_PASS=.*/DB_PASS=$DB_PASSWORD/" .env
    sed -i "s/DB_NAME=.*/DB_NAME=whaticket/" .env
    sed -i "s/DB_PORT=.*/DB_PORT=5432/" .env
    sed -i "s/REDIS_HOST=.*/REDIS_HOST=localhost/" .env
    sed -i "s/REDIS_PORT=.*/REDIS_PORT=6379/" .env
    sed -i "s/PORT=.*/PORT=8080/" .env
    sed -i "s/NODE_ENV=.*/NODE_ENV=production/" .env
    sed -i "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" .env
    sed -i "s|FRONTEND_URL=.*|FRONTEND_URL=https://$DOMAIN|" .env
    sed -i "s|BACKEND_URL=.*|BACKEND_URL=https://$DOMAIN:8080|" .env
    
    # Configurar email se fornecido
    if [ ! -z "$EMAIL" ]; then
        sed -i "s/MAIL_HOST=.*/MAIL_HOST=smtp.gmail.com/" .env
        sed -i "s/MAIL_PORT=.*/MAIL_PORT=587/" .env
        sed -i "s/MAIL_USER=.*/MAIL_USER=$EMAIL/" .env
        sed -i "s/MAIL_PASS=.*/MAIL_PASS=$EMAIL_PASSWORD/" .env
    fi
    
    # Configurar .env do frontend
    cd ../frontend
    cp .env.example .env
    sed -i "s|REACT_APP_BACKEND_URL=.*|REACT_APP_BACKEND_URL=https://$DOMAIN:8080|" .env
}

# Configurar banco de dados
setup_database() {
    log "Configurando banco de dados..."
    cd /var/www/whaticket/backend
    
    # Executar migrações
    npx prisma migrate deploy
    npx prisma generate
    
    # Popular dados iniciais
    npm run db:seed
}

# Build do projeto
build_project() {
    log "Fazendo build do projeto..."
    
    # Build do backend
    cd /var/www/whaticket/backend
    npm run build
    
    # Build do frontend
    cd /var/www/whaticket/frontend
    npm run build
}

# Configurar PM2
setup_pm2() {
    log "Configurando PM2..."
    cd /var/www/whaticket
    
    # Criar ecosystem.config.js
    cat > ecosystem.config.js << EOF
module.exports = {
  apps: [
    {
      name: 'whaticket-backend',
      script: './backend/dist/server.js',
      cwd: '/var/www/whaticket',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 8080
      }
    }
  ]
};
EOF
    
    # Iniciar com PM2
    pm2 start ecosystem.config.js
    pm2 save
    pm2 startup
}

# Configurar Nginx
setup_nginx() {
    log "Configurando Nginx..."
    
    # Criar configuração do site
    cat > /etc/nginx/sites-available/whaticket << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    # Frontend
    location / {
        root /var/www/whaticket/frontend/build;
        try_files \$uri \$uri/ /index.html;
        
        # Headers de segurança
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "no-referrer-when-downgrade" always;
        add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # WebSocket
    location /socket.io/ {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Uploads
    location /uploads/ {
        alias /var/www/whaticket/backend/uploads/;
    }
}
EOF
    
    # Ativar site
    ln -sf /etc/nginx/sites-available/whaticket /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
    
    # Testar e recarregar Nginx
    nginx -t
    systemctl reload nginx
}

# Configurar SSL
setup_ssl() {
    if [ ! -z "$DOMAIN" ]; then
        log "Configurando SSL..."
        apt install -y certbot python3-certbot-nginx
        
        # Obter certificado SSL
        certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email $EMAIL
    fi
}

# Configurar permissões
setup_permissions() {
    log "Configurando permissões..."
    chown -R www-data:www-data /var/www/whaticket
    chmod -R 755 /var/www/whaticket
}

# Verificar instalação
verify_installation() {
    log "Verificando instalação..."
    
    # Verificar serviços
    if systemctl is-active --quiet nginx; then
        log "✓ Nginx está rodando"
    else
        error "✗ Nginx não está rodando"
    fi
    
    if systemctl is-active --quiet postgresql; then
        log "✓ PostgreSQL está rodando"
    else
        error "✗ PostgreSQL não está rodando"
    fi
    
    if systemctl is-active --quiet redis-server; then
        log "✓ Redis está rodando"
    else
        error "✗ Redis não está rodando"
    fi
    
    if pm2 list | grep -q "whaticket-backend"; then
        log "✓ PM2 está rodando o backend"
    else
        error "✗ PM2 não está rodando o backend"
    fi
    
    log "✓ Instalação concluída com sucesso!"
    log "🎉 Acesse: https://$DOMAIN"
}

# Função principal
main() {
    log "🚀 Iniciando instalação do Whaticket na VPS"
    
    get_config
    update_system
    install_nodejs
    install_postgresql
    install_redis
    install_nginx
    install_pm2
    setup_project
    setup_database
    build_project
    setup_pm2
    setup_nginx
    setup_ssl
    setup_permissions
    verify_installation
    
    log "✅ Instalação concluída!"
    log "📝 Próximos passos:"
    log "   1. Acesse https://$DOMAIN"
    log "   2. Crie o primeiro usuário administrador"
    log "   3. Configure as conexões WhatsApp"
    log "   4. Teste o sistema"
    log ""
    log "🔧 Comandos úteis:"
    log "   - Ver logs: pm2 logs"
    log "   - Reiniciar: pm2 restart whaticket-backend"
    log "   - Status: pm2 status"
}

# Executar função principal
main "$@" 