# RedLinux - Autonomous Red Team Operations Framework

![RedLinux Hero](/client/public/redlinux_share_card.png)

## Overview

RedLinux is a cutting-edge, autonomous Red Team Operations Framework designed to streamline and enhance offensive security engagements. Built with a modern full-stack TypeScript architecture, RedLinux provides a sophisticated neural interface for conducting reconnaissance, network infiltration, exploit development, command and control (C2), and data exfiltration.

## Key Features

- **AETHER-OSINT Nexus**: Advanced OSINT gathering with real-time data feeds from Shodan, Censys, and GreyNoise.
- **Network Infiltrator**: Real-time network scanning and topology mapping using integrated `nmap` engines.
- **Nexus Exploit**: Dynamic exploit development and management platform.
- **Ghost C2**: Stealthy Command and Control channels with active beacon monitoring.
- **Loot Vault**: Encrypted AES-256-GCM repository for captured credentials and sensitive data.
- **AI Strategist**: Neural-linked blackhat arsenal leveraging GPT-4 and local GGUF models for autonomous decision making.
- **UltraAdvanced**: Polymorphic shellcode mutation and AMSI bypass generation.

## Technology Stack

- **Frontend**: React 19, Vite 8, TailwindCSS 4, shadcn/ui
- **Backend**: Express 5, tRPC 11, Drizzle ORM
- **Database**: MySQL 8.0 (Production Grade)
- **Queue/Cache**: Redis 6.0 (BullMQ)
- **Language**: TypeScript 6.0 (End-to-end type safety)

## Getting Started

To deploy RedLinux, refer to the [INSTALLATION.md](INSTALLATION.md) guide.

### Quick Start (Standalone)

```bash
# Download the standalone tarball
wget https://github.com/masterfrequency/RedLinux/releases/download/v4.1.0/redlinux-4.1.0-standalone.tar.gz

# Extract and install
tar -xzf redlinux-4.1.0-standalone.tar.gz
pnpm install

# Configure environment
cp .env.example .env
# Edit .env with your MySQL and Redis credentials

# Start the server
node dist/index.js
```

## Documentation

- [INSTALLATION.md](INSTALLATION.md) - Detailed deployment instructions.
- [API_PROVIDERS_GUIDE.md](API_PROVIDERS_GUIDE.md) - Integrating Shodan, Censys, and GreyNoise.
- [GGUF_MODELS_REFERENCE.md](GGUF_MODELS_REFERENCE.md) - Local LLM configuration.
- [PRODUCTION_SUMMARY.md](PRODUCTION_SUMMARY.md) - Architecture and security overview.

## License

This project is licensed under the MIT License.

---
_RedLinux: Shadow Dashboard v4.1 - Autonomous Red Team Operations Framework._
