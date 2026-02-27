import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useTools } from "../lib/toolStore";
import { useUser } from "../lib/userStore";

export default function ToolCageScreen() {
  const router = useRouter();
  const { user, isHydrated } = useUser();
  const { tools, reputation } = useTools();
  const [query, setQuery] = useState("");

  if (!isHydrated) {
    return <Text style={{ padding: 24 }}>Loading...</Text>;
  }

  if (!user) {
    return <Text style={{ padding: 24 }}>Redirecting...</Text>;
  }
if (user.role !== "physical_consumer" && user.role !== "supervisor") {
  return <Text style={{ padding: 24 }}>Access denied.</Text>;
}
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tools;
    return tools.filter((t) => {
      return (
        t.name.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
      );
    });
  }, [query, tools]);

  return (
    <View style={{ flex: 1, backgroundColor: "#F5F5F7" }}>
      <View style={{ paddingTop: 18, paddingHorizontal: 24, paddingBottom: 12 }}>
        <Text style={{ fontSize: 24, fontWeight: "bold" }}>Tool Cage</Text>

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
  <Text style={{ fontWeight: "800" }}>Inventory</Text>
</TouchableOpacity>

{user.role === "physical_consumer" || user.role === "supervisor" ? (
  <TouchableOpacity
    onPress={() => router.push("/toolcage")}
    style={{
      backgroundColor: "#fff",
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: "#ddd",
    }}
  >
    <Text style={{ fontWeight: "800" }}>Tool Cage</Text>
  </TouchableOpacity>
) : null}

        <TextInput
          placeholder="Search tools..."
          value={query}
          onChangeText={setQuery}
          style={{
            marginTop: 12,
            borderWidth: 1,
            borderColor: "#ddd",
            borderRadius: 12,
            padding: 12,
            backgroundColor: "#fff",
          }}
        />
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}>
        {filtered.map((t) => (
          <View
            key={t.id}
            style={{
              backgroundColor: "#fff",
              padding: 14,
              borderRadius: 14,
              marginBottom: 12,
            }}
          >
            <Text style={{ fontWeight: "900" }}>{t.name}</Text>
            <Text style={{ marginTop: 2, color: "#6e6e73" }}>
              {t.id} • {t.category}
            </Text>

            <Text style={{ marginTop: 8, fontWeight: "800" }}>
              Status:{" "}
              <Text style={{ fontWeight: "900" }}>
                {t.status === "available"
                  ? "available"
                  : t.status === "checked_out"
                  ? "checked out"
                  : "return pending"}
              </Text>
            </Text>

            {t.status !== "available" ? (
              <View style={{ marginTop: 8 }}>
                {t.currentHolderName ? (
                  <Text style={{ color: "#6e6e73" }}>
                    Checked out by: {t.currentHolderName}
                  </Text>
                ) : null}

                {t.locationOfUse ? (
                  <Text style={{ color: "#6e6e73" }}>Location: {t.locationOfUse}</Text>
                ) : null}

                {t.expectedDuration ? (
                  <Text style={{ color: "#6e6e73" }}>
                    Expected duration: {t.expectedDuration}
                  </Text>
                ) : null}

                {t.currentHolderUserId ? (
                  <Text style={{ marginTop: 6, color: "#6e6e73" }}>
                    Not-clean returns: {reputation[t.currentHolderUserId] || 0}
                  </Text>
                ) : null}

                {t.currentHolderUserId && (reputation[t.currentHolderUserId] || 0) >= 3 ? (
                  <Text style={{ marginTop: 4, color: "#B00020", fontWeight: "800" }}>
                    Flagged (3+ not clean)
                  </Text>
                ) : null}
              </View>
            ) : null}

            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/tool-history",
                  params: { toolId: t.id },
                })
              }
              style={{
                marginTop: 10,
                backgroundColor: "#fff",
                paddingVertical: 10,
                borderRadius: 12,
                alignItems: "center",
                borderWidth: 1,
                borderColor: "#ddd",
              }}
            >
              <Text style={{ fontWeight: "900" }}>History</Text>
            </TouchableOpacity>

            {/* Actions */}
            {t.status === "available" ? (
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: "/tool-checkout",
                    params: { toolId: t.id },
                  })
                }
                style={{
                  marginTop: 12,
                  backgroundColor: "#111",
                  paddingVertical: 10,
                  borderRadius: 12,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "900" }}>Check out</Text>
              </TouchableOpacity>
            ) : null}

            {t.status === "checked_out" ? (
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: "/tool-return",
                    params: { toolId: t.id },
                  })
                }
                style={{
                  marginTop: 12,
                  backgroundColor: "#EEE",
                  paddingVertical: 10,
                  borderRadius: 12,
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: "#ddd",
                }}
              >
                <Text style={{ fontWeight: "900" }}>Return</Text>
              </TouchableOpacity>
            ) : null}

            {t.status === "return_pending" && (user.role === "staff" || user.role === "supervisor") ? (
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: "/tool-return",
                    params: { toolId: t.id, mode: "staff" },
                  })
                }
                style={{
                  marginTop: 12,
                  backgroundColor: "#007AFF",
                  paddingVertical: 10,
                  borderRadius: 12,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "900" }}>
                  Confirm return (staff)
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}