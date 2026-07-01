import * as fs from 'fs';
import * as path from 'path';
import { config } from '../config';

export class JsonDB {
  private static instance: JsonDB;
  private dataDir: string;
  private data: {
    users: any[];
    downloads: any[];
    metadata: any[];
  };

  private constructor() {
    this.dataDir = path.resolve(path.dirname(config.DATABASE_PATH));
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
    this.data = this.load();
  }

  static getInstance(): JsonDB {
    if (!JsonDB.instance) {
      JsonDB.instance = new JsonDB();
    }
    return JsonDB.instance;
  }

  private get dbPath(): string {
    return path.resolve(config.DATABASE_PATH).replace('.db', '.json');
  }

  private load(): any {
    try {
      if (fs.existsSync(this.dbPath)) {
        return JSON.parse(fs.readFileSync(this.dbPath, 'utf-8'));
      }
    } catch {}
    return { users: [], downloads: [], metadata: [] };
  }

  private save(): void {
    fs.writeFileSync(this.dbPath, JSON.stringify(this.data, null, 2));
  }

  get users() { return this.data.users; }
  get downloads() { return this.data.downloads; }
  get metadata() { return this.data.metadata; }

  persist(): void {
    this.save();
  }

  nextId(collection: string): number {
    const items = (this.data as any)[collection] || [];
    return items.length > 0 ? Math.max(...items.map((i: any) => i.id)) + 1 : 1;
  }
}
