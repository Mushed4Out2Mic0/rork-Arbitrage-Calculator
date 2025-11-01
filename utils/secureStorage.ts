import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const WEB_STORAGE_PREFIX = 'crypto_exchange_';
const isWeb = Platform.OS === 'web';

export const secureStorage = {
  async setItem(key: string, value: string): Promise<void> {
    if (!value) return;
    console.log(`[SecureStorage] Setting ${key}`);
    
    try {
      if (isWeb) {
        localStorage.setItem(WEB_STORAGE_PREFIX + key, value);
      } else {
        await SecureStore.setItemAsync(key, value);
      }
    } catch (error) {
      console.error('[SecureStorage] Error setting item:', error);
      throw error;
    }
  },

  async getItem(key: string): Promise<string | null> {
    console.log(`[SecureStorage] Getting ${key}`);
    
    try {
      if (isWeb) {
        return localStorage.getItem(WEB_STORAGE_PREFIX + key);
      } else {
        return await SecureStore.getItemAsync(key);
      }
    } catch (error) {
      console.error('[SecureStorage] Error getting item:', error);
      return null;
    }
  },

  async deleteItem(key: string): Promise<void> {
    console.log(`[SecureStorage] Deleting ${key}`);
    
    try {
      if (isWeb) {
        localStorage.removeItem(WEB_STORAGE_PREFIX + key);
      } else {
        await SecureStore.deleteItemAsync(key);
      }
    } catch (error) {
      console.error('[SecureStorage] Error deleting item:', error);
    }
  },
};
