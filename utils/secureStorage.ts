import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const WEB_STORAGE_PREFIX = 'crypto_exchange_';

export const secureStorage = {
  async setItem(key: string, value: string): Promise<void> {
    console.log(`[SecureStorage] Setting ${key}`);
    if (Platform.OS === 'web') {
      try {
        localStorage.setItem(WEB_STORAGE_PREFIX + key, value);
      } catch (error) {
        console.error('[SecureStorage] Web storage error:', error);
        throw error;
      }
    } else {
      try {
        await SecureStore.setItemAsync(key, value);
      } catch (error) {
        console.error('[SecureStorage] Secure store error:', error);
        throw error;
      }
    }
  },

  async getItem(key: string): Promise<string | null> {
    console.log(`[SecureStorage] Getting ${key}`);
    if (Platform.OS === 'web') {
      try {
        return localStorage.getItem(WEB_STORAGE_PREFIX + key);
      } catch (error) {
        console.error('[SecureStorage] Web storage error:', error);
        return null;
      }
    } else {
      try {
        return await SecureStore.getItemAsync(key);
      } catch (error) {
        console.error('[SecureStorage] Secure store error:', error);
        return null;
      }
    }
  },

  async deleteItem(key: string): Promise<void> {
    console.log(`[SecureStorage] Deleting ${key}`);
    if (Platform.OS === 'web') {
      try {
        localStorage.removeItem(WEB_STORAGE_PREFIX + key);
      } catch (error) {
        console.error('[SecureStorage] Web storage error:', error);
      }
    } else {
      try {
        await SecureStore.deleteItemAsync(key);
      } catch (error) {
        console.error('[SecureStorage] Secure store error:', error);
      }
    }
  },
};
