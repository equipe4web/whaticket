# 🚀 Guia de Instalação do Whaticket na VPS

## 📋 Pré-requisitos

### Requisitos do Sistema
- **Sistema Operacional:** Ubuntu 18.04+ ou CentOS 7+
- **RAM:** Mínimo 2GB (recomendado 4GB+)
- **Armazenamento:** 20GB SSD
- **CPU:** 1 vCPU (recomendado 2+)
- **Rede:** Acesso à internet

### Software Necessário
- Node.js 16+
- PostgreSQL ou MySQL
- Redis
- PM2 (Process Manager)
- Nginx (Proxy reverso)
- Git

---

## 🔧 Passo 1: Preparação da VPS

### 1.1 Conectar via SSH
```bash
ssh root@SEU_IP_VPS
```

### 1.2 Atualizar o sistema
```bash
# Ubuntu/Debian
sudo apt update && sudo apt upgrade -y

# CentOS/RHEL
sudo yum update -y
```

### 1.3 Instalar dependências básicas
```bash
# Ubuntu/Debian
sudo apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release

# CentOS/RHEL
sudo yum install -y curl wget git unzip epel-release
```

---

## 📦 Passo 2: Instalar Node.js

### 2.1 Adicionar repositório NodeSource
```bash
# Para Node.js 18.x (recomendado)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# Instalar Node.js
sudo apt install -y nodejs
```

### 2.2 Verificar instalação
```bash
node --version
npm --version
```

---

## 🗄️ Passo 3: Instalar e Configurar PostgreSQL

### 3.1 Instalar PostgreSQL
```bash
# Ubuntu/Debian
sudo apt install -y postgresql postgresql-contrib

# CentOS/RHEL
sudo yum install -y postgresql-server postgresql-contrib
sudo postgresql-setup initdb
sudo systemctl enable postgresql
sudo systemctl start postgresql
```

### 3.2 Configurar banco de dados
```bash
# Acessar PostgreSQL
sudo -u postgres psql

# Criar usuário e banco
CREATE USER whaticket WITH PASSWORD 'sua_senha_forte';
CREATE DATABASE whaticket OWNER whaticket;
GRANT ALL PRIVILEGES ON DATABASE whaticket TO whaticket;
\q
```

---

## 🔴 Passo 4: Instalar Redis

### 4.1 Instalar Redis
```bash
# Ubuntu/Debian
sudo apt install -y redis-server

# CentOS/RHEL
sudo yum install -y redis
sudo systemctl enable redis
sudo systemctl start redis
```

### 4.2 Verificar Redis
```bash
redis-cli ping
# Deve retornar: PONG
```

---

## 🌐 Passo 5: Instalar Nginx

### 5.1 Instalar Nginx
```bash
# Ubuntu/Debian
sudo apt install -y nginx

# CentOS/RHEL
sudo yum install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

### 5.2 Configurar firewall
```bash
# Ubuntu/Debian
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable

# CentOS/RHEL
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --reload
```

---

## 📥 Passo 6: Clonar o Projeto

### 6.1 Criar diretório do projeto
```bash
mkdir -p /var/www/whaticket
cd /var/www/whaticket
```

### 6.2 Clonar repositório
```bash
git clone https://github.com/equipe4web/whaticket.git .
```

### 6.3 Instalar dependências do Backend
```bash
cd backend
npm install
```

### 6.4 Instalar dependências do Frontend
```bash
cd ../frontend
npm install
```

---

## ⚙️ Passo 7: Configurar Variáveis de Ambiente

### 7.1 Configurar Backend
```bash
cd /var/www/whaticket/backend
cp .env.example .env
nano .env
```

**Conteúdo do .env (backend):**
```env
# Configurações do Banco
DB_HOST=localhost
DB_USER=whaticket
DB_PASS=sua_senha_forte
DB_NAME=whaticket
DB_PORT=5432

# Configurações do Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Configurações da API
PORT=8080
NODE_ENV=production

