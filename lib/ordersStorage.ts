// /lib/ordersStorage.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Order } from "./ordersStore";

const ORDERS_KEY = "janitorial_orders_v1";
const NEXT_NUM_KEY = "janitorial_next_order_number_v1";

export async function loadOrders(): Promise<Order[]> {
  try {
    const raw = await AsyncStorage.getItem(ORDERS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveOrders(orders: Order[]) {
  try {
    await AsyncStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  } catch {}
}

export async function loadNextOrderNumber(): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(NEXT_NUM_KEY);
    const n = raw ? parseInt(raw, 10) : NaN;
    return Number.isFinite(n) && n > 0 ? n : 1;
  } catch {
    return 1;
  }
}

export async function saveNextOrderNumber(n: number) {
  try {
    await AsyncStorage.setItem(NEXT_NUM_KEY, String(n));
  } catch {}
}
