import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  loadNextOrderNumber,
  loadOrders,
  saveNextOrderNumber,
  saveOrders,
} from "./ordersStorage";
import { CreateOrderDto, CreateOrderItemDto } from "@/models/orders/requests/create-order";
import { AssignOrderToUserRequest, ConfirmOrderReceivedRequest, CreateOrderRequest, UnassignOrderRequest, UpdateOrderStatusRequest } from "@/services/order-service";
import { ShowErrorMessage, ShowSuccessMessage } from "@/utils/toast-message.service";
import { AssignOrderDto } from "@/models/orders/requests/assign-order";
import { UnassignOrderDto } from "@/models/orders/requests/unassign-order";
import { UpdateStatusDto } from "@/models/orders/requests/update-order-status";
import { ConfirmOrderReceivedDto } from "@/models/orders/requests/confirm-order-received";

/* ---------------- TYPES ---------------- */

export type OrderItem = { sku: string; name: string; qty: string };

export type OrderStatus =
  | "pending"
  | "processing"
  | "awaiting_confirmation"
  | "delivered";

export type OrderKind = "online" | "physical";

export type Order = {
  id: string;
  createdAt: string;
  updatedAt: string;

  kind: OrderKind;
  status: OrderStatus;

  items: OrderItem[];

  // Owner (dept head this order belongs to)
  requesterId: string;
  requesterName: string;
  requesterRole: string;
  requesterDepartment?: string;

  // Staff assignment (online workflow only)
  assignedToId?: string;
  assignedToName?: string;

  // Confirmation metadata (online)
  receivedByName?: string;
  receivedAt?: string;

  // Physical pickup metadata (kiosk)
  pickedByName?: string; // free text name
};

type DeptHeadOwner = {
  id: string;
  name: string;
  department: string;
};

type OrdersContextValue = {
  orders: Order[];

  // Online order (dept head placing online, or staff/supervisor if needed)
  createOrder: (
    items: OrderItem[],
    requester: { id: string; name: string; role: string; department?: string }
  ) => void;

  // Kiosk physical pickup (closed immediately)
  createPhysicalPickup: (
    items: OrderItem[],
    owner: DeptHeadOwner,
    pickedByName: string
  ) => void;

  // Staff advances: pending -> processing -> awaiting_confirmation (guarded by assigned staff)
  updateOrderStatus: (id: string, userId: string) => void;

  // Dept head confirms: awaiting_confirmation -> delivered (online only)
  confirmOrderReceived: (id: string, receivedByName: string) => void;

  // Staff assignment
  assignOrderToUser: (orderId: string, userId: string, userName: string) => void;
  unassignOrder: (orderId: string, userId: string) => void;

  reorderDraft: OrderItem[] | null;
  setReorderDraft: (items: OrderItem[]) => void;
  clearReorderDraft: () => void;

  isHydrated: boolean;
};

/* ---------------- CONTEXT ---------------- */

const OrdersContext = createContext<OrdersContextValue | null>(null);

function formatOrderId(n: number) {
  return `JANI-${String(n).padStart(4, "0")}`;
}

/* ---------------- PROVIDER ---------------- */