# JWT Secret
JWT_SECRET=sua_chave_jwt_super_secreta

# Configurações do WhatsApp
FRONTEND_URL=https://seudominio.com
BACKEND_URL=https://seudominio.com:8080

# Configurações de Email (opcional)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=seu_email@gmail.com
MAIL_PASS=sua_senha_app
```

### 7.2 Configurar Frontend
```bash
cd /var/www/whaticket/frontend
cp .env.example .env
nano .env
```

**Conteúdo do .env (frontend):**
```env
REACT_APP_BACKEND_URL=https://seudominio.com:8080
REACT_APP_HOURS_CLOSE_TICKETS_AUTO=24
REACT_APP_FINISH_ATTENDMENT_GROUP=true
REACT_APP_ACCEPT_ATTACHMENT=true
REACT_APP_MAX_SIZE_UPLOAD=10000000
REACT_APP_TIME_CLOSE_TICKETS_AUTO=24
REACT_APP_MIN_CLOSE_TICKETS_AUTO=1
REACT_APP_DAYS_CLOSE_TICKETS_AUTO=1
REACT_APP_RATE_LIMITER_BY_USER=100
REACT_APP_RATE_LIMITER_BY_IP=100
REACT_APP_RATE_LIMITER_TTL=900000
REACT_APP_RATE_LIMITER_SKIP_SUCCESSFUL_REQUESTS=false
REACT_APP_RATE_LIMITER_SKIP_FAILED_REQUESTS=false
REACT_APP_RATE_LIMITER_SKIP_OPTIONS_REQUESTS=true
REACT_APP_RATE_LIMITER_SKIP_TOO_MANY_REQUESTS_REQUESTS=true
REACT_APP_RATE_LIMITER_SKIP_STRICT_MODE=false
REACT_APP_RATE_LIMITER_SKIP_HEADERS=false
REACT_APP_RATE_LIMITER_SKIP_IP_HEADERS=false
REACT_APP_RATE_LIMITER_SKIP_IP_HEADERS_INDEX=0
REACT_APP_RATE_LIMITER_SKIP_IP_HEADERS_COUNT=1
REACT_APP_RATE_LIMITER_SKIP_IP_HEADERS_WHITELIST=[]
REACT_APP_RATE_LIMITER_SKIP_IP_HEADERS_BLACKLIST=[]
REACT_APP_RATE_LIMITER_SKIP_IP_HEADERS_TRUST_PROXY=false
REACT_APP_RATE_LIMITER_SKIP_IP_HEADERS_TRUST_PROXY_COUNT=1
REACT_APP_RATE_LIMITER_SKIP_IP_HEADERS_TRUST_PROXY_INDEX=0
REACT_APP_RATE_LIMITER_SKIP_IP_HEADERS_TRUST_PROXY_WHITELIST=[]
REACT_APP_RATE_LIMITER_SKIP_IP_HEADERS_TRUST_PROXY_BLACKLIST=[]
REACT_APP_RATE_LIMITER_SKIP_IP_HEADERS_TRUST_PROXY_TRUST_PROXY=false
REACT_APP_RATE_LIMITER_SKIP_IP_HEADERS_TRUST_PROXY_TRUST_PROXY_COUNT=1
REACT_APP_RATE_LIMITER_SKIP_IP_HEADERS_TRUST_PROXY_TRUST_PROXY_INDEX=0
REACT_APP_RATE_LIMITER_SKIP_IP_HEADERS_TRUST_PROXY_TRUST_PROXY_WHITELIST=[]
REACT_APP_RATE_LIMITER_SKIP_IP_HEADERS_TRUST_PROXY_TRUST_PROXY_BLACKLIST=[]
```

---

## 🔧 Passo 8: Configurar Banco de Dados

### 8.1 Executar migrações
```bash
cd /var/www/whaticket/backend
npx prisma migrate deploy
npx prisma generate
```

### 8.2 Popular dados iniciais
```bash
npm run db:seed
```

---

## 🏗️ Passo 9: Build do Frontend

### 9.1 Fazer build de produção
```bash
cd /var/www/whaticket/frontend
npm run build
```

---

## 📦 Passo 10: Instalar PM2

### 10.1 Instalar PM2 globalmente
```bash
sudo npm install -g pm2
```

### 10.2 Criar arquivo de configuração PM2
```bash
cd /var/www/whaticket
nano ecosystem.config.js
```

**Conteúdo do ecosystem.config.js:**
```javascript
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
```

### 10.3 Build do backend
```bash
cd /var/www/whaticket/backend
npm run build
```

### 10.4 Iniciar com PM2
```bash
cd /var/www/whaticket
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

