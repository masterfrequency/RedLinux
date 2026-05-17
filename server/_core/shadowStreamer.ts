import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { storagePut, storageGet } from "./storage";

export class ShadowStreamer {
  private static CHUNK_DIR = path.join(process.cwd(), "vault", "chunks");

  static async init() {
    try {
      await fs.mkdir(this.CHUNK_DIR, { recursive: true });
    } catch (e) {}
  }

  /**
   * Receive and store a chunk of data
   */
  static async receiveChunk(transferId: number, chunkIndex: number, data: Buffer) {
    await this.init();
    const chunkPath = path.join(this.CHUNK_DIR, `${transferId}_${chunkIndex}.chunk`);
    await fs.writeFile(chunkPath, data);
    return true;
  }

  /**
   * Reassemble all chunks into a final file in the vault
   */
  static async reassemble(transferId: number, totalChunks: number, fileName: string) {
    const buffers: Buffer[] = [];
    for (let i = 0; i < totalChunks; i++) {
      const chunkPath = path.join(this.CHUNK_DIR, `${transferId}_${i}.chunk`);
      try {
        const chunkData = await fs.readFile(chunkPath);
        buffers.push(chunkData);
        // Cleanup chunk after reading
        await fs.unlink(chunkPath);
      } catch (e) {
        throw new Error(`Missing chunk ${i} for transfer ${transferId}`);
      }
    }

    const finalBuffer = Buffer.concat(buffers);
    const result = await storagePut(`exfil_${transferId}_${fileName}`, finalBuffer);
    return result;
  }

  /**
   * Cryptographically Scattered LSB Extraction
   * Uses a CSPRNG-seeded random walk to recover bits scattered across the image.
   */
  static async extractFromImage(imageBuffer: Buffer, seed: string): Promise<Buffer> {
    const Jimp = require("jimp");
    const image = await Jimp.read(imageBuffer);
    const { width, height } = image.bitmap;
    const totalPixels = width * height;
    const totalChannels = totalPixels * 3; // RGB only

    // Create a seeded PRNG for the random walk
    const hash = crypto.createHash('sha256').update(seed).digest();
    let state = hash.readUInt32BE(0);
    const prng = () => {
      state = (state * 1664525 + 1013904223) >>> 0;
      return state / 0xFFFFFFFF;
    };

    // Generate the scattered indices
    const indices = Array.from({ length: totalChannels }, (_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(prng() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }

    let bits = "";
    let dataLength = 0;
    let lengthFound = false;
    const resultBytes: number[] = [];
    let bitIdx = 0;

    while (bitIdx < indices.length) {
      const channelIdx = indices[bitIdx];
      const pixelIdx = Math.floor(channelIdx / 3);
      const colorChannel = channelIdx % 3;
      const byteIdx = pixelIdx << 2;
      
      const pixelValue = image.bitmap.data[byteIdx + colorChannel];
      bits += (pixelValue & 1).toString();

      if (!lengthFound && bits.length === 32) {
        dataLength = parseInt(bits, 2);
        lengthFound = true;
        bits = "";
      } else if (lengthFound && bits.length === 8) {
        resultBytes.push(parseInt(bits, 2));
        bits = "";
        if (resultBytes.length === dataLength) {
          return Buffer.from(resultBytes);
        }
      }
      bitIdx++;
    }

    return Buffer.from(resultBytes);
  }
}
