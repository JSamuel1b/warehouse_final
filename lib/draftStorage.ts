import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "janitorial_draft_requests_v1";

export type DraftItem = { sku: string; name: string; qty: string };

export async function saveDraft(items: DraftItem[]) {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(items));
  } catch {}
}

export async function loadDraft(): Promise<DraftItem[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function clearDraft() {
  try {
    await AsyncStorage.removeItem(KEY);
  } catch {}
}