---

## 🌐 Passo 11: Configurar Nginx

### 11.1 Criar configuração do site
```bash
sudo nano /etc/nginx/sites-available/whaticket
```

**Conteúdo da configuração:**
```nginx
server {
    listen 80;
    server_name seudominio.com www.seudominio.com;

    # Frontend
    location / {
        root /var/www/whaticket/frontend/build;
        try_files $uri $uri/ /index.html;
        
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
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket
    location /socket.io/ {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Uploads
    location /uploads/ {
        alias /var/www/whaticket/backend/uploads/;
    }
}
```

### 11.2 Ativar site
```bash
sudo ln -s /etc/nginx/sites-available/whaticket /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🔒 Passo 12: Configurar SSL (Opcional mas Recomendado)

### 12.1 Instalar Certbot
```bash
# Ubuntu/Debian
sudo apt install -y certbot python3-certbot-nginx

# CentOS/RHEL
sudo yum install -y certbot python3-certbot-nginx
```

### 12.2 Obter certificado SSL
```bash
sudo certbot --nginx -d seudominio.com -d www.seudominio.com
```

---

## ✅ Passo 13: Verificação Final

### 13.1 Verificar status dos serviços
```bash
# Verificar PM2
pm2 status

# Verificar Nginx
sudo systemctl status nginx

# Verificar PostgreSQL
sudo systemctl status postgresql

# Verificar Redis
sudo systemctl status redis
```

### 13.2 Verificar logs
```bash
# Logs do backend
pm2 logs whaticket-backend

# Logs do Nginx
sudo tail -f /var/log/nginx/error.log
```

---

## 🎯 Passo 14: Primeiro Acesso

1. **Acesse:** `https://seudominio.com`
2. **Crie o primeiro usuário administrador**
3. **Configure as conexões WhatsApp**
4. **Teste o sistema**

---

## 🔧 Comandos Úteis

### Reiniciar serviços
```bash
# Reiniciar backend
pm2 restart whaticket-backend

# Reiniciar Nginx
sudo systemctl restart nginx

# Reiniciar banco
sudo systemctl restart postgresql
```

### Ver logs
```bash
# Logs do PM2
pm2 logs

# Logs do Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Backup do banco
```bash
pg_dump -U whaticket -h localhost whaticket > backup_$(date +%Y%m%d_%H%M%S).sql
```

---

## 🚨 Troubleshooting

### Problema: Frontend não carrega
```bash
# Verificar build
cd /var/www/whaticket/frontend
npm run build

# Verificar permissões
sudo chown -R www-data:www-data /var/www/whaticket
```

### Problema: Backend não responde
```bash
# Verificar logs
pm2 logs whaticket-backend

# Reiniciar
pm2 restart whaticket-backend
```

### Problema: Banco não conecta
```bash
# Verificar PostgreSQL
sudo systemctl status postgresql

# Testar conexão
psql -U whaticket -h localhost -d whaticket
```

---

## 📞 Suporte

Se encontrar problemas durante a instalação:

1. **Verifique os logs:** `pm2 logs` e `sudo tail -f /var/log/nginx/error.log`
2. **Teste conectividade:** `curl -I http://localhost:8080`
3. **Verifique firewall:** `sudo ufw status` ou `sudo firewall-cmd --list-all`

---

**🎉 Parabéns! Seu Whaticket está instalado e funcionando na VPS!** 