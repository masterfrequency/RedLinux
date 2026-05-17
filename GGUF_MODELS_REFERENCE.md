# GGUF Models Reference for RedLinux

## Quick Reference Table

| Model                    | Size | Quantization | File Size | VRAM    | Speed       | Best For              |
| ------------------------ | ---- | ------------ | --------- | ------- | ----------- | --------------------- |
| Llama-3-8B-Instruct      | 8B   | Q4_K_M       | 5 GB      | 8-12 GB | 10-20 tok/s | General purpose       |
| Mistral-7B-Instruct      | 7B   | Q4_K_M       | 4.5 GB    | 8 GB    | 15-25 tok/s | Fast inference        |
| Neural-Chat-7B-v3        | 7B   | Q4_K_M       | 4.5 GB    | 8 GB    | 12-22 tok/s | Conversations         |
| Dolphin-2.5-Mixtral-8x7B | 47B  | Q4_K_M       | 26 GB     | 24+ GB  | 5-10 tok/s  | Advanced reasoning    |
| Openchat-3.5             | 7B   | Q4_K_M       | 4.5 GB    | 8 GB    | 18-28 tok/s | Instruction following |

---

## Tier 1: Recommended for RedLinux

### Llama-3-8B-Instruct (Q4_K_M)

**Model Card**:

- **Organization**: Meta
- **Base Model**: Llama 3
- **Fine-tuning**: Instruction-tuned
- **Release Date**: April 2024
- **License**: Llama 2 Community License

**Capabilities**:

- ✅ Exploit code generation
- ✅ Vulnerability analysis
- ✅ Payload synthesis
- ✅ Social engineering content
- ✅ Network topology analysis
- ✅ Tactical planning

**Download Links**:

```bash
# Ollama (Recommended)
ollama pull llama2:7b-instruct-q4_K_M

# Hugging Face Direct
# https://huggingface.co/TheBloke/Llama-2-7B-Instruct-GGUF
# File: llama-2-7b-instruct.Q4_K_M.gguf

# Alternative Quantizations Available
# Q2_K: 2.7 GB (faster, lower quality)
# Q3_K_M: 3.3 GB (balanced)
# Q5_K_M: 5.7 GB (higher quality)
# Q6_K: 6.6 GB (highest quality)
# Q8_0: 8.7 GB (full precision)
```

**Performance Metrics**:

- Inference Speed: 10-20 tokens/second (CPU)
- Memory Usage: 8-12 GB RAM
- Quantization Loss: ~2-5% accuracy reduction
- Context Window: 4,096 tokens

**Recommended Use Cases**:

- Primary AI strategist for RedLinux
- Exploit payload generation
- Vulnerability report synthesis
- Multi-turn tactical conversations

---

### Mistral-7B-Instruct (Q4_K_M)

**Model Card**:

- **Organization**: Mistral AI
- **Base Model**: Mistral 7B
- **Fine-tuning**: Instruction-tuned
- **Release Date**: December 2023
- **License**: Apache 2.0

**Advantages**:

- Faster inference than Llama-3-8B
- Better instruction following
- More concise outputs
- Lower memory footprint
- Excellent for real-time operations

**Download Links**:

```bash
# Ollama
ollama pull mistral:7b-instruct-q4_K_M

# Hugging Face
# https://huggingface.co/TheBloke/Mistral-7B-Instruct-GGUF
# File: mistral-7b-instruct.Q4_K_M.gguf
```

**Performance Metrics**:

- Inference Speed: 15-25 tokens/second (CPU)
- Memory Usage: 8 GB RAM
- Context Window: 8,192 tokens
- Quantization Loss: ~1-3% accuracy reduction

**Recommended Use Cases**:

- Fast tactical decision support
- Real-time payload generation
- Quick vulnerability assessments
- High-frequency operations

---

### Neural-Chat-7B-v3 (Q4_K_M)

**Model Card**:

- **Organization**: Intel
- **Base Model**: Mistral 7B
- **Fine-tuning**: Multi-turn conversation
- **Release Date**: January 2024
- **License**: Apache 2.0

**Specialization**:

- Optimized for multi-turn conversations
- Better context retention
- Improved reasoning capabilities
- Excellent for tactical planning

**Download Links**:

```bash
# Ollama
ollama pull neural-chat:7b-v3-q4_K_M

# Hugging Face
# https://huggingface.co/TheBloke/neural-chat-7B-v3-GGUF
# File: neural-chat-7b-v3.Q4_K_M.gguf
```

