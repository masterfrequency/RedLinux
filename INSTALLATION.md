# RedLinux v4.1 - Installation Guide

## Production Deployment (Recommended)

### Prerequisites
- **Node.js**: v20.0.0+
- **MySQL**: v8.0+
- **Redis**: v6.0+
- **pnpm**: v10.0+
- **nmap**: For network scanning modules

### 1. Clone and Install
```bash
git clone https://github.com/masterfrequency/RedLinux.git
cd RedLinux
pnpm install
```

### 2. Database Setup
Create a MySQL database and user:
```sql
CREATE DATABASE redlinux;
CREATE USER 'redlinux'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON redlinux.* TO 'redlinux'@'localhost';
FLUSH PRIVILEGES;
```

### 3. Environment Configuration
```bash
cp .env.example .env
# Edit .env with your credentials
# DATABASE_URL="mysql://redlinux:password@localhost:3306/redlinux"
# JWT_SECRET="your-32-character-secret"
# REDLINUX_OPERATOR_KEY="your-secure-operator-key"
```

### 4. Build and Start
```bash
pnpm run build
NODE_ENV=production node dist/index.js
```

---

## Standalone Installation

### Universal Tarball
```bash
wget https://github.com/masterfrequency/RedLinux/releases/download/v4.1.0/redlinux-4.1.0-standalone.tar.gz
tar -xzf redlinux-4.1.0-standalone.tar.gz
pnpm install
node dist/index.js
```

## Docker Deployment
```bash
docker-compose up -d
```

---
_RedLinux v4.1 - Autonomous Red Team Operations Framework_
