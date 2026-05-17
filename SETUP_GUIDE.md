# RedLinux v4.1 - First Launch Setup Guide

## Overview

RedLinux requires configuration of external intelligence providers and AI models on first launch. This guide provides step-by-step instructions for acquiring API keys, understanding their benefits, and integrating GGUF models for autonomous AI operations.

---

## Part 1: Intelligence Provider API Keys

### 1. SHODAN API Key

**Purpose**: Global device reconnaissance, vulnerability mapping, and attack surface discovery.

**Benefits**:

- Query billions of internet-connected devices
- Identify exposed services and vulnerabilities
- Geolocate infrastructure
- Discover shadow IT and rogue devices
- Historical data tracking

**How to Obtain**:

1. Visit [https://account.shodan.io/](https://account.shodan.io/)
2. Create a free account or log in
3. Navigate to **Account Settings** → **API Key**
4. Copy your API key (free tier: 1 query/month, paid: unlimited)
5. Paste into RedLinux SetupWizard

**Free Tier Limitations**:

- 1 query per month
- Limited search filters
- Recommended: Upgrade to paid plan for active operations

---

### 2. Censys API Credentials

**Purpose**: Advanced certificate analysis, attack surface discovery, and network intelligence.

**Benefits**:

- Query SSL/TLS certificate data
- Identify services across the internet
- Discover subdomains and infrastructure
- Track certificate changes over time
- Autonomous threat hunting

**How to Obtain**:

1. Visit [https://search.censys.io/account/api](https://search.censys.io/account/api)
2. Create an account or log in
3. Generate API credentials (API ID and Secret)
4. Copy both values
5. Paste into RedLinux SetupWizard (separate fields for ID and Secret)

**Free Tier Limitations**:

- 120 queries per day
- Limited data retention
- Recommended: Upgrade for production operations

---

### 3. GreyNoise API Key

**Purpose**: Internet background noise filtering and threat intelligence.

**Benefits**:

- Distinguish real threats from internet background noise
- Identify benign scanners and researchers
- Reduce false positives in security operations
- Enrich threat intelligence with context
- Autonomous threat classification

**How to Obtain**:

1. Visit [https://viz.greynoise.io/settings/api](https://viz.greynoise.io/settings/api)
2. Create an account or log in
3. Navigate to **Settings** → **API**
4. Generate an API key
5. Copy and paste into RedLinux SetupWizard

**Free Tier Limitations**:

- 500 queries per day
- Community-sourced data
- Recommended: Enterprise tier for advanced threat intelligence

---

## Part 2: Local AI Model (GGUF) Integration

### What is GGUF?

**GGUF** (GPT-Generated Unified Format) is an optimized quantized model format that enables:

- **Local Inference**: Run LLMs without cloud dependencies
- **Privacy**: No data transmission to external services
- **Speed**: Optimized for CPU/GPU inference
- **Autonomy**: Complete operational independence
- **Cost**: Zero API costs after initial setup

### Recommended Models

#### 1. **Llama-3-8B-Instruct (Q4_K_M)** ⭐ RECOMMENDED

**Specifications**:

- Model Size: 8 billion parameters
- Quantization: Q4_K_M (4-bit, optimized)
- File Size: ~5 GB
- VRAM Required: 8-12 GB
- Inference Speed: ~10-20 tokens/sec (CPU), ~50+ tokens/sec (GPU)

**Download**:

```bash
# Using Ollama (Recommended)
ollama pull llama2:7b-instruct-q4_K_M

# Manual Download
# From Hugging Face: https://huggingface.co/TheBloke/Llama-2-7B-Instruct-GGUF
# File: llama-2-7b-instruct.Q4_K_M.gguf
```

**Capabilities**:

- Exploit synthesis and payload generation
- Vulnerability analysis and reporting
- Social engineering content generation
- Network topology analysis
- Tactical decision support

---

#### 2. **Mistral-7B-Instruct (Q4_K_M)**

**Specifications**:

- Model Size: 7 billion parameters
- Quantization: Q4_K_M
- File Size: ~4.5 GB
- VRAM Required: 8 GB
- Inference Speed: ~15-25 tokens/sec (CPU), ~60+ tokens/sec (GPU)

**Download**:

```bash
# Using Ollama
ollama pull mistral:7b-instruct-q4_K_M

# Manual Download
# From Hugging Face: https://huggingface.co/TheBloke/Mistral-7B-Instruct-GGUF
```

**Advantages**:

- Faster inference than Llama-3-8B
- Better instruction following
- More concise outputs
- Lower memory footprint

---

#### 3. **Neural-Chat-7B-v3 (Q4_K_M)**

**Specifications**:

- Model Size: 7 billion parameters
- Quantization: Q4_K_M
- File Size: ~4.5 GB
- VRAM Required: 8 GB
- Inference Speed: ~12-22 tokens/sec

**Download**:

```bash
# Using Ollama
ollama pull neural-chat:7b-v3-q4_K_M

# Manual Download
# From Hugging Face: https://huggingface.co/TheBloke/neural-chat-7B-v3-GGUF
```

**Best For**:

- Multi-turn conversations
- Complex reasoning tasks
- Tactical planning and analysis

---

### Installation Methods

#### Method 1: Using Ollama (Easiest)

```bash
# Install Ollama
# macOS: https://ollama.ai/download/Ollama-darwin.zip
# Linux: curl https://ollama.ai/install.sh | sh
# Windows: https://ollama.ai/download/OllamaSetup.exe

# Pull a model
ollama pull llama2:7b-instruct-q4_K_M

# Verify installation
ollama list

# Start Ollama server (runs on localhost:11434)
ollama serve
```

#### Method 2: Manual Download with llama.cpp

```bash
# Clone llama.cpp
git clone https://github.com/ggerganov/llama.cpp
cd llama.cpp
make

# Download GGUF model
wget https://huggingface.co/TheBloke/Llama-2-7B-Instruct-GGUF/resolve/main/llama-2-7b-instruct.Q4_K_M.gguf

# Run inference
./main -m llama-2-7b-instruct.Q4_K_M.gguf -p "Your prompt here"
```

---

### Configuration in RedLinux

1. **During SetupWizard**:
   - Select "Use Local GGUF Model"
   - Specify model path: `/path/to/model.gguf`
   - Or use Ollama endpoint: `http://localhost:11434`

2. **Environment Variables** (Alternative):

   ```bash
   export GGUF_MODEL_PATH="/models/llama-2-7b-instruct.Q4_K_M.gguf"
   export OLLAMA_ENDPOINT="http://localhost:11434"
   ```

3. **Runtime Configuration**:
   - Models are loaded on first inference call
   - Automatic caching for performance
   - Fallback to cloud API if local model unavailable

---

## Part 3: Security Considerations

### API Key Security

**Best Practices**:

- ✅ Store keys in encrypted database (RedLinux does this automatically)
- ✅ Rotate keys every 90 days
- ✅ Use separate keys for development/production
- ✅ Monitor API usage for anomalies
- ❌ Never commit keys to version control
- ❌ Never share keys via email or chat

### Local Model Security

**Advantages**:

- No data leaves your network
- No cloud provider logging
- Complete operational security
- Compliance with data residency requirements

**Recommendations**:

- Run on isolated network segment
- Use firewall rules to restrict access
- Monitor model inference logs
- Regular security audits

---

## Part 4: Troubleshooting

### API Key Issues

**Problem**: "Invalid API Key"

- **Solution**: Verify key format and expiration date in provider dashboard

**Problem**: "Rate limit exceeded"

- **Solution**: Upgrade to paid tier or implement request queuing

**Problem**: "Connection timeout"

- **Solution**: Check firewall rules and provider status page

### GGUF Model Issues

**Problem**: "Model file not found"

- **Solution**: Verify path and ensure file permissions are correct

**Problem**: "Out of memory"

- **Solution**: Use smaller quantization (Q2_K instead of Q4_K_M) or reduce batch size

**Problem**: "Slow inference"

- **Solution**: Enable GPU acceleration or use smaller model

---

## Part 5: Performance Tuning

### API Optimization

```javascript
// Implement request batching
const batchRequests = async (queries) => {
  const results = await Promise.all(queries.map((q) => shodanApi.search(q)));
  return results;
};

// Use caching to reduce API calls
const cache = new Map();
const getCachedResult = async (query) => {
  if (cache.has(query)) return cache.get(query);
  const result = await shodanApi.search(query);
  cache.set(query, result);
  return result;
};
```

### Model Optimization

```bash
# Use quantization for faster inference
# Q4_K_M: Good balance of speed/quality
# Q2_K: Faster, lower quality
# Q6_K: Slower, higher quality

# Enable GPU acceleration (CUDA/Metal)
export CUDA_VISIBLE_DEVICES=0
ollama serve --gpu
```

---

## Part 6: Next Steps

After completing the SetupWizard:

1. **Verify Connections**:
   - Test each API provider with sample queries
   - Confirm local model inference

2. **Create First Engagement**:
   - Start a new red team operation
   - Test OSINT modules with known targets

3. **Monitor Usage**:
   - Track API quota consumption
   - Monitor model inference performance

4. **Optimize Configuration**:
   - Adjust model parameters based on performance
   - Fine-tune API request patterns

---

## Support & Resources

- **Shodan Documentation**: https://shodan.readthedocs.io/
- **Censys API Docs**: https://censys.io/api/
- **GreyNoise API Docs**: https://docs.greynoise.io/
- **Llama.cpp**: https://github.com/ggerganov/llama.cpp
- **Ollama**: https://ollama.ai/
- **Hugging Face Models**: https://huggingface.co/models

---

## Version Information

- **RedLinux Version**: 4.1
- **Setup Guide Version**: 1.0
- **Last Updated**: May 2026
