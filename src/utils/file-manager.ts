import * as fs from 'fs/promises';
import * as path from 'path';
import { config } from '../config';

export async function cleanupTempFile(filePath: string): Promise<void> {
  try {
    await fs.unlink(filePath);
  } catch {
    // File may not exist, ignore
  }
}

export async function ensureTempDir(): Promise<void> {
  const tempDir = path.resolve(config.TEMP_DIR);
  try {
    await fs.access(tempDir);
  } catch {
    await fs.mkdir(tempDir, { recursive: true });
  }
}

export function getTempPath(videoId: string, ext: string): string {
  const tempDir = path.resolve(config.TEMP_DIR);
  return path.join(tempDir, `${videoId}_${Date.now()}.${ext}`);
}
