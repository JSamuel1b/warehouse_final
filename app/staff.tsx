import { useRouter } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useOrders } from "../lib/ordersStore";
import { useUser } from "../lib/userStore";

const WELCOME = "/welcome" as any;

export default function StaffScreen() {
  const router = useRouter();
  const { orders, updateOrderStatus, assignOrderToUser, unassignOrder } = useOrders();
  const { user, isHydrated } = useUser();

  if (!isHydrated) {
    return <Text style={{ padding: 24 }}>Loading...</Text>;
  }

  if (!user) {
    router.replace(WELCOME);
    return <Text style={{ padding: 24 }}>Redirecting...</Text>;
  }

  if (user.role !== "staff" && user.role !== "supervisor") {
    return <Text style={{ padding: 24 }}>Access denied.</Text>;
  }

  const myActive = orders.filter(
    (o) => o.assignedToId === user.id && String(o.status).trim() !== "delivered"
  );

  const openQueue = orders.filter(
    (o) => !o.assignedToId && String(o.status).trim() === "pending"
  );

  const myCompleted = orders
    .filter((o) => o.assignedToId === user.id && String(o.status).trim() === "delivered")
    .slice(0, 10);

  return (
    <View style={{ flex: 1, backgroundColor: "#F5F5F7" }}>
      <View style={{ paddingTop: 18, paddingHorizontal: 24, paddingBottom: 12 }}>
        <Text style={{ fontSize: 24, fontWeight: "bold" }}>Staff</Text>

        <TouchableOpacity
          onPress={() => router.replace("/janitorial")}
          style={{
            marginTop: 10,
            backgroundColor: "#fff",
            paddingVertical: 8,
            paddingHorizontal: 12,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "#ddd",
            alignSelf: "flex-start",
          }}
        >
          <Text style={{ fontWeight: "800" }}>Back</Text>
        </TouchableOpacity>

        <Text style={{ marginTop: 10, color: "#6e6e73" }}>
          Active: {myActive.length} • Open: {openQueue.length} • Completed:{" "}
          {orders.filter((o) => o.assignedToId === user.id && String(o.status).trim() === "delivered").length}
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 120 }}
      >
        <Text style={{ marginTop: 6, fontWeight: "800" }}>My Active</Text>

        {myActive.length ? (
          myActive.map((o) => (
            <View
              key={`${o.id}-${o.updatedAt}`}
              style={{
                marginTop: 10,
                backgroundColor: "#fff",
                padding: 14,
                borderRadius: 14,
              }}
            >
              <Text style={{ fontWeight: "800" }}>{o.id}</Text>
              <Text style={{ marginTop: 4 }}>Status: {o.status}</Text>

              {o.assignedToId === user.id &&
              String(o.status).trim() !== "awaiting_confirmation" &&
              String(o.status).trim() !== "delivered" ? (
                <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
                  <TouchableOpacity
                    onPress={() => updateOrderStatus(o.id, user.id)}
                    style={{
                      flex: 1,
                      backgroundColor: "#111",
                      padding: 10,
                      borderRadius: 10,
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ color: "#fff", fontWeight: "800" }}>
                      Next step
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => unassignOrder(o.id, user.id)}
                    style={{
                      flex: 1,
                      backgroundColor: "#EEE",
                      padding: 10,
                      borderRadius: 10,
                      alignItems: "center",
                      borderWidth: 1,
                      borderColor: "#ddd",
                    }}
                  >
                    <Text style={{ fontWeight: "800", color: "#111" }}>
                      Leave for someone else
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : null}
            </View>
          ))
        ) : (
          <Text style={{ marginTop: 8, color: "#6e6e73" }}>
            No active orders.
          </Text>
        )}

        <Text style={{ marginTop: 18, fontWeight: "800" }}>Open Queue</Text>

        {openQueue.length ? (
          openQueue.map((o) => (
            <View
              key={`${o.id}-${o.updatedAt}`}
              style={{
                marginTop: 10,
                backgroundColor: "#fff",
                padding: 14,
                borderRadius: 14,
              }}
            >
              <Text style={{ fontWeight: "800" }}>{o.id}</Text>
              <Text style={{ marginTop: 4 }}>Status: {o.status}</Text>

              <TouchableOpacity
                onPress={() => assignOrderToUser(o.id, user.id, user.name)}
                style={{
                  marginTop: 10,
                  backgroundColor: "#111",
                  padding: 10,
                  borderRadius: 10,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "800" }}>
                  Assign to me
                </Text>
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <Text style={{ marginTop: 8, color: "#6e6e73" }}>
            No pending orders in queue.
          </Text>
        )}

        <Text style={{ marginTop: 18, fontWeight: "800" }}>My Completed</Text>

        {myCompleted.length ? (
          myCompleted.map((o) => (
            <View
              key={`${o.id}-${o.updatedAt}`}
              style={{
                marginTop: 10,
                backgroundColor: "#fff",
                padding: 14,
                borderRadius: 14,
              }}
            >
              <Text style={{ fontWeight: "800" }}>{o.id}</Text>
              <Text style={{ marginTop: 4 }}>Status: delivered</Text>

              {o.receivedByName ? (
                <View
                  style={{
                    marginTop: 10,
                    backgroundColor: "#EAF7EA",
                    padding: 10,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: "#CDECCD",
                  }}
                >
                  <Text style={{ fontWeight: "800" }}>
                    Confirmed by {o.receivedByName}. ✅
                  </Text>
                  <Text style={{ marginTop: 2, color: "#2A6E2A" }}>
                    Good Job, {user.name}.
                  </Text>
                </View>
              ) : null}
            </View>
          ))
        ) : (
          <Text style={{ marginTop: 8, color: "#6e6e73" }}>
            No completed orders yet.
          </Text>
        )}
      </ScrollView>
    </View>
  );
}