**Performance Metrics**:

- Inference Speed: 12-22 tokens/second (CPU)
- Memory Usage: 8 GB RAM
- Context Window: 8,192 tokens
- Multi-turn Optimization: Yes

**Recommended Use Cases**:

- Extended tactical conversations
- Complex reasoning tasks
- Multi-step planning
- Collaborative operations

---

## Tier 2: Advanced Models (Higher Resource Requirements)

### Dolphin-2.5-Mixtral-8x7B (Q4_K_M)

**Model Card**:

- **Organization**: Cognitive Computations
- **Base Model**: Mixtral 8x7B
- **Fine-tuning**: Instruction-tuned (Dolphin)
- **Release Date**: January 2024
- **License**: MIT

**Capabilities**:

- Advanced reasoning and problem-solving
- Complex exploit analysis
- Multi-step vulnerability chains
- Sophisticated social engineering
- Advanced threat modeling

**Download Links**:

```bash
# Hugging Face
# https://huggingface.co/TheBloke/Dolphin-2.5-Mixtral-8x7B-GGUF
# File: dolphin-2.5-mixtral-8x7b.Q4_K_M.gguf
```

**Performance Metrics**:

- Inference Speed: 5-10 tokens/second (CPU)
- Memory Usage: 24+ GB RAM
- Context Window: 32,768 tokens
- Mixture of Experts: 8 experts, 2 active

**Requirements**:

- ⚠️ High-end CPU or GPU required
- ⚠️ 24+ GB RAM minimum
- ⚠️ Slower inference (trade-off for quality)

**Recommended Use Cases**:

- Advanced threat analysis
- Complex exploit development
- Strategic planning
- Research and development

---

### Openchat-3.5 (Q4_K_M)

**Model Card**:

- **Organization**: OpenChat
- **Base Model**: Mistral 7B
- **Fine-tuning**: Optimized for chat
- **Release Date**: December 2023
- **License**: Apache 2.0

**Specialization**:

- Optimized for rapid response
- Excellent instruction following
- Minimal hallucination
- Production-ready

**Download Links**:

```bash
# Hugging Face
# https://huggingface.co/TheBloke/Openchat-3.5-GGUF
# File: openchat-3.5.Q4_K_M.gguf
```

**Performance Metrics**:

- Inference Speed: 18-28 tokens/second (CPU)
- Memory Usage: 8 GB RAM
- Context Window: 8,192 tokens
- Hallucination Rate: ~2%

**Recommended Use Cases**:

- Production operations
- High-frequency queries
- Minimal latency requirements
- Reliable tactical support

---

## Tier 3: Specialized Models

### CodeLlama-13B-Instruct (Q4_K_M)

**Purpose**: Exploit code generation and vulnerability analysis

**Download**:

```bash
ollama pull codellama:13b-instruct-q4_K_M
```

**Specifications**:

- Size: 13B parameters
- File Size: 7.5 GB
- VRAM: 12-16 GB
- Speed: 8-15 tok/s

**Best For**: Payload generation, reverse engineering, exploit development

---

### Orca-2-13B (Q4_K_M)

**Purpose**: Advanced reasoning and problem-solving

**Download**:

```bash
# Hugging Face
# https://huggingface.co/TheBloke/Orca-2-13B-GGUF
```

**Specifications**:

- Size: 13B parameters
- File Size: 7.5 GB
- VRAM: 12-16 GB
- Speed: 10-18 tok/s

**Best For**: Strategic analysis, complex planning, threat modeling

---

### Zephyr-7B-Beta (Q4_K_M)

**Purpose**: Fast, accurate instruction following

**Download**:

```bash
ollama pull zephyr:7b-beta-q4_K_M
```

**Specifications**:

- Size: 7B parameters
- File Size: 4.5 GB
- VRAM: 8 GB
- Speed: 20-30 tok/s

**Best For**: Real-time operations, quick decisions, high-frequency tasks

---

## Installation & Setup

### Option 1: Ollama (Recommended)

```bash
# Install Ollama
curl https://ollama.ai/install.sh | sh

# Pull model
ollama pull llama2:7b-instruct-q4_K_M

# Start server
ollama serve

# Test inference
curl http://localhost:11434/api/generate -d '{
  "model": "llama2:7b-instruct-q4_K_M",
  "prompt": "Explain exploit development"
}'
```

