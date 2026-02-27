import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useOrders } from "../lib/ordersStore";
import { useUser } from "../lib/userStore";

const WELCOME = "/welcome" as any;

export default function MyOrdersScreen() {
  const router = useRouter();
  const { orders, confirmOrderReceived } = useOrders();
  const { user, isHydrated } = useUser();

  useEffect(() => {
    if (!isHydrated) return;
    if (!user) router.replace(WELCOME);
  }, [isHydrated, user, router]);

  if (!isHydrated) {
    return <Text style={{ padding: 24 }}>Loading...</Text>;
  }

  if (!user) {
    return <Text style={{ padding: 24 }}>Redirecting...</Text>;
  }

  if (user.role !== "dept_head") {
    return <Text style={{ padding: 24 }}>Access denied.</Text>;
  }

  const dept = (user.department || "").trim();

 const mine = orders
  .filter((o) => {
    const oDept = String(o.requesterDepartment || "").trim().toLowerCase();
    const myDept = String(dept || "").trim().toLowerCase();

    const belongsToMe =
      o.requesterId === user.id || (myDept && oDept === myDept);

    const st = String(o.status).trim();
    const isActive = ["pending", "processing", "awaiting_confirmation"].includes(st);

    return belongsToMe && isActive;
  })
  .sort((a, b) => {
    const rank = (s: string) => {
      const st = String(s).trim();
      if (st === "awaiting_confirmation") return 0;
      if (st === "processing") return 1;
      if (st === "pending") return 2;
      return 9;
    };
    return rank(a.status) - rank(b.status);
  });

  return (
    <ScrollView style={{ flex: 1, padding: 24, backgroundColor: "#F5F5F7" }}>
      <Text style={{ fontSize: 24, fontWeight: "800" }}>Active Orders</Text>
     <Text style={{ marginTop: 6, color: "#6e6e73" }}>
  Active orders for: {dept || "(none)"}
</Text>

      {mine.length ? (
        mine.map((o) => (
          <View
            key={`${o.id}-${o.updatedAt}`}
            style={{
              marginTop: 12,
              backgroundColor: "#fff",
              padding: 14,
              borderRadius: 14,
            }}
          >
            <Text style={{ fontWeight: "800" }}>{o.id}</Text>

            <Text
              style={{
                marginTop: 4,
                color: "#007AFF",
                fontWeight: "700",
              }}
            >
              Status:{" "}
              {String(o.status).trim() === "delivered"
                ? "received"
                : o.status}
            </Text>

            {o.assignedToName ? (
              <Text style={{ marginTop: 4, color: "#6e6e73" }}>
                Delivered by: {o.assignedToName}
              </Text>
            ) : null}

            {o.pickedByName ? (
              <Text style={{ marginTop: 4, color: "#6e6e73" }}>
                Picked by: {o.pickedByName}
              </Text>
            ) : null}

            <Text style={{ marginTop: 6, color: "#6e6e73" }}>
              {new Date(o.createdAt).toLocaleString()}
            </Text>

           {String(o.status).trim() === "awaiting_confirmation" ? (
              <TouchableOpacity
                onPress={() => confirmOrderReceived(o.id, user.name)}
                style={{
                  marginTop: 10,
                  backgroundColor: "#111",
                  paddingVertical: 10,
                  borderRadius: 12,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "800" }}>
                  Confirm received
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ))
      ) : (
        <Text style={{ marginTop: 12, color: "#6e6e73" }}>
          No orders yet.
        </Text>
      )}
    </ScrollView>
  );
}