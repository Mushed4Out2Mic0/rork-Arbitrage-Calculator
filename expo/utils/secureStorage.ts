import * as SecureStore from 'expo-secure-store';

export const secureStorage = {
  async setItem(key: string, value: string): Promise<void> {
    if (!value) return;
    console.log(`[SecureStorage] Setting ${key}`);
    await SecureStore.setItemAsync(key, value);
  },

  async getItem(key: string): Promise<string | null> {
    console.log(`[SecureStorage] Getting ${key}`);
    return await SecureStore.getItemAsync(key);
  },

  async deleteItem(key: string): Promise<void> {
    console.log(`[SecureStorage] Deleting ${key}`);
    await SecureStore.deleteItemAsync(key);
  },
};
