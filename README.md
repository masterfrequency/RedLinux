# RedLinux - Autonomous Red Team Operations Framework

![RedLinux Hero](/client/public/redlinux_share_card.png)

## 🛡️ Overview

RedLinux is a cutting-edge, autonomous Red Team Operations Framework designed to streamline and enhance offensive security engagements. Built with a modern full-stack TypeScript architecture, RedLinux provides a sophisticated neural interface for conducting reconnaissance, network infiltration, exploit development, command and control (C2), and data exfiltration.

## 🚀 Key Features

### 🌐 AETHER-OSINT Nexus
Advanced Open-Source Intelligence gathering with real-time data feeds from **Shodan**, **Censys**, and **GreyNoise**. Features interactive data visualization and automated scan initiation.

### 📡 Network Infiltrator
Comprehensive network scanning and topology mapping using integrated `nmap` engines. Provides real-time insights into target infrastructure and potential entry points.

### ⚡ Nexus Exploit
A dynamic exploit development and management platform. Integrates vulnerability findings to synthesize and deploy exploits with precision and impact.

### 👻 Ghost C2
Stealthy Command and Control channels for maintaining persistent access. Features active beacon monitoring, secure command transmission, and steganographic exfiltration.

### 🔐 Loot Vault
An encrypted repository (AES-256-GCM) for securely storing captured credentials, sensitive data, and other valuable assets acquired during engagements.

### 🧠 AI Strategist (Neural Core)
Leverages **GPT-4** and local **GGUF** models for strategic planning, anomaly detection, and automated decision-making in complex scenarios.

### 🧬 UltraAdvanced
Neural-linked blackhat arsenal featuring polymorphic shellcode mutation, AMSI bypass generation, and kernel rootkit integration.

## 🛠️ Technology Stack

- **Frontend**: React 19, Vite 8, TailwindCSS 4, shadcn/ui
- **Backend**: Express 5, tRPC 11, Drizzle ORM
- **Database**: MySQL 8.0 (Production Grade)
- **Queue/Cache**: Redis 6.0 (BullMQ)
- **Language**: TypeScript 6.0 (End-to-end type safety)

## 📦 Installation

### 1. Debian Package (Recommended)
The easiest way to install RedLinux on Ubuntu/Debian systems.
```bash
# Download the .deb package from the repository
sudo dpkg -i redlinux-4.1.0-amd64.deb
# The service will be automatically configured and started
```

### 2. Standalone Deployment
```bash
# Clone the repository
git clone https://github.com/masterfrequency/RedLinux.git
cd RedLinux

# Install dependencies
pnpm install

# Configure environment
cp .env.example .env
# Edit .env with your MySQL, Redis, and API credentials

# Build and Start
pnpm run build
NODE_ENV=production node dist/index.js
```

### 3. Docker Container
```bash
docker-compose up -d
```

## 📖 Documentation

- [INSTALLATION.md](INSTALLATION.md) - Detailed deployment and service configuration.
- [API_PROVIDERS_GUIDE.md](API_PROVIDERS_GUIDE.md) - Integrating Shodan, Censys, and GreyNoise.
- [GGUF_MODELS_REFERENCE.md](GGUF_MODELS_REFERENCE.md) - Local LLM configuration and hardware requirements.
- [PRODUCTION_SUMMARY.md](PRODUCTION_SUMMARY.md) - Architecture, security posture, and performance metrics.

## ⚖️ License

This project is licensed under the MIT License.

---
_RedLinux: Shadow Dashboard v4.1 - Autonomous Red Team Operations Framework. Engineered for the future of offensive security._
