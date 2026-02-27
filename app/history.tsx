import { useRouter } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useOrders } from "../lib/ordersStore";
import { useUser } from "../lib/userStore";

const WELCOME = "/welcome" as any;

export default function HistoryScreen() {
  const router = useRouter();
  const { orders } = useOrders();
  const { user, isHydrated } = useUser();

  if (!isHydrated) {
    return <Text style={{ padding: 24 }}>Loading...</Text>;
  }

  if (!user) {
    router.replace(WELCOME);
    return <Text style={{ padding: 24 }}>Redirecting...</Text>;
  }

  if (user.role !== "dept_head" && user.role !== "supervisor") {
    return <Text style={{ padding: 24 }}>Access denied.</Text>;
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#F5F5F7" }}>
      <View style={{ paddingTop: 18, paddingHorizontal: 24, paddingBottom: 12 }}>
        <Text style={{ fontSize: 24, fontWeight: "bold" }}>History</Text>
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
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 120 }}
      >
        {orders.filter((o) => String(o.status).trim() === "delivered").length ? (
          orders
            .filter((o) => String(o.status).trim() === "delivered")
            .map((o) => (
              <TouchableOpacity
                key={`${o.id}-${o.updatedAt}`}
                onPress={() => {
                  router.push({
                    pathname: "/reorder",
                    params: {
                      sourceOrderId: o.id,
                      sourceCreatedAt: o.createdAt,
                      baseItemsJson: JSON.stringify(o.items || []),
                    },
                  });
                }}
                style={{
                  marginTop: 12,
                  backgroundColor: "#fff",
                  padding: 14,
                  borderRadius: 14,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Text style={{ fontWeight: "800" }}>{o.id}</Text>

                  <View
                    style={{
                      backgroundColor: o.kind === "physical" ? "#E8F4FF" : "#EFEFEF",
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 8,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "800",
                        color: o.kind === "physical" ? "#007AFF" : "#555",
                      }}
                    >
                      {o.kind === "physical" ? "PHYSICAL PICKUP" : "ONLINE"}
                    </Text>
                  </View>
                </View>

                <Text style={{ color: "#6e6e73", marginTop: 2 }}>
                  {new Date(o.createdAt).toLocaleString()}
                </Text>

                {o.assignedToName ? (
                  <Text style={{ marginTop: 4, color: "#6e6e73" }}>
                    Delivered by {o.assignedToName}
                  </Text>
                ) : null}

                {o.pickedByName ? (
                  <Text style={{ marginTop: 4, color: "#6e6e73" }}>
                    Picked by {o.pickedByName}
                  </Text>
                ) : null}

                <Text style={{ marginTop: 6, color: "#007AFF", fontWeight: "700" }}>
                  Tap to reorder →
                </Text>
              </TouchableOpacity>
            ))
        ) : (
          <Text style={{ marginTop: 12, color: "#6e6e73" }}>No delivered orders yet.</Text>
        )}
      </ScrollView>
    </View>
  );
}