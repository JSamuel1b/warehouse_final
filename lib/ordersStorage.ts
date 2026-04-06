// /lib/ordersStorage.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Order, OrderItem, OrderKind, OrderStatus } from "./ordersStore";
import { LoadOrdersFromAPIRequest } from "@/services/order-service";
import { ShowInfoMessage } from "@/utils/toast-message.service";

const ORDERS_KEY = "janitorial_orders_v1";
const NEXT_NUM_KEY = "janitorial_next_order_number_v1";

export async function loadOrders(token: string): Promise<Order[]> {
  try {
    const apiResponse = await LoadOrdersFromAPIRequest(token);

    if (typeof(apiResponse) !== "string")
    {
      if(apiResponse.length == 0)
      {
        return [];
      }

      let orders = apiResponse.map((x) => {
        let orderModel : Order = {
          createdAt: x.createdAt,
          id: x.id.toString(),
          items: x.items.map((item) => {
            return { name: item.inventoryItemName, qty: item.quantity.toString(), sku: item.inventoryItemSKU } as OrderItem;
            }),
          kind: x.kind as OrderKind,
          requesterId: x.requestedId ?? "",
          requesterName: x.receivedByName ?? "",
          requesterRole: x.requesterRole,
          status: x.status as OrderStatus,
          updatedAt: x.updatedAt,
          assignedToId: x.assignedToId ?? "",
          assignedToName: x.assignedToName ?? "",
          pickedByName: x.pickedByName ?? "",
          receivedAt: x.receivedAt ?? "",
          receivedByName: x.receivedByName ?? "",
          requesterDepartment: x.requesterDepartment
        };

        return orderModel;
      });

      return orders;
    }
    else{
      ShowInfoMessage(apiResponse);
      return [];
    }
    // const raw = await AsyncStorage.getItem(ORDERS_KEY);
    // const parsed = raw ? JSON.parse(raw) : [];
    // return Array.isArray(parsed) ? parsed : [];
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
