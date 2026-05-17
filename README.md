# RedLinux - Autonomous Red Team Operations Framework

![RedLinux Hero](client/public/redlinux_share_card.png)

## 🛡️ Overview

RedLinux is a cutting-edge, autonomous Red Team Operations Framework designed to streamline and enhance offensive security engagements. Built with a modern full-stack TypeScript architecture, RedLinux provides a sophisticated neural interface for conducting reconnaissance, network infiltration, exploit development, command and control (C2), and data exfiltration.

## 🚀 Key Features

- **Ghost C2 Engine**: Production-grade, asynchronous C2 backbone with E2EE (AES-256-GCM + ChaCha20) and Malleable Profiles (Google Drive, Office365 masquerading).
- **Neural Mesh**: Decentralized, peer-to-peer agent coordination using Gossip protocols and Raft-inspired leader election.
- **Shadow Exfil**: Real-world chunked data exfiltration with support for DNS tunneling, ICMP leakage, and Cryptographically Scattered Steganography.
- **Specter Evasion**: Advanced payload generation with polymorphic source code mutation and anti-VM/anti-sandbox injection.
- **Aether Recon**: Automated OSINT and intelligence gathering across Shodan, Censys, and GreyNoise.
- **Loot Vault**: Secure, encrypted storage for captured credentials, documents, and session logs.

## 📦 Installation

### 1. Debian/Ubuntu (Recommended)
Download the latest `.deb` package from the releases page and install:
```bash
sudo dpkg -i redlinux-4.1.0-amd64.deb
sudo apt-get install -f
```

### 2. Standalone Script
Run the automated installer directly:
```bash
curl -sSL https://redlinux.io/install.sh | sudo bash
```

### 3. Docker Compose
For quick deployment in isolated environments:
```bash
docker-compose up -d
```

## 🛠️ Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/masterfrequency/RedLinux.git
   ```
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Initialize the database:
   ```bash
   pnpm drizzle-kit push
   ```
4. Start the development server:
   ```bash
   pnpm dev
   ```

## ⚖️ Legal Disclaimer

RedLinux is intended for **authorized security testing and educational purposes only**. Unauthorized use of this framework against systems without explicit permission is illegal and unethical. The developers assume no liability for misuse of this software.

---
⚡️👾 by 🇭🇷 **PhonkAlphabet** 👾⚡️
