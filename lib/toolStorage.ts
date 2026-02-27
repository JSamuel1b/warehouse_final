import AsyncStorage from "@react-native-async-storage/async-storage";

const TOOLS_KEY = "toolcage_tools_v1";

export async function loadTools(): Promise<any[]> {
  try {
    const raw = await AsyncStorage.getItem(TOOLS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveTools(tools: any[]) {
  try {
    await AsyncStorage.setItem(TOOLS_KEY, JSON.stringify(tools));
  } catch {}
}