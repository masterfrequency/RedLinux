import fs from "node:fs";
import path from "node:path";
import axios from "axios";

const MODELS_DIR = path.join(process.cwd(), "models");

export async function ensureModelsDir() {
  if (!fs.existsSync(MODELS_DIR)) {
    fs.mkdirSync(MODELS_DIR, { recursive: true });
  }
}

export async function downloadGGUF(repo: string, filename: string) {
  await ensureModelsDir();
  const filePath = path.join(MODELS_DIR, filename);

  if (fs.existsSync(filePath)) {
    return { success: true, message: "Model already exists", path: filePath };
  }

  const url = `https://huggingface.co/${repo}/resolve/main/${filename}`;

  try {
    const response = await axios({
      method: "GET",
      url: url,
      responseType: "stream",
    });

    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on("finish", () => resolve({ success: true, path: filePath }));
      writer.on("error", reject);
    });
  } catch (error) {
    throw new Error(`Failed to download model: ${error}`);
  }
}

export function listModels() {
  if (!fs.existsSync(MODELS_DIR)) return [];
  return fs.readdirSync(MODELS_DIR).filter((f) => f.endsWith(".gguf"));
}
