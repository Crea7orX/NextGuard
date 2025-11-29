import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import * as SecureStore from "expo-secure-store";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function saveToSecureStore(key: string, value: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(key, value);
  } catch (error) {
    console.error(`Error saving ${key} to SecureStore:`, error);
  }
}

export async function getFromSecureStore(key: string): Promise<string | null> {
  try {
    const value = await SecureStore.getItemAsync(key);
    return value;
  } catch (error) {
    console.error(`Error retrieving ${key} from SecureStore:`, error);
    return null;
  }
}

export async function deleteFromSecureStore(key: string): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch (error) {
    console.error(`Error deleting ${key} from SecureStore:`, error);
  }
}