### Option 2: llama.cpp

```bash
# Clone and build
git clone https://github.com/ggerganov/llama.cpp
cd llama.cpp
make

# Download model
wget https://huggingface.co/TheBloke/Llama-2-7B-Instruct-GGUF/resolve/main/llama-2-7b-instruct.Q4_K_M.gguf

# Run
./main -m llama-2-7b-instruct.Q4_K_M.gguf -p "Your prompt"
```

### Option 3: LM Studio

```bash
# Download LM Studio
# https://lmstudio.ai/

# GUI-based model management
# Automatic quantization support
# Built-in API server
```

---

## Integration with RedLinux

### Configuration

```javascript
// In RedLinux environment variables
GGUF_MODEL_PATH = "/models/llama-2-7b-instruct.Q4_K_M.gguf";
OLLAMA_ENDPOINT = "http://localhost:11434";
MODEL_CONTEXT_WINDOW = 4096;
MODEL_MAX_TOKENS = 2048;
```

### API Usage

```javascript
// Direct llama.cpp integration
const invokeLocalModel = async (prompt) => {
  const response = await fetch("http://localhost:8000/completion", {
    method: "POST",
    body: JSON.stringify({
      prompt,
      n_predict: 512,
      temperature: 0.7,
      top_p: 0.9,
    }),
  });
  return response.json();
};

// Ollama integration
const invokeOllama = async (prompt) => {
  const response = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    body: JSON.stringify({
      model: "llama2:7b-instruct-q4_K_M",
      prompt,
      stream: false,
    }),
  });
  return response.json();
};
```

---

## Performance Benchmarks

### Inference Speed (tokens/second)

| Model                | CPU | GPU (CUDA) | GPU (Metal) |
| -------------------- | --- | ---------- | ----------- |
| Llama-3-8B (Q4)      | 12  | 80         | 60          |
| Mistral-7B (Q4)      | 18  | 100        | 75          |
| Neural-Chat-7B (Q4)  | 15  | 90         | 70          |
| Dolphin-Mixtral (Q4) | 6   | 40         | 30          |

### Memory Usage

| Model                | RAM   | VRAM (GPU) |
| -------------------- | ----- | ---------- |
| Llama-3-8B (Q4)      | 9 GB  | 6 GB       |
| Mistral-7B (Q4)      | 8 GB  | 5 GB       |
| Dolphin-Mixtral (Q4) | 26 GB | 20 GB      |

---

## Troubleshooting

### Model Won't Load

```bash
# Check file integrity
md5sum llama-2-7b-instruct.Q4_K_M.gguf

# Verify permissions
chmod 644 llama-2-7b-instruct.Q4_K_M.gguf

# Check available disk space
df -h
```

### Slow Inference

```bash
# Enable GPU acceleration
export CUDA_VISIBLE_DEVICES=0

# Use smaller quantization
# Q2_K instead of Q4_K_M

# Reduce context window
# Set max_tokens to 512 instead of 2048
```

### Memory Issues

```bash
# Use smaller model
ollama pull mistral:7b-instruct-q4_K_M

# Reduce batch size
# Implement request queuing
```

---

## Recommended Setup for RedLinux

**Minimum Spec**:

- CPU: 8-core modern processor
- RAM: 16 GB
- Storage: 50 GB SSD
- Model: Mistral-7B-Instruct (Q4_K_M)

**Recommended Spec**:

- CPU: 16-core processor
- RAM: 32 GB
- GPU: NVIDIA RTX 3080 or better
- Storage: 100 GB NVMe SSD
- Model: Llama-3-8B-Instruct (Q4_K_M)

**High-Performance Spec**:

- CPU: 32-core EPYC processor
- RAM: 64 GB
- GPU: NVIDIA A100 or better
- Storage: 500 GB NVMe SSD
- Model: Dolphin-Mixtral-8x7B (Q4_K_M)

---

## Resources

- **Ollama**: https://ollama.ai/
- **llama.cpp**: https://github.com/ggerganov/llama.cpp
- **Hugging Face Models**: https://huggingface.co/models
- **TheBloke GGUF Collection**: https://huggingface.co/TheBloke
- **LM Studio**: https://lmstudio.ai/

---

## Version Information

- **Reference Version**: 1.0
- **Last Updated**: May 2026
- **Compatible with RedLinux**: v4.1+
