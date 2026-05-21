import Dexie, { type EntityTable } from 'dexie';

interface Settings {
  id?: number;
  key: string;
  value: string;
}

const db = new Dexie('MenazeahSettings') as Dexie & {
  settings: EntityTable<Settings, 'id'>;
};

db.version(1).stores({
  settings: '++id, key'
});

export const settingsService = {
  async getGeminiApiKey() {
    const setting = await db.settings.where('key').equals('gemini_api_key').first();
    return setting?.value;
  },

  async setGeminiApiKey(apiKey: string) {
    const existing = await db.settings.where('key').equals('gemini_api_key').first();
    if (existing) {
      await db.settings.update(existing.id!, { value: apiKey });
    } else {
      await db.settings.add({ key: 'gemini_api_key', value: apiKey });
    }
  },

  async getGeminiModel() {
    const setting = await db.settings.where('key').equals('gemini_model').first();
    return setting?.value || 'gemini-2.5-flash';
  },

  async setGeminiModel(model: string) {
    const existing = await db.settings.where('key').equals('gemini_model').first();
    if (existing) {
      await db.settings.update(existing.id!, { value: model });
    } else {
      await db.settings.add({ key: 'gemini_model', value: model });
    }
  }
};

export default db;
