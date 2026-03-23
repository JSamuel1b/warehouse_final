import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useOrders } from "../lib/ordersStore";
import { useUser } from "../lib/userStore";

type Item = { sku: string; name: string; qty: string };

export default function CheckoutScreen() {
  const router = useRouter();
  const { user } = useUser();
const { createOrder, createPhysicalPickup, setReorderDraft } = useOrders();
  const params = useLocalSearchParams<{
    itemsJson?: string;
    orderId?: string;
    returnMode?: string; // "inventory" | "history"
  }>();

  const itemsJson = (params as any).itemsJson ?? "[]";
  const orderId = params.orderId ?? "CHECKOUT";
  const returnMode = params.returnMode ?? "inventory";

  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    try {
      const parsed = JSON.parse(itemsJson);
      if (Array.isArray(parsed)) setItems(parsed);
      else setItems([]);
    } catch {
      setItems([]);
    }
  }, [itemsJson]);

  const removeByIndex = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const decQty = (idx: number) => {
    setItems((prev) =>
      prev.map((it, i) => {
        if (i !== idx) return it;
        const current = parseInt(it.qty || "1", 10) || 1;
        const next = Math.max(1, current - 1);
        return { ...it, qty: String(next) };
      })
    );
  };

  const incQty = (idx: number) => {
    setItems((prev) =>
      prev.map((it, i) => {
        if (i !== idx) return it;
        const current = parseInt(it.qty || "1", 10) || 1;
        return { ...it, qty: String(current + 1) };
      })
    );
  };

  const itemsCount = items.length;

  // ✅ if user not ready yet, avoid crash
  if (!user) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading user...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 24, backgroundColor: "#F5F5F7" }}>
      <ScrollView>
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 16,
            padding: 16,
            shadowColor: "#000",
            shadowOpacity: 0.06,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 6 },
          }}
        >
          <Text style={{ fontSize: 28, fontWeight: "800" }}>Checkout</Text>

          <Text style={{ marginTop: 10, fontSize: 18, fontWeight: "700" }}>
            {orderId}
          </Text>

          <Text style={{ marginTop: 6, color: "#6e6e73" }}>
            Items: {itemsCount}
          </Text>

          {items.length ? (
            <View style={{ marginTop: 14 }}>
              <Text style={{ fontWeight: "800" }}>Order items</Text>

              {items.map((it, idx) => (
                <View
                  key={`${it.sku}-${idx}`}
                  style={{
                    marginTop: 10,
                    padding: 12,
                    backgroundColor: "#F9F9F9",
                    borderRadius: 12,
                  }}
                >
                  <Text style={{ fontWeight: "800", color: "#111" }}>
                    {it.name}
                  </Text>
                  <Text style={{ color: "#6e6e73", marginTop: 2 }}>
                    SKU: {it.sku}
                  </Text>

                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginTop: 10,
                    }}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                      <TouchableOpacity
                        onPress={() => decQty(idx)}
                        style={{
                          backgroundColor: "#EEE",
                          paddingHorizontal: 10,
                          paddingVertical: 6,
                          borderRadius: 10,
                        }}
                      >
                        <Text style={{ fontWeight: "900" }}>−</Text>
                      </TouchableOpacity>

                      <Text style={{ fontWeight: "900", minWidth: 30, textAlign: "center" }}>
                        {it.qty}
                      </Text>

                      <TouchableOpacity
                        onPress={() => incQty(idx)}
                        style={{
                          backgroundColor: "#EEE",
                          paddingHorizontal: 10,
                          paddingVertical: 6,
                          borderRadius: 10,
                        }}
                      >
                        <Text style={{ fontWeight: "900" }}>+</Text>
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                      onPress={() => removeByIndex(idx)}
                      style={{
                        backgroundColor: "#EEE",
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                        borderRadius: 10,
                      }}
                    >
                      <Text style={{ fontWeight: "900" }}>✕</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <Text style={{ marginTop: 14, color: "#6e6e73" }}>
              No items in this order.
            </Text>
          )}
        </View>
      </ScrollView>

      <View style={{ flexDirection: "row", gap: 10, marginTop: 16 }}>
        <TouchableOpacity
          style={{
            backgroundColor: "#fff",
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: "#ddd",
          }}
          onPress={() => {
            // ✅ return to janitorial keeping draft
            setReorderDraft(items);
            router.replace({
              pathname: "/janitorial",
              params: { mode: returnMode },
            });
          }}
        >
          <Text style={{ fontWeight: "800" }}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            backgroundColor: items.length ? "#111" : "#999",
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderRadius: 14,
          }}
         onPress={ async () => {
  if (!items.length) return;
  if (!user) return;

  // ✅ KIOSK: physical pickup -> goes straight to history of selected dept head
  if (user.role === "physical_consumer") {
    const ownerId = user.actingDeptHeadId || "";
    const ownerName = user.actingDeptHeadName || "";
    const ownerDept = user.actingDeptHeadDepartment || "";

    if (!ownerId || !ownerName || !ownerDept) {
      alert("Missing department head selection.");
      return;
    }

    createPhysicalPickup(
      items,
      { id: ownerId, name: ownerName, department: ownerDept },
      user.name // pickedByName (free text)
    );

    alert("Picked up ✅");

    // back to inventory, clean cart
    router.replace({
      pathname: "/janitorial",
      params: { clear: "1", mode: "inventory" },
    });
    return;
  }

  // ✅ ONLINE (dept head, supervisor, etc.)
  await createOrder(items, user);

  //alert("Order confirmed ✅");

  router.replace({
    pathname: "/janitorial",
    params: { clear: "1", mode: "history" },
  });
}}
        >
          <Text style={{ color: "#fff", fontWeight: "800" }}>Confirm order</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}