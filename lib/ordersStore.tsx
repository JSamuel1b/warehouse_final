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
      createOrder: (items, requester) => {
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

        setOrders((prev) => [order, ...prev]);
        setNextOrderNumber((n) => n + 1);
      },

      // ✅ PHYSICAL PICKUP (KIOSK) -> CLOSED IMMEDIATELY (delivered)
      createPhysicalPickup: (items, owner, pickedByName) => {
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

        setOrders((prev) => [order, ...prev]);
        setNextOrderNumber((n) => n + 1);
      },

      // ✅ STAFF ASSIGN (guarded)
      assignOrderToUser: (orderId, userId, userName) => {
        setOrders((prev) =>
          prev.map((o) => {
            if (o.id !== orderId) return o;

            // ✅ Only online orders can be assigned
            if (o.kind !== "online") return o;

            // ✅ Only assign if still pending
            if (String(o.status).trim() !== "pending") return o;

            // ✅ Prevent double assignment
            if (o.assignedToId) return o;

            return {
              ...o,
              assignedToId: userId,
              assignedToName: userName,
              status: "processing",
              updatedAt: new Date().toISOString(),
            };
          })
        );
      },

      // ✅ STAFF RELEASE (guarded)
      unassignOrder: (orderId: string, userId: string) => {
        setOrders((prev) =>
          prev.map((o) => {
            if (o.id !== orderId) return o;

            // ✅ Only the assigned staff can release it
            if (o.assignedToId !== userId) return o;

            // ✅ Only allow release while processing
            if (String(o.status).trim() !== "processing") return o;

            return {
              ...o,
              assignedToId: undefined,
              assignedToName: undefined,
              status: "pending",
              updatedAt: new Date().toISOString(),
            };
          })
        );
      },

      // ✅ STAFF NEXT STEP (guarded)
      updateOrderStatus: (id, userId) => {
        setOrders((prev) =>
          prev.map((o) => {
            if (o.id !== id) return o;
            if (o.kind !== "online") return o;

            // ✅ Only assigned staff can move it forward
            if (!o.assignedToId || o.assignedToId !== userId) return o;

            const nextStatus: OrderStatus =
              o.status === "pending"
                ? "processing"
                : o.status === "processing"
                ? "awaiting_confirmation"
                : o.status;

            return { ...o, status: nextStatus, updatedAt: new Date().toISOString() };
          })
        );
      },

      // ✅ DEPT HEAD CONFIRM RECEIVED (online only)
      confirmOrderReceived: (id: string, receivedByName: string) => {
        const now = new Date().toISOString();
        setOrders((prev) =>
          prev.map((o) => {
            if (o.id !== id) return o;

            const st = String(o.status).trim();
            if (st !== "awaiting_confirmation") return o;

            return {
              ...o,
              status: "delivered",
              receivedByName,
              receivedAt: now,
              updatedAt: now,
            };
          })
        );
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