export function OrdersProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [reorderDraft, setReorderDraftState] = useState<OrderItem[] | null>(null);

  const [nextOrderNumber, setNextOrderNumber] = useState<number>(1);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate
  useEffect(() => {
    (async () => {
      const storedOrders = await loadOrders();
      const storedNext = await loadNextOrderNumber();
      setOrders(storedOrders);
      setNextOrderNumber(storedNext);
      setIsHydrated(true);
    })();
  }, []);

  const updateData = async () => {
    const storedOrders = await loadOrders();
    setOrders(storedOrders);
  }

  // Persist orders
  useEffect(() => {
    if (!isHydrated) return;
    saveOrders(orders);
  }, [orders, isHydrated]);

  // Persist next number
  useEffect(() => {
    if (!isHydrated) return;
    saveNextOrderNumber(nextOrderNumber);
  }, [nextOrderNumber, isHydrated]);

  const value = useMemo<OrdersContextValue>(
    () => ({
      orders,

      // ✅ ONLINE ORDER
      createOrder: async (items, requester) => {
        const now = new Date().toISOString();
        const id = formatOrderId(nextOrderNumber);

        const order: Order = {
          id,
          createdAt: now,
          updatedAt: now,
          kind: "online",
          status: "pending",
          items,

          requesterId: requester.id,
          requesterName: requester.name,
          requesterRole: requester.role,
          requesterDepartment: requester.department,

          assignedToId: undefined,
          assignedToName: undefined,
          receivedByName: undefined,
          receivedAt: undefined,
        };

        const request: CreateOrderDto = {
          requestedId: requester.id,
          createdAt: now,
          kind: "online",
          pickedByName: null,
          receivedAt: null,
          receivedByName: null,
          assignedToId: null,
          status: "pending",
          items: items.map(x =>{
            return {sKU: x.sku, quantity: +x.qty} as CreateOrderItemDto
            })
        };

        const createResponse = await CreateOrderRequest(request);

        if(typeof(createResponse) === "number")
        {
          ShowSuccessMessage("Order created successfully");
          await updateData();
        }
        else{
          ShowErrorMessage(createResponse);
        }

        // setOrders((prev) => [order, ...prev]);
        // setNextOrderNumber((n) => n + 1);
      },

      // ✅ PHYSICAL PICKUP (KIOSK) -> CLOSED IMMEDIATELY (delivered)
      createPhysicalPickup: async (items, owner, pickedByName) => {
        const now = new Date().toISOString();
        const id = formatOrderId(nextOrderNumber);

        const order: Order = {
          id,
          createdAt: now,
          updatedAt: now,
          kind: "physical",
          status: "delivered",
          items,

          requesterId: owner.id,
          requesterName: owner.name,
          requesterRole: "dept_head",
          requesterDepartment: owner.department,

          pickedByName: (pickedByName || "").trim(),
        };

        const request: CreateOrderDto = {
          requestedId: owner.id,
          createdAt: now,
          kind: "physical",
          status: "delivered",
          pickedByName: (pickedByName || "").trim(),
          receivedAt: null,
          receivedByName: null,
          assignedToId: null,
          
          items: items.map(x =>{
            return {sKU: x.sku, quantity: +x.qty} as CreateOrderItemDto
            })
        };

        const createResponse = await CreateOrderRequest(request);

        if(typeof(createResponse) === "number")
        {
          ShowSuccessMessage("Order created successfully");
          await updateData();
        }
        else{
          ShowErrorMessage(createResponse);
        }

        // setOrders((prev) => [order, ...prev]);
        // setNextOrderNumber((n) => n + 1);
      },

      // ✅ STAFF ASSIGN (guarded)
      assignOrderToUser: async (orderId, userId, userName) => {
        // setOrders((prev) =>
        //   prev.map((o) => {
        //     if (o.id !== orderId) return o;

        //     // ✅ Only online orders can be assigned
        //     if (o.kind !== "online") return o;

        //     // ✅ Only assign if still pending
        //     if (String(o.status).trim() !== "pending") return o;

        //     // ✅ Prevent double assignment
        //     if (o.assignedToId) return o;

        //     return {
        //       ...o,
        //       assignedToId: userId,
        //       assignedToName: userName,
        //       status: "processing",
        //       updatedAt: new Date().toISOString(),
        //     };
        //   })
        // );

        const request : AssignOrderDto = {
          orderId: +orderId,
          updatedAt: new Date().toISOString(),
          updatedBy: userId,
          username: userId
        }

        const apiResponse = await AssignOrderToUserRequest(request);

        if(typeof(apiResponse) !== "string")
        {
          ShowSuccessMessage("Order assigned successfully");
          await updateData();
        }else{
          ShowErrorMessage(apiResponse);
        }

      },

      // ✅ STAFF RELEASE (guarded)
      unassignOrder: async (orderId: string, userId: string) => {
        // setOrders((prev) =>
        //   prev.map((o) => {
        //     if (o.id !== orderId) return o;

        //     // ✅ Only the assigned staff can release it
        //     if (o.assignedToId !== userId) return o;

        //     // ✅ Only allow release while processing
        //     if (String(o.status).trim() !== "processing") return o;

        //     return {
        //       ...o,
        //       assignedToId: undefined,
        //       assignedToName: undefined,
        //       status: "pending",
        //       updatedAt: new Date().toISOString(),
        //     };
        //   })
        // );

        const request: UnassignOrderDto = {
          orderId: +orderId,
          updatedBy: userId,
          updatedAt: new Date().toISOString()
        }

        const apiResponse = await UnassignOrderRequest(request);

        if(typeof(apiResponse) !== "string")
        {
          ShowSuccessMessage("Order unassigned successfully");
          await updateData();
        }else{
          ShowErrorMessage(apiResponse);
        }
      },

      // ✅ STAFF NEXT STEP (guarded)
      updateOrderStatus: async (id, userId) => {
        // setOrders((prev) =>
        //   prev.map((o) => {
        //     if (o.id !== id) return o;
        //     if (o.kind !== "online") return o;

        //     // ✅ Only assigned staff can move it forward
        //     if (!o.assignedToId || o.assignedToId !== userId) return o;

        //     const nextStatus: OrderStatus =
        //       o.status === "pending"
        //         ? "processing"
        //         : o.status === "processing"
        //         ? "awaiting_confirmation"
        //         : o.status;

        //     return { ...o, status: nextStatus, updatedAt: new Date().toISOString() };
        //   })
        // );

        let orderToUpdate = orders.find(x => x.id === id);

        if(orderToUpdate)
        {
          const nextStatus: OrderStatus =
              orderToUpdate.status === "pending"
                ? "processing"
                : orderToUpdate.status === "processing"
                ? "awaiting_confirmation"
                : orderToUpdate.status;

            const request: UpdateStatusDto = {
              orderId: +id,
              status: nextStatus,
              updatedAt: new Date().toISOString(),
              updatedBy: userId
            }

            const apiResponse = await UpdateOrderStatusRequest(request);

            if(typeof(apiResponse) !== "string")
            {
              ShowSuccessMessage("Order status updated successfully");
              await updateData();
            }else{
              ShowErrorMessage(apiResponse);
            }
          }
      },

      // ✅ DEPT HEAD CONFIRM RECEIVED (online only)
      confirmOrderReceived: async (id: string, receivedByName: string) => {
        const now = new Date().toISOString();
        // setOrders((prev) =>
        //   prev.map((o) => {
        //     if (o.id !== id) return o;

        //     const st = String(o.status).trim();
        //     if (st !== "awaiting_confirmation") return o;

        //     return {
        //       ...o,
        //       status: "delivered",
        //       receivedByName,
        //       receivedAt: now,
        //       updatedAt: now,
        //     };
        //   })
        // );

        const request: ConfirmOrderReceivedDto = {
          orderId: +id,
          receivedByName: receivedByName,
          updatedAt: now,
          updatedBy: receivedByName
        };

        const apiResponse = await ConfirmOrderReceivedRequest(request);

        if(typeof(apiResponse) !== "string")
        {
          ShowSuccessMessage("Order status updated successfully");
          await updateData();
        }else{
          ShowErrorMessage(apiResponse);
        }
      },

      reorderDraft,
      setReorderDraft: (items) => setReorderDraftState(items),
      clearReorderDraft: () => setReorderDraftState(null),

      isHydrated,
    }),
    [orders, reorderDraft, nextOrderNumber, isHydrated]
  );

  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>;
}

export function useOrders() {
  const ctx = useContext(OrdersContext);
  if (!ctx) throw new Error("useOrders must be used within OrdersProvider");
  return ctx;
}