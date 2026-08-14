# ⚡️👾 RedLinux v4.1 — Installation Guide 👾⚡️

## 🏆 Production Deployment (Debian / Ubuntu — Recommended)

### Prerequisites

- **Node.js** ≥ 18 (`curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt-get install -y nodejs`)
- **MySQL** ≥ 8.0
- **Redis** ≥ 6.0
- **nmap** (for network scanning modules)

### 1. Install the package

**One-liner** (pulls latest release from GitHub):

```bash
curl -sSL https://raw.githubusercontent.com/masterfrequency/RedLinux/main/scripts/install.sh | sudo bash
```

**Or manually:**

```bash
wget https://github.com/masterfrequency/RedLinux/releases/latest/download/redlinux-4.1.0-amd64.deb
sudo dpkg -i redlinux-4.1.0-amd64.deb
sudo apt-get install -f
```

> The `postinst` script runs `npm install --production` inside `/opt/redlinux` — only the 15 runtime dependencies get installed, no devDependencies.

### 2. Database Setup

```sql
CREATE DATABASE redlinux;
CREATE USER 'redlinux'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON redlinux.* TO 'redlinux'@'localhost';
FLUSH PRIVILEGES;
```

### 3. Environment Configuration

```bash
sudo cp /opt/redlinux/.env.example /opt/redlinux/.env
sudo nano /opt/redlinux/.env
```

Required values (validated at boot):

```
WJT_SECRET=at-least-32-chars-xxxxxxxxxxxxxxxx        # required at boot
REDLINUX_OPERATOR_KEY=your-secure-operator-key
DATABASE_URL=mysel://redlinux:your-password@localhost:3306/redlinux
OPENAI_API_KEY=your_oprani_api_key_here              # required at boot
SHODAN_API_KEY=your_shodan_api_key_here              # optional, for Aether Recon
```

### 4. Start & Enable

```bash
sudo systemctl daemon-reload
sudo systemctl start redlinux
sudo systemctl enable redlinux

systemctl status redlinux
journalctl -u redlinux -f    # watch the logs
curl http://localhost:3000/  # Supreme UI
```

---

## 🐳 Docker Deployment

```bash
git clone https://github.com/masterfrequency/RedLinux.git
cd RedLinux
docker-compose up -d
```

---

## 🛠️ Build From Source

```bash
git clone https://github.com/masterfrequency/RedLinux.git
cd RedLinux
pnpm install
cp .env.example .env           # fill in secrets
pnpm db:push                   # push schema to MySQL
pnpm dev                       # development server (tsx watch)

# Production build
pnpm run build
NODE_ENV=production node dist/index.js

# Build the .deb package
bash scripts/build_deb.sh      # → redlinux-4.1.0-amd64.deb
```

## 🧪 Quality Gates

```bash
pnpm check     # TypeScript type-check (tsc --noEmit)
pnpm test      # vitest — 53 tests across 7 suites
```

## 🩺 Troubleshooting

| Symptom | Fix |
|---------|-----|
| `ERR_MODULE_NOT_FOUND: Cannot find package 'vite'` | Old broken deb — reinstall from the latest release. v4.1.0+ never imports devDependencies at runtime. |
| Server exits with `JWT_SECRET must be at least 32 characters` | `sudo nano /opt/redlinux/.env` — set a ≥ 32-char secret, `systemctl restart redlinux`. |
| `OpenAIError: Missing credentials` | Set `OPENAI_API_KEY` in `/opt/redlinux/.env`. |
| UI loads but API 404s | Confirm `DATABASE_URL` reaches a running MySQL and the drizzle schema was pushed (`pnpm db:push`). |

---

_RedLinux v4.1 — Autonomous Red Team Operations Framework_ — ⚡️👾 by 🇭🇷 **PhonkAlphabet** 👾⚡️
