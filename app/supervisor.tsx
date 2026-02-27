import { useRouter } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useOrders } from "../lib/ordersStore";
import { useUser } from "../lib/userStore";

const WELCOME = "/welcome" as any;

export default function SupervisorScreen() {
  const router = useRouter();
  const { user, isHydrated } = useUser();
  const { orders } = useOrders();

  if (!isHydrated) {
    return <Text style={{ padding: 24 }}>Loading...</Text>;
  }

  if (!user) {
    router.replace(WELCOME);
    return <Text style={{ padding: 24 }}>Redirecting...</Text>;
  }

  if (user.role !== "supervisor") {
    return <Text style={{ padding: 24 }}>Access denied.</Text>;
  }

  const counts = {
    pending: orders.filter((o) => String(o.status).trim() === "pending").length,
    processing: orders.filter((o) => String(o.status).trim() === "processing").length,
    awaiting: orders.filter((o) => String(o.status).trim() === "awaiting_confirmation").length,
    delivered: orders.filter((o) => String(o.status).trim() === "delivered").length,
  };

  return (
    <ScrollView style={{ flex: 1, padding: 24, backgroundColor: "#F5F5F7" }}>
      <Text style={{ fontSize: 24, fontWeight: "800" }}>Supervisor</Text>

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

      <View
        style={{
          marginTop: 12,
          backgroundColor: "#fff",
          padding: 14,
          borderRadius: 14,
        }}
      >
        <Text style={{ fontWeight: "800" }}>Snapshot</Text>
        <Text style={{ marginTop: 6 }}>Pending: {counts.pending}</Text>
        <Text>Processing: {counts.processing}</Text>
        <Text>Awaiting confirmation: {counts.awaiting}</Text>
        <Text>Delivered: {counts.delivered}</Text>
      </View>

      <Text style={{ marginTop: 16, fontWeight: "800" }}>All orders</Text>

      {orders.map((o) => (
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
          <Text style={{ marginTop: 4, color: "#007AFF", fontWeight: "700" }}>
            Status: {o.status}
          </Text>

          {o.requesterDepartment ? (
            <Text style={{ marginTop: 4, color: "#6e6e73" }}>
              Department: {o.requesterDepartment}
            </Text>
          ) : null}

          {o.assignedToName ? (
            <Text style={{ marginTop: 4, color: "#6e6e73" }}>
              Staff: {o.assignedToName}
            </Text>
          ) : null}

          {o.pickedByName ? (
            <Text style={{ marginTop: 4, color: "#6e6e73" }}>
              Picked by: {o.pickedByName}
            </Text>
          ) : null}

          <Text style={{ marginTop: 6, color: "#6e6e73" }}>
            Updated: {new Date(o.updatedAt).toLocaleString()}